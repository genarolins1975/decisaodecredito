import { handle, json } from "@/lib/api";
import { requireStaff } from "@/lib/auth/guard";
import { processEmailQueue, provider } from "@/lib/email/queue";

/** Processa a fila dentro da requisição: precisa de mais que os 10 s padrão da função. */
export const maxDuration = 60;

export const POST = handle(async () => {
  await requireStaff();
  const ready = await provider().ready();
  return json({ ready, processed: ready.ok ? await processEmailQueue(50) : null });
});
