import type { ReactNode } from "react";
import { AppShell } from "@/components/app-shell";
import { appContext } from "@/lib/context";

const NAV = [
  { href: "/inicio", label: "Visão geral" },
  { href: "/aulas", label: "Aulas" },
  { href: "/trabalhos", label: "Trabalhos" },
  { href: "/materiais", label: "Materiais" },
  { href: "/acompanhamento", label: "Meu acompanhamento" },
];

export default async function AppLayout({ children }: { children: ReactNode }) {
  const ctx = await appContext();
  const label = ctx.current ? `${ctx.current.cls.name} · ${ctx.current.edition.label}` : "Sem turma ativa";
  return (
    <AppShell nav={NAV} user={ctx.user} classes={ctx.classes} currentClassId={ctx.current?.classId ?? null} contextLabel={label} area="aluno">
      {children}
    </AppShell>
  );
}
