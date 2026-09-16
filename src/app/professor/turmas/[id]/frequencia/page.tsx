import { requireClassAccess } from "@/lib/auth/guard";
import { attendanceMap, type AttendanceRule } from "@/lib/services/attendance";
import { AttendancePanel } from "@/components/professor/attendance-panel";

export default async function FrequenciaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const access = await requireClassAccess(id, ["professor"]);
  const rule = (access.cls.config as { attendance?: AttendanceRule }).attendance;
  const map = await attendanceMap(id, rule);
  return <AttendancePanel classId={id} map={JSON.parse(JSON.stringify(map))} />;
}
