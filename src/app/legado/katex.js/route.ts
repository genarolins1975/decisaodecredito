import { NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";

/** KaTeX com auto-render para o visual legado (biblioteca pública, sem dados do curso). */
export async function GET() {
  const dist = path.join(process.cwd(), "node_modules/katex/dist");
  const body = fs.readFileSync(path.join(dist, "katex.min.js"), "utf8") + "\n" + fs.readFileSync(path.join(dist, "contrib/auto-render.min.js"), "utf8");
  return new NextResponse(body, { headers: { "content-type": "application/javascript; charset=utf-8", "cache-control": "public, max-age=86400" } });
}
