import { describe, expect, it } from "vitest";
import ref from "./fixtures/capitulo6-referencia.json";
import base from "@/lib/capitulo6/base.json";
import * as G from "@/lib/capitulo6/gbm";

/**
 * O gradient boosting do capítulo 6 contra o GradientBoostingClassifier do scikit-learn e o TreeExplainer do shap,
 * rodados por scripts/capitulo6/referencia.py. A restrição monotônica não existe nesse estimador do scikit-learn: é
 * conferida por propriedade (a PD nunca cai quando a variável restrita sobe).
 */
const X = (d: { util: number[]; atr: number[]; sc: number[] }) => d.util.map((_, i) => [d.util[i], d.atr[i], d.sc[i]]);
const XA = X(base.ajuste), XV = X(base.validacao), XO = X(base.oot);
const perto = (a: number, b: number, tol = 1e-9) => expect(Math.abs(a - b)).toBeLessThan(tol);
type Arv = { folha: boolean; valor?: number; n: number; variavel?: number; corte?: number; esq?: Arv; dir?: Arv };
const mesmaArvore = (a: G.No, b: Arv) => {
  expect(a.folha).toBe(b.folha); expect(a.n).toBe(b.n);
  if (a.folha) perto(a.valor, b.valor!, 1e-9);
  else { expect(a.variavel).toBe(b.variavel); perto(a.corte, b.corte!, 1e-9); mesmaArvore(a.esq, b.esq!); mesmaArvore(a.dir, b.dir!); }
};

describe("capítulo 6: gradient boosting contra o scikit-learn", () => {
  for (const [nome, r] of Object.entries(ref.modelos)) {
    const c = r.cfg as { learning_rate: number; n_estimators: number; max_depth: number; min_samples_leaf: number };
    const mod = G.ajustar(XA, base.ajuste.y, { eta: c.learning_rate, arvores: c.n_estimators, profundidade: c.max_depth, minFolha: c.min_samples_leaf });
    it(`${nome}: palpite inicial e as três primeiras árvores iguais às do scikit-learn`, () => {
      perto(mod.f0, r.f0, 1e-12); r.arvores.forEach((a, k) => mesmaArvore(mod.arvores[k], a as Arv));
    });
    it(`${nome}: log odds por estágio em ajuste, validação e janela iguais a staged_decision_function`, () => {
      const ea = G.estagios(mod, XA), ev = G.estagios(mod, XV), eo = G.estagios(mod, XO);
      for (const k of r.marcos) {
        (r.ajusteAmostra as Record<string, number[]>)[k].forEach((v, i) => perto(ea[k][i], v, 1e-9));
        (r.validacaoAmostra as Record<string, number[]>)[k].forEach((v, i) => perto(ev[k][i], v, 1e-9));
        (r.ootAmostra as Record<string, number[]>)[k].forEach((v, i) => perto(eo[k][i], v, 1e-9));
        const a = (r.auc as Record<string, Record<string, number>>)[k], l = (r.logloss as Record<string, Record<string, number>>)[k];
        perto(G.auc(base.ajuste.y, ea[k]), a.ajuste, 1e-12); perto(G.auc(base.validacao.y, ev[k]), a.validacao, 1e-12); perto(G.auc(base.oot.y, eo[k]), a.oot, 1e-12);
        perto(G.perdaLog(ea[k], base.ajuste.y), l.ajuste, 1e-9); perto(G.perdaLog(ev[k], base.validacao.y), l.validacao, 1e-9); perto(G.perdaLog(eo[k], base.oot.y), l.oot, 1e-9);
      }
    });
    if ("shap" in r) it(`${nome}: contribuições por variável iguais às do shap.TreeExplainer e somando o escore`, () => {
      const s = r.shap as { base: number; phi: number[][]; escore: number[] };
      XO.slice(0, 10).forEach((x, i) => {
        const c2 = G.contribuicoes(mod, x); perto(c2.base, s.base, 1e-9); c2.phi.forEach((v, j) => perto(v, s.phi[i][j], 1e-9));
        perto(c2.base + c2.phi.reduce((a, b) => a + b, 0), G.escore(mod, x), 1e-9); perto(G.escore(mod, x), s.escore[i], 1e-9);
      });
    });
  }
  it("restrição monotônica: com utilização e atraso restritos a não reduzir a PD, a dependência parcial não cai", () => {
    const mod = G.ajustar(XA, base.ajuste.y, { eta: 0.1, arvores: 60, profundidade: 3, minFolha: 20, monotonia: [1, 1, -1] });
    for (const v of [0, 1, 2]) {
      const xs = [...new Set(XA.map((x) => x[v]))].sort((a, b) => a - b); const grade = xs.filter((_, i) => i % Math.ceil(xs.length / 40) === 0);
      const dp = G.dependenciaParcial(mod, XA.slice(0, 200), v, grade);
      for (let i = 1; i < dp.length; i++) (v === 2 ? expect(dp[i]).toBeLessThanOrEqual(dp[i - 1] + 1e-12) : expect(dp[i]).toBeGreaterThanOrEqual(dp[i - 1] - 1e-12));
    }
    // e por proposta: subir só a variável restrita nunca reduz a PD
    for (const x of XA.slice(0, 100)) { const z = x.slice(); z[0] += 10; expect(G.pd(mod, z)).toBeGreaterThanOrEqual(G.pd(mod, x) - 1e-12); }
  });
  it("subamostra com semente: reprodutível e diferente do ajuste com todas as propostas", () => {
    const o = { eta: 0.1, arvores: 20, profundidade: 2, minFolha: 40, subamostra: 0.5, semente: 20260602 };
    const a = G.ajustar(XA, base.ajuste.y, o), b = G.ajustar(XA, base.ajuste.y, o), c = G.ajustar(XA, base.ajuste.y, { ...o, subamostra: 1 });
    expect(G.escore(a, XV[0])).toBe(G.escore(b, XV[0])); expect(G.escore(a, XV[0])).not.toBe(G.escore(c, XV[0]));
  });
});
