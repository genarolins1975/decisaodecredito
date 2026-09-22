import type { Metadata } from "next";
import Link from "next/link";
import { ResetForm } from "./reset-form";

export const metadata: Metadata = { title: "Redefinir senha" };

export default async function RedefinirPage({ searchParams }: { searchParams: Promise<{ t?: string }> }) {
  const { t } = await searchParams;
  return (
    <div className="card max-w-[440px] mx-auto">
      <p className="eyebrow mb-1">Acesso</p>
      <h1 className="mb-1">Nova senha</h1>
      <p className="hint mb-5">Escolha uma senha com pelo menos 10 caracteres. Todas as outras sessões serão encerradas.</p>
      {t ? <ResetForm token={t} /> : <p className="error-text">Link inválido ou incompleto. Abra o endereço inteiro recebido por e-mail ou peça um link novo.</p>}
      <hr className="rule" />
      <p className="text-[14px]"><Link href="/senha/recuperar">Pedir um link novo</Link> · <Link href="/entrar">Entrar</Link></p>
    </div>
  );
}
