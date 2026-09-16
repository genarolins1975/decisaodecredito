import { z } from "zod";
import { handle, json, parseBody } from "@/lib/api";
import { ApiError, requireStaff } from "@/lib/auth/guard";
import { enqueueEmail, processEmailQueue, provider } from "@/lib/email/queue";
import { testTemplate } from "@/lib/email/templates";
import { normalizeEmail } from "@/lib/auth/email";

/** Envia teste apenas para o próprio professor ou endereço explicitamente informado por ele. */
export const POST = handle(async (req) => {
  const u = await requireStaff();
  const b = await parseBody(req, z.object({ to: z.string().email().optional() }));
  const ready = await provider().ready();
  if (!ready.ok) throw new ApiError(400, ready.reason ?? "Remetente indisponível", "not_ready");
  const to = normalizeEmail(b.to ?? u.email);
  const t = testTemplate({ sender: ready.sender! });
  const id = await enqueueEmail({ kind: "test", toEmail: to, toUserId: u.id, ...t, createdBy: u.id, dedupeKey: `test:${to}:${Date.now()}` });
  const r = await processEmailQueue(5);
  return json({ ok: true, messageId: id, processed: r });
});
