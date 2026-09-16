import { z } from "zod";
import { handle, json, parseBody } from "@/lib/api";
import { requireStaff } from "@/lib/auth/guard";
import { createQuestionVersion } from "@/lib/services/content-admin";

export const POST = handle(async (req, ctx: { params: Promise<{ qid: string }> }) => {
  const u = await requireStaff(); const { qid } = await ctx.params;
  const b = await parseBody(req, z.object({ label: z.string().max(120).nullable().optional(), prompt: z.string().min(3).max(4000), options: z.record(z.string(), z.unknown()), answerKey: z.unknown().optional(), feedback: z.unknown().optional() }));
  return json({ ok: true, versionId: await createQuestionVersion(qid, b, u.id) }, 201);
});
