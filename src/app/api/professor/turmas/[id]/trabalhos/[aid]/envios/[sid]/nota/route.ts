import { z } from "zod";
import { handle, json, parseBody } from "@/lib/api";
import { requireClassAccess } from "@/lib/auth/guard";
import { gradeSubmission } from "@/lib/services/assignments";

export const POST = handle(async (req, ctx: { params: Promise<{ id: string; aid: string; sid: string }> }) => {
  const { id, sid } = await ctx.params;
  const access = await requireClassAccess(id, ["professor"]);
  const b = await parseBody(req, z.object({ scores: z.record(z.string(), z.number()), comments: z.string().max(10000).nullable().optional(), feedbackFileId: z.string().nullable().optional(), individualDefense: z.record(z.string(), z.object({ score: z.number(), notes: z.string().max(2000) })).optional(), status: z.enum(["corrigido", "dispensado", "nao_entregue", "zero"]).optional(), applyTo: z.array(z.string()).optional() }));
  return json({ ok: true, ...(await gradeSubmission(id, sid, b, access.user.id)) });
});
