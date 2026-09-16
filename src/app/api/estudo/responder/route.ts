import { z } from "zod";
import { and, desc, eq } from "drizzle-orm";
import { handle, json, parseBody } from "@/lib/api";
import { ApiError, assertWritable, requireClassAccess } from "@/lib/auth/guard";
import { db, schema } from "@/lib/db/client";
import { newId } from "@/lib/ids";
import { grade, validateAnswer, type AnswerKey } from "@/lib/services/grading";

/**
 * Resposta formativa em modo estudo. Corrigida no servidor; o gabarito nunca sai antes da resposta.
 * Idempotente por clientRequestId: reenvio por falha de rede devolve o mesmo registro.
 */
export const POST = handle(async (req) => {
  const b = await parseBody(req, z.object({ classId: z.string(), questionVersionId: z.string(), answer: z.unknown(), clientRequestId: z.string().min(8).max(80) }));
  const access = await requireClassAccess(b.classId);
  assertWritable(access);
  const [existing] = await db.select().from(schema.studyResponses)
    .where(and(eq(schema.studyResponses.userId, access.user.id), eq(schema.studyResponses.clientRequestId, b.clientRequestId)));
  const [qv] = await db.select({ v: schema.questionVersions, q: schema.questions }).from(schema.questionVersions)
    .innerJoin(schema.questions, eq(schema.questions.id, schema.questionVersions.questionId))
    .where(and(eq(schema.questionVersions.id, b.questionVersionId), eq(schema.questions.editionId, access.edition.id)));
  if (!qv) throw new ApiError(404, "Questão não encontrada nesta edição");
  const key = qv.v.answerKey as AnswerKey | null;
  const fb = qv.v.feedback as Record<string, unknown> | null;
  if (existing) {
    const r = grade(qv.q.kind, existing.answer as never, key, fb);
    return json({ ok: true, duplicate: true, responseId: existing.id, attemptNo: existing.attemptNo, isCorrect: existing.isCorrect, feedback: r.feedback, serverTime: existing.serverTime });
  }
  let answer;
  try { answer = validateAnswer(qv.q.kind, b.answer, qv.v.options as Record<string, unknown>); } catch (e) { throw new ApiError(400, (e as Error).message, "invalid_answer"); }
  const r = grade(qv.q.kind, answer, key, fb);
  const [last] = await db.select({ n: schema.studyResponses.attemptNo }).from(schema.studyResponses)
    .where(and(eq(schema.studyResponses.userId, access.user.id), eq(schema.studyResponses.questionVersionId, qv.v.id))).orderBy(desc(schema.studyResponses.attemptNo)).limit(1);
  const id = newId();
  const now = new Date();
  await db.insert(schema.studyResponses).values({ id, classId: b.classId, userId: access.user.id, questionVersionId: qv.v.id, answer, isCorrect: r.isCorrect, attemptNo: (last?.n ?? 0) + 1, clientRequestId: b.clientRequestId, serverTime: now })
    .onConflictDoNothing();
  return json({ ok: true, responseId: id, attemptNo: (last?.n ?? 0) + 1, isCorrect: r.isCorrect, feedback: r.feedback, serverTime: now });
});

/** Estado das respostas do próprio aluno para as questões de uma página. */
export const GET = handle(async (req) => {
  const url = new URL(req.url);
  const classId = url.searchParams.get("classId") ?? "";
  const ids = (url.searchParams.get("versions") ?? "").split(",").filter(Boolean);
  const access = await requireClassAccess(classId);
  if (!ids.length) return json({ responses: {} });
  const rows = await db.select().from(schema.studyResponses)
    .where(and(eq(schema.studyResponses.userId, access.user.id), eq(schema.studyResponses.classId, classId))).orderBy(desc(schema.studyResponses.serverTime));
  const out: Record<string, { answer: unknown; isCorrect: boolean | null; attemptNo: number; feedback: unknown }> = {};
  for (const r of rows) {
    if (!ids.includes(r.questionVersionId) || out[r.questionVersionId]) continue;
    const [qv] = await db.select({ v: schema.questionVersions, q: schema.questions }).from(schema.questionVersions).innerJoin(schema.questions, eq(schema.questions.id, schema.questionVersions.questionId)).where(eq(schema.questionVersions.id, r.questionVersionId));
    const g = qv ? grade(qv.q.kind, r.answer as never, qv.v.answerKey as AnswerKey | null, qv.v.feedback as Record<string, unknown> | null) : { feedback: null };
    out[r.questionVersionId] = { answer: r.answer, isCorrect: r.isCorrect, attemptNo: r.attemptNo, feedback: g.feedback };
  }
  return json({ responses: out });
});
