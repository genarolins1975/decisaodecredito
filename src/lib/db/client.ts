import { drizzle } from "drizzle-orm/node-postgres";
import { X509Certificate } from "node:crypto";
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
/** Aceita PEM colado com quebras literais "\\n", CRLF ou espaços; recusa com mensagem clara o que não for certificado. */
export function normalizeCa(raw: string | undefined): string | undefined {
  if (!raw || !raw.trim()) return undefined;
  const pem = raw.replace(/\\n/g, "\n").replace(/\r/g, "").split("\n").map((l) => l.trim()).filter(Boolean).join("\n") + "\n";
  try {
    const cert = new X509Certificate(pem);
    if (!cert.ca) throw new Error(`o certificado "${cert.subject.replace(/\n/g, ", ")}" não é uma autoridade certificadora`);
  } catch (e) {
    throw new Error(`DATABASE_SSL_CA inválido: ${e instanceof Error ? e.message : String(e)}. Cole o conteúdo completo do arquivo .crt, de BEGIN CERTIFICATE a END CERTIFICATE.`);
  }
  return pem;
}

export function resolvePg(url: string, env: Record<string, string | undefined> = process.env): { connectionString: string; ssl?: { ca?: string; rejectUnauthorized: boolean }; tls: string } {
  const u = new URL(url);
  const mode = u.searchParams.get("sslmode");
  u.searchParams.delete("sslmode");
  const connectionString = u.toString();
  const flag = (env.DATABASE_SSL ?? "").trim().toLowerCase().replace(/^["']|["']$/g, "");
  if (flag === "no-verify" || mode === "no-verify") return { connectionString, ssl: { rejectUnauthorized: false }, tls: "cifrada sem verificação da cadeia (DATABASE_SSL=no-verify)" };
  const ca = normalizeCa(env.DATABASE_SSL_CA);
  if (ca) return { connectionString, ssl: { ca, rejectUnauthorized: true }, tls: `verificação completa com certificado raiz "${new X509Certificate(ca).subject.replace(/\n/g, ", ")}"` };
  if (mode && mode !== "disable") return { connectionString, ssl: { rejectUnauthorized: true }, tls: `verificação contra raízes públicas (sslmode=${mode}); DATABASE_SSL_CA ${env.DATABASE_SSL_CA === undefined ? "ausente" : "vazia"}, DATABASE_SSL=${JSON.stringify(env.DATABASE_SSL ?? null)}` };
  return { connectionString, tls: "sem TLS (sem sslmode na URL)" };
}

function makePool() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL não definida");
  const { connectionString, ssl, tls } = resolvePg(url);
  console.log(`[banco] host ${new URL(connectionString).host}; TLS: ${tls}`);
  return new Pool({ connectionString, ...(ssl ? { ssl } : {}), max: Number(process.env.PG_POOL_MAX ?? 10) });
}

export const pool: Pool = global.__pgPool ?? makePool();
if (process.env.NODE_ENV !== "production") global.__pgPool = pool;

export const db = drizzle(pool, { schema });
export type Db = typeof db;
export type Tx = Parameters<Parameters<Db["transaction"]>[0]>[0];
export { schema };
