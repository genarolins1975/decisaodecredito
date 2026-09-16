import { z } from "zod";
import { handle, json, parseBody } from "@/lib/api";
import { requireClassAccess } from "@/lib/auth/guard";
import { upsertBlindConfig } from "@/lib/services/blind";

export const PATCH = handle(async (req, ctx: { params: Promise<{ id: string; aid: string }> }) => {
  const { id, aid } = await ctx.params;
  const access = await requireClassAccess(id, ["professor"]);
  const b = await parseBody(req, z.object({ ootFileId: z.string().nullable().optional(), labelsFileId: z.string().nullable().optional(), datasetId: z.string().nullable().optional(), releasePolicy: z.enum(["apos_congelamento", "livre"]).optional(), maxSubmissions: z.number().int().min(1).max(10).optional(), feedbackLevel: z.enum(["recibo", "agregado", "completo"]).optional(), expectedIds: z.number().int().nullable().optional() }));
  await upsertBlindConfig(id, aid, b, access.user.id);
  return json({ ok: true });
});
