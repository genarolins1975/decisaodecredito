import type { Metadata } from "next";
import { listEditionsWithClasses } from "@/lib/services/admin";
import { PageHeader } from "@/components/ui";
import { EditionsPanel } from "@/components/professor/editions-panel";

export const metadata: Metadata = { title: "Turmas" };

export default async function TurmasPage() {
  const editions = await listEditionsWithClasses();
  return (
    <div>
      <PageHeader eyebrow="Anos letivos e turmas" title="Turmas" lead="Cada ano letivo pode ter mais de uma turma. Duplicar copia o conteúdo e os ajustes, nunca pessoas ou registros." />
      <EditionsPanel editions={JSON.parse(JSON.stringify(editions))} />
    </div>
  );
}
