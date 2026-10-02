/**
 * Escolher, votar e corrigir nas 16 propostas didáticas: as peças comuns aos quadros c6p23 (o conceito) e c6p2 (as curvas
 * de log loss). Funções puras, sem tela.
 *   escolher  uma árvore no default y com as 16; PD = frequência de default da folha;
 *   votar     árvores no default y, cada uma numa amostra de 16 sorteada com reposição (semente SEMENTE_VOTAR);
 *             PD = média das frequências das folhas;
 *   corrigir  o boosting da biblioteca (gbm.ts), com CFG_DIDATICA.
 * As árvores no y saem do mesmo ajustar() da biblioteca com uma árvore só e η = 1: o corte sobre y − p̄ é o corte sobre
 * y, e a frequência de default da folha é p̄ + soma ÷ n.
 */
import { CFG_DIDATICA } from "./dados";
import { ajustar, logit, perdaLog, type No, type Vetor } from "./gbm";

/** Semente do sorteio das amostras de votar. */
export const SEMENTE_VOTAR = 20260502;

export function mulberry32(seed: number) {
  let t = seed >>> 0;
  return () => { t += 0x6d2b79f5; let x = Math.imul(t ^ (t >>> 15), 1 | t); x ^= x + Math.imul(x ^ (x >>> 7), 61 | x); return ((x ^ (x >>> 14)) >>> 0) / 4294967296; };
}

/** Folha em que a proposta cai (variáveis em precisão simples, como em gbm.ts). */
export const folhaDe = (no: No, x: Vetor): Extract<No, { folha: true }> => { let a = no; while (!a.folha) a = Math.fround(x[a.variavel]) <= a.corte ? a.esq : a.dir; return a; };
/** Frequência de default da folha em que a proposta cai: p̄ da amostra + média do resíduo da folha. */
export const freq = (no: No, x: Vetor, pbar: number) => { const f = folhaDe(no, x); return pbar + f.soma / f.n; };
/** Uma árvore de profundidade e mínimo por folha de CFG_DIDATICA ajustada no default y. */
export const arvoreY = (X: Vetor[], y: number[]) => { const pbar = y.reduce((s, v) => s + v, 0) / y.length; return { no: ajustar(X, y, { ...CFG_DIDATICA, eta: 1, arvores: 1 }).arvores[0], pbar }; };
/** k amostras de n índices sorteados com reposição, na ordem do sorteio (a amostra j é a mesma qualquer que seja k). */
export function amostrasVotar(k: number, n: number, semente = SEMENTE_VOTAR): number[][] {
  const sorteio = mulberry32(semente);
  return Array.from({ length: k }, () => Array.from({ length: n }, () => Math.floor(sorteio() * n)));
}
/** Log loss média de PDs contra y; null quando uma PD de 0% cai num default (ou 100% num adimplente): a perda não tem limite. */
export const perdaPD = (P: readonly number[], y: readonly number[]) => (P.some((p, i) => (y[i] === 1 && p <= 0) || (y[i] === 0 && p >= 1)) ? null : perdaLog(P.map((p) => logit(Math.min(1 - 1e-12, Math.max(1e-12, p)))), y));
