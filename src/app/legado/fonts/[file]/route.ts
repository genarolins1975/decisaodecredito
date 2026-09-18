import { NextResponse, type NextRequest } from "next/server";
import fs from "node:fs";
import path from "node:path";

const MIME: Record<string, string> = { woff2: "font/woff2", woff: "font/woff", ttf: "font/ttf" };
export async function GET(_req: NextRequest, ctx: { params: Promise<{ file: string }> }) {
  const { file } = await ctx.params;
  if (!/^KaTeX_[A-Za-z0-9-]+\.(woff2|woff|ttf)$/.test(file)) return new NextResponse("não encontrado", { status: 404 });
  const p = path.join(process.cwd(), "node_modules/katex/dist/fonts", file);
  if (!fs.existsSync(p)) return new NextResponse("não encontrado", { status: 404 });
  return new NextResponse(fs.readFileSync(p), { headers: { "content-type": MIME[file.split(".").pop()!], "cache-control": "public, max-age=31536000, immutable", "access-control-allow-origin": "*" } });
}
