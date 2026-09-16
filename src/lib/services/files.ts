import "server-only";
import { and, eq, lt } from "drizzle-orm";
import { db, schema } from "@/lib/db/client";
import { newId } from "@/lib/ids";
import { ApiError } from "@/lib/auth/guard";
import { sha256Buf, sniffMime, storage } from "@/lib/storage";
import { audit } from "@/lib/audit";

export const EXT_MIME: Record<string, string> = { pdf: "application/pdf", zip: "application/zip", csv: "text/csv", ipynb: "application/json", json: "application/json", md: "text/plain", txt: "text/plain", py: "text/plain", r: "text/plain" };

/**
 * Recebe um arquivo (não confiável): valida extensão permitida, tamanho e tipo real pelos bytes,
 * grava no armazenamento privado e só então marca como completo. Falha parcial deixa o registro
 * como "pending" para limpeza (nunca vira entrega).
 */
export async function storeUpload(input: { buffer: Buffer; name: string; declaredMime: string; ownerUserId: string; classId: string | null; purpose: string; allowedExt: string[]; maxBytes: number }) {
  const ext = (input.name.toLowerCase().split(".").pop() ?? "").replace(/[^a-z0-9]/g, "");
  if (!input.allowedExt.includes(ext)) throw new ApiError(400, `Formato .${ext || "?"} não permitido. Aceitos: ${input.allowedExt.map((e) => "." + e).join(", ")}`, "bad_format");
  if (input.buffer.length === 0) throw new ApiError(400, "Arquivo vazio", "empty");
  if (input.buffer.length > input.maxBytes) throw new ApiError(413, `Arquivo maior que o limite de ${Math.round(input.maxBytes / 1048576)} MB`, "too_large");
  const mime = sniffMime(input.buffer, input.declaredMime, input.name);
  if (!mime) throw new ApiError(400, "O conteúdo do arquivo não corresponde à extensão informada", "mime_mismatch");
  const id = newId();
  const safeName = input.name.replace(/[^\w.\-]+/g, "_").slice(0, 120);
  const key = `${input.classId ?? "global"}/${input.purpose}/${id}.${ext}`;
  await db.insert(schema.files).values({ id, storageKey: key, originalName: safeName, mime, size: input.buffer.length, ownerUserId: input.ownerUserId, classId: input.classId, purpose: input.purpose, status: "pending" });
  try {
    await storage().put(key, input.buffer, mime);
  } catch (e) {
    await db.update(schema.files).set({ status: "orphan" }).where(eq(schema.files.id, id));
    throw new ApiError(500, "Falha ao gravar o arquivo; nada foi registrado como entregue", "storage");
  }
  const sha = sha256Buf(input.buffer);
  await db.update(schema.files).set({ status: "complete", sha256: sha, completedAt: new Date() }).where(eq(schema.files.id, id));
  await audit({ actorUserId: input.ownerUserId, action: "file.upload", entity: "file", entityId: id, classId: input.classId, details: { purpose: input.purpose, size: input.buffer.length, sha256: sha } });
  return { id, sha256: sha, size: input.buffer.length, mime, name: safeName };
}

export async function getFile(id: string) {
  const [f] = await db.select().from(schema.files).where(eq(schema.files.id, id));
  if (!f || f.status !== "complete") throw new ApiError(404, "Arquivo não encontrado");
  return f;
}

export async function readFileBuffer(id: string) {
  const f = await getFile(id);
  return { file: f, buffer: await storage().get(f.storageKey) };
}

/** Remove registros pendentes/órfãos antigos e seus blobs (chamado por rotina de manutenção). */
export async function cleanupOrphans(olderThanHours = 24) {
  const cutoff = new Date(Date.now() - olderThanHours * 3600e3);
  const rows = await db.select().from(schema.files).where(and(lt(schema.files.createdAt, cutoff), eq(schema.files.status, "pending")));
  for (const f of rows) { try { await storage().delete(f.storageKey); } catch { /* pode não existir */ } await db.update(schema.files).set({ status: "orphan" }).where(eq(schema.files.id, f.id)); }
  return rows.length;
}
