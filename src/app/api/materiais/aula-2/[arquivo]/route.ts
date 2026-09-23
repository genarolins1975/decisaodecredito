import { NextResponse } from "next/server";

/**
 * Endereço antigo dos dois guias do baralho de 50 slides da Aula 2, aposentados em 22/09/2026 com o baralho.
 * A aula tem agora um guia do aluno e um do professor por capítulo, publicados na página de cada um; o endereço
 * antigo leva ao capítulo 4, onde a aula começa.
 */
export function GET(req: Request) {
  return NextResponse.redirect(new URL("/aulas/capitulo/4", req.url), 308);
}
