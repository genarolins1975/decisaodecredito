import { z } from "zod";
import { handle, json, parseBody } from "@/lib/api";
import { requireStaff } from "@/lib/auth/guard";
import { registrarPacote } from "@/lib/services/datasets-publish";

/** Registra no catálogo o pacote de bases já enviado ao bucket (prefixo bases/v<versao>/). Só professor. */
export const POST = handle(async (req, ctx: { params: Promise<{ id: string }> }) => {
  const u = await requireStaff();
  const { id } = await ctx.params;
  const b = await parseBody(req, z.object({ versao: z.string().min(1).max(20) }));
  return json({ ok: true, resumo: await registrarPacote(id, b.versao, u.id) });
});
export const maxDuration = 120;
