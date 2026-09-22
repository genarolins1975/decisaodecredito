import { NextResponse } from "next/server";

/**
 * Endereço antigo do baralho de 50 slides da Aula 2, aposentado em 22/09/2026. A Aula 2 é apresentada pelas páginas
 * dos capítulos 4, 5 e 6, como as outras aulas; quem chega por um link salvo vai para a abertura do capítulo 4.
 */
export function GET(req: Request) {
  return NextResponse.redirect(new URL("/aulas/capitulo/4", req.url), 308);
}
