import { z } from "zod";
import { handle, json, parseBody } from "@/lib/api";
import { requireStaff } from "@/lib/auth/guard";
import { createMeeting, listMeetings, scaffoldMeetings } from "@/lib/services/meetings";
import { fromSaoPaulo } from "@/lib/time";
import { requireClassAccess } from "@/lib/auth/guard";

export const GET = handle(async (_req, ctx: { params: Promise<{ id: string }> }) => { await requireStaff(); const { id } = await ctx.params; return json({ meetings: await listMeetings(id) }); });

export const POST = handle(async (req, ctx: { params: Promise<{ id: string }> }) => {
  const u = await requireStaff();
  const { id } = await ctx.params;
  const b = await parseBody(req, z.object({ scaffold: z.boolean().optional(), title: z.string().max(160).optional(), number: z.number().int().optional(), unitId: z.string().nullable().optional(), scheduledAt: z.string().nullable().optional(), endsAt: z.string().nullable().optional(), location: z.string().max(200).nullable().optional(), videoUrl: z.string().url().nullable().optional(), countsForAttendance: z.boolean().optional(), preparation: z.string().max(2000).nullable().optional(), replacementOfId: z.string().nullable().optional() }));
  if (b.scaffold) { const access = await requireClassAccess(id, ["professor"]); const n = await scaffoldMeetings(id, access.edition.id, u.id); return json({ ok: true, created: n }); }
  if (!b.title) return json({ error: "Informe o título" }, 400);
  const mid = await createMeeting(id, { ...b, title: b.title, scheduledAt: b.scheduledAt ? fromSaoPaulo(b.scheduledAt) : null, endsAt: b.endsAt ? fromSaoPaulo(b.endsAt) : null }, u.id);
  return json({ ok: true, meetingId: mid }, 201);
});
