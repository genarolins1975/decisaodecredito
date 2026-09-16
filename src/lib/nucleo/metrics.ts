/**
 * Núcleo numérico portado do material original (core2.js) para TypeScript, sem dependências.
 * Usado no teste cego (métricas no servidor) e nos testes de reconciliação dos números do curso.
 */
export const EPS = 1e-15;
export const clip = (p: number, lo = EPS, hi = 1 - EPS) => Math.min(hi, Math.max(lo, p));
export const sigmoid = (z: number) => 1 / (1 + Math.exp(-z));
export const logit = (p: number) => Math.log(clip(p) / (1 - clip(p)));

/** AUC por contagem de pares (empates valem meio), como no material. */
export function auc(y: number[], p: number[]): number {
  const pos: number[] = [], neg: number[] = [];
  for (let i = 0; i < y.length; i++) (y[i] === 1 ? pos : neg).push(p[i]);
  if (!pos.length || !neg.length) return NaN;
  const sorted = neg.slice().sort((a, b) => a - b);
  let s = 0;
  for (const v of pos) {
    // número de negativos < v, e == v
    let lo = 0, hi = sorted.length;
    while (lo < hi) { const m = (lo + hi) >> 1; if (sorted[m] < v) lo = m + 1; else hi = m; }
    const lt = lo;
    let hi2 = sorted.length; let lo2 = lo;
    while (lo2 < hi2) { const m = (lo2 + hi2) >> 1; if (sorted[m] <= v) lo2 = m + 1; else hi2 = m; }
    const eq = lo2 - lt;
    s += lt + eq / 2;
  }
  return s / (pos.length * neg.length);
}

/** KS: distância máxima entre as distribuições acumuladas de bons e maus ao longo do escore. */
export function ks(y: number[], p: number[]): { ks: number; at: number } {
  const idx = y.map((_, i) => i).sort((a, b) => p[b] - p[a]);
  const D = y.reduce((s, v) => s + v, 0), B = y.length - D;
  if (!D || !B) return { ks: NaN, at: NaN };
  let cd = 0, cb = 0, best = 0, at = p[idx[0]];
  for (const i of idx) {
    if (y[i] === 1) cd++; else cb++;
    const d = Math.abs(cd / D - cb / B);
    if (d > best) { best = d; at = p[i]; }
  }
  return { ks: best, at };
}

export const brier = (y: number[], p: number[]) => { let s = 0; for (let i = 0; i < y.length; i++) s += (p[i] - y[i]) ** 2; return s / y.length; };
export const logloss = (y: number[], p: number[]) => { let s = 0; for (let i = 0; i < y.length; i++) { const q = clip(p[i]); s += -(y[i] * Math.log(q) + (1 - y[i]) * Math.log(1 - q)); } return s / y.length; };

/** Intervalo de Wilson para proporção. */
export function wilson(k: number, n: number, z = 1.96) {
  if (!n) return { p: NaN, lo: NaN, hi: NaN };
  const p = k / n, z2 = z * z;
  const den = 1 + z2 / n, centre = p + z2 / (2 * n), adj = z * Math.sqrt(p * (1 - p) / n + z2 / (4 * n * n));
  return { p, lo: (centre - adj) / den, hi: (centre + adj) / den };
}

/** Calibração por faixas de previsão (decis por padrão). */
export function calibration(y: number[], p: number[], k = 10) {
  const idx = y.map((_, i) => i).sort((a, b) => p[a] - p[b]);
  const bins: { n: number; prev: number; obs: number; lo: number; hi: number; defaults: number }[] = [];
  for (let b = 0; b < k; b++) {
    const slice = idx.slice(Math.floor(b * idx.length / k), Math.floor((b + 1) * idx.length / k));
    if (!slice.length) continue;
    const n = slice.length, d = slice.reduce((s, i) => s + y[i], 0), prev = slice.reduce((s, i) => s + p[i], 0) / n;
    const w = wilson(d, n);
    bins.push({ n, prev, obs: d / n, lo: w.lo, hi: w.hi, defaults: d });
  }
  return bins;
}

export function hist(v: number[], edges: number[]) {
  const c = new Array(edges.length + 1).fill(0);
  for (const x of v) { let i = 0; while (i < edges.length && x > edges[i]) i++; c[i]++; }
  return c.map((n) => n / v.length);
}
export function psiFrom(pRef: number[], qCur: number[]) {
  let s = 0;
  for (let i = 0; i < pRef.length; i++) { const a = Math.max(pRef[i], 1e-6), b = Math.max(qCur[i], 1e-6); s += (b - a) * Math.log(b / a); }
  return s;
}
export const psi = (ref: number[], cur: number[], edges: number[]) => psiFrom(hist(ref, edges), hist(cur, edges));

export function woeIv(bons: number[], maus: number[]) {
  const B = bons.reduce((a, b) => a + b, 0), M = maus.reduce((a, b) => a + b, 0);
  const woe = bons.map((b, i) => Math.log(Math.max(maus[i], .5) / M / (Math.max(b, .5) / B)));
  const iv = bons.reduce((s, b, i) => s + (maus[i] / M - b / B) * woe[i], 0);
  return { woe, iv };
}

/** Ganho acumulado por decil (fila de risco). */
export function gains(y: number[], p: number[], k = 10) {
  const idx = y.map((_, i) => i).sort((a, b) => p[b] - p[a]);
  const D = y.reduce((s, v) => s + v, 0);
  const out: { decile: number; n: number; defaults: number; cumPct: number; lift: number }[] = [];
  let cum = 0;
  for (let b = 0; b < k; b++) {
    const slice = idx.slice(Math.floor(b * idx.length / k), Math.floor((b + 1) * idx.length / k));
    const d = slice.reduce((s, i) => s + y[i], 0); cum += d;
    out.push({ decile: b + 1, n: slice.length, defaults: d, cumPct: D ? cum / D : NaN, lift: D && slice.length ? (d / slice.length) / (D / y.length) : NaN });
  }
  return out;
}
