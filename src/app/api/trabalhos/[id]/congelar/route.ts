import { z } from "zod";
import { handle, json, parseBody } from "@/lib/api";
import { requireClassAccess, assertWritable } from "@/lib/auth/guard";
import { freezeModel } from "@/lib/services/blind";

export const POST = handle(async (req, ctx: { params: Promise<{ id: string }> }) => {
  const { id } = await ctx.params;
  const b = await parseBody(req, z.object({ classId: z.string(), manifestFileId: z.string(), modelVersion: z.string().min(1).max(60), artifactHashes: z.array(z.object({ name: z.string().max(200), sha256: z.string().length(64) })).max(50).default([]), notes: z.string().max(1000).optional() }));
  const access = await requireClassAccess(b.classId, ["aluno"]);
  assertWritable(access);
  return json({ ok: true, freeze: await freezeModel(access, id, b) }, 201);
});
