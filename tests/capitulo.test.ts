import { describe, expect, it } from "vitest";
import { materiaisDoCapitulo, numeroCapitulo, resumoCapitulo, rotuloUnidade, somaTempos } from "../src/lib/content/capitulo";

describe("página de abertura do capítulo", () => {
  const pages = [
    { slug: "c1p1", title: "a", level: "essencial", minutes: 6, level120: "essencial" },
    { slug: "c1p2", title: "b", level: "essencial", minutes: 5, level120: "assincrono" },
    { slug: "c1p3", title: "c", level: "complementar", minutes: 8, level120: "assincrono" },
  ];
  it("resume contagens e minutos por nível", () => {
    expect(resumoCapitulo(pages)).toEqual({ total: 3, essenciais: 2, complementares: 1, minEssenciais: 11, minComplementares: 8, min120: 6 });
    expect(resumoCapitulo([])).toEqual({ total: 0, essenciais: 0, complementares: 0, minEssenciais: 0, minComplementares: 0, min120: 0 });
  });
  it("soma o orçamento de tempo do guia docente ignorando páginas sem orçamento", () => {
    expect(somaTempos([{ exp: 1, prat: 2, disc: 2 }, null, { exp: 3, ex: 1 }, undefined])).toEqual({ exp: 4, ex: 1, prat: 2, disc: 2, total: 9 });
  });
  it("encontra os materiais do capítulo pelo título sem confundir 1 com 10 e 11", () => {
    const m = [{ title: "Apostila · Capítulo 1 · aluno" }, { title: "Apostila · Capítulo 10 · aluno" }, { title: "Capítulo 11 (professor)" }, { title: "Cap. 01 slides" }, { title: "capítulo 1: leitura" }, { title: "Leitura geral" }];
    expect(materiaisDoCapitulo(m, 1).map((x) => x.title)).toEqual(["Apostila · Capítulo 1 · aluno", "Cap. 01 slides", "capítulo 1: leitura"]);
    expect(materiaisDoCapitulo(m, 10).map((x) => x.title)).toEqual(["Apostila · Capítulo 10 · aluno"]);
    expect(materiaisDoCapitulo(m, 11).map((x) => x.title)).toEqual(["Capítulo 11 (professor)"]);
    expect(materiaisDoCapitulo(m, 2)).toEqual([]);
  });
  it("rotula a unidade e o número do capítulo", () => {
    expect(rotuloUnidade({ kind: "aula", number: 2 })).toBe("Aula 2");
    expect(rotuloUnidade({ kind: "trabalho", number: 5 })).toBe("Trabalho final");
    expect(numeroCapitulo(4)).toBe("04"); expect(numeroCapitulo(11)).toBe("11");
  });
});
