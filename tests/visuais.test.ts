import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { aucPorPares, curvaRoc, ks, mesDoDefault, mulberry32, ordemSorteada, pdAcumulada, posicoesRecusadas, riscoMensal } from "../src/lib/visuais/metricas";
import oot from "../src/lib/visuais/oot-logistica.json";

const gerador = JSON.parse(readFileSync("content/generated/dados.json", "utf8")).DADOS;

describe("visuais nativos: a fila de risco reproduz o gerador", () => {
  it("737 propostas, 81 defaults, AUC 0,7257 em 53.136 pares", () => {
    expect(oot.y.length).toBe(737);
    expect(oot.y.reduce((a: number, b: number) => a + b, 0)).toBe(81);
    const { auc, pares } = aucPorPares(oot.y, oot.pd);
    expect(pares).toBe(53136);
    expect(auc).toBeCloseTo(gerador.res.logit_oot.auc, 4);
  });
  it("KS 0,3621 medido em PD de 9,74%", () => {
    const r = ks(curvaRoc(oot.y, oot.pd));
    expect(r.ks).toBeCloseTo(gerador.res.logit_oot.ks, 4);
    expect(r.pd).toBeCloseTo(0.0975, 4);
  });
  it("corte de 12%: 212 recusadas, 48 de 81 defaults e 164 de 656 adimplentes (página c7p6)", () => {
    const roc = curvaRoc(oot.y, oot.pd);
    const k = posicoesRecusadas(oot.pd, 0.12);
    expect(k).toBe(212);
    expect(Math.round(roc[k].tpr * 81)).toBe(48);
    expect(Math.round(roc[k].fpr * 656)).toBe(164);
  });
  it("sortear sem modelo dá AUC perto de 0,5 e é reprodutível pela semente", () => {
    const o1 = ordemSorteada(737, 7), o2 = ordemSorteada(737, 7);
    expect(o1).toEqual(o2);
    const pdSorteada = new Array(737).fill(0); o1.forEach((idx, pos) => { pdSorteada[idx] = 1 - pos / 737; });
    const { auc } = aucPorPares(oot.y, pdSorteada);
    expect(Math.abs(auc - 0.5)).toBeLessThan(0.06);
  });
});

describe("visuais nativos: cem vidas em doze meses", () => {
  it("risco mensal constante: PD de 10% em 12 meses dá 5,1% em 6 e 19,0% em 24", () => {
    const h = riscoMensal(0.1, 12);
    expect(pdAcumulada(h, 12)).toBeCloseTo(0.1, 6);
    expect(pdAcumulada(h, 6)).toBeCloseTo(0.0513, 3);
    expect(pdAcumulada(h, 24)).toBeCloseTo(0.19, 3);
  });
  it("em 100 operações a contagem em 12 meses fica em média perto de 10, com desvio perto de 3", () => {
    const h = riscoMensal(0.1, 12); const r = mulberry32(20260501);
    const contagens: number[] = [];
    for (let s = 0; s < 2000; s++) { let c = 0; for (let i = 0; i < 100; i++) if (mesDoDefault(h, r()) <= 12) c++; contagens.push(c); }
    const media = contagens.reduce((a, b) => a + b, 0) / contagens.length;
    const dp = Math.sqrt(contagens.reduce((a, b) => a + (b - media) ** 2, 0) / contagens.length);
    expect(Math.abs(media - 10)).toBeLessThan(0.3);
    expect(Math.abs(dp - 3)).toBeLessThan(0.3);
  });
});

import { dia, entraPelaRegraIngenua, estadoDoCampo, fracaoManifestada, mesIdx, prevalenciaComImaturas, rotuloDia, safraMadura } from "../src/lib/visuais/tempo";

describe("visuais nativos: a linha do tempo do cliente (c3p7)", () => {
  it("a fatura de fevereiro (28 fev, disponível 30 abr) não entra numa decisão de 15 mar, embora o fato seja anterior", () => {
    const evento = dia(28, 2), disp = dia(30, 4), decisao = dia(15, 3);
    expect(rotuloDia(evento)).toBe("28 fev"); expect(rotuloDia(disp)).toBe("30 abr");
    expect(estadoDoCampo(evento, disp, decisao)).toBe("ocorreu_sem_saber");
    expect(entraPelaRegraIngenua(evento, decisao)).toBe(true); // o erro que a regra ingênua comete
    expect(estadoDoCampo(evento, disp, dia(30, 4))).toBe("utilizavel");
    expect(estadoDoCampo(dia(20, 7), dia(21, 7), decisao)).toBe("futuro");
  });
});

describe("visuais nativos: a base amadurece (c3p11)", () => {
  it("com referência em jan 2025, horizonte 12 e apuração 1, a última safra que entra é dez 2023 e nenhuma de 2024 entra", () => {
    const ref = mesIdx(2025, 1);
    expect(safraMadura(mesIdx(2023, 12), ref)).toBe(true);
    expect(safraMadura(mesIdx(2024, 1), ref)).toBe(false);
  });
  it("safra imatura com rótulo zero puxa a prevalência para baixo, nunca para cima", () => {
    expect(fracaoManifestada(6)).toBeCloseTo(0.42, 6); expect(fracaoManifestada(12)).toBe(1); expect(fracaoManifestada(0)).toBe(0);
    const safras = Array.from({ length: 36 }, (_, i) => mesIdx(2022, 1) + i);
    const r = prevalenciaComImaturas(safras, mesIdx(2025, 1), 0.1);
    expect(r.imaturas).toBe(12);
    expect(r.comImaturas).toBeLessThan(0.1); expect(r.comImaturas).toBeGreaterThan(0.07);
  });
});

import { GRADE_CORTES, chocar, curva, otimo, parcelas, pontoDeEquilibrio, realizado } from "../src/lib/visuais/economia";

describe("visuais nativos: a curva de lucro reproduz o motor econômico da aula (c8p5 a c8p11)", () => {
  const pd = oot.pd as number[]; const ead = (oot as { ead: number[] }).ead;
  it("operação padrão de R$ 10 mil com PD 10%: resultado R$ 350 e equilíbrio em 13,76%", () => {
    const r = parcelas([0.1], [10000], 1);
    expect(Math.round(r.receita)).toBe(2520); expect(Math.round(r.perda)).toBe(-650); expect(Math.round(r.total)).toBe(350);
    expect(pontoDeEquilibrio(10000)).toBeCloseTo(0.1376, 4);
  });
  it("corte de 10%: 469 aprovados e R$ 585 mil; máximo da curva em 14% com 580 aprovados e R$ 608 mil", () => {
    const r10 = parcelas(pd, ead, 0.10);
    expect(r10.aprovados).toBe(469); expect(Math.round(r10.total / 1000)).toBe(585);
    const best = otimo(curva(pd, ead, GRADE_CORTES));
    expect(best.corte).toBeCloseTo(0.14, 6); expect(best.parcelas.aprovados).toBe(580); expect(Math.round(best.parcelas.total / 1000)).toBe(608);
    expect(Math.round(best.parcelas.operacao / 1000)).toBe(-70); expect(Math.round(best.parcelas.perda / 1000)).toBe(-346);
  });
  it("resultado realizado na janela: R$ 378 mil na carteira inteira e R$ 654 mil com corte de 10%", () => {
    const tudo = pd.reduce((s, _, i) => s + realizado((oot.y as number[])[i], ead[i]), 0);
    const ap10 = pd.reduce((s, v, i) => s + (v < 0.1 ? realizado((oot.y as number[])[i], ead[i]) : 0), 0);
    expect(Math.round(tudo / 1000)).toBe(378); expect(Math.round(ap10 / 1000)).toBe(654);
  });
  it("choque em log odds preserva o intervalo e sobe a PD média", () => {
    const media = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / xs.length;
    expect(media(pd)).toBeCloseTo(0.0972, 3);
    const chocada = pd.map((v) => chocar(v, 0.8));
    expect(media(chocada)).toBeGreaterThan(media(pd)); expect(Math.max(...chocada)).toBeLessThan(1);
    expect(chocar(0.5, 0)).toBe(0.5);
  });
});

import { BETA_AULA, atrasoNaFronteira, descida, escore, logisticaSoUtil, perdaLog, retaMinimosQuadrados, sigmoide, type Proposta } from "../src/lib/visuais/logistica";
import did from "../src/lib/visuais/did.json";

describe("visuais nativos: regressão logística do capítulo 4 reproduz o gerador", () => {
  const base = did.base as Proposta[];
  it("descida de gradiente com passo 0,1: primeira iteração e convergência em 20.000 (c4p16 e c4p17)", () => {
    const tr = descida(base, [0, 1, 20000]);
    expect(tr[0].perda).toBeCloseTo(0.693147, 5);
    expect(tr[1].beta[1]).toBeCloseTo(0.059375, 6); expect(tr[1].beta[2]).toBeCloseTo(0.0234375, 6);
    expect(tr[2].beta[0]).toBeCloseTo(-5.66657, 4); expect(tr[2].beta[1]).toBeCloseTo(0.7453, 4); expect(tr[2].beta[2]).toBeCloseTo(1.3955, 4);
    expect(tr[2].perda).toBeCloseTo(0.432824, 5);
  });
  it("proposta #11 (utilização 70%, atraso 5 dias): z 0,2483 e PD 56,18% (c4p8)", () => {
    const e = escore(BETA_AULA, 70, 5);
    expect(e.z).toBeCloseTo(0.2483, 3); expect(sigmoide(e.z)).toBeCloseTo(0.5618, 3);
  });
  it("corte de 50%: 8 recusadas, 6 defaults evitados, 2 boas recusadas (c4p19)", () => {
    const rec = base.filter((b) => sigmoide(escore(BETA_AULA, b.util, b.atraso).z) >= 0.5);
    expect(rec.length).toBe(8); expect(rec.filter((b) => b.y === 1).length).toBe(6);
    // a fronteira passa por PD = 50% exatamente
    const u = 60; const a = atrasoNaFronteira(BETA_AULA, 0.5, u); expect(sigmoide(escore(BETA_AULA, u, a).z)).toBeCloseTo(0.5, 6);
  });
  it("a reta na probabilidade: negativa abaixo de 12,8% de utilização e 11,18 pontos por 10 pontos (c4p2)", () => {
    const r = retaMinimosQuadrados(base);
    expect(-r.a / r.b).toBeCloseTo(12.76, 1); expect(r.b * 10).toBeCloseTo(0.1118, 3);
    expect(r.a + r.b * 5).toBeCloseTo(-0.087, 2); expect(r.a + r.b * 110).toBeCloseTo(1.087, 2);
    const c = logisticaSoUtil(base, 5000); expect(c[1]).toBeGreaterThan(0); expect(perdaLog([c[0], c[1], 0], base)).toBeLessThan(0.6931);
  });
});

import { avaliarCorte, crescer, errosNaAmostra, folhas, melhorCorte, todosOsCandidatos, wilson } from "../src/lib/visuais/arvore";

describe("visuais nativos: a árvore que cresce reproduz o gerador (capítulo 5)", () => {
  const base = did.base as Proposta[];
  const gerador = JSON.parse(readFileSync("content/generated/dados.json", "utf8")).DID;
  it("corte candidato utilização 62,5: 9 e 7 propostas, Gini 0,34568 e 0,24490, ganho 0,19841 (c5p6)", () => {
    const a = avaliarCorte(base, "util", 62.5);
    expect(a.esq.length).toBe(9); expect(a.dir.length).toBe(7);
    expect(a.giniEsq).toBeCloseTo(0.34568, 5); expect(a.giniDir).toBeCloseTo(0.2449, 4); expect(a.ganho).toBeCloseTo(0.19841, 5);
  });
  it("todos os candidatos batem com a busca do gerador e a raiz é utilização 57,5 com ganho 0,28125 (c5p7)", () => {
    const util = todosOsCandidatos(base).filter((a) => a.v === "util");
    gerador.busca_cortes.utilizacao.forEach((c: { corte: number; ganho: number }, i: number) => { expect(util[i].corte).toBe(c.corte); expect(util[i].ganho).toBeCloseTo(c.ganho, 6); });
    const m = melhorCorte(base)!; expect(m.v).toBe("util"); expect(m.corte).toBe(57.5); expect(m.ganho).toBeCloseTo(0.28125, 6);
  });
  it("nível 2: esquerda utilização 27,5 e direita utilização 87,5 (empate com atraso 2,5 decidido pela ordem), c5p9", () => {
    const t = crescer(base, 2);
    expect(t.esq!.corte).toMatchObject({ v: "util", valor: 27.5 }); expect(t.esq!.corte!.ganho).toBeCloseTo(0.09375, 6);
    expect(t.dir!.corte).toMatchObject({ v: "util", valor: 87.5 }); expect(t.dir!.corte!.ganho).toBeCloseTo(0.09375, 6);
  });
  it("freios: profundidade 2 e mínimo 2 dão 4 folhas, 2 erros, menor folha com 2 e pior intervalo de 81% (c5p14)", () => {
    const t = crescer(base, 2, 2); const fs = folhas(t);
    expect(fs.length).toBe(4); expect(errosNaAmostra(t)).toBe(2); expect(Math.min(...fs.map((f) => f.n))).toBe(2);
    const pior = Math.max(...fs.map((f) => { const w = wilson(f.d, f.n); return w.hi - w.lo; })); expect(Math.round(pior * 100)).toBe(81);
  });
  it("instabilidade: retirar a proposta #10 troca a variável do nó direito; a raiz resiste (c5p16)", () => {
    const sem10 = base.filter((p) => p.id !== 10); const t = crescer(sem10, 2);
    expect(t.corte).toMatchObject({ v: "util", valor: 57.5 }); expect(t.dir!.corte!.v).toBe("atraso");
    const sem3 = crescer(base.filter((p) => p.id !== 3), 2); expect(sem3.dir!.corte!.v).toBe("util");
  });
});
