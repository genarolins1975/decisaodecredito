import { and, eq } from "drizzle-orm";
import { requireClassAccess } from "@/lib/auth/guard";
import { listGroups } from "@/lib/services/assignments";
import { db, schema } from "@/lib/db/client";
import { GroupsPanel } from "@/components/professor/groups-panel";

export default async function GruposPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const access = await requireClassAccess(id, ["professor"]);
  const groups = await listGroups(id);
  const students = await db.select({ userId: schema.enrollments.userId, name: schema.enrollments.name, status: schema.enrollments.status }).from(schema.enrollments).where(and(eq(schema.enrollments.classId, id), eq(schema.enrollments.role, "aluno")));
  const datasets = await db.select({ id: schema.datasets.id, code: schema.datasets.code, name: schema.datasets.name, status: schema.datasets.status }).from(schema.datasets).where(eq(schema.datasets.editionId, access.edition.id));
  return <GroupsPanel classId={id} groups={JSON.parse(JSON.stringify(groups))} students={students.filter((s) => s.userId).map((s) => ({ userId: s.userId!, name: s.name, status: s.status }))} datasets={datasets} />;
}
