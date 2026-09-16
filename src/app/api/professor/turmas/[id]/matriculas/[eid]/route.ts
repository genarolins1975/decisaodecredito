import { z } from "zod";
import { handle, json, parseBody } from "@/lib/api";
import { requireStaff } from "@/lib/auth/guard";
import { setEnrollmentStatus } from "@/lib/services/enrollment";

export const PATCH = handle(async (req, ctx: { params: Promise<{ id: string; eid: string }> }) => {
  const u = await requireStaff();
  const { id, eid } = await ctx.params;
  const b = await parseBody(req, z.object({ status: z.enum(["ativo", "suspenso", "encerrado"]), reason: z.string().min(3).max(500) }));
  await setEnrollmentStatus(id, eid, b.status, b.reason, u.id);
  return json({ ok: true });
});
