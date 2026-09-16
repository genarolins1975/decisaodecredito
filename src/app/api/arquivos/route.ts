import { type NextRequest } from "next/server";
import { handle, json } from "@/lib/api";
import { ApiError, requireClassAccess, assertWritable } from "@/lib/auth/guard";
import { storeUpload, EXT_MIME } from "@/lib/services/files";
import { getAssignment } from "@/lib/services/assignments";

/**
 * Upload multipart (campos: classId, purpose, assignmentId?, file). O arquivo é tratado como não confiável.
 * Finalidades: submission | manifest | blind_predictions (aluno); dataset | oot | labels | feedback | material (professor).
 */
export const POST = handle(async (req: NextRequest) => {
  const form = await req.formData();
  const classId = String(form.get("classId") ?? "");
  const purpose = String(form.get("purpose") ?? "");
  const file = form.get("file");
  if (!(file instanceof File)) throw new ApiError(400, "Arquivo ausente");
  const staffOnly = ["dataset", "oot", "labels", "feedback", "material"];
  const access = await requireClassAccess(classId, staffOnly.includes(purpose) ? ["professor"] : ["aluno", "monitor", "professor"]);
  assertWritable(access);
  let allowedExt = Object.keys(EXT_MIME); let maxBytes = 50 * 1048576;
  if (purpose === "submission") {
    const aid = String(form.get("assignmentId") ?? "");
    const a = await getAssignment(classId, aid, access.role !== "aluno");
    allowedExt = (a.allowedFormats as string[]).filter((f) => f !== "link"); maxBytes = a.maxFileMb * 1048576;
  } else if (purpose === "manifest") { allowedExt = ["md", "json", "txt", "pdf", "zip"]; maxBytes = 20 * 1048576; }
  else if (purpose === "blind_predictions") { allowedExt = ["csv"]; maxBytes = 20 * 1048576; }
  else if (["oot", "labels", "dataset"].includes(purpose)) { allowedExt = ["csv", "zip", "parquet".replace("parquet", "zip")]; maxBytes = 500 * 1048576; }
  else if (!["feedback", "material"].includes(purpose)) throw new ApiError(400, "Finalidade inválida");
  const buffer = Buffer.from(await file.arrayBuffer());
  const r = await storeUpload({ buffer, name: file.name, declaredMime: file.type, ownerUserId: access.user.id, classId, purpose, allowedExt, maxBytes });
  return json({ ok: true, file: r }, 201);
});
