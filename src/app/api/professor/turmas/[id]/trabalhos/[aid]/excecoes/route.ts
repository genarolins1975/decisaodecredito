import { z } from "zod";
import { handle, json, parseBody } from "@/lib/api";
import { requireClassAccess } from "@/lib/auth/guard";
import { addExtension } from "@/lib/services/assignments";
import { fromSaoPaulo } from "@/lib/time";

export const POST = handle(async (req, ctx: { params: Promise<{ id: string; aid: string }> }) => {
  const { id, aid } = await ctx.params;
  const access = await requireClassAccess(id, ["professor"]);
  const b = await parseBody(req, z.object({ userId: z.string().optional(), groupId: z.string().optional(), dueAt: z.string(), reason: z.string().min(3).max(500) }));
  await addExtension(id, aid, { userId: b.userId, groupId: b.groupId }, fromSaoPaulo(b.dueAt), b.reason, access.user.id);
  return json({ ok: true });
});
