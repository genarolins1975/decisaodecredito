/**
 * Apostila do Laboratório de Decisão de Crédito: um PDF por capítulo, em duas versões (aluno e professor).
 * Fontes: content/generated/extract.json (conteúdo, guia docente, questões), figuras capturadas dos visuais (fig/<slug>.png,
 * geradas por captura-visuais.mjs) e figuras conceituais (fig/conceito-*.svg, geradas por figuras.py).
 * Uso: node scripts/apostila/gerar.mjs <aluno|professor> [capitulos ex.: 1,2 | todos] [--pdf]
 *      APOSTILA_DIR define onde ficam fig/ e build/ (padrão tmp/apostila). Saída: build/capitulo-NN-<versao>.pdf
 */
import fs from "node:fs"; import path from "node:path"; import { fileURLToPath } from "node:url"; import { chromium } from "playwright";
const AQUI = path.dirname(fileURLToPath(import.meta.url)); const REPO = path.resolve(AQUI, "../.."); const S = process.env.APOSTILA_DIR ?? path.join(REPO, "tmp/apostila"); const FIG = path.join(S, "fig"); const BUILD = path.join(S, "build"); fs.mkdirSync(BUILD, { recursive: true });
const ex = JSON.parse(fs.readFileSync(path.join(REPO, "content/generated/extract.json"), "utf8"));
const sint = JSON.parse(fs.readFileSync(path.join(AQUI, "sinteses.json"), "utf8")); const figMeta = JSON.parse(fs.readFileSync(path.join(FIG, "_meta.json"), "utf8"));
const legacyCss = fs.readFileSync(path.join(REPO, "content/generated/legacy-scoped.css"), "utf8"); const katexCss = fs.readFileSync(path.join(REPO, "node_modules/katex/dist/katex.min.css"), "utf8").replace(/url\(fonts\//g, `url(file://${REPO}/node_modules/katex/dist/fonts/`);
const versao = process.argv[2] ?? "aluno"; const capArg = process.argv[3] && !process.argv[3].startsWith("--") ? process.argv[3] : "todos"; const caps = capArg === "todos" ? [1,2,3,4,5,6,7,8,9,10,11] : capArg.split(",").map(Number); const pdf = process.argv.includes("--pdf");
const PROF = versao === "professor";
const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const ORI = { sint: "visual sintético", obs: "dados observados", doc: "documento", esq: "esquema", rec: "reconstrução didática" };
const pad = (n) => String(n).padStart(2, "0");

/** HTML da página estática: remove controles interativos, questões nativas e botões; mantém textos, tabelas, svgs e fórmulas. */
function limpar(html) {
  return html.replace(/<div data-block="question"[^>]*><\/div>/g, "").replace(/<div class="linhabotoes"[\s\S]*?<\/div>/g, "").replace(/<button[\s\S]*?<\/button>/g, "").replace(/<input[^>]*>/g, "").replace(/<select[\s\S]*?<\/select>/g, "")
    .replace(/<div class="revelacao"[\s\S]*?<\/div>/g, (m) => PROF ? m.replace('class="revelacao"', 'class="revelacao aberta"') : "").replace(/\sonclick="[^"]*"/g, "").replace(/\sid="[^"]*"/g, "");
}
/** Figura capturada: altura limitada para caber com o texto na mesma página; visuais altos ficam mais estreitos, centrados. */
function figura(slug, legenda) {
  const m = figMeta[slug]; if (!m || !fs.existsSync(path.join(FIG, slug + ".png"))) return "";
  const razao = m.h / m.w; const cls = razao > 0.9 ? "alta" : razao > 0.55 ? "media" : "larga";
  return `<figure class="visual ${cls}"><img src="file://${FIG}/${slug}.png" alt="${esc(legenda)}"><figcaption>${esc(legenda)}</figcaption></figure>`;
}
const caixa = (cls, titulo, corpo) => corpo ? `<aside class="caixa ${cls}"><p class="caixa-t">${titulo}</p>${corpo}</aside>` : "";
const par = (t) => t ? `<p>${esc(t)}</p>` : "";

function questoes(p) {
  let h = "";
  for (const q of p.questoes ?? []) {
    h += `<div class="questao"><p class="caixa-t">Questão · ${esc(q.rot ?? "")}</p><p class="q-perg">${esc(q.pergunta)}</p><ol class="alts" type="a">${(q.alt ?? []).map((a, i) => `<li${PROF && i === q.certa ? ' class="certa"' : ""}>${esc(a)}</li>`).join("")}</ol>`;
    if (PROF) { h += `<div class="gabarito"><p><b>Correta: ${String.fromCharCode(97 + (q.certa ?? 0))}.</b> ${esc(q.porqueCerta ?? "")}</p>`; for (const [i, e] of (q.erros ?? []).entries()) if (e && (e.confusao || e.conceito)) h += `<p class="erro"><b>Se marcou ${String.fromCharCode(97 + i)}:</b> ${esc(e.confusao ?? "")} ${esc(e.conceito ?? "")}</p>`; h += "</div>"; }
    h += "</div>";
  }
  for (const pv of p.prever ?? []) {
    h += `<div class="questao prever"><p class="caixa-t">Antes de ver a resposta, decida</p><p class="q-perg">${esc(pv.pergunta)}</p><p class="hint">Opções: ${(pv.opcoes ?? []).map(esc).join(" · ")}</p>${PROF ? `<div class="gabarito">${pv.revealHtml ?? ""}</div>` : ""}</div>`;
  }
  return h;
}
function guiaDocente(p) {
  const g = p.guia ?? {}; const t = p.t ?? {};
  const erros = (g.erros ?? []).map((e) => `<li><b>${esc(e.alt)}</b> · ${esc(e.confusao)} <i>Intervenção:</i> ${esc(e.intervencao)}</li>`).join("");
  const extra = ["arquivos", "saida", "prompt", "alternativa", "hipotese"].filter((k) => g[k]).map((k) => `<p><b>${{ arquivos: "Arquivos", saida: "Saída esperada", prompt: "Prompt sugerido à IA", alternativa: "Alternativa sem IA", hipotese: "Hipótese" }[k]}.</b> ${esc(g[k])}</p>`).join("");
  return `<aside class="guia"><p class="caixa-t">Guia docente</p>
    <p class="tempo">Exposição ${t.exp ?? 0} · exemplo ${t.ex ?? 0} · prática ${t.prat ?? 0} · discussão ${t.disc ?? 0} min · origem: ${ORI[p.origem] ?? p.origem} · versão de 120 min: ${esc(p.nivel120)}</p>
    <div class="guia-grade"><div><p><b>Função.</b> ${esc(g.funcao)}</p><p><b>Pré-requisito.</b> ${esc(g.pre)}</p><p><b>Condução.</b> ${esc(g.conducao)}</p>${g.interacao ? `<p><b>Interação.</b> ${esc(g.interacao)}</p>` : ""}</div>
    <div><p><b>O que a turma vê.</b> ${esc(g.leitura)}</p><p><b>Pergunta para a turma.</b> ${esc(g.pergunta)}</p><p class="resposta"><b>Resposta esperada.</b> ${esc(g.resposta)}</p></div></div>
    ${erros ? `<p><b>Erros previsíveis.</b></p><ul>${erros}</ul>` : ""}${g.verificacao ? `<p><b>Verificação.</b> ${esc(g.verificacao)}</p>` : ""}${g.transicao ? `<p><b>Transição.</b> ${esc(g.transicao)}</p>` : ""}${extra}</aside>`;
}
function pagina(p) {
  // visual capturado da plataforma para páginas interativas e narrativas visuais (.nv); demais páginas usam o HTML estático limpo
  const interativa = (p.interactive || /class="nv[ "]/.test(p.html)) && figMeta[p.id];
  const legenda = PROF && p.guia?.leitura ? `Visual ${p.cap}.${p.n} (o que a turma vê): ${p.guia.leitura}` : `Visual ${p.cap}.${p.n}: ${p.titulo}. Na plataforma este visual é interativo.`;
  const discutir = !PROF && p.guia?.pergunta ? caixa("verifique", "Para discutir em aula", par(p.guia.pergunta)) : "";
  const apoio = p.apoio ? caixa("apoio", "Apoio", par(p.apoio)) : "";
  const alta = interativa && figMeta[p.id].h / figMeta[p.id].w > 0.7 && (apoio || discutir);
  // visual alto: fica ao lado dos quadros de apoio para não deixar meia página em branco
  const corpo = alta ? `<div class="lado"><figure class="visual alta"><img src="file://${FIG}/${p.id}.png" alt="${esc(legenda)}"><figcaption>${esc(legenda)}</figcaption></figure><div>${apoio}${discutir}</div></div>`
    : interativa ? figura(p.id, legenda) : `<div class="conteudo estatica">${limpar(p.html)}</div>`;
  const lado = alta ? "" : apoio && discutir ? `<div class="duas">${apoio}${discutir}</div>` : apoio + discutir;
  return `<section class="pagina" id="${p.id}">
    <header class="pag-h"><span class="pag-n">${p.cap}.${p.n}</span><h3>${esc(p.titulo)}</h3><span class="pag-meta">${p.nivel} · ${p.min} min</span></header>
    ${p.aprendizado ? `<p class="lead">${esc(p.aprendizado)}</p>` : ""}
    ${corpo}
    ${lado}
    ${questoes(p)}
    ${p.conexao ? `<p class="conexao"><span class="eyebrow">A seguir</span> ${esc(p.conexao)}</p>` : ""}
    ${PROF ? guiaDocente(p) : ""}
  </section>`;
}
function errosComuns(pages) {
  const rows = []; for (const p of pages) for (const e of p.guia?.erros ?? []) if (e.alt && e.confusao) rows.push(`<tr><td>${esc(e.alt)}</td><td>${esc(e.confusao)}</td><td>${esc(e.intervencao)}</td></tr>`);
  if (!rows.length) return ""; return `<h3>Erros comuns e como evitá-los</h3><table class="erros"><thead><tr><th>Erro</th><th>Confusão por trás</th><th>${PROF ? "Intervenção em aula" : "Como se corrige"}</th></tr></thead><tbody>${rows.slice(0, 14).join("")}</tbody></table>`;
}
function fecho(pages) {
  const ess = pages.filter((p) => p.nivel === "essencial");
  if (PROF) {
    const linhas = ess.map((p) => { const t = p.t ?? {}; return `<tr><td>${p.cap}.${p.n}</td><td>${esc(p.titulo)}</td><td>${t.exp ?? 0}</td><td>${t.ex ?? 0}</td><td>${t.prat ?? 0}</td><td>${t.disc ?? 0}</td><td><b>${p.min}</b></td></tr>`; }).join("");
    const total = ess.reduce((s, p) => s + p.min, 0);
    return `<h3>Roteiro do encontro <span class="hint">páginas essenciais · ${total} min</span></h3><table class="roteiro"><thead><tr><th>#</th><th>Página</th><th>Expos.</th><th>Exemplo</th><th>Prática</th><th>Discussão</th><th>Total</th></tr></thead><tbody>${linhas}</tbody></table>`;
  }
  return `<h3>Antes da próxima aula, você deve conseguir explicar</h3><ul class="checklist">${ess.filter((p) => p.aprendizado).map((p) => `<li><b>${p.cap}.${p.n}</b> ${esc(p.aprendizado)}</li>`).join("")}</ul>`;
}
function capitulo(n) {
  const c = ex.meta.capitulos.find((x) => x.n === n); const pages = ex.pages.filter((p) => p.cap === n).sort((a, b) => a.n - b.n); const sz = sint[String(n)]; const [cor, corSuave] = ex.meta.temas[String(n)] ?? ["#00205B", "#eef3fb"];
  const essenciais = pages.filter((p) => p.nivel === "essencial"); const min = essenciais.reduce((s, p) => s + p.min, 0);
  const linha = (p) => `<tr class="${p.nivel}"><td>${p.n}</td><td>${esc(p.titulo)}</td><td>${p.min}</td></tr>`;
  const meio = Math.ceil(pages.length / 2);
  const mapa = `<div class="mapa-2"><table class="mapa"><thead><tr><th>#</th><th>Página</th><th>min</th></tr></thead><tbody>${pages.slice(0, meio).map(linha).join("")}</tbody></table><table class="mapa"><thead><tr><th>#</th><th>Página</th><th>min</th></tr></thead><tbody>${pages.slice(meio).map(linha).join("")}</tbody></table></div><p class="hint">Em cinza, páginas complementares. Essenciais: ${essenciais.length} de ${pages.length} (${min} min).</p>`;
  const como = PROF
    ? `<ul><li>Página a página: objetivo, visual (o que a turma vê), apoio, questões com gabarito e guia docente com condução, pergunta para a turma, resposta esperada e erros previsíveis.</li><li>O roteiro do encontro no fim soma os tempos das páginas essenciais.</li><li>Este arquivo contém gabaritos e notas privadas. Não distribua; a versão do aluno é outro arquivo.</li></ul>`
    : `<ul><li>Leia a ideia central antes da aula e releia depois. As páginas seguem a ordem da plataforma, onde os visuais são interativos.</li><li>Responda às questões antes de ver o feedback na plataforma. "Para discutir em aula" é a pergunta que o professor vai fazer.</li><li>No fim: os erros mais comuns e o que você deve conseguir explicar antes da próxima aula.</li></ul>`;
  return `<section class="capitulo" style="--cor:${cor};--cor-suave:${corSuave}">
    <section class="capa">
      <p class="eyebrow">Laboratório de Decisão de Crédito · ${PROF ? "versão do professor" : "versão do aluno"}</p>
      <div class="capa-num"><span class="num">${pad(n)}</span><div><p class="eyebrow">Capítulo ${n} de 11</p><h1>${esc(c.nome)}</h1><p class="cap-pergunta">${esc(c.pergunta)}</p></div></div>
      <div class="cap-grade"><div><p class="caixa-t">O que você aprende</p><p>${esc(c.aprende)}</p></div><div><p class="caixa-t">Por que importa</p><p>${esc(c.motiva)}</p></div><div><p class="caixa-t">Atividade central</p><p>${esc(c.atividade)}</p></div><div><p class="caixa-t">Pré-requisito</p><p>${esc(c.prereq)}</p></div></div>
      <p class="cap-usa"><b>Onde isto é usado depois.</b> ${esc(c.usa)}</p>
      ${sz ? `<h2>A ideia central</h2><p class="sintese">${esc(sz.sintese)}</p>${sz.figura ? `<figure class="conceito"><img src="file://${FIG}/${sz.figura}.svg" alt=""><figcaption>${esc(sz.legenda)}</figcaption></figure>` : ""}` : ""}
      <p class="rodape-capa">Prof. Genaro Dueire Lins · FGV · Edição 2026 · material derivado da plataforma decisaodecredito.com · números do material são reconstruções didáticas ou exemplos sintéticos, salvo indicação${PROF ? " · documento restrito ao professor" : ""}</p>
    </section>
    <section class="panorama">
      <div class="como"><p class="caixa-t">Como usar este capítulo</p>${como}</div>
      <h2>Mapa do capítulo</h2>${mapa}
    </section>
    ${pages.map(pagina).join("\n")}
    <section class="fecho"><h2>Fecho do capítulo</h2>${fecho(pages)}${errosComuns(pages)}</section>
  </section>`;
}
const CSS = `
@page { size: A4; margin: 15mm 13mm 17mm 13mm; }
:root { --navy: #00205B; --gold: #B8860B; --muted: #52514e; --rule: #dedbd2; --paper: #f5f4f0; --cor: #00205B; --cor-suave: #eef3fb; }
body { font-family: Georgia, "DejaVu Serif", serif; color: #1a1a1a; font-size: 10pt; line-height: 1.45; margin: 0; }
h1, h2, h3, .eyebrow, .caixa-t, .pag-h, table, .hint, figcaption, .tempo, .como, .rodape-capa { font-family: "DejaVu Sans", Arial, sans-serif; }
h1 { font-size: 24pt; color: var(--cor); margin: 2px 0 6px; line-height: 1.12; } h2 { font-size: 14pt; color: var(--cor); margin: 10px 0 6px; } h3 { font-size: 12pt; color: var(--cor); margin: 10px 0 4px; }
.eyebrow { font-size: 8pt; letter-spacing: .12em; text-transform: uppercase; color: var(--gold); font-weight: 700; margin: 0; }
.hint { font-size: 8.2pt; color: var(--muted); font-weight: normal; }
p { margin: 0 0 6px; }
/* capa do capítulo */
.capa { break-after: page; page-break-after: always; border-top: 10px solid var(--cor); padding-top: 8px; } .capa h2 { margin-top: 8px; }
.capa-num { display: flex; gap: 16px; align-items: flex-start; margin: 8px 0 8px; } .capa-num .num { font-family: "DejaVu Sans", sans-serif; font-weight: 700; font-size: 64pt; line-height: .9; color: var(--cor); opacity: .9; }
.cap-pergunta { font-style: italic; font-size: 13pt; color: #333; margin: 4px 0 0; }
.cap-grade { display: grid; grid-template-columns: 1fr 1fr; gap: 6px 14px; margin: 8px 0 6px; } .cap-grade > div { background: var(--cor-suave); border-radius: 6px; padding: 8px 10px; } .cap-grade p { margin: 0; font-size: 9.6pt; }
.cap-usa { font-size: 9.6pt; margin: 6px 0 12px; }
.como { border: 1px solid var(--rule); border-radius: 6px; padding: 8px 12px; font-size: 9pt; } .como ul { margin: 2px 0 0 16px; padding: 0; } .como li { margin-bottom: 3px; }
.rodape-capa { font-size: 7.6pt; color: var(--muted); margin-top: 8px; }
/* panorama */
.panorama { margin-bottom: 6px; } .mapa-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 0 14px; align-items: start; }
.sintese { background: var(--paper); border-left: 4px solid var(--cor); border-radius: 0 6px 6px 0; padding: 8px 12px; font-size: 10.4pt; }
figure { margin: 6px 0; break-inside: avoid; page-break-inside: avoid; } figure img { max-width: 100%; display: block; margin: 0 auto; } figcaption { font-size: 8.2pt; color: var(--muted); margin-top: 3px; text-align: center; }
figure.conceito img { max-height: 70mm; }
table.mapa, table.erros, table.roteiro { border-collapse: collapse; width: 100%; font-size: 8.6pt; margin: 4px 0 8px; } .mapa th, .erros th, .roteiro th { text-align: left; background: var(--paper); border-bottom: 1.5px solid var(--rule); padding: 3px 6px; font-size: 7.8pt; text-transform: uppercase; letter-spacing: .04em; color: var(--muted); } .mapa td, .erros td, .roteiro td { padding: 3px 6px; border-bottom: 1px solid var(--rule); vertical-align: top; }
.mapa tr.complementar td { color: var(--muted); } .mapa td:first-child, .roteiro td:first-child { width: 6%; color: var(--muted); }
/* páginas */
.pagina { margin-top: 10px; border-top: 1px solid var(--rule); padding-top: 6px; }
.pag-h { display: flex; align-items: baseline; gap: 10px; break-after: avoid; page-break-after: avoid; } .pag-n { font-weight: 700; color: #fff; background: var(--cor); border-radius: 4px; padding: 1px 6px; font-size: 8.6pt; } .pag-h h3 { margin: 0; flex: 1; } .pag-meta { font-size: 7.8pt; color: var(--muted); white-space: nowrap; }
.lead { font-size: 10.4pt; font-style: italic; color: #222; border-left: 3px solid var(--cor-suave); padding-left: 8px; margin: 4px 0 6px; break-after: avoid; page-break-after: avoid; break-inside: avoid; page-break-inside: avoid; }
figure.visual img { border: 1px solid var(--rule); border-radius: 4px; } figure.visual.larga img { max-height: 62mm; } figure.visual.media img { max-height: 78mm; } figure.visual.alta img { max-height: 105mm; }
.duas { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; align-items: start; } .lado { display: grid; grid-template-columns: 54% 1fr; gap: 10px; align-items: start; } .lado figure { margin-top: 4px; } .lado figure.visual img { max-height: 112mm; } .lado .caixa { margin-top: 4px; }
.caixa { border: 1px solid var(--rule); border-radius: 5px; padding: 5px 9px; margin: 6px 0; break-inside: avoid; page-break-inside: avoid; } .caixa p { margin: 1px 0; font-size: 9.4pt; } .caixa-t { font-size: 7.6pt; letter-spacing: .1em; text-transform: uppercase; color: var(--muted); font-weight: 700; margin: 0 0 2px; }
.caixa.apoio { background: #fff; } .caixa.verifique { background: #fbf6e6; border-color: #eadba8; }
.questao { border-left: 3px solid var(--cor); padding: 3px 10px; margin: 6px 0; break-inside: avoid; page-break-inside: avoid; } .q-perg { margin: 2px 0 3px; font-weight: 600; font-size: 9.6pt; } .alts { margin: 0 0 3px 18px; padding: 0; font-size: 9.4pt; } .alts li { margin-bottom: 1px; } .alts li.certa { font-weight: 700; color: var(--cor); }
.gabarito { background: #eef6f1; border-radius: 4px; padding: 4px 8px; font-size: 9pt; margin-top: 3px; } .gabarito p { margin: 1px 0; }
.conexao { font-style: italic; font-size: 9.2pt; color: #333; margin: 4px 0 0; } .conexao .eyebrow { display: inline; margin-right: 6px; }
.guia { background: #fff8ea; border: 1px solid #eadba8; border-radius: 5px; padding: 5px 9px; margin: 6px 0; font-size: 8.8pt; line-height: 1.38; } .guia p { margin: 1px 0; } .guia ul { margin: 1px 0 1px 14px; padding: 0; } .guia .resposta { background: #fff; padding: 2px 6px; border-radius: 3px; } .guia .tempo { color: var(--muted); font-size: 7.8pt; margin-bottom: 3px; }
.guia-grade { display: grid; grid-template-columns: 1fr 1fr; gap: 4px 12px; }
/* fecho */
.fecho { break-before: page; page-break-before: always; } .fecho h2 { margin-top: 0; } .erros td:first-child { font-weight: 600; width: 24%; } .checklist { margin: 4px 0 10px 18px; padding: 0; font-size: 9.6pt; } .checklist li { margin-bottom: 3px; }
/* conteúdo estático herdado da plataforma */
.conteudo.estatica { font-size: 9.4pt; overflow: hidden; } .conteudo.estatica svg { max-width: 100%; max-height: 78mm; width: auto; height: auto; display: block; margin: 0 auto; } .conteudo.estatica .palcoflex { display: flex; flex-wrap: wrap; gap: 10px; align-items: flex-start; } .conteudo.estatica .esq, .conteudo.estatica .dir { flex: 1 1 300px; min-width: 0; max-width: 100%; }
.conteudo.estatica table { font-size: 8.4pt; table-layout: auto; max-width: 100%; } .conteudo.estatica th, .conteudo.estatica td { padding: 2px 6px; hyphens: manual; } .conteudo.estatica .palcoflex:has(table) { flex-direction: column; } .conteudo.estatica .palcoflex:has(table) > * { flex-basis: auto; width: 100%; } .conteudo.estatica .grade, .conteudo.estatica .nv-flow, .conteudo.estatica .nv-samples { max-width: 100%; }
.conteudo.estatica .revelacao { display: none; } .conteudo.estatica .revelacao.aberta { display: block; background: #eef6f1; border-radius: 4px; padding: 5px 8px; margin-top: 5px; }
.conteudo.estatica .formula, .conteudo.estatica .katex-display { overflow: visible; } .conteudo.estatica img { max-width: 100%; }
@media print { .conteudo.estatica * { animation: none !important; transition: none !important; } }
`;
function documento(n) {
  const c = ex.meta.capitulos.find((x) => x.n === n);
  return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>Capítulo ${n} · ${esc(c.nome)} · ${PROF ? "versão do professor" : "versão do aluno"}</title><style>${katexCss}\n${legacyCss}\n${CSS}</style></head><body>${capitulo(n)}</body></html>`;
}
const browser = pdf ? await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" }) : null;
for (const n of caps) {
  const c = ex.meta.capitulos.find((x) => x.n === n); const nome = `capitulo-${pad(n)}-${versao}`; const htmlPath = path.join(BUILD, nome + ".html");
  fs.writeFileSync(htmlPath, documento(n));
  if (!pdf) { console.log("html:", htmlPath); continue; }
  const page = await browser.newPage(); await page.goto("file://" + htmlPath, { waitUntil: "load" }); await page.waitForTimeout(600);
  await page.pdf({ path: path.join(BUILD, nome + ".pdf"), format: "A4", printBackground: true, margin: { top: "15mm", bottom: "17mm", left: "13mm", right: "13mm" }, displayHeaderFooter: true,
    headerTemplate: `<div style="font-size:7.4pt;color:#52514e;width:100%;padding:0 13mm;font-family:DejaVu Sans,Arial,sans-serif;display:flex;justify-content:space-between"><span>Laboratório de Decisão de Crédito · ${PROF ? "versão do professor (restrita)" : "versão do aluno"}</span><span>Capítulo ${n} · ${esc(c.nome)}</span></div>`,
    footerTemplate: `<div style="font-size:7.4pt;color:#52514e;width:100%;padding:0 13mm;font-family:DejaVu Sans,Arial,sans-serif;display:flex;justify-content:space-between"><span>Prof. Genaro Dueire Lins · FGV</span><span>página <span class="pageNumber"></span> de <span class="totalPages"></span></span></div>` });
  await page.close(); console.log(`pdf: ${nome}.pdf (${(fs.statSync(path.join(BUILD, nome + ".pdf")).size / 1e6).toFixed(1)} MB)`);
}
if (browser) await browser.close();
