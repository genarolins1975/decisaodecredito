import { NextResponse, type NextRequest } from "next/server";

/**
 * Camada de conveniência: redireciona sem cookie de sessão para /entrar.
 * A autorização real acontece no servidor, em cada página e rota (guard.ts);
 * este redirecionamento é apenas experiência de uso, não controle de acesso.
 */
const PUBLIC = ["/entrar", "/ativar", "/senha/recuperar", "/senha/redefinir", "/api/auth/login", "/api/auth/ativar", "/api/auth/recuperar", "/api/auth/redefinir", "/api/health"];

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (PUBLIC.some((p) => pathname === p || pathname.startsWith(p + "/")) || pathname.startsWith("/_next") || pathname === "/favicon.ico" || pathname.startsWith("/marca/")) return NextResponse.next();
  const has = req.cookies.get("sessao")?.value;
  if (!has && !pathname.startsWith("/api/")) {
    const url = req.nextUrl.clone(); url.pathname = "/entrar"; url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = { matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"] };
