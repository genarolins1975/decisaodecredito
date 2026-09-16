/**
 * Etapa A da migração: renderiza o HTML original em Chromium (sem rede), aplica as
 * revisões do próprio arquivo (v6, v10, v13) e exporta o ESTADO FINAL de cada página:
 * metadados, guia do professor (privado), HTML do corpo, questões com gabarito e
 * inventário de controles interativos. Saída: content/generated/extract.json
 *
 * Uso: node scripts/content/extract.mjs
 */
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";

const ROOT = path.resolve(new URL(".", import.meta.url).pathname, "../..");
const SRC = path.join(ROOT, "content/original/apresentacao-curso-pd.html");
const OUT = path.join(ROOT, "content/generated");
fs.mkdirSync(OUT, { recursive: true });

const html = fs.readFileSync(SRC, "utf8");
const sha256 = createHash("sha256").update(html).digest("hex");

const exe = process.env.CHROMIUM_PATH || "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";
const browser = await chromium.launch(fs.existsSync(exe) ? { executablePath: exe } : {});
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const errors = [];
page.on("pageerror", (e) => errors.push(String(e)));
await page.route("**/*", (r) => (r.request().url().startsWith("file://") ? r.continue() : r.abort()));
await page.goto("file://" + SRC);
await page.waitForFunction(() => typeof PAGINAS !== "undefined" && PAGINAS.length > 0);
await page.waitForTimeout(800);

const meta = await page.evaluate(() => ({
  capitulos: CAPITULOS, aulas: AULAS, durAula: DUR_AULA, intervalo: INTERVALO,
  temas: TEMAS_CAP, clientes: CLIENTES, fonteCurso: FONTE_CURSO, casos: FONTE_CURSO.casos,
  ordem: ORDEM().map((p) => p.id), dadosMeta: DADOS.meta,
}));

const ids = meta.ordem;
const pages = [];
for (let i = 0; i < ids.length; i++) {
  const id = ids[i];
  const info = await page.evaluate((id) => {
    const j = LISTA.findIndex((p) => p.id === id);
    AT = j; desenha();
    const p = LISTA[j];
    const corpo = document.getElementById("corpo");

    // 1. questões com gabarito (fonte: objetos referenciados no código da página)
    const src = (p.visual ? String(p.visual) : "") + (p.init ? String(p.init) : "");
    const questoes = [];
    const seen = new Set();
    const pushQ = (slug, q) => { if (!slug || !q || seen.has(slug)) return; seen.add(slug); questoes.push({ slug, ...JSON.parse(JSON.stringify(q, (k, v) => (typeof v === "function" ? undefined : v)))}); };
    if (p.q) pushQ(p.q.id, p.q);
    for (const m of src.matchAll(/(?:questao|ligaQuestao)\('([a-z0-9_]+)',\s*([A-Za-z0-9_$]+)/g)) {
      try { pushQ(m[1], eval(m[2])); } catch { /* objeto local */ }
    }
    // questões cujo objeto é local à função: recuperar pelo DOM (sem gabarito)
    corpo.querySelectorAll("[data-q]").forEach((w) => {
      const slug = w.dataset.q; if (seen.has(slug)) return;
      const pergunta = w.querySelector(".rot + div")?.textContent?.trim() ?? "";
      const alt = [...w.querySelectorAll(".opcao")].map((o) => o.textContent.trim());
      questoes.push({ slug, rot: w.querySelector(".rot")?.textContent?.trim(), pergunta, alt, certa: null, _semGabarito: true });
      seen.add(slug);
    });

    // 2. widgets "prever" (previsão antes de ver): pergunta, opções e conteúdo revelado
    const prever = [...corpo.querySelectorAll("[data-prever]")].map((w) => {
      const pid = w.dataset.prever;
      const pergunta = w.querySelector(".rot + div")?.textContent?.trim() ?? "";
      const opcoes = [...w.querySelectorAll(".opcao")].map((o) => o.textContent.trim());
      const reveal = [...document.querySelectorAll(`.oculto[data-para="${pid}"]`)].map((e) => e.innerHTML);
      return { slug: pid, pergunta, opcoes, revealHtml: reveal.join("\n") };
    });

    // 3. normalizações antes da captura estática
    corpo.querySelectorAll(".tabela-resumida").forEach((w) => { w.dataset.aberta = "true"; w.classList.remove("tabela-resumida"); w.querySelectorAll("[data-resumo-oculto]").forEach((r) => delete r.dataset.resumoOculto); });
    corpo.querySelectorAll(".explorar-dados, .tabela-toggle, details.checagem-rapida").forEach((e) => e.remove());
    corpo.querySelectorAll(".formula").forEach((f) => { const l = f.dataset.latex; if (l) { f.textContent = ""; f.setAttribute("data-latex", l); } });
    // remove widgets nativos e marca posição
    corpo.querySelectorAll("[data-prever]").forEach((w) => { const d = document.createElement("div"); d.setAttribute("data-block", "question"); d.setAttribute("data-slug", w.dataset.prever); w.replaceWith(d); });
    corpo.querySelectorAll("[data-q]").forEach((w) => { const d = document.createElement("div"); d.setAttribute("data-block", "question"); d.setAttribute("data-slug", w.dataset.q); w.replaceWith(d); });
    corpo.querySelectorAll(".oculto[data-para]").forEach((e) => e.remove());

    // 4. inventário de controles interativos remanescentes (simuladores)
    const controls = [...corpo.querySelectorAll("input,select,button,textarea")].map((e) => ({ tag: e.tagName.toLowerCase(), type: e.type || null, name: e.name || null, label: (e.getAttribute("aria-label") || e.textContent || "").trim().slice(0, 60) }));
    const interactive = controls.length > 0;

    const text = corpo.innerText;
    return {
      id, cap: p.cap, n: p.n, titulo: p.titulo, nivel: p.nivel, nivel120: p.nivel120 || null, min: p.min, t: p.t || {}, origem: p.origem || null,
      aprendizado: p.aprendizado || null, apoio: p.apoio || null, conexao: p.conexao || null, guia: p.guia || null,
      html: corpo.innerHTML, text, controls, interactive,
      svgs: corpo.querySelectorAll("svg").length, tables: corpo.querySelectorAll("table").length,
      questoes, prever,
      hasFormula: /\\\(|\\\[|data-latex/.test(corpo.innerHTML),
    };
  }, id);
  pages.push(info);
  process.stdout.write(`\r${i + 1}/${ids.length} ${id}        `);
}
console.log();

// rubricas: tabelas das páginas c10p10 (comitê) e c11p18 (avaliação final)
const rubrics = await page.evaluate(() => {
  const out = {};
  const go = (id) => { AT = LISTA.findIndex((p) => p.id === id); desenha(); return document.getElementById("corpo"); };
  const c10 = go("c10p10");
  const t = c10.querySelector("table");
  if (t) {
    const heads = [...t.tHead.rows[0].cells].map((c) => c.textContent.trim());
    const rows = [...t.tBodies[0].rows].map((r) => [...r.cells].map((c) => c.textContent.trim()));
    const regra = [...c10.querySelectorAll("h3,strong,b")].map((e) => e.textContent.trim());
    out.comite = { heads, rows, regraTexto: c10.innerText.split("\n").filter((l) => /Zero em qualquer/.test(l))[0] || "" };
  }
  const c11 = go("c11p18");
  const items = [...c11.querySelectorAll("[data-tf-crit], .tf-crit, article, section")];
  out.trabalhoFinal = { text: c11.innerText };
  return out;
});

const cssMatch = html.match(/<style[^>]*>([\s\S]*?)<\/style>/);
fs.writeFileSync(path.join(OUT, "legacy.css"), cssMatch ? cssMatch[1] : "");
fs.writeFileSync(path.join(OUT, "extract.json"), JSON.stringify({ sourceFile: "content/original/apresentacao-curso-pd.html", sourceSha256: sha256, extractedAt: new Date().toISOString(), meta, pages, rubrics, errors }, null, 1));
console.log(`páginas: ${pages.length}; questões: ${pages.reduce((s, p) => s + p.questoes.length, 0)}; prever: ${pages.reduce((s, p) => s + p.prever.length, 0)}; interativas: ${pages.filter((p) => p.interactive).length}; erros: ${errors.length}`);
await browser.close();
