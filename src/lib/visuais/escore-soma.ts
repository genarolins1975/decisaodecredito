/**
 * Slide 8 do capítulo 4 (c4p8): do dado à contribuição, da soma à probabilidade. As contas vêm de logit-slides.ts
 * (mesmos coeficientes, precisão integral); aqui ficam as linhas da tabela, as três representações do resultado e
 * os textos que dependem do estado. Nada é somado já arredondado: o arredondamento é só de exibição.
 */
import { BETA0, BETA1, BETA2, EXEMPLO, LIMITES, arredondar, fmt, fmtPct, proposta, sigmoide } from "./logit-slides";

export { BETA0, BETA1, BETA2, EXEMPLO, LIMITES, arredondar, fmt, fmtPct, proposta, sigmoide };

export const PROPOSTA = 11; // proposta #11 da base didática de 16 propostas
export type Linha = { id: "intercepto" | "utilizacao" | "atraso"; parcela: string; unidade: string | null; coeficiente: number; escala: string; contribuicao: number; cor: "cinza" | "ambar" | "roxo" };

/** Valor na escala do coeficiente: o intercepto entra com 1; as variáveis entram divididas por 10. */
export const naEscala = (v: number) => `${fmt(v, 0)} ÷ 10 = ${fmt(v / 10, v % 10 === 0 ? 0 : 1)}`;

/** As três linhas da decomposição, com o coeficiente, o valor na escala e a contribuição em log odds. */
export function linhas(util: number, atraso: number): Linha[] {
  const p = proposta(util, atraso);
  return [
    { id: "intercepto", parcela: "Intercepto", unidade: null, coeficiente: BETA0, escala: "1", contribuicao: BETA0, cor: "cinza" },
    { id: "utilizacao", parcela: "Utilização", unidade: "10 pp", coeficiente: BETA1, escala: naEscala(util), contribuicao: p.c1, cor: "ambar" },
    { id: "atraso", parcela: "Atraso", unidade: "10 dias", coeficiente: BETA2, escala: naEscala(atraso), contribuicao: p.c2, cor: "roxo" },
  ];
}

/** O mesmo resultado em três escalas: escore em log odds, odds = exp(z) e PD = odds ÷ (1 + odds). */
export function representacoes(util: number, atraso: number) {
  const { z, pd } = proposta(util, atraso);
  const odds = Math.exp(z);
  return { z, odds, pd, conferePd: Math.abs(odds / (1 + odds) - pd) < 1e-12 };
}

/** Soma conferida: a soma das contribuições é o escore, com precisão integral. */
export const soma = (ls: Linha[]) => ls.reduce((s, l) => s + l.contribuicao, 0);

/** Alcance do escore com os controles nos extremos; serve para provar que nada sai da faixa desenhada. */
export function alcanceZ() {
  return {
    min: BETA0 + BETA1 * (LIMITES.util[0] / 10) + BETA2 * (LIMITES.atraso[0] / 10),
    max: BETA0 + BETA1 * (LIMITES.util[1] / 10) + BETA2 * (LIMITES.atraso[1] / 10),
  };
}

export const SINTESE = [
  { k: "O que podemos conferir", t: "Cada contribuição e sua soma são explícitas. A decomposição explica a previsão do modelo; não demonstra causalidade." },
  { k: "Sem interação", t: "+10 pp de utilização acrescentam 0,7453 a z, qualquer que seja o atraso. Na PD, o impacto depende do ponto de partida." },
] as const;
export const NOTA_CONTA = "Cálculos com precisão integral; exibição arredondada.";
export const RODAPE = "PD = probabilidade de default · pp = pontos percentuais · Exemplo didático";
