// Verificações funcionais do capítulo 7 no servidor local (npm run dev, base semeada). Uso: node scripts/capitulo7/funcional.mjs
import { chromium } from "@playwright/test";
const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" });
const ok = (c, m) => console.log(c ? "OK  " : "FALHA", m);
const nova = async (opts = {}) => { const ctx = await browser.newContext({ viewport: { width: 1920, height: 1080 }, ...opts }); await ctx.request.post(`http://localhost:3000/api/auth/login`, { data: { email: "genaro.lins@gmail.com", password: "professor-dev-2026" }, headers: { "x-requested-with": "fetch" } }); return ctx.newPage(); };
let page = await nova();
// 1. setas num controle não trocam de slide
await page.goto("http://localhost:3000/apresentacao/c7p7", { waitUntil: "networkidle" }); await page.waitForTimeout(500);
const r = page.locator(".q7 input[type=range]").first(); await r.focus(); const v0 = await r.inputValue();
await page.keyboard.press("ArrowRight"); await page.keyboard.press("ArrowRight"); await page.waitForTimeout(300);
ok(page.url().endsWith("/c7p7"), "setas no controle não trocam de slide"); ok((await r.inputValue()) !== v0, "setas mudam o valor do controle");
// 2. foco visível e Tab chega aos botões
await page.keyboard.press("Tab"); const foco = await page.evaluate(() => { const e = document.activeElement; const cs = getComputedStyle(e); return { tag: e.tagName, txt: e.textContent?.trim().slice(0, 30), outline: cs.outlineStyle + " " + cs.outlineWidth }; });
ok(foco.tag === "BUTTON" && !/none/.test(foco.outline), `Tab leva a botão com foco visível (${foco.txt}; ${foco.outline})`);
// 3. estado reinicia ao voltar
await page.locator(".q7").getByRole("button", { name: "Ir ao máximo" }).click(); await page.waitForTimeout(200);
await page.goto("http://localhost:3000/apresentacao/c7p8", { waitUntil: "networkidle" }); await page.goBack({ waitUntil: "networkidle" }); await page.waitForTimeout(500);
ok((await page.locator(".q7-conclusao").innerText()).includes("No corte de 15,0%"), "ao voltar, o quadro reabre no estado inicial");
// 4. links do mapa no mesmo modo
await page.goto("http://localhost:3000/apresentacao/c7p1", { waitUntil: "networkidle" });
await page.locator(".q7").getByRole("link", { name: /Slide 9:/ }).click(); await page.waitForURL(/\/apresentacao\/c7p6$/, { timeout: 15000 }).catch(() => {});
ok(page.url().endsWith("/apresentacao/c7p6"), `link do mapa abre o slide no palco (${page.url()})`);
// 5. previsão: sem resposta antes da tentativa, nova tentativa limpa
await page.goto("http://localhost:3000/aulas/c7p13", { waitUntil: "networkidle" }); await page.waitForTimeout(400);
const q = page.locator(".q7");
ok(!(await q.innerText()).includes("Isso: com b > 0"), "retorno da previsão oculto antes da tentativa");
await q.getByRole("button", { name: /Sobe, porque/ }).click(); await page.waitForTimeout(200);
ok((await q.innerText()).includes("Confunde calibração com ordenação"), "alternativa errada nomeia a confusão");
ok((await q.getByRole("button", { name: "Tentar outra" }).count()) === 1, "erro oferece nova tentativa"); await q.getByRole("button", { name: "Tentar outra" }).click(); await q.getByRole("button", { name: "Fica igual" }).click(); await page.waitForTimeout(200); ok((await q.innerText()).includes("Platt do curso"), "acerto abre a comparação");
// 6. movimento reduzido
const p2 = await nova({ reducedMotion: "reduce" });
await p2.goto("http://localhost:3000/apresentacao/c7p6", { waitUntil: "networkidle" }); await p2.waitForTimeout(400);
ok((await p2.locator(".q7").getByRole("button", { name: "Reproduzir" }).count()) === 0, "com movimento reduzido, sem reprodução automática");
const trans = await p2.evaluate(() => getComputedStyle(document.querySelector(".q7-ficha, .q7-mx-c") ?? document.body).transitionDuration);
ok(/^0s/.test(trans), `com movimento reduzido, transições zeradas (${trans})`);
await browser.close();
