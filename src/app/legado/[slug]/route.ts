import { NextResponse, type NextRequest } from "next/server";
import fs from "node:fs";
import path from "node:path";
import { randomBytes } from "node:crypto";
import { getCurrentUser } from "@/lib/auth/session";
import { listAccessibleClasses } from "@/lib/auth/guard";
import { signExpiring } from "@/lib/crypto";
import { db, schema } from "@/lib/db/client";
import { and, eq } from "drizzle-orm";

/**
 * Documento hospedeiro do visual legado. Exige sessão ativa e matrícula em alguma turma
 * cuja edição publique a página. Executa em iframe sandbox: origem opaca, sem cookies.
 * CSP restrita: só o motor (URL assinada de curta validade) e o bootstrap com nonce.
 */
export async function GET(_req: NextRequest, ctx: { params: Promise<{ slug: string }> }) {
  const { slug } = await ctx.params;
  const user = await getCurrentUser();
  if (!user || user.mustChangePassword) return new NextResponse("Não autorizado", { status: 401 });
  const classes = await listAccessibleClasses(user);
  if (!classes.length) return new NextResponse("Sem matrícula", { status: 403 });
  const editionIds = [...new Set(classes.map((c) => c.edition.id))];
  let found = false;
  for (const ed of editionIds) {
    const [p] = await db.select({ id: schema.pages.id }).from(schema.pages)
      .innerJoin(schema.chapters, eq(schema.chapters.id, schema.pages.chapterId)).innerJoin(schema.units, eq(schema.units.id, schema.chapters.unitId))
      .where(and(eq(schema.units.editionId, ed), eq(schema.pages.slug, slug), eq(schema.pages.status, "published"))).limit(1);
    if (p) { found = true; break; }
  }
  if (!found) return new NextResponse("Página não encontrada", { status: 404 });
  if (!/^[a-z0-9]+$/.test(slug)) return new NextResponse("inválido", { status: 400 });

  const nonce = randomBytes(16).toString("base64");
  const sig = signExpiring("legacy-engine", 900);
  const bootstrap = fs.readFileSync(path.join(process.cwd(), "src/app/legado/bootstrap.js"), "utf8");
  const html = `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Visual ${slug}</title><link rel="stylesheet" href="/legado/estilo.css?t=${encodeURIComponent(sig)}">
<style>body{background:transparent;margin:0;padding:6px 4px}#tb,#pg,#pa,#mapa,#notas,.navrod,.eyebrow,.cena>h2,.apoio,.conexao,.aprendizagem{display:none!important}.palco{padding:0!important}.cena{gap:0!important}</style>
</head><body data-slug="${slug}">
<div id="tb"></div><div id="pg"></div><div id="pa"></div><div id="mapa"></div><div id="palco"></div><div id="notas"></div>
<script nonce="${nonce}" src="/legado/engine.js?t=${encodeURIComponent(sig)}"></script>
<script nonce="${nonce}">${bootstrap}</script>
</body></html>`;
  return new NextResponse(html, {
    headers: {
      "content-type": "text/html; charset=utf-8",
      "content-security-policy": `default-src 'none'; script-src 'nonce-${nonce}'; style-src 'self' 'unsafe-inline'; img-src data:; font-src data:; connect-src 'none'; frame-ancestors 'self'; base-uri 'none'; form-action 'none'`,
      "cache-control": "private, no-store",
      "x-frame-options": "SAMEORIGIN",
    },
  });
}
