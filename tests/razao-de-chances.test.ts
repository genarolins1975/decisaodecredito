import { describe, expect, it } from "vitest";
import { alternativa, alternativas, BETA1, conclusao, conversao, ENUNCIADO, etapas, fmt, fmtPct, fmtPd1, OR, PD_INICIAL } from "@/lib/visuais/razao-de-chances";

describe("c4p11: a razão de odds multiplica odds, não PD", () => {
  it("o multiplicador vem do coeficiente do projeto, com precisão integral", () => {
    expect(OR).toBeCloseTo(Math.exp(BETA1), 15);
    expect(OR).toBeCloseTo(2.1070735, 7);
    expect(fmt(OR, 2)).toBe("2,11");
    expect(fmt(OR, 4)).toBe("2,1071");
    expect(ENUNCIADO.map((e) => e.v)).toEqual(["10%", "+10 pp", "2,11×"]);
  });

  it("os três passos levam de 10% a 18,97%", () => {
    const c = conversao();
    expect(c.odds0).toBeCloseTo(1 / 9, 12);
    expect(fmt(c.odds0, 4)).toBe("0,1111");
    expect(c.odds1).toBeCloseTo(c.odds0 * OR, 15);
    expect(fmt(c.odds1, 4)).toBe("0,2341");
    expect(fmtPct(c.p1)).toBe("18,97%");
    expect(fmtPd1(c.p1)).toBe("19,0%");
    expect(c.p1).toBeCloseTo(c.odds1 / (1 + c.odds1), 15);
  });

  it("não se usa o multiplicador já arredondado em nenhuma etapa", () => {
    const exato = conversao(PD_INICIAL, OR).p1;
    const arredondado = conversao(PD_INICIAL, 2.11).p1;
    expect(exato).not.toBeCloseTo(arredondado, 6);
    expect(fmtPct(arredondado)).toBe("18,99%"); // o valor que a especificação prevê para OR = 2,11 exato
    expect(fmtPd1(arredondado)).toBe("19,0%");
  });

  it("as três alternativas trazem os números da especificação e só B está correta", () => {
    const as = alternativas();
    expect(as.map((a) => [a.id, fmtPd1(a.valor)])).toEqual([["A", "21,1%"], ["B", "19,0%"], ["C", "12,1%"]]);
    expect(as.filter((a) => a.correta).map((a) => a.id)).toEqual(["B"]);
    expect(alternativa("A")?.feedback).toContain("não diretamente sobre a PD");
    expect(alternativa("B")?.feedback).toContain("Correto");
    expect(alternativa("C")?.feedback).toContain("fator multiplicativo, não um acréscimo");
    expect(alternativa(null)).toBeNull();
  });

  it("a alternativa A é a PD multiplicada e a C é a soma em pontos percentuais", () => {
    const as = alternativas();
    expect(as[0].valor).toBeCloseTo(PD_INICIAL * OR, 15);
    expect(as[2].valor * 100).toBeCloseTo(12.11, 12); // 10% + 2,11 pp, o multiplicador lido como pontos percentuais
    expect(as[2].valor).not.toBeCloseTo(as[0].valor, 4);
  });

  it("as etapas exibidas e a conclusão vêm do mesmo cálculo", () => {
    const es = etapas();
    expect(es.map((e) => e.valor)).toEqual(["0,1111", "0,2341", "18,97%"]);
    expect(es[2].destaque).toBe(true);
    expect(es[1].conta).toBe("odds₁ = odds₀ × 2,1071");
    const c = conclusao();
    expect(c.principal).toBe("As odds aumentaram cerca de 111%. A PD passou de 10% para cerca de 19%.");
    expect(c.detalhe).toBe("Isso representa aproximadamente +9 pontos percentuais de PD.");
  });
});
