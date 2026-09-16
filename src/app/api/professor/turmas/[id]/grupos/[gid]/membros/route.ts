import { z } from "zod";
import { handle, json, parseBody } from "@/lib/api";
import { requireClassAccess } from "@/lib/auth/guard";
import { setGroupMember, setGroupDataset } from "@/lib/services/assignments";

export const POST = handle(async (req, ctx: { params: Promise<{ id: string; gid: string }> }) => {
  const { id, gid } = await ctx.params;
  const access = await requireClassAccess(id, ["professor"]);
  const b = await parseBody(req, z.object({ userId: z.string().optional(), action: z.enum(["add", "remove"]).optional(), datasetId: z.string().nullable().optional() }));
  if (b.userId && b.action) await setGroupMember(id, gid, b.userId, b.action, access.user.id);
  if (b.datasetId !== undefined) await setGroupDataset(id, gid, b.datasetId, access.user.id);
  return json({ ok: true });
});
