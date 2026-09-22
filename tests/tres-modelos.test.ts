import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { leituraDaProposta, maisDisputada, tresModelos } from "@/lib/visuais/tres-modelos";
import { boostingClassificacao } from "@/lib/visuais/boosting";
import did from "@/lib/visuais/did.json";
import type { Proposta } from "@/lib/visuais/logistica";

/** O fecho da Aula 2 cita números em três lugares: o texto da página (material de origem), a pergunta curada e as
    notas do professor. Todos precisam ser os que as funções dos capítulos produzem, e os que as páginas anteriores
    já mostraram (c5p18 para as perdas, c6p13 e c6p14 para o boosting). */
const { linhas, perda } = tresModelos();
const pd = (id: number) => linhas.find((l) => l.id === id)!.pd;
const pct = (x: number) => (100 * x).toFixed(1).replace(".", ",") + "%";

describe("fecho da aula 2: três modelos nas mesmas 16 propostas", () => {
  it("reproduz as PDs que as páginas dos capítulos já mostraram", () => {
    expect([pct(pd(12).logistica), pct(pd(12).arvore), pct(pd(12).boosting)]).toEqual(["99,6%", "100,0%", "66,8%"]);   // c6p14
    expect([pct(pd(5).logistica), pct(pd(5).arvore)]).toEqual(["52,6%", "0,0%"]);                                    // c5p18
    expect([pct(pd(10).logistica), pct(pd(10).arvore)]).toEqual(["30,5%", "100,0%"]);                                // c5p18
    expect([pct(pd(15).logistica), pct(pd(15).arvore)]).toEqual(["73,9%", "50,0%"]);                                 // c5p18
  });

  it("reproduz as perdas de treino de c5p18 e de c6p13", () => {
    expect(perda.logistica.toFixed(5)).toBe("0.43282");
    expect(perda.arvore.toFixed(5)).toBe("0.18844");
    expect(perda.boosting.toFixed(5)).toBe("0.47481");
  });

  it("a #10 é a proposta de maior distância, 69,5 pontos, com modelos dos dois lados de 50%", () => {
    const m = maisDisputada(linhas);
    expect(m.id).toBe(10);
    expect((100 * m.distancia).toFixed(1)).toBe("69.5");
    expect(m.ladosOpostos).toBe(true);
    expect(pct(pd(10).boosting)).toBe("58,3%");
  });

  it("da #3 à #14 os três ficam do mesmo lado de 50%, exceto a #5 e a #10", () => {
    const opostas = linhas.filter((l) => l.id >= 3 && l.id <= 14 && l.ladosOpostos).map((l) => l.id);
    expect(opostas).toEqual([5, 10]);
  });

  it("com mais árvores o boosting desce abaixo da árvore no treino: 0,15503 com 50 e 0,05444 com 200", () => {
    const base = did.base as Proposta[];
    const perdaCom = (M: number) => { const p = boostingClassificacao(base, 0.4, M); return p[p.length - 1].perda.toFixed(5); };
    expect(perdaCom(50)).toBe("0.15503");
    expect(perdaCom(200)).toBe("0.05444");
  });

  it("a leitura de uma proposta diz de que lado de 50% cada modelo a põe", () => {
    expect(leituraDaProposta(linhas.find((l) => l.id === 12)!)).toBe("Os três põem a proposta acima de 50%.");
    expect(leituraDaProposta(linhas.find((l) => l.id === 10)!)).toBe("Árvore e boosting acima de 50%; logística abaixo.");
  });

  it("o texto da página, a pergunta e as notas citam exatamente esses números", () => {
    const ex = JSON.parse(fs.readFileSync(path.join(process.cwd(), "content/generated/extract.json"), "utf8"));
    const pagina = ex.pages.find((p: { id: string }) => p.id === "c6p20");
    expect(pagina).toBeTruthy();
    const texto = JSON.stringify(pagina);
    for (const n of ["0,43282", "0,18844", "0,47481", "0,15503", "0,05444", "52,6%", "30,5%"]) expect(texto).toContain(n);
    const curadas = JSON.parse(fs.readFileSync(path.join(process.cwd(), "content/questoes-curadas.json"), "utf8"));
    const q = curadas.questoes.find((x: { slug: string }) => x.slug === "c6p20q");
    for (const n of ["30,5%", "100%", "58,3%", "69,5", "99,6%", "66,8%", "6,1%", "33,4%"]) expect(JSON.stringify(q)).toContain(n);
  });
});
