import { z } from "zod";
import { handle, json, parseBody } from "@/lib/api";
import { requireClassAccess } from "@/lib/auth/guard";
import { getSession, setSessionStatus } from "@/lib/services/live";

export const POST = handle(async (req, ctx: { params: Promise<{ id: string }> }) => {
  const { id } = await ctx.params;
  const b = await parseBody(req, z.object({ status: z.enum(["open", "closed"]) }));
  const s = await getSession(id);
  const access = await requireClassAccess(s.classId, ["professor"]);
  await setSessionStatus(id, b.status, access.user.id);
  return json({ ok: true });
});
