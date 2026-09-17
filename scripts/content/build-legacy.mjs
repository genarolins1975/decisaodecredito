/**
 * Etapa B da migração: constrói o "motor legado" que renderiza os visuais interativos
 * das páginas dentro de um iframe isolado (sandbox), REMOVENDO do código-fonte tudo o
 * que é privado: guia do professor, gabaritos (certa, porqueCerta, erros, novaQuestao)
 * e os textos de pergunta/resposta das missões do trabalho final.
 * Também desliga o arranque automático do deck e produz o CSS escopado para blocos estáticos.
 *
 * Saídas: content/generated/legacy-engine.js, legacy.css (bruto), legacy-scoped.css
 * Uso: node scripts/content/build-legacy.mjs
 */
import fs from "node:fs";
import path from "node:path";
import * as acorn from "acorn";
import postcss from "postcss";

const ROOT = path.resolve(new URL(".", import.meta.url).pathname, "../..");
const SRC = path.join(ROOT, "content/original/apresentacao-curso-pd.html");
const OUT = path.join(ROOT, "content/generated");
const html = fs.readFileSync(SRC, "utf8");
const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map((m) => m[1]);
const code = scripts[1];

const PRIVATE_KEYS = new Set(["guia", "certa", "porqueCerta", "erros", "novaQuestao"]);
const ast = acorn.parse(code, { ecmaVersion: 2022, sourceType: "script", locations: false, ranges: true });

/** Edições por intervalo, aplicadas do fim para o início para preservar offsets. */
const edits = [];
function keyName(p) { return p.key.type === "Identifier" ? p.key.name : p.key.type === "Literal" ? String(p.key.value) : null; }

function walk(node, parent) {
  if (!node || typeof node.type !== "string") return;
  if (node.type === "ObjectExpression") {
    const props = node.properties;
    for (const p of props) {
      if (p.type === "Property" && PRIVATE_KEYS.has(keyName(p))) {
        edits.push({ start: p.start, end: p.end, text: `${keyName(p)}:undefined` });
      }
    }
  }
  // pagina(id,n,missao,titulo,aprendizado,apoio,visual,arquivos,saida,pergunta,resposta,init): zera pergunta e resposta
  if (node.type === "CallExpression" && node.callee.type === "Identifier" && node.callee.name === "pagina" && node.arguments.length >= 11) {
    for (const i of [7, 8, 9, 10]) { const a = node.arguments[i]; edits.push({ start: a.start, end: a.end, text: "''" }); }
  }
  // Object.assign(pagPorId('x').guia, {...}) : o guia não existe mais no motor
  if (node.type === "CallExpression" && node.callee.type === "MemberExpression" && node.callee.property && node.callee.property.name === "assign" && node.arguments[0] && node.arguments[0].type === "MemberExpression" && node.arguments[0].property && node.arguments[0].property.name === "guia") {
    edits.push({ start: node.start, end: node.end, text: "undefined" });
  }
  // função auxiliar que monta o guia das missões (v10): neutralizada
  if (node.type === "VariableDeclarator" && node.id.type === "Identifier" && node.id.name === "guia" && node.init && node.init.type === "ArrowFunctionExpression") {
    edits.push({ start: node.init.start, end: node.init.end, text: "()=>undefined" });
  }
  // arranque automático do deck: removido (o bootstrap do iframe controla a renderização)
  if (node.type === "IfStatement" && code.slice(node.start, node.end).includes("readyState") && code.slice(node.start, node.end).includes("inicia")) {
    edits.push({ start: node.start, end: node.end, text: "/* arranque removido */" });
  }
  for (const key of Object.keys(node)) {
    if (key === "type" || key === "start" || key === "end") continue;
    const v = node[key];
    if (Array.isArray(v)) v.forEach((c) => c && typeof c.type === "string" && walk(c, node));
    else if (v && typeof v.type === "string") walk(v, node);
  }
}
walk(ast, null);

// edições aninhadas (ex.: erros dentro de guia): aplicar somente as mais externas
edits.sort((a, b) => a.start - b.start || b.end - a.end);
const applied = [];
let lastEnd = -1;
for (const e of edits) { if (e.start >= lastEnd) { applied.push(e); lastEnd = e.end; } }
let out = code;
for (const e of applied.slice().reverse()) out = out.slice(0, e.start) + e.text + out.slice(e.end);

const header = `/* Motor legado de renderização (gerado por scripts/content/build-legacy.mjs).
   Origem: apresentacao-curso-pd.html. Guia do professor e gabaritos foram REMOVIDOS na origem do código.
   Executa somente dentro de iframe sandbox, sem acesso à origem autenticada. */\n`;
// Segunda passagem: qualquer literal de texto que reproduza conteúdo privado (guia, gabaritos)
// e que NÃO faça parte do conteúdo público do aluno é substituído por string vazia.
const extract = JSON.parse(fs.readFileSync(path.join(OUT, "extract.json"), "utf8"));
const publicText = [];
for (const p of extract.pages) publicText.push(p.titulo, p.aprendizado, p.apoio, p.conexao, p.text, p.html);
for (const c of extract.meta.capitulos) publicText.push(...Object.values(c).map(String));
const PUBLIC = publicText.filter(Boolean).join("\n");
const privateStrings = new Set();
const addPriv = (s) => { if (typeof s === "string" && s.trim().length >= 25 && !PUBLIC.includes(s.slice(0, 40))) privateStrings.add(s.slice(0, 40)); };
for (const p of extract.pages) {
  if (p.guia) for (const v of Object.values(p.guia)) { if (Array.isArray(v)) v.forEach((e) => e && Object.values(e).forEach(addPriv)); else addPriv(v); }
  for (const q of p.questoes) { addPriv(q.porqueCerta); (q.erros || []).forEach((e) => e && Object.values(e).forEach((x) => (typeof x === "string" ? addPriv(x) : x && typeof x === "object" && Object.values(x).forEach(addPriv)))); }
}
const priv = [...privateStrings];
const ast2 = acorn.parse(out, { ecmaVersion: 2022, sourceType: "script", ranges: true });
const edits2 = [];
function walk2(node) {
  if (!node || typeof node.type !== "string") return;
  if (node.type === "Literal" && typeof node.value === "string" && priv.some((s) => node.value.includes(s))) edits2.push({ start: node.start, end: node.end, text: "''" });
  if (node.type === "TemplateElement" && priv.some((s) => node.value.cooked && node.value.cooked.includes(s))) edits2.push({ start: node.start, end: node.end, text: "" });
  for (const key of Object.keys(node)) { const v = node[key]; if (Array.isArray(v)) v.forEach((c) => c && typeof c.type === "string" && walk2(c)); else if (v && typeof v.type === "string") walk2(v); }
}
walk2(ast2);
edits2.sort((a, b) => b.start - a.start);
for (const e of edits2) out = out.slice(0, e.start) + e.text + out.slice(e.end);

// verificação final: nenhum prefixo privado sobrevive
const leaks = priv.filter((s) => out.includes(s));
if (leaks.length) { console.error("VAZAMENTO NO MOTOR LEGADO:\n" + leaks.join("\n")); process.exit(1); }
fs.writeFileSync(path.join(OUT, "legacy-engine.js"), header + out);
console.log(`motor legado: ${(out.length / 1024).toFixed(0)} KB, ${applied.length} remoções de propriedades, ${edits2.length} literais limpos, 0 vazamentos`);

// CSS escopado para blocos estáticos (.conteudo) — sem regras da casca
const EXTRA_CSS = "\n" + "/* plataforma: o botão discreto de explorar gráfico do deck original ficava com opacidade baixa (contraste 2:1); passa a opaco */" + "\n.explorar-dados{opacity:1}\n";
// o CSS bruto pode já conter o acréscimo de uma execução anterior: escopa-se sempre a versão pristina
const css = fs.readFileSync(path.join(OUT, "legacy.css"), "utf8").split(EXTRA_CSS).join("");
const SHELL = /^(html|body|\.topo|\.marca|\.pill|\.trilho|\.layout|\.mapa|\.palco|\.cena|\.navrod|\.notas|#notas|\.explorador|\.guia|\.indice|\.m-|\.nav-|\.checagem-rapida|\.explorar-dados|\.tabela-toggle|\.skip|\.qr|\.cron|\.apoio|\.eyebrow|\.conexao|\.aprendizagem)/;
const root = postcss.parse(css);
root.walkRules((rule) => {
  if (rule.parent && rule.parent.type === "atrule" && /keyframes/.test(rule.parent.name)) return;
  const sels = rule.selectors.filter((s) => !SHELL.test(s.trim()));
  if (!sels.length) { rule.remove(); return; }
  rule.selectors = sels.map((s) => {
    const t = s.trim();
    if (t.startsWith(":root")) return ".conteudo";
    // resets genéricos de controles do deck original não devem recolorir os botões da plataforma (.btn)
    if (/^(button|select|input|textarea)$/.test(t)) return `.conteudo ${t}:not(.btn)`;
    return `.conteudo ${t}`;
  });
});
root.walkAtRules((at) => { if (at.name === "media" && at.params.includes("print")) at.remove(); });
// telas estreitas: toda grade do material vira uma coluna; linhas flex quebram
const gridSel = new Set();
root.walkRules((rule) => { rule.walkDecls((d) => { if (d.prop === "grid-template-columns" || (d.prop === "display" && d.value === "flex")) rule.selectors.forEach((sel) => gridSel.add(sel)); }); });
const mobile = `\n@media (max-width: 720px) {\n${[...gridSel].map((sel) => `${sel} { grid-template-columns: 1fr !important; flex-wrap: wrap; }`).join("\n")}\n}\n`;
fs.writeFileSync(path.join(OUT, "legacy-scoped.css"), root.toString() + mobile);
// contraste: o botão discreto de explorar gráfico do deck original usava opacidade baixa (2:1); fica opaco no iframe
fs.writeFileSync(path.join(OUT, "legacy.css"), css + EXTRA_CSS);
// bases do trabalho final (17/09/2026): os números do pacote antigo no motor original passam a referir a base do grupo (mesmas substituições do import)
const PATCH_C11 = {"mapa": [["<span class=\"big\">60.000</span><h3>propostas sintéticas</h3><p>51.000 no desenvolvimento<br>9.000 no OOT cego</p>", "<span class=\"big\">≈ 1 milhão</span><h3>propostas sintéticas por base</h3><p>cerca de 900 mil no desenvolvimento<br>100.000 no OOT cego</p>"]], "c11p1": [["60.000 propostas", "1 milhão de propostas"]], "c11p2": [["<span class=\"big\">51.000</span><small>treino + validação · rótulo somente nas aprovadas</small>", "<span class=\"big\">≈ 900 mil</span><small>treino + validação (jan/21 a dez/23) · rótulo somente nas aprovadas</small>"], ["<span class=\"big\">8.420</span><small>5.930 propostas aprovadas com rótulo</small>", "<span class=\"big\">jul–dez/23</span><small>cerca de 150 mil propostas; as aprovadas com rótulo você conta na sua base</small>"], ["<span class=\"big\">9.000</span><small>jan–jun/24 · nenhum desfecho no pacote do aluno</small>", "<span class=\"big\">100.000</span><small>jan–jun/24 · nenhum desfecho no pacote do aluno</small>"]], "c11p7": [["<small>42.580 propostas</small><small>30.938 aprovadas com rótulo</small>", "<small>cerca de 750 mil propostas</small><small>aprovadas com rótulo: contar na sua base</small>"], ["<small>8.420 propostas</small><small>5.930 aprovadas com rótulo</small>", "<small>cerca de 150 mil propostas</small><small>aprovadas com rótulo: contar na sua base</small>"], ["<small>9.000 IDs, sem desfecho</small>", "<small>100.000 IDs, sem desfecho</small>"]], "c11p8": [["<small>baseline aprendido no treino</small><span class=\"big\">6,655%</span><p>a mesma PD para toda proposta</p>", "<small>baseline aprendido no treino</small><span class=\"big\">p̂₀ da sua base</span><p>a mesma PD para toda proposta: defaults sobre aprovadas com rótulo no treino (o exemplo abaixo é do Banco Aurora)</p>"]], "c11p9": [["exatamente os mesmos 5.930 casos aprovados da validação", "exatamente os mesmos casos aprovados com rótulo da validação (o número é o da sua base)"]], "c11p17": [["Exatamente 9.000 IDs; nenhuma volta para melhorar.", "Exatamente 100.000 IDs; nenhuma volta para melhorar."]]};
{
  const enginePath = path.join(OUT, "legacy-engine.js"); let js = fs.readFileSync(enginePath, "utf8"); let n = 0;
  for (const subsPagina of Object.values(PATCH_C11)) for (const [a, b] of subsPagina) { const ea = JSON.stringify(a).slice(1, -1), eb = JSON.stringify(b).slice(1, -1); for (const [x, y] of [[a, b], [ea, eb]]) if (js.includes(x)) { js = js.split(x).join(y); n++; } }
  fs.writeFileSync(enginePath, js); console.log(`motor legado: ${n} substituições do capítulo 11`);
}
console.log("css escopado gerado");
