"use client";
import type { ComponentType } from "react";
import type { Pagina } from "@/components/capitulo7/base";
import { ProvedorC6 } from "./provedor";
import { S01Mapa } from "./slides/s01-mapa";
import { S23EscolherVotarCorrigir } from "./slides/s23-escolher-votar-corrigir";
import { S02TresEstrategias } from "./slides/s02-tres-estrategias";
import { S03Palpite } from "./slides/s03-palpite";
import { S04ErroAlvo } from "./slides/s04-erro-alvo";
import { S05PrimeiraArvore } from "./slides/s05-primeira-arvore";
import { S06PassoNewton } from "./slides/s06-passo-newton";
import { S07Taxa } from "./slides/s07-taxa";
import { S08PerdaCai } from "./slides/s08-perda-cai";
import { S09Parcelas } from "./slides/s09-parcelas";
import { S10Formula } from "./slides/s10-formula";
import { S11Carteira } from "./slides/s11-carteira";
import { S12Profundidade } from "./slides/s12-profundidade";
import { S13QuatroControles } from "./slides/s13-quatro-controles";
import { S14TaxaArvores } from "./slides/s14-taxa-arvores";
import { S15QuandoParar } from "./slides/s15-quando-parar";
import { S16Subamostra } from "./slides/s16-subamostra";
import { S17Logistica } from "./slides/s17-logistica";
import { S18Nivel } from "./slides/s18-nivel";
import { S19Contribuicoes } from "./slides/s19-contribuicoes";
import { S20Monotonia } from "./slides/s20-monotonia";
import { S21Candidato } from "./slides/s21-candidato";
import { S22Apendice } from "./slides/s22-apendice";

/** Os mesmos quadros de registro.tsx, importados de uma vez: para os testes de renderização no servidor. */
const BRUTO: Record<string, ComponentType<{ pagina?: Pagina }>> = {
  c6p1: S01Mapa,
  c6p23: S23EscolherVotarCorrigir,
  c6p2: S02TresEstrategias,
  c6p3: S03Palpite,
  c6p4: S04ErroAlvo,
  c6p5: S05PrimeiraArvore,
  c6p6: S06PassoNewton,
  c6p7: S07Taxa,
  c6p8: S08PerdaCai,
  c6p9: S09Parcelas,
  c6p10: S10Formula,
  c6p11: S11Carteira,
  c6p12: S12Profundidade,
  c6p13: S13QuatroControles,
  c6p14: S14TaxaArvores,
  c6p15: S15QuandoParar,
  c6p16: S16Subamostra,
  c6p17: S17Logistica,
  c6p18: S18Nivel,
  c6p19: S19Contribuicoes,
  c6p20: S20Monotonia,
  c6p21: S21Candidato,
  c6p22: S22Apendice,
};
export const QUADROS_C6_ESTATICOS: Record<string, ComponentType<{ pagina?: Pagina }>> = Object.fromEntries(
  Object.entries(BRUTO).map(([slug, C]) => { const Q = ({ pagina }: { pagina?: Pagina }) => <ProvedorC6><C pagina={pagina} /></ProvedorC6>; Q.displayName = `QuadroC6(${slug})`; return [slug, Q]; }),
);
