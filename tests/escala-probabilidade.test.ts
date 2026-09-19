import { describe, expect, it } from "vitest";
import { CONCLUSAO, esperados, incremento, mensagemLimite, normalizarPd, oddsDe, reguas, visivel } from "../src/lib/visuais/escala-probabilidade";

describe("escala 1, probabilidade (c4p3)", () => {
  it("contagens esperadas somam 100 e coincidem com a grade em 0%, 5%, 50%, 95% e 100%", () => {
    for (const [p, d] of [[0, 0], [0.05, 5], [0.5, 50], [0.95, 95], [1, 100]] as const) { const e = esperados(p); expect(e.defaults).toBe(d); expect(e.adimplentes).toBe(100 - d); expect(e.defaults + e.adimplentes).toBe(100); }
    for (let n = 0; n <= 100; n++) { const e = esperados(normalizarPd(n / 100)); expect(e.defaults).toBe(n); expect(e.total).toBe(100); }
    expect(normalizarPd(1.7)).toBe(1); expect(normalizarPd(-0.2)).toBe(0); expect(normalizarPd(0.949)).toBe(0.95);
  });
  it("odds: 19 em 95%, 1 em 50%, 0 em 0% e sem valor finito em 100%, nunca NaN", () => {
    expect(oddsDe(0.95).texto).toBe("19"); expect(oddsDe(0.95).conta).toBe("odds = 0,95 ÷ 0,05 = 19"); expect(oddsDe(0.95).leitura).toContain("19 defaults esperados para cada adimplente esperado");
    expect(oddsDe(0.5).texto).toBe("1"); expect(oddsDe(0.5).valor).toBe(1);
    expect(oddsDe(0).texto).toBe("0"); expect(oddsDe(0).valor).toBe(0);
    expect(oddsDe(1).valor).toBeNull(); expect(oddsDe(1).conta).toBe("odds → ∞ quando p → 1"); expect(oddsDe(1).leitura).toContain("não tem valor finito");
    expect(oddsDe(0.12).texto).toBe("0,14"); expect(oddsDe(0.12).leitura).toContain("1 default esperado para cada 7,3 adimplentes");
    for (const p of [0, 0.01, 0.5, 0.99, 1]) expect(JSON.stringify(oddsDe(p))).not.toMatch(/NaN|Infinity/);
  });
  it("incremento somado à PD sem limitar a 100%: 5% → 15%, 50% → 60%, 95% → 105%; réguas fixas não seguem a PD selecionada", () => {
    const rs = reguas(0.95, 10);
    expect(rs.map((r) => r.rotulo)).toEqual(["5% → 15%", "50% → 60%", "95% → 105%"]); expect(rs.map((r) => r.valido)).toEqual([true, true, false]); expect(rs[2].para).toBeCloseTo(1.05, 12);
    expect(reguas(0.5, 10).map((r) => r.rotulo)).toEqual(["5% → 15%", "50% → 60%", "50% → 60%"]);
    expect(reguas(0.2, 0).map((r) => r.rotulo)).toEqual(["5% → 5%", "50% → 50%", "20% → 20%"]);
    expect(reguas(1, 20).map((r) => r.rotulo)).toEqual(["5% → 25%", "50% → 70%", "100% → 120%"]); expect(reguas(0, 20)[2].rotulo).toBe("0% → 20%");
    expect(incremento(0.9, 10).valido).toBe(true); expect(incremento(0.91, 10).valido).toBe(false);
  });
  it("mensagens do limite e das etapas", () => {
    expect(mensagemLimite(0.95, 10)).toEqual({ invalida: true, texto: "105% não é uma probabilidade." });
    expect(mensagemLimite(1, 20).texto).toBe("120% não é uma probabilidade."); expect(mensagemLimite(0.5, 10).texto).toBe("Neste ponto, o resultado permanece entre 0% e 100%."); expect(mensagemLimite(0.9, 10).invalida).toBe(false);
    expect(CONCLUSAO).toBe("Um incremento positivo constante não pode ser aplicado a toda a escala de probabilidade sem eventualmente ultrapassar 100%.");
    expect(visivel("pd")).toEqual({ pd: true, limites: false, odds: false }); expect(visivel("limites")).toEqual({ pd: true, limites: true, odds: false }); expect(visivel("odds")).toEqual({ pd: true, limites: true, odds: true }); expect(visivel("tudo").odds).toBe(true);
  });
});
