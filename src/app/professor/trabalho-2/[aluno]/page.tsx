import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { TRABALHO_2, devolutivaT2 } from "@/lib/avaliacoes/trabalho-2";
import { vinculoTrabalho2 } from "@/lib/services/avaliacoes";
import { PageHeader } from "@/components/ui";
import { DevolutivaTrabalho2 } from "@/components/avaliacoes/devolutiva-t2";

export const metadata: Metadata = { title: "Trabalho 2: devolutiva" };

/** Prévia do professor: a mesma tela que o aluno abre em Trabalhos, com o estado do vínculo. */
export default async function Trabalho2Previa({ params }: { params: Promise<{ aluno: string }> }) {
  const { aluno } = await params;
  const d = devolutivaT2(aluno);
  if (!d) notFound();
  const v = await vinculoTrabalho2();
  const r = v.porAluno[aluno];
  const m = r?.status === "vinculado" ? v.matriculas.get(r.candidatoId) : null;
  return (
    <div>
      <Link href="/professor/trabalho-2" className="voltar">Trabalho 2: consolidação</Link>
      <PageHeader eyebrow={<>Prévia do professor · {d.aluno.nome}</>} title={TRABALHO_2.titulo} lead={TRABALHO_2.subtitulo} />
      <div className={`callout ${m ? "callout-ok" : "callout-warn"} mb-5 text-[14.5px]`}>
        {m ? <>Esta é a tela que <b>{m.nome}</b> ({m.email}) vê em Trabalhos, na turma {v.turma?.name}.</>
          : <>Esta devolutiva ainda não chega ao aluno: {r?.status === "ambiguo" ? "o e-mail casa com mais de uma matrícula" : v.turma ? "nenhuma matrícula da turma casa com o e-mail" : "nenhuma turma foi atribuída ao Trabalho 2"}. Veja o vínculo na consolidação.</>}
      </div>
      <DevolutivaTrabalho2 d={d} />
    </div>
  );
}
