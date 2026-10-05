import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireContext } from "@/lib/context";
import { devolutivaDoUsuario } from "@/lib/services/avaliacoes";
import { TRABALHO_1 } from "@/lib/avaliacoes/trabalho-1";
import { PageHeader } from "@/components/ui";
import { DevolutivaTrabalho1 } from "@/components/avaliacoes/devolutiva";

export const metadata: Metadata = { title: "Trabalho 1: resultado" };

/** Resultado do Trabalho 1 do próprio aluno. Sem vínculo único com a devolutiva, a página não existe para ele. */
export default async function Trabalho1Page() {
  const ctx = await requireContext();
  const d = await devolutivaDoUsuario(ctx.current.classId, ctx.user.id);
  if (!d) notFound();
  return (
    <div>
      <Link href="/trabalhos" className="voltar">Trabalhos</Link>
      <PageHeader eyebrow={<>{ctx.current.cls.name} · resultado publicado</>} title={TRABALHO_1.titulo} lead={TRABALHO_1.subtitulo} />
      <DevolutivaTrabalho1 d={d} />
    </div>
  );
}
