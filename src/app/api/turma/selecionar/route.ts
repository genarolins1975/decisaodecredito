import { z } from "zod";
import { cookies } from "next/headers";
import { handle, json, parseBody } from "@/lib/api";
import { requireClassAccess } from "@/lib/auth/guard";
import { CLASS_COOKIE } from "@/lib/context";

/** Seleciona a turma de trabalho. Só turmas com matrícula ativa (verificado no servidor). */
export const POST = handle(async (req) => {
  const b = await parseBody(req, z.object({ classId: z.string() }));
  await requireClassAccess(b.classId);
  const c = await cookies();
  c.set(CLASS_COOKIE, b.classId, { httpOnly: true, sameSite: "lax", path: "/", secure: process.env.NODE_ENV === "production", maxAge: 180 * 86400 });
  return json({ ok: true });
});
