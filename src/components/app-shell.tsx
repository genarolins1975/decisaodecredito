import Link from "next/link";
import type { ReactNode } from "react";
import { Brand } from "@/components/brand";
import { ClassSwitcher } from "@/components/class-switcher";
import { NavLinks } from "@/components/nav-links";
import { LogoutButton } from "@/components/logout-button";

export type NavItem = { href: string; label: string; exact?: boolean };

/**
 * Moldura das áreas autenticadas. Uma barra só: marca, poucos destinos com nome de lugar, turma e conta.
 * O professor tem a mesma barra com uma faixa dourada; ao "ver como aluno" aparece um aviso com o caminho de volta.
 */
export function AppShell({ children, nav, user, classes, currentClassId, contextLabel, area }: {
  children: ReactNode; nav: NavItem[]; user: { name: string; email: string; isStaff: boolean };
  classes: { id: string; name: string; code: string; label: string }[]; currentClassId: string | null; contextLabel: string; area: "aluno" | "professor";
}) {
  return (
    <div className="min-h-screen flex flex-col" data-area={area}>
      <header className={`${area === "professor" ? "bg-[#1B2A3A] border-b-2 border-gold" : "bg-ink"} text-white sticky top-0 z-40`}>
        {area === "professor" && <p className="m-0 bg-gold text-ink text-[11px] font-bold tracking-[0.12em] uppercase text-center py-[2px]">Área do professor</p>}
        {area === "aluno" && user.isStaff && (
          <p className="m-0 bg-[#FBF1E3] text-ink text-[13px] text-center py-1.5 px-3">
            Você está vendo a plataforma como aluno. <Link href="/professor" className="font-semibold">Voltar à área do professor</Link>
          </p>
        )}
        <div className="max-w-[1400px] mx-auto px-4 flex items-center gap-x-4 gap-y-0 flex-wrap min-h-[52px]">
          <Brand light sub={contextLabel} />
          <nav aria-label="Navegação principal" className="order-last w-full lg:order-none lg:w-auto lg:flex-1 overflow-x-auto border-t border-white/10 lg:border-0">
            <NavLinks items={nav} />
          </nav>
          <div className="ml-auto flex items-center flex-wrap justify-end gap-0 text-[13px] min-w-0">
            <ClassSwitcher classes={classes} currentId={currentClassId} />
            {user.isStaff && area === "professor" && <Link href="/inicio" className="text-white/85 touch inline-flex items-center px-2 no-underline hover:underline whitespace-nowrap">Ver como aluno</Link>}
            <Link href="/perfil" className="text-white/85 touch inline-flex items-center px-2 no-underline hover:underline">{user.name.split(" ")[0]}</Link>
            <LogoutButton />
          </div>
        </div>
      </header>
      <main id="conteudo" className="flex-1 w-full max-w-[1400px] mx-auto px-4 py-6">{children}</main>
      <footer className="px-4 py-5 text-center hint no-print">Prof. Genaro Dueire Lins · Laboratório de Decisão de Crédito · <Link href="/ajuda">Ajuda</Link> · <Link href="/privacidade">Privacidade</Link></footer>
    </div>
  );
}
