import "server-only";
import { db, schema, type Tx } from "@/lib/db/client";
import { newId } from "@/lib/ids";

export async function audit(entry: {
  actorUserId?: string | null; action: string; entity: string; entityId?: string | null; classId?: string | null;
  details?: unknown; ipHash?: string | null;
}, tx?: Tx) {
  const d = tx ?? db;
  await d.insert(schema.auditLog).values({
    id: newId(), actorUserId: entry.actorUserId ?? null, action: entry.action, entity: entry.entity,
    entityId: entry.entityId ?? null, classId: entry.classId ?? null, details: entry.details ?? null, ipHash: entry.ipHash ?? null,
  });
}
