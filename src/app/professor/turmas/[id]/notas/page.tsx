import { requireClassAccess } from "@/lib/auth/guard";
import { Empty } from "@/components/ui";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await requireClassAccess(id, ["professor"]);
  return <Empty title="Em construção">Seção "notas" será implementada na etapa 4.</Empty>;
}
