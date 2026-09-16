import "server-only";
import { sql } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { ApiError } from "@/lib/auth/guard";

/** Janela fixa persistida no banco: funciona com várias instâncias. */
export async function rateLimit(key: string, limit: number, windowSeconds: number) {
  const now = new Date();
  const res = await db.execute(sql`
    INSERT INTO rate_limits (key, window_start, count) VALUES (${key}, ${now}, 1)
    ON CONFLICT (key) DO UPDATE SET
      count = CASE WHEN rate_limits.window_start < ${new Date(now.getTime() - windowSeconds * 1000)} THEN 1 ELSE rate_limits.count + 1 END,
      window_start = CASE WHEN rate_limits.window_start < ${new Date(now.getTime() - windowSeconds * 1000)} THEN ${now} ELSE rate_limits.window_start END
    RETURNING count`);
  const count = Number((res.rows[0] as { count: number }).count);
  if (count > limit) throw new ApiError(429, "Muitas tentativas. Aguarde alguns minutos.", "rate_limited");
}

/** Só consulta: bloqueia se a janela já estourou, sem consumir tentativa. Use com `rateLimit` no ramo de falha. */
export async function rateLimitPeek(key: string, limit: number, windowSeconds: number) {
  const res = await db.execute(sql`SELECT count, window_start FROM rate_limits WHERE key = ${key}`);
  const row = res.rows[0] as { count: number; window_start: Date } | undefined;
  if (!row) return;
  const fresh = new Date(row.window_start).getTime() >= Date.now() - windowSeconds * 1000;
  if (fresh && Number(row.count) >= limit) throw new ApiError(429, "Muitas tentativas. Aguarde alguns minutos.", "rate_limited");
}
