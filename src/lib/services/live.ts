import "server-only";
import { and, asc, desc, eq, inArray, sql } from "drizzle-orm";
import { db, schema } from "@/lib/db/client";
import { newId } from "@/lib/ids";
import { ApiError } from "@/lib/auth/guard";
import { audit } from "@/lib/audit";
import { grade, validateAnswer, type AnswerKey } from "@/lib/services/grading";

async function bump(sessionId: string) {
  await db.update(schema.liveSessions).set({ stateVersion: sql`${schema.liveSessions.stateVersion} + 1` }).where(eq(schema.liveSessions.id, sessionId));
}

export async function getSession(sessionId: string) {
  const [s] = await db.select().from(schema.liveSessions).where(eq(schema.liveSessions.id, sessionId));
  if (!s) throw new ApiError(404, "Sessão não encontrada");
  return s;
}

export async function createSession(meetingId: string, classId: string, actorId: string) {
  const [m] = await db.select().from(schema.meetings).where(and(eq(schema.meetings.id, meetingId), eq(schema.meetings.classId, classId)));
  if (!m) throw new ApiError(404, "Encontro não encontrado");
  const id = newId();
  await db.insert(schema.liveSessions).values({ id, meetingId, classId, status: "draft", createdBy: actorId });
  await audit({ actorUserId: actorId, action: "live.create", entity: "live_session", entityId: id, classId });
  return id;
}

export async function setSessionStatus(sessionId: string, status: "open" | "closed", actorId: string) {
  const s = await getSession(sessionId);
  await db.update(schema.liveSessions).set({ status, openedAt: status === "open" ? s.openedAt ?? new Date() : s.openedAt, closedAt: status === "closed" ? new Date() : null }).where(eq(schema.liveSessions.id, sessionId));
  if (status === "closed") await db.update(schema.sessionActivities).set({ status: "closed", closedAt: new Date() }).where(and(eq(schema.sessionActivities.liveSessionId, sessionId), eq(schema.sessionActivities.status, "open")));
  await bump(sessionId);
  await audit({ actorUserId: actorId, action: `live.${status}`, entity: "live_session", entityId: sessionId, classId: s.classId });
}

export async function setCurrentPage(sessionId: string, pageSlug: string, editionId: string) {
  const [p] = await db.select({ id: schema.pages.id }).from(schema.pages).innerJoin(schema.chapters, eq(schema.chapters.id, schema.pages.chapterId)).innerJoin(schema.units, eq(schema.units.id, schema.chapters.unitId))
    .where(and(eq(schema.units.editionId, editionId), eq(schema.pages.slug, pageSlug)));
  if (!p) throw new ApiError(404, "Página não encontrada");
  await db.update(schema.liveSessions).set({ currentPageId: p.id }).where(eq(schema.liveSessions.id, sessionId));
  await bump(sessionId);
}

/** Publica uma questão (existente ou criada na hora) na sessão, em rascunho. */
export async function addActivity(sessionId: string, input: { questionVersionId?: string; pageSlug?: string; round?: string; timeLimitS?: number | null; maxAttempts?: number; newQuestion?: { kind: string; prompt: string; options: Record<string, unknown>; answerKey?: unknown; feedback?: unknown; label?: string } }, editionId: string, actorId: string) {
  const s = await getSession(sessionId);
  let qvId = input.questionVersionId;
  let pageId: string | null = null;
  if (input.pageSlug) {
    const [p] = await db.select({ id: schema.pages.id }).from(schema.pages).innerJoin(schema.chapters, eq(schema.chapters.id, schema.pages.chapterId)).innerJoin(schema.units, eq(schema.units.id, schema.chapters.unitId))
      .where(and(eq(schema.units.editionId, editionId), eq(schema.pages.slug, input.pageSlug)));
    pageId = p?.id ?? null;
  }
  if (!qvId && input.newQuestion) {
    const nq = input.newQuestion;
    const qid = newId(); const vid = newId();
    const slug = `ad-hoc-${qid.slice(0, 8)}`;
    await db.insert(schema.questions).values({ id: qid, editionId, pageId, slug, kind: nq.kind, currentVersionId: null });
    await db.insert(schema.questionVersions).values({ id: vid, questionId: qid, versionNo: 1, label: nq.label ?? null, prompt: nq.prompt, options: nq.options, answerKey: nq.answerKey ?? null, feedback: nq.feedback ?? null });
    await db.update(schema.questions).set({ currentVersionId: vid }).where(eq(schema.questions.id, qid));
    qvId = vid;
  }
  if (!qvId) throw new ApiError(400, "Informe uma questão");
  const [qv] = await db.select({ v: schema.questionVersions, q: schema.questions }).from(schema.questionVersions).innerJoin(schema.questions, eq(schema.questions.id, schema.questionVersions.questionId)).where(and(eq(schema.questionVersions.id, qvId), eq(schema.questions.editionId, editionId)));
  if (!qv) throw new ApiError(404, "Questão não pertence a esta edição");
  const [last] = await db.select({ p: schema.sessionActivities.position }).from(schema.sessionActivities).where(eq(schema.sessionActivities.liveSessionId, sessionId)).orderBy(desc(schema.sessionActivities.position)).limit(1);
  const id = newId();
  await db.insert(schema.sessionActivities).values({ id, liveSessionId: sessionId, questionVersionId: qvId, pageId: pageId ?? qv.q.pageId, round: input.round ?? "unica", timeLimitS: input.timeLimitS ?? null, maxAttempts: input.maxAttempts ?? 1, position: (last?.p ?? 0) + 1 });
  await bump(sessionId);
  await audit({ actorUserId: actorId, action: "live.activity.add", entity: "session_activity", entityId: id, classId: s.classId });
  return id;
}

/** rascunho → aberta → encerrada → resultados liberados; reabertura permitida (encerrada → aberta). */
export async function setActivityStatus(sessionId: string, activityId: string, status: "open" | "closed" | "released", actorId: string, opts: { timeLimitS?: number | null; maxAttempts?: number } = {}) {
  const s = await getSession(sessionId);
  const [a] = await db.select().from(schema.sessionActivities).where(and(eq(schema.sessionActivities.id, activityId), eq(schema.sessionActivities.liveSessionId, sessionId)));
  if (!a) throw new ApiError(404, "Atividade não encontrada");
  const allowed: Record<string, string[]> = { draft: ["open"], open: ["closed"], closed: ["open", "released"], released: ["open"] };
  if (!allowed[a.status]?.includes(status)) throw new ApiError(400, `Transição inválida: ${a.status} → ${status}`);
  if (status === "open" && s.status !== "open") throw new ApiError(400, "Abra a sessão antes de abrir uma atividade");
  const now = new Date();
  const timeLimit = opts.timeLimitS === undefined ? a.timeLimitS : opts.timeLimitS;
  await db.update(schema.sessionActivities).set({
    status, timeLimitS: timeLimit, maxAttempts: opts.maxAttempts ?? a.maxAttempts,
    openedAt: status === "open" ? now : a.openedAt, closesAt: status === "open" && timeLimit ? new Date(now.getTime() + timeLimit * 1000) : status === "open" ? null : a.closesAt,
    closedAt: status === "closed" ? now : status === "open" ? null : a.closedAt, releasedAt: status === "released" ? now : a.releasedAt,
  }).where(eq(schema.sessionActivities.id, activityId));
  await bump(sessionId);
  await audit({ actorUserId: actorId, action: `live.activity.${status}`, entity: "session_activity", entityId: activityId, classId: s.classId });
}

/** Encerra automaticamente atividades cujo tempo expirou (chamado ao consultar estado). */
async function expireActivities(sessionId: string) {
  const r = await db.update(schema.sessionActivities).set({ status: "closed", closedAt: new Date() })
    .where(and(eq(schema.sessionActivities.liveSessionId, sessionId), eq(schema.sessionActivities.status, "open"), sql`${schema.sessionActivities.closesAt} IS NOT NULL AND ${schema.sessionActivities.closesAt} < now()`)).returning({ id: schema.sessionActivities.id });
  if (r.length) await bump(sessionId);
}

/** Estado para o aluno: página atual, atividades visíveis (abertas, encerradas, liberadas) e a própria tentativa. */
export async function studentState(sessionId: string, userId: string) {
  await expireActivities(sessionId);
  const s = await getSession(sessionId);
  const page = s.currentPageId ? (await db.select({ slug: schema.pages.slug, title: schema.pageVersions.title }).from(schema.pages).innerJoin(schema.pageVersions, eq(schema.pageVersions.id, schema.pages.publishedVersionId)).where(eq(schema.pages.id, s.currentPageId)))[0] ?? null : null;
  const acts = await db.select({ a: schema.sessionActivities, v: schema.questionVersions, q: schema.questions }).from(schema.sessionActivities)
    .innerJoin(schema.questionVersions, eq(schema.questionVersions.id, schema.sessionActivities.questionVersionId))
    .innerJoin(schema.questions, eq(schema.questions.id, schema.questionVersions.questionId))
    .where(and(eq(schema.sessionActivities.liveSessionId, sessionId), inArray(schema.sessionActivities.status, ["open", "closed", "released"]))).orderBy(asc(schema.sessionActivities.position));
  const ids = acts.map((x) => x.a.id);
  const mine = ids.length ? await db.select().from(schema.attempts).where(and(eq(schema.attempts.userId, userId), inArray(schema.attempts.activityId, ids))).orderBy(desc(schema.attempts.attemptNo)) : [];
  return {
    session: { id: s.id, status: s.status, stateVersion: s.stateVersion, classId: s.classId },
    currentPage: page,
    activities: acts.map(({ a, v, q }) => {
      const my = mine.filter((m) => m.activityId === a.id);
      const last = my[0] ?? null;
      const released = a.status === "released";
      const g = last && last.status === "submitted" && released ? grade(q.kind, last.answer as never, v.answerKey as AnswerKey | null, v.feedback as Record<string, unknown> | null) : null;
      return {
        id: a.id, status: a.status, round: a.round, closesAt: a.closesAt, maxAttempts: a.maxAttempts, timeLimitS: a.timeLimitS,
        question: { id: q.id, versionId: v.id, slug: q.slug, kind: q.kind, label: v.label, prompt: v.prompt, options: v.options as Record<string, unknown> },
        myAttempt: last ? { attemptNo: last.attemptNo, status: last.status, answer: last.answer, submittedAt: last.submittedAt, isCorrect: released ? last.isCorrect : null, feedback: g?.feedback ?? null } : null,
        attemptsUsed: my.filter((m) => m.status === "submitted").length,
      };
    }),
  };
}

/** Estado para o professor: agregados por atividade + painel privado com nomes. */
export async function teacherState(sessionId: string) {
  await expireActivities(sessionId);
  const s = await getSession(sessionId);
  const page = s.currentPageId ? (await db.select({ slug: schema.pages.slug, title: schema.pageVersions.title }).from(schema.pages).innerJoin(schema.pageVersions, eq(schema.pageVersions.id, schema.pages.publishedVersionId)).where(eq(schema.pages.id, s.currentPageId)))[0] ?? null : null;
  const acts = await db.select({ a: schema.sessionActivities, v: schema.questionVersions, q: schema.questions }).from(schema.sessionActivities)
    .innerJoin(schema.questionVersions, eq(schema.questionVersions.id, schema.sessionActivities.questionVersionId))
    .innerJoin(schema.questions, eq(schema.questions.id, schema.questionVersions.questionId))
    .where(eq(schema.sessionActivities.liveSessionId, sessionId)).orderBy(asc(schema.sessionActivities.position));
  const ids = acts.map((x) => x.a.id);
  const all = ids.length ? await db.select({ at: schema.attempts, name: schema.users.name }).from(schema.attempts).innerJoin(schema.users, eq(schema.users.id, schema.attempts.userId)).where(and(inArray(schema.attempts.activityId, ids), eq(schema.attempts.status, "submitted"))).orderBy(desc(schema.attempts.attemptNo)) : [];
  const enrolled = await db.select({ n: sql<number>`count(*)` }).from(schema.enrollments).where(and(eq(schema.enrollments.classId, s.classId), eq(schema.enrollments.status, "ativo"), eq(schema.enrollments.role, "aluno")));
  return {
    session: { id: s.id, status: s.status, stateVersion: s.stateVersion, classId: s.classId, meetingId: s.meetingId },
    currentPage: page, enrolled: Number(enrolled[0]?.n ?? 0),
    activities: acts.map(({ a, v, q }) => {
      const rows = all.filter((x) => x.at.activityId === a.id);
      // última tentativa de cada aluno
      const latest = new Map<string, typeof rows[number]>();
      for (const r of rows) if (!latest.has(r.at.userId)) latest.set(r.at.userId, r);
      const alts = ((v.options as { alternatives?: string[] }).alternatives ?? []);
      const dist = alts.map((_, i) => 0);
      const texts: { name: string; text: string; isCorrect: boolean | null }[] = [];
      let correct = 0;
      for (const r of latest.values()) {
        const ans = r.at.answer as { choice?: number; choices?: number[]; text?: string; value?: number; decision?: string; justification?: string };
        if (typeof ans.choice === "number" && dist[ans.choice] !== undefined) dist[ans.choice]++;
        if (Array.isArray(ans.choices)) ans.choices.forEach((c) => { if (dist[c] !== undefined) dist[c]++; });
        if (ans.text || ans.decision) texts.push({ name: r.name, text: ans.text ?? `${ans.decision}: ${ans.justification ?? ""}`, isCorrect: r.at.isCorrect });
        if (typeof ans.value === "number") texts.push({ name: r.name, text: String(ans.value), isCorrect: r.at.isCorrect });
        if (r.at.isCorrect) correct++;
      }
      const key = v.answerKey as AnswerKey | null;
      return {
        id: a.id, status: a.status, round: a.round, closesAt: a.closesAt, maxAttempts: a.maxAttempts, timeLimitS: a.timeLimitS, position: a.position,
        question: { id: q.id, versionId: v.id, slug: q.slug, kind: q.kind, label: v.label, prompt: v.prompt, options: v.options as Record<string, unknown> },
        answerKey: { correct: key?.correct ?? null },   // apenas para o painel privado do professor
        respondents: latest.size, correct, distribution: dist,
        names: [...latest.values()].map((r) => ({ name: r.name, userId: r.at.userId, answer: r.at.answer, isCorrect: r.at.isCorrect, at: r.at.submittedAt })),
        texts,
      };
    }),
  };
}

/** Envio de tentativa: idempotente, com regras de status, prazo e tentativas verificadas no servidor. */
export async function submitAttempt(activityId: string, userId: string, answerRaw: unknown, clientRequestId: string, draft = false) {
  const [row] = await db.select({ a: schema.sessionActivities, v: schema.questionVersions, q: schema.questions, s: schema.liveSessions }).from(schema.sessionActivities)
    .innerJoin(schema.questionVersions, eq(schema.questionVersions.id, schema.sessionActivities.questionVersionId))
    .innerJoin(schema.questions, eq(schema.questions.id, schema.questionVersions.questionId))
    .innerJoin(schema.liveSessions, eq(schema.liveSessions.id, schema.sessionActivities.liveSessionId))
    .where(eq(schema.sessionActivities.id, activityId));
  if (!row) throw new ApiError(404, "Atividade não encontrada");
  const [dup] = await db.select().from(schema.attempts).where(and(eq(schema.attempts.userId, userId), eq(schema.attempts.clientRequestId, clientRequestId)));
  if (dup && dup.status === "submitted") return { duplicate: true, attemptNo: dup.attemptNo, status: dup.status, serverTime: dup.serverTime };
  await expireActivities(row.s.id);
  const [fresh] = await db.select().from(schema.sessionActivities).where(eq(schema.sessionActivities.id, activityId));
  if (fresh.status !== "open" || row.s.status !== "open") throw new ApiError(409, "A atividade não está aberta", "closed");
  if (fresh.closesAt && fresh.closesAt < new Date()) throw new ApiError(409, "O tempo desta atividade terminou", "closed");
  let answer;
  try { answer = validateAnswer(row.q.kind, answerRaw, row.v.options as Record<string, unknown>); } catch (e) { if (!draft) throw new ApiError(400, (e as Error).message, "invalid_answer"); answer = answerRaw as never; }
  const submitted = await db.select().from(schema.attempts).where(and(eq(schema.attempts.activityId, activityId), eq(schema.attempts.userId, userId), eq(schema.attempts.status, "submitted")));
  if (!draft && submitted.length >= fresh.maxAttempts) throw new ApiError(409, `Limite de ${fresh.maxAttempts} tentativa(s) atingido`, "max_attempts");
  const g = draft ? { isCorrect: null } : grade(row.q.kind, answer as never, row.v.answerKey as AnswerKey | null, row.v.feedback as Record<string, unknown> | null);
  const now = new Date();
  // rascunho existente para esta tentativa?
  const [existingDraft] = await db.select().from(schema.attempts).where(and(eq(schema.attempts.activityId, activityId), eq(schema.attempts.userId, userId), eq(schema.attempts.status, "draft")));
  const attemptNo = existingDraft ? existingDraft.attemptNo : submitted.length + 1;
  if (existingDraft) {
    await db.update(schema.attempts).set({ answer: answer as never, status: draft ? "draft" : "submitted", isCorrect: g.isCorrect, savedAt: now, submittedAt: draft ? null : now, serverTime: now, clientRequestId }).where(eq(schema.attempts.id, existingDraft.id));
  } else {
    await db.insert(schema.attempts).values({ id: newId(), activityId, userId, attemptNo, clientRequestId, answer: answer as never, status: draft ? "draft" : "submitted", isCorrect: g.isCorrect, savedAt: now, submittedAt: draft ? null : now, serverTime: now })
      .onConflictDoNothing();
  }
  if (!draft) await bump(row.s.id);
  return { duplicate: false, attemptNo, status: draft ? "draft" : "submitted", serverTime: now };
}

export async function listSessionsForClass(classId: string) {
  return db.select({ s: schema.liveSessions, m: schema.meetings }).from(schema.liveSessions).innerJoin(schema.meetings, eq(schema.meetings.id, schema.liveSessions.meetingId))
    .where(eq(schema.liveSessions.classId, classId)).orderBy(desc(schema.liveSessions.createdAt));
}
