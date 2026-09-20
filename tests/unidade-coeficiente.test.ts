import { describe, expect, it } from "vitest";
import { ATALHOS, ATRASO_FIXO, BETA0, BETA1, BETA2, betaDe, coincidem, comparacaoOdds, contribuicaoDe, fmt, fmtNum, fmtPct, linhas, resultado, UNIDADES, UTIL_INICIAL, validarUtil, xDe } from "@/lib/visuais/unidade-coeficiente";

const UTILS = [0, 30, 70, 95, 100];

describe("c4p14: a unidade muda, a previsão permanece", () => {
  it("as três linhas do exemplo reproduzem a tabela de referência", () => {
    const ls = linhas(UTIL_INICIAL);
    expect(ls.map((l) => [l.unidade.rotulo, fmtNum(l.x, l.unidade.casasX, l.unidade.fixarX), fmt(l.beta, l.unidade.casasBeta), fmt(l.contribuicao, 4)])).toEqual([
      ["Por 10 pp", "7", "0,7453", "5,2171"],
      ["Por 1 pp", "70", "0,07453", "5,2171"],
      ["Como fração de 0 a 1", "0,70", "7,453", "5,2171"],
    ]);
    expect(ls.map((l) => l.unidade.equivale)).toEqual(["1 unidade = 10 pp", "1 unidade = 1 pp", "1 unidade = 100 pp"]);
  });

  it("as três contribuições coincidem em toda a faixa da utilização", () => {
    for (const u of UTILS) {
      expect(coincidem(u)).toBe(true);
      const vs = linhas(u).map((l) => l.contribuicao);
      for (const v of vs) expect(v).toBeCloseTo(vs[0], 12);
      expect(vs[0]).toBeCloseTo(BETA1 * (u / 10), 12);
    }
  });

  it("o escore e a PD não dependem da unidade escolhida", () => {
    for (const u of UTILS) {
      const rs = UNIDADES.map((un) => resultado(u, un));
      for (const r of rs) { expect(r.z).toBeCloseTo(rs[0].z, 12); expect(r.pd).toBeCloseTo(rs[0].pd, 12); expect(fmtPct(r.pd)).toBe(fmtPct(rs[0].pd)); }
    }
    const r = resultado(UTIL_INICIAL);
    expect(fmt(r.z, 4)).toBe("0,2483"); expect(fmtPct(r.pd)).toBe("56,18%");
    expect(fmt(r.intercepto, 4)).toBe("−5,6666"); expect(fmt(r.cAtraso, 4)).toBe("0,6978");
    expect(r.cAtraso).toBeCloseTo(BETA2 * (ATRASO_FIXO / 10), 15);
  });

  it("a soma usa precisão integral, não as parcelas já arredondadas", () => {
    const r = resultado(UTIL_INICIAL);
    const arredondada = [r.intercepto, r.cUtil, r.cAtraso].reduce((s, v) => s + Number(fmt(v, 4).replace("−", "-").replace(",", ".")), 0);
    expect(r.z).not.toBe(arredondada);
    expect(r.z).toBeCloseTo(BETA0 + BETA1 * 7 + BETA2 * 0.5, 15);
  });

  it("o coeficiente acompanha a escala: dividir a variável por 10 multiplica β por 10", () => {
    const [dez, um, fracao] = UNIDADES.map(betaDe);
    expect(um).toBeCloseTo(dez / 10, 15);
    expect(fracao).toBeCloseTo(dez * 10, 15);
    expect(xDe(UNIDADES[1], 70)).toBe(70);
    expect(xDe(UNIDADES[2], 70)).toBeCloseTo(0.7, 15);
    expect(contribuicaoDe(UNIDADES[2], 70)).toBeCloseTo(contribuicaoDe(UNIDADES[0], 70), 12);
  });

  it("a mesma mudança de +10 pp produz o mesmo efeito e a mesma razão de odds nas três unidades", () => {
    const c = comparacaoOdds();
    expect(c.iguais).toBe(true);
    expect(c.itens.map((i) => i.dx)).toEqual([1, 10, 0.1]);
    for (const i of c.itens) expect(i.efeito).toBeCloseTo(BETA1, 12);
    expect(fmt(c.efeito, 4)).toBe("0,7453");
    expect(fmt(c.or, 2)).toBe("2,11");
    expect(c.or).not.toBeCloseTo(Math.exp(betaDe(UNIDADES[2])), 0); // exp(7,453) é outra mudança: 100 pp
  });

  it("o campo de utilização aceita a faixa e recusa o resto", () => {
    expect(validarUtil("70")).toEqual({ ok: true, valor: 70 });
    expect(validarUtil("0")).toEqual({ ok: true, valor: 0 });
    expect(validarUtil("100")).toEqual({ ok: true, valor: 100 });
    expect(validarUtil("101").ok).toBe(false);
    expect(validarUtil("-1").ok).toBe(false);
    expect(validarUtil("").ok).toBe(false);
    expect(validarUtil("abc").ok).toBe(false);
    for (const a of ATALHOS) expect(validarUtil(String(a)).ok).toBe(true);
  });

  it("nenhum valor exibido vira NaN nos extremos", () => {
    for (const u of [0, 100]) for (const l of linhas(u)) {
      expect(Number.isNaN(l.x)).toBe(false); expect(Number.isNaN(l.contribuicao)).toBe(false);
      expect(fmtNum(l.x, l.unidade.casasX, l.unidade.fixarX)).not.toContain("NaN");
    }
    expect(fmtPct(resultado(0).pd)).toBe("0,69%"); // utilização 0% com o atraso fixo em 5 dias
  });
});
