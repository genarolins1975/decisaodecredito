/**
 * Avaliação de modelos na janela fora do tempo (capítulo 7): matriz de confusão e acerto, decis de risco com ganho e
 * alavancagem, faixas de calibração com intervalo de Wilson, Brier e log loss, deslocamento em log odds e a contagem
 * de pares da AUC no exemplo didático. Funções puras, conferidas contra o gerador em tests/visuais.test.ts.
 */
import { wilson } from "./arvore";
import { logit, sigmoide } from "./logistica";
import { ordemDaFila } from "./metricas";

export type Confusao = { recusadaDefault: number; recusadaPagou: number; aprovadaDefault: number; aprovadaPagou: number; acerto: number; trivial: number; capturados: number; defaults: number };
/** recusa quem tem PD maior ou igual ao corte; acerto = defaults recusados + pagadores aprovados */
export function matrizConfusao(y: number[], pd: number[], corte: number): Confusao {
  let rd = 0, rp = 0, ad = 0, ap = 0;
  pd.forEach((p, i) => { const rec = p >= corte; if (rec && y[i]) rd++; else if (rec) rp++; else if (y[i]) ad++; else ap++; });
  const n = y.length, defaults = rd + ad;
  return { recusadaDefault: rd, recusadaPagou: rp, aprovadaDefault: ad, aprovadaPagou: ap, acerto: (rd + ap) / n, trivial: (n - defaults) / n, capturados: rd, defaults };
}

export type Decil = { j: number; n: number; d: number; obs: number; lo: number; hi: number; pdMedia: number };
/** decis da fila de risco, do pior escore para o melhor (D1 é o decil de maior risco) */
export function decisDeRisco(y: number[], pd: number[], k = 10): Decil[] {
  const ordem = ordemDaFila(pd); const n = pd.length;
  return Array.from({ length: k }, (_, j) => {
    const ids = ordem.slice(Math.round((j * n) / k), Math.round(((j + 1) * n) / k));
    const d = ids.reduce((s, i) => s + y[i], 0); const w = wilson(d, ids.length);
    return { j: j + 1, n: ids.length, d, obs: d / ids.length, lo: w.lo, hi: w.hi, pdMedia: ids.reduce((s, i) => s + pd[i], 0) / ids.length };
  });
}
/** ganho acumulado e alavancagem ao examinar os k piores decis */
export function ganho(decis: Decil[], k: number): { ganho: number; alavancagem: number; examinados: number; defaults: number; total: number } {
  const total = decis.reduce((s, d) => s + d.d, 0); const parte = decis.slice(0, k);
  const defaults = parte.reduce((s, d) => s + d.d, 0); const examinados = parte.reduce((s, d) => s + d.n, 0);
  const fracao = examinados / decis.reduce((s, d) => s + d.n, 0);
  return { ganho: total ? defaults / total : 0, alavancagem: fracao ? (total ? defaults / total : 0) / fracao : 0, examinados, defaults, total };
}

export type Faixa = { j: number; n: number; k: number; prev: number; obs: number; lo: number; hi: number; compativel: boolean };
/** faixas por decil de PD prevista, da menor para a maior, com intervalo de Wilson do observado */
export function faixasDeCalibracao(y: number[], pd: number[], k = 10): Faixa[] {
  const asc = pd.map((_, i) => i).sort((a, b) => pd[a] - pd[b]); const n = pd.length;
  return Array.from({ length: k }, (_, j) => {
    const ids = asc.slice(Math.round((j * n) / k), Math.round(((j + 1) * n) / k));
    const kk = ids.reduce((s, i) => s + y[i], 0); const prev = ids.reduce((s, i) => s + pd[i], 0) / ids.length; const w = wilson(kk, ids.length);
    return { j: j + 1, n: ids.length, k: kk, prev, obs: kk / ids.length, lo: w.lo, hi: w.hi, compativel: prev >= w.lo && prev <= w.hi };
  });
}

export const brier = (y: number[], pd: number[]) => pd.reduce((s, p, i) => s + (p - y[i]) ** 2, 0) / pd.length;
export const logLoss = (y: number[], pd: number[]) => -pd.reduce((s, p, i) => s + (y[i] ? Math.log(p) : Math.log(1 - p)), 0) / pd.length;
export const deslocar = (pd: number[], delta: number) => pd.map((p) => sigmoide(logit(Math.min(1 - 1e-9, Math.max(1e-9, p))) + delta));
export const media = (v: number[]) => v.reduce((a, b) => a + b, 0) / v.length;

/** as nove propostas da fila didática do capítulo 7 (c7p4): posição na janela, PD e desfecho */
export const FILA_DIDATICA = [
  { id: 0, pd: 0.22, y: 0 }, { id: 30, pd: 0.2, y: 1 }, { id: 54, pd: 0.16, y: 1 }, { id: 1, pd: 0.11, y: 0 }, { id: 3, pd: 0.1, y: 0 },
  { id: 20, pd: 0.08, y: 1 }, { id: 28, pd: 0.05, y: 1 }, { id: 2, pd: 0.03, y: 0 }, { id: 4, pd: 0.03, y: 0 },
];
export type Par = { d: { id: number; pd: number }; a: { id: number; pd: number }; estado: "correto" | "empate" | "invertido" };
/** todos os pares default × adimplente e o estado de cada um */
export function pares(fila: { id: number; pd: number; y: number }[]): { pares: Par[]; auc: number } {
  const ds = fila.filter((f) => f.y), as = fila.filter((f) => !f.y); const out: Par[] = [];
  for (const d of ds) for (const a of as) out.push({ d, a, estado: d.pd > a.pd ? "correto" : d.pd === a.pd ? "empate" : "invertido" });
  const auc = out.reduce((s, p) => s + (p.estado === "correto" ? 1 : p.estado === "empate" ? 0.5 : 0), 0) / out.length;
  return { pares: out, auc };
}
