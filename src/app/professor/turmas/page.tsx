import type { Metadata } from "next";
import { listEditionsWithClasses } from "@/lib/services/admin";
import { PageHeader } from "@/components/ui";
import { EditionsPanel } from "@/components/professor/editions-panel";

export const metadata: Metadata = { title: "Turmas e edições" };

export default async function TurmasPage() {
  const editions = await listEditionsWithClasses();
  return (
    <div>
      <PageHeader eyebrow="Estrutura" title="Edições e turmas" lead="Curso → edição (ano letivo) → turma → matrícula. O ano é atributo explícito da edição; uma edição pode ter mais de uma turma. Duplicar copia conteúdo e configurações, nunca pessoas ou registros." />
      <EditionsPanel editions={JSON.parse(JSON.stringify(editions))} />
    </div>
  );
}
