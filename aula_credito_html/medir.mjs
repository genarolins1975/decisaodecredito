/* Diagnóstico de altura: imprime os blocos de primeiro e segundo nível do corpo
   do slide, com altura medida, para achar o que não cabe nos 900 px do palco.
   Uso: node medir.mjs 14 */
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const raiz = path.dirname(fileURLToPath(import.meta.url));
const id = process.argv[2] || "01";
const exe = fs.existsSync("/opt/pw-browsers/chromium-1194/chrome-linux/chrome")
  ? "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" : undefined;
const b = await chromium.launch({ executablePath: exe });
const p = await b.newPage({ viewport: { width: 1366, height: 768 } });
await p.goto("file://" + path.join(raiz, "dist", "aula_credito.html"));
await p.evaluate((i) => { location.hash = "#/slide/" + i; }, id);
await p.waitForTimeout(200);
console.log(await p.evaluate(() => {
  const corpo = document.getElementById("corpo");
  const linhas = [];
  function anda(el, nivel, prefixo) {
    for (const f of el.children) {
      const nome = typeof f.className === "string" ? f.className : f.tagName;
      linhas.push(`${prefixo}${f.tagName.toLowerCase()}.${nome} ` +
        `alt ${f.offsetHeight} larg ${f.offsetWidth} rola ${f.scrollHeight - f.clientHeight}`);
      if (nivel < 2) anda(f, nivel + 1, prefixo + "  ");
    }
  }
  anda(corpo, 0, "");
  return `corpo: visivel ${corpo.clientHeight} conteudo ${corpo.scrollHeight}\n` +
    linhas.join("\n");
}));
await b.close();
