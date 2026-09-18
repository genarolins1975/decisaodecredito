// Auditoria de layout da apresentação: percorre páginas tela a tela e pontua seis critérios de 0 a 10.
// uso: node scripts/palco/auditoria.mjs <saida.json> [slugs ou "todas"] [LxA] [pasta de capturas]
// Exige o servidor local (npm run dev) com a base semeada (npm run seed). Critérios e pesos: docs/06-operacao.md, seção 7.3.
import { chromium } from "@playwright/test";
import { writeFileSync, readFileSync } from "node:fs";
const BASE = "http://localhost:3000";
const OUT = process.argv[2] || "tmp/ux/auditoria-palco.json";
const SLUGS = (process.argv[3] && process.argv[3] !== "todas" ? process.argv[3] : JSON.parse(readFileSync("content/generated/extract.json", "utf8")).pages.map((p) => p.id).join(",")).split(",");
const [W, H] = (process.argv[4] || "1400x900").split("x").map(Number);
const SHOTS = process.argv[5] || "";
const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" });
const ctx = await browser.newContext({ viewport: { width: W, height: H } });
await ctx.request.post(`${BASE}/api/auth/login`, { data: { email: "genaro.lins@gmail.com", password: process.env.SEED_PROFESSOR_PASSWORD ?? "professor-dev-2026" }, headers: { "x-requested-with": "fetch" } });

// ---- critérios (0 a 10) -------------------------------------------------------------------------------
const faixa = (v, degraus) => { for (const [lim, nota] of degraus) if (v >= lim) return nota; return degraus[degraus.length - 1][1]; };
export function pontuar(m) {
  const ajuste = m.rola ? 0 : m.cortado > 0.02 ? 4 : m.cortado > 0 ? 7 : 10;
  const ocupacao = faixa(m.ocupacao, [[0.66, 10], [0.55, 9], [0.45, 7], [0.35, 5], [0.25, 3], [0, 1]]);
  let legibilidade = faixa(m.fonteMin, [[1.9, 10], [1.7, 9], [1.5, 7], [1.3, 5], [1.1, 3], [0, 1]]);
  if (m.linhaMax > 115) legibilidade -= 2; else if (m.linhaMax > 95) legibilidade -= 1;
  const densidade = faixa(-m.palavras, [[-100, 10], [-140, 9], [-180, 7], [-230, 5], [-300, 3], [-1e9, 1]]);
  let estrutura = 10; if (m.orfao) estrutura -= 4; if (m.viuva) estrutura -= 3; if (m.legendaSolta) estrutura -= 3;
  const foco = faixa(-m.unidades, [[-4, 10], [-6, 8], [-8, 6], [-1e9, 4]]);
  const notas = { ajuste, ocupacao, legibilidade: Math.max(0, legibilidade), densidade, estrutura: Math.max(0, estrutura), foco };
  const pesos = { ajuste: .25, ocupacao: .2, legibilidade: .2, densidade: .15, estrutura: .1, foco: .1 };
  const total = Object.entries(pesos).reduce((s, [k, w]) => s + notas[k] * w, 0);
  return { ...notas, total: Math.round(total * 10) / 10 };
}

const MEDIR = () => {
  const area = document.querySelector(".slide-area"); const tela = document.querySelector(".palco-tela"); const slide = document.querySelector(".slide");
  if (!area || !tela) return null;
  const zoom = Number(tela.dataset.zoom || 1) || 1;
  const ra = area.getBoundingClientRect(); const rs = slide.getBoundingClientRect(); const rt = tela.getBoundingClientRect();
  const vis = (el) => { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0 && !el.closest(".hidden"); };
  // corte horizontal/vertical: maior excesso de qualquer elemento visível para fora da área, em fração da largura
  let cortado = 0, cortadoEl = "";
  for (const el of tela.querySelectorAll("*")) { if (!vis(el) || el.closest("svg") && el.tagName !== "svg" || el.closest(".katex-mathml")) continue; const r = el.getBoundingClientRect(); const c = Math.max((r.right - ra.right - 1) / ra.width, (r.bottom - ra.bottom - 1) / ra.height); if (c > cortado) { cortado = c; cortadoEl = el.tagName.toLowerCase() + (el.className && typeof el.className === "string" ? "." + el.className.split(" ")[0] : ""); } }
  // texto: menor fonte de texto corrido (fora de svg/eyebrow/sup), em % da altura do slide; maior comprimento de linha em parágrafos
  let fonteMin = 99, fonteSvgMin = 99, linhaMax = 0, palavras = 0, fonteMinEl = "";
  const walker = document.createTreeWalker(tela, NodeFilter.SHOW_TEXT);
  const vistos = new Set();
  while (walker.nextNode()) {
    const n = walker.currentNode; const t = n.textContent.replace(/\s+/g, " ").trim(); if (t.length < 3) continue;
    const el = n.parentElement; if (!el || !vis(el)) continue;
    const cs = getComputedStyle(el); if (cs.visibility === "hidden" || cs.display === "none") continue;
    const px = parseFloat(cs.fontSize) * zoom; const pct = (px / rs.height) * 100;
    if (el.closest("svg")) { fonteSvgMin = Math.min(fonteSvgMin, pct); continue; }
    palavras += t.split(" ").length;
    if (el.closest(".eyebrow, sup, sub, .badge, .vz-fonte, .hint, .nota, figcaption, small, .rot, .info-kicker, .info-faixa-k, .info-nome, .selo, .explorar-dados, .vz-grafico-t, .katex, .vz-legenda, .vz-slider-rotulo, th, td, button, .btn, .table")) continue;
    if (pct < fonteMin) { fonteMin = pct; fonteMinEl = el.tagName.toLowerCase() + (el.className ? "." + String(el.className).split(" ")[0] : "") + ":" + t.slice(0, 30); }
    const bloco = el.closest("p, li, dd, dt"); if (bloco && !vistos.has(bloco)) { vistos.add(bloco); const rb = bloco.getBoundingClientRect(); const lh = parseFloat(cs.lineHeight) * zoom || px * 1.4; const linhas = Math.max(1, Math.round(rb.height / lh)); if (linhas > 1) linhaMax = Math.max(linhaMax, bloco.textContent.trim().length / linhas); }
  }
  // unidades visíveis (filhos de topo dos blocos visíveis), órfão e viúva
  const blocos = Array.from(tela.querySelectorAll(":scope > div > [data-bloco], :scope > [data-bloco]")).filter(vis);
  const unidades = []; for (const b of blocos) { const c = b.querySelector(":scope > .conteudo"); if (c) unidades.push(...Array.from(c.children).filter(vis)); else unidades.push(b); }
  const ult = unidades[unidades.length - 1]; const primeiro = unidades[0];
  const ehTitulo = (el) => !!el && /^H[1-6]$/.test(el.tagName) || !!(el && el.classList && el.classList.contains("rot") && el.children.length === 0);
  const totalTelas = (document.body.innerText.match(/tela (\d+) de (\d+)/) || [0, 1, 1]);
  const atual = Number(totalTelas[1]), total = Number(totalTelas[2]);
  const orfao = ehTitulo(ult) && atual < total;
  const viuva = total > 1 && unidades.length === 1 && ult && ult.tagName === "P" && ult.textContent.trim().split(/\s+/).length < 25;
  const legendaSolta = !!(primeiro && (primeiro.tagName === "FIGCAPTION" || (primeiro.tagName === "P" && primeiro.classList.contains("legenda"))));
  const figura = tela.querySelector("svg, iframe, figure, .vz, .info, img, canvas");
  const alturaFig = figura && vis(figura) ? figura.getBoundingClientRect().height / ra.height : 0;
  return { area: Math.round(ra.height), usado: Math.round(rt.height), ocupacao: rt.height / ra.height, rola: area.scrollHeight > area.clientHeight + 2, cortado: Math.max(0, cortado), cortadoEl, zoom, fonteMin: Math.round(fonteMin * 100) / 100, fonteMinEl, fonteSvgMin: Math.round(fonteSvgMin * 100) / 100, linhaMax: Math.round(linhaMax), palavras, unidades: unidades.length, orfao, viuva, legendaSolta, alturaFig: Math.round(alturaFig * 100) / 100, tela: atual, total };
};

const resultado = {};
async function auditar(slug) {
  const page = await ctx.newPage();
  await page.goto(`${BASE}/apresentacao/${slug}`, { waitUntil: "networkidle" }); await page.waitForTimeout(600);
  const total = await page.evaluate(() => { const m = document.body.innerText.match(/tela \d+ de (\d+)/); return m ? Number(m[1]) : 1; });
  const telas = [];
  for (let t = 0; t < total; t++) {
    if (t > 0) { await page.keyboard.press("ArrowRight"); await page.waitForTimeout(250); }
    // espera o ajuste ao palco assentar (zoom estável por 300 ms; no máximo 2 s, ou 5 s quando há iframe herdado carregando)
    await page.evaluate(() => new Promise((ok) => { const el = document.querySelector(".palco-tela"); let z = el?.dataset.zoom, desde = performance.now(), ini = desde; const tick = () => { const agora = performance.now(); if (el?.dataset.zoom !== z) { z = el?.dataset.zoom; desde = agora; } const teto = document.querySelector(".palco-tela iframe") ? 5000 : 2000; if ((z && agora - desde > 300) || agora - ini > teto) ok(); else requestAnimationFrame(tick); }; tick(); }));
    const m = await page.evaluate(MEDIR); if (!m) { telas.push({ erro: "sem tela" }); continue; }
    telas.push({ ...m, notas: pontuar(m) });
    if (SHOTS) await page.screenshot({ path: `${SHOTS}/${slug}-${t + 1}.png` });
  }
  await page.close();
  const validas = telas.filter((x) => x.notas);
  const media = validas.length ? validas.reduce((s, x) => s + x.notas.total, 0) / validas.length : 0;
  const pior = validas.length ? Math.min(...validas.map((x) => x.notas.total)) : 0;
  resultado[slug] = { telas, media: Math.round(media * 10) / 10, pior };
  const crit = ["ajuste", "ocupacao", "legibilidade", "densidade", "estrutura", "foco"];
  console.log(`${slug.padEnd(6)} ${String(media.toFixed(1)).padStart(4)} (pior ${pior.toFixed(1)}) ${telas.map((x) => x.notas ? `[${crit.map((c) => x.notas[c]).join(" ")}|${Math.round(x.ocupacao * 100)}% z${x.zoom.toFixed(2)} f${x.fonteMin} p${x.palavras} u${x.unidades}${x.orfao ? " ORF" : ""}${x.viuva ? " VIU" : ""}${x.rola ? " ROLA" : ""}${x.cortado ? " CORT " + x.cortadoEl : ""}${x.notas.legibilidade < 9 ? " F " + x.fonteMinEl : ""}]` : "[erro]").join(" ")}`);
}
const fila = [...SLUGS]; const N = 3;
await Promise.all(Array.from({ length: N }, async () => { while (fila.length) { const s = fila.shift(); try { await auditar(s); } catch (e) { console.log(`${s} ERRO ${e.message.split("\n")[0]}`); } } }));
const ordenado = Object.fromEntries(SLUGS.filter((s) => resultado[s]).map((s) => [s, resultado[s]]));
writeFileSync(OUT, JSON.stringify(ordenado, null, 1));
const notas = Object.values(ordenado).map((r) => r.media);
console.log(`\npáginas: ${notas.length} · média ${(notas.reduce((a, b) => a + b, 0) / notas.length).toFixed(2)} · abaixo de 9: ${notas.filter((n) => n < 9).length} · abaixo de 7: ${notas.filter((n) => n < 7).length}`);
await browser.close();
