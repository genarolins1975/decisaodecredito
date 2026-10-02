/**
 * Dados do capítulo 7. Uma fonte só: src/lib/capitulo7/base.json, gerado por scripts/content/visuais-dados.mjs a
 * partir de content/generated/dados.json (gerador do curso, semente 20260501). O registro de cada exemplo (origem,
 * população, horizonte, semente, partição, procedimento e limitações) está em docs/CAPITULO_7_RECONSTRUCAO.md,
 * seção 7, e os números são conferidos em tests/capitulo7-metricas.test.ts.
 */
import base from "./base.json";
import { arredondar, fila, interceptoComAgregadas, interceptoComSlope1, interceptoDasMedias, jeffreys, juntarAmostras, ks, media, monitorarNivel, mudancasDeDecisao, mulberry32, nivelEmReplicas, transformar } from "./metricas";
import { curva, esperado, GRADE_CORTES, otimo, PARAMETROS } from "@/lib/visuais/economia";

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
 * boa fila e nível distorcido: a logística com o nível deslocado em +0,8 em log odds (média sobe de 9,7% para 18,5%);
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

/**
 * Safra é a coorte mensal de concessão (slide 2). Cada partição da base reúne safras: treino (2022-01 a 2023-02),
 * validação (2023-03 a 2023-07) e janela (2023-08 a 2023-12); os meses saem dos textos de META, e o tamanho médio de
 * uma safra é o total de propostas dividido pelo total de meses.
 */
const mesesDe = (t: string) => { const [a, b] = (t.match(/\d{4}-\d{2}/g) ?? []).map((x) => { const [ano, mes] = x.split("-").map(Number); return ano * 12 + mes; }); return b - a + 1; };
export const MESES = { treino: mesesDe(base.meta.treino), validacao: mesesDe(base.meta.validacao), janela: mesesDe(base.meta.oot) };
export const MESES_TOTAL = MESES.treino + MESES.validacao + MESES.janela;
export const SAFRA_MEDIA = (base.meta.nTreino + base.meta.nVal + base.meta.nOot) / MESES_TOTAL;

/**
 * O nível da logística ancorado em safras maturadas (slides 2, 27, 36 e 37). A finalidade e a regra estão no contrato
 * do slide 2, antes da prova: PD para provisão de estágio 1 e corte, nível corrente; depois da prova, intercepto em
 * todas as safras maturadas fora do treino (validação e janela, recentes). A norma não fixa as safras. A janela prova
 * a ordenação; encerrada a prova, ela entra no nível de produção com a validação. Treino e validação só existem agregados em RES (n, taxa observada, PD média da logística),
 * sem PD por proposta: a validação sozinha e treino com validação usam interceptoDasMedias; validação e janela usam
 * interceptoComAgregadas, com a equação de escore exata das 737 propostas da janela somada à da validação agregada.
 * Cada intercepto é somado ao log odds das PDs da janela; a PD média resultante se compara com a taxa da janela
 * (O/E = observado ÷ esperado) e com a PD verdadeira média (oeVerd), que só a base sintética tem. Na âncora recentes
 * a janela está dentro da amostra: a comparação é conferência, não prova. A perda esperada em reais é Σ PD × LGD × EAD
 * com a LGD do motor do slide 32 (PARAMETROS.lgd) e a EAD de cada proposta; perdaVerd usa a PD verdadeira.
 */
const LGD = PARAMETROS.lgd;
const perdaEsperadaReais = (pd: readonly number[]) => { let s = 0; for (let i = 0; i < pd.length; i++) s += pd[i] * LGD * base.oot.ead[i]; return s; };
const taxaJanela = Y.reduce((a, b) => a + b, 0) / Y.length;
const ptJanela = media(PT)!;
function aplicar(a: number) { const q = transformar(PL, a, 1); const pdMedia = media(q)!; return { a, pdMedia, oe: taxaJanela / pdMedia, oeVerd: ptJanela / pdMedia, perda: perdaEsperadaReais(q) }; }
const SAFRA_TREINO = { n: base.meta.nTreino, taxa: base.res.logit_treino.obs, pdMedia: base.res.logit_treino.pd_media };
const SAFRA_VAL = { n: base.meta.nVal, taxa: base.res.logit_val.obs, pdMedia: base.res.logit_val.pd_media };
const JUNTAS = juntarAmostras([SAFRA_TREINO, SAFRA_VAL]);
const DEF_VAL = Math.round(SAFRA_VAL.n * SAFRA_VAL.taxa), DEF_JAN = Y.reduce((a, b) => a + b, 0);
const N_REC = SAFRA_VAL.n + Y.length, D_REC = DEF_VAL + DEF_JAN;
/** PD média da logística em validação e janela juntas, ponderada pelo número de propostas */
const PM_REC = (SAFRA_VAL.n * SAFRA_VAL.pdMedia + PL.reduce((a, b) => a + b, 0)) / N_REC;
export const ANCORA = {
  taxaJanela,
  /** PD verdadeira média da janela: só existe porque a base é sintética */
  ptJanela,
  /** perda esperada da janela pela PD verdadeira, com a LGD do motor: o alvo da conferência */
  perdaVerd: perdaEsperadaReais(PT),
  lgd: LGD,
  treino: { ...SAFRA_TREINO, defaults: Math.round(SAFRA_TREINO.n * SAFRA_TREINO.taxa) },
  validacao: { ...SAFRA_VAL, defaults: DEF_VAL, oe: SAFRA_VAL.taxa / SAFRA_VAL.pdMedia, jeffreys: jeffreys(DEF_VAL, SAFRA_VAL.n, SAFRA_VAL.pdMedia) },
  /** a logística como estimada no treino */
  sem: aplicar(0),
  /** peso do treino na âncora de treino e validação (n do treino ÷ n de treino e validação) */
  pesoTreino: SAFRA_TREINO.n / JUNTAS.n,
  /** intercepto ajustado só nas safras da validação (2023-03 a 2023-07) */
  soValidacao: aplicar(interceptoDasMedias(SAFRA_VAL.taxa, SAFRA_VAL.pdMedia)),
  /** só a janela (2023-08 a 2023-12): tão recente quanto validação e janela, com metade das safras; a PD média iguala a taxa da janela */
  soJanela: aplicar(interceptoComSlope1(Y, PL)),
  /** treino e validação juntos (2022-01 a 2023-07), dominados pelo treino */
  variasSafras: { n: JUNTAS.n, defaults: JUNTAS.defaults, taxa: JUNTAS.taxa!, pdMediaAmostra: JUNTAS.pdMedia!, ...aplicar(interceptoDasMedias(JUNTAS.taxa!, JUNTAS.pdMedia!)) },
  /**
   * validação e janela juntas (2023-03 a 2023-12): as safras maturadas mais recentes na data da base, o nível que vai
   * para produção depois da prova. jeffreys: o teste da PD da logística sem recalibrar contra os defaults das duas.
   */
  recentes: { n: N_REC, defaults: D_REC, taxa: D_REC / N_REC, pdMediaAmostra: PM_REC, jeffreys: jeffreys(D_REC, N_REC, PM_REC), ...aplicar(interceptoComAgregadas(Y, PL, [SAFRA_VAL])) },
};

/**
 * Sorte da janela na âncora de produção (slides 27, 36 e 38): em réplicas sintéticas da janela, o desfecho das 737
 * propostas é sorteado de novo pela PD verdadeira (2.000 réplicas, semente própria), a validação agregada fica como
 * está, e o intercepto de validação e janela é refeito (nivelEmReplicas de metricas.ts). A média e a faixa central de
 * 95% da PD média resultante mostram quanto do acerto da âncora na tabela de conferência veio dos 81 defaults
 * observados. Calculado sob demanda (nunca no carregamento do módulo), com cache.
 */
export const REPLICAS_ANCORA = { replicas: 2000, semente: 20261043 };
let cacheReplicas: ReturnType<typeof nivelEmReplicas> | null = null;
export function ancoraEmReplicas() {
  if (!cacheReplicas) cacheReplicas = nivelEmReplicas(PT, PL, [SAFRA_VAL], REPLICAS_ANCORA.replicas, REPLICAS_ANCORA.semente);
  return cacheReplicas;
}

/**
 * A finalidade da PD é provisão e corte (slide 2): recalibrado o nível, o corte econômico se refaz pelo motor do
 * slide 32 (curva e otimo de economia.ts, na grade de 0,5% até 40%). Para a logística sem recalibrar e para a
 * recalibrada em validação e janela: o corte, os aprovados, a promessa (o resultado esperado pela PD do modelo) e o
 * que os mesmos aprovados valem pela PD verdadeira (só na base sintética); também as decisões que mudam no corte antigo
 * com a PD recalibrada e o corte do KS na escala recalibrada (a mesma fila, outro número de PD).
 */
const CORTES_MOTOR = GRADE_CORTES.filter((c) => c <= 0.4);
function politica(pd: readonly number[]) {
  const o = otimo(curva(pd as number[], base.oot.ead, CORTES_MOTOR));
  let verdadeiro = 0; for (let i = 0; i < pd.length; i++) if (pd[i] < o.corte) verdadeiro += esperado(PT[i], base.oot.ead[i]);
  return { corte: o.corte, aprovados: o.parcelas.aprovados, promessa: o.parcelas.total, verdadeiro };
}
const PL_PRODUCAO = transformar(PL, ANCORA.recentes.a, 1);
const SEM_POL = politica(PL);
export const PRODUCAO = {
  /** PD da logística com o nível de produção (intercepto de validação e janela) */
  pd: PL_PRODUCAO as readonly number[],
  sem: SEM_POL,
  recalibrada: politica(PL_PRODUCAO),
  /** decisões que mudam no corte antigo quando a PD passa à recalibrada */
  mudamNoCorteAntigo: mudancasDeDecisao(PL, PL_PRODUCAO, SEM_POL.corte),
  /** limiar do KS na escala recalibrada */
  ks: ks(Y, PL_PRODUCAO).limiar,
};

/**
 * Monitoramento do nível depois da recalibração (slides 36, 37 e 38): 12 safras mensais do tamanho médio da base, com
 * a PD média de produção (ANCORA.recentes); teste de Jeffreys bilateral a 5% na safra isolada e, no acumulado desde a
 * calibração, 5% repartido entre as 12 olhadas (Bonferroni, 5% ÷ 12 em cada uma). Falso alarme com a PD certa; poder
 * contra uma subestimação de 1 ponto. Também o falso alarme do acumulado sem repartir (5% em cada olhada), que mostra
 * por que repartir. Simulado sob demanda (nunca no carregamento do módulo), com cache.
 */
export const MONITOR = { safras: 12, alfa: 0.05, erro: 0.01, sorteios: 20000, semente: 20261041 };
let cacheMonitor: { m: number; p0: number; falsoSafra: number; poderSafra: number; falsoAcumulado: number; poderAcumulado: number; falsoSemRepartir: number } | null = null;
export function monitoramento() {
  if (cacheMonitor) return cacheMonitor;
  const m = Math.round(SAFRA_MEDIA), p0 = ANCORA.recentes.pdMedia;
  const cfg = { m, p0, safras: MONITOR.safras, alfa: MONITOR.alfa, alfaOlhada: MONITOR.alfa / MONITOR.safras, sorteios: MONITOR.sorteios, semente: MONITOR.semente };
  const h0 = monitorarNivel({ ...cfg, pReal: p0 }), h1 = monitorarNivel({ ...cfg, pReal: p0 + MONITOR.erro });
  const solto = monitorarNivel({ ...cfg, pReal: p0, alfaOlhada: MONITOR.alfa });
  cacheMonitor = { m, p0, falsoSafra: h0.porSafra, poderSafra: h1.porSafra, falsoAcumulado: h0.acumulado, poderAcumulado: h1.acumulado, falsoSemRepartir: solto.acumulado };
  return cacheMonitor;
}
