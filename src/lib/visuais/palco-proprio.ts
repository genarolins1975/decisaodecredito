import { ROTEIRO } from "@/lib/capitulo7/roteiro";
import { ROTEIRO as ROTEIRO_C6 } from "@/lib/capitulo6/roteiro";
import { ROTEIRO as ROTEIRO_C12 } from "@/lib/capitulo12/roteiro";

/** Páginas cujo visual nativo desenha o próprio quadro de slide (cabeçalho, número e rodapé): no palco, a moldura da página e o infográfico de abertura ficam de fora. O capítulo 7 inteiro está nesse regime desde a reconstrução de outubro de 2026. */
export const PALCO_PROPRIO = new Set(["c4p1", "c4p2", "c4p3", "c4p4", "c4p5", "c4p6", "c4p8", "c4p10", "c4p11", "c4p12", "c4p14", "c4p15", "c4p16", "c5p4", "c5p5", "c5p6", "c5p12", "c5p13", ...ROTEIRO.map((s) => s.slug), ...ROTEIRO_C6.map((s) => s.slug), ...ROTEIRO_C12.map((s) => s.slug)]);

/** Páginas de abertura cujo desafio é um visual nativo (substitui "episodio" no registro): no palco, ele é a abertura, e o infográfico do capítulo fica só na página do capítulo e no guia. */
export const ABERTURA_NATIVA = new Set(["c5p1"]);
