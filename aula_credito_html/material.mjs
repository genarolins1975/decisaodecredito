/* Materiais da Aula 2 em PDF: guia do professor (com notas, respostas e cuidados) e guia do aluno
   (sem gabarito). Cada edição traz os 50 slides capturados do próprio baralho, uma página por slide,
   com o texto didático de material/conteudo/ e as notas de dist/aula_credito_notas.json.

   Uso: node material.mjs [--so professor|aluno] [--sem-captura] [--sem-pdf]
   Saídas: dist/material/aula-2-guia-do-<edicao>.html e .pdf, copiados para content/materiais/.
   Exige o baralho compilado (node build.mjs) e o Chromium de /opt/pw-browsers. */
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";
import { chromium } from "playwright";
import { capa, blocos, comoUsar, fontesDosNumeros, glossario, errosComuns, roteiroAplicacao, verificacaoSaida } from "./material/conteudo/blocos.mjs";
import { slides as s1 } from "./material/conteudo/slides-01-20.mjs";
import { slides as s2 } from "./material/conteudo/slides-21-36.mjs";
import { slides as s3 } from "./material/conteudo/slides-37-50.mjs";

const raiz = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const katex = require("./app/vendor/katex.js");
const argv = process.argv.slice(2);
const opc = (n) => argv.includes(n);
const so = argv.includes("--so") ? argv[argv.indexOf("--so") + 1] : null;
const EDICOES = (so ? [so] : ["professor", "aluno"]);
const SAIDA = path.join(raiz, "dist", "material");
const PUBLICO = path.join(raiz, "..", "content", "materiais");
const EXE = "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";
const BARALHO = path.join(raiz, "dist", "aula_credito.html");
/* Slides de exercício: na edição do aluno a captura fica no estado inicial, sem a solução aberta. */
const EXERCICIOS = ["04", "20", "30", "42", "49", "50"];
const conteudo = Object.assign({}, s1, s2, s3);
fs.mkdirSync(SAIDA, { recursive: true });

/* ----------------------------------------------------------------- dados */

function carregarDados() {
  const ctx = { Aula: {}, window: {}, console };
  vm.createContext(ctx);
  for (const f of ["app/nucleo/01-nucleo.js", "app/nucleo/05-mat.js", "app/dados/00-versao.js",
                   "app/dados/10-dados.js", "app/dados/11-resultados.js"]) {
    vm.runInContext(fs.readFileSync(path.join(raiz, f), "utf8"), ctx, { filename: f });
  }
  return ctx;
}
const ctx = carregarDados();
const D = ctx.Aula.dados, R = ctx.Aula.resultados, META = ctx.Aula.metadados, F = ctx.F, M = ctx.M;
const notas = JSON.parse(fs.readFileSync(path.join(raiz, "dist", "aula_credito_notas.json"), "utf8"));
const VERSAO = notas.versao;
if (ctx.AULA_VERSAO !== VERSAO) throw new Error("notas e fontes com versões diferentes: recompile com node build.mjs");
const DATA = new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
const porId = Object.fromEntries(notas.slides.map((s) => [s.n, s]));
for (const s of notas.slides) if (!conteudo[s.n]) throw new Error("sem conteúdo didático para o slide " + s.n);

/* ---------------------------------------------------------------- helpers */

const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const tex = (t, display = true) => katex.renderToString(t, { displayMode: display, output: "htmlAndMathml", throwOnError: false, strict: false });
const par = (t, cls = "") => t ? `<p${cls ? ` class="${cls}"` : ""}>${esc(t)}</p>` : "";
const lista = (itens, cls = "") => itens && itens.length ? `<ul${cls ? ` class="${cls}"` : ""}>${itens.map((i) => `<li>${esc(i)}</li>`).join("")}</ul>` : "";
const ol = (itens) => `<ol>${itens.map((i) => `<li>${esc(i)}</li>`).join("")}</ol>`;
const rot = (t) => `<p class="rotulo">${esc(t)}</p>`;
const blocoDe = (chave) => blocos.find((b) => b.chave === chave);
const linhasTabela = (linhas) => linhas.map((l) => `<tr>${l.map((c, j) => `<${j === 0 ? "th scope=\"row\"" : "td"}>${c}</${j === 0 ? "th" : "td"}>`).join("")}</tr>`).join("");
function tabela(colunas, linhas, cls = "") {
  return `<table class="tabela ${cls}"><thead><tr>${colunas.map((c) => `<th scope="col">${esc(c)}</th>`).join("")}</tr></thead><tbody>${linhasTabela(linhas)}</tbody></table>`;
}
const pct = (v, casas = 2) => F.pct(v, casas);
const num = (v, casas = 2) => F.dec(v, casas);

/* ---------------------------------------------------------------- capturas */

async function capturar(edicao, dir) {
  fs.mkdirSync(dir, { recursive: true });
  const b = await chromium.launch({ executablePath: EXE });
  const p = await b.newPage({ viewport: { width: 1700, height: 1000 }, deviceScaleFactor: 1 });
  const erros = [];
  p.on("pageerror", (e) => erros.push(String(e)));
  await p.goto("file://" + BARALHO + "#/slide/01", { waitUntil: "load" });
  await p.waitForTimeout(300);
  await p.addStyleTag({ content: "#palco{transform:none !important;margin:0 !important;position:absolute;left:0;top:0} #moldura{overflow:visible !important}" });
  for (const s of notas.slides) {
    const inicial = edicao === "aluno" && EXERCICIOS.includes(s.n);
    await p.evaluate(([id, inicial]) => {
      const def = Aula.slides.find((d) => d.id === id);
      const e = App.estadoDe(id);
      for (const k of Object.keys(e)) delete e[k];
      if (!inicial && def.impressao) def.impressao(e);
      App.navegar(id);
      App.montar(id);
    }, [s.n, inicial]);
    await p.waitForTimeout(120);
    const box = await p.evaluate(() => { const r = document.getElementById("palco").getBoundingClientRect(); return { x: r.x, y: r.y, width: r.width, height: r.height }; });
    if (Math.round(box.width) !== 1600 || Math.round(box.height) !== 900) throw new Error("palco fora de 1600x900 no slide " + s.n);
    await p.screenshot({ path: path.join(dir, s.n + ".png"), clip: box });
  }
  await b.close();
  if (erros.length) throw new Error("erros no baralho durante a captura: " + erros.slice(0, 3).join(" | "));
}

/* ------------------------------------------------------------------ CSS */

const KATEX_CSS = fs.readFileSync(path.join(raiz, "app", "vendor", "katex.css"), "utf8");
/* Fontes do material (SIL Open Font License 1.1, pacotes Fontsource 5.0.19): Source Serif 4 para
   títulos e Source Sans 3 para o corpo. Ficam em material/fontes e entram no PDF por @font-face. */
const FONTES = path.join(raiz, "material", "fontes");
const fonte = (familia, arquivo, peso, estilo) =>
  `@font-face { font-family: "${familia}"; src: url("file://${path.join(FONTES, arquivo)}") format("woff2"); font-weight: ${peso}; font-style: ${estilo}; }`;
const FONTES_CSS = [
  fonte("Source Serif 4", "source-serif-4-latin-400-normal.woff2", 400, "normal"),
  fonte("Source Serif 4", "source-serif-4-latin-400-italic.woff2", 400, "italic"),
  fonte("Source Serif 4", "source-serif-4-latin-700-normal.woff2", 700, "normal"),
  fonte("Source Sans 3", "source-sans-3-latin-400-normal.woff2", 400, "normal"),
  fonte("Source Sans 3", "source-sans-3-latin-400-italic.woff2", 400, "italic"),
  fonte("Source Sans 3", "source-sans-3-latin-700-normal.woff2", 700, "normal"),
].join("\n");
const CSS = `
${FONTES_CSS}
:root {
  --ground: #F5F4F0; --paper: #FBFAF7; --surface: #FFFFFF; --ink: #00205B; --ink-soft: #3D5A8A;
  --gold: #C9A84C; --gold-soft: #F4ECD6; --amber: #9A5209; --body: #333333; --muted: #5B6475;
  --rule: #E2DFD6; --alert: #8C2332; --alert-soft: #FBF2F3; --ok: #2E6B4F; --ok-soft: #F0F7F3;
  --warn: #7a5309; --warn-soft: #FDF7E9; --dots: #C9D8F2;
  --logit: #9A4E36; --logit-soft: #FAF0EC; --arvore: #28725B; --arvore-soft: #EDF7F3;
  --boost: #7B3E73; --boost-soft: #F8EFF6; --problema: #00205B; --problema-soft: #EFF3FA;
  --decisao: #9A5209; --decisao-soft: #FBF1E3;
  --cap: var(--ink); --cap-soft: #EFF3FA;
  --serif: "Source Serif 4", "Iowan Old Style", "Palatino Linotype", Palatino, Georgia, serif;
  --sans: "Source Sans 3", "Segoe UI", Roboto, Helvetica, Arial, "Liberation Sans", sans-serif;
}
[data-bloco="problema"] { --cap: var(--problema); --cap-soft: var(--problema-soft); }
[data-bloco="logit"] { --cap: var(--logit); --cap-soft: var(--logit-soft); }
[data-bloco="arvore"] { --cap: var(--arvore); --cap-soft: var(--arvore-soft); }
[data-bloco="boosting"] { --cap: var(--boost); --cap-soft: var(--boost-soft); }
[data-bloco="decisao"] { --cap: var(--decisao); --cap-soft: var(--decisao-soft); }
* { box-sizing: border-box; }
html { font-size: 11pt; }
body { margin: 0; font-family: var(--sans); color: var(--body); background: #fff; line-height: 1.45;
       -webkit-print-color-adjust: exact; print-color-adjust: exact; }
h1, h2, h3, h4 { font-family: var(--serif); color: var(--ink); font-weight: 700; margin: 0; line-height: 1.15; break-after: avoid; }
h1 { font-size: 26pt; } h2 { font-size: 17pt; } h3 { font-size: 13.5pt; } h4 { font-size: 11pt; }
p { margin: 0; } p + p { margin-top: 2.2mm; }
ul, ol { margin: 1.5mm 0 0; padding-left: 4.5mm; } li { margin-bottom: 1.1mm; } li::marker { color: var(--cap); }
a { color: inherit; text-decoration: none; }
.eyebrow { font-size: 7.5pt; letter-spacing: .09em; text-transform: uppercase; color: var(--muted); font-weight: 700; }
.eyebrow b { color: var(--cap); }
.rotulo { font-size: 7.5pt; letter-spacing: .1em; text-transform: uppercase; color: var(--muted); font-weight: 700; margin: 0 0 1.2mm; }
.nota { font-size: 8.5pt; color: var(--muted); }
.prosa { max-width: 100%; }
/* capa */
.capa { break-after: page; display: flex; flex-direction: column; }
.capa-alto { background: var(--ink); color: #fff; border-radius: 4px; padding: 10mm 10mm 9mm; }
.capa-alto .eyebrow { color: var(--gold); }
.capa-alto h1 { color: #fff; font-size: 28pt; margin-top: 3mm; }
.capa-alto .sub { color: #DCE7F3; font-size: 12pt; margin-top: 3mm; max-width: 150mm; line-height: 1.35; }
.capa-edicao { display: inline-block; margin-top: 5mm; padding: 1.6mm 3.5mm; border: 1px solid var(--gold); color: var(--gold); border-radius: 3px; font-size: 8.5pt; letter-spacing: .08em; text-transform: uppercase; font-weight: 700; }
.capa-meio { display: grid; grid-template-columns: 1fr 1fr; gap: 4mm; margin-top: 5mm; align-content: start; }
.capa-caixa { border: 1px solid var(--rule); border-radius: 4px; padding: 3mm 4mm; background: var(--paper); }
.capa-caixa .rotulo { margin-bottom: 1.5mm; }
.capa-mapa { grid-column: 1 / -1; display: grid; grid-template-columns: repeat(5, 1fr); gap: 3mm; }
.capa-bloco { border-top: 4px solid var(--cap); padding: 2mm 0 0; }
.capa-bloco b { display: block; font-family: var(--serif); color: var(--cap); font-size: 11pt; }
.capa-bloco span { font-size: 8.5pt; color: var(--muted); }
.capa-pe { margin-top: 4mm; font-size: 8.5pt; color: var(--muted); display: flex; justify-content: space-between; gap: 6mm; }
.aviso { border-left: 3px solid var(--alert); background: var(--alert-soft); padding: 2.5mm 4mm; border-radius: 0 4px 4px 0; font-size: 9.5pt; }
/* seções de texto */
.secao { break-before: page; }
.secao h2 { margin-bottom: 3mm; padding-bottom: 2mm; border-bottom: 2px solid var(--rule); }
.secao h3 { margin-top: 5mm; margin-bottom: 1.5mm; }
.duas { display: grid; grid-template-columns: 1fr 1fr; gap: 5mm; align-items: start; }
.tres { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 4mm; align-items: start; }
.caixa { border: 1px solid var(--rule); border-radius: 4px; padding: 3mm 4mm; background: var(--surface); break-inside: avoid; }
.caixa.objetivo { background: var(--cap-soft); border-color: transparent; }
.caixa.apoio { background: var(--paper); }
.caixa.discutir { background: #FBF6E6; border-color: #EADBA8; }
.caixa.resposta { background: var(--ok-soft); border-color: #BDD8CA; }
.caixa.cuidado { background: var(--alert-soft); border-color: #E3B7BE; }
.caixa.transicao { background: var(--paper); border-left: 3px solid var(--gold); }
.callout { border-left: 3px solid var(--cap); background: var(--cap-soft); padding: 2.5mm 4mm; border-radius: 0 4px 4px 0; }
.tabela { width: 100%; border-collapse: collapse; font-size: 9pt; break-inside: auto; }
.tabela th { text-align: left; font-size: 7.5pt; letter-spacing: .06em; text-transform: uppercase; color: var(--muted); padding: 1.6mm 2mm; border-bottom: 2px solid var(--rule); background: var(--paper); vertical-align: bottom; }
.tabela td, .tabela tbody th { padding: 1.6mm 2mm; border-bottom: 1px solid var(--rule); vertical-align: top; font-variant-numeric: tabular-nums; }
.tabela tbody th { font-weight: 700; color: var(--ink); text-transform: none; letter-spacing: 0; font-size: 9pt; background: transparent; border-bottom: 1px solid var(--rule); }
.tabela.num td { text-align: right; } .tabela.num td:first-child, .tabela.num th:first-child { text-align: left; }
.tabela tr { break-inside: avoid; }
.kv { display: grid; grid-template-columns: max-content 1fr; gap: 1mm 4mm; margin: 0; font-size: 9.5pt; }
.kv dt { color: var(--muted); } .kv dd { margin: 0; }
/* abertura de bloco */
.bloco-abre { break-before: page; }
.bloco-cab { background: var(--cap); color: #fff; border-radius: 4px; padding: 6mm 8mm; display: grid; grid-template-columns: max-content 1fr; gap: 6mm; align-items: center; }
.bloco-num { font-family: var(--serif); font-size: 40pt; line-height: .9; color: var(--gold); font-weight: 700; }
.bloco-cab h2 { color: #fff; font-size: 20pt; }
.bloco-cab .eyebrow { color: var(--gold); margin-bottom: 1mm; }
.bloco-cab .perg { color: #DCE7F3; font-family: var(--serif); font-style: italic; font-size: 12pt; margin-top: 2mm; }
.bloco-corpo { display: grid; grid-template-columns: 1.15fr 1fr; gap: 5mm; margin-top: 5mm; }
.bloco-corpo h3 { margin-top: 0; }
.bloco-lista { list-style: none; padding: 0; margin: 2mm 0 0; }
.bloco-lista li { padding-left: 5mm; position: relative; margin-bottom: 1.5mm; }
.bloco-lista li::before { content: ""; position: absolute; left: 0; top: .45em; width: 2.6mm; height: 2.6mm; background: var(--cap); border-radius: 1px; }
.bloco-slides { margin-top: 5mm; }
.bloco-slides .duas { gap: 6mm; }
.bloco-slides .tabela { font-size: 9pt; }
.bloco-slides .tabela td, .bloco-slides .tabela tbody th { padding: 1.4mm 2mm; }
.bloco-slides .tabela th:first-child, .bloco-slides .tabela td:first-child { width: 10mm; font-weight: 700; color: var(--cap); }
.bloco-slides .tabela th:last-child, .bloco-slides .tabela td:last-child { width: 12mm; text-align: right; color: var(--muted); }
/* página de slide */
.slide { break-before: page; }
.slide-cab { display: flex; justify-content: space-between; align-items: baseline; gap: 6mm; border-bottom: 2px solid var(--cap); padding-bottom: 1.5mm; margin-bottom: 2.5mm; }
.slide-cab .n { font-family: var(--serif); color: var(--cap); font-size: 20pt; font-weight: 700; line-height: 1; white-space: nowrap; }
.slide-cab h3 { font-size: 14.5pt; }
.slide-sub { color: var(--muted); font-size: 10pt; margin-top: .8mm; }
.slide-fig { margin: 0 0 3mm; border: 1px solid var(--rule); border-radius: 4px; overflow: hidden; break-inside: avoid; background: #F5F4F0; }
.slide-fig img { width: 100%; display: block; }
.slide-fig figcaption { font-size: 8pt; color: var(--muted); padding: 1.4mm 3mm; border-top: 1px solid var(--rule); background: var(--paper); }
.slide-corpo { display: block; }
.slide-corpo > * + * { margin-top: 3mm; }
.par { display: grid; grid-template-columns: 1fr 1fr; gap: 3mm; align-items: start; break-inside: avoid; }
.par + .par, .par + .caixa, .caixa + .par { margin-top: 3mm; }
.slide-corpo .prosa { font-size: 10pt; line-height: 1.5; }
.formula { background: var(--cap-soft); border-radius: 4px; padding: 1.5mm 4mm 2mm; display: grid; grid-template-columns: 1fr; gap: .5mm; break-inside: avoid; }
.formula .katex-display { margin: 1.2mm 0; } .formula .katex { font-size: 1.05em; }
.formula .nota { text-align: center; }
.exercicio { border: 1.5px solid var(--cap); border-radius: 4px; padding: 3mm 4mm; break-inside: avoid; }
.exercicio h4 { color: var(--cap); margin-bottom: 1mm; }
.exercicio ol, .exercicio ul { margin-top: 1.5mm; }
.exercicio ul.alts { list-style: none; padding-left: 0; } .exercicio ul.alts li { padding-left: 4.5mm; }
.exercicio .opcoes { display: flex; gap: 3mm; flex-wrap: wrap; margin-top: 2mm; }
.exercicio .opcoes span { border: 1px solid var(--rule); border-radius: 3px; padding: .8mm 2.5mm; font-size: 9pt; }
.exercicio .etapas li { border-bottom: 1px dotted var(--rule); padding-bottom: 1.2mm; }
.linhas { margin-top: 2mm; } .linhas div { border-bottom: 1px solid var(--rule); height: 6.5mm; }
.levar { display: flex; gap: 4mm; align-items: baseline; justify-content: space-between; border-top: 1px solid var(--rule); padding-top: 2mm; margin-top: 1mm; break-before: avoid; }
.levar b { font-family: var(--serif); color: var(--ink); font-size: 11pt; }
.levar span { font-size: 8pt; color: var(--muted); white-space: nowrap; }
.notas .caixa { font-size: 9.5pt; }
.notas .caixa ul { padding-left: 4mm; }
/* página de slide, edição do professor: cabe numa página */
.slide.professor .slide-topo { display: grid; grid-template-columns: 1.5fr 1fr; gap: 4mm; align-items: start; margin-bottom: 3mm; }
.slide.professor .slide-fig { margin: 0; }
.slide.professor .slide-fig figcaption { font-size: 7.5pt; }
.slide.professor .lado { display: grid; gap: 3mm; }
.slide.professor .lado .caixa { font-size: 9pt; padding: 2.5mm 3.5mm; }
.slide.professor .notas .caixa { font-size: 9pt; padding: 2.5mm 3.5mm; }
.slide.professor .notas li { margin-bottom: .9mm; }
.slide.professor .exercicio { font-size: 9pt; padding: 2.5mm 3.5mm; margin-top: 1mm; }
.slide.professor .exercicio h4 { font-size: 10pt; }
.slide.professor .levar b { font-size: 10.5pt; }
/* fecho */
.check { list-style: none; padding: 0; margin: 2mm 0 0; }
.check li { padding-left: 7mm; position: relative; margin-bottom: 2mm; }
.check li::before { content: ""; position: absolute; left: 0; top: .2em; width: 4mm; height: 4mm; border: 1.5px solid var(--ink); border-radius: 2px; }
.gloss dt { font-weight: 700; color: var(--ink); margin-top: 2mm; } .gloss dd { margin: 0; font-size: 9.5pt; }
.gloss { columns: 2; column-gap: 7mm; }
.gloss div { break-inside: avoid; }
.ritmo td:last-child { text-align: right; font-variant-numeric: tabular-nums; }
.sumario td { padding: .7mm 2mm; font-size: 9pt; } .sumario td:last-child { text-align: right; width: 12mm; color: var(--ink); font-weight: 700; }
${KATEX_CSS}
`;

/* -------------------------------------------------------------- páginas */

function nomeEdicao(edicao) { return edicao === "professor" ? "Guia do professor" : "Guia do aluno"; }

const SECOES = (edicao) => [
  ["Como usar este guia", "Como usar este guia" + (edicao === "professor" ? ", ritmo proposto e caminho da aula" : " e caminho da aula")],
  ["Os quatro clientes, o alvo e as variáveis", "Os quatro clientes, o alvo, o dicionário das variáveis e a origem dos números"],
  ["Mapa dos 50 slides", "Mapa dos 50 slides, com a página de cada um"],
  ...blocos.map((b, i) => [`Bloco ${i + 1} de 5`, `Bloco ${i + 1}: ${b.nome}, slides ${b.de} a ${b.ate}`]),
  ["Síntese das três técnicas", "Síntese das três técnicas, os modelos no teste e os quatro clientes nos três modelos"],
  edicao === "professor" ? ["Sinais para observar na turma", "Sinais para observar na turma e lista de verificação de saída"] : ["Antes da próxima aula, você deve conseguir", "Antes da próxima aula: lista de verificação e cuidados de estudo"],
  ["Glossário", "Glossário"],
];

function paginaCapa(edicao, paginas) {
  const mapa = blocos.map((b) => `<div class="capa-bloco" data-bloco="${b.chave}"><b>${esc(b.nome)}</b><span>slides ${b.de} a ${b.ate}</span></div>`).join("");
  /* O sumário entra nas duas passagens (na primeira sem números) para a paginação não mudar. */
  const numeros = (paginas && paginas.secoes) || {};
  const secoes = `<div class="capa-caixa" style="grid-column:1/-1"><p class="rotulo">Neste guia</p><table class="tabela sumario"><tbody>${SECOES(edicao).map(([chave, rotulo]) => `<tr><td>${esc(rotulo)}</td><td>${numeros[chave] || ""}</td></tr>`).join("")}</tbody></table></div>`;
  const aviso = edicao === "professor"
    ? `<div class="aviso"><b>Edição do professor.</b> Contém respostas dos exercícios, notas de condução e cuidados reservados. Não distribuir aos alunos: eles recebem o guia do aluno, sem gabarito.</div>`
    : `<div class="callout"><b>Como usar.</b> Leia cada página ao lado do slide correspondente na plataforma. Os exercícios estão sem gabarito: resolva no papel e confira na tela, que corrige e explica cada alternativa.</div>`;
  return `<section class="capa">
    <div class="capa-alto">
      <p class="eyebrow">${esc(capa.curso)} · ${esc(capa.aula)}</p>
      <h1>${esc(capa.titulo)}</h1>
      <p class="sub">${esc(capa.subtitulo)}</p>
      <span class="capa-edicao">${esc(nomeEdicao(edicao))}</span>
    </div>
    <div class="capa-meio">
      <div class="capa-caixa"><p class="rotulo">Entrega da aula</p><p>${esc(capa.entrega)}</p></div>
      <div class="capa-caixa"><p class="rotulo">Formato</p><p>${esc(capa.duracao)}. Cinquenta slides interativos em cinco blocos, com quatro clientes fictícios acompanhados do começo ao fim.</p></div>
      <div class="capa-mapa">${mapa}</div>
      ${secoes}
      <div style="grid-column:1/-1">${aviso}</div>
    </div>
    <div class="capa-pe"><span>Versão da aula ${esc(VERSAO)} · material gerado em ${esc(DATA)}</span><span>Todos os dados são sintéticos. Nenhum número descreve carteira real.</span></div>
  </section>`;
}

function paginaAbertura(edicao, mapaPdf) {
  const paginas = mapaPdf && mapaPdf.paginas;
  const usar = comoUsar[edicao].map((t) => par(t)).join("");
  const ritmo = edicao === "professor"
    ? `<h3>Ritmo proposto por bloco</h3>${tabela(["Bloco", "Slides", "Minutos"], blocos.map((b) => [esc(b.nome), `${b.de} a ${b.ate}`, String(b.tempo)]).concat([["<b>Total útil</b>", "50 slides", `<b>${blocos.reduce((s, b) => s + b.tempo, 0)}</b>`]]), "ritmo")}
       <p class="nota" style="margin-top:1.5mm">Proposta calculada sobre os 165 minutos úteis definidos no desenho do curso (180 minutos com 15 de intervalo). Não validada em sala. Os blocos de logit e de boosting concentram as contas feitas a mão e os exercícios; se houver folga, reserve a eles.</p>`
    : "";
  const caminho = tabela(["Bloco", "Slides", "Pergunta que o bloco responde"], blocos.map((b) => [esc(b.nome), `${b.de} a ${b.ate}`, esc(b.pergunta)]));
  const clientes = tabela(["Cliente", "Renda", "Comprometimento", "Relacionamento", "Utilização", "Histórico", "Canal"],
    D.clientes.map((c) => [esc(c.nome), F.reais(c.renda), pct(c.comp / 100, 0), F.inteiro(c.rel) + " meses", pct(c.util / 100, 0), c.hist ? "sim" : "não", esc(c.canal)]), "num");
  const dicionario = tabela(["Variável", "Unidade", "Definição", "Disponibilidade"],
    D.dicionario.map((d) => [esc(d.nome), esc(d.unidade), esc(d.descricao), esc(d.disponibilidade)]));
  const fontes = tabela(["Origem", "O que sustenta"], fontesDosNumeros.map(([a, b]) => [esc(a), esc(b)]));
  const mapa = tabela(["Slide", "Título", "Bloco", "Página"], notas.slides.map((s) => [s.n, esc(s.titulo), esc(s.blocoNome), paginas && paginas[s.n] ? String(paginas[s.n]) : ""]));
  return `<section class="secao">
    <h2>Como usar este guia</h2>${usar}${ritmo}
    <h3>O caminho da aula</h3>${caminho}
  </section>
  <section class="secao">
    <h2>Os quatro clientes, o alvo e as variáveis</h2>
    <p>Ana, Bruno, Carla e Diego aparecem no slide 01, antes de qualquer modelo, e voltam no slide 50 com as três técnicas e a política aplicadas. As seis características de cada um são as mesmas do começo ao fim. Perfis fictícios, elegíveis, sem desfecho revelado.</p>
    <h3>Características no momento da proposta</h3>${clientes}
    <h3>O alvo</h3>
    <div class="callout"><p><b>Evento:</b> ${esc(D.alvo.evento)}.</p><p><b>População:</b> ${esc(D.alvo.populacao)}. <b>Unidade:</b> ${esc(D.alvo.unidade)}. <b>Horizonte:</b> ${D.alvo.horizonte} meses.</p></div>
    <h3>Dicionário das variáveis</h3>${dicionario}
    <h3>De onde vêm os números</h3>${fontes}
    <p class="nota" style="margin-top:2mm">Experimento sintético: ${F.inteiro(META.linhas_base)} contratos, semente ${META.semente}, numpy ${esc(META.numpy)}, scikit learn ${esc(META.scikit_learn)}, python ${esc(META.python)}. ${esc(META.observacao)}</p>
  </section>
  <section class="secao">
    <h2>Mapa dos 50 slides</h2>${mapa}
  </section>`;
}

function paginaBloco(b, i, paginas) {
  const lista1 = `<ul class="bloco-lista">${b.aprender.map((t) => `<li>${esc(t)}</li>`).join("")}</ul>`;
  const lista2 = `<ul class="bloco-lista">${b.ideias.map((t) => `<li>${esc(t)}</li>`).join("")}</ul>`;
  const slides = notas.slides.filter((s) => s.bloco === b.chave);
  /* Índice do bloco com a página de cada slide (números da segunda passagem); a ideia para levar
     de cada slide fica na própria página dele. Blocos longos usam duas colunas. */
  const linhas = slides.map((s) => [s.n, esc(s.titulo), paginas && paginas[s.n] ? String(paginas[s.n]) : ""]);
  const cols = ["Slide", "Título", "Página"];
  const tab = linhas.length > 7
    ? `<div class="duas">${tabela(cols, linhas.slice(0, Math.ceil(linhas.length / 2)))}${tabela(cols, linhas.slice(Math.ceil(linhas.length / 2)))}</div>`
    : tabela(cols, linhas);
  return `<section class="bloco-abre" data-bloco="${b.chave}">
    <div class="bloco-cab"><div class="bloco-num">${i + 1}</div><div><p class="eyebrow">Bloco ${i + 1} de 5 · slides ${b.de} a ${b.ate}</p><h2>${esc(b.nome)}</h2><p class="perg">${esc(b.pergunta)}</p></div></div>
    <div class="bloco-corpo"><div><h3>O que você vai aprender</h3>${lista1}</div><div><h3>Ideias para levar</h3>${lista2}</div></div>
    <div class="bloco-slides"><h3>Os slides deste bloco</h3>${tab}</div>
  </section>`;
}

function figura(edicao, s) {
  const inicial = edicao === "aluno" && EXERCICIOS.includes(s.n);
  const estado = inicial ? "estado inicial, antes de conferir" : "estado revelado, com os controles e as etapas abertas";
  const legenda = edicao === "professor" ? `Slide ${s.n} como aparece na projeção, no ${estado}.` : `Slide ${s.n} como aparece na tela (${estado}). ${esc(s.resumo)}`;
  return `<figure class="slide-fig"><img src="cap/${edicao}/${s.n}.png" alt="${esc(s.resumo)}"><figcaption>${legenda}</figcaption></figure>`;
}

function exercicioHtml(ex, edicao) {
  const opcoes = ex.opcoes ? `<div class="opcoes">${ex.opcoes.map((o) => `<span>${esc(o)}</span>`).join("")}</div>` : "";
  const etapas = ex.etapas ? `<p class="rotulo" style="margin-top:2.5mm">Etapas</p><ol class="etapas">${ex.etapas.map((e) => `<li>${esc(e)}</li>`).join("")}</ol>` : "";
  const desafio = ex.desafio ? `<p class="rotulo" style="margin-top:2.5mm">Desafio</p><p>${esc(ex.desafio)}</p>` : "";
  const linhas = edicao === "aluno" && !ex.etapas ? `<div class="linhas"><div></div><div></div><div></div></div>` : "";
  /* Alternativas que já trazem o próprio rótulo (A, B, C ou 1, 2, 3) não recebem a numeração da lista. */
  const rotuladas = ex.itens.every((i) => /^([A-Z]|\d+)\.\s/.test(i));
  const itens = rotuladas ? `<ul class="alts">${ex.itens.map((i) => `<li>${esc(i)}</li>`).join("")}</ul>` : ol(ex.itens);
  return `<div class="exercicio"><p class="rotulo">Exercício</p><h4>${esc(ex.titulo)}</h4><p>${esc(ex.instrucao)}</p>${itens}${opcoes}${etapas}${desafio}${linhas}</div>`;
}

function paginaSlide(edicao, s) {
  const c = conteudo[s.n];
  const cab = `<div class="slide-cab"><div><p class="eyebrow"><b>${esc(s.blocoNome)}</b> · slide ${s.n} de 50</p><h3>${esc(s.titulo)}</h3>${s.subtitulo ? `<p class="slide-sub">${esc(s.subtitulo)}</p>` : ""}</div><div class="n">${s.n}</div></div>`;
  const formulas = (c.formulas || []).map((f) => `<div class="formula">${tex(f.tex)}<p class="nota">${esc(f.nota)}</p></div>`).join("");
  const levar = `<div class="levar"><b>${esc(s.conclusao)}</b><span>${esc(s.fonte)}</span></div>`;
  let corpo;
  if (edicao === "aluno") {
    corpo = `<p class="prosa">${esc(c.comoLer)}</p>${formulas}
      <div class="caixa apoio"><p class="rotulo">Na tela</p><p>${esc(c.naTela)}</p></div>
      ${c.exercicio ? exercicioHtml(c.exercicio, edicao) : ""}`;
  } else {
    const n = s.notas;
    const caixa = (cls, titulo, itens) => `<div class="caixa ${cls}"><p class="rotulo">${esc(titulo)}</p>${lista(itens)}</div>`;
    const presentes = [["objetivo", "Condução", n.conducao], ["resposta", "Respostas esperadas", n.respostas],
                       ["cuidado", "Cuidados e limites", n.cuidados], ["apoio", "Aprofundar", n.aprofundar]]
      .filter((c) => c[2] && c[2].length);
    /* Caixas em pares lado a lado; cada par é indivisível e a paginação quebra entre pares. Em
       número ímpar, a última caixa ocupa a largura toda em vez de deixar a coluna vizinha vazia. */
    let caixasHtml = "";
    for (let i = 0; i < presentes.length; i += 2) {
      if (i + 1 < presentes.length) caixasHtml += `<div class="par">${caixa(presentes[i][0], presentes[i][1], presentes[i][2])}${caixa(presentes[i + 1][0], presentes[i + 1][1], presentes[i + 1][2])}</div>`;
      else caixasHtml += caixa(presentes[i][0] + " larga", presentes[i][1], presentes[i][2]);
    }
    /* As fórmulas ficam na edição do aluno; aqui o slide já as mostra e o espaço vai para as notas. */
    const topo = `<div class="slide-topo">${figura(edicao, s)}<div class="lado">
        <div class="caixa apoio"><p class="rotulo">Na tela</p><p>${esc(s.resumo)} ${esc(c.naTela)}</p></div>
        ${n.transicao ? `<div class="caixa transicao"><p class="rotulo">Transição para o slide ${s.proximo ? s.proximo.n : "seguinte"}</p><p>${esc(n.transicao)}</p></div>` : ""}
      </div></div>`;
    corpo = `<div class="notas">${caixasHtml}</div>
      ${c.exercicio ? exercicioHtml(c.exercicio, edicao) : ""}`;
    return `<section class="slide professor" data-bloco="${s.bloco}" id="slide-${s.n}">${cab}${topo}<div class="slide-corpo">${corpo}${levar}</div></section>`;
  }
  return `<section class="slide" data-bloco="${s.bloco}" id="slide-${s.n}">${cab}${figura(edicao, s)}<div class="slide-corpo">${corpo}${levar}</div></section>`;
}

function tabelaComparacao() {
  const chaves = ["logit", "arvore", "boosting"];
  const nomes = { logit: "Logit regularizado", arvore: "Árvore controlada", boosting: "Gradient boosting" };
  const corte = R.politica.logit.corte_congelado;
  const dados = chaves.map((k) => {
    const a = R.avaliacao[k].teste;
    const lista = R.politica[k].teste;
    const pol = lista.reduce((m, l) => Math.abs(l.corte - corte) < Math.abs(m.corte - corte) ? l : m, lista[0]);
    return { k, a, pol };
  });
  const linhas = [
    ["AUC no teste", ...dados.map((d) => num(d.a.auc, 4))],
    ["Brier, previsões calibradas", ...dados.map((d) => num(d.a.brier_calibrada, 5))],
    ["Taxa de aprovação", ...dados.map((d) => pct(d.pol.aprovacao, 1))],
    ["Inadimplência entre aprovados", ...dados.map((d) => d.pol.inadimplencia === null ? "não definida" : pct(d.pol.inadimplencia, 2))],
    ["Resultado por aprovado", ...dados.map((d) => F.reais(d.pol.resultado_medio))],
    ["Resultado total da carteira", ...dados.map((d) => F.reais(d.pol.resultado_total))],
  ];
  const t = tabela(["Evidência no teste", ...chaves.map((k) => nomes[k])], linhas, "num");
  const nTeste = R.avaliacao.logit.teste;
  return `${t}<p class="nota" style="margin-top:1.5mm">Teste de fevereiro a julho de 2024, ${F.inteiro(nTeste.n)} contratos e ${F.inteiro(nTeste.eventos)} eventos. Política congelada antes do teste: aprovar quando a PD calibrada não passa de ${pct(corte, 0)}, o ponto de equilíbrio econômico do slide 47. Fonte: experimento sintético, semente ${META.semente}, mesma tabela do slide 49.</p>`;
}

function tabelaClientes() {
  const corte = R.politica.logit.corte_congelado;
  const chaves = ["logit", "arvore", "boosting"];
  const linhas = R.clientes.nomes.map((nome, i) => {
    const pds = chaves.map((k) => R.clientes.pd_modelos_calibrada[k][i]);
    const decisao = pds.every((p) => p <= corte) ? "aprovado nos três" : pds.every((p) => p > corte) ? "recusado nos três" : "depende do modelo";
    return [esc(nome), ...pds.map((p) => pct(p, 2)), decisao];
  });
  return `${tabela(["Cliente", "Logit", "Árvore", "Boosting", "No corte de " + pct(corte, 0)], linhas, "num")}<p class="nota" style="margin-top:1.5mm">PDs calibradas dos modelos do experimento sintético, as mesmas que a política usa. As PDs sem calibração aparecem nos slides 37 e 41; a PD do logit manual de Bruno (11,66%) é de outro universo, o exemplo didático dos slides 07 a 20.</p>`;
}

function paginaFecho(edicao) {
  const sintese = tabela(["Técnica", "Como constrói a PD", "Principal cuidado", "Evidência necessária"], [
    ["Regressão logística", "soma funções das características em um escore e converte pela logística", "especificação, unidade das variáveis e leitura dos coeficientes", "validação da forma funcional e calibração fora do tempo"],
    ["Árvore de decisão", "aprende regras sucessivas e usa a frequência observada na folha", "complexidade, tamanho de folha e instabilidade entre amostras", "desempenho fora do tempo e estabilidade entre reamostragens"],
    ["Gradient boosting", "acrescenta contribuições sucessivas ao escore e converte no fim", "trajetória de ajuste, complexidade de cada árvore e explicação", "curva de validação, parada definida antes e verificação de calibração"],
  ].map((l) => l.map(esc)));
  const erros = tabela(["Bloco", edicao === "professor" ? "Sinal na turma" : "Erro frequente", edicao === "professor" ? "Como intervir" : "Como se corrige"],
    errosComuns.map(([b, e, c]) => [esc(blocoDe(b).nome), esc(e), esc(c)]));
  const roteiro = `<ol>${roteiroAplicacao.map(([k, v]) => `<li><b>${esc(k)}:</b> ${esc(v)}</li>`).join("")}</ol>`;
  const gloss = `<dl class="gloss">${glossario.map(([t, d]) => `<div><dt>${esc(t)}</dt><dd>${esc(d)}</dd></div>`).join("")}</dl>`;
  const saida = edicao === "aluno"
    ? `<section class="secao"><h2>Antes da próxima aula, você deve conseguir</h2><ul class="check">${verificacaoSaida.map((t) => `<li>${esc(t)}</li>`).join("")}</ul>
       <h3>Cuidados de estudo</h3>${erros}</section>`
    : `<section class="secao"><h2>Sinais para observar na turma</h2><p>Confusões que os exercícios e as perguntas de recuperação expõem, com a correção que os próprios slides oferecem.</p>${erros}
       <h3>Lista de verificação de saída do aluno</h3><p class="nota">O que o guia do aluno pede que ele consiga fazer ao fim da aula.</p><ul class="check">${verificacaoSaida.map((t) => `<li>${esc(t)}</li>`).join("")}</ul></section>`;
  return `<section class="secao">
    <h2>Síntese das três técnicas</h2>${sintese}
    <p style="margin-top:2mm"><b>Para os três:</b> informação disponível na decisão, validação temporal, calibração das probabilidades e conexão com a decisão econômica.</p>
    <h3>Os três modelos no teste, com a mesma política</h3>${tabelaComparacao()}
    <h3>Os quatro clientes nos três modelos</h3>${tabelaClientes()}
    <h3>Roteiro para aplicar no trabalho</h3>${roteiro}
  </section>
  ${saida}
  <section class="secao"><h2>Glossário</h2>${gloss}</section>`;
}

function documento(edicao, paginas) {
  const corpo = [paginaCapa(edicao, paginas), paginaAbertura(edicao, paginas)];
  blocos.forEach((b, i) => {
    corpo.push(paginaBloco(b, i, paginas && paginas.paginas));
    notas.slides.filter((s) => s.bloco === b.chave).forEach((s) => corpo.push(paginaSlide(edicao, s)));
  });
  corpo.push(paginaFecho(edicao));
  return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>Aula 2 · ${esc(nomeEdicao(edicao))}</title><style>${CSS}</style></head><body>${corpo.join("\n")}</body></html>`;
}

/* ---------------------------------------------------------------- PDF */

function modeloCabecalho(edicao) {
  const base = "font-family:'Liberation Sans',Arial,sans-serif;font-size:7.5px;color:#5B6475;width:100%;padding:0 16mm;display:flex;justify-content:space-between;align-items:center";
  return {
    headerTemplate: `<div style="${base};padding-top:5mm"><span>${esc(capa.curso)} · ${esc(capa.aula)} · ${esc(capa.titulo)}</span><span style="color:#00205B;font-weight:700;letter-spacing:.08em;text-transform:uppercase">${esc(nomeEdicao(edicao))}</span></div>`,
    footerTemplate: `<div style="${base};padding-bottom:4mm"><span>Versão da aula ${esc(VERSAO)} · gerado em ${esc(DATA)} · dados sintéticos</span><span><span class="pageNumber"></span> de <span class="totalPages"></span></span></div>`,
  };
}

async function gerarPdf(html, pdf, edicao) {
  const b = await chromium.launch({ executablePath: EXE });
  const p = await b.newPage();
  const erros = [];
  p.on("pageerror", (e) => erros.push(String(e)));
  await p.goto("file://" + html, { waitUntil: "load" });
  await p.waitForTimeout(400);
  /* Conferência do texto exibido: nenhum hífen ou travessão, nenhuma fórmula com erro. */
  const check = await p.evaluate(() => {
    const t = document.body.innerText;
    const tracos = (t.match(/[-–—]/g) || []).length;
    const erros = document.querySelectorAll(".katex-error").length;
    const imgs = [...document.images].filter((i) => !i.complete || !i.naturalWidth).length;
    const largura = document.documentElement.scrollWidth;
    return { tracos, erros, imgs, largura, palavras: t.split(/\s+/).length };
  });
  await p.emulateMedia({ media: "print" });
  await p.pdf({ path: pdf, format: "A4", printBackground: true, displayHeaderFooter: true,
    margin: { top: "17mm", bottom: "15mm", left: "15mm", right: "15mm" }, ...modeloCabecalho(edicao) });
  await b.close();
  return { ...check, pageErrors: erros };
}

function paginasDosSlides(pdf) {
  /* Mapa slide → página, lido do PDF com PyMuPDF (o eyebrow "slide NN de 50" é texto na página do slide). */
  const secoes = SECOES("professor").map((s) => s[0]).concat(SECOES("aluno").map((s) => s[0]));
  const script = `
import fitz, json, re, sys
fitz.TOOLS.mupdf_display_errors(False)
doc = fitz.open(sys.argv[1]); mapa = {}; secoes = {}
chaves = json.loads(sys.argv[2])
for i, page in enumerate(doc):
    texto = page.get_text()
    for m in re.finditer(r"slide (\\d\\d) de 50", texto, re.IGNORECASE):
        mapa.setdefault(m.group(1), i + 1)
    if i == 0: continue  # a capa cita as seções no sumário
    plano = re.sub(r"\\s+", " ", texto)
    for chave in chaves:
        if chave not in secoes and re.search(re.escape(chave), plano, re.IGNORECASE): secoes[chave] = i + 1
print(json.dumps({"paginas": mapa, "secoes": secoes, "total": len(doc)}))`;
  /* PyMuPDF pode escrever avisos antes do resultado: só a última linha é o JSON. */
  const saida = execFileSync("python3", ["-c", script, pdf, JSON.stringify(secoes)], { encoding: "utf8" }).trim().split("\n");
  return JSON.parse(saida[saida.length - 1]);
}

/* ----------------------------------------------------------------- main */

for (const edicao of EDICOES) {
  const dirCap = path.join(SAIDA, "cap", edicao);
  if (!opc("--sem-captura") || !fs.existsSync(path.join(dirCap, "50.png"))) {
    process.stdout.write(`capturando os 50 slides (${edicao})... `);
    await capturar(edicao, dirCap);
    console.log("ok");
  }
  const nome = `aula-2-guia-do-${edicao}`;
  const html = path.join(SAIDA, nome + ".html");
  const pdf = path.join(SAIDA, nome + ".pdf");
  fs.writeFileSync(html, documento(edicao, null));
  if (opc("--sem-pdf")) { console.log("html:", html); continue; }
  let check = await gerarPdf(html, pdf, edicao);
  let mapa = paginasDosSlides(pdf);
  /* Segunda passagem: o mapa dos slides recebe os números de página e o PDF é gerado de novo;
     as páginas não mudam entre as passagens porque a tabela ocupa as mesmas linhas. */
  fs.writeFileSync(html, documento(edicao, mapa));
  check = await gerarPdf(html, pdf, edicao);
  const mapa2 = paginasDosSlides(pdf);
  const estavel = JSON.stringify(mapa2.paginas) === JSON.stringify(mapa.paginas) && JSON.stringify(mapa2.secoes) === JSON.stringify(mapa.secoes);
  const faltam = notas.slides.map((s) => s.n).filter((n) => !mapa2.paginas[n]);
  fs.mkdirSync(PUBLICO, { recursive: true });
  fs.copyFileSync(pdf, path.join(PUBLICO, nome + ".pdf"));
  console.log(`${nome}.pdf: ${mapa2.total} páginas, ${Math.round(fs.statSync(pdf).size / 1024)} KB · slides sem página no mapa: ${faltam.length ? faltam.join(", ") : "nenhum"} · mapa estável entre as passagens: ${estavel ? "sim" : "NÃO"} · traços no texto: ${check.tracos} · fórmulas com erro: ${check.erros} · imagens ausentes: ${check.imgs} · erros de página: ${check.pageErrors.length}`);
  if (check.tracos || check.erros || check.imgs || check.pageErrors.length || faltam.length || !estavel) process.exitCode = 1;
}
