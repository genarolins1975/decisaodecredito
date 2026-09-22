import { redirect } from "next/navigation";
import { requireContext } from "@/lib/context";
import { courseOutline } from "@/lib/services/content";

/**
 * Endereço antigo da Aula 2, de quando ela não tinha capítulos e recebia uma moldura própria.
 * Hoje a aula tem os capítulos 4, 5 e 6, como as outras, então o endereço leva ao primeiro deles.
 */
export default async function AulaDoisAntiga() {
  const ctx = await requireContext();
  const outline = await courseOutline(ctx.current.edition.id);
  const unidade = outline.find((u) => u.kind === "aula" && u.number === 2);
  const primeiro = unidade?.chapters[0]?.number;
  redirect(primeiro ? `/aulas/capitulo/${primeiro}` : "/aulas");
}
