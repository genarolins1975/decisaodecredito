import "server-only";
import { desc, eq, isNull } from "drizzle-orm";
import { db, schema } from "@/lib/db/client";
import { decryptSecret, encryptSecret } from "@/lib/crypto";
import { EmailProviderError, type EmailProvider, type OutgoingEmail } from "./provider";

/**
 * Integração com a Gmail API por OAuth 2.0 (fluxo de autorização do professor).
 * Escopo mínimo de envio: https://www.googleapis.com/auth/gmail.send
 * Referências (consultadas em 2026-09):
 *  - https://developers.google.com/gmail/api/guides/sending
 *  - https://developers.google.com/gmail/api/reference/rest/v1/users.messages/send
 *  - https://developers.google.com/identity/protocols/oauth2/web-server
 * Tokens ficam cifrados no banco (AES-256-GCM) e nunca são registrados em log.
 */
export const GMAIL_SCOPE = "https://www.googleapis.com/auth/gmail.send";
/** Identidade básica (OpenID Connect) só para saber qual conta foi conectada: o perfil do Gmail exige escopos de leitura que não pedimos. */
const IDENTITY_SCOPES = "openid email";
const USERINFO_URL = "https://openidconnect.googleapis.com/v1/userinfo";
const AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const TOKEN_URL = "https://oauth2.googleapis.com/token";
const REVOKE_URL = "https://oauth2.googleapis.com/revoke";
const SEND_URL = "https://gmail.googleapis.com/gmail/v1/users/me/messages/send";
const PROFILE_URL = "https://gmail.googleapis.com/gmail/v1/users/me/profile";

export function oauthConfigured() {
  return Boolean(process.env.GOOGLE_OAUTH_CLIENT_ID && process.env.GOOGLE_OAUTH_CLIENT_SECRET && process.env.APP_URL);
}

export function redirectUri() { return `${process.env.APP_URL}/api/professor/gmail/callback`; }

export function authorizationUrl(state: string) {
  const p = new URLSearchParams({
    client_id: process.env.GOOGLE_OAUTH_CLIENT_ID!, redirect_uri: redirectUri(), response_type: "code",
    scope: `${GMAIL_SCOPE} ${IDENTITY_SCOPES}`, access_type: "offline", prompt: "consent", include_granted_scopes: "false", state,
  });
  return `${AUTH_URL}?${p}`;
}

async function tokenRequest(body: Record<string, string>) {
  const res = await fetch(TOKEN_URL, {
    method: "POST", headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ client_id: process.env.GOOGLE_OAUTH_CLIENT_ID!, client_secret: process.env.GOOGLE_OAUTH_CLIENT_SECRET!, ...body }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new EmailProviderError(`OAuth: ${data.error ?? res.status} ${data.error_description ?? ""}`.trim(), false, data.error);
  return data as { access_token: string; expires_in: number; refresh_token?: string; scope?: string; id_token?: string };
}

/** E-mail da conta a partir do id_token (JWT assinado pelo Google, recebido direto do endpoint de token via TLS: aqui só se lê a carga). */
export function emailFromIdToken(idToken: string | undefined): string | null {
  if (!idToken) return null;
  const parts = idToken.split(".");
  if (parts.length < 2) return null;
  try {
    const payload = JSON.parse(Buffer.from(parts[1].replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf8")) as { email?: string; email_verified?: boolean };
    return payload.email && /^[^\s@]+@[^\s@]+$/.test(payload.email) ? payload.email.toLowerCase() : null;
  } catch { return null; }
}

export async function exchangeCode(code: string, ownerUserId: string) {
  const tok = await tokenRequest({ code, grant_type: "authorization_code", redirect_uri: redirectUri() });
  if (!tok.refresh_token) throw new EmailProviderError("O Google não devolveu refresh token; revogue o acesso do app na conta Google e conecte novamente.", false);
  if (!(tok.scope ?? "").includes(GMAIL_SCOPE)) throw new EmailProviderError("Escopo de envio não concedido.", false);
  // identidade: id_token (openid email) e, como reserva, o endpoint userinfo; o perfil do Gmail fica como último recurso
  let email = emailFromIdToken(tok.id_token);
  if (!email) { const ui = await fetch(USERINFO_URL, { headers: { authorization: `Bearer ${tok.access_token}` } }).then((r) => r.json()).catch(() => ({})); email = typeof ui.email === "string" ? ui.email.toLowerCase() : null; }
  if (!email) { const prof = await fetch(PROFILE_URL, { headers: { authorization: `Bearer ${tok.access_token}` } }).then((r) => r.json()).catch(() => ({})); email = typeof prof.emailAddress === "string" ? prof.emailAddress.toLowerCase() : null; }
  if (!email) throw new EmailProviderError("Não foi possível identificar a conta Gmail conectada. Na tela do Google, marque também a permissão de ver o endereço de e-mail.", false);
  // uma conexão ativa por vez
  await db.update(schema.gmailConnections).set({ revokedAt: new Date() }).where(isNull(schema.gmailConnections.revokedAt));
  const { newId } = await import("@/lib/ids");
  await db.insert(schema.gmailConnections).values({
    id: newId(), ownerUserId, emailAddress: email, refreshTokenEnc: encryptSecret(tok.refresh_token),
    accessTokenEnc: encryptSecret(tok.access_token), accessTokenExpiresAt: new Date(Date.now() + (tok.expires_in - 60) * 1000),
    scopes: tok.scope ?? GMAIL_SCOPE,
  });
  return email;
}

export async function activeConnection() {
  const [c] = await db.select().from(schema.gmailConnections).where(isNull(schema.gmailConnections.revokedAt))
    .orderBy(desc(schema.gmailConnections.connectedAt)).limit(1);
  return c ?? null;
}

export async function disconnectGmail() {
  const c = await activeConnection();
  if (!c) return;
  try {
    const rt = decryptSecret(c.refreshTokenEnc);
    await fetch(`${REVOKE_URL}?token=${encodeURIComponent(rt)}`, { method: "POST" });
  } catch { /* revogação remota é melhor esforço; a local é obrigatória */ }
  await db.update(schema.gmailConnections).set({ revokedAt: new Date(), refreshTokenEnc: "revoked", accessTokenEnc: null })
    .where(eq(schema.gmailConnections.id, c.id));
}

async function accessToken(): Promise<{ token: string; sender: string }> {
  const c = await activeConnection();
  if (!c) throw new EmailProviderError("Gmail não conectado", false, "not_connected");
  if (c.accessTokenEnc && c.accessTokenExpiresAt && c.accessTokenExpiresAt > new Date()) {
    return { token: decryptSecret(c.accessTokenEnc), sender: c.emailAddress };
  }
  try {
    const tok = await tokenRequest({ refresh_token: decryptSecret(c.refreshTokenEnc), grant_type: "refresh_token" });
    await db.update(schema.gmailConnections).set({
      accessTokenEnc: encryptSecret(tok.access_token), accessTokenExpiresAt: new Date(Date.now() + (tok.expires_in - 60) * 1000), lastError: null,
    }).where(eq(schema.gmailConnections.id, c.id));
    return { token: tok.access_token, sender: c.emailAddress };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    // invalid_grant = acesso revogado ou expirado: marcar para reconexão
    const revoked = /invalid_grant/.test(msg);
    await db.update(schema.gmailConnections).set({ lastError: msg, lastErrorAt: new Date(), ...(revoked ? { revokedAt: new Date() } : {}) })
      .where(eq(schema.gmailConnections.id, c.id));
    throw new EmailProviderError(revoked ? "A conexão com o Gmail expirou ou foi revogada. Reconecte." : msg, !revoked, revoked ? "reconnect" : "token");
  }
}

function encodeHeader(v: string) { return /[^\x20-\x7e]/.test(v) ? `=?UTF-8?B?${Buffer.from(v, "utf8").toString("base64")}?=` : v; }

export function buildMime(from: string, fromName: string, msg: OutgoingEmail) {
  const boundary = "b" + Math.random().toString(36).slice(2);
  const lines = [
    `From: ${encodeHeader(fromName)} <${from}>`,
    `To: ${msg.toName ? `${encodeHeader(msg.toName)} <${msg.to}>` : msg.to}`,
    `Subject: ${encodeHeader(msg.subject)}`,
    "MIME-Version: 1.0",
  ];
  if (msg.html) {
    lines.push(`Content-Type: multipart/alternative; boundary="${boundary}"`, "",
      `--${boundary}`, "Content-Type: text/plain; charset=UTF-8", "Content-Transfer-Encoding: base64", "",
      Buffer.from(msg.text, "utf8").toString("base64"),
      `--${boundary}`, "Content-Type: text/html; charset=UTF-8", "Content-Transfer-Encoding: base64", "",
      Buffer.from(msg.html, "utf8").toString("base64"), `--${boundary}--`);
  } else {
    lines.push("Content-Type: text/plain; charset=UTF-8", "Content-Transfer-Encoding: base64", "", Buffer.from(msg.text, "utf8").toString("base64"));
  }
  return Buffer.from(lines.join("\r\n"), "utf8").toString("base64url");
}

export const gmailProvider: EmailProvider = {
  name: "gmail",
  async ready() {
    if (!oauthConfigured()) return { ok: false, reason: "Credenciais OAuth do Google não configuradas no servidor" };
    const c = await activeConnection();
    if (!c) return { ok: false, reason: "Nenhuma conta Gmail conectada" };
    return { ok: true, sender: c.emailAddress };
  },
  async send(msg) {
    const { token, sender } = await accessToken();
    const raw = buildMime(sender, process.env.EMAIL_FROM_NAME || sender, msg);
    const res = await fetch(SEND_URL, { method: "POST", headers: { authorization: `Bearer ${token}`, "content-type": "application/json" }, body: JSON.stringify({ raw }) });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const status = res.status;
      const retryable = status === 429 || status >= 500;
      throw new EmailProviderError(`Gmail API ${status}: ${data?.error?.message ?? "falha"}`, retryable, String(status));
    }
    return { providerMessageId: String(data.id ?? "") };
  },
};
