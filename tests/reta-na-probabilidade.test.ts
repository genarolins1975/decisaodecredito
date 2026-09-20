import { describe, expect, it } from "vitest";
import { A, B, comparacao, cruzamento, DOMINIO, equacao, fmt, fmtPct, fmtPp, forasDoIntervalo, leitura, PASSO_COMPARACAO, POR_PP, previsao, previsaoTruncada, truncar, UTIL_INICIAL, validarUtil } from "@/lib/visuais/reta-na-probabilidade";
import { BETA_AULA } from "@/lib/visuais/logistica";

describe("c4p2: a reta ajustada na probabilidade", () => {
  it("usa a reta de mínimos quadrados do projeto, não os coeficientes da logística", () => {
    expect(A).toBeCloseTo(-0.142647, 6);
    expect(B).toBeCloseTo(1.117647, 6);
    expect(POR_PP).toBeCloseTo(0.0111765, 7);
    expect(B).not.toBeCloseTo(BETA_AULA[1], 3);
    expect(A).not.toBeCloseTo(BETA_AULA[0], 3);
    expect(equacao()).toBe("p(u) = −0,1426 + 0,011176 × u");
  });

  it("a previsão sai do intervalo válido dentro do domínio do exemplo", () => {
    expect(previsao(0)).toBeLessThan(0);
    expect(fmtPct(previsao(UTIL_INICIAL))).toBe("−8,68%");
    expect(leitura(UTIL_INICIAL).valida).toBe(false);
    expect(leitura(UTIL_INICIAL).frase).toContain("não pode ser interpretado");
    expect(leitura(50).valida).toBe(true);
    expect(fmtPct(previsao(100))).toBe("97,50%"); // não há cruzamento de 100% neste domínio
  });

  it("só declara os trechos fora do intervalo que existem", () => {
    const fora = forasDoIntervalo();
    expect(fora).toHaveLength(1);
    expect(fora[0].lado).toBe("abaixo");
    expect(fora[0].de).toBe(0);
    expect(fora[0].ate).toBeCloseTo(12.7632, 3);
    expect(cruzamento(0)).toBeCloseTo(12.7632, 3);
    expect(cruzamento(1)).toBeNull();
  });

  it("o truncamento preserva a previsão no interior e a fixa nos limites", () => {
    expect(previsaoTruncada(5)).toBe(0);
    expect(previsaoTruncada(50)).toBeCloseTo(previsao(50), 15);
    expect(previsaoTruncada(100)).toBeCloseTo(previsao(100), 15);
    expect(truncar(-0.5)).toBe(0); expect(truncar(1.5)).toBe(1); expect(truncar(0.4)).toBe(0.4);
    for (let u = 0; u <= 100; u++) { const t = previsaoTruncada(u); expect(t).toBeGreaterThanOrEqual(0); expect(t).toBeLessThanOrEqual(1); }
  });

  it("na reta o incremento de 10 pp é sempre o mesmo e na truncada não", () => {
    for (const u of [0, 5, 20, 50, 80, 90]) {
      const c = comparacao(u);
      expect(c.possivel).toBe(true);
      if (c.possivel) expect(c.deltaLinear).toBeCloseTo(POR_PP * PASSO_COMPARACAO * 100, 10);
    }
    const noPlano = comparacao(UTIL_INICIAL); // 5% → 15%: sai do trecho plano no meio do caminho
    const todoPlano = comparacao(0);
    const noInterior = comparacao(50);
    if (noPlano.possivel && noInterior.possivel) {
      expect(noPlano.deltaTruncada).toBeLessThan(noPlano.deltaLinear);
      expect(noPlano.iguais).toBe(false);
      expect(noInterior.iguais).toBe(true);
      expect(fmtPp(noInterior.deltaLinear)).toBe("+11,18 pp");
      expect(fmtPp(noPlano.deltaTruncada)).toBe("+2,50 pp");
      if (todoPlano.possivel) expect(fmtPp(todoPlano.deltaTruncada)).toBe("0,00 pp"); // os dois pontos no trecho plano
    }
  });

  it("a comparação não sai do domínio do exemplo", () => {
    const c = comparacao(95);
    expect(c.possivel).toBe(false);
    if (!c.possivel) expect(c.motivo).toContain("sai do domínio");
    expect(comparacao(90).possivel).toBe(true);
    expect(DOMINIO).toEqual([0, 100]);
  });

  it("o campo de utilização respeita o domínio", () => {
    expect(validarUtil("5")).toEqual({ ok: true, valor: 5 });
    expect(validarUtil("0")).toEqual({ ok: true, valor: 0 });
    expect(validarUtil("100")).toEqual({ ok: true, valor: 100 });
    expect(validarUtil("101").ok).toBe(false);
    expect(validarUtil("-2").ok).toBe(false);
    expect(validarUtil("").ok).toBe(false);
  });

  it("a exibição converte proporção em porcentagem e não arredonda antes da conta", () => {
    const p = previsao(30);
    expect(fmtPct(p)).toBe(`${fmt(p * 100, 2)}%`);
    expect(p).toBeCloseTo(A + B * 0.3, 15);
  });
});
