import { z } from "zod";
import { and, eq } from "drizzle-orm";
import { handle, json, parseBody } from "@/lib/api";
import { requireStaff } from "@/lib/auth/guard";
import { db, schema } from "@/lib/db/client";
import { audit } from "@/lib/audit";

/** Cadastro posterior de bases: vincula arquivo, dicionário, versão e notas. */
export const PATCH = handle(async (req, ctx: { params: Promise<{ id: string; did: string }> }) => {
  const u = await requireStaff();
  const { id, did } = await ctx.params;
  const b = await parseBody(req, z.object({ fileId: z.string().nullable().optional(), dictionaryFileId: z.string().nullable().optional(), version: z.string().max(40).optional(), notes: z.string().max(2000).nullable().optional(), name: z.string().max(120).optional(), population: z.string().max(300).nullable().optional(), emphasis: z.string().max(500).nullable().optional() }));
  const status = b.fileId ? "disponivel" : undefined;
  await db.update(schema.datasets).set({ ...b, ...(status ? { status } : {}) }).where(and(eq(schema.datasets.id, did), eq(schema.datasets.editionId, id)));
  await audit({ actorUserId: u.id, action: "dataset.update", entity: "dataset", entityId: did, details: Object.keys(b) });
  return json({ ok: true });
});
