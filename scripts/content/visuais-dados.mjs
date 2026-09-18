// Extrai de content/generated/dados.json os recortes pequenos que os visuais nativos usam no cliente.
// Uso: node scripts/content/visuais-dados.mjs
import { readFileSync, writeFileSync } from "node:fs";
const { DADOS } = JSON.parse(readFileSync("content/generated/dados.json", "utf8"));
const oot = DADOS.oot;
const out = {
  fonte: "content/generated/dados.json (DADOS.oot), gerador com semente 20260501",
  amostra: "737 propostas fora do tempo, safras 2023-08 a 2023-12",
  modelo: "regressão logística com pesos de evidência, PD estimada",
  y: oot.y, pd: oot.pl.map((x) => Math.round(x * 1e6) / 1e6),
};
writeFileSync("src/lib/visuais/oot-logistica.json", JSON.stringify(out));
console.log(`oot-logistica.json: ${out.y.length} propostas, ${out.y.reduce((a, b) => a + b, 0)} defaults`);
