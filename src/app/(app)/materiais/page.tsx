import type { Metadata } from "next";
import { asc, eq } from "drizzle-orm";
import { requireContext } from "@/lib/context";
import { db, schema } from "@/lib/db/client";
import { PageHeader, Badge } from "@/components/ui";
import { myGroup } from "@/lib/services/assignments";

export const metadata: Metadata = { title: "Materiais" };

export default async function MateriaisPage() {
  const ctx = await requireContext();
  const materials = await db.select().from(schema.materials).where(eq(schema.materials.editionId, ctx.current.edition.id)).orderBy(asc(schema.materials.position));
  const datasets = await db.select().from(schema.datasets).where(eq(schema.datasets.editionId, ctx.current.edition.id)).orderBy(asc(schema.datasets.code));
  const group = await myGroup(ctx.current.classId, ctx.user.id);
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div>
        <PageHeader eyebrow="Leituras e referências" title="Materiais" lead="Bibliografia de apoio do curso. As obras citadas sustentam conceitos das aulas; os números do material são reconstruções didáticas ou exemplos sintéticos, salvo indicação." />
        <ul className="list-none p-0 m-0 grid gap-2">
          {materials.map((m) => <li key={m.id} className="card-flat"><p className="eyebrow">{m.kind}</p><p className="font-semibold text-ink text-[15px]">{m.url ? <a href={m.url} target="_blank" rel="noreferrer">{m.title}</a> : m.fileId ? <a href={`/api/arquivos/${m.fileId}`}>{m.title}</a> : m.title}</p>{m.description && <p className="hint mt-1">{m.description}</p>}</li>)}
          {materials.length === 0 && <li className="hint">Nenhum material cadastrado.</li>}
        </ul>
      </div>
      <div>
        <PageHeader eyebrow="Trabalho final" title="Bases dos casos" lead={group ? `Seu grupo (${group.name}) trabalha com a base ${datasets.find((d) => d.id === group.datasetId)?.code ?? "ainda não atribuída"}.` : "Cada grupo recebe uma base por produto e população, com dicionário e versão."} />
        <ul className="list-none p-0 m-0 grid gap-2">
          {datasets.map((d) => <li key={d.id} className={`card-flat ${group?.datasetId === d.id ? "border-gold" : ""}`}><div className="flex items-center gap-2 flex-wrap"><p className="font-mono text-[12px] text-muted">{d.code}</p><Badge tone={d.status === "disponivel" ? "ok" : "muted"}>{d.status === "disponivel" ? "disponível" : "pendente de cadastro"}</Badge><span className="hint">v{d.version}</span></div><p className="font-semibold text-ink">{d.name}</p><p className="hint">{d.population}</p><p className="text-[13.5px] mt-1">{d.emphasis}</p>{d.fileId && (group?.datasetId === d.id || ctx.current.role !== "aluno") && <a className="btn btn-sm btn-secondary mt-2" href={`/api/arquivos/${d.fileId}`}>Baixar base</a>}{d.dictionaryFileId && <a className="btn btn-sm btn-ghost mt-2" href={`/api/arquivos/${d.dictionaryFileId}`}>Dicionário</a>}</li>)}
        </ul>
      </div>
    </div>
  );
}
