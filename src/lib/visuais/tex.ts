/**
 * Números para dentro de uma fórmula TeX (KaTeX): o sinal de menos tipográfico vira o do TeX, a vírgula decimal é
 * protegida (o KaTeX a trataria como pontuação e poria espaço depois dela) e o % é escapado (em TeX, % abre comentário
 * e cortaria a fórmula em silêncio).
 */
export const paraTex = (s: string) => s.replace(/−/g, "-").replace(/,/g, "{,}");
export const pctTex = (s: string) => paraTex(s).replace(/%/g, String.raw`\%`);
