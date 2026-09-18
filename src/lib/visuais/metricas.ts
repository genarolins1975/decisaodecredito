/**
 * Métricas de ordenação recalculadas no cliente, a partir dos vetores y (1 = default) e pd (PD estimada).
 * Funções puras, sem dependência de React, cobertas por teste contra os números do gerador (tests/visuais.test.ts).
 */

export type Ponto = { fpr: number; tpr: number; pd: number; k: number };

/** Ordem da fila: índices do maior risco estimado para o menor (empates mantêm a ordem original). */
export function ordemDaFila(pd: number[]): number[] {
  return pd.map((v, i) => i).sort((a, b) => pd[b] - pd[a] || a - b);
}

/** Curva ROC percorrendo todos os cortes da fila: ponto k = recusar as k primeiras posições. */
export function curvaRoc(y: number[], pd: number[], ordem = ordemDaFila(pd)): Ponto[] {
  const n1 = y.reduce((s, v) => s + v, 0), n0 = y.length - n1;
  const pts: Ponto[] = [{ fpr: 0, tpr: 0, pd: Infinity, k: 0 }];
  let d = 0, g = 0;
  for (let k = 0; k < ordem.length; k++) {
    if (y[ordem[k]] === 1) d++; else g++;
    pts.push({ fpr: g / n0, tpr: d / n1, pd: pd[ordem[k]], k: k + 1 });
  }
  return pts;
}

/** AUC como proporção de pares default × adimplente corretamente ordenados (empate conta meio). */
export function aucPorPares(y: number[], pd: number[]): { auc: number; pares: number } {
  const ordem = ordemDaFila(pd);
  // varredura: para cada default, conta adimplentes com PD menor (e metade dos empatados)
  const n1 = y.reduce((s, v) => s + v, 0), n0 = y.length - n1;
  let conc = 0, i = 0;
  // agrupa empates
  const grupos: { d: number; g: number }[] = [];
  while (i < ordem.length) {
    let j = i; const gr = { d: 0, g: 0 };
    while (j < ordem.length && pd[ordem[j]] === pd[ordem[i]]) { if (y[ordem[j]] === 1) gr.d++; else gr.g++; j++; }
    grupos.push(gr); i = j;
  }
  let goodsAbaixo = n0;
  for (const gr of grupos) { goodsAbaixo -= gr.g; conc += gr.d * goodsAbaixo + gr.d * gr.g * 0.5; }
  return { auc: n1 && n0 ? conc / (n1 * n0) : 0, pares: n1 * n0 };
}

/** KS: maior distância entre as acumuladas de defaults e de adimplentes ao longo da fila. */
export function ks(roc: Ponto[]): { ks: number; k: number; pd: number } {
  let best = { ks: 0, k: 0, pd: Infinity };
  for (const p of roc) { const v = p.tpr - p.fpr; if (v > best.ks) best = { ks: v, k: p.k, pd: p.pd }; }
  return best;
}

/** Quantas posições da fila um corte de PD recusa (PD >= corte). */
export function posicoesRecusadas(pd: number[], corte: number, ordem = ordemDaFila(pd)): number {
  let k = 0;
  while (k < ordem.length && pd[ordem[k]] >= corte) k++;
  return k;
}

/** Sorteio sem modelo: permutação reprodutível (mulberry32) usada como ordem da fila. */
export function ordemSorteada(n: number, semente: number): number[] {
  const r = mulberry32(semente);
  const a = Array.from({ length: n }, (_, i) => i);
  for (let i = n - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}

export function mulberry32(seed: number) {
  let t = seed >>> 0;
  return () => { t += 0x6d2b79f5; let x = Math.imul(t ^ (t >>> 15), 1 | t); x ^= x + Math.imul(x ^ (x >>> 7), 61 | x); return ((x ^ (x >>> 14)) >>> 0) / 4294967296; };
}

/** Risco mensal constante que produz a PD declarada no horizonte (em meses). */
export function riscoMensal(pdHorizonte: number, meses: number): number {
  return 1 - Math.pow(1 - pdHorizonte, 1 / meses);
}

/** PD acumulada em m meses sob risco mensal constante h. */
export function pdAcumulada(h: number, m: number): number {
  return 1 - Math.pow(1 - h, m);
}

/** Mês do default (1..∞) de uma operação sob risco mensal constante, dado um uniforme u em (0,1). */
export function mesDoDefault(h: number, u: number): number {
  return Math.ceil(Math.log(1 - u) / Math.log(1 - h));
}

export const fmtPct = (v: number, casas = 0) => `${(v * 100).toLocaleString("pt-BR", { minimumFractionDigits: casas, maximumFractionDigits: casas })}%`;
export const fmtNum = (v: number, casas = 4) => v.toLocaleString("pt-BR", { minimumFractionDigits: casas, maximumFractionDigits: casas }).replace("-", "−");
