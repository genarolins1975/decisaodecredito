import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { TRABALHO_1, devolutiva } from "@/lib/avaliacoes/trabalho-1";
import { vinculoTrabalho1 } from "@/lib/services/avaliacoes";
import { PageHeader } from "@/components/ui";
import { DevolutivaTrabalho1 } from "@/components/avaliacoes/devolutiva";

export const metadata: Metadata = { title: "Trabalho 1: devolutiva" };

/** Prévia do professor: a mesma tela que o aluno abre em Trabalhos, com o estado do vínculo. */
export default async function Trabalho1Previa({ params }: { params: Promise<{ aluno: string }> }) {
  const { aluno } = await params;
  const d = devolutiva(aluno);
  if (!d) notFound();
  const v = await vinculoTrabalho1();
  const r = v.porAluno[aluno];
  const m = r?.status === "vinculado" ? v.matriculas.get(r.candidatoId) : null;
  return (
    <div>
      <Link href="/professor/trabalho-1" className="voltar">Trabalho 1: consolidação</Link>
      <PageHeader eyebrow={<>Prévia do professor · {d.aluno.nome}</>} title={TRABALHO_1.titulo} lead={TRABALHO_1.subtitulo} />
      <div className={`callout ${m ? "callout-ok" : "callout-warn"} mb-5 text-[14.5px]`}>
        {m ? <>Esta é a tela que <b>{m.nome}</b> ({m.email}) vê em Trabalhos, na turma {v.turma?.name}.</>
          : <>Esta devolutiva ainda não chega ao aluno: {r?.status === "ambiguo" ? "o nome casa com mais de uma matrícula" : v.turma ? "nenhuma matrícula da turma casa com o nome" : "nenhuma turma foi atribuída ao Trabalho 1"}. Veja o vínculo na consolidação.</>}
      </div>
      <DevolutivaTrabalho1 d={d} />
    </div>
  );
}
