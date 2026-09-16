import { z } from "zod";
import { handle, json, parseBody } from "@/lib/api";
import { requireClassAccess } from "@/lib/auth/guard";
import { upsertStep } from "@/lib/services/assignments";
import { fromSaoPaulo } from "@/lib/time";

export const POST = handle(async (req, ctx: { params: Promise<{ id: string; aid: string }> }) => {
  const { id, aid } = await ctx.params;
  const access = await requireClassAccess(id, ["professor"]);
  const b = await parseBody(req, z.object({ id: z.string().optional(), number: z.number().int().min(1).max(99), title: z.string().min(1).max(200), description: z.string().max(5000).nullable().optional(), pageSlug: z.string().max(20).nullable().optional(), expectedOutputs: z.array(z.string().max(300)).optional(), requiresDelivery: z.boolean().optional(), dueAt: z.string().nullable().optional() }));
  await upsertStep(id, aid, { ...b, dueAt: b.dueAt ? fromSaoPaulo(b.dueAt) : null }, access.user.id);
  return json({ ok: true });
});
