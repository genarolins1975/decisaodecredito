import { z } from "zod";
import { handle, json, parseBody } from "@/lib/api";
import { requireStaff } from "@/lib/auth/guard";
import { createPageVersion } from "@/lib/services/content-admin";
import type { Block } from "@/lib/services/content";

const BlockSchema = z.union([
  z.object({ type: z.literal("html"), html: z.string().max(400000) }),
  z.object({ type: z.literal("question"), slug: z.string() }),
  z.object({ type: z.literal("episode"), number: z.number(), challenge: z.string(), text: z.string(), steps: z.array(z.object({ title: z.string(), detail: z.string() })), missions: z.number().optional() }),
  z.object({ type: z.literal("checkpoint"), count: z.string(), intro: z.string(), items: z.array(z.object({ title: z.string(), question: z.string(), answer: z.string() })) }),
  z.object({ type: z.literal("legacy"), slug: z.string(), controls: z.number(), fallbackHtml: z.string(), note: z.string() }),
]);

export const POST = handle(async (req, ctx: { params: Promise<{ pid: string }> }) => {
  const u = await requireStaff(); const { pid } = await ctx.params;
  const b = await parseBody(req, z.object({ title: z.string().min(1).max(300), objective: z.string().max(2000).nullable().optional(), support: z.string().max(4000).nullable().optional(), connection: z.string().max(1000).nullable().optional(), blocks: z.array(BlockSchema).max(60), teacherGuide: z.record(z.string(), z.unknown()).nullable().optional(), changeNote: z.string().max(500).optional(), publish: z.boolean().default(false) }));
  return json({ ok: true, ...(await createPageVersion(pid, { ...b, blocks: b.blocks as Block[] }, u.id)) }, 201);
});
