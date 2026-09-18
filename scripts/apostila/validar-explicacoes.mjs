/** Confere as explicações dos slides: cobertura por capítulo, tamanhos e caracteres proibidos. Uso: node scripts/apostila/validar-explicacoes.mjs [caps] */
import fs from "node:fs"; import path from "node:path";
const DIR = path.join(path.dirname(new URL(import.meta.url).pathname), "explicacoes");
const ex = JSON.parse(fs.readFileSync("content/generated/extract.json", "utf8"));
const caps = process.argv[2] && process.argv[2] !== "todos" ? process.argv[2].split(",").map(Number) : [1,2,3,4,5,6,7,8,9,10,11];
const palavras = (t) => t.trim().split(/\s+/).filter(Boolean).length;
let erros = 0; const aviso = (m) => { console.log("  " + m); erros++; };
for (const n of caps) {
  const f = path.join(DIR, `c${String(n).padStart(2, "0")}.json`);
  console.log(`capítulo ${n}: ${fs.existsSync(f) ? "" : "ARQUIVO AUSENTE"}`);
  if (!fs.existsSync(f)) { erros++; continue; }
  let j; try { j = JSON.parse(fs.readFileSync(f, "utf8")); } catch (e) { aviso("JSON inválido: " + e.message); continue; }
  const pages = ex.pages.filter((p) => p.cap === n);
  for (const p of pages) {
    const e = j[p.id]; if (!e) { aviso(`${p.id} ausente`); continue; }
    for (const k of ["aluno", "professor"]) {
      const t = e[k]; if (typeof t !== "string" || !t.trim()) { aviso(`${p.id}.${k} vazio`); continue; }
      const n = palavras(t); const [lo, hi] = k === "aluno" ? [85, 185] : [100, 215];
      if (n < lo || n > hi) aviso(`${p.id}.${k}: ${n} palavras (esperado ${lo} a ${hi})`);
      if (/[—–]/.test(t) || / - /.test(t)) aviso(`${p.id}.${k}: travessão ou hífen de pontuação`);
      if (/\bneste slide\b|\bnesta página vamos\b/i.test(t)) aviso(`${p.id}.${k}: metacomentário`);
    }
  }
  for (const k of Object.keys(j)) if (!pages.some((p) => p.id === k)) aviso(`${k} não pertence ao capítulo ${n}`);
}
console.log(erros ? `${erros} problema(s)` : "ok"); process.exit(erros ? 1 : 0);
