import { z } from "zod";
import { handle, json, parseBody } from "@/lib/api";
import { requireStaff } from "@/lib/auth/guard";
import { updateMeeting } from "@/lib/services/meetings";
import { fromSaoPaulo } from "@/lib/time";

export const PATCH = handle(async (req, ctx: { params: Promise<{ id: string; mid: string }> }) => {
  const u = await requireStaff();
  const { id, mid } = await ctx.params;
  const b = await parseBody(req, z.object({ title: z.string().max(160).optional(), number: z.number().int().optional(), status: z.enum(["planned", "done", "cancelled"]).optional(), scheduledAt: z.string().nullable().optional(), endsAt: z.string().nullable().optional(), location: z.string().max(200).nullable().optional(), videoUrl: z.string().url().nullable().optional(), countsForAttendance: z.boolean().optional(), preparation: z.string().max(2000).nullable().optional(), unitId: z.string().nullable().optional() }));
  const patch = { ...b, scheduledAt: b.scheduledAt === undefined ? undefined : b.scheduledAt ? fromSaoPaulo(b.scheduledAt) : null, endsAt: b.endsAt === undefined ? undefined : b.endsAt ? fromSaoPaulo(b.endsAt) : null };
  await updateMeeting(id, mid, patch, u.id);
  return json({ ok: true });
});
