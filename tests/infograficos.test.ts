import { describe, expect, it } from "vitest";
import { ehFluxo, infograficoDoCapitulo } from "../src/lib/content/infograficos";
import { BETA_AULA } from "../src/lib/visuais/logistica";

const textos = (v: unknown): string[] => typeof v === "string" ? [v] : Array.isArray(v) ? v.flatMap(textos) : v && typeof v === "object" ? Object.values(v).flatMap(textos) : [];

describe("infográficos de abertura", () => {
  it("todos os onze capítulos têm infográfico numa das duas gramáticas, sem travessão", () => {
    for (let n = 1; n <= 11; n++) {
      const d = infograficoDoCapitulo(n)!; expect(d, `capítulo ${n}`).toBeTruthy();
      if (ehFluxo(d)) { expect(d.etapas).toHaveLength(3); expect(d.escalas.formulas.length).toBeGreaterThan(0); expect(d.coeficiente.casos).toHaveLength(3); expect(d.faixa.texto).toBeTruthy(); }
      else { expect(d.cartoes).toHaveLength(4); expect(d.tiles).toHaveLength(3); expect(d.paineis).toHaveLength(3); expect(d.faixa.itens).toHaveLength(3); }
      for (const t of textos(d)) expect(t, `capítulo ${n}: ${t}`).not.toMatch(/[—–]/);
    }
    expect(infograficoDoCapitulo(12)).toBeNull();
  });
  it("o fluxo do capítulo 4 fecha com os coeficientes da aula: z = 0,2483 e PD = 56,18% para utilização 70% e atraso 5 dias", () => {
    const d = infograficoDoCapitulo(4)!; expect(ehFluxo(d)).toBe(true); if (!ehFluxo(d)) return;
    const [b0, b1, b2] = BETA_AULA; const z = b0 + b1 * 7 + b2 * 0.5; const pd = 1 / (1 + Math.exp(-z));
    expect(z).toBeCloseTo(0.2483, 4); expect(pd).toBeCloseTo(0.5618, 4);
    expect(d.etapas[1].total).toBe("z ≈ 0,2483"); expect(d.etapas[2].destaque).toBe("PD ≈ 56,18%");
    expect(d.etapas[1].parcelas!.map((p) => p.v)).toEqual(["−5,6666", "+5,2171", "+0,6978"]);
    // +10 pp de utilização: odds × e^0,7453 = 2,11; PD 2% → 4,12%, 10% → 18,97%, 50% → 67,82%
    expect(Math.exp(b1)).toBeCloseTo(2.11, 2);
    const salto = (p: number) => { const o = (p / (1 - p)) * Math.exp(b1); return o / (1 + o); };
    expect(salto(0.02)).toBeCloseTo(0.0412, 4); expect(salto(0.10)).toBeCloseTo(0.1897, 4); expect(salto(0.50)).toBeCloseTo(0.6782, 4);
    expect(d.coeficiente.casos.map((c) => c.para)).toEqual(["4,12%", "18,97%", "67,82%"]);
  });
});
