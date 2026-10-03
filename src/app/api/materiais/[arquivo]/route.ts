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
/* Documentos comuns do trabalho final (content/trabalho-final/), iguais para as dez bases e sem gabarito. As bases,
   o OOT e os rótulos não passam por aqui: saem do bucket privado depois de "Registrar pacote". */
const TRABALHO: Record<string, [string, string]> = {
  "trabalho-final-README.md": ["README.md", "text/markdown; charset=utf-8"],
  "trabalho-final-definicao-default.md": ["definicao-default.md", "text/markdown; charset=utf-8"],
  "trabalho-final-datas-e-maturacao.md": ["datas-e-maturacao.md", "text/markdown; charset=utf-8"],
  "trabalho-final-TEMPLATE-MANIFESTO-MODELO.md": ["TEMPLATE-MANIFESTO-MODELO.md", "text/markdown; charset=utf-8"],
  "trabalho-final-ROTEIRO-DE-TESTES.md": ["ROTEIRO-DE-TESTES.md", "text/markdown; charset=utf-8"],
  "trabalho-final-guia-dados-e-missoes.xlsx": ["guia-dados-e-missoes.xlsx", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"],
};

export async function GET(_req: Request, ctx: { params: Promise<{ arquivo: string }> }) {
  try {
    const { arquivo } = await ctx.params;
    const trabalho = Object.hasOwn(TRABALHO, arquivo) ? TRABALHO[arquivo] : null;
    if (!NOME.test(arquivo) && !trabalho) throw new ApiError(404, "Material não encontrado", "not_found");
    const user = await requireActiveUser();
    const turmas = await listAccessibleClasses(user);
    if (turmas.length === 0) throw new ApiError(403, "Material disponível para quem está matriculado", "forbidden");
    const origem = trabalho ? path.join(process.cwd(), "content", "trabalho-final", trabalho[0]) : path.join(PASTA, arquivo);
    const pdf = await readFile(origem).catch(() => null);
    if (!pdf) throw new ApiError(404, "Material não encontrado", "not_found");
    return new NextResponse(new Uint8Array(pdf), {
      headers: {
        "Content-Type": trabalho ? trabalho[1] : "application/pdf",
        "Content-Disposition": `${trabalho && !arquivo.endsWith(".md") ? "attachment" : "inline"}; filename="${trabalho ? trabalho[0] : arquivo}"`,
        "Cache-Control": "private, max-age=3600, must-revalidate",
        Vary: "Cookie",
      },
    });
  } catch (e) {
    if (e instanceof ApiError) return NextResponse.json({ error: e.message, code: e.code }, { status: e.status });
    return NextResponse.json({ error: "Não foi possível abrir o material" }, { status: 500 });
  }
}
