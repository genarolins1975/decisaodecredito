import { z } from "zod";
import { handle, json, parseBody } from "@/lib/api";
import { requireClassAccess } from "@/lib/auth/guard";
import { returnForRevision } from "@/lib/services/assignments";

export const POST = handle(async (req, ctx: { params: Promise<{ id: string; aid: string; sid: string }> }) => {
  const { id, sid } = await ctx.params;
  const access = await requireClassAccess(id, ["professor"]);
  const b = await parseBody(req, z.object({ reason: z.string().min(3).max(2000) }));
  await returnForRevision(id, sid, b.reason, access.user.id);
  return json({ ok: true });
});
