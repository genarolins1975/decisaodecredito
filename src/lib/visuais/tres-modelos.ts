/**
 * Fecho da Aula 2 (c6p20): as três famílias lidas nas mesmas 16 propostas. Nenhum número é novo: cada PD sai das
 * mesmas funções que os capítulos usam, com a mesma configuração que as páginas mostram.
 * - logística: os coeficientes da aula (c4p8 a c4p18);
 * - árvore: profundidade 2, crescida sobre as 16 (c5p10 e c5p18);
 * - boosting: quatro árvores de profundidade 2, η = 0,4, partindo das log odds da prevalência (c6p13 e c6p14).
 * A perda de treino da árvore usa piso e teto de 2% e 98% nas folhas puras, a mesma convenção de c5p18.
 */
import did from "./did.json";
import { BETA_AULA, escore, perdaIndividual, sigmoide, type Proposta } from "./logistica";
import { crescer, type No } from "./arvore";
import { boostingClassificacao } from "./boosting";

export const BASE_TM = did.base as Proposta[];
export const ETA_TM = 0.4;
export const ARVORES_TM = 4;
export const PROFUNDIDADE_ARVORE_TM = 2;

export type Familia = "logistica" | "arvore" | "boosting";
export const FAMILIAS: { id: Familia; nome: string; capitulo: number; config: string }[] = [
  { id: "logistica", nome: "Logística", capitulo: 4, config: "coeficientes da aula" },
  { id: "arvore", nome: "Árvore", capitulo: 5, config: "profundidade 2" },
  { id: "boosting", nome: "Boosting", capitulo: 6, config: "4 árvores, η = 0,4" },
];

export type LinhaTM = Proposta & {
  pd: Record<Familia, number>;
  folha: { d: number; n: number };
  menor: number; maior: number; distancia: number;
  /** algum modelo põe a proposta abaixo de 50% e outro acima: leituras opostas do mesmo caso */
  ladosOpostos: boolean;
};

function folhaDe(no: No, u: number, a: number): No {
  let n = no;
  while (n.corte && n.esq && n.dir) n = (n.corte.v === "util" ? u : a) <= n.corte.valor ? n.esq : n.dir;
  return n;
}

export function tresModelos(base: Proposta[] = BASE_TM): { linhas: LinhaTM[]; perda: Record<Familia, number> } {
  const arvore = crescer(base, PROFUNDIDADE_ARVORE_TM);
  const passos = boostingClassificacao(base, ETA_TM, ARVORES_TM);
  const final = passos[passos.length - 1];
  const soma: Record<Familia, number> = { logistica: 0, arvore: 0, boosting: 0 };
  const linhas = base.map((b, i) => {
    const f = folhaDe(arvore, b.util, b.atraso);
    const pd: Record<Familia, number> = { logistica: sigmoide(escore(BETA_AULA, b.util, b.atraso).z), arvore: f.d / f.n, boosting: final.p[i] };
    soma.logistica += perdaIndividual(pd.logistica, b.y);
    soma.arvore += perdaIndividual(Math.min(0.98, Math.max(0.02, pd.arvore)), b.y);
    soma.boosting += perdaIndividual(pd.boosting, b.y);
    const v = [pd.logistica, pd.arvore, pd.boosting];
    const menor = Math.min(...v), maior = Math.max(...v);
    return { ...b, pd, folha: { d: f.d, n: f.n }, menor, maior, distancia: maior - menor, ladosOpostos: menor < 0.5 && maior > 0.5 };
  });
  const n = base.length;
  return { linhas, perda: { logistica: soma.logistica / n, arvore: soma.arvore / n, boosting: soma.boosting / n } };
}

/** Proposta de maior distância entre o menor e o maior PD dos três modelos. */
export function maisDisputada(linhas: LinhaTM[]): LinhaTM {
  return linhas.reduce((m, l) => (l.distancia > m.distancia ? l : m), linhas[0]);
}

/** Leitura curta de uma proposta: de que lado de 50% cada modelo a põe. */
export function leituraDaProposta(l: LinhaTM): string {
  const lado = (p: number) => (p > 0.5 ? "acima" : p < 0.5 ? "abaixo" : "em");
  const acima = FAMILIAS.filter((f) => lado(l.pd[f.id]) === "acima").map((f) => f.nome.toLowerCase());
  const abaixo = FAMILIAS.filter((f) => lado(l.pd[f.id]) === "abaixo").map((f) => f.nome.toLowerCase());
  const em = FAMILIAS.filter((f) => lado(l.pd[f.id]) === "em").map((f) => f.nome.toLowerCase());
  const junta = (xs: string[]) => (xs.length <= 1 ? xs.join("") : `${xs.slice(0, -1).join(", ")} e ${xs[xs.length - 1]}`);
  if (acima.length === 3) return "Os três põem a proposta acima de 50%.";
  if (abaixo.length === 3) return "Os três põem a proposta abaixo de 50%.";
  const partes: string[] = [];
  if (acima.length) partes.push(`${junta(acima)} acima de 50%`);
  if (abaixo.length) partes.push(`${junta(abaixo)} abaixo`);
  if (em.length) partes.push(`${junta(em)} em 50% exatos`);
  const txt = partes.join("; ");
  return txt.charAt(0).toUpperCase() + txt.slice(1) + ".";
}
