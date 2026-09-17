import "server-only";
import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { ApiError } from "@/lib/auth/guard";

export function json(data: unknown, init?: number | ResponseInit) {
  return NextResponse.json(data, typeof init === "number" ? { status: init } : init);
}

/** Proteção CSRF: cabeçalho exigido + origem coerente com a aplicação em requisições mutáveis. */
export function assertSameOrigin(req: NextRequest) {
  if (["GET", "HEAD", "OPTIONS"].includes(req.method)) return;
  const site = req.headers.get("sec-fetch-site");
  const origin = req.headers.get("origin");
  const appUrl = process.env.APP_URL;
  if (site && site !== "same-origin" && site !== "none") throw new ApiError(403, "Origem não permitida", "csrf");
  // Origem aceita: a do próprio pedido (host que atendeu, inclusive pré-visualizações) ou a de APP_URL
  const requestHost = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
  const allowed = new Set([requestHost, appUrl ? new URL(appUrl).host : null].filter(Boolean));
  if (origin && process.env.NODE_ENV === "production" && !allowed.has(new URL(origin).host))
    throw new ApiError(403, "Origem não permitida", "csrf");
  if (req.headers.get("x-requested-with") !== "fetch" && !req.headers.get("content-type")?.startsWith("multipart/form-data"))
    throw new ApiError(403, "Cabeçalho de requisição ausente", "csrf");
}

type Handler<C> = (req: NextRequest, ctx: C) => Promise<Response>;

export function handle<C = unknown>(fn: Handler<C>): Handler<C> {
  return async (req, ctx) => {
    try {
      assertSameOrigin(req);
      return await fn(req, ctx);
    } catch (e) {
      if (e instanceof ApiError) return json({ error: e.message, code: e.code ?? null }, e.status);
      if (e instanceof z.ZodError) return json({ error: "Dados inválidos", code: "validation", issues: e.issues.map((i) => ({ path: i.path.join("."), message: i.message })) }, 400);
      console.error("[api]", e);
      return json({ error: "Erro interno", code: "internal" }, 500);
    }
  };
}

export async function parseBody<T extends z.ZodTypeAny>(req: NextRequest, schema: T): Promise<z.infer<T>> {
  let body: unknown;
  try { body = await req.json(); } catch { throw new ApiError(400, "Corpo JSON inválido", "bad_json"); }
  return schema.parse(body);
}

export async function params<T extends Record<string, string>>(ctx: { params: Promise<T> }) { return ctx.params; }
