import { z } from "zod";
import { handle, json, parseBody } from "@/lib/api";
import { requireStaff } from "@/lib/auth/guard";
import { createClass } from "@/lib/services/admin";

export const POST = handle(async (req) => {
  const u = await requireStaff();
  const b = await parseBody(req, z.object({ editionId: z.string(), code: z.string().min(2).max(30), name: z.string().max(80).optional() }));
  return json({ class: await createClass(b.editionId, b.code, b.name ?? "", u.id) }, 201);
});
