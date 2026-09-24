/* Rótulos dos gráficos em SVG das páginas da Aula 2: dois rótulos que se sobrepõem e rótulo que passa da borda do
   desenho. O SVG corta o que sai da própria caixa (overflow hidden), então um "100%" centrado na ponta do eixo perde o
   % sem que a varredura de caixas (varre.mjs) perceba: o texto continua dentro da figura. Mede o estado inicial de
   cada página; a caixa de cada rótulo é a desenhada, sem 20% de cima e 10% de baixo (o respiro da fonte), para dois
   rótulos empilhados no mesmo eixo não contarem como sobreposição.

   Uso: node qa-plataforma/rotulos-svg.mjs [--largura WxH] [--rota aulas|apresentacao] [slug...]
   Sai com código 1 se achar algum rótulo sobreposto ou cortado. */
import { chromium } from "playwright";

const BASE = process.env.APP_URL ?? "http://localhost:3000";
const CHROMIUM = process.env.CHROMIUM_PATH ?? "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";
const PROF = { email: "genaro.lins@gmail.com", password: "professor-dev-2026" };
const TODOS = [
  ...Array.from({ length: 22 }, (_, i) => `c4p${i + 1}`),
  ...Array.from({ length: 19 }, (_, i) => `c5p${i + 1}`),
  ...Array.from({ length: 20 }, (_, i) => `c6p${i + 1}`),
];

const args = process.argv.slice(2);
const iL = args.indexOf("--largura");
const [LARG, ALT] = (iL >= 0 ? args[iL + 1] : "1366x768").split("x").map(Number);
const iR = args.indexOf("--rota");
const ROTA = iR >= 0 ? args[iR + 1] : "aulas";
const alvos = args.filter((a) => /^c\d+p\d+$/.test(a));
const slugs = alvos.length ? alvos : TODOS;

const medir = () => {
  const out = [];
  for (const svg of new Set(document.querySelectorAll("main svg, .slide-inner svg, figure svg"))) {
    const cs = svg.getBoundingClientRect();
    if (cs.width < 60 || cs.height < 40) continue; // ícones
    const ts = [...svg.querySelectorAll("text")].map((t) => {
      const b = t.getBoundingClientRect(), s = getComputedStyle(t);
      return { n: t.textContent.trim(), x0: b.left + 0.5, x1: b.right - 0.5, y0: b.top + b.height * 0.2, y1: b.bottom - b.height * 0.1, vis: s.visibility !== "hidden" && s.display !== "none" && b.width > 0 };
    }).filter((t) => t.vis && t.n);
    for (let i = 0; i < ts.length; i++) for (let j = i + 1; j < ts.length; j++) {
      const a = ts[i], b = ts[j];
      if (a.x0 < b.x1 && b.x0 < a.x1 && a.y0 < b.y1 && b.y0 < a.y1) out.push(`«${a.n}» sobre «${b.n}»`);
    }
    for (const t of ts) if (t.x0 < cs.left - 1 || t.x1 > cs.right + 1 || t.y0 < cs.top - 1 || t.y1 > cs.bottom + 1) out.push(`«${t.n}» cortado na borda do desenho`);
  }
  return [...new Set(out)];
};

const nav = await chromium.launch({ executablePath: CHROMIUM });
const p = await (await nav.newContext({ viewport: { width: LARG, height: ALT } })).newPage();
await p.goto(`${BASE}/entrar`);
await p.fill("input[name=email]", PROF.email); await p.fill("input[name=password]", PROF.password);
await p.click("button[type=submit]"); await p.waitForURL((u) => !u.toString().includes("/entrar"));
let comDefeito = 0;
for (const slug of slugs) {
  await p.goto(`${BASE}/${ROTA}/${slug}`, { waitUntil: "networkidle" });
  await p.waitForTimeout(250);
  const r = await p.evaluate(medir);
  if (r.length) { comDefeito++; console.log(`${slug}: ${r.join(" | ")}`); }
}
console.log(`${slugs.length - comDefeito}/${slugs.length} páginas sem rótulo sobreposto ou cortado em ${ROTA} ${LARG}x${ALT}`);
await nav.close();
process.exit(comDefeito ? 1 : 0);
