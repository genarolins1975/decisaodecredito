import "server-only";
import { and, desc, eq, inArray, sql } from "drizzle-orm";
import { db, schema } from "@/lib/db/client";
import { newId, humanCode } from "@/lib/ids";
import { sha256 } from "@/lib/crypto";
import { isValidEmail, normalizeEmail } from "@/lib/auth/email";
import { ApiError } from "@/lib/auth/guard";
import { audit } from "@/lib/audit";
import { enqueueEmail } from "@/lib/email/queue";
import { existingUserTemplate, inviteTemplate } from "@/lib/email/templates";
import { fmtDT } from "@/lib/time";
import { parseCsv } from "@/lib/csv";

export const INVITE_TTL_HOURS = 72;

export type ImportRow = { line: number; name: string; email: string; role: string; status: "ok" | "duplicada_no_arquivo" | "ja_matriculada" | "invalida"; message?: string };

/** Prévia da importação: validação linha a linha, duplicidades no arquivo e na turma. Não grava nada. */
/**
 * Lê a lista colada com ou sem a linha de cabeçalho. Sem cabeçalho (ou com cabeçalho sem a coluna e-mail), as colunas são
 * reconhecidas pelo conteúdo: a que contém "@" é o e-mail, a outra é o nome, uma terceira com aluno/monitor é o papel.
 */
export function parseImportList(csvText: string): { rows: Record<string, string>[]; errors: string[] } {
  const parsed = parseCsv(csvText);
  const fields = Object.keys(parsed.rows[0] ?? {});
  const temEmail = fields.some((f) => ["email", "e-mail"].includes(f));
  if (temEmail && !fields.some((f) => f.includes("@"))) return parsed;
  const linhas = csvText.replace(/^\uFEFF/, "").split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const sep = linhas.some((l) => l.includes(";")) ? ";" : linhas.some((l) => l.includes("\t")) ? "\t" : ",";
  const rows = linhas.map((l) => l.split(sep).map((c) => c.trim().replace(/^"|"$/g, ""))).filter((c) => !(c.length === 1 && c[0] === "")).map((cols) => {
    const email = cols.find((c) => c.includes("@")) ?? "";
    const role = cols.find((c) => ["aluno", "monitor"].includes(c.toLowerCase())) ?? "";
    const nome = cols.find((c) => c !== email && c !== role) ?? "";
    return { nome, email, papel: role };
  }).filter((r) => !(["nome", "name"].includes(r.nome.toLowerCase()) && !r.email));   // descarta um cabeçalho eventual
  return { rows, errors: [] };
}

export async function previewImport(classId: string, csvText: string): Promise<{ rows: ImportRow[]; errors: string[] }> {
  const { rows, errors } = parseImportList(csvText);
  const existing = await db.select({ email: schema.enrollments.email }).from(schema.enrollments).where(eq(schema.enrollments.classId, classId));
  const existingSet = new Set(existing.map((e) => e.email));
  const seen = new Set<string>();
  const out: ImportRow[] = rows.map((r, i) => {
    const email = normalizeEmail(r.email ?? r["e-mail"] ?? "");
    // nome desconhecido: o e-mail fica como nome provisório; o convite sai sem saudação nominal e o aluno informa o nome no perfil
    const name = (r.nome ?? r.name ?? "").trim() || email;
    const role = (r.papel ?? r.role ?? "aluno").trim().toLowerCase() || "aluno";
    const line = i + 2;
    if (!email || !isValidEmail(email)) return { line, name, email, role, status: "invalida", message: "e-mail inválido" };
    if (!["aluno", "monitor"].includes(role)) return { line, name, email, role, status: "invalida", message: "papel deve ser aluno ou monitor" };
    if (seen.has(email)) return { line, name, email, role, status: "duplicada_no_arquivo", message: "e-mail repetido no arquivo" };
    seen.add(email);
    if (existingSet.has(email)) return { line, name, email, role, status: "ja_matriculada", message: "já consta na turma" };
    return { line, name, email, role, status: "ok" };
  });
  return { rows: out, errors };
}

export async function addEnrollments(classId: string, people: { name: string; email: string; role?: string }[], actorId: string) {
  const created: string[] = [];
  const skipped: string[] = [];
  for (const p of people) {
    const email = normalizeEmail(p.email);
    if (!isValidEmail(email) || !p.name.trim()) { skipped.push(p.email); continue; }
    const role = p.role && ["aluno", "monitor"].includes(p.role) ? p.role : "aluno";
    // conta existente? vincula o userId desde já, sem alterar a senha
    const [u] = await db.select({ id: schema.users.id }).from(schema.users).where(eq(schema.users.email, email)).limit(1);
    const id = newId();
    const r = await db.insert(schema.enrollments).values({ id, classId, email, name: p.name.trim(), role, userId: u?.id ?? null, createdBy: actorId })
      .onConflictDoNothing({ target: [schema.enrollments.classId, schema.enrollments.email] }).returning({ id: schema.enrollments.id });
    if (r[0]) { created.push(r[0].id); await audit({ actorUserId: actorId, action: "enrollment.create", entity: "enrollment", entityId: id, classId, details: { email, role } }); }
    else skipped.push(email);
  }
  return { created, skipped };
}

type ClassCtx = { courseName: string; classLabel: string };

async function classContext(classId: string): Promise<ClassCtx> {
  const [row] = await db.select({ cls: schema.classes, ed: schema.editions, course: schema.courses }).from(schema.classes)
    .innerJoin(schema.editions, eq(schema.editions.id, schema.classes.editionId))
    .innerJoin(schema.courses, eq(schema.courses.id, schema.editions.courseId)).where(eq(schema.classes.id, classId));
  if (!row) throw new ApiError(404, "Turma não encontrada");
  return { courseName: row.course.name, classLabel: `${row.cls.name} (${row.ed.label})` };
}

/**
 * Emite (ou reemite) convites para matrículas selecionadas. Reenvio invalida a credencial anterior.
 * Usuário com senha definida recebe aviso de nova matrícula e link de login, sem nova credencial.
 * Não dispara nada por si: enfileira; o envio depende do remetente conectado.
 */
export async function issueInvites(classId: string, enrollmentIds: string[], actorId: string) {
  const ctx = await classContext(classId);
  const rows = await db.select().from(schema.enrollments).where(and(eq(schema.enrollments.classId, classId), inArray(schema.enrollments.id, enrollmentIds)));
  const results: { enrollmentId: string; outcome: string }[] = [];
  const appUrl = process.env.APP_URL ?? "http://localhost:3000";
  for (const e of rows) {
    if (e.status === "suspenso" || e.status === "encerrado") { results.push({ enrollmentId: e.id, outcome: "matrícula inativa, convite não emitido" }); continue; }
    const [user] = await db.select().from(schema.users).where(eq(schema.users.email, e.email)).limit(1);
    if (user && user.passwordHash && !user.mustChangePassword) {
      // conta já ativa: ativa a matrícula e avisa, sem nova senha
      await db.update(schema.enrollments).set({ userId: user.id, status: "ativo", activatedAt: e.activatedAt ?? new Date(), updatedAt: new Date() }).where(eq(schema.enrollments.id, e.id));
      const t = existingUserTemplate({ studentName: e.name, courseName: ctx.courseName, classLabel: ctx.classLabel, loginLink: `${appUrl}/entrar` });
      await enqueueEmail({ kind: "invite_existing", toEmail: e.email, toName: e.name, toUserId: user.id, enrollmentId: e.id, classId, ...t, createdBy: actorId, dedupeKey: `invite_existing:${e.id}:${Date.now()}` });
      await audit({ actorUserId: actorId, action: "invite.existing_user", entity: "enrollment", entityId: e.id, classId });
      results.push({ enrollmentId: e.id, outcome: "conta existente: aviso de nova matrícula enfileirado" });
      continue;
    }
    // invalida credenciais anteriores
    await db.update(schema.invites).set({ supersededAt: new Date() }).where(and(eq(schema.invites.enrollmentId, e.id), sql`${schema.invites.usedAt} IS NULL`, sql`${schema.invites.supersededAt} IS NULL`));
    const code = humanCode(12);
    const inviteId = newId();
    const expiresAt = new Date(Date.now() + INVITE_TTL_HOURS * 3600e3);
    await db.insert(schema.invites).values({ id: inviteId, enrollmentId: e.id, tokenHash: sha256(code), expiresAt, createdBy: actorId });
    const link = `${appUrl}/ativar?t=${code}`;
    const t = inviteTemplate({ studentName: e.name, courseName: ctx.courseName, classLabel: ctx.classLabel, link, code, expiresAtText: fmtDT(expiresAt) });
    await enqueueEmail({ kind: "invite", toEmail: e.email, toName: e.name, enrollmentId: e.id, inviteId, classId, ...t, createdBy: actorId, dedupeKey: `invite:${inviteId}` });
    await audit({ actorUserId: actorId, action: "invite.issue", entity: "invite", entityId: inviteId, classId, details: { enrollmentId: e.id } });
    results.push({ enrollmentId: e.id, outcome: "convite enfileirado" });
  }
  return results;
}

export async function setEnrollmentStatus(classId: string, enrollmentId: string, status: "ativo" | "suspenso" | "encerrado", reason: string, actorId: string) {
  const [e] = await db.select().from(schema.enrollments).where(and(eq(schema.enrollments.id, enrollmentId), eq(schema.enrollments.classId, classId)));
  if (!e) throw new ApiError(404, "Matrícula não encontrada");
  if (status === "ativo" && !e.userId) throw new ApiError(400, "A matrícula ainda não foi ativada pelo aluno; reative após o primeiro acesso ou reenvie o convite");
  await db.update(schema.enrollments).set({
    status, statusReason: reason, updatedAt: new Date(),
    suspendedAt: status === "suspenso" ? new Date() : e.suspendedAt, endedAt: status === "encerrado" ? new Date() : e.endedAt,
  }).where(eq(schema.enrollments.id, enrollmentId));
  // Revogação bloqueia imediatamente APIs, arquivos e canais da turma (verificado por requisição);
  // não derruba outras matrículas válidas da mesma pessoa.
  await audit({ actorUserId: actorId, action: `enrollment.${status}`, entity: "enrollment", entityId: enrollmentId, classId, details: { reason } });
}

/** Lista para o painel: estado da matrícula, último convite, último envio e falhas. Nunca inclui senhas. */
export async function listEnrollmentsWithInvites(classId: string) {
  const rows = await db.select().from(schema.enrollments).where(eq(schema.enrollments.classId, classId)).orderBy(schema.enrollments.name);
  const ids = rows.map((r) => r.id);
  if (!ids.length) return [];
  const inv = await db.select().from(schema.invites).where(inArray(schema.invites.enrollmentId, ids)).orderBy(desc(schema.invites.createdAt));
  const mails = await db.select().from(schema.emailMessages).where(inArray(schema.emailMessages.enrollmentId, ids)).orderBy(desc(schema.emailMessages.createdAt));
  return rows.map((r) => {
    const lastInvite = inv.find((i) => i.enrollmentId === r.id) ?? null;
    const lastMail = mails.find((m) => m.enrollmentId === r.id) ?? null;
    return {
      ...r,
      invite: lastInvite ? { createdAt: lastInvite.createdAt, expiresAt: lastInvite.expiresAt, usedAt: lastInvite.usedAt, supersededAt: lastInvite.supersededAt, expired: lastInvite.expiresAt < new Date() } : null,
      lastEmail: lastMail ? { status: lastMail.status, attempts: lastMail.attempts, lastError: lastMail.lastError, acceptedAt: lastMail.acceptedAt, createdAt: lastMail.createdAt, kind: lastMail.kind } : null,
    };
  });
}
