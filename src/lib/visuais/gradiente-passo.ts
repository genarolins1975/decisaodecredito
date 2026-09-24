/**
 * Slide 16 do capítulo 4 (c4p16): uma iteração da descida de gradiente, do gradiente aos novos coeficientes.
 * Cada componente do gradiente é a média de (p − y) multiplicada pela variável correspondente; a atualização é
 * −ηg e os três parâmetros andam juntos, a partir do mesmo estado. Perda calculada a partir do logit, na forma
 * estável; precisão integral e arredondamento só na exibição.
 */
import base from "./did.json";
import { arredondar, fmt, fmtPct, fmtTex, paraTex, sigmoide } from "./logit-slides";

export { arredondar, fmt, fmtPct, fmtTex, paraTex, sigmoide };

export type Proposta = { id: number; util: number; atraso: number; y: number };
export const PROPOSTAS: Proposta[] = base.base;
export const ETA = 0.1;
export const BETA_ZERO: readonly [number, number, number] = [0, 0, 0];

export const escore = (b: readonly number[], p: Proposta) => b[0] + b[1] * (p.util / 10) + b[2] * (p.atraso / 10);
export const perdaDoLogit = (z: number, y: number) => Math.max(z, 0) - y * z + Math.log1p(Math.exp(-Math.abs(z)));

export type Estado = {
  beta: readonly [number, number, number];
  pd: number[]; residuos: number[]; contribG1: number[];
  perda: number; g: [number, number, number]; mesmaPd: number | null; pdMedia: number;
};

/** Estado do modelo em um trio de coeficientes: PDs, resíduos, perda média e as três componentes do gradiente. */
export function estado(beta: readonly [number, number, number]): Estado {
  const n = PROPOSTAS.length;
  const pd: number[] = [], residuos: number[] = [], contribG1: number[] = [];
  let g0 = 0, g1 = 0, g2 = 0, perda = 0;
  for (const p of PROPOSTAS) {
    const z = escore(beta, p), prob = sigmoide(z), e = prob - p.y;
    pd.push(prob); residuos.push(e); contribG1.push(e * (p.util / 10));
    g0 += e; g1 += e * (p.util / 10); g2 += e * (p.atraso / 10);
    perda += perdaDoLogit(z, p.y);
  }
  const iguais = pd.every((v) => Math.abs(v - pd[0]) < 1e-12);
  return { beta, pd, residuos, contribG1, perda: perda / n, g: [g0 / n, g1 / n, g2 / n], mesmaPd: iguais ? pd[0] : null, pdMedia: pd.reduce((a, b) => a + b, 0) / n };
}

export type LinhaPasso = { id: "b0" | "b1" | "b2"; rotulo: string; atual: number; g: number; atualizacao: number; seguinte: number };

/** A iteração: atualização −ηg e o valor seguinte de cada parâmetro, todos a partir do mesmo gradiente. */
export function passo(e: Estado, eta = ETA): LinhaPasso[] {
  const nomes = [
    { id: "b0" as const, rotulo: "β₀ · Intercepto" },
    { id: "b1" as const, rotulo: "β₁ · Utilização" },
    { id: "b2" as const, rotulo: "β₂ · Atraso" },
  ];
  return nomes.map((n, i) => {
    const atualizacao = -eta * e.g[i];
    return { ...n, atual: e.beta[i], g: e.g[i], atualizacao, seguinte: e.beta[i] + atualizacao };
  });
}

/** Aplica a iteração: os três parâmetros mudam juntos. */
export function aplicar(e: Estado, eta = ETA): [number, number, number] {
  const ls = passo(e, eta);
  return [ls[0].seguinte, ls[1].seguinte, ls[2].seguinte];
}

/** Média das contribuições de g₁, que é o próprio g₁: serve à leitura do gráfico. */
export const mediaContrib = (e: Estado) => e.contribG1.reduce((s, v) => s + v, 0) / e.contribG1.length;

/** Cinco casas com arredondamento simétrico: a magnitude é arredondada meio para cima e o sinal volta depois,
 *  de modo que −0,234375 aparece como −0,23438 e não como −0,23437. */
export const fmt5 = (v: number, sinal = false) => {
  const r = Math.sign(v) * arredondar(Math.abs(v), 5);
  const s = Math.abs(r).toLocaleString("pt-BR", { minimumFractionDigits: 5, maximumFractionDigits: 5 });
  return `${r < 0 ? "−" : sinal && r > 0 ? "+" : ""}${s}`;
};
/** Zero exibido sem sinal, mesmo quando o valor é negativo por ruído. */
export const fmtAtualizacao = (v: number) => (Math.abs(arredondar(Math.abs(v), 5)) < 1e-12 ? fmt5(0) : fmt5(v, true));
export const fmt5Tex = (v: number, sinal = false) => paraTex(fmt5(v, sinal));

/** Os coeficientes atuais, em texto (rótulo acessível) e em TeX: β₀ = β₁ = β₂ = 0 no começo; depois, o vetor β = (β₀; β₁; β₂), na ordem da tabela. */
export const coeficientesTexto = (b: readonly number[]) =>
  b.every((v) => v === 0) ? "β₀ = β₁ = β₂ = 0" : `β = (${fmt5(b[0])}; ${fmt5(b[1])}; ${fmt5(b[2])})`;
export const coeficientesTex = (b: readonly number[]) =>
  b.every((v) => v === 0) ? String.raw`\beta_0 = \beta_1 = \beta_2 = 0` : String.raw`\beta = (${fmt5Tex(b[0])};\ ${fmt5Tex(b[1])};\ ${fmt5Tex(b[2])})`;

/** Painel de exemplo do coeficiente da utilização, acompanhando o estado atual e os sinais. */
export function exemploUtilizacao(e: Estado, iteracao: number, eta = ETA) {
  const g = e.g[1], upd = -eta * g;
  const zero = Math.abs(arredondar(Math.abs(g), 5)) < 1e-12;
  return {
    g, upd,
    gTexto: `g₁ = ${fmt5(g)}`, gTex: String.raw`g_1 = ${fmt5Tex(g)}`,
    conta: `−${fmt(eta, 2)} × (${fmt5(g)}) ≈ ${fmtAtualizacao(upd)}`,
    contaTex: String.raw`-${fmtTex(eta, 2)} \times (${fmt5Tex(g)}) \approx ${paraTex(fmtAtualizacao(upd))}`,
    regra: zero ? "Gradiente nulo: o coeficiente não se move." : g < 0 ? "Gradiente negativo dá atualização positiva." : "Gradiente positivo dá atualização negativa.",
    efeito: zero ? "O coeficiente fica onde está." : `O coeficiente ${g < 0 ? "sobe" : "desce"} ${iteracao === 0 ? "nesta primeira atualização" : "nesta atualização"}.`,
  };
}

/** As três componentes do gradiente, em texto (rótulo acessível) e em TeX; a legenda dos símbolos tem trechos em TeX entre cifrões (ComTex). */
export const FORMULAS = [
  { id: "g0", t: "g₀ = média(p − y)", tex: String.raw`g_0 = \text{média}(p - y)` },
  { id: "g1", t: "g₁ = média[(p − y) × (u/10)]", tex: String.raw`g_1 = \text{média}\big[(p - y) \times (u/10)\big]` },
  { id: "g2", t: "g₂ = média[(p − y) × (a/10)]", tex: String.raw`g_2 = \text{média}\big[(p - y) \times (a/10)\big]` },
];
export const NOTA_UNIDADES = "$p$: PD estimada; $y$: indicador de default; $u$: utilização em %; $a$: atraso em dias";
export const ETAPAS = ["Começamos com os coeficientes em zero", "Calculamos o gradiente", "Aplicamos a atualização aos três parâmetros"];
export const REGRA = "β novo = β atual − ηg";
export const REGRA_TEX = String.raw`\beta_{\text{novo}} = \beta_{\text{atual}} - \eta\, g`;
export const ETA_TEXTO = `η = ${fmt(ETA, 2)}`;
export const ETA_TEX = String.raw`\eta = ${fmtTex(ETA, 2)}`;
export const TITULO_GRAF = "De onde vem o gradiente da utilização?";
export const ROTULO_EXPANSAO = "Ver contribuições por proposta";
export const ROTULO_VOLTAR = "Voltar ao exemplo";
export const TITULO_EXEMPLO = "Exemplo: coeficiente da utilização";
export const LEGENDA_GRAF = String.raw`Cada barra é $(p_i - y_i) \times (u_i/10)$.`;
export const NOTA_ESTADO = "";
export const DESTAQUE_GRAF = "Somar as 16 contribuições e dividir por 16 produz $g_1$.";
export const EXPLICACAO = "Os três parâmetros usam o gradiente calculado no mesmo estado.";
export const NOTA_TABELA = "Valores exibidos com arredondamento; contas com precisão integral.";
export const RODAPE = "A seguir: repetir as atualizações e acompanhar a convergência.";
