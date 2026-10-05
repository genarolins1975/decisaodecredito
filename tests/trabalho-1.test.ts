import { describe, expect, it } from "vitest";
import { ALUNOS, CRITERIOS, ENTREGAS, PENDENCIAS, composicao, consolidacao, devolutiva, documental, integrantes, n2, notaBase, notaEquiparada, pts, regua, total } from "@/lib/avaliacoes/trabalho-1";
import { termos, vincular } from "@/lib/avaliacoes/vinculo";

/** Valores exibidos no documento de devolutivas, por entrega: critérios, documental, total, base e nota equiparada. */
const DOCUMENTO: Record<string, { criterios: string[]; doc: string; total: string; base: string; nota: string }> = {
  "supervisao-bcb": { criterios: ["23,83", "18,67", "18,17", "13,67", "15"], doc: "74,33", total: "89,33", base: "8,93", nota: "10,00" },
  "consignado-jader": { criterios: ["22,67", "19,17", "16,17", "10,17", "15"], doc: "68,17", total: "83,17", base: "8,32", nota: "9,70" },
  "banco-asa": { criterios: ["22", "17", "15", "11,83", "15"], doc: "65,83", total: "80,83", base: "8,08", nota: "9,58" },
  "fidc-imobiliario": { criterios: ["24,17", "0", "18,33", "0,33", "15"], doc: "42,83", total: "57,83", base: "5,78", nota: "8,45" },
  "fidc-cedente": { criterios: ["18,17", "0", "16,83", "8,17", "15"], doc: "43,17", total: "58,17", base: "5,82", nota: "8,47" },
  "hipotecario-europeu": { criterios: ["16,17", "0", "15,67", "0", "10"], doc: "31,83", total: "41,83", base: "4,18", nota: "7,66" },
  braskem: { criterios: ["11,33", "0", "12", "0", "5"], doc: "23,33", total: "28,33", base: "2,83", nota: "7,00" },
  agrogalaxy: { criterios: ["14,17", "0", "10,17", "0", "15"], doc: "24,33", total: "39,33", base: "3,93", nota: "7,54" },
};

/** Nota por aluno como está no documento (16 seções). */
const NOTA_ALUNO: Record<string, string> = {
  "Tomaz Leal": "10,00", "Roberto Gomides": "10,00", "Diana Cabral": "10,00", "Jader Brenny Santana": "9,70",
  "André Souza": "9,58", "André Meirelles": "9,58", "Sebastião": "9,58", "Renata Valsa": "8,45", "Larissa Bastos": "8,45",
  "Gabriel Winck": "8,45", "Guilherme Castro": "8,47", "Michelle Bouhid": "7,66", "Carlos Eduardo N Campos": "7,00",
  "Gabriel Andrade": "7,54", "João Pedro": "7,54", "Matheus Luchi": "7,54",
};

describe("Trabalho 1: reconciliação com o documento de devolutivas", () => {
  it("cada entrega reproduz critérios, composição, nota base e nota equiparada publicadas", () => {
    expect(ENTREGAS.map((e) => e.id).sort()).toEqual(Object.keys(DOCUMENTO).sort());
    for (const e of ENTREGAS) {
      const d = DOCUMENTO[e.id];
      expect(CRITERIOS.map((c) => pts(e.pontos[c.chave])), e.id).toEqual(d.criterios);
      expect(n2(documental(e)), e.id).toBe(d.doc);
      expect(n2(total(e)), e.id).toBe(d.total);
      expect(n2(notaBase(e)), e.id).toBe(d.base);
      expect(n2(notaEquiparada(e)), e.id).toBe(d.nota);
    }
  });

  it("a régua leva a menor base (2,8333…) a 7 e a maior (8,9333…) a 10", () => {
    const r = regua();
    expect(r.menor).toBeCloseTo(2.833333333, 8);
    expect(r.maior).toBeCloseTo(8.933333333, 8);
  });

  it("a composição por extenso é a do documento", () => {
    const e = ENTREGAS.find((x) => x.id === "supervisao-bcb")!;
    expect(composicao(e)).toBe("74,33/85 na parte documental + 15/15 na apresentação = 89,33/100. Nota base: 8,93/10. Após a equiparação linear comum: 10,00/10.");
  });

  it("dezesseis alunos, cada um com a nota do documento; grupos de três e entregas individuais", () => {
    expect(ALUNOS).toHaveLength(16);
    expect(new Set(ALUNOS.map((a) => a.id)).size).toBe(16);
    for (const a of ALUNOS) expect(n2(devolutiva(a.id)!.nota), a.nome).toBe(NOTA_ALUNO[a.nome]);
    for (const e of ENTREGAS) expect(integrantes(e.id).length, e.id).toBe(e.modalidade === "grupo" ? 3 : 1);
  });

  it("a devolutiva de grupo nomeia os outros dois integrantes e nunca o próprio aluno", () => {
    const d = devolutiva("sebastiao")!;
    expect(d.colegas.map((c) => c.nome)).toEqual(["André Souza", "André Meirelles"]);
  });

  it("consolidação: médias, zeros e a afirmação da leitura da turma", () => {
    const c = consolidacao();
    expect(c.alunos).toBe(16);
    expect(c.entregas).toBe(8);
    expect(n2(c.minima)).toBe("7,00");
    expect(n2(c.maxima)).toBe("10,00");
    const verif = c.porCriterio.find((x) => x.criterio.chave === "verificacao")!;
    expect(verif.zeros).toBe(5);
    expect(verif.alunosZerados).toBe(9);
    expect(c.porCriterio.find((x) => x.criterio.chave === "processo")!.zeros).toBe(3);
    // "as entregas com verificação positiva ocupam as primeiras posições"
    const k = c.porEntrega.filter((x) => x.entrega.pontos.verificacao > 0).length;
    expect(c.porEntrega.slice(0, k).every((x) => x.entrega.pontos.verificacao > 0)).toBe(true);
    // média por aluno conferida à mão: soma das 16 notas equiparadas ÷ 16
    const soma = c.porAluno.reduce((s, x) => s + x.nota, 0);
    expect(c.mediaAlunos).toBeCloseTo(soma / 16, 12);
    expect(n2(c.mediaAlunos)).toBe("8,72");
  });

  it("textos sem travessão nem meia-risca como pontuação", () => {
    const textos = [...ENTREGAS.flatMap((e) => [e.tema, e.sintese, ...e.paragrafos.map((p) => p.texto), ...e.aprimorar, e.ressalva ?? ""]), ...PENDENCIAS.map((p) => p.texto)];
    for (const t of textos) expect(t).not.toMatch(/[—–]/);
  });
});

describe("Trabalho 1: vínculo entre devolutiva e matrícula", () => {
  const alunos = ALUNOS.map((a) => ({ id: a.id, nome: a.nome }));

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
    // "Gabriel Oliveira" não está contido em nenhum Gabriel da devolutiva; "Gabriel" sozinho não basta
    expect(r["gabriel-andrade"]).toEqual({ status: "sem_correspondencia" });
    expect(r["gabriel-winck"]).toEqual({ status: "sem_correspondencia" });
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

  it("dois candidatos para o mesmo nome curto ficam sem vínculo", () => {
    const r = vincular(alunos, [
      { id: "s1", nomes: ["Sebastião Alves"], email: "s1@x.com" },
      { id: "s2", nomes: ["Sebastião Rocha"], email: "s2@x.com" },
    ]);
    expect(r["sebastiao"]).toEqual({ status: "ambiguo", candidatos: ["s1", "s2"] });
  });

  it("e-mail informado na devolutiva tem precedência sobre o nome", () => {
    const r = vincular([{ id: "x", nome: "Tomaz Leal", email: "TomazLeal@Outlook.com" }], [
      { id: "t1", nomes: ["Tomaz Leal"], email: "outro@x.com" },
      { id: "t2", nomes: ["T. L."], email: "tomazleal@outlook.com" },
    ]);
    expect(r.x).toEqual({ status: "vinculado", candidatoId: "t2" });
  });
});
