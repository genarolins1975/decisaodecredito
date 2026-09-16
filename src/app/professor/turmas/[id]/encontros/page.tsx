import { asc, eq } from "drizzle-orm";
import { db, schema } from "@/lib/db/client";
import { requireClassAccess } from "@/lib/auth/guard";
import { listMeetings } from "@/lib/services/meetings";
import { listSessionsForClass } from "@/lib/services/live";
import { MeetingsPanel } from "@/components/professor/meetings-panel";

export default async function EncontrosPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const access = await requireClassAccess(id, ["professor"]);
  const meetings = await listMeetings(id);
  const sessions = await listSessionsForClass(id);
  const units = await db.select({ id: schema.units.id, number: schema.units.number, title: schema.units.title, kind: schema.units.kind }).from(schema.units).where(eq(schema.units.editionId, access.edition.id)).orderBy(asc(schema.units.position));
  return <MeetingsPanel classId={id} meetings={JSON.parse(JSON.stringify(meetings))} sessions={JSON.parse(JSON.stringify(sessions.map((s) => ({ ...s.s, meetingTitle: s.m.title }))))} units={units} />;
}
