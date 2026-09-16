import { asc, eq } from "drizzle-orm";
import { handle, json } from "@/lib/api";
import { requireStaff } from "@/lib/auth/guard";
import { db, schema } from "@/lib/db/client";

export const GET = handle(async (_req, ctx: { params: Promise<{ id: string }> }) => {
  await requireStaff();
  const { id } = await ctx.params;
  return json({ datasets: await db.select().from(schema.datasets).where(eq(schema.datasets.editionId, id)).orderBy(asc(schema.datasets.code)) });
});
