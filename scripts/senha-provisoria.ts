/**
 * Reset administrativo: grava uma senha provisória e exige a troca no próximo acesso.
 * O login com a senha provisória leva a /senha/definir (mustChangePassword); todas as
 * sessões abertas são revogadas e o reset fica no audit_log.
 * Uso: npm run senha:provisoria -- email@dominio.com
 */
import "dotenv/config";
import { randomInt } from "node:crypto";
import { and, eq, isNull } from "drizzle-orm";
import { db, pool, schema } from "../src/lib/db/client";
import { hashPassword, passwordProblems } from "../src/lib/auth/password";
import { normalizeEmail } from "../src/lib/auth/email";
import { newId } from "../src/lib/ids";

// sem caracteres ambíguos (0/O, 1/l/I) para ditar ou copiar sem erro
const ALFABETO = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";

function gerarSenhaProvisoria() {
  const bloco = () => Array.from({ length: 4 }, () => ALFABETO[randomInt(ALFABETO.length)]).join("");
  return `${bloco()}-${bloco()}-${bloco()}`;
}

async function main() {
  const raw = process.argv[2];
  if (!raw) throw new Error("Informe o e-mail: npm run senha:provisoria -- email@dominio.com");
  const email = normalizeEmail(raw);
  const [u] = await db.select().from(schema.users).where(eq(schema.users.email, email)).limit(1);
  if (!u) throw new Error(`Nenhuma conta com o e-mail ${email}`);
  if (u.disabledAt) throw new Error(`A conta ${email} está desativada; reative antes de redefinir a senha`);

  let senha = gerarSenhaProvisoria();
  while (passwordProblems(senha, u.email).length) senha = gerarSenhaProvisoria();

  const agora = new Date();
  await db.transaction(async (tx) => {
    await tx.update(schema.users).set({ passwordHash: await hashPassword(senha), mustChangePassword: true, updatedAt: agora }).where(eq(schema.users.id, u.id));
    await tx.update(schema.sessions).set({ revokedAt: agora, revokedReason: "admin_temp_password" })
      .where(and(eq(schema.sessions.userId, u.id), isNull(schema.sessions.revokedAt)));
    await tx.update(schema.passwordResetTokens).set({ usedAt: agora })
      .where(and(eq(schema.passwordResetTokens.userId, u.id), isNull(schema.passwordResetTokens.usedAt)));
    await tx.insert(schema.auditLog).values({ id: newId(), actorUserId: null, action: "auth.admin_temp_password", entity: "user", entityId: u.id, details: { via: "script" } });
  });

  console.log(`Conta: ${u.name} <${u.email}>`);
  console.log(`Senha provisória: ${senha}`);
  console.log("No próximo login a plataforma exige a definição de uma senha pessoal.");
}

main().then(() => pool.end()).catch(async (e) => { console.error(e instanceof Error ? e.message : e); await pool.end(); process.exit(1); });
