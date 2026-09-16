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
