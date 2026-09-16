import { z } from "zod";
import { handle, json, parseBody } from "@/lib/api";
import { requireStaff } from "@/lib/auth/guard";
import { publishVersion } from "@/lib/services/content-admin";

export const POST = handle(async (req, ctx: { params: Promise<{ pid: string }> }) => {
  const u = await requireStaff(); const { pid } = await ctx.params;
  const b = await parseBody(req, z.object({ versionId: z.string() }));
  await publishVersion(pid, b.versionId, u.id);
  return json({ ok: true });
});
