/**
 * Reset administrativo pelo terminal (o painel tem o botão "Redefinir senha", que envia por e-mail):
 * grava uma senha provisória de 72 horas e exige a troca no próximo acesso.
 * O login com a senha provisória leva a /senha/definir (mustChangePassword); todas as
 * sessões abertas são revogadas e o reset fica no audit_log.
 * Uso: npm run senha:provisoria -- email@dominio.com
 */
import "dotenv/config";
import { and, eq, isNull } from "drizzle-orm";
import { db, pool, schema } from "../src/lib/db/client";
import { generateTempPassword, hashPassword, TEMP_PASSWORD_TTL_HOURS } from "../src/lib/auth/password";
import { normalizeEmail } from "../src/lib/auth/email";
import { newId } from "../src/lib/ids";

async function main() {
  const raw = process.argv[2];
  if (!raw) throw new Error("Informe o e-mail: npm run senha:provisoria -- email@dominio.com");
  const email = normalizeEmail(raw);
  const [u] = await db.select().from(schema.users).where(eq(schema.users.email, email)).limit(1);
  if (!u) throw new Error(`Nenhuma conta com o e-mail ${email}`);
  if (u.disabledAt) throw new Error(`A conta ${email} está desativada; reative antes de redefinir a senha`);

  const senha = generateTempPassword(u.email);
  const agora = new Date();
  const validade = new Date(agora.getTime() + TEMP_PASSWORD_TTL_HOURS * 3600e3);
  await db.transaction(async (tx) => {
    await tx.update(schema.users).set({ passwordHash: await hashPassword(senha), mustChangePassword: true, tempPasswordExpiresAt: validade, updatedAt: agora }).where(eq(schema.users.id, u.id));
    await tx.update(schema.sessions).set({ revokedAt: agora, revokedReason: "admin_temp_password" })
      .where(and(eq(schema.sessions.userId, u.id), isNull(schema.sessions.revokedAt)));
    await tx.update(schema.passwordResetTokens).set({ usedAt: agora })
      .where(and(eq(schema.passwordResetTokens.userId, u.id), isNull(schema.passwordResetTokens.usedAt)));
    await tx.insert(schema.auditLog).values({ id: newId(), actorUserId: null, action: "auth.admin_temp_password", entity: "user", entityId: u.id, details: { via: "script" } });
  });

  console.log(`Conta: ${u.name} <${u.email}>`);
  console.log(`Senha provisória: ${senha}`);
  console.log(`Válida até: ${validade.toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" })}`);
  console.log("No próximo login a plataforma exige a definição de uma senha pessoal.");
}

main().then(() => pool.end()).catch(async (e) => { console.error(e instanceof Error ? e.message : e); await pool.end(); process.exit(1); });
