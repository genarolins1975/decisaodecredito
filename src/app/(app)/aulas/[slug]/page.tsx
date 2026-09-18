import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireContext } from "@/lib/context";
import { getPage, neighbors } from "@/lib/services/content";
import { resolvePrerequisite } from "@/lib/content/prerequisites";
import { ContentBlocks } from "@/components/content/blocks";
import { TeacherGuide } from "@/components/content/teacher-guide";
import { Badge } from "@/components/ui";
import { PageNav } from "@/components/content/page-nav";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  return { title: `Página ${slug}` };
}

const ORIGIN: Record<string, string> = { sint: "Exemplo sintético", obs: "Dado observado", doc: "Documento institucional", esq: "Esquema sem escala", rec: "Reconstrução didática" };

export default async function AulaPaginaPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const ctx = await requireContext();
  const staff = ctx.current.role !== "aluno";
  const data = await getPage(ctx.current.edition.id, slug, staff);
  if (!data) notFound();
  const nav = await neighbors(ctx.current.edition.id, slug);
  const chapterPages = nav.all.filter((p) => p.chapterId === data.chapter.id);
  const idx = chapterPages.findIndex((p) => p.slug === slug);
  const theme = data.chapter.themeColor ?? "#00205B";
  const slugSet = new Set(nav.all.map((p) => p.slug));
  const titleOf = (s: string) => nav.all.find((p) => p.slug === s)?.title ?? s;
  const prereq = resolvePrerequisite(data.prerequisite, { chapter: data.chapter.number, pageNumber: idx + 1, slugs: slugSet });
  const capituloHref = `/aulas/capitulo/${data.chapter.number}`;
  return (
    <div className="grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
      <aside className="lg:sticky lg:top-[100px] self-start no-print" aria-label="Páginas do capítulo">
        <details className="lg:hidden panel-soft">
          <summary className="cursor-pointer font-semibold text-ink min-h-[44px] flex items-center">Capítulo {data.chapter.number} · página {idx + 1} de {chapterPages.length}</summary>
          <ol className="link-list list-none p-0 m-0 text-[13px] mt-2">
            {chapterPages.map((p, i) => <li key={p.id}><Link href={`/aulas/${p.slug}`} aria-current={p.slug === slug ? "page" : undefined}><span className="font-mono text-[11px] text-muted mr-2">{i + 1}</span>{p.title}</Link></li>)}
          </ol>
          <div className="mt-3 flex gap-2 flex-wrap"><Link href={capituloHref} className="btn btn-secondary btn-sm">Abertura do capítulo</Link><Link href={`/apresentacao/${slug}`} className="btn btn-secondary btn-sm">Ver em tela cheia</Link><Link href="/aulas" className="btn btn-ghost btn-sm">Todas as aulas</Link></div>
        </details>
        <div className="hidden lg:block">
          <Link href="/aulas" className="voltar mb-2">Aulas</Link>
          <p className="eyebrow mb-2">{data.unit.kind === "trabalho" ? "Trabalho final" : `Aula ${data.unit.number}`} · Capítulo {data.chapter.number}</p>
          <p className="font-serif font-bold text-ink text-[15px] mb-3"><Link href={capituloHref} className="no-underline hover:underline" title="Abertura do capítulo">{data.chapter.title}</Link></p>
          <ol className="link-list list-none p-0 m-0 text-[13px] max-h-[60vh] overflow-auto">
            {chapterPages.map((p, i) => <li key={p.id}><Link href={`/aulas/${p.slug}`} aria-current={p.slug === slug ? "page" : undefined}><span className="font-mono text-[11px] text-muted mr-2">{i + 1}</span>{p.title}</Link></li>)}
          </ol>
          <div className="mt-4 flex flex-col gap-2">
            <Link href={capituloHref} className="btn btn-secondary btn-sm">Abertura do capítulo</Link>
            <Link href={`/apresentacao/${slug}`} className="btn btn-secondary btn-sm">Ver em tela cheia</Link>
          </div>
        </div>
      </aside>
      <article className="min-w-0" style={{ ["--cap" as string]: theme, ["--cap-soft" as string]: data.chapter.themeSoft ?? "#EFF3FA" }}>
        <div className="border-l-[3px] pl-4" style={{ borderColor: theme }}>
          <p className="eyebrow flex flex-wrap gap-x-3 gap-y-1 items-center">
            <span>{data.chapter.title}</span><b>página {idx + 1} de {chapterPages.length}</b><span>{data.page.minutes} min</span>
            {data.page.level === "complementar" && <Badge tone="muted">complementar</Badge>}
            {data.page.origin && ORIGIN[data.page.origin] && <Badge tone="ink">{ORIGIN[data.page.origin]}</Badge>}
          </p>
          <h1 className="mt-2">{data.version.title}</h1>
          {data.version.objective && <p className="mt-3 text-[15px]"><span className="eyebrow text-[#7a5f16] mr-2">Objetivo</span>{data.version.objective}</p>}
          {data.version.support && <p className="mt-2 text-[16px] max-w-[66ch]">{data.version.support}</p>}
          {prereq && (
            <p className="mt-3 text-[14px] text-muted max-w-[72ch]" data-testid="prerequisito">
              <span className="eyebrow text-[#7a5f16] mr-2">Antes desta página</span>
              {prereq.filter((s) => s.text).map((s, i) => s.slug ? <Link key={i} href={`/aulas/${s.slug}`} title={titleOf(s.slug)} className="font-semibold">{s.text}</Link> : <span key={i}>{s.text}</span>)}
            </p>
          )}
        </div>
        {idx === 0 && (
          <p className="mt-5 callout text-[14px]" data-testid="abertura-capitulo"><span className="eyebrow mr-2">Abertura</span>Pergunta central, o que se aprende, infográfico e mapa das páginas estão na <Link href={capituloHref} className="font-semibold">página do capítulo</Link>.</p>
        )}
        <div className="mt-6">
          <h2 className="sr-only">Conteúdo da página</h2>
          <ContentBlocks blocks={data.blocks} questions={data.questions} classId={ctx.current.classId} pageSlug={slug} />
        </div>
        {data.questions.find((q) => q.slug === `${slug}-checagem`) && (
          <div className="mt-6">
            <ContentBlocks blocks={[{ type: "question", slug: `${slug}-checagem` }]} questions={data.questions} classId={ctx.current.classId} />
          </div>
        )}
        {data.version.connection && nav.next && <p className="mt-6 pt-3 border-t border-rule font-serif italic text-ink"><span className="eyebrow not-italic mr-2">A seguir</span>{data.version.connection}</p>}
        {staff && data.teacherGuide && <TeacherGuide guide={data.teacherGuide} />}
        <PageNav prev={nav.prev ? { href: `/aulas/${nav.prev.slug}`, title: nav.prev.title } : null} next={nav.next ? { href: `/aulas/${nav.next.slug}`, title: nav.next.title } : null} position={`${nav.index + 1} de ${nav.total}`} />
      </article>
    </div>
  );
}
