import type { Metadata } from "next";
import Link from "next/link";
import { requireStaff } from "@/lib/auth/guard";
import { listEditionsWithClasses } from "@/lib/services/admin";
import { courseOutline } from "@/lib/services/content";
import { PageHeader, Badge } from "@/components/ui";
import { rotuloUnidade } from "@/lib/content/capitulo";

export const metadata: Metadata = { title: "Conteúdo" };

export default async function ConteudoPage({ searchParams }: { searchParams: Promise<{ edicao?: string }> }) {
  await requireStaff();
  const { edicao } = await searchParams;
  const editions = await listEditionsWithClasses();
  const ed = editions.find((e) => e.id === edicao) ?? editions.find((e) => e.status === "active") ?? editions[0];
  const outline = ed ? await courseOutline(ed.id) : [];
  return (
    <div>
      <PageHeader eyebrow="Material do curso" title="Conteúdo" lead="Aulas, capítulos e páginas publicadas. Editar cria uma nova versão; publicar torna a versão visível aos alunos sem alterar o que já foi respondido."
        actions={<form className="flex gap-2 items-center"><label className="text-[13px]">Ano <select name="edicao" className="select" defaultValue={ed?.id}>{editions.map((e) => <option key={e.id} value={e.id}>{e.label}</option>)}</select></label><button className="btn btn-sm btn-secondary" type="submit">Ver</button></form>} />
      {outline.map((u) => (
        <section key={u.id} className="card mb-4">
          <p className="eyebrow">{rotuloUnidade(u)} · {u.plannedMinutes} min com {u.breakMinutes} de intervalo</p>
          <h2 className="mb-3">{u.title}</h2>
          {u.chapters.map((c) => (
            <details key={c.id} className="mb-2">
              <summary className="cursor-pointer font-semibold text-ink min-h-[36px] flex items-center gap-2">Capítulo {c.number} · {c.title} <span className="hint font-normal">({c.pages.length} páginas, {c.pages.filter((p) => p.level === "essencial").reduce((s, p) => s + p.minutes, 0)} min essenciais)</span></summary>
              <p className="hint mt-2 mb-1"><Link href={`/aulas/capitulo/${c.number}`}>Abrir a página do capítulo</Link> · <Link href={`/apresentacao/${c.pages[0]?.slug ?? ""}`}>apresentar em tela cheia</Link>. Ver abre a página como o aluno a vê, na edição da turma ativa no seletor do topo.</p>
              <div className="table-wrap mt-2"><table className="table text-[13px]"><thead><tr><th>Id</th><th>Título</th><th>Nível</th><th>Min</th><th>Ações</th></tr></thead>
                <tbody>{c.pages.map((p) => <tr key={p.id}><td className="font-mono">{p.slug}</td><td>{p.title}</td><td><Badge tone={p.level === "essencial" ? "ink" : "muted"}>{p.level}</Badge></td><td>{p.minutes}</td><td className="whitespace-nowrap"><Link href={`/aulas/${p.slug}`}>ver</Link> · <Link href={`/apresentacao/${p.slug}`}>tela cheia</Link> · <Link href={`/professor/conteudo/${p.id}`}>editar</Link></td></tr>)}</tbody></table></div>
            </details>
          ))}
        </section>
      ))}
    </div>
  );
}
