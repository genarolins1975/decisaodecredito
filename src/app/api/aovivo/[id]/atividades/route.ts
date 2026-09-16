import { z } from "zod";
import { handle, json, parseBody } from "@/lib/api";
import { requireClassAccess } from "@/lib/auth/guard";
import { addActivity, getSession } from "@/lib/services/live";

const NewQuestion = z.object({
  kind: z.enum(["single", "multi", "numeric", "short_text", "credit_decision", "simulator_output", "predict"]), prompt: z.string().min(3).max(2000), label: z.string().max(120).optional(),
  options: z.record(z.string(), z.unknown()).default({}), answerKey: z.unknown().optional(), feedback: z.unknown().optional(),
});

export const POST = handle(async (req, ctx: { params: Promise<{ id: string }> }) => {
  const { id } = await ctx.params;
  const b = await parseBody(req, z.object({ questionVersionId: z.string().optional(), pageSlug: z.string().optional(), round: z.enum(["unica", "antes", "depois"]).optional(), timeLimitS: z.number().int().min(10).max(3600).nullable().optional(), maxAttempts: z.number().int().min(1).max(10).optional(), newQuestion: NewQuestion.optional() }));
  const s = await getSession(id);
  const access = await requireClassAccess(s.classId, ["professor", "monitor"]);
  const aid = await addActivity(id, b, access.edition.id, access.user.id);
  return json({ ok: true, activityId: aid }, 201);
});
