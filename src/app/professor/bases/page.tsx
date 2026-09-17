import type { Metadata } from "next";
import Link from "next/link";
import { asc, eq, sql } from "drizzle-orm";
import { db, schema } from "@/lib/db/client";
import { listEditionsWithClasses } from "@/lib/services/admin";
import { PageHeader, Badge } from "@/components/ui";
import { RegistrarPacote } from "@/components/professor/registrar-pacote";

export const metadata: Metadata = { title: "Bases e gabaritos" };

/** Área do professor: catálogo de bases com todos os arquivos (inclusive OOT, rótulos e gabaritos), materiais restritos e registro do pacote. */
export default async function ProfessorBasesPage({ searchParams }: { searchParams: Promise<{ edicao?: string }> }) {
  const sp = await searchParams;
  const editions = await listEditionsWithClasses();
  const edition = editions.find((e) => e.id === sp.edicao) ?? editions.find((e) => e.status === "active") ?? editions[0];
  if (!edition) return <p className="hint">Nenhuma edição cadastrada.</p>;
  const datasets = await db.select().from(schema.datasets).where(eq(schema.datasets.editionId, edition.id)).orderBy(asc(schema.datasets.code));
  const materials = (await db.select().from(schema.materials).where(eq(schema.materials.editionId, edition.id)).orderBy(asc(schema.materials.position))).filter((m) => m.kind !== "referencia");
  const grupos = await db.select({ datasetId: schema.groups.datasetId, n: sql<number>`count(*)` }).from(schema.groups).innerJoin(schema.classes, eq(schema.classes.id, schema.groups.classId)).where(eq(schema.classes.editionId, edition.id)).groupBy(schema.groups.datasetId);
  const politicas = await db.select({ cls: schema.classes.code, policy: schema.blindTests.releasePolicy, status: schema.assignments.status }).from(schema.assignments).innerJoin(schema.classes, eq(schema.classes.id, schema.assignments.classId)).leftJoin(schema.blindTests, eq(schema.blindTests.assignmentId, schema.assignments.id)).where(eq(schema.classes.editionId, edition.id));
  const finais = politicas;
  const disponiveis = datasets.filter((d) => d.status === "disponivel").length;
  return (
    <div>
      <PageHeader eyebrow={`Edição ${edition.label}`} title="Bases e gabaritos" lead={`${disponiveis} de ${datasets.length} bases disponíveis. Tudo nesta página é do professor: OOT sem desfecho, rótulos e gabaritos nunca aparecem ao aluno. O aluno vê, em Materiais, o pacote de cada base, o dicionário e, quando a política do trabalho final é "livre", o OOT.`} />
      {editions.length > 1 && <p className="hint mb-3">Edições: {editions.map((e) => <Link key={e.id} href={`/professor/bases?edicao=${e.id}`} className={e.id === edition.id ? "font-semibold mr-2" : "mr-2"}>{e.label}</Link>)}</p>}
      <div className="grid gap-3 md:grid-cols-3 mb-4">
        {finais.map((f) => <div key={f.cls} className="panel-soft text-[14px]"><b>{f.cls}</b> · trabalho final {f.status === "published" ? "publicado" : f.status === "closed" ? "encerrado" : "rascunho"} · OOT {f.policy === "livre" ? "liberado a todos" : "após congelamento"}</div>)}
      </div>
      <section className="card mb-4" aria-labelledby="mat">
        <h2 id="mat" className="text-lg mb-2">Pacote do trabalho e gabaritos consolidados</h2>
        <ul className="list-none p-0 m-0 grid gap-2 md:grid-cols-2">
          {materials.map((m) => <li key={m.id} className={`panel-soft ${m.status === "professor" ? "border-gold" : ""}`}><p className="eyebrow">{m.kind}{m.status === "professor" ? " · só professor" : " · publicado aos alunos"}</p><p className="font-semibold">{m.fileId ? <a href={`/api/arquivos/${m.fileId}`}>{m.title}</a> : m.title}</p>{m.description && <p className="hint">{m.description}</p>}</li>)}
          {materials.length === 0 && <li className="hint">Nenhum pacote registrado ainda.</li>}
        </ul>
      </section>
      <section className="card" aria-labelledby="bases">
        <h2 id="bases" className="text-lg mb-2">Catálogo</h2>
        <ul className="list-none p-0 m-0 grid gap-2 md:grid-cols-2">
          {datasets.map((d) => {
            const g = Number(grupos.find((x) => x.datasetId === d.id)?.n ?? 0);
            return <li key={d.id} className="panel-soft"><div className="flex items-center gap-2 flex-wrap"><span className="font-mono text-[12px] text-muted">{d.code}</span><Badge tone={d.status === "disponivel" ? "ok" : "muted"}>{d.status === "disponivel" ? "disponível" : "pendente"}</Badge><span className="hint">v{d.version} · {g} grupo(s)</span></div>
              <p className="font-semibold text-ink">{d.name}</p><p className="hint">{d.population}</p>
              <div className="flex flex-wrap gap-2 mt-2">
                {d.fileId && <a className="btn btn-sm btn-secondary" href={`/api/arquivos/${d.fileId}`}>Pacote do aluno</a>}
                {d.dictionaryFileId && <a className="btn btn-sm btn-ghost" href={`/api/arquivos/${d.dictionaryFileId}`}>Dicionário</a>}
                {d.ootFileId && <a className="btn btn-sm btn-ghost" href={`/api/arquivos/${d.ootFileId}`}>OOT sem desfecho</a>}
                {d.labelsFileId && <a className="btn btn-sm btn-ghost border-gold" href={`/api/arquivos/${d.labelsFileId}`}>Rótulos do OOT</a>}
                {d.teacherFileId && <a className="btn btn-sm btn-ghost border-gold" href={`/api/arquivos/${d.teacherFileId}`}>Gabarito</a>}
              </div>
              {d.notes && <p className="hint mt-1">{d.notes}</p>}
            </li>;
          })}
        </ul>
        <RegistrarPacote editionId={edition.id} />
      </section>
    </div>
  );
}
