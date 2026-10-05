import "server-only";
import { asc, eq, inArray } from "drizzle-orm";
import { db, schema } from "@/lib/db/client";
import { ALUNOS, TRABALHO_1, devolutiva } from "@/lib/avaliacoes/trabalho-1";
import { vincular, vinculados, type ResultadoVinculo } from "@/lib/avaliacoes/vinculo";

export type MatriculaResumo = { enrollmentId: string; userId: string | null; nome: string; email: string; status: string; papel: string };

export type VinculoTurma = {
  turma: { id: string; code: string; name: string } | null;
  porAluno: Record<string, ResultadoVinculo>;
  matriculas: Map<string, MatriculaResumo>;
  /** Vínculos por turma, para o professor ver por que uma turma foi escolhida. */
  placar: { id: string; code: string; name: string; vinculados: number }[];
};

/**
 * Turma do Trabalho 1: entre as turmas do ano letivo de TRABALHO_1.anoLetivo, a que tem mais alunos da devolutiva com vínculo único, desde que pelo menos
 * TRABALHO_1.vinculoMinimo. Empate fica com a turma mais antiga. Abaixo do mínimo, nenhuma turma recebe a
 * avaliação, e nenhum aluno a vê.
 */
export async function vinculoTrabalho1(): Promise<VinculoTurma> {
  const turmas = await db.select({ id: schema.classes.id, code: schema.classes.code, name: schema.classes.name }).from(schema.classes)
    .innerJoin(schema.editions, eq(schema.editions.id, schema.classes.editionId))
    .where(eq(schema.editions.year, TRABALHO_1.anoLetivo))
    .orderBy(asc(schema.classes.createdAt));
  const ids = turmas.map((t) => t.id);
  const linhas = ids.length ? await db.select({ e: schema.enrollments, nomePerfil: schema.users.name }).from(schema.enrollments)
    .leftJoin(schema.users, eq(schema.users.id, schema.enrollments.userId))
    .where(inArray(schema.enrollments.classId, ids)) : [];
  const alunos = ALUNOS.map((a) => ({ id: a.id, nome: a.nome, email: a.email }));
  let melhor: { turma: (typeof turmas)[number]; porAluno: Record<string, ResultadoVinculo>; n: number } | null = null;
  const placar: VinculoTurma["placar"] = [];
  const matriculas = new Map<string, MatriculaResumo>();
  for (const t of turmas) {
    const daTurma = linhas.filter((l) => l.e.classId === t.id && l.e.role !== "professor");
    for (const l of daTurma) matriculas.set(l.e.id, { enrollmentId: l.e.id, userId: l.e.userId, nome: l.e.name, email: l.e.email, status: l.e.status, papel: l.e.role });
    const porAluno = vincular(alunos, daTurma.map((l) => ({ id: l.e.id, email: l.e.email, nomes: [l.e.name, l.nomePerfil ?? ""] })));
    const n = vinculados(porAluno);
    placar.push({ ...t, vinculados: n });
    if (n >= TRABALHO_1.vinculoMinimo && (!melhor || n > melhor.n)) melhor = { turma: t, porAluno, n };
  }
  return { turma: melhor?.turma ?? null, porAluno: melhor?.porAluno ?? {}, matriculas, placar };
}

/** Devolutiva do usuário na turma, ou nulo quando a turma não é a do Trabalho 1 ou o vínculo não é único. */
export async function devolutivaDoUsuario(classId: string, userId: string) {
  const v = await vinculoTrabalho1();
  if (!v.turma || v.turma.id !== classId) return null;
  for (const [alunoId, r] of Object.entries(v.porAluno)) {
    if (r.status !== "vinculado") continue;
    if (v.matriculas.get(r.candidatoId)?.userId === userId) return devolutiva(alunoId);
  }
  return null;
}
