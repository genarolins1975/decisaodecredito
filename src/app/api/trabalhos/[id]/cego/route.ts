import { z } from "zod";
import { handle, json, parseBody } from "@/lib/api";
import { requireClassAccess, assertWritable } from "@/lib/auth/guard";
import { submitBlind } from "@/lib/services/blind";

export const POST = handle(async (req, ctx: { params: Promise<{ id: string }> }) => {
  const { id } = await ctx.params;
  const b = await parseBody(req, z.object({ classId: z.string(), fileId: z.string() }));
  const access = await requireClassAccess(b.classId, ["aluno"]);
  assertWritable(access);
  return json({ ok: true, feedback: await submitBlind(access, id, b.fileId) }, 201);
});
