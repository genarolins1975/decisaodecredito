import { handle, json } from "@/lib/api";
import { requireClassAccess, ApiError } from "@/lib/auth/guard";
import { canDownloadOot } from "@/lib/services/blind";

export const GET = handle(async (req, ctx: { params: Promise<{ id: string }> }) => {
  const { id } = await ctx.params;
  const classId = new URL(req.url).searchParams.get("classId") ?? "";
  const access = await requireClassAccess(classId);
  const r = await canDownloadOot(access, id);
  if (!r.ok) throw new ApiError(403, r.reason ?? "Indisponível", "oot_locked");
  return json({ ok: true, downloadUrl: `/api/arquivos/${r.fileId}` });
});
