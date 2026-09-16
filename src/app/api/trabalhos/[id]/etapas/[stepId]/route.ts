import { z } from "zod";
import { and, eq, isNull } from "drizzle-orm";
import { handle, json, parseBody } from "@/lib/api";
import { requireClassAccess, assertWritable, ApiError } from "@/lib/auth/guard";
import { submissionContext } from "@/lib/services/assignments";
import { db, schema } from "@/lib/db/client";
import { newId } from "@/lib/ids";

/** Progresso de uma missão/etapa (grupo ou individual). Professor pode marcar "validada". */
export const POST = handle(async (req, ctx: { params: Promise<{ id: string; stepId: string }> }) => {
  const { id, stepId } = await ctx.params;
  const b = await parseBody(req, z.object({ classId: z.string(), status: z.enum(["pendente", "em_andamento", "concluida", "validada"]), note: z.string().max(1000).nullable().optional(), groupId: z.string().optional(), userId: z.string().optional() }));
  const access = await requireClassAccess(b.classId);
  assertWritable(access);
  if (b.status === "validada" && access.role === "aluno") throw new ApiError(403, "Somente o professor valida uma etapa");
  const sc = await submissionContext(access, id);
  if (!sc.assignment.steps.some((s) => s.id === stepId)) throw new ApiError(404, "Etapa não encontrada");
  const groupId = access.role === "aluno" ? sc.group?.id ?? null : b.groupId ?? null;
  const userId = groupId ? null : access.role === "aluno" ? access.user.id : b.userId ?? null;
  const where = and(eq(schema.stepProgress.stepId, stepId), groupId ? eq(schema.stepProgress.groupId, groupId) : and(isNull(schema.stepProgress.groupId), eq(schema.stepProgress.userId, userId!)));
  const [ex] = await db.select().from(schema.stepProgress).where(where);
  if (ex) await db.update(schema.stepProgress).set({ status: b.status, note: b.note ?? ex.note, updatedBy: access.user.id, updatedAt: new Date() }).where(eq(schema.stepProgress.id, ex.id));
  else await db.insert(schema.stepProgress).values({ id: newId(), stepId, groupId, userId, status: b.status, note: b.note ?? null, updatedBy: access.user.id });
  return json({ ok: true });
});
