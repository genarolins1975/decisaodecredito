import { randomInt } from "node:crypto";
import { hash, verify } from "@node-rs/argon2";

const OPTS = { memoryCost: 19456, timeCost: 2, parallelism: 1 }; // OWASP 2024: argon2id 19 MiB, t=2

export async function hashPassword(plain: string) {
  return hash(plain, OPTS);
}

export async function verifyPassword(hashed: string | null | undefined, plain: string) {
  if (!hashed) return false;
  try { return await verify(hashed, plain); } catch { return false; }
}

/** Política mínima: 10 caracteres, não só dígitos, não igual ao e-mail. */
export function passwordProblems(pw: string, email?: string): string[] {
  const p: string[] = [];
  if (pw.length < 10) p.push("A senha precisa ter pelo menos 10 caracteres.");
  if (pw.length > 200) p.push("A senha é longa demais.");
  if (/^\d+$/.test(pw)) p.push("A senha não pode ser só números.");
  if (email && pw.toLowerCase().includes(email.split("@")[0].toLowerCase()) && email.split("@")[0].length >= 4)
    p.push("A senha não pode conter o seu e-mail.");
  return p;
}

/** Validade da senha provisória emitida pelo professor: depois disso o login com ela é recusado. */
export const TEMP_PASSWORD_TTL_HOURS = 72;

// sem caracteres ambíguos (0/O, 1/l/I) para ditar ou copiar sem erro
const TEMP_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";

/** Senha provisória legível (ex.: Kp7m-X3qr-9Tzw), já dentro da política mínima. */
export function generateTempPassword(email?: string): string {
  const block = () => Array.from({ length: 4 }, () => TEMP_ALPHABET[randomInt(TEMP_ALPHABET.length)]).join("");
  let pw = "";
  do pw = `${block()}-${block()}-${block()}`; while (passwordProblems(pw, email).length);
  return pw;
}
