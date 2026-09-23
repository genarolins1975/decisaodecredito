/* Varredura visual das 61 páginas da Aula 2 na plataforma. As páginas com visual nativo montam um
   quadro 16:9 (`.rl-slide`) cujas linhas do grid têm altura fixa em `fr`: quando o conteúdo de uma
   linha não cabe, ele transborda e o bloco seguinte, pintado depois, cobre o anterior. O olho vê
   texto cortado; o DOM continua dizendo que está tudo lá. Por isso a medição é de duas naturezas:
   conteúdo maior que a própria caixa, e caixas irmãs que se sobrepõem de fato.

   Uso: node qa-plataforma/varre.mjs [--largura WxH] [--fotos] [slug...] */
import fs from "node:fs";
import path from "node:path";
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
const fotos = args.includes("--fotos");
const iL = args.indexOf("--largura");
const [LARG, ALT] = (iL >= 0 ? args[iL + 1] : "1366x768").split("x").map(Number);
const alvos = args.filter((a) => /^c\d+p\d+$/.test(a));
const estados = args.includes("--estados");
const iR = args.indexOf("--rota");
const ROTA = iR >= 0 ? args[iR + 1] : "aulas";
const slugs = alvos.length ? alvos : TODOS;
const PASTA = path.join("qa-plataforma", `${ROTA}-${LARG}x${ALT}`);
if (fotos) fs.mkdirSync(PASTA, { recursive: true });

/* Duas medidas, cada uma com sua folga:
   - TRANSBORDO: conteúdo mais alto que a caixa que o contém. 2 px absorve arredondamento do layout.
   - COBERTURA: interseção real entre caixas irmãs. 2 px absorve borda encostada em borda. */
const FOLGA = 1;

const medir = (FOLGA) => {
  const saida = { transbordos: [], vazamentos: [], coberturas: [], overflowX: 0, quadros: 0, caixas: 0 };
  const raiz = document.querySelector("main") || document.body;
  const rotulo = (el) => {
    const t = (el.textContent || "").replace(/\s+/g, " ").trim().slice(0, 44);
    const cls = (el.getAttribute("class") || "").split(" ").filter(Boolean).slice(0, 2).join(".");
    return `${el.tagName.toLowerCase()}${cls ? "." + cls : ""}${t ? " | " + t : ""}`;
  };
  /* Conteúdo só para leitor de tela não está na tela: o MathML que o KaTeX emite ao lado da fórmula
     é recortado por `clip`, e medi-lo acusaria fórmula estourando onde o olho não vê nada. */
  const soParaLeitor = (el) => {
    const s = getComputedStyle(el);
    if (s.clip && s.clip !== "auto") return true;
    if (s.clipPath && /inset\(\s*(50%|100%)/.test(s.clipPath)) return true;
    return el.classList.contains("katex-mathml") || el.classList.contains("sr-only") || el.classList.contains("visually-hidden");
  };
  const desenhado = (el) => {
    const s = getComputedStyle(el);
    if (s.display === "none" || s.visibility === "hidden" || Number(s.opacity) === 0) return false;
    if (soParaLeitor(el)) return false;
    const r = el.getBoundingClientRect();
    return r.width > 1 && r.height > 1;
  };
  /* Um elemento só está de fato à vista se nenhum ancestral o esconde. `.rl-conta--oculta`, por
     exemplo, é um overlay posicionado que continua no layout: medir por scrollHeight acusaria perda
     de conteúdo onde não há nada visível para perder. */
  const aVista = (el) => { for (let n = el; n && n !== document.body; n = n.parentElement) if (!desenhado(n)) return false; return true; };
  const dentroDeSvg = (el) => Boolean(el.closest("svg"));
  /* Conteúdo dentro de uma caixa que rola não está perdido: o leitor alcança. Só conta como perdido
     o que passa da borda de quem corta sem oferecer rolagem em nenhum ponto do caminho. */
  const ROLA = new Set(["auto", "scroll", "overlay"]);
  const rolavelEntre = (d, e, eixo) => {
    for (let n = d.parentElement; n && n !== e; n = n.parentElement) {
      const s = getComputedStyle(n);
      if (ROLA.has(eixo === "y" ? s.overflowY : s.overflowX)) return true;
    }
    return false;
  };
  const INTERNOS_TABELA = new Set(["COLGROUP", "COL", "THEAD", "TBODY", "TFOOT", "TR", "TD", "TH", "CAPTION"]);

  const todos = [...raiz.querySelectorAll("*")].filter((el) => !dentroDeSvg(el) && !el.closest(".katex-mathml"));

  /* 1. Conteúdo cortado: a caixa corta (hidden/clip) e algo que está à vista fica além da borda.
        Medido pela geometria do que está desenhado, não por scrollHeight, que conta o que ninguém vê. */
  for (const el of todos) {
    if (!desenhado(el)) continue;
    saida.caixas++;
    const s = getComputedStyle(el);
    const cortaY = s.overflowY === "hidden" || s.overflowY === "clip";
    const cortaX = s.overflowX === "hidden" || s.overflowX === "clip";
    if (!cortaY && !cortaX) continue;
    if (el.scrollTop > 1 || el.scrollLeft > 1) continue;
    const r = el.getBoundingClientRect();
    const bb = parseFloat(s.borderBottomWidth) || 0, bd = parseFloat(s.borderRightWidth) || 0;
    let fundo = -Infinity, direita = -Infinity, quemY = null, quemX = null;
    for (const d of el.querySelectorAll("*")) {
      if (dentroDeSvg(d) || !desenhado(d) || !aVista(d)) continue;
      const q = d.getBoundingClientRect();
      if (q.bottom > fundo && !rolavelEntre(d, el, "y")) { fundo = q.bottom; quemY = d; }
      if (q.right > direita && !rolavelEntre(d, el, "x")) { direita = q.right; quemX = d; }
    }
    if (cortaY && fundo > -Infinity) {
      const v = fundo - (r.bottom - bb);
      if (v > FOLGA) saida.transbordos.push({ px: Math.round(v), eixo: "y", caixa: rotulo(el), alvo: rotulo(quemY) });
    }
    if (cortaX && direita > -Infinity) {
      const h = direita - (r.right - bd);
      if (h > FOLGA) saida.transbordos.push({ px: Math.round(h), eixo: "x", caixa: rotulo(el), alvo: rotulo(quemX) });
    }
  }

  /* 2. Conteúdo que vaza da própria caixa e cai em cima da caixa seguinte. É assim que o defeito
        aparece ao olho: a faixa de cima não corta nem rola, o texto dela passa do próprio quadro e a
        faixa de baixo, pintada depois, cobre o que passou. O retângulo das duas caixas não se
        encosta, então a checagem de sobreposição não vê; e ninguém corta, então a de corte também
        não. Só a geometria do conteúdo contra a borda da caixa revela. */
  for (const el of todos) {
    if (!desenhado(el)) continue;
    /* Só dentro de tela de altura fixa. É lá que o vazamento vira defeito: a tela não cresce, então
       o que passa da caixa fica por baixo da seguinte. Em página que cresce, o mesmo vazamento é
       apenas um elemento saindo da caixa e empurrando o resto, sem nada por cima. */
    if (!el.closest(".rl-slide, .slide")) continue;
    const s = getComputedStyle(el);
    if (s.overflowY !== "visible" || !el.parentElement) continue;
    const pai = getComputedStyle(el.parentElement);
    if (pai.display !== "grid" && pai.display !== "flex") continue;
    const r = el.getBoundingClientRect();
    const bb = parseFloat(s.borderBottomWidth) || 0;
    let fundo = -Infinity, quem = null;
    for (const d of el.querySelectorAll("*")) {
      if (dentroDeSvg(d) || !desenhado(d) || !aVista(d)) continue;
      if (rolavelEntre(d, el, "y")) continue;
      const q = d.getBoundingClientRect();
      if (q.bottom > fundo) { fundo = q.bottom; quem = d; }
    }
    if (fundo === -Infinity) continue;
    const vaza = fundo - (r.bottom - bb);
    if (vaza <= FOLGA) continue;
    // só conta se o que vazou cai sobre uma irmã posterior, que é o que produz o texto cortado
    let sobre = null;
    for (let irma = el.nextElementSibling; irma && !sobre; irma = irma.nextElementSibling) {
      if (!desenhado(irma)) continue;
      const b = irma.getBoundingClientRect();
      const h = Math.min(r.right, b.right) - Math.max(r.left, b.left);
      if (h > FOLGA && b.top < fundo - FOLGA && b.bottom > r.bottom - bb) sobre = irma;
    }
    if (sobre) saida.vazamentos.push({ px: Math.round(vaza), caixa: rotulo(el), alvo: rotulo(quem), sobre: rotulo(sobre) });
  }

  /* 3. Caixas que se cobrem: só entre irmãs de bloco em fluxo normal, onde sobreposição é sempre
        defeito. Fora: desenho (SVG), interior de tabela e qualquer coisa posicionada, que é overlay. */
  const BLOCO = new Set(["block", "flex", "grid", "list-item", "table", "flow-root"]);
  for (const el of [raiz, ...todos]) {
    if (INTERNOS_TABELA.has(el.tagName)) continue;
    const filhos = [...el.children].filter((c) => {
      if (dentroDeSvg(c) || INTERNOS_TABELA.has(c.tagName) || c.tagName === "SVG") return false;
      const s = getComputedStyle(c);
      return s.position === "static" && BLOCO.has(s.display) && s.float === "none" && desenhado(c);
    });
    if (filhos.length < 2) continue;
    for (let i = 0; i < filhos.length; i++) {
      for (let j = i + 1; j < filhos.length; j++) {
        const a = filhos[i].getBoundingClientRect(), b = filhos[j].getBoundingClientRect();
        const h = Math.min(a.right, b.right) - Math.max(a.left, b.left);
        const v = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
        if (h > FOLGA && v > FOLGA) saida.coberturas.push({ px: Math.round(Math.min(h, v)), a: rotulo(filhos[i]), b: rotulo(filhos[j]) });
      }
    }
  }
  saida.quadros = document.querySelectorAll(".rl-slide").length;
  saida.overflowX = Math.max(0, document.documentElement.scrollWidth - document.documentElement.clientWidth);
  return saida;
};

const navegador = await chromium.launch({ executablePath: CHROMIUM });
const ctx = await navegador.newContext({ viewport: { width: LARG, height: ALT }, deviceScaleFactor: 1 });
const pag = await ctx.newPage();
await pag.goto(`${BASE}/entrar`, { waitUntil: "domcontentloaded" });
await pag.fill("input[name=email]", PROF.email);
await pag.fill("input[name=password]", PROF.password);
await pag.click("button[type=submit]");
await pag.waitForURL((u) => !u.toString().includes("/entrar"), { timeout: 30000 });

const relato = [];
for (const slug of slugs) {
  await pag.goto(`${BASE}/${ROTA}/${slug}`, { waitUntil: "networkidle" });
  await pag.waitForTimeout(220);
  let m = await pag.evaluate(medir, FOLGA);
  let ondeFalhou = m.transbordos.length || m.vazamentos.length || m.coberturas.length || m.overflowX > FOLGA ? "repouso" : null;
  if (estados) {
    /* Cada botão do quadro revela algo: conta, definição, resposta, etapa. O conteúdo revelado é o
       que mais costuma não caber, e o repouso nunca mostra isso. Clica um por vez, acumulando. */
    const botoes = await pag.$$(".rl-slide button[type=button], .rl-slide input[type=radio]");
    for (let i = 0; i < botoes.length; i++) {
      try { await botoes[i].click({ timeout: 2000 }); } catch { continue; }
      await pag.waitForTimeout(140);
      const mm = await pag.evaluate(medir, FOLGA);
      const ruim = mm.transbordos.length || mm.vazamentos.length || mm.coberturas.length || mm.overflowX > FOLGA;
      if (ruim && !ondeFalhou) { m = mm; ondeFalhou = `após o clique ${i + 1} de ${botoes.length}`; }
    }
  }
  const falhou = Boolean(ondeFalhou);
  relato.push({ slug, ...m, quando: ondeFalhou, ok: !falhou });
  if (fotos && falhou) await pag.screenshot({ path: path.join(PASTA, `${slug}.png`), fullPage: true });
  const marca = falhou ? "FALHA" : "ok   ";
  const detalhe = [
    m.transbordos.length ? `corta ${m.transbordos.length} (${m.transbordos[0].px}px em ${m.transbordos[0].caixa})` : "",
    m.vazamentos.length ? `vaza ${m.vazamentos.length} (${m.vazamentos[0].px}px de ${m.vazamentos[0].caixa.slice(0, 30)})` : "",
    m.coberturas.length ? `cobre ${m.coberturas.length} (${m.coberturas[0].px}px)` : "",
    m.overflowX > FOLGA ? `overflowX ${m.overflowX}px` : "",
    ondeFalhou && ondeFalhou !== "repouso" ? ondeFalhou : "",
  ].filter(Boolean).join(" · ");
  console.log(`${marca} ${slug.padEnd(6)} quadros=${m.quadros} ${detalhe}`);
}
await navegador.close();

fs.mkdirSync("qa-plataforma", { recursive: true });
fs.writeFileSync(path.join("qa-plataforma", `relatorio-${ROTA}-${LARG}x${ALT}.json`), JSON.stringify(relato, null, 1));
const falhas = relato.filter((r) => !r.ok);
console.log(`\n${relato.length - falhas.length}/${relato.length} páginas sem defeito em ${LARG}x${ALT}`);
if (falhas.length) console.log(`falham: ${falhas.map((f) => f.slug).join(", ")}`);
process.exit(falhas.length ? 1 : 0);
