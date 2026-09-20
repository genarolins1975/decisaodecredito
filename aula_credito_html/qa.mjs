/* Verificação automática da aula.
   Para cada slide: abre a distribuição offline, registra erros de console,
   procura hífen ou travessão no texto visível, mede o transbordo em relação à
   área de 1600 por 900 e, quando pedido, salva capturas.

   Uso:
     node qa.mjs                       verifica os 50 slides em 1366x768
     node qa.mjs --shots 01 09 22      salva capturas dos slides indicados
     node qa.mjs --largura 1920x1080   outra resolução
     node qa.mjs --estados             percorre também os estados extras de cada slide
*/

import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const raiz = path.dirname(fileURLToPath(import.meta.url));
const arquivo = path.join(raiz, "dist", "aula_credito.html");
const pastaQa = path.join(raiz, "qa");
fs.mkdirSync(pastaQa, { recursive: true });

const args = process.argv.slice(2);
const comShots = args.includes("--shots");
const comEstados = args.includes("--estados");
const iL = args.indexOf("--largura");
const [W, H] = (iL >= 0 ? args[iL + 1] : "1366x768").split("x").map(Number);
const alvos = args.filter((a) => /^\d{2}$/.test(a));

const exe = fs.existsSync("/opt/pw-browsers/chromium-1194/chrome-linux/chrome")
  ? "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" : undefined;
const navegador = await chromium.launch({ executablePath: exe });
const pagina = await navegador.newPage({ viewport: { width: W, height: H } });

const erros = [];
const externas = [];
pagina.on("console", (m) => {
  if (m.type() === "error") erros.push({ slide: atual, texto: m.text() });
});
pagina.on("pageerror", (e) => erros.push({ slide: atual, texto: String(e) }));
pagina.on("request", (r) => {
  const u = r.url();
  if (!u.startsWith("file://") && !u.startsWith("data:")) externas.push(u);
});

let atual = "00";
await pagina.goto("file://" + arquivo, { waitUntil: "load" });
await pagina.waitForTimeout(250);

const lista = await pagina.evaluate(() => Aula.slides.map((s) => ({ id: s.id, titulo: s.titulo, bloco: s.bloco })));
const ids = alvos.length ? alvos : lista.map((s) => s.id);

const relatorio = [];
for (const id of ids) {
  atual = id;
  const antes = erros.length;
  await pagina.evaluate((i) => { location.hash = "#/slide/" + i; }, id);
  await pagina.waitForTimeout(140);
  const medida = await pagina.evaluate(() => {
    const palco = document.getElementById("palco");
    const corpo = document.getElementById("corpo");
    const texto = document.body.innerText;
    const tracos = (texto.match(/[-–—]/g) || []).length;
    let amostra = null;
    if (tracos) {
      const m = texto.match(/.{0,40}[-–—].{0,40}/);
      amostra = m ? m[0].replace(/\n/g, " ") : null;
    }
    const r = palco.getBoundingClientRect();
    let transbordo = 0;
    let culpado = null;
    for (const el of palco.querySelectorAll("#corpo *")) {
      const b = el.getBoundingClientRect();
      if (b.height === 0 || b.width === 0) continue;
      const v = Math.max((b.bottom - r.bottom) / (r.height || 1),
                         (b.right - r.right) / (r.width || 1));
      if (v > transbordo) {
        transbordo = v;
        culpado = el.tagName.toLowerCase() + " " + (el.textContent || "").trim().slice(0, 40);
      }
    }
    return {
      alturaCorpo: corpo ? corpo.scrollHeight : 0,
      corpoVisivel: corpo ? corpo.clientHeight : 0,
      rolagemCorpo: corpo ? corpo.scrollHeight - corpo.clientHeight : 0,
      transbordo: Math.round(transbordo * 1000) / 10,
      tracos, amostra, culpado,
      rolagemPagina: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      controles: palco.querySelectorAll("button,input").length,
      svgs: palco.querySelectorAll("svg").length,
    };
  });
  const novos = erros.length - antes;
  const falha = novos > 0 || medida.tracos > 0 || medida.rolagemCorpo > 2 || medida.transbordo > 0.5;
  relatorio.push({ id, ...medida, erros: novos, falha });
  if (comShots) {
    await pagina.screenshot({ path: path.join(pastaQa, `slide-${id}-${W}.png`) });
  }
  if (comEstados) {
    const estados = await pagina.evaluate(() => {
      const palco = document.getElementById("palco");
      return [...palco.querySelectorAll("#corpo button")].map((b, i) => i);
    });
    for (const i of estados.slice(0, 14)) {
      await pagina.evaluate((k) => {
        const b = document.querySelectorAll("#corpo button")[k];
        if (b && !b.disabled) b.click();
      }, i);
      await pagina.waitForTimeout(45);
    }
    const depois = await pagina.evaluate(() => {
      const corpo = document.getElementById("corpo");
      const texto = document.body.innerText;
      return { tracos: (texto.match(/[-–—]/g) || []).length,
               rolagemCorpo: corpo ? corpo.scrollHeight - corpo.clientHeight : 0 };
    });
    const erroEstado = erros.length - antes - novos;
    relatorio[relatorio.length - 1].estados = { ...depois, erros: erroEstado };
    if (erroEstado > 0 || depois.tracos > 0 || depois.rolagemCorpo > 2) {
      relatorio[relatorio.length - 1].falha = true;
    }
    if (comShots) {
      await pagina.screenshot({ path: path.join(pastaQa, `slide-${id}-${W}-estado.png`) });
    }
  }
}

await navegador.close();

const falhas = relatorio.filter((r) => r.falha);
for (const r of relatorio) {
  const marca = r.falha ? "FALHA" : "ok   ";
  const extra = r.estados
    ? ` | estados: erros ${r.estados.erros} traços ${r.estados.tracos} rolagem ${r.estados.rolagemCorpo}`
    : "";
  console.log(`${marca} ${r.id}  erros ${r.erros}  traços ${r.tracos}  rolagem ${r.rolagemCorpo}px  ` +
    `transbordo ${r.transbordo}%  controles ${r.controles}  svg ${r.svgs}${extra}` +
    (r.amostra ? `\n        traço em: ${r.amostra}` : "") +
    (r.falha && r.culpado ? `\n        maior transbordo: ${r.culpado}` : ""));
}
if (externas.length) console.log("requisições externas:", [...new Set(externas)].slice(0, 5));
fs.writeFileSync(path.join(pastaQa, `relatorio-${W}.json`),
  JSON.stringify({ largura: W, altura: H, relatorio, erros, externas: [...new Set(externas)] }, null, 2));
console.log(`\n${relatorio.length} slides verificados em ${W}x${H}; ${falhas.length} com falha.`);
if (erros.length) {
  console.log("erros de console:");
  erros.slice(0, 20).forEach((e) => console.log(`  ${e.slide}: ${e.texto.slice(0, 200)}`));
}
process.exit(falhas.length ? 1 : 0);
