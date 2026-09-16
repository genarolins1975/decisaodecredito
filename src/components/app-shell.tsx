import Link from "next/link";
import type { ReactNode } from "react";
import { Brand } from "@/components/brand";
import { ClassSwitcher } from "@/components/class-switcher";
import { NavLinks } from "@/components/nav-links";
import { LogoutButton } from "@/components/logout-button";

export type NavItem = { href: string; label: string; exact?: boolean };

export function AppShell({ children, nav, user, classes, currentClassId, contextLabel, area }: {
  children: ReactNode; nav: NavItem[]; user: { name: string; email: string; isStaff: boolean };
  classes: { id: string; name: string; code: string; label: string }[]; currentClassId: string | null; contextLabel: string; area: "aluno" | "professor";
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-ink text-white sticky top-0 z-40">
        <div className="max-w-[1400px] mx-auto px-4 py-2 flex items-center gap-3 flex-wrap min-h-[52px]">
          <Brand light sub={contextLabel} />
          <div className="flex-1" />
          <ClassSwitcher classes={classes} currentId={currentClassId} />
          {user.isStaff && (
            <Link href={area === "professor" ? "/inicio" : "/professor"} className="text-[12.5px] text-white/85 underline underline-offset-4 touch inline-flex items-center px-2">
              {area === "professor" ? "Ver como aluno" : "Painel do professor"}
            </Link>
          )}
          <Link href="/perfil" className="text-[12.5px] text-white/85 touch inline-flex items-center px-2 no-underline hover:underline">{user.name.split(" ")[0]}</Link>
          <LogoutButton />
        </div>
        <nav aria-label="Navegação principal" className="border-t border-white/15">
          <div className="max-w-[1400px] mx-auto px-2 overflow-x-auto"><NavLinks items={nav} /></div>
        </nav>
      </header>
      <main id="conteudo" className="flex-1 w-full max-w-[1400px] mx-auto px-4 py-6">{children}</main>
      <footer className="px-4 py-5 text-center hint no-print">Prof. Genaro Dueire Lins · Laboratório de Decisão de Crédito · <Link href="/ajuda">Ajuda</Link> · <Link href="/privacidade">Privacidade</Link></footer>
    </div>
  );
}
