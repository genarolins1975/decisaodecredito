import { requireClassAccess } from "@/lib/auth/guard";
import { listEnrollmentsWithInvites } from "@/lib/services/enrollment";
import { EnrollmentsPanel } from "@/components/professor/enrollments-panel";
import { provider } from "@/lib/email/queue";

export default async function AlunosPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await requireClassAccess(id, ["professor"]);
  const rows = await listEnrollmentsWithInvites(id);
  const ready = await provider().ready();
  return <EnrollmentsPanel classId={id} rows={JSON.parse(JSON.stringify(rows))} sender={ready} />;
}
