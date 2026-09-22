import { redirect } from "next/navigation";

/**
 * Endereço antigo de um slide do baralho de 50 slides da Aula 2, aposentado em 22/09/2026. A aula é apresentada
 * pelas páginas dos capítulos 4, 5 e 6; cada slide leva à primeira página que ele cobria, e o slide 50, o fecho,
 * leva ao fecho da aula (c6p20). Slide sem página correspondente cai na abertura do capítulo 4.
 */
const PAGINA_DO_SLIDE: Record<string, string> = { "07": "c4p1", "08": "c4p2", "09": "c4p7", "10": "c4p3", "11": "c4p10", "12": "c4p8", "13": "c4p15", "14": "c4p7", "16": "c4p20", "19": "c4p19", "21": "c5p1", "22": "c5p12", "23": "c5p6", "24": "c5p4", "25": "c5p13", "26": "c5p9", "27": "c5p14", "28": "c5p14", "29": "c5p16", "30": "c5p18", "31": "c6p1", "32": "c6p5", "33": "c6p4", "34": "c6p6", "35": "c6p12", "36": "c6p9", "37": "c6p7", "38": "c6p15", "39": "c6p17", "40": "c6p18", "41": "c6p14", "42": "c6p13", "50": "c6p20" };

export default async function SlideAntigo({ params }: { params: Promise<{ n: string }> }) {
  const { n } = await params;
  const pagina = PAGINA_DO_SLIDE[String(n).padStart(2, "0")];
  redirect(pagina ? `/aulas/${pagina}` : "/aulas/capitulo/4");
}
