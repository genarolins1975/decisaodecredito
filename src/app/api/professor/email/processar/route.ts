import { handle, json } from "@/lib/api";
import { requireStaff } from "@/lib/auth/guard";
import { processEmailQueue, provider } from "@/lib/email/queue";

export const POST = handle(async () => {
  await requireStaff();
  const ready = await provider().ready();
  return json({ ready, processed: ready.ok ? await processEmailQueue(50) : null });
});
