import { NextResponse, type NextRequest } from "next/server";
import { requireStaff } from "@/lib/auth/guard";
import { exchangeCode } from "@/lib/email/gmail";
import { verifyExpiring } from "@/lib/crypto";
import { audit } from "@/lib/audit";

/** Retorno do consentimento OAuth (GET, sem CSRF header: validado por state assinado + sessão do professor). */
export async function GET(req: NextRequest) {
  const base = process.env.APP_URL ?? "";
  try {
    const u = await requireStaff();
    const url = new URL(req.url);
    const state = url.searchParams.get("state") ?? "";
    const code = url.searchParams.get("code");
    const err = url.searchParams.get("error");
    if (err) return NextResponse.redirect(`${base}/professor/configuracoes?gmail=erro&m=${encodeURIComponent(err)}`);
    if (verifyExpiring(state) !== `gmail:${u.id}` || !code) return NextResponse.redirect(`${base}/professor/configuracoes?gmail=erro&m=state`);
    const email = await exchangeCode(code, u.id);
    await audit({ actorUserId: u.id, action: "gmail.connect", entity: "gmail_connection", details: { email } });
    return NextResponse.redirect(`${base}/professor/configuracoes?gmail=ok`);
  } catch (e) {
    return NextResponse.redirect(`${base}/professor/configuracoes?gmail=erro&m=${encodeURIComponent(e instanceof Error ? e.message : "falha")}`);
  }
}
