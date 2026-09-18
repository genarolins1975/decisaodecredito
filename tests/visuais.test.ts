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

describe("boosting didático contra o gerador (capítulo 6)", async () => {
  const { boostingRegressao, boostingClassificacao, rastro, PONTOS } = await import("@/lib/visuais/boosting");
  const dados = JSON.parse(readFileSync("content/generated/dados.json", "utf8"));
  const did = JSON.parse(readFileSync("src/lib/visuais/did.json", "utf8"));
  it("regressão: 8 pontos, η 0,5, quatro tocos: cortes 4,5 · 7,5 · 2,5 · 5,5 e MSE 10,1875 → 0,4485", () => {
    const passos = boostingRegressao(PONTOS.x, PONTOS.y, 0.5, 4);
    const ref = dados.DID.boost_reg.passos;
    for (let m = 0; m <= 4; m++) {
      expect(passos[m].mse).toBeCloseTo(ref[m].mse, 6);
      passos[m].F.forEach((f, i) => expect(f).toBeCloseTo(ref[m].F[i], 6));
      if (m) { expect(passos[m].arvore!.corte!.valor).toBe(ref[m].toco.corte); expect(passos[m].arvore!.esq!.valor).toBeCloseTo(ref[m].toco.esq, 6); }
    }
    expect(passos[1].arvore!.corte!.valor).toBe(4.5); expect(passos[4].mse).toBeCloseTo(0.44851, 4);
  });
  it("classificação: 16 propostas, η 0,4, profundidade 2, folha mínima 2: perda 0,6931 → 0,4748 e árvores do gerador", () => {
    const passos = boostingClassificacao(did.base, 0.4, 4);
    const ref = dados.DID.boost_clf.passos;
    for (let m = 0; m <= 4; m++) {
      expect(passos[m].perda).toBeCloseTo(ref[m].perda, 6);
      passos[m].F.forEach((f, i) => expect(f).toBeCloseTo(ref[m].F[i], 6));
    }
    // raiz da árvore 1 em utilização 57,5 (5,75 na escala do gerador), filhos em 27,5 e 87,5
    const a1 = passos[1].arvore!; expect(a1.corte).toMatchObject({ v: 0, valor: 57.5 }); expect(a1.esq!.corte!.valor).toBe(27.5); expect(a1.dir!.corte!.valor).toBe(87.5);
    // árvore 2 divide o lado direito por atraso ≤ 2,5 d (0,25 na escala do gerador, em dezenas de dias)
    expect(passos[2].arvore!.dir!.corte).toMatchObject({ v: 1, valor: 2.5 });
    // rastro da proposta 12: +0,200 · +0,183 · +0,165 · +0,152, PD final 66,8%
    const r = rastro(passos, 11, 0.4);
    expect(r.map((x) => Math.round(x.parcela * 1000) / 1000)).toEqual([0, 0.2, 0.183, 0.165, 0.152]);
    expect(r[4].p).toBeCloseTo(0.668, 3);
  });
  it("η e M acoplados: η × árvores até perda 0,50 fica perto de 1,5 (c6p16)", () => {
    for (const [eta, arvores] of [[0.1, 14], [0.2, 7], [0.4, 4], [0.5, 3], [1, 2]] as const) {
      const passos = boostingClassificacao(did.base, eta, 20);
      const m = passos.findIndex((p) => p.perda <= 0.5);
      expect(m).toBe(arvores);
    }
  });
});

describe("monitoramento contra o gerador (capítulo 9)", async () => {
  const { indiceDeEstabilidade, limitesDecis, diferencaProporcoes, PERGUNTAS, psi } = await import("@/lib/visuais/monitoramento");
  const esc = JSON.parse(readFileSync("src/lib/visuais/escores.json", "utf8"));
  const mon = JSON.parse(readFileSync("src/lib/visuais/monitoramento.json", "utf8"));
  it("faixas congeladas no treino: decis 731,0 · 763,9 · … · 908,9 e PSI do escore 0,0136", () => {
    const edges = limitesDecis(esc.treino.sc);
    edges.forEach((e, i) => expect(e).toBeCloseTo(mon.psi.edges[i], 0));
    const r = indiceDeEstabilidade(esc.treino.sc, esc.janela.sc, edges); // limites calculados aqui; os do gerador estão arredondados a uma casa
    r.faixas.forEach((f, j) => { expect(f.p).toBeCloseTo(mon.psi.ref[j], 2); expect(f.q).toBeCloseTo(mon.psi.cur[j], 2); }); // escores com uma casa: um empate no limite muda uma proposta de faixa
    expect(r.valor).toBeCloseTo(0.0136, 3);
    expect(r.faixas[0].psi).toBeCloseTo(0.00065, 3); expect(r.faixas[3].psi).toBeCloseTo(0.00436, 3);
  });
  it("PSI direto das proporções do gerador reproduz 0,0136 e o piso de 0,0001 entra numa faixa vazia", () => {
    expect(psi(mon.psi.ref, mon.psi.cur).valor).toBeCloseTo(0.0136, 3);
    const r = psi([0.5, 0.5], [1, 0]); expect(r.faixas[1].q).toBeCloseTo(1e-4, 6); expect(r.valor).toBeGreaterThan(3);
  });
  it("equidade: aprovação 72,7% contra 68,0%, diferença 4,7 pp com IC de −2,5 a 11,9 pp (c9p6)", () => {
    const g1 = mon.fair.G1, g2 = mon.fair.G2; const q = PERGUNTAS[0];
    const d = diferencaProporcoes(q.k(g1), q.n(g1), q.k(g2), q.n(g2));
    expect(d.p1).toBeCloseTo(0.7269, 3); expect(d.p2).toBeCloseTo(0.6798, 3);
    expect(d.dif * 100).toBeCloseTo(4.7, 1); expect(d.lo * 100).toBeCloseTo(-2.5, 1); expect(d.hi * 100).toBeCloseTo(11.9, 1); expect(d.excluiZero).toBe(false);
    // recusa entre pagadores é a taxa de falsos positivos do gerador; default entre recusados é o valor preditivo positivo
    expect(PERGUNTAS[2].k(g1) / PERGUNTAS[2].n(g1)).toBeCloseTo(mon.fair.G1.fpr, 3); expect(PERGUNTAS[3].k(g1) / PERGUNTAS[3].n(g1)).toBeCloseTo(mon.fair.G1.vpp, 3);
  });
  it("nível: prevalência da janela 10,99% contra 9,56% no treino, +1,43 pp com IC de −1,15 a +4,02 pp (c9p5)", () => {
    const d = diferencaProporcoes(Math.round(mon.res.logit_oot.obs * mon.n.oot), mon.n.oot, Math.round(mon.res.logit_treino.obs * mon.n.treino), mon.n.treino);
    expect(d.dif * 100).toBeCloseTo(1.43, 1); expect(d.lo * 100).toBeCloseTo(-1.15, 1); expect(d.hi * 100).toBeCloseTo(4.02, 1);
  });
});

describe("perda e descida em um parâmetro (capítulo 2)", async () => {
  const { perdaConstante, descidaConstante } = await import("@/lib/visuais/perda");
  const { crescer, folhas, errosNaAmostra, wilson } = await import("@/lib/visuais/arvore");
  const did = JSON.parse(readFileSync("src/lib/visuais/did.json", "utf8"));
  it("8 propostas com 1 default: perda 0,5067 em 2% e mínimo 0,3768 na frequência 12,5% (c2p11)", () => {
    expect(perdaConstante(0.02, 1, 8)).toBeCloseTo(0.5067, 4);
    expect(perdaConstante(0.125, 1, 8)).toBeCloseTo(0.3768, 4);
    expect(perdaConstante(0.3, 1, 8)).toBeGreaterThan(perdaConstante(0.125, 1, 8));
  });
  it("descida com passo 2 a partir de b = 0 chega à frequência observada (c2p12); passo grande demais oscila", () => {
    const it = descidaConstante(1, 8, 2, 40);
    expect(it[0]).toMatchObject({ t: 0, b: 0, p: 0.5, g: 0.375 });
    expect(it[1].b).toBeCloseTo(-0.75, 6);
    expect(it[40].p).toBeCloseTo(0.125, 3);
    const grande = descidaConstante(1, 8, 40, 6); expect(Math.abs(grande[6].g)).toBeGreaterThan(Math.abs(it[6].g));
  });
  it("árvore que decora: profundidade 1 erra 2 com 2 folhas; profundidade 3 sem freio cria folha de uma proposta, a #15 (c2p14)", () => {
    const a1 = crescer(did.base, 1, 1); expect(folhas(a1).length).toBe(2); expect(errosNaAmostra(a1)).toBe(2);
    const a3 = crescer(did.base, 3, 1); const uma = folhas(a3).filter((f) => f.n === 1);
    expect(uma.length).toBeGreaterThan(0); expect(uma.some((f) => f.grupo[0].id === 15 && f.d === 0)).toBe(true);
    expect(errosNaAmostra(a3)).toBe(0);
  });
  it("intervalo de Wilson: 1 em 8 vai de 2,2% a 47,1%; 100 em 800 de 10,4% a 15,0%; 0 em 1 vai até 79,3% (c2p16)", () => {
    const w8 = wilson(1, 8); expect(w8.lo * 100).toBeCloseTo(2.2, 1); expect(w8.hi * 100).toBeCloseTo(47.1, 1);
    const w80 = wilson(10, 80); expect(w80.lo * 100).toBeCloseTo(6.9, 1); expect(w80.hi * 100).toBeCloseTo(21.5, 1);
    const w800 = wilson(100, 800); expect(w800.lo * 100).toBeCloseTo(10.4, 1); expect(w800.hi * 100).toBeCloseTo(15.0, 1);
    expect(wilson(0, 1).hi * 100).toBeCloseTo(79.3, 1);
  });
});

describe("política em três zonas contra o motor da aula (capítulo 10)", async () => {
  const { avaliarCarteira, sobChoque, CHOQUE, POLITICA } = await import("@/lib/visuais/politica");
  const { esperado } = await import("@/lib/visuais/economia");
  const oot = JSON.parse(readFileSync("src/lib/visuais/oot-logistica.json", "utf8"));
  it("corte 12%, teto 30%, capacidade 80: 548 aprovados, R$ 607 mil, 36 defaults entre aprovados, parcelas da rodada 1", () => {
    const a = avaliarCarteira(oot);
    expect(a.aprovados).toBe(548); expect(a.revisados).toBe(80); expect(a.defaultsAprovados).toBe(36);
    expect(a.esperado / 1000).toBeCloseTo(607, 0);
    expect(a.receitaEsp / 1e6).toBeCloseTo(2.11, 2); expect(a.perda / 1000).toBeCloseTo(307, 0); expect(a.funding / 1000).toBeCloseTo(959, 0);
    expect(a.operacao).toBeCloseTo(548 * 120, 0); expect(a.capital / 1000).toBeCloseTo(160, 0); expect(a.revisoes).toBe(7200);
    expect(a.exposicao / 1e6).toBeCloseTo(7.99, 2); expect(a.perda / a.exposicao).toBeCloseTo(0.0384, 3);
  });
  it("sob o choque (funding 21%, perda 80%, PD +0,30 em log odds) com a mesma política: 461 aprovados e R$ −225 mil", () => {
    const pdc = sobChoque(oot.pd); const ptc = sobChoque(oot.pt);
    const a = avaliarCarteira({ ...oot, pd: pdc, pt: ptc }, { funding: CHOQUE.funding, lgd: CHOQUE.lgd });
    expect(a.aprovados).toBe(461); expect(a.esperado / 1000).toBeCloseTo(-225, 0); expect(a.perda / a.exposicao).toBeCloseTo(0.0543, 3);
  });
  it("três clientes, três zonas: Helena 44,9% dá −R$ 2.618 e recusa; Rogério R$ 1.261 e automática; Dalva revisão", () => {
    expect(esperado(0.449, 9000)).toBeCloseTo(-2618, 0);
    expect(esperado(0.0516, 15000)).toBeCloseTo(1260, -1);
    const zona = (pd: number) => (pd <= POLITICA.corte ? "automática" : pd <= POLITICA.teto ? "revisão" : "recusa");
    expect([zona(0.449), zona(0.052), zona(0.219)]).toEqual(["recusa", "automática", "revisão"]);
  });
});
