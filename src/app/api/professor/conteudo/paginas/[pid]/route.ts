import { z } from "zod";
import { handle, json, parseBody } from "@/lib/api";
import { requireStaff } from "@/lib/auth/guard";
import { pageForEditor, updatePageMeta } from "@/lib/services/content-admin";

export const GET = handle(async (_req, ctx: { params: Promise<{ pid: string }> }) => { await requireStaff(); const { pid } = await ctx.params; return json(await pageForEditor(pid)); });
export const PATCH = handle(async (req, ctx: { params: Promise<{ pid: string }> }) => {
  const u = await requireStaff(); const { pid } = await ctx.params;
  const b = await parseBody(req, z.object({ level: z.enum(["essencial", "complementar"]).optional(), level120: z.enum(["essencial", "assincrono"]).nullable().optional(), minutes: z.number().int().min(0).max(120).optional(), status: z.enum(["draft", "published"]).optional(), position: z.number().int().optional() }));
  await updatePageMeta(pid, b, u.id);
  return json({ ok: true });
});
