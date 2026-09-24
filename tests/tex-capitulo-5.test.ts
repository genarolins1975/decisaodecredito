import { describe, expect, it } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import katex from "katex";
import did from "@/lib/visuais/did.json";
import type { Proposta } from "@/lib/visuais/logistica";
import { avaliarCorte, cortesCandidatos, VARIAVEIS } from "@/lib/visuais/arvore";
import { fmtNum } from "@/lib/visuais/metricas";
import { fmtPct, giniP, TEX_ERRO } from "@/lib/visuais/impureza";
import { paraTex, pctTex } from "@/lib/visuais/tex";
import { Anatomia } from "@/components/visuais/anatomia";
import { ArvoreQueCresce, contaGanho } from "@/components/visuais/arvore-que-cresce";
import { ImpurezaCurva } from "@/components/visuais/impureza-curva";
import { ValorDaFolha } from "@/components/visuais/valor-da-folha";
import { Poda } from "@/components/visuais/poda";
import { DuasFamilias } from "@/components/visuais/duas-familias";

const BASE = did.base as Proposta[];
const katexes = (html: string) => (html.match(/class="katex"/g) ?? []).length;

/** A conta do ganho em todos os candidatos que a tela alcança: base completa ou sem cada proposta, nas duas variáveis. */
function contasDeGanho() {
  const out: { texto: string; tex: string }[] = [];
  for (const fora of [null, ...BASE.map((p) => p.id)]) {
    const base = BASE.filter((p) => p.id !== fora);
    for (const v of VARIAVEIS) for (const c of cortesCandidatos(base, v)) out.push(contaGanho(avaliarCorte(base, v, c), base.length));
  }
  return out;
}

describe("capítulo 5: contas e fórmulas em KaTeX (c5p3, c5p4, c5p7, c5p12, c5p14, c5p15, c5p16, c5p18)", () => {
  it("toda fórmula TeX renderiza sem erro, em qualquer estado dos controles", () => {
    const fs: string[] = contasDeGanho().map((c) => c.tex);
    for (let i = 0; i <= 100; i++) fs.push(String.raw`${TEX_ERRO} = \mathbf{${pctTex(fmtPct(giniP(i / 100), 2))}}`); // c5p4, controle de 0% a 100%
    for (let a = 0; a <= 350; a += 5) fs.push(String.raw`\boldsymbol{\alpha = ${paraTex(fmtNum(a / 1000, 3))}}`); // c5p15, α de 0 a 0,35
    fs.push(String.raw`1 \div 2 = \mathbf{${pctTex(fmtPct(0.5, 1))}}`, String.raw`\boldsymbol{y = 0}`, String.raw`\boldsymbol{y = 1}`);
    expect(fs.length).toBeGreaterThan(300);
    for (const t of fs) {
      expect(() => katex.renderToString(t, { throwOnError: true, strict: "ignore" }), t).not.toThrow();
      expect(t, t).not.toMatch(/(^|[^\\])%/); // % solto é comentário em TeX e cortaria a fórmula em silêncio
      expect(t, t).not.toMatch(/\d,\d/); // vírgula decimal sem proteção vira pontuação no KaTeX
      expect(t, t).not.toContain("−"); // o sinal de menos do TeX é o hífen, que o KaTeX desenha como menos
    }
  });

  it("a conta do ganho em texto, usada como rótulo acessível, é a de antes (c5p6, c5p7)", () => {
    const c = contaGanho(avaliarCorte(BASE, "util", 62.5), 16);
    expect(c.texto).toBe("0,50000 − (9 ÷ 16 × 0,3457 + 7 ÷ 16 × 0,2449) = 0,19841");
    expect(c.tex).toBe(String.raw`0{,}50000 - (9 \div 16 \times 0{,}3457 + 7 \div 16 \times 0{,}2449) = \mathbf{0{,}19841}`);
  });

  it("os quadros desenham as contas em KaTeX, com o texto como rótulo acessível onde a conta é bloco próprio", () => {
    const c5p3 = renderToStaticMarkup(createElement(Anatomia));
    expect(katexes(c5p3)).toBe(3); // o d do controle e, na frase, o d e o 2^d
    const c5p4 = renderToStaticMarkup(createElement(ImpurezaCurva, {}));
    expect(c5p4).toContain('aria-label="Pr(erro) = 2p(1 − p) = 50,00%"');
    const c5p7 = renderToStaticMarkup(createElement(ArvoreQueCresce, { modo: "raiz" }));
    expect(c5p7).toContain('aria-label="0,50000 − (9 ÷ 16 × 0,3457 + 7 ÷ 16 × 0,2449) = 0,19841"');
    expect(katexes(c5p7)).toBe(2); // a conta do candidato e, na legenda, ganho = Gini antes − média ponderada
    const c5p12 = renderToStaticMarkup(createElement(ValorDaFolha));
    expect(c5p12).toContain('class="tx-inteira" role="img" aria-label="1 ÷ 2 = 50,0%"'); // conta curta: não quebra entre o sinal e o valor
    expect(katexes(c5p12)).toBe(4); // a conta e, na legenda, a fórmula da perda, d = 1 e n = 2
    const c5p15 = renderToStaticMarkup(createElement(Poda));
    expect(katexes(c5p15)).toBe(7); // α atual e as duas trocas no estado, a fórmula do custo e as três da legenda
    expect(c5p15).toContain("α atual · vence profundidade 3, folhas de 1"); // o nome da vencedora na faixa de cima do gráfico
    const c5p18 = renderToStaticMarkup(createElement(DuasFamilias));
    expect(katexes(c5p18)).toBe(4); // o y da proposta no estado e os três da legenda
  });
});
