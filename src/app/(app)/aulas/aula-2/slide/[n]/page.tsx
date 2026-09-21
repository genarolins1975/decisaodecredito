import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { requireContext } from "@/lib/context";
import { courseOutline, flatPages } from "@/lib/services/content";
import { blocosDe, hrefSlide, normalizarSlide, notasAula2, publicos, roteiros } from "@/lib/content/aula-2";
import { ehAulaEmSlides } from "@/lib/content/capitulo";
import { AulaSlides } from "@/components/aulas/aula-2-slides";

export async function generateMetadata({ params }: { params: Promise<{ n: string }> }): Promise<Metadata> {
  const { n } = await params;
  const id = normalizarSlide(n);
  return { title: id ? `Aula 2 · slide ${id}` : "Aula 2" };
}

/** Um slide da Aula 2 com a moldura das páginas: o baralho embutido, a lista lateral e o roteiro do professor. */
export default async function SlideAula2Page({ params }: { params: Promise<{ n: string }> }) {
  const { n } = await params;
  const id = normalizarSlide(n);
  if (!id) notFound();
  if (n !== id) redirect(hrefSlide(id));
  const ctx = await requireContext();
  const staff = ctx.current.role !== "aluno";
  const { slides: notas } = await notasAula2();
  if (!notas.some((s) => s.n === id)) notFound();
  const slides = publicos(notas);
  const [outline, paginas] = await Promise.all([courseOutline(ctx.current.edition.id), flatPages(ctx.current.edition.id)]);
  const unidade = outline.find(ehAulaEmSlides);
  const titulos: Record<string, string> = Object.fromEntries(paginas.map((p) => [p.slug, p.title]));
  return (
    <AulaSlides slides={slides} blocos={blocosDe(slides)} inicial={id} userId={ctx.user.id} titulos={titulos}
      roteiros={staff ? roteiros(notas) : null} unidadeTitulo={unidade?.title ?? "Entender as três técnicas"} />
  );
}
