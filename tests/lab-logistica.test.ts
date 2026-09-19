import { describe, expect, it } from "vitest";
import did from "../src/lib/visuais/did.json";
import type { Proposta } from "../src/lib/visuais/logistica";
import { ajusteDaAula, amostrar, efeitoDezPontos, EXPERIMENTOS, fraseCruzamento, fraseSinal, interpretar, JANELA, pd, ponto, retaEm, retaForaDoIntervalo, sigmoideEstavel, x50 } from "../src/lib/visuais/lab-logistica";

const base = did.base as Proposta[];
const AULA = ajusteDaAula(base);

describe("laboratório de regressão logística (c4p2)", () => {
  it("ajuste da aula sobre as 16 propostas, x em proporção: reta a −0,142647 e b 1,117647; logística β₀ −3,121787 e β₁ 5,429194", () => {
    expect(AULA.reta.a).toBeCloseTo(-0.142647, 5); expect(AULA.reta.b).toBeCloseTo(1.117647, 5);
    expect(AULA.logistica.beta0).toBeCloseTo(-3.121787, 5); expect(AULA.logistica.beta1).toBeCloseTo(5.429194, 5);
  });
  it("logística estável: z = 0 dá 50%, extremos não estouram e a curva fica entre 0 e 1", () => {
    expect(sigmoideEstavel(0)).toBe(0.5); expect(sigmoideEstavel(1000)).toBe(1); expect(sigmoideEstavel(-1000)).toBe(0); expect(Number.isFinite(sigmoideEstavel(-800))).toBe(true);
    for (const { y } of amostrar((x) => pd({ beta0: 8, beta1: 15 }, x))) { expect(y).toBeGreaterThanOrEqual(0); expect(y).toBeLessThanOrEqual(1); }
    expect(pd({ beta0: -3, beta1: 5 }, 0.6)).toBeCloseTo(0.5, 12); // z = 0 exatamente
  });
  it("β₁ = 0 produz curva horizontal; o sinal de β₁ inverte a monotonicidade", () => {
    const flat = amostrar((x) => pd({ beta0: -1, beta1: 0 }, x)); for (const p of flat) expect(p.y).toBeCloseTo(sigmoideEstavel(-1), 12);
    const sobe = amostrar((x) => pd({ beta0: -3, beta1: 5 }, x)), desce = amostrar((x) => pd({ beta0: -3, beta1: -5 }, x));
    for (let i = 1; i < sobe.length; i++) { expect(sobe[i].y).toBeGreaterThan(sobe[i - 1].y); expect(desce[i].y).toBeLessThan(desce[i - 1].y); }
    expect(fraseSinal({ beta0: 0, beta1: 0 })).toBe("A utilização não altera a PD: a curva é horizontal.");
    expect(fraseSinal({ beta0: 0, beta1: -2 })).toBe("Maior utilização está associada a menor PD neste modelo.");
  });
  it("z, odds, PD e o efeito de +10 pp são consistentes entre si", () => {
    const m = AULA.logistica; const p = ponto(m, 0.6);
    expect(p.z).toBeCloseTo(0.135730, 5); expect(p.odds).toBeCloseTo(Math.exp(p.z), 12); expect(p.p).toBeCloseTo(p.odds / (1 + p.odds), 12); expect(p.p).toBeCloseTo(0.53388, 4);
    const e = efeitoDezPontos(m, 0.6);
    expect(e.de).toBeCloseTo(p.p, 12); expect(e.para).toBeCloseTo(pd(m, 0.7), 12); expect(e.deltaPp).toBeCloseTo(12.9557, 3);
    expect(e.multOdds).toBeCloseTo(Math.exp(0.1 * m.beta1), 12); expect(e.multOdds).toBeCloseTo(1.7210, 3);
    expect(ponto(m, 0.7).odds / p.odds).toBeCloseTo(e.multOdds, 10); // o multiplicador das odds é o mesmo em qualquer ponto
    expect(e.derivada).toBeCloseTo(m.beta1 * p.p * (1 - p.p), 12); expect(e.aproxPpPor1pp).toBeCloseTo(e.derivada, 12);
    expect(efeitoDezPontos(m, 0.2).deltaPp).toBeCloseTo(6.7988, 3); // mesmo coeficiente, efeito em pp diferente
    expect(efeitoDezPontos(m, 1.15).disponivel).toBe(false); expect(efeitoDezPontos(m, 1.1).disponivel).toBe(true);
  });
  it("x₅₀ = −β₀ ÷ β₁, dentro ou fora da janela; β₁ = 0 trata PD constante igual ou diferente de 50%", () => {
    expect(x50(AULA.logistica)).toBeCloseTo(0.575, 6); expect(fraseCruzamento(AULA.logistica)).toContain("57,5%");
    expect(x50({ beta0: 1, beta1: 0 })).toBeNull();
    expect(fraseCruzamento({ beta0: -10, beta1: 5 })).toContain("fora da janela"); expect(fraseCruzamento({ beta0: -10, beta1: 5 })).toContain("200,0%");
    expect(fraseCruzamento({ beta0: 0, beta1: 0 })).toContain("50% em toda a curva"); expect(fraseCruzamento({ beta0: -1, beta1: 0 })).toContain("constante em 26,9%");
  });
  it("a reta pode sair de 0% a 100% e o laboratório aponta onde; a logística nunca sai", () => {
    const f = retaForaDoIntervalo(AULA.reta);
    expect(f.abaixo).toBe(true); expect(f.acima).toBe(true); expect(f.cruzaZero).toBeCloseTo(0.1276, 3); expect(f.cruzaUm).toBeCloseTo(1.0224, 3);
    expect(retaEm(AULA.reta, 1.2)).toBeGreaterThan(1); expect(retaEm(AULA.reta, 0)).toBeLessThan(0);
    expect(retaForaDoIntervalo({ a: 0.2, b: 0.5 }).abaixo).toBe(false);
    expect(retaForaDoIntervalo({ a: -1, b: 3 }).foraDoGrafico).toBe(true);
  });
  it("interpretação: ajuste da aula não afirma calibração; parâmetros movidos são exploração, não novo ajuste", () => {
    const aula = interpretar(AULA.logistica, AULA.logistica, 0.6, false).join(" ");
    expect(aula).toContain("Maior utilização está associada a maior PD"); expect(aula).toContain("não é, por isso, bem calibrada"); expect(aula).not.toContain("causa");
    const expl = interpretar({ beta0: AULA.logistica.beta0 + 2, beta1: AULA.logistica.beta1 }, AULA.logistica, 0.6, true).join(" ");
    expect(expl).toContain("a PD aumenta para qualquer utilização fixa"); expect(expl).toContain("não reestimados");
    const forte = interpretar({ beta0: AULA.logistica.beta0, beta1: 12 }, AULA.logistica, 0.6, true).join(" ");
    expect(forte).toContain("inclinação máxima"); expect(forte).toContain("ponto de transição");
    expect(interpretar(AULA.logistica, AULA.logistica, 1.15, false).join(" ")).toContain("não é mostrado para não extrapolar");
  });
  it("experimentos guiados: partem do ajuste da aula e a explicação fecha com os mesmos números do cálculo", () => {
    const porId = Object.fromEntries(EXPERIMENTOS.map((e) => [e.id, e]));
    const nivel = porId.nivel.aplicar(AULA.logistica, AULA.logistica).modelo; expect(nivel.beta0).toBeCloseTo(AULA.logistica.beta0 + 2, 12); expect(nivel.beta1).toBe(AULA.logistica.beta1);
    expect(porId.nivel.explicar(AULA.logistica, nivel)).toContain("Não. A PD sobe para qualquer utilização fixa");
    const sinal = porId.sinal.aplicar(AULA.logistica, AULA.logistica).modelo; expect(sinal.beta1).toBeCloseTo(-AULA.logistica.beta1, 12);
    const zero = porId.zero.aplicar(AULA.logistica, AULA.logistica).modelo; expect(zero.beta1).toBe(0); expect(porId.zero.explicar(AULA.logistica, zero)).toContain("4,2%"); // sigmoide(−3,12)
    const mesmo = porId.mesmo.aplicar(AULA.logistica, AULA.logistica); expect(mesmo.x).toBe(0.2); expect(mesmo.efeito).toBe(true);
    expect(porId.mesmo.explicar(AULA.logistica, mesmo.modelo)).toContain("+6,8 pp"); expect(porId.mesmo.explicar(AULA.logistica, mesmo.modelo)).toContain("+13,0 pp"); expect(porId.mesmo.explicar(AULA.logistica, mesmo.modelo)).toContain("1,72");
    expect(JANELA.xMax).toBe(1.2);
  });
});
