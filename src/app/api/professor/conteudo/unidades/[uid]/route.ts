import { z } from "zod";
import { handle, json, parseBody } from "@/lib/api";
import { requireStaff } from "@/lib/auth/guard";
import { setUnitStatus } from "@/lib/services/content-admin";

export const PATCH = handle(async (req, ctx: { params: Promise<{ uid: string }> }) => {
  const u = await requireStaff(); const { uid } = await ctx.params;
  const b = await parseBody(req, z.object({ status: z.enum(["draft", "published", "archived"]) }));
  await setUnitStatus(uid, b.status, u.id);
  return json({ ok: true });
});
