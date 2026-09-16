import { handle, json } from "@/lib/api";
import { requireStaff } from "@/lib/auth/guard";
import { closeWindow } from "@/lib/services/attendance";

export const DELETE = handle(async (_req, ctx: { params: Promise<{ id: string; wid: string }> }) => {
  const u = await requireStaff();
  const { wid } = await ctx.params;
  await closeWindow(wid, u.id);
  return json({ ok: true });
});
