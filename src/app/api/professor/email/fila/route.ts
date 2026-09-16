import { desc } from "drizzle-orm";
import { handle, json } from "@/lib/api";
import { requireStaff } from "@/lib/auth/guard";
import { db, schema } from "@/lib/db/client";

export const GET = handle(async () => {
  await requireStaff();
  const rows = await db.select({
    id: schema.emailMessages.id, kind: schema.emailMessages.kind, toEmail: schema.emailMessages.toEmail, subject: schema.emailMessages.subject,
    status: schema.emailMessages.status, attempts: schema.emailMessages.attempts, lastError: schema.emailMessages.lastError,
    acceptedAt: schema.emailMessages.acceptedAt, createdAt: schema.emailMessages.createdAt, nextAttemptAt: schema.emailMessages.nextAttemptAt, classId: schema.emailMessages.classId,
  }).from(schema.emailMessages).orderBy(desc(schema.emailMessages.createdAt)).limit(200);
  return json({ messages: rows });
});
