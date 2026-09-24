import { describe, expect, it } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { ATALHOS, cartoes, comIntercepto, curvaPerda, DELTA_INTERCEPTO, EIXO_Y_MAX, escore, fmt, fmtPct, formula, leitura, linhas, LN2, maiores, media, naZona, perdaDaProbabilidade, perdaDoLogit, proposta, PROPOSTAS, SELECAO_INICIAL, sigmoide, testeIntercepto } from "@/lib/visuais/log-loss";
import { AREA, LogLoss, rotulosDoGrafico } from "@/components/visuais/log-loss";

describe("c4p15: a log loss proposta a proposta", () => {
  it("usa as 16 propostas da base do capítulo, na ordem original", () => {
    expect(PROPOSTAS).toHaveLength(16);
    expect(linhas().map((l) => l.id)).toEqual(Array.from({ length: 16 }, (_, i) => i + 1));
    expect(proposta(2)).toMatchObject({ util: 25, atraso: 20, y: 1 });
    expect(proposta(15)).toMatchObject({ util: 90, atraso: 0, y: 0 });
  });

  it("a proposta 2 reproduz a PD e a perda da referência", () => {
    const l = proposta(2);
    expect(fmtPct(l.pd)).toBe("26,65%");
    expect(fmt(l.perda, 4)).toBe("1,3223");
    expect(l.pObservado).toBe(l.pd);
    expect(formula(l).regra).toBe("Perda = −ln(PD)"); expect(formula(l).contaTex).toBe(String.raw`-\ln(0{,}2665) \approx 1{,}3223`);
    expect(leitura(l)).toContain("Houve default");
  });

  it("numa proposta sem default a probabilidade do desfecho é 1 − PD", () => {
    const l = proposta(15);
    expect(l.y).toBe(0);
    expect(fmtPct(l.pd)).toBe("73,91%");
    expect(l.pObservado).toBeCloseTo(1 - l.pd, 15);
    expect(fmt(l.perda, 4)).toBe("1,3435");
    expect(formula(l).regra).toBe("Perda = −ln(1 − PD)"); expect(formula(l).contaTex).toBe(String.raw`-\ln(1 - 0{,}7391) \approx 1{,}3435`);
    expect(leitura(l)).toContain("Não houve default");
  });

  it("a forma pelo logit e a forma pela probabilidade coincidem em valores moderados", () => {
    for (const l of linhas()) expect(l.perda).toBeCloseTo(perdaDaProbabilidade(l.pd, l.y), 10);
  });

  it("a forma pelo logit continua estável em logits extremos", () => {
    for (const z of [-800, -40, 0, 40, 800]) for (const y of [0, 1]) {
      const v = perdaDoLogit(z, y);
      expect(Number.isFinite(v)).toBe(true); expect(v).toBeGreaterThanOrEqual(0);
    }
    expect(perdaDoLogit(-800, 1)).toBeCloseTo(800, 6);
    expect(Number.isFinite(perdaDaProbabilidade(sigmoide(-800), 1))).toBe(false); // a forma pela probabilidade satura
    expect(perdaDoLogit(0, 1)).toBeCloseTo(Math.LN2, 12);
  });

  it("a média é a soma das perdas dividida por 16", () => {
    const ls = linhas();
    expect(media(ls)).toBeCloseTo(ls.reduce((s, l) => s + l.perda, 0) / 16, 15);
    expect(fmt(media(ls), 5)).toBe("0,43282");
  });

  it("para y = 1 mais probabilidade reduz a perda; para y = 0 aumenta", () => {
    for (const p of [0.1, 0.3, 0.6, 0.9]) {
      const z = Math.log(p / (1 - p)), z2 = Math.log((p + 0.05) / (1 - p - 0.05));
      expect(perdaDoLogit(z2, 1)).toBeLessThan(perdaDoLogit(z, 1));
      expect(perdaDoLogit(z2, 0)).toBeGreaterThan(perdaDoLogit(z, 0));
    }
  });

  it("as três maiores perdas e a participação delas são derivadas, não fixadas", () => {
    const m = maiores();
    expect(m.ids).toEqual([15, 2, 10]);
    expect(fmt(m.participacao, 1)).toBe("55,6");
    expect(m.total).toBeCloseTo(media() * 16, 12);
  });

  it("o escore de cada proposta vem dos coeficientes da aula", () => {
    const l = proposta(11);
    expect(escore(l)).toBeCloseTo(0.24828, 5);
    expect(fmtPct(l.pd)).toBe("56,18%");
    expect(SELECAO_INICIAL).toBe(2);
    for (const a of ATALHOS) expect(PROPOSTAS.some((p) => p.id === a)).toBe(true);
  });

  it("acima de ln 2 ficam as propostas em que o modelo deu mais de 50% ao outro desfecho", () => {
    const zona = linhas().filter(naZona);
    expect(zona.map((l) => l.id).sort((a, b) => a - b)).toEqual([2, 5, 10, 15]);
    for (const l of linhas()) expect(naZona(l)).toBe(l.perda > LN2);
    expect(perdaDaProbabilidade(0.5, 1)).toBeCloseTo(LN2, 12); // as duas curvas se cruzam em PD = 50%, na perda ln 2
    expect(perdaDaProbabilidade(0.5, 0)).toBeCloseTo(LN2, 12);
  });

  it("as curvas vão da perda máxima desenhada a zero, cada uma num sentido", () => {
    const c1 = curvaPerda(1), c0 = curvaPerda(0);
    expect(c1[0].perda).toBeCloseTo(EIXO_Y_MAX, 9); expect(c1[c1.length - 1].perda).toBeCloseTo(0, 12);
    expect(c0[0].perda).toBeCloseTo(0, 12); expect(c0[c0.length - 1].perda).toBeCloseTo(EIXO_Y_MAX, 9);
    for (let i = 1; i < c1.length; i++) { expect(c1[i].perda).toBeLessThan(c1[i - 1].perda); expect(c0[i].perda).toBeGreaterThan(c0[i - 1].perda); }
    for (const l of [...linhas(), ...comIntercepto(DELTA_INTERCEPTO)]) expect(l.perda).toBeLessThan(EIXO_Y_MAX);
  });

  it("subir o intercepto em 0,5 melhora quem teve default, piora quem não teve, e a média sobe", () => {
    const t = testeIntercepto(2);
    expect(fmt(t.antes.perda, 4)).toBe("1,3223"); expect(fmt(t.depois.perda, 4)).toBe("0,9818");
    expect(fmtPct(t.depois.pd)).toBe("37,46%");
    expect(fmt(t.mediaAntes, 5)).toBe("0,43282"); expect(fmt(t.mediaDepois, 5)).toBe("0,45089");
    expect(t.valores).toBe("#2: 1,3223 → 0,9818 · média: 0,43282 → 0,45089");
    expect(t.frase).toBe("A #2 melhora, mas a média sobe: os coeficientes da aula já dão a menor.");
    const q = testeIntercepto(15);
    expect(fmt(q.depois.perda, 4)).toBe("1,7352");
    expect(q.frase).toBe("A #15 piora e a média sobe: os coeficientes da aula já dão a menor.");
    for (const l of comIntercepto(0.5)) { const a = proposta(l.id); if (l.y === 1) expect(l.perda).toBeLessThan(a.perda); else expect(l.perda).toBeGreaterThan(a.perda); }
    // os coeficientes da aula minimizam a média: deslocar o intercepto para qualquer lado a aumenta
    for (const d of [-0.5, -0.1, 0.1, 0.5]) expect(media(comIntercepto(d))).toBeGreaterThan(media());
  });

  it("os cartões usam a participação derivada das três maiores perdas", () => {
    expect(cartoes().map((c) => c.k)).toEqual(["Estimação", "Quem pesa", "Cuidado"]);
    expect(cartoes()[1].t).toBe("Com pesos iguais, as três maiores perdas somam 56% do total; reduzir uma pode aumentar outras.");
  });
});

describe("c4p15: o quadro desenhado", () => {
  it("põe as 16 propostas sobre as curvas, com botão acessível para cada uma", () => {
    const html = renderToStaticMarkup(createElement(LogLoss));
    expect(html.match(/class="ll-ponto /g)).toHaveLength(16);
    expect(html.match(/class="ll-alvo"/g)).toHaveLength(16);
    expect(html).toContain("Perda acima de ln 2 ≈ 0,69:");
    expect(html).toContain("Log loss média: 0,43282");
    expect(html).toContain("#2 · 1,32"); expect(html).toContain("#10 · 1,19"); expect(html).toContain("#15 · 1,34");
    expect(html).toContain('aria-label="−ln(0,2665) ≈ 1,3223"'); // a conta da perda, em KaTeX, com o texto como rótulo acessível
    expect(html).toContain('aria-label="Perda = −ln(PD)"'); expect(html).toContain('aria-label="Perda = −ln(1 − PD)"');
    expect(html.match(/class="katex"/g)).toHaveLength(3); // as duas fórmulas da faixa e a conta do painel
    expect(html).not.toContain("ll-barra");
  });

  it("em qualquer escolha, os rótulos ficam dentro do gráfico e não cobrem textos fixos, outros rótulos nem outros pontos", () => {
    const cruza = (a: { x0: number; x1: number; y0: number; y1: number }, b: typeof a) => a.x0 < b.x1 && b.x0 < a.x1 && a.y0 < b.y1 && b.y0 < a.y1;
    for (const p of PROPOSTAS) {
      const rs = rotulosDoGrafico(p.id);
      expect(rs.length).toBe(maiores().ids.includes(p.id) ? 3 : 4);
      for (const r of rs) {
        const c = r.caixa;
        expect(c.x0).toBeGreaterThanOrEqual(AREA.x0); expect(c.x1).toBeLessThanOrEqual(AREA.x1);
        expect(c.y0).toBeGreaterThanOrEqual(AREA.y0); expect(c.y1).toBeLessThanOrEqual(AREA.y1);
        for (const f of AREA.fixas) expect(cruza(c, f)).toBe(false);
        for (const o of rs) if (o !== r) expect(cruza(c, o.caixa)).toBe(false);
        for (const q of AREA.pontos) if (q.id !== r.id) expect(cruza(c, { x0: q.x - 10, x1: q.x + 10, y0: q.y - 10, y1: q.y + 10 })).toBe(false);
      }
    }
  });
});

