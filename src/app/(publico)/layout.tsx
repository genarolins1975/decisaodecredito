import type { ReactNode } from "react";
import { Brand } from "@/components/brand";

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-ink text-white px-4 py-3"><Brand light /></header>
      <main id="conteudo" className="flex-1 flex items-start justify-center px-4 py-10">
        <div className="w-full max-w-[440px]">{children}</div>
      </main>
      <footer className="px-4 py-6 text-center hint">Prof. Genaro Dueire Lins · Laboratório de Decisão de Crédito · Acesso restrito a alunos matriculados.</footer>
    </div>
  );
}
