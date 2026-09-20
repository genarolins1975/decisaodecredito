import { describe, expect, it } from "vitest";
import { aplicar, BETA_ZERO, estado, ETA, fmt, fmt5, fmtAtualizacao, fmtPct, mediaContrib, passo, PROPOSTAS } from "@/lib/visuais/gradiente-passo";

describe("c4p16: uma iteração da descida de gradiente", () => {
  it("em zero todas as propostas recebem PD de 50% e a perda é ln(2)", () => {
    const e = estado(BETA_ZERO);
    expect(e.mesmaPd).toBeCloseTo(0.5, 15);
    expect(fmtPct(e.mesmaPd!)).toBe("50,00%");
    expect(e.perda).toBeCloseTo(Math.LN2, 12);
    expect(fmt5(e.perda)).toBe("0,69315");
    expect(e.pd).toHaveLength(16);
  });

  it("o gradiente inicial reproduz os valores da referência", () => {
    const e = estado(BETA_ZERO);
    expect(fmt5(e.g[0])).toBe("0,00000");
    expect(fmt5(e.g[1])).toBe("−0,59375");
    expect(fmt5(e.g[2])).toBe("−0,23438");
    expect(e.g[1]).toBeCloseTo(-0.59375, 12);
    expect(e.g[2]).toBeCloseTo(-0.234375, 12);
  });

  it("g₁ é exatamente a média das 16 contribuições do gráfico", () => {
    const e = estado(BETA_ZERO);
    expect(e.contribG1).toHaveLength(16);
    expect(mediaContrib(e)).toBeCloseTo(e.g[1], 15);
    expect(e.contribG1.reduce((s, v) => s + v, 0) / 16).toBeCloseTo(e.g[1], 15);
    for (let i = 0; i < 16; i++) expect(e.contribG1[i]).toBeCloseTo(e.residuos[i] * (PROPOSTAS[i].util / 10), 15);
  });

  it("a atualização é −ηg e tem sinal oposto ao gradiente", () => {
    const e = estado(BETA_ZERO);
    const ls = passo(e);
    expect(ls.map((l) => l.rotulo)).toEqual(["β₀ · Intercepto", "β₁ · Utilização", "β₂ · Atraso"]);
    for (const l of ls) {
      expect(l.atualizacao).toBeCloseTo(-ETA * l.g, 15);
      expect(l.seguinte).toBeCloseTo(l.atual + l.atualizacao, 15);
      if (l.g !== 0) expect(Math.sign(l.atualizacao)).toBe(-Math.sign(l.g));
    }
    expect(fmt5(ls[1].atualizacao, true)).toBe("+0,05938");
    expect(fmt5(ls[2].atualizacao, true)).toBe("+0,02344");
    expect(fmt5(ls[1].seguinte)).toBe("0,05938");
    expect(fmt5(ls[2].seguinte)).toBe("0,02344");
    expect(fmtAtualizacao(ls[0].atualizacao)).toBe("0,00000"); // zero não recebe sinal
  });

  it("os três parâmetros andam juntos, a partir do mesmo estado", () => {
    const e = estado(BETA_ZERO);
    const novo = aplicar(e);
    expect(novo).toHaveLength(3);
    for (let i = 0; i < 3; i++) expect(novo[i]).toBeCloseTo(e.beta[i] - ETA * e.g[i], 15);
    expect(novo[1]).toBeCloseTo(0.059375, 12);
    expect(novo[2]).toBeCloseTo(0.0234375, 12);
  });

  it("a iteração reduz a perda média", () => {
    const antes = estado(BETA_ZERO);
    const depois = estado(aplicar(antes));
    expect(depois.perda).toBeLessThan(antes.perda);
    expect(fmt5(depois.perda)).toBe("0,67194");
    expect(depois.mesmaPd).toBeNull(); // as PDs deixam de ser iguais
  });

  it("iterações sucessivas continuam reduzindo a perda", () => {
    let b = BETA_ZERO as readonly [number, number, number];
    let anterior = Infinity;
    for (let i = 0; i < 25; i++) { const e = estado(b); expect(e.perda).toBeLessThan(anterior); anterior = e.perda; b = aplicar(e); }
  });

  it("a exibição usa cinco casas e vírgula decimal", () => {
    expect(fmt5(0)).toBe("0,00000");
    expect(fmt5(-0.59375)).toBe("−0,59375");
    expect(fmt(ETA, 2)).toBe("0,10");
  });
});
