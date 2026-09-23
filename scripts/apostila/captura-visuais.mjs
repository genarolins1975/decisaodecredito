/**
 * Captura os visuais nativos das páginas para a apostila: para cada página, a primeira peça `figure.vz` (visual nativo)
 * ou, quando a página não tem peça nativa, o corpo do conteúdo. PNG em 2x, largura 1000, em APOSTILA_DIR/fig/<slug>.png,
 * com _meta.json (largura, altura e tipo). Peça com mais de um quadro (section.rl-slide) ganha também uma captura por quadro,
 * <slug>-1.png, <slug>-2.png..., para o guia imprimir cada um na largura da página em vez de reduzir os dois juntos.
 * Requer a aplicação em http://localhost:3000 e a conta de teste aluno.a@example.test.
 */
import { chromium } from "playwright"; import fs from "node:fs";
const S = process.env.APOSTILA_DIR ?? "tmp/apostila"; fs.mkdirSync(`${S}/fig`, { recursive: true });
const BASE = process.env.APP_URL ?? "http://localhost:3000";
const ex = JSON.parse(fs.readFileSync("content/generated/extract.json", "utf8"));
const arg = process.argv[2]; const slugs = ex.pages.filter((p) => !arg || arg === "todos" || arg.split(",").map(Number).includes(p.cap)).map((p) => p.id);
const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" });
const ctx = await browser.newContext({ viewport: { width: 1000, height: 900 }, deviceScaleFactor: 2 });
await ctx.request.post(`${BASE}/api/auth/login`, { data: { email: "aluno.a@example.test", password: "aluno-a-dev-2026" }, headers: { "x-requested-with": "fetch" } });
const page = await ctx.newPage();
const meta = fs.existsSync(`${S}/fig/_meta.json`) ? JSON.parse(fs.readFileSync(`${S}/fig/_meta.json`, "utf8")) : {};
for (const slug of slugs) {
  try {
    await page.goto(`${BASE}/aulas/${slug}`, { waitUntil: "networkidle" });
    /* some a moldura da plataforma (cabeçalho, navegação, barras laterais), nunca o painel lateral de uma peça nativa:
       cinco peças do capítulo 4 usam <aside> para os controles, e um "aside" solto aqui os apagava da captura */
    await page.addStyleTag({ content: "nextjs-portal, body > header, header.sticky, aside:not(.vz aside), nav, .no-print, [data-testid=abertura-capitulo], section[data-questao], .vz-fonte { display: none !important } article { max-width: 1000px } .vz { box-shadow: none !important }" });
    await page.waitForTimeout(500);
    const vz = page.locator("figure.vz").first();
    let alvo, tipo;
    if (await vz.count()) { alvo = vz; tipo = "nativo"; } else { alvo = page.locator("article .mt-6").first(); tipo = "conteudo"; }
    await alvo.scrollIntoViewIfNeeded(); await page.waitForTimeout(250);
    const box = await alvo.boundingBox(); if (!box) throw new Error("sem caixa");
    await alvo.screenshot({ path: `${S}/fig/${slug}.png` });
    meta[slug] = { w: Math.round(box.width), h: Math.round(box.height), tipo };
    const quadros = tipo === "nativo" ? vz.locator("section.rl-slide") : null;
    const nq = quadros ? await quadros.count() : 0;
    if (nq > 1) {
      meta[slug].partes = [];
      for (let k = 0; k < nq; k++) {
        const q = quadros.nth(k); await q.scrollIntoViewIfNeeded(); const bq = await q.boundingBox();
        await q.screenshot({ path: `${S}/fig/${slug}-${k + 1}.png` }); meta[slug].partes.push({ w: Math.round(bq.width), h: Math.round(bq.height) });
      }
    }
    console.log(slug, tipo, Math.round(box.height), nq > 1 ? `${nq} quadros` : "");
  } catch (e) { console.log("FALHA", slug, e.message.split("\n")[0]); }
}
fs.writeFileSync(`${S}/fig/_meta.json`, JSON.stringify(meta, null, 1));
await browser.close(); console.log("capturas:", Object.keys(meta).length);
