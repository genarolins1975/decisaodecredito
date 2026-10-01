/**
 * Janelas novas: os mesmos 737 proponentes da janela fora do tempo, com o desfecho sorteado de novo da PD verdadeira.
 * Só existem porque a base é sintética; servem para separar a qualidade esperada de um modelo da sorte da janela
 * observada (slides 33, 35 e 36). Calculadas sob demanda e guardadas em cache.
 */
import { PGR, PL, PT, Y } from "./dados";
import { aucPorPares, mulberry32 } from "./metricas";

export const SEMENTE_JANELAS = 20261033;
export const N_JANELAS = 300;
let cache: { l: number; g: number; acima: number } | null = null;

export function vantagemEmJanelasNovas() {
  if (cache) return cache;
  const obs = aucPorPares(Y, PL).auc! - aucPorPares(Y, PGR).auc!;
  const r = mulberry32(SEMENTE_JANELAS); let s1 = 0, s2 = 0, acima = 0;
  for (let b = 0; b < N_JANELAS; b++) {
    const y = PT.map((p) => (r() < p ? 1 : 0));
    const u = aucPorPares(y, PL).auc!, v = aucPorPares(y, PGR).auc!;
    s1 += u; s2 += v; if (u - v >= obs) acima++;
  }
  cache = { l: s1 / N_JANELAS, g: s2 / N_JANELAS, acima };
  return cache;
}
