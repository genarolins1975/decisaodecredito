import { z } from "zod";
import { handle, json, parseBody } from "@/lib/api";
import { requireStaff } from "@/lib/auth/guard";
import { createEdition, listEditionsWithClasses } from "@/lib/services/admin";

export const GET = handle(async () => { await requireStaff(); return json({ editions: await listEditionsWithClasses() }); });
export const POST = handle(async (req) => {
  const u = await requireStaff();
  const b = await parseBody(req, z.object({ year: z.number().int(), label: z.string().max(40).optional() }));
  return json({ edition: await createEdition(b.year, b.label ?? String(b.year), u.id) }, 201);
});
