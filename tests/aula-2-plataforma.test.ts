import { describe, expect, it } from "vitest";
import { ehAulaEmSlides, sequenciaDoCurso, vizinhosNaSequencia } from "../src/lib/content/capitulo";

/**
 * A Aula 2 na plataforma: a aula em slides entra na sequência de leitura entre o capítulo 3 e o
 * apêndice, e os helpers puros que as páginas usam para os vizinhos e para reconhecer a unidade.
 * O carregador (`aula-2.ts`) é só de servidor; o teste de aceitação confere que o roteiro não chega ao aluno.
 */
const outline = [
  { kind: "aula", number: 1, title: "Formular o problema", chapters: [{ number: 1, title: "C1" }, { number: 2, title: "C2" }, { number: 3, title: "C3" }] },
  { kind: "aula", number: 2, title: "Entender as três técnicas", chapters: [] },
  { kind: "apendice", number: 1, title: "As três técnicas, página a página", chapters: [{ number: 4, title: "C4" }, { number: 5, title: "C5" }] },
  { kind: "aula", number: 3, title: "Validar", chapters: [{ number: 7, title: "C7" }] },
  { kind: "trabalho", number: 5, title: "Trabalho", chapters: [{ number: 11, title: "C11" }] },
];

describe("sequência de leitura com a Aula 2", () => {
  it("reconhece a aula em slides", () => {
    expect(ehAulaEmSlides({ kind: "aula", number: 2 })).toBe(true);
    expect(ehAulaEmSlides({ kind: "aula", number: 1 })).toBe(false);
    expect(ehAulaEmSlides({ kind: "apendice", number: 2 })).toBe(false);
  });

  it("coloca a Aula 2 entre o capítulo 3 e o capítulo 4", () => {
    const seq = sequenciaDoCurso(outline);
    expect(seq.map((x) => x.href)).toEqual(["/aulas/capitulo/1", "/aulas/capitulo/2", "/aulas/capitulo/3", "/aulas/aula-2", "/aulas/capitulo/4", "/aulas/capitulo/5", "/aulas/capitulo/7", "/aulas/capitulo/11"]);
    expect(seq[3]).toEqual({ href: "/aulas/aula-2", rotulo: "Aula 2 · 50 slides", titulo: "Entender as três técnicas" });
    expect(seq[4].rotulo).toBe("Capítulo 4 · Apêndice");
    expect(seq[7].rotulo).toBe("Capítulo 11 · Trabalho final");
  });

  it("dá os vizinhos certos ao capítulo 3, à Aula 2 e ao capítulo 4", () => {
    const seq = sequenciaDoCurso(outline);
    expect(vizinhosNaSequencia(seq, "/aulas/capitulo/3").next?.href).toBe("/aulas/aula-2");
    expect(vizinhosNaSequencia(seq, "/aulas/aula-2")).toEqual({ prev: seq[2], next: seq[4] });
    expect(vizinhosNaSequencia(seq, "/aulas/capitulo/4").prev?.href).toBe("/aulas/aula-2");
    expect(vizinhosNaSequencia(seq, "/aulas/capitulo/1").prev).toBeNull();
    expect(vizinhosNaSequencia(seq, "/aulas/capitulo/11").next).toBeNull();
    expect(vizinhosNaSequencia(seq, "/aulas/capitulo/99")).toEqual({ prev: null, next: null });
  });

  it("uma aula sem capítulos que não é a Aula 2 fica fora da sequência", () => {
    const seq = sequenciaDoCurso([{ kind: "aula", number: 9, title: "Sem capítulos", chapters: [] }, ...outline]);
    expect(seq.find((x) => x.titulo === "Sem capítulos")).toBeUndefined();
  });
});
