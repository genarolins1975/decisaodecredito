import "server-only";
import { and, desc, eq, sql } from "drizzle-orm";
import { db, schema } from "@/lib/db/client";
import { newId } from "@/lib/ids";
import { ApiError, type ClassAccess } from "@/lib/auth/guard";
import { audit } from "@/lib/audit";
import { readFileBuffer } from "@/lib/services/files";
import { parseCsv } from "@/lib/csv";
import { auc, brier, ks, logloss, calibration } from "@/lib/nucleo/metrics";
import { myGroup } from "@/lib/services/assignments";

/**
 * Teste cego: o grupo congela o manifesto (versão, hashes, horário) ANTES de receber o arquivo OOT
 * sem desfecho. Os rótulos verdadeiros ficam apenas no servidor, acessíveis só ao professor.
 * Submissões limitadas e feedback restrito evitam transformar o teste em validação iterativa.
 */
export async function blindConfig(assignmentId: string) {
  const [b] = await db.select().from(schema.blindTests).where(eq(schema.blindTests.assignmentId, assignmentId));
  return b ?? null;
}

export async function upsertBlindConfig(classId: string, assignmentId: string, patch: Partial<typeof schema.blindTests.$inferInsert>, actorId: string) {
  const [a] = await db.select().from(schema.assignments).where(and(eq(schema.assignments.id, assignmentId), eq(schema.assignments.classId, classId)));
  if (!a) throw new ApiError(404, "Trabalho não encontrado");
  const existing = await blindConfig(assignmentId);
  if (existing) await db.update(schema.blindTests).set(patch).where(eq(schema.blindTests.id, existing.id));
  else await db.insert(schema.blindTests).values({ id: newId(), assignmentId, ...patch });
  await db.update(schema.assignments).set({ blindTestEnabled: true }).where(eq(schema.assignments.id, assignmentId));
  await audit({ actorUserId: actorId, action: "blind.config", entity: "assignment", entityId: assignmentId, classId, details: Object.keys(patch) });
}

/**
 * Arquivos efetivos do teste cego para um sujeito. Com uma base por grupo, o OOT sem desfecho e os rótulos
 * vêm do catálogo de bases (datasets.ootFileId / labelsFileId); a configuração do trabalho é o fallback
 * para turmas com base única.
 */
export async function resolveBlindFiles(cfg: { ootFileId: string | null; labelsFileId: string | null } | null, group: { datasetId: string | null } | null) {
  let ootFileId = cfg?.ootFileId ?? null, labelsFileId = cfg?.labelsFileId ?? null, datasetCode: string | null = null, datasetName: string | null = null;
  if (group?.datasetId) {
    const [d] = await db.select().from(schema.datasets).where(eq(schema.datasets.id, group.datasetId));
    if (d?.ootFileId) { ootFileId = d.ootFileId; labelsFileId = d.labelsFileId ?? null; datasetCode = d.code; datasetName = d.name; }
  }
  return { ootFileId, labelsFileId, datasetCode, datasetName };
}

async function subject(access: ClassAccess, assignment: { mode: string }) {
  const group = assignment.mode === "grupo" ? await myGroup(access.classId, access.user.id) : null;
  if (assignment.mode === "grupo" && !group) throw new ApiError(400, "Você não está em um grupo", "no_group");
  return group;
}

export async function myFreeze(access: ClassAccess, assignmentId: string) {
  const [a] = await db.select().from(schema.assignments).where(eq(schema.assignments.id, assignmentId));
  const group = await subject(access, a);
  const rows = await db.select().from(schema.modelFreezes).where(and(eq(schema.modelFreezes.assignmentId, assignmentId), group ? eq(schema.modelFreezes.groupId, group.id) : eq(schema.modelFreezes.userId, access.user.id))).orderBy(desc(schema.modelFreezes.frozenAt));
  return { group, freezes: rows };
}

/** Congela: exige manifesto (arquivo) e versão; primeiro congelamento é o oficial; novos só como exceção registrada pelo professor. */
export async function freezeModel(access: ClassAccess, assignmentId: string, input: { manifestFileId: string; modelVersion: string; artifactHashes: { name: string; sha256: string }[]; notes?: string }) {
  const [a] = await db.select().from(schema.assignments).where(and(eq(schema.assignments.id, assignmentId), eq(schema.assignments.classId, access.classId)));
  if (!a) throw new ApiError(404, "Trabalho não encontrado");
  const group = await subject(access, a);
  const { freezes } = await myFreeze(access, assignmentId);
  if (freezes.some((f) => !f.modelVersion.endsWith("-invalidado"))) throw new ApiError(409, "O modelo já foi congelado. Um novo congelamento só pode ser registrado pelo professor como exceção.", "already_frozen");
  const { file } = await readFileBuffer(input.manifestFileId);
  if (file.ownerUserId !== access.user.id) throw new ApiError(403, "Arquivo não pertence a você");
  for (const h of input.artifactHashes) if (!/^[a-f0-9]{64}$/i.test(h.sha256)) throw new ApiError(400, `Hash inválido para ${h.name}`);
  const id = newId();
  await db.insert(schema.modelFreezes).values({ id, assignmentId, groupId: group?.id ?? null, userId: group ? null : access.user.id, manifestFileId: file.id, manifestSha256: file.sha256!, artifactHashes: input.artifactHashes, modelVersion: input.modelVersion.slice(0, 60), frozenBy: access.user.id, notes: input.notes ?? null });
  await audit({ actorUserId: access.user.id, action: "blind.freeze", entity: "model_freeze", entityId: id, classId: access.classId, details: { manifestSha256: file.sha256, modelVersion: input.modelVersion } });
  return { id, frozenAt: new Date(), manifestSha256: file.sha256 };
}

export async function teacherFreezeException(classId: string, assignmentId: string, target: { groupId?: string; userId?: string }, reason: string, actorId: string) {
  if (!target.groupId && !target.userId) throw new ApiError(400, "Informe grupo ou aluno");
  // mantém o histórico: os congelamentos anteriores ficam marcados como invalidados e o grupo pode congelar de novo
  await db.update(schema.modelFreezes).set({ notes: sql`coalesce(${schema.modelFreezes.notes}, '') || ' | invalidado por exceção do professor: ' || ${reason}`, modelVersion: sql`${schema.modelFreezes.modelVersion} || '-invalidado'` })
    .where(and(eq(schema.modelFreezes.assignmentId, assignmentId), target.groupId ? eq(schema.modelFreezes.groupId, target.groupId) : eq(schema.modelFreezes.userId, target.userId!), sql`${schema.modelFreezes.modelVersion} NOT LIKE '%-invalidado'`));
  await audit({ actorUserId: actorId, action: "blind.freeze.exception", entity: "assignment", entityId: assignmentId, classId, details: { ...target, reason } });
}

/** O OOT sem desfecho só é liberado após o congelamento (política padrão). */
export async function canDownloadOot(access: ClassAccess, assignmentId: string): Promise<{ ok: boolean; fileId?: string; reason?: string; datasetCode?: string | null }> {
  const cfg = await blindConfig(assignmentId);
  const [a] = await db.select().from(schema.assignments).where(eq(schema.assignments.id, assignmentId));
  if (!a) return { ok: false, reason: "Trabalho não encontrado" };
  let group: { datasetId: string | null } | null = null;
  if (a.mode === "grupo") { try { group = await subject(access, a); } catch { if (access.role === "aluno") return { ok: false, reason: "Entre em um grupo com base atribuída para receber o arquivo OOT" }; } }
  const files = await resolveBlindFiles(cfg, group);
  if (!files.ootFileId) return { ok: false, reason: group && !group.datasetId ? "Seu grupo ainda não tem base atribuída" : "Arquivo OOT ainda não cadastrado pelo professor" };
  if (access.role !== "aluno") return { ok: true, fileId: files.ootFileId, datasetCode: files.datasetCode };
  if ((cfg?.releasePolicy ?? "apos_congelamento") === "apos_congelamento") {
    const { freezes } = await myFreeze(access, assignmentId);
    if (!freezes.some((f) => !f.modelVersion.endsWith("-invalidado"))) return { ok: false, reason: "Congele o modelo (manifesto e hashes) antes de receber o arquivo OOT" };
  }
  return { ok: true, fileId: files.ootFileId, datasetCode: files.datasetCode };
}

/** Turma com OOT livre: algum trabalho com teste cego habilitado e política de liberação "livre" (sem congelamento, sem grupo). */
export async function ootLivreParaTurma(classId: string) {
  const rows = await db.select({ id: schema.blindTests.id }).from(schema.blindTests).innerJoin(schema.assignments, eq(schema.assignments.id, schema.blindTests.assignmentId))
    .where(and(eq(schema.assignments.classId, classId), eq(schema.assignments.blindTestEnabled, true), eq(schema.blindTests.releasePolicy, "livre"))).limit(1);
  return rows.length > 0;
}

/** Autorização de download de um arquivo OOT pelo id do arquivo: pela configuração do trabalho ou pelo catálogo de bases. */
export async function canDownloadOotFile(access: ClassAccess, fileId: string) {
  if (access.role !== "aluno") return true;
  // política livre: qualquer matriculado baixa o OOT de qualquer base da edição (o professor recebe os resultados fora da plataforma)
  if (await ootLivreParaTurma(access.classId)) {
    const [d] = await db.select({ id: schema.datasets.id }).from(schema.datasets).where(and(eq(schema.datasets.editionId, access.edition.id), eq(schema.datasets.ootFileId, fileId)));
    if (d) return true;
  }
  const [bt] = await db.select().from(schema.blindTests).where(eq(schema.blindTests.ootFileId, fileId));
  const assignmentIds = bt ? [bt.assignmentId] : (await db.select({ id: schema.assignments.id }).from(schema.assignments).where(and(eq(schema.assignments.classId, access.classId), eq(schema.assignments.blindTestEnabled, true)))).map((r) => r.id);
  for (const aid of assignmentIds) { const r = await canDownloadOot(access, aid); if (r.ok && r.fileId === fileId) return true; }
  return false;
}

type Pred = { id: string; pd: number; decision: string; version: string };

function parsePredictions(text: string): { rows: Pred[]; errors: string[] } {
  const { rows, errors } = parseCsv(text);
  const out: Pred[] = [];
  for (const r of rows) {
    const id = (r.proposta_id ?? "").trim(); const pd = Number((r.pd_modelo ?? "").replace(",", "."));
    if (!id) { errors.push("linha sem proposta_id"); continue; }
    if (!Number.isFinite(pd) || pd < 0 || pd > 1) { errors.push(`pd_modelo inválida para ${id}`); continue; }
    out.push({ id, pd, decision: (r.decisao_politica ?? "").trim(), version: (r.versao_modelo ?? "").trim() });
  }
  return { rows: out, errors: errors.slice(0, 20) };
}

/** Submissão de previsões OOT: valida IDs contra o arquivo OOT, calcula métricas com os rótulos (privado) e respeita o limite. */
export async function submitBlind(access: ClassAccess, assignmentId: string, fileId: string) {
  const cfg = await blindConfig(assignmentId);
  if (!cfg) throw new ApiError(400, "Teste cego não configurado");
  const [a] = await db.select().from(schema.assignments).where(eq(schema.assignments.id, assignmentId));
  const group = await subject(access, a);
  const files = await resolveBlindFiles(cfg, group);
  if (!files.ootFileId) throw new ApiError(400, group && !group.datasetId ? "Seu grupo ainda não tem base atribuída" : "Teste cego não configurado: arquivo OOT ausente");
  const { freezes } = await myFreeze(access, assignmentId);
  const freeze = freezes.find((f) => !f.modelVersion.endsWith("-invalidado"));
  if (!freeze) throw new ApiError(400, "Congele o modelo antes de enviar previsões", "not_frozen");
  const prior = await db.select({ n: sql<number>`count(*)` }).from(schema.blindSubmissions).where(and(eq(schema.blindSubmissions.blindTestId, cfg.id), group ? eq(schema.blindSubmissions.groupId, group.id) : eq(schema.blindSubmissions.userId, access.user.id), eq(schema.blindSubmissions.isException, false)));
  const used = Number(prior[0]?.n ?? 0);
  if (used >= cfg.maxSubmissions) throw new ApiError(409, `Limite de ${cfg.maxSubmissions} submissão(ões) no teste cego atingido`, "max_submissions");
  const { file, buffer } = await readFileBuffer(fileId);
  if (file.ownerUserId !== access.user.id) throw new ApiError(403, "Arquivo não pertence a você");
  const { rows, errors } = parsePredictions(buffer.toString("utf8"));
  // conjunto esperado de IDs: o arquivo de rótulos (compacto, cobre todos os IDs do OOT) quando existe; senão o próprio OOT
  const labels = files.labelsFileId ? parseCsv((await readFileBuffer(files.labelsFileId)).buffer.toString("utf8")).rows : null;
  const idSource = labels ?? parseCsv((await readFileBuffer(files.ootFileId)).buffer.toString("utf8")).rows;
  const expected = new Set(idSource.map((r) => (r.proposta_id ?? "").trim()).filter(Boolean));
  const seen = new Set<string>(); let dup = 0, extra = 0;
  for (const r of rows) { if (seen.has(r.id)) dup++; seen.add(r.id); if (!expected.has(r.id)) extra++; }
  const missing = [...expected].filter((id) => !seen.has(id)).length;
  const validation = { rowsRead: rows.length, expected: expected.size, missing, duplicates: dup, extra, parseErrors: errors, valid: missing === 0 && dup === 0 && extra === 0 && errors.length === 0 };
  if (!validation.valid) {
    // arquivo inválido não conta como execução: é recusado com o diagnóstico, sem consumir o limite
    await audit({ actorUserId: access.user.id, action: "blind.submit.rejected", entity: "assignment", entityId: assignmentId, classId: access.classId, details: { validation, sha256: file.sha256 } });
    throw new ApiError(400, `Arquivo inválido: ${validation.rowsRead} linhas lidas, ${expected.size} esperadas; faltantes ${missing}, duplicadas ${dup}, extras ${extra}${errors.length ? "; " + errors.slice(0, 3).join("; ") : ""}. Corrija e envie novamente (não contou no limite).`, "invalid_predictions");
  }
  let metrics: Record<string, unknown> | null = null;
  if (validation.valid && labels) {
    const lab = new Map(labels.map((r) => [(r.proposta_id ?? "").trim(), Number((r.y ?? r.default ?? r.desfecho ?? "").trim() || NaN)]));
    const y: number[] = [], p: number[] = [];
    for (const r of rows) { const v = lab.get(r.id); if (v === 0 || v === 1) { y.push(v); p.push(r.pd); } }
    metrics = { n: y.length, prevalence: y.reduce((s, v) => s + v, 0) / y.length, auc: auc(y, p), ks: ks(y, p).ks, brier: brier(y, p), logloss: logloss(y, p), calibration: calibration(y, p, 10), computedAt: new Date().toISOString(), freezeId: freeze.id, datasetCode: files.datasetCode };
  }
  const id = newId();
  await db.insert(schema.blindSubmissions).values({ id, blindTestId: cfg.id, groupId: group?.id ?? null, userId: access.user.id, fileId: file.id, freezeId: freeze.id, submissionNo: used + 1, validation, metrics });
  await audit({ actorUserId: access.user.id, action: "blind.submit", entity: "blind_submission", entityId: id, classId: access.classId, details: { validation, sha256: file.sha256 } });
  // devolutiva conforme nível configurado
  const feedback: Record<string, unknown> = { validation, submissionNo: used + 1, remaining: cfg.maxSubmissions - used - 1, receipt: { fileSha256: file.sha256, at: new Date().toISOString() } };
  if (metrics && cfg.feedbackLevel === "agregado") feedback.metrics = { auc: metrics.auc, n: metrics.n };
  if (metrics && cfg.feedbackLevel === "completo") feedback.metrics = metrics;
  return feedback;
}

export async function listBlindForTeacher(assignmentId: string) {
  const cfg = await blindConfig(assignmentId);
  // bases da edição com OOT/rótulos próprios (uma base por grupo) e quantos grupos da turma usam cada uma
  const [a] = await db.select({ classId: schema.assignments.classId }).from(schema.assignments).where(eq(schema.assignments.id, assignmentId));
  const [cls] = a ? await db.select({ editionId: schema.classes.editionId }).from(schema.classes).where(eq(schema.classes.id, a.classId)) : [];
  const datasets = cls ? await db.select({ id: schema.datasets.id, code: schema.datasets.code, name: schema.datasets.name, ootFileId: schema.datasets.ootFileId, labelsFileId: schema.datasets.labelsFileId, groups: sql<number>`(select count(*) from ${schema.groups} g where g.dataset_id = ${schema.datasets.id} and g.class_id = ${a!.classId})` }).from(schema.datasets).where(eq(schema.datasets.editionId, cls.editionId)).orderBy(schema.datasets.code) : [];
  if (!cfg) return { cfg: null, submissions: [], freezes: [], datasets };
  const subs = await db.select({ b: schema.blindSubmissions, user: schema.users.name, group: schema.groups.name }).from(schema.blindSubmissions).innerJoin(schema.users, eq(schema.users.id, schema.blindSubmissions.userId)).leftJoin(schema.groups, eq(schema.groups.id, schema.blindSubmissions.groupId)).where(eq(schema.blindSubmissions.blindTestId, cfg.id)).orderBy(desc(schema.blindSubmissions.submittedAt));
  const freezes = await db.select({ f: schema.modelFreezes, group: schema.groups.name, user: schema.users.name }).from(schema.modelFreezes).leftJoin(schema.groups, eq(schema.groups.id, schema.modelFreezes.groupId)).leftJoin(schema.users, eq(schema.users.id, schema.modelFreezes.frozenBy)).where(eq(schema.modelFreezes.assignmentId, assignmentId)).orderBy(desc(schema.modelFreezes.frozenAt));
  return { cfg, submissions: subs, freezes, datasets };
}
