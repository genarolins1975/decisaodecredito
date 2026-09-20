/* Gera o PDF da aula em modo impressão e confere o resultado:
   uma folha por slide, controles ocultos, respostas presentes e sem erro de
   montagem. Uso: node imprimir.mjs */
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const raiz = path.dirname(fileURLToPath(import.meta.url));
const arquivo = path.join(raiz, "dist", "aula_credito.html");
const saida = path.join(raiz, "qa", "aula_credito_impressao.pdf");
const exe = "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";
const navegador = await chromium.launch({ executablePath: exe });
const pagina = await navegador.newPage();
const erros = [];
pagina.on("pageerror", (e) => erros.push(String(e)));
pagina.on("console", (m) => { if (m.type() === "error") erros.push(m.text()); });
await pagina.goto("file://" + arquivo, { waitUntil: "load" });
await pagina.waitForTimeout(300);
await pagina.evaluate(() => App.prepararImpressao());
await pagina.waitForTimeout(400);
await pagina.emulateMedia({ media: "print" });
await pagina.waitForTimeout(200);

const medida = await pagina.evaluate(() => {
  const folhas = [...document.querySelectorAll("#impressao .folha")];
  const falhas = folhas.filter((f) => /não renderizado para impressão/.test(f.textContent))
    .map((f) => f.querySelector(".passo").textContent.trim());
  const blocos = [...document.querySelectorAll("#impressao .apendice .bloco-notas")];
  const semNotas = folhas
    .map((f) => f.querySelector(".passo").textContent.trim().match(/\d+/)[0])
    .filter((id) => !blocos.some((b) => b.querySelector("h2").textContent.indexOf(id + " · ") === 0));
  const controles = folhas.reduce((a, f) => {
    /* Botões que são cartões de conteúdo, como as alternativas do quiz,
       permanecem: escondê-los apagaria o próprio conteúdo do slide. */
    const vis = [...f.querySelectorAll(".btn, input, textarea, select")]
      .filter((b) => getComputedStyle(b).display !== "none").length;
    return a + vis;
  }, 0);
  /* A folha é a página: 209mm valem 790px em 96 dpi. O palco reduzido precisa
     caber dentro dela, e o conteúdo precisa caber no palco. */
  const estouradas = folhas.map((f, i) => {
    const palco = f.querySelector(".palco-folha");
    const corpo = palco.querySelector(".corpo");
    const alturaPalco = palco.getBoundingClientRect().height;
    const fora = Math.max(0, corpo.scrollHeight - corpo.clientHeight);
    return { i: i + 1, fora: Math.round(fora),
             baixo: Math.round(f.getBoundingClientRect().top + 20 * 3.7795 +
                               alturaPalco - f.getBoundingClientRect().bottom) };
  }).filter((x) => x.fora > 2);
  return { folhas: folhas.length, falhas, semNotas, controles,
           blocos: blocos.length, estouradas };
});

await pagina.pdf({ path: saida, format: "A4", landscape: true, printBackground: true,
                   margin: { top: "0", right: "0", bottom: "0", left: "0" } });
await navegador.close();

console.log("folhas montadas:", medida.folhas);
console.log("folhas com erro de montagem:", medida.falhas.length ? medida.falhas.join(", ") : "nenhuma");
console.log("blocos de notas no apêndice:", medida.blocos);
console.log("slides sem bloco de notas:", medida.semNotas.length ? medida.semNotas.join(", ") : "nenhum");
console.log("controles visíveis na impressão:", medida.controles);
console.log("folhas com conteúdo além do palco:", medida.estouradas.length
  ? medida.estouradas.map((x) => x.i + " (+" + x.fora + "px)").join(", ") : "nenhuma");
console.log("erros de console:", erros.length ? erros.slice(0, 5).join(" | ") : "nenhum");
console.log("pdf:", saida, Math.round(fs.statSync(saida).size / 1024) + " KB");
