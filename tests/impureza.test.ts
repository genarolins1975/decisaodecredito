import { describe, expect, it } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { cartoes, celulas, chanceDeErro, contraexemplo, entropiaP, fmtNum, giniP, leitura, simetrico, taxaErroP } from "@/lib/visuais/impureza";
import { GEOMETRIA, ImpurezaCurva, rotulosDoGrafico } from "@/components/visuais/impureza-curva";

describe("c5p4: Gini e entropia em função da proporção", () => {
  it("zeram nas pontas, chegam ao máximo em 50% e são simétricas em torno dele", () => {
    for (const p of [0, 1]) { expect(giniP(p)).toBe(0); expect(entropiaP(p)).toBe(0); }
    expect(giniP(0.5)).toBe(0.5); expect(entropiaP(0.5)).toBe(1);
    expect(fmtNum(giniP(0.1), 4)).toBe("0,1800"); expect(fmtNum(entropiaP(0.1), 4)).toBe("0,4690");
    for (const p of [0.03, 0.1, 0.36, 0.49]) { expect(giniP(1 - p)).toBeCloseTo(giniP(p), 12); expect(entropiaP(1 - p)).toBeCloseTo(entropiaP(p), 12); }
    expect(fmtNum(giniP(0.36), 4)).toBe("0,4608"); expect(fmtNum(entropiaP(0.36), 4)).toBe("0,9427");
  });

  it("o quadrado soma 1, e as duas células de erro somam o próprio Gini", () => {
    for (const p of [0, 0.03, 0.1, 0.36, 0.5, 0.9, 1]) {
      const cs = celulas(p);
      expect(cs.reduce((s, c) => s + c.prob, 0)).toBeCloseTo(1, 12);
      expect(chanceDeErro(p)).toBeCloseTo(giniP(p), 12);
      expect(cs.filter((c) => c.erro).map((c) => `${c.proposta}/${c.rotulo}`).sort()).toEqual(["default/pagou", "pagou/default"]);
    }
  });

  it("a taxa de erro do nó tem as mesmas pontas e o mesmo máximo, mas fica abaixo do Gini fora de 0%, 50% e 100%", () => {
    for (const p of [0, 0.5, 1]) expect(taxaErroP(p)).toBeCloseTo(giniP(p), 12);
    for (let i = 1; i < 100; i++) { const p = i / 100; expect(taxaErroP(p)).toBeCloseTo(taxaErroP(1 - p), 12); if (i !== 50) expect(taxaErroP(p)).toBeLessThan(giniP(p)); }
    expect(taxaErroP(0.9)).toBeCloseTo(0.1, 12); expect(giniP(0.9)).toBeCloseTo(0.18, 12); // o exemplo da revisão pedagógica
  });

  it("o contraexemplo vem da própria árvore: o 2º nível derruba o Gini ponderado e não tira nenhum erro", () => {
    const c = contraexemplo();
    expect(c.n).toBe(16);
    expect(c.um.gini).toBeCloseTo(0.21875, 12); expect(c.dois.gini).toBeCloseTo(0.125, 12);
    expect(c.um.erros).toBe(2); expect(c.dois.erros).toBe(2);
  });

  it("a leitura e a comparação com 1 − p usam os valores calculados", () => {
    expect(leitura(0)).toContain("Grupo puro"); expect(leitura(1)).toContain("Grupo puro");
    expect(leitura(0.5)).toContain("Meio a meio");
    expect(leitura(0.1)).toBe("Prevendo a maioria, o nó erra 10%; sorteando o rótulo, 18,0%, que é o Gini.");
    expect(leitura(0.75)).toBe("Prevendo a maioria, o nó erra 25%; sorteando o rótulo, 37,5%, que é o Gini.");
    expect(simetrico(0.1)).toBe("Em 10% e em 90%, o mesmo Gini, 0,1800, e a mesma entropia, 0,4690.");
    expect(simetrico(0.5)).toBe("Em 50%, o simétrico é o próprio ponto.");
    expect(cartoes().map((c) => c.k)).toEqual(["Não é taxa de erro", "Não é risco", "No curso"]);
    expect(cartoes()[0].t).toBe("No 2º nível desta base, o Gini ponderado cai de 0,21875 para 0,12500, e os erros seguem 2 em 16.");
    expect(cartoes()[1].t).toContain("Gini 0,18, como com 10%");
  });

  it("em qualquer proporção, os valores ficam fora das curvas, dos pontos e dos textos fixos, e dentro do desenho", () => {
    const { sx, sy, area, pRotulos } = GEOMETRIA;
    const cruza = (a: { x0: number; x1: number; y0: number; y1: number }, b: typeof a) => a.x0 < b.x1 && b.x0 < a.x1 && a.y0 < b.y1 && b.y0 < a.y1;
    // conferência independente do posicionador: a curva, amostrada a cada pixel, não pode ter ponto dentro da caixa
    const passa = (f: (p: number) => number, c: { x0: number; x1: number; y0: number; y1: number }) => {
      for (let x = Math.ceil(c.x0); x <= c.x1; x++) { const p = (x - sx(0)) / (sx(1) - sx(0)); if (p < 0 || p > 1) continue; const y = sy(f(p)); if (y > c.y0 && y < c.y1) return true; }
      return false;
    };
    for (const sim of [false, true]) for (let i = 0; i <= 100; i++) {
      const p = i / 100, r = rotulosDoGrafico(p, sim);
      const dentroDaFaixa = p >= pRotulos - 1e-9 && p <= 1 - pRotulos + 1e-9;
      expect(r.valores.length).toBe(p > 0 && p < 1 && dentroDaFaixa ? 2 : 0);
      if (p === 0 || p === 1) expect(r.puro?.texto).toBe("Gini, entropia e erro: 0");
      if (!sim || i === 50) expect(r.taxa).not.toBeNull(); // o nome da taxa de erro só sai no modo simétrico
      const pontos = [giniP(p), entropiaP(p), taxaErroP(p)].map((v) => ({ x0: sx(p) - 10, x1: sx(p) + 10, y0: sy(v) - 10, y1: sy(v) + 10 }));
      for (const v of r.valores) {
        const c = v.caixa;
        expect(c.x0).toBeGreaterThanOrEqual(area.x0); expect(c.x1).toBeLessThanOrEqual(area.x1); expect(c.y1).toBeLessThanOrEqual(area.y1);
        expect(c.y0).toBeGreaterThanOrEqual(Math.abs(p - 0.5) <= 0.05 + 1e-9 ? 4 : area.y0); // perto de 50%, o valor pode ir ao lado do nome, acima do desenho
        expect(passa(giniP, c)).toBe(false); expect(passa(entropiaP, c)).toBe(false);
        for (const k of pontos) expect(cruza(c, k)).toBe(false);
        for (const k of r.fixas) expect(cruza(c, k)).toBe(false);
        for (const o of r.valores) if (o !== v) expect(cruza(c, o.caixa)).toBe(false);
        if (v.guia) expect(Math.hypot(v.guia.x2 - v.guia.x1, v.guia.y2 - v.guia.y1)).toBeLessThanOrEqual(70);
      }
      if (r.taxa) {
        // o nome da taxa de erro, deitado: nenhuma das três curvas entra no retângulo girado do texto
        const t = r.taxa, a = (t.graus * Math.PI) / 180, L = GEOMETRIA.taxa.comprimento, f = GEOMETRIA.taxa.fonte;
        for (const curva of [giniP, entropiaP, taxaErroP]) for (let x = sx(0); x <= sx(1); x++) {
          const dx = x - t.x, dy = sy(curva((x - sx(0)) / (sx(1) - sx(0)))) - t.y;
          const lx = dx * Math.cos(a) + dy * Math.sin(a), ly = -dx * Math.sin(a) + dy * Math.cos(a);
          expect(Math.abs(lx) <= L / 2 && ly >= -0.8 * f && ly <= 0.2 * f).toBe(false);
        }
        for (const v of r.valores) for (const k of t.caixas) expect(cruza(v.caixa, k)).toBe(false);
      }
    }
  });

  it("o quadro traz as fórmulas em KaTeX, as quatro células em 50% e a chance de errar igual ao Gini", () => {
    const html = renderToStaticMarkup(createElement(ImpurezaCurva, { pagina: { index: 4, total: 19 } }));
    expect(html).toContain('data-vz="impureza-curva"'); expect(html).toContain("04 / 19");
    expect(html.match(/class="katex"/g)?.length).toBeGreaterThanOrEqual(3); // Gini, entropia e a linha da chance de errar
    expect(html).toContain("<math"); // MathML para leitores de tela
    expect(html.match(/25,00%/g)).toHaveLength(4);
    expect(html).toContain("= 50,00%");
    expect(html).not.toContain("vz-formula"); // a fórmula em fonte monoespaçada saiu
    expect(html).toContain("im-curva--e"); expect(html).toContain("taxa de erro do nó"); expect(html).toContain("Taxa de erro do nó");
    expect(html).toContain(">0,5000<"); expect(html).toContain(">1,0000<"); // em 50%, cada valor ao lado do nome da curva
  });
});
