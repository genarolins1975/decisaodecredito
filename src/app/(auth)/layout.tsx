import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { Brand } from "@/components/brand";

/** Telas de transição (senha inicial, perfil opcional): exigem sessão, mas não senha definida. */
export default async function AuthLayout({ children }: { children: ReactNode }) {
  const u = await getCurrentUser();
  if (!u) redirect("/entrar?m=sessao");
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-ink text-white px-4 py-3"><Brand light sub={u.email} /></header>
      <main id="conteudo" className="flex-1 flex items-start justify-center px-4 py-10"><div className="w-full max-w-[520px]">{children}</div></main>
    </div>
  );
}
