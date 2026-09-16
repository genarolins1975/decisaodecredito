import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { ProfileForm } from "@/components/profile-form";

export const metadata: Metadata = { title: "Complete seu perfil" };

export default async function PrimeiroAcessoPage() {
  const u = await getCurrentUser();
  if (!u) redirect("/entrar");
  if (u.mustChangePassword) redirect("/senha/definir");
  return (
    <div className="card">
      <p className="eyebrow mb-1">Perfil · opcional</p>
      <h1 className="mb-1">Olá, {u.name.split(" ")[0]}</h1>
      <p className="hint mb-5">Nome e e-mail vêm do cadastro autorizado pelo professor. Telefone e LinkedIn são facultativos: ajudam o professor a contatar você e a conhecer o seu perfil profissional. Ficam visíveis apenas para você e para o professor, nunca para colegas, e não entram em relatórios acadêmicos.</p>
      <ProfileForm firstAccess />
    </div>
  );
}
