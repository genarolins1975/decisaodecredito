import { z } from "zod";
import { handle, json, parseBody } from "@/lib/api";
import { requireClassAccess, assertWritable } from "@/lib/auth/guard";
import { getSession, submitAttempt } from "@/lib/services/live";

/** Envio (ou rascunho) de resposta em sessão ao vivo. Idempotente por clientRequestId. */
export const POST = handle(async (req, ctx: { params: Promise<{ id: string }> }) => {
  const { id } = await ctx.params;
  const b = await parseBody(req, z.object({ activityId: z.string(), answer: z.unknown(), clientRequestId: z.string().min(8).max(80), draft: z.boolean().optional() }));
  const s = await getSession(id);
  const access = await requireClassAccess(s.classId, ["aluno"]);
  assertWritable(access);
  const r = await submitAttempt(b.activityId, access.user.id, b.answer, b.clientRequestId, b.draft ?? false);
  return json({ ok: true, ...r });
});
