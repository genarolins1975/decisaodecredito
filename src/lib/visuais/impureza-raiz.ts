/**
 * Impureza na raiz (capítulo 5, c5p5): o Gini de um grupo contado à mão sobre a base das 16 propostas. Os grupos são a
 * raiz e duas folhas da árvore de profundidade 2 que o capítulo cresce: a pura (nenhum default) e a mista da ponta
 * direita (um default em duas). Tudo sai da base e da árvore; funções puras, arredondamento só na exibição.
 */
import did from "./did.json";
import { crescer, folhas, gini } from "./arvore";
import type { Proposta } from "./logistica";
import { fmtNum } from "./metricas";

export { fmtNum };

export const BASE = did.base as Proposta[];

export type ChaveGrupo = "raiz" | "pura" | "mista";
export type Grupo = { chave: ChaveGrupo; nome: string; definicao: string; ids: number[]; n: number; d: number; p: number; gini: number };

const FOLHAS = folhas(crescer(BASE, 2));
const FOLHA_PURA = FOLHAS.find((f) => f.d === 0);
const FOLHA_MISTA = [...FOLHAS].reverse().find((f) => f.d > 0 && f.d < f.n);
if (!FOLHA_PURA || !FOLHA_MISTA) throw new Error("árvore de profundidade 2 sem folha pura ou mista");

const faixaDeUtilizacao = (c: { u0: number; u1: number }) =>
  c.u1 >= 100 ? `Utilização acima de ${fmtNum(c.u0, 1)}%` : c.u0 <= 0 ? `Utilização até ${fmtNum(c.u1, 1)}%` : `Utilização entre ${fmtNum(c.u0, 1)}% e ${fmtNum(c.u1, 1)}%`;

const montar = (chave: ChaveGrupo, nome: string, definicao: string, grupo: Proposta[]): Grupo => {
  const n = grupo.length, d = grupo.filter((r) => r.y).length;
  return { chave, nome, definicao, ids: grupo.map((r) => r.id), n, d, p: d / n, gini: gini(d, n) };
};

export const GRUPOS: Record<ChaveGrupo, Grupo> = {
  raiz: montar("raiz", "Raiz", "As 16 propostas da base", BASE),
  pura: montar("pura", "Folha pura", faixaDeUtilizacao(FOLHA_PURA.caixa), FOLHA_PURA.grupo),
  mista: montar("mista", "Folha mista", faixaDeUtilizacao(FOLHA_MISTA.caixa), FOLHA_MISTA.grupo),
};
export const ORDEM: ChaveGrupo[] = ["raiz", "pura", "mista"];
export const GRUPO_INICIAL: ChaveGrupo = "raiz";

/** Leitura do grupo para o painel. */
export function leitura(g: Grupo) {
  if (g.d === 0 || g.d === g.n) return "Todos com o mesmo desfecho: grupo puro, Gini zero.";
  if (g.chave === "raiz") return "Metade default, metade não: a mistura máxima.";
  return `${g.d} default${g.d === 1 ? "" : "s"} em ${g.n}: meio a meio de novo, o mesmo Gini da raiz.`;
}

/** Número com vírgula decimal para o KaTeX, que trata a vírgula como pontuação e poria espaço depois dela. */
export const paraTex = (s: string) => s.replace(",", "{,}");

/** As duas linhas da conta do grupo, em TeX, com os números do grupo. */
export function conta(g: Grupo) {
  const p = paraTex(fmtNum(g.p, 4)), q = paraTex(fmtNum(1 - g.p, 4)), gi = paraTex(fmtNum(g.gini, 5));
  return [String.raw`p = \dfrac{${g.d}}{${g.n}} = ${p}`, String.raw`\mathrm{Gini} = 2 \times ${p} \times ${q} = ${gi}`];
}

export const TITULO = "Impureza na raiz";
export const SUBTITULO = "O Gini de um grupo, contado à mão na base das 16 propostas.";
export const FORMULAS = [
  { k: "Proporção de defaults", tex: String.raw`p = \text{defaults} \,/\, \text{propostas}` },
  { k: "Gini", tex: String.raw`\mathrm{Gini} = 1 - p^2 - (1-p)^2 = 2\,p\,(1-p)` },
] as const;
export const TITULO_BASE = "A base: as 16 propostas";
export const TITULO_CONTA = "A conta do grupo";
export const TITULO_CTL = "Escolha o grupo";
export const CONFIRA = "Confira na tabela: conte os sim nas linhas acesas.";
export const RODAPE = "A seguir: um corte avaliado contra essa referência";

/** Os três cartões da base; os números vêm dos grupos, não do texto. */
export function cartoes() {
  const r = GRUPOS.raiz, m = GRUPOS.mista;
  return [
    { k: "A referência", t: `A raiz tem ${r.d} defaults em ${r.n}: Gini ${fmtNum(r.gini, 1)}, o máximo com alvo binário. Todo ganho parte daqui.` },
    { k: "Folha pura", t: `${GRUPOS.pura.d} default em ${GRUPOS.pura.n}: Gini zero, nada a reduzir.` },
    { k: "O tamanho conta", t: `A folha mista tem o ${fmtNum(m.gini, 1)} da raiz com ${m.n} propostas: pesa ${m.n} em ${r.n}, o que a próxima página usa.` },
  ];
}
