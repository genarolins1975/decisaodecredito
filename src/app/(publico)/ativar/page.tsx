import type { Metadata } from "next";
import Link from "next/link";
import { ActivateForm } from "./activate-form";

export const metadata: Metadata = { title: "Ativar acesso" };

export default async function AtivarPage({ searchParams }: { searchParams: Promise<{ t?: string }> }) {
  const { t } = await searchParams;
  return (
    <div className="card max-w-[440px] mx-auto">
      <p className="eyebrow mb-1">Primeiro acesso</p>
      <h1 className="mb-1">Ativar acesso</h1>
      <p className="hint mb-5">Use o código de primeiro acesso recebido por e-mail. Ele é individual, vale por tempo limitado e só funciona uma vez. Em seguida você definirá a sua senha pessoal.</p>
      <ActivateForm initialCode={t ?? ""} />
      <hr className="rule" />
      <p className="text-[14px]">Já definiu a senha? <Link href="/entrar">Entrar</Link></p>
    </div>
  );
}
