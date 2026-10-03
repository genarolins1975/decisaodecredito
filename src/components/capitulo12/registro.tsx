"use client";
import type { ComponentType } from "react";
import dynamic from "next/dynamic";
import type { Pagina } from "@/components/capitulo7/base";
import { ProvedorC12 } from "./provedor";

/**
 * Quadros do capítulo 12 por página, cada um dentro do provedor do roteiro do capítulo e carregado sob demanda
 * (next/dynamic, com renderização no servidor). A versão estática fica em registro-estatico.tsx, para os testes.
 */
const SOB_DEMANDA: Record<string, ComponentType<{ pagina?: Pagina }>> = {
  c12p1: dynamic(() => import("./slides/s01-abertura").then((m) => m.S01Abertura)),
  c12p2: dynamic(() => import("./slides/s02-bloco-classificacao").then((m) => m.S02BlocoClassificacao)),
  c12p3: dynamic(() => import("./slides/s03-termos").then((m) => m.S03Termos)),
  c12p4: dynamic(() => import("./slides/s04-mnist").then((m) => m.S04Mnist)),
  c12p5: dynamic(() => import("./slides/s05-base-codigo").then((m) => m.S05BaseCodigo)),
  c12p6: dynamic(() => import("./slides/s06-duas-classes").then((m) => m.S06DuasClasses)),
  c12p7: dynamic(() => import("./slides/s07-treino-teste").then((m) => m.S07TreinoTeste)),
  c12p8: dynamic(() => import("./slides/s08-sgd").then((m) => m.S08Sgd)),
  c12p9: dynamic(() => import("./slides/s09-bloco-desempenho").then((m) => m.S09BlocoDesempenho)),
  c12p10: dynamic(() => import("./slides/s10-acuracia").then((m) => m.S10Acuracia)),
  c12p11: dynamic(() => import("./slides/s11-matriz").then((m) => m.S11Matriz)),
  c12p12: dynamic(() => import("./slides/s12-precisao").then((m) => m.S12Precisao)),
  c12p13: dynamic(() => import("./slides/s13-recall").then((m) => m.S13Recall)),
  c12p14: dynamic(() => import("./slides/s14-f1").then((m) => m.S14F1)),
  c12p15: dynamic(() => import("./slides/s15-quatro-metricas").then((m) => m.S15QuatroMetricas)),
  c12p16: dynamic(() => import("./slides/s16-custos").then((m) => m.S16Custos)),
  c12p17: dynamic(() => import("./slides/s17-limiar").then((m) => m.S17Limiar)),
  c12p18: dynamic(() => import("./slides/s18-precisao-recall").then((m) => m.S18PrecisaoRecall)),
  c12p19: dynamic(() => import("./slides/s19-roc").then((m) => m.S19Roc)),
  c12p20: dynamic(() => import("./slides/s20-curvas-cruzam").then((m) => m.S20CurvasCruzam)),
  c12p21: dynamic(() => import("./slides/s21-auc-gini").then((m) => m.S21AucGini)),
  c12p22: dynamic(() => import("./slides/s22-bloco-ensembles").then((m) => m.S22BlocoEnsembles)),
  c12p23: dynamic(() => import("./slides/s23-votacao").then((m) => m.S23Votacao)),
  c12p24: dynamic(() => import("./slides/s24-maioria").then((m) => m.S24Maioria)),
  c12p25: dynamic(() => import("./slides/s25-quatro-formas").then((m) => m.S25QuatroFormas)),
  c12p26: dynamic(() => import("./slides/s26-luas").then((m) => m.S26Luas)),
  c12p27: dynamic(() => import("./slides/s27-votacao-codigo").then((m) => m.S27VotacaoCodigo)),
  c12p28: dynamic(() => import("./slides/s28-voto-isolados").then((m) => m.S28VotoIsolados)),
  c12p29: dynamic(() => import("./slides/s29-bagging").then((m) => m.S29Bagging)),
  c12p30: dynamic(() => import("./slides/s30-bagging-500").then((m) => m.S30Bagging500)),
  c12p31: dynamic(() => import("./slides/s31-fronteira").then((m) => m.S31Fronteira)),
  c12p32: dynamic(() => import("./slides/s32-fora-37").then((m) => m.S32Fora37)),
  c12p33: dynamic(() => import("./slides/s33-oob").then((m) => m.S33Oob)),
  c12p34: dynamic(() => import("./slides/s34-floresta").then((m) => m.S34Floresta)),
  c12p35: dynamic(() => import("./slides/s35-importancia").then((m) => m.S35Importancia)),
  c12p36: dynamic(() => import("./slides/s36-boosting-codigo").then((m) => m.S36BoostingCodigo)),
  c12p37: dynamic(() => import("./slides/s37-residuo").then((m) => m.S37Residuo)),
  c12p38: dynamic(() => import("./slides/s38-sintese-ensembles").then((m) => m.S38SinteseEnsembles)),
  c12p39: dynamic(() => import("./slides/s39-bloco-credito").then((m) => m.S39BlocoCredito)),
  c12p40: dynamic(() => import("./slides/s40-caso").then((m) => m.S40Caso)),
  c12p41: dynamic(() => import("./slides/s41-fora-do-tempo").then((m) => m.S41ForaDoTempo)),
  c12p42: dynamic(() => import("./slides/s42-auc-tempo").then((m) => m.S42AucTempo)),
  c12p43: dynamic(() => import("./slides/s43-sobreajuste").then((m) => m.S43Sobreajuste)),
  c12p44: dynamic(() => import("./slides/s44-populacao").then((m) => m.S44Populacao)),
  c12p45: dynamic(() => import("./slides/s45-regras").then((m) => m.S45Regras)),
  c12p46: dynamic(() => import("./slides/s46-metricas-comite").then((m) => m.S46MetricasComite)),
  c12p47: dynamic(() => import("./slides/s47-exercicio").then((m) => m.S47Exercicio)),
  c12p48: dynamic(() => import("./slides/s48-sintese").then((m) => m.S48Sintese)),
  c12p49: dynamic(() => import("./slides/s49-volta").then((m) => m.S49Volta)),
  c12p50: dynamic(() => import("./slides/s50-apendice-dados").then((m) => m.S50ApendiceDados)),
  c12p51: dynamic(() => import("./slides/s51-apendice-safras").then((m) => m.S51ApendiceSafras)),
  c12p52: dynamic(() => import("./slides/s52-referencias").then((m) => m.S52Referencias)),
};
export const QUADROS_C12: Record<string, ComponentType<{ pagina?: Pagina }>> = Object.fromEntries(
  Object.entries(SOB_DEMANDA).map(([slug, C]) => { const Q = ({ pagina }: { pagina?: Pagina }) => <ProvedorC12><C pagina={pagina} /></ProvedorC12>; Q.displayName = `QuadroC12(${slug})`; return [slug, Q]; }),
);
