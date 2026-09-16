import { z } from "zod";
import { handle, json, parseBody } from "@/lib/api";
import { requireStaff } from "@/lib/auth/guard";
import { createChapter } from "@/lib/services/content-admin";

export const POST = handle(async (req, ctx: { params: Promise<{ uid: string }> }) => {
  const u = await requireStaff(); const { uid } = await ctx.params;
  const b = await parseBody(req, z.object({ slug: z.string().regex(/^[a-z0-9\-]{1,20}$/), title: z.string().min(1).max(200) }));
  return json({ ok: true, chapterId: await createChapter(uid, b.slug, b.title, u.id) }, 201);
});
