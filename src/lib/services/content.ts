import "server-only";
import { and, asc, eq, inArray } from "drizzle-orm";
import { db, schema } from "@/lib/db/client";
import { sequenciaDoCurso, vizinhosNaSequencia } from "@/lib/content/capitulo";
import { renderTex } from "@/lib/tex";

export type Block =
  | { type: "html"; html: string }
  | { type: "question"; slug: string }
  | { type: "episode"; number: number; challenge: string; text: string; steps: { title: string; detail: string }[]; missions?: number }
  | { type: "checkpoint"; count: string; intro: string; items: { title: string; question: string; answer: string }[] }
  | { type: "legacy"; slug: string; controls: number; fallbackHtml: string; note: string };

export type PublicQuestion = {
  id: string; versionId: string; slug: string; kind: string; label: string | null; prompt: string; options: Record<string, unknown>;
};

/** Estrutura do curso para a edição: unidades → capítulos → páginas (sem conteúdo). */
export async function courseOutline(editionId: string) {
  const units = await db.select().from(schema.units).where(and(eq(schema.units.editionId, editionId), eq(schema.units.status, "published"))).orderBy(asc(schema.units.position));
  const unitIds = units.map((u) => u.id);
  const chapters = unitIds.length ? await db.select().from(schema.chapters).where(inArray(schema.chapters.unitId, unitIds)).orderBy(asc(schema.chapters.position)) : [];
  const chIds = chapters.map((c) => c.id);
  const pgs = chIds.length ? await db.select({
    id: schema.pages.id, chapterId: schema.pages.chapterId, slug: schema.pages.slug, number: schema.pages.number, position: schema.pages.position,
    level: schema.pages.level, level120: schema.pages.level120, minutes: schema.pages.minutes, origin: schema.pages.origin, status: schema.pages.status,
    title: schema.pageVersions.title,
  }).from(schema.pages).innerJoin(schema.pageVersions, eq(schema.pageVersions.id, schema.pages.publishedVersionId))
    .where(and(inArray(schema.pages.chapterId, chIds), eq(schema.pages.status, "published"))).orderBy(asc(schema.pages.position)) : [];
  return units.map((u) => ({
    ...u,
    chapters: chapters.filter((c) => c.unitId === u.id).map((c) => ({ ...c, pages: pgs.filter((p) => p.chapterId === c.id) })),
  }));
}

export type FlatPage = { id: string; slug: string; title: string; chapterId: string; chapterNumber: number; chapterTitle: string; unitId: string; unitNumber: number; unitKind: string; unitTitle: string; level: string; minutes: number; position: number };

export async function flatPages(editionId: string): Promise<FlatPage[]> {
  const outline = await courseOutline(editionId);
  const out: FlatPage[] = [];
  for (const u of outline) for (const c of u.chapters) for (const p of c.pages)
    out.push({ id: p.id, slug: p.slug, title: p.title, chapterId: c.id, chapterNumber: c.number, chapterTitle: c.title, unitId: u.id, unitNumber: u.number, unitKind: u.kind, unitTitle: u.title, level: p.level, minutes: p.minutes, position: p.position });
  return out;
}

/** Página publicada com blocos. teacherGuide só é devolvido quando includeGuide=true (professor/monitor). */
export async function getPage(editionId: string, slug: string, includeGuide: boolean) {
  const [row] = await db.select({ page: schema.pages, version: schema.pageVersions, chapter: schema.chapters, unit: schema.units })
    .from(schema.pages)
    .innerJoin(schema.pageVersions, eq(schema.pageVersions.id, schema.pages.publishedVersionId))
    .innerJoin(schema.chapters, eq(schema.chapters.id, schema.pages.chapterId))
    .innerJoin(schema.units, eq(schema.units.id, schema.chapters.unitId))
    .where(and(eq(schema.units.editionId, editionId), eq(schema.pages.slug, slug), eq(schema.pages.status, "published"))).limit(1);
  if (!row) return null;
  const blocks = (row.version.blocks as Block[]).map((b) => (b.type === "html" ? { ...b, html: renderTex(b.html) } : b));
  /* Todas as perguntas da página, e não só as ancoradas num ponto do texto: uma pergunta escrita
     depois, sem marca no HTML original, ficaria invisível se a busca saísse apenas dos blocos. */
  const daPagina = await db.select({ slug: schema.questions.slug }).from(schema.questions).where(eq(schema.questions.pageId, row.page.id));
  const slugs = blocks.filter((b): b is Extract<Block, { type: "question" }> => b.type === "question").map((b) => b.slug);
  const checagem = `${slug}-checagem`;
  const qs = await publicQuestions(editionId, [...new Set([...slugs, ...daPagina.map((q) => q.slug), checagem])]);
  const { teacherGuide, ...version } = row.version;
  const guide = (teacherGuide ?? null) as { pre?: unknown } | null;
  return {
    page: row.page, version, chapter: row.chapter, unit: row.unit, blocks, questions: qs,
    /** campo "Pré-requisito" do guia docente, exibido ao aluno como "Antes desta página" (nada mais do guia sai daqui) */
    prerequisite: typeof guide?.pre === "string" ? guide.pre : null,
    teacherGuide: includeGuide ? (teacherGuide as Record<string, unknown> | null) : undefined,
  };
}

/** Prerrequisitos de todas as páginas publicadas de um capítulo (para "O que este capítulo assume"). */
export async function chapterPrerequisites(chapterId: string) {
  const rows = await db.select({ number: schema.pages.number, position: schema.pages.position, guide: schema.pageVersions.teacherGuide })
    .from(schema.pages).innerJoin(schema.pageVersions, eq(schema.pageVersions.id, schema.pages.publishedVersionId))
    .where(and(eq(schema.pages.chapterId, chapterId), eq(schema.pages.status, "published"))).orderBy(schema.pages.position);
  return rows.map((r, i) => ({ pageNumber: r.number ?? i + 1, pre: typeof (r.guide as { pre?: unknown } | null)?.pre === "string" ? (r.guide as { pre: string }).pre : null }));
}

/** Questões em forma pública: nunca inclui answerKey nem feedback. */
export async function publicQuestions(editionId: string, slugs: string[]): Promise<PublicQuestion[]> {
  if (!slugs.length) return [];
  const rows = await db.select({ q: schema.questions, v: schema.questionVersions }).from(schema.questions)
    .innerJoin(schema.questionVersions, eq(schema.questionVersions.id, schema.questions.currentVersionId))
    .where(and(eq(schema.questions.editionId, editionId), inArray(schema.questions.slug, slugs)));
  return rows.map((r) => ({ id: r.q.id, versionId: r.v.id, slug: r.q.slug, kind: r.q.kind, label: r.v.label, prompt: r.v.prompt, options: r.v.options as Record<string, unknown> }));
}

export async function neighbors(editionId: string, slug: string) {
  const all = await flatPages(editionId);
  const i = all.findIndex((p) => p.slug === slug);
  return { prev: i > 0 ? all[i - 1] : null, next: i >= 0 && i < all.length - 1 ? all[i + 1] : null, index: i, total: all.length, all };
}

/** Página de abertura do capítulo: unidade, capítulo, páginas com objetivo e orçamento de tempo, vizinhos e materiais que citam o capítulo. */
export async function chapterOverview(editionId: string, numero: number) {
  const outline = await courseOutline(editionId);
  const flat = outline.flatMap((u) => u.chapters.map((c) => ({ unit: u, chapter: c })));
  const i = flat.findIndex((x) => x.chapter.number === numero);
  if (i < 0) return null;
  const { unit, chapter } = flat[i];
  const ids = chapter.pages.map((p) => p.id);
  const versions = ids.length ? await db.select({ pageId: schema.pageVersions.pageId, objective: schema.pageVersions.objective, timeBudget: schema.pageVersions.timeBudget })
    .from(schema.pageVersions).innerJoin(schema.pages, eq(schema.pages.publishedVersionId, schema.pageVersions.id)).where(inArray(schema.pages.id, ids)) : [];
  const byPage = new Map(versions.map((v) => [v.pageId, v]));
  const pages = chapter.pages.map((p) => ({ ...p, objective: byPage.get(p.id)?.objective ?? null, timeBudget: (byPage.get(p.id)?.timeBudget ?? null) as { exp?: number; ex?: number; prat?: number; disc?: number } | null }));
  const materials = await db.select().from(schema.materials).where(and(eq(schema.materials.editionId, editionId), inArray(schema.materials.status, ["published", "professor"]))).orderBy(asc(schema.materials.position));
  const { prev, next } = vizinhosNaSequencia(sequenciaDoCurso(outline), `/aulas/capitulo/${numero}`);
  const titles: Record<string, string> = {};
  for (const x of flat) for (const p of x.chapter.pages) titles[p.slug] = p.title;
  return {
    unit: { id: unit.id, kind: unit.kind, number: unit.number, title: unit.title, deliverable: unit.deliverable },
    chapter: { ...chapter, pages }, prev, next, total: flat.length, materials, titles,
  };
}
