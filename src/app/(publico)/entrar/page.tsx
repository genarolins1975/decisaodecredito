import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Entrar" };

export default async function EntrarPage({ searchParams }: { searchParams: Promise<{ next?: string; m?: string }> }) {
  const sp = await searchParams;
  return (
    <div className="card max-w-[440px] mx-auto">
      <p className="eyebrow mb-1">Acesso restrito</p>
      <h1 className="mb-1">Entrar</h1>
      <p className="hint mb-5">Somente alunos autorizados pelo professor. Primeiro acesso? Use o link ou o código recebido por e-mail em <Link href="/ativar">Ativar acesso</Link>.</p>
      {sp.m === "sessao" && <div className="callout callout-warn mb-4"><p className="text-[14px]">Sua sessão expirou ou foi encerrada. Entre novamente.</p></div>}
      {sp.m === "redefinida" && <div className="callout callout-ok mb-4" role="status"><p className="text-[14px]">Senha redefinida. Entre com a senha nova.</p></div>}
      <LoginForm next={sp.next} />
      <hr className="rule" />
      <p className="text-[14px]"><Link href="/senha/recuperar">Esqueci minha senha</Link></p>
    </div>
  );
}
