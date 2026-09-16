import { z } from "zod";
import { handle, json, parseBody } from "@/lib/api";
import { requireStaff } from "@/lib/auth/guard";
import { addEnrollments, listEnrollmentsWithInvites } from "@/lib/services/enrollment";

export const GET = handle(async (_req, ctx: { params: Promise<{ id: string }> }) => {
  await requireStaff();
  const { id } = await ctx.params;
  return json({ enrollments: await listEnrollmentsWithInvites(id) });
});
export const POST = handle(async (req, ctx: { params: Promise<{ id: string }> }) => {
  const u = await requireStaff();
  const { id } = await ctx.params;
  const b = await parseBody(req, z.object({ people: z.array(z.object({ name: z.string().min(1).max(120), email: z.string().min(3).max(254), role: z.enum(["aluno", "monitor"]).optional() })).min(1).max(500) }));
  return json(await addEnrollments(id, b.people, u.id), 201);
});
