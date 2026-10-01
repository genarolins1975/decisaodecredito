import { handle, json } from "@/lib/api";
import { ApiError, requireStaff } from "@/lib/auth/guard";
import { issueTempPassword } from "@/lib/services/enrollment";
import { processEmailQueue, provider } from "@/lib/email/queue";
import { fmtDT } from "@/lib/time";

/** Processa a fila dentro da requisição: precisa de mais que os 10 s padrão da função. */
export const maxDuration = 60;

export const POST = handle(async (_req, ctx: { params: Promise<{ id: string; eid: string }> }) => {
  const u = await requireStaff();
  const { id, eid } = await ctx.params;
  // sem remetente a senha antiga seria trocada e o aluno ficaria sem acesso até o Gmail voltar
  const ready = await provider().ready();
  if (!ready.ok) throw new ApiError(400, `Gmail não conectado (${ready.reason}). Conecte em E-mail antes de redefinir a senha.`, "no_sender");
  const r = await issueTempPassword(id, eid, u.id);
  const processed = await processEmailQueue(50);
  return json({ ok: true, email: r.email, expiresAt: r.expiresAt,
    note: `Senha provisória enviada para ${r.email}, válida até ${fmtDT(r.expiresAt)}. ${processed.failed ? "O Gmail recusou o envio: confira a coluna Último envio." : "Mensagem aceita pelo Gmail não equivale a entrega comprovada."}` });
});
