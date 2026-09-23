/** Páginas cujo visual nativo desenha o próprio quadro de slide (cabeçalho, número e rodapé): no palco, a moldura da página e o infográfico de abertura ficam de fora. */
export const PALCO_PROPRIO = new Set(["c4p1", "c4p2", "c4p5", "c4p8", "c4p10", "c4p11", "c4p12", "c4p14", "c4p15", "c4p16"]);

/** Páginas de abertura cujo desafio é um visual nativo (substitui "episodio" no registro): no palco, ele é a abertura, e o infográfico do capítulo fica só na página do capítulo e no guia. */
export const ABERTURA_NATIVA = new Set(["c5p1", "c6p1"]);
