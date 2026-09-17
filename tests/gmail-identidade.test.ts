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
