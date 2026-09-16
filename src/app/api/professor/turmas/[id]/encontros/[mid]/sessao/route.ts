import { handle, json } from "@/lib/api";
import { requireStaff } from "@/lib/auth/guard";
import { createSession } from "@/lib/services/live";

export const POST = handle(async (_req, ctx: { params: Promise<{ id: string; mid: string }> }) => {
  const u = await requireStaff();
  const { id, mid } = await ctx.params;
  const sid = await createSession(mid, id, u.id);
  return json({ ok: true, sessionId: sid }, 201);
});
