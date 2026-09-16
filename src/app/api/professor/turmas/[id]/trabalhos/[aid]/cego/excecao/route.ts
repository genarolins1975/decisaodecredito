import { z } from "zod";
import { handle, json, parseBody } from "@/lib/api";
import { requireClassAccess } from "@/lib/auth/guard";
import { teacherFreezeException } from "@/lib/services/blind";

export const POST = handle(async (req, ctx: { params: Promise<{ id: string; aid: string }> }) => {
  const { id, aid } = await ctx.params;
  const access = await requireClassAccess(id, ["professor"]);
  const b = await parseBody(req, z.object({ groupId: z.string().optional(), userId: z.string().optional(), reason: z.string().min(5).max(500) }));
  await teacherFreezeException(id, aid, b, b.reason, access.user.id);
  return json({ ok: true });
});
