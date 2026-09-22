import { describe, expect, it } from "vitest";
import { sequenciaDoCurso, vizinhosNaSequencia } from "../src/lib/content/capitulo";

/**
 * O conteúdo da Aula 2 são os capítulos 4, 5 e 6, como o material original declara, e desde 22/09/2026
 * ela é apresentada só por eles (o baralho de 50 slides foi aposentado). Estes testes fixam a
 * consequência: a sequência de leitura do curso é só de capítulos, sem exceção.
 */
const OUTLINE = [
  { kind: "aula", number: 1, title: "Formular o problema e compreender a base", chapters: [{ number: 1, title: "O problema da decisão de crédito" }, { number: 2, title: "Fundamentos de modelagem estatística" }, { number: 3, title: "Construção da base e das variáveis" }] },
  { kind: "aula", number: 2, title: "Entender as três técnicas", chapters: [{ number: 4, title: "Regressão logística" }, { number: 5, title: "Árvores de decisão" }, { number: 6, title: "Gradient boosting com árvores" }] },
  { kind: "aula", number: 3, title: "Validar e transformar previsão em decisão", chapters: [{ number: 7, title: "Avaliação e calibração" }] },
  { kind: "trabalho", number: 5, title: "Construir, testar e defender o modelo de PD", chapters: [{ number: 11, title: "Trabalho final" }] },
];

describe("sequência do curso", () => {
  it("é só de capítulos, na ordem das unidades, sem unidade sem capítulo", () => {
    const seq = sequenciaDoCurso(OUTLINE);
    expect(seq.map((x) => x.href)).toEqual([1, 2, 3, 4, 5, 6, 7, 11].map((n) => `/aulas/capitulo/${n}`));
    expect(seq.every((x) => x.href.startsWith("/aulas/capitulo/"))).toBe(true);
  });

  it("põe os capítulos da Aula 2 entre o 3 e o 7, sem apêndice no meio", () => {
    const seq = sequenciaDoCurso(OUTLINE);
    const { prev, next } = vizinhosNaSequencia(seq, "/aulas/capitulo/4");
    expect(prev?.href).toBe("/aulas/capitulo/3");
    expect(next?.href).toBe("/aulas/capitulo/5");
    expect(vizinhosNaSequencia(seq, "/aulas/capitulo/6").next?.href).toBe("/aulas/capitulo/7");
    expect(seq.find((x) => x.href === "/aulas/capitulo/4")?.rotulo).toContain("Aula 2");
  });

  it("ignora unidade sem capítulo, que não deve existir mas não pode quebrar a leitura", () => {
    const seq = sequenciaDoCurso([...OUTLINE, { kind: "aula", number: 9, title: "Unidade vazia", chapters: [] }]);
    expect(seq).toHaveLength(8);
  });
});
