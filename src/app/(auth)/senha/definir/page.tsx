import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { SetPasswordForm } from "./set-form";

export const metadata: Metadata = { title: "Definir senha" };

export default async function DefinirSenhaPage() {
  const u = await getCurrentUser();
  if (!u) redirect("/entrar");
  if (!u.mustChangePassword) redirect("/inicio");
  return (
    <div className="card">
      <p className="eyebrow mb-1">Primeiro acesso · {u.email}</p>
      <h1 className="mb-1">Defina a sua senha pessoal</h1>
      <p className="hint mb-5">A credencial temporária foi validada e não funciona mais. A senha que você escolher é só sua: o professor não a vê e ela nunca será enviada por e-mail.</p>
      <SetPasswordForm />
    </div>
  );
}
