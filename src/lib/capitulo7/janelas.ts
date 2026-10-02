/**
 * Janelas novas: os mesmos 737 proponentes da janela fora do tempo, com o desfecho sorteado de novo da PD verdadeira
 * (300 sorteios, semente 20261033). Só existem porque a base é sintética; servem para separar a qualidade esperada de
 * um modelo da sorte da janela observada. Uma fonte só para os slides 33, 35 e 36: as mesmas janelas, os mesmos
 * números. Calculadas sob demanda (nunca no carregamento do módulo) e guardadas em cache; conferidas contra o
 * roc_auc_score do scikit-learn, com o mesmo gerador portado, em tests/capitulo7-metricas.test.ts.
 */
import { PGR, PL, PT, Y } from "./dados";
import { aucPorPostos, mulberry32, postosMedios, type Vetor } from "./metricas";

export const SEMENTE_JANELAS = 20261033;
export const N_JANELAS = 300;

let ys: number[][] | null = null;
/** Os N_JANELAS vetores de desfecho, na ordem do gerador: janela a janela, proposta a proposta, y = 1 quando u < PD verdadeira. */
export function janelasNovas(): readonly (readonly number[])[] {
  if (!ys) { const r = mulberry32(SEMENTE_JANELAS); ys = Array.from({ length: N_JANELAS }, () => PT.map((p) => (r() < p ? 1 : 0))); }
  return ys;
}

const cacheAucs = new WeakMap<Vetor, number[]>();
/** AUC do modelo em cada janela nova (as PDs ficam; muda só o desfecho). */
export function aucsEmJanelasNovas(pd: Vetor): number[] {
  const c = cacheAucs.get(pd); if (c) return c;
  const postos = postosMedios(pd); const v = janelasNovas().map((y) => aucPorPostos(y, postos)!);
  cacheAucs.set(pd, v); return v;
}
/** AUC esperada em janelas novas: a média das N_JANELAS AUCs. */
export const aucEsperada = (pd: Vetor) => { const v = aucsEmJanelasNovas(pd); return v.reduce((s, x) => s + x, 0) / v.length; };

/**
 * Logística contra boosting (a ordem do boosting com Platt é a mesma do boosting sem recalibrar): AUC média de cada um
 * em janelas novas, a vantagem observada na janela e quantas janelas novas repetem uma vantagem igual ou maior.
 */
export function vantagemEmJanelasNovas() {
  const al = aucsEmJanelasNovas(PL), ag = aucsEmJanelasNovas(PGR);
  const obs = aucPorPostos(Y, postosMedios(PL))! - aucPorPostos(Y, postosMedios(PGR))!;
  let acima = 0; for (let b = 0; b < al.length; b++) if (al[b] - ag[b] >= obs) acima++;
  const l = aucEsperada(PL), g = aucEsperada(PGR);
  return { l, g, vantagem: l - g, obs, acima };
}
