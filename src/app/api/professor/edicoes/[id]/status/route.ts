import { z } from "zod";
import { handle, json, parseBody } from "@/lib/api";
import { requireStaff } from "@/lib/auth/guard";
import { setEditionStatus } from "@/lib/services/admin";

export const POST = handle(async (req, ctx: { params: Promise<{ id: string }> }) => {
  const u = await requireStaff();
  const { id } = await ctx.params;
  const b = await parseBody(req, z.object({ status: z.enum(["draft", "active", "archived"]) }));
  await setEditionStatus(id, b.status, u.id);
  return json({ ok: true });
});
