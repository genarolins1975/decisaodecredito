import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import katex from "katex";
import did from "@/lib/visuais/did.json";
import type { Proposta } from "@/lib/visuais/logistica";
import { boostingClassificacao, boostingRegressao, PONTOS } from "@/lib/visuais/boosting";
import { fmtNum } from "@/lib/visuais/metricas";
import { paraTex } from "@/lib/visuais/tex";
import { curto } from "@/components/visuais/tex";
import { PalpiteConstante } from "@/components/visuais/palpite-constante";
import { ErroComoAlvo } from "@/components/visuais/erro-como-alvo";
import { SomaEmLogOdds } from "@/components/visuais/soma-em-log-odds";
import { OitoPontos } from "@/components/visuais/oito-pontos";
import { EtaEArvores, NOTAS } from "@/components/visuais/eta-e-arvores";
import { PerdaQueCai, posicoesDasPds } from "@/components/visuais/perda-que-cai";

const BASE = did.base as Proposta[];
const katexes = (html: string) => (html.match(/class="katex"/g) ?? []).length;
const trechos = (t: string) => t.split("$").filter((_, i) => i % 2 === 1);
const ETAS = Array.from({ length: 10 }, (_, i) => (i + 1) / 10); // controle de 0,1 a 1

describe("capítulo 6: fórmulas e contas em KaTeX (c6p1 a c6p16, c6p20) e rótulos do plano (c6p12 a c6p14)", () => {
  it("toda fórmula TeX renderiza sem erro, em qualquer estado dos controles", () => {
    const fs: string[] = [...NOTAS.flatMap(trechos)];
    for (const eta of ETAS) {
      const reg = boostingRegressao(PONTOS.x, PONTOS.y, eta, 4); // c6p7 a c6p9: corte da árvore e η na frase de estado
      for (const p of reg.slice(1)) { const c = p.arvore?.corte?.valor; if (c !== undefined) fs.push(`x = ${paraTex(c.toLocaleString("pt-BR"))}`); }
      fs.push(String.raw`\eta = ${paraTex(eta.toLocaleString("pt-BR"))}`, String.raw`\eta = ${paraTex(eta.toLocaleString("pt-BR", { minimumFractionDigits: 1 }))}`);
    }
    const F0 = PONTOS.y.reduce((s, v) => s + v, 0) / PONTOS.y.length; // c6p3: cada um dos oito pontos na frase de estado
    PONTOS.x.forEach((x, i) => { const e = PONTOS.y[i] - F0; fs.push(String.raw`\boldsymbol{x = ${x}}`, String.raw`\boldsymbol{y = ${paraTex(fmtNum(PONTOS.y[i], 1))}}`, String.raw`y - ${paraTex(fmtNum(F0, 1))} = ${paraTex(`${e > 0 ? "+" : e < 0 ? "−" : ""}${fmtNum(Math.abs(e), 1)}`)}`); });
    expect(fs.length).toBeGreaterThan(40);
    for (const t of fs) {
      expect(() => katex.renderToString(t, { throwOnError: true, strict: "ignore" }), t).not.toThrow();
      expect(t, t).not.toMatch(/(^|[^\\])%/);
      expect(t, t).not.toMatch(/\d,\d/);
      expect(t, t).not.toContain("−");
    }
  });

  it("os quadros desenham as contas em KaTeX, com o texto como rótulo acessível onde a conta é bloco próprio", () => {
    const c6p3 = renderToStaticMarkup(createElement(OitoPontos));
    expect(katexes(c6p3)).toBeGreaterThanOrEqual(3); // x, y e o erro inicial no estado, e os trechos da legenda
    const c6p4 = renderToStaticMarkup(createElement(PalpiteConstante));
    expect(c6p4).toContain('aria-label="52,0 ÷ 8 = 6,50"');
    const c6p5 = renderToStaticMarkup(createElement(ErroComoAlvo));
    expect(c6p5).toContain('aria-label="12,00 − 6,50 = +5,50"'); expect(c6p5).not.toContain("src/lib");
    const c6p11 = renderToStaticMarkup(createElement(SomaEmLogOdds, {}));
    expect(c6p11).toMatch(/class="vz-sl-formula" role="img"/); expect(c6p11).not.toContain("<sub>"); // as três fórmulas da faixa em KaTeX
    const c6p16 = renderToStaticMarkup(createElement(EtaEArvores));
    expect(c6p16).not.toContain("src/lib"); expect(katexes(c6p16)).toBeGreaterThanOrEqual(3);
    const c6p13 = renderToStaticMarkup(createElement(PerdaQueCai, { modo: "iteracoes" }));
    expect(c6p13).toContain("0,6219"); expect(katexes(c6p13)).toBeGreaterThanOrEqual(1); // η no estado
  });

  it("igualdade curta em frase é marcada para não quebrar; a fórmula longa pode quebrar", () => {
    expect(curto(String.raw`\eta = 0{,}5`)).toBe(true); expect(curto("x = 8")).toBe(true);
    expect(curto(String.raw`\beta = (-5{,}6666;\ 0{,}7453;\ 1{,}3955)`)).toBe(true);
    expect(curto(String.raw`\text{ganho} = \text{Gini antes} - \text{média ponderada do Gini dos dois lados}`)).toBe(false);
  });

  it("no plano das 16 propostas, nenhum rótulo de PD encosta noutro nem num ponto, em qualquer árvore e qualquer η", () => {
    const px = (u: number) => 46 + (u / 100) * (420 - 46 - 17), py = (a: number) => 12 + (1 - a / 60) * (340 - 12 - 40);
    const larg = (t: string) => 6.2 * t.length + 2;
    for (const eta of ETAS) for (const ps of boostingClassificacao(BASE, eta, 4)) for (const raio of [9, 11]) {
      const pontos = BASE.map((b, i) => ({ x: px(b.util), y: py(b.atraso), texto: `${Math.round(ps.p[i] * 100)}%` }));
      const pos = posicoesDasPds(pontos, raio);
      const caixas = pos.map((q, i) => { const w = larg(pontos[i].texto), x0 = q.ancora === "middle" ? q.x - w / 2 : q.ancora === "start" ? q.x : q.x - w; return { x0, x1: x0 + w, y0: q.y - 9, y1: q.y }; });
      for (let a = 0; a < caixas.length; a++) for (let b = a + 1; b < caixas.length; b++) {
        const A = caixas[a], B = caixas[b];
        expect(A.x0 < B.x1 && B.x0 < A.x1 && A.y0 < B.y1 && B.y0 < A.y1, `η ${eta}: #${a + 1} × #${b + 1}`).toBe(false);
      }
    }
  });

  it("sem notação crua no texto do c6p10, no rótulo da fórmula, na questão c6p10q e nas notas do professor; a conta do caso x = 8 em KaTeX", () => {
    const ex = JSON.parse(readFileSync("content/generated/extract.json", "utf8"));
    const c10 = ex.pages.find((p: { id: string }) => p.id === "c6p10");
    expect(JSON.stringify(c10.guia)).not.toMatch(/[A-Za-z]_\{|[a-z]_[a-z]/);
    expect(c10.html).toContain(String.raw`\(6{,}50 + 0{,}5 \times 2{,}875 = 7{,}94\)`);
    // a fórmula em bloco é lida pelo rótulo acessível, que o baralho tira do texto do bloco: falado, não em notação crua
    const rotulos = [...c10.html.matchAll(/class="formula"[^>]*aria-label="([^"]*)"/g)].map((m) => m[1]);
    expect(rotulos).toEqual(["F m de x igual a F m menos 1 de x mais eta vezes h m de x"]);
    for (const m of c10.html.matchAll(/\\\(([\s\S]+?)\\\)/g)) expect(() => katex.renderToString(m[1], { throwOnError: true, strict: "ignore" }), m[1]).not.toThrow();
    const cur = JSON.parse(readFileSync("content/questoes-curadas.json", "utf8"));
    expect(JSON.stringify(cur.questoes.find((q: { slug: string }) => q.slug === "c6p10q"))).not.toMatch(/[A-Za-z]_\{|[a-z]_[a-z]/);
  });
});
