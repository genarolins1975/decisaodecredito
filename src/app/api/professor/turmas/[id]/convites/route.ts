import { z } from "zod";
import { handle, json, parseBody } from "@/lib/api";
import { requireStaff } from "@/lib/auth/guard";
import { issueInvites } from "@/lib/services/enrollment";
import { processEmailQueue, provider } from "@/lib/email/queue";

/** Processa a fila dentro da requisição: precisa de mais que os 10 s padrão da função. */
export const maxDuration = 60;

export const POST = handle(async (req, ctx: { params: Promise<{ id: string }> }) => {
  const u = await requireStaff();
  const { id } = await ctx.params;
  const b = await parseBody(req, z.object({ enrollmentIds: z.array(z.string()).min(1).max(500) }));
  const results = await issueInvites(id, b.enrollmentIds, u.id);
  const ready = await provider().ready();
  const processed = ready.ok ? await processEmailQueue(50) : null;
  return json({ results, sender: ready, processed, note: ready.ok ? "Mensagens aceitas pelo Gmail não equivalem a entrega comprovada ao destinatário." : `Convites ficaram na fila: ${ready.reason}` });
});
