import { redirect } from "next/navigation";

/**
 * Endereço antigo da janela de projeção do baralho de 50 slides da Aula 2, aposentado em 22/09/2026. A Aula 2 é
 * apresentada pelas páginas dos capítulos 4, 5 e 6, como as outras aulas; quem chega aqui volta ao painel da sessão.
 */
export default async function ProjetarSlidesAposentado({ searchParams }: { searchParams: Promise<{ sessao?: string }> }) {
  const { sessao } = await searchParams;
  redirect(sessao ? `/professor/aovivo/${encodeURIComponent(sessao)}` : "/aulas/capitulo/4");
}
