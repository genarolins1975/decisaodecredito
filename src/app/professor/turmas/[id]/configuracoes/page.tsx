import { requireClassAccess } from "@/lib/auth/guard";
import { ClassConfigPanel } from "@/components/professor/class-config-panel";

export default async function ConfigTurmaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const access = await requireClassAccess(id, ["professor"]);
  return <ClassConfigPanel classId={id} config={JSON.parse(JSON.stringify(access.cls.config))} cls={{ code: access.cls.code, name: access.cls.name, status: access.cls.status, archivePolicy: access.cls.archivePolicy }} />;
}
