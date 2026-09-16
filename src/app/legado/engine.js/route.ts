import { NextResponse, type NextRequest } from "next/server";
import fs from "node:fs";
import path from "node:path";
import { verifyExpiring } from "@/lib/crypto";

/** Motor legado (sem guia e sem gabaritos). Servido só com token assinado de curta validade. */
export async function GET(req: NextRequest) {
  const t = new URL(req.url).searchParams.get("t") ?? "";
  if (verifyExpiring(t) !== "legacy-engine") return new NextResponse("expirado", { status: 403 });
  const file = path.join(process.cwd(), "content/generated/legacy-engine.js");
  const body = fs.readFileSync(file);
  return new NextResponse(body, { headers: { "content-type": "application/javascript; charset=utf-8", "cache-control": "private, max-age=900" } });
}
