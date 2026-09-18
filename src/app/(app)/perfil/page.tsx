import type { Metadata } from "next";
import { appContext } from "@/lib/context";
import { PageHeader } from "@/components/ui";
import { ProfileForm } from "@/components/profile-form";
import { ChangePasswordForm } from "./change-password";

export const metadata: Metadata = { title: "Perfil" };

export default async function PerfilPage() {
  const ctx = await appContext();
  return (
    <div className="max-w-[720px]">
      <PageHeader eyebrow="Conta" title="Meus dados" lead={`${ctx.user.name} · ${ctx.user.email}. Nome e e-mail vêm do cadastro autorizado; para alterá-los fale com o professor.`} />
      <section className="card mb-6" aria-labelledby="dados-opcionais">
        <h2 id="dados-opcionais" className="text-lg mb-1">Dados opcionais</h2>
        <p className="hint mb-4">Visíveis apenas para você e para o professor. Você pode remover a qualquer momento deixando o campo vazio.</p>
        <ProfileForm />
      </section>
      <section className="card" aria-labelledby="senha">
        <h2 id="senha" className="text-lg mb-1">Trocar a senha</h2>
        <p className="hint mb-4">Ao trocar, as demais sessões abertas são encerradas.</p>
        <ChangePasswordForm />
      </section>
      <section className="mt-6 hint">
        <p>Suas turmas: {ctx.classes.map((c) => `${c.name} (${c.code}, ${c.role})`).join("; ") || "nenhuma"}.</p>
      </section>
    </div>
  );
}
