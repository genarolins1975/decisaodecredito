import { describe, expect, it } from "vitest";
import ref from "./fixtures/capitulo7-referencia.json";
import * as M from "@/lib/capitulo7/metricas";
import { CAL, MINI_PD, MINI_Y, PG, PGR, PL, PT, Y, CENARIOS, D, N } from "@/lib/capitulo7/dados";

/**
 * O núcleo numérico do capítulo 7 contra uma referência independente: scikit-learn, statsmodels e SciPy, rodados por
 * scripts/capitulo7/referencia.py. Os testes não repetem o próprio algoritmo: cada número vem da biblioteca de
 * terceiros. Os casos de borda (empates, classe ausente, faixa vazia, denominador zero) têm fixtures pequenas feitas
 * à mão, com o resultado conferido por contagem.
 */
const MOD = { pl: PL, pgr: PGR, pg: PG, pt: PT } as const;
const perto = (a: number | null, b: number, tol = 1e-9) => { expect(a).not.toBeNull(); expect(Math.abs((a as number) - b)).toBeLessThan(tol); };

describe("capítulo 7: métricas contra scikit-learn e statsmodels", () => {
  it("a base é a da janela fora do tempo: 737 propostas e 81 defaults", () => { expect(N).toBe(737); expect(D).toBe(81); });
  for (const [k, pd] of Object.entries(MOD)) {
    const r = ref.modelos[k as keyof typeof MOD];
    it(`${k}: AUC por pares igual a roc_auc_score e à área trapezoidal da ROC`, () => {
      perto(M.aucPorPares(Y, pd).auc, r.auc, 1e-12);
      perto(M.areaTrapezio(M.curvaRoc(Y, pd).map((p) => ({ x: p.fpr, y: p.tpr }))), r.auc, 1e-12);
    });
    it(`${k}: ROC com um ponto por limiar distinto, KS no mesmo limiar de roc_curve`, () => {
      expect(M.curvaRoc(Y, pd).length).toBe(r.ks.pontos);
      const k2 = M.ks(Y, pd); perto(k2.ks, r.ks.ks, 1e-12); expect(k2.limiar).toBe(r.ks.limiar);
    });
    it(`${k}: precisão média igual a average_precision_score`, () => perto(M.precisaoMedia(Y, pd), r.ap, 1e-12));
    it(`${k}: Brier e log loss iguais a brier_score_loss e log_loss`, () => { perto(M.brier(Y, pd), r.brier, 1e-12); perto(M.logLoss(Y, pd).valor, r.logloss, 1e-12); expect(M.logLoss(Y, pd).limitadas).toBe(0); });
    it(`${k}: intercepto e slope de calibração iguais ao GLM binomial do statsmodels`, () => {
      const s = M.interceptoESlope(Y, pd); perto(s.intercepto, r.intercepto, 1e-8); perto(s.slope, r.slope, 1e-8);
      perto(M.interceptoComSlope1(Y, pd), r.interceptoSlope1, 1e-8);
    });
    it(`${k}: decis de calibração com Wilson igual a proportion_confint`, () => {
      M.faixasQuantis(Y, pd, 10).forEach((f, j) => {
        const g = r.faixasDecis[j]; expect(f.n).toBe(g.n); expect(f.d).toBe(g.d); perto(f.pdMedia, g.pdMedia, 1e-12); perto(f.ic!.lo, g.lo, 1e-12); perto(f.ic!.hi, g.hi, 1e-12);
      });
    });
    it(`${k}: faixas uniformes iguais a calibration_curve(strategy="uniform"), sem faixa vazia virando zero`, () => {
      const f = M.faixasFixas(Y, pd, Array.from({ length: 11 }, (_, i) => i / 10)).filter((x) => x.n > 0);
      expect(f.map((x) => x.obs)).toHaveLength(r.faixasUniformes.obs.length);
      f.forEach((x, j) => { perto(x.obs, r.faixasUniformes.obs[j], 1e-12); perto(x.pdMedia, r.faixasUniformes.pdMedia[j], 1e-12); });
      expect(M.faixasFixas(Y, pd, Array.from({ length: 11 }, (_, i) => i / 10)).filter((x) => x.n === 0).every((x) => x.obs === null && x.ic === null)).toBe(true);
    });
    it(`${k}: matriz no corte de 12% igual a confusion_matrix, precision_score e recall_score`, () => {
      const c = M.confusao(Y, pd, 0.12); const g = r.corte12;
      expect([c.vp, c.fp, c.fn, c.vn]).toEqual([g.vp, g.fp, g.fn, g.vn]); perto(c.precisao, g.precisao, 1e-12); perto(c.sensibilidade, g.recall, 1e-12);
    });
    it(`${k}: ganho e lift nos 10% e 20% piores`, () => {
      for (const [q, g] of [[0.1, r.ganho10], [0.2, r.ganho20]] as const) { const x = M.ganho(Y, pd, q); expect(x.capturados).toBe(g.capturados); perto(x.ganho, g.ganho, 1e-12); perto(x.lift, g.lift, 1e-12); }
    });
    it(`${k}: arredondar a quatro casas cria empates e mexe na AUC`, () => {
      const r4 = M.arredondar(pd, 4); expect(M.valoresDistintos(r4)).toBe(r.valoresDistintos4casas); perto(M.aucPorPares(Y, r4).auc, r.auc4casas, 1e-12);
    });
  }
  it("mini-base: 75 pares, 60 corretos e 1 empate, AUC 0,8067 como roc_auc_score", () => {
    const c = M.aucPorPares(MINI_Y, MINI_PD); expect(c.pares).toBe(ref.mini.pares); expect(c.corretos).toBe(ref.mini.corretos); expect(c.empates).toBe(ref.mini.empates); perto(c.auc, ref.mini.auc, 1e-12);
    expect(M.paresDetalhados(MINI_Y, MINI_PD).filter((p) => p.estado === "empate")).toHaveLength(1);
  });
  it("Wilson igual a proportion_confint(method='wilson')", () => {
    for (const [k, [lo, hi]] of Object.entries(ref.wilson)) { const [d, n] = k.split("/").map(Number); const w = M.wilson(d, n)!; perto(w.lo, lo, 1e-12); perto(w.hi, hi, 1e-12); }
  });
  for (const nome of ["pgr", "pl"] as const) {
    const c = ref.calibracao[nome]; const pd = MOD[nome]; const pc = CAL.indices.map((i) => pd[i]);
    it(`${nome}: intercepto e Platt estimados na amostra de calibração iguais ao statsmodels; isotônica igual ao IsotonicRegression`, () => {
      const a = M.ajustarIntercepto(CAL.y, pc); perto(a, c.intercepto, 1e-8);
      const p = M.ajustarPlatt(CAL.y, pc); perto(p.a, c.plattA, 1e-8); perto(p.b, c.plattB, 1e-8);
      const iso = M.ajustarIsotonica(pc, CAL.y); const q = M.aplicarIsotonica(iso, pd);
      expect(iso.x.length).toBe(c.isotonicaBlocos); q.slice(0, 12).forEach((v, i) => perto(v, c.isotonicaAmostra[i], 1e-12));
      perto(M.aucPorPares(Y, q).auc, c.apos.isotonica.auc, 1e-12); perto(M.brier(Y, q), c.apos.isotonica.brier, 1e-12); expect(M.valoresDistintos(q)).toBe(c.apos.isotonica.distintos);
      const isoP = M.ajustarIsotonica(pc.slice(0, CAL.nPequena), CAL.y.slice(0, CAL.nPequena)); expect(isoP.x.length).toBe(c.isotonicaPequenaBlocos);
      perto(M.aucPorPares(Y, M.aplicarIsotonica(isoP, pd)).auc, c.apos.isotonicaPequena.auc, 1e-12);
      const tp = M.transformar(pd, p.a, p.b); perto(M.aucPorPares(Y, tp).auc, c.apos.platt.auc, 1e-12); perto(M.media(tp), c.apos.platt.pdMedia, 1e-9);
      const ti = M.transformar(pd, a, 1); perto(M.media(ti), c.apos.intercepto.pdMedia, 1e-9); perto(M.logLoss(Y, ti).valor, c.apos.intercepto.logloss, 1e-9);
    });
  }
  it("reamostragem pareada com a mesma semente reproduz os quantis da referência", () => {
    const b = M.bootstrapPareado(Y, PL, PGR, 1000, 20260501); expect(b.dif.length).toBe(ref.bootstrap.replicas);
    const s = b.dif.slice().sort((x, y) => x - y); perto(M.quantil(s, 0.025), ref.bootstrap.difQ025, 1e-12); perto(M.quantil(s, 0.975), ref.bootstrap.difQ975, 1e-12);
  });
  it("DeLong igual ao algoritmo de Sun e Xu e ao resultado do gerador do curso", () => {
    const d = M.delong(Y, PL, PGR); const r = ref.delong;
    perto(d.dif, r.dif, 1e-12); perto(d.ep, r.ep, 1e-10); perto(d.z, r.z, 1e-8); perto(d.p, r.p, 1e-6); perto(d.ep1, r.ep1, 1e-10);
    expect(Math.round(d.dif * 1e4) / 1e4).toBe(ref.delongGerador.diferenca); expect(Math.round(d.ep * 1e4) / 1e4).toBe(ref.delongGerador.erro_padrao);
    expect(Math.round(d.p * 1e4) / 1e4).toBe(ref.delongGerador.p_valor);
  });
});

describe("capítulo 7: casos de borda definidos", () => {
  it("empate vale meio ponto; inversão vale zero; todos os casos à mão", () => {
    const c = M.aucPorPares([1, 0, 1, 0], [0.3, 0.3, 0.1, 0.2]); // pares: (0,3 x 0,3) empate, (0,3 x 0,2) certo, (0,1 x 0,3) inv, (0,1 x 0,2) inv
    expect([c.corretos, c.empates, c.invertidos, c.pares]).toEqual([1, 1, 2, 4]); expect(c.auc).toBe(0.375);
  });
  it("sem uma das classes não existe AUC, ganho nem precisão média", () => {
    expect(M.aucPorPares([0, 0, 0], [0.1, 0.2, 0.3]).auc).toBeNull(); expect(M.precisaoMedia([0, 0], [0.1, 0.2])).toBeNull(); expect(M.ganho([0, 0], [0.1, 0.2], 0.5).ganho).toBeNull();
  });
  it("cortes extremos: ninguém recusado e todos recusados, com denominadores nulos declarados", () => {
    const zero = M.confusao(Y, PL, 1.01); expect(zero.vp + zero.fp).toBe(0); expect(zero.precisao).toBeNull(); expect(zero.sensibilidade).toBe(0); expect(zero.acuracia).toBeCloseTo(656 / 737, 12);
    const todos = M.confusao(Y, PL, 0); expect(todos.fn + todos.vn).toBe(0); expect(todos.defaultAprovados).toBeNull(); expect(todos.precisao).toBeCloseTo(81 / 737, 12);
  });
  it("faixa vazia e Wilson sem casos devolvem null, nunca taxa zero", () => {
    expect(M.wilson(0, 0)).toBeNull(); const f = M.faixasFixas([1, 0], [0.05, 0.06], [0, 0.1, 0.2]); expect(f[1].n).toBe(0); expect(f[1].obs).toBeNull();
    expect(M.wilson(0, 20)!.lo).toBe(0); expect(M.wilson(0, 20)!.hi).toBeGreaterThan(0.15);
  });
  it("transformação estritamente crescente preserva a AUC; a isotônica cria empates", () => {
    const a = M.aucPorPares(Y, PL).auc!; for (const [x, b] of [[-2, 0.3], [0.8, 1], [0, 2.5]]) perto(M.aucPorPares(Y, M.transformar(PL, x, b)).auc, a, 1e-12);
    expect(M.aucPorPares(Y, M.transformar(PL, 0, -1)).auc).toBeCloseTo(1 - a, 12);
  });
  it("cenários: fila embaralhada mantém a média e perde a ordenação; deslocamento mantém a ordenação e muda a média", () => {
    perto(M.media(CENARIOS.filaFracaMediaCerta), M.media(PL)!, 1e-12); expect(M.aucPorPares(Y, CENARIOS.filaFracaMediaCerta).auc!).toBeLessThan(0.55);
    perto(M.aucPorPares(Y, CENARIOS.filaBoaNivelErrado).auc, M.aucPorPares(Y, PL).auc!, 1e-12); expect(M.media(CENARIOS.filaBoaNivelErrado)!).toBeGreaterThan(0.18);
  });
  it("log loss limita a previsão em 0 ou 1 e conta os casos limitados", () => {
    const r = M.logLoss([1, 0], [0, 1]); expect(r.limitadas).toBe(2); expect(r.valor).toBeCloseTo(-Math.log(M.EPS_LOG), 6);
  });
  it("decomposição de Murphy: as parcelas somam o Brier mais o resíduo das faixas", () => {
    const f = M.faixasQuantis(Y, PL, 10); const d = M.decomposicaoBrier(Y, PL, f);
    perto(d.confiabilidade - d.resolucao + d.incerteza + d.residuo, M.brier(Y, PL), 1e-15); perto(d.incerteza, (81 / 737) * (656 / 737), 1e-15);
    const constante = M.faixasQuantis([1, 0, 0, 1], [0.2, 0.2, 0.6, 0.6], 2); perto(M.decomposicaoBrier([1, 0, 0, 1], [0.2, 0.2, 0.6, 0.6], constante).residuo, 0, 1e-15);
  });
  it("CORP: isotônica na própria amostra e decomposição MCB, DSC, UNC iguais às do scikit-learn", () => {
    for (const k of ["pl", "pgr"] as const) {
      const c = M.corp(Y, MOD[k]), r = ref.corp[k];
      expect(c.blocos).toBe(r.blocos); perto(c.bs, r.bs, 1e-12); perto(c.bsRc, r.bsRc, 1e-12); perto(c.mcb, r.mcb, 1e-12); perto(c.dsc, r.dsc, 1e-12); perto(c.unc, r.unc, 1e-12);
      c.recalibrada.slice(0, 12).forEach((v, i) => perto(v, r.amostra[i], 1e-12)); perto(c.mcb - c.dsc + c.unc, c.bs, 1e-15);
    }
  });
  it("Jeffreys: p-valor igual a scipy.stats.beta.cdf nos decis da logística e em casos de borda", () => {
    M.faixasQuantis(Y, PL, 10).forEach((f, i) => perto(M.jeffreys(f.d, f.n, f.pdMedia!), ref.jeffreysDecis[i], 1e-10));
    for (const [k, v] of Object.entries(ref.jeffreysCasos)) { const [d, n, p] = k.split("/").map(Number); perto(M.jeffreys(d, n, p), v, 1e-10); }
  });
  it("normal: Φ(1,96) e o p bilateral de z = 1,967 batem com scipy", () => { perto(M.normalCdf(M.Z95), 0.975, 2e-7); perto(2 * (1 - M.normalCdf(1.9667935304518058)), 0.049207018740550584, 2e-7); });
});
