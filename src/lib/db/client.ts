import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

declare global {
  var __pgPool: Pool | undefined;
}

/**
 * TLS com provedores gerenciados (Supabase, Neon): DATABASE_SSL_CA recebe o certificado raiz em PEM
 * (verificação completa, recomendado); DATABASE_SSL=no-verify cifra sem verificar a cadeia
 * (aceitável em homologação); vazio usa apenas o que a própria DATABASE_URL pedir (sslmode).
 */
export function sslConfig(): false | { ca?: string; rejectUnauthorized: boolean } | undefined {
  const ca = process.env.DATABASE_SSL_CA?.replace(/\\n/g, "\n").trim();
  if (ca) return { ca, rejectUnauthorized: true };
  if (process.env.DATABASE_SSL === "no-verify") return { rejectUnauthorized: false };
  return undefined;
}

function makePool() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL não definida");
  const ssl = sslConfig();
  return new Pool({ connectionString: url, max: Number(process.env.PG_POOL_MAX ?? 10), ...(ssl ? { ssl } : {}) });
}

export const pool: Pool = global.__pgPool ?? makePool();
if (process.env.NODE_ENV !== "production") global.__pgPool = pool;

export const db = drizzle(pool, { schema });
export type Db = typeof db;
export type Tx = Parameters<Parameters<Db["transaction"]>[0]>[0];
export { schema };
