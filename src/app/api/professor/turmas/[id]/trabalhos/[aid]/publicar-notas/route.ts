import { z } from "zod";
import { handle, json, parseBody } from "@/lib/api";
import { requireClassAccess } from "@/lib/auth/guard";
import { publishGrades } from "@/lib/services/assignments";

export const POST = handle(async (req, ctx: { params: Promise<{ id: string; aid: string }> }) => {
  const { id, aid } = await ctx.params;
  const access = await requireClassAccess(id, ["professor"]);
  const b = await parseBody(req, z.object({ userIds: z.array(z.string()).nullable().optional() }));
  return json({ ok: true, published: await publishGrades(id, aid, b.userIds ?? null, access.user.id) });
});
