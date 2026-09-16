import { z } from "zod";
import { eq, and, gte } from "drizzle-orm";
import { handle, json, parseBody } from "@/lib/api";
import { requireClassAccess, assertWritable, ApiError } from "@/lib/auth/guard";
import { clientMeta } from "@/lib/auth/session";
import { checkin } from "@/lib/services/attendance";
import { db, schema } from "@/lib/db/client";

/** Check-in do aluno com código temporário. A janela é identificada pelo encontro ou pela sessão. */
export const POST = handle(async (req) => {
  const b = await parseBody(req, z.object({ classId: z.string(), code: z.string().min(4).max(12), meetingId: z.string().optional(), windowId: z.string().optional() }));
  const access = await requireClassAccess(b.classId, ["aluno"]);
  assertWritable(access);
  let windowId = b.windowId;
  if (!windowId && b.meetingId) {
    const [w] = await db.select().from(schema.attendanceWindows).innerJoin(schema.meetings, eq(schema.meetings.id, schema.attendanceWindows.meetingId))
      .where(and(eq(schema.attendanceWindows.meetingId, b.meetingId), eq(schema.meetings.classId, b.classId), gte(schema.attendanceWindows.closesAt, new Date())));
    windowId = w?.attendance_windows.id;
  }
  if (!windowId) throw new ApiError(400, "Nenhuma chamada aberta para este encontro", "no_window");
  const meta = await clientMeta();
  const r = await checkin(windowId, access.user.id, b.code, meta);
  return json({ ok: true, ...r });
});

/** Chamadas abertas na turma do aluno (para a tela de sessão/encontro). */
export const GET = handle(async (req) => {
  const classId = new URL(req.url).searchParams.get("classId") ?? "";
  await requireClassAccess(classId);
  const ws = await db.select({ id: schema.attendanceWindows.id, meetingId: schema.attendanceWindows.meetingId, closesAt: schema.attendanceWindows.closesAt, kind: schema.attendanceWindows.kind, title: schema.meetings.title })
    .from(schema.attendanceWindows).innerJoin(schema.meetings, eq(schema.meetings.id, schema.attendanceWindows.meetingId))
    .where(and(eq(schema.meetings.classId, classId), gte(schema.attendanceWindows.closesAt, new Date())));
  return json({ windows: ws });
});
