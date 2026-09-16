import { z } from "zod";
import { handle, json, parseBody } from "@/lib/api";
import { requireStaff } from "@/lib/auth/guard";
import { createUnit } from "@/lib/services/content-admin";

export const POST = handle(async (req, ctx: { params: Promise<{ eid: string }> }) => {
  const u = await requireStaff(); const { eid } = await ctx.params;
  const b = await parseBody(req, z.object({ kind: z.enum(["aula", "trabalho"]), title: z.string().min(1).max(200), deliverable: z.string().max(400).nullable().optional() }));
  return json({ ok: true, unitId: await createUnit(eid, b.kind, b.title, b.deliverable ?? null, u.id) }, 201);
});
