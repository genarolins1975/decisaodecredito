import { z } from "zod";
import { handle, json, parseBody } from "@/lib/api";
import { requestPasswordReset } from "@/lib/services/auth";

export const POST = handle(async (req) => {
  const body = await parseBody(req, z.object({ email: z.string().min(3).max(254) }));
  await requestPasswordReset(body.email);
  return json({ ok: true, message: "Se houver uma conta ativa com este e-mail, enviaremos um link para redefinir a senha." });
});
