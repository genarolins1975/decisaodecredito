import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

declare global {
  var __pgPool: Pool | undefined;
}

/**
 * TLS com provedores gerenciados (Supabase, Neon). O `sslmode` da URL é retirado e resolvido aqui,
 * porque o driver dá prioridade ao que vem na URL e descartaria o certificado configurado à parte.
 * DATABASE_SSL_CA: certificado raiz do provedor em PEM (verificação completa, recomendado).
 * DATABASE_SSL=no-verify (ou sslmode=no-verify): cifra sem verificar a cadeia; só homologação.
 * Sem nada disso: sslmode=require/verify-* verifica contra as raízes públicas; sslmode=disable ou ausente não cifra.
 */
export function resolvePg(url: string, env: Record<string, string | undefined> = process.env): { connectionString: string; ssl?: { ca?: string; rejectUnauthorized: boolean } } {
  const u = new URL(url);
  const mode = u.searchParams.get("sslmode");
  u.searchParams.delete("sslmode");
  const connectionString = u.toString();
  const ca = env.DATABASE_SSL_CA?.replace(/\\n/g, "\n").trim();
  if (ca) return { connectionString, ssl: { ca, rejectUnauthorized: true } };
  if (env.DATABASE_SSL === "no-verify" || mode === "no-verify") return { connectionString, ssl: { rejectUnauthorized: false } };
  if (mode && mode !== "disable") return { connectionString, ssl: { rejectUnauthorized: true } };
  return { connectionString };
}

function makePool() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL não definida");
  return new Pool({ ...resolvePg(url), max: Number(process.env.PG_POOL_MAX ?? 10) });
}

export const pool: Pool = global.__pgPool ?? makePool();
if (process.env.NODE_ENV !== "production") global.__pgPool = pool;

export const db = drizzle(pool, { schema });
export type Db = typeof db;
export type Tx = Parameters<Parameters<Db["transaction"]>[0]>[0];
export { schema };
