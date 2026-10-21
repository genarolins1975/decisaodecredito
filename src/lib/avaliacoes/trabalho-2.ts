/**
 * Trabalho 2 (trabalho final): modelo de PD com as doze missões e blueprint da operação do mesmo produto.
 *
 * Fonte: avaliação do professor contra a rubrica v2 (scripts/import-content.ts, RUBRICA_TRABALHO_FINAL_V2), feita em
 * 17/10/2026 e consolidada em 19/10/2026, e a reescala decidida em 21/10/2026. Os pontos por critério ficam em
 * trabalho-2-entregas.ts; nota bruta, régua e nota final são derivadas, nunca digitadas, e tests/trabalho-2.test.ts
 * confere cada uma contra os valores publicados.
 *
 * Régua de 21/10/2026: a menor nota bruta da turma vai a 7 e a maior a 10, numa reta. O cálculo é feito em décimos de
 * ponto (inteiros), para que valores como 9,625 não percam a metade no arredondamento.
 */
import { ENTREGAS_T2 } from "./trabalho-2-entregas";

export type CriterioT2 = "problema_dados" | "modelo_testes" | "uso_responsavel" | "reproducao_defesa" | "bp_coerencia" | "bp_regulatorio" | "bp_viabilidade" | "bp_conselho";

export const CRITERIOS_T2: { chave: CriterioT2; bloco: "Modelo" | "Blueprint"; numero: number; nome: string; pergunta: string }[] = [
  { chave: "problema_dados", bloco: "Modelo", numero: 1, nome: "Problema e dados", pergunta: "A pergunta está clara e os dados usados existiam na data da decisão?" },
  { chave: "modelo_testes", bloco: "Modelo", numero: 2, nome: "Modelo e testes", pergunta: "O grupo comparou os modelos corretamente e preservou o teste OOT?" },
  { chave: "uso_responsavel", bloco: "Modelo", numero: 3, nome: "Uso responsável", pergunta: "Explicou quando usar o modelo, como acompanhá lo e quem age se algo sair do esperado?" },
  { chave: "reproducao_defesa", bloco: "Modelo", numero: 4, nome: "Reprodução e defesa", pergunta: "Outra pessoa consegue executar o projeto e o aluno explica as decisões que tomou?" },
  { chave: "bp_coerencia", bloco: "Blueprint", numero: 5, nome: "Coerência entre fluxo, governança e modelo", pergunta: "Fluxograma, alçadas e modelo de decisão descrevem a mesma operação, sem contradições?" },
  { chave: "bp_regulatorio", bloco: "Blueprint", numero: 6, nome: "Aderência regulatória", pergunta: "Políticas, alçadas, uso de dados e monitoramento respeitam Bacen e LGPD, com referências citadas?" },
  { chave: "bp_viabilidade", bloco: "Blueprint", numero: 7, nome: "Viabilidade operacional", pergunta: "A operação cabe na capacidade declarada (faixa manual, prazos, sistemas) e escala sem quebrar a governança?" },
  { chave: "bp_conselho", bloco: "Blueprint", numero: 8, nome: "Clareza para o Conselho", pergunta: "Um conselheiro entende em uma página o que se decide, com que risco, quem responde e o que dispara ação?" },
];

export const MAX_CRITERIO = 2;
export const MAX_T2 = 16;

export const TRABALHO_2 = {
  slug: "trabalho-2",
  titulo: "Trabalho 2: modelo de PD e blueprint da operação",
  subtitulo: "Trabalho final. Modelo de PD construído, testado e defendido pelas doze missões, e blueprint da operação completa do mesmo produto.",
  avaliacao: "17/10/2026",
  consolidacao: "19/10/2026",
  reescala: "21/10/2026",
  fonte: "Avaliação do professor contra a rubrica v2 do trabalho final (17/10/2026), consolidação de 19/10/2026 e reescala de 21/10/2026.",
  anoLetivo: 2026,
  vinculoMinimo: 3,
};

export type StatusEntregavel = "presente" | "parcial" | "pendente" | "ausente";
export type CriterioAvaliado = { pontos: number; evidencia: string; lacunas: string; ajuste?: string };

export type EntregaT2 = {
  id: string;
  titulo: string;
  modalidade: "grupo" | "individual";
  base: string;
  observacao?: string;
  entregaveis: { chave: string; nome: string; status: StatusEntregavel; texto: string }[];
  missoes: { id: string; status: string; texto: string }[];
  criterios: Record<CriterioT2, CriterioAvaliado>;
  verificacoes: string[];
  fortes: string[];
  fracos: string[];
};

export type AlunoT2 = { id: string; nome: string; email: string; entrega: string };

/** Mesmos identificadores do Trabalho 1; o e-mail da matrícula fixa o vínculo. */
export const ALUNOS_T2: AlunoT2[] = [
  { id: "tomaz-leal", nome: "Tomaz Leal", email: "tomazleal@outlook.com", entrega: "consignado-tomaz" },
  { id: "roberto-gomides", nome: "Roberto Gomides", email: "robertogomides@me.com", entrega: "consignado-tomaz" },
  { id: "diana-cabral", nome: "Diana Cabral", email: "didicstri@gmail.com", entrega: "consignado-tomaz" },
  { id: "renata-valsa", nome: "Renata Valsa", email: "renata_valsa@hotmail.com", entrega: "habitacional-renata" },
  { id: "larissa-bastos", nome: "Larissa Bastos", email: "larissafbastos98@gmail.com", entrega: "habitacional-renata" },
  { id: "gabriel-winck", nome: "Gabriel Winck", email: "gabrielwinck@hotmail.com", entrega: "habitacional-renata" },
  { id: "jader-brenny-santana", nome: "Jader Brenny Santana", email: "jader_santana@hotmail.com", entrega: "consignado-jader" },
  { id: "stephan-lana-severiano", nome: "Stêphan Lana Severiano", email: "stephanlana@gmail.com", entrega: "pessoal-stephan" },
  { id: "raphael-dos-santos-andrade-silva", nome: "Raphael dos Santos Andrade Silva", email: "raphael.santos.andrade@gmail.com", entrega: "pessoal-stephan" },
  { id: "andre-souza", nome: "André Souza", email: "andrenesouza@gmail.com", entrega: "recebiveis-asa" },
  { id: "andre-meirelles", nome: "André Meirelles", email: "andreldmeirelles@gmail.com", entrega: "recebiveis-asa" },
  { id: "sebastiao", nome: "Sebastião Campos", email: "sebastiaoscamposjr@gmail.com", entrega: "recebiveis-asa" },
  { id: "guilherme-castro", nome: "Guilherme Castro", email: "castro11.11gui@gmail.com", entrega: "consignado-guilherme" },
  { id: "michelle-bouhid", nome: "Michelle Bouhid", email: "michelle.bouhid@gmail.com", entrega: "pessoal-michelle" },
  { id: "carlos-eduardo-n-campos", nome: "Carlos Eduardo N Campos", email: "cenc.eduardocampos@gmail.com", entrega: "habitacional-carlos" },
  { id: "joao-pedro", nome: "João Pedro", email: "jpcancadobarbosa@hotmail.com", entrega: "rural-agrogalaxy" },
  { id: "gabriel-andrade", nome: "Gabriel Andrade", email: "gabrielbove13@gmail.com", entrega: "rural-agrogalaxy" },
  { id: "matheus-luchi", nome: "Matheus Luchi", email: "matheusluchi@id.uff.br", entrega: "rural-agrogalaxy" },
];

/** Regras da avaliação, na ordem em que entram na nota. */
export const REGRAS_T2 = {
  rubrica: "A rubrica tem oito critérios, quatro do modelo e quatro do blueprint, cada um de 0 a 2: 0 quando não demonstrado, 1 quando parcial e 2 quando completo e sustentado por evidência. O máximo é 16 pontos. Nota bruta = pontos ÷ 16 × 10.",
  modelo: "Modelo e testes (critério 2) recebe 2 só com as três famílias exigidas pela missão 7 (logit, árvore e boosting) nas mesmas propostas, com o teste OOT preservado: nenhuma escolha feita com o arquivo cego e o OOT medido uma única vez, como manda a missão 12. A mesma regra vale para todas as entregas.",
  defesa: "Reprodução e defesa (critério 4): por decisão do professor em 19/10/2026, a defesa oral recebeu nota 8 de 10 para todos, aplicada ao critério inteiro. Todos têm 1,6 de 2 nesse critério; a nota de reprodução avaliada nos documentos fica registrada, mas não entra na conta.",
  reescala: "Em 21/10/2026 as notas foram reescaladas numa reta: a menor nota bruta da turma passa a 7 e a maior a 10. A ordem entre as entregas e a proporção das distâncias se mantêm; cada ponto da rubrica vale 0,375 na nota reescalada.",
  limites: "Os rótulos verdadeiros do OOT não estão disponíveis nesta avaliação, então o desempenho real no teste cego não foi medido; as previsões foram conferidas em formato, IDs e hashes. A base de desenvolvimento também não está disponível: o código foi avaliado por estrutura, instruções, manifesto, sementes, dependências e hashes, sem reexecução de ponta a ponta.",
  grupo: "Nos trabalhos em grupo, a nota e a devolutiva são da entrega coletiva e não identificam contribuição individual.",
};

/* ------------------------------------------------------------------ */
/* Cálculo                                                              */
/* ------------------------------------------------------------------ */

export const ENTREGAS = ENTREGAS_T2;

/** Pontos da entrega em décimos (inteiro): 1,6 vira 16. */
export const decimos = (e: EntregaT2) => CRITERIOS_T2.reduce((s, c) => s + Math.round(e.criterios[c.chave].pontos * 10), 0);
export const pontos = (e: EntregaT2) => decimos(e) / 10;
/** Nota bruta = pontos ÷ 16 × 10, exata em décimos. */
export const notaBruta = (e: EntregaT2) => decimos(e) / 16;

/** Régua de 21/10/2026: menor nota bruta da turma vai a 7, maior a 10. */
export function reguaT2() {
  const ds = ENTREGAS.map(decimos);
  const menor = Math.min(...ds), maior = Math.max(...ds);
  return { menorDecimos: menor, maiorDecimos: maior, menor: menor / 16, maior: maior / 16, menorPontos: menor / 10, maiorPontos: maior / 10, piso: 7, teto: 10, porPonto: 30 / (maior - menor) };
}

/** Nota reescalada: 7 + 3 × (nota bruta − menor) ÷ (maior − menor), em aritmética de décimos. */
export const notaT2 = (e: EntregaT2) => { const r = reguaT2(); return r.piso + (3 * (decimos(e) - r.menorDecimos)) / (r.maiorDecimos - r.menorDecimos); };

const fmt2 = new Intl.NumberFormat("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
/** Duas casas, vírgula decimal, arredondamento de metade para cima: 9,625 vira 9,63. */
export const n2 = (x: number) => fmt2.format(Math.round(x * 100 + 1e-9) / 100);
/** Pontos de critério: inteiro sem casa (2), fração com uma (1,6). */
export const p1 = (x: number) => (Math.abs(x - Math.round(x)) < 1e-9 ? String(Math.round(x)) : x.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 }));

export const entregaT2PorId = (id: string) => ENTREGAS.find((e) => e.id === id) ?? null;
export const alunoT2PorId = (id: string) => ALUNOS_T2.find((a) => a.id === id) ?? null;
export const integrantesT2 = (entregaId: string) => ALUNOS_T2.filter((a) => a.entrega === entregaId);

/** Tudo o que a página do aluno precisa, já calculado. */
export function devolutivaT2(alunoId: string) {
  const aluno = alunoT2PorId(alunoId);
  const entrega = aluno ? entregaT2PorId(aluno.entrega) : null;
  if (!aluno || !entrega) return null;
  const colegas = integrantesT2(entrega.id).filter((a) => a.id !== aluno.id);
  return { aluno, entrega, colegas, pontos: pontos(entrega), bruta: notaBruta(entrega), nota: notaT2(entrega), regua: reguaT2() };
}
export type DevolutivaT2 = NonNullable<ReturnType<typeof devolutivaT2>>;

/** Consolidação para o professor: por entrega, por aluno e por critério. */
export function consolidacaoT2() {
  const porEntrega = ENTREGAS.map((e) => ({ entrega: e, alunos: integrantesT2(e.id), pontos: pontos(e), bruta: notaBruta(e), nota: notaT2(e) }))
    .sort((a, b) => b.nota - a.nota);
  const porAluno = ALUNOS_T2.map((a) => { const e = entregaT2PorId(a.entrega)!; return { aluno: a, entrega: e, bruta: notaBruta(e), nota: notaT2(e) }; })
    .sort((a, b) => b.nota - a.nota || a.aluno.nome.localeCompare(b.aluno.nome, "pt-BR"));
  const media = (xs: number[]) => xs.reduce((s, x) => s + x, 0) / xs.length;
  const porCriterio = CRITERIOS_T2.map((c) => {
    const valores = ENTREGAS.map((e) => e.criterios[c.chave].pontos);
    return { criterio: c, media: media(valores), completos: valores.filter((v) => v >= 2).length, zeros: valores.filter((v) => v === 0).length };
  });
  return {
    porEntrega, porAluno, porCriterio, regua: reguaT2(),
    alunos: ALUNOS_T2.length, entregas: ENTREGAS.length,
    grupos: ENTREGAS.filter((e) => e.modalidade === "grupo").length,
    individuais: ENTREGAS.filter((e) => e.modalidade === "individual").length,
    mediaAlunos: media(porAluno.map((x) => x.nota)), minima: Math.min(...porAluno.map((x) => x.nota)), maxima: Math.max(...porAluno.map((x) => x.nota)), mediaBrutaAlunos: media(porAluno.map((x) => x.bruta)),
    ootValidos: ENTREGAS.filter((e) => e.entregaveis.find((x) => x.chave === "previsoes_oot")?.status === "presente").length,
  };
}
