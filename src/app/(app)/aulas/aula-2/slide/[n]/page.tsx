import { redirect } from "next/navigation";
import { requireContext } from "@/lib/context";
import { courseOutline } from "@/lib/services/content";
import { ROTEIRO_AULA_2 } from "@/lib/content/roteiro-aula-2";

/**
 * Endereço antigo de um slide da Aula 2. O slide continua existindo no baralho, em /slides/aula-2,
 * mas na plataforma o conteúdo dele é a página do capítulo que ele cobre: é para lá que este vai,
 * pelo roteiro. Slide sem página mapeada cai no primeiro capítulo da aula.
 */
export default async function SlideAntigo({ params }: { params: Promise<{ n: string }> }) {
  const { n } = await params;
  const ctx = await requireContext();
  const pagina = ROTEIRO_AULA_2.find((s) => s.n === String(n).padStart(2, "0"))?.paginas[0];
  if (pagina) redirect(`/aulas/${pagina}`);
  const outline = await courseOutline(ctx.current.edition.id);
  const primeiro = outline.find((u) => u.kind === "aula" && u.number === 2)?.chapters[0]?.number;
  redirect(primeiro ? `/aulas/capitulo/${primeiro}` : "/aulas");
}
