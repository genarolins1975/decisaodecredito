import { describe, expect, it } from "vitest";
import { estavel, mesmoConteudo, patchC11, PATCH_C11, type ConteudoPagina } from "../scripts/content/conteudo-publicado";

/** A importação republica uma página quando o HTML de origem mudou. Se a comparação acusar diferença
    onde não há, todo build cria uma versão nova de cada página; se deixar de acusar onde há, a correção
    nunca chega ao aluno. Os dois modos de falha estão presos aqui. */
const base = (): ConteudoPagina => ({
  title: "Título", objective: "Objetivo", support: null, connection: null,
  timeBudget: { exp: 4, ex: 3 },
  blocks: [{ type: "episode", number: 1, steps: [{ title: "a", detail: "b" }] }],
  teacherGuide: { funcao: "f" },
});

describe("comparação da versão publicada", () => {
  it("ignora a ordem das chaves, que o jsonb reordena ao devolver", () => {
    const a = base();
    const b = base();
    b.timeBudget = { ex: 3, exp: 4 };
    b.blocks = [{ steps: [{ detail: "b", title: "a" }], number: 1, type: "episode" } as any];
    expect(mesmoConteudo(a, b)).toBe(true);
  });

  it("trata chave ausente e chave com undefined como a mesma coisa", () => {
    const a = base();
    const b = base();
    (b.blocks as any)[0].missions = undefined;
    expect(mesmoConteudo(a, b)).toBe(true);
  });

  it("ausência e nulo explícito são a mesma coisa, porque o banco guarda nulo nos dois casos", () => {
    const a = base();
    const b = base();
    b.support = undefined as any;
    expect(mesmoConteudo(a, b)).toBe(true);
  });

  it("acusa mudança de texto dentro dos blocos", () => {
    const a = base();
    const b = base();
    (b.blocks as any)[0].steps[0].detail = "c";
    expect(mesmoConteudo(a, b)).toBe(false);
  });

  it("acusa mudança no guia docente, que é conteúdo do professor", () => {
    const a = base();
    const b = base();
    b.teacherGuide = { funcao: "outra" };
    expect(mesmoConteudo(a, b)).toBe(false);
  });

  it("a ordem dos blocos importa", () => {
    const a = base();
    const b = base();
    b.blocks = [{ type: "html", html: "<p>x</p>" }, ...(a.blocks as any)];
    expect(mesmoConteudo(a, b)).toBe(false);
  });

  it("estavel não perde o zero, o falso nem a string vazia", () => {
    expect(JSON.stringify(estavel({ a: 0, b: false, c: "", d: null }))).toBe('{"a":0,"b":false,"c":"","d":null}');
  });
});

describe("substituições canônicas do capítulo 11", () => {
  it("aplica e depois se torna inerte, para que o importador e o patch convirjam", () => {
    const blocos = [{ type: "html", html: "<p>uma base de 60.000 propostas</p>" }];
    const um = patchC11("c11p1", blocos, null);
    expect(um.changed).toBe(true);
    expect(JSON.stringify(um.blocks)).toContain("1 milhão de propostas");
    const dois = patchC11("c11p1", um.blocks, um.guia);
    expect(dois.changed).toBe(false);
  });

  it("não toca em página fora do capítulo 11", () => {
    const blocos = [{ type: "html", html: "<p>60.000 propostas</p>" }];
    expect(patchC11("c4p1", blocos, null).changed).toBe(false);
  });

  it("corrige os 60.000 IDs também no guia docente", () => {
    const r = patchC11("c4p1", [], { saida: "entregue 60.000 IDs" });
    expect(r.changed).toBe(true);
    expect(JSON.stringify(r.guia)).toContain("todos os IDs da base do grupo");
  });

  it("cobre as seis páginas que citavam números do pacote antigo", () => {
    expect(Object.keys(PATCH_C11).sort()).toEqual(["c11p1", "c11p17", "c11p2", "c11p7", "c11p8", "c11p9"]);
  });
});
