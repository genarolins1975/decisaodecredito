"use client";
import type { ComponentType } from "react";
import dynamic from "next/dynamic";
import type { Pagina } from "@/components/capitulo7/base";
import { ProvedorC6 } from "./provedor";

/**
 * Quadros do capítulo 6 por página, na ordem do roteiro (c6p23 é o slide 2), cada um dentro do provedor do roteiro do capítulo. Cada quadro é carregado sob
 * demanda (next/dynamic, com renderização no servidor): os quadros ajustam modelos de boosting, e importar todos de
 * uma vez faria qualquer página pagar essa conta. A versão estática fica em registro-estatico.tsx, para os testes.
 */
const SOB_DEMANDA: Record<string, ComponentType<{ pagina?: Pagina }>> = {
  c6p1: dynamic(() => import("./slides/s01-mapa").then((m) => m.S01Mapa)),
  c6p23: dynamic(() => import("./slides/s23-escolher-votar-corrigir").then((m) => m.S23EscolherVotarCorrigir)),
  c6p2: dynamic(() => import("./slides/s02-tres-estrategias").then((m) => m.S02TresEstrategias)),
  c6p3: dynamic(() => import("./slides/s03-palpite").then((m) => m.S03Palpite)),
  c6p4: dynamic(() => import("./slides/s04-erro-alvo").then((m) => m.S04ErroAlvo)),
  c6p5: dynamic(() => import("./slides/s05-primeira-arvore").then((m) => m.S05PrimeiraArvore)),
  c6p6: dynamic(() => import("./slides/s06-passo-newton").then((m) => m.S06PassoNewton)),
  c6p7: dynamic(() => import("./slides/s07-taxa").then((m) => m.S07Taxa)),
  c6p8: dynamic(() => import("./slides/s08-perda-cai").then((m) => m.S08PerdaCai)),
  c6p9: dynamic(() => import("./slides/s09-parcelas").then((m) => m.S09Parcelas)),
  c6p10: dynamic(() => import("./slides/s10-formula").then((m) => m.S10Formula)),
  c6p11: dynamic(() => import("./slides/s11-carteira").then((m) => m.S11Carteira)),
  c6p12: dynamic(() => import("./slides/s12-profundidade").then((m) => m.S12Profundidade)),
  c6p13: dynamic(() => import("./slides/s13-quatro-controles").then((m) => m.S13QuatroControles)),
  c6p14: dynamic(() => import("./slides/s14-taxa-arvores").then((m) => m.S14TaxaArvores)),
  c6p15: dynamic(() => import("./slides/s15-quando-parar").then((m) => m.S15QuandoParar)),
  c6p16: dynamic(() => import("./slides/s16-subamostra").then((m) => m.S16Subamostra)),
  c6p17: dynamic(() => import("./slides/s17-logistica").then((m) => m.S17Logistica)),
  c6p18: dynamic(() => import("./slides/s18-nivel").then((m) => m.S18Nivel)),
  c6p19: dynamic(() => import("./slides/s19-contribuicoes").then((m) => m.S19Contribuicoes)),
  c6p20: dynamic(() => import("./slides/s20-monotonia").then((m) => m.S20Monotonia)),
  c6p21: dynamic(() => import("./slides/s21-candidato").then((m) => m.S21Candidato)),
  c6p22: dynamic(() => import("./slides/s22-apendice").then((m) => m.S22Apendice)),
};
export const QUADROS_C6: Record<string, ComponentType<{ pagina?: Pagina }>> = Object.fromEntries(
  Object.entries(SOB_DEMANDA).map(([slug, C]) => { const Q = ({ pagina }: { pagina?: Pagina }) => <ProvedorC6><C pagina={pagina} /></ProvedorC6>; Q.displayName = `QuadroC6(${slug})`; return [slug, Q]; }),
);
