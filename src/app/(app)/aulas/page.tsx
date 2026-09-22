import type { Metadata } from "next";
import Link from "next/link";
import { requireContext } from "@/lib/context";
import { asc, eq } from "drizzle-orm";
import { db, schema } from "@/lib/db/client";
import { courseOutline } from "@/lib/services/content";
import { PageHeader, Badge } from "@/components/ui";
import { rotuloUnidade } from "@/lib/content/capitulo";

export const metadata: Metadata = { title: "Aulas" };

export default async function AulasPage() {
  const ctx = await requireContext();
  const outline = await courseOutline(ctx.current.edition.id);
  // materiais presos a uma unidade aparecem no cartão dela, depois dos capítulos
  const daUnidade = (await db.select().from(schema.materials).where(eq(schema.materials.editionId, ctx.current.edition.id)).orderBy(asc(schema.materials.position)))
    .filter((m) => m.unitId && m.status === "published");
  return (
    <div>
      <PageHeader eyebrow={<>{ctx.current.cls.name} · edição {ctx.current.edition.label}</>} title="Aulas"
        lead="Quatro aulas e o trabalho final, cada uma com seus capítulos e páginas. As páginas essenciais são vistas em aula e as complementares aprofundam no seu estudo." />
      <div className="flex flex-col gap-6">
        {outline.map((u) => (
          <section key={u.id} className="card" aria-labelledby={`u-${u.id}`}>
            <div className="flex flex-wrap items-baseline justify-between gap-2 mb-3">
              <div>
                <p className="eyebrow">{rotuloUnidade(u)}</p>
                <h2 id={`u-${u.id}`}>{u.title}</h2>
              </div>
              <p className="hint max-w-[48ch]"><b>Entrega:</b> {u.deliverable}</p>
            </div>
            {u.chapters.length > 0 && <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {u.chapters.map((c) => {
                const ess = c.pages.filter((p) => p.level === "essencial");
                const mins = ess.reduce((s, p) => s + p.minutes, 0);
                return (
                  <article key={c.id} className="panel-soft flex flex-col gap-2" style={{ borderTop: `3px solid ${c.themeColor ?? "#00205B"}` }}>
                    <p className="eyebrow">Capítulo {c.number} · {mins} min essenciais · {c.pages.length} páginas</p>
                    <h3 className="text-[17px]"><Link href={`/aulas/capitulo/${c.number}`} className="no-underline hover:underline">{c.title}</Link></h3>
                    <p className="text-[14px] italic text-ink">{c.centralQuestion}</p>
                    <p className="text-[13.5px]">{c.learn}</p>
                    <div className="mt-auto flex flex-wrap gap-2 pt-1"><Link href={`/aulas/capitulo/${c.number}`} className="btn btn-secondary btn-sm">Abrir o capítulo</Link><Link href={`/aulas/${c.pages[0]?.slug ?? ""}`} className="btn btn-ghost btn-sm">Página 1</Link></div>
                    <details>
                      <summary className="cursor-pointer text-[13px] font-semibold text-ink min-h-[32px] flex items-center">Ver as páginas</summary>
                      <ol className="link-list mt-1 text-[13.5px] list-none p-0 m-0">
                        {c.pages.map((p) => (
                          <li key={p.id}><Link href={`/aulas/${p.slug}`} className="flex items-center gap-2"><span className="font-mono text-[11px] text-muted w-8 shrink-0">{p.slug}</span><span className="flex-1">{p.title}</span>{p.level === "complementar" && <Badge tone="muted">compl.</Badge>}</Link></li>
                        ))}
                      </ol>
                    </details>
                  </article>
                );
              })}
            </div>}
            {daUnidade.filter((m) => m.unitId === u.id).map((m) => (
              <article key={m.id} className="panel-soft flex flex-col gap-2 mt-4">
                <p className="eyebrow">{m.kind}</p>
                <h3 className="text-[17px]">{m.title}</h3>
                {m.description && <p className="text-[13.5px]">{m.description}</p>}
                {m.url && <p className="pt-1"><a className="btn btn-sm" href={m.url} target="_blank" rel="noreferrer">Abrir</a></p>}
              </article>
            ))}
          </section>
        ))}
      </div>
    </div>
  );
}
