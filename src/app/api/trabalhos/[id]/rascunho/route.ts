import { z } from "zod";
import { handle, json, parseBody } from "@/lib/api";
import { requireClassAccess, assertWritable } from "@/lib/auth/guard";
import { submissionContext, getOrCreateDraft } from "@/lib/services/assignments";

export const POST = handle(async (req, ctx: { params: Promise<{ id: string }> }) => {
  const { id } = await ctx.params;
  const b = await parseBody(req, z.object({ classId: z.string() }));
  const access = await requireClassAccess(b.classId, ["aluno"]);
  assertWritable(access);
  const sc = await submissionContext(access, id);
  return json({ submission: await getOrCreateDraft(sc) }, 201);
});
