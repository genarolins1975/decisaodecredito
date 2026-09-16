import { z } from "zod";
import { handle, json, parseBody } from "@/lib/api";
import { requireStaff } from "@/lib/auth/guard";
import { activeWindows, currentCode, openWindow } from "@/lib/services/attendance";

export const POST = handle(async (req, ctx: { params: Promise<{ id: string; mid: string }> }) => {
  const u = await requireStaff();
  const { id, mid } = await ctx.params;
  const b = await parseBody(req, z.object({ minutes: z.number().int().min(1).max(240), lateAfterMinutes: z.number().int().min(0).max(240).nullable().optional(), rotationSeconds: z.number().int().min(20).max(600).optional(), kind: z.enum(["checkin", "checkout", "confirmacao"]).optional(), maxAttempts: z.number().int().min(1).max(50).optional() }));
  const wid = await openWindow(mid, id, b, u.id);
  return json({ ok: true, windowId: wid }, 201);
});
export const GET = handle(async (_req, ctx: { params: Promise<{ id: string; mid: string }> }) => {
  await requireStaff();
  const { mid } = await ctx.params;
  const ws = await activeWindows(mid);
  return json({ windows: ws.map((w) => ({ id: w.id, kind: w.kind, opensAt: w.opensAt, closesAt: w.closesAt, lateAfter: w.lateAfter, rotationSeconds: w.rotationSeconds, ...currentCode(w) })) });
});
