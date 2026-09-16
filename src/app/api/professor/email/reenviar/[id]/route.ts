import { eq } from "drizzle-orm";
import { handle, json } from "@/lib/api";
import { ApiError, requireStaff } from "@/lib/auth/guard";
import { db, schema } from "@/lib/db/client";

/** Recoloca uma mensagem falha na fila (contador zerado, mesmo conteúdo). */
export const POST = handle(async (_req, ctx: { params: Promise<{ id: string }> }) => {
  await requireStaff();
  const { id } = await ctx.params;
  const [m] = await db.select().from(schema.emailMessages).where(eq(schema.emailMessages.id, id));
  if (!m) throw new ApiError(404, "Mensagem não encontrada");
  if (m.status === "accepted") throw new ApiError(400, "Mensagem já aceita pelo provedor");
  await db.update(schema.emailMessages).set({ status: "queued", attempts: 0, nextAttemptAt: new Date(), lastError: null }).where(eq(schema.emailMessages.id, id));
  return json({ ok: true });
});
