/**
 * Cálculos puros do bloco 2 (desempenho) do capítulo 12: o histograma de scores agrupado em faixas de largura igual
 * para desenho, a TPR de uma curva ROC numa FPR qualquer (interpolação linear entre limiares vizinhos, que é a curva
 * que se obtém sorteando entre os dois limiares) e o sorteio de pares (5, não 5) a partir do histograma, que converge
 * para a AUC. Sem React; os quadros importam daqui.
 */
import type { Histograma, PontoCurva } from "./metricas";
import { mulberry32 } from "../capitulo7/metricas";

export type Barra = { de: number; ate: number; pos: number; neg: number; fPos: number; fNeg: number };
/**
 * Agrupa o histograma fino (bordas desiguais, cerca de 100 imagens por faixa) em faixas de largura igual entre `de` e
 * `ate`. Cada faixa fina é repartida entre as faixas largas na proporção da sobreposição (contagem uniforme dentro da
 * faixa fina); o que fica abaixo de `de` ou acima de `ate` soma na primeira ou na última faixa larga. `fPos` e `fNeg`
 * são a fração de cada classe na faixa (cada classe soma 1).
 */
export function agruparHist(h: Histograma, de: number, ate: number, largura: number): Barra[] {
  const k = Math.round((ate - de) / largura);
  const bs: Barra[] = Array.from({ length: k }, (_, j) => ({ de: de + j * largura, ate: de + (j + 1) * largura, pos: 0, neg: 0, fPos: 0, fNeg: 0 }));
  let P = 0, N = 0;
  for (let i = 0; i < h.pos.length; i++) {
    const a = h.bordas[i], b = h.bordas[i + 1], w = b - a;
    P += h.pos[i]; N += h.neg[i];
    for (let j = 0; j < k; j++) {
      const lo = j === 0 ? -Infinity : bs[j].de, hi = j === k - 1 ? Infinity : bs[j].ate;
      const s = Math.max(0, Math.min(b, hi) - Math.max(a, lo));
      if (s > 0) { const f = s / w; bs[j].pos += h.pos[i] * f; bs[j].neg += h.neg[i] * f; }
    }
  }
  bs.forEach((x) => { x.fPos = x.pos / P; x.fNeg = x.neg / N; });
  return bs;
}

/** Pontos da ROC em ordem crescente de FPR (a curva por limiar vem do limiar mais baixo, FPR 1, ao mais alto, FPR 0). */
export const rocCrescente = (c: PontoCurva[]) => c.slice().sort((a, b) => a.fpr - b.fpr || a.tpr - b.tpr);
/** TPR na FPR f, por interpolação linear entre os dois pontos vizinhos da ROC (pontos em ordem crescente de FPR). */
export function tprEm(pts: { fpr: number; tpr: number }[], f: number): number {
  if (f <= pts[0].fpr) return pts[0].tpr;
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1], b = pts[i];
    if (f <= b.fpr) {
      if (b.fpr === a.fpr) return Math.max(a.tpr, b.tpr);
      // no mesmo FPR pode haver vários pontos: fica o de TPR maior
      return a.tpr + ((f - a.fpr) / (b.fpr - a.fpr)) * (b.tpr - a.tpr);
    }
  }
  return pts[pts.length - 1].tpr;
}

/**
 * Sorteio de pares: em cada par, uma imagem de 5 e uma de não 5, cada uma sorteada na sua classe pela contagem das
 * faixas do histograma (mulberry32 com a semente). Vence o 5 quando a faixa dele está acima da do não 5; na mesma
 * faixa, conta meio ponto (a convenção de aucHistograma). Devolve, para cada total de pares, as vitórias acumuladas.
 */
export function sortearPares(h: Histograma, n: number, semente: number) {
  const r = mulberry32(semente);
  const acum = (v: readonly number[]) => { const o: number[] = []; let s = 0; for (const x of v) { s += x; o.push(s); } return o; };
  const cP = acum(h.pos), cN = acum(h.neg), P = cP[cP.length - 1], N = cN[cN.length - 1];
  const faixa = (c: number[], u: number) => { let lo = 0, hi = c.length - 1; while (lo < hi) { const m = (lo + hi) >> 1; if (c[m] > u) hi = m; else lo = m + 1; } return lo; };
  const vitorias: number[] = []; let v = 0;
  for (let i = 0; i < n; i++) {
    const a = faixa(cP, r() * P), b = faixa(cN, r() * N);
    v += a > b ? 1 : a === b ? 0.5 : 0;
    vitorias.push(v);
  }
  return vitorias;
}
