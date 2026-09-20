import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { ROTEIRO_AULA_2, SEM_SLIDE, slideDaPagina, slideValido } from "../src/lib/content/roteiro-aula-2";

const extract = JSON.parse(fs.readFileSync(path.join(__dirname, "../content/generated/extract.json"), "utf8"));
const apendice: string[] = extract.pages.filter((p: { cap: number }) => [4, 5, 6].includes(p.cap)).map((p: { id: string }) => p.id);

describe("roteiro da Aula 2", () => {
  it("tem os 50 slides, numerados em sequência e sem repetição", () => {
    expect(ROTEIRO_AULA_2).toHaveLength(50);
    expect(ROTEIRO_AULA_2.map((s) => s.n)).toEqual(Array.from({ length: 50 }, (_, i) => String(i + 1).padStart(2, "0")));
    expect(slideValido("07")).toBe(true);
    expect(slideValido("51")).toBe(false);
    expect(slideValido("7")).toBe(false);
  });

  it("só aponta para páginas que existem no apêndice", () => {
    const citadas = [...new Set(ROTEIRO_AULA_2.flatMap((s) => s.paginas))];
    expect(citadas.filter((p) => !apendice.includes(p))).toEqual([]);
  });

  it("cobre todas as páginas do apêndice, salvo as declaradas sem slide", () => {
    const citadas = new Set(ROTEIRO_AULA_2.flatMap((s) => s.paginas));
    const descobertas = apendice.filter((p) => !citadas.has(p));
    expect(descobertas.sort()).toEqual([...SEM_SLIDE].sort());
  });

  it("as páginas do apêndice só aparecem nos blocos de logit, árvore e boosting", () => {
    const comPagina = ROTEIRO_AULA_2.filter((s) => s.paginas.length > 0).map((s) => Number(s.n));
    expect(Math.min(...comPagina)).toBeGreaterThanOrEqual(7);
    expect(Math.max(...comPagina)).toBeLessThanOrEqual(42);
  });

  it("encontra o slide de uma página", () => {
    expect(slideDaPagina("c4p2")?.n).toBe("08");
    expect(slideDaPagina("c5p13")?.n).toBe("25");
    expect(slideDaPagina("c5p17")).toBeUndefined();
  });
});
