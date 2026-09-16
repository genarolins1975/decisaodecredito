import "server-only";
import { and, asc, eq, gte, inArray, sql } from "drizzle-orm";
import { createHmac } from "node:crypto";
import { db, schema } from "@/lib/db/client";
import { newId } from "@/lib/ids";
import { randomToken } from "@/lib/crypto";
import { ApiError } from "@/lib/auth/guard";
import { audit } from "@/lib/audit";

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

/** Código rotativo derivado do segredo da janela e do intervalo de tempo. Nunca expõe o segredo. */
export function codeForSlot(secret: string, slot: number) {
  const h = createHmac("sha256", secret).update(String(slot)).digest();
  let out = "";
  for (let i = 0; i < 6; i++) out += ALPHABET[h[i] % ALPHABET.length];
  return out;
}
export function currentCode(w: { codeSecret: string; rotationSeconds: number }, now = new Date()) {
  const slot = Math.floor(now.getTime() / 1000 / w.rotationSeconds);
  return { code: codeForSlot(w.codeSecret, slot), secondsLeft: w.rotationSeconds - (Math.floor(now.getTime() / 1000) % w.rotationSeconds) };
}
function codeMatches(w: { codeSecret: string; rotationSeconds: number }, code: string, now = new Date()) {
  const slot = Math.floor(now.getTime() / 1000 / w.rotationSeconds);
  const c = code.trim().toUpperCase();
  return c === codeForSlot(w.codeSecret, slot) || c === codeForSlot(w.codeSecret, slot - 1);
}

export async function openWindow(meetingId: string, classId: string, input: { minutes: number; lateAfterMinutes?: number | null; rotationSeconds?: number; kind?: string; maxAttempts?: number }, actorId: string) {
  const [m] = await db.select().from(schema.meetings).where(and(eq(schema.meetings.id, meetingId), eq(schema.meetings.classId, classId)));
  if (!m) throw new ApiError(404, "Encontro não encontrado");
  if (m.status === "cancelled") throw new ApiError(400, "Encontro cancelado");
  const now = new Date();
  const id = newId();
  await db.insert(schema.attendanceWindows).values({
    id, meetingId, kind: input.kind ?? "checkin", opensAt: now, closesAt: new Date(now.getTime() + input.minutes * 60e3),
    lateAfter: input.lateAfterMinutes ? new Date(now.getTime() + input.lateAfterMinutes * 60e3) : null,
    codeSecret: randomToken(24), rotationSeconds: input.rotationSeconds ?? 60, maxAttempts: input.maxAttempts ?? 10, createdBy: actorId,
  });
  await audit({ actorUserId: actorId, action: "attendance.window.open", entity: "attendance_window", entityId: id, classId, details: { meetingId, minutes: input.minutes } });
  return id;
}

export async function closeWindow(windowId: string, actorId: string) {
  await db.update(schema.attendanceWindows).set({ closesAt: new Date() }).where(eq(schema.attendanceWindows.id, windowId));
  await audit({ actorUserId: actorId, action: "attendance.window.close", entity: "attendance_window", entityId: windowId });
}

export async function activeWindows(meetingId: string) {
  return db.select().from(schema.attendanceWindows).where(and(eq(schema.attendanceWindows.meetingId, meetingId), gte(schema.attendanceWindows.closesAt, new Date()))).orderBy(asc(schema.attendanceWindows.opensAt));
}

/** Check-in do aluno: matrícula, janela, tentativas e código validados no servidor; evidência e decisão registradas separadamente. */
export async function checkin(windowId: string, userId: string, code: string, meta: { ipHash: string | null; userAgent: string }) {
  const [w] = await db.select({ w: schema.attendanceWindows, m: schema.meetings }).from(schema.attendanceWindows).innerJoin(schema.meetings, eq(schema.meetings.id, schema.attendanceWindows.meetingId)).where(eq(schema.attendanceWindows.id, windowId));
  if (!w) throw new ApiError(404, "Chamada não encontrada");
  const [enr] = await db.select().from(schema.enrollments).where(and(eq(schema.enrollments.classId, w.m.classId), eq(schema.enrollments.userId, userId), eq(schema.enrollments.status, "ativo")));
  if (!enr) throw new ApiError(403, "Sem matrícula ativa nesta turma");
  const now = new Date();
  const reject = async (reason: string) => {
    await db.insert(schema.attendanceCheckins).values({ id: newId(), windowId, userId, codeUsed: code.slice(0, 12), result: "rejected", reason, serverTime: now, ipHash: meta.ipHash, userAgent: meta.userAgent });
    throw new ApiError(400, reason, "checkin_rejected");
  };
  if (now < w.w.opensAt || now > w.w.closesAt) await reject("Chamada fechada");
  const tries = await db.select({ n: sql<number>`count(*)` }).from(schema.attendanceCheckins).where(and(eq(schema.attendanceCheckins.windowId, windowId), eq(schema.attendanceCheckins.userId, userId), eq(schema.attendanceCheckins.result, "rejected")));
  if (Number(tries[0]?.n ?? 0) >= w.w.maxAttempts) throw new ApiError(429, "Limite de tentativas atingido. Peça validação ao professor.", "max_attempts");
  if (!codeMatches(w.w, code, now)) await reject("Código inválido ou expirado");
  await db.insert(schema.attendanceCheckins).values({ id: newId(), windowId, userId, codeUsed: code.slice(0, 12), result: "ok", serverTime: now, ipHash: meta.ipHash, userAgent: meta.userAgent });
  const status = w.w.lateAfter && now > w.w.lateAfter ? "atrasado" : "presente";
  const [existing] = await db.select().from(schema.attendanceRecords).where(and(eq(schema.attendanceRecords.meetingId, w.m.id), eq(schema.attendanceRecords.userId, userId)));
  if (!existing) {
    const id = newId();
    await db.insert(schema.attendanceRecords).values({ id, meetingId: w.m.id, userId, status, source: "checkin", decidedAt: now });
    await db.insert(schema.attendanceHistory).values({ id: newId(), recordId: id, fromStatus: null, toStatus: status, reason: `check-in válido (${w.w.kind})`, changedBy: userId });
  } else if (existing.source === "checkin" && existing.status === "ausente") {
    await db.update(schema.attendanceRecords).set({ status, decidedAt: now }).where(eq(schema.attendanceRecords.id, existing.id));
    await db.insert(schema.attendanceHistory).values({ id: newId(), recordId: existing.id, fromStatus: existing.status, toStatus: status, reason: "check-in válido", changedBy: userId });
  }
  return { status, serverTime: now };
}

/** Decisão docente: exige motivo e deixa trilha. */
export async function decide(meetingId: string, classId: string, userId: string, status: "presente" | "ausente" | "atrasado" | "justificado" | "pendente", reason: string, actorId: string) {
  const [m] = await db.select().from(schema.meetings).where(and(eq(schema.meetings.id, meetingId), eq(schema.meetings.classId, classId)));
  if (!m) throw new ApiError(404, "Encontro não encontrado");
  if (!reason || reason.trim().length < 3) throw new ApiError(400, "Informe o motivo da correção");
  const [existing] = await db.select().from(schema.attendanceRecords).where(and(eq(schema.attendanceRecords.meetingId, meetingId), eq(schema.attendanceRecords.userId, userId)));
  const now = new Date();
  if (existing) {
    await db.update(schema.attendanceRecords).set({ status, source: "manual", reason, decidedBy: actorId, decidedAt: now, reviewRequested: null }).where(eq(schema.attendanceRecords.id, existing.id));
    await db.insert(schema.attendanceHistory).values({ id: newId(), recordId: existing.id, fromStatus: existing.status, toStatus: status, reason, changedBy: actorId });
  } else {
    const id = newId();
    await db.insert(schema.attendanceRecords).values({ id, meetingId, userId, status, source: "manual", reason, decidedBy: actorId, decidedAt: now });
    await db.insert(schema.attendanceHistory).values({ id: newId(), recordId: id, fromStatus: null, toStatus: status, reason, changedBy: actorId });
  }
  await audit({ actorUserId: actorId, action: "attendance.decide", entity: "attendance_record", entityId: `${meetingId}:${userId}`, classId, details: { status, reason } });
}

export async function requestReview(meetingId: string, userId: string, text: string) {
  const [existing] = await db.select().from(schema.attendanceRecords).where(and(eq(schema.attendanceRecords.meetingId, meetingId), eq(schema.attendanceRecords.userId, userId)));
  if (existing) await db.update(schema.attendanceRecords).set({ reviewRequested: text.slice(0, 1000), reviewRequestedAt: new Date() }).where(eq(schema.attendanceRecords.id, existing.id));
  else {
    const id = newId();
    await db.insert(schema.attendanceRecords).values({ id, meetingId, userId, status: "pendente", source: "manual", reason: "solicitação de revisão do aluno", reviewRequested: text.slice(0, 1000), reviewRequestedAt: new Date() });
    await db.insert(schema.attendanceHistory).values({ id: newId(), recordId: id, fromStatus: null, toStatus: "pendente", reason: "solicitação de revisão do aluno", changedBy: userId });
  }
}

export type AttendanceRule = { minimumPct?: number | null; lateCountsAs?: "presente" | "ausente" | "meia"; justifiedCountsAs?: "presente" | "ausente" | "excluido"; lateToleranceMin?: number };

/** Mapa de frequência por aluno e encontro; regra aplicada só se definida (senão "regra não definida"). */
export async function attendanceMap(classId: string, rule: AttendanceRule | undefined) {
  const meetings = await db.select().from(schema.meetings).where(eq(schema.meetings.classId, classId)).orderBy(asc(schema.meetings.number));
  const counted = meetings.filter((m) => m.countsForAttendance && m.status !== "cancelled");
  const students = await db.select({ e: schema.enrollments }).from(schema.enrollments).where(and(eq(schema.enrollments.classId, classId), eq(schema.enrollments.role, "aluno"), inArray(schema.enrollments.status, ["ativo", "suspenso", "encerrado"]))).orderBy(asc(schema.enrollments.name));
  const mIds = meetings.map((m) => m.id);
  const recs = mIds.length ? await db.select().from(schema.attendanceRecords).where(inArray(schema.attendanceRecords.meetingId, mIds)) : [];
  const rows = students.map(({ e }) => {
    const cells = meetings.map((m) => {
      const r = recs.find((x) => x.meetingId === m.id && x.userId === e.userId);
      const status = m.status === "cancelled" ? "cancelado" : r?.status ?? (m.status === "done" ? "ausente" : "");
      return { meetingId: m.id, status, source: r?.source ?? null, reviewRequested: r?.reviewRequested ?? null };
    });
    let score: number | null = null, denom = 0;
    if (rule && rule.minimumPct != null) {
      let num = 0;
      for (const c of cells) {
        const m = meetings.find((x) => x.id === c.meetingId)!;
        if (!m.countsForAttendance || m.status === "cancelled" || m.status !== "done") continue;
        if (c.status === "justificado" && rule.justifiedCountsAs === "excluido") continue;
        denom++;
        if (c.status === "presente") num++;
        else if (c.status === "atrasado") num += rule.lateCountsAs === "presente" ? 1 : rule.lateCountsAs === "meia" ? 0.5 : 0;
        else if (c.status === "justificado") num += rule.justifiedCountsAs === "presente" ? 1 : 0;
      }
      score = denom ? Math.round((num / denom) * 1000) / 10 : null;
    }
    return { enrollmentId: e.id, userId: e.userId, name: e.name, email: e.email, enrollmentStatus: e.status, cells, pct: score, denominator: denom, ruleDefined: Boolean(rule && rule.minimumPct != null), belowMinimum: rule?.minimumPct != null && score != null ? score < rule.minimumPct : null };
  });
  return { meetings, countedMeetings: counted.length, rows, rule: rule ?? null };
}
