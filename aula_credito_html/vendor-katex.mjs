/* Embute o KaTeX no pacote da aula, para a matemática renderizar também por file://.
   A folha do KaTeX pede as fontes por caminho relativo; aqui as faces usadas viram data URI e
   as demais são retiradas, para não sobrar requisição que falha em silêncio. Rode depois de
   trocar a versão do KaTeX: node vendor-katex.mjs && node build.mjs
   Uso: node vendor-katex.mjs */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const raiz = path.dirname(fileURLToPath(import.meta.url));
const dist = path.join(raiz, "..", "node_modules", "katex", "dist");
const destino = path.join(raiz, "app", "vendor");

/* Faces necessárias para notação matemática comum: romano, itálico matemático, negrito e os
   quatro tamanhos de delimitador. Caligráfico, gótico, sem serifa, script e monoespaçado ficam
   de fora porque esta aula não os usa; se um slide passar a usar, acrescente aqui. */
const FACES = [
  "KaTeX_Main-Regular", "KaTeX_Main-Bold", "KaTeX_Main-Italic",
  "KaTeX_Math-Italic", "KaTeX_AMS-Regular",
  "KaTeX_Size1-Regular", "KaTeX_Size2-Regular", "KaTeX_Size3-Regular", "KaTeX_Size4-Regular",
];

const base64 = (f) => fs.readFileSync(path.join(dist, "fonts", f + ".woff2")).toString("base64");

const faceCss = (f) => {
  const [familia, resto] = f.replace("KaTeX_", "").split("-");
  const italico = /Italic/.test(resto);
  const negrito = /Bold/.test(resto);
  return `@font-face{font-family:"KaTeX_${familia}";src:url(data:font/woff2;base64,${base64(f)}) format("woff2");` +
    `font-weight:${negrito ? 700 : 400};font-style:${italico ? "italic" : "normal"};font-display:block}`;
};

let css = fs.readFileSync(path.join(dist, "katex.min.css"), "utf8");
const antes = css.length;
css = css.replace(/@font-face\{[^}]*\}/g, "");   // todas as faces originais saem
const folha =
  "/* KaTeX " + JSON.parse(fs.readFileSync(path.join(raiz, "..", "node_modules", "katex", "package.json"), "utf8")).version +
  ", com as fontes embutidas por vendor-katex.mjs. Não editar à mão. */\n" +
  FACES.map(faceCss).join("\n") + "\n" + css;

fs.mkdirSync(destino, { recursive: true });
fs.writeFileSync(path.join(destino, "katex.css"), folha, "utf8");
fs.copyFileSync(path.join(dist, "katex.min.js"), path.join(destino, "katex.js"));

const kb = (n) => (n / 1024).toFixed(0) + " KB";
console.log(`katex.css: ${kb(folha.length)} (folha original ${kb(antes)} mais ${FACES.length} fontes em base64)`);
console.log(`katex.js:  ${kb(fs.statSync(path.join(destino, "katex.js")).size)}`);
