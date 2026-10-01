// Extrai de content/generated/dados.json os recortes pequenos que os visuais nativos usam no cliente.
// Uso: node scripts/content/visuais-dados.mjs
import { readFileSync, writeFileSync } from "node:fs";
const { DADOS, DID: DADOS_DID } = JSON.parse(readFileSync("content/generated/dados.json", "utf8"));
const oot = DADOS.oot;
const out = {
  fonte: "content/generated/dados.json (DADOS.oot), gerador com semente 20260501",
  amostra: "737 propostas fora do tempo, safras 2023-08 a 2023-12",
  modelo: "regressão logística com pesos de evidência, PD estimada",
  y: oot.y, pd: oot.pl.map((x) => Math.round(x * 1e6) / 1e6), ead: oot.ead,
  // PD verdadeira do gerador: só existe porque a base é sintética; o revisor manual do capítulo 10 observa um sinal ruidoso dela
  pt: oot.pt.map((x) => Math.round(x * 1e6) / 1e6),
};
writeFileSync("src/lib/visuais/oot-logistica.json", JSON.stringify(out));
console.log(`oot-logistica.json: ${out.y.length} propostas, ${out.y.reduce((a, b) => a + b, 0)} defaults, exposição total ${out.ead.reduce((a, b) => a + b, 0)}`);

// Base didática de 16 propostas (capítulos 4 a 6): utilização do limite, maior atraso em 6 meses e desfecho.
const did = { fonte: "content/generated/dados.json (DID.base)", escala: "utilização em % do limite; atraso em dias; y = 1 default", base: DADOS_DID.base };
writeFileSync("src/lib/visuais/did.json", JSON.stringify(did));
console.log(`did.json: ${did.base.length} propostas`);

// Grade de boosting do capítulo 6 (c6p17): AUC de treino, validação e fora do tempo por número de árvores e folhas.
const grid = { fonte: "content/generated/dados.json (DADOS.grid), gerador com semente 20260501", modelo: "gradient boosting, taxa 0,05, mínimo por folha 60, escolhido por validação: 60 árvores e 8 folhas", grade: DADOS.grid };
writeFileSync("src/lib/visuais/grid-boosting.json", JSON.stringify(grid));
console.log(`grid-boosting.json: ${grid.grade.length} configurações`);

// Capítulo 9: escores de treino e da janela fora do tempo (para PSI ao vivo) e referências de monitoramento.
const r1 = (v) => Math.round(v * 10) / 10;
const escores = { fonte: "content/generated/dados.json (DADOS.tr e DADOS.oot), gerador com semente 20260501", escala: "escore de crédito (maior é melhor); utilização em % do limite; atraso em dias",
  treino: { sc: DADOS.tr.sc, util: DADOS.tr.util.map(r1), atr: DADOS.tr.atr, y: DADOS.tr.y }, janela: { sc: DADOS.oot.sc, util: DADOS.oot.util.map(r1), atr: DADOS.oot.atr, y: DADOS.oot.y } };
writeFileSync("src/lib/visuais/escores.json", JSON.stringify(escores));
// Capítulo 10: o material do memorando (modelos fora do tempo, comparação de AUC, prevalência, grupos, PSI e procedência).
const memorando = { fonte: "content/generated/dados.json (DADOS.res, meta, fair, psi)", logit: DADOS.res.logit_oot, gbm: DADOS.res.gbm_platt_oot, comparacao: DADOS.res.comparacao_auc,
  taxaAprovacao: DADOS.res.prevalencia.taxa_aprovacao, meta: { seed: DADOS.meta.seed, n: DADOS.meta.n, data: DADOS.meta.data_referencia, treino: DADOS.meta.n_treino, validacao: DADOS.meta.n_val, oot: DADOS.meta.n_oot },
  grupos: { G1: { n: DADOS.fair.G1.n, taxaAprov: DADOS.fair.G1.taxa_aprov }, G2: { n: DADOS.fair.G2.n, taxaAprov: DADOS.fair.G2.taxa_aprov } }, psi: { valor: DADOS.psi.valor, faixas: DADOS.psi.ref.length } };
writeFileSync("src/lib/visuais/memorando.json", JSON.stringify(memorando));
// Capítulo 3: WoE das faixas de utilização e de renda (com contribuição para o IV) e a prevalência de treino.
const woe = { fonte: "content/generated/dados.json (DADOS.woe_bins, woe_renda, res.prevalencia)", prevalenciaTreino: DADOS.res.prevalencia.aprovados_treino,
  utilizacao: DADOS.woe_bins.utilizacao, renda: { edges: DADOS.woe_bins.renda.edges, faixas: DADOS.woe_renda } };
writeFileSync("src/lib/visuais/woe.json", JSON.stringify(woe));
const monit = { fonte: "content/generated/dados.json (DADOS.psi, csi, fair, res, meta)", psi: DADOS.psi, csi: DADOS.csi, fair: DADOS.fair,
  res: { logit_oot: DADOS.res.logit_oot, logit_val: DADOS.res.logit_val, logit_treino: DADOS.res.logit_treino, gbm_val: DADOS.res.gbm_val, gbm_raw_oot: DADOS.res.gbm_raw_oot }, n: { treino: DADOS.meta.n_treino, val: DADOS.meta.n_val, oot: DADOS.meta.n_oot } };
writeFileSync("src/lib/visuais/monitoramento.json", JSON.stringify(monit));
console.log(`escores.json: ${escores.treino.sc.length} de treino e ${escores.janela.sc.length} da janela · monitoramento.json: PSI ${monit.psi.valor}`);

// Capítulo 11: o modelo perfeito que está errado. Resultados do gerador com e sem vazamento.
const vaz = { fonte: "content/generated/dados.json (DADOS.res e DADOS.comparacao_auc), gerador com semente 20260501", horizonte: DADOS.meta.horizonte,
  modelos: { logit_oot: DADOS.res.logit_oot, gbm_raw_oot: DADOS.res.gbm_raw_oot, gbm_treino: DADOS.res.gbm_treino, leak_suave_treino: DADOS.res.gbm_leak_suave_treino, leak_suave_oot: DADOS.res.gbm_leak_suave_oot, leak_total_treino: DADOS.res.gbm_com_leakage_treino, leak_total_oot: DADOS.res.gbm_com_leakage_oot }, comparacao: DADOS.res.comparacao_auc };
writeFileSync("src/lib/visuais/vazamento.json", JSON.stringify(vaz));
console.log(`vazamento.json: AUC honesta ${vaz.modelos.gbm_raw_oot.auc}, suave ${vaz.modelos.leak_suave_oot.auc}, total ${vaz.modelos.leak_total_oot.auc}`);

// Capítulo 7: PD do boosting (bruta e calibrada por Platt) na janela, ganhos por decil e calibração por faixa do gerador.
const mod = { fonte: "content/generated/dados.json (DADOS.oot.pg, pgr, gains, calib, res)", pg: oot.pg.map((x) => Math.round(x * 1e6) / 1e6), pgr: oot.pgr.map((x) => Math.round(x * 1e6) / 1e6), gains: DADOS.gains, calib: DADOS.calib,
  res: { logit_treino: DADOS.res.logit_treino, gbm_treino: DADOS.res.gbm_treino, logit_val: DADOS.res.logit_val, gbm_val: DADOS.res.gbm_val, logit_oot: DADOS.res.logit_oot, gbm_raw_oot: DADOS.res.gbm_raw_oot, gbm_platt_oot: DADOS.res.gbm_platt_oot }, platt: DADOS.platt };
writeFileSync("src/lib/visuais/oot-modelos.json", JSON.stringify(mod));
console.log(`oot-modelos.json: ${mod.pg.length} PDs do boosting, ganhos ${Object.keys(mod.gains).join("/")}`);

// Capítulo 7 reconstruído (outubro de 2026): uma base só para o capítulo inteiro. Os quatro vetores de PD da janela
// fora do tempo, o desfecho, a exposição, os resultados do gerador e a amostra de calibração simulada (ver
// docs/CAPITULO_7_RECONSTRUCAO.md, seção 7). Nada aqui é recalculado: os vetores são os do gerador, com seis casas.
{
  const r6 = (x) => Math.round(x * 1e6) / 1e6;
  const mulberry32 = (seed) => { let t = seed >>> 0; return () => { t += 0x6d2b79f5; let x = Math.imul(t ^ (t >>> 15), 1 | t); x ^= x + Math.imul(x ^ (x >>> 7), 61 | x); return ((x ^ (x >>> 14)) >>> 0) / 4294967296; }; };
  /* Amostra de calibração simulada: 3.000 propostas sorteadas da janela com reposição e desfecho sorteado da PD
     verdadeira do gerador (pt). Existe só porque a base é sintética; numa base real seria uma safra anterior ao OOT,
     com desfecho maturado. As 300 primeiras formam a amostra pequena do exemplo da isotônica. */
  const SEMENTE_CAL = 20261001, N_CAL = 3000;
  const rnd = mulberry32(SEMENTE_CAL); const calI = [], calY = [];
  for (let k = 0; k < N_CAL; k++) { const i = Math.floor(rnd() * oot.y.length); calI.push(i); calY.push(rnd() < oot.pt[i] ? 1 : 0); }
  const base7 = {
    fonte: "content/generated/dados.json (DADOS.meta, DADOS.oot, DADOS.res, DADOS.platt, DADOS.dif_decis), gerador com semente 20260501",
    meta: { seed: DADOS.meta.seed, dataReferencia: DADOS.meta.data_referencia, treino: DADOS.meta.treino, validacao: DADOS.meta.validacao, oot: DADOS.meta.oot,
      nTreino: DADOS.meta.n_treino, nVal: DADOS.meta.n_val, nOot: DADOS.meta.n_oot, horizonte: DADOS.meta.horizonte, unidade: DADOS.meta.unidade, gbm: DADOS.meta.gbm_hp, variaveis: DADOS.meta.features },
    oot: { y: oot.y, pl: oot.pl.map(r6), pgr: oot.pgr.map(r6), pg: oot.pg.map(r6), pt: oot.pt.map(r6), ead: oot.ead, g2: oot.g2 },
    res: DADOS.res, platt: DADOS.platt, difDecis: DADOS.dif_decis,
    calibracao: { semente: SEMENTE_CAL, n: N_CAL, nPequena: 300, indices: calI, y: calY },
  };
  writeFileSync("src/lib/capitulo7/base.json", JSON.stringify(base7));
  console.log(`capitulo7/base.json: ${base7.oot.y.length} propostas OOT, amostra de calibração simulada com ${N_CAL} (${calY.reduce((a, b) => a + b, 0)} defaults)`);
}
