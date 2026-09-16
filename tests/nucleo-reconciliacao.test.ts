/**
 * Reconciliação dos números do material com o núcleo numérico portado.
 * Fonte única: content/generated/dados.json (objeto DADOS do HTML original, gerado por seed 20260501,
 * base sintética de 5.000 propostas). Todo número aqui é RECONSTRUÇÃO DIDÁTICA em base sintética,
 * não evidência empírica de mercado.
 */
import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { auc, brier, calibration, gains, ks, logloss, psiFrom, sigmoid, logit, wilson } from "../src/lib/nucleo/metrics";

const file = path.resolve(__dirname, "../content/generated/dados.json");
const has = fs.existsSync(file);
const D = has ? JSON.parse(fs.readFileSync(file, "utf8")).DADOS : null;

describe.skipIf(!has)("métricas OOT recalculadas a partir das previsões do material", () => {
  const y: number[] = D?.oot.y ?? [], pl: number[] = D?.oot.pl ?? [], pg: number[] = D?.oot.pg ?? [], pgr: number[] = D?.oot.pgr ?? [];
  it("tamanho da janela OOT e defaults batem com meta e comparação DeLong", () => {
    expect(y.length).toBe(D.meta.n_oot);
    expect(y.reduce((s, v) => s + v, 0)).toBe(D.res.comparacao_auc.n_defaults);
  });
  it("logística OOT: AUC, KS, Brier, log loss e prevalência", () => {
    expect(auc(y, pl)).toBeCloseTo(D.res.logit_oot.auc, 3);
    expect(ks(y, pl).ks).toBeCloseTo(D.res.logit_oot.ks, 3);
    expect(brier(y, pl)).toBeCloseTo(D.res.logit_oot.brier, 4);
    expect(logloss(y, pl)).toBeCloseTo(D.res.logit_oot.logloss, 4);
    expect(pl.reduce((s, v) => s + v, 0) / pl.length).toBeCloseTo(D.res.logit_oot.pd_media, 4);
    expect(y.reduce((s, v) => s + v, 0) / y.length).toBeCloseTo(D.res.logit_oot.obs, 4);
  });
  // ACHADO DA AUDITORIA: em DADOS.oot, "pgr" é o boosting BRUTO e "pg" é o boosting RECALIBRADO (Platt),
  // ao contrário do que os nomes sugerem; o código do material usa essa convenção de forma consistente
  // (auc bruto = auc(y, pgr); capítulo 8 usa pgr como PD bruta). Documentado em docs/auditoria-tecnica.md.
  it("boosting bruto OOT (vetor pgr)", () => {
    expect(auc(y, pgr)).toBeCloseTo(D.res.gbm_raw_oot.auc, 3);
    expect(ks(y, pgr).ks).toBeCloseTo(D.res.gbm_raw_oot.ks, 3);
    expect(brier(y, pgr)).toBeCloseTo(D.res.gbm_raw_oot.brier, 4);
    expect(logloss(y, pgr)).toBeCloseTo(D.res.gbm_raw_oot.logloss, 4);
    expect(pgr.reduce((s, v) => s + v, 0) / pgr.length).toBeCloseTo(D.res.gbm_raw_oot.pd_media, 4);
  });
  it("boosting recalibrado (Platt) OOT (vetor pg): mesma ordenação, nível alterado", () => {
    expect(auc(y, pg)).toBeCloseTo(D.res.gbm_platt_oot.auc, 3);
    expect(brier(y, pg)).toBeCloseTo(D.res.gbm_platt_oot.brier, 4);
    expect(logloss(y, pg)).toBeCloseTo(D.res.gbm_platt_oot.logloss, 4);
    expect(pg.reduce((s, v) => s + v, 0) / pg.length).toBeCloseTo(D.res.gbm_platt_oot.pd_media, 4);
  });
  it("Platt: p_cal = sigmoide(a + b · logit(p_bruta)) reproduz o vetor recalibrado", () => {
    const { a, b } = D.platt;
    let maxErr = 0;
    for (let i = 0; i < pg.length; i++) maxErr = Math.max(maxErr, Math.abs(sigmoid(a + b * logit(pgr[i])) - pg[i]));
    expect(maxErr).toBeLessThan(2e-4);
  });
  it("diferença de AUC logística menos boosting (DeLong: diferença recalculada; erro padrão não recalculado)", () => {
    expect(auc(y, pl) - auc(y, pgr)).toBeCloseTo(D.res.comparacao_auc.diferenca, 3);
  });
  it("calibração por decis da logística: n, previsto, observado e Wilson", () => {
    const bins = calibration(y, pl, 10);
    expect(bins.length).toBe(D.calib.logit.length);
    bins.forEach((b, i) => {
      const ref = D.calib.logit[i];
      expect(b.n).toBe(ref.n);
      expect(b.prev).toBeCloseTo(ref.prev, 3);
      expect(b.obs).toBeCloseTo(ref.obs, 3);
      expect(b.lo).toBeCloseTo(ref.lo, 3);
      expect(b.hi).toBeCloseTo(ref.hi, 3);
    });
  });
  it("ganho acumulado por decil da logística: convenção por contagem (JS do material) versus tabela pré-calculada (Python)", () => {
    const g = gains(y, pl, 10);
    // ACHADO DA AUDITORIA: a tabela pré-calculada usa faixas por quantil do valor; a função JS usa contagem.
    // Diferem em um default no quinto decil (0,7778 contra 0,7901). Registrado em docs/auditoria-tecnica.md.
    const diffs = g.map((b, i) => Math.abs(b.cumPct - D.gains.logit[i].gains));
    expect(diffs.filter((d) => d > 5e-4).length).toBeLessThanOrEqual(1);
    expect(Math.max(...diffs)).toBeLessThan(0.013);
    expect(g[9].cumPct).toBe(1);
  });
  it("PSI do escore: soma faixa a faixa", () => {
    expect(psiFrom(D.psi.ref, D.psi.cur)).toBeCloseTo(D.psi.valor, 3);
  });
  it("intervalo de Wilson da prevalência OOT", () => {
    const k = y.reduce((s, v) => s + v, 0);
    const w = wilson(k, y.length);
    expect(w.p).toBeCloseTo(D.res.prevalencia.aprovados_oot, 4);
    expect(w.lo).toBeLessThan(w.p); expect(w.hi).toBeGreaterThan(w.p);
  });
});

describe("propriedades do núcleo", () => {
  it("AUC de ordenação perfeita é 1 e de aleatória é 0,5 em expectativa", () => {
    expect(auc([0, 0, 1, 1], [0.1, 0.2, 0.8, 0.9])).toBe(1);
    expect(auc([0, 1, 0, 1], [0.5, 0.5, 0.5, 0.5])).toBe(0.5);
  });
  it("Brier e log loss são zero para previsões perfeitas (com clip)", () => {
    expect(brier([0, 1], [0, 1])).toBe(0);
    expect(logloss([0, 1], [0, 1])).toBeLessThan(1e-10);
  });
});
