import "server-only";
import { and, asc, desc, eq } from "drizzle-orm";
import { db, schema } from "@/lib/db/client";
import { newId } from "@/lib/ids";
import { ApiError } from "@/lib/auth/guard";
import { audit } from "@/lib/audit";

export type MeetingInput = { number?: number; title: string; unitId?: string | null; scheduledAt?: Date | null; endsAt?: Date | null; location?: string | null; videoUrl?: string | null; countsForAttendance?: boolean; preparation?: string | null; replacementOfId?: string | null };

export async function listMeetings(classId: string) {
  return db.select().from(schema.meetings).where(eq(schema.meetings.classId, classId)).orderBy(asc(schema.meetings.number));
}

export async function createMeeting(classId: string, input: MeetingInput, actorId: string) {
  const [last] = await db.select({ n: schema.meetings.number }).from(schema.meetings).where(eq(schema.meetings.classId, classId)).orderBy(desc(schema.meetings.number)).limit(1);
  const id = newId();
  await db.insert(schema.meetings).values({ id, classId, number: input.number ?? (last?.n ?? 0) + 1, title: input.title, unitId: input.unitId ?? null, scheduledAt: input.scheduledAt ?? null, endsAt: input.endsAt ?? null, location: input.location ?? null, videoUrl: input.videoUrl ?? null, countsForAttendance: input.countsForAttendance ?? true, preparation: input.preparation ?? null, replacementOfId: input.replacementOfId ?? null });
  await audit({ actorUserId: actorId, action: "meeting.create", entity: "meeting", entityId: id, classId });
  return id;
}

export async function updateMeeting(classId: string, id: string, patch: Partial<MeetingInput> & { status?: "planned" | "done" | "cancelled" }, actorId: string) {
  const [m] = await db.select().from(schema.meetings).where(and(eq(schema.meetings.id, id), eq(schema.meetings.classId, classId)));
  if (!m) throw new ApiError(404, "Encontro não encontrado");
  await db.update(schema.meetings).set({ ...patch }).where(eq(schema.meetings.id, id));
  await audit({ actorUserId: actorId, action: "meeting.update", entity: "meeting", entityId: id, classId, details: patch });
}

/** Encontros padrão a partir das unidades da edição (4 aulas), sem datas. */
export async function scaffoldMeetings(classId: string, editionId: string, actorId: string) {
  const existing = await listMeetings(classId);
  if (existing.length) return existing.length;
  const units = await db.select().from(schema.units).where(and(eq(schema.units.editionId, editionId), eq(schema.units.kind, "aula"))).orderBy(asc(schema.units.position));
  for (const u of units) await createMeeting(classId, { number: u.number, title: `Aula ${u.number}: ${u.title}`, unitId: u.id }, actorId);
  return units.length;
}
