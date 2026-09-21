import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { requireClassAccess } from "@/lib/auth/guard";
import { getSession, teacherState } from "@/lib/services/live";
import { courseOutline, flatPages, publicQuestions } from "@/lib/services/content";
import { ROTEIRO_AULA_2 } from "@/lib/content/roteiro-aula-2";
import { notasAula2 } from "@/lib/content/aula-2";
import { db, schema } from "@/lib/db/client";
import { LiveTeacher } from "@/components/live/live-teacher";

export const metadata: Metadata = { title: "Painel da aula" };

/** Notas dos 50 slides, gravadas por `aula_credito_html/build.mjs`. Sem o arquivo, o painel mostra só o roteiro. */
/** Notas por slide para o painel, do mesmo arquivo compilado que as páginas da Aula 2 usam. */
async function notasPorSlide() {
  return Object.fromEntries((await notasAula2()).slides.map((x) => [x.n, x]));
}

export default async function AoVivoProfessorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let s;
  try { s = await getSession(id); } catch { notFound(); }
  const access = await requireClassAccess(s.classId, ["professor", "monitor"]);
  const [m] = await db.select().from(schema.meetings).where(eq(schema.meetings.id, s.meetingId));
  const pages = await flatPages(access.edition.id);
  // unidade sem capítulos é unidade conduzida por slides; hoje só a Aula 2
  const unidade = (await courseOutline(access.edition.id)).find((u) => u.id === m.unitId);
  const porSlides = !!unidade && unidade.chapters.length === 0;
  const qs = await db.select({ slug: schema.questions.slug, kind: schema.questions.kind, pageId: schema.questions.pageId, versionId: schema.questions.currentVersionId, prompt: schema.questionVersions.prompt })
    .from(schema.questions).innerJoin(schema.questionVersions, eq(schema.questionVersions.id, schema.questions.currentVersionId)).where(eq(schema.questions.editionId, access.edition.id));
  const initial = JSON.parse(JSON.stringify(await teacherState(id)));
  void publicQuestions;
  return <LiveTeacher sessionId={id} classId={s.classId} meeting={{ id: m.id, title: m.title, number: m.number }} initial={initial}
    pages={pages.map((p) => ({ id: p.id, slug: p.slug, title: p.title, chapter: p.chapterNumber }))}
    questions={qs.map((q) => ({ slug: q.slug, kind: q.kind, pageId: q.pageId, versionId: q.versionId!, prompt: q.prompt }))} isProfessor={access.role === "professor"}
    slides={porSlides ? ROTEIRO_AULA_2 : []} notas={porSlides ? await notasPorSlide() : {}} />;
}
