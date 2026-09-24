import { describe, expect, it } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { BASE, cartoes, conta, GRUPOS, leitura } from "@/lib/visuais/impureza-raiz";
import { ImpurezaRaiz } from "@/components/visuais/impureza-raiz";

describe("c5p5: o Gini de um grupo, contado à mão", () => {
  it("os grupos saem da base e da árvore: raiz 8 em 16, folha pura 0 em 6 (#3 a #8), folha mista 1 em 2 (#15 e #16)", () => {
    expect(BASE).toHaveLength(16); expect(BASE.filter((r) => r.y)).toHaveLength(8);
    expect([GRUPOS.raiz.n, GRUPOS.raiz.d, GRUPOS.raiz.gini]).toEqual([16, 8, 0.5]);
    expect(GRUPOS.pura.ids).toEqual([3, 4, 5, 6, 7, 8]); expect(GRUPOS.pura.d).toBe(0); expect(GRUPOS.pura.gini).toBe(0);
    expect(GRUPOS.mista.ids).toEqual([15, 16]); expect(GRUPOS.mista.d).toBe(1); expect(GRUPOS.mista.gini).toBe(0.5);
    expect(GRUPOS.pura.definicao).toBe("Utilização entre 27,5% e 57,5%"); expect(GRUPOS.mista.definicao).toBe("Utilização acima de 87,5%");
  });

  it("a conta, a leitura e os cartões usam os números dos grupos", () => {
    expect(conta(GRUPOS.raiz)).toEqual([String.raw`p = \dfrac{8}{16} = 0{,}5000`, String.raw`\mathrm{Gini} = 2 \times 0{,}5000 \times 0{,}5000 = 0{,}50000`]);
    expect(conta(GRUPOS.pura)[1]).toBe(String.raw`\mathrm{Gini} = 2 \times 0{,}0000 \times 1{,}0000 = 0{,}00000`);
    expect(leitura(GRUPOS.raiz)).toContain("mistura máxima"); expect(leitura(GRUPOS.pura)).toContain("Gini zero"); expect(leitura(GRUPOS.mista)).toBe("1 default em 2: meio a meio de novo, o mesmo Gini da raiz.");
    expect(cartoes().map((c) => c.k)).toEqual(["A referência", "Folha pura", "O tamanho conta"]);
    expect(cartoes()[2].t).toContain("pesa 2 em 16"); expect(cartoes()[1].t).toBe("0 default em 6: Gini zero, nada a reduzir.");
  });

  it("o quadro traz a base inteira, com as 16 linhas, as fórmulas em KaTeX e a conta da raiz", () => {
    const html = renderToStaticMarkup(createElement(ImpurezaRaiz, { pagina: { index: 5, total: 19 } }));
    expect(html).toContain('data-vz="impureza-raiz"'); expect(html).toContain("05 / 19");
    expect(html.match(/<tr class="ir-on"/g)).toHaveLength(16); // a raiz acende as 16 linhas da base
    expect(html.match(/class="ir-sim"/g)).toHaveLength(8);
    expect(html.match(/class="katex"/g)?.length).toBeGreaterThanOrEqual(4); // duas fórmulas na faixa e as duas linhas da conta
    expect(html).toContain("0,50000"); expect(html).not.toContain("vz-formula");
  });
});
