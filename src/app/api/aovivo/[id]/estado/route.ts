import { handle, json } from "@/lib/api";
import { requireClassAccess } from "@/lib/auth/guard";
import { getSession, studentState, teacherState } from "@/lib/services/live";

/** Estado da sessão (fallback de atualização periódica). Alunos recebem só agregados próprios. */
export const GET = handle(async (_req, ctx: { params: Promise<{ id: string }> }) => {
  const { id } = await ctx.params;
  const s = await getSession(id);
  const access = await requireClassAccess(s.classId);
  if (access.role === "aluno") return json(await studentState(id, access.user.id));
  return json(await teacherState(id));
});
