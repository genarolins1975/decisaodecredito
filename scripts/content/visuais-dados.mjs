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
};
writeFileSync("src/lib/visuais/oot-logistica.json", JSON.stringify(out));
console.log(`oot-logistica.json: ${out.y.length} propostas, ${out.y.reduce((a, b) => a + b, 0)} defaults, exposição total ${out.ead.reduce((a, b) => a + b, 0)}`);

// Base didática de 16 propostas (capítulos 4 a 6): utilização do limite, maior atraso em 6 meses e desfecho.
const did = { fonte: "content/generated/dados.json (DID.base)", escala: "utilização em % do limite; atraso em dias; y = 1 default", base: DADOS_DID.base };
writeFileSync("src/lib/visuais/did.json", JSON.stringify(did));
console.log(`did.json: ${did.base.length} propostas`);
