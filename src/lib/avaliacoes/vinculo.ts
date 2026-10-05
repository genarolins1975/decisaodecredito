/**
 * Vínculo entre a devolutiva (nome como o professor escreveu) e a matrícula na plataforma.
 *
 * A devolutiva traz o nome curto ("Renata Valsa", "Sebastião"); a matrícula traz o nome da lista importada,
 * que pode ser completo ("Renata Carneiro Valsa"), ou o e-mail como nome provisório. A regra é conservadora,
 * porque o erro que importa é mostrar a nota de um aluno a outro:
 *   - um aluno casa com uma matrícula quando todos os termos do seu nome aparecem no nome da matrícula, no
 *     nome do perfil ou na parte local do e-mail, ou quando um desses nomes, com pelo menos dois termos, está
 *     inteiro contido no nome da devolutiva ("Jader Santana" casa com "Jader Brenny Santana"). Sem acento e
 *     sem caixa; inicial "N" casa com qualquer termo que comece por n; "de", "da", "do", "dos", "das" e "e"
 *     são ignorados;
 *   - e-mail informado na devolutiva tem precedência e casa só com a matrícula daquele e-mail;
 *   - o vínculo só vale quando é único nos dois sentidos: o aluno casa com uma única matrícula e essa
 *     matrícula casa com um único aluno. Qualquer ambiguidade fica sem vínculo e aparece para o professor.
 */

export type Candidato = { id: string; nomes: string[]; email: string };
export type AlunoVinculo = { id: string; nome: string; email?: string };

export type ResultadoVinculo =
  | { status: "vinculado"; candidatoId: string }
  | { status: "ambiguo"; candidatos: string[] }
  | { status: "sem_correspondencia" };

const PARTICULAS = new Set(["de", "da", "do", "das", "dos", "e", "d"]);

export function termos(texto: string): string[] {
  return texto
    .normalize("NFD").replace(/\p{M}/gu, "")
    .toLowerCase()
    .split(/[^a-z]+/)
    .filter((t) => t && !PARTICULAS.has(t));
}

const normEmail = (e: string) => e.trim().toLowerCase();

const localDoEmail = (email: string) => email.split("@")[0] ?? "";

function termosDoCandidato(c: Candidato): Set<string> {
  return new Set([...c.nomes.flatMap(termos), ...termos(localDoEmail(c.email))]);
}

/** Termo presente no conjunto; termo de uma letra é inicial e casa com qualquer termo que comece por ela. */
const contem = (conjunto: Set<string>, t: string) => (t.length === 1 ? [...conjunto].some((x) => x.startsWith(t)) : conjunto.has(t));

function casa(aluno: AlunoVinculo, c: Candidato, conjunto: Set<string>): boolean {
  if (aluno.email) return normEmail(aluno.email) === normEmail(c.email);
  const ts = termos(aluno.nome);
  if (ts.length === 0) return false;
  if (ts.every((t) => contem(conjunto, t))) return true;
  // nome da plataforma mais curto que o da devolutiva: vale se estiver inteiro nela, com ao menos dois termos
  const daDevolutiva = new Set(ts);
  return [...c.nomes, localDoEmail(c.email)].some((nome) => {
    const tn = termos(nome);
    return tn.length >= 2 && tn.every((t) => contem(daDevolutiva, t));
  });
}

export function vincular(alunos: AlunoVinculo[], candidatos: Candidato[]): Record<string, ResultadoVinculo> {
  const conjuntos = new Map(candidatos.map((c) => [c.id, termosDoCandidato(c)]));
  const porAluno = new Map(alunos.map((a) => [a.id, candidatos.filter((c) => casa(a, c, conjuntos.get(c.id)!)).map((c) => c.id)]));
  const porCandidato = new Map<string, number>();
  for (const ids of porAluno.values()) for (const id of ids) porCandidato.set(id, (porCandidato.get(id) ?? 0) + 1);
  const saida: Record<string, ResultadoVinculo> = {};
  for (const a of alunos) {
    const ids = porAluno.get(a.id)!;
    if (ids.length === 0) saida[a.id] = { status: "sem_correspondencia" };
    else if (ids.length === 1 && porCandidato.get(ids[0]) === 1) saida[a.id] = { status: "vinculado", candidatoId: ids[0] };
    else saida[a.id] = { status: "ambiguo", candidatos: ids };
  }
  return saida;
}

export const vinculados = (r: Record<string, ResultadoVinculo>) => Object.values(r).filter((x) => x.status === "vinculado").length;
