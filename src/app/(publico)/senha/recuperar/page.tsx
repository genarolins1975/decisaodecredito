import type { Metadata } from "next";
import Link from "next/link";
import { RecoverForm } from "./recover-form";

export const metadata: Metadata = { title: "Recuperar senha" };

export default function RecuperarPage() {
  return (
    <div className="card max-w-[440px] mx-auto">
      <p className="eyebrow mb-1">Acesso</p>
      <h1 className="mb-1">Recuperar senha</h1>
      <p className="hint mb-5">Informe o e-mail cadastrado. Se houver uma conta ativa, enviaremos um link temporário para definir uma nova senha. A senha antiga nunca é enviada.</p>
      <RecoverForm />
      <hr className="rule" />
      <p className="text-[14px]"><Link href="/entrar">Voltar para entrar</Link></p>
    </div>
  );
}
