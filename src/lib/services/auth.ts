import "server-only";
import { and, eq, gt, isNull } from "drizzle-orm";
import { db, schema } from "@/lib/db/client";
import { newId } from "@/lib/ids";
import { randomToken, sha256 } from "@/lib/crypto";
import { hashPassword, passwordProblems, verifyPassword } from "@/lib/auth/password";
import { normalizeEmail } from "@/lib/auth/email";
import { ApiError } from "@/lib/auth/guard";
import { createSession, revokeAllSessions, clientMeta } from "@/lib/auth/session";
import { rateLimit } from "@/lib/rate-limit";
import { audit } from "@/lib/audit";
import { enqueueEmail } from "@/lib/email/queue";
import { resetTemplate } from "@/lib/email/templates";
import { fmtDT } from "@/lib/time";

const GENERIC = "E-mail ou senha incorretos";

export async function login(emailRaw: string, password: string) {
  const email = normalizeEmail(emailRaw);
  const meta = await clientMeta();
  await rateLimit(`login:ip:${meta.ipHash ?? "x"}`, 30, 600);
  await rateLimit(`login:email:${email}`, 10, 600);
  const [u] = await db.select().from(schema.users).where(eq(schema.users.email, email)).limit(1);
  const ok = u ? await verifyPassword(u.passwordHash, password) : await verifyPassword("$argon2id$v=19$m=19456,t=2,p=1$AAAAAAAAAAAAAAAAAAAAAA$AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA", password);
  if (!u || !ok || u.disabledAt) {
    await audit({ action: "auth.login_failed", entity: "user", entityId: u?.id ?? null, ipHash: meta.ipHash, details: { email: u ? undefined : "desconhecido" } });
    throw new ApiError(401, GENERIC, "invalid_credentials");
  }
  await createSession(u.id);
  await db.update(schema.users).set({ lastLoginAt: new Date() }).where(eq(schema.users.id, u.id));
  await audit({ actorUserId: u.id, action: "auth.login", entity: "user", entityId: u.id, ipHash: meta.ipHash });
  return { mustChangePassword: u.mustChangePassword, isStaff: u.isStaff };
}

/**
 * Ativação por credencial temporária: valida hash, validade, uso único e substituição;
 * cria (ou vincula) a conta; abre sessão em estado "troca obrigatória de senha".
 */
export async function activate(code: string) {
  const meta = await clientMeta();
  await rateLimit(`activate:ip:${meta.ipHash ?? "x"}`, 20, 600);
  const clean = code.trim().toUpperCase().replace(/[\s-]/g, "");
  if (clean.length < 8) throw new ApiError(400, "Código inválido", "invalid_code");
  const [inv] = await db.select({ inv: schema.invites, enr: schema.enrollments }).from(schema.invites)
    .innerJoin(schema.enrollments, eq(schema.enrollments.id, schema.invites.enrollmentId))
    .where(eq(schema.invites.tokenHash, sha256(clean))).limit(1);
  if (!inv) throw new ApiError(400, "Credencial inválida ou já utilizada", "invalid_code");
  if (inv.inv.usedAt) throw new ApiError(400, "Esta credencial já foi utilizada. Entre com a sua senha ou peça um novo convite.", "used");
  if (inv.inv.supersededAt) throw new ApiError(400, "Esta credencial foi substituída por um convite mais recente. Use o e-mail mais novo.", "superseded");
  if (inv.inv.expiresAt < new Date()) throw new ApiError(400, "Esta credencial expirou. Peça um novo convite ao professor.", "expired");
  const enr = inv.enr;
  if (!["autorizado", "convidado"].includes(enr.status)) throw new ApiError(403, "Matrícula não está apta para ativação", "enrollment_state");

  const userId = await db.transaction(async (tx) => {
    let [u] = await tx.select().from(schema.users).where(eq(schema.users.email, enr.email)).limit(1);
    if (!u) {
      const id = newId();
      [u] = await tx.insert(schema.users).values({ id, email: enr.email, name: enr.name, mustChangePassword: true, emailVerifiedAt: new Date() }).returning();
    } else if (!u.passwordHash) {
      await tx.update(schema.users).set({ mustChangePassword: true, emailVerifiedAt: new Date() }).where(eq(schema.users.id, u.id));
    }
    await tx.update(schema.invites).set({ usedAt: new Date() }).where(eq(schema.invites.id, inv.inv.id));
    await tx.update(schema.enrollments).set({ userId: u.id, updatedAt: new Date() }).where(eq(schema.enrollments.id, enr.id));
    return u.id;
  });
  const [u] = await db.select().from(schema.users).where(eq(schema.users.id, userId));
  await createSession(userId);
  await audit({ actorUserId: userId, action: "auth.activate", entity: "enrollment", entityId: enr.id, classId: enr.classId, ipHash: meta.ipHash });
  // conta já com senha (raro: convite emitido antes de a senha existir): ativa direto
  if (u.passwordHash && !u.mustChangePassword) {
    await db.update(schema.enrollments).set({ status: "ativo", activatedAt: new Date() }).where(eq(schema.enrollments.id, enr.id));
    return { next: "/inicio", mustChangePassword: false };
  }
  return { next: "/senha/definir", mustChangePassword: true };
}

/** Primeira senha após a credencial temporária. Exigido no servidor: só funciona com mustChangePassword. */
export async function setFirstPassword(userId: string, sessionId: string, password: string) {
  const [u] = await db.select().from(schema.users).where(eq(schema.users.id, userId));
  if (!u) throw new ApiError(401, "Sessão inválida");
  if (!u.mustChangePassword) throw new ApiError(400, "A senha já foi definida. Use a troca de senha.", "already_set");
  const problems = passwordProblems(password, u.email);
  if (problems.length) throw new ApiError(400, problems.join(" "), "weak_password");
  await db.update(schema.users).set({ passwordHash: await hashPassword(password), mustChangePassword: false, updatedAt: new Date() }).where(eq(schema.users.id, userId));
  // ativa todas as matrículas pendentes desta pessoa
  await db.update(schema.enrollments).set({ status: "ativo", activatedAt: new Date(), updatedAt: new Date() })
    .where(and(eq(schema.enrollments.userId, userId), eq(schema.enrollments.status, "convidado")));
  await db.update(schema.enrollments).set({ status: "ativo", activatedAt: new Date(), updatedAt: new Date() })
    .where(and(eq(schema.enrollments.userId, userId), eq(schema.enrollments.status, "autorizado")));
  await revokeAllSessions(userId, "password_set", sessionId);
  await audit({ actorUserId: userId, action: "auth.password_set", entity: "user", entityId: userId });
}

export async function changePassword(userId: string, sessionId: string, current: string, next: string) {
  const [u] = await db.select().from(schema.users).where(eq(schema.users.id, userId));
  if (!u || !(await verifyPassword(u.passwordHash, current))) throw new ApiError(400, "Senha atual incorreta", "invalid_current");
  const problems = passwordProblems(next, u.email);
  if (problems.length) throw new ApiError(400, problems.join(" "), "weak_password");
  await db.update(schema.users).set({ passwordHash: await hashPassword(next), updatedAt: new Date() }).where(eq(schema.users.id, userId));
  await revokeAllSessions(userId, "password_changed", sessionId);
  await audit({ actorUserId: userId, action: "auth.password_changed", entity: "user", entityId: userId });
}

/** Sempre responde igual; só enfileira se houver conta com senha (para não revelar cadastro). */
export async function requestPasswordReset(emailRaw: string) {
  const email = normalizeEmail(emailRaw);
  const meta = await clientMeta();
  await rateLimit(`reset:ip:${meta.ipHash ?? "x"}`, 10, 900);
  await rateLimit(`reset:email:${email}`, 3, 900);
  const [u] = await db.select().from(schema.users).where(eq(schema.users.email, email)).limit(1);
  if (!u || !u.passwordHash || u.disabledAt) return;
  const token = randomToken(32);
  const expiresAt = new Date(Date.now() + 2 * 3600e3);
  await db.insert(schema.passwordResetTokens).values({ id: newId(), userId: u.id, tokenHash: sha256(token), expiresAt });
  const link = `${process.env.APP_URL}/senha/redefinir?t=${token}`;
  const t = resetTemplate({ name: u.name, link, expiresAtText: fmtDT(expiresAt) });
  await enqueueEmail({ kind: "password_reset", toEmail: u.email, toName: u.name, toUserId: u.id, ...t, dedupeKey: `reset:${u.id}:${Math.floor(Date.now() / 60000)}` });
  await audit({ actorUserId: u.id, action: "auth.reset_requested", entity: "user", entityId: u.id, ipHash: meta.ipHash });
}

export async function resetPassword(token: string, password: string) {
  const [row] = await db.select().from(schema.passwordResetTokens)
    .where(and(eq(schema.passwordResetTokens.tokenHash, sha256(token)), isNull(schema.passwordResetTokens.usedAt), gt(schema.passwordResetTokens.expiresAt, new Date()))).limit(1);
  if (!row) throw new ApiError(400, "Link inválido ou expirado", "invalid_token");
  const [u] = await db.select().from(schema.users).where(eq(schema.users.id, row.userId));
  if (!u) throw new ApiError(400, "Link inválido", "invalid_token");
  const problems = passwordProblems(password, u.email);
  if (problems.length) throw new ApiError(400, problems.join(" "), "weak_password");
  await db.update(schema.passwordResetTokens).set({ usedAt: new Date() }).where(eq(schema.passwordResetTokens.id, row.id));
  await db.update(schema.users).set({ passwordHash: await hashPassword(password), mustChangePassword: false, updatedAt: new Date() }).where(eq(schema.users.id, u.id));
  await revokeAllSessions(u.id, "password_reset");
  await audit({ actorUserId: u.id, action: "auth.password_reset", entity: "user", entityId: u.id });
}
