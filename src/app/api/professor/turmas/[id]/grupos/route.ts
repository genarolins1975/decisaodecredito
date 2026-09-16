import { z } from "zod";
import { handle, json, parseBody } from "@/lib/api";
import { requireClassAccess } from "@/lib/auth/guard";
import { createGroup, listGroups } from "@/lib/services/assignments";

export const GET = handle(async (_req, ctx: { params: Promise<{ id: string }> }) => { const { id } = await ctx.params; await requireClassAccess(id, ["professor", "monitor"]); return json({ groups: await listGroups(id) }); });
export const POST = handle(async (req, ctx: { params: Promise<{ id: string }> }) => {
  const { id } = await ctx.params;
  const access = await requireClassAccess(id, ["professor"]);
  const b = await parseBody(req, z.object({ name: z.string().min(1).max(80), datasetId: z.string().nullable().optional() }));
  return json({ ok: true, id: await createGroup(id, b.name, b.datasetId ?? null, access.user.id) }, 201);
});
