import "server-only";
import { asc, eq, inArray } from "drizzle-orm";
import { db, schema } from "@/lib/db/client";
import { ALUNOS, TRABALHO_1, devolutiva } from "@/lib/avaliacoes/trabalho-1";
import { ALUNOS_T2, TRABALHO_2, devolutivaT2 } from "@/lib/avaliacoes/trabalho-2";
import { vincular, vinculados, type AlunoVinculo, type ResultadoVinculo } from "@/lib/avaliacoes/vinculo";

export type MatriculaResumo = { enrollmentId: string; userId: string | null; nome: string; email: string; status: string; papel: string };

export type VinculoTurma = {
  turma: { id: string; code: string; name: string } | null;
  porAluno: Record<string, ResultadoVinculo>;
  matriculas: Map<string, MatriculaResumo>;
  /** Vínculos por turma, para o professor ver por que uma turma foi escolhida. */
  placar: { id: string; code: string; name: string; vinculados: number }[];
};

/**
 * Turma de uma avaliação: entre as turmas do ano letivo, a que tem mais alunos da devolutiva com vínculo único, desde
 * que pelo menos o mínimo configurado. Empate fica com a turma mais antiga. Abaixo do mínimo, nenhuma turma recebe a
 * avaliação, e nenhum aluno a vê.
 */
async function vinculoAvaliacao(alunos: AlunoVinculo[], cfg: { anoLetivo: number; vinculoMinimo: number }): Promise<VinculoTurma> {
  const turmas = await db.select({ id: schema.classes.id, code: schema.classes.code, name: schema.classes.name }).from(schema.classes)
    .innerJoin(schema.editions, eq(schema.editions.id, schema.classes.editionId))
    .where(eq(schema.editions.year, cfg.anoLetivo))
    .orderBy(asc(schema.classes.createdAt));
  const ids = turmas.map((t) => t.id);
  const linhas = ids.length ? await db.select({ e: schema.enrollments, nomePerfil: schema.users.name }).from(schema.enrollments)
    .leftJoin(schema.users, eq(schema.users.id, schema.enrollments.userId))
    .where(inArray(schema.enrollments.classId, ids)) : [];
  let melhor: { turma: (typeof turmas)[number]; porAluno: Record<string, ResultadoVinculo>; n: number } | null = null;
  const placar: VinculoTurma["placar"] = [];
  const matriculas = new Map<string, MatriculaResumo>();
  for (const t of turmas) {
    const daTurma = linhas.filter((l) => l.e.classId === t.id && l.e.role !== "professor");
    for (const l of daTurma) matriculas.set(l.e.id, { enrollmentId: l.e.id, userId: l.e.userId, nome: l.e.name, email: l.e.email, status: l.e.status, papel: l.e.role });
    const porAluno = vincular(alunos, daTurma.map((l) => ({ id: l.e.id, email: l.e.email, nomes: [l.e.name, l.nomePerfil ?? ""] })));
    const n = vinculados(porAluno);
    placar.push({ ...t, vinculados: n });
    if (n >= cfg.vinculoMinimo && (!melhor || n > melhor.n)) melhor = { turma: t, porAluno, n };
  }
  return { turma: melhor?.turma ?? null, porAluno: melhor?.porAluno ?? {}, matriculas, placar };
}

/** Turma do Trabalho 1 (ano letivo de TRABALHO_1.anoLetivo, mínimo de TRABALHO_1.vinculoMinimo vínculos). */
export function vinculoTrabalho1(): Promise<VinculoTurma> {
  return vinculoAvaliacao(ALUNOS.map((a) => ({ id: a.id, nome: a.nome, nomeCompleto: a.nomeCompleto, email: a.email })), TRABALHO_1);
}

/** Turma do Trabalho 2, pela mesma regra; o e-mail de cada aluno fixa o vínculo. */
export function vinculoTrabalho2(): Promise<VinculoTurma> {
  return vinculoAvaliacao(ALUNOS_T2.map((a) => ({ id: a.id, nome: a.nome, email: a.email })), TRABALHO_2);
}

/** Aluno da devolutiva ligado ao usuário na turma, ou nulo quando a turma não é a da avaliação ou o vínculo não é único. */
function alunoDoUsuario(v: VinculoTurma, classId: string, userId: string): string | null {
  if (!v.turma || v.turma.id !== classId) return null;
  for (const [alunoId, r] of Object.entries(v.porAluno)) {
    if (r.status !== "vinculado") continue;
    if (v.matriculas.get(r.candidatoId)?.userId === userId) return alunoId;
  }
  return null;
}

/** Devolutiva do Trabalho 1 do usuário na turma, ou nulo. */
export async function devolutivaDoUsuario(classId: string, userId: string) {
  const id = alunoDoUsuario(await vinculoTrabalho1(), classId, userId);
  return id ? devolutiva(id) : null;
}

/** Devolutiva do Trabalho 2 do usuário na turma, ou nulo. */
export async function devolutivaT2DoUsuario(classId: string, userId: string) {
  const id = alunoDoUsuario(await vinculoTrabalho2(), classId, userId);
  return id ? devolutivaT2(id) : null;
}
