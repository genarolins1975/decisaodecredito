import { describe, expect, it } from "vitest";
import { ATALHOS, escore, fmt, fmtPct, formula, leitura, linhas, maiores, media, perdaDaProbabilidade, perdaDoLogit, proposta, PROPOSTAS, SELECAO_INICIAL, sigmoide } from "@/lib/visuais/log-loss";

describe("c4p15: a log loss proposta a proposta", () => {
  it("usa as 16 propostas da base do capítulo, na ordem original", () => {
    expect(PROPOSTAS).toHaveLength(16);
    expect(linhas().map((l) => l.id)).toEqual(Array.from({ length: 16 }, (_, i) => i + 1));
    expect(proposta(2)).toMatchObject({ util: 25, atraso: 20, y: 1 });
    expect(proposta(15)).toMatchObject({ util: 90, atraso: 0, y: 0 });
  });

  it("a proposta 2 reproduz a PD e a perda da referência", () => {
    const l = proposta(2);
    expect(fmtPct(l.pd)).toBe("26,65%");
    expect(fmt(l.perda, 4)).toBe("1,3223");
    expect(l.pObservado).toBe(l.pd);
    expect(formula(l).regra).toBe("Perda = −ln(PD)");
    expect(leitura(l)).toContain("Houve default");
  });

  it("numa proposta sem default a probabilidade do desfecho é 1 − PD", () => {
    const l = proposta(15);
    expect(l.y).toBe(0);
    expect(fmtPct(l.pd)).toBe("73,91%");
    expect(l.pObservado).toBeCloseTo(1 - l.pd, 15);
    expect(fmt(l.perda, 4)).toBe("1,3435");
    expect(formula(l).regra).toBe("Perda = −ln(1 − PD)");
    expect(leitura(l)).toContain("Não houve default");
  });

  it("a forma pelo logit e a forma pela probabilidade coincidem em valores moderados", () => {
    for (const l of linhas()) expect(l.perda).toBeCloseTo(perdaDaProbabilidade(l.pd, l.y), 10);
  });

  it("a forma pelo logit continua estável em logits extremos", () => {
    for (const z of [-800, -40, 0, 40, 800]) for (const y of [0, 1]) {
      const v = perdaDoLogit(z, y);
      expect(Number.isFinite(v)).toBe(true); expect(v).toBeGreaterThanOrEqual(0);
    }
    expect(perdaDoLogit(-800, 1)).toBeCloseTo(800, 6);
    expect(Number.isFinite(perdaDaProbabilidade(sigmoide(-800), 1))).toBe(false); // a forma pela probabilidade satura
    expect(perdaDoLogit(0, 1)).toBeCloseTo(Math.LN2, 12);
  });

  it("a média é a soma das perdas dividida por 16", () => {
    const ls = linhas();
    expect(media(ls)).toBeCloseTo(ls.reduce((s, l) => s + l.perda, 0) / 16, 15);
    expect(fmt(media(ls), 5)).toBe("0,43282");
  });

  it("para y = 1 mais probabilidade reduz a perda; para y = 0 aumenta", () => {
    for (const p of [0.1, 0.3, 0.6, 0.9]) {
      const z = Math.log(p / (1 - p)), z2 = Math.log((p + 0.05) / (1 - p - 0.05));
      expect(perdaDoLogit(z2, 1)).toBeLessThan(perdaDoLogit(z, 1));
      expect(perdaDoLogit(z2, 0)).toBeGreaterThan(perdaDoLogit(z, 0));
    }
  });

  it("as três maiores perdas e a participação delas são derivadas, não fixadas", () => {
    const m = maiores();
    expect(m.ids).toEqual([15, 2, 10]);
    expect(fmt(m.participacao, 1)).toBe("55,6");
    expect(m.total).toBeCloseTo(media() * 16, 12);
  });

  it("o escore de cada proposta vem dos coeficientes da aula", () => {
    const l = proposta(11);
    expect(escore(l)).toBeCloseTo(0.24828, 5);
    expect(fmtPct(l.pd)).toBe("56,18%");
    expect(SELECAO_INICIAL).toBe(2);
    for (const a of ATALHOS) expect(PROPOSTAS.some((p) => p.id === a)).toBe(true);
  });
});
