import { z } from "zod";
import { handle, json, parseBody } from "@/lib/api";
import { requireClassAccess, assertWritable } from "@/lib/auth/guard";
import { submissionContext, attachFile, detachFile } from "@/lib/services/assignments";

export const POST = handle(async (req, ctx: { params: Promise<{ id: string; sid: string }> }) => {
  const { id, sid } = await ctx.params;
  const b = await parseBody(req, z.object({ classId: z.string(), fileId: z.string() }));
  const access = await requireClassAccess(b.classId, ["aluno"]);
  assertWritable(access);
  await attachFile(await submissionContext(access, id), sid, b.fileId);
  return json({ ok: true });
});
export const DELETE = handle(async (req, ctx: { params: Promise<{ id: string; sid: string }> }) => {
  const { id, sid } = await ctx.params;
  const b = await parseBody(req, z.object({ classId: z.string(), fileId: z.string() }));
  const access = await requireClassAccess(b.classId, ["aluno"]);
  await detachFile(await submissionContext(access, id), sid, b.fileId);
  return json({ ok: true });
});
