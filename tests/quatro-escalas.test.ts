import { describe, expect, it } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { cuidado, fmtOdds, fmtPd, fmtZ, linhaMaisProxima, posicao, TABELA_PDS, TICKS, TITULO, traduzir, USOS, valor } from "@/lib/visuais/quatro-escalas";
import { QuatroEscalas } from "@/components/visuais/quatro-escalas";

describe("c4p6: probabilidade, odds, log odds e escore", () => {
  it("a tradução reproduz a tabela: 5% → 0,053, −2,944, 865; 50% → 1, 0, 600; 1% → 1014; 2% → 950; 10% → 798", () => {
    expect([fmtOdds(traduzir(0.05).odds), fmtZ(traduzir(0.05).z), traduzir(0.05).escore]).toEqual(["0,053", "−2,944", 865]);
    expect([fmtOdds(traduzir(0.5).odds), fmtZ(traduzir(0.5).z), traduzir(0.5).escore]).toEqual(["1,000", "0,000", 600]);
    expect([traduzir(0.01).escore, traduzir(0.02).escore, traduzir(0.1).escore]).toEqual([1014, 950, 798]);
    expect(cuidado()).toBe("De 1% para 2%, o escore cai 64 pontos; de 5% para 10%, 67: passos parecidos, PDs bem diferentes.");
    expect(TABELA_PDS.map(fmtPd)).toEqual(["1,0%", "2,0%", "5,0%", "10%", "20%", "50%", "80%", "90%", "95%"]);
  });
  it("a mesma ordem nas quatro escalas: PD, odds e log odds crescem juntos; o escore cai; posições monótonas nas réguas", () => {
    const ts = TABELA_PDS.map(traduzir);
    for (let i = 1; i < ts.length; i++) {
      expect(ts[i].odds).toBeGreaterThan(ts[i - 1].odds); expect(ts[i].z).toBeGreaterThan(ts[i - 1].z); expect(ts[i].escore).toBeLessThan(ts[i - 1].escore);
      for (const e of ["p", "odds", "z", "escore"] as const) expect(posicao(e, ts[i]).t).toBeGreaterThan(posicao(e, ts[i - 1]).t);
    }
    for (let q = 1; q <= 99; q++) for (const e of ["p", "odds", "z", "escore"] as const) expect(posicao(e, traduzir(q / 100)).fora).toBe(false);
    expect(fmtZ(traduzir(0.2).z)).toBe("−1,386"); expect(fmtZ(traduzir(0.8).z)).toBe("1,386"); // complementares, log odds simétricos
    expect(TICKS.escore.map((m) => m.texto)).toEqual(["1140", "870", "600", "330", "60"]);
    expect(valor("p", traduzir(0.05))).toBe("5%"); expect(valor("escore", traduzir(0.05))).toBe("865");
  });
  it("a linha acesa é a mais próxima da PD escolhida", () => {
    expect(linhaMaisProxima(0.05)).toBe(0.05); expect(linhaMaisProxima(0.07)).toBe(0.05); expect(linhaMaisProxima(0.13)).toBe(0.1); expect(linhaMaisProxima(0.99)).toBe(0.95); expect(linhaMaisProxima(0.6)).toBe(0.5);
  });
  it("o quadro: quatro réguas, tabela com 9 linhas e a de 5% acesa, fórmulas em KaTeX e os quatro usos", () => {
    const html = renderToStaticMarkup(createElement(QuatroEscalas, { pagina: { index: 6, total: 22 } }));
    expect(html).toContain('data-vz="quatro-escalas"'); expect(html).toContain("06 / 22"); expect(html).toContain(TITULO);
    expect(html.match(/class="qe-regua /g)).toHaveLength(4); expect(html.match(/<tr( class="qe-on")?><th scope="row">/g)).toHaveLength(9);
    expect(html.match(/<tr class="qe-on">/g)).toHaveLength(1); expect(html).toContain('<tr class="qe-on"><th scope="row">5,0%</th>');
    expect(html.match(/class="katex"/g)?.length).toBeGreaterThanOrEqual(2);
    expect(USOS.map((u) => u.k)).toEqual(["Log odds", "Odds", "Probabilidade", "Escore"]); for (const u of USOS) expect(html).toContain(u.t);
    expect(html).not.toContain("vz-esc"); expect(html).not.toContain("escala-regua");
  });
});
