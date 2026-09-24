import { describe, expect, it } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { A, ATALHOS, B, comparacao, cruzamento, dobrasTruncada, DOMINIO, equacao, equacaoTex, fmt, fmtPct, fmtPp, forasDoIntervalo, fraseLimites, leitura, PASSO_COMPARACAO, POR_PP, previsao, previsaoTruncada, trechoValido, truncar, UTIL_INICIAL, validarUtil, ZONA_ABAIXO, ZONA_ACIMA } from "@/lib/visuais/reta-na-probabilidade";
import { BETA_AULA } from "@/lib/visuais/logistica";
import { RetaNaProbabilidade } from "@/components/visuais/reta-na-probabilidade";

describe("c4p2: a reta ajustada na probabilidade", () => {
  it("usa a reta de mínimos quadrados do projeto, não os coeficientes da logística", () => {
    expect(A).toBeCloseTo(-0.142647, 6);
    expect(B).toBeCloseTo(1.117647, 6);
    expect(POR_PP).toBeCloseTo(0.0111765, 7);
    expect(B).not.toBeCloseTo(BETA_AULA[1], 3);
    expect(A).not.toBeCloseTo(BETA_AULA[0], 3);
    expect(equacao()).toBe("p(u) = −0,1426 + 0,011176 × u"); expect(equacaoTex()).toBe(String.raw`p(u) = -0{,}1426 + 0{,}011176 \times u`);
  });

  it("a previsão sai do intervalo válido pelas duas pontas do domínio", () => {
    expect(DOMINIO).toEqual([0, 120]);
    expect(previsao(0)).toBeLessThan(0);
    expect(fmtPct(previsao(UTIL_INICIAL))).toBe("−8,68%");
    expect(leitura(UTIL_INICIAL)).toMatchObject({ valida: false, lado: "abaixo" });
    expect(leitura(UTIL_INICIAL).frase).toBe("Abaixo de 0%: não é probabilidade.");
    expect(leitura(110).frase).toBe("Acima de 100%: não é probabilidade.");
    expect(leitura(50).valida).toBe(true);
    expect(fmtPct(previsao(100))).toBe("97,50%");
    expect(fmtPct(previsao(110))).toBe("108,68%");
    expect(leitura(110)).toMatchObject({ valida: false, lado: "acima" });
    expect(fmtPct(previsao(120))).toBe("119,85%");
    // simetria em torno de 57,5% de utilização, onde a reta prevê 50%: 5% e 110% ficam 8,68 pp fora, cada um de um lado
    expect(previsao(57.5)).toBeCloseTo(0.5, 12);
    expect(previsao(UTIL_INICIAL) + previsao(110)).toBeCloseTo(1, 12);
  });

  it("declara os dois trechos fora do intervalo e o trecho válido entre os cruzamentos", () => {
    const fora = forasDoIntervalo();
    expect(fora).toHaveLength(2);
    expect(fora[0]).toMatchObject({ lado: "abaixo", de: 0 });
    expect(fora[0].ate).toBeCloseTo(12.7632, 3);
    expect(fora[1]).toMatchObject({ lado: "acima", ate: 120 });
    expect(fora[1].de).toBeCloseTo(102.2368, 3);
    expect(cruzamento(0)).toBeCloseTo(12.7632, 3);
    expect(cruzamento(1)).toBeCloseTo(102.2368, 3);
    const v = trechoValido();
    expect(v.de).toBeCloseTo(12.7632, 3); expect(v.ate).toBeCloseTo(102.2368, 3);
    expect(dobrasTruncada().map((u) => Number(u.toFixed(2)))).toEqual([0, 12.76, 102.24, 120]);
    expect(fraseLimites()).toBe("Abaixo de 12,8% de utilização a previsão é negativa; acima de 102,2%, passa de 100%.");
  });

  it("os atalhos levam a um ponto de cada zona", () => {
    expect(ATALHOS).toEqual([5, 60, 110]);
    expect(leitura(ATALHOS[0]).lado).toBe("abaixo");
    expect(leitura(ATALHOS[1]).valida).toBe(true);
    expect(leitura(ATALHOS[2]).lado).toBe("acima");
  });

  it("o truncamento preserva a previsão no interior e a fixa nos limites", () => {
    expect(previsaoTruncada(5)).toBe(0);
    expect(previsaoTruncada(110)).toBe(1);
    expect(previsaoTruncada(50)).toBeCloseTo(previsao(50), 15);
    expect(previsaoTruncada(100)).toBeCloseTo(previsao(100), 15);
    expect(truncar(-0.5)).toBe(0); expect(truncar(1.5)).toBe(1); expect(truncar(0.4)).toBe(0.4);
    for (let u = 0; u <= 120; u++) { const t = previsaoTruncada(u); expect(t).toBeGreaterThanOrEqual(0); expect(t).toBeLessThanOrEqual(1); }
  });

  it("na reta o incremento de 10 pp é sempre o mesmo e na truncada não", () => {
    for (const u of [0, 5, 20, 50, 80, 90, 100, 110]) {
      const c = comparacao(u);
      expect(c.possivel).toBe(true);
      if (c.possivel) expect(c.deltaLinear).toBeCloseTo(POR_PP * PASSO_COMPARACAO * 100, 10);
    }
    const noPlano = comparacao(UTIL_INICIAL); // 5% → 15%: sai do trecho plano de baixo no meio do caminho
    const noTeto = comparacao(100); // 100% → 110%: entra no trecho plano de cima no meio do caminho
    const todoPlano = comparacao(0);
    const todoTeto = comparacao(110);
    const noInterior = comparacao(50);
    if (noPlano.possivel && noTeto.possivel && noInterior.possivel && todoPlano.possivel && todoTeto.possivel) {
      expect(noPlano.deltaTruncada).toBeLessThan(noPlano.deltaLinear);
      expect(noPlano.iguais).toBe(false);
      expect(noInterior.iguais).toBe(true);
      expect(fmtPp(noInterior.deltaLinear)).toBe("+11,18 pp");
      expect(fmtPp(noPlano.deltaTruncada)).toBe("+2,50 pp");
      expect(fmtPp(noTeto.deltaTruncada)).toBe("+2,50 pp");
      expect(fmtPp(todoPlano.deltaTruncada)).toBe("0,00 pp"); // os dois pontos no trecho plano de baixo
      expect(fmtPp(todoTeto.deltaTruncada)).toBe("0,00 pp"); // os dois pontos no trecho plano de cima
    }
  });

  it("a comparação não sai do domínio do exemplo", () => {
    const c = comparacao(111);
    expect(c.possivel).toBe(false);
    if (!c.possivel) expect(c.motivo).toBe("Com utilização acima de 110%, o acréscimo de 10 pp sai do domínio do exemplo.");
    expect(comparacao(110).possivel).toBe(true);
  });

  it("o campo de utilização respeita o domínio", () => {
    expect(validarUtil("5")).toEqual({ ok: true, valor: 5 });
    expect(validarUtil("0")).toEqual({ ok: true, valor: 0 });
    expect(validarUtil("110")).toEqual({ ok: true, valor: 110 });
    expect(validarUtil("120")).toEqual({ ok: true, valor: 120 });
    expect(validarUtil("121")).toEqual({ ok: false, erro: "A utilização vai de 0% a 120%." });
    expect(validarUtil("-2").ok).toBe(false);
    expect(validarUtil("").ok).toBe(false);
  });

  it("desenha as duas zonas rotuladas e os trechos fora do intervalo por cima da reta", () => {
    const html = renderToStaticMarkup(createElement(RetaNaProbabilidade));
    expect(html).toContain(ZONA_ACIMA);
    expect(html).toContain(ZONA_ABAIXO);
    expect(html.match(/class="rp-zona"/g)).toHaveLength(2);
    expect(html).toContain("u = 12,8%");
    expect(html).toContain("u = 102,2%");
    expect(html).toContain("saldo acima do limite");
    expect(html).toContain("5% → −8,68%");
    expect(html).toContain('aria-label="p(u) = −0,1426 + 0,011176 × u"'); expect(html.match(/class="katex"/g)).toHaveLength(1); // a reta da faixa, em KaTeX
    // o defeito corrigido: o trecho vinho era desenhado antes da reta azul e ficava escondido por ela
    const reta = html.indexOf('class="rp-reta'), fora = html.indexOf('class="rp-fora');
    expect(reta).toBeGreaterThan(0);
    expect(fora).toBeGreaterThan(reta);
    expect(html.match(/class="rp-fora/g)).toHaveLength(2);
  });

  it("a exibição converte proporção em porcentagem e não arredonda antes da conta", () => {
    const p = previsao(30);
    expect(fmtPct(p)).toBe(`${fmt(p * 100, 2)}%`);
    expect(p).toBeCloseTo(A + B * 0.3, 15);
  });
});
