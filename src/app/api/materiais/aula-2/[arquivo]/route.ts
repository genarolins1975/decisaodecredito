import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { ApiError, listAccessibleClasses, requireActiveUser } from "@/lib/auth/guard";

/**
 * Os guias da Aula 2 em PDF, gerados por `aula_credito_html/material.mjs` em `content/materiais/`.
 * O guia do aluno vale para qualquer matriculado; o do professor traz gabaritos e notas reservadas
 * e só sai para professor e monitor. Mesma regra de sessão e turma da rota da aula em slides.
 */
const PASTA = path.join(process.cwd(), "content", "materiais");
const ARQUIVOS: Record<string, { nome: string; soStaff: boolean }> = {
  "guia-do-aluno.pdf": { nome: "aula-2-guia-do-aluno.pdf", soStaff: false },
  "guia-do-professor.pdf": { nome: "aula-2-guia-do-professor.pdf", soStaff: true },
};

export async function GET(_req: Request, ctx: { params: Promise<{ arquivo: string }> }) {
  try {
    const { arquivo } = await ctx.params;
    const meta = ARQUIVOS[arquivo];
    if (!meta) throw new ApiError(404, "Material não encontrado", "not_found");
    const user = await requireActiveUser();
    const turmas = await listAccessibleClasses(user);
    if (turmas.length === 0) throw new ApiError(403, "Material disponível para quem está matriculado", "forbidden");
    const staff = user.isStaff || turmas.some((t) => t.role === "professor" || t.role === "monitor");
    if (meta.soStaff && !staff) throw new ApiError(403, "Este guia é reservado ao professor", "forbidden");
    const pdf = await readFile(path.join(PASTA, meta.nome));
    return new NextResponse(new Uint8Array(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${meta.nome}"`,
        "Cache-Control": "private, max-age=3600, must-revalidate",
        Vary: "Cookie",
      },
    });
  } catch (e) {
    if (e instanceof ApiError) return NextResponse.json({ error: e.message, code: e.code }, { status: e.status });
    return NextResponse.json({ error: "Não foi possível abrir o material" }, { status: 500 });
  }
}
