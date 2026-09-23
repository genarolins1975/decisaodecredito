/**
 * Impureza (capítulo 5, c5p4): Gini e entropia em função da proporção p de defaults no grupo, e a leitura do Gini
 * como chance de errar. Sorteie uma proposta do grupo (default com probabilidade p) e dê a ela um rótulo sorteado na
 * mesma proporção: o rótulo erra com probabilidade p(1 − p) + (1 − p)p = 2p(1 − p), que é o próprio Gini. Prevendo a
 * maioria, o nó erra mín(p, 1 − p), a taxa de erro do nó: mesmas pontas e mesmo máximo, mas reta por partes, e por isso
 * não serve de critério (revisão pedagógica, M21). Funções puras; arredondamento só na exibição.
 */
import did from "./did.json";
import { crescer, errosNaAmostra, folhas, gini } from "./arvore";
import type { Proposta } from "./logistica";
import { fmtNum, fmtPct } from "./metricas";

export { fmtNum, fmtPct };

export const P_INICIAL = 0.5;
export const ATALHOS = [0, 0.1, 0.5, 0.9] as const;

export const giniP = (p: number) => 2 * p * (1 - p);
/** Entropia binária em bits; zero nas pontas, onde p log p tende a zero. */
export const entropiaP = (p: number) => (p <= 0 || p >= 1 ? 0 : -(p * Math.log2(p) + (1 - p) * Math.log2(1 - p)));
/** Taxa de erro do nó: prevendo o desfecho da maioria, erra a fração da minoria. */
export const taxaErroP = (p: number) => Math.min(p, 1 - p);

export type Celula = { chave: "dd" | "pd" | "dp" | "pp"; proposta: "default" | "pagou"; rotulo: "default" | "pagou"; prob: number; erro: boolean };
/** As quatro combinações de proposta sorteada e rótulo sorteado, com a probabilidade de cada uma. */
export function celulas(p: number): Celula[] {
  const q = 1 - p;
  return [
    { chave: "dd", proposta: "default", rotulo: "default", prob: p * p, erro: false },
    { chave: "pd", proposta: "pagou", rotulo: "default", prob: q * p, erro: true },
    { chave: "dp", proposta: "default", rotulo: "pagou", prob: p * q, erro: true },
    { chave: "pp", proposta: "pagou", rotulo: "pagou", prob: q * q, erro: false },
  ];
}
/** Soma das duas células de erro: coincide com o Gini. */
export const chanceDeErro = (p: number) => celulas(p).filter((c) => c.erro).reduce((s, c) => s + c.prob, 0);

const puro = (p: number) => p <= 0 || p >= 1;
const meio = (p: number) => Math.abs(p - 0.5) < 1e-9;

/** Leitura do estado para o painel: fora das pontas e do meio, as duas chances de errar lado a lado. */
export function leitura(p: number) {
  if (puro(p)) return "Grupo puro: as três curvas zeram, e não há o que reduzir.";
  if (meio(p)) return "Meio a meio: as três no máximo, como na raiz desta base.";
  return `Prevendo a maioria, o nó erra ${fmtPct(taxaErroP(p))}; sorteando o rótulo, ${fmtPct(giniP(p), 1)}, que é o Gini.`;
}

/** A comparação com a proporção simétrica, 1 − p: mesma impureza nas duas medidas. */
export function simetrico(p: number) {
  if (meio(p)) return "Em 50%, o simétrico é o próprio ponto.";
  return `Em ${fmtPct(p)} e em ${fmtPct(1 - p)}, o mesmo Gini, ${fmtNum(giniP(p), 4)}, e a mesma entropia, ${fmtNum(entropiaP(p), 4)}.`;
}

export const TITULO = "Impureza: o quanto o grupo está misturado";
export const SUBTITULO = "Máxima com metade de defaults, zero quando todos têm o mesmo desfecho.";
export const FORMULAS = [
  { k: "Gini", tex: String.raw`\mathrm{Gini}(p) = 2\,p\,(1-p)` },
  { k: "Entropia, em bits", tex: String.raw`H(p) = -p\log_2 p - (1-p)\log_2(1-p)` },
] as const;
export const TITULO_GRAF = "O que muda com a proporção?";
export const EIXO_X = "p, proporção de defaults no grupo";
export const EIXO_Y = "impureza";
export const ROTULO_TAXA = "Taxa de erro do nó";
export const TITULO_QUADRADO = "Como ler o Gini";
export const SUB_QUADRADO = "Proposta e rótulo sorteados na mesma proporção p.";
export const TEX_ERRO = String.raw`\Pr(\text{erro}) = 2\,p\,(1-p)`;
export const TITULO_CTL = "Altere a proporção";
export const ROTULO_ATALHOS = "Ir para";
export const ROTULO_SIMETRICO = "Comparar com 1 − p";
export const RODAPE = "A seguir: o Gini da raiz, contado à mão";

/**
 * O contraexemplo desta base, pela própria árvore do curso: do 1º para o 2º nível, o Gini ponderado das folhas cai e
 * o número de erros prevendo a maioria não muda.
 */
export function contraexemplo() {
  const base = did.base as Proposta[];
  const nivel = (prof: number) => {
    const a = crescer(base, prof);
    return { gini: folhas(a).reduce((s, f) => s + (f.n / base.length) * gini(f.d, f.n), 0), erros: errosNaAmostra(a) };
  };
  return { n: base.length, um: nivel(1), dois: nivel(2) };
}

/** Os três cartões da base; os números vêm das funções, não do texto. */
export function cartoes() {
  const c = contraexemplo();
  return [
    { k: "Não é taxa de erro", t: `No 2º nível desta base, o Gini ponderado cai de ${fmtNum(c.um.gini, 5)} para ${fmtNum(c.dois.gini, 5)}, e os erros seguem ${c.dois.erros} em ${c.n}.` },
    { k: "Não é risco", t: `Com 90% de defaults, Gini ${fmtNum(giniP(0.9), 2)}, como com 10%: impureza baixa é homogeneidade, não segurança.` },
    { k: "No curso", t: "Usamos o Gini: padrão das bibliotecas, sem logaritmo; a entropia dá árvores quase sempre iguais." },
  ];
}
