import { describe, expect, it } from "vitest";
import { alcanceZ, BETA1, EXEMPLO, fmt, fmtPct, LIMITES, linhas, naEscala, representacoes, soma } from "@/lib/visuais/escore-soma";

describe("c4p8: a decomposição do escore", () => {
  it("o exemplo da aula reproduz a tabela da especificação", () => {
    const ls = linhas(EXEMPLO.util, EXEMPLO.atraso);
    expect(ls.map((l) => [l.parcela, fmt(l.coeficiente, 4), l.escala, fmt(l.contribuicao, 4, true)])).toEqual([
      ["Intercepto", "−5,6666", "1", "−5,6666"],
      ["Utilização", "0,7453", "70 ÷ 10 = 7", "+5,2171"],
      ["Atraso", "1,3955", "5 ÷ 10 = 0,5", "+0,6978"],
    ]);
    expect(ls[1].unidade).toBe("10 pp"); expect(ls[2].unidade).toBe("10 dias");
  });

  it("a soma das contribuições é o escore e as três escalas conferem", () => {
    const r = representacoes(EXEMPLO.util, EXEMPLO.atraso);
    expect(soma(linhas(EXEMPLO.util, EXEMPLO.atraso))).toBeCloseTo(r.z, 12);
    expect(fmt(r.z, 4)).toBe("0,2483");
    expect(fmt(r.odds, 3)).toBe("1,282");
    expect(fmtPct(r.pd)).toBe("56,18%");
    expect(r.conferePd).toBe(true);
  });

  it("a soma usa precisão integral, não parcelas já arredondadas", () => {
    const ls = linhas(EXEMPLO.util, EXEMPLO.atraso);
    const arredondada = ls.reduce((s, l) => s + Number(fmt(l.contribuicao, 4).replace("−", "-").replace(",", ".")), 0);
    expect(soma(ls)).not.toBe(arredondada);
    expect(soma(ls)).toBeCloseTo(0.24828, 5);
  });

  it("um único estado alimenta tabela, escore, odds e PD em qualquer ponto dos controles", () => {
    for (const [u, a] of [[0, 0], [70, 5], [100, 30], [37, 13]]) {
      const r = representacoes(u, a);
      expect(soma(linhas(u, a))).toBeCloseTo(r.z, 12);
      expect(r.odds).toBeCloseTo(Math.exp(r.z), 12);
      expect(r.pd).toBeCloseTo(r.odds / (1 + r.odds), 12);
      expect(r.pd).toBeGreaterThan(0); expect(r.pd).toBeLessThan(1);
    }
  });

  it("sem interação, +10 pp de utilização acrescentam sempre 0,7453 a z e nunca o mesmo em PD", () => {
    const passos = [0, 10, 20, 30].map((a) => {
      const antes = representacoes(60, a), depois = representacoes(70, a);
      return { dz: depois.z - antes.z, dpd: (depois.pd - antes.pd) * 100 };
    });
    for (const p of passos) { expect(p.dz).toBeCloseTo(BETA1, 12); expect(fmt(p.dz, 4)).toBe("0,7453"); }
    expect(new Set(passos.map((p) => p.dpd.toFixed(6))).size).toBe(passos.length);
  });

  it("o valor na escala mostra a divisão por 10 nos dois controles", () => {
    expect(naEscala(70)).toBe("70 ÷ 10 = 7");
    expect(naEscala(5)).toBe("5 ÷ 10 = 0,5");
    expect(naEscala(0)).toBe("0 ÷ 10 = 0");
    expect(naEscala(30)).toBe("30 ÷ 10 = 3");
  });

  it("o escore fica entre os extremos dos controles", () => {
    const { min, max } = alcanceZ();
    expect(fmt(min, 4)).toBe("−5,6666"); expect(fmt(max, 4)).toBe("5,9729");
    for (const u of [LIMITES.util[0], 50, LIMITES.util[1]]) for (const a of [LIMITES.atraso[0], 15, LIMITES.atraso[1]]) {
      const z = representacoes(u, a).z;
      expect(z).toBeGreaterThanOrEqual(min); expect(z).toBeLessThanOrEqual(max);
    }
  });
});
