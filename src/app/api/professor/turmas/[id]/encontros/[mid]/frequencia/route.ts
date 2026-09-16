import { z } from "zod";
import { handle, json, parseBody } from "@/lib/api";
import { requireStaff } from "@/lib/auth/guard";
import { decide } from "@/lib/services/attendance";

/** Decisão docente sobre a frequência de um aluno no encontro (exige motivo). */
export const POST = handle(async (req, ctx: { params: Promise<{ id: string; mid: string }> }) => {
  const u = await requireStaff();
  const { id, mid } = await ctx.params;
  const b = await parseBody(req, z.object({ userId: z.string(), status: z.enum(["presente", "ausente", "atrasado", "justificado", "pendente"]), reason: z.string().min(3).max(500) }));
  await decide(mid, id, b.userId, b.status, b.reason, u.id);
  return json({ ok: true });
});
