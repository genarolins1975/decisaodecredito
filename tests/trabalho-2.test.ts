import { describe, expect, it } from "vitest";
import { ALUNOS_T2, CRITERIOS_T2, ENTREGAS, REGRAS_T2, consolidacaoT2, devolutivaT2, integrantesT2, n2, notaBruta, notaT2, p1, pontos, reguaT2 } from "@/lib/avaliacoes/trabalho-2";
import { ALUNOS } from "@/lib/avaliacoes/trabalho-1";

/**
 * Valores publicados: pontos por critério da avaliação de 17/10/2026 consolidada em 19/10/2026 (C4 = 1,6 para todos)
 * e nota pela régua de 21/10/2026 (menor bruta 4,125 vai a 7, maior 9,125 a 10).
 */
const PUBLICADO: Record<string, { criterios: string[]; pontos: string; bruta: string; nota: string; alunos: number }> = {
  "consignado-tomaz": { criterios: ["2", "1", "2", "1,6", "2", "2", "2", "2"], pontos: "14,6", bruta: "9,13", nota: "10,00", alunos: 3 },
  "consignado-jader": { criterios: ["2", "1", "2", "1,6", "2", "2", "2", "2"], pontos: "14,6", bruta: "9,13", nota: "10,00", alunos: 1 },
  "habitacional-renata": { criterios: ["2", "1", "2", "1,6", "1", "2", "2", "2"], pontos: "13,6", bruta: "8,50", nota: "9,63", alunos: 3 },
  "pessoal-stephan": { criterios: ["2", "2", "2", "1,6", "1", "2", "1", "2"], pontos: "13,6", bruta: "8,50", nota: "9,63", alunos: 2 },
  "consignado-guilherme": { criterios: ["2", "1", "2", "1,6", "2", "2", "1", "2"], pontos: "13,6", bruta: "8,50", nota: "9,63", alunos: 1 },
  "recebiveis-asa": { criterios: ["2", "2", "2", "1,6", "1", "2", "1", "1"], pontos: "12,6", bruta: "7,88", nota: "9,25", alunos: 3 },
  "pessoal-michelle": { criterios: ["2", "1", "2", "1,6", "1", "2", "1", "2"], pontos: "12,6", bruta: "7,88", nota: "9,25", alunos: 1 },
  "habitacional-carlos": { criterios: ["2", "1", "2", "1,6", "2", "1", "1", "1"], pontos: "11,6", bruta: "7,25", nota: "8,88", alunos: 1 },
  "rural-agrogalaxy": { criterios: ["1", "1", "1", "1,6", "0", "0", "1", "1"], pontos: "6,6", bruta: "4,13", nota: "7,00", alunos: 3 },
};

describe("Trabalho 2: reconciliação com a avaliação e a régua de 21/10/2026", () => {
  it("cada entrega reproduz critérios, pontos, nota bruta e nota reescalada", () => {
    expect(ENTREGAS.map((e) => e.id).sort()).toEqual(Object.keys(PUBLICADO).sort());
    for (const e of ENTREGAS) {
      const d = PUBLICADO[e.id];
      expect(CRITERIOS_T2.map((c) => p1(e.criterios[c.chave].pontos)), e.id).toEqual(d.criterios);
      expect(p1(pontos(e)), e.id).toBe(d.pontos);
      expect(n2(notaBruta(e)), e.id).toBe(d.bruta);
      expect(n2(notaT2(e)), e.id).toBe(d.nota);
      expect(integrantesT2(e.id).length, e.id).toBe(d.alunos);
    }
  });

  it("a régua leva a menor bruta a 7 e a maior a 10, e cada ponto vale 0,375", () => {
    const r = reguaT2();
    expect(r.menor).toBe(4.125);
    expect(r.maior).toBe(9.125);
    expect(r.porPonto).toBe(0.375);
    const notas = ENTREGAS.map(notaT2);
    expect(Math.min(...notas)).toBe(7);
    expect(Math.max(...notas)).toBe(10);
    // reta: preserva ordem e nunca fica abaixo da nota bruta
    for (const e of ENTREGAS) {
      expect(notaT2(e), e.id).toBeCloseTo(7 + 3 * (notaBruta(e) - 4.125) / 5, 12);
      expect(notaT2(e), e.id).toBeGreaterThanOrEqual(notaBruta(e));
    }
  });

  it("o critério 4 é 1,6 para todos e a nota bruta é pontos ÷ 16 × 10", () => {
    for (const e of ENTREGAS) {
      expect(e.criterios.reproducao_defesa.pontos, e.id).toBe(1.6);
      expect(e.criterios.reproducao_defesa.ajuste, e.id).toContain("1,6 de 2");
      expect(notaBruta(e), e.id).toBeCloseTo(pontos(e) / 16 * 10, 12);
    }
    expect(REGRAS_T2.defesa).toContain("1,6 de 2");
  });

  it("os 18 alunos têm e-mail único, entrega existente e o mesmo identificador do Trabalho 1", () => {
    expect(ALUNOS_T2).toHaveLength(18);
    expect(new Set(ALUNOS_T2.map((a) => a.email.toLowerCase())).size).toBe(18);
    const idsT1 = new Set(ALUNOS.map((a) => a.id));
    for (const a of ALUNOS_T2) {
      expect(idsT1.has(a.id), a.id).toBe(true);
      expect(devolutivaT2(a.id), a.id).not.toBeNull();
    }
  });

  it("nenhuma devolutiva cita aluno de outra entrega nem traz travessão", () => {
    const termos = (n: string) => n.normalize("NFD").replace(/\p{M}/gu, "").split(" ").filter((t) => t.length > 3);
    for (const e of ENTREGAS) {
      const texto = JSON.stringify(e).normalize("NFD").replace(/\p{M}/gu, "");
      expect(/[—–]/.test(JSON.stringify(e)), e.id).toBe(false);
      for (const a of ALUNOS_T2.filter((x) => x.entrega !== e.id)) {
        const sobrenome = termos(a.nome).at(-1)!;
        if (["Andrade", "Campos", "Gabriel", "Pedro"].includes(sobrenome)) continue;
        expect(texto.includes(sobrenome), `${e.id} cita ${a.nome}`).toBe(false);
      }
    }
  });

  it("a consolidação fecha com as notas por aluno", () => {
    const c = consolidacaoT2();
    expect(c.alunos).toBe(18);
    expect(c.entregas).toBe(9);
    expect(n2(c.minima)).toBe("7,00");
    expect(n2(c.maxima)).toBe("10,00");
    expect(c.ootValidos).toBe(6);
    const soma = Object.values(PUBLICADO).reduce((s, d) => s + Number(d.nota.replace(",", ".")) * d.alunos, 0);
    expect(c.mediaAlunos).toBeCloseTo(soma / 18, 1);
  });
});
