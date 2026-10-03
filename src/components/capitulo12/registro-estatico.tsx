"use client";
import type { ComponentType } from "react";
import type { Pagina } from "@/components/capitulo7/base";
import { ProvedorC12 } from "./provedor";
import { S01Abertura } from "./slides/s01-abertura";
import { S02BlocoClassificacao } from "./slides/s02-bloco-classificacao";
import { S03Termos } from "./slides/s03-termos";
import { S04Mnist } from "./slides/s04-mnist";
import { S05BaseCodigo } from "./slides/s05-base-codigo";
import { S06DuasClasses } from "./slides/s06-duas-classes";
import { S07TreinoTeste } from "./slides/s07-treino-teste";
import { S08Sgd } from "./slides/s08-sgd";
import { S09BlocoDesempenho } from "./slides/s09-bloco-desempenho";
import { S10Acuracia } from "./slides/s10-acuracia";
import { S11Matriz } from "./slides/s11-matriz";
import { S12Precisao } from "./slides/s12-precisao";
import { S13Recall } from "./slides/s13-recall";
import { S14F1 } from "./slides/s14-f1";
import { S15QuatroMetricas } from "./slides/s15-quatro-metricas";
import { S16Custos } from "./slides/s16-custos";
import { S17Limiar } from "./slides/s17-limiar";
import { S18PrecisaoRecall } from "./slides/s18-precisao-recall";
import { S19Roc } from "./slides/s19-roc";
import { S20CurvasCruzam } from "./slides/s20-curvas-cruzam";
import { S21AucGini } from "./slides/s21-auc-gini";
import { S22BlocoEnsembles } from "./slides/s22-bloco-ensembles";
import { S23Votacao } from "./slides/s23-votacao";
import { S24Maioria } from "./slides/s24-maioria";
import { S25QuatroFormas } from "./slides/s25-quatro-formas";
import { S26Luas } from "./slides/s26-luas";
import { S27VotacaoCodigo } from "./slides/s27-votacao-codigo";
import { S28VotoIsolados } from "./slides/s28-voto-isolados";
import { S29Bagging } from "./slides/s29-bagging";
import { S30Bagging500 } from "./slides/s30-bagging-500";
import { S31Fronteira } from "./slides/s31-fronteira";
import { S32Fora37 } from "./slides/s32-fora-37";
import { S33Oob } from "./slides/s33-oob";
import { S34Floresta } from "./slides/s34-floresta";
import { S35Importancia } from "./slides/s35-importancia";
import { S36BoostingCodigo } from "./slides/s36-boosting-codigo";
import { S37Residuo } from "./slides/s37-residuo";
import { S38SinteseEnsembles } from "./slides/s38-sintese-ensembles";
import { S39BlocoCredito } from "./slides/s39-bloco-credito";
import { S40Caso } from "./slides/s40-caso";
import { S41ForaDoTempo } from "./slides/s41-fora-do-tempo";
import { S42AucTempo } from "./slides/s42-auc-tempo";
import { S43Sobreajuste } from "./slides/s43-sobreajuste";
import { S44Populacao } from "./slides/s44-populacao";
import { S45Regras } from "./slides/s45-regras";
import { S46MetricasComite } from "./slides/s46-metricas-comite";
import { S47Exercicio } from "./slides/s47-exercicio";
import { S48Sintese } from "./slides/s48-sintese";
import { S49Volta } from "./slides/s49-volta";
import { S50ApendiceDados } from "./slides/s50-apendice-dados";
import { S51ApendiceSafras } from "./slides/s51-apendice-safras";
import { S52Referencias } from "./slides/s52-referencias";
import { S53Multidoes } from "./slides/s53-multidoes";

/** Os mesmos quadros de registro.tsx, importados de uma vez: para os testes de renderização no servidor. */
const BRUTO: Record<string, ComponentType<{ pagina?: Pagina }>> = {
  c12p1: S01Abertura,
  c12p2: S02BlocoClassificacao,
  c12p3: S03Termos,
  c12p4: S04Mnist,
  c12p5: S05BaseCodigo,
  c12p6: S06DuasClasses,
  c12p7: S07TreinoTeste,
  c12p8: S08Sgd,
  c12p9: S09BlocoDesempenho,
  c12p10: S10Acuracia,
  c12p11: S11Matriz,
  c12p12: S12Precisao,
  c12p13: S13Recall,
  c12p14: S14F1,
  c12p15: S15QuatroMetricas,
  c12p16: S16Custos,
  c12p17: S17Limiar,
  c12p18: S18PrecisaoRecall,
  c12p19: S19Roc,
  c12p20: S20CurvasCruzam,
  c12p21: S21AucGini,
  c12p22: S22BlocoEnsembles,
  c12p23: S23Votacao,
  c12p24: S24Maioria,
  c12p25: S25QuatroFormas,
  c12p26: S26Luas,
  c12p27: S27VotacaoCodigo,
  c12p28: S28VotoIsolados,
  c12p29: S29Bagging,
  c12p30: S30Bagging500,
  c12p31: S31Fronteira,
  c12p32: S32Fora37,
  c12p33: S33Oob,
  c12p34: S34Floresta,
  c12p35: S35Importancia,
  c12p36: S36BoostingCodigo,
  c12p37: S37Residuo,
  c12p38: S38SinteseEnsembles,
  c12p39: S39BlocoCredito,
  c12p40: S40Caso,
  c12p41: S41ForaDoTempo,
  c12p42: S42AucTempo,
  c12p43: S43Sobreajuste,
  c12p44: S44Populacao,
  c12p45: S45Regras,
  c12p46: S46MetricasComite,
  c12p47: S47Exercicio,
  c12p48: S48Sintese,
  c12p49: S49Volta,
  c12p50: S50ApendiceDados,
  c12p51: S51ApendiceSafras,
  c12p52: S52Referencias,
  c12p53: S53Multidoes,
};
export const QUADROS_C12_ESTATICOS: Record<string, ComponentType<{ pagina?: Pagina }>> = Object.fromEntries(
  Object.entries(BRUTO).map(([slug, C]) => { const Q = ({ pagina }: { pagina?: Pagina }) => <ProvedorC12><C pagina={pagina} /></ProvedorC12>; Q.displayName = `QuadroC12(${slug})`; return [slug, Q]; }),
);
