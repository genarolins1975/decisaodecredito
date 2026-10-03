// Verificações funcionais do capítulo 12 no servidor local (npm run dev, base semeada). Uso: node scripts/capitulo12/funcional.mjs
// Teclado, foco, reinício ao voltar, links no mesmo modo, previsão antes de revelar e movimento reduzido.
import { chromium } from "@playwright/test";
const B = "http://localhost:3000";
const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" });
const ok = (c, m) => console.log(c ? "OK  " : "FALHA", m);
const nova = async (opts = {}) => { const ctx = await browser.newContext({ viewport: { width: 1920, height: 1080 }, ...opts }); await ctx.request.post(`${B}/api/auth/login`, { data: { email: "genaro.lins@gmail.com", password: "professor-dev-2026" }, headers: { "x-requested-with": "fetch" } }); return ctx.newPage(); };
const ir = async (p, u) => { await p.goto(B + u, { waitUntil: "networkidle", timeout: 120000 }); await p.waitForTimeout(800); };
const page = await nova();

// 1. setas num controle não trocam de slide e mudam o valor
await ir(page, "/apresentacao/c12p18");
const r = page.locator(".q7 input[type=range]").first(); await r.focus(); const v0 = await r.inputValue();
await page.keyboard.press("ArrowRight"); await page.keyboard.press("ArrowRight"); await page.waitForTimeout(300);
ok(page.url().endsWith("/c12p18"), "setas no controle não trocam de slide");
ok((await r.inputValue()) !== v0, "setas mudam o valor do controle");
const leituraMexida = await page.locator(".q7-conclusao").innerText();
// 2. Tab chega a um elemento com foco visível
await page.keyboard.press("Tab");
const foco = await page.evaluate(() => { const e = document.activeElement; const cs = getComputedStyle(e); return { tag: e.tagName, outline: `${cs.outlineStyle} ${cs.outlineWidth}` }; });
ok(/BUTTON|A|INPUT/.test(foco.tag) && !/none/.test(foco.outline), `Tab leva a controle com foco visível (${foco.tag}; ${foco.outline})`);
// 3. o quadro reinicia ao voltar ao slide
await ir(page, "/apresentacao/c12p19"); await page.goBack({ waitUntil: "networkidle" }); await page.waitForTimeout(800);
const leituraVolta = await page.locator(".q7-conclusao").innerText();
ok(leituraVolta !== leituraMexida && /limiar 0|slide 11/.test(leituraVolta), "ao voltar, o quadro reabre no estado inicial");
// 4. links da abertura de bloco abrem o slide no mesmo modo
await ir(page, "/apresentacao/c12p2");
await page.locator(".q7").getByRole("link", { name: /Dados, slide 4/ }).click(); await page.waitForURL(/\/apresentacao\/c12p4$/, { timeout: 20000 }).catch(() => {});
ok(page.url().endsWith("/apresentacao/c12p4"), `link do fluxo do bloco abre o slide no palco (${page.url()})`);
// 5. previsão: resultado oculto antes da tentativa; erro nomeia a confusão e oferece nova tentativa; acerto revela
await ir(page, "/aulas/c12p10");
const q = page.locator(".q7");
ok(!(await q.innerText()).includes("54.579"), "acurácia do modelo trivial oculta antes da tentativa");
await q.getByRole("button", { name: /^B\s*50%/ }).click(); await page.waitForTimeout(200);
ok((await q.innerText()).includes("sorteio"), "alternativa errada nomeia a confusão");
ok((await q.getByRole("button", { name: "Tentar outra" }).count()) === 1, "erro oferece nova tentativa");
await q.getByRole("button", { name: "Tentar outra" }).click(); await q.getByRole("button", { name: /^C\s*91,0%/ }).click(); await page.waitForTimeout(300);
ok((await q.innerText()).includes("54.579"), "acerto revela os acertos do modelo trivial");
// 6. movimento reduzido: transições zeradas
const p2 = await nova({ reducedMotion: "reduce" });
await ir(p2, "/apresentacao/c12p11");
const trans = await p2.evaluate(() => getComputedStyle(document.querySelector(".q12-mx-c") ?? document.body).transitionDuration);
ok(/^0s/.test(trans), `com movimento reduzido, transições zeradas (${trans})`);
await browser.close();
