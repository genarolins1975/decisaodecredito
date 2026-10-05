import type { Metadata } from "next";
import Link from "next/link";
import { eq } from "drizzle-orm";
import { requireContext } from "@/lib/context";
import { db, schema } from "@/lib/db/client";
import { devolutivaDoUsuario } from "@/lib/services/avaliacoes";
import { TRABALHO_1 } from "@/lib/avaliacoes/trabalho-1";
import { PageHeader } from "@/components/ui";
import { DevolutivaTrabalho1 } from "@/components/avaliacoes/devolutiva";

export const metadata: Metadata = { title: "Trabalho 1: resultado" };

/**
 * Resultado do Trabalho 1 do próprio aluno. Sem vínculo único com a devolutiva, a página não mostra nota nenhuma
 * e diz ao aluno com que nome e e-mail ele está cadastrado, que é o que o professor precisa para fazer o vínculo.
 */
export default async function Trabalho1Page() {
  const ctx = await requireContext();
  const d = await devolutivaDoUsuario(ctx.current.classId, ctx.user.id);
  if (!d) {
    const [enr] = ctx.current.enrollmentId ? await db.select({ name: schema.enrollments.name, email: schema.enrollments.email }).from(schema.enrollments).where(eq(schema.enrollments.id, ctx.current.enrollmentId)) : [];
    const nome = enr?.name && !enr.name.includes("@") ? enr.name : ctx.user.name;
    return (
      <div>
        <Link href="/trabalhos" className="voltar">Trabalhos</Link>
        <PageHeader eyebrow={<>{ctx.current.cls.name}</>} title={TRABALHO_1.titulo} />
        <section className="card border-l-[4px]! border-l-gold! max-w-[44rem]">
          <h2 className="text-lg">Ainda não encontramos uma nota do Trabalho 1 para o seu cadastro</h2>
          <p className="text-[15px] mt-2">A nota é ligada ao aluno pelo nome e pelo e-mail da matrícula. Se você entregou o Trabalho 1, envie esta tela ao professor para que ele faça o vínculo.</p>
          <dl className="mt-4 grid gap-2 text-[15px] sm:grid-cols-[8rem_1fr]">
            <dt className="eyebrow sm:pt-1">Nome</dt><dd className="font-semibold text-ink">{nome}</dd>
            <dt className="eyebrow sm:pt-1">E-mail</dt><dd className="font-semibold text-ink break-all">{enr?.email ?? ctx.user.email}</dd>
            <dt className="eyebrow sm:pt-1">Turma</dt><dd>{ctx.current.cls.name} <span className="hint">({ctx.current.cls.code})</span></dd>
          </dl>
        </section>
      </div>
    );
  }
  return (
    <div>
      <Link href="/trabalhos" className="voltar">Trabalhos</Link>
      <PageHeader eyebrow={<>{ctx.current.cls.name} · resultado publicado</>} title={TRABALHO_1.titulo} lead={TRABALHO_1.subtitulo} />
      <DevolutivaTrabalho1 d={d} />
    </div>
  );
}
