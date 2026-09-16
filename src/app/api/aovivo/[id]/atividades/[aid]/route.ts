import { z } from "zod";
import { handle, json, parseBody } from "@/lib/api";
import { requireClassAccess } from "@/lib/auth/guard";
import { getSession, setActivityStatus } from "@/lib/services/live";

export const PATCH = handle(async (req, ctx: { params: Promise<{ id: string; aid: string }> }) => {
  const { id, aid } = await ctx.params;
  const b = await parseBody(req, z.object({ status: z.enum(["open", "closed", "released"]), timeLimitS: z.number().int().min(10).max(3600).nullable().optional(), maxAttempts: z.number().int().min(1).max(10).optional() }));
  const s = await getSession(id);
  const access = await requireClassAccess(s.classId, ["professor", "monitor"]);
  await setActivityStatus(id, aid, b.status, access.user.id, { timeLimitS: b.timeLimitS, maxAttempts: b.maxAttempts });
  return json({ ok: true });
});
