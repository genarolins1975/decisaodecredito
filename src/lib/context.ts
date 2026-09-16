import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { listAccessibleClasses, requireClassAccess, type ClassAccess, type ClassRole } from "@/lib/auth/guard";
import { getCurrentUser, type CurrentUser } from "@/lib/auth/session";

export const CLASS_COOKIE = "turma";

export type AppContext = {
  user: CurrentUser;
  classes: { id: string; code: string; name: string; year: number; label: string; role: ClassRole; status: string }[];
  current: ClassAccess | null;
};

/** Contexto do aluno/monitor: usuário ativo + turma selecionada (só entre as autorizadas). */
export async function appContext(): Promise<AppContext> {
  const user = await getCurrentUser();
  if (!user) redirect("/entrar?m=sessao");
  if (user.mustChangePassword) redirect("/senha/definir");
  const list = await listAccessibleClasses(user);
  const classes = list.map((c) => ({ id: c.cls.id, code: c.cls.code, name: c.cls.name, year: c.edition.year, label: c.edition.label, role: c.role, status: c.cls.status }));
  const c = await cookies();
  const wanted = c.get(CLASS_COOKIE)?.value;
  const pick = classes.find((x) => x.id === wanted) ?? classes.find((x) => x.status === "active") ?? classes[0] ?? null;
  const current = pick ? await requireClassAccess(pick.id) : null;
  return { user, classes, current };
}

export async function requireContext(): Promise<AppContext & { current: ClassAccess }> {
  const ctx = await appContext();
  if (!ctx.current) redirect("/sem-turma");
  return ctx as AppContext & { current: ClassAccess };
}
