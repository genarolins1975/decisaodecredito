/**
 * Slide 14 do capítulo 4 (c4p14): trocar a unidade da variável muda o coeficiente e não muda a previsão. As três
 * representações são reexpressões do mesmo modelo, sem reestimação: β × x é preservado, e por isso o escore e a PD
 * coincidem. O intercepto não muda porque a troca de unidade não desloca a origem da variável; centralizar, que
 * desloca, exigiria ajustar o intercepto. Precisão integral; arredondamento só na exibição.
 */
import { BETA0, BETA1, BETA2, arredondar, fmt, fmtPct, sigmoide } from "./logit-slides";

export { BETA0, BETA1, BETA2, arredondar, fmt, fmtPct, sigmoide };

export const ATRASO_FIXO = 5; // dias, fixo neste slide
export const UTIL_INICIAL = 70; // %
export const LIMITES_UTIL: readonly [number, number] = [0, 100];
export const ATALHOS = [30, 70, 95] as const;
export const DELTA_COMPARACAO = 10; // pp, o incremento comparado no detalhe da razão de odds

export type Unidade = {
  id: "dez" | "um" | "fracao";
  rotulo: string; equivale: string; definicao: string;
  fator: number; // divisor aplicado à utilização em %
  casasBeta: number; casasX: number; fixarX: boolean;
};

/** As três unidades: o fator divide a utilização em % e multiplica o coeficiente na mesma proporção. */
export const UNIDADES: Unidade[] = [
  { id: "dez", rotulo: "Por 10 pp", equivale: "1 unidade = 10 pp", definicao: "x = utilização em % ÷ 10", fator: 10, casasBeta: 4, casasX: 1, fixarX: false },
  { id: "um", rotulo: "Por 1 pp", equivale: "1 unidade = 1 pp", definicao: "x = utilização em %", fator: 1, casasBeta: 5, casasX: 0, fixarX: true },
  { id: "fracao", rotulo: "Como fração de 0 a 1", equivale: "1 unidade = 100 pp", definicao: "x = utilização em % ÷ 100", fator: 100, casasBeta: 3, casasX: 2, fixarX: true },
];

/** Coeficiente na unidade: β por 10 pp × (fator ÷ 10). */
export const betaDe = (u: Unidade) => BETA1 * (u.fator / 10);
export const xDe = (u: Unidade, util: number) => util / u.fator;
export const contribuicaoDe = (u: Unidade, util: number) => betaDe(u) * xDe(u, util);

export type Linha = { unidade: Unidade; x: number; beta: number; contribuicao: number };
export function linhas(util: number): Linha[] {
  return UNIDADES.map((u) => ({ unidade: u, x: xDe(u, util), beta: betaDe(u), contribuicao: contribuicaoDe(u, util) }));
}

/** O modelo com a contribuição da utilização calculada na unidade escolhida: o resultado não depende dela. */
export function resultado(util: number, u: Unidade = UNIDADES[0]) {
  const cUtil = contribuicaoDe(u, util);
  const cAtraso = BETA2 * (ATRASO_FIXO / 10);
  const z = BETA0 + cUtil + cAtraso;
  return { cUtil, cAtraso, intercepto: BETA0, z, pd: sigmoide(z) };
}

/** As três contribuições coincidem a menos do ruído binário; a igualdade é algébrica. */
export function coincidem(util: number, tol = 1e-9) {
  const vs = linhas(util).map((l) => l.contribuicao);
  return Math.max(...vs) - Math.min(...vs) <= tol;
}

/** Detalhe da razão de odds: a mesma mudança real de +10 pp, escrita em cada unidade. */
export function comparacaoOdds(delta = DELTA_COMPARACAO) {
  const itens = UNIDADES.map((u) => ({ unidade: u, dx: delta / u.fator, efeito: betaDe(u) * (delta / u.fator) }));
  const efeito = itens[0].efeito;
  return { itens, efeito, or: Math.exp(efeito), iguais: itens.every((i) => Math.abs(i.efeito - efeito) < 1e-9) };
}

export type Validacao = { ok: true; valor: number } | { ok: false; erro: string };
const parse = (t: string) => { const s = t.trim().replace(/\s|%/g, "").replace("−", "-").replace(",", "."); return s === "" ? NaN : Number(s); };

export function validarUtil(texto: string): Validacao {
  const v = parse(texto);
  if (!Number.isFinite(v)) return { ok: false, erro: "Digite a utilização em porcentagem, por exemplo 70." };
  if (v < LIMITES_UTIL[0] || v > LIMITES_UTIL[1]) return { ok: false, erro: `A utilização vai de ${LIMITES_UTIL[0]}% a ${LIMITES_UTIL[1]}%.` };
  return { ok: true, valor: Math.round(v) };
}

/** Número enxuto: até N casas, sem zeros à direita, ou N casas fixas quando a coluna pede alinhamento. */
export const fmtNum = (v: number, casas: number, fixar = false) =>
  fixar ? fmt(v, casas) : arredondar(v, casas).toLocaleString("pt-BR", { maximumFractionDigits: casas }).replace("-", "−");

export const NOTA_PROPOSTA = "Mesma proposta em todas as linhas";
export const ROTULO_CONTRIB = "Mesma contribuição ao escore";
export const FRASE_RESULTADO = "As três representações produzem o mesmo escore e a mesma PD.";
export const NOTA_PARCELAS = "Parcelas exibidas arredondadas; a soma usa precisão integral.";
export const PERGUNTA_OR = "E a razão de odds?";
export const NOTA_OR = "Compare a mesma mudança real: +10 pp de utilização.";
export const NOTA_OR_2 = "A comparação é entre incrementos, não uma alteração da proposta.";
export const CONCLUSAO_K = "Coeficiente maior não significa variável mais importante";
export const CONCLUSAO_T = "Seu tamanho depende da unidade. Para comparar variáveis, defina mudanças comparáveis e explicite o critério.";
export const RODAPE = "pp = pontos percentuais · reexpressão do mesmo modelo, sem reestimação";
