/* Verificação automática da aula.
   Para cada slide: abre a distribuição offline, registra erros de console,
   procura hífen ou travessão no texto visível, mede o transbordo em relação à
   área de 1600 por 900, detecta rótulo que sai da viewBox do SVG e é cortado
   na tela e, quando pedido, salva capturas. A folga de 5 unidades absorve a
   caixa própria do texto, que passa da tinta do glifo.
   Abaixo de 1100px de largura a aula entra em modo estudo por conta própria:
   ali o palco cresce e a página rola na vertical, então a verificação passa a
   cobrar apenas ausência de rolagem horizontal.

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
    /* No modo projeção o palco é uma folha fixa de 1600 por 900: qualquer
       elemento que ultrapasse suas bordas fica fora da tela. No modo estudo o
       palco cresce e a página rola na vertical por construção, então só o
       excesso horizontal indica defeito. */
    const estudo = document.body.classList.contains("estudo");
    const r = palco.getBoundingClientRect();
    let transbordo = 0;
    let culpado = null;
    /* Conteúdo dentro de um contêiner que rola na horizontal por desenho não é
       transbordo: quem lê alcança o resto arrastando. */
    function dentroDeRolagem(el) {
      for (let a = el.parentElement; a && a !== palco; a = a.parentElement) {
        const o = getComputedStyle(a).overflowX;
        if (o === "auto" || o === "scroll") return true;
      }
      return false;
    }
    /* O KaTeX monta a expressão com caixas internas que ele mesmo recorta: o MathML fica em 1 por
       1 pixel para o leitor de tela e o radical usa um SVG de 400em dentro de um contêiner com
       overflow hidden. Ambos devolvem a largura natural em getBoundingClientRect. O que se vê é a
       caixa do .katex, e é ela que entra na medida; o miolo é detalhe de implementação. */
    function internoDoKatex(el) {
      const k = el.closest(".katex");
      return !!k && k !== el;
    }
    for (const el of palco.querySelectorAll("#corpo *")) {
      const b = el.getBoundingClientRect();
      if (b.height === 0 || b.width === 0) continue;
      if (dentroDeRolagem(el) || internoDoKatex(el)) continue;
      const dir = (b.right - r.right) / (r.width || 1);
      const v = estudo ? dir : Math.max((b.bottom - r.bottom) / (r.height || 1), dir);
      if (v > transbordo) {
        transbordo = v;
        culpado = el.tagName.toLowerCase() + " " + (el.textContent || "").trim().slice(0, 40);
      }
    }
    /* Texto fora da viewBox de um SVG é cortado em silêncio pelo navegador:
       o rótulo some das bordas sem erro de console. */
    let corte = 0;
    let cortado = null;
    for (const svg of palco.querySelectorAll("#corpo svg")) {
      const vb = (svg.getAttribute("viewBox") || "").split(/[ ,]+/).map(Number);
      const cx = svg.getBoundingClientRect();
      if (vb.length !== 4 || !cx.width) continue;
      const escala = vb[2] / cx.width; /* pixels da tela para unidades da viewBox */
      /* Um SVG mais largo que o próprio painel derrama sobre o painel vizinho,
         que o cobre com o próprio fundo. Invadir o preenchimento interno não é
         defeito: o fundo do painel continua atrás do desenho. */
      const pai = svg.parentElement;
      if (pai) {
        const sobra = (cx.width - pai.getBoundingClientRect().width) * escala;
        if (sobra > corte) {
          corte = sobra;
          cortado = Math.round(sobra) + "px | desenho mais largo que o painel";
        }
      }
      const base = svg.getScreenCTM();
      for (const t of svg.querySelectorAll("text")) {
        /* Os títulos de eixo ficam sempre à mesma distância da moldura e a
           caixa própria encosta na borda em poucas unidades sem que o glifo
           saia. A folga maior vale só para eles; um título longo demais, que
           realmente ultrapassa o desenho, continua sendo apontado. */
        const folga = t.getAttribute("class") === "rotulo" ? 12 : 0;
        let cb;
        try { cb = t.getBBox(); } catch (e) { continue; }
        if (!cb.width && !cb.height) continue;
        /* getBoundingClientRect de texto girado devolve a caixa de linha, larga
           demais: aqui os quatro cantos da caixa própria vão para a tela pela
           matriz do elemento, o que respeita rotação e escala. */
        const mt = t.getScreenCTM();
        if (!mt || !base) continue;
        const rel = base.inverse().multiply(mt);
        let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
        for (const [ux, uy] of [[cb.x, cb.y], [cb.x + cb.width, cb.y],
                                [cb.x, cb.y + cb.height],
                                [cb.x + cb.width, cb.y + cb.height]]) {
          const px = rel.a * ux + rel.c * uy + rel.e;
          const py = rel.b * ux + rel.d * uy + rel.f;
          x0 = Math.min(x0, px); x1 = Math.max(x1, px);
          y0 = Math.min(y0, py); y1 = Math.max(y1, py);
        }
        const b = { left: cx.left + x0 * (cx.width / vb[2]),
                    right: cx.left + x1 * (cx.width / vb[2]),
                    top: cx.top + y0 * (cx.height / vb[3]),
                    bottom: cx.top + y1 * (cx.height / vb[3]) };
        const fora = Math.max(cx.left - b.left, b.right - cx.right,
                              cx.top - b.top, b.bottom - cx.bottom) * escala - folga;
        if (fora > corte) {
          corte = fora;
          cortado = Math.round(fora) + "px | " + (t.textContent || "").trim().slice(0, 40);
        }
      }
    }
    /* Painel cujo conteúdo não cabe na caixa: o excedente fica sob o painel
       vizinho, que o cobre com o próprio fundo. */
    let estouro = 0;
    let estourado = null;
    for (const pn of palco.querySelectorAll("#corpo .painel")) {
      const cs = getComputedStyle(pn);
      if (cs.overflowY === "auto" || cs.overflowY === "scroll") continue;
      const v = Math.max(pn.scrollHeight - pn.clientHeight,
                         pn.scrollWidth - pn.clientWidth);
      if (v > estouro) {
        estouro = v;
        estourado = Math.round(v) + "px | " + (pn.textContent || "").trim().slice(0, 40);
      }
    }

    return {
      estudo,
      estouro: Math.round(estouro),
      estourado,
      corte: Math.round(corte),
      cortado,
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
  const falha = novos > 0 || medida.tracos > 0 || medida.transbordo > 0.5 ||
    medida.corte > 5 || medida.estouro > 2 ||
    (medida.estudo ? medida.rolagemPagina > 2 : medida.rolagemCorpo > 2);
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
      return { estudo: document.body.classList.contains("estudo"),
               tracos: (texto.match(/[-–—]/g) || []).length,
               rolagemCorpo: corpo ? corpo.scrollHeight - corpo.clientHeight : 0,
               rolagemPagina: document.documentElement.scrollWidth -
                 document.documentElement.clientWidth };
    });
    const erroEstado = erros.length - antes - novos;
    relatorio[relatorio.length - 1].estados = { ...depois, erros: erroEstado };
    if (erroEstado > 0 || depois.tracos > 0 ||
        (depois.estudo ? depois.rolagemPagina > 2 : depois.rolagemCorpo > 2)) {
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
    ? ` | estados: erros ${r.estados.erros} traços ${r.estados.tracos} rolagem ` +
      `${r.estados.estudo ? r.estados.rolagemPagina : r.estados.rolagemCorpo}`
    : "";
  console.log(`${marca} ${r.id}  erros ${r.erros}  traços ${r.tracos}  ` +
    `rolagem ${r.estudo ? r.rolagemPagina + "px na horizontal" : r.rolagemCorpo + "px"}  ` +
    `transbordo ${r.transbordo}%  controles ${r.controles}  svg ${r.svgs}${extra}` +
    (r.amostra ? `\n        traço em: ${r.amostra}` : "") +
    (r.corte > 5 ? `\n        rótulo cortado: ${r.cortado}` : "") +
    (r.estouro > 2 ? `\n        painel apertado: ${r.estourado}` : "") +
    (r.falha && r.transbordo > 0.5 && r.culpado ? `\n        maior transbordo: ${r.culpado}` : ""));
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
