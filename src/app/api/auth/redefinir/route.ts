import { z } from "zod";
import { handle, json, parseBody } from "@/lib/api";
import { resetPassword } from "@/lib/services/auth";

export const POST = handle(async (req) => {
  const body = await parseBody(req, z.object({ token: z.string().min(10).max(200), password: z.string().min(1).max(200) }));
  await resetPassword(body.token, body.password);
  return json({ ok: true, next: "/entrar" });
});
