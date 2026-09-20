import { describe, expect, it } from "vitest";
import { ALTERNATIVAS, alternativa, BETA1, CASO, contas, demonstracao, escore, fmt, fmtPct, fmtPp, sigmoide, SITUACAO } from "@/lib/visuais/coeficiente-pd";

describe("c4p10: a leitura do coeficiente", () => {
  it("o enunciado é o caso fixo de 70% para 80% com o atraso mantido", () => {
    expect(CASO).toEqual({ utilDe: 70, utilPara: 80, atraso: 5 });
    expect(SITUACAO.map((s) => [s.v, s.n])).toEqual([
      ["70% → 80%", "Variação: +10 pp"],
      ["5 dias → 5 dias", "Mantido constante"],
      ["β = 0,7453", "Por unidade de 10 pp"],
    ]);
  });

  it("o incremento no escore é exatamente o coeficiente da utilização", () => {
    const d = demonstracao();
    expect(d.dx).toBe(1);
    expect(d.dz).toBeCloseTo(BETA1, 12);
    expect(fmt(d.dz, 4)).toBe("0,7453");
    expect(fmt(d.z0, 4)).toBe("0,2483");
    expect(fmt(d.z1, 4)).toBe("0,9936");
    expect(d.z1 - d.z0).toBeCloseTo(0.7453, 12);
    expect(contas()).toEqual(["Δx = (80 − 70) ÷ 10 = 1", "Δz = β × 1 = 0,7453"]);
  });

  it("as PDs vêm da logística, sem arredondamento intermediário", () => {
    const d = demonstracao();
    expect(d.pd0).toBeCloseTo(sigmoide(escore(70, 5)), 15);
    expect(d.pd1).toBeCloseTo(sigmoide(escore(80, 5)), 15);
    expect(fmtPct(d.pd0)).toBe("56,18%");
    expect(fmtPct(d.pd1)).toBe("72,98%");
    const arredondada = (Number(fmtPct(d.pd1).replace("%", "").replace(",", ".")) - Number(fmtPct(d.pd0).replace("%", "").replace(",", "."))).toFixed(4);
    expect(d.deltaPd.toFixed(4)).not.toBe(arredondada);
    expect(fmtPp(d.deltaPd)).toBe("+16,80 pp");
  });

  it("o multiplicador das odds é exp(β), perto de 2,11, e não vale para a PD", () => {
    const d = demonstracao();
    expect(d.multiplicador).toBeCloseTo(Math.exp(BETA1), 12);
    expect(fmt(d.multiplicador, 2)).toBe("2,11");
    expect(d.pd1 / d.pd0).toBeLessThan(d.multiplicador); // a PD não é multiplicada pelo mesmo fator
  });

  it("só a alternativa B está correta e cada uma tem o seu retorno", () => {
    expect(ALTERNATIVAS.filter((a) => a.correta).map((a) => a.id)).toEqual(["B"]);
    expect(ALTERNATIVAS).toHaveLength(3);
    for (const a of ALTERNATIVAS) { expect(a.tituloFeedback.length).toBeGreaterThan(10); expect(a.feedback.length).toBeGreaterThan(20); }
    expect(alternativa("B")?.tituloFeedback).toBe("Correto: o acréscimo ocorre no escore");
    expect(alternativa("A")?.feedback).toContain("log odds");
    expect(alternativa("C")?.feedback).toContain("2,11");
    expect(alternativa(null)).toBeNull();
    expect(alternativa("D")).toBeNull();
  });
});
