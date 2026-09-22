/* Necessidade contra disponível, linha a linha, em cada quadro 16:9. A necessidade é medida pela
   geometria do que está desenhado, não por scrollHeight: overlay escondido não conta como conteúdo
   perdido. Com isso o conserto das linhas é calculado de uma vez, e não uma linha por rodada. */
import { chromium } from "playwright";
const BASE = process.env.APP_URL ?? "http://localhost:3000";
const iL = process.argv.indexOf("--largura");
const [LARG, ALT] = (iL >= 0 ? process.argv[iL + 1] : "1366x768").split("x").map(Number);
const slugs = process.argv.slice(2).filter((a) => /^c\d+p\d+$/.test(a));
const estados = process.argv.includes("--estados");
const iRota = process.argv.indexOf("--rota");
const ROTA = iRota >= 0 ? process.argv[iRota + 1] : "aulas";
const nav = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH ?? "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" });
const ctx = await nav.newContext({ viewport: { width: LARG, height: ALT } });
const pag = await ctx.newPage();
await pag.goto(`${BASE}/entrar`, { waitUntil: "domcontentloaded" });
await pag.fill("input[name=email]", "genaro.lins@gmail.com");
await pag.fill("input[name=password]", "professor-dev-2026");
await pag.click("button[type=submit]");
await pag.waitForURL((u) => !u.toString().includes("/entrar"), { timeout: 30000 });
for (const slug of slugs) {
  await pag.goto(`${BASE}/${ROTA}/${slug}`, { waitUntil: "networkidle" });
  await pag.waitForTimeout(250);
  if (estados) {
    for (const b of await pag.$$(".rl-slide button[type=button], .rl-slide input[type=radio]")) {
      try { await b.click({ timeout: 1500 }); } catch {}
      await pag.waitForTimeout(90);
    }
  }
  const quadros = await pag.evaluate(() => {
    const desenhado = (el) => { const s = getComputedStyle(el); if (s.display === "none" || s.visibility === "hidden" || Number(s.opacity) === 0) return false; const r = el.getBoundingClientRect(); return r.width > 1 && r.height > 1; };
    const aVista = (el) => { for (let n = el; n && n !== document.body; n = n.parentElement) if (!desenhado(n)) return false; return true; };
    return [...document.querySelectorAll(".rl-slide")].map((q) => {
      const linhas = getComputedStyle(q).gridTemplateRows.split(" ").map((v) => parseFloat(v));
      if (!linhas.length || Number.isNaN(linhas[0])) return { estreito: true };
      const need = (el) => {
        const r = el.getBoundingClientRect(); let fundo = -Infinity;
        for (const d of el.querySelectorAll("*")) {
          if (d.closest("svg") && d.tagName !== "svg") continue;
          if (!desenhado(d) || !aVista(d)) continue;
          const b = d.getBoundingClientRect(); if (b.bottom > fundo) fundo = b.bottom;
        }
        const pb = parseFloat(getComputedStyle(el).paddingBottom) || 0;
        return { cls: (el.getAttribute("class") || "").split(" ")[0] || el.tagName.toLowerCase(), linha: Number(getComputedStyle(el).gridRowStart),
                 tem: Math.round(r.height), precisa: fundo > -Infinity ? Math.round(fundo - r.top + pb) : 0 };
      };
      return { vz: q.closest("[data-vz]")?.dataset.vz ?? null, tela: q.dataset.tela, linhasPx: linhas.map((v) => Math.round(v)), filhos: [...q.children].map(need) };
    });
  });
  for (const q of quadros) {
    if (q.estreito) { console.log(`${slug}: quadro em modo estreito, sem grid`); continue; }
    const apertadas = q.filhos.filter((f) => f.precisa > f.tem);
    const folga = q.filhos.filter((f) => f.precisa > 0 && f.tem - f.precisa >= 8);
    console.log(`${slug} · ${q.vz} · tela ${q.tela} · linhas px: ${q.linhasPx.join(" ")}`);
    for (const f of q.filhos) {
      const d = f.tem - f.precisa;
      const marca = f.precisa === 0 ? "     " : d < 0 ? "CURTA" : d < 4 ? "justa" : "     ";
      console.log(`   ${marca} linha ${String(f.linha).padStart(2)} ${f.cls.padEnd(14)} tem ${String(f.tem).padStart(4)}  precisa ${String(f.precisa).padStart(4)}  sobra ${String(d).padStart(4)}`);
    }
    if (!apertadas.length) console.log("   nenhuma linha curta");
    else console.log(`   curtas: ${apertadas.map((f) => f.cls).join(", ")}; com folga: ${folga.map((f) => f.cls).join(", ") || "nenhuma"}`);
  }
}
await nav.close();
