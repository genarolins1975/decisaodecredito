import { z } from "zod";
import { handle, json, parseBody } from "@/lib/api";
import { requireStaff } from "@/lib/auth/guard";
import { updateClassConfig } from "@/lib/services/admin";

const AttendanceRule = z.object({
  minimumPct: z.number().min(0).max(100).nullable().optional(),
  lateCountsAs: z.enum(["presente", "ausente", "meia"]).optional(),
  justifiedCountsAs: z.enum(["presente", "ausente", "excluido"]).optional(),
  lateToleranceMin: z.number().int().min(0).max(180).optional(),
});

export const PATCH = handle(async (req, ctx: { params: Promise<{ id: string }> }) => {
  const u = await requireStaff();
  const { id } = await ctx.params;
  const b = await parseBody(req, z.object({ attendance: AttendanceRule.optional(), gradeWeights: z.record(z.string(), z.number()).optional(), videoUrl: z.string().url().nullable().optional() }));
  return json({ config: await updateClassConfig(id, b, u.id) });
});
