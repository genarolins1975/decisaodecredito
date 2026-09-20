import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { ApiError, listAccessibleClasses, requireActiveUser } from "@/lib/auth/guard";

/**
 * A Aula 2 em 50 slides: um HTML único, interativo, que roda sem rede e sem servidor.
 * É a forma como a aula é conduzida; as 60 páginas dos capítulos 4, 5 e 6 ficam no apêndice.
 * O arquivo não está em `public/` de propósito: arquivo em `public/` é servido antes de
 * qualquer verificação de sessão, e o `src/proxy.ts` só confere se existe um cookie chamado
 * `sessao`, o que a nota dele mesmo diz não ser controle de acesso. Aqui a sessão é validada
 * no servidor e o leitor precisa de turma acessível, a mesma regra dos materiais da edição.
 */
const ARQUIVO = path.join(process.cwd(), "content", "slides", "aula-2.html");

export async function GET() {
  try {
    const user = await requireActiveUser();
    const turmas = await listAccessibleClasses(user);
    if (turmas.length === 0) throw new ApiError(403, "Aula disponível para quem está matriculado", "forbidden");
    const html = await readFile(ARQUIVO);
    return new NextResponse(new Uint8Array(html), {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Content-Disposition": 'inline; filename="aula-2-slides.html"',
        "Cache-Control": "private, no-store",
      },
    });
  } catch (e) {
    if (e instanceof ApiError) return NextResponse.json({ error: e.message, code: e.code }, { status: e.status });
    return NextResponse.json({ error: "Não foi possível abrir a aula" }, { status: 500 });
  }
}
