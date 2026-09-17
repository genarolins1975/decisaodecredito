import { describe, expect, it } from "vitest";
import { emailFromIdToken } from "../src/lib/email/gmail";

const jwt = (payload: object) => `eyJhbGciOiJSUzI1NiJ9.${Buffer.from(JSON.stringify(payload)).toString("base64url")}.assinatura`;

describe("identidade da conta Gmail conectada", () => {
  it("lê o e-mail do id_token e normaliza", () => {
    expect(emailFromIdToken(jwt({ email: "G.Dueire.Lins@gmail.com", email_verified: true }))).toBe("g.dueire.lins@gmail.com");
  });
  it("recusa token ausente, malformado ou sem e-mail válido", () => {
    expect(emailFromIdToken(undefined)).toBeNull();
    expect(emailFromIdToken("abc")).toBeNull();
    expect(emailFromIdToken(jwt({ sub: "1" }))).toBeNull();
    expect(emailFromIdToken(jwt({ email: "não é e-mail" }))).toBeNull();
  });
});

import { inviteTemplate, nomeConhecido } from "../src/lib/email/templates";
describe("convite sem nome conhecido", () => {
  const base = { courseName: "Curso", classLabel: "Turma 2026", link: "https://x/ativar?t=abc", code: "ABCD-EFGH-IJKL", expiresAtText: "amanhã" };
  it("cumprimenta pelo nome quando há nome", () => {
    const t = inviteTemplate({ ...base, studentName: "Renata Carneiro Valsa" });
    expect(t.text.startsWith("Olá, Renata Carneiro Valsa.")).toBe(true); expect(t.html).toContain("<b>Renata Carneiro Valsa</b>");
  });
  it("saudação neutra quando o cadastro só tem o e-mail", () => {
    const t = inviteTemplate({ ...base, studentName: "michelle.bouhid@gmail.com" });
    expect(t.text.startsWith("Olá.\n")).toBe(true); expect(t.text).not.toContain("michelle"); expect(t.html).not.toContain("michelle");
    expect(nomeConhecido("")).toBe(false); expect(nomeConhecido("Tomaz Leal")).toBe(true);
  });
});
