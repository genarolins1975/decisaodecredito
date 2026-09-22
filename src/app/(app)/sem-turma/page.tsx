import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Sem turma ativa" };

/** Seis lugares da barra exigem turma e devolvem para cá: esta tela precisa oferecer saída própria. */
export default function SemTurmaPage() {
  return (
    <div className="card max-w-[760px]">
      <p className="eyebrow">Sem turma ativa</p>
      <h1 className="mt-1">Nenhuma turma ativa para este acesso</h1>
      <p className="mt-3">Sua conta existe, mas não há matrícula ativa vinculada ao seu e-mail. Se você foi convidado, use o link do e-mail ou o código de primeiro acesso para ativar. Se a matrícula foi encerrada, fale com o professor.</p>
      <p className="mt-2 hint">Enquanto não houver turma ativa, Início, Aulas, Ao vivo, Trabalhos, Materiais e Notas e presença trazem você de volta a esta tela.</p>
      <div className="mt-4 flex gap-2 flex-wrap">
        <Link href="/ativar" className="btn">Ativar acesso</Link>
        <Link href="/ajuda" className="btn btn-secondary">Ajuda</Link>
        <Link href="/perfil" className="btn btn-ghost">Meus dados</Link>
      </div>
    </div>
  );
}
