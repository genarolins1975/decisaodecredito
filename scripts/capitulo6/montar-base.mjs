// Monta src/lib/capitulo6/base.json a partir das saídas do gerador do curso (content/generated/dados.json, semente
// 20260501). Treino: as 2.103 propostas das safras 2022-01 a 2023-02, com utilização, atraso máximo em 6 meses e
// score de bureau; dividido em ajuste e validação por sorteio com semente 20260601 (70% e 30%): a base não traz a
// safra por proposta, então a validação deste capítulo é aleatória, não temporal (limitação declarada nos quadros).
// Janela fora do tempo: as 737 propostas das safras 2023-08 a 2023-12, as mesmas do capítulo 7, com a PD verdadeira.
// Uso: node scripts/capitulo6/montar-base.mjs
import fs from "node:fs";
const { DADOS, DID } = JSON.parse(fs.readFileSync("content/generated/dados.json", "utf8"));
const SEMENTE = 20260601;
function mulberry32(seed) { let t = seed >>> 0; return () => { t += 0x6d2b79f5; let x = Math.imul(t ^ (t >>> 15), 1 | t); x ^= x + Math.imul(x ^ (x >>> 7), 61 | x); return ((x ^ (x >>> 14)) >>> 0) / 4294967296; }; }
const n = DADOS.tr.y.length, r = mulberry32(SEMENTE), idx = Array.from({ length: n }, (_, i) => i);
for (let i = n - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [idx[i], idx[j]] = [idx[j], idx[i]]; }
const nAj = Math.floor(n * 0.7 + 0.5), aj = idx.slice(0, nAj).sort((a, b) => a - b), va = idx.slice(nAj).sort((a, b) => a - b);
const pega = (ids) => ({ util: ids.map((i) => DADOS.tr.util[i]), atr: ids.map((i) => DADOS.tr.atr[i]), sc: ids.map((i) => DADOS.tr.sc[i]), y: ids.map((i) => DADOS.tr.y[i]) });
const o = DADOS.oot;
const base = {
  fonte: "content/generated/dados.json (gerador do curso, semente 20260501); divisão ajuste e validação com semente 20260601",
  meta: { ...DADOS.meta, sementeDivisao: SEMENTE, nAjuste: aj.length, nValidacao: va.length, variaveis: ["util", "atr", "sc"] },
  ajuste: { ...pega(aj), indices: aj }, validacao: { ...pega(va), indices: va },
  oot: { util: o.util, atr: o.atr, sc: o.sc, y: o.y, pt: o.pt, pgr: o.pgr, pl: o.pl },
  didatica: DID.base, grid: DADOS.grid, res: { gbm_treino: DADOS.res.gbm_treino, gbm_val: DADOS.res.gbm_val, gbm_raw_oot: DADOS.res.gbm_raw_oot, logit_treino: DADOS.res.logit_treino, logit_val: DADOS.res.logit_val },
};
fs.writeFileSync("src/lib/capitulo6/base.json", JSON.stringify(base));
console.log("ajuste", aj.length, "validacao", va.length, "oot", o.y.length, "taxas", [base.ajuste.y, base.validacao.y, o.y].map((y) => (y.reduce((s, v) => s + v, 0) / y.length).toFixed(4)).join(" "));
