/* Lista os painéis cujo conteúdo não cabe na caixa, com direção e culpado.
   Uso: node apertado.mjs 07 11 43 */
import { chromium } from "playwright";
const ids = process.argv.slice(2).filter((a) => /^\d{2}$/.test(a));
const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" });
const p = await b.newPage({ viewport: { width: 1366, height: 768 } });
await p.goto("file://" + process.cwd() + "/dist/aula_credito.html");
await p.waitForTimeout(200);
for (const id of ids) {
  await p.evaluate((i) => { location.hash = "#/slide/" + i; }, id);
  await p.waitForTimeout(160);
  const linhas = await p.evaluate(() => {
    const k = document.getElementById("palco").getBoundingClientRect().width / 1600;
    const out = [];
    document.querySelectorAll("#corpo .painel").forEach((pn) => {
      const cs = getComputedStyle(pn);
      if (cs.overflowY === "auto" || cs.overflowY === "scroll") return;
      const dv = pn.scrollHeight - pn.clientHeight, dh = pn.scrollWidth - pn.clientWidth;
      if (dv <= 2 && dh <= 2) return;
      const filhos = [...pn.children].map((f) => {
        const r = f.getBoundingClientRect();
        return `      ${f.tagName}.${typeof f.className === "string" ? f.className : ""} ` +
          `larg=${Math.round(r.width / k)} alt=${Math.round(r.height / k)} | ` +
          (f.textContent || "").trim().slice(0, 34);
      }).join("\n");
      out.push(`  painel ${Math.round(pn.getBoundingClientRect().width / k)}x` +
        `${Math.round(pn.getBoundingClientRect().height / k)} vertical +${Math.round(dv / k)} ` +
        `horizontal +${Math.round(dh / k)}\n${filhos}`);
    });
    return out.join("\n");
  });
  console.log("slide " + id + "\n" + linhas);
}
await b.close();
