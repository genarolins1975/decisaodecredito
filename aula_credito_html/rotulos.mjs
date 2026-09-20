/* Lista, por slide, os rótulos de SVG cuja caixa sai da viewBox e portanto
   aparecem cortados na projeção. Uso: node rotulos.mjs 05 06 48 */
import { chromium } from "playwright";
const exe = "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";
const ids = process.argv.slice(2).filter((a) => /^\d{2}$/.test(a));
const b = await chromium.launch({ executablePath: exe });
const p = await b.newPage({ viewport: { width: 1366, height: 768 } });
await p.goto("file://" + process.cwd() + "/dist/aula_credito.html");
await p.waitForTimeout(200);
for (const id of ids) {
  await p.evaluate((i) => { location.hash = "#/slide/" + i; }, id);
  await p.waitForTimeout(160);
  const linhas = await p.evaluate(() => {
    const out = [];
    document.querySelectorAll("#corpo svg").forEach((svg, k) => {
      const vb = (svg.getAttribute("viewBox") || "").split(/[ ,]+/).map(Number);
      if (vb.length !== 4) return;
      const base = svg.getScreenCTM();
      svg.querySelectorAll("text").forEach((t) => {
        const folga = t.getAttribute("class") === "rotulo" ? 12 : 0;
        let cb; try { cb = t.getBBox(); } catch (e) { return; }
        const mt = t.getScreenCTM();
        if (!mt || !base) return;
        const rel = base.inverse().multiply(mt);
        let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
        for (const [ux, uy] of [[cb.x, cb.y], [cb.x + cb.width, cb.y],
                                [cb.x, cb.y + cb.height], [cb.x + cb.width, cb.y + cb.height]]) {
          const px = rel.a * ux + rel.c * uy + rel.e, py = rel.b * ux + rel.d * uy + rel.f;
          x0 = Math.min(x0, px); x1 = Math.max(x1, px);
          y0 = Math.min(y0, py); y1 = Math.max(y1, py);
        }
        const fora = Math.max(vb[0] - x0, x1 - (vb[0] + vb[2]),
                              vb[1] - y0, y1 - (vb[1] + vb[3])) - folga;
        if (fora > 5) {
          out.push(`  svg#${k} [${vb.join(" ")}]  x ${Math.round(x0)}..${Math.round(x1)}` +
            `  y ${Math.round(y0)}..${Math.round(y1)}  sai ${Math.round(fora)}  | ` +
            (t.textContent || "").trim());
        }
      });
    });
    return out;
  });
  console.log("slide " + id + (linhas.length ? "\n" + linhas.join("\n") : "  sem corte"));
}
await b.close();
