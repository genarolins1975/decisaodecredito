/**
 * Dados do capítulo 7. Uma fonte só: src/lib/capitulo7/base.json, gerado por scripts/content/visuais-dados.mjs a
 * partir de content/generated/dados.json (gerador do curso, semente 20260501). O registro de cada exemplo (origem,
 * população, horizonte, semente, partição, procedimento e limitações) está em docs/CAPITULO_7_RECONSTRUCAO.md,
 * seção 7, e os números são conferidos em tests/capitulo7-metricas.test.ts.
 */
import base from "./base.json";
import { arredondar, fila, mulberry32, transformar } from "./metricas";

export const META = base.meta;
export const RES = base.res;
export const PLATT = base.platt;
export const DIF_DECIS = base.difDecis;

/** Janela fora do tempo: 737 propostas aprovadas nas safras de 2023-08 a 2023-12, desfecho em 12 meses. */
export const Y: readonly number[] = base.oot.y;
/** PD da logística com pesos de evidência (capítulo 4). */
export const PL: readonly number[] = base.oot.pl;
/** PD do boosting sem recalibrar (capítulo 6). */
export const PGR: readonly number[] = base.oot.pgr;
/** PD do boosting recalibrada por Platt, com parâmetros estimados antes da janela OOT (a = −0,1976; b = 0,7366). */
export const PG: readonly number[] = base.oot.pg;
/** PD verdadeira do gerador: só existe porque a base é sintética; nenhum modelo real a conhece. */
export const PT: readonly number[] = base.oot.pt;
export const EAD: readonly number[] = base.oot.ead;
export const N = Y.length;
export const D = Y.reduce((a, b) => a + b, 0);
export const A = N - D;

export const PREVALENCIA = {
  oot: D / N,
  /** população completa da janela, aprovados e recusados, com desfecho do gerador */
  populacao: base.res.prevalencia.populacao_oot,
  rejeitados: base.res.prevalencia.rejeitados_oot,
  treino: base.res.prevalencia.aprovados_treino,
  validacao: base.res.logit_val.obs,
  taxaAprovacao: base.res.prevalencia.taxa_aprovacao,
};

export const MODELOS = [
  { id: "logistica", nome: "Logística", pd: PL, cor: "ink" },
  { id: "boosting", nome: "Boosting sem recalibrar", pd: PGR, cor: "prob" },
  { id: "boostingPlatt", nome: "Boosting com Platt", pd: PG, cor: "dec" },
] as const;

/**
 * Mini-base de 20 propostas reais da janela: 5 defaults e 15 adimplentes sorteados com semente 3 (gerador PCG64 do
 * NumPy, ver scripts/capitulo7/referencia.py), com a PD da logística arredondada a pontos percentuais inteiros, como
 * num relatório. O arredondamento cria um empate entre um default (#179) e um adimplente (#64), ambos com 17%.
 * Denominadores próprios: nunca somar com os da janela.
 */
export const MINI_IDS = [85, 64, 179, 194, 536, 383, 736, 556, 80, 504, 137, 451, 22, 332, 284, 649, 312, 115, 239, 347] as const;
export const MINI: { id: number; y: number; pd: number; pdPlena: number }[] = MINI_IDS.map((i) => ({ id: i, y: Y[i], pd: Math.round(PL[i] * 100) / 100, pdPlena: PL[i] }));
export const MINI_Y = MINI.map((m) => m.y);
export const MINI_PD = MINI.map((m) => m.pd);

/** Os quatro clientes do slide 04: quatro propostas da mini-base, duas com default. */
export const QUATRO = [MINI[0], MINI[3], MINI[10], MINI[16]];

/**
 * Três cenários na mesma janela (slides 15, 16 e 25):
 * boa fila e nível distorcido: a logística com o nível deslocado em +0,8 em log odds (média sobe de 9,7% para 18,8%);
 * boa fila e nível adequado: a logística como estimada;
 * fila fraca e média certa: as PDs da logística embaralhadas entre as propostas (semente 7), mesma média e mesma
 * distribuição, ordenação destruída.
 */
export const SEMENTE_EMBARALHAR = 7;
function embaralhar(v: readonly number[], semente: number) {
  const r = mulberry32(semente); const a = v.slice();
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}
export const CENARIOS = {
  filaBoaNivelErrado: transformar(PL, 0.8, 1),
  filaBoaNivelCerto: PL.slice(),
  filaFracaMediaCerta: embaralhar(PL, SEMENTE_EMBARALHAR),
};

/** Amostra de calibração simulada (3.000 casos; as 300 primeiras são a amostra pequena da isotônica). */
export const CAL = {
  semente: base.calibracao.semente,
  indices: base.calibracao.indices as readonly number[],
  y: base.calibracao.y as readonly number[],
  n: base.calibracao.n,
  nPequena: base.calibracao.nPequena,
};
export const CAL_PL = CAL.indices.map((i) => PL[i]);
export const CAL_PGR = CAL.indices.map((i) => PGR[i]);

export const FILA_PL = fila(PL);
export const PL_4CASAS = arredondar(PL, 4);
