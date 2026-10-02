/**
 * Janelas novas: os mesmos 737 proponentes da janela fora do tempo, com o desfecho sorteado de novo da PD verdadeira
 * (300 sorteios, semente 20261033). Só existem porque a base é sintética; servem para separar a qualidade esperada de
 * um modelo da sorte da janela observada. Uma fonte só para os slides 33, 35 e 36: as mesmas janelas, os mesmos
 * números. Calculadas sob demanda (nunca no carregamento do módulo) e guardadas em cache; conferidas contra o
 * roc_auc_score do scikit-learn, com o mesmo gerador portado, em tests/capitulo7-metricas.test.ts.
 */
import { CAL, CAL_PGR, CAL_PL, PG, PGR, PL, PLATT, PT, Y } from "./dados";
import { ajustarIntercepto, ajustarPlatt, aucPorPostos, brier, logLoss, mulberry32, perdaEsperada, postosMedios, transformar, type Vetor } from "./metricas";

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

/**
 * Calibradores em janelas novas (slides 27, 28, 29, 36 e 37). Para a logística e o boosting sem recalibrar: sem
 * calibrar, intercepto e Platt estimados na amostra de calibração, o atalho (Platt ajustado na própria janela) e, no
 * boosting, o Platt do curso. Para cada um, a perda na janela observada (81 defaults) e a perda esperada exata pela PD
 * verdadeira (perdaEsperada, a média sobre os proponentes): contas baratas, sem sorteio. A log loss em cada uma das
 * N_JANELAS janelas novas, para contar em quantas um calibrador vence outro, só é calculada quando pedida
 * (llEmJanelasNovas, vitorias), nunca no carregamento do módulo. Conferido contra log_loss e brier_score_loss do
 * scikit-learn com pesos em tests/capitulo7-metricas.test.ts.
 */
export type IdCalibrador = "sem" | "intercepto" | "platt" | "atalho" | "curso";
export type Calibrado = { id: IdCalibrador; a: number | null; b: number | null; pd: number[]; janela: { logLoss: number; brier: number }; esperada: { logLoss: number; brier: number } };
const cacheCal = new Map<"pl" | "pgr", Partial<Record<IdCalibrador, Calibrado>>>();
export function calibradores(modelo: "pl" | "pgr"): Partial<Record<IdCalibrador, Calibrado>> {
  const c = cacheCal.get(modelo); if (c) return c;
  const pd = modelo === "pl" ? PL : PGR, pc = modelo === "pl" ? CAL_PL : CAL_PGR;
  const ai = ajustarIntercepto(CAL.y, pc), pp = ajustarPlatt(CAL.y, pc), pa = ajustarPlatt(Y, pd);
  const def: [IdCalibrador, number | null, number | null][] = [["sem", null, null], ["intercepto", ai, 1], ["platt", pp.a, pp.b], ["atalho", pa.a, pa.b]];
  if (modelo === "pgr") def.push(["curso", PLATT.a, PLATT.b]);
  const out: Partial<Record<IdCalibrador, Calibrado>> = {};
  for (const [id, a, b] of def) {
    const q = id === "curso" ? PG.slice() : a === null || b === null ? pd.slice() : transformar(pd, a, b);
    out[id] = { id, a, b, pd: q, janela: { logLoss: logLoss(Y, q).valor, brier: brier(Y, q) }, esperada: perdaEsperada(PT, q) };
  }
  cacheCal.set(modelo, out); return out;
}
const cacheLl = new Map<string, number[]>();
/** Log loss do calibrador em cada uma das N_JANELAS janelas novas (sob demanda, com cache). */
export function llEmJanelasNovas(modelo: "pl" | "pgr", id: IdCalibrador): number[] {
  const k = `${modelo}:${id}`; const c = cacheLl.get(k); if (c) return c;
  const q = calibradores(modelo)[id]!.pd; const v = janelasNovas().map((y) => logLoss(y, q).valor);
  cacheLl.set(k, v); return v;
}
/** Em quantas das N_JANELAS janelas novas a log loss de x fica abaixo da de y. */
export function vitorias(modelo: "pl" | "pgr", x: IdCalibrador, y: IdCalibrador): number {
  const lx = llEmJanelasNovas(modelo, x), ly = llEmJanelasNovas(modelo, y); let v = 0;
  for (let b = 0; b < lx.length; b++) if (lx[b] < ly[b]) v++;
  return v;
}
