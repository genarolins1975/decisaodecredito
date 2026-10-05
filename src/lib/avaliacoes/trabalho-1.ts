/**
 * Trabalho 1 (trabalho intermediário): painel decisório de crédito construído com inteligência artificial.
 *
 * Fonte única do resultado: o documento "Trabalho 1 devolutivas individuais" do professor, com 16 seções
 * individuais correspondentes a oito entregas. Os pontos por critério ficam aqui em sextos de ponto, que é a
 * precisão integral usada no cálculo do documento (23,83 é 143/6); nota base, composição e nota equiparada
 * são derivadas, nunca digitadas, e tests/trabalho-1.test.ts confere cada uma contra o valor publicado.
 *
 * Os textos são os do documento, com três ajustes de forma: espaço em "de R$" e em "7,00 pela", e o traço
 * do título da entrega AgroGalaxy trocado por dois pontos. Nenhum número ou juízo foi alterado.
 */

export type CriterioChave = "concepcao" | "verificacao" | "interpretacao" | "processo" | "apresentacao";

export const CRITERIOS: { chave: CriterioChave; nome: string; curto: string; max: number; descricao: string }[] = [
  { chave: "concepcao", nome: "Concepção", curto: "Concepção", max: 25, descricao: "Perguntas decisórias, escolha e justificativa dos indicadores." },
  { chave: "verificacao", nome: "Verificação", curto: "Verificação", max: 25, descricao: "Rastreabilidade de todos os números do painel até a fonte." },
  { chave: "interpretacao", nome: "Interpretação", curto: "Interpretação", max: 20, descricao: "Leitura, referência de comparação, consequência decisória e limites." },
  { chave: "processo", nome: "Caderno de processo", curto: "Processo", max: 15, descricao: "Prompts, aceites e rejeições, episódios de erro da IA e desvios de projeto." },
  { chave: "apresentacao", nome: "Apresentação e defesa", curto: "Apresentação", max: 15, descricao: "Defesa oral, incluindo a alteração solicitada ao vivo." },
];

export const DOCUMENTAL_MAX = 85;
export const TOTAL_MAX = 100;

export const TRABALHO_1 = {
  slug: "trabalho-1",
  titulo: "Trabalho 1: painel decisório de crédito",
  subtitulo: "Trabalho intermediário. Construção assistida por inteligência artificial de um painel decisório sobre o mercado de crédito brasileiro.",
  disciplina: "Gestão de Crédito no Varejo · Mestrado profissional em economia",
  checkpoint: "29/08/2026",
  entrega: "12/09/2026",
  fonte: "Documento Trabalho 1 devolutivas individuais, do professor, com as notas equiparadas da revisão anterior mantidas.",
  /** Ano letivo da turma avaliada: turmas de outros anos nunca recebem esta avaliação. */
  anoLetivo: 2026,
  /** Mínimo de alunos com vínculo único para a avaliação ser atribuída a uma turma do ano letivo. */
  vinculoMinimo: 3,
};

/** Pontos em sextos: p(23, 5) = 23 + 5/6. */
const p = (inteiro: number, sextos = 0) => inteiro + sextos / 6;

export type Paragrafo = { rotulo: string; texto: string };

export type Entrega = {
  id: string;
  tema: string;
  modalidade: "grupo" | "individual";
  pontos: Record<CriterioChave, number>;
  sintese: string;
  paragrafos: Paragrafo[];
  aprimorar: string[];
  /** Observação final da devolutiva, mostrada ao aluno como está no documento. */
  ressalva?: string;
  /** Avaliação condicionada a uma confirmação ainda pendente. */
  condicional?: string;
};

export const ENTREGAS: Entrega[] = [
  {
    id: "supervisao-bcb",
    tema: "Agenda de supervisão do BCB",
    modalidade: "grupo",
    pontos: { concepcao: p(23, 5), verificacao: p(18, 4), interpretacao: p(18, 1), processo: p(13, 4), apresentacao: 15 },
    sintese: "Considero o trabalho bem alinhado à decisão de supervisão de crédito. A separação entre instituições atípicas e instituições de maior relevância sistêmica transforma o painel em uma agenda de exame útil. A nota reconhece a coerência do desenho, a documentação do processo e a apresentação; os pontos ainda descontados se concentram na verificação integral dos dados e no alcance de algumas conclusões.",
    paragrafos: [
      { rotulo: "Concepção e interpretação", texto: "Na concepção, as três perguntas articulam crescimento, concentração e deterioração, com indicadores pertinentes e referências de comparação. Na interpretação, valorizo o tratamento das lacunas, da mudança contábil e da diferença entre score relativo e importância sistêmica." },
      { rotulo: "Verificação", texto: "Na verificação, reconheço a identificação das fontes, do recorte e da extração, mas os arquivos completos e o código não foram conferidos integralmente. O hash e a indicação de 39.250 linhas identificam uma versão; a conferência de cada número ainda exige a base e sua memória de cálculo." },
      { rotulo: "Processo", texto: "O caderno apresenta erros e correções substantivos, com justificativas para mudanças no projeto. A redução em processo decorre da seleção de trechos do primeiro prompt, em lugar do histórico integral. O diagnóstico do próprio painel também não substitui o diagnóstico do painel de referência exigido na atividade." },
    ],
    aprimorar: [
      "Apresentar a base original e a cadeia de cálculo de um indicador e do score, de modo que outra pessoa consiga reproduzi-los.",
      "Reformular afirmações sobre a carteira que “originou o atraso” ou sobre “perda ainda não reconhecida” como hipóteses de supervisão: o dado agregado não observa safras nem comprova perda não reconhecida.",
    ],
    ressalva: "A nota 10,00 resulta da equiparação comum da turma. Permanecem as melhorias técnicas apontadas. A versão publicada observada traz build de 18/09/2026; é necessário confirmar sua correspondência com a versão entregue.",
  },
  {
    id: "consignado-jader",
    tema: "Expansão do consignado",
    modalidade: "individual",
    pontos: { concepcao: p(22, 4), verificacao: p(19, 1), interpretacao: p(16, 1), processo: p(10, 1), apresentacao: 15 },
    sintese: "O trabalho apresenta boa disciplina de dados e uma escolha relevante de subsegmentos para discutir a expansão do consignado. O pacote de séries SGS, os códigos e a memória de extração sustentam os principais indicadores. A nota reconhece essa organização e a cautela ao distinguir inadimplência de prejuízo, com descontos por lacunas de reprodução, extrapolações interpretativas e documentação incompleta dos prompts.",
    paragrafos: [
      { rotulo: "Concepção e verificação", texto: "Na concepção, a segmentação entre consignado privado, público e INSS contribui para a decisão proposta. Na verificação, a conferência amostral dos CSV reproduziu valores principais, como inadimplência privada de 10,03%, pública de aproximadamente 2,707% e INSS de aproximadamente 1,920%." },
      { rotulo: "Lacunas de verificação", texto: "A referência IF.data para os números contextuais de 15,5% e 10,1% está identificada, mas falta a extração necessária para reconstruir a ponderação. A afirmação de juros do rotativo acima de 400% ao ano precisa de série específica. A diferença entre 5,3% na base PNAD e 5,4% no texto deve ser reconciliada." },
      { rotulo: "Interpretação e processo", texto: "Na interpretação, a comparação permite revisar apetite e limites, mas não basta para afirmar sobre-endividamento estrutural nem quantificar o preço da operação. No processo, há registro de questionamentos e correções da IA; o histórico resume a substância dos prompts, em vez de reproduzi-los integralmente." },
    ],
    aprimorar: [
      "Anexar a extração IF.data, a série de juros e as fórmulas de ponderação, conciliando os números do texto com os arquivos.",
      "Relacionar a recomendação a perda esperada e preço, delimitando o que os agregados permitem concluir; completar o histórico de prompts.",
    ],
  },
  {
    id: "banco-asa",
    tema: "Banco ASA: entrada no consignado privado",
    modalidade: "grupo",
    pontos: { concepcao: 22, verificacao: 17, interpretacao: 15, processo: p(11, 5), apresentacao: 15 },
    sintese: "O trabalho organiza uma decisão concreta de entrada no consignado privado, com perguntas, referências e consequências explícitas. Valorizo a transparência das fórmulas e o registro das correções no processo. A principal limitação é usar um estoque de atraso ajustado como aproximação de perda anual e tratar uma hipótese conservadora de LGD como garantia de robustez da decisão.",
    paragrafos: [
      { rotulo: "Concepção e verificação", texto: "Na concepção, a estrutura das três perguntas e a escolha dos indicadores atendem bem à decisão. Na verificação, fórmulas selecionadas de participação, composição e spread foram conferidas. As fontes adicionais REF e SCR estão identificadas, mas seus originais e o código completo não acompanharam o conjunto avaliado; por isso, a pontuação é parcial." },
      { rotulo: "Interpretação", texto: "Na interpretação, o índice ajuda a comparar segmentos, mas a razão entre atraso atual e saldo de um ano antes não é uma PD anual de safra. No cenário apresentado, reduzir a LGD de 1 para 0,5 eleva k de aproximadamente 1,68 para 3,36 e pode mudar o veredito. A decisão precisa ser condicionada a essa sensibilidade." },
      { rotulo: "Processo", texto: "No processo, o caderno registra erros e revisões relevantes. O desconto decorre de prompts resumidos ou incompletos e do diagnóstico voltado ao próprio painel, em lugar do painel de referência da aula." },
    ],
    aprimorar: [
      "Separar inadimplência de estoque, PD de safra e perda anual de precificação; testar LGD e denominador em cenários coerentes.",
      "Entregar os originais REF/SCR e os cálculos completos, além do histórico integral de prompts e do diagnóstico de referência.",
    ],
  },
  {
    id: "fidc-imobiliario",
    tema: "FIDC imobiliário: aceitação da carteira",
    modalidade: "grupo",
    pontos: { concepcao: p(24, 1), verificacao: 0, interpretacao: p(18, 2), processo: p(0, 2), apresentacao: 15 },
    sintese: "O trabalho apresenta uma formulação decisória forte: elegibilidade, preço e proteção da compra de uma carteira por um FIDC. A relação entre os indicadores e a operação é clara, e a revisão dos contratos mostra cuidado com o objeto analisado. A nota foi limitada principalmente pela impossibilidade de reproduzir o valor da carteira com os materiais recebidos e pela ausência do registro exigido do processo de IA.",
    paragrafos: [
      { rotulo: "Concepção e interpretação", texto: "Na concepção e na interpretação, valorizo as perguntas de aceitação, precificação e estrutura da operação, os cenários e a atenção às garantias. A análise ganha precisão ao trabalhar com os 21 contratos efetivamente considerados, em vez de manter a base inicial sem ajuste." },
      { rotulo: "Verificação", texto: "Na verificação, não consegui reconstruir o valor presente de R$ 17,30 milhões: faltam a base de recebíveis, as datas, as taxas e os documentos referenciados. A lista de anexos exibida no painel não permite conferir esses elementos. Pela regra de rastreabilidade da atividade, esse elo ausente implica zero no critério de verificação do conjunto recebido." },
      { rotulo: "Processo", texto: "No processo, os materiais não apresentam o caderno com prompts integrais, aceites e rejeições, três episódios de erro antes e depois e mudanças desde o checkpoint. O crédito residual atribuído a esse critério não substitui o conjunto documental exigido." },
    ],
    aprimorar: [
      "Entregar recebíveis e documentos de garantia em forma adequada à conferência, com memória de valor presente e TIR por contrato.",
      "Documentar as escolhas e correções da IA e apresentar o diagnóstico do painel de referência. Recalcular os cenários de recuperação e prazo de execução.",
    ],
    ressalva: "O zero em verificação descreve a falta de uma cadeia de cálculo demonstrável nos materiais recebidos. A documentação completa permitiria conferir os cálculos.",
  },
  {
    id: "fidc-cedente",
    tema: "FIDC: cedente e estrutura da operação",
    modalidade: "individual",
    pontos: { concepcao: p(18, 1), verificacao: 0, interpretacao: p(16, 5), processo: p(8, 1), apresentacao: 15 },
    sintese: "O trabalho articula bem a mecânica de um FIDC, especialmente a distinção entre capacidade econômica, funding e covenants. A nota reconhece essa organização e os erros registrados no roteiro. Os descontos decorrem sobretudo da utilização de parâmetros simulados em uma atividade que exigia dados rastreáveis, da cobertura incompleta das três perguntas e da documentação parcial do processo.",
    paragrafos: [
      { rotulo: "Concepção", texto: "Na concepção, a decisão é compreensível, mas a interpretação de seis indicadores e quatro visualizações como teto total, em vez de teto por pergunta, reduziu a cobertura da tarefa. As três perguntas precisam desenvolver uma análise própria, com indicadores e visualizações pertinentes." },
      { rotulo: "Verificação", texto: "Na verificação, PD de 4,5%, LGD de 55% e o multiplicador 1,10 usado para o cedente são parâmetros simulados. A simulação foi declarada, mas não atende à exigência empírica desta atividade. Os arquivos de núcleo e auditoria mencionados também não estão no pacote recebido; mantive zero em verificação." },
      { rotulo: "Interpretação e processo", texto: "Na interpretação, a relação entre restrições contratuais e viabilidade econômica é útil. No processo, o roteiro descreve cinco erros e suas correções, o que recebeu crédito; ainda falta o histórico integral de prompts, as decisões documentadas e a memória completa de verificação." },
    ],
    aprimorar: [
      "Substituir os parâmetros simulados por dados de origem identificável e uma cadeia de cálculo reproduzível, ou comprovar autorização específica para a simulação.",
      "Desenvolver as três perguntas no escopo solicitado e reunir base, código, auditoria e caderno de processo em uma entrega completa.",
    ],
    ressalva: "O roteiro declara ausência ao checkpoint. Não apliquei teto adicional nesta recalibração, porque seu valor não está definido na diretriz disponível.",
  },
  {
    id: "hipotecario-europeu",
    tema: "Crédito hipotecário europeu",
    modalidade: "individual",
    pontos: { concepcao: p(16, 1), verificacao: 0, interpretacao: p(15, 4), processo: 0, apresentacao: 10 },
    sintese: "O painel apresenta uma comparação organizada de profundidade, crescimento e garantias no crédito hipotecário, com referências e consequências claras. A nota reconhece essa qualidade analítica e incorpora 10 pontos na apresentação. Os principais descontos decorrem do recorte europeu, diferente do mercado brasileiro solicitado, da pergunta excedente e da falta de rastreabilidade suficiente de parte dos dados.",
    paragrafos: [
      { rotulo: "Concepção", texto: "Na concepção, o decisor e a comparação entre mercados estão bem definidos. Entretanto, o painel tem quatro perguntas; avaliei apenas as três primeiras e descontei o excedente. O recorte europeu requer autorização específica para ser considerado equivalente ao tema brasileiro." },
      { rotulo: "Verificação", texto: "Na verificação, a complementação das concessões de Luxemburgo com dados BCL não permite reconstruir o valor exibido com chave de série, original e regra de substituição. Uma base preparada dentro do HTML não substitui a origem de cada ponto. Pela trava de rastreabilidade, mantive zero nesse critério." },
      { rotulo: "Interpretação e processo", texto: "Na interpretação, os contrastes entre estoque e fluxo contribuem para a decisão. Contudo, a queda do preço dos imóveis não é, por si, LGD de execução: faltam LTV, custos, liquidez e prazo de recuperação. No processo, não foram recebidos o histórico de prompts, os episódios de erro e o diagnóstico do painel de referência." },
    ],
    aprimorar: [
      "Adequar o recorte à missão ou registrar a autorização para o tema; restringir o painel às três perguntas avaliadas.",
      "Reconstituir a origem dos dados de Luxemburgo, entregar os arquivos e o caderno IA e separar preço da garantia de perda efetiva na execução.",
    ],
    ressalva: "A nota de apresentação foi incorporada como 10 de 15 pontos. A autorização do tema europeu permanece a confirmar.",
  },
  {
    id: "braskem",
    tema: "Diagnóstico corporativo da Braskem",
    modalidade: "individual",
    pontos: { concepcao: p(11, 2), verificacao: 0, interpretacao: 12, processo: 0, apresentacao: 5 },
    sintese: "O diagnóstico integra aspectos importantes do risco corporativo da Braskem, como liquidez, alavancagem, governança e obrigações contingentes. A nota reconhece essa leitura, mas a entrega se afasta da arquitetura pedida para o Trabalho 1 e não permite reproduzir todos os números centrais. Foram incorporados 5 pontos na apresentação; a nota 7,00 resulta da aplicação da régua comum de equiparação.",
    paragrafos: [
      { rotulo: "Concepção", texto: "Na concepção, o texto e os slides organizam um diagnóstico corporativo, mas não apresentam o painel decisório com três perguntas, seis indicadores e quatro visualizações por pergunta. A adequação desse formato alternativo depende de autorização específica." },
      { rotulo: "Verificação", texto: "Na verificação, a alavancagem de 6,74 vezes em 2T 26 não está acompanhada de numerador, denominador, recorte e publicação que permitam refazer a conta. A confirmação pontual de uma renegociação em fonte primária não resolve esse elo. Pela exigência de rastreabilidade de todos os números, mantive zero em verificação." },
      { rotulo: "Interpretação e processo", texto: "Na interpretação, as recomendações de liquidez e estrutura de capital são pertinentes. Reconheci os limites metodológicos da seção 4, embora seu alcance seja parcial. O rating didático 4,3 deve permanecer identificado como escore subjetivo, sem ser tratado como PD calibrada. No processo, faltam o caderno IA e os registros exigidos." },
    ],
    aprimorar: [
      "Reorganizar o diagnóstico em torno de um decisor e das três perguntas exigidas, ou documentar a autorização para a alternativa apresentada.",
      "Reproduzir a alavancagem com dívida e EBITDA do mesmo perímetro e período; distinguir rating de agência, escore próprio e probabilidade de inadimplência, além de completar o processo IA.",
    ],
    ressalva: "A apresentação recebeu 5 de 15 pontos. Sua nota base foi equiparada para 7,00 pela régua aplicada às entregas avaliadas.",
  },
  {
    id: "agrogalaxy",
    tema: "AgroGalaxy: entrega intitulada Trabalho Final",
    modalidade: "grupo",
    pontos: { concepcao: p(14, 1), verificacao: 0, interpretacao: p(10, 1), processo: 0, apresentacao: 15 },
    sintese: "A análise da AgroGalaxy reúne dimensões úteis ao comitê de crédito, como liquidez, covenants, garantias e recuperação. A nota reconhece a leitura corporativa, mas foi reduzida por problemas de interpretação contábil, uma estimativa de PD sem reprodução suficiente e ausência de documentação do processo. A entrega foi identificada como Trabalho Final; esta avaliação permanece condicional à sua equivalência ao Trabalho 1.",
    paragrafos: [
      { rotulo: "Concepção e verificação", texto: "Na concepção, as perguntas retrospectivas ajudam a organizar a decisão, mas não desenvolvem plenamente a estrutura de painel exigida nesta atividade. Na verificação, a PD de 84,1% estimada por Merton não pode ser reproduzida com os dados e o código recebidos e conflita com a trava empírica; mantive zero no critério." },
      { rotulo: "Interpretação", texto: "Na interpretação, reclassificar dívida do longo para o curto prazo não altera, por si, a razão entre passivo total e ativo total. A tabela também mostra sete trimestres de EBITDA negativo, enquanto uma síntese menciona cinco. Essas inconsistências precisam ser corrigidas antes de sustentar a recomendação." },
      { rotulo: "Limites e processo", texto: "Reconheci os limites escritos sobre iliquidez e uso do modelo. Ainda é necessário distinguir a probabilidade sob medida de risco neutro de uma PD física calibrada e separar opinião de research de ações de rating de crédito. No processo, não foram recebidos prompts integrais nem episódios de erro documentados." },
    ],
    aprimorar: [
      "Conciliar as razões contábeis e a contagem de trimestres, mostrando a origem e a data de disponibilidade de cada informação.",
      "Reformular a análise de PD com método e dados adequados ao enunciado e entregar memória de cálculo, fontes originais e caderno de processo.",
    ],
    ressalva: "Equivalência ao Trabalho 1 ainda a confirmar. A apresentação foi incorporada com 15 de 15 pontos, na composição da nota.",
    condicional: "Avaliação condicional à equivalência da entrega ao Trabalho 1.",
  },
];

export type Aluno = {
  /** Identificador estável, usado na URL da prévia do professor. */
  id: string;
  /** Nome como está na devolutiva; o vínculo com a matrícula usa estes termos. */
  nome: string;
  entrega: string;
  /** E-mail da matrícula, quando o vínculo pelo nome não bastar. Tem precedência sobre o nome. */
  email?: string;
};

export const ALUNOS: Aluno[] = [
  { id: "tomaz-leal", nome: "Tomaz Leal", entrega: "supervisao-bcb" },
  { id: "roberto-gomides", nome: "Roberto Gomides", entrega: "supervisao-bcb" },
  { id: "diana-cabral", nome: "Diana Cabral", entrega: "supervisao-bcb" },
  { id: "jader-brenny-santana", nome: "Jader Brenny Santana", entrega: "consignado-jader" },
  { id: "andre-souza", nome: "André Souza", entrega: "banco-asa" },
  { id: "andre-meirelles", nome: "André Meirelles", entrega: "banco-asa" },
  { id: "sebastiao", nome: "Sebastião", entrega: "banco-asa" },
  { id: "renata-valsa", nome: "Renata Valsa", entrega: "fidc-imobiliario" },
  { id: "larissa-bastos", nome: "Larissa Bastos", entrega: "fidc-imobiliario" },
  { id: "gabriel-winck", nome: "Gabriel Winck", entrega: "fidc-imobiliario" },
  { id: "guilherme-castro", nome: "Guilherme Castro", entrega: "fidc-cedente" },
  { id: "michelle-bouhid", nome: "Michelle Bouhid", entrega: "hipotecario-europeu" },
  { id: "carlos-eduardo-n-campos", nome: "Carlos Eduardo N Campos", entrega: "braskem" },
  { id: "gabriel-andrade", nome: "Gabriel Andrade", entrega: "agrogalaxy" },
  { id: "joao-pedro", nome: "João Pedro", entrega: "agrogalaxy" },
  { id: "matheus-luchi", nome: "Matheus Luchi", entrega: "agrogalaxy" },
];

/** Pendências registradas no documento, para o professor resolver antes de dar a avaliação por definitiva. */
export const PENDENCIAS: { titulo: string; texto: string; entrega?: string }[] = [
  { titulo: "Equivalência da entrega AgroGalaxy", entrega: "agrogalaxy", texto: "A entrega foi identificada como Trabalho Final; a avaliação dos três integrantes permanece condicional à equivalência ao Trabalho 1." },
  { titulo: "Identificação do grupo ASA", entrega: "banco-asa", texto: "A identificação do grupo deve ser reconciliada com o caderno de processo." },
  { titulo: "Versão entregue dos painéis publicados", entrega: "supervisao-bcb", texto: "A versão publicada observada do painel de supervisão traz build de 18/09/2026, posterior à entrega; confirmar a correspondência com a versão entregue. O mesmo vale para os demais painéis publicados." },
  { titulo: "Registros do checkpoint de 29/08", texto: "Os registros permanecem a conferir. Nenhum teto de checkpoint foi aplicado, porque seu valor não estava definido; o roteiro de Guilherme Castro declara ausência." },
  { titulo: "Autorizações de escopo", texto: "Recorte europeu (Michelle Bouhid), diagnóstico corporativo sem a arquitetura de painel (Carlos Eduardo N Campos) e parâmetros simulados (Guilherme Castro) dependem de autorização específica para serem tratados como equivalentes." },
];

/* ------------------------------------------------------------------ */
/* Cálculo                                                              */
/* ------------------------------------------------------------------ */

export const documental = (e: Entrega) => e.pontos.concepcao + e.pontos.verificacao + e.pontos.interpretacao + e.pontos.processo;
export const total = (e: Entrega) => documental(e) + e.pontos.apresentacao;
export const notaBase = (e: Entrega) => total(e) / 10;

/** Régua comum: a menor nota base vai a 7 e a maior a 10, linear entre elas. */
export function regua() {
  const bases = ENTREGAS.map(notaBase);
  return { menor: Math.min(...bases), maior: Math.max(...bases), piso: 7, teto: 10 };
}

export function notaEquiparada(e: Entrega) {
  const r = regua();
  return r.piso + (r.teto - r.piso) * (notaBase(e) - r.menor) / (r.maior - r.menor);
}

const fmt2 = new Intl.NumberFormat("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
/** Duas casas decimais, vírgula decimal: 74,33. */
export const n2 = (x: number) => fmt2.format(Math.round(x * 100 + 1e-9) / 100);
/** Pontos de critério: inteiros sem casas (15), frações com duas (23,83). */
export const pts = (x: number) => (Math.abs(x - Math.round(x)) < 1e-9 ? String(Math.round(x)) : n2(x));

export const entregaPorId = (id: string) => ENTREGAS.find((e) => e.id === id) ?? null;
export const alunoPorId = (id: string) => ALUNOS.find((a) => a.id === id) ?? null;
export const integrantes = (entregaId: string) => ALUNOS.filter((a) => a.entrega === entregaId);

/** Composição por extenso, no formato do documento. */
export function composicao(e: Entrega) {
  return `${n2(documental(e))}/${DOCUMENTAL_MAX} na parte documental + ${pts(e.pontos.apresentacao)}/15 na apresentação = ${n2(total(e))}/${TOTAL_MAX}. Nota base: ${n2(notaBase(e))}/10. Após a equiparação linear comum: ${n2(notaEquiparada(e))}/10.`;
}

/** Tudo o que a página do aluno precisa, já calculado. */
export function devolutiva(alunoId: string) {
  const aluno = alunoPorId(alunoId);
  const entrega = aluno ? entregaPorId(aluno.entrega) : null;
  if (!aluno || !entrega) return null;
  const colegas = integrantes(entrega.id).filter((a) => a.id !== aluno.id);
  return { aluno, entrega, colegas, nota: notaEquiparada(entrega), base: notaBase(entrega), documental: documental(entrega), total: total(entrega), regua: regua() };
}
export type Devolutiva = NonNullable<ReturnType<typeof devolutiva>>;

/** Consolidação para o professor: por entrega, por aluno e por critério. */
export function consolidacao() {
  const porEntrega = ENTREGAS.map((e) => ({ entrega: e, alunos: integrantes(e.id), documental: documental(e), total: total(e), base: notaBase(e), nota: notaEquiparada(e) }))
    .sort((a, b) => b.nota - a.nota);
  const porAluno = ALUNOS.map((a) => { const e = entregaPorId(a.entrega)!; return { aluno: a, entrega: e, nota: notaEquiparada(e), base: notaBase(e) }; })
    .sort((a, b) => b.nota - a.nota || a.aluno.nome.localeCompare(b.aluno.nome, "pt-BR"));
  const notas = porAluno.map((x) => x.nota).sort((a, b) => a - b);
  const media = (xs: number[]) => xs.reduce((s, x) => s + x, 0) / xs.length;
  const mediana = (xs: number[]) => { const s = [...xs].sort((a, b) => a - b); const m = s.length / 2; return s.length % 2 ? s[Math.floor(m)] : (s[m - 1] + s[m]) / 2; };
  const porCriterio = CRITERIOS.map((c) => {
    const valores = ENTREGAS.map((e) => ({ entrega: e, valor: e.pontos[c.chave] }));
    return { criterio: c, valores, media: media(valores.map((v) => v.valor)), zeros: valores.filter((v) => v.valor === 0).length, alunosZerados: valores.filter((v) => v.valor === 0).reduce((s, v) => s + integrantes(v.entrega.id).length, 0) };
  });
  return {
    porEntrega, porAluno, porCriterio, regua: regua(),
    alunos: ALUNOS.length, entregas: ENTREGAS.length,
    grupos: ENTREGAS.filter((e) => e.modalidade === "grupo").length,
    individuais: ENTREGAS.filter((e) => e.modalidade === "individual").length,
    mediaAlunos: media(notas), medianaAlunos: mediana(notas), mediaBaseAlunos: media(porAluno.map((x) => x.base)),
    minima: notas[0], maxima: notas[notas.length - 1],
  };
}
