import { describe, expect, it } from "vitest";
import { ATALHOS, aumentoPp, BETA1, cenarios, CENARIOS, curva, DELTA_Z, FAIXA_PD, fmt, fmtPct, fmtPd1, fmtPp, fraseMaximo, M, maximo, PD_INICIAL, pdFinal, validarPd, Y_MAX_PP } from "@/lib/visuais/impacto-pd";

describe("c4p12: o mesmo multiplicador, aumentos diferentes em PD", () => {
  it("o experimento é fixo e derivado do coeficiente do projeto", () => {
    expect(DELTA_Z).toBeCloseTo(BETA1, 15);
    expect(M).toBeCloseTo(Math.exp(BETA1), 15);
    expect(fmt(DELTA_Z, 4, true)).toBe("+0,7453");
    expect(fmt(M, 2)).toBe("2,11");
  });

  it("o estado inicial reproduz os valores de referência", () => {
    expect(fmtPct(pdFinal(PD_INICIAL))).toBe("18,97%");
    expect(fmtPp(aumentoPp(PD_INICIAL))).toBe("+8,97 pp");
    expect(fmtPd1(PD_INICIAL)).toBe("10,0%");
  });

  it("nos extremos teóricos a variação é exatamente zero, sem odds infinitas", () => {
    expect(pdFinal(0)).toBe(0); expect(pdFinal(1)).toBe(1);
    expect(aumentoPp(0)).toBe(0); expect(aumentoPp(1)).toBe(0);
    expect(Number.isNaN(aumentoPp(0))).toBe(false); expect(Number.isNaN(aumentoPp(1))).toBe(false);
    expect(Object.is(aumentoPp(1), -0)).toBe(false);
  });

  it("o máximo analítico coincide com o máximo numérico da mesma função", () => {
    const x = maximo();
    expect(x.p).toBeCloseTo(1 / (1 + Math.sqrt(M)), 15);
    let melhor = { p: 0, pp: 0 };
    for (let i = 0; i <= 200000; i++) { const p = i / 200000; const pp = aumentoPp(p); if (pp > melhor.pp) melhor = { p, pp }; }
    expect(x.p).toBeCloseTo(melhor.p, 4);
    expect(x.pp).toBeCloseTo(melhor.pp, 8);
    expect(fmt(x.p * 100, 1)).toBe("40,8");
    expect(fmt(x.pp, 2)).toBe("18,42");
    expect(fraseMaximo()).toContain("40,8%"); expect(fraseMaximo()).toContain("18,42 pp");
  });

  it("em 50% o aumento é menor que o máximo real", () => {
    const x = maximo();
    expect(aumentoPp(0.5)).toBeLessThan(x.pp);
    expect(fmtPp(aumentoPp(0.5))).toBe("+17,82 pp");
    expect(x.p).toBeLessThan(0.5);
  });

  it("os sete cenários usam a mesma função e cabem na escala fixa", () => {
    const ls = cenarios();
    expect(ls.map((l) => fmtPp(l.pp))).toEqual(["+2,12 pp", "+4,98 pp", "+8,97 pp", "+16,26 pp", "+17,82 pp", "+11,34 pp", "+4,99 pp"]);
    expect(ls.map((l) => fmtPct(l.pFinal))).toEqual(["4,12%", "9,98%", "18,97%", "41,26%", "67,82%", "86,34%", "94,99%"]);
    for (const l of ls) { expect(l.pp).toBeCloseTo(aumentoPp(l.p), 15); expect(l.pp).toBeLessThanOrEqual(Y_MAX_PP); }
    expect(ls.filter((l) => l.maiorDaLista).map((l) => l.p)).toEqual([0.5]);
    expect(CENARIOS).toHaveLength(7);
  });

  it("a curva é densa, cobre os extremos e passa pelo máximo", () => {
    const pts = curva(100);
    expect(pts[0].p).toBe(0); expect(pts[pts.length - 1].p).toBe(1);
    expect(pts.length).toBeGreaterThan(100);
    const topo = pts.reduce((a, b) => (b.pp > a.pp ? b : a));
    expect(topo.pp).toBeCloseTo(maximo().pp, 12);
    for (let i = 1; i < pts.length; i++) expect(pts[i].p).toBeGreaterThanOrEqual(pts[i - 1].p);
    for (const q of pts) { expect(q.pp).toBeGreaterThanOrEqual(0); expect(q.pp).toBeLessThanOrEqual(Y_MAX_PP); }
  });

  it("o campo de PD aceita a faixa do controle e recusa o resto", () => {
    expect(validarPd("10")).toEqual({ ok: true, valor: 0.1 });
    expect(validarPd("2,5%")).toEqual({ ok: true, valor: 0.025 });
    expect(validarPd("")).toEqual({ ok: false, erro: "Digite uma PD em porcentagem, por exemplo 10 ou 2,5." });
    expect(validarPd("0").ok).toBe(false);
    expect(validarPd("100").ok).toBe(false);
    expect(validarPd("abc").ok).toBe(false);
    expect(validarPd("99,9")).toEqual({ ok: true, valor: 0.999 }); // o extremo da faixa não pode cair fora por ruído binário
    expect(validarPd("0,1")).toEqual({ ok: true, valor: 0.001 });
    expect(validarPd("99,95").ok).toBe(false);
    for (const a of ATALHOS) { expect(a).toBeGreaterThanOrEqual(FAIXA_PD[0]); expect(a).toBeLessThanOrEqual(FAIXA_PD[1]); }
  });
});
