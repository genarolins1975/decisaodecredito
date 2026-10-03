import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { acertoComCorrelacao, acertoDaMaioria, aucBinormal, aucHistograma, arvoreRegressao, avaliaCorte, boosting, confusaoNoIndice, confusaoNoLimiar, cruzamentoBinormal, curvaPorLimiar, foraDaAmostra, gini, limiarDeMenorCusto, mediaHarmonica, metricas, Phi, PhiInv, preve, tprBinormal, type Regra } from "@/lib/capitulo12/metricas";
import { ACERTOS_LUAS, BOOST, CASO, CV, HIST, HIST_RF, INDICE_ZERO, LUAS, M_SGD, M_TRIVIAL } from "@/lib/capitulo12/dados";

/**
 * Biblioteca do capítulo 12 conferida contra scikit-learn, SciPy e NumPy (tests/fixtures/capitulo12-referencia.json,
 * gerado por scripts/capitulo12/referencia.py, com as versões das bibliotecas gravadas no próprio arquivo).
 */
const REF = JSON.parse(fs.readFileSync(path.join(process.cwd(), "tests/fixtures/capitulo12-referencia.json"), "utf8"));
const perto = (a: number | null, b: number, tol = 1e-6) => expect(Math.abs((a ?? NaN) - b)).toBeLessThan(tol);

describe("MNIST: detector de 5", () => {
  it("matriz da validação cruzada e as quatro métricas como no scikit-learn", () => {
    perto(M_SGD.acuracia, REF.mnist.acuracia); perto(M_SGD.precisao, REF.mnist.precisao); perto(M_SGD.recall, REF.mnist.recall); perto(M_SGD.f1, REF.mnist.f1);
    perto(M_TRIVIAL.acuracia, REF.mnist.trivial);
    expect(M_TRIVIAL.precisao).toBeNull(); expect(M_TRIVIAL.recall).toBe(0);
    expect(M_SGD.n).toBe(60000); expect(M_SGD.positivos).toBe(5421);
  });
  it("o limiar zero do histograma reproduz a matriz da validação cruzada", () => {
    expect(INDICE_ZERO).toBeGreaterThan(0);
    expect(confusaoNoIndice(HIST, INDICE_ZERO)).toEqual(CV);
  });
  it("precisão e recall em limiares do histograma iguais aos do scikit-learn", () => {
    for (const l of REF.mnist.limiares) {
      const c = confusaoNoLimiar(HIST, l.t); const m = metricas(c);
      expect(c.vp, `t=${l.t}`).toBe(l.vp); expect(c.fp, `t=${l.t}`).toBe(l.fp);
      perto(m.precisao ?? 0, l.precisao); perto(m.recall, l.recall);
    }
  });
  it("AUC pelo histograma a menos de 0,001 da AUC exata, nos dois modelos", () => {
    expect(Math.abs(aucHistograma(HIST) - REF.mnist.auc)).toBeLessThan(1e-3);
    expect(Math.abs(aucHistograma(HIST_RF) - REF.mnist.aucFloresta)).toBeLessThan(1e-3);
  });
  it("curva por limiar: recall nunca sobe quando o limiar sobe", () => {
    const c = curvaPorLimiar(HIST);
    for (let i = 1; i < c.length; i++) expect(c[i].recall).toBeLessThanOrEqual(c[i - 1].recall);
    expect(c[0].recall).toBe(1); expect(c[c.length - 1].vp).toBe(0);
  });
  it("limiar de menor custo: custo nunca maior que o do limiar zero", () => {
    for (const [cfn, cfp] of [[1, 1], [5, 1], [1, 5], [20, 1]]) {
      const m = limiarDeMenorCusto(HIST, cfn, cfp); const z = confusaoNoIndice(HIST, INDICE_ZERO);
      expect(m.custo).toBeLessThanOrEqual(cfn * z.fn + cfp * z.fp);
    }
  });
  it("Gini é 2 × AUC − 1 e a média harmônica pune o desequilíbrio", () => {
    perto(gini(0.8), 0.6); perto(gini(0.5), 0);
    perto(mediaHarmonica(1, 0.01), 2 * 0.01 / 1.01);
  });
});

describe("voto por maioria, binormal e bootstrap", () => {
  it("acerto da maioria igual a binom.sf do SciPy", () => {
    for (const b of REF.binomial) perto(acertoDaMaioria(b.n, b.p), b.maioria, 2e-6);
  });
  it("com erros perfeitamente correlacionados, o conjunto vale um classificador", () => {
    perto(acertoComCorrelacao(1001, 0.51, 1), 0.51); perto(acertoComCorrelacao(1001, 0.51, 0), acertoDaMaioria(1001, 0.51));
  });
  it("Φ, Φ⁻¹, TPR e AUC binormais iguais a scipy.stats.norm", () => {
    for (const b of REF.binormal) {
      perto(aucBinormal(b.a, b.b), b.auc, 1e-6);
      [0.01, 0.1, 0.29, 0.5, 0.9].forEach((f, i) => perto(tprBinormal(b.a, b.b, f), b.tpr[i], 2e-6));
    }
    perto(PhiInv(Phi(1.2345)), 1.2345, 1e-7);
    const [a, bb] = REF.binormal;
    const f = cruzamentoBinormal(a.a, a.b, bb.a, bb.b);
    perto(tprBinormal(a.a, a.b, f), tprBinormal(bb.a, bb.b, f), 1e-9);
  });
  it("(1 − 1/m)^m como NumPy", () => { for (const r of REF.fora) perto(foraDaAmostra(r.m), r.fora); });
});

describe("luas, boosting e caso de crédito", () => {
  it("acertos das previsões gravadas iguais à acurácia do scikit-learn", () => {
    for (const [k, acc] of Object.entries(REF.luas as Record<string, number>)) expect(ACERTOS_LUAS[k as keyof typeof ACERTOS_LUAS] / LUAS.teste.y.length, k).toBeCloseTo(acc, 6);
  });
  it("árvore de profundidade 2 e boosting de três árvores iguais ao DecisionTreeRegressor", () => {
    const xs = Array.from({ length: 201 }, (_, i) => -0.5 + i * 0.005);
    const b = boosting(BOOST.x, BOOST.y, 3, 1);
    xs.forEach((x, i) => {
      for (let m = 0; m < 3; m++) perto(preve(b.arvores[m], x), BOOST.h[m][i], 2e-6);
      perto(b.preve(x), BOOST.sklearn3[i], 5e-6);
    });
    b.mse.forEach((v, i) => perto(v, REF.boosting.mse[i], 2e-6));
    const t = arvoreRegressao(BOOST.x, BOOST.y, 2); perto(preve(t, 0), BOOST.h[0][100], 2e-6);
  });
  it("boosting com taxa 0,5 e dez árvores igual ao GradientBoostingRegressor(init='zero')", () => {
    const b = boosting(BOOST.x, BOOST.y, 10, 0.5);
    Array.from({ length: 201 }, (_, i) => -0.5 + i * 0.005).forEach((x, i) => perto(b.preve(x), BOOST.sklearn10_lr05[i], 5e-6));
  });
  it("precisão, recall, volume, WoE e IV das regras de corte como no scikit-learn e NumPy", () => {
    for (const prazo of ["curto", "longo"] as const) for (const [k, r] of Object.entries(CASO[prazo].regras)) {
      const a = avaliaCorte(r as unknown as Regra), e = REF.caso[prazo][k];
      perto(a.precisao, e.precisao); perto(a.recall, e.recall); perto(a.volume, e.volume); perto(a.mausNoResto, e.resto);
      perto(a.woe[0], e.woe[0]); perto(a.woe[1], e.woe[1]); perto(a.iv, e.iv);
      // o IV impresso no material arredonda o calculado
      expect(Math.abs(a.iv - a.ivDeclarado), `${prazo}.${k}`).toBeLessThan(0.0015);
    }
    const c = avaliaCorte(CASO.curto.regras.politica as unknown as Regra);
    expect(c.contratos).toBe(82458); expect(c.maus).toBe(5865); expect(c.semClassificacao).toBe(0);
    expect(avaliaCorte(CASO.longo.regras.politica as unknown as Regra).semClassificacao).toBe(425);
  });
});
