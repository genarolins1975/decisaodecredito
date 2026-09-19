import { describe, expect, it } from "vitest";
import { ATALHOS, cenarios, curvaLogit, fmtDesloc, fmtOdds, fmtPd, fmtPp, fmtZ, JANELA_Z, leitura, LN2, passosIguaisEmPd, PD_INICIAL, posicaoPd, posicaoZ, validarPd } from "@/lib/visuais/escala-logodds";

const PONTOS = [0.01, 0.1, 0.33, 0.5, 0.8, 0.99];
const por = (p: number) => Object.fromEntries(cenarios(p).map((c) => [c.chave, c])) as Record<"menor" | "partida" | "maior", ReturnType<typeof cenarios>[number]>;

describe("escala 3, log odds: cenários", () => {
  it.each(PONTOS)("em p = %s os deslocamentos em log odds são ∓ln(2)", (p) => {
    const c = por(p);
    expect(c.menor.deltaZ).toBeCloseTo(-LN2, 12);
    expect(c.maior.deltaZ).toBeCloseTo(LN2, 12);
    expect(c.maior.z - c.partida.z).toBeCloseTo(c.partida.z - c.menor.z, 12);
    expect(c.partida.deltaZ).toBe(0);
  });

  it("p = 33%: os valores da especificação", () => {
    const c = por(0.33);
    expect(c.partida.z).toBeCloseTo(-0.708185, 6);
    expect(c.menor.p * 100).toBeCloseTo(19.7605, 4);
    expect(c.maior.p * 100).toBeCloseTo(49.6241, 4);
    expect(c.menor.deltaZ).toBeCloseTo(-0.693147, 6);
    expect(c.maior.deltaZ).toBeCloseTo(0.693147, 6);
    expect(fmtPd(c.menor.p)).toBe("19,76%");
    expect(fmtPd(c.maior.p)).toBe("49,62%");
    expect(fmtDesloc(c.maior.deltaZ)).toBe("+0,6931");
  });

  it("p = 50%: 1/3, 1/2 e 2/3, com log odds −ln(2), 0 e +ln(2)", () => {
    const c = por(0.5);
    expect(c.menor.p).toBeCloseTo(1 / 3, 12);
    expect(c.partida.p).toBeCloseTo(1 / 2, 12);
    expect(c.maior.p).toBeCloseTo(2 / 3, 12);
    expect(c.menor.z).toBeCloseTo(-LN2, 12);
    expect(c.partida.z).toBeCloseTo(0, 12);
    expect(c.maior.z).toBeCloseTo(LN2, 12);
    expect(c.partida.odds).toBeCloseTo(1, 12);
  });

  it("as odds do cenário são sempre as iniciais divididas ou multiplicadas por 2, sem acúmulo", () => {
    for (const p of PONTOS) {
      const a = por(p), b = por(p);
      expect(a.maior.odds).toBeCloseTo(2 * a.partida.odds, 12);
      expect(a.menor.odds).toBeCloseTo(a.partida.odds / 2, 12);
      expect(b.maior.odds).toBe(a.maior.odds);
    }
  });

  it("em PD os passos só empatam em 50%", () => {
    const meio = por(0.5);
    expect(passosIguaisEmPd(0.5)).toBe(true);
    expect(Math.abs(meio.menor.deltaPd)).toBeCloseTo(Math.abs(meio.maior.deltaPd), 12);
    expect(fmtPp(meio.menor.deltaPd)).toBe("−16,67 pp");
    expect(fmtPp(meio.maior.deltaPd)).toBe("+16,67 pp");
    for (const p of PONTOS.filter((q) => q !== 0.5)) {
      const c = por(p);
      expect(passosIguaisEmPd(p)).toBe(false);
      expect(Math.abs(Math.abs(c.menor.deltaPd) - Math.abs(c.maior.deltaPd))).toBeGreaterThan(1e-6);
    }
  });

  it("a leitura de 50% declara os passos iguais e a dos demais mostra os valores calculados", () => {
    expect(leitura(0.5).frasePd).toBe("Em PD = 50%, os passos também são iguais: −16,67 pp e +16,67 pp.");
    expect(leitura(0.5).iguais).toBe(true);
    const l = leitura(0.33);
    expect(l.frasePd).toBe("Em PD, os passos são −13,24 pp e +16,62 pp, de tamanhos diferentes.");
    expect(l.fraseZ).toContain("−0,6931");
    expect(l.fraseZ).toContain("+0,6931");
    expect(l.frasePd).not.toContain("sempre");
  });
});

describe("escala 3: apresentação e réguas", () => {
  it("arredonda PD com 2 casas, odds e log odds com 3 e o deslocamento com 4", () => {
    const c = por(0.2);
    expect(fmtPd(c.partida.p)).toBe("20,00%");
    expect(fmtOdds(c.partida.odds)).toBe("0,250");
    expect(fmtZ(c.partida.z)).toBe("−1,386");
    expect(fmtOdds(c.maior.odds)).toBe("0,500");
    expect(fmtZ(c.maior.z)).toBe("−0,693");
    expect(fmtDesloc(c.menor.deltaZ)).toBe("−0,6931");
    expect(fmtPd(c.maior.p)).toBe("33,33%");
    expect(fmtPd(c.menor.p)).toBe("11,11%");
  });

  it("a janela de −6 a +6 contém os três cenários de 1% a 99%", () => {
    for (const p of [0.01, 0.99]) for (const c of cenarios(p)) {
      expect(posicaoZ(c.z).fora).toBe(false);
      expect(posicaoZ(c.z).t).toBeGreaterThanOrEqual(0);
      expect(posicaoZ(c.z).t).toBeLessThanOrEqual(1);
    }
    expect(posicaoZ(JANELA_Z[0] - 0.1).fora).toBe(true);
    expect(posicaoZ(0).t).toBeCloseTo(0.5, 12);
  });

  it("as posições na régua respeitam as distâncias numéricas", () => {
    const c = por(0.33);
    const dz = [posicaoZ(c.partida.z).t - posicaoZ(c.menor.z).t, posicaoZ(c.maior.z).t - posicaoZ(c.partida.z).t];
    expect(dz[0]).toBeCloseTo(dz[1], 12);
    expect(dz[0]).toBeCloseTo(LN2 / 12, 12);
    const dp = [posicaoPd(c.partida.p).t - posicaoPd(c.menor.p).t, posicaoPd(c.maior.p).t - posicaoPd(c.partida.p).t];
    expect(dp[0]).toBeCloseTo(c.partida.p - c.menor.p, 12);
    expect(dp[1]).toBeCloseTo(c.maior.p - c.partida.p, 12);
    expect(dp[0]).not.toBeCloseTo(dp[1], 6);
  });

  it("a curva logit cobre a janela e é crescente", () => {
    const pts = curvaLogit(60);
    expect(pts[0].z).toBeCloseTo(JANELA_Z[0], 9);
    expect(pts[pts.length - 1].z).toBeCloseTo(JANELA_Z[1], 9);
    for (let i = 1; i < pts.length; i++) expect(pts[i].z).toBeGreaterThan(pts[i - 1].z);
  });
});

describe("escala 3: entrada da PD", () => {
  it("aceita vírgula, ponto e o sinal de porcentagem", () => {
    expect(validarPd("33")).toEqual({ ok: true, valor: 0.33 });
    expect(validarPd("12,5%")).toEqual({ ok: true, valor: 0.125 });
    expect(validarPd(" 12.5 ")).toEqual({ ok: true, valor: 0.125 });
  });
  it("recusa vazio, texto e os extremos sem logaritmo finito", () => {
    expect(validarPd("").ok).toBe(false);
    expect(validarPd("abc").ok).toBe(false);
    expect(validarPd("0").ok).toBe(false);
    expect(validarPd("100").ok).toBe(false);
    expect(validarPd("-5").ok).toBe(false);
  });
  it("mantém o valor digitado fora da faixa do controle deslizante, com aviso", () => {
    const r = validarPd("0,5");
    expect(r.ok && r.valor).toBe(0.005);
    expect(r.ok && r.aviso).toContain("fora da faixa");
  });
  it("os atalhos e o padrão estão na faixa do controle", () => {
    expect(PD_INICIAL).toBe(0.33);
    for (const a of ATALHOS) expect(a).toBeGreaterThanOrEqual(0.01), expect(a).toBeLessThanOrEqual(0.99);
  });
});
