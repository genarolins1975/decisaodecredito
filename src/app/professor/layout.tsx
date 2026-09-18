import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { getCurrentUser } from "@/lib/auth/session";
import { listAccessibleClasses } from "@/lib/auth/guard";
import { cookies } from "next/headers";
import { CLASS_COOKIE } from "@/lib/context";

/** Cinco lugares. Início mostra o que fazer agora (iniciar a aula, corrigir, convidar). */
const NAV = [
  { href: "/professor", label: "Início", exact: true },
  { href: "/professor/turmas", label: "Turmas" },
  { href: "/professor/conteudo", label: "Conteúdo" },
  { href: "/professor/bases", label: "Bases e gabaritos" },
  { href: "/professor/configuracoes", label: "E-mail" },
];

/** Área do professor: exige staff global. Monitores usam a área do aluno com permissões extras por turma. */
export default async function ProfessorLayout({ children }: { children: ReactNode }) {
  const u = await getCurrentUser();
  if (!u) redirect("/entrar?m=sessao");
  if (u.mustChangePassword) redirect("/senha/definir");
  if (!u.isStaff) redirect("/inicio");
  const list = await listAccessibleClasses(u);
  const classes = list.map((c) => ({ id: c.cls.id, code: c.cls.code, name: c.cls.name, label: c.edition.label }));
  const c = await cookies();
  const cur = c.get(CLASS_COOKIE)?.value ?? null;
  return (
    <AppShell nav={NAV} user={u} classes={classes} currentClassId={cur} contextLabel="Área do professor" area="professor">{children}</AppShell>
  );
}
