import { describe, expect, it } from "vitest";
import { atividadeCanonica, estavel, mesmaQuestao, mesmoConteudo, patchC11, PATCH_C11, questaoSincronizavel, type ConteudoPagina, type ConteudoQuestao } from "../scripts/content/conteudo-publicado";

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

/** A pergunta de checagem nasce do guia do professor. Quando o guia muda na origem, a pergunta precisa
    mudar na base já importada; e uma questão que não mudou não pode ganhar versão nova a cada build. */
describe("sincronização de questões", () => {
  const checagem = (): ConteudoQuestao => ({
    label: "Pergunta de checagem", prompt: "Qual das três ideias explica o par?",
    options: { source: "guia", maxLength: 600 }, answerKey: null, feedback: { modelAnswer: "O Limite." },
  });

  it("não acusa diferença na ordem das chaves nem entre ausência e nulo", () => {
    const b = checagem();
    b.options = { maxLength: 600, source: "guia" };
    expect(mesmaQuestao(checagem(), b)).toBe(true);
    expect(mesmaQuestao({ ...checagem(), answerKey: undefined }, checagem())).toBe(true);
  });

  it("acusa a mudança de enunciado e de resposta modelo", () => {
    expect(mesmaQuestao(checagem(), { ...checagem(), prompt: "Qual número desta tabela você levaria para um comitê?" })).toBe(false);
    expect(mesmaQuestao(checagem(), { ...checagem(), feedback: { modelAnswer: "As duas razões de chances." } })).toBe(false);
  });

  it("sincroniza só o que nasce do repositório: checagem e curadas, nunca a questão original com correção própria", () => {
    const curadas = new Set(["c6p20q"]);
    expect(questaoSincronizavel("c4p22-checagem", curadas)).toBe(true);
    expect(questaoSincronizavel("c6p20q", curadas)).toBe(true);
    expect(questaoSincronizavel("c3p7q", curadas)).toBe(false);   // corrigida por applyContentPatches
    expect(questaoSincronizavel("c4p10q", curadas)).toBe(false);
  });
});

/** Os textos do capítulo acompanham a origem a cada importação; a atividade do capítulo 11 entra já corrigida,
    senão o importador e patchCapitulo11 se desfariam um ao outro para sempre. */
describe("atividade canônica do capítulo", () => {
  it("aplica a correção do capítulo 11 e é idempotente", () => {
    const origem = "Construir o modelo sobre uma base de 60.000 propostas, com teste fora do tempo.";
    const uma = atividadeCanonica("c11", origem);
    expect(uma).toBe("Construir o modelo sobre a base do grupo, com cerca de 1 milhão de propostas e teste fora do tempo.");
    expect(atividadeCanonica("c11", uma)).toBe(uma);
  });
  it("não toca os outros capítulos e preserva a ausência", () => {
    expect(atividadeCanonica("c6", "Avançar o boosting.")).toBe("Avançar o boosting.");
    expect(atividadeCanonica("c6", undefined)).toBeNull();
  });
});
