// Gera uma página HTML avulsa com o infográfico de abertura de um capítulo, sobre tokens.css e base.css.
// Uso: node scripts/infografico-html.mjs <capítulo> <saida.html>   (lê content/infograficos/cNN.json na raiz do repositório)
import fs from "node:fs"; import path from "node:path"; import { fileURLToPath } from "node:url";
const AQUI = path.dirname(fileURLToPath(import.meta.url)); const RAIZ = path.resolve(AQUI, "../../../..");
const n = Number(process.argv[2] ?? 1); const saida = path.resolve(process.argv[3] ?? `infografico-c${n}.html`);
const d = JSON.parse(fs.readFileSync(path.join(RAIZ, "content/infograficos", `c${String(n).padStart(2, "0")}.json`), "utf8"));
const css = fs.readFileSync(path.join(AQUI, "../assets/tokens.css"), "utf8") + "\n" + fs.readFileSync(path.join(AQUI, "../assets/base.css"), "utf8");
const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const tam = (s) => (s.length <= 4 ? 30 : s.length <= 8 ? 24 : 18);
function painel(p) {
  let corpo = "";
  if (p.tipo === "pontos") corpo = `<div class="info-pontos" style="display:grid;grid-template-columns:repeat(${p.cols},minmax(0,1fr));gap:3px;max-width:360px" role="img" aria-label="${esc(p.legenda)}">${Array.from({ length: p.n }, (_, k) => `<i style="display:block;aspect-ratio:1;border-radius:50%;background:${p.defaults.includes(k) ? "var(--color-alert)" : "var(--color-dots)"}"></i>`).join("")}</div><p class="hint">${esc(p.legenda)}</p>`;
  else if (p.tipo === "tempo") { const fim = p.meses.at(-1), X0 = 16, X1 = 250, Y = 40, px = (m) => X0 + ((X1 - X0) * m) / fim;
    corpo = `<p class="hint">${esc(p.legenda)}</p><svg viewBox="0 0 320 96" style="width:100%;max-width:380px;height:auto" role="img" aria-label="${esc(p.marcaTexto)}"><line x1="${X0}" y1="${Y}" x2="${X1}" y2="${Y}" stroke="var(--color-muted)" stroke-width="1.5"/>${p.meses.map((m) => `<line x1="${px(m)}" y1="${Y - 4}" x2="${px(m)}" y2="${Y + 4}" stroke="var(--color-muted)" stroke-width="1.5"/><text x="${px(m)}" y="${Y + 16}" text-anchor="middle" font-size="9" fill="var(--color-muted)">M${m}</text>`).join("")}<circle cx="${px(p.marcaMes)}" cy="${Y}" r="5.5" fill="var(--color-alert)"/><text x="${px(p.marcaMes)}" y="${Y - 10}" text-anchor="middle" font-size="9.5" font-weight="700" fill="var(--color-alert)">${esc(p.marcaTexto)}</text>${p.janelas.map((j, i) => `<g data-cor="${j.cor}"><rect x="${X0}" y="${Y + 26 + i * 18}" width="${px(j.ate) - X0}" height="10" rx="2" fill="var(--i)"/><text x="${px(j.ate) + 6}" y="${Y + 35 + i * 18}" font-size="9.5" font-weight="700" fill="var(--i)">${esc(j.texto)}</text></g>`).join("")}</svg>`; }
  else if (p.tipo === "barras") { const max = Math.max(...p.itens.map((i) => Math.abs(i.v))) || 1;
    corpo = `${p.texto ? `<p style="font-size:13px">${esc(p.texto)}</p>` : ""}<div style="display:grid;gap:6px">${p.itens.map((it) => `<div class="info-barra" data-cor="${it.cor}"><span class="info-barra-rot">${esc(it.rot)}</span><span class="info-barra-trilho"><span class="info-barra-fill" style="width:${Math.max(2, (Math.abs(it.v) / max) * 100)}%"></span></span><span class="info-barra-val">${esc(it.texto)}</span></div>`).join("")}</div>${p.nota ? `<p class="hint">${esc(p.nota)}</p>` : ""}`; }
  else if (p.tipo === "kv") corpo = `${p.texto ? `<p style="font-size:13px">${esc(p.texto)}</p>` : ""}<dl style="margin:0;display:grid;gap:4px">${p.linhas.map(([k, v]) => `<div style="display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap;background:var(--color-surface);border:1px solid var(--color-rule);border-radius:3px;padding:4px 8px;font-size:13px"><dt style="font-weight:700;color:var(--color-ink)">${esc(k)}</dt><dd style="margin:0;text-align:right">${esc(v)}</dd></div>`).join("")}</dl>${p.nota ? `<p class="hint">${esc(p.nota)}</p>` : ""}`;
  else corpo = `<ul style="margin:0;padding-left:18px;font-size:13px;display:grid;gap:4px">${p.itens.map((i) => `<li>${esc(i)}</li>`).join("")}</ul>`;
  return `<div class="info-painel" data-tipo="${p.tipo}"><p class="info-painel-t">${esc(p.titulo)}</p>${corpo}</div>`;
}
const html = `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Capítulo ${n} · abertura</title><style>${css}</style></head>
<body><main class="pagina" style="--cap:var(--cap-${n});--cap-soft:var(--cap-${n}-soft)">
<section class="info" aria-labelledby="t">
<header class="info-cab"><span class="info-num" aria-hidden="true">${esc(d.numero)}</span><div><p class="eyebrow">Infográfico de abertura</p><h2 id="t" class="info-tit">${esc(d.titulo)}</h2><p class="info-perg">${esc(d.pergunta)}</p></div></header>
<p class="info-kicker">${esc(d.kicker1)}</p><ol class="info-fluxo">${d.cartoes.map((c, i) => `<li class="info-cartao" data-cor="${c.cor}"><p class="info-cartao-tit">${i + 1}. ${esc(c.tit)}</p><p>${esc(c.corpo)}</p></li>`).join("")}</ol>
<p class="info-kicker">${esc(d.kicker2)}</p><div class="info-tiles">${d.tiles.map((t) => `<div class="info-tile" data-cor="${t.cor}"><p class="info-sigla" style="font-size:${tam(t.sigla)}px">${esc(t.sigla)}</p><p class="info-nome">${esc(t.nome)}</p><p class="info-desc">${esc(t.desc)}</p></div>`).join("")}<div class="info-formula"><p class="info-formula-t">${esc(d.formula)}</p>${d.formulaNota ? `<p class="info-formula-n">${esc(d.formulaNota)}</p>` : ""}</div></div>
<p class="info-kicker">${esc(d.kicker3)}</p><div class="info-paineis">${d.paineis.map(painel).join("")}</div>
<div class="info-faixa"><p class="info-faixa-k">${esc(d.faixa.kicker)}</p><dl>${d.faixa.itens.map((it) => `<div><dt>${esc(it.k)}</dt><dd>${esc(it.v)}</dd></div>`).join("")}</dl></div>
</section></main></body></html>`;
fs.writeFileSync(saida, html); console.log("html:", saida);
