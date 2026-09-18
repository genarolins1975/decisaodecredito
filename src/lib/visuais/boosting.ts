/**
 * Gradient boosting didático (capítulo 6): árvores de regressão rasas ajustadas ao resíduo, somadas com taxa de
 * aprendizagem. Regressão nos 8 pontos (x, y) e classificação nas 16 propostas didáticas, na escala de log odds.
 * Funções puras; os números são conferidos contra o gerador em tests/visuais.test.ts.
 */
import { sigmoide, type Proposta } from "./logistica";

export type Caso = { x: number[]; r: number; i: number };
export type NoReg = { n: number; valor: number; idx: number[]; prof: number; corte?: { v: number; valor: number; ganho: number }; esq?: NoReg; dir?: NoReg };

const media = (v: number[]) => (v.length ? v.reduce((a, b) => a + b, 0) / v.length : 0);
const sse = (v: number[]) => { const m = media(v); return v.reduce((s, x) => s + (x - m) ** 2, 0); };

/** cortes candidatos: pontos médios entre valores distintos consecutivos da variável v */
export function cortesReg(casos: Caso[], v: number): number[] {
  const vals = [...new Set(casos.map((c) => c.x[v]))].sort((a, b) => a - b);
  return vals.slice(1).map((b, i) => (vals[i] + b) / 2);
}

/** árvore de regressão por soma de quadrados; empate vai para a primeira variável e o menor corte */
export function arvoreRegressao(casos: Caso[], profMax: number, minFolha = 1, prof = 0): NoReg {
  const r = casos.map((c) => c.r);
  const no: NoReg = { n: casos.length, valor: media(r), idx: casos.map((c) => c.i), prof };
  if (prof >= profMax || casos.length < 2 * minFolha) return no;
  const antes = sse(r); let melhor: { v: number; corte: number; ganho: number; esq: Caso[]; dir: Caso[] } | null = null;
  const nv = casos[0].x.length;
  for (let v = 0; v < nv; v++) for (const corte of cortesReg(casos, v)) {
    const esq = casos.filter((c) => c.x[v] <= corte), dir = casos.filter((c) => c.x[v] > corte);
    if (esq.length < minFolha || dir.length < minFolha) continue;
    const ganho = antes - sse(esq.map((c) => c.r)) - sse(dir.map((c) => c.r));
    if (!melhor || ganho > melhor.ganho + 1e-12) melhor = { v, corte, ganho, esq, dir };
  }
  if (!melhor || melhor.ganho <= 1e-12) return no;
  no.corte = { v: melhor.v, valor: melhor.corte, ganho: melhor.ganho };
  no.esq = arvoreRegressao(melhor.esq, profMax, minFolha, prof + 1);
  no.dir = arvoreRegressao(melhor.dir, profMax, minFolha, prof + 1);
  return no;
}

export function prever(no: NoReg, x: number[]): number {
  if (!no.corte || !no.esq || !no.dir) return no.valor;
  return x[no.corte.v] <= no.corte.valor ? prever(no.esq, x) : prever(no.dir, x);
}
export function folhasReg(no: NoReg): NoReg[] { return no.corte && no.esq && no.dir ? [...folhasReg(no.esq), ...folhasReg(no.dir)] : [no]; }

// ---- regressão: 8 pontos --------------------------------------------------------------------------------------
export const PONTOS = { x: [1, 2, 3, 4, 5, 6, 7, 8], y: [2, 3, 4.5, 5, 8, 8.5, 9, 12] };
export type PassoReg = { m: number; F: number[]; res: number[]; mse: number; arvore: NoReg | null; h: number[] };

export const mse = (y: number[], F: number[]) => y.reduce((s, v, i) => s + (v - F[i]) ** 2, 0) / y.length;

/** boosting de regressão com tocos (profundidade 1): F0 = média, depois F += η × toco ajustado ao resíduo */
export function boostingRegressao(x: number[], y: number[], eta: number, M: number, profundidade = 1): PassoReg[] {
  let F = y.map(() => media(y));
  const passos: PassoReg[] = [{ m: 0, F, res: y.map((v, i) => v - F[i]), mse: mse(y, F), arvore: null, h: y.map(() => 0) }];
  for (let m = 1; m <= M; m++) {
    const res = y.map((v, i) => v - F[i]);
    const arvore = arvoreRegressao(res.map((r, i) => ({ x: [x[i]], r, i })), profundidade);
    const h = x.map((xi) => prever(arvore, [xi]));
    F = F.map((f, i) => f + eta * h[i]);
    passos.push({ m, F, res, mse: mse(y, F), arvore, h });
  }
  return passos;
}

// ---- classificação: 16 propostas, log odds ----------------------------------------------------------------------
export type PassoClf = { m: number; F: number[]; p: number[]; grad: number[]; perda: number; arvore: NoReg | null; h: number[] };

export const perdaLogistica = (y: number[], p: number[]) => -y.reduce((s, v, i) => s + (v ? Math.log(p[i]) : Math.log(1 - p[i])), 0) / y.length;

/** boosting de classificação: F0 = log odds da prevalência, alvo y − p, árvore de regressão sobre o alvo, F += η h */
export function boostingClassificacao(base: Proposta[], eta: number, M: number, profundidade = 2, minFolha = 2): PassoClf[] {
  const y = base.map((b) => b.y); const prev = media(y);
  const f0 = Math.log(prev / (1 - prev));
  let F = base.map(() => f0); let p = F.map(sigmoide);
  const passos: PassoClf[] = [{ m: 0, F, p, grad: y.map((v, i) => v - p[i]), perda: perdaLogistica(y, p), arvore: null, h: base.map(() => 0) }];
  for (let m = 1; m <= M; m++) {
    const grad = y.map((v, i) => v - p[i]);
    const arvore = arvoreRegressao(base.map((b, i) => ({ x: [b.util, b.atraso], r: grad[i], i })), profundidade, minFolha);
    const h = base.map((b) => prever(arvore, [b.util, b.atraso]));
    F = F.map((f, i) => f + eta * h[i]); p = F.map(sigmoide);
    passos.push({ m, F, p, grad, perda: perdaLogistica(y, p), arvore, h });
  }
  return passos;
}

/** contribuição de cada árvore para uma proposta: parcelas em log odds e PD acumulada */
export function rastro(passos: PassoClf[], i: number, eta: number): { m: number; parcela: number; F: number; p: number }[] {
  return passos.map((ps) => ({ m: ps.m, parcela: ps.m ? eta * ps.h[i] : ps.F[i], F: ps.F[i], p: ps.p[i] }));
}

export const NOME_VAR_CLF = ["utilização", "atraso"] as const;
export function rotuloCorteReg(v: number, valor: number): string {
  return v === 0 ? `utilização ≤ ${valor.toLocaleString("pt-BR")}%` : `atraso ≤ ${valor.toLocaleString("pt-BR")} d`;
}
