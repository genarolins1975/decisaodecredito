import { NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";

export async function GET() {
  const css = fs.readFileSync(path.join(process.cwd(), "node_modules/katex/dist/katex.min.css"), "utf8").replace(/url\(fonts\//g, "url(/legado/fonts/");
  return new NextResponse(css, { headers: { "content-type": "text/css; charset=utf-8", "cache-control": "public, max-age=86400" } });
}
