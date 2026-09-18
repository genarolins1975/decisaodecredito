// QA visual de uma página HTML do Laboratório: capturas em três larguras, rolagem horizontal, hífen ou travessão no texto visível, estouro de contêiner.
// Uso: node scripts/qa.mjs caminho/da/pagina.html   (usa o Chromium de /opt/pw-browsers; requer o pacote playwright resolvível a partir do diretório atual)
import { chromium } from "playwright"; import fs from "node:fs"; import path from "node:path";
const file = path.resolve(process.argv[2] ?? ""); if (!fs.existsSync(file)) { console.error("arquivo não encontrado:", file); process.exit(2); }
const out = path.join(path.dirname(file), "qa"); fs.mkdirSync(out, { recursive: true }); const nome = path.basename(file, ".html");
const exe = fs.existsSync("/opt/pw-browsers/chromium-1194/chrome-linux/chrome") ? "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" : undefined;
const b = await chromium.launch({ executablePath: exe }); let falhas = 0;
for (const w of [1400, 960, 400]) {
  const p = await b.newPage({ viewport: { width: w, height: 900 }, deviceScaleFactor: w < 500 ? 2 : 1 });
  await p.goto("file://" + file, { waitUntil: "load" }); await p.waitForTimeout(300);
  const r = await p.evaluate(() => {
    const doc = document.documentElement; const texto = document.body.innerText;
    const tracos = (texto.match(/[-–—]/g) ?? []).length;
    const estouros = [...document.querySelectorAll("body *")].filter((el) => { const cs = getComputedStyle(el); if (cs.overflow !== "visible" && cs.overflow !== "") return false; const pr = el.parentElement?.getBoundingClientRect(); const rr = el.getBoundingClientRect(); return pr && rr.width > 0 && rr.right > pr.right + 2 && el.parentElement !== document.body; }).length;
    return { scroll: doc.scrollWidth, cliente: doc.clientWidth, tracos, estouros };
  });
  await p.screenshot({ path: path.join(out, `${nome}-${w}.png`), fullPage: true });
  const ok = r.scroll <= r.cliente && r.tracos === 0; if (!ok || r.estouros) falhas++;
  console.log(`${w}px: rolagem ${r.scroll}/${r.cliente} ${r.scroll > r.cliente ? "ESTOURO" : "ok"} · traços no texto: ${r.tracos} · elementos além do pai: ${r.estouros} · captura ${path.relative(process.cwd(), path.join(out, `${nome}-${w}.png`))}`);
  await p.close();
}
await b.close(); console.log(falhas ? `QA com ${falhas} viewport(s) a corrigir` : "QA limpo"); process.exit(falhas ? 1 : 0);
