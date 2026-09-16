import { z } from "zod";
import { asc, eq } from "drizzle-orm";
import { handle, json, parseBody } from "@/lib/api";
import { requireStaff } from "@/lib/auth/guard";
import { db, schema } from "@/lib/db/client";
import { newId } from "@/lib/ids";

export const GET = handle(async (_req, ctx: { params: Promise<{ id: string }> }) => { await requireStaff(); const { id } = await ctx.params; return json({ materials: await db.select().from(schema.materials).where(eq(schema.materials.editionId, id)).orderBy(asc(schema.materials.position)) }); });
export const POST = handle(async (req, ctx: { params: Promise<{ id: string }> }) => {
  await requireStaff();
  const { id } = await ctx.params;
  const b = await parseBody(req, z.object({ title: z.string().min(2).max(300), kind: z.enum(["leitura", "referencia", "arquivo", "link"]).default("leitura"), description: z.string().max(2000).nullable().optional(), url: z.string().url().nullable().optional(), fileId: z.string().nullable().optional(), citation: z.string().max(500).nullable().optional(), unitId: z.string().nullable().optional() }));
  const mid = newId();
  await db.insert(schema.materials).values({ id: mid, editionId: id, ...b, status: "published", position: Date.now() % 100000 });
  return json({ ok: true, id: mid }, 201);
});
