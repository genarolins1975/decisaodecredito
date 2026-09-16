import { requireClassAccess } from "@/lib/auth/guard";
import { Gradebook } from "@/components/professor/gradebook";

export default async function NotasPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await requireClassAccess(id, ["professor"]);
  return <Gradebook classId={id} />;
}
