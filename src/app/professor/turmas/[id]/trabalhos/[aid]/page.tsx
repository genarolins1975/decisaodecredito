import { notFound } from "next/navigation";
import { asc, eq } from "drizzle-orm";
import { requireClassAccess } from "@/lib/auth/guard";
import { getAssignment, listGroups, listSubmissionsForTeacher } from "@/lib/services/assignments";
import { listBlindForTeacher } from "@/lib/services/blind";
import { db, schema } from "@/lib/db/client";
import { AssignmentEditForm } from "@/components/professor/assignment-forms";
import { AssignmentTeacherPanel } from "@/components/professor/assignment-teacher";
import { StatusBadge } from "@/components/ui";

export default async function TrabalhoProfessorPage({ params }: { params: Promise<{ id: string; aid: string }> }) {
  const { id, aid } = await params;
  const access = await requireClassAccess(id, ["professor"]);
  let a;
  try { a = await getAssignment(id, aid, true); } catch { notFound(); }
  const subs = await listSubmissionsForTeacher(id, aid);
  const blind = await listBlindForTeacher(aid);
  const groups = await listGroups(id);
  const rubrics = await db.select({ id: schema.rubricVersions.id, versionNo: schema.rubricVersions.versionNo, name: schema.rubrics.name }).from(schema.rubricVersions).innerJoin(schema.rubrics, eq(schema.rubrics.id, schema.rubricVersions.rubricId)).where(eq(schema.rubrics.editionId, access.edition.id));
  const units = await db.select({ id: schema.units.id, number: schema.units.number, title: schema.units.title, kind: schema.units.kind }).from(schema.units).where(eq(schema.units.editionId, access.edition.id)).orderBy(asc(schema.units.position));
  const students = await db.select({ userId: schema.enrollments.userId, name: schema.enrollments.name }).from(schema.enrollments).where(eq(schema.enrollments.classId, id));
  const datasets = await db.select({ id: schema.datasets.id, code: schema.datasets.code, name: schema.datasets.name, status: schema.datasets.status }).from(schema.datasets).where(eq(schema.datasets.editionId, access.edition.id));
  const json = (x: unknown) => JSON.parse(JSON.stringify(x));
  const { rubric, steps, ...plain } = a;
  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-3 flex-wrap"><h2 className="text-xl">{a.title}</h2><StatusBadge status={a.status} />
        <div className="flex-1" />
        <PublishToggle classId={id} aid={aid} status={a.status} /></div>
      <AssignmentTeacherPanel classId={id} assignment={json({ ...plain, steps })} rubric={json(rubric?.definition ?? null)} submissions={json(subs.submissions)} grades={json(subs.grades)} blind={json(blind)} groups={json(groups)} students={students.filter((s) => s.userId).map((s) => ({ userId: s.userId!, name: s.name }))} datasets={datasets} />
      <details className="card"><summary className="cursor-pointer font-serif font-bold text-ink">Editar enunciado, prazo, formatos, regra de atraso e rubrica</summary>
        <div className="mt-3"><AssignmentEditForm classId={id} a={json(plain)} rubrics={rubrics.map((r) => ({ id: r.id, label: `${r.name} (v${r.versionNo})` }))} units={units} /></div></details>
    </div>
  );
}

function PublishToggle({ classId, aid, status }: { classId: string; aid: string; status: string }) {
  return (
    <form action={`/api/professor/turmas/${classId}/trabalhos/${aid}`} method="post" className="contents">
      <PublishButton classId={classId} aid={aid} status={status} />
    </form>
  );
}
import { PublishButton } from "@/components/professor/publish-button";
