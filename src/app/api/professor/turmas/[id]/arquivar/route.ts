import { z } from "zod";
import { handle, json, parseBody } from "@/lib/api";
import { requireStaff } from "@/lib/auth/guard";
import { archiveClass } from "@/lib/services/admin";

export const POST = handle(async (req, ctx: { params: Promise<{ id: string }> }) => {
  const u = await requireStaff();
  const { id } = await ctx.params;
  const b = await parseBody(req, z.object({ policy: z.enum(["read_only", "closed"]).default("read_only") }));
  await archiveClass(id, b.policy, u.id);
  return json({ ok: true });
});
