import { NextResponse, type NextRequest } from "next/server";
import fs from "node:fs";
import path from "node:path";
import { verifyExpiring } from "@/lib/crypto";

export async function GET(req: NextRequest) {
  const t = new URL(req.url).searchParams.get("t") ?? "";
  if (verifyExpiring(t) !== "legacy-engine") return new NextResponse("expirado", { status: 403 });
  const body = fs.readFileSync(path.join(process.cwd(), "content/generated/legacy.css"));
  return new NextResponse(body, { headers: { "content-type": "text/css; charset=utf-8", "cache-control": "private, max-age=900" } });
}
