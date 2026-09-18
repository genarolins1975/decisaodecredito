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
