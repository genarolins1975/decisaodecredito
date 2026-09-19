import { describe, expect, it } from "vitest";
import { arredondar, cenarios, efeitoCoeficiente, fmt, fmtPct, fmtPp, interpretarPd, pdNova, proposta } from "../src/lib/visuais/logit-slides";

describe("abertura do capítulo 4 em dois quadros (c4p1)", () => {
  it("quadro 1: 70% e 5 dias dão −5,6666, +5,2171, +0,6978, z ≈ 0,2483 e PD 56,18%, com a soma em precisão integral", () => {
    const p = proposta(70, 5);
    expect(p.x1).toBe(7); expect(p.x2).toBe(0.5);
    expect(p.parcelas.map((q) => fmt(q.valor, 4, true))).toEqual(["−5,6666", "+5,2171", "+0,6978"]);
    expect(fmt(p.z, 4)).toBe("0,2483"); expect(p.z).toBeCloseTo(-5.66657 + 0.7453 * 7 + 1.3955 * 0.5, 12); expect(fmtPct(p.pd)).toBe("56,18%");
    expect(p.z).not.toBeCloseTo(-5.6666 + 5.2171 + 0.6978, 12); // não soma valores arredondados
    expect(p.foraDaJanela).toBeNull(); expect(interpretarPd(p.pd)).toContain("cerca de 56 defaults a cada 100");
  });
  it("arredondamento decimal meio para cima: 1,3955 × 0,5 = 0,69775 → 0,6978; formatos com sinal, % e pp", () => {
    expect(arredondar(1.3955 * 0.5, 4)).toBe(0.6978); expect(arredondar(-5.66657, 4)).toBe(-5.6666); expect(arredondar(2.5, 0)).toBe(3);
    expect(fmt(-0.7453, 4, true)).toBe("−0,7453"); expect(fmt(0, 4, true)).toBe("0,0000"); expect(fmtPp(2.1234)).toBe("+2,12 pp"); expect(fmtPp(-4.99)).toBe("−4,99 pp");
  });
  it("extremos das características: 0% e 0 dias, 100% e 30 dias; sinalização fora da janela de z", () => {
    const min = proposta(0, 0); expect(fmt(min.z, 4)).toBe("−5,6666"); expect(fmtPct(min.pd)).toBe("0,34%"); expect(min.foraDaJanela).toBeNull();
    const max = proposta(100, 30); expect(max.z).toBeCloseTo(-5.66657 + 7.453 + 4.1865, 10); expect(fmtPct(max.pd)).toBe("99,75%"); expect(max.foraDaJanela).toBeNull();
    expect(proposta(200, 0).foraDaJanela).toBe("direita"); expect(proposta(-20, 0).foraDaJanela).toBe("esquerda");
  });
  it("quadro 2: +10 pp somam 0,7453 em z e multiplicam as odds por 2,11; −10 pp dividem; 0 não muda", () => {
    const mais = efeitoCoeficiente(10); expect(mais.dz).toBeCloseTo(0.7453, 12); expect(fmt(mais.m, 2)).toBe("2,11"); expect(mais.m).toBeCloseTo(Math.exp(0.7453), 12);
    const menos = efeitoCoeficiente(-10); expect(menos.dz).toBeCloseTo(-0.7453, 12); expect(fmt(menos.m, 2)).toBe("0,47"); expect(menos.m * mais.m).toBeCloseTo(1, 12);
    const zero = efeitoCoeficiente(0); expect(zero.m).toBe(1); expect(cenarios(0).every((c) => c.semMudanca)).toBe(true);
    expect(efeitoCoeficiente(20).dz).toBeCloseTo(1.4906, 12); expect(fmt(efeitoCoeficiente(20).m, 2)).toBe("4,44");
  });
  it("as quatro réguas com +10 pp: 2% → 4,12%, 10% → 18,97%, 50% → 67,82%, 90% → 94,99%, geradas pelo cálculo", () => {
    const c = cenarios(10);
    expect(c.map((l) => fmtPct(l.p0))).toEqual(["2,00%", "10,00%", "50,00%", "90,00%"]);
    expect(c.map((l) => fmtPct(l.p1))).toEqual(["4,12%", "18,97%", "67,82%", "94,99%"]);
    expect(c.map((l) => fmtPp(l.deltaPp))).toEqual(["+2,12 pp", "+8,97 pp", "+17,82 pp", "+4,99 pp"]);
    for (const l of c) { const m = Math.exp(0.7453); expect(l.p1).toBeCloseTo((m * l.p0) / (1 - l.p0 + m * l.p0), 12); const z0 = Math.log(l.p0 / (1 - l.p0)); expect(l.p1).toBeCloseTo(1 / (1 + Math.exp(-(z0 + 0.7453))), 12); }
    expect(pdNova(0.5, 2)).toBeCloseTo(2 / 3, 12);
    const volta = cenarios(-10); expect(fmtPp(volta[2].deltaPp)).toBe("−17,82 pp"); // de 50%, −10 pp desfaz exatamente o que +10 pp faz
    for (const l of volta) expect(l.p1).toBeCloseTo(pdNova(l.p0, Math.exp(-0.7453)), 12); expect(volta.every((l) => l.deltaPp < 0)).toBe(true);
  });
});
