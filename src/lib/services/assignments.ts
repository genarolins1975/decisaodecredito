import "server-only";
import { and, asc, desc, eq, inArray, isNull, or, sql } from "drizzle-orm";
import { db, schema } from "@/lib/db/client";
import { newId } from "@/lib/ids";
import { sha256 } from "@/lib/crypto";
import { ApiError, type ClassAccess } from "@/lib/auth/guard";
import { computeTotal, type RubricDef } from "@/lib/services/rubric";
import { audit } from "@/lib/audit";

export type LatePolicy = { acceptLate: boolean; penaltyPerDayPct: number; hardDeadlineAt?: string | null; startedBeforeDeadlineCounts: boolean; graceMinutes?: number };

/* ---------------- grupos ---------------- */
export async function listGroups(classId: string) {
  const gs = await db.select().from(schema.groups).where(eq(schema.groups.classId, classId)).orderBy(asc(schema.groups.name));
  const ids = gs.map((g) => g.id);
  const members = ids.length ? await db.select({ gm: schema.groupMembers, name: schema.users.name, email: schema.users.email }).from(schema.groupMembers).innerJoin(schema.users, eq(schema.users.id, schema.groupMembers.userId)).where(inArray(schema.groupMembers.groupId, ids)) : [];
  return gs.map((g) => ({ ...g, members: members.filter((m) => m.gm.groupId === g.id).map((m) => ({ userId: m.gm.userId, name: m.name, email: m.email, joinedAt: m.gm.joinedAt, leftAt: m.gm.leftAt })) }));
}
export async function createGroup(classId: string, name: string, datasetId: string | null, actorId: string) {
  const id = newId();
  const [r] = await db.insert(schema.groups).values({ id, classId, name: name.trim(), datasetId }).onConflictDoNothing().returning();
  if (!r) throw new ApiError(409, "Já existe grupo com este nome");
  await audit({ actorUserId: actorId, action: "group.create", entity: "group", entityId: id, classId });
  return id;
}
export async function setGroupMember(classId: string, groupId: string, userId: string, action: "add" | "remove", actorId: string) {
  const [g] = await db.select().from(schema.groups).where(and(eq(schema.groups.id, groupId), eq(schema.groups.classId, classId)));
  if (!g) throw new ApiError(404, "Grupo não encontrado");
  const [enr] = await db.select().from(schema.enrollments).where(and(eq(schema.enrollments.classId, classId), eq(schema.enrollments.userId, userId), eq(schema.enrollments.role, "aluno")));
  if (!enr) throw new ApiError(400, "A pessoa não é aluno desta turma");
  if (action === "add") {
    // uma pessoa em um grupo ativo por vez na turma
    const others = await db.select({ g: schema.groupMembers.groupId }).from(schema.groupMembers).innerJoin(schema.groups, eq(schema.groups.id, schema.groupMembers.groupId)).where(and(eq(schema.groups.classId, classId), eq(schema.groupMembers.userId, userId), isNull(schema.groupMembers.leftAt)));
    for (const o of others) if (o.g !== groupId) await db.update(schema.groupMembers).set({ leftAt: new Date() }).where(and(eq(schema.groupMembers.groupId, o.g), eq(schema.groupMembers.userId, userId)));
    await db.insert(schema.groupMembers).values({ groupId, userId }).onConflictDoUpdate({ target: [schema.groupMembers.groupId, schema.groupMembers.userId], set: { leftAt: null, joinedAt: new Date() } });
  } else {
    await db.update(schema.groupMembers).set({ leftAt: new Date() }).where(and(eq(schema.groupMembers.groupId, groupId), eq(schema.groupMembers.userId, userId)));
  }
  await audit({ actorUserId: actorId, action: `group.member.${action}`, entity: "group", entityId: groupId, classId, details: { userId } });
}
export async function setGroupDataset(classId: string, groupId: string, datasetId: string | null, actorId: string) {
  await db.update(schema.groups).set({ datasetId }).where(and(eq(schema.groups.id, groupId), eq(schema.groups.classId, classId)));
  await audit({ actorUserId: actorId, action: "group.dataset", entity: "group", entityId: groupId, classId, details: { datasetId } });
}
export async function myGroup(classId: string, userId: string) {
  const [row] = await db.select({ g: schema.groups }).from(schema.groupMembers).innerJoin(schema.groups, eq(schema.groups.id, schema.groupMembers.groupId))
    .where(and(eq(schema.groups.classId, classId), eq(schema.groupMembers.userId, userId), isNull(schema.groupMembers.leftAt)));
  if (!row) return null;
  const members = await db.select({ userId: schema.groupMembers.userId, name: schema.users.name, email: schema.users.email }).from(schema.groupMembers).innerJoin(schema.users, eq(schema.users.id, schema.groupMembers.userId)).where(and(eq(schema.groupMembers.groupId, row.g.id), isNull(schema.groupMembers.leftAt)));
  return { ...row.g, members };
}

/* ---------------- trabalhos ---------------- */
export async function listAssignments(classId: string, includeDrafts: boolean) {
  const rows = await db.select().from(schema.assignments).where(includeDrafts ? eq(schema.assignments.classId, classId) : and(eq(schema.assignments.classId, classId), eq(schema.assignments.status, "published"))).orderBy(asc(schema.assignments.position));
  return rows;
}
export async function getAssignment(classId: string, id: string, includeDrafts: boolean) {
  const [a] = await db.select().from(schema.assignments).where(and(eq(schema.assignments.id, id), eq(schema.assignments.classId, classId)));
  if (!a || (!includeDrafts && a.status !== "published")) throw new ApiError(404, "Trabalho não encontrado");
  const steps = await db.select().from(schema.assignmentSteps).where(eq(schema.assignmentSteps.assignmentId, id)).orderBy(asc(schema.assignmentSteps.position));
  const rubric = a.rubricVersionId ? (await db.select().from(schema.rubricVersions).where(eq(schema.rubricVersions.id, a.rubricVersionId)))[0] ?? null : null;
  return { ...a, steps, rubric };
}
export async function updateAssignment(classId: string, id: string, patch: Partial<typeof schema.assignments.$inferInsert>, actorId: string) {
  const [a] = await db.select().from(schema.assignments).where(and(eq(schema.assignments.id, id), eq(schema.assignments.classId, classId)));
  if (!a) throw new ApiError(404, "Trabalho não encontrado");
  await db.update(schema.assignments).set({ ...patch, updatedAt: new Date() }).where(eq(schema.assignments.id, id));
  await audit({ actorUserId: actorId, action: "assignment.update", entity: "assignment", entityId: id, classId, details: Object.keys(patch) });
}
export async function createAssignment(classId: string, input: { title: string; slug: string; unitId?: string | null; mode?: string }, actorId: string) {
  const [last] = await db.select({ p: schema.assignments.position }).from(schema.assignments).where(eq(schema.assignments.classId, classId)).orderBy(desc(schema.assignments.position)).limit(1);
  const id = newId();
  const [r] = await db.insert(schema.assignments).values({ id, classId, title: input.title, slug: input.slug, unitId: input.unitId ?? null, mode: input.mode ?? "individual", position: (last?.p ?? 0) + 1 }).onConflictDoNothing().returning();
  if (!r) throw new ApiError(409, "Já existe trabalho com este identificador");
  await audit({ actorUserId: actorId, action: "assignment.create", entity: "assignment", entityId: id, classId });
  return id;
}
export async function upsertStep(classId: string, assignmentId: string, step: { id?: string; number: number; title: string; description?: string | null; pageSlug?: string | null; expectedOutputs?: string[]; requiresDelivery?: boolean; dueAt?: Date | null }, actorId: string) {
  const a = await getAssignment(classId, assignmentId, true);
  if (step.id) await db.update(schema.assignmentSteps).set({ ...step, id: undefined, position: step.number }).where(and(eq(schema.assignmentSteps.id, step.id), eq(schema.assignmentSteps.assignmentId, a.id)));
  else await db.insert(schema.assignmentSteps).values({ id: newId(), assignmentId: a.id, number: step.number, title: step.title, description: step.description ?? null, pageSlug: step.pageSlug ?? null, expectedOutputs: step.expectedOutputs ?? [], requiresDelivery: step.requiresDelivery ?? false, dueAt: step.dueAt ?? null, position: step.number });
  await audit({ actorUserId: actorId, action: "assignment.step", entity: "assignment", entityId: assignmentId, classId });
}
export async function addExtension(classId: string, assignmentId: string, target: { userId?: string; groupId?: string }, dueAt: Date, reason: string, actorId: string) {
  await getAssignment(classId, assignmentId, true);
  if (!target.userId && !target.groupId) throw new ApiError(400, "Informe aluno ou grupo");
  const id = newId();
  await db.insert(schema.assignmentExtensions).values({ id, assignmentId, userId: target.userId ?? null, groupId: target.groupId ?? null, dueAt, reason, createdBy: actorId });
  await audit({ actorUserId: actorId, action: "assignment.extension", entity: "assignment", entityId: assignmentId, classId, details: { ...target, dueAt, reason } });
}

/** Prazo efetivo para um aluno/grupo: exceção individual > exceção do grupo > prazo do trabalho. */
export async function effectiveDue(assignmentId: string, userId: string, groupId: string | null) {
  const [a] = await db.select().from(schema.assignments).where(eq(schema.assignments.id, assignmentId));
  const exts = await db.select().from(schema.assignmentExtensions).where(and(eq(schema.assignmentExtensions.assignmentId, assignmentId), or(eq(schema.assignmentExtensions.userId, userId), groupId ? eq(schema.assignmentExtensions.groupId, groupId) : sql`false`))).orderBy(desc(schema.assignmentExtensions.createdAt));
  const mine = exts.find((e) => e.userId === userId) ?? exts.find((e) => e.groupId && e.groupId === groupId);
  return { dueAt: mine?.dueAt ?? a?.dueAt ?? null, extension: mine ?? null };
}

/* ---------------- submissões ---------------- */
export type SubmissionContext = { access: ClassAccess; assignment: Awaited<ReturnType<typeof getAssignment>>; group: Awaited<ReturnType<typeof myGroup>> };

export async function submissionContext(access: ClassAccess, assignmentId: string): Promise<SubmissionContext> {
  const assignment = await getAssignment(access.classId, assignmentId, access.role !== "aluno");
  const group = assignment.mode === "grupo" ? await myGroup(access.classId, access.user.id) : null;
  if (assignment.mode === "grupo" && !group && access.role === "aluno") throw new ApiError(400, "Este trabalho é em grupo e você ainda não está em um grupo. Fale com o professor.", "no_group");
  return { access, assignment, group };
}

/** Submissões visíveis ao aluno: as suas (individual) ou as do seu grupo, todas as versões. */
export async function mySubmissions(ctx: SubmissionContext) {
  const { access, assignment, group } = ctx;
  const where = assignment.mode === "grupo" ? and(eq(schema.submissions.assignmentId, assignment.id), eq(schema.submissions.groupId, group!.id)) : and(eq(schema.submissions.assignmentId, assignment.id), eq(schema.submissions.submitterUserId, access.user.id), isNull(schema.submissions.groupId));
  const rows = await db.select().from(schema.submissions).where(where).orderBy(desc(schema.submissions.versionNo));
  return attachFiles(rows);
}
async function attachFiles<T extends { id: string }>(rows: T[]) {
  const ids = rows.map((r) => r.id);
  const fs = ids.length ? await db.select({ sf: schema.submissionFiles, f: schema.files }).from(schema.submissionFiles).innerJoin(schema.files, eq(schema.files.id, schema.submissionFiles.fileId)).where(inArray(schema.submissionFiles.submissionId, ids)) : [];
  return rows.map((r) => ({ ...r, files: fs.filter((x) => x.sf.submissionId === r.id).map((x) => ({ id: x.f.id, name: x.f.originalName, size: x.f.size, mime: x.f.mime, sha256: x.f.sha256, status: x.f.status })) }));
}

/** Obtém (ou cria) o rascunho corrente. Um rascunho por aluno/grupo; versões enviadas ficam preservadas. */
export async function getOrCreateDraft(ctx: SubmissionContext) {
  const { access, assignment, group } = ctx;
  if (assignment.status !== "published") throw new ApiError(400, "Trabalho não publicado");
  const all = await mySubmissions(ctx);
  const draft = all.find((s) => s.status === "rascunho");
  if (draft) return draft;
  const { dueAt } = await effectiveDue(assignment.id, access.user.id, group?.id ?? null);
  const id = newId();
  const versionNo = (all[0]?.versionNo ?? 0) + 1;
  await db.insert(schema.submissions).values({ id, assignmentId: assignment.id, classId: access.classId, groupId: group?.id ?? null, submitterUserId: access.user.id, versionNo, status: "rascunho", isCurrent: false, effectiveDueAt: dueAt });
  return (await attachFiles(await db.select().from(schema.submissions).where(eq(schema.submissions.id, id))))[0];
}

export async function attachFile(ctx: SubmissionContext, submissionId: string, fileId: string) {
  const s = await ownDraft(ctx, submissionId);
  const [f] = await db.select().from(schema.files).where(and(eq(schema.files.id, fileId), eq(schema.files.ownerUserId, ctx.access.user.id), eq(schema.files.status, "complete")));
  if (!f) throw new ApiError(404, "Arquivo não encontrado ou incompleto");
  await db.insert(schema.submissionFiles).values({ submissionId: s.id, fileId }).onConflictDoNothing();
}
export async function detachFile(ctx: SubmissionContext, submissionId: string, fileId: string) {
  const s = await ownDraft(ctx, submissionId);
  await db.delete(schema.submissionFiles).where(and(eq(schema.submissionFiles.submissionId, s.id), eq(schema.submissionFiles.fileId, fileId)));
}
export async function updateDraft(ctx: SubmissionContext, submissionId: string, patch: { links?: string[]; note?: string | null }) {
  const s = await ownDraft(ctx, submissionId);
  await db.update(schema.submissions).set({ links: patch.links ?? s.links, note: patch.note === undefined ? s.note : patch.note }).where(eq(schema.submissions.id, s.id));
}
async function ownDraft(ctx: SubmissionContext, submissionId: string) {
  const all = await mySubmissions(ctx);
  const s = all.find((x) => x.id === submissionId);
  if (!s) throw new ApiError(404, "Envio não encontrado");
  if (s.status !== "rascunho") throw new ApiError(400, "Este envio já foi concluído; crie uma nova versão para alterar");
  return s;
}

/**
 * Conclui o envio: exige arquivos completos ou links, aplica a regra de prazo (horário do servidor),
 * congela a composição do grupo, gera recibo com hashes e marca a versão como vigente.
 */
export async function submit(ctx: SubmissionContext, submissionId: string) {
  const { access, assignment, group } = ctx;
  const s = await ownDraft(ctx, submissionId);
  if (!s.files.length && !(s.links as string[]).length) throw new ApiError(400, "Anexe ao menos um arquivo ou link antes de enviar", "empty");
  if (s.files.some((f) => f.status !== "complete")) throw new ApiError(400, "Há upload não concluído", "incomplete");
  const now = new Date();
  const { dueAt } = await effectiveDue(assignment.id, access.user.id, group?.id ?? null);
  const policy = assignment.latePolicy as LatePolicy;
  let late = false;
  if (dueAt && now > dueAt) {
    const grace = (policy.graceMinutes ?? 15) * 60e3;
    const startedBefore = policy.startedBeforeDeadlineCounts && s.startedAt <= dueAt && now.getTime() - dueAt.getTime() <= grace;
    late = !startedBefore;
    if (late && !policy.acceptLate) throw new ApiError(400, "O prazo terminou e este trabalho não aceita envio atrasado", "deadline");
    if (late && policy.hardDeadlineAt && now > new Date(policy.hardDeadlineAt)) throw new ApiError(400, "O prazo final absoluto já passou", "hard_deadline");
  }
  const members = group ? group.members.map((m) => ({ userId: m.userId, name: m.name, email: m.email })) : [{ userId: access.user.id, name: access.user.name, email: access.user.email }];
  const previous = (await mySubmissions(ctx)).filter((x) => x.id !== s.id && x.status !== "rascunho");
  const receiptHash = sha256([s.id, s.versionNo, now.toISOString(), ...s.files.map((f) => f.sha256 ?? ""), ...(s.links as string[])].join("|"));
  const status = previous.some((p) => p.status === "devolvido") ? "reenviado" : late ? "atrasado" : "enviado";
  await db.transaction(async (tx) => {
    await tx.update(schema.submissions).set({ isCurrent: false }).where(and(eq(schema.submissions.assignmentId, assignment.id), group ? eq(schema.submissions.groupId, group.id) : and(eq(schema.submissions.submitterUserId, access.user.id), isNull(schema.submissions.groupId))));
    await tx.update(schema.submissions).set({ status, isCurrent: true, submittedAt: now, late, effectiveDueAt: dueAt, membersSnapshot: members, receiptHash }).where(eq(schema.submissions.id, s.id));
  });
  await audit({ actorUserId: access.user.id, action: "submission.submit", entity: "submission", entityId: s.id, classId: access.classId, details: { status, late, receiptHash, versionNo: s.versionNo, files: s.files.map((f) => f.sha256) } });
  return { status, late, receiptHash, submittedAt: now, versionNo: s.versionNo, members };
}

/* ---------------- correção ---------------- */
export { computeTotal, type RubricDef };

export async function listSubmissionsForTeacher(classId: string, assignmentId: string) {
  const rows = await db.select({ s: schema.submissions, submitter: schema.users.name }).from(schema.submissions).innerJoin(schema.users, eq(schema.users.id, schema.submissions.submitterUserId))
    .where(and(eq(schema.submissions.assignmentId, assignmentId), eq(schema.submissions.classId, classId))).orderBy(desc(schema.submissions.submittedAt));
  const withFiles = await attachFiles(rows.map((r) => ({ ...r.s, submitter: r.submitter })));
  const grades = await db.select({ g: schema.grades, name: schema.users.name }).from(schema.grades).innerJoin(schema.users, eq(schema.users.id, schema.grades.userId)).where(eq(schema.grades.assignmentId, assignmentId));
  return { submissions: withFiles, grades: grades.map((g) => ({ ...g.g, name: g.name })) };
}

export async function returnForRevision(classId: string, submissionId: string, reason: string, actorId: string) {
  const [s] = await db.select().from(schema.submissions).where(and(eq(schema.submissions.id, submissionId), eq(schema.submissions.classId, classId)));
  if (!s) throw new ApiError(404, "Envio não encontrado");
  await db.update(schema.submissions).set({ status: "devolvido", returnedReason: reason }).where(eq(schema.submissions.id, submissionId));
  await audit({ actorUserId: actorId, action: "submission.return", entity: "submission", entityId: submissionId, classId, details: { reason } });
}

/** Lança/atualiza nota por rubrica para um aluno (individual) ou todos os membros congelados (grupo). Histórico preservado. */
export async function gradeSubmission(classId: string, submissionId: string, input: { scores: Record<string, number>; comments?: string | null; feedbackFileId?: string | null; individualDefense?: Record<string, { score: number; notes: string }>; status?: "corrigido" | "dispensado" | "nao_entregue" | "zero"; applyTo?: string[] }, actorId: string) {
  const [s] = await db.select().from(schema.submissions).where(and(eq(schema.submissions.id, submissionId), eq(schema.submissions.classId, classId)));
  if (!s) throw new ApiError(404, "Envio não encontrado");
  const [a] = await db.select().from(schema.assignments).where(eq(schema.assignments.id, s.assignmentId));
  const rv = a.rubricVersionId ? (await db.select().from(schema.rubricVersions).where(eq(schema.rubricVersions.id, a.rubricVersionId)))[0] : null;
  const members = (s.membersSnapshot as { userId: string }[]).map((m) => m.userId);
  const targets = input.applyTo?.length ? input.applyTo.filter((u) => members.includes(u)) : members;
  const total = rv ? computeTotal(rv.definition as RubricDef, input.scores) : null;
  for (const userId of targets) {
    const [existing] = await db.select().from(schema.grades).where(and(eq(schema.grades.assignmentId, a.id), eq(schema.grades.userId, userId)));
    const status = input.status ?? "corrigido";
    const values = { submissionId: s.id, rubricVersionId: rv?.id ?? null, scores: input.scores, total: total ? String(total.total) : null, status, comments: input.comments ?? null, feedbackFileId: input.feedbackFileId ?? null, individualDefense: input.individualDefense?.[userId] ?? existing?.individualDefense ?? null, gradedBy: actorId, gradedAt: new Date(), updatedAt: new Date() };
    if (existing) {
      await db.insert(schema.gradeHistory).values({ id: newId(), gradeId: existing.id, snapshot: existing, reason: "atualização da correção", changedBy: actorId });
      await db.update(schema.grades).set(values).where(eq(schema.grades.id, existing.id));
    } else {
      await db.insert(schema.grades).values({ id: newId(), assignmentId: a.id, classId, userId, ...values });
    }
  }
  await db.update(schema.submissions).set({ status: "corrigido" }).where(eq(schema.submissions.id, s.id));
  await audit({ actorUserId: actorId, action: "grade.set", entity: "submission", entityId: s.id, classId, details: { targets, total: total?.total } });
  return { total, targets };
}

export async function publishGrades(classId: string, assignmentId: string, userIds: string[] | null, actorId: string) {
  const where = userIds ? and(eq(schema.grades.assignmentId, assignmentId), eq(schema.grades.classId, classId), inArray(schema.grades.userId, userIds)) : and(eq(schema.grades.assignmentId, assignmentId), eq(schema.grades.classId, classId));
  const rows = await db.update(schema.grades).set({ publishedAt: new Date(), publishedBy: actorId }).where(where).returning({ id: schema.grades.id, submissionId: schema.grades.submissionId });
  const subs = [...new Set(rows.map((r) => r.submissionId).filter(Boolean))] as string[];
  if (subs.length) await db.update(schema.submissions).set({ status: "publicado" }).where(inArray(schema.submissions.id, subs));
  await audit({ actorUserId: actorId, action: "grade.publish", entity: "assignment", entityId: assignmentId, classId, details: { count: rows.length } });
  return rows.length;
}

/** Nota do aluno: só se publicada. Diferencia não corrigido, não entregue, dispensado e zero. */
export async function myGrade(classId: string, assignmentId: string, userId: string) {
  const [g] = await db.select().from(schema.grades).where(and(eq(schema.grades.assignmentId, assignmentId), eq(schema.grades.userId, userId), eq(schema.grades.classId, classId)));
  if (!g || !g.publishedAt) return null;
  const rv = g.rubricVersionId ? (await db.select().from(schema.rubricVersions).where(eq(schema.rubricVersions.id, g.rubricVersionId)))[0] : null;
  const calc = rv ? computeTotal(rv.definition as RubricDef, g.scores as Record<string, number>) : null;
  return { ...g, rubric: rv?.definition ?? null, rubricVersionNo: rv?.versionNo ?? null, calc };
}
