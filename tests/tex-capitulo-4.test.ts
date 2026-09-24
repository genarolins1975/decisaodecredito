import { describe, expect, it } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import katex from "katex";
import * as ls from "@/lib/visuais/logit-slides";
import * as cf from "@/lib/visuais/coeficiente-pd";
import * as ro from "@/lib/visuais/razao-de-chances";
import * as ip from "@/lib/visuais/impacto-pd";
import * as uc from "@/lib/visuais/unidade-coeficiente";
import * as gp from "@/lib/visuais/gradiente-passo";
import { LogitSlides } from "@/components/visuais/logit-slides";
import { CoeficientePd } from "@/components/visuais/coeficiente-pd";
import { RazaoDeChances } from "@/components/visuais/razao-de-chances";
import { ImpactoPd } from "@/components/visuais/impacto-pd";
import { UnidadeCoeficiente } from "@/components/visuais/unidade-coeficiente";
import { GradientePasso } from "@/components/visuais/gradiente-passo";

/** Trechos entre cifrões de uma frase com fórmulas em linha (ComTex). */
const trechos = (t: string) => t.split("$").filter((_, i) => i % 2 === 1);

/** Todas as fórmulas TeX dos seis quadros, nas faixas que cada controle alcança. */
function todas(): string[] {
  const f: string[] = [ls.FORMULA_Z_TEX, ls.FORMULA_PD_TEX, ls.FORMULA_PNOVO_TEX, ls.FORMULA_M_TEX, ...trechos(ls.FRASE_COEFICIENTE)];
  for (let u = 0; u <= 100; u++) f.push(ls.contaUnidade(u, "util").tex);
  for (let a = 0; a <= 30; a++) f.push(ls.contaUnidade(a, "atraso").tex);
  for (let u = 0; u <= 100; u += 5) for (let a = 0; a <= 30; a += 5) { const p = ls.proposta(u, a); f.push(ls.escoreTex(p.z), ...p.parcelas.map((q) => q.contaTex).filter(Boolean)); }
  for (let d = -20; d <= 20; d++) { const e = ls.efeitoCoeficiente(d); f.push(ls.potenciaTex(e.dz, e.m), ...trechos(ls.fraseDeltaX(d))); }
  f.push(...cf.SITUACAO.flatMap((s) => (s.tex ? [s.tex] : [])), ...cf.contas().map((c) => c.tex), ...cf.ALTERNATIVAS.flatMap((a) => trechos(a.feedback)), ...trechos(cf.SINTESE_DEPOIS));
  f.push(...ro.CAMINHO.map((c) => c.tex), ...ro.etapas().map((e) => e.contaTex));
  f.push(...ip.EXPERIMENTO.flatMap((e) => (e.tex ? [e.tex] : [])), ip.CONTA_TEX, ...trechos(ip.CONTA_L), ...trechos(ip.RODAPE));
  f.push(...uc.UNIDADES.map((u) => u.definicaoTex));
  for (let u = 0; u <= 100; u++) { const r = uc.resultado(u); f.push(uc.somaTex(r), uc.escoreTex(r.z)); }
  const c = uc.comparacaoOdds(); f.push(...c.itens.map((i) => uc.deltaXTex(i.dx)), uc.efeitoTex(c.efeito), uc.orTex(c.or));
  f.push(...gp.FORMULAS.map((x) => x.tex), gp.REGRA_TEX, gp.ETA_TEX, ...trechos(gp.NOTA_UNIDADES), ...trechos(gp.LEGENDA_GRAF), ...trechos(gp.DESTAQUE_GRAF));
  let beta = gp.BETA_ZERO;
  for (let it = 0; it <= 40; it++) {
    const e = gp.estado(beta), ex = gp.exemploUtilizacao(e, it);
    f.push(gp.coeficientesTex(e.beta), ex.gTex, ex.contaTex, ...e.g.map((g) => `= ${gp.fmt5Tex(g)}`));
    beta = gp.aplicar(e);
  }
  return f;
}

describe("capítulo 4: fórmulas e contas de c4p1, c4p10, c4p11, c4p12, c4p14 e c4p16 em KaTeX", () => {
  it("toda fórmula TeX renderiza sem erro, em qualquer estado dos controles", () => {
    const fs = todas();
    expect(fs.length).toBeGreaterThan(400);
    for (const t of fs) {
      expect(() => katex.renderToString(t, { throwOnError: true, strict: "ignore" }), t).not.toThrow();
      expect(t, t).not.toMatch(/(^|[^\\])%/); // % solto é comentário em TeX e cortaria a fórmula em silêncio
      expect(t, t).not.toMatch(/\d,\d/); // vírgula decimal sem proteção vira pontuação no KaTeX
      expect(t, t).not.toContain("−"); // o sinal de menos do TeX é o hífen, que o KaTeX desenha como menos
    }
  });

  it("as versões em texto, usadas como rótulo acessível, continuam as de antes", () => {
    expect(ls.contaUnidade(70, "util").texto).toBe("70% ÷ 10 pp = 7,0 unidades");
    expect(ls.contaUnidade(10, "util").texto).toBe("10% ÷ 10 pp = 1,0 unidade");
    expect(ls.contaUnidade(5, "atraso").texto).toBe("5 dias ÷ 10 dias = 0,5 unidades");
    expect(ls.contaUnidade(1, "atraso").texto).toBe("1 dia ÷ 10 dias = 0,1 unidades");
    expect(ls.escoreTexto(ls.proposta(70, 5).z)).toBe("z ≈ 0,2483");
    const e = ls.efeitoCoeficiente(10); expect(ls.potenciaTexto(e.dz, e.m)).toBe("e^0,7453 ≈ 2,11");
    expect(ls.potenciaTex(e.dz, e.m)).toBe(String.raw`e^{0{,}7453} \approx 2{,}11`);
    const menos = ls.efeitoCoeficiente(-10); expect(ls.potenciaTex(menos.dz, menos.m)).toBe(String.raw`e^{-0{,}7453} \approx 0{,}47`);
    expect(ls.fraseDeltaX(10)).toBe(String.raw`$\Delta x$ em unidades de 10 pp: $+10\ \text{pp} = +1{,}0\ \text{unidade}$.`);
    expect(cf.contas().map((c) => c.texto)).toEqual(["Δx = (80 − 70) ÷ 10 = 1", "Δz = β × 1 = 0,7453"]);
    expect(ro.etapas().map((x) => x.contaTex)).toEqual([String.raw`\text{odds}_0 = 0{,}10 \div 0{,}90`, String.raw`\text{odds}_1 = \text{odds}_0 \times 2{,}1071`, String.raw`\mathrm{PD}_1 = \text{odds}_1 \div (1 + \text{odds}_1)`]);
    expect(uc.somaTexto(uc.resultado(70))).toBe("−5,6666 + 5,2171 + 0,6978");
    expect(uc.somaTex(uc.resultado(70))).toBe(String.raw`-5{,}6666 + 5{,}2171 + 0{,}6978`);
    const c = uc.comparacaoOdds(); expect(c.itens.map((i) => uc.deltaXTexto(i.dx))).toEqual(["Δx = 1", "Δx = 10", "Δx = 0,1"]);
    expect(uc.efeitoTexto(c.efeito)).toBe("β × Δx = 0,7453"); expect(uc.orTexto(c.or)).toBe("OR = exp(β × Δx) ≈ 2,11");
    const e0 = gp.estado(gp.BETA_ZERO), ex = gp.exemploUtilizacao(e0, 0);
    expect(gp.coeficientesTexto(e0.beta)).toBe("β₀ = β₁ = β₂ = 0"); expect(ex.gTexto).toBe("g₁ = −0,59375"); expect(ex.conta).toBe("−0,10 × (−0,59375) ≈ +0,05938");
    expect(ex.contaTex).toBe(String.raw`-0{,}10 \times (-0{,}59375) \approx +0{,}05938`);
    expect(gp.coeficientesTexto(gp.aplicar(e0))).toBe("β = (0,00000; 0,05938; 0,02344)");
  });

  it("os seis quadros desenham as fórmulas em KaTeX, com o texto como rótulo acessível", () => {
    const c4p1 = renderToStaticMarkup(createElement(LogitSlides, {}));
    for (const r of ["z = β₀ + β₁x₁ + β₂x₂", "PD = 1 ÷ (1 + e^(−z))", "z ≈ 0,2483", "0,7453 × 7,0", "1,3955 × 0,5", "70% ÷ 10 pp = 7,0 unidades", "5 dias ÷ 10 dias = 0,5 unidades", "e^0,7453 ≈ 2,11"]) expect(c4p1).toContain(`aria-label="${r}"`);
    expect(c4p1).not.toContain("rl-frac"); expect(c4p1).not.toContain("<sub>");
    expect(c4p1.match(/class="katex"/g)!.length).toBeGreaterThanOrEqual(13); // 8 fórmulas e contas, as 2 da conta oculta e os 3 trechos em linha
    const c4p10 = renderToStaticMarkup(createElement(CoeficientePd, {}));
    expect(c4p10).toContain('aria-label="β = 0,7453"'); expect(c4p10.match(/class="katex"/g)).toHaveLength(1); // as contas só aparecem depois de conferir
    const c4p11 = renderToStaticMarkup(createElement(RazaoDeChances, {}));
    for (const r of ["odds = p ÷ (1 − p)", "novas odds = odds × OR", "nova PD = novas odds ÷ (1 + novas odds)"]) expect(c4p11).toContain(`aria-label="${r}"`);
    expect(c4p11.match(/class="katex"/g)).toHaveLength(3);
    const c4p12 = renderToStaticMarkup(createElement(ImpactoPd, {}));
    expect(c4p12).toContain('aria-label="Δz = +0,7453"'); expect(c4p12.match(/class="katex"/g)).toHaveLength(2); // o Δz e a fórmula do rodapé; a conta abre sob demanda
    const c4p14 = renderToStaticMarkup(createElement(UnidadeCoeficiente, {}));
    expect(c4p14).toContain('aria-label="−5,6666 + 5,2171 + 0,6978"'); expect(c4p14).toContain('aria-label="z ≈ 0,2483"');
    expect(c4p14.match(/class="katex"/g)).toHaveLength(2); // a definição de x e a razão de odds abrem sob demanda
    const c4p16 = renderToStaticMarkup(createElement(GradientePasso, {}));
    for (const r of ["β₀ = β₁ = β₂ = 0", "g₀ = média(p − y) = 0,00000", "g₁ = média[(p − y) × (u/10)] = −0,59375", "g₂ = média[(p − y) × (a/10)] = −0,23438", "g₁ = −0,59375", "−0,10 × (−0,59375) ≈ +0,05938", "β novo = β atual − ηg", "η = 0,10"]) expect(c4p16).toContain(`aria-label="${r}"`);
    expect(c4p16.match(/class="katex"/g)).toHaveLength(15); // 1 + 3 × 2 + 2 + 2 fórmulas e contas, e os 4 símbolos da legenda
  });
});
