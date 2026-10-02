// Varredura visual do capítulo 7: cortes, saídas do quadro, rolagem horizontal, menor fonte e erros de console por slide.
import { chromium } from "@playwright/test";
import fs from "node:fs";
// uso: node tmp/varredura7.mjs pasta "1920x1080:palco,1366x768:palco,390x844:palco,1366x768:estudo,390x844:estudo" [slugs]
const [, , pasta = "tmp/shots/var", modosArg = "1920x1080:palco", slugsArg] = process.argv;
const roteiro = fs.readFileSync("src/lib/capitulo7/roteiro.ts", "utf8");
const SLUGS = slugsArg ? slugsArg.split(",") : [...roteiro.matchAll(/slug: "(c7p\d+)", n: (\d+)/g)].sort((a, b) => +a[2] - +b[2]).map((m) => m[1]);
fs.mkdirSync(pasta, { recursive: true });
const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" });
const relatorio = [];
for (const m of modosArg.split(",")) {
  const [wh, modo0] = m.split(":"); const abrir = modo0.endsWith("+abrir"); const modo = modo0.replace("+abrir", ""); const [W, H] = wh.split("x").map(Number);
  const ctx = await browser.newContext({ viewport: { width: W, height: H } });
  await ctx.request.post(`http://localhost:3000/api/auth/login`, { data: { email: "genaro.lins@gmail.com", password: "professor-dev-2026" }, headers: { "x-requested-with": "fetch" } });
  const page = await ctx.newPage();
  for (const [i, slug] of SLUGS.entries()) {
    const errs = []; const onErr = (e) => errs.push(String(e)); const onCon = (c) => { if (c.type() === "error") errs.push(c.text()); };
    page.on("pageerror", onErr); page.on("console", onCon);
    await page.goto(`http://localhost:3000/${modo === "palco" ? "apresentacao" : "aulas"}/${slug}`, { waitUntil: "networkidle" });
    await page.waitForTimeout(700);
    if (abrir) { await page.evaluate(() => document.querySelectorAll("figure.q7 details").forEach((d) => (d.open = true))); await page.waitForTimeout(250); }
    const r = await page.evaluate(() => {
      const f = document.querySelector("figure.q7"); if (!f) return { semQuadro: true };
      const slide = f.querySelector(".q7-slide").getBoundingClientRect();
      const oculto = (el) => !!(el.closest(".q7-sr, .katex-mathml") || (el.closest("details:not([open])") && !el.closest("summary")));
      const cortes = [];
      for (const p of f.querySelectorAll(".q7-painel, .q7-corpo, .q7-rod")) {
        const pr = p.getBoundingClientRect();
        for (const el of p.querySelectorAll("*")) {
          const r = el.getBoundingClientRect(); if (!r.width || !r.height) continue;
          if (getComputedStyle(el).visibility === "hidden" || oculto(el)) continue;
          if (r.bottom > pr.bottom + 2 || r.right > pr.right + 2 || r.top < pr.top - 2) { cortes.push(`${el.tagName.toLowerCase()}.${String(el.className?.baseVal ?? el.className).slice(0, 30)} em ${String(p.className).slice(0, 20)} (+${Math.round(Math.max(r.bottom - pr.bottom, r.right - pr.right))}px)`); break; }
        }
      }
      const fora = [...f.querySelectorAll(".q7-slide > *")].filter((c) => { const r = c.getBoundingClientRect(); return r.bottom > slide.bottom + 2 || r.right > slide.right + 2; }).map((c) => c.className);
      const fontes = [...f.querySelectorAll("p, li, dd, td, th, button, span, text, h2, h3, label, summary")].filter((e) => e.textContent.trim() && e.getBoundingClientRect().width && !oculto(e)).map((e) => parseFloat(getComputedStyle(e).fontSize));
      const rolaX = document.scrollingElement.scrollWidth > window.innerWidth + 1;
      return { cortes: cortes.slice(0, 4), fora, menorFonte: Math.min(...fontes), alturaSlide: Math.round(slide.height), rolaX };
    });
    page.off("pageerror", onErr); page.off("console", onCon);
    const arq = `${pasta}/${String(i + 1).padStart(2, "0")}-${slug}-${wh}-${modo0}.png`;
    await page.screenshot({ path: arq, fullPage: modo !== "palco" });
    relatorio.push({ slug, n: i + 1, modo, wh, ...r, erros: errs.slice(0, 3) });
    const alerta = (r.cortes?.length || r.fora?.length || r.rolaX || errs.length) ? "  <<" : "";
    console.log(`${String(i + 1).padStart(2)} ${slug.padEnd(6)} ${wh}:${modo} fonte≥${r.menorFonte}px corte=${r.cortes?.length ?? "?"} fora=${r.fora?.length ?? "?"} rolaX=${r.rolaX} erros=${errs.length}${alerta}`);
    if (alerta) console.log("     ", JSON.stringify({ cortes: r.cortes, fora: r.fora, erros: errs }));
  }
  await ctx.close();
}
fs.writeFileSync(`${pasta}/relatorio.json`, JSON.stringify(relatorio, null, 1));
await browser.close();
