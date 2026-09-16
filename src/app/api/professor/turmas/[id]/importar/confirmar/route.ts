import { z } from "zod";
import { handle, json, parseBody } from "@/lib/api";
import { requireStaff } from "@/lib/auth/guard";
import { addEnrollments, previewImport } from "@/lib/services/enrollment";

/** Confirma a importação: grava apenas as linhas válidas (status ok) da prévia. Não envia e-mails. */
export const POST = handle(async (req, ctx: { params: Promise<{ id: string }> }) => {
  const u = await requireStaff();
  const { id } = await ctx.params;
  const b = await parseBody(req, z.object({ csv: z.string().max(2_000_000) }));
  const preview = await previewImport(id, b.csv);
  const ok = preview.rows.filter((r) => r.status === "ok");
  const result = await addEnrollments(id, ok.map((r) => ({ name: r.name, email: r.email, role: r.role })), u.id);
  return json({ ...result, report: preview.rows, note: "Nenhum convite foi enviado. Selecione alunos e use Enviar convites." }, 201);
});
