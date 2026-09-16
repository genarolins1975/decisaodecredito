import { handle, json } from "@/lib/api";
import { requireStaff } from "@/lib/auth/guard";
import { disconnectGmail } from "@/lib/email/gmail";
import { audit } from "@/lib/audit";

export const POST = handle(async () => {
  const u = await requireStaff();
  await disconnectGmail();
  await audit({ actorUserId: u.id, action: "gmail.disconnect", entity: "gmail_connection" });
  return json({ ok: true, note: "Alunos já ativados continuam entrando normalmente; apenas novos envios ficam na fila." });
});
