import { handle, json } from "@/lib/api";
import { requireClassAccess } from "@/lib/auth/guard";
import { getSession } from "@/lib/services/live";
import { activeWindows, currentCode } from "@/lib/services/attendance";

/** Código atual da chamada (só professor/monitor) para projeção e QR. */
export const GET = handle(async (_req, ctx: { params: Promise<{ id: string }> }) => {
  const { id } = await ctx.params;
  const s = await getSession(id);
  await requireClassAccess(s.classId, ["professor", "monitor"]);
  const ws = await activeWindows(s.meetingId);
  return json({ windows: ws.map((w) => ({ id: w.id, kind: w.kind, closesAt: w.closesAt, lateAfter: w.lateAfter, ...currentCode(w) })) });
});
