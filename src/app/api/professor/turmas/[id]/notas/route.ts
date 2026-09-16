import { and, asc, eq, inArray } from "drizzle-orm";
import { handle, json } from "@/lib/api";
import { requireClassAccess } from "@/lib/auth/guard";
import { db, schema } from "@/lib/db/client";
import { toCsv } from "@/lib/csv";
import { computeTotal, type RubricDef } from "@/lib/services/assignments";

/** Caderno de notas da turma (JSON) ou CSV. Reconcilia com a tela: mesma função de cálculo. */
export const GET = handle(async (req, ctx: { params: Promise<{ id: string }> }) => {
  const { id } = await ctx.params;
  const access = await requireClassAccess(id, ["professor", "monitor"]);
  const students = await db.select().from(schema.enrollments).where(and(eq(schema.enrollments.classId, id), eq(schema.enrollments.role, "aluno"))).orderBy(asc(schema.enrollments.name));
  const assignments = await db.select().from(schema.assignments).where(eq(schema.assignments.classId, id)).orderBy(asc(schema.assignments.position));
  const grades = assignments.length ? await db.select().from(schema.grades).where(inArray(schema.grades.assignmentId, assignments.map((a) => a.id))) : [];
  const rvIds = [...new Set(grades.map((g) => g.rubricVersionId).filter(Boolean))] as string[];
  const rvs = rvIds.length ? await db.select().from(schema.rubricVersions).where(inArray(schema.rubricVersions.id, rvIds)) : [];
  const rows = students.map((s) => {
    const cells = assignments.map((a) => {
      const g = grades.find((x) => x.assignmentId === a.id && x.userId === s.userId);
      if (!g) return { assignmentId: a.id, status: "nao_corrigido", total: null, max: null, published: false };
      const rv = rvs.find((r) => r.id === g.rubricVersionId);
      const calc = rv ? computeTotal(rv.definition as RubricDef, g.scores as Record<string, number>) : null;
      return { assignmentId: a.id, status: g.status, total: g.status === "corrigido" ? Number(g.total) : g.status === "zero" ? 0 : null, max: calc?.max ?? null, published: Boolean(g.publishedAt), cutoffFailed: calc?.cutoffFailed ?? false, rubricVersion: rv?.versionNo ?? null };
    });
    return { name: s.name, email: s.email, enrollmentStatus: s.status, cells };
  });
  if (new URL(req.url).searchParams.get("formato") === "csv") {
    const cols = ["nome", "email", "situacao", ...assignments.flatMap((a) => [`${a.slug} nota`, `${a.slug} max`, `${a.slug} situacao`, `${a.slug} publicada`])];
    const out = rows.map((r) => { const o: Record<string, unknown> = { nome: r.name, email: r.email, situacao: r.enrollmentStatus }; r.cells.forEach((c, i) => { const a = assignments[i]; o[`${a.slug} nota`] = c.total ?? ""; o[`${a.slug} max`] = c.max ?? ""; o[`${a.slug} situacao`] = c.status; o[`${a.slug} publicada`] = c.published ? "sim" : "não"; }); return o; });
    return new Response(toCsv(out, cols) + "\r\n\r\nLegenda de situação: nao_corrigido; corrigido; dispensado; nao_entregue; zero. Nota vazia não é zero.", { headers: { "content-type": "text/csv; charset=utf-8", "content-disposition": `attachment; filename="notas-${access.cls.code}.csv"` } });
  }
  return json({ assignments: assignments.map((a) => ({ id: a.id, slug: a.slug, title: a.title, status: a.status, weight: a.weight })), rows });
});
