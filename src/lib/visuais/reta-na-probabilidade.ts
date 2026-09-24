/**
 * Slide 2 do capítulo 4 (c4p2): uma reta ajustada diretamente na probabilidade não garante previsões entre 0 e 1.
 * A reta é a do projeto, mínimos quadrados sobre as 16 propostas usando só utilização (x em proporção de 0 a 1),
 * não os coeficientes da logística. Probabilidades em proporção nas contas e em porcentagem só na exibição.
 * O truncamento preserva a inclinação no interior e zera a inclinação nos trechos truncados.
 *
 * O domínio vai de 0% a 120% de utilização, como no material original (que ia a 115%): acima de 100% o saldo é
 * maior que o limite, caso de encargos lançados sobre um limite já tomado. Assim a reta sai do intervalo pelas
 * duas pontas: abaixo de 0% até 12,76% de utilização e acima de 100% a partir de 102,24%. A reta é simétrica em
 * torno de 57,5% de utilização, onde prevê 50%: 5% e 110% ficam os dois 8,68 pp fora do intervalo.
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

export const DOMINIO: readonly [number, number] = [0, 120]; // utilização em %
/** Utilização acima deste valor: saldo maior que o limite contratado. */
export const LIMITE_CONTRATADO = 100;
export const UTIL_INICIAL = 5;
/** Atalhos do painel: um ponto em cada zona inválida e um no intervalo válido. */
export const ATALHOS = [5, 60, 110] as const;
export const PASSO_COMPARACAO = 10; // pp
export const EIXO_Y: readonly [number, number] = [-0.25, 1.25];
export const TICKS_X = [0, 20, 40, 60, 80, 100, 120] as const;
export const TICKS_Y = [-0.25, 0, 0.25, 0.5, 0.75, 1, 1.25] as const;

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

/** Trecho do domínio em que a previsão está em [0, 1]. */
export function trechoValido(): { de: number; ate: number } {
  const zero = cruzamento(0), um = cruzamento(1);
  return { de: zero ?? DOMINIO[0], ate: um ?? DOMINIO[1] };
}

/** Pontos em que a função truncada muda de inclinação, com as pontas do domínio. */
export function dobrasTruncada(): number[] {
  return [DOMINIO[0], ...[cruzamento(0), cruzamento(1)].filter((u): u is number => u !== null), DOMINIO[1]].sort((a, b) => a - b);
}

export type Leitura = { valida: boolean; lado: "abaixo" | "acima" | null; frase: string };
/** Interpretação dinâmica da previsão no ponto escolhido. */
export function leitura(util: number): Leitura {
  const p = previsao(util);
  if (p < 0) return { valida: false, lado: "abaixo", frase: "Abaixo de 0%: não é probabilidade." };
  if (p > 1) return { valida: false, lado: "acima", frase: "Acima de 100%: não é probabilidade." };
  return { valida: true, lado: null, frase: "Entre 0% e 100%: leitura válida." };
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
export const EQUACAO_UNIDADES = "u em % de utilização; p de 0 a 1, exibida em %";
export const FORMULA_TRUNCADA = "mín(1; máx(0; p))";
/** Número com vírgula decimal e sinal de menos para o KaTeX, que trataria a vírgula como pontuação. */
const paraTex = (s: string) => s.replace("−", "-").replace(/,/g, "{,}");
/** A reta e o truncamento em TeX, para a faixa e a legenda do quadro. */
export const equacaoTex = () => String.raw`p(u) = ${paraTex(fmt(A, 4))} + ${paraTex(fmt(POR_PP, 6))} \times u`;
export const FORMULA_TRUNCADA_TEX = String.raw`\text{mín}\big(1;\ \text{máx}(0;\ p)\big)`;

export const SUBTITULO = "O efeito é constante em pontos percentuais, e a previsão ultrapassa os limites nas duas pontas.";
export const TITULO_GRAF = "O que a reta prevê?";
export const EIXO_X_T = "Utilização do limite (%)";
export const EIXO_Y_T = "Previsão para a PD (%)";
export const ZONA_ACIMA = "Acima de 100%: não é probabilidade";
export const ZONA_ABAIXO = "Abaixo de 0%: não é probabilidade";
export const NOTA_ACIMA_DO_LIMITE = "saldo acima do limite";
export const TITULO_CTL = "Altere a utilização";
export const ROTULO_ATALHOS = "Ir para";
export const ROTULO_TRUNCAR = "Limitar a previsão de 0% a 100%";
export const ROTULO_COMPARAR = `Comparar +${PASSO_COMPARACAO} pp de utilização`;
export const NOTA_TRUNCAR = "O truncamento impõe limites, mas cria trechos planos.";
export const FRASE_RETA = "Na reta, o mesmo incremento dá sempre a mesma diferença em PD.";
export const FRASE_TRUNCADA = "Truncada, a diferença encolhe onde a função fica plana.";

/** Os dois cruzamentos escritos com os números da reta. */
export function fraseLimites(): string {
  const zero = cruzamento(0), um = cruzamento(1);
  if (zero === null || um === null) return "A forma linear não impõe probabilidades entre 0 e 1.";
  return `Abaixo de ${fmt(zero, 1)}% de utilização a previsão é negativa; acima de ${fmt(um, 1)}%, passa de 100%.`;
}
export const CONCLUSOES = [
  { k: "Limites", t: fraseLimites() },
  { k: "Forma do efeito", t: "O efeito constante em pontos percentuais é uma hipótese a validar no contexto." },
];
export const TRANSICAO = "A função logística oferece uma transformação suave que mantém a PD entre 0 e 1.";
export const RODAPE = "A seguir: probabilidade, odds e log odds · reta de mínimos quadrados nas 16 propostas";

export type Validacao = { ok: true; valor: number } | { ok: false; erro: string };
const parse = (t: string) => { const s = t.trim().replace(/\s|%/g, "").replace("−", "-").replace(",", "."); return s === "" ? NaN : Number(s); };

export function validarUtil(texto: string): Validacao {
  const v = parse(texto);
  if (!Number.isFinite(v)) return { ok: false, erro: "Digite a utilização em porcentagem, por exemplo 5." };
  if (v < DOMINIO[0] || v > DOMINIO[1]) return { ok: false, erro: `A utilização vai de ${DOMINIO[0]}% a ${DOMINIO[1]}%.` };
  return { ok: true, valor: Math.round(v) };
}
