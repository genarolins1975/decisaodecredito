import { z } from "zod";
import { handle, json, parseBody } from "@/lib/api";
import { requireStaff } from "@/lib/auth/guard";
import { createQuestion } from "@/lib/services/content-admin";

export const POST = handle(async (req) => {
  const u = await requireStaff();
  const b = await parseBody(req, z.object({ editionId: z.string(), pageId: z.string().nullable(), kind: z.enum(["single", "multi", "numeric", "short_text", "credit_decision", "simulator_output", "predict"]), label: z.string().max(120).nullable().optional(), prompt: z.string().min(3).max(4000), options: z.record(z.string(), z.unknown()).default({}), answerKey: z.unknown().optional(), feedback: z.unknown().optional() }));
  return json({ ok: true, ...(await createQuestion(b.editionId, b.pageId, b.kind, b, u.id)) }, 201);
});
