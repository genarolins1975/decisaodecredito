import { describe, expect, it } from "vitest";
import { execSync } from "node:child_process";
import { normalizeCa, resolvePg } from "../src/lib/db/client";

const CA = execSync("openssl req -x509 -newkey rsa:2048 -nodes -keyout /dev/null -subj /CN=Teste-CA -days 2 2>/dev/null").toString();

const URL_ = "postgresql://postgres.abc:s%40nha@aws-1-sa-east-1.pooler.supabase.com:5432/postgres?sslmode=require";

describe("resolução de TLS do banco", () => {
  it("certificado raiz prevalece sobre sslmode da URL e a URL perde o parâmetro", () => {
    const r = resolvePg(URL_, { DATABASE_SSL_CA: CA.replace(/\n/g, "\\n") });
    expect(r.connectionString).toBe("postgresql://postgres.abc:s%40nha@aws-1-sa-east-1.pooler.supabase.com:5432/postgres");
    expect(r.ssl).toEqual({ ca: CA, rejectUnauthorized: true });
  });
  it("sem certificado, sslmode=require verifica contra raízes públicas", () => {
    expect(resolvePg(URL_, {}).ssl).toEqual({ rejectUnauthorized: true });
  });
  it("certificado ilegível falha com mensagem clara", () => {
    expect(() => normalizeCa("isto não é um certificado")).toThrow(/DATABASE_SSL_CA inválido/);
    expect(normalizeCa("  ")).toBeUndefined();
  });
  it("no-verify cifra sem verificar e prevalece sobre o certificado", () => {
    expect(resolvePg(URL_, { DATABASE_SSL: "no-verify" }).ssl).toEqual({ rejectUnauthorized: false });
    expect(resolvePg(URL_, { DATABASE_SSL: "no-verify", DATABASE_SSL_CA: CA }).ssl).toEqual({ rejectUnauthorized: false });
    expect(resolvePg(URL_.replace("require", "no-verify"), {}).ssl).toEqual({ rejectUnauthorized: false });
  });
  it("URL local sem sslmode não cifra", () => {
    expect(resolvePg("postgres://curso:curso@localhost:5432/curso_dev", {})).toEqual({ connectionString: "postgres://curso:curso@localhost:5432/curso_dev" });
  });
});
