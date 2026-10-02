"use client";
import type { ComponentType } from "react";
import type { Pagina } from "./base";
import { S01Mapa } from "./slides/s01-mapa";
import { S02Contrato } from "./slides/s02-contrato";
import { S03Armadilha } from "./slides/s03-armadilha";
import { S04TresObjetos } from "./slides/s04-tres-objetos";
import { S05Fila } from "./slides/s05-fila";
import { S06Disputa } from "./slides/s06-disputa";
import { S07Pares } from "./slides/s07-pares";
import { S08Matriz } from "./slides/s08-matriz";
import { S09Roc } from "./slides/s09-roc";
import { S10LimitesAuc } from "./slides/s10-limites-auc";
import { S11Ks } from "./slides/s11-ks";
import { S12Ganho } from "./slides/s12-ganho";
import { S13Lift } from "./slides/s13-lift";
import { S14PrecisaoRecall } from "./slides/s14-precisao-recall";
import { S15LaboratorioDiscriminacao } from "./slides/s15-laboratorio-discriminacao";
import { S16Transicao } from "./slides/s16-transicao";
import { S17PdColetiva } from "./slides/s17-pd-coletiva";
import { S18Global } from "./slides/s18-global";
import { S19Confiabilidade } from "./slides/s19-confiabilidade";
import { S20Faixas } from "./slides/s20-faixas";
import { S21Wilson } from "./slides/s21-wilson";
import { S22NivelInclinacao } from "./slides/s22-nivel-inclinacao";
import { S23Brier } from "./slides/s23-brier";
import { S24LogLoss } from "./slides/s24-logloss";
import { S25BrierCalibracao } from "./slides/s25-brier-calibracao";
import { S26LaboratorioCalibracao } from "./slides/s26-laboratorio-calibracao";
import { S27AmostraPropria } from "./slides/s27-amostra-propria";
import { S28Intercepto } from "./slides/s28-intercepto";
import { S29Platt } from "./slides/s29-platt";
import { S30Isotonica } from "./slides/s30-isotonica";
import { S31DepoisDeRecalibrar } from "./slides/s31-depois-de-recalibrar";
import { S32Politica } from "./slides/s32-politica";
import { S33Bootstrap } from "./slides/s33-bootstrap";
import { S34ComparacaoJusta } from "./slides/s34-comparacao-justa";
import { S35OotCongelado } from "./slides/s35-oot-congelado";
import { S36CasoIntegrador } from "./slides/s36-caso-integrador";
import { S37Conclusao } from "./slides/s37-conclusao";
import { S38Apendice } from "./slides/s38-apendice";

/**
 * Quadros do capítulo 7, um por página, no modo "conteudo" do registro de visuais: o quadro substitui todo o conteúdo
 * herdado da página e as questões da página (com veredito no servidor) continuam no estudo, abaixo do quadro. No
 * palco, o quadro é a tela inteira (PALCO_PROPRIO).
 */
export const QUADROS_C7: Record<string, ComponentType<{ pagina?: Pagina }>> = {
  c7p1: S01Mapa,
  c7p21: S02Contrato,
  c7p2: S03Armadilha,
  c7p3: S04TresObjetos,
  c7p4: S05Fila,
  c7p5: S06Disputa,
  c7p22: S07Pares,
  c7p23: S08Matriz,
  c7p6: S09Roc,
  c7p24: S10LimitesAuc,
  c7p7: S11Ks,
  c7p8: S12Ganho,
  c7p25: S13Lift,
  c7p26: S14PrecisaoRecall,
  c7p27: S15LaboratorioDiscriminacao,
  c7p28: S16Transicao,
  c7p9: S17PdColetiva,
  c7p29: S18Global,
  c7p10: S19Confiabilidade,
  c7p30: S20Faixas,
  c7p31: S21Wilson,
  c7p32: S22NivelInclinacao,
  c7p33: S23Brier,
  c7p34: S24LogLoss,
  c7p11: S25BrierCalibracao,
  c7p35: S26LaboratorioCalibracao,
  c7p16: S27AmostraPropria,
  c7p12: S28Intercepto,
  c7p13: S29Platt,
  c7p36: S30Isotonica,
  c7p37: S31DepoisDeRecalibrar,
  c7p18: S32Politica,
  c7p14: S33Bootstrap,
  c7p15: S34ComparacaoJusta,
  c7p17: S35OotCongelado,
  c7p38: S36CasoIntegrador,
  c7p20: S37Conclusao,
  c7p19: S38Apendice,
};
