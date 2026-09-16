import { z } from "zod";
import { handle, json, parseBody } from "@/lib/api";
import { requireUser } from "@/lib/auth/guard";
import { changePassword, setFirstPassword } from "@/lib/services/auth";

/** Define a primeira senha (após credencial temporária) ou troca a senha atual. */
export const POST = handle(async (req) => {
  const u = await requireUser();
  const body = await parseBody(req, z.object({ password: z.string().min(1).max(200), current: z.string().max(200).optional() }));
  if (u.mustChangePassword) { await setFirstPassword(u.id, u.sessionId, body.password); return json({ ok: true, next: "/perfil/primeiro-acesso" }); }
  if (!body.current) return json({ error: "Informe a senha atual", code: "invalid_current" }, 400);
  await changePassword(u.id, u.sessionId, body.current, body.password);
  return json({ ok: true });
});
