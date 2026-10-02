// Acessibilidade (axe-core) de cada quadro de um capítulo, no estudo. Uso: node scripts/capitulo7/acessibilidade.mjs [N] (padrão 7; grava tmp/axeN.json)
import { chromium } from "@playwright/test";
import fs from "node:fs";
const N = process.argv[2] ?? "7";
const roteiro = fs.readFileSync(`src/lib/capitulo${N}/roteiro.ts`, "utf8");
const SLUGS = [...roteiro.matchAll(/slug: "(c\d+p\d+)", n: (\d+)/g)].sort((a, b) => +a[2] - +b[2]).map((m) => m[1]);
const axe = fs.readFileSync("node_modules/axe-core/axe.min.js", "utf8");
const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" });
const ctx = await browser.newContext({ viewport: { width: 1366, height: 900 } });
await ctx.request.post(`http://localhost:3000/api/auth/login`, { data: { email: "genaro.lins@gmail.com", password: "professor-dev-2026" }, headers: { "x-requested-with": "fetch" } });
const page = await ctx.newPage();
const tudo = {};
for (const slug of SLUGS) {
  await page.goto(`http://localhost:3000/aulas/${slug}`, { waitUntil: "networkidle" }); await page.waitForTimeout(500);
  await page.addScriptTag({ content: axe });
  const r = await page.evaluate(async () => { const res = await window.axe.run(document.querySelector("figure.q7"), { resultTypes: ["violations"] }); return res.violations.map((v) => ({ id: v.id, impact: v.impact, n: v.nodes.length, alvo: v.nodes.slice(0, 2).map((x) => x.target.join(" ")), msg: v.nodes[0]?.failureSummary?.slice(0, 160) })); });
  tudo[slug] = r;
  console.log(slug.padEnd(6), r.length ? r.map((v) => `${v.id}(${v.impact},${v.n})`).join(" ") : "ok");
}
fs.mkdirSync("tmp", { recursive: true }); fs.writeFileSync(`tmp/axe${N}.json`, JSON.stringify(tudo, null, 1));
await browser.close();
