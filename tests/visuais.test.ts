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

import { avaliarCorte, comparaNo, crescer, errosNaAmostra, folhas, melhorCorte, todosOsCandidatos, wilson } from "../src/lib/visuais/arvore";

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
  it("instabilidade: o contador compara a divisão, não o rótulo; só a #10 troca a variável do nó direito (c5p16)", () => {
    const ref = crescer(base, 2);
    const sem = (id: number) => crescer(base.filter((p) => p.id !== id), 2);
    const raiz = base.map((p) => comparaNo(sem(p.id), ref));
    expect(raiz.every((m) => m === "igual" || m === "mesma divisão")).toBe(true);
    expect(comparaNo(sem(8), ref)).toBe("mesma divisão"); expect(sem(8).corte!.valor).toBe(55);
    const dir = Object.fromEntries(base.map((p) => [p.id, comparaNo(sem(p.id).dir, ref.dir)]));
    expect(Object.entries(dir).filter(([, m]) => m === "trocou de variável").map(([id]) => Number(id))).toEqual([10]);
    expect(dir[14]).toBe("mesma divisão"); expect(dir[15]).toBe("ficou sem corte");
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
  it("η com quatro árvores fixas, no passo do controle (0,1 a 1): o menor erro de treino é o de 0,7, não o de 1; 0,1 para em 5,48 (c6p7 e c6p7q)", () => {
    const erro = (eta: number) => boostingRegressao(PONTOS.x, PONTOS.y, eta, 4)[4].mse;
    const etas = Array.from({ length: 10 }, (_, k) => (k + 1) / 10);
    const menor = etas.reduce((a, b) => (erro(b) < erro(a) ? b : a));
    expect(menor).toBe(0.7); expect(erro(0.7)).toBeCloseTo(0.1422, 4);
    expect(erro(1)).toBeCloseTo(0.4078, 4); expect(erro(0.1)).toBeCloseTo(5.48, 2);
    expect(boostingRegressao(PONTOS.x, PONTOS.y, 1, 1)[1].mse).toBeCloseTo(1.9219, 4);
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

describe("o modelo perfeito que está errado (capítulo 11)", async () => {
  const { estadoDoCampo } = await import("@/lib/visuais/tempo");
  const vaz = JSON.parse(readFileSync("src/lib/visuais/vazamento.json", "utf8"));
  it("o campo do horizonte nasce depois da decisão e é bloqueado; os campos da observação entram", () => {
    expect(estadoDoCampo(12, 12, 0)).toBe("futuro");
    expect(estadoDoCampo(0, 0, 0)).toBe("utilizavel");
    expect(estadoDoCampo(0, 1, 0)).not.toBe("utilizavel");
  });
  it("com o campo do horizonte a AUC fora do tempo é 1,0000 e o Brier 0,00028; honesto 0,6958; suave 0,9676", () => {
    expect(vaz.modelos.leak_total_oot.auc).toBe(1); expect(vaz.modelos.leak_total_oot.brier).toBeCloseTo(0.00028, 5);
    expect(vaz.modelos.gbm_raw_oot.auc).toBeCloseTo(0.6958, 4); expect(vaz.modelos.leak_suave_oot.auc).toBeCloseTo(0.9676, 4);
    expect(vaz.comparacao.diferenca).toBeCloseTo(0.0299, 4);
  });
});

describe("avaliação na janela fora do tempo contra o gerador (capítulo 7)", async () => {
  const { matrizConfusao, decisDeRisco, ganho, faixasDeCalibracao, brier, logLoss, deslocar, media, pares, FILA_DIDATICA } = await import("@/lib/visuais/avaliacao");
  const { aucPorPares, curvaRoc, ks } = await import("@/lib/visuais/metricas");
  const oot = JSON.parse(readFileSync("src/lib/visuais/oot-logistica.json", "utf8"));
  const mod = JSON.parse(readFileSync("src/lib/visuais/oot-modelos.json", "utf8"));
  it("acerto de classificação: corte 12% dá 73,27% com 48 de 81 capturados, abaixo da regra trivial de 89,01% (c7p2)", () => {
    const c = matrizConfusao(oot.y, oot.pd, 0.12);
    expect([c.recusadaDefault, c.recusadaPagou, c.aprovadaDefault, c.aprovadaPagou]).toEqual([48, 164, 33, 492]);
    expect(c.acerto * 100).toBeCloseTo(73.27, 2); expect(c.trivial * 100).toBeCloseTo(89.01, 2);
  });
  it("AUC como contagem de pares: 12 de 20 no exemplo didático e 53.136 pares na janela (c7p5)", () => {
    const p = pares(FILA_DIDATICA); expect(p.pares.length).toBe(20); expect(p.auc).toBeCloseTo(0.6, 6);
    expect(p.pares.filter((x) => x.estado === "correto").length).toBe(12);
    const real = aucPorPares(oot.y, oot.pd); expect(real.pares).toBe(53136); expect(real.auc).toBeCloseTo(0.7257, 4);
  });
  it("KS 0,3621 em PD 9,7% e separação 0,3426 no corte de 12% (c7p7)", () => {
    const k = ks(curvaRoc(oot.y, oot.pd)); expect(k.ks).toBeCloseTo(0.3621, 4); expect(k.pd * 100).toBeCloseTo(9.75, 1);
    const c = matrizConfusao(oot.y, oot.pd, 0.12); expect(c.recusadaDefault / 81 - c.recusadaPagou / 656).toBeCloseTo(0.3426, 4);
  });
  it("ganho por decil: 2 decis da logística alcançam 42,0% dos defaults (2,10×) e do boosting 37,0% (c7p8)", () => {
    const dl = decisDeRisco(oot.y, oot.pd); expect(dl[0]).toMatchObject({ n: 74, d: 22 });
    const g = ganho(dl, 2); expect(g.ganho).toBeCloseTo(0.4198, 3); expect(g.alavancagem).toBeCloseTo(2.1, 1); expect(g.examinados).toBe(147);
    const db = decisDeRisco(oot.y, mod.pg); expect(ganho(db, 2).ganho).toBeCloseTo(0.3704, 3);
    // limites de decil com um caso de diferença em um ponto: tolerância de um default
    mod.gains.logit.forEach((r: { pct: number; gains: number }, i: number) => expect(Math.abs(ganho(dl, i + 1).ganho - r.gains)).toBeLessThan(1.5 / 81));
  });
  it("faixas de calibração por decil de PD prevista batem com o gerador (c7p10)", () => {
    const f = faixasDeCalibracao(oot.y, oot.pd);
    f.forEach((x, j) => { const g = mod.calib.logit[j]; expect(x.k).toBe(g.k); expect(x.prev).toBeCloseTo(g.prev, 3); expect(x.lo).toBeCloseTo(g.lo, 2); expect(x.hi).toBeCloseTo(g.hi, 2); });
    expect(f[0]).toMatchObject({ n: 74, k: 1 }); expect(f.filter((x) => !x.compativel).length).toBeLessThanOrEqual(1);
  });
  it("Brier 0,09128 e log loss 0,31487; deslocar em log odds muda os dois e não muda a AUC (c7p11)", () => {
    expect(brier(oot.y, oot.pd)).toBeCloseTo(0.09128, 5); expect(logLoss(oot.y, oot.pd)).toBeCloseTo(0.31487, 5); expect(media(oot.pd) * 100).toBeCloseTo(9.72, 2);
    const d = deslocar(oot.pd, 0.5); expect(brier(oot.y, d)).not.toBeCloseTo(0.09128, 4); expect(aucPorPares(oot.y, d).auc).toBeCloseTo(0.725685, 6);
  });
});

describe("economia por proposta e política que fecha (capítulo 8)", async () => {
  const { esperado, realizado, pontoDeEquilibrio, PARAMETROS } = await import("@/lib/visuais/economia");
  const { avaliarCarteira } = await import("@/lib/visuais/politica");
  const oot = JSON.parse(readFileSync("src/lib/visuais/oot-logistica.json", "utf8"));
  it("uma operação de R$ 10 mil com PD 10%: parcelas +2.520 −650 −1.200 −120 −200 = R$ 350; ponto de equilíbrio 13,76% (c8p5, c8p6)", () => {
    expect(esperado(0.1, 10000)).toBeCloseTo(350, 0); expect(pontoDeEquilibrio(10000) * 100).toBeCloseTo(13.76, 2);
    expect(pontoDeEquilibrio(10000, { ...PARAMETROS, funding: 0.18 }) * 100).toBeCloseTo(7.31, 2); expect(pontoDeEquilibrio(10000, { ...PARAMETROS, lgd: 0.4 }) * 100).toBeCloseTo(18.82, 2);
    expect(pontoDeEquilibrio(10000, { ...PARAMETROS, receita: 0.34 }) * 100).toBeCloseTo(18.99, 2); expect(pontoDeEquilibrio(2000) * 100).toBeCloseTo(8.6, 2); expect(pontoDeEquilibrio(60000) * 100).toBeCloseTo(14.84, 2);
    expect(pontoDeEquilibrio(10000, { ...PARAMETROS, lgd: 0.3 }) * 100).toBeCloseTo(22.07, 2); expect(esperado(pontoDeEquilibrio(10000), 10000)).toBeCloseTo(0, 6);
  });
  it("apertar o corte para 10%: 55 defaults recusados (R$ 606 mil evitados), 213 bons recusados (R$ 330 mil abandonados), saldo R$ 276 mil (c8p7)", () => {
    let rd = 0, rp = 0, evit = 0, aband = 0, todos = 0, aprov = 0;
    oot.pd.forEach((p: number, i: number) => { const r = realizado(oot.y[i], oot.ead[i]); todos += r; if (p < 0.1) { aprov += r; return; } if (oot.y[i]) { rd++; evit -= r; } else { rp++; aband += r; } });
    expect([rd, rp]).toEqual([55, 213]); expect(evit / 1000).toBeCloseTo(606, 0); expect(aband / 1000).toBeCloseTo(330, 0);
    expect((evit - aband) / 1000).toBeCloseTo(276, 0); expect(todos / 1000).toBeCloseTo(378, 0); expect(aprov / 1000).toBeCloseTo(654, 0); expect(aprov).toBeCloseTo(todos + evit - aband, 3);
  });
  it("revisão manual com sinal de 60% e capacidade 120: o relatório sobe R$ 2,7 mil e o valor real cai (c8p9)", () => {
    const sem = avaliarCarteira(oot, { corte: 0.12, teto: 0.3, capacidade: 0 }), com = avaliarCarteira(oot, { corte: 0.12, teto: 0.3, capacidade: 120, qualidade: 0.6 });
    expect(sem.esperado / 1000).toBeCloseTo(603, 0); expect(sem.valorReal! / 1000).toBeCloseTo(471, 0); expect(sem.realizado / 1000).toBeCloseTo(638, 0);
    expect(com.revisados).toBe(120); expect(com.aprovadosNaRevisao).toBe(28); expect(com.filaNaoAtendida).toBe(78);
    expect(com.esperado - sem.esperado).toBeGreaterThan(0); expect(com.valorReal! - sem.valorReal!).toBeLessThan(0);
  });
  it("ponte no corte de 14% sem revisão: 580 aprovados, R$ 8,38 mi, 4,13% e R$ 608 mil, folga zero (c8p10)", () => {
    const a = avaliarCarteira(oot, { corte: 0.14, capacidade: 0 });
    expect(a.aprovados).toBe(580); expect(a.exposicao / 1e6).toBeCloseTo(8.38, 2); expect(a.perda / a.exposicao * 100).toBeCloseTo(4.13, 2); expect(a.esperado / 1000).toBeCloseTo(608, 0);
    expect(a.receitaEsp - a.perda - a.funding - a.operacao - a.capital - a.revisoes).toBeCloseTo(a.esperado, 6);
  });
  it("composição por faixa da política escolhida fecha com a carteira: 213 + 266 + 69 = 548 e 36 defaults (c8p12)", () => {
    const c = avaliarCarteira(oot, { corte: 0.12, teto: 0.3, capacidade: 80, qualidade: 0.6 });
    const faixa = (lo: number, hi: number) => c.reg.filter((r) => r.aprovado && r.pdUsada >= lo && r.pdUsada < hi);
    expect([faixa(0, 0.05).length, faixa(0.05, 0.1).length, faixa(0.1, 0.2).length, faixa(0.2, 1.01).length]).toEqual([213, 266, 69, 0]);
    expect(c.aprovadosNaRevisao).toBe(23); expect(c.defaultsAprovados).toBe(36);
  });
});

describe("as escalas, o intercepto e a descida completa reproduzem as páginas herdadas (capítulo 4)", async () => {
  const { odds, escoreDidatico, inclinacaoLocal, perdaIndividual, distanciaAoOtimo, passo, trajetoria, faixasIguais, logisticaNewton, logit } = await import("@/lib/visuais/logistica");
  const base = did.base as Proposta[];
  it("PD 12%: 12 defaults para 88 adimplentes e odds 0,136; PD 20%: odds 0,250; dobrar dá 33,33% e a metade 11,11%, ±0,6931 em log odds (c4p3 a c4p5)", () => {
    expect(12 / 88).toBeCloseTo(0.136, 3); expect(odds(0.2)).toBeCloseTo(0.25, 6); expect(odds(0.01)).toBeCloseTo(0.010, 3); expect(odds(0.95)).toBeCloseTo(19, 6);
    const o = odds(0.2); expect((2 * o) / (1 + 2 * o) * 100).toBeCloseTo(33.33, 2); expect((o / 2) / (1 + o / 2) * 100).toBeCloseTo(11.11, 2);
    expect(logit(0.2)).toBeCloseTo(-1.386, 3); expect(Math.log(2 * o) - logit(0.2)).toBeCloseTo(0.6931, 4); expect(logit(0.2) - Math.log(o / 2)).toBeCloseTo(0.6931, 4);
  });
  it("PD 5%: odds 0,053, log odds −2,944 e escore didático 865; PD 50% dá 600 (c4p6)", () => {
    expect(odds(0.05)).toBeCloseTo(0.053, 3); expect(logit(0.05)).toBeCloseTo(-2.944, 3); expect(escoreDidatico(0.05)).toBe(865); expect(escoreDidatico(0.5)).toBe(600); expect(escoreDidatico(0.9)).toBe(402);
  });
  it("z = −1,50: odds 0,223 e PD 18,2%; somar 1 leva a 37,8% (19,51 pontos); inclinação local 0,1492 e 0,25 em zero (c4p7)", () => {
    expect(Math.exp(-1.5)).toBeCloseTo(0.223, 3); expect(sigmoide(-1.5) * 100).toBeCloseTo(18.2, 1); expect(sigmoide(-0.5) * 100).toBeCloseTo(37.8, 1);
    expect((sigmoide(-0.5) - sigmoide(-1.5)) * 100).toBeCloseTo(19.51, 2); expect(inclinacaoLocal(-1.5)).toBeCloseTo(0.1492, 4); expect(inclinacaoLocal(0)).toBeCloseTo(0.25, 3);
  });
  it("intercepto −5,65: util 30% e atraso 5 d dão z −2,716 e PD 6,20% (6,11% na aula), PD média 50,2%, ordem #12 > #14 > #16 > #9 > #15 > #13 (c4p13)", () => {
    const b = [-5.65, BETA_AULA[1], BETA_AULA[2]] as const;
    expect(escore(b, 30, 5).z).toBeCloseTo(-2.716, 3); expect(sigmoide(escore(b, 30, 5).z) * 100).toBeCloseTo(6.2, 2); expect(sigmoide(escore(BETA_AULA, 30, 5).z) * 100).toBeCloseTo(6.11, 2);
    expect(sigmoide(escore(b, 95, 20).z) * 100).toBeCloseTo(98.55, 2);
    expect(base.reduce((s, r) => s + sigmoide(escore(b, r.util, r.atraso).z), 0) / 16 * 100).toBeCloseTo(50.2, 1);
    const ordem = (beta: readonly number[]) => base.map((r) => ({ id: r.id, p: sigmoide(escore(beta, r.util, r.atraso).z) })).sort((a, c) => c.p - a.p).map((r) => r.id);
    expect(ordem(b).slice(0, 6)).toEqual([12, 14, 16, 9, 15, 13]); expect(ordem([-8, BETA_AULA[1], BETA_AULA[2]])).toEqual(ordem([-3, BETA_AULA[1], BETA_AULA[2]]));
  });
  it("proposta #2: PD 26,65% e perda 1,3223; #15: 1,3435; média 0,43282, o mínimo nesta amostra (c4p15)", () => {
    const p2 = sigmoide(escore(BETA_AULA, 25, 20).z); expect(p2 * 100).toBeCloseTo(26.65, 2); expect(perdaIndividual(p2, 1)).toBeCloseTo(1.3223, 4);
    expect(perdaIndividual(sigmoide(escore(BETA_AULA, 90, 0).z), 0)).toBeCloseTo(1.3435, 4); expect(perdaLog(BETA_AULA, base)).toBeCloseTo(0.43282, 5);
    for (const d of [[0.01, 0, 0], [0, 0.01, 0], [0, 0, 0.01], [-0.01, 0, 0]]) expect(perdaLog([BETA_AULA[0] + d[0], BETA_AULA[1] + d[1], BETA_AULA[2] + d[2]], base)).toBeGreaterThan(0.43282);
  });
  it("uma iteração em β = 0: perda 0,69315, distância 5,883, gradiente (0; −0,59375; −0,23438), contribuição da #16 −4,75 (c4p16)", () => {
    const s = passo([0, 0, 0], base); expect(s.perda).toBeCloseTo(0.69315, 5); expect(distanciaAoOtimo([0, 0, 0])).toBeCloseTo(5.883, 3);
    expect(s.g[0]).toBeCloseTo(0, 6); expect(s.g[1]).toBeCloseTo(-0.59375, 5); expect(s.g[2]).toBeCloseTo(-0.234375, 6); expect(s.novo[1]).toBeCloseTo(0.059375, 8); expect(s.novo[2]).toBeCloseTo(0.0234375, 8);
    expect((s.p[15] - 1) * 9.5).toBeCloseTo(-4.75, 4);
  });
  it("descida completa: perda 0,580716 em 100, 0,445906 em 1.000 e 0,432824 em 10.000; em 20.000, β = (−5,66657; 0,74530; 1,39550) (c4p17)", () => {
    const t = trajetoria(base, 20000);
    expect(t.perda[0]).toBeCloseTo(0.693147, 6); expect(t.perda[100]).toBeCloseTo(0.580716, 6); expect(t.perda[1000]).toBeCloseTo(0.445906, 6); expect(t.perda[10000]).toBeCloseTo(0.432824, 6);
    expect(t.beta[10000][0]).toBeCloseTo(-5.66246, 5); expect(t.beta[20000]).toEqual(descida(base, [20000])[0].beta);
    for (let i = 1; i <= 20000; i *= 10) expect(t.perda[i]).toBeLessThanOrEqual(t.perda[i - 1]);
  });
  it("quatro faixas: nas 16 propostas, 4 por faixa com taxas 25%, 0%, 100% e 75%; no treino do gerador, 525 ou 526 por faixa com 4,95% a 16,73% (c4p21)", () => {
    const f = faixasIguais(base.map((r) => r.util), base.map((r) => r.y));
    expect(f.map((x) => x.n)).toEqual([4, 4, 4, 4]); expect(f.map((x) => x.taxa)).toEqual([0.25, 0, 1, 0.75]);
    const esc = JSON.parse(readFileSync("src/lib/visuais/escores.json", "utf8"));
    const g = faixasIguais(esc.treino.util, esc.treino.y); expect(g.map((x) => x.n)).toEqual([525, 526, 526, 526]); expect(g.map((x) => x.d)).toEqual([26, 35, 52, 88]);
    expect(g[3].taxa * 100).toBeCloseTo(16.73, 2); expect(g.every((x, i) => !i || x.taxa >= g[i - 1].taxa)).toBe(true);
    const [a, b] = logisticaNewton(base.map((r) => r.util / 10), base.map((r) => r.y)); const c = logisticaSoUtil(base, 50000);
    expect(a).toBeCloseTo(c[0], 2); expect(b).toBeCloseTo(c[1], 2);
  });
});

describe("anatomia, impureza, recursão, caminho, poda e duas famílias reproduzem as páginas herdadas (capítulo 5)", async () => {
  const { perdaIndividual, escore: esc, sigmoide: sig, BETA_AULA: B } = await import("@/lib/visuais/logistica");
  const { gini: g, crescer: cr, folhas: fl, todosOsCandidatos: tc } = await import("@/lib/visuais/arvore");
  const { caminhoNaArvore } = await import("@/components/visuais/arvore-diagrama");
  const base = did.base as Proposta[];
  const arv = cr(base, 2);
  it("a árvore de profundidade 2 tem 7 nós, 4 folhas (1 de 2, 0 de 6, 6 de 6, 1 de 2) que somam 16 e 8 (c5p3)", () => {
    const fs = fl(arv); expect(fs.map((f) => `${f.d}/${f.n}`)).toEqual(["1/2", "0/6", "6/6", "1/2"]);
    expect(fs.reduce((s, f) => s + f.n, 0)).toBe(16); expect(fs.reduce((s, f) => s + f.d, 0)).toBe(8); expect(Math.max(...fs.map((f) => f.prof))).toBe(2);
  });
  it("Gini 0,5 e entropia 1 bit meio a meio; 0,18 com 10%; raiz 2 × 0,5 × 0,5 = 0,50000 (c5p4, c5p5)", () => {
    expect(2 * 0.5 * 0.5).toBe(0.5); expect(-(0.5 * Math.log2(0.5) + 0.5 * Math.log2(0.5))).toBe(1); expect(2 * 0.1 * 0.9).toBeCloseTo(0.18, 6); expect(g(8, 16)).toBe(0.5); expect(g(0, 6)).toBe(0); expect(g(1, 2)).toBe(0.5);
  });
  it("recursão: os quatro melhores de cada lado, com 0,09375 no topo e empate à direita entre utilização 87,5 e atraso 2,5 (c5p9)", () => {
    const esq = tc(base.filter((p) => p.util <= 57.5)).sort((a, b) => b.ganho - a.ganho), dir = tc(base.filter((p) => p.util > 57.5)).sort((a, b) => b.ganho - a.ganho);
    expect(esq.slice(0, 2).map((a) => [a.v, a.corte, +a.ganho.toFixed(5)])).toEqual([["util", 27.5, 0.09375], ["util", 32.5, 0.05208]]);
    expect(dir.slice(0, 2).map((a) => [a.v, a.corte, +a.ganho.toFixed(5)])).toEqual([["util", 87.5, 0.09375], ["atraso", 2.5, 0.09375]]);
  });
  it("utilização 72% e atraso 8 d: não, sim, folha 6 de 6 com PD 100%; a logística dá 69,3% (c5p11)", () => {
    const cam = caminhoNaArvore(arv, 72, 8); expect(cam.map((n) => `${n.d}/${n.n}`)).toEqual(["8/16", "7/8", "6/6"]);
    expect(sig(esc(B, 72, 8).z) * 100).toBeCloseTo(69.3, 1); expect(caminhoNaArvore(arv, 30, 5).pop()!.d).toBe(0);
  });
  it("poda: impurezas 0,5, 0,21875, 0,125 e 0 com 1, 2, 4 e 6 folhas; trocas em 0,0547 e 0,2813; quatro folhas nunca vence (c5p15)", () => {
    const arvs = [0, 1, 2, 3].map((p) => { const fs = fl(cr(base, p)); return { k: fs.length, R: fs.reduce((s, f) => s + (f.n / 16) * g(f.d, f.n), 0) }; });
    expect(arvs.map((a) => a.k)).toEqual([1, 2, 4, 6]); expect(arvs.map((a) => a.R)).toEqual([0.5, 0.21875, 0.125, 0]);
    expect((arvs[1].R - arvs[3].R) / 4).toBeCloseTo(0.0546875, 7); expect(arvs[0].R - arvs[1].R).toBeCloseTo(0.28125, 7);
    for (let a = 0; a <= 0.35; a += 0.001) { const cs = arvs.map((t) => t.R + a * t.k); expect(cs[2]).toBeGreaterThanOrEqual(Math.min(cs[0], cs[1], cs[3]) - 1e-12); }
    const cs = arvs.map((t) => t.R + 0.03 * t.k); expect(cs[3]).toBeCloseTo(0.18, 6); expect(Math.min(...cs)).toBe(cs[3]);
  });
  it("#5: logística 52,6% contra árvore 0%; log loss de treino 0,43282 contra 0,18844 com piso e teto (c5p18)", () => {
    let ll = 0, la = 0; const pd5 = { pl: 0, pa: 0 };
    for (const r of base) { const pl = sig(esc(B, r.util, r.atraso).z); const f = caminhoNaArvore(arv, r.util, r.atraso).pop()!; const pa = f.d / f.n; ll += perdaIndividual(pl, r.y); la += perdaIndividual(Math.min(0.98, Math.max(0.02, pa)), r.y); if (r.id === 5) Object.assign(pd5, { pl, pa }); }
    expect(pd5.pl * 100).toBeCloseTo(52.6, 1); expect(pd5.pa).toBe(0); expect(ll / 16).toBeCloseTo(0.43282, 5); expect(la / 16).toBeCloseTo(0.18844, 5);
  });
});

describe("o memorando de cinco campos reproduz o material das páginas herdadas (capítulo 10, c10p5 a c10p9)", async () => {
  const { CAMPOS, MINIMO, situacao } = await import("@/components/visuais/memorando");
  const { avaliarCarteira, POLITICA } = await import("@/lib/visuais/politica");
  const { diferencaProporcoes } = await import("@/lib/visuais/monitoramento");
  const ref = JSON.parse(readFileSync("src/lib/visuais/memorando.json", "utf8"));
  const oot = JSON.parse(readFileSync("src/lib/visuais/oot-logistica.json", "utf8"));
  it("cinco campos com cinco itens cada; completo exige os cinco marcados e 120 caracteres", () => {
    expect(CAMPOS.map((c) => c.itens.length)).toEqual([5, 5, 5, 5, 5]); expect(MINIMO).toBe(120);
    expect(situacao({}, "recomendacao")).toEqual({ marcados: 0, n: 0, completo: false });
    const cheio = { textos: { evidencia: "x".repeat(120) }, itens: { evidencia: [true, true, true, true, true] } };
    expect(situacao(cheio, "evidencia").completo).toBe(true); expect(situacao({ ...cheio, textos: { evidencia: "x".repeat(119) } }, "evidencia").completo).toBe(false);
  });
  it("material do campo 1 e 2: 548 de 737, R$ 607 mil, perda esperada 3,84% da exposição; AUC 0,7257 contra 0,6958; Wilson 8,93% a 13,45%; PSI 0,0136 com 10 faixas", () => {
    const a = avaliarCarteira(oot, POLITICA); expect(a.aprovados).toBe(548); expect(a.esperado / 1000).toBeCloseTo(607, 0); expect((100 * a.perda) / a.exposicao).toBeCloseTo(3.84, 2);
    expect(ref.logit.auc).toBe(0.7257); expect(ref.gbm.auc).toBe(0.6958); expect(ref.logit.brier).toBe(0.09128); expect(ref.gbm.brier).toBe(0.09491); expect(ref.psi).toEqual({ valor: 0.0136, faixas: 10 });
    const w = wilson(81, 737); expect(w.lo * 100).toBeCloseTo(8.93, 2); expect(w.hi * 100).toBeCloseTo(13.45, 2); expect(ref.meta).toMatchObject({ n: 5000, seed: 20260501, treino: 2103, validacao: 760, oot: 737 });
  });
  it("material do campo 3: diferença de AUC 0,0299 com intervalo de 0,0001 a 0,0596; aprovação de 72%; grupos 4,7 pp com intervalo de −2,5 a 11,9 pp", () => {
    expect(ref.comparacao).toMatchObject({ diferenca: 0.0299, erro_padrao: 0.0152, ic95: [0.0001, 0.0596] }); expect(ref.taxaAprovacao).toBe(0.72);
    const g1 = ref.grupos.G1, g2 = ref.grupos.G2; const d = diferencaProporcoes(Math.round(g1.taxaAprov * g1.n), g1.n, Math.round(g2.taxaAprov * g2.n), g2.n);
    expect(100 * d.dif).toBeCloseTo(4.7, 1); expect(100 * d.lo).toBeCloseTo(-2.5, 1); expect(100 * d.hi).toBeCloseTo(11.9, 1); expect(d.excluiZero).toBe(false);
  });
});

describe("três fenômenos, gatilhos e painel reproduzem as páginas herdadas (capítulo 9, c9p2, c9p7 e c9p8)", async () => {
  const { GATILHOS } = await import("@/components/visuais/gatilhos");
  const { INDICADORES, SELECAO_INICIAL, diagnostico } = await import("@/lib/visuais/painel");
  it("na janela do gerador nenhum dos cinco gatilhos medidos dispara e dois não estão instrumentados (c9p7)", () => {
    expect(GATILHOS.length).toBe(7); expect(GATILHOS.filter((g) => g.medivel).length).toBe(5); expect(GATILHOS.filter((g) => g.medivel && g.disparou).length).toBe(0);
    expect(GATILHOS[0].valor).toBe("0,0136"); expect(GATILHOS[1].valor).toBe("0,0260 (utilizacao)"); expect(GATILHOS[2].valor).toBe("0,8845"); expect(GATILHOS[3].valor).toBe("alta de 0,0849"); expect(GATILHOS[4].valor).toBe("4,7 pp, intervalo inclui zero");
  });
  it("onze candidatos, quatro sem espera de rótulo; a seleção de partida cobre os três fenômenos mas falha em equidade; com equidade fecha; doze linhas é grande (c9p8)", () => {
    expect(INDICADORES.length).toBe(11); expect(INDICADORES.filter((x) => !x.rot).length).toBe(4);
    const d0 = diagnostico(SELECAO_INICIAL); expect(d0.faltam).toEqual([]); expect(d0.rapidos).toBe(1); expect(d0.ok).toBe(false); expect(d0.tem.equidade).toBe(false);
    expect(diagnostico([...SELECAO_INICIAL, "eq"]).ok).toBe(true); expect(diagnostico(["niv", "ord", "eq"]).faltam).toEqual(["entrada"]); expect(diagnostico(["niv", "cal", "ord", "eq"]).rapidos).toBe(0);
    expect(diagnostico(INDICADORES.map((x) => x.id)).grande).toBe(true); expect(diagnostico([]).faltam).toEqual(["entrada", "nivel", "relacao"]);
  });
});

describe("três estratégias, hiperparâmetros e três limites reproduzem as páginas herdadas (capítulo 6, c6p2, c6p15 e c6p18)", async () => {
  const { PONTOS, boostingRegressao, boostingClassificacao, folhasReg, rotuloCorteReg } = await import("@/lib/visuais/boosting");
  const base = did.base as Proposta[];
  it("para x = 8 a previsão vai de 6,50 a 7,94, 9,97, 10,35 e 10,86 e o erro cai de 5,50 a 1,14 (c6p2)", () => {
    const r = boostingRegressao(PONTOS.x, PONTOS.y, 0.5, 4, 1);
    expect(r.map((p) => +p.F[7].toFixed(2))).toEqual([6.5, 7.94, 9.97, 10.35, 10.86]); expect(+(12 - r[4].F[7]).toFixed(2)).toBe(1.14);
  });
  it("η 0,4, M 4, profundidade 2 e mínimo 2: log loss 0,47481, 16 folhas, menor folha 2, PD de 33% a 67%; decorar dá perda quase nula (c6p15)", () => {
    const ps = boostingClassificacao(base, 0.4, 4, 2, 2); const fim = ps[4];
    expect(fim.perda).toBeCloseTo(0.47481, 5); expect(ps.slice(1).reduce((s, p) => s + folhasReg(p.arvore!).length, 0)).toBe(16);
    expect(Math.min(...ps.slice(1).flatMap((p) => folhasReg(p.arvore!).map((l) => l.n)))).toBe(2); expect(Math.round(Math.min(...fim.p) * 100)).toBe(33); expect(Math.round(Math.max(...fim.p) * 100)).toBe(67);
    expect(boostingClassificacao(base, 1, 40, 3, 1)[40].perda).toBeLessThan(0.05);
  });
  it("retirar a #15 transforma o nó direito da primeira árvore em folha e retirar a #16 move o corte para 82,5% (c6p18)", () => {
    const arv = (b: Proposta[]) => boostingClassificacao(b, 0.4, 1, 2, 2)[1].arvore!;
    expect(rotuloCorteReg(arv(base).dir!.corte!.v, arv(base).dir!.corte!.valor)).toBe("utilização ≤ 87,5%");
    expect(arv(base.filter((p) => p.id !== 15)).dir!.corte).toBeUndefined(); expect(arv(base.filter((p) => p.id !== 16)).dir!.corte!.valor).toBe(82.5);
  });
});

describe("recorte, variáveis, mesmas características e condicional reproduzem as páginas herdadas (capítulo 2, c2p2, c2p5 a c2p7)", async () => {
  const { CONDICOES } = await import("@/components/visuais/condicional");
  const base = did.base as Proposta[];
  it("quatro condições: 57,5% dá 7 em 8 contra 1 em 8; 40% dá 7 em 11; 20 dias dá 5 em 7; 5 dias dá 5 em 8 (c2p7)", () => {
    const conta = (k: string) => { const c = CONDICOES.find((x) => x.k === k)!; const d = base.filter(c.f), f = base.filter((p) => !c.f(p)); return [d.length, d.filter((p) => p.y).length, f.length, f.filter((p) => p.y).length]; };
    expect(conta("u57")).toEqual([8, 7, 8, 1]); expect(conta("u40")).toEqual([11, 7, 5, 1]); expect(conta("a20")).toEqual([7, 5, 9, 3]); expect(conta("a05")).toEqual([8, 5, 8, 3]);
  });
  it("duas pessoas: 50% de 9,5% a 90,5%; dezesseis: 50% de 28% a 72%; sem a #15: 53,3% de 30% a 75% (c2p6)", () => {
    const y16 = base.map((p) => p.y); expect(y16).toEqual([0, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 1]);
    const w2 = wilson(1, 2), w16 = wilson(8, 16), w15 = wilson(8, 15);
    expect(w2.lo * 100).toBeCloseTo(9.5, 1); expect(w2.hi * 100).toBeCloseTo(90.5, 1); expect(w16.lo * 100).toBeCloseTo(28, 0); expect(w16.hi * 100).toBeCloseTo(72, 0); expect((8 / 15) * 100).toBeCloseTo(53.3, 1); expect(w15.lo * 100).toBeCloseTo(30.1, 1);
  });
});

describe("as quatro últimas páginas herdadas: mesma PD, balancear, WoE e valor da informação (c1p7, c3p15 a c3p17)", async () => {
  const { resultadoEsperado } = await import("@/components/visuais/mesma-pd");
  const { reponderar } = await import("@/components/visuais/balancear");
  const { IV_TOTAL, leituraIV } = await import("@/components/visuais/valor-da-informacao");
  const woe = JSON.parse(readFileSync("src/lib/visuais/woe.json", "utf8"));
  it("PD 12%: operação A dá R$ 1.007 e B dá −R$ 852 (c1p7)", () => {
    expect(Math.round(resultadoEsperado(0.12, { ead: 9000, rec: 3060, perda: 4050 }))).toBe(1007); expect(Math.round(resultadoEsperado(0.12, { ead: 15000, rec: 2850, perda: 12000 }))).toBe(-852);
  });
  it("reponderar as odds preserva a AUC 0,725685 e move a PD média de 9,72% para 9,76%, 19,35% e 45,34% (c3p15)", () => {
    const q = (pa: number) => oot.pd.map((p: number) => reponderar(p, pa)); const media = (v: number[]) => v.reduce((s, x) => s + x, 0) / v.length;
    for (const pa of [0.096, 0.2, 0.5]) expect(aucPorPares(oot.y, q(pa)).auc).toBeCloseTo(0.725685, 6);
    expect(media(oot.pd) * 100).toBeCloseTo(9.72, 2); expect(media(q(0.096)) * 100).toBeCloseTo(9.76, 2); expect(media(q(0.2)) * 100).toBeCloseTo(19.35, 2); expect(media(q(0.5)) * 100).toBeCloseTo(45.34, 2);
    expect(media(q(0.5).map((v: number) => reponderar(v, woe.prevalenciaTreino, 0.5))) * 100).toBeCloseTo(9.72, 2);
  });
  it("WoE = ln(pb ÷ pm): 0 meio a meio, ln(0,7 ÷ 0,3) = 0,847; utilização baixa positiva, alta negativa (c3p16)", () => {
    expect(Math.log(0.5 / 0.5)).toBe(0); expect(Math.log(0.7 / 0.3)).toBeCloseTo(0.847, 3); expect(Math.log(0.25 / 0.75)).toBeCloseTo(-1.099, 3);
    expect(woe.utilizacao.woe[0]).toBeGreaterThan(0); expect(woe.utilizacao.woe[5]).toBeLessThan(0); expect(woe.utilizacao.n.reduce((s: number, v: number) => s + v, 0)).toBe(2103);
  });
  it("IV da renda soma 0,03174 em seis faixas, leitura fraca, maior contribuição F5 com 0,00867; cada WoE é ln(pb ÷ pm) (c3p17)", () => {
    expect(IV_TOTAL).toBeCloseTo(0.03174, 5); expect(leituraIV(IV_TOTAL)).toBe("fraca"); expect(leituraIV(0.15)).toBe("média");
    const f = woe.renda.faixas; expect(f[0]).toMatchObject({ n: 3, woe: -0.4556, iv: 0.00041 }); expect(f.reduce((m: { iv: number }, x: { iv: number }) => (x.iv > m.iv ? x : m), f[0])).toMatchObject({ faixa: 4, n: 841, iv: 0.00867 });
    for (const x of f.slice(1)) expect(Math.log(x.pb / x.pm)).toBeCloseTo(x.woe, 2);
  });
});

describe("letras gregas em cabeçalhos em caixa alta (c4p17, c4p19, c5p15, c6p8)", async () => {
  const { createElement } = await import("react");
  const { renderToStaticMarkup } = await import("react-dom/server");
  const { SemCaixaAlta } = await import("@/components/visuais/sem-caixa-alta");
  const html = (t: string) => renderToStaticMarkup(createElement(SemCaixaAlta, { children: t }));
  it("a letra grega, com o índice, sai num span que não muda de caixa; o resto do texto fica como está", () => {
    expect(html("η × árvore")).toBe('<span class="letra-grega">η</span> × árvore');
    expect(html("β₀ intercepto")).toBe('<span class="letra-grega">β₀</span> intercepto');
    expect(html("Parâmetro")).toBe("Parâmetro");
  });
});

describe("capítulo 5 no palco: as peças redesenhadas exibem os números conferidos (c5p1, c5p2, c5p8, c5p10, c5p12, c5p13, c5p17)", async () => {
  const { createElement } = await import("react");
  const { renderToStaticMarkup } = await import("react-dom/server");
  const BASE = did.base as Proposta[];
  const texto = (html: string) => html.replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").replace(/&gt;/g, ">").replace(/&lt;/g, "<");
  const { AberturaArvores } = await import("@/components/visuais/abertura-arvores");
  const { RetaOuDegraus } = await import("@/components/visuais/reta-ou-degraus");
  const { RaizEscolhida } = await import("@/components/visuais/raiz-escolhida");
  const { UmaProposta } = await import("@/components/visuais/uma-proposta");
  const { ValorDaFolha } = await import("@/components/visuais/valor-da-folha");
  const { ConfiancaDaFolha } = await import("@/components/visuais/confianca-da-folha");
  const { GiniOuEntropia } = await import("@/components/visuais/gini-ou-entropia");
  const render = (c: (props: any) => React.ReactNode, props: Record<string, unknown> = {}) => texto(renderToStaticMarkup(createElement(c, props)));
  it("a abertura nativa do registro é a mesma que o palco dispensa do infográfico", async () => {
    const { PAGINAS_COM_EPISODIO_NATIVO } = await import("@/components/visuais/registro");
    const { ABERTURA_NATIVA } = await import("@/lib/visuais/palco-proprio");
    expect([...PAGINAS_COM_EPISODIO_NATIVO].sort()).toEqual([...ABERTURA_NATIVA].sort());
  });
  it("c5p1: o desafio vem do conteúdo e a primeira legenda é a regra da raiz", async () => {
    const t = render(AberturaArvores, { episodio: { type: "episode", number: 5, challenge: "Desafio X", text: "Texto Y", steps: [{ title: "Corte", detail: "d1" }, { title: "Caminho", detail: "d2" }, { title: "Freio", detail: "d3" }] } });
    expect(t).toContain("Desafio X"); expect(t).toContain("Texto Y"); expect(t).toContain("utilização até 57,5%");
  });
  it("c5p2: do lado errado da reta, #2, #5, #10 e #15; o mínimo deslocando a reta é 3; regiões 50%, 0%, 100% e 50%", async () => {
    const t = render(RetaOuDegraus);
    expect(t).toContain("#2, #5, #10 e #15"); expect(t).toContain("o mínimo é 3");
    const z = BASE.map((p) => escore(BETA_AULA, p.util, p.atraso).z);
    const erros = (c: number) => BASE.filter((p, i) => (z[i] >= c ? 1 : 0) !== p.y).length;
    expect(Math.min(...[...z, Infinity].map(erros))).toBe(3);
    expect(folhas(crescer(BASE, 2)).map((f) => f.d / f.n)).toEqual([0.5, 0, 1, 0.5]);
  });
  it("c5p8: utilização ≤ 57,5% com 1 default em 8 (12,5%) e > 57,5% com 7 em 8 (87,5%)", async () => {
    const t = render(RaizEscolhida);
    expect(t).toContain("12,5%"); expect(t).toContain("1 default em 8"); expect(t).toContain("87,5%"); expect(t).toContain("7 defaults em 8");
  });
  it("c5p9: a tabela diz quantas propostas cada corte manda para cada nó novo, ≤ corte e > corte sob Propostas, sem o antigo esq / dir", async () => {
    const { Recursao } = await import("@/components/visuais/recursao");
    const t = render(Recursao);
    expect(t).not.toContain("esq / dir");
    expect(t.split("Corte candidatoPropostasGanho≤ corte> corte").length - 1).toBe(2); // o mesmo cabeçalho nos dois nós
    expect(t).toContain("utilização ≤\u00a027,5%260,09375"); expect(t).toContain("utilização ≤\u00a087,5%620,09375"); // 27,5 manda 2 e 6; 87,5 manda 6 e 2
    expect(t).toContain("atraso ≤\u00a02,5 d260,09375"); // o empate do lado direito; o sinal não se separa do valor
    expect(t).toContain("novas folhas com 2 e 6 propostas");
  });
  it("c5p10: a #15 responde não e não, cai com a #16 numa folha de 50% e o intervalo vai de 9,5% a 90,5%, 81 pontos", async () => {
    const t = render(UmaProposta);
    expect(t).toContain("utilização ≤ 57,5%? não"); expect(t).toContain("utilização ≤ 87,5%? não");
    expect(t).toContain("a #16, que deu default"); expect(t).toContain("9,5% a 90,5%"); expect(t).toContain("81 pontos");
  });
  it("c5p12: perda média 1,20397 · 0,83699 · 0,69315 e mínimo na frequência, 50,0%", async () => {
    const t = render(ValorDaFolha);
    for (const v of ["1,20397", "0,83699", "0,69315"]) expect(t).toContain(v);
    expect(renderToStaticMarkup(createElement(ValorDaFolha))).toContain('aria-label="1 ÷ 2 = 50,0%"'); // a conta sai em KaTeX; o texto fica como rótulo acessível
  });
  it("c5p13: intervalos 9,5% a 90,5% · 0,0% a 39,0% · 61,0% a 100,0%; 0 em 600 vai até 0,6%", async () => {
    const t = render(ConfiancaDaFolha);
    for (const v of ["9,5% a 90,5%", "0,0% a 39,0%", "61,0% a 100,0%", "0% a 0,6%"]) expect(t).toContain(v);
  });
  it("c5p17: Gini e entropia escolhem utilização 57,5 (0,28125 e 0,45644); no atraso o Gini empata 15 e 27,5 e a entropia fica com 27,5", async () => {
    const t = render(GiniOuEntropia);
    for (const v of ["0,28125", "0,45644", "15 ou 27,5", "0,07143", "0,13793"]) expect(t).toContain(v);
  });
});

describe("capítulo 6 no palco: as peças redesenhadas exibem os números conferidos (c6p1, c6p4, c6p5, c6p6, c6p11, c6p16, c6p20)", async () => {
  const { createElement } = await import("react");
  const { renderToStaticMarkup } = await import("react-dom/server");
  const texto = (html: string) => html.replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").replace(/&gt;/g, ">").replace(/&lt;/g, "<");
  const { AberturaBoosting } = await import("@/components/visuais/abertura-boosting");
  const { PalpiteConstante } = await import("@/components/visuais/palpite-constante");
  const { ErroComoAlvo } = await import("@/components/visuais/erro-como-alvo");
  const { PrimeiraCorrecao } = await import("@/components/visuais/primeira-correcao");
  const { SomaEmLogOdds } = await import("@/components/visuais/soma-em-log-odds");
  const { EtaEArvores } = await import("@/components/visuais/eta-e-arvores");
  const { TresModelos } = await import("@/components/visuais/tres-modelos");
  const render = (c: (props: any) => React.ReactNode, props: Record<string, unknown> = {}) => texto(renderToStaticMarkup(createElement(c, props)));
  it("c6p1: o desafio vem do conteúdo; palpite 6,5; quatro árvores levam x = 8 a 10,86, resíduo de +5,50 para +1,14", () => {
    const t = render(AberturaBoosting, { episodio: { type: "episode", number: 6, challenge: "Desafio X", text: "Texto Y", steps: [{ title: "Palpite", detail: "d1" }, { title: "Resíduo", detail: "d2" }, { title: "Soma", detail: "d3" }] } });
    for (const v of ["Desafio X", "Texto Y", "média dos oito valores, 6,5", "chega a 10,86", "de +5,50 para +1,14"]) expect(t).toContain(v);
  });
  it("c6p4: erro quadrático médio 16,43750 · 11,18750 · 10,18750 e mínimo na média, 52,0 ÷ 8 = 6,50", () => {
    const t = render(PalpiteConstante);
    for (const v of ["16,43750", "11,18750", "10,18750"]) expect(t).toContain(v);
    expect(renderToStaticMarkup(createElement(PalpiteConstante))).toContain('aria-label="52,0 ÷ 8 = 6,50"'); // a conta sai em KaTeX; o texto fica como rótulo acessível
  });
  it("c6p5: resíduos de −4,5 a +5,5; em x = 8, 12,00 − 6,50 = +5,50 e, depois de quatro árvores, sobram 1,14", () => {
    const t = render(ErroComoAlvo);
    for (const v of ["−4,5", "−3,5", "−2,0", "−1,5", "+1,5", "+2,0", "+2,5", "+5,5", "sobram 1,14"]) expect(t).toContain(v);
    expect(renderToStaticMarkup(createElement(ErroComoAlvo))).toContain('aria-label="12,00 − 6,50 = +5,50"'); // a conta sai em KaTeX; o texto fica como rótulo acessível
  });
  it("c6p6: toco em x ≤ 4,5 com −2,875 e +2,875; erro 10,19 → 1,92; 5 de 8 resíduos trocam de sinal, x = 5 de +1,50 para −1,375", () => {
    const t = render(PrimeiraCorrecao);
    for (const v of ["x ≤ 4,5?", "−2,875", "+2,875", "10,19 → 1,92", "5 de 8", "+1,50 vira −1,375"]) expect(t).toContain(v);
  });
  it("c6p11: probabilidade soma 1,05; log odds soma 2,250 e dá PD 90,47%; F₀ de 10% de prevalência é −2,1972", () => {
    const t = render(SomaEmLogOdds);
    for (const v of ["1,05", "2,250", "90,47%", "−2,1972"]) expect(t).toContain(v);
  });
  it("c6p16: tabela recalculada, η 0,10 com 14 árvores e 0,28394; η 0,40 com 4, produto 1,60 e 0,13711; η 1 com 0,06800", async () => {
    const { tabelaEtaArvores } = await import("@/components/visuais/eta-e-arvores");
    const l = tabelaEtaArvores();
    expect(l.map((x) => x.arvores)).toEqual([14, 10, 7, 5, 4, 3, 3, 2, 2]);
    expect(l.find((x) => x.eta === 0.4)!.perda60).toBeCloseTo(0.13711, 5);
    const t = render(EtaEArvores);
    for (const v of ["0,28394", "1,60", "0,13711", "0,06800"]) expect(t).toContain(v);
  });
  it("c6p20: perda de treino 0,43282 na logística, 0,18844 na árvore, 0,47481 no boosting de 4 árvores e 0,15503 com 50", () => {
    const t = render(TresModelos, { palco: true });
    for (const v of ["0,43282", "0,18844", "0,47481", "0,15503"]) expect(t).toContain(v);
  });
});
