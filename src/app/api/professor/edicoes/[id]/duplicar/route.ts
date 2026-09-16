import { z } from "zod";
import { handle, json, parseBody } from "@/lib/api";
import { requireStaff } from "@/lib/auth/guard";
import { duplicateEdition } from "@/lib/services/admin";

export const POST = handle(async (req, ctx: { params: Promise<{ id: string }> }) => {
  const u = await requireStaff();
  const { id } = await ctx.params;
  const b = await parseBody(req, z.object({ year: z.number().int(), label: z.string().max(40).optional(),
    content: z.boolean().default(true), rubrics: z.boolean().default(true), materials: z.boolean().default(true), datasets: z.boolean().default(true) }));
  const r = await duplicateEdition(id, b.year, b.label ?? String(b.year), u.id, { content: b.content, rubrics: b.rubrics, materials: b.materials, datasets: b.datasets });
  return json({ ...r, warning: "Revise datas, prazos e configurações da nova edição antes de publicar. Matrículas, grupos, respostas, frequência, entregas e notas não foram copiados." }, 201);
});
