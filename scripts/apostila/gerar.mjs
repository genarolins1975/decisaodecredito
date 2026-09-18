/**
 * Apostila do Laboratório de Decisão de Crédito: um PDF por capítulo, em duas versões (aluno e professor), explicando slide a slide.
 * Fontes: content/generated/extract.json (conteúdo, guia docente, questões), scripts/apostila/explicacoes/cNN.json (como ler e como
 * conduzir cada slide), capturas das páginas da plataforma (fig/<slug>.png, por captura-visuais.mjs), infográfico de abertura
 * (fig/infografico-cN.svg, por infograficos.py) e figura conceitual (fig/conceito-*.svg, por figuras.py).
 * Uso: node scripts/apostila/gerar.mjs <aluno|professor> [capitulos ex.: 1,2 | todos] [--pdf]
 *      APOSTILA_DIR define onde ficam fig/ e build/ (padrão tmp/apostila). Saída: build/capitulo-NN-<versao>.pdf
 */
import fs from "node:fs"; import path from "node:path"; import { fileURLToPath } from "node:url"; import { chromium } from "playwright";
const AQUI = path.dirname(fileURLToPath(import.meta.url)); const REPO = path.resolve(AQUI, "../.."); const S = path.resolve(process.env.APOSTILA_DIR ?? path.join(REPO, "tmp/apostila")); const FIG = path.join(S, "fig"); const BUILD = path.join(S, "build"); fs.mkdirSync(BUILD, { recursive: true });
const ex = JSON.parse(fs.readFileSync(path.join(REPO, "content/generated/extract.json"), "utf8"));
const sint = JSON.parse(fs.readFileSync(path.join(AQUI, "sinteses.json"), "utf8")); const figMeta = JSON.parse(fs.readFileSync(path.join(FIG, "_meta.json"), "utf8"));
const versao = process.argv[2] ?? "aluno"; const capArg = process.argv[3] && !process.argv[3].startsWith("--") ? process.argv[3] : "todos"; const caps = capArg === "todos" ? [1,2,3,4,5,6,7,8,9,10,11] : capArg.split(",").map(Number); const pdf = process.argv.includes("--pdf");
const PROF = versao === "professor";
const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const ORI = { sint: "exemplo sintético", obs: "dado observado", doc: "documento institucional", esq: "esquema sem escala", rec: "reconstrução didática" };
const pad = (n) => String(n).padStart(2, "0");
const explicacoes = (n) => { const f = path.join(AQUI, "explicacoes", `c${pad(n)}.json`); return fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, "utf8")) : {}; };
const par = (t) => t ? `<p>${esc(t)}</p>` : "";
const caixa = (cls, titulo, corpo) => corpo ? `<aside class="caixa ${cls}"><p class="caixa-t">${titulo}</p>${corpo}</aside>` : "";

/** Captura da página (peça nativa ou corpo do conteúdo), com classe de proporção para o ajuste de altura. */
function figura(p, legenda) {
  const m = figMeta[p.id]; if (!m || !fs.existsSync(path.join(FIG, p.id + ".png"))) return "";
  if (m.tipo === "conteudo" && m.h < 120) return ""; // página cujo conteúdo é só a pergunta: a captura ficaria vazia
  const razao = m.h / m.w; const cls = razao > 1.15 ? "alta" : razao > 0.7 ? "media" : "larga";
  return `<figure class="visual ${cls}"><img src="file://${FIG}/${p.id}.png" alt="${esc(legenda)}"><figcaption>${esc(legenda)}</figcaption></figure>`;
}
function questoes(p) {
  let h = "";
  for (const q of p.questoes ?? []) {
    h += `<div class="questao"><p class="caixa-t">Questão${q.rot ? " · " + esc(q.rot) : ""}</p><p class="q-perg">${esc(q.pergunta)}</p><ol class="alts" type="a">${(q.alt ?? []).map((a, i) => `<li${PROF && i === q.certa ? ' class="certa"' : ""}>${esc(a)}</li>`).join("")}</ol>`;
    if (PROF) { h += `<div class="gabarito"><p><b>Correta: ${String.fromCharCode(97 + (q.certa ?? 0))}.</b> ${esc(q.porqueCerta ?? "")}</p>`; for (const [i, e] of (q.erros ?? []).entries()) if (e && (e.confusao || e.conc)) h += `<p><b>${String.fromCharCode(97 + i)}:</b> ${esc(e.confusao ?? e.conc)}</p>`; h += "</div>"; }
    h += "</div>";
  }
  for (const pv of p.prever ?? []) {
    h += `<div class="questao prever"><p class="caixa-t">Antes de ver a resposta, decida</p><p class="q-perg">${esc(pv.pergunta)}</p><p class="hint">Opções: ${(pv.opcoes ?? []).map(esc).join(" · ")}</p>${PROF && pv.revealHtml ? `<div class="gabarito">${limparRevelacao(pv.revealHtml)}</div>` : ""}</div>`;
  }
  return h;
}
const limparRevelacao = (h) => String(h).replace(/<style[\s\S]*?<\/style>/g, "").replace(/\sonclick="[^"]*"/g, "").replace(/\sid="[^"]*"/g, "").replace(/<button[\s\S]*?<\/button>/g, "").replace(/<(?!\/?(p|b|i|em|strong|ul|ol|li|h4|br|table|thead|tbody|tr|th|td|span|div)\b)[^>]+>/g, "");
/** Ficha de aula do professor: o que não coube na condução em prosa. */
function fichaDeAula(p) {
  const g = p.guia ?? {}; const t = p.t ?? {};
  const erros = (g.erros ?? []).filter((e) => e.alt && e.confusao).map((e) => `<li><b>${esc(e.alt)}.</b> ${esc(e.confusao)} <i>Intervenção:</i> ${esc(e.intervencao ?? "")}</li>`).join("");
  const extra = ["arquivos", "saida", "prompt", "alternativa", "hipotese"].filter((k) => g[k]).map((k) => `<p><b>${{ arquivos: "Arquivos", saida: "Saída esperada", prompt: "Prompt sugerido à IA", alternativa: "Alternativa sem ferramenta", hipotese: "Hipóteses do exemplo" }[k]}.</b> ${esc(g[k])}</p>`).join("");
  return `<aside class="ficha"><p class="caixa-t">Na hora da aula</p>
    <p class="tempo">Exposição ${t.exp ?? 0} · exemplo ${t.ex ?? 0} · prática ${t.prat ?? 0} · discussão ${t.disc ?? 0} min · origem: ${ORI[p.origem] ?? p.origem} · versão de 120 min: ${esc(p.nivel120 === "essencial" ? "entra" : "estudo assíncrono")}</p>
    <div class="ficha-grade"><div>${g.pergunta ? `<p><b>Pergunta para a turma.</b> ${esc(g.pergunta)}</p>` : ""}${g.resposta ? `<p class="resposta"><b>Resposta esperada.</b> ${esc(g.resposta)}</p>` : ""}${g.interacao ? `<p><b>Interação na plataforma.</b> ${esc(g.interacao)}</p>` : ""}</div>
    <div>${erros ? `<p><b>Erros previsíveis.</b></p><ul>${erros}</ul>` : ""}${g.verificacao ? `<p><b>Sinal de que a página está cumprida.</b> ${esc(g.verificacao)}</p>` : ""}${g.transicao ? `<p><b>Transição.</b> ${esc(g.transicao)}</p>` : ""}</div></div>${extra}</aside>`;
}
function pagina(p, expl) {
  const e = expl[p.id] ?? {}; const texto = PROF ? e.professor : e.aluno;
  const legenda = `Slide ${p.cap}.${p.n}, como aparece na plataforma${figMeta[p.id]?.tipo === "nativo" ? ", onde é interativo" : ""}.`;
  const explic = texto ? `<div class="explica"><p class="caixa-t">${PROF ? "Como conduzir este slide" : "Como ler este slide"}</p><p>${esc(texto)}</p></div>` : "";
  const apoio = p.apoio ? caixa("apoio", "O que está na tela", par(p.apoio)) : "";
  const discutir = !PROF && p.guia?.pergunta ? caixa("verifique", "Para discutir em aula", par(p.guia.pergunta)) : "";
  return `<section class="pagina" id="${p.id}">
    <div class="topo"><header class="pag-h"><span class="pag-n">${p.cap}.${p.n}</span><h3>${esc(p.titulo)}</h3><span class="pag-meta">${p.nivel} · ${p.min} min</span></header>
    ${p.aprendizado ? `<p class="lead">${esc(p.aprendizado)}</p>` : ""}
    ${figura(p, legenda) || explic}</div>
    ${figura(p, legenda) ? explic : ""}
    ${apoio || discutir ? `<div class="duas">${apoio}${discutir}</div>` : ""}
    ${questoes(p)}
    ${p.conexao ? `<p class="conexao"><span class="eyebrow">A seguir</span> ${esc(p.conexao)}</p>` : ""}
    ${PROF ? fichaDeAula(p) : ""}
  </section>`;
}
function errosComuns(pages) {
  const rows = []; for (const p of pages) for (const e of p.guia?.erros ?? []) if (e.alt && e.confusao) rows.push(`<tr><td>${p.cap}.${p.n}</td><td>${esc(e.alt)}</td><td>${esc(e.confusao)}</td><td>${esc(e.intervencao ?? "")}</td></tr>`);
  if (!rows.length) return ""; return `<h3>Erros comuns e como evitá-los</h3><table class="erros"><thead><tr><th>#</th><th>Erro</th><th>Confusão por trás</th><th>${PROF ? "Intervenção em aula" : "Como se corrige"}</th></tr></thead><tbody>${rows.join("")}</tbody></table>`;
}
function fecho(pages) {
  const ess = pages.filter((p) => p.nivel === "essencial");
  if (PROF) {
    const linhas = ess.map((p) => { const t = p.t ?? {}; return `<tr><td>${p.cap}.${p.n}</td><td>${esc(p.titulo)}</td><td>${t.exp ?? 0}</td><td>${t.ex ?? 0}</td><td>${t.prat ?? 0}</td><td>${t.disc ?? 0}</td><td><b>${p.min}</b></td></tr>`; }).join("");
    const total = ess.reduce((s, p) => s + p.min, 0);
    return `<h3>Roteiro do encontro <span class="hint">páginas essenciais · ${total} min</span></h3><table class="roteiro"><thead><tr><th>#</th><th>Página</th><th>Expos.</th><th>Exemplo</th><th>Prática</th><th>Discus.</th><th>Total</th></tr></thead><tbody>${linhas}</tbody></table>`;
  }
  return `<h3>Antes da próxima aula, você deve conseguir explicar</h3><ul class="checklist">${ess.filter((p) => p.aprendizado).map((p) => `<li><b>${p.cap}.${p.n}</b> ${esc(p.aprendizado)}</li>`).join("")}</ul>`;
}
function capitulo(n) {
  const c = ex.meta.capitulos.find((x) => x.n === n); const pages = ex.pages.filter((p) => p.cap === n).sort((a, b) => a.n - b.n); const sz = sint[String(n)]; const [cor, corSuave] = ex.meta.temas[String(n)] ?? ["#00205B", "#eef3fb"];
  const expl = explicacoes(n); const aula = ex.meta.aulas.find((a) => a.caps.includes(n));
  const essenciais = pages.filter((p) => p.nivel === "essencial"); const min = essenciais.reduce((s, p) => s + p.min, 0);
  const linha = (p) => `<tr class="${p.nivel}"><td>${p.n}</td><td>${esc(p.titulo)}</td><td>${esc(p.aprendizado ?? "")}</td><td>${p.min}</td></tr>`;
  const mapa = `<table class="mapa"><thead><tr><th>#</th><th>Página</th><th>O que ela entrega</th><th>min</th></tr></thead><tbody>${pages.map(linha).join("")}</tbody></table><p class="hint">Páginas em cinza são complementares: aprofundam no estudo e não entram no tempo de aula (${essenciais.length} essenciais, ${min} min).</p>`;
  const infoPath = path.join(FIG, `infografico-c${n}.svg`); const info = fs.existsSync(infoPath) ? infoPath : null;
  const grade = `<div class="cap-grade"><div><p class="caixa-t">O que você aprende</p><p>${esc(c.aprende)}</p></div><div><p class="caixa-t">Por que importa</p><p>${esc(c.motiva)}</p></div><div><p class="caixa-t">A atividade</p><p>${esc(c.atividade)}</p></div><div><p class="caixa-t">Antes de começar</p><p>${esc(c.prereq)}</p></div></div>
      <p class="cap-usa"><b>Onde isto é usado depois.</b> ${esc(c.usa)}</p>`;
  const ideia = sz ? `<h2>A ideia central</h2><p class="sintese">${esc(sz.sintese)}</p>${sz.figura && fs.existsSync(path.join(FIG, sz.figura + ".svg")) ? `<figure class="conceito"><img src="file://${FIG}/${sz.figura}.svg" alt=""><figcaption>${esc(sz.legenda)}</figcaption></figure>` : ""}` : "";
  const como = PROF
    ? `<ul><li>Cada slide traz a captura da plataforma, o texto <b>Como conduzir este slide</b> (o roteiro de fala, na ordem da aula) e a ficha <b>Na hora da aula</b> com a pergunta para a turma, a resposta esperada, os erros previsíveis e a transição.</li><li>As questões aparecem com gabarito e com a confusão por trás de cada alternativa errada. Este material contém gabaritos: não circula entre alunos.</li><li>O roteiro do encontro, no fecho, distribui os ${min} minutos das páginas essenciais.</li></ul>`
    : `<ul><li>Cada slide traz a captura da plataforma e o texto <b>Como ler este slide</b>: o que o visual mostra, como ler e o que levar. Na plataforma, os visuais são interativos; mova os controles descritos no texto.</li><li>Responda às questões antes de ver o feedback na plataforma. <b>Para discutir em aula</b> é a pergunta que o professor vai fazer.</li><li>Leia a ideia central antes da aula e releia depois. O fecho lista o que você deve conseguir explicar.</li></ul>`;
  return `<section class="capitulo" style="--cor:${cor};--cor-suave:${corSuave}">
    <section class="capa">
      <p class="eyebrow">Laboratório de Decisão de Crédito · ${aula ? (aula.tipo === "trabalho" ? "trabalho final" : `aula ${aula.n}`) + " · " : ""}${PROF ? "versão do professor" : "versão do aluno"}</p>
      ${info ? `<figure class="infografico"><img src="file://${info}" alt="Infográfico de abertura do capítulo ${n}"></figure>` : `<div class="capa-num"><span class="num">${pad(n)}</span><div><p class="eyebrow">Capítulo ${n} de 11</p><h1>${esc(c.nome)}</h1><p class="cap-pergunta">${esc(c.pergunta)}</p></div></div>${grade}${ideia}`}
      <p class="rodape-capa">Prof. Genaro Dueire Lins · FGV · Edição 2026 · material derivado da plataforma decisaodecredito.com · os números do material são reconstruções didáticas ou exemplos sintéticos, salvo indicação de fonte.</p>
    </section>
    <section class="panorama">
      ${info ? `<div class="capa-num"><span class="num">${pad(n)}</span><div><p class="eyebrow">Capítulo ${n} de 11${aula ? ` · ${aula.tipo === "trabalho" ? "trabalho final" : "aula " + aula.n}: ${esc(aula.titulo)}` : ""}</p><h1>${esc(c.nome)}</h1><p class="cap-pergunta">${esc(c.pergunta)}</p></div></div>${grade}${ideia}` : ""}
      <div class="como"><p class="caixa-t">Como usar este material</p>${como}</div>
      <h2>Mapa do capítulo</h2>${mapa}
    </section>
    ${pages.map((p) => pagina(p, expl)).join("\n")}
    <section class="fecho"><h2>Fecho do capítulo</h2>${fecho(pages)}${errosComuns(pages)}</section>
  </section>`;
}
const CSS = `
@page { size: A4; margin: 15mm 13mm 17mm 13mm; }
:root { --navy: #00205B; --gold: #B8860B; --muted: #52514e; --rule: #dedbd2; --paper: #f5f4f0; --cor: #00205B; --cor-suave: #eef3fb; }
body { font-family: "DejaVu Serif", Georgia, serif; color: #1a1a1a; font-size: 10pt; line-height: 1.45; margin: 0; }
h1, h2, h3, .eyebrow, .caixa-t, .pag-h, table, .hint, figcaption, .tempo, .como, .rodape-capa, .explica, .ficha, .questao, .conexao { font-family: "DejaVu Sans", Arial, sans-serif; }
h1 { font-size: 24pt; color: var(--cor); margin: 2px 0 6px; line-height: 1.12; } h2 { font-size: 14pt; color: var(--cor); margin: 12px 0 6px; } h3 { font-size: 12pt; color: var(--cor); margin: 10px 0 4px; }
.eyebrow { font-size: 8pt; letter-spacing: .12em; text-transform: uppercase; color: var(--gold); font-weight: 700; margin: 0; }
.hint { font-size: 8.2pt; color: var(--muted); font-weight: normal; } p { margin: 0 0 6px; }
.capa { break-after: page; page-break-after: always; border-top: 10px solid var(--cor); padding-top: 8px; }
.capa-num { display: flex; gap: 16px; align-items: flex-start; margin: 8px 0 10px; } .capa-num .num { font-family: "DejaVu Sans", sans-serif; font-weight: 700; font-size: 64pt; line-height: .9; color: var(--cor); opacity: .9; }
.cap-pergunta { font-style: italic; font-size: 13pt; color: #333; margin: 4px 0 0; font-family: "DejaVu Serif", Georgia, serif; }
.cap-grade { display: grid; grid-template-columns: 1fr 1fr; gap: 6px 14px; margin: 8px 0 6px; } .cap-grade > div { background: var(--cor-suave); border-radius: 6px; padding: 8px 10px; border-top: 3px solid var(--cor); } .cap-grade p { margin: 0; font-size: 9.6pt; } .cap-grade .caixa-t { margin-bottom: 3px; }
.cap-usa { font-size: 9.6pt; margin: 6px 0 12px; }
.como { border: 1px solid var(--rule); border-radius: 6px; padding: 8px 12px; font-size: 9pt; margin: 8px 0; } .como ul { margin: 2px 0 0 16px; padding: 0; } .como li { margin-bottom: 3px; }
.rodape-capa { font-size: 7.6pt; color: var(--muted); margin-top: 8px; }
.panorama { break-after: page; page-break-after: always; }
.sintese { background: var(--paper); border-left: 4px solid var(--cor); border-radius: 0 6px 6px 0; padding: 8px 12px; font-size: 10.4pt; }
figure { margin: 6px 0; break-inside: avoid; page-break-inside: avoid; } figure img { max-width: 100%; display: block; margin: 0 auto; } figcaption { font-size: 8pt; color: var(--muted); margin-top: 3px; text-align: center; }
figure.conceito img { max-height: 66mm; } figure.infografico { margin: 8px 0 4px; } figure.infografico img { width: 100%; max-height: 236mm; border: 1px solid var(--rule); border-radius: 6px; }
table.mapa, table.erros, table.roteiro { border-collapse: collapse; width: 100%; font-size: 8.6pt; margin: 4px 0 8px; } .mapa th, .erros th, .roteiro th { text-align: left; background: var(--paper); border-bottom: 1.5px solid var(--cor); padding: 4px 6px; } .mapa td, .erros td, .roteiro td { border-bottom: 1px solid var(--rule); padding: 3px 6px; vertical-align: top; }
.mapa tr.complementar td { color: var(--muted); } .mapa td:first-child, .roteiro td:first-child, .erros td:first-child { width: 6%; color: var(--muted); } .mapa td:nth-child(2) { width: 34%; font-weight: 600; }
.pagina { margin-top: 12px; border-top: 1px solid var(--rule); padding-top: 8px; break-inside: auto; } .topo { break-inside: avoid; page-break-inside: avoid; }
.pag-h { display: flex; align-items: baseline; gap: 10px; break-after: avoid; page-break-after: avoid; } .pag-n { font-weight: 700; color: #fff; background: var(--cor); border-radius: 4px; padding: 1px 7px; font-size: 8.6pt; } .pag-h h3 { margin: 0; flex: 1; } .pag-meta { font-size: 8pt; color: var(--muted); }
.lead { font-size: 10.4pt; font-style: italic; color: #222; border-left: 3px solid var(--cor-suave); padding-left: 8px; margin: 4px 0 6px; break-after: avoid; page-break-after: avoid; }
figure.visual img { border: 1px solid var(--rule); border-radius: 4px; } figure.visual.larga img { max-height: 80mm; } figure.visual.media img { max-height: 112mm; } figure.visual.alta img { max-height: 150mm; }
.explica { background: var(--cor-suave); border-left: 4px solid var(--cor); border-radius: 0 6px 6px 0; padding: 7px 11px; margin: 6px 0; font-size: 9.6pt; line-height: 1.48; break-inside: avoid; page-break-inside: avoid; } .explica p { margin: 2px 0 0; } .explica .caixa-t { color: var(--cor); }
.duas { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; align-items: start; }
.caixa { border: 1px solid var(--rule); border-radius: 5px; padding: 5px 9px; margin: 6px 0; break-inside: avoid; page-break-inside: avoid; } .caixa p { margin: 1px 0; font-size: 9.2pt; } .caixa-t { font-size: 7.6pt; letter-spacing: .1em; text-transform: uppercase; color: var(--muted); font-weight: 700; margin: 0 0 2px; }
.caixa.apoio { background: #fff; } .caixa.verifique { background: #fbf6e6; border-color: #eadba8; }
.questao { border-left: 3px solid var(--cor); padding: 3px 10px; margin: 6px 0; break-inside: avoid; page-break-inside: avoid; font-size: 9.2pt; } .q-perg { margin: 2px 0 3px; font-weight: 600; font-size: 9.6pt; } .alts { margin: 0 0 3px 18px; padding: 0; } .alts li.certa { font-weight: 700; color: #1d5b3b; }
.gabarito { background: #eef6f1; border-radius: 4px; padding: 4px 8px; font-size: 8.8pt; margin-top: 3px; } .gabarito p { margin: 1px 0; } .gabarito h4 { margin: 0 0 2px; font-size: 9.2pt; }
.conexao { font-style: italic; font-size: 9.2pt; color: #333; margin: 4px 0 0; } .conexao .eyebrow { display: inline; margin-right: 6px; }
.ficha { background: #fff8ea; border: 1px solid #eadba8; border-radius: 5px; padding: 5px 9px; margin: 6px 0; font-size: 8.7pt; line-height: 1.38; break-inside: avoid; page-break-inside: avoid; } .ficha p { margin: 1px 0; } .ficha ul { margin: 1px 0 1px 14px; padding: 0; } .ficha .resposta { color: #1d5b3b; } .tempo { color: var(--muted); font-size: 8pt; margin-bottom: 3px; }
.ficha-grade { display: grid; grid-template-columns: 1fr 1fr; gap: 4px 12px; }
.fecho { break-before: page; page-break-before: always; } .fecho h2 { margin-top: 0; } .erros td:nth-child(2) { font-weight: 600; width: 22%; } .checklist { margin: 4px 0 10px 18px; padding: 0; font-size: 9.6pt; } .checklist li { margin-bottom: 3px; }
`;
function documento(n) {
  const c = ex.meta.capitulos.find((x) => x.n === n);
  return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>Capítulo ${n} · ${esc(c.nome)} · ${PROF ? "versão do professor" : "versão do aluno"}</title><style>${CSS}</style></head><body>${capitulo(n)}</body></html>`;
}
const browser = pdf ? await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" }) : null;
for (const n of caps) {
  const c = ex.meta.capitulos.find((x) => x.n === n); const nome = `capitulo-${pad(n)}-${versao}`; const htmlPath = path.join(BUILD, nome + ".html");
  fs.writeFileSync(htmlPath, documento(n));
  if (!pdf) { console.log("html:", htmlPath); continue; }
  const page = await browser.newPage(); await page.goto("file://" + htmlPath, { waitUntil: "load" }); await page.waitForTimeout(600);
  const cab = `Laboratório de Decisão de Crédito · Capítulo ${n} · ${esc(c.nome)} · ${PROF ? "versão do professor, contém gabaritos" : "versão do aluno"}`;
  await page.pdf({ path: path.join(BUILD, nome + ".pdf"), format: "A4", printBackground: true, margin: { top: "15mm", bottom: "17mm", left: "13mm", right: "13mm" }, displayHeaderFooter: true,
    headerTemplate: `<div style="font-size:7.4pt;color:#52514e;width:100%;padding:0 13mm;font-family:DejaVu Sans,Arial,sans-serif;display:flex;justify-content:space-between"><span>${cab}</span></div>`,
    footerTemplate: `<div style="font-size:7.4pt;color:#52514e;width:100%;padding:0 13mm;font-family:DejaVu Sans,Arial,sans-serif;display:flex;justify-content:space-between"><span>Prof. Genaro Dueire Lins · FGV · 2026</span><span><span class="pageNumber"></span> de <span class="totalPages"></span></span></div>` });
  await page.close(); console.log(`pdf: ${nome}.pdf (${(fs.statSync(path.join(BUILD, nome + ".pdf")).size / 1e6).toFixed(1)} MB)`);
}
if (browser) await browser.close();
