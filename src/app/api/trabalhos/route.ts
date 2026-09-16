import { handle, json } from "@/lib/api";
import { requireClassAccess } from "@/lib/auth/guard";
import { listAssignments } from "@/lib/services/assignments";

export const GET = handle(async (req) => {
  const classId = new URL(req.url).searchParams.get("classId") ?? "";
  const access = await requireClassAccess(classId);
  return json({ assignments: await listAssignments(classId, access.role !== "aluno") });
});
