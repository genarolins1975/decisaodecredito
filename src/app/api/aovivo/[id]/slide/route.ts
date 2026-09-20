import { z } from "zod";
import { handle, json, parseBody } from "@/lib/api";
import { requireClassAccess } from "@/lib/auth/guard";
import { getSession, setCurrentSlide } from "@/lib/services/live";

export const POST = handle(async (req, ctx: { params: Promise<{ id: string }> }) => {
  const { id } = await ctx.params;
  const b = await parseBody(req, z.object({ slide: z.string().regex(/^\d{2}$/).nullable() }));
  const s = await getSession(id);
  await requireClassAccess(s.classId, ["professor", "monitor"]);
  await setCurrentSlide(id, b.slide);
  return json({ ok: true });
});
