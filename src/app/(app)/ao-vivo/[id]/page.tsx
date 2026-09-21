import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { requireContext } from "@/lib/context";
import { getSession, studentState } from "@/lib/services/live";
import { LiveStudent } from "@/components/live/live-student";
import { db, schema } from "@/lib/db/client";
import { eq } from "drizzle-orm";

export const metadata: Metadata = { title: "Aula ao vivo" };

export default async function SessaoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ctx = await requireContext();
  let s;
  try { s = await getSession(id); } catch { notFound(); }
  if (s.classId !== ctx.current.classId) notFound();
  if (ctx.current.role !== "aluno") redirect(`/professor/aovivo/${id}`);
  const [m] = await db.select().from(schema.meetings).where(eq(schema.meetings.id, s.meetingId));
  const initial = JSON.parse(JSON.stringify(await studentState(id, ctx.user.id)));
  return <LiveStudent sessionId={id} classId={ctx.current.classId} userId={ctx.user.id} meeting={{ id: m.id, title: m.title, number: m.number, videoUrl: m.videoUrl }} initial={initial} />;
}
