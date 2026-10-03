import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { ApiError, listAccessibleClasses, requireActiveUser } from "@/lib/auth/guard";

/**
 * Os guias do aluno por capítulo, em PDF, gerados por `scripts/apostila/gerar.mjs` e copiados para `content/materiais/`
 * (capitulo-04-aluno.pdf...), para qualquer matriculado. O guia do professor não passa por aqui: ele traz gabaritos, e o
 * repositório é público. Sai pelo canal privado dos materiais do professor (bucket e "Registrar pacote", status "professor").
 */
const PASTA = path.join(process.cwd(), "content", "materiais");
const NOME = /^capitulo-\d{2}-aluno\.pdf$/;

export async function GET(_req: Request, ctx: { params: Promise<{ arquivo: string }> }) {
  try {
    const { arquivo } = await ctx.params;
    if (!NOME.test(arquivo)) throw new ApiError(404, "Material não encontrado", "not_found");
    const user = await requireActiveUser();
    const turmas = await listAccessibleClasses(user);
    if (turmas.length === 0) throw new ApiError(403, "Material disponível para quem está matriculado", "forbidden");
    const pdf = await readFile(path.join(PASTA, arquivo)).catch(() => null);
    if (!pdf) throw new ApiError(404, "Material não encontrado", "not_found");
    return new NextResponse(new Uint8Array(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${arquivo}"`,
        "Cache-Control": "private, max-age=3600, must-revalidate",
        Vary: "Cookie",
      },
    });
  } catch (e) {
    if (e instanceof ApiError) return NextResponse.json({ error: e.message, code: e.code }, { status: e.status });
    return NextResponse.json({ error: "Não foi possível abrir o material" }, { status: 500 });
  }
}
