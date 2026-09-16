import { z } from "zod";
import { handle, json, parseBody } from "@/lib/api";
import { requireClassAccess } from "@/lib/auth/guard";
import { getSession, setCurrentPage } from "@/lib/services/live";

export const POST = handle(async (req, ctx: { params: Promise<{ id: string }> }) => {
  const { id } = await ctx.params;
  const b = await parseBody(req, z.object({ pageSlug: z.string().regex(/^[a-z0-9]+$/) }));
  const s = await getSession(id);
  const access = await requireClassAccess(s.classId, ["professor", "monitor"]);
  await setCurrentPage(id, b.pageSlug, access.edition.id);
  return json({ ok: true });
});
