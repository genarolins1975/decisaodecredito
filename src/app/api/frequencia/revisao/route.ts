import { z } from "zod";
import { eq, and } from "drizzle-orm";
import { handle, json, parseBody } from "@/lib/api";
import { requireClassAccess, ApiError } from "@/lib/auth/guard";
import { requestReview } from "@/lib/services/attendance";
import { db, schema } from "@/lib/db/client";

export const POST = handle(async (req) => {
  const b = await parseBody(req, z.object({ classId: z.string(), meetingId: z.string(), text: z.string().min(5).max(1000) }));
  const access = await requireClassAccess(b.classId, ["aluno"]);
  const [m] = await db.select().from(schema.meetings).where(and(eq(schema.meetings.id, b.meetingId), eq(schema.meetings.classId, b.classId)));
  if (!m) throw new ApiError(404, "Encontro não encontrado");
  await requestReview(b.meetingId, access.user.id, b.text);
  return json({ ok: true });
});
