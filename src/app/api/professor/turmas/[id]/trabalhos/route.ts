import { z } from "zod";
import { handle, json, parseBody } from "@/lib/api";
import { requireClassAccess } from "@/lib/auth/guard";
import { createAssignment, listAssignments } from "@/lib/services/assignments";

export const GET = handle(async (_req, ctx: { params: Promise<{ id: string }> }) => { const { id } = await ctx.params; await requireClassAccess(id, ["professor", "monitor"]); return json({ assignments: await listAssignments(id, true) }); });
export const POST = handle(async (req, ctx: { params: Promise<{ id: string }> }) => {
  const { id } = await ctx.params;
  const access = await requireClassAccess(id, ["professor"]);
  const b = await parseBody(req, z.object({ title: z.string().min(3).max(200), slug: z.string().regex(/^[a-z0-9\-]{3,60}$/), unitId: z.string().nullable().optional(), mode: z.enum(["individual", "grupo"]).optional() }));
  return json({ ok: true, id: await createAssignment(id, b, access.user.id) }, 201);
});
