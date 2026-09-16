import { z } from "zod";
import { handle, json, parseBody } from "@/lib/api";
import { requireClassAccess, assertWritable } from "@/lib/auth/guard";
import { submissionContext, updateDraft } from "@/lib/services/assignments";

export const PATCH = handle(async (req, ctx: { params: Promise<{ id: string; sid: string }> }) => {
  const { id, sid } = await ctx.params;
  const b = await parseBody(req, z.object({ classId: z.string(), links: z.array(z.string().url().max(500)).max(20).optional(), note: z.string().max(2000).nullable().optional() }));
  const access = await requireClassAccess(b.classId, ["aluno"]);
  assertWritable(access);
  await updateDraft(await submissionContext(access, id), sid, { links: b.links, note: b.note });
  return json({ ok: true });
});
