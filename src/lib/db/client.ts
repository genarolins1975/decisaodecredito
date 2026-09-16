import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

declare global {
  // eslint-disable-next-line no-var
  var __pgPool: Pool | undefined;
}

function makePool() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL não definida");
  return new Pool({ connectionString: url, max: Number(process.env.PG_POOL_MAX ?? 10) });
}

export const pool: Pool = global.__pgPool ?? makePool();
if (process.env.NODE_ENV !== "production") global.__pgPool = pool;

export const db = drizzle(pool, { schema });
export type Db = typeof db;
export type Tx = Parameters<Parameters<Db["transaction"]>[0]>[0];
export { schema };
