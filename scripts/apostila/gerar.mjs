/**
 * Apostila do Laboratório de Decisão de Crédito: HTML de impressão + PDF (Chromium), duas versões (aluno e professor).
 * Fontes: content/generated/extract.json (conteúdo, guia docente, questões), figuras capturadas dos visuais e figuras conceituais.
 * Uso: node scripts/apostila/gerar.mjs <aluno|professor> [capitulos ex.: 1,2] [--pdf]   (APOSTILA_DIR define onde ficam fig/ e build/; padrão tmp/apostila)
 */
import fs from "node:fs"; import path from "node:path"; import { fileURLToPath } from "node:url"; import { chromium } from "playwright";
const AQUI = path.dirname(fileURLToPath(import.meta.url)); const REPO = path.resolve(AQUI, "../.."); const S = process.env.APOSTILA_DIR ?? path.join(REPO, "tmp/apostila"); const FIG = path.join(S, "fig"); const BUILD = path.join(S, "build"); fs.mkdirSync(BUILD, { recursive: true });
const ex = JSON.parse(fs.readFileSync(path.join(REPO, "content/generated/extract.json"), "utf8"));
const sint = JSON.parse(fs.readFileSync(path.join(AQUI, "sinteses.json"), "utf8")); const figMeta = JSON.parse(fs.readFileSync(path.join(FIG, "_meta.json"), "utf8"));
const legacyCss = fs.readFileSync(path.join(REPO, "content/generated/legacy-scoped.css"), "utf8"); const katexCss = fs.readFileSync(path.join(REPO, "node_modules/katex/dist/katex.min.css"), "utf8").replace(/url\(fonts\//g, `url(file://${REPO}/node_modules/katex/dist/fonts/`);
const versao = process.argv[2] ?? "aluno"; const caps = (process.argv[3] && !process.argv[3].startsWith("--")) ? process.argv[3].split(",").map(Number) : [1,2,3,4,5,6,7,8,9,10,11]; const pdf = process.argv.includes("--pdf");
const PROF = versao === "professor";
const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const NIV = { essencial: "essencial", complementar: "complementar" }; const ORI = { sint: "visual sintético", obs: "dados observados", doc: "documento", esq: "esquema", rec: "reconstrução didática" };

/** HTML da página estática: remove controles interativos, questões nativas e botões; mantém textos, tabelas, svgs e fórmulas. */
function limpar(html) {
  return html.replace(/<div data-block="question"[^>]*><\/div>/g, "").replace(/<div class="linhabotoes"[\s\S]*?<\/div>/g, "").replace(/<button[\s\S]*?<\/button>/g, "").replace(/<input[^>]*>/g, "").replace(/<select[\s\S]*?<\/select>/g, "")
    .replace(/<div class="revelacao"[\s\S]*?<\/div>/g, (m) => PROF ? m.replace('class="revelacao"', 'class="revelacao aberta"') : "").replace(/\sonclick="[^"]*"/g, "").replace(/\sid="[^"]*"/g, "");
}
function figura(slug, legenda) { const m = figMeta[slug]; if (!m || !fs.existsSync(path.join(FIG, slug + ".png"))) return ""; return `<figure class="visual"><img src="file://${FIG}/${slug}.png" alt="${esc(legenda)}"><figcaption>${esc(legenda)}</figcaption></figure>`; }
const caixa = (cls, titulo, corpo) => corpo ? `<aside class="caixa ${cls}"><p class="caixa-t">${titulo}</p>${corpo}</aside>` : "";
const par = (t) => t ? `<p>${esc(t)}</p>` : "";

function questoes(p) {
  let h = "";
  for (const q of p.questoes ?? []) {
    h += `<div class="questao"><p class="caixa-t">Questão · ${esc(q.rot ?? "")}</p><p class="q-perg">${esc(q.pergunta)}</p><ol class="alts">${(q.alt ?? []).map((a, i) => `<li${PROF && i === q.certa ? ' class="certa"' : ""}>${esc(a)}</li>`).join("")}</ol>`;
    if (PROF) { h += `<div class="gabarito"><p><b>Correta: alternativa ${(q.certa ?? 0) + 1}.</b> ${esc(q.porqueCerta ?? "")}</p>`; for (const [i, e] of (q.erros ?? []).entries()) if (e && (e.confusao || e.conceito)) h += `<p class="erro"><b>Se marcou outra (${i + 1}):</b> ${esc(e.confusao ?? "")} ${esc(e.conceito ?? "")}</p>`; h += "</div>"; }
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
  return `<aside class="guia"><p class="caixa-t">Guia docente · ${esc(p.titulo)}</p>
    <p class="tempo">Tempo: exposição ${t.exp ?? 0} · exemplo ${t.ex ?? 0} · prática ${t.prat ?? 0} · discussão ${t.disc ?? 0} (min). Origem: ${ORI[p.origem] ?? p.origem}. Nível na versão de 120 min: ${esc(p.nivel120)}.</p>
    <p><b>Função da página.</b> ${esc(g.funcao)}</p><p><b>Pré-requisito.</b> ${esc(g.pre)}</p><p><b>Condução.</b> ${esc(g.conducao)}</p><p><b>O que a turma vê.</b> ${esc(g.leitura)}</p>
    ${g.interacao ? `<p><b>Interação.</b> ${esc(g.interacao)}</p>` : ""}
    <p><b>Pergunta para a turma.</b> ${esc(g.pergunta)}</p><p class="resposta"><b>Resposta esperada.</b> ${esc(g.resposta)}</p>
    ${erros ? `<p><b>Erros previsíveis.</b></p><ul>${erros}</ul>` : ""}${g.verificacao ? `<p><b>Verificação.</b> ${esc(g.verificacao)}</p>` : ""}${g.transicao ? `<p><b>Transição.</b> ${esc(g.transicao)}</p>` : ""}${extra}</aside>`;
}
function pagina(p) {
  const interativa = p.interactive && figMeta[p.id];
  const legenda = PROF && p.guia?.leitura ? `Visual da página ${p.cap}.${p.n} (o que a turma vê): ${p.guia.leitura}` : `Visual da página ${p.cap}.${p.n}: ${p.titulo}. Na plataforma este visual é interativo.`;
  const corpo = interativa ? figura(p.id, legenda) : `<div class="conteudo estatica">${limpar(p.html)}</div>`;
  const checagem = !PROF && p.guia?.pergunta ? caixa("verifique", "Para discutir em aula", par(p.guia.pergunta)) : "";
  return `<section class="pagina" id="${p.id}">
    <header class="pag-h"><span class="pag-n">${p.cap}.${p.n}</span><h3>${esc(p.titulo)}</h3><span class="pag-meta">${NIV[p.nivel]} · ${p.min} min</span></header>
    ${caixa("objetivo", "O que esta página ensina", par(p.aprendizado))}
    ${corpo}
    ${p.apoio ? caixa("apoio", "Apoio", par(p.apoio)) : ""}
    ${questoes(p)}${checagem}
    ${p.conexao ? `<p class="conexao"><span class="eyebrow">A seguir</span> ${esc(p.conexao)}</p>` : ""}
    ${PROF ? guiaDocente(p) : ""}
  </section>`;
}
function errosComuns(pages) {
  const rows = []; for (const p of pages) for (const e of p.guia?.erros ?? []) if (e.alt && e.confusao) rows.push(`<tr><td>${esc(e.alt)}</td><td>${esc(e.confusao)}</td><td>${esc(PROF ? e.intervencao : (e.intervencao ?? "").replace(/^(Pe[çc]a|Pergunte|Mostre|Compare|Volte|Aponte)/, (m) => m))}</td></tr>`);
  if (!rows.length) return ""; return `<h3>Erros comuns e como evitá-los</h3><table class="erros"><thead><tr><th>Erro</th><th>Confusão por trás</th><th>${PROF ? "Intervenção em aula" : "Como se corrige"}</th></tr></thead><tbody>${rows.slice(0, 14).join("")}</tbody></table>`;
}
function capitulo(n) {
  const c = ex.meta.capitulos.find((x) => x.n === n); const pages = ex.pages.filter((p) => p.cap === n).sort((a, b) => a.n - b.n); const sz = sint[String(n)];
  const essenciais = pages.filter((p) => p.nivel === "essencial"); const min = essenciais.reduce((s, p) => s + p.min, 0);
  const mapa = `<table class="mapa"><thead><tr><th>#</th><th>Página</th><th>Nível</th><th>min</th></tr></thead><tbody>${pages.map((p) => `<tr class="${p.nivel}"><td>${p.n}</td><td>${esc(p.titulo)}</td><td>${p.nivel}</td><td>${p.min}</td></tr>`).join("")}</tbody></table>`;
  return `<section class="capitulo" id="c${n}">
    <div class="cap-capa"><p class="eyebrow">Capítulo ${n}</p><h1>${esc(c.nome)}</h1><p class="cap-pergunta">${esc(c.pergunta)}</p>
      <div class="cap-grade"><div><p class="caixa-t">O que você aprende</p><p>${esc(c.aprende)}</p></div><div><p class="caixa-t">Por que importa</p><p>${esc(c.motiva)}</p></div><div><p class="caixa-t">Atividade central</p><p>${esc(c.atividade)}</p></div><div><p class="caixa-t">Pré-requisito</p><p>${esc(c.prereq)}</p></div></div>
      <p class="cap-usa"><b>Onde isto é usado depois.</b> ${esc(c.usa)}</p></div>
    <h3>Mapa do capítulo <span class="hint">${pages.length} páginas · ${essenciais.length} essenciais (${min} min)</span></h3>${mapa}
    ${sz ? `<div class="sintese"><h3>A ideia central em um parágrafo</h3><p>${esc(sz.sintese)}</p>${sz.figura ? `<figure class="conceito"><img src="file://${FIG}/${sz.figura}.svg" alt=""><figcaption>${esc(sz.legenda)}</figcaption></figure>` : ""}</div>` : ""}
    ${pages.map(pagina).join("\n")}
    <div class="fecho">${errosComuns(pages)}</div>
  </section>`;
}
const CSS = `
@page { size: A4; margin: 16mm 14mm 18mm 14mm; }
:root { --ink: #0b1f4d; --navy: #00205B; --gold: #B8860B; --muted: #52514e; --rule: #dedbd2; --paper: #f5f4f0; }
body { font-family: Georgia, "DejaVu Serif", serif; color: #1a1a1a; font-size: 10.6pt; line-height: 1.5; margin: 0; }
h1, h2, h3, .eyebrow, .caixa-t, .pag-h, table, .hint, figcaption { font-family: "DejaVu Sans", Arial, sans-serif; }
h1 { font-size: 26pt; color: var(--navy); margin: 4px 0 6px; line-height: 1.15; } h3 { font-size: 12.5pt; color: var(--navy); margin: 14px 0 6px; }
.eyebrow { font-size: 8.5pt; letter-spacing: .12em; text-transform: uppercase; color: var(--gold); font-weight: 700; margin: 0; }
.hint { font-size: 8.5pt; color: var(--muted); font-weight: normal; }
.capa { page-break-after: always; display: flex; flex-direction: column; justify-content: center; height: 250mm; }
.capa h1 { font-size: 34pt; } .capa .sub { font-size: 14pt; color: var(--muted); font-family: "DejaVu Sans", sans-serif; }
.capa .faixa { background: var(--navy); color: #fff; padding: 10px 14px; margin: 18px 0; font-family: "DejaVu Sans", sans-serif; font-size: 10pt; }
.como { page-break-after: always; } .como li { margin-bottom: 4px; }
.capitulo { page-break-before: always; }
.cap-capa { border-left: 6px solid var(--gold); padding-left: 14px; margin-bottom: 10px; } .cap-pergunta { font-style: italic; font-size: 13pt; color: var(--ink); margin: 0 0 10px; }
.cap-grade { display: grid; grid-template-columns: 1fr 1fr; gap: 8px 16px; } .cap-grade p { margin: 0 0 2px; font-size: 9.8pt; } .cap-usa { font-size: 9.8pt; margin-top: 8px; }
table { border-collapse: collapse; width: 100%; font-size: 8.8pt; margin: 4px 0 10px; } th { text-align: left; background: var(--paper); border-bottom: 1.5px solid var(--rule); padding: 4px 6px; font-size: 8pt; text-transform: uppercase; letter-spacing: .04em; color: var(--muted); } td { padding: 4px 6px; border-bottom: 1px solid var(--rule); vertical-align: top; }
.mapa tr.complementar td { color: var(--muted); }
.sintese { background: var(--paper); border-radius: 6px; padding: 8px 12px 10px; margin: 8px 0 12px; page-break-inside: avoid; } .sintese h3 { margin-top: 2px; }
figure { margin: 8px 0; page-break-inside: avoid; } figure img { max-width: 100%; display: block; } figcaption { font-size: 8.5pt; color: var(--muted); margin-top: 4px; }
figure.visual img { border: 1px solid var(--rule); border-radius: 4px; } figure.conceito img { max-height: 95mm; margin: 0 auto; }
.pagina { page-break-inside: auto; margin-top: 14px; border-top: 1px solid var(--rule); padding-top: 8px; }
.pag-h { display: flex; align-items: baseline; gap: 10px; page-break-after: avoid; } .pag-n { font-weight: 700; color: var(--gold); font-size: 10pt; } .pag-h h3 { margin: 0; flex: 1; } .pag-meta { font-size: 8pt; color: var(--muted); white-space: nowrap; }
.caixa { border: 1px solid var(--rule); border-radius: 5px; padding: 6px 10px; margin: 8px 0; page-break-inside: avoid; } .caixa p { margin: 2px 0; font-size: 9.8pt; } .caixa-t { font-size: 8pt; letter-spacing: .1em; text-transform: uppercase; color: var(--muted); font-weight: 700; margin: 0 0 2px; }
.caixa.objetivo { background: #eef3fb; border-color: #c9d8f2; } .caixa.apoio { background: #fff; } .caixa.verifique { background: #fbf6e6; border-color: #eadba8; }
.questao { border-left: 3px solid var(--navy); padding: 4px 10px; margin: 8px 0; page-break-inside: avoid; } .q-perg { margin: 2px 0 4px; font-weight: 600; } .alts { margin: 0 0 4px 18px; padding: 0; font-size: 9.8pt; } .alts li.certa { font-weight: 700; color: var(--navy); }
.gabarito { background: #eef6f1; border-radius: 4px; padding: 4px 8px; font-size: 9.4pt; } .gabarito p { margin: 2px 0; } .gabarito .erro { color: #333; }
.conexao { font-style: italic; font-size: 9.6pt; color: var(--ink); margin: 6px 0 0; } .conexao .eyebrow { display: inline; margin-right: 6px; }
.guia { background: #fff8ea; border: 1px solid #eadba8; border-radius: 5px; padding: 6px 10px; margin: 8px 0; font-size: 9.2pt; } .guia p { margin: 2px 0; } .guia ul { margin: 2px 0 2px 16px; padding: 0; } .guia .resposta { background: #fff; padding: 3px 6px; border-radius: 3px; } .guia .tempo { color: var(--muted); font-size: 8.6pt; }
.fecho { margin-top: 14px; } .erros td:first-child { font-weight: 600; width: 26%; }
.conteudo.estatica { font-size: 9.8pt; overflow: hidden; } .conteudo.estatica svg { max-width: 100%; height: auto; } .conteudo.estatica .palcoflex { display: flex; flex-wrap: wrap; gap: 12px; align-items: flex-start; } .conteudo.estatica .esq, .conteudo.estatica .dir { flex: 1 1 300px; min-width: 0; max-width: 100%; }
.conteudo.estatica table { font-size: 8.2pt; table-layout: auto; word-break: break-word; } .conteudo.estatica th, .conteudo.estatica td { padding: 3px 5px; } .conteudo.estatica .grade, .conteudo.estatica .nv-flow, .conteudo.estatica .nv-samples { max-width: 100%; }
.conteudo.estatica .revelacao { display: none; } .conteudo.estatica .revelacao.aberta { display: block; background: #eef6f1; border-radius: 4px; padding: 6px 8px; margin-top: 6px; }
.conteudo.estatica .formula, .conteudo.estatica .katex-display { overflow: visible; } .conteudo.estatica img { max-width: 100%; }
@media print { .conteudo.estatica * { animation: none !important; transition: none !important; } }
`;
function livro(capsSel) {
  const capasHtml = capsSel.map(capitulo).join("\n");
  const toc = `<ol class="toc">${capsSel.map((n) => { const c = ex.meta.capitulos.find((x) => x.n === n); return `<li><b>Capítulo ${n}.</b> ${esc(c.nome)} <span class="hint">${esc(c.pergunta)}</span></li>`; }).join("")}</ol>`;
  const como = PROF ? `<ol><li>Cada capítulo abre com a pergunta que o organiza, o que a turma aprende, a atividade central e o mapa das páginas com tempo por página; some os tempos das essenciais para o encontro de 180 minutos.</li><li>A síntese em um parágrafo e a figura conceitual servem para abrir ou fechar a aula; não substituem os visuais interativos da plataforma.</li><li>Cada página traz o objetivo, o visual (ou o conteúdo estático), o apoio, as questões com gabarito e o guia docente: função, pré-requisito, condução, o que a turma vê, pergunta para a turma com resposta esperada, erros previsíveis com intervenção, verificação e transição.</li><li>A tabela de erros comuns ao fim do capítulo reúne as confusões mais frequentes e a intervenção correspondente.</li><li>Este volume contém gabaritos e notas privadas. Não compartilhe com alunos; a versão do aluno é um arquivo separado.</li></ol>`
    : `<ol><li>Cada capítulo abre com a pergunta que o organiza, o que você aprende e por que importa. Leia a síntese em um parágrafo antes da aula e releia depois.</li><li>As páginas seguem a ordem da plataforma. O visual de cada página está reproduzido aqui em versão estática; na plataforma ele é interativo, e vale experimentar.</li><li>Responda às questões antes de ver o feedback na plataforma. O que está marcado como "Para discutir em aula" é a pergunta que o professor vai fazer: chegue com uma resposta.</li><li>A tabela de erros comuns no fim de cada capítulo lista as confusões mais frequentes. Se uma delas parece razoável para você, é sinal para reler a página.</li><li>As fórmulas aparecem do jeito que serão usadas no trabalho final; o capítulo 11 mostra onde cada uma entra.</li></ol>`;
  return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>Laboratório de Decisão de Crédito · ${PROF ? "versão do professor" : "versão do aluno"}</title><style>${katexCss}\n${legacyCss}\n${CSS}</style></head><body>
  <section class="capa"><p class="eyebrow">FGV · Mestrado profissional · Gestão de Risco de Crédito</p><h1>Laboratório de Decisão de Crédito</h1><p class="sub">Apostila do curso · ${PROF ? "versão do professor, com gabaritos e guia docente" : "versão do aluno"}</p>
    <div class="faixa">Prof. Genaro Dueire Lins · Edição 2026 · ${capsSel.length === 11 ? "onze capítulos" : "capítulos " + capsSel.join(", ")} · gerada em ${new Date().toLocaleDateString("pt-BR")}</div>
    <p class="hint">Conteúdo derivado do material da plataforma decisaodecredito.com. Os números do material são reconstruções didáticas ou exemplos sintéticos, salvo indicação. ${PROF ? "Documento restrito ao professor." : ""}</p></section>
  <section class="como"><h1>Como usar esta apostila</h1>${como}<h3>Sumário</h3>${toc}</section>
  ${capasHtml}</body></html>`;
}
const html = livro(caps); const nome = `apostila-${versao}${caps.length === 11 ? "" : "-c" + caps.join("-")}`; const htmlPath = path.join(BUILD, nome + ".html"); fs.writeFileSync(htmlPath, html);
console.log("html:", htmlPath, (html.length / 1e6).toFixed(1), "MB");
if (pdf) {
  const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" }); const page = await browser.newPage();
  await page.goto("file://" + htmlPath, { waitUntil: "load" }); await page.waitForTimeout(800);
  await page.pdf({ path: path.join(BUILD, nome + ".pdf"), format: "A4", printBackground: true, margin: { top: "16mm", bottom: "18mm", left: "14mm", right: "14mm" }, displayHeaderFooter: true,
    headerTemplate: `<div style="font-size:7.5pt;color:#52514e;width:100%;padding:0 14mm;font-family:DejaVu Sans,Arial,sans-serif;display:flex;justify-content:space-between"><span>Laboratório de Decisão de Crédito · ${PROF ? "versão do professor (restrita)" : "versão do aluno"}</span><span>Prof. Genaro Dueire Lins</span></div>`,
    footerTemplate: `<div style="font-size:7.5pt;color:#52514e;width:100%;padding:0 14mm;font-family:DejaVu Sans,Arial,sans-serif;text-align:center">página <span class="pageNumber"></span> de <span class="totalPages"></span></div>` });
  await browser.close(); console.log("pdf:", path.join(BUILD, nome + ".pdf"), (fs.statSync(path.join(BUILD, nome + ".pdf")).size / 1e6).toFixed(1), "MB");
}
