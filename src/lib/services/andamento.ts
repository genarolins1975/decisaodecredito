import "server-only";
import { and, eq, inArray, isNull, ne, sql } from "drizzle-orm";
import { db, schema } from "@/lib/db/client";
import { getAssignment } from "@/lib/services/assignments";
import { blindConfig } from "@/lib/services/blind";

/**
 * Andamento de cada aluno num trabalho, para o professor: grupo e base, missões, entrega, teste cego e o rastro
 * do que o aluno fez de fato (downloads da base e do OOT, manifestos e previsões enviados, tentativas recusadas).
 *
 * O andamento das missões é declarado pelo grupo no seletor da página do trabalho; "validada" é a conferida pelo
 * professor. Downloads e uploads vêm do audit_log, que registra cada um com autor e horário.
 */

export type Etapa = "sem_acesso" | "sem_grupo" | "sem_base" | "falta_congelar" | "congelado" | "oot_baixado" | "previsoes_enviadas";

export const ETAPAS: { chave: Etapa; rotulo: string; proximo: string }[] = [
  { chave: "sem_acesso", rotulo: "Sem acesso ativo", proximo: "Ativar a conta pelo convite (Alunos)." },
  { chave: "sem_grupo", rotulo: "Sem grupo", proximo: "Professor coloca o aluno num grupo (Grupos)." },
  { chave: "sem_base", rotulo: "Grupo sem base", proximo: "Professor atribui a base ao grupo (Grupos)." },
  { chave: "falta_congelar", rotulo: "Falta congelar", proximo: "Enviar manifesto, versão e hashes no quadro Teste cego (OOT)." },
  { chave: "congelado", rotulo: "Congelado, OOT não baixado", proximo: "Baixar o OOT sem desfecho no quadro Teste cego (OOT)." },
  { chave: "oot_baixado", rotulo: "OOT baixado, sem previsões", proximo: "Enviar o CSV de previsões (proposta_id, pd_modelo, decisao_politica, versao_modelo)." },
  { chave: "previsoes_enviadas", rotulo: "Previsões enviadas", proximo: "Nada pendente no teste cego." },
];

const quando = (d: Date | null | undefined) => (d ? new Date(d).toISOString() : null);

export async function andamentoDoTrabalho(classId: string, assignmentId: string) {
  const assignment = await getAssignment(classId, assignmentId, true);
  const steps = assignment.steps;
  const cfg = assignment.blindTestEnabled ? await blindConfig(assignmentId) : null;
  const livre = cfg?.releasePolicy === "livre";

  const matriculas = await db.select({ userId: schema.enrollments.userId, name: schema.enrollments.name, email: schema.enrollments.email, status: schema.enrollments.status })
    .from(schema.enrollments).where(and(eq(schema.enrollments.classId, classId), eq(schema.enrollments.role, "aluno"), ne(schema.enrollments.status, "encerrado")));
  const userIds = matriculas.map((m) => m.userId).filter((x): x is string => Boolean(x));

  const grupos = await db.select({ g: schema.groups, ds: schema.datasets }).from(schema.groups).leftJoin(schema.datasets, eq(schema.datasets.id, schema.groups.datasetId)).where(eq(schema.groups.classId, classId));
  const membros = grupos.length ? await db.select().from(schema.groupMembers).where(and(inArray(schema.groupMembers.groupId, grupos.map((x) => x.g.id)), isNull(schema.groupMembers.leftAt))) : [];
  const grupoDe = new Map(membros.map((m) => [m.userId, grupos.find((x) => x.g.id === m.groupId)!]));

  const progresso = steps.length ? await db.select().from(schema.stepProgress).where(inArray(schema.stepProgress.stepId, steps.map((s) => s.id))) : [];
  const envios = await db.select().from(schema.submissions).where(and(eq(schema.submissions.assignmentId, assignmentId), eq(schema.submissions.isCurrent, true)));
  const arquivosPorEnvio = envios.length ? await db.select({ sid: schema.submissionFiles.submissionId, n: sql<number>`count(*)` }).from(schema.submissionFiles).where(inArray(schema.submissionFiles.submissionId, envios.map((e) => e.id))).groupBy(schema.submissionFiles.submissionId) : [];
  const congelamentos = (await db.select().from(schema.modelFreezes).where(eq(schema.modelFreezes.assignmentId, assignmentId))).filter((f) => !f.modelVersion.endsWith("-invalidado"));
  const previsoes = cfg ? await db.select().from(schema.blindSubmissions).where(eq(schema.blindSubmissions.blindTestId, cfg.id)) : [];
  const notas = await db.select().from(schema.grades).where(eq(schema.grades.assignmentId, assignmentId));

  // rastro no audit_log: downloads da base e do OOT, uploads de manifesto e de previsões, previsões recusadas
  // qualquer base da edição conta como base baixada; o OOT conta o de qualquer base e o do trabalho (turma de base única)
  const [turma] = await db.select({ editionId: schema.classes.editionId }).from(schema.classes).where(eq(schema.classes.id, classId));
  const bases = turma ? await db.select().from(schema.datasets).where(eq(schema.datasets.editionId, turma.editionId)) : [];
  const arquivosBase = new Set(bases.flatMap((d) => [d.fileId, d.dictionaryFileId]).filter((x): x is string => Boolean(x)));
  const arquivosOot = new Set([...bases.map((d) => d.ootFileId), cfg?.ootFileId].filter((x): x is string => Boolean(x)));
  const rastro = userIds.length ? await db.select({ actor: schema.auditLog.actorUserId, action: schema.auditLog.action, entityId: schema.auditLog.entityId, details: schema.auditLog.details, at: schema.auditLog.createdAt })
    .from(schema.auditLog).where(and(inArray(schema.auditLog.actorUserId, userIds), inArray(schema.auditLog.action, ["file.download", "file.upload", "blind.submit.rejected"]))) : [];
  const ultimoAcesso = userIds.length ? await db.select({ userId: schema.sessions.userId, at: sql<Date>`max(${schema.sessions.lastSeenAt})` }).from(schema.sessions).where(inArray(schema.sessions.userId, userIds)).groupBy(schema.sessions.userId) : [];

  const alunos = matriculas.map((m) => {
    const uid = m.userId;
    const gr = uid ? grupoDe.get(uid) ?? null : null;
    const doSujeito = <T extends { groupId: string | null; userId?: string | null }>(x: T) => (assignment.mode === "grupo" ? Boolean(gr) && x.groupId === gr!.g.id : x.userId === uid);
    const missoes = steps.map((s) => {
      const p = progresso.find((x) => x.stepId === s.id && (assignment.mode === "grupo" ? Boolean(gr) && x.groupId === gr!.g.id : x.userId === uid && !x.groupId));
      return { numero: s.number, titulo: s.title, status: p?.status ?? "pendente", nota: p?.note ?? null, em: quando(p?.updatedAt) };
    });
    const envio = envios.find((e) => (assignment.mode === "grupo" ? Boolean(gr) && e.groupId === gr!.g.id : e.submitterUserId === uid && !e.groupId)) ?? null;
    const congelamento = congelamentos.find((f) => doSujeito({ groupId: f.groupId, userId: f.userId })) ?? null;
    const minhasPrevisoes = previsoes.filter((b) => (assignment.mode === "grupo" ? Boolean(gr) && b.groupId === gr!.g.id : b.userId === uid));
    const meu = rastro.filter((r) => r.actor === uid);
    const primeiro = (f: (r: (typeof meu)[number]) => boolean) => meu.filter(f).sort((a, b) => +a.at - +b.at)[0]?.at ?? null;
    const doGrupo = (f: (r: (typeof rastro)[number]) => boolean) => {
      const ids = new Set(gr ? membros.filter((x) => x.groupId === gr.g.id).map((x) => x.userId) : uid ? [uid] : []);
      return rastro.filter((r) => r.actor && ids.has(r.actor) && f(r)).sort((a, b) => +a.at - +b.at)[0]?.at ?? null;
    };
    const proposito = (r: { details: unknown }) => (r.details as { purpose?: string } | null)?.purpose;
    const baixouBase = primeiro((r) => r.action === "file.download" && Boolean(r.entityId && arquivosBase.has(r.entityId)));
    const baixouOot = primeiro((r) => r.action === "file.download" && Boolean(r.entityId && arquivosOot.has(r.entityId)));
    const ootDoGrupo = doGrupo((r) => r.action === "file.download" && Boolean(r.entityId && arquivosOot.has(r.entityId)));
    const ultimo = (f: (r: (typeof meu)[number]) => boolean) => { const l = meu.filter(f); return { n: l.length, em: l.sort((a, b) => +b.at - +a.at)[0]?.at ?? null }; };
    const manifestos = ultimo((r) => r.action === "file.upload" && proposito(r) === "manifest");
    const recusadas = ultimo((r) => r.action === "blind.submit.rejected" && r.entityId === assignmentId);
    const nota = notas.find((g) => g.userId === uid) ?? null;

    let etapa: Etapa;
    if (!uid || m.status !== "ativo") etapa = "sem_acesso";
    else if (assignment.mode === "grupo" && !gr) etapa = "sem_grupo";
    else if (assignment.blindTestEnabled && gr && !gr.ds?.ootFileId && !cfg?.ootFileId) etapa = "sem_base";
    else if (minhasPrevisoes.length) etapa = "previsoes_enviadas";
    else if (ootDoGrupo) etapa = "oot_baixado";
    else if (congelamento || livre) etapa = "congelado";
    else etapa = "falta_congelar";

    return {
      userId: uid, nome: m.name, email: m.email, matricula: m.status,
      ultimoAcesso: quando(ultimoAcesso.find((u) => u.userId === uid)?.at),
      grupo: gr ? { nome: gr.g.name, base: gr.ds?.code ?? null, colegas: membros.filter((x) => x.groupId === gr.g.id && x.userId !== uid).map((x) => matriculas.find((mm) => mm.userId === x.userId)?.name ?? "fora da lista") } : null,
      missoes,
      concluidas: missoes.filter((x) => x.status === "concluida" || x.status === "validada").length,
      emAndamento: missoes.filter((x) => x.status === "em_andamento").length,
      entrega: envio ? { versao: envio.versionNo, status: envio.status, enviadaEm: quando(envio.submittedAt), atraso: envio.late, arquivos: Number(arquivosPorEnvio.find((x) => x.sid === envio.id)?.n ?? 0) } : null,
      testeCego: assignment.blindTestEnabled ? {
        etapa,
        congelado: congelamento ? { em: quando(congelamento.frozenAt), versao: congelamento.modelVersion, hashes: (congelamento.artifactHashes as unknown[]).length } : null,
        baixouBase: quando(baixouBase), baixouOot: quando(baixouOot), ootDoGrupo: quando(ootDoGrupo),
        manifestosEnviados: manifestos.n, ultimoManifesto: quando(manifestos.em), previsoesRecusadas: recusadas.n, ultimaRecusa: quando(recusadas.em),
        previsoes: minhasPrevisoes.map((b) => ({ n: b.submissionNo, em: quando(b.submittedAt), valida: Boolean((b.validation as { valid?: boolean } | null)?.valid) })),
      } : null,
      nota: nota ? { status: nota.status, total: nota.total, publicada: Boolean(nota.publishedAt) } : null,
    };
  }).sort((a, b) => Number(a.testeCego?.etapa === "sem_acesso") - Number(b.testeCego?.etapa === "sem_acesso") || a.nome.localeCompare(b.nome, "pt-BR"));

  return { assignment: { id: assignment.id, title: assignment.title, mode: assignment.mode, blindTestEnabled: assignment.blindTestEnabled, status: assignment.status }, livre, totalMissoes: steps.length, alunos };
}

export type AndamentoAluno = Awaited<ReturnType<typeof andamentoDoTrabalho>>["alunos"][number];
