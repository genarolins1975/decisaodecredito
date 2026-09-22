import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { requireClassAccess } from "@/lib/auth/guard";
import { getSession, teacherState } from "@/lib/services/live";
import { courseOutline, flatPages, publicQuestions } from "@/lib/services/content";
import { ROTEIRO_AULA_2, primeiroSlideDoCapitulo, type NotaSlideAula2 } from "@/lib/content/roteiro-aula-2";
import { notasAula2 } from "@/lib/content/aula-2";
import { db, schema } from "@/lib/db/client";
import { LiveTeacher } from "@/components/live/live-teacher";

export const metadata: Metadata = { title: "Painel da aula" };

/** Notas por slide para o painel, do arquivo que `aula_credito_html/build.mjs` grava. Sem ele, o
    painel mostra só o roteiro. O que o baralho deixa ausente vira nulo, que é o que a casca espera. */
async function notasPorSlide(): Promise<Record<string, NotaSlideAula2>> {
  return Object.fromEntries((await notasAula2()).slides.map((x) => [x.n, {
    n: x.n, bloco: x.bloco, blocoNome: x.blocoNome, titulo: x.titulo,
    subtitulo: x.subtitulo ?? null, conclusao: x.conclusao ?? null, fonte: x.fonte ?? null, resumo: x.resumo ?? null,
    notas: x.notas ?? null,
    proximo: x.proximo ?? null,
  } satisfies NotaSlideAula2]));
}

export default async function AoVivoProfessorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let s;
  try { s = await getSession(id); } catch { notFound(); }
  const access = await requireClassAccess(s.classId, ["professor", "monitor"]);
  const [m] = await db.select().from(schema.meetings).where(eq(schema.meetings.id, s.meetingId));
  const pages = await flatPages(access.edition.id);
  /* Aula apresentada pelo baralho é aquela cujos capítulos o roteiro dos 50 slides cobre. A regra
     sai do próprio roteiro, e não do número da aula nem da ausência de capítulos: a Aula 2 tem os
     capítulos 4, 5 e 6 como as outras aulas têm os seus. */
  const unidade = (await courseOutline(access.edition.id)).find((u) => u.id === m.unitId);
  const porSlides = !!unidade && unidade.chapters.some((c) => primeiroSlideDoCapitulo(c.number) !== null);
  const qs = await db.select({ slug: schema.questions.slug, kind: schema.questions.kind, pageId: schema.questions.pageId, versionId: schema.questions.currentVersionId, prompt: schema.questionVersions.prompt })
    .from(schema.questions).innerJoin(schema.questionVersions, eq(schema.questionVersions.id, schema.questions.currentVersionId)).where(eq(schema.questions.editionId, access.edition.id));
  const initial = JSON.parse(JSON.stringify(await teacherState(id)));
  void publicQuestions;
  return <LiveTeacher sessionId={id} classId={s.classId} meeting={{ id: m.id, title: m.title, number: m.number }} initial={initial}
    pages={pages.map((p) => ({ id: p.id, slug: p.slug, title: p.title, chapter: p.chapterNumber }))}
    questions={qs.map((q) => ({ slug: q.slug, kind: q.kind, pageId: q.pageId, versionId: q.versionId!, prompt: q.prompt }))} isProfessor={access.role === "professor"}
    slides={porSlides ? ROTEIRO_AULA_2 : []} notas={porSlides ? await notasPorSlide() : {}} />;
}
