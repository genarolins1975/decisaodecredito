import { z } from "zod";
import { handle, json, parseBody } from "@/lib/api";
import { activate } from "@/lib/services/auth";

export const POST = handle(async (req) => {
  const body = await parseBody(req, z.object({ code: z.string().min(6).max(64) }));
  return json({ ok: true, ...(await activate(body.code)) });
});
