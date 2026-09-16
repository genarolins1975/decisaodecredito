import { z } from "zod";
import { handle, json, parseBody } from "@/lib/api";
import { login } from "@/lib/services/auth";

export const POST = handle(async (req) => {
  const body = await parseBody(req, z.object({ email: z.string().min(3).max(254), password: z.string().min(1).max(200) }));
  const r = await login(body.email, body.password);
  return json({ ok: true, next: r.mustChangePassword ? "/senha/definir" : r.isStaff ? "/professor" : "/inicio", ...r });
});
