import { handle, json } from "@/lib/api";
import { ApiError, requireClassAccess } from "@/lib/auth/guard";
import { getPage, neighbors } from "@/lib/services/content";

/** Conteúdo publicado de uma página (blocos públicos + questões sem gabarito). Guia só para professor/monitor. */
export const GET = handle(async (req, ctx: { params: Promise<{ slug: string }> }) => {
  const { slug } = await ctx.params;
  const classId = new URL(req.url).searchParams.get("classId") ?? "";
  const access = await requireClassAccess(classId);
  const data = await getPage(access.edition.id, slug, access.role !== "aluno");
  if (!data) throw new ApiError(404, "Página não encontrada");
  const nav = await neighbors(access.edition.id, slug);
  return json({ page: { slug, title: data.version.title, objective: data.version.objective, support: data.version.support, connection: data.version.connection, minutes: data.page.minutes, level: data.page.level, chapter: { number: data.chapter.number, title: data.chapter.title, color: data.chapter.themeColor }, unit: { number: data.unit.number, kind: data.unit.kind } },
    blocks: data.blocks, questions: data.questions, teacherGuide: data.teacherGuide ?? null, prev: nav.prev?.slug ?? null, next: nav.next?.slug ?? null });
});
