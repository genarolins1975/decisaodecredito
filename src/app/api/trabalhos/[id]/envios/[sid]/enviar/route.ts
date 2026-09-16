import { z } from "zod";
import { handle, json, parseBody } from "@/lib/api";
import { requireClassAccess, assertWritable } from "@/lib/auth/guard";
import { submissionContext, submit } from "@/lib/services/assignments";

/** Conclui o envio e devolve o recibo (versão, hashes, horário do servidor). */
export const POST = handle(async (req, ctx: { params: Promise<{ id: string; sid: string }> }) => {
  const { id, sid } = await ctx.params;
  const b = await parseBody(req, z.object({ classId: z.string() }));
  const access = await requireClassAccess(b.classId, ["aluno"]);
  assertWritable(access);
  const r = await submit(await submissionContext(access, id), sid);
  return json({ ok: true, receipt: r });
});
