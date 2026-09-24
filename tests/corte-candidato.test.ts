import { describe, expect, it } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { avaliar, cartoes, comparacaoSimples, conta, CORTES, fmtCorte, indiceDe, leitura, MELHOR, TODOS } from "@/lib/visuais/corte-candidato";
import { CorteCandidato } from "@/components/visuais/corte-candidato";

describe("c5p6: avaliar um corte candidato", () => {
  it("os candidatos são os pontos médios: 15 em utilização e 6 em atraso, 21 ao todo; o melhor é utilização ≤ 57,5%", () => {
    expect(CORTES.util).toHaveLength(15); expect(CORTES.atraso).toEqual([2.5, 7.5, 15, 22.5, 27.5, 35]); expect(TODOS).toHaveLength(21);
    expect(MELHOR.v).toBe("util"); expect(MELHOR.corte).toBe(57.5); expect(MELHOR.ganho).toBeCloseTo(0.28125, 12);
    expect(indiceDe("util", 62.5)).toBe(8); expect(fmtCorte("util", 62.5)).toBe("62,5%"); expect(fmtCorte("atraso", 15)).toBe("15 d");
  });

  it("a conta do exemplo, 62,5%: 9 com 2 defaults e 7 com 6; média ponderada 0,30159 e ganho 0,19841", () => {
    const a = avaliar("util", 62.5);
    expect([a.nE, a.dE, a.nD, a.dD]).toEqual([9, 2, 7, 6]);
    expect(a.giniEsq).toBeCloseTo(0.34568, 5); expect(a.giniDir).toBeCloseTo(0.2449, 5); expect(a.depois).toBeCloseTo(0.30159, 5); expect(a.ganho).toBeCloseTo(0.19841, 5);
    const c = conta(a);
    expect(c.depois).toBe(String.raw`\tfrac{9}{16} \times 0{,}34568 + \tfrac{7}{16} \times 0{,}24490 = 0{,}30159`);
    expect(c.ganho).toBe(String.raw`0{,}50000 - 0{,}30159 = \mathbf{0{,}19841}`);
  });

  it("a ponderação: em 22,5% o lado puro pesa 1/16 e o ganho é 0,03333; sem ponderar seria 0,25111; em 57,5% as duas médias coincidem", () => {
    const puro = avaliar("util", 22.5), meio = avaliar("util", 57.5), zero = avaliar("util", 27.5);
    expect(puro.ganho).toBeCloseTo(0.03333, 5); expect(puro.ganhoSimples).toBeCloseTo(0.25111, 5);
    expect(comparacaoSimples(puro)).toBe("Sem ponderar, o ganho seria 0,25111, 7,5 vezes o correto: o lado de 1 contaria como metade do grupo.");
    expect(comparacaoSimples(meio)).toContain("as duas médias coincidem");
    expect(comparacaoSimples(avaliar("util", 62.5))).toContain("perto do correto");
    expect(zero.ganho).toBeCloseTo(0, 12);
    for (const a of TODOS) expect(a.ganho).toBeGreaterThanOrEqual(-1e-12); // a média ponderada nunca passa do Gini de antes
  });

  it("a leitura e os cartões usam as contas", () => {
    expect(leitura(avaliar("util", 57.5))).toContain("O maior ganho de toda a raiz");
    expect(leitura(avaliar("util", 27.5))).toContain("Ganho zero");
    expect(leitura(avaliar("util", 22.5))).toBe("Um lado ficou puro, mas pesa só 1 em 16: o ganho é pequeno.");
    expect(leitura(avaliar("util", 62.5))).toContain("há corte melhor");
    expect(cartoes().map((k) => k.t)).toEqual([
      "Em 22,5%, o lado puro tem 1 proposta, peso 1/16: ganho de só 0,03333.",
      "Em 27,5%, os dois lados seguem meio a meio: o corte não informa nada.",
      "Utilização ≤ 57,5%, ganho 0,28125. A próxima página confere os 21 candidatos.",
    ]);
  });

  it("o quadro traz a lista ordenada com os 15 candidatos, a árvore da conta e as fórmulas em KaTeX", () => {
    const html = renderToStaticMarkup(createElement(CorteCandidato, { pagina: { index: 6, total: 19 } }));
    expect(html).toContain('data-vz="corte-candidato"'); expect(html).toContain("06 / 19");
    expect(html.match(/class="ct-item /g)).toHaveLength(16); expect(html.match(/class="ct-cand( ct-cand--on)?"/g)).toHaveLength(15);
    expect(html).toContain("corte ≤ 62,5%"); expect(html).toContain("peso 9/16"); expect(html).toContain("peso 7/16");
    expect(html.match(/class="katex"/g)?.length).toBeGreaterThanOrEqual(4);
    expect(html).not.toContain("vz-formula"); expect(html).not.toContain("vz-cc-");
  });
});
