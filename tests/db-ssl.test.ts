import { describe, expect, it } from "vitest";
import { resolvePg } from "../src/lib/db/client";

const URL_ = "postgresql://postgres.abc:s%40nha@aws-1-sa-east-1.pooler.supabase.com:5432/postgres?sslmode=require";

describe("resolução de TLS do banco", () => {
  it("certificado raiz prevalece sobre sslmode da URL e a URL perde o parâmetro", () => {
    const r = resolvePg(URL_, { DATABASE_SSL_CA: "-----BEGIN CERTIFICATE-----\\nABC\\n-----END CERTIFICATE-----" });
    expect(r.connectionString).toBe("postgresql://postgres.abc:s%40nha@aws-1-sa-east-1.pooler.supabase.com:5432/postgres");
    expect(r.ssl).toEqual({ ca: "-----BEGIN CERTIFICATE-----\nABC\n-----END CERTIFICATE-----", rejectUnauthorized: true });
  });
  it("sem certificado, sslmode=require verifica contra raízes públicas", () => {
    expect(resolvePg(URL_, {}).ssl).toEqual({ rejectUnauthorized: true });
  });
  it("no-verify cifra sem verificar", () => {
    expect(resolvePg(URL_, { DATABASE_SSL: "no-verify" }).ssl).toEqual({ rejectUnauthorized: false });
    expect(resolvePg(URL_.replace("require", "no-verify"), {}).ssl).toEqual({ rejectUnauthorized: false });
  });
  it("URL local sem sslmode não cifra", () => {
    expect(resolvePg("postgres://curso:curso@localhost:5432/curso_dev", {})).toEqual({ connectionString: "postgres://curso:curso@localhost:5432/curso_dev" });
  });
});
