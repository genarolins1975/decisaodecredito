import "server-only";
import { and, asc, desc, eq } from "drizzle-orm";
import katex from "katex";
import { db, schema } from "@/lib/db/client";
import { newId } from "@/lib/ids";
import { ApiError } from "@/lib/auth/guard";
import { audit } from "@/lib/audit";
import { sanitizeHtml } from "@/lib/sanitize";
import type { Block } from "@/lib/services/content";

/** Renderiza \( \) e \[ \] com KaTeX (HTML + MathML) no HTML editado pelo professor. */
export function renderTex(html: string) {
  const tex = (l: string, d: boolean) => { try { return katex.renderToString(l, { displayMode: d, throwOnError: false, output: "htmlAndMathml", strict: "ignore" }); } catch { return `<code>${l}</code>`; } };
  return html.replace(/\\\[([\s\S]+?)\\\]/g, (_m, l) => tex(l, true)).replace(/\\\(([\s\S]+?)\\\)/g, (_m, l) => tex(l, false));
}

export async function pageForEditor(pageId: string) {
  const [row] = await db.select({ page: schema.pages, chapter: schema.chapters, unit: schema.units }).from(schema.pages)
    .innerJoin(schema.chapters, eq(schema.chapters.id, schema.pages.chapterId)).innerJoin(schema.units, eq(schema.units.id, schema.chapters.unitId)).where(eq(schema.pages.id, pageId));
  if (!row) throw new ApiError(404, "Página não encontrada");
  const versions = await db.select().from(schema.pageVersions).where(eq(schema.pageVersions.pageId, pageId)).orderBy(desc(schema.pageVersions.versionNo));
  const published = versions.find((v) => v.id === row.page.publishedVersionId) ?? null;
  const latest = versions[0] ?? null;
  const qs = await db.select({ q: schema.questions, v: schema.questionVersions }).from(schema.questions).innerJoin(schema.questionVersions, eq(schema.questionVersions.id, schema.questions.currentVersionId)).where(eq(schema.questions.pageId, pageId));
  return { page: row.page, chapter: row.chapter, unit: row.unit, published, latest, versions: versions.map((v) => ({ id: v.id, versionNo: v.versionNo, changeNote: v.changeNote, createdAt: v.createdAt, publishedAt: v.publishedAt, isPublished: v.id === row.page.publishedVersionId })), questions: qs.map((x) => ({ id: x.q.id, slug: x.q.slug, kind: x.q.kind, versionId: x.v.id, versionNo: x.v.versionNo, label: x.v.label, prompt: x.v.prompt, options: x.v.options, answerKey: x.v.answerKey, feedback: x.v.feedback })) };
}

export type VersionInput = { title: string; objective?: string | null; support?: string | null; connection?: string | null; blocks: Block[]; teacherGuide?: Record<string, unknown> | null; changeNote?: string; publish: boolean };

/** Cria nova versão (sanitizada) a partir do rascunho editado; publica se solicitado. Versões publicadas nunca são alteradas. */
export async function createPageVersion(pageId: string, input: VersionInput, actorId: string) {
  const { page, latest } = await pageForEditor(pageId);
  const blocks: Block[] = input.blocks.map((b) => {
    if (b.type === "html") return { type: "html", html: sanitizeHtml(renderTex(b.html)) };
    if (b.type === "legacy") return { ...b, fallbackHtml: sanitizeHtml(b.fallbackHtml) };
    return b;
  });
  const id = newId();
  const versionNo = (latest?.versionNo ?? 0) + 1;
  await db.insert(schema.pageVersions).values({ id, pageId, versionNo, title: input.title.trim(), objective: input.objective ?? null, support: input.support ?? null, connection: input.connection ?? null, timeBudget: latest?.timeBudget ?? {}, blocks, teacherGuide: input.teacherGuide ?? latest?.teacherGuide ?? null, changeNote: input.changeNote ?? null, createdBy: actorId, publishedAt: input.publish ? new Date() : null });
  if (input.publish) await db.update(schema.pages).set({ publishedVersionId: id, status: "published", updatedAt: new Date() }).where(eq(schema.pages.id, pageId));
  await audit({ actorUserId: actorId, action: input.publish ? "page.publish" : "page.draft", entity: "page", entityId: pageId, details: { versionNo } });
  return { id, versionNo, published: input.publish, pageSlug: page.slug };
}

export async function publishVersion(pageId: string, versionId: string, actorId: string) {
  const [v] = await db.select().from(schema.pageVersions).where(and(eq(schema.pageVersions.id, versionId), eq(schema.pageVersions.pageId, pageId)));
  if (!v) throw new ApiError(404, "Versão não encontrada");
  await db.update(schema.pageVersions).set({ publishedAt: v.publishedAt ?? new Date() }).where(eq(schema.pageVersions.id, versionId));
  await db.update(schema.pages).set({ publishedVersionId: versionId, status: "published", updatedAt: new Date() }).where(eq(schema.pages.id, pageId));
  await audit({ actorUserId: actorId, action: "page.publish", entity: "page", entityId: pageId, details: { versionId } });
}

export async function updatePageMeta(pageId: string, patch: { level?: string; level120?: string | null; minutes?: number; status?: "draft" | "published"; position?: number }, actorId: string) {
  await db.update(schema.pages).set({ ...patch, updatedAt: new Date() }).where(eq(schema.pages.id, pageId));
  await audit({ actorUserId: actorId, action: "page.meta", entity: "page", entityId: pageId, details: patch });
}

export async function createPage(chapterId: string, slug: string, title: string, actorId: string) {
  const [ch] = await db.select().from(schema.chapters).where(eq(schema.chapters.id, chapterId));
  if (!ch) throw new ApiError(404, "Capítulo não encontrado");
  if (!/^[a-z0-9]{2,20}$/.test(slug)) throw new ApiError(400, "Identificador deve ter só letras minúsculas e números");
  const [last] = await db.select({ n: schema.pages.number, p: schema.pages.position }).from(schema.pages).where(eq(schema.pages.chapterId, chapterId)).orderBy(desc(schema.pages.number)).limit(1);
  const id = newId(); const vid = newId();
  const [r] = await db.insert(schema.pages).values({ id, chapterId, slug, number: (last?.n ?? 0) + 1, position: (last?.p ?? 0) + 1, level: "essencial", minutes: 5, status: "draft" }).onConflictDoNothing().returning();
  if (!r) throw new ApiError(409, "Já existe página com este identificador no capítulo");
  await db.insert(schema.pageVersions).values({ id: vid, pageId: id, versionNo: 1, title, blocks: [{ type: "html", html: "<p>Conteúdo da página.</p>" }], createdBy: actorId, changeNote: "Página criada pelo painel" });
  await audit({ actorUserId: actorId, action: "page.create", entity: "page", entityId: id });
  return id;
}

export async function createChapter(unitId: string, slug: string, title: string, actorId: string) {
  const [last] = await db.select({ n: schema.chapters.number, p: schema.chapters.position }).from(schema.chapters).where(eq(schema.chapters.unitId, unitId)).orderBy(desc(schema.chapters.number)).limit(1);
  const id = newId();
  const [r] = await db.insert(schema.chapters).values({ id, unitId, slug, title, number: (last?.n ?? 0) + 1, position: (last?.p ?? 0) + 1 }).onConflictDoNothing().returning();
  if (!r) throw new ApiError(409, "Identificador já usado");
  await audit({ actorUserId: actorId, action: "chapter.create", entity: "chapter", entityId: id });
  return id;
}

export async function createUnit(editionId: string, kind: "aula" | "trabalho", title: string, deliverable: string | null, actorId: string) {
  const [last] = await db.select({ n: schema.units.number, p: schema.units.position }).from(schema.units).where(and(eq(schema.units.editionId, editionId), eq(schema.units.kind, kind))).orderBy(desc(schema.units.number)).limit(1);
  const [lastPos] = await db.select({ p: schema.units.position }).from(schema.units).where(eq(schema.units.editionId, editionId)).orderBy(desc(schema.units.position)).limit(1);
  const id = newId();
  await db.insert(schema.units).values({ id, editionId, kind, number: (last?.n ?? 0) + 1, title, deliverable, position: (lastPos?.p ?? 0) + 1, status: "draft" });
  await audit({ actorUserId: actorId, action: "unit.create", entity: "unit", entityId: id });
  return id;
}

export async function setUnitStatus(unitId: string, status: "draft" | "published" | "archived", actorId: string) {
  await db.update(schema.units).set({ status }).where(eq(schema.units.id, unitId));
  await audit({ actorUserId: actorId, action: `unit.${status}`, entity: "unit", entityId: unitId });
}

/** Nova versão de questão: enunciado, alternativas, gabarito e feedback. Tentativas antigas mantêm a versão respondida. */
export async function createQuestionVersion(questionId: string, input: { label?: string | null; prompt: string; options: Record<string, unknown>; answerKey?: unknown; feedback?: unknown }, actorId: string) {
  const [q] = await db.select().from(schema.questions).where(eq(schema.questions.id, questionId));
  if (!q) throw new ApiError(404, "Questão não encontrada");
  const [last] = await db.select({ n: schema.questionVersions.versionNo }).from(schema.questionVersions).where(eq(schema.questionVersions.questionId, questionId)).orderBy(desc(schema.questionVersions.versionNo)).limit(1);
  const id = newId();
  const fb = input.feedback as { revealHtml?: string; modelAnswer?: string } | undefined;
  await db.insert(schema.questionVersions).values({ id, questionId, versionNo: (last?.n ?? 0) + 1, label: input.label ?? null, prompt: input.prompt.trim(), options: input.options, answerKey: input.answerKey ?? null, feedback: fb ? { ...fb, revealHtml: fb.revealHtml ? sanitizeHtml(renderTex(fb.revealHtml)) : undefined } : null });
  await db.update(schema.questions).set({ currentVersionId: id }).where(eq(schema.questions.id, questionId));
  await audit({ actorUserId: actorId, action: "question.version", entity: "question", entityId: questionId, details: { versionNo: (last?.n ?? 0) + 1 } });
  return id;
}

export async function createQuestion(editionId: string, pageId: string | null, kind: string, input: { label?: string | null; prompt: string; options: Record<string, unknown>; answerKey?: unknown; feedback?: unknown }, actorId: string) {
  const id = newId();
  const slug = `q-${id.slice(0, 8)}`;
  await db.insert(schema.questions).values({ id, editionId, pageId, slug, kind });
  await createQuestionVersion(id, input, actorId);
  return { id, slug };
}

export const _order = asc;
