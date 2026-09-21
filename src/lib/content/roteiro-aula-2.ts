/**
 * Roteiro da Aula 2: os 50 slides de /slides/aula-2 e as páginas do apêndice que cada um cobre.
 *
 * Procedência das correspondências, que não é uniforme e não deve ser lida como se fosse:
 * - Slides 07 a 20, capítulo 4: correspondência conferida página a página em
 *   `aula_credito_html/02_controle/MAPA_REAPROVEITAMENTO.md`, onde as 22 páginas do capítulo
 *   foram comparadas uma a uma com os slides, com decisão registrada por página.
 * - Slides 21 a 42, capítulos 5 e 6: correspondência estabelecida por título e pelo objetivo
 *   de aprendizagem de cada página em `content/generated/extract.json`. É leitura de assunto,
 *   não derivação: os slides foram implementados a partir dos roteiros de `01_slides/`.
 * - Slides 01 a 06 e 43 a 50: as páginas equivalentes estão nos capítulos 1, 3, 7, 8, 9 e 10,
 *   que pertencem às Aulas 1, 3 e 4. Não há correspondência de página registrada, e por isso
 *   ficam com a lista vazia em vez de um palpite.
 *
 * `paginas` são slugs de página da edição. O modo ao vivo aceita qualquer página da edição,
 * então o professor pode publicar a questão de uma página do apêndice enquanto projeta o slide.
 */
export type SlideAula2 = { n: string; bloco: string; titulo: string; paginas: string[] };

/**
 * Notas de um slide, como `aula_credito_html/build.mjs` as grava em `content/slides/aula-2-notas.json`:
 * o que o professor lê no painel enquanto a turma vê o slide. Nunca vão ao aluno: a rota /slides/aula-2
 * serve a ele a variante compilada sem elas.
 */
export type NotaSlideAula2 = {
  n: string; bloco: string; blocoNome: string; titulo: string; subtitulo: string | null; conclusao: string | null;
  fonte: string | null; resumo: string | null;
  notas: { conducao: string[]; respostas: string[]; cuidados: string[]; aprofundar: string[]; transicao: string | null } | null;
  proximo: { n: string; titulo: string } | null;
};

export const ROTEIRO_AULA_2: SlideAula2[] = [
  { n: "01", bloco: "Problema", titulo: "Quem merece receber crédito?", paginas: [] },
  { n: "02", bloco: "Problema", titulo: "Quatro clientes acompanharão os três modelos", paginas: [] },
  { n: "03", bloco: "Problema", titulo: "Uma PD precisa de evento, horizonte e população", paginas: [] },
  { n: "04", bloco: "Problema", titulo: "A previsão só pode usar o que já era conhecido", paginas: [] },
  { n: "05", bloco: "Problema", titulo: "O teste deve representar uma decisão no futuro", paginas: [] },
  { n: "06", bloco: "Problema", titulo: "Três maneiras de transformar dados em PD", paginas: [] },
  { n: "07", bloco: "Logit", titulo: "O logit começa com uma soma ponderada", paginas: ["c4p1", "c4p8", "c4p13"] },
  { n: "08", bloco: "Logit", titulo: "Um escore livre precisa de uma transformação", paginas: ["c4p2"] },
  { n: "09", bloco: "Logit", titulo: "A curva logística transforma escore em PD", paginas: ["c4p7", "c4p6"] },
  { n: "10", bloco: "Logit", titulo: "Probabilidade, odds e log odds são escalas diferentes", paginas: ["c4p3", "c4p4", "c4p5"] },
  { n: "11", bloco: "Logit", titulo: "O coeficiente altera as odds, não diretamente a PD", paginas: ["c4p10", "c4p11", "c4p12", "c4p14"] },
  { n: "12", bloco: "Logit", titulo: "Da ficha do cliente à PD, sem caixa fechada", paginas: ["c4p8", "c4p9"] },
  { n: "13", bloco: "Logit", titulo: "Aprender coeficientes significa reduzir uma perda", paginas: ["c4p15", "c4p16", "c4p17", "c4p18"] },
  { n: "14", bloco: "Logit", titulo: "O mesmo coeficiente produz efeitos diferentes na PD", paginas: ["c4p7", "c4p10"] },
  { n: "15", bloco: "Logit", titulo: "Categorias entram por comparação com uma referência", paginas: [] },
  { n: "16", bloco: "Logit", titulo: "O logit pode representar relações não lineares", paginas: ["c4p20", "c4p21"] },
  { n: "17", bloco: "Logit", titulo: "Uma característica pode mudar o efeito de outra", paginas: [] },
  { n: "18", bloco: "Logit", titulo: "Regularizar ajuda a controlar sensibilidade aos dados", paginas: [] },
  { n: "19", bloco: "Logit", titulo: "Quando o logit é uma boa escolha?", paginas: ["c4p19", "c4p20", "c4p22"] },
  { n: "20", bloco: "Logit", titulo: "Exercício: o que muda na PD de Bruno?", paginas: [] },
  { n: "21", bloco: "Árvore", titulo: "Uma árvore organiza a previsão em perguntas", paginas: ["c5p1", "c5p2", "c5p3"] },
  { n: "22", bloco: "Árvore", titulo: "A PD vem dos contratos que chegaram à folha", paginas: ["c5p12", "c5p11"] },
  { n: "23", bloco: "Árvore", titulo: "A árvore compara perguntas candidatas", paginas: ["c5p6", "c5p7", "c5p8"] },
  { n: "24", bloco: "Árvore", titulo: "O ganho mede a redução da mistura de classes", paginas: ["c5p4", "c5p5"] },
  { n: "25", bloco: "Árvore", titulo: "A mesma taxa pode ter incerteza muito diferente", paginas: ["c5p13"] },
  { n: "26", bloco: "Árvore", titulo: "A árvore transforma o espaço em regiões", paginas: ["c5p9", "c5p10"] },
  { n: "27", bloco: "Árvore", titulo: "Mais divisões podem melhorar o treino e piorar o futuro", paginas: ["c5p14"] },
  { n: "28", bloco: "Árvore", titulo: "Há diferentes maneiras de limitar a árvore", paginas: ["c5p14", "c5p15"] },
  { n: "29", bloco: "Árvore", titulo: "Uma pequena mudança nos dados pode mudar os caminhos", paginas: ["c5p16"] },
  { n: "30", bloco: "Árvore", titulo: "Exercício: percorrer, interpretar e questionar a árvore", paginas: ["c5p18", "c5p19", "c5p11"] },
  { n: "31", bloco: "Boosting", titulo: "Uma árvore pequena pode deixar padrões sem explicar", paginas: ["c6p1", "c6p2", "c6p3"] },
  { n: "32", bloco: "Boosting", titulo: "O boosting constrói o escore em etapas", paginas: ["c6p5"] },
  { n: "33", bloco: "Boosting", titulo: "O ponto de partida é uma previsão comum", paginas: ["c6p4"] },
  { n: "34", bloco: "Boosting", titulo: "A primeira árvore aproxima a direção de melhoria", paginas: ["c6p6"] },
  { n: "35", bloco: "Boosting", titulo: "A segunda árvore responde a um erro que já mudou", paginas: ["c6p12", "c6p8"] },
  { n: "36", bloco: "Boosting", titulo: "Somamos contribuições no escore e só então calculamos PD", paginas: ["c6p9", "c6p10", "c6p11", "c6p14"] },
  { n: "37", bloco: "Boosting", titulo: "Passos menores mudam a trajetória de aprendizagem", paginas: ["c6p7", "c6p16"] },
  { n: "38", bloco: "Boosting", titulo: "A profundidade define a complexidade de cada correção", paginas: ["c6p15"] },
  { n: "39", bloco: "Boosting", titulo: "A validação indica quando parar de acrescentar árvores", paginas: ["c6p17"] },
  { n: "40", bloco: "Boosting", titulo: "Flexibilidade ajuda quando encontra sinal reproduzível", paginas: ["c6p18"] },
  { n: "41", bloco: "Boosting", titulo: "Explicar a carteira e explicar um cliente são tarefas diferentes", paginas: ["c6p14"] },
  { n: "42", bloco: "Boosting", titulo: "Exercício: reconstrua a previsão de um novo cliente", paginas: ["c6p13", "c6p19"] },
  { n: "43", bloco: "Avaliação e decisão", titulo: "Uma comparação justa começa pelo protocolo", paginas: [] },
  { n: "44", bloco: "Avaliação e decisão", titulo: "Discriminação é colocar maior risco acima de menor risco", paginas: [] },
  { n: "45", bloco: "Avaliação e decisão", titulo: "Ranking bom não garante probabilidades corretas", paginas: [] },
  { n: "46", bloco: "Avaliação e decisão", titulo: "O corte muda quem entra na carteira", paginas: [] },
  { n: "47", bloco: "Avaliação e decisão", titulo: "A PD é uma entrada da decisão econômica", paginas: [] },
  { n: "48", bloco: "Avaliação e decisão", titulo: "O modelo precisa continuar útil depois da implantação", paginas: [] },
  { n: "49", bloco: "Avaliação e decisão", titulo: "Comitê: qual modelo e qual política você defenderia?", paginas: [] },
  { n: "50", bloco: "Avaliação e decisão", titulo: "O modelo produz uma PD; a boa decisão exige mais", paginas: [] },
];

/** A única página do apêndice sem slide correspondente, registrada para não parecer esquecimento. */
export const SEM_SLIDE = ["c5p17"];

export function slideValido(n: string): boolean {
  return ROTEIRO_AULA_2.some((s) => s.n === n);
}

export function slideDaPagina(slug: string): SlideAula2 | undefined {
  return ROTEIRO_AULA_2.find((s) => s.paginas.includes(slug));
}
