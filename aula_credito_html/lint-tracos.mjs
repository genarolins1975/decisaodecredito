/* Procura hífen ou travessão em qualquer texto declarado nos slides,
   inclusive notas do professor, que só aparecem no modo estudo e na impressão. */
import { chromium } from "playwright";
import fs from "node:fs";
const exe = "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";
const b = await chromium.launch({ executablePath: exe });
const p = await b.newPage();
await p.goto("file://" + process.cwd() + "/dist/aula_credito.html");
const achados = await p.evaluate(() => {
  const out = [];
  const re = /[-–—]/;
  function anda(id, campo, v) {
    if (typeof v === "string") { if (re.test(v)) out.push({ id, campo, v }); return; }
    if (Array.isArray(v)) { v.forEach((x, i) => anda(id, campo + "[" + i + "]", x)); return; }
    if (v && typeof v === "object") {
      Object.keys(v).forEach((k) => anda(id, campo + "." + k, v[k]));
    }
  }
  Aula.slides.forEach((s) => {
    ["titulo", "subtitulo", "conclusao", "fonte", "resumo", "notas"].forEach((k) => anda(s.id, k, s[k]));
  });
  return out;
});
achados.forEach((a) => console.log(a.id, a.campo, "|", a.v.slice(0, 120)));
console.log(achados.length + " ocorrências");
await b.close();
