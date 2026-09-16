/**
 * Verificação de acessibilidade com axe-core (regras WCAG 2.x A/AA) em telas representativas,
 * como aluno e como professor. Saída: content/generated/a11y.json e resumo no console.
 */
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";
const ROOT = path.resolve(new URL(".", import.meta.url).pathname, "../..");
const B = process.env.APP_URL ?? "http://localhost:3000";
const axe = fs.readFileSync(path.join(ROOT, "node_modules/axe-core/axe.min.js"), "utf8");
const exe = "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";
const browser = await chromium.launch(fs.existsSync(exe) ? { executablePath: exe } : {});
async function login(page, email, pw) { await page.goto(`${B}/entrar`); await page.fill("input[name=email]", email); await page.fill("input[name=password]", pw); await page.click("button[type=submit]"); await page.waitForURL((u) => !u.toString().includes("/entrar")); }
const ids = JSON.parse(fs.readFileSync(path.join(ROOT, "content/generated/ids.json"), "utf8"));
const plans = [
  { who: "aluno", creds: ["aluno.a@example.test", "aluno-a-dev-2026"], urls: ["/entrar", "/inicio", "/aulas", "/aulas/c3p7", "/aulas/c1p1", "/aulas/c8p7", "/apresentacao/c3p7", "/ao-vivo", `/ao-vivo/${ids.sid}`, "/trabalhos", `/trabalhos/${ids.aid}`, "/materiais", "/acompanhamento", "/perfil", "/ajuda"] },
  { who: "prof", creds: ["genaro.lins@gmail.com", "professor-dev-2026"], urls: ["/professor", "/professor/turmas", `/professor/turmas/${ids.cid}/alunos`, `/professor/turmas/${ids.cid}/encontros`, `/professor/turmas/${ids.cid}/frequencia`, `/professor/turmas/${ids.cid}/trabalhos/${ids.aid}`, `/professor/turmas/${ids.cid}/grupos`, `/professor/turmas/${ids.cid}/notas`, `/professor/aovivo/${ids.sid}`, "/professor/configuracoes", "/professor/conteudo", `/professor/conteudo/${ids.pid}`] },
];
const out = [];
for (const plan of plans) {
  const ctx = await browser.newContext({ viewport: { width: 1366, height: 900 } });
  const page = await ctx.newPage();
  if (plan.urls[0] !== "/entrar") await login(page, ...plan.creds);
  for (const url of plan.urls) {
    if (url !== "/entrar" && !(await page.url()).includes("/inicio") && plan.who === "aluno" && url === "/inicio") await login(page, ...plan.creds);
    await page.goto(`${B}${url}`, { waitUntil: "load" });
    if (url === "/entrar") { /* pública */ } else if (page.url().includes("/entrar")) { await login(page, ...plan.creds); await page.goto(`${B}${url}`, { waitUntil: "load" }); }
    await page.waitForTimeout(1500);
    await page.addScriptTag({ content: axe });
    const r = await page.evaluate(async () => await window.axe.run(document, { runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa", "best-practice"] } }));
    out.push({ who: plan.who, url, violations: r.violations.map((v) => ({ id: v.id, impact: v.impact, help: v.help, nodes: v.nodes.length, sample: v.nodes[0]?.target?.[0] })), passes: r.passes.length, incomplete: r.incomplete.length });
    console.log(plan.who, url, "violações:", r.violations.length, r.violations.map((v) => `${v.id}(${v.impact},${v.nodes.length})`).join(" "));
  }
  await ctx.close();
}
fs.writeFileSync(path.join(ROOT, "content/generated/a11y.json"), JSON.stringify(out, null, 1));
await browser.close();
