import { describe, expect, it } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { cartoes, comparacao, complementar, contaOdds, curvaOdds, escalaVertical, fmtOdds, leituraIntuitiva, logOdds, oddsDeP, pDeOdds, ponteLog, TITULO, validarOdds, validarPd } from "../src/lib/visuais/escala-odds";
import { EscalaOdds } from "../src/components/visuais/escala-odds";

describe("escala 2, odds (c4p4)", () => {
  it("valores de aceite: 5% → 1/19, 20% → 0,25, 50% → 1, 80% → 4, 95% → 19, 99% → 99", () => {
    expect(oddsDeP(0.05)).toBeCloseTo(1 / 19, 12); expect(fmtOdds(oddsDeP(0.05))).toBe("0,0526");
    expect(oddsDeP(0.2)).toBeCloseTo(0.25, 12); expect(oddsDeP(0.5)).toBeCloseTo(1, 12); expect(oddsDeP(0.8)).toBeCloseTo(4, 12); expect(oddsDeP(0.95)).toBeCloseTo(19, 12); expect(oddsDeP(0.99)).toBeCloseTo(99, 10);
    expect([0.2, 0.5, 0.8, 0.95, 0.99].map((p) => fmtOdds(oddsDeP(p)))).toEqual(["0,25", "1", "4", "19", "99"]);
    expect(contaOdds(0.2)).toBe("odds = 0,2 ÷ 0,8 = 0,25"); expect(contaOdds(0.95)).toBe("odds = 0,95 ÷ 0,05 = 19");
  });
  it("ida e volta entre probabilidade e odds sem perda de precisão; extremos sem NaN", () => {
    for (const p of [0.01, 0.123456, 0.5, 0.777, 0.99]) expect(pDeOdds(oddsDeP(p)!)).toBeCloseTo(p, 12);
    for (const o of [0, 0.25, 1, 4, 19, 1e6]) expect(Math.abs(oddsDeP(pDeOdds(o))! - o) / Math.max(1, o)).toBeLessThan(1e-9);
    expect(oddsDeP(0)).toBe(0); expect(oddsDeP(1)).toBeNull(); expect(pDeOdds(0)).toBe(0); expect(contaOdds(1)).toBe("odds → ∞ quando p → 1");
    expect(fmtOdds(null)).toBe("∞"); expect(JSON.stringify(leituraIntuitiva(1))).not.toMatch(/NaN|Infinity/);
  });
  it("leitura intuitiva: 1 para cada k até 50%, k para cada 1 acima, 1 para 1 em 50%, aproximadamente quando arredonda", () => {
    expect(leituraIntuitiva(0.2)).toEqual({ razao: "1 : 4", frase: "1 default esperado para cada 4 adimplentes esperados." });
    expect(leituraIntuitiva(0.5).frase).toBe("1 default esperado para cada adimplente esperado."); expect(leituraIntuitiva(0.5).razao).toBe("1 : 1");
    expect(leituraIntuitiva(0.8)).toEqual({ razao: "4 : 1", frase: "4 defaults esperados para cada adimplente esperado." });
    expect(leituraIntuitiva(0.95).razao).toBe("19 : 1"); expect(leituraIntuitiva(0.05).razao).toBe("1 : 19");
    expect(leituraIntuitiva(0.3).frase).toBe("1 default esperado para cada aproximadamente 2,3 adimplentes esperados."); expect(leituraIntuitiva(0.7).frase).toBe("Aproximadamente 2,3 defaults esperados para cada adimplente esperado.");
    expect(leituraIntuitiva(0).frase).toContain("Nenhum default"); expect(leituraIntuitiva(1).frase).toContain("não tem valor finito");
  });
  it("complementares: odds recíprocas com produto 1; em 50% coincidem; nos extremos o produto não se define", () => {
    const c = complementar(0.2); expect(c.odds).toBeCloseTo(0.25, 12); expect(c.oddsC).toBeCloseTo(4, 12); expect(c.produto).toBeCloseTo(1, 12); expect(c.coincidem).toBe(false);
    expect(complementar(0.5).coincidem).toBe(true); expect(complementar(0.5).produto).toBeCloseTo(1, 12);
    expect(complementar(0).produto).toBeNull(); expect(complementar(1).produto).toBeNull();
    for (const p of [0.01, 0.37, 0.9]) expect(complementar(p).produto).toBeCloseTo(1, 10);
  });
  it("ponte para log odds: ln(0,25) ≈ −1,386, ln(1) = 0, ln(4) ≈ +1,386, simetria para 0 < p < 1 e limites nos extremos", () => {
    const l = ponteLog(0.2); expect(l.lnP).toBeCloseTo(-1.386294, 5); expect(l.lnMeio).toBe(0); expect(l.lnC).toBeCloseTo(1.386294, 5); expect(l.simetrico).toBe(true);
    for (const p of [0.05, 0.5, 0.95]) expect(ponteLog(p).simetrico).toBe(true);
    expect(logOdds(0)).toBe(-Infinity); expect(logOdds(null)).toBe(Infinity); expect(ponteLog(0).lnP).toBe(-Infinity); expect(ponteLog(0).lnC).toBe(Infinity); expect(ponteLog(1).simetrico).toBe(true);
  });
  it("validação das entradas: decimais, negativos, acima de 100%, não numéricos, e aviso fora da faixa do controle", () => {
    expect(validarPd("12,5")).toEqual({ ok: true, valor: 0.125 }); expect(validarPd("12.5")).toEqual({ ok: true, valor: 0.125 });
    expect(validarPd("-5").ok).toBe(false); expect(validarPd("101").ok).toBe(false); expect(validarPd("abc").ok).toBe(false); expect(validarPd("").ok).toBe(false);
    const fora = validarPd("0,5"); expect(fora.ok && fora.valor).toBe(0.005); expect(fora.ok && fora.aviso).toBe("Fora de 1% a 99%: valor mantido.");
    expect(validarPd("100").ok && (validarPd("100") as { valor: number }).valor).toBe(1);
    expect(validarOdds("4")).toEqual({ ok: true, valor: 0.8 }); expect(validarOdds("0").ok && (validarOdds("0") as { valor: number; aviso?: string }).aviso).toBe("PD de 0%, fora de 1% a 99%: valor mantido.");
    expect(validarOdds("-1").ok).toBe(false); expect(validarOdds("x").ok).toBe(false); expect(validarOdds("Infinity").ok).toBe(false);
  });
  it("escala vertical fixa em 20, fora da janela acima disso e ajuste com folga; curva amostrada dentro da janela", () => {
    expect(escalaVertical(19, false)).toEqual({ yMax: 20, fora: false, ajustada: false }); expect(escalaVertical(99, false)).toEqual({ yMax: 20, fora: true, ajustada: false });
    const a = escalaVertical(99, true); expect(a.ajustada).toBe(true); expect(a.yMax).toBeGreaterThanOrEqual(99); expect(a.fora).toBe(false); expect(escalaVertical(null, true).yMax).toBe(20);
    const c = curvaOdds(20); expect(c[0]).toEqual({ p: 0, o: 0 }); expect(c[c.length - 1].o).toBeCloseTo(20, 9); for (const q of c) expect(q.o).toBeCloseTo(q.p / (1 - q.p), 9);
  });
});

describe("c4p4 no quadro .rl", () => {
  it("cartões e comparação usam as contas: 0,25 não é 25%, 19 e 99 sem teto, 0,25 e 4 recíprocas, ±1,386 no logaritmo", () => {
    expect(cartoes().map((c) => c.k)).toEqual(["Leitura", "Sem teto", "Assimetria"]);
    expect(cartoes()[0].t).toBe("Odds 0,25 não é PD de 25%: é 1 default para cada 4 adimplentes.");
    expect(cartoes()[1].t).toBe("Em 95%, odds 19; em 99%, 99. Perto de 100%, a razão cresce sem limite.");
    expect(cartoes()[2].t).toBe("20% e 80% dão odds 0,25 e 4; no logaritmo, −1,386 e +1,386.");
    expect(comparacao(0.2)).toEqual(["20% e 80%: odds 0,25 e 4, recíprocas: o produto é 1.", "No logaritmo, simétricas: −1,386 e +1,386."]);
    expect(comparacao(0.5)[0]).toBe("Em 50%, p e 1 − p coincidem: odds 1 dos dois lados.");
    expect(comparacao(1)[1]).toBe("Nos extremos, uma das odds não é finita e o produto não se define.");
    for (const p of [0, 0.01, 0.37, 0.5, 0.99, 1]) expect(comparacao(p).join(" ")).not.toMatch(/NaN|Infinity|undefined/);
  });
  it("o quadro: fórmulas em KaTeX, a curva, as três leituras de 20% e nenhum resto do visual antigo", () => {
    const html = renderToStaticMarkup(createElement(EscalaOdds, { pagina: { index: 4, total: 22 } }));
    expect(html).toContain('data-vz="escala-odds"'); expect(html).toContain("04 / 22"); expect(html).toContain(TITULO);
    expect(html.match(/class="katex"/g)?.length).toBeGreaterThanOrEqual(2);
    expect(html).toContain('class="eo-curva"'); expect(html.match(/class="eo-elo /g)).toHaveLength(3);
    expect(html).toContain("20 defaults para 80 adimplentes"); expect(html).toContain("1 : 4"); expect(html).toContain("1 default esperado para cada 4 adimplentes esperados.");
    expect(html).not.toContain("eo-comp\""); expect(html).not.toContain("vz-eo"); expect(html).not.toContain("Por que usar o logaritmo?");
  });
});
