/* Compilação da aula.
   1. Converte experimento/saida/resultados.json em app/dados/11-resultados.js.
   2. Grava app/dados/00-versao.js com a marca da compilação, um resumo dos fontes: o estado
      guardado no navegador carrega essa marca e é descartado quando ela muda.
   3. Escreve app/index.html com os scripts na ordem correta (versão de trabalho).
   4. Escreve dist/aula_credito.html com tudo embutido, para abrir offline: é a versão completa,
      com as notas do professor (tecla p ou botão Professor).
   5. Escreve dist/aula_credito_aluno.html, a mesma aula sem as notas do professor: os blocos
      `notas` são removidos dos fontes por análise sintática (acorn), não por expressão regular.
   6. Escreve dist/aula_credito_notas.json, as notas por slide, para o painel do professor na
      plataforma mostrar condução, respostas e transição fora da tela projetada.
   7. Copia os três para content/slides/, na raiz do projeto Next: aula-2.html (professor e
      monitor), aula-2-aluno.html (aluno) e aula-2-notas.json (painel). A rota autenticada
      /slides/aula-2 escolhe o arquivo pelo papel. Fora de public/ de propósito: arquivo em
      public/ é servido antes de qualquer verificação de sessão.
   Uso: node build.mjs */

import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import * as acorn from "acorn";

const raiz = path.dirname(fileURLToPath(import.meta.url));
const app = path.join(raiz, "app");
const dist = path.join(raiz, "dist");
/* A pasta content pertence à aplicação Next, um nível acima desta. */
const servidos = path.join(raiz, "..", "content", "slides");

const vendor = [path.join(app, "vendor", "katex.js")];
const nucleo = ["01-nucleo.js", "02-svg.js", "03-ui.js", "04-comum.js", "05-mat.js"].map((f) => path.join(app, "nucleo", f));
const dados = ["10-dados.js", "11-resultados.js"].map((f) => path.join(app, "dados", f));
const slides = fs.readdirSync(path.join(app, "slides")).filter((f) => f.endsWith(".js")).sort()
  .map((f) => path.join(app, "slides", f));
const motor = [path.join(app, "nucleo", "90-app.js")];
const css = path.join(app, "estilo", "aula.css");
const cssKatex = path.join(app, "vendor", "katex.css");
const versaoArquivo = path.join(app, "dados", "00-versao.js");

/* 1. resultados do experimento -------------------------------------------- */
const jsonPath = path.join(raiz, "experimento", "saida", "resultados.json");
const metaPath = path.join(raiz, "experimento", "saida", "metadados.json");
if (fs.existsSync(jsonPath)) {
  const bruto = fs.readFileSync(jsonPath, "utf8");
  const meta = fs.existsSync(metaPath) ? fs.readFileSync(metaPath, "utf8") : "null";
  fs.writeFileSync(path.join(app, "dados", "11-resultados.js"),
    "/* Gerado por build.mjs a partir de experimento/saida/resultados.json.\n" +
    "   Não editar à mão: rode o experimento e recompile. */\n" +
    "Aula.resultados = " + bruto + ";\n" +
    "Aula.metadados = " + meta + ";\n", "utf8");
  console.log("resultados embutidos: " + (bruto.length / 1024).toFixed(0) + " KB");
} else {
  console.warn("AVISO: resultados.json ausente; o experimento não foi executado.");
  if (!fs.existsSync(path.join(app, "dados", "11-resultados.js"))) {
    fs.writeFileSync(path.join(app, "dados", "11-resultados.js"),
      "Aula.resultados = null;\nAula.metadados = null;\n", "utf8");
  }
}

/* 2. marca da compilação --------------------------------------------------- */
const fontesDaVersao = [...nucleo, ...dados, ...slides, ...motor, css];
const hash = createHash("sha256");
for (const f of fontesDaVersao) hash.update(fs.readFileSync(f));
const versao = hash.digest("hex").slice(0, 12);
fs.writeFileSync(versaoArquivo,
  "/* Gerado por build.mjs: resumo dos fontes desta compilação. Não editar à mão. */\n" +
  "var AULA_VERSAO = " + JSON.stringify(versao) + ";\n", "utf8");

const arquivos = [versaoArquivo, ...vendor, ...nucleo, ...dados, ...slides, ...motor];

/* ----------------------------------------------------- notas fora do aluno */

/* Remove a propriedade `notas` do objeto passado a Aula.slide, pela árvore sintática. Se o
   arquivo não tiver a forma esperada, a compilação para: uma variante "sem notas" que ainda as
   contivesse seria pior do que nenhuma. */
function semNotas(fonte, nome) {
  const ast = acorn.parse(fonte, { ecmaVersion: 2020, sourceType: "script" });
  const cortes = [];
  for (const st of ast.body) {
    if (st.type !== "ExpressionStatement" || st.expression.type !== "CallExpression") continue;
    const c = st.expression;
    const ehSlide = c.callee.type === "MemberExpression" && c.callee.object.name === "Aula" && c.callee.property.name === "slide";
    if (!ehSlide || !c.arguments.length || c.arguments[0].type !== "ObjectExpression") continue;
    const obj = c.arguments[0];
    obj.properties.forEach((p, i) => {
      const chave = p.key && (p.key.name || p.key.value);
      if (chave !== "notas") return;
      /* corta da propriedade até a vírgula que a segue, ou até o fim da anterior */
      const proximo = obj.properties[i + 1];
      const anterior = obj.properties[i - 1];
      const inicio = anterior ? anterior.end : p.start;
      const fim = proximo ? proximo.start : p.end;
      cortes.push([anterior ? inicio : p.start, anterior ? p.end : fim]);
    });
  }
  if (cortes.length !== 1) throw new Error(`${nome}: esperava um bloco de notas em Aula.slide, encontrei ${cortes.length}`);
  const [a, b] = cortes[0];
  const saida = fonte.slice(0, a) + fonte.slice(b);
  acorn.parse(saida, { ecmaVersion: 2020, sourceType: "script" }); // continua válido
  if (/^\s*notas\s*:/m.test(saida)) throw new Error(`${nome}: ainda há uma chave notas depois do corte`);
  return saida;
}

/* Executa os fontes em um contexto isolado só para ler as definições dos slides: nenhum
   `montar` roda, então não há DOM. O que sai é a parte declarativa de cada slide. */
function lerDefinicoes() {
  const ctx = vm.createContext({ console, AULA_VERSAO: versao });
  for (const f of [nucleo[0], dados[0]]) vm.runInContext(fs.readFileSync(f, "utf8"), ctx, { filename: f });
  for (const f of slides) vm.runInContext(fs.readFileSync(f, "utf8"), ctx, { filename: f });
  const defs = vm.runInContext("Aula.slides", ctx);
  const blocos = vm.runInContext("Aula.dados.blocos", ctx);
  return { defs, blocos };
}

const { defs, blocos } = lerDefinicoes();
if (defs.length !== 50) throw new Error("esperava 50 slides, encontrei " + defs.length);
const notasJson = {
  versao,
  gerado: "build.mjs; edite as notas em app/slides/sNN.js e recompile",
  slides: defs.map((d, i) => ({
    n: d.id, bloco: d.bloco, blocoNome: blocos[d.bloco] || d.bloco, titulo: d.titulo, subtitulo: d.subtitulo || null,
    conclusao: d.conclusao || null, fonte: d.fonte || null, resumo: d.resumo || null,
    notas: d.notas ? {
      conducao: d.notas.conducao || [], respostas: d.notas.respostas || [], cuidados: d.notas.cuidados || [],
      aprofundar: d.notas.aprofundar || [], transicao: d.notas.transicao || null,
    } : null,
    proximo: defs[i + 1] ? { n: defs[i + 1].id, titulo: defs[i + 1].titulo } : null,
  })),
};

/* 3. index de trabalho ----------------------------------------------------- */
const rel = (f) => path.relative(app, f).split(path.sep).join("/");
const cabeca = (estilo, corpoScripts) => `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Modelagem de crédito: logit, árvore e boosting</title>
<meta name="description" content="Aula interativa de 50 slides sobre regressão logística, árvore de decisão e gradient boosting aplicados à concessão de crédito pessoal.">
<link rel="icon" href="data:,">
${estilo}
</head>
<body>
<div id="moldura">
  <div id="palco"></div>
</div>
<div id="progresso" style="width:100%"><i id="progresso-barra" style="width:0"></i></div>
<nav id="barra" aria-label="navegação da aula">
  <span class="id" id="rotulo-id">01/50</span>
  <span class="titulinho" id="rotulo-titulo"></span>
  <button type="button" id="btn-indice" aria-haspopup="dialog">Índice</button>
  <button type="button" id="btn-anterior" aria-label="slide anterior">Anterior</button>
  <button type="button" id="btn-proximo" aria-label="próximo slide">Próximo</button>
  <button type="button" id="btn-professor" aria-pressed="false">Professor</button>
  <button type="button" id="btn-estudo" aria-pressed="false">Estudo</button>
  <button type="button" id="btn-tela">Tela cheia</button>
  <button type="button" id="btn-imprimir">Imprimir</button>
</nav>
<aside id="notas" hidden aria-label="notas do professor"></aside>
<div id="indice" hidden role="dialog" aria-modal="true" aria-label="índice dos 50 slides">
  <div class="indice-topo">
    <h2>Os 50 slides da aula</h2>
    <button type="button" id="btn-fechar-indice" class="btn min">Fechar</button>
  </div>
  <label for="indice-busca" class="oculto-visual">Filtrar slides por número ou título</label>
  <input type="search" id="indice-busca" placeholder="Filtrar por número ou título (Enter abre o primeiro)" autocomplete="off">
  <p id="indice-contagem" aria-live="polite"></p>
  <div id="indice-lista"></div>
  <div class="indice-rodape">
    <span>As explorações dos slides ficam só nesta aba do navegador.</span>
    <button type="button" id="btn-limpar-estado" class="btn min fantasma">Limpar minhas explorações</button>
  </div>
</div>
<div id="impressao"></div>
${corpoScripts}
</body>
</html>
`;

fs.writeFileSync(path.join(app, "index.html"),
  cabeca(`<link rel="stylesheet" href="vendor/katex.css">\n<link rel="stylesheet" href="estilo/aula.css">`,
    arquivos.map((f) => `<script src="${rel(f)}"></script>`).join("\n")), "utf8");

/* 4 e 5. distribuições offline --------------------------------------------- */
fs.mkdirSync(dist, { recursive: true });
const estiloInline = `<style>\n${fs.readFileSync(cssKatex, "utf8")}\n${fs.readFileSync(css, "utf8")}\n</style>`;
function pacote(transformarSlide) {
  const js = arquivos.map((f) => {
    let fonte = fs.readFileSync(f, "utf8");
    if (transformarSlide && slides.includes(f)) fonte = transformarSlide(fonte, rel(f));
    return `/* ${rel(f)} */\n` + fonte;
  }).join("\n\n");
  return cabeca(estiloInline, `<script>\n${js}\n</script>`);
}
const completo = pacote(null);
const aluno = pacote(semNotas);
const saida = path.join(dist, "aula_credito.html");
const saidaAluno = path.join(dist, "aula_credito_aluno.html");
const saidaNotas = path.join(dist, "aula_credito_notas.json");
fs.writeFileSync(saida, completo, "utf8");
fs.writeFileSync(saidaAluno, aluno, "utf8");
fs.writeFileSync(saidaNotas, JSON.stringify(notasJson, null, 1), "utf8");

/* Conferência: nenhuma frase de nota do professor pode sobreviver na variante do aluno. */
for (const d of defs) {
  if (!d.notas) continue;
  const frases = [...(d.notas.conducao || []), ...(d.notas.respostas || []), ...(d.notas.cuidados || []), ...(d.notas.aprofundar || []), d.notas.transicao].filter(Boolean);
  for (const fr of frases) {
    if (aluno.includes(fr)) throw new Error(`slide ${d.id}: nota do professor presente na variante do aluno: "${fr.slice(0, 60)}"`);
    if (!completo.includes(fr)) throw new Error(`slide ${d.id}: nota ausente da variante completa: "${fr.slice(0, 60)}"`);
  }
}

/* 7. cópias servidas pela plataforma ---------------------------------------- */
fs.mkdirSync(servidos, { recursive: true });
fs.copyFileSync(saida, path.join(servidos, "aula-2.html"));
fs.copyFileSync(saidaAluno, path.join(servidos, "aula-2-aluno.html"));
fs.copyFileSync(saidaNotas, path.join(servidos, "aula-2-notas.json"));

const kb = (f) => (fs.statSync(f).size / 1024).toFixed(0);
console.log(`versão da compilação: ${versao}`);
console.log(`slides compilados: ${slides.length}`);
console.log(`dist/aula_credito.html: ${kb(saida)} KB (professor, com notas)`);
console.log(`dist/aula_credito_aluno.html: ${kb(saidaAluno)} KB (aluno, sem notas)`);
console.log(`dist/aula_credito_notas.json: ${kb(saidaNotas)} KB (painel do professor)`);
console.log(`content/slides/aula-2.html, aula-2-aluno.html e aula-2-notas.json: cópias dos mesmos arquivos`);
