/**
 * Slide 2 do capítulo 4 (c4p2): uma reta ajustada diretamente na probabilidade não garante previsões entre 0 e 1.
 * A reta é a do projeto, mínimos quadrados sobre as 16 propostas usando só utilização (x em proporção de 0 a 1),
 * não os coeficientes da logística. Probabilidades em proporção nas contas e em porcentagem só na exibição.
 * O truncamento preserva a inclinação no interior e zera a inclinação nos trechos truncados.
 */
import base from "./did.json";
import { retaMinimosQuadrados } from "./logistica";
import { arredondar, fmt, fmtPct, fmtPp } from "./logit-slides";

export { arredondar, fmt, fmtPct, fmtPp };

const r = retaMinimosQuadrados(base.base);
/** Reta da aula: p(x) = A + B x, com x = utilização em proporção de 0 a 1. */
export const A = r.a;
export const B = r.b * 100;
/** Inclinação por ponto percentual de utilização, em proporção de probabilidade. */
export const POR_PP = B / 100;

export const DOMINIO: readonly [number, number] = [0, 100]; // utilização em %
export const UTIL_INICIAL = 5;
export const PASSO_COMPARACAO = 10; // pp
export const EIXO_Y: readonly [number, number] = [-0.2, 1.1];
export const TICKS_X = [0, 25, 50, 75, 100] as const;
export const TICKS_Y = [-0.2, 0, 0.25, 0.5, 0.75, 1] as const;

/** Previsão linear em proporção; pode sair de [0, 1] por construção. */
export const previsao = (util: number) => A + B * (util / 100);
/** Truncamento: p limitada a [0, 1]. */
export const truncar = (p: number) => Math.min(1, Math.max(0, p));
export const previsaoTruncada = (util: number) => truncar(previsao(util));

/** Utilização em que a reta cruza um valor de probabilidade, se o cruzamento existe no domínio. */
export function cruzamento(valor: number): number | null {
  if (B === 0) return null;
  const u = ((valor - A) / B) * 100;
  return u >= DOMINIO[0] && u <= DOMINIO[1] ? u : null;
}

/** Trechos do domínio em que a previsão fica fora de [0, 1]: só os que existem. */
export function forasDoIntervalo() {
  const fora: { de: number; ate: number; lado: "abaixo" | "acima" }[] = [];
  const zero = cruzamento(0), um = cruzamento(1);
  if (previsao(DOMINIO[0]) < 0) fora.push({ de: DOMINIO[0], ate: zero ?? DOMINIO[1], lado: "abaixo" });
  if (previsao(DOMINIO[1]) > 1) fora.push({ de: um ?? DOMINIO[0], ate: DOMINIO[1], lado: "acima" });
  return fora;
}

export type Leitura = { valida: boolean; frase: string };
/** Interpretação dinâmica da previsão no ponto escolhido. */
export function leitura(util: number): Leitura {
  const p = previsao(util);
  if (p < 0) return { valida: false, frase: "Este valor não pode ser interpretado como probabilidade." };
  if (p > 1) return { valida: false, frase: "Este valor ultrapassa o limite de uma probabilidade." };
  return { valida: true, frase: "Neste ponto, a previsão está entre 0% e 100%." };
}

/** Comparação de +10 pp, na reta e na função truncada; só dentro do domínio. */
export function comparacao(util: number, passo = PASSO_COMPARACAO) {
  const fim = util + passo;
  if (fim > DOMINIO[1]) return { possivel: false as const, motivo: `Com utilização acima de ${fmt(DOMINIO[1] - passo, 0)}%, o acréscimo de ${fmt(passo, 0)} pp sai do domínio do exemplo.` };
  const p0 = previsao(util), p1 = previsao(fim);
  const t0 = truncar(p0), t1 = truncar(p1);
  return {
    possivel: true as const, util, fim, p0, p1, t0, t1,
    deltaLinear: (p1 - p0) * 100, deltaTruncada: (t1 - t0) * 100,
    iguais: Math.abs((p1 - p0) - (t1 - t0)) < 1e-12,
  };
}

/** A equação escrita com os valores do projeto, em porcentagem de utilização. */
export const equacao = () => `p(u) = ${fmt(A, 4)} + ${fmt(POR_PP, 6)} × u`;
export const EQUACAO_UNIDADES = "u em % de utilização; p em proporção de 0 a 1, exibida em %";
export const FORMULA_TRUNCADA = "p truncada = mín(1; máx(0; p))";

export const TITULO_GRAF = "O que a reta prevê?";
export const EIXO_X_T = "Utilização do limite (%)";
export const EIXO_Y_T = "Previsão para a PD (%)";
export const TITULO_CTL = "Altere a utilização";
export const ROTULO_TRUNCAR = "Limitar a previsão de 0% a 100%";
export const ROTULO_COMPARAR = `Comparar +${PASSO_COMPARACAO} pp de utilização`;
export const NOTA_TRUNCAR = "O truncamento impõe limites, mas cria trechos planos.";
export const FRASE_RETA = "Na reta, o mesmo incremento na utilização produz a mesma diferença prevista em PD.";
export const FRASE_TRUNCADA = "Truncada, a diferença depende de os pontos estarem no trecho linear ou no plano.";
export const CONCLUSOES = [
  { k: "Limites", t: "A forma linear não impõe probabilidades entre 0 e 1." },
  { k: "Forma do efeito", t: "O efeito constante em pontos percentuais é uma hipótese que precisa ser adequada ao contexto." },
];
export const TRANSICAO = "A função logística oferece uma transformação suave que mantém a PD entre 0 e 1.";
export const RODAPE = "A seguir: probabilidade, odds e log odds · reta por mínimos quadrados sobre as 16 propostas, só com utilização";

export type Validacao = { ok: true; valor: number } | { ok: false; erro: string };
const parse = (t: string) => { const s = t.trim().replace(/\s|%/g, "").replace("−", "-").replace(",", "."); return s === "" ? NaN : Number(s); };

export function validarUtil(texto: string): Validacao {
  const v = parse(texto);
  if (!Number.isFinite(v)) return { ok: false, erro: "Digite a utilização em porcentagem, por exemplo 5." };
  if (v < DOMINIO[0] || v > DOMINIO[1]) return { ok: false, erro: `A utilização vai de ${DOMINIO[0]}% a ${DOMINIO[1]}%.` };
  return { ok: true, valor: Math.round(v) };
}
