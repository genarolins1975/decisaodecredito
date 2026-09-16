import { z } from "zod";
import { handle, json, parseBody } from "@/lib/api";
import { requireClassAccess } from "@/lib/auth/guard";
import { getAssignment, updateAssignment, listSubmissionsForTeacher } from "@/lib/services/assignments";
import { listBlindForTeacher } from "@/lib/services/blind";
import { fromSaoPaulo } from "@/lib/time";

export const GET = handle(async (_req, ctx: { params: Promise<{ id: string; aid: string }> }) => {
  const { id, aid } = await ctx.params;
  await requireClassAccess(id, ["professor", "monitor"]);
  const a = await getAssignment(id, aid, true);
  const subs = await listSubmissionsForTeacher(id, aid);
  const blind = await listBlindForTeacher(aid);
  return json({ assignment: a, ...subs, blind });
});
export const PATCH = handle(async (req, ctx: { params: Promise<{ id: string; aid: string }> }) => {
  const { id, aid } = await ctx.params;
  const access = await requireClassAccess(id, ["professor"]);
  const b = await parseBody(req, z.object({
    title: z.string().min(3).max(200).optional(), description: z.string().max(20000).optional(), objectives: z.string().max(5000).nullable().optional(), prerequisites: z.string().max(5000).nullable().optional(), materials: z.string().max(5000).nullable().optional(),
    deliverables: z.array(z.string().max(300)).max(20).optional(), allowedFormats: z.array(z.enum(["pdf", "zip", "csv", "ipynb", "md", "txt", "py", "json", "link"])).optional(), maxFileMb: z.number().int().min(1).max(500).optional(),
    mode: z.enum(["individual", "grupo"]).optional(), dueAt: z.string().nullable().optional(), latePolicy: z.object({ acceptLate: z.boolean(), penaltyPerDayPct: z.number().min(0).max(100), hardDeadlineAt: z.string().nullable().optional(), startedBeforeDeadlineCounts: z.boolean(), graceMinutes: z.number().int().min(0).max(240).optional() }).optional(),
    rubricVersionId: z.string().nullable().optional(), weight: z.number().min(0).max(100).nullable().optional(), status: z.enum(["draft", "published", "closed"]).optional(), unitId: z.string().nullable().optional(), blindTestEnabled: z.boolean().optional(),
  }));
  const patch = { ...b, dueAt: b.dueAt === undefined ? undefined : b.dueAt ? fromSaoPaulo(b.dueAt) : null, weight: b.weight === undefined ? undefined : b.weight === null ? null : String(b.weight),
    latePolicy: b.latePolicy ? { ...b.latePolicy, hardDeadlineAt: b.latePolicy.hardDeadlineAt ? fromSaoPaulo(b.latePolicy.hardDeadlineAt).toISOString() : null } : undefined };
  await updateAssignment(id, aid, patch as never, access.user.id);
  return json({ ok: true });
});
