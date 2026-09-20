import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { ApiError, listAccessibleClasses, requireActiveUser } from "@/lib/auth/guard";

/**
 * Apêndice do curso: a aula panorâmica em 50 slides, um HTML único que roda sem rede.
 * O arquivo fica fora de `public/` de propósito. Arquivo em `public/` é servido antes de
 * qualquer verificação de sessão, e o cookie sozinho não é controle de acesso (ver `src/proxy.ts`).
 * Aqui a sessão é validada no servidor e o leitor precisa de turma acessível, a mesma regra
 * dos materiais da edição em `/api/arquivos/[id]`.
 */
const ARQUIVO = path.join(process.cwd(), "content", "apendice", "aula-panoramica.html");

export async function GET() {
  try {
    const user = await requireActiveUser();
    const turmas = await listAccessibleClasses(user);
    if (turmas.length === 0) throw new ApiError(403, "Apêndice disponível para quem está matriculado", "forbidden");
    const html = await readFile(ARQUIVO);
    return new NextResponse(new Uint8Array(html), {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Content-Disposition": 'inline; filename="aula-panoramica.html"',
        "Cache-Control": "private, no-store",
      },
    });
  } catch (e) {
    if (e instanceof ApiError) return NextResponse.json({ error: e.message, code: e.code }, { status: e.status });
    return NextResponse.json({ error: "Não foi possível abrir o apêndice" }, { status: 500 });
  }
}
