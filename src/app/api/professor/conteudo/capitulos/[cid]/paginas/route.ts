import { z } from "zod";
import { handle, json, parseBody } from "@/lib/api";
import { requireStaff } from "@/lib/auth/guard";
import { createPage } from "@/lib/services/content-admin";

export const POST = handle(async (req, ctx: { params: Promise<{ cid: string }> }) => {
  const u = await requireStaff(); const { cid } = await ctx.params;
  const b = await parseBody(req, z.object({ slug: z.string(), title: z.string().min(1).max(300) }));
  return json({ ok: true, pageId: await createPage(cid, b.slug, b.title, u.id) }, 201);
});
