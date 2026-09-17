import { chromium } from "playwright"; import fs from "node:fs";
const S = process.env.APOSTILA_DIR ?? "tmp/apostila";
const slugs = JSON.parse(fs.readFileSync("content/generated/extract.json", "utf8")).pages.filter((p) => p.interactive).map((p) => p.id);
const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" });
const ctx = await browser.newContext({ viewport: { width: 1000, height: 700 }, deviceScaleFactor: 2 }); const page = await ctx.newPage();
await page.goto("http://localhost:3000/entrar"); await page.fill("input[name=email]", "aluno.a@example.test"); await page.fill("input[name=password]", "aluno-a-dev-2026"); await page.click("button[type=submit]"); await page.waitForURL((u) => !u.toString().includes("/entrar"));
const meta = {};
for (const slug of slugs) {
  try {
    await page.goto("http://localhost:3000/legado/" + slug); await page.waitForLoadState("networkidle"); await page.addStyleTag({ content: ".so-estudo, button.botao, .linhabotoes { display: none !important; }" }); await page.waitForTimeout(900);
    const box = await page.evaluate(() => { const pal = document.getElementById("palco"); const r = pal.getBoundingClientRect(); let bottom = r.top; pal.querySelectorAll("*").forEach((e) => { const b = e.getBoundingClientRect(); if (b.height > 0 && b.bottom > bottom && b.bottom < 4000) bottom = b.bottom; }); return { x: 0, y: Math.max(0, r.top - 4), w: 1000, h: Math.max(120, Math.ceil(bottom - r.top + 12)) }; });
    await page.setViewportSize({ width: 1000, height: Math.min(4000, Math.ceil(box.y + box.h + 20)) }); await page.waitForTimeout(200);
    await page.screenshot({ path: `${S}/fig/${slug}.png`, clip: { x: 0, y: box.y, width: 1000, height: box.h } });
    meta[slug] = { w: 1000, h: box.h }; console.log(slug, box.h);
  } catch (e) { console.log("FALHA", slug, e.message.split("\n")[0]); }
}
fs.writeFileSync(S + "/fig/_meta.json", JSON.stringify(meta, null, 1));
await browser.close(); console.log("capturas:", Object.keys(meta).length);
