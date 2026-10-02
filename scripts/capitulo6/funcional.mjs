// Verificações funcionais do capítulo 6 no servidor local (npm run dev, base semeada). Uso: node scripts/capitulo6/funcional.mjs
// As mesmas seis do capítulo 7 (scripts/capitulo7/funcional.mjs): teclado nos controles, foco visível, reinício ao
// voltar, links do mapa no mesmo modo, previsão sem resposta antes da tentativa e movimento reduzido.
import { chromium } from "@playwright/test";
const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" });
const ok = (c, m) => console.log(c ? "OK  " : "FALHA", m);
const nova = async (opts = {}) => { const ctx = await browser.newContext({ viewport: { width: 1920, height: 1080 }, ...opts }); await ctx.request.post(`http://localhost:3000/api/auth/login`, { data: { email: "genaro.lins@gmail.com", password: "professor-dev-2026" }, headers: { "x-requested-with": "fetch" } }); return ctx.newPage(); };
const ir = async (page, url) => { for (let t = 1; ; t++) { try { await page.goto(url, { waitUntil: "networkidle" }); break; } catch (e) { if (t >= 3) throw e; await page.waitForTimeout(3000); } } await page.waitForTimeout(1500); };
let page = await nova();
// 1. setas num controle não trocam de slide (c6p11: número de árvores)
await ir(page, "http://localhost:3000/apresentacao/c6p11");
const r = page.locator(".q7 input[type=range]").first(); await r.focus(); const v0 = await r.inputValue();
// o controle abre no máximo (300 árvores): seta para a esquerda
await page.keyboard.press("ArrowLeft"); await page.keyboard.press("ArrowLeft"); await page.waitForTimeout(300);
ok(page.url().endsWith("/c6p11"), "setas no controle não trocam de slide"); ok((await r.inputValue()) !== v0, "setas mudam o valor do controle");
// 2. foco visível e Tab chega a um botão
let foco = null;
for (let k = 0; k < 8 && !(foco && foco.tag === "BUTTON"); k++) { await page.keyboard.press("Tab"); foco = await page.evaluate(() => { const e = document.activeElement; const cs = getComputedStyle(e); return { tag: e.tagName, txt: e.textContent?.trim().slice(0, 30), outline: cs.outlineStyle + " " + cs.outlineWidth, dentro: !!e.closest(".q7") }; }); }
ok(foco.tag === "BUTTON" && foco.dentro && !/none/.test(foco.outline), `Tab leva a botão do quadro com foco visível (${foco.txt}; ${foco.outline})`);
// 3. estado reinicia ao voltar
await ir(page, "http://localhost:3000/apresentacao/c6p12"); await page.goBack({ waitUntil: "networkidle" }); await page.waitForTimeout(1200);
ok((await page.locator(".q7 input[type=range]").first().inputValue()) === v0, "ao voltar, o quadro reabre no estado inicial");
// 4. links do mapa no mesmo modo
await ir(page, "http://localhost:3000/apresentacao/c6p1");
const link = page.locator(".q7 a[href*='/apresentacao/c6p']").first(); const alvo = await link.getAttribute("href");
await link.click(); await page.waitForURL((u) => u.pathname === alvo, { timeout: 15000 }).catch(() => {});
ok(new URL(page.url()).pathname === alvo, `link do mapa abre o slide no palco (${alvo})`);
// 5. previsão: retorno oculto antes da tentativa; erro oferece nova tentativa; acerto encerra (c6p8, modo estudo)
await ir(page, "http://localhost:3000/aulas/c6p8");
const q = page.locator(".q7"); const ops = q.locator(".q7-prev-op"); const n = await ops.count();
ok(n >= 2 && (await q.locator(".q7-prev-op[data-estado='certa'], .q7-prev-op[data-estado='errada']").count()) === 0, "retorno da previsão oculto antes da tentativa");
let errou = false, acertou = false;
for (let i = 0; i < n && !acertou; i++) {
  await ops.nth(i).click(); await page.waitForTimeout(250);
  const estado = await q.locator(".q7-prev-op[aria-pressed='true']").getAttribute("data-estado");
  const tentar = q.getByRole("button", { name: "Tentar outra" });
  if (estado === "certa") acertou = true;
  else if (await tentar.count()) { errou = true; await tentar.click(); await page.waitForTimeout(200); }
}
ok(errou, "alternativa errada oferece nova tentativa"); ok(acertou, "acerto encerra a previsão");
// 6. movimento reduzido: transições zeradas
const p2 = await nova({ reducedMotion: "reduce" });
await ir(p2, "http://localhost:3000/apresentacao/c6p8");
const trans = await p2.evaluate(() => getComputedStyle(document.querySelector(".q7-prev-op") ?? document.body).transitionDuration);
ok(/^0s/.test(trans), `com movimento reduzido, transições zeradas (${trans})`);
await browser.close();
