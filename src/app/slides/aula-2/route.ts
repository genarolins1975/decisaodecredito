import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { ApiError, listAccessibleClasses, requireActiveUser } from "@/lib/auth/guard";

/**
 * A Aula 2 em 50 slides: um HTML único, interativo, que roda sem rede e sem servidor.
 * É a forma como a aula é conduzida; as 60 páginas dos capítulos 4, 5 e 6 ficam no apêndice.
 *
 * Dois arquivos, escolhidos pelo papel de quem pede: professor e monitor recebem a versão completa,
 * com as notas de condução, respostas e transições; o aluno recebe a variante compilada sem essas
 * notas (build.mjs as remove pela árvore sintática e confere frase a frase). O que o aluno recebe
 * ele pode ler no fonte, então o arquivo dele não contém nada reservado: os exercícios do baralho
 * revelam a própria resposta ao conferir, por desenho didático, e nada ali é nota nem avaliação.
 *
 * O arquivo não está em `public/` de propósito: arquivo em `public/` é servido antes de qualquer
 * verificação de sessão, e o `src/proxy.ts` só confere se existe um cookie chamado `sessao`, o que
 * a nota dele mesmo diz não ser controle de acesso. Aqui a sessão é validada no servidor e o leitor
 * precisa de turma acessível, a mesma regra dos materiais da edição.
 */
const PASTA = path.join(process.cwd(), "content", "slides");
const COMPLETO = path.join(PASTA, "aula-2.html");
const ALUNO = path.join(PASTA, "aula-2-aluno.html");

export async function GET() {
  try {
    const user = await requireActiveUser();
    const turmas = await listAccessibleClasses(user);
    if (turmas.length === 0) throw new ApiError(403, "Aula disponível para quem está matriculado", "forbidden");
    const staff = user.isStaff || turmas.some((t) => t.role === "professor" || t.role === "monitor");
    const html = await readFile(staff ? COMPLETO : ALUNO);
    return new NextResponse(new Uint8Array(html), {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Content-Disposition": 'inline; filename="aula-2-slides.html"',
        // numa turma inteira o arquivo é baixado por cada aluno, e ele só muda a cada deploy:
        // cache privado de uma hora poupa a rede da sala sem servir versão velha por muito tempo.
        // O conteúdo depende do papel, logo do cookie: nenhum cache compartilhado pode reutilizá-lo.
        "Cache-Control": "private, max-age=3600, must-revalidate",
        Vary: "Cookie",
      },
    });
  } catch (e) {
    if (e instanceof ApiError) return NextResponse.json({ error: e.message, code: e.code }, { status: e.status });
    return NextResponse.json({ error: "Não foi possível abrir a aula" }, { status: 500 });
  }
}
