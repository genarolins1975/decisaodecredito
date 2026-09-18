/**
 * Monitoramento (capítulo 9): índice de estabilidade faixa a faixa, faixas congeladas no treino, intervalos para
 * diferenças de proporção e as três leituras (entrada, nível, relação). Funções puras, conferidas contra o gerador.
 */

/** quantis empíricos (interpolação linear, como numpy) */
export function quantil(v: number[], q: number): number {
  const s = [...v].sort((a, b) => a - b); const pos = (s.length - 1) * q; const lo = Math.floor(pos), hi = Math.ceil(pos);
  return s[lo] + (s[hi] - s[lo]) * (pos - lo);
}
/** limites de dez faixas congelados na amostra de referência: decis de 10% a 90% */
export function limitesDecis(ref: number[]): number[] { return Array.from({ length: 9 }, (_, i) => quantil(ref, (i + 1) / 10)); }

export function proporcoes(v: number[], edges: number[]): number[] {
  const n = edges.length + 1; const c = new Array(n).fill(0);
  for (const x of v) { let j = 0; while (j < edges.length && x > edges[j]) j++; c[j]++; }
  return c.map((k) => k / v.length);
}

export type Faixa = { j: number; de: number | null; ate: number | null; p: number; q: number; psi: number };
/** PSI = Σ (q − p) ln(q ÷ p); faixa com frequência zero recebe piso de 0,0001 e as proporções são renormalizadas */
export function psi(p: number[], q: number[], piso = 1e-4): { valor: number; faixas: { p: number; q: number; psi: number }[] } {
  const ajusta = (v: number[]) => { const w = v.map((x) => Math.max(x, piso)); const s = w.reduce((a, b) => a + b, 0); return w.map((x) => x / s); };
  const P = ajusta(p), Q = ajusta(q);
  const faixas = P.map((pj, j) => ({ p: pj, q: Q[j], psi: (Q[j] - pj) * Math.log(Q[j] / pj) }));
  return { valor: faixas.reduce((s, f) => s + f.psi, 0), faixas };
}
export function indiceDeEstabilidade(ref: number[], cur: number[], edges = limitesDecis(ref)): { valor: number; edges: number[]; faixas: Faixa[] } {
  const p = proporcoes(ref, edges), q = proporcoes(cur, edges); const r = psi(p, q);
  return { valor: r.valor, edges, faixas: r.faixas.map((f, j) => ({ j, de: j ? edges[j - 1] : null, ate: j < edges.length ? edges[j] : null, ...f })) };
}

/** deslocamento simulado: soma delta a cada escore e mistura uma fração de um canal novo com escore mais baixo */
export function simularJanela(cur: number[], delta: number, fracaoNovoCanal: number, semente = 7): number[] {
  const n = cur.length; const k = Math.round(n * fracaoNovoCanal); let s = semente;
  const rnd = () => { s = (s * 1103515245 + 12345) % 2147483648; return s / 2147483648; };
  const base = cur.map((x) => x + delta);
  for (let i = 0; i < k; i++) { const idx = Math.floor(rnd() * n); base[idx] = base[idx] - 60 - rnd() * 40; }
  return base;
}

export const CONVENCOES = { atencao: 0.1, acao: 0.25 } as const;

/** diferença de proporções com intervalo de 95% (Wald) */
export function diferencaProporcoes(k1: number, n1: number, k2: number, n2: number, z = 1.96): { p1: number; p2: number; dif: number; se: number; lo: number; hi: number; excluiZero: boolean } {
  const p1 = k1 / n1, p2 = k2 / n2; const se = Math.sqrt((p1 * (1 - p1)) / n1 + (p2 * (1 - p2)) / n2); const dif = p1 - p2;
  return { p1, p2, dif, se, lo: dif - z * se, hi: dif + z * se, excluiZero: dif - z * se > 0 || dif + z * se < 0 };
}

export type Grupo = { n: number; tp: number; fp: number; fn: number; tn: number };
/** as quatro perguntas de equidade: numerador e denominador de cada uma */
export const PERGUNTAS = [
  { id: "aprovacao", rotulo: "Aprovação", pergunta: "A política aprova os grupos em proporções diferentes?", k: (g: Grupo) => g.tn + g.fn, n: (g: Grupo) => g.n },
  { id: "default", rotulo: "Default observado", pergunta: "Os grupos têm risco observado diferente?", k: (g: Grupo) => g.tp + g.fn, n: (g: Grupo) => g.n },
  { id: "recusa_pagadores", rotulo: "Recusa entre pagadores", pergunta: "Entre quem pagaria, a política recusa mais um grupo?", k: (g: Grupo) => g.fp, n: (g: Grupo) => g.fp + g.tn },
  { id: "default_recusados", rotulo: "Default entre recusados", pergunta: "Entre os recusados, a recusa acertou mais num grupo?", k: (g: Grupo) => g.tp, n: (g: Grupo) => g.tp + g.fp },
] as const;
