/**
 * Varredura das 180 páginas no navegador (modo estudo, modo apresentação e celular):
 * registra erros de console, falhas de carregamento do visual legado, altura, sobreposição de controles
 * e captura telas para o relatório visual. Uso: node scripts/content/sweep.mjs [--shots]
 * Saída: content/generated/sweep.json e content/generated/shots/*.png (se --shots)
 */
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(new URL(".", import.meta.url).pathname, "../..");
const OUT = path.join(ROOT, "content/generated");
const SHOTS = path.join(OUT, "shots");
const B = process.env.APP_URL ?? "http://localhost:3000";
const doShots = process.argv.includes("--shots");
if (doShots) fs.mkdirSync(SHOTS, { recursive: true });
const inv = JSON.parse(fs.readFileSync(path.join(OUT, "inventory.json"), "utf8"));
const only = process.env.SWEEP_ONLY ? process.env.SWEEP_ONLY.split(",") : null;
const slugs = inv.pages.map((p) => p.slug).filter((s) => !only || only.includes(s));
const modes = process.env.SWEEP_MODES ? process.env.SWEEP_MODES.split(",") : ["desktop", "mobile", "projecao"];

const exe = "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";
const browser = await chromium.launch(fs.existsSync(exe) ? { executablePath: exe } : {});
async function login(ctx, email, pw) {
  const page = await ctx.newPage();
  await page.goto(`${B}/entrar`); await page.fill("input[name=email]", email); await page.fill("input[name=password]", pw); await page.click("button[type=submit]");
  await page.waitForURL((u) => !u.toString().includes("/entrar"), { timeout: 30000 });
  await page.close();
}
const results = [];
for (const [name, viewport, mode] of [["desktop", { width: 1366, height: 850 }, "estudo"], ["mobile", { width: 390, height: 844 }, "estudo"], ["projecao", { width: 1920, height: 1080 }, "apresentacao"]].filter((m) => modes.includes(m[0]))) {
  const ctx = await browser.newContext({ viewport, isMobile: name === "mobile", hasTouch: name === "mobile" });
  await login(ctx, "aluno.a@example.test", "aluno-a-dev-2026");
  const page = await ctx.newPage();
  let errors = [];
  page.on("pageerror", (e) => errors.push("pageerror: " + e.message));
  page.on("console", (m) => { if (m.type() === "error" && !/favicon|icon\.svg/.test(m.text())) errors.push("console: " + m.text().slice(0, 200)); });
  for (const slug of slugs) {
    errors = [];
    const url = mode === "estudo" ? `${B}/aulas/${slug}` : `${B}/apresentacao/${slug}`;
    const t0 = Date.now();
    try {
      await page.goto(url, { waitUntil: "load", timeout: 60000 });
      if (mode === "apresentacao") { await page.waitForTimeout(1200); await page.keyboard.press("ArrowRight"); await page.waitForTimeout(150); await page.keyboard.press("ArrowRight"); }
      await page.waitForTimeout(1500);
      const info = await page.evaluate(() => {
        const frames = [...document.querySelectorAll("iframe")];
        const overflow = document.documentElement.scrollWidth > document.documentElement.clientWidth + 2;
        const h1 = document.querySelector("h1, h2")?.textContent?.trim() ?? "";
        const katex = document.querySelectorAll(".katex").length;
        const rawTex = /\\\(|\\\[/.test(document.body.innerText) ? 1 : 0;
        const legacyH = frames.map((f) => f.getBoundingClientRect().height);
        return { frames: frames.length, overflow, h1, katex, rawTex, legacyH, height: document.documentElement.scrollHeight };
      });
      // iframe carregou?
      let legacyReady = null;
      if (info.frames) {
        const fr = page.frames().find((f) => f.url().includes("/legado/"));
        legacyReady = fr ? await fr.evaluate(() => Boolean(document.getElementById("corpo") && document.getElementById("corpo").children.length)).catch(() => false) : false;
      }
      results.push({ slug, mode: name, ms: Date.now() - t0, errors, ...info, legacyReady });
      if (doShots && (name !== "projecao" || slugs.indexOf(slug) % 3 === 0)) await page.screenshot({ path: `${SHOTS}/${name}_${slug}.png`, fullPage: name !== "projecao" });
    } catch (e) {
      results.push({ slug, mode: name, ms: Date.now() - t0, errors: [...errors, "nav: " + e.message.slice(0, 120)] });
    }
    process.stdout.write(`\r${name} ${slug}          `);
  }
  await ctx.close();
}
console.log();
if (only || process.env.SWEEP_MODES) { const prev = fs.existsSync(path.join(OUT, "sweep.json")) ? JSON.parse(fs.readFileSync(path.join(OUT, "sweep.json"), "utf8")) : []; const merged = prev.filter((r) => !results.some((n) => n.slug === r.slug && n.mode === r.mode)).concat(results); fs.writeFileSync(path.join(OUT, "sweep.json"), JSON.stringify(merged, null, 1)); } else fs.writeFileSync(path.join(OUT, "sweep.json"), JSON.stringify(results, null, 1));
const bad = results.filter((r) => r.errors.length || r.overflow || r.rawTex || (r.frames && r.legacyReady === false));
console.log(`páginas×modos: ${results.length}; com problemas: ${bad.length}`);
for (const b of bad.slice(0, 40)) console.log(b.mode, b.slug, b.errors.slice(0, 2).join(" | "), b.overflow ? "OVERFLOW-X" : "", b.rawTex ? "TEX-CRU" : "", b.frames && b.legacyReady === false ? "LEGADO-NAO-CARREGOU" : "");
await browser.close();
