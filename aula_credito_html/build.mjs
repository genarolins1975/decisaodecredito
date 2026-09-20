/* Compilação da aula.
   1. Converte experimento/saida/resultados.json em app/dados/11-resultados.js.
   2. Escreve app/index.html com os scripts na ordem correta (versão de trabalho).
   3. Escreve dist/aula_credito.html com tudo embutido, para abrir offline.
   Uso: node build.mjs */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const raiz = path.dirname(fileURLToPath(import.meta.url));
const app = path.join(raiz, "app");
const dist = path.join(raiz, "dist");

const nucleo = ["01-nucleo.js", "02-svg.js", "03-ui.js", "04-comum.js"].map((f) => path.join(app, "nucleo", f));
const dados = ["10-dados.js", "11-resultados.js"].map((f) => path.join(app, "dados", f));
const slides = fs.readdirSync(path.join(app, "slides")).filter((f) => f.endsWith(".js")).sort()
  .map((f) => path.join(app, "slides", f));
const motor = [path.join(app, "nucleo", "90-app.js")];
const css = path.join(app, "estilo", "aula.css");

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

const arquivos = [...nucleo, ...dados, ...slides, ...motor];

/* 2. index de trabalho ----------------------------------------------------- */
const rel = (f) => path.relative(app, f).split(path.sep).join("/");
const cabeca = (estilo, corpoScripts) => `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Modelagem de crédito: logit, árvore e boosting</title>
<meta name="description" content="Aula interativa de 50 slides sobre regressão logística, árvore de decisão e gradient boosting aplicados à concessão de crédito pessoal.">
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
<div id="indice" hidden role="dialog" aria-label="índice dos 50 slides">
  <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">
    <h2>Os 50 slides da aula</h2>
    <button type="button" id="btn-fechar-indice" class="btn min">Fechar</button>
  </div>
  <div id="indice-lista"></div>
</div>
<div id="impressao"></div>
${corpoScripts}
</body>
</html>
`;

fs.writeFileSync(path.join(app, "index.html"),
  cabeca(`<link rel="stylesheet" href="estilo/aula.css">`,
    arquivos.map((f) => `<script src="${rel(f)}"></script>`).join("\n")), "utf8");

/* 3. distribuição offline -------------------------------------------------- */
fs.mkdirSync(dist, { recursive: true });
const estiloInline = `<style>\n${fs.readFileSync(css, "utf8")}\n</style>`;
const js = arquivos.map((f) => `/* ${rel(f)} */\n` + fs.readFileSync(f, "utf8")).join("\n\n");
const scriptsInline = `<script>\n${js}\n</script>`;
const saida = path.join(dist, "aula_credito.html");
fs.writeFileSync(saida, cabeca(estiloInline, scriptsInline), "utf8");

const kb = (fs.statSync(saida).size / 1024).toFixed(0);
console.log(`slides compilados: ${slides.length}`);
console.log(`dist/aula_credito.html: ${kb} KB`);
