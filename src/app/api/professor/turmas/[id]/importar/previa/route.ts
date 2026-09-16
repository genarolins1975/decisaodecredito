import { z } from "zod";
import { handle, json, parseBody } from "@/lib/api";
import { requireStaff } from "@/lib/auth/guard";
import { previewImport } from "@/lib/services/enrollment";

export const POST = handle(async (req, ctx: { params: Promise<{ id: string }> }) => {
  await requireStaff();
  const { id } = await ctx.params;
  const b = await parseBody(req, z.object({ csv: z.string().max(2_000_000) }));
  return json(await previewImport(id, b.csv));
});
