import { z } from "zod";
import { and, desc, eq, isNotNull } from "drizzle-orm";
import { handle, json, parseBody } from "@/lib/api";
import { ApiError, assertWritable, requireClassAccess } from "@/lib/auth/guard";
import { db, schema } from "@/lib/db/client";
import { newId } from "@/lib/ids";
import { grade, redactFeedback, shouldDisclose, validateAnswer, type AnswerKey } from "@/lib/services/grading";

/**
 * Resposta formativa em modo estudo. Corrigida no servidor; o gabarito nunca sai antes da resposta e,
 * numa questão com gabarito, só sai depois de acertar, da segunda tentativa em diante ou a pedido
 * ("Ver a resposta"). Idempotente por clientRequestId: reenvio por falha de rede devolve o mesmo registro.
 */
export const POST = handle(async (req) => {
  const b = await parseBody(req, z.object({
    classId: z.string(), questionVersionId: z.string(), answer: z.unknown().optional(),
    clientRequestId: z.string().min(8).max(80).optional(), reveal: z.boolean().optional(),
  }));
  const access = await requireClassAccess(b.classId);
  assertWritable(access);
  const [qv] = await db.select({ v: schema.questionVersions, q: schema.questions }).from(schema.questionVersions)
    .innerJoin(schema.questions, eq(schema.questions.id, schema.questionVersions.questionId))
    .where(and(eq(schema.questionVersions.id, b.questionVersionId), eq(schema.questions.editionId, access.edition.id)));
  if (!qv) throw new ApiError(404, "Questão não encontrada nesta edição");
  const key = qv.v.answerKey as AnswerKey | null;
  const fb = qv.v.feedback as Record<string, unknown> | null;
  const mine = and(eq(schema.studyResponses.userId, access.user.id), eq(schema.studyResponses.questionVersionId, qv.v.id));

  // "Ver a resposta": divulga o gabarito da última tentativa registrada e marca a divulgação
  if (b.reveal) {
    const [last] = await db.select().from(schema.studyResponses).where(mine).orderBy(desc(schema.studyResponses.attemptNo)).limit(1);
    if (!last) throw new ApiError(400, "Responda antes de ver a resposta", "answer_first");
    if (!last.revealedAt) await db.update(schema.studyResponses).set({ revealedAt: new Date() }).where(eq(schema.studyResponses.id, last.id));
    const r = grade(qv.q.kind, last.answer as never, key, fb);
    return json({ ok: true, responseId: last.id, attemptNo: last.attemptNo, isCorrect: last.isCorrect, feedback: r.feedback, revealed: true, disclosedBefore: last.disclosedBefore, serverTime: last.serverTime });
  }
  if (!b.clientRequestId) throw new ApiError(400, "clientRequestId obrigatório", "invalid_request");

  const [existing] = await db.select().from(schema.studyResponses)
    .where(and(eq(schema.studyResponses.userId, access.user.id), eq(schema.studyResponses.clientRequestId, b.clientRequestId)));
  if (existing) {
    const r = grade(qv.q.kind, existing.answer as never, key, fb);
    const revealed = Boolean(existing.revealedAt);
    return json({ ok: true, duplicate: true, responseId: existing.id, attemptNo: existing.attemptNo, isCorrect: existing.isCorrect, feedback: revealed ? r.feedback : redactFeedback(r.feedback), revealed, disclosedBefore: existing.disclosedBefore, serverTime: existing.serverTime });
  }
  let answer;
  try { answer = validateAnswer(qv.q.kind, b.answer, qv.v.options as Record<string, unknown>); } catch (e) { throw new ApiError(400, (e as Error).message, "invalid_answer"); }
  const r = grade(qv.q.kind, answer, key, fb);
  const [last] = await db.select({ n: schema.studyResponses.attemptNo }).from(schema.studyResponses).where(mine).orderBy(desc(schema.studyResponses.attemptNo)).limit(1);
  const [prevReveal] = await db.select({ id: schema.studyResponses.id }).from(schema.studyResponses).where(and(mine, isNotNull(schema.studyResponses.revealedAt))).limit(1);
  const attemptNo = (last?.n ?? 0) + 1;
  const disclosedBefore = Boolean(prevReveal);
  const disclose = shouldDisclose(qv.q.kind, r.isCorrect, attemptNo, disclosedBefore);
  const id = newId();
  const now = new Date();
  await db.insert(schema.studyResponses).values({ id, classId: b.classId, userId: access.user.id, questionVersionId: qv.v.id, answer, isCorrect: r.isCorrect, attemptNo, clientRequestId: b.clientRequestId, serverTime: now, revealedAt: disclose ? now : null, disclosedBefore })
    .onConflictDoNothing();
  return json({ ok: true, responseId: id, attemptNo, isCorrect: r.isCorrect, feedback: disclose ? r.feedback : redactFeedback(r.feedback), revealed: disclose, disclosedBefore, serverTime: now });
});

/** Estado das respostas do próprio aluno para as questões de uma página (última tentativa de cada questão). */
export const GET = handle(async (req) => {
  const url = new URL(req.url);
  const classId = url.searchParams.get("classId") ?? "";
  const ids = (url.searchParams.get("versions") ?? "").split(",").filter(Boolean);
  const access = await requireClassAccess(classId);
  if (!ids.length) return json({ responses: {} });
  const rows = await db.select().from(schema.studyResponses)
    .where(and(eq(schema.studyResponses.userId, access.user.id), eq(schema.studyResponses.classId, classId))).orderBy(desc(schema.studyResponses.attemptNo), desc(schema.studyResponses.serverTime));
  const out: Record<string, { answer: unknown; isCorrect: boolean | null; attemptNo: number; feedback: unknown; revealed: boolean; disclosedBefore: boolean }> = {};
  for (const r of rows) {
    if (!ids.includes(r.questionVersionId) || out[r.questionVersionId]) continue;
    const [qv] = await db.select({ v: schema.questionVersions, q: schema.questions }).from(schema.questionVersions).innerJoin(schema.questions, eq(schema.questions.id, schema.questionVersions.questionId)).where(eq(schema.questionVersions.id, r.questionVersionId));
    const g = qv ? grade(qv.q.kind, r.answer as never, qv.v.answerKey as AnswerKey | null, qv.v.feedback as Record<string, unknown> | null) : { feedback: null };
    const revealed = Boolean(r.revealedAt);
    out[r.questionVersionId] = { answer: r.answer, isCorrect: r.isCorrect, attemptNo: r.attemptNo, feedback: revealed ? g.feedback : redactFeedback(g.feedback as Record<string, unknown> | null), revealed, disclosedBefore: r.disclosedBefore };
  }
  return json({ responses: out });
});
