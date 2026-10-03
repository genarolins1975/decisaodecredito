// Capturas de quadros do capítulo 12 no palco. Uso: node scripts/capitulo12/capturas.mjs pasta c12p1,c12p2 [1920x1080] [palco|estudo]
import { chromium } from "@playwright/test";
import fs from "node:fs";
const [, , pasta = "tmp/shots/c12", slugsArg, wh = "1920x1080", modo = "palco"] = process.argv;
const [W, H] = wh.split("x").map(Number);
fs.mkdirSync(pasta, { recursive: true });
const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" });
const ctx = await browser.newContext({ viewport: { width: W, height: H } });
await ctx.request.post("http://localhost:3000/api/auth/login", { data: { email: "genaro.lins@gmail.com", password: "professor-dev-2026" }, headers: { "x-requested-with": "fetch" } });
const page = await ctx.newPage();
const erros = [];
page.on("pageerror", (e) => erros.push(String(e))); page.on("console", (c) => { if (c.type() === "error") erros.push(c.text()); });
for (const slug of slugsArg.split(",")) {
  for (let t = 1; ; t++) { try { await page.goto(`http://localhost:3000/${modo === "palco" ? "apresentacao" : "aulas"}/${slug}`, { waitUntil: "networkidle", timeout: 120000 }); break; } catch (e) { if (t >= 3) throw e; await page.waitForTimeout(3000); } }
  await page.waitForTimeout(1500);
  const alvo = modo === "palco" ? page : (await page.$("figure.q7")) ?? page;
  await alvo.screenshot({ path: `${pasta}/${slug}-${wh}-${modo}.png`, fullPage: modo !== "palco" && alvo === page });
}
console.log(erros.length ? `erros: ${erros.slice(0, 5).join(" | ")}` : "sem erros de console");
await browser.close();
