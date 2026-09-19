import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireContext } from "@/lib/context";
import { getPage, neighbors } from "@/lib/services/content";
import { Slide } from "@/components/content/slide";
import { infograficoDoCapitulo } from "@/lib/content/infograficos";
import { PALCO_PROPRIO } from "@/lib/visuais/palco-proprio";

export const metadata: Metadata = { title: "Apresentação" };

/** Modo apresentação 16:9: tela cheia, teclado, notas do professor privadas. */
export default async function ApresentacaoPage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ sessao?: string }> }) {
  const { slug } = await params;
  const { sessao } = await searchParams;
  const ctx = await requireContext();
  const staff = ctx.current.role !== "aluno";
  const data = await getPage(ctx.current.edition.id, slug, staff);
  if (!data) notFound();
  const nav = await neighbors(ctx.current.edition.id, slug);
  const chapterPages = nav.all.filter((p) => p.chapterId === data.chapter.id);
  const pageIndex = chapterPages.findIndex((p) => p.slug === slug) + 1;
  const infografico = pageIndex === 1 && !PALCO_PROPRIO.has(slug) ? infograficoDoCapitulo(data.chapter.number) : null;
  return (
    <Slide
      slug={slug} title={data.version.title} objective={data.version.objective} support={data.version.support} connection={data.version.connection}
      chapter={{ number: data.chapter.number, title: data.chapter.title, color: data.chapter.themeColor ?? "#00205B", soft: data.chapter.themeSoft ?? "#EFF3FA" }}
      unitLabel={data.unit.kind === "trabalho" ? "Trabalho final" : `Aula ${data.unit.number}`}
      pageIndex={pageIndex} pageCount={chapterPages.length} infografico={infografico}
      blocks={data.blocks} questions={data.questions} classId={ctx.current.classId}
      prev={nav.prev?.slug ?? null} next={nav.next?.slug ?? null} position={`${nav.index + 1}/${nav.total}`}
      teacherGuide={staff ? (data.teacherGuide ?? null) : null} sessionId={sessao ?? null} isStaff={staff}
      minutes={data.page.minutes} level={data.page.level}
    />
  );
}
