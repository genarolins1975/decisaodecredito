import { createHash, createHmac, randomBytes, createCipheriv, createDecipheriv, timingSafeEqual } from "node:crypto";

export const sha256 = (s: string | Buffer) => createHash("sha256").update(s).digest("hex");

export function randomToken(bytes = 32) {
  return randomBytes(bytes).toString("base64url");
}

function secretKey(): Buffer {
  const s = process.env.APP_SECRET;
  if (!s || s.length < 16) throw new Error("APP_SECRET ausente ou curta demais");
  return createHash("sha256").update(s).digest();
}

export function hmac(data: string) {
  return createHmac("sha256", secretKey()).update(data).digest("base64url");
}

export function safeEqual(a: string, b: string) {
  const ba = Buffer.from(a), bb = Buffer.from(b);
  if (ba.length !== bb.length) return false;
  return timingSafeEqual(ba, bb);
}

/** AES-256-GCM para segredos em repouso (tokens OAuth). Formato: iv.tag.cipher (base64url). */
export function encryptSecret(plain: string) {
  const iv = randomBytes(12);
  const c = createCipheriv("aes-256-gcm", secretKey(), iv);
  const enc = Buffer.concat([c.update(plain, "utf8"), c.final()]);
  return [iv.toString("base64url"), c.getAuthTag().toString("base64url"), enc.toString("base64url")].join(".");
}

export function decryptSecret(payload: string) {
  const [iv, tag, data] = payload.split(".");
  const d = createDecipheriv("aes-256-gcm", secretKey(), Buffer.from(iv, "base64url"));
  d.setAuthTag(Buffer.from(tag, "base64url"));
  return Buffer.concat([d.update(Buffer.from(data, "base64url")), d.final()]).toString("utf8");
}

/** Token assinado com validade, para URLs curtas (ex.: script do renderizador legado). */
export function signExpiring(payload: string, ttlSeconds: number) {
  const exp = Math.floor(Date.now() / 1000) + ttlSeconds;
  const body = `${payload}.${exp}`;
  return `${body}.${hmac(body)}`;
}
export function verifyExpiring(token: string): string | null {
  const parts = token.split(".");
  if (parts.length < 3) return null;
  const sig = parts.pop()!, exp = Number(parts.pop());
  const payload = parts.join(".");
  if (!Number.isFinite(exp) || exp < Math.floor(Date.now() / 1000)) return null;
  if (!safeEqual(hmac(`${payload}.${exp}`), sig)) return null;
  return payload;
}
