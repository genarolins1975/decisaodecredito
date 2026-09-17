import { and, eq, inArray, isNull, or } from "drizzle-orm";
import { handle, json } from "@/lib/api";
import { requireClassAccess } from "@/lib/auth/guard";
import { submissionContext, mySubmissions, myGrade, effectiveDue } from "@/lib/services/assignments";
import { blindConfig, myFreeze, canDownloadOot, resolveBlindFiles } from "@/lib/services/blind";
import { db, schema } from "@/lib/db/client";

/** Visão do aluno sobre um trabalho: enunciado, etapas e progresso, envios, nota publicada, teste cego. */
export const GET = handle(async (req, ctx: { params: Promise<{ id: string }> }) => {
  const { id } = await ctx.params;
  const classId = new URL(req.url).searchParams.get("classId") ?? "";
  const access = await requireClassAccess(classId);
  const sc = await submissionContext(access, id);
  const submissions = await mySubmissions(sc);
  const grade = await myGrade(classId, id, access.user.id);
  const due = await effectiveDue(id, access.user.id, sc.group?.id ?? null);
  const stepIds = sc.assignment.steps.map((s) => s.id);
  const progress = stepIds.length ? await db.select().from(schema.stepProgress).where(and(inArray(schema.stepProgress.stepId, stepIds), sc.group ? eq(schema.stepProgress.groupId, sc.group.id) : and(eq(schema.stepProgress.userId, access.user.id), isNull(schema.stepProgress.groupId)))) : [];
  const { rubric, ...assignment } = sc.assignment;
  let blind = null;
  if (assignment.blindTestEnabled) {
    const cfg = await blindConfig(id);
    const fz = await myFreeze(access, id);
    const oot = await canDownloadOot(access, id);
    const subs = cfg ? await db.select({ id: schema.blindSubmissions.id, submissionNo: schema.blindSubmissions.submissionNo, validation: schema.blindSubmissions.validation, submittedAt: schema.blindSubmissions.submittedAt }).from(schema.blindSubmissions).where(and(eq(schema.blindSubmissions.blindTestId, cfg.id), sc.group ? eq(schema.blindSubmissions.groupId, sc.group.id) : eq(schema.blindSubmissions.userId, access.user.id))) : [];
    const files = await resolveBlindFiles(cfg, sc.group);
    blind = { configured: Boolean(files.ootFileId), datasetCode: files.datasetCode, maxSubmissions: cfg?.maxSubmissions ?? 1, feedbackLevel: cfg?.feedbackLevel ?? "recibo", expectedIds: cfg?.expectedIds ?? null, freezes: fz.freezes.map((f) => ({ id: f.id, modelVersion: f.modelVersion, manifestSha256: f.manifestSha256, frozenAt: f.frozenAt, artifactHashes: f.artifactHashes })), oot, submissions: subs };
  }
  void or;
  return json({ assignment, rubric: rubric?.definition ?? null, group: sc.group, submissions, grade, due, progress, blind });
});
