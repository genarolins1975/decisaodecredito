import { describe, expect, it } from "vitest";
import { ALUNOS, CRITERIOS, ENTREGAS, PENDENCIAS, REVISAO, acrescimo, composicao, consolidacao, credito, devolutiva, documental, integrantes, n2, notaAnterior, notaIntermediaria, notaBase, notaEquiparada, notaQuestao, pontosAnteriores, pts, regua, total } from "@/lib/avaliacoes/trabalho-1";
import { termos, vincular } from "@/lib/avaliacoes/vinculo";

/**
 * Valores publicados, por entrega. Pontos vigentes, nota atual, crédito, acréscimo e notas por questão vêm do documento
 * "Trabalho 1 Avaliação Conferida" (06/10/2026); a nota anterior é a da avaliação de 12/09/2026, repetida no mesmo
 * documento. Documental, total e base são derivados dos pontos e conferem a soma.
 */
const DOCUMENTO: Record<string, { criterios: string[]; doc: string; total: string; base: string; anterior: string; nota: string; credito: string; acrescimo: string; questoes: string[] }> = {
  "supervisao-bcb": { criterios: ["23,83", "18,67", "18,17", "13,67", "15"], doc: "74,33", total: "89,33", base: "8,93", anterior: "10,00", nota: "10,00", credito: "0,00", acrescimo: "0,00", questoes: ["8,50", "8,64", "8,00"] },
  "consignado-jader": { criterios: ["22,67", "19,17", "16,17", "10,17", "15"], doc: "68,17", total: "83,17", base: "8,32", anterior: "9,70", nota: "9,70", credito: "0,00", acrescimo: "0,00", questoes: ["8,68", "8,18", "7,86"] },
  "banco-asa": { criterios: ["22", "17", "15", "11,83", "15"], doc: "65,83", total: "80,83", base: "8,08", anterior: "9,58", nota: "9,58", credito: "0,00", acrescimo: "0,00", questoes: ["8,18", "7,86", "7,54"] },
  "fidc-imobiliario": { criterios: ["24,17", "21,67", "18,33", "13", "15"], doc: "77,17", total: "92,17", base: "9,22", anterior: "8,45", nota: "10,00", credito: "34,33", acrescimo: "1,55", questoes: ["9,18", "8,82", "9,07"] },
  "fidc-cedente": { criterios: ["18,17", "0", "16,83", "8,17", "15"], doc: "43,17", total: "58,17", base: "5,82", anterior: "8,47", nota: "8,47", credito: "0,00", acrescimo: "0,00", questoes: ["5,11", "4,93", "5,11"] },
  "hipotecario-europeu": { criterios: ["17,67", "0", "16,67", "2", "10"], doc: "36,33", total: "46,33", base: "4,63", anterior: "7,66", nota: "7,89", credito: "4,50", acrescimo: "0,22", questoes: ["7,43", "4,79", "6,96"] },
  braskem: { criterios: ["11,33", "0", "12", "0", "5"], doc: "23,33", total: "28,33", base: "2,83", anterior: "7,00", nota: "7,00", credito: "0,00", acrescimo: "0,00", questoes: ["3,64", "3,32", "3,18"] },
  agrogalaxy: { criterios: ["14,17", "0", "10,17", "0", "15"], doc: "24,33", total: "39,33", base: "3,93", anterior: "7,54", nota: "7,54", credito: "0,00", acrescimo: "0,00", questoes: ["3,86", "3,71", "3,71"] },
  "fintech-produto-publico": { criterios: ["20,83", "13,33", "15,67", "12", "15"], doc: "61,83", total: "76,83", base: "7,68", anterior: "8,80", nota: "9,39", credito: "12,00", acrescimo: "0,59", questoes: ["7,29", "6,79", "7,29"] },
};

/** Nota por aluno como está no documento (18 seções): anterior e atual. */
const NOTA_ALUNO: Record<string, [string, string]> = {
  "Tomaz Leal": ["10,00", "10,00"], "Roberto Gomides": ["10,00", "10,00"], "Diana Cabral": ["10,00", "10,00"], "Jader Brenny Santana": ["9,70", "9,70"],
  "André Souza": ["9,58", "9,58"], "André Meirelles": ["9,58", "9,58"], "Sebastião": ["9,58", "9,58"], "Renata Valsa": ["8,45", "10,00"], "Larissa Bastos": ["8,45", "10,00"],
  "Gabriel Winck": ["8,45", "10,00"], "Guilherme Castro": ["8,47", "8,47"], "Michelle Bouhid": ["7,66", "7,89"], "Carlos Eduardo N Campos": ["7,00", "7,00"],
  "Gabriel Andrade": ["7,54", "7,54"], "João Pedro": ["7,54", "7,54"], "Matheus Luchi": ["7,54", "7,54"],
  "Stêphan Lana Severiano": ["8,80", "9,39"], "Raphael dos Santos Andrade Silva": ["8,80", "9,39"],
};

describe("Trabalho 1: reconciliação com os documentos de avaliação e de revisão", () => {
  it("cada entrega reproduz critérios, composição, nota anterior, nota atual, crédito e acréscimo publicados", () => {
    expect(ENTREGAS.map((e) => e.id).sort()).toEqual(Object.keys(DOCUMENTO).sort());
    for (const e of ENTREGAS) {
      const d = DOCUMENTO[e.id];
      expect(CRITERIOS.map((c) => pts(e.pontos[c.chave])), e.id).toEqual(d.criterios);
      expect(n2(documental(e)), e.id).toBe(d.doc);
      expect(n2(total(e)), e.id).toBe(d.total);
      expect(n2(notaBase(e)), e.id).toBe(d.base);
      expect(n2(notaAnterior(e)), e.id).toBe(d.anterior);
      expect(n2(notaEquiparada(e)), e.id).toBe(d.nota);
      expect(n2(credito(e)), e.id).toBe(d.credito);
      expect(n2(acrescimo(e)), e.id).toBe(d.acrescimo);
    }
  });

  it("a revisão não reduz nenhum critério nem nota, e o crédito é o que a regra 3/61 converte", () => {
    for (const e of ENTREGAS) {
      const antes = pontosAnteriores(e);
      for (const c of CRITERIOS) expect(e.pontos[c.chave], `${e.id} ${c.chave}`).toBeGreaterThanOrEqual(antes[c.chave]);
      expect(notaEquiparada(e), e.id).toBeGreaterThanOrEqual(notaAnterior(e));
      // nota atual = menor entre 10 e (nota anterior + 3 × crédito ÷ 61)
      expect(notaEquiparada(e), e.id).toBeCloseTo(Math.min(10, notaAnterior(e) + 3 * credito(e) / 61), 12);
    }
  });

  it("a abertura de quem teve acréscimo cita as notas de antes e depois da última revisão, calculadas", () => {
    for (const e of ENTREGAS.filter((x) => acrescimo(x) > 0.005)) expect(e.revisao.abertura, e.id).toContain(`de ${n2(notaIntermediaria(e) ?? notaAnterior(e))} para ${n2(notaEquiparada(e))}`);
  });

  it("reanálise de Michelle: 7,66 em 12/09, 7,79 na revisão das 13h45 e 7,89 com processo 2/15 (acréscimo de 0,10)", () => {
    const e = ENTREGAS.find((x) => x.id === "hipotecario-europeu")!;
    expect(n2(notaIntermediaria(e)!)).toBe("7,79");
    expect(n2(notaEquiparada(e) - notaIntermediaria(e)!)).toBe("0,10");
    expect(e.pontos.processo).toBe(2);
    expect(ENTREGAS.filter((x) => x.intermediaria).map((x) => x.id)).toEqual(["hipotecario-europeu"]);
  });

  it("três questões por entrega, cada uma com a nota (25C + 25V + 20I) ÷ 70 publicada", () => {
    for (const e of ENTREGAS) {
      expect(e.revisao.questoes.map((q) => n2(notaQuestao(q))), e.id).toEqual(DOCUMENTO[e.id].questoes);
      for (const q of e.revisao.questoes) for (const x of [q.c, q.v, q.i]) { expect(x).toBeGreaterThanOrEqual(0); expect(x).toBeLessThanOrEqual(10); }
    }
  });

  it("a régua fica fixa nos extremos da avaliação anterior: base 2,8333… vai a 7 e 8,9333… a 10", () => {
    const r = regua();
    expect(r.menor).toBeCloseTo(2.833333333, 8);
    expect(r.maior).toBeCloseTo(8.933333333, 8);
    // o fator 3/61 do documento é a mesma régua: 61 pontos brutos viram 3 pontos de nota
    expect(3 / ((r.maior - r.menor) * 10)).toBeCloseTo(3 / 61, 12);
  });

  it("a composição por extenso usa a régua fixa", () => {
    const e = ENTREGAS.find((x) => x.id === "fidc-imobiliario")!;
    expect(composicao(e)).toBe("77,17/85 na parte documental + 15/15 na apresentação = 92,17/100. Nota base: 9,22/10. Pela régua fixa da avaliação anterior: 10,00/10.");
  });

  it("dezoito alunos, cada um com as notas anterior e atual do documento; grupos e entregas individuais", () => {
    expect(ALUNOS).toHaveLength(18);
    expect(new Set(ALUNOS.map((a) => a.id)).size).toBe(18);
    for (const a of ALUNOS) {
      const d = devolutiva(a.id)!;
      expect([n2(d.anterior), n2(d.nota)], a.nome).toEqual(NOTA_ALUNO[a.nome]);
    }
    for (const e of ENTREGAS) expect(integrantes(e.id).length > 1, e.id).toBe(e.modalidade === "grupo");
    expect(integrantes("fintech-produto-publico").map((a) => a.nome)).toEqual(["Stêphan Lana Severiano", "Raphael dos Santos Andrade Silva"]);
  });

  it("a devolutiva de grupo nomeia os outros integrantes e nunca o próprio aluno", () => {
    const d = devolutiva("sebastiao")!;
    expect(d.colegas.map((c) => c.nome)).toEqual(["André Souza", "André Meirelles"]);
    expect(devolutiva("raphael-dos-santos-andrade-silva")!.colegas.map((c) => c.nome)).toEqual(["Stêphan Lana Severiano"]);
  });

  it("consolidação: médias, zeros, acréscimos e a afirmação da leitura da turma", () => {
    const c = consolidacao();
    expect(c.alunos).toBe(18);
    expect(c.entregas).toBe(9);
    expect(n2(c.minima)).toBe("7,00");
    expect(n2(c.maxima)).toBe("10,00");
    const verif = c.porCriterio.find((x) => x.criterio.chave === "verificacao")!;
    expect(verif.zeros).toBe(4);
    expect(verif.alunosZerados).toBe(6);
    expect(c.porCriterio.find((x) => x.criterio.chave === "processo")!.zeros).toBe(2);
    expect(c.entregasComAcrescimo).toBe(3);
    expect(c.alunosComAcrescimo).toBe(6);
    // "as entregas com verificação positiva ocupam as primeiras posições"
    const k = c.porEntrega.filter((x) => x.entrega.pontos.verificacao > 0).length;
    expect(c.porEntrega.slice(0, k).every((x) => x.entrega.pontos.verificacao > 0)).toBe(true);
    const soma = c.porAluno.reduce((s, x) => s + x.nota, 0);
    expect(c.mediaAlunos).toBeCloseTo(soma / 18, 12);
    expect(n2(c.mediaAlunos)).toBe("9,07");
    expect(n2(c.mediaAnteriorAlunos)).toBe("8,73");
    expect(n2(c.medianaAlunos)).toBe("9,58");
  });

  it("textos sem travessão nem meia-risca como pontuação", () => {
    const textos = [...ENTREGAS.flatMap((e) => [e.tema, e.sintese ?? "", ...(e.paragrafos ?? []).map((p) => p.texto), ...(e.aprimorar ?? []), e.ressalva ?? "",
      e.revisao.abertura, e.revisao.legendaQuestoes, e.revisao.processo, e.revisao.materiais, ...e.revisao.questoes.flatMap((q) => [q.titulo, q.texto])]),
      ...PENDENCIAS.map((p) => p.texto), ...REVISAO.criterio, ...REVISAO.conferencias.map((x) => x.texto)];
    for (const t of textos) expect(t).not.toMatch(/[—–]/);
  });
});

describe("Trabalho 1: vínculo entre devolutiva e matrícula", () => {
  const alunos = ALUNOS.map((a) => ({ id: a.id, nome: a.nome, nomeCompleto: a.nomeCompleto, email: a.email }));

  it("normaliza acento, caixa e partículas", () => {
    expect(termos("Sebastião da Silva")).toEqual(["sebastiao", "silva"]);
    expect(termos("JOÃO PEDRO")).toEqual(["joao", "pedro"]);
  });

  it("casa nome curto com nome completo, inicial e parte local do e-mail", () => {
    const r = vincular(alunos, [
      { id: "m1", nomes: ["Renata Carneiro Valsa"], email: "renata_valsa@hotmail.com" },
      { id: "m2", nomes: ["michelle.bouhid@gmail.com"], email: "michelle.bouhid@gmail.com" },
      { id: "m3", nomes: ["Carlos Eduardo Nogueira Campos"], email: "cec@x.com" },
      { id: "m4", nomes: ["Sebastiao Ferreira"], email: "s@x.com" },
    ]);
    expect(r["renata-valsa"]).toEqual({ status: "vinculado", candidatoId: "m1" });
    expect(r["michelle-bouhid"]).toEqual({ status: "vinculado", candidatoId: "m2" });
    expect(r["carlos-eduardo-n-campos"]).toEqual({ status: "vinculado", candidatoId: "m3" });
    expect(r["sebastiao"]).toEqual({ status: "vinculado", candidatoId: "m4" });
    expect(r["tomaz-leal"]).toEqual({ status: "sem_correspondencia" });
  });

  it("casa nome da plataforma mais curto que o da devolutiva, sem aceitar sobrenome diferente", () => {
    const r = vincular(alunos, [
      { id: "j", nomes: ["Jader Santana"], email: "jader@x.com" },
      { id: "e", nomes: ["Eduardo Campos"], email: "ec@x.com" },
      { id: "o", nomes: ["Gabriel Oliveira"], email: "go@x.com" },
      { id: "g", nomes: ["Gabriel"], email: "g@x.com" },
    ]);
    expect(r["jader-brenny-santana"]).toEqual({ status: "vinculado", candidatoId: "j" });
    expect(r["carlos-eduardo-n-campos"]).toEqual({ status: "vinculado", candidatoId: "e" });
    // "Gabriel Oliveira" é Gabriel Oliveira de Andrade, pelo nome completo; "Gabriel" sozinho não basta
    expect(r["gabriel-andrade"]).toEqual({ status: "vinculado", candidatoId: "o" });
    expect(r["gabriel-winck"]).toEqual({ status: "sem_correspondencia" });
  });

  it("lista da turma no formato do sistema da escola (sobrenome, nome) e cadastros curtos casam com o nome completo", () => {
    const lista = ["Almeida de Castro, Guilherme", "Carneiro Valsa, Renata", "Chelotti Marques, Bruno", "da Silva Campos Júnior, Sebastiao",
      "Eduardo Nascimento Campos, Carlos", "Fialho Bastos, Larissa", "Lopes Winck, Gabriel", "Nunes e Souza, André", "Oliveira de Andrade, Gabriel", "Pinto Tavares, Renato"];
    const r = vincular(alunos, lista.map((n, i) => ({ id: `l${i}`, nomes: [n], email: `l${i}@x.com` })));
    expect(r["guilherme-castro"]).toEqual({ status: "vinculado", candidatoId: "l0" });
    expect(r["renata-valsa"]).toEqual({ status: "vinculado", candidatoId: "l1" });
    expect(r["sebastiao"]).toEqual({ status: "vinculado", candidatoId: "l3" });
    expect(r["carlos-eduardo-n-campos"]).toEqual({ status: "vinculado", candidatoId: "l4" });
    expect(r["larissa-bastos"]).toEqual({ status: "vinculado", candidatoId: "l5" });
    expect(r["gabriel-winck"]).toEqual({ status: "vinculado", candidatoId: "l6" });
    expect(r["andre-souza"]).toEqual({ status: "vinculado", candidatoId: "l7" });
    expect(r["gabriel-andrade"]).toEqual({ status: "vinculado", candidatoId: "l8" });
    // cadastro curto pelo sobrenome do meio: "Gabriel Oliveira" é Gabriel Oliveira de Andrade
    const curto = vincular(alunos, [{ id: "go", nomes: ["Gabriel Oliveira"], email: "go@x.com" }, { id: "gl", nomes: ["Gabriel Lopes"], email: "gl@x.com" }]);
    expect(curto["gabriel-andrade"]).toEqual({ status: "vinculado", candidatoId: "go" });
    expect(curto["gabriel-winck"]).toEqual({ status: "vinculado", candidatoId: "gl" });
  });

  it("não confunde homônimos parciais e trava a ambiguidade nos dois sentidos", () => {
    const r = vincular(alunos, [
      { id: "g1", nomes: ["Gabriel Winck"], email: "g1@x.com" },
      { id: "g2", nomes: ["Gabriel Andrade"], email: "g2@x.com" },
      { id: "a1", nomes: ["André Souza Meirelles"], email: "a1@x.com" },
    ]);
    expect(r["gabriel-winck"]).toEqual({ status: "vinculado", candidatoId: "g1" });
    expect(r["gabriel-andrade"]).toEqual({ status: "vinculado", candidatoId: "g2" });
    // uma matrícula que serve a dois alunos não vincula nenhum deles
    expect(r["andre-souza"].status).toBe("ambiguo");
    expect(r["andre-meirelles"].status).toBe("ambiguo");
  });

  it("Stêphan e Raphael casam pelo nome, e Raphael (Andrade) não disputa a matrícula de Gabriel Andrade", () => {
    const r = vincular(alunos, [
      { id: "st", nomes: ["Lana Severiano, Stephan"], email: "st@x.com" },
      { id: "ra", nomes: ["Raphael Silva"], email: "ra@x.com" },
      { id: "ga", nomes: ["Oliveira de Andrade, Gabriel"], email: "ga@x.com" },
    ]);
    expect(r["stephan-lana-severiano"]).toEqual({ status: "vinculado", candidatoId: "st" });
    expect(r["raphael-dos-santos-andrade-silva"]).toEqual({ status: "vinculado", candidatoId: "ra" });
    expect(r["gabriel-andrade"]).toEqual({ status: "vinculado", candidatoId: "ga" });
  });

  it("dois candidatos para o mesmo nome curto ficam sem vínculo", () => {
    const r = vincular(alunos, [
      { id: "s1", nomes: ["Sebastião Alves"], email: "s1@x.com" },
      { id: "s2", nomes: ["Sebastião Rocha"], email: "s2@x.com" },
    ]);
    expect(r["sebastiao"]).toEqual({ status: "ambiguo", candidatos: ["s1", "s2"] });
  });

  it("nome provisório igual ao e-mail vale pela parte local, sem o domínio", () => {
    const r = vincular(alunos, [{ id: "go", nomes: ["gabriel.oliveira@gmail.com"], email: "gabriel.oliveira@gmail.com" }]);
    expect(r["gabriel-andrade"]).toEqual({ status: "vinculado", candidatoId: "go" });
  });

  it("e-mail fixado reserva a matrícula e, sem matrícula com aquele e-mail, vale o nome", () => {
    const r = vincular([{ id: "d", nome: "Diana Cabral", email: "didicstri@gmail.com" }, { id: "x", nome: "Diana" }], [
      { id: "m1", nomes: ["Diana Cabral"], email: "didicstri@gmail.com" },
    ]);
    expect(r.d).toEqual({ status: "vinculado", candidatoId: "m1" });
    expect(r.x).toEqual({ status: "sem_correspondencia" });
    const semEmail = vincular([{ id: "d", nome: "Diana Cabral", email: "didicstri@gmail.com" }], [{ id: "m2", nomes: ["Diana Cristina Cabral"], email: "outro@x.com" }]);
    expect(semEmail.d).toEqual({ status: "vinculado", candidatoId: "m2" });
  });

  it("e-mail informado na devolutiva tem precedência sobre o nome", () => {
    const r = vincular([{ id: "x", nome: "Tomaz Leal", email: "TomazLeal@Outlook.com" }], [
      { id: "t1", nomes: ["Tomaz Leal"], email: "outro@x.com" },
      { id: "t2", nomes: ["T. L."], email: "tomazleal@outlook.com" },
    ]);
    expect(r.x).toEqual({ status: "vinculado", candidatoId: "t2" });
  });
});
