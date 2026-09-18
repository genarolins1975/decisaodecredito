import { handle, json } from "@/lib/api";
import { requireClassAccess } from "@/lib/auth/guard";
import { startSession } from "@/lib/services/live";

/** Um clique para começar a aula: reaproveita a sessão aberta ou em rascunho do encontro, senão cria, e a abre. */
export const POST = handle(async (_req, ctx: { params: Promise<{ id: string; mid: string }> }) => {
  const { id, mid } = await ctx.params;
  const access = await requireClassAccess(id, ["professor"]);
  const sessionId = await startSession(mid, id, access.user.id);
  return json({ ok: true, sessionId });
});
