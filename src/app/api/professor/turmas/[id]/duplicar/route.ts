import { z } from "zod";
import { handle, json, parseBody } from "@/lib/api";
import { requireStaff } from "@/lib/auth/guard";
import { duplicateClass } from "@/lib/services/admin";

export const POST = handle(async (req, ctx: { params: Promise<{ id: string }> }) => {
  const u = await requireStaff();
  const { id } = await ctx.params;
  const b = await parseBody(req, z.object({ editionId: z.string(), code: z.string().min(2).max(30), name: z.string().max(80).optional() }));
  const c = await duplicateClass(id, b.editionId, b.code, b.name ?? "", u.id);
  return json({ class: c, warning: "Encontros e trabalhos foram copiados sem datas e como rascunho. Nenhum aluno, grupo, resposta, frequência ou nota foi copiado." }, 201);
});
