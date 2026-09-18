/**
 * Árvore de decisão do capítulo 5 em funções puras, sobre as 16 propostas didáticas: impureza de Gini, cortes candidatos
 * nos pontos médios, ganho ponderado, escolha do melhor corte (variáveis na ordem utilização e atraso; empate fica com a
 * primeira) e crescimento recursivo com os dois freios (profundidade máxima e mínimo de propostas por folha).
 * Conferido contra o gerador em tests/visuais.test.ts (raiz em utilização 57,5 com ganho 0,28125; nível 2 em 27,5 e 87,5).
 */
import type { Proposta } from "./logistica";

export type Variavel = "util" | "atraso";
export const VARIAVEIS: Variavel[] = ["util", "atraso"];
export const NOME_VAR: Record<Variavel, string> = { util: "Utilização do limite", atraso: "Maior atraso em 6 meses" };

export const gini = (d: number, n: number) => (n ? 1 - (d / n) ** 2 - ((n - d) / n) ** 2 : 0);

/** Pontos médios entre valores consecutivos observados de uma variável, no grupo dado. */
export function cortesCandidatos(grupo: Proposta[], v: Variavel): number[] {
  const vals = Array.from(new Set(grupo.map((p) => p[v]))).sort((a, b) => a - b);
  return vals.slice(1).map((x, i) => (vals[i] + x) / 2);
}

export type Avaliacao = { v: Variavel; corte: number; esq: Proposta[]; dir: Proposta[]; giniAntes: number; giniEsq: number; giniDir: number; depois: number; ganho: number };

/** Avalia um corte: lado esquerdo é "≤ corte"; ganho é a redução ponderada do Gini. */
export function avaliarCorte(grupo: Proposta[], v: Variavel, corte: number): Avaliacao {
  const esq = grupo.filter((p) => p[v] <= corte), dir = grupo.filter((p) => p[v] > corte);
  const d = (g: Proposta[]) => g.reduce((s, p) => s + p.y, 0);
  const giniAntes = gini(d(grupo), grupo.length), giniEsq = gini(d(esq), esq.length), giniDir = gini(d(dir), dir.length);
  const depois = (esq.length / grupo.length) * giniEsq + (dir.length / grupo.length) * giniDir;
  return { v, corte, esq, dir, giniAntes, giniEsq, giniDir, depois, ganho: giniAntes - depois };
}

/** Todos os candidatos do grupo, por variável, na ordem de avaliação. */
export function todosOsCandidatos(grupo: Proposta[], minFolha = 1): Avaliacao[] {
  return VARIAVEIS.flatMap((v) => cortesCandidatos(grupo, v).map((c) => avaliarCorte(grupo, v, c))).filter((a) => a.esq.length >= minFolha && a.dir.length >= minFolha);
}

/** Melhor corte permitido: maior ganho; empate fica com o primeiro avaliado (utilização antes de atraso, cortes crescentes). */
export function melhorCorte(grupo: Proposta[], minFolha = 1): Avaliacao | null {
  let best: Avaliacao | null = null;
  for (const a of todosOsCandidatos(grupo, minFolha)) if (a.ganho > 1e-12 && (!best || a.ganho > best.ganho + 1e-12)) best = a;
  return best;
}

export type No = { grupo: Proposta[]; n: number; d: number; prof: number; corte?: { v: Variavel; valor: number; ganho: number }; esq?: No; dir?: No; caixa: { u0: number; u1: number; a0: number; a1: number } };

/** Cresce a árvore recursivamente até a profundidade máxima, respeitando o mínimo por folha. */
export function crescer(grupo: Proposta[], profMax: number, minFolha = 1, prof = 0, caixa = { u0: 0, u1: 100, a0: 0, a1: 40 }): No {
  const d = grupo.reduce((s, p) => s + p.y, 0);
  const no: No = { grupo, n: grupo.length, d, prof, caixa };
  if (prof >= profMax || d === 0 || d === grupo.length) return no;
  const m = melhorCorte(grupo, minFolha);
  if (!m) return no;
  no.corte = { v: m.v, valor: m.corte, ganho: m.ganho };
  const cE = m.v === "util" ? { ...caixa, u1: m.corte } : { ...caixa, a1: m.corte };
  const cD = m.v === "util" ? { ...caixa, u0: m.corte } : { ...caixa, a0: m.corte };
  no.esq = crescer(m.esq, profMax, minFolha, prof + 1, cE);
  no.dir = crescer(m.dir, profMax, minFolha, prof + 1, cD);
  return no;
}

export function folhas(no: No): No[] { return no.corte && no.esq && no.dir ? [...folhas(no.esq), ...folhas(no.dir)] : [no]; }
/** Erros na amostra: cada folha prevê o desfecho majoritário (empate conta como default). */
export function errosNaAmostra(no: No): number { return folhas(no).reduce((s, f) => s + (f.d * 2 >= f.n ? f.n - f.d : f.d), 0); }
/** Intervalo de Wilson a 95% para a proporção de defaults de uma folha. */
export function wilson(d: number, n: number, z = 1.96): { lo: number; hi: number } {
  if (!n) return { lo: 0, hi: 1 };
  const p = d / n, den = 1 + (z * z) / n, centro = (p + (z * z) / (2 * n)) / den, meia = (z * Math.sqrt((p * (1 - p)) / n + (z * z) / (4 * n * n))) / den;
  return { lo: Math.max(0, centro - meia), hi: Math.min(1, centro + meia) };
}
export function rotuloCorte(v: Variavel, valor: number): string {
  return v === "util" ? `utilização ≤ ${valor.toLocaleString("pt-BR", { maximumFractionDigits: 1 })}%` : `atraso ≤ ${valor.toLocaleString("pt-BR", { maximumFractionDigits: 1 })} d`;
}
