/**
 * Trabalho 1 (trabalho intermediário): painel decisório de crédito construído com inteligência artificial.
 *
 * Fontes: o documento "Trabalho 1 devolutivas individuais" do professor (avaliação de 12/09/2026, oito entregas) e a
 * revisão "Trabalho 1 Avaliação Conferida", de 06/10/2026 às 13h45, que incorpora as complementações recebidas,
 * inclui a entrega de Stêphan e Raphael e detalha a avaliação por questão. Os pontos por critério ficam aqui em
 * sextos de ponto, a precisão integral do documento (23,83 é 143/6); notas, créditos e acréscimos são derivados,
 * nunca digitados, e tests/trabalho-1.test.ts confere cada um contra os valores publicados.
 *
 * Regra da revisão: a nota anterior é piso. Só entra crédito novo sustentado em evidência, convertido pela régua da
 * avaliação anterior com os extremos fixos (a menor nota base anterior vai a 7 e a maior a 10), com teto 10. Os
 * extremos não são recalculados depois das complementações, para não reduzir a nota de ninguém.
 *
 * A reanálise de Michelle Bouhid, no mesmo dia ("Trabalho 1 Reanálise Michelle"), levou processo de 0 a 2/15 e a
 * nota de 7,79 a 7,89; a etapa intermediária fica registrada em `intermediaria`.
 *
 * Ajustes de forma nos textos, sem alterar número ou juízo: "células 63 e 64" e "70 e 71" no lugar de intervalos com traço, espaço em "de R$" e em "7,00 pela", "R$ 17.299.582,19",
 * "400% ao ano", "12270 e 12569", o traço do título AgroGalaxy trocado por dois pontos e o tema da entrega de Stêphan
 * e Raphael escrito a partir das três perguntas ("onde, com que produto e para qual público").
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
  revisao: "06/10/2026",
  fonte: "Documentos Trabalho 1 devolutivas individuais (avaliação de 12/09/2026) e Trabalho 1 Avaliação Conferida (revisão de 06/10/2026, 13h45) e Trabalho 1 Reanálise Michelle (06/10/2026), do professor.",
  /** Ano letivo da turma avaliada: turmas de outros anos nunca recebem esta avaliação. */
  anoLetivo: 2026,
  /** Mínimo de alunos com vínculo único para a avaliação ser atribuída a uma turma do ano letivo. */
  vinculoMinimo: 3,
};

/** Pontos em sextos: p(23, 5) = 23 + 5/6. */
const p = (inteiro: number, sextos = 0) => inteiro + sextos / 6;

export type Paragrafo = { rotulo: string; texto: string };

/** Uma questão do painel, avaliada na revisão de 06/10: C, V e I de 0 a 10. */
export type Questao = { titulo: string; c: number; v: number; i: number; texto: string };

export type Revisao = {
  /** Abertura da seção do aluno na revisão: o que mudou e por quê. */
  abertura: string;
  /** Como as questões foram identificadas (três perguntas, subdecisões ou eixos de leitura). */
  legendaQuestoes: string;
  questoes: Questao[];
  /** Processo e apresentação, avaliados uma única vez para o trabalho. */
  processo: string;
  /** Materiais considerados nesta revisão. */
  materiais: string;
};

export type Entrega = {
  id: string;
  tema: string;
  modalidade: "grupo" | "individual";
  /** Pontos vigentes, após a revisão de 06/10/2026. */
  pontos: Record<CriterioChave, number>;
  /** Pontos da avaliação anterior, só nos critérios que a revisão alterou. */
  antes?: Partial<Record<CriterioChave, number>>;
  /** Etapa intermediária, quando houve mais de uma revisão: pontos de antes da última, só nos critérios que ela alterou. */
  intermediaria?: { rotulo: string; antes: Partial<Record<CriterioChave, number>> };
  revisao: Revisao;
  /** Textos da avaliação de 12/09/2026, mantidos como registro. A entrega incluída na revisão não os tem. */
  sintese?: string;
  paragrafos?: Paragrafo[];
  aprimorar?: string[];
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
    revisao: {
      abertura: "A nota permanece 10,00. A análise por questão detalha os pontos de atenção, sem alterar a nota anterior.",
      legendaQuestoes: "Três perguntas identificadas no trabalho.",
      questoes: [
      { titulo: "Crescimento das instituições", c: 9.5, v: 7.5, i: 8.5, texto: "A pergunta organiza a triagem e separa crescimento real, tendência e modalidades. A base completa ainda é necessária para reproduzir os percentis e conferir a cobertura temporal." },
      { titulo: "Concentração da carteira", c: 9.5, v: 7.5, i: 9, texto: "Modalidade, região, porte e funding ajudam a qualificar a agenda. Concentração em grandes tomadores não identifica concentração por devedor; os limites estão reconhecidos." },
      { titulo: "Deterioração e prioridade de supervisão", c: 9, v: 7, i: 8, texto: "Ajuste do denominador e folga de capital sustentam prioridade de exame. Estoque ajustado não comprova safra, perda futura ou irregularidade." },
      ],
      processo: "O caderno registra erros e correções relevantes; permanecem a íntegra do primeiro prompt e o diagnóstico do painel de referência a conferir.",
      materiais: "Sem nova complementação localizada nesta revisão. Usei os documentos e a leitura do painel registrados na avaliação anterior.",
    },
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
    revisao: {
      abertura: "A nota permanece 9,70. O detalhamento por questão não gera acréscimo sem nova evidência.",
      legendaQuestoes: "Três perguntas identificadas no trabalho.",
      questoes: [
      { titulo: "Consignado privado e revisão de apetite", c: 9, v: 8.5, i: 8.5, texto: "Os CSV SGS sustentam a comparação com o histórico e os outros consignados. O afastamento do privado justifica revisar o apetite, sem equiparar inadimplência a prejuízo." },
      { titulo: "Produtos sem garantia e originação", c: 9, v: 7.5, i: 8, texto: "A comparação entre rotativo, sem garantia e cheque especial é pertinente. A afirmação contextual de 400% ao ano precisa de série de juros própria." },
      { titulo: "Momento macro e risco de crédito", c: 8.5, v: 7.5, i: 7.5, texto: "Selic, desemprego e renda ajudam a contextualizar o ciclo. Corrigir 5,3% versus 5,4% na PNAD e evitar inferir causalidade ou sobre-endividamento apenas da correlação." },
      ],
      processo: "Há correções documentadas, mas o histórico resume os prompts. A extração IF.data e a memória da ponderação de 15,5%/10,1% continuam pendentes.",
      materiais: "Sem novo arquivo localizado. Mantidos os CSV, códigos, painel e caderno já avaliados.",
    },
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
    revisao: {
      abertura: "A nota permanece 9,58. Não transferi o crédito dos anexos de outro grupo.",
      legendaQuestoes: "Três perguntas identificadas no trabalho.",
      questoes: [
      { titulo: "Entrar no consignado privado", c: 9, v: 7.5, i: 8, texto: "A comparação de segmentos sustenta a decisão de entrada. Fontes REF/SCR estão identificadas, mas os originais adicionais não foram recebidos." },
      { titulo: "Escolher o segmento", c: 9, v: 7, i: 7.5, texto: "O recorte ajuda a comparar modalidades. A inadimplência de estoque ajustada pelo saldo de um ano antes precisa permanecer identificada como proxy, não PD anual de safra." },
      { titulo: "Definir preço e condição de entrada", c: 8.5, v: 7, i: 7, texto: "LGD 1 é uma hipótese conservadora. Com LGD 0,5, k passa de aproximadamente 1,68 para 3,36; a decisão é sensível e precisa de cenários coerentes." },
      ],
      processo: "O registro de correções recebeu crédito; permanecem prompts integrais, originais adicionais e diagnóstico do painel de referência.",
      materiais: "Sem complementação do ASA localizada. O ZIP que também estava sob sua pasta é idêntico ao pacote de Renata/Larissa/Gabriel; não foi atribuído a este grupo.",
    },
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
    pontos: { concepcao: p(24, 1), verificacao: p(21, 4), interpretacao: p(18, 2), processo: 13, apresentacao: 15 },
    antes: { verificacao: 0, processo: p(0, 2) },
    revisao: {
      abertura: "A complementação resolve o elo privado que impedia conferir o valor presente e permite crédito substancial em verificação e processo. A nota passa de 8,45 para 10,00, limitada pelo teto da escala.",
      legendaQuestoes: "Três perguntas identificadas no trabalho.",
      questoes: [
      { titulo: "Elegibilidade dos contratos", c: 9.5, v: 9, i: 9, texto: "A base primária, o dicionário e o histórico permitem distinguir atraso corrente e comportamento de pagamento. Os 23 contratos e as 4.573 parcelas Price foram confirmados." },
      { titulo: "Preço da carteira", c: 9, v: 8.5, i: 9, texto: "Recalculei o valor presente de R$ 17.299.582,19 a partir dos recebíveis e das taxas por contrato, sem executar código dos alunos. Não houve taxa faltante na carteira-alvo." },
      { titulo: "Tamanho e subordinação", c: 9.5, v: 8.5, i: 9.25, texto: "Conferi CR 2 de 18,2454%, CR 5 de 42,6275% e VP de R$ 15.069.312,77 após excluir 12270 e 12569. A base corrigida melhora a coerência entre elegibilidade e exposição." },
      ],
      processo: "O registro relata 15 episódios, aceites/rejeições e prompts. A fase inicial vem de resumo da sessão, não de transcrição integral; por isso, processo recebe 13/15, com ressalva.",
      materiais: "Complementação enviada por Gabriel Winck em 05/10/2026 às 21:55: recebíveis, AFs, memória, notas, dados e registro de construção IA. Arquivos organizados na pasta correta do grupo.",
    },
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
    revisao: {
      abertura: "A nota permanece 8,47. Sem novos dados comprovados, não há incremento.",
      legendaQuestoes: "Subdecisões analíticas da pergunta principal, não três perguntas independentes apresentadas no painel.",
      questoes: [
      { titulo: "Capacidade de absorver perdas", c: 7.5, v: 0, i: 8.5, texto: "A relação entre perda esperada e subordinação é didática, mas PD/LGD e cedente são simulados. O núcleo e a auditoria referidos não foram recebidos." },
      { titulo: "Funding e capacidade de comprar", c: 7, v: 0, i: 8.5, texto: "A discussão de caixa e emissão é útil. A trava de dados e a cobertura limitada dos seis indicadores/quatro visuais continuam restringindo a avaliação." },
      { titulo: "Covenants e cura da operação", c: 7.5, v: 0, i: 8.5, texto: "Distinguir reforço econômico de cura contratual é um mérito. São subdecisões da pergunta principal; não equivalem a três perguntas completas no formato exigido." },
      ],
      processo: "Os erros descritos no roteiro receberam crédito. Permanecem histórico integral de prompts, núcleo de cálculo e base empírica; o teto de checkpoint segue indefinido.",
      materiais: "Sem nova complementação localizada. Mantidos painel, slides, gerador e roteiro já avaliados.",
    },
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
    pontos: { concepcao: p(17, 4), verificacao: 0, interpretacao: p(16, 4), processo: 2, apresentacao: 10 },
    antes: { concepcao: p(16, 1), interpretacao: p(15, 4), processo: 0 },
    intermediaria: { rotulo: "revisão de 06/10/2026, 13h45", antes: { processo: 0 } },
    revisao: {
      abertura: "Você entregou fontes, fórmulas, código e resultados no V3. O zero global em verificação decorre da origem incompleta da complementação BCL de Luxemburgo. Reconheci processo parcial em 2/15 pelas decisões e checagens registradas; a nota sobe de 7,79 para 7,89.",
      legendaQuestoes: "Três perguntas identificadas no trabalho.",
      questoes: [
      { titulo: "Resiliência da garantia imobiliária", c: 7, v: 7, i: 8.5, texto: "O novo notebook explicita séries Eurostat, fórmulas e tabelas para valorização, volatilidade e drawdown. Isso melhora a documentação; preços nominais não medem LGD de execução." },
      { titulo: "Financiamento e novas concessões", c: 7, v: 0, i: 8, texto: "A complementação BCL de Luxemburgo continua descrita sem chave, original e regra de substituição por observação. A fórmula sobre o CSV preparado não resolve sua origem." },
      { titulo: "Estoque e expansão das hipotecas", c: 7.2, v: 5.5, i: 8.5, texto: "Há código e resultados para crescimento e participação. O acesso ECB indicado é amplo e os CSV originais/data de extração não acompanharam o HTML; a verificação permanece parcial." },
      ],
      processo: "Reconheci 2/15 pelas decisões e checagens: as células 63 e 64 mostram a conversão de datas; as células 70 e 71, a conversão de tipos numéricos. O texto registra a agregação trimestral antes da normalização. Faltam prompts, aceites/rejeições e três erros da IA documentados. Essas conversões não comprovam erros da ferramenta. Detalhamento: prompts 0/5, erros IA 0/6, decisões e desvios 2/4. A verificação permanece 0/25 por regra de corte.",
      materiais: "Mensagem \"Trabalho1 Rastreabilidade\" de 06/10 às 05h46, de michelle.bouhid@gmail.com, com TRABALHO_CREDITO_MichelleBouhid_V3.html. Também conferi a entrega de 19/9 e o registro da mensagem Trabalho 2 de 06/10 às 11h09. O Trabalho 2 não foi utilizado para aumentar a nota do Trabalho 1.",
    },
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
    revisao: {
      abertura: "A nota permanece 7,00. O detalhamento dos eixos não cria perguntas que o aluno tenha apresentado nem reduz a nota já dada.",
      legendaQuestoes: "Eixos de leitura do diagnóstico, usados para orientar a devolutiva. A entrega não explicita três perguntas no formato solicitado.",
      questoes: [
      { titulo: "Capacidade de pagamento e liquidez", c: 5, v: 0, i: 6.5, texto: "O diagnóstico articula dívida, liquidez e capacidade de honrar vencimentos. Não apresenta uma pergunta decisória de painel com indicadores e visualizações próprios." },
      { titulo: "Estrutura de capital e riscos", c: 4.5, v: 0, i: 6, texto: "O texto integra risco ambiental e governança. A alavancagem 6,74 x não vem acompanhada de numerador, denominador e original que permitam refazer a conta." },
      { titulo: "Rating e orientação ao credor", c: 4.5, v: 0, i: 5.5, texto: "As recomendações são pertinentes, com limites metodológicos. O escore 4,3 precisa ficar separado de rating de agência e PD calibrada." },
      ],
      processo: "Não foi recebido caderno de IA. A apresentação permanece 5/15, conforme a pontuação já definida.",
      materiais: "Sem novo arquivo de Carlos Eduardo localizado. Mantidos DOCX e slides da entrega anterior.",
    },
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
    revisao: {
      abertura: "A nota permanece 7,54, condicional à equivalência do Trabalho Final ao Trabalho 1.",
      legendaQuestoes: "Três perguntas identificadas no trabalho.",
      questoes: [
      { titulo: "Sinais de deterioração antes do default", c: 6, v: 0, i: 6, texto: "Os indicadores corporativos ajudam a leitura retrospectiva. Conciliar sete trimestres de EBITDA negativo com a síntese que menciona cinco." },
      { titulo: "Deterioração das garantias", c: 6, v: 0, i: 5.5, texto: "A relação entre colateral e recuperação é relevante, mas faltam os originais e a cadeia de cálculo para validar valores e conclusões." },
      { titulo: "Auditoria e governança", c: 6, v: 0, i: 5.5, texto: "Distinguir pesquisa de ações, rating de crédito e decisão própria. A PD estrutural estimada não é PD física calibrada e não veio com reprodução suficiente." },
      ],
      processo: "Não foram recebidos prompts e episódios de erro documentados. Mantida apresentação 15/15 e a ressalva de equivalência.",
      materiais: "Sem nova complementação localizada. Mantida a leitura do painel AgroGalaxy registrada anteriormente.",
    },
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
  {
    id: "fintech-produto-publico",
    tema: "Fintech de crédito: onde, com que produto e para qual público",
    modalidade: "grupo",
    pontos: { concepcao: p(20, 5), verificacao: p(13, 2), interpretacao: p(15, 4), processo: 12, apresentacao: 15 },
    antes: { processo: 0 },
    revisao: {
      abertura: "O caderno de interações recebido preenche parte importante da lacuna de processo. Atribuí 12/15 nesse critério, antes zerado; com a régua preservada, a nota passa de 8,80 para 9,39. Mantive as notas por questão: o novo registro documenta a construção, mas não traz as bases originais nem os logs pendentes para nova validação dos indicadores.",
      legendaQuestoes: "Três perguntas identificadas no trabalho.",
      questoes: [
      { titulo: "Onde expandir", c: 8.5, v: 5.5, i: 8, texto: "UFs, carteira, inadimplência, ticket e participação ajudam a selecionar praças. O filtro inicial mantém todas as modalidades; a pergunta sobre não consignado exige fixar esse recorte." },
      { titulo: "Com que produto", c: 8, v: 5, i: 7.5, texto: "Taxas e CDI complementam o risco de estoque. Os limites reconhecem universos diferentes e mediana não ponderada; spread aparente não demonstra margem líquida." },
      { titulo: "Para qual público", c: 8.5, v: 5.5, i: 8, texto: "Faixas de renda e cruzamento com produto apoiam política de limites. Estoque agregado não prevê inadimplência de novos tomadores; faltam bases originais e extração documentada." },
      ],
      processo: "Atribuí 12/15 ao caderno: prompts e sequência 4/5, erros 5/6, aceites, rejeições e desvios 3/4. Os sete erros incluem filtros, participação das fintechs e mistura de modalidades. Descontei 3 pontos pelas sessões externas ausentes, prompt abreviado e falta de logs ou versões que confirmem todos os antes/depois. O registro foi redigido pela IA e requer conferência do grupo; seus testes narrados não foram reproduzidos nesta revisão. Apresentação mantida em 15/15.",
      materiais: "Painel HTML e _Registro_Interacoes_IA_Painel_Credito.docx, já conferidos. O PDF validador e as medidas DAX citados no e-mail de 6/10 ainda não estão disponíveis para exame; mantive a nota, sem acréscimo por esses nomes.",
    },
  },
];

export type Aluno = {
  /** Identificador estável, usado na URL da prévia do professor. */
  id: string;
  /** Nome como está na devolutiva; o vínculo com a matrícula usa estes termos. */
  nome: string;
  entrega: string;
  /** Nome completo da lista da turma (sistema da escola), usado só no vínculo com a matrícula. */
  nomeCompleto?: string;
  /** E-mail da matrícula, quando o vínculo pelo nome não bastar. Tem precedência sobre o nome. */
  email?: string;
};

export const ALUNOS: Aluno[] = [
  { id: "tomaz-leal", nome: "Tomaz Leal", entrega: "supervisao-bcb" },
  { id: "roberto-gomides", nome: "Roberto Gomides", entrega: "supervisao-bcb" },
  { id: "diana-cabral", nome: "Diana Cabral", email: "didicstri@gmail.com", entrega: "supervisao-bcb" },
  { id: "jader-brenny-santana", nome: "Jader Brenny Santana", entrega: "consignado-jader" },
  { id: "andre-souza", nome: "André Souza", nomeCompleto: "André Nunes e Souza", entrega: "banco-asa" },
  { id: "andre-meirelles", nome: "André Meirelles", entrega: "banco-asa" },
  { id: "sebastiao", nome: "Sebastião", nomeCompleto: "Sebastiao da Silva Campos Júnior", entrega: "banco-asa" },
  { id: "renata-valsa", nome: "Renata Valsa", nomeCompleto: "Renata Carneiro Valsa", entrega: "fidc-imobiliario" },
  { id: "larissa-bastos", nome: "Larissa Bastos", nomeCompleto: "Larissa Fialho Bastos", entrega: "fidc-imobiliario" },
  { id: "gabriel-winck", nome: "Gabriel Winck", nomeCompleto: "Gabriel Lopes Winck", entrega: "fidc-imobiliario" },
  { id: "guilherme-castro", nome: "Guilherme Castro", nomeCompleto: "Guilherme Almeida de Castro", entrega: "fidc-cedente" },
  { id: "michelle-bouhid", nome: "Michelle Bouhid", entrega: "hipotecario-europeu" },
  { id: "carlos-eduardo-n-campos", nome: "Carlos Eduardo N Campos", nomeCompleto: "Carlos Eduardo Nascimento Campos", entrega: "braskem" },
  { id: "gabriel-andrade", nome: "Gabriel Andrade", nomeCompleto: "Gabriel Oliveira de Andrade", email: "gabrielbove13@gmail.com", entrega: "agrogalaxy" },
  { id: "joao-pedro", nome: "João Pedro", entrega: "agrogalaxy" },
  { id: "matheus-luchi", nome: "Matheus Luchi", entrega: "agrogalaxy" },
  { id: "stephan-lana-severiano", nome: "Stêphan Lana Severiano", entrega: "fintech-produto-publico" },
  { id: "raphael-dos-santos-andrade-silva", nome: "Raphael dos Santos Andrade Silva", entrega: "fintech-produto-publico" },
];

/**
 * Critério da revisão de 06/10/2026, como descrito no documento, para a página do aluno e a do professor.
 * As conferências independentes ficam na consolidação do professor.
 */
export const REVISAO = {
  data: "06/10/2026",
  criterio: [
    "Os pesos foram mantidos: concepção 25, verificação 25, interpretação 20, processo 15 e apresentação 15. Em cada questão, concepção (C), verificação (V) e interpretação (I) recebem nota de 0 a 10, e a nota da questão é (25C + 25V + 20I) ÷ 70. Processo e apresentação são avaliados uma única vez. As notas por questão são desta revisão; não foram registradas na avaliação anterior.",
    "Para material novo, os critérios foram comparados com a pontuação anterior e só foram aceitas diferenças positivas sustentadas em evidência. Arquivo reenviado, link novo ou maior volume de texto, sem melhoria verificável, não geram acréscimo, e uma mesma correção não recebe dois créditos.",
    "A régua anterior ficou fixa: nota atual = menor entre 10 e (nota anterior + 3 × crédito documental ÷ 61). O fator 3/61 vem da transformação anterior de um intervalo de 61 pontos brutos em 3 pontos de nota. Recalcular os extremos depois das complementações poderia reduzir notas de outros alunos; isso não foi feito.",
    "Quando persiste um número essencial sem origem, o corte global de verificação continua valendo. A nota V de uma questão pode reconhecer documentação parcial sem revogar o corte do trabalho inteiro. As apresentações permanecem como avaliadas; nenhum desempenho oral novo foi presumido.",
  ],
  conferencias: [
    { titulo: "Materiais e alcance", texto: "A caixa de e-mail institucional foi conferida em 06/10/2026 às 13h45. Os hashes dos 53 arquivos organizados anteriormente não mudaram. O registro de IA de Stêphan e Raphael foi avaliado; o PDF validador e as medidas DAX citados no e-mail de 06/10 aparecem só como nomes, sem anexos disponíveis, e não receberam pontos. A mensagem Trabalho 2 de Michelle foi registrada separadamente e não alterou o Trabalho 1. Depois dessa conferência, Michelle foi reanalisada: processo passou a 2/15 e a nota a 7,89. As demais notas e as notas por questão foram preservadas." },
    { titulo: "Conferência independente do grupo de Renata", texto: "Sem executar scripts dos alunos, os recebíveis foram recalculados em Tabela Price com as taxas das AFs por contrato: 23 contratos, 4.573 parcelas, nenhuma taxa faltante, valor nominal R$ 30.411.868,22 e valor presente R$ 17.299.582,19. Também foram conferidos CR 2 de 18,2454%, CR 5 de 42,6275% e VP de R$ 15.069.312,77 após retirar 12270 e 12569. A declaração de 700 testes sem divergência é do grupo e não foi tratada como certificação integral; premissas de recuperação, estrutura de cotas e remuneração continuam premissas, agora rastreáveis." },
    { titulo: "Michelle e a entrega de Stêphan e Raphael", texto: "Michelle entregou fontes, fórmulas, código e resultados no V3; o zero em verificação decorre da lacuna de origem da complementação BCL, não de ausência de material. Na reanálise, processo recebeu 2/15 pelas decisões e checagens de tipos documentadas, sem classificá-las como três erros comprovados da IA. Na entrega de Stêphan e Raphael foram lidos dados, metadados e funções de cálculo do HTML, sem executar a aplicação: três perguntas, 12 gráficos principais, fontes SCR, taxas e CDI, fórmulas e limites. O registro de interações de IA rendeu 12/15 em processo; o PDF validador e as medidas DAX citados no encaminhamento continuam pendentes." },
  ],
};

/** Pendências registradas nos documentos, para o professor resolver antes de dar a avaliação por definitiva. */
export const PENDENCIAS: { titulo: string; texto: string; entrega?: string }[] = [
  { titulo: "Arquivos citados por Stêphan", entrega: "fintech-produto-publico", texto: "O PDF validador e as medidas DAX citados no e-mail de 06/10 não estavam disponíveis para exame e não receberam pontos. O registro de IA foi redigido pela IA e requer conferência do grupo; seus testes narrados não foram reproduzidos." },
  { titulo: "Origem da complementação BCL", entrega: "hipotecario-europeu", texto: "A complementação BCL de Luxemburgo continua sem chave, original e regra de substituição por observação; o corte global de verificação de Michelle Bouhid permanece. O zero decorre dessa lacuna de origem, não de ausência de material: fontes, fórmulas, código e resultados foram entregues no V3." },
  { titulo: "Equivalência da entrega AgroGalaxy", entrega: "agrogalaxy", texto: "A entrega foi identificada como Trabalho Final; a avaliação dos três integrantes permanece condicional à equivalência ao Trabalho 1." },
  { titulo: "Identificação do grupo ASA", entrega: "banco-asa", texto: "A identificação do grupo deve ser reconciliada com o caderno de processo." },
  { titulo: "Versão entregue dos painéis publicados", entrega: "supervisao-bcb", texto: "A versão publicada observada do painel de supervisão traz build de 18/09/2026, posterior à entrega; confirmar a correspondência com a versão entregue. O mesmo vale para os demais painéis publicados." },
  { titulo: "Registros do checkpoint de 29/08", texto: "Os registros permanecem a conferir. Nenhum teto de checkpoint foi aplicado, porque seu valor não estava definido; o roteiro de Guilherme Castro declara ausência." },
  { titulo: "Autorizações de escopo", texto: "Recorte europeu (Michelle Bouhid), diagnóstico corporativo sem a arquitetura de painel (Carlos Eduardo N Campos) e parâmetros simulados (Guilherme Castro) dependem de autorização específica para serem tratados como equivalentes." },
];

/* ------------------------------------------------------------------ */
/* Cálculo                                                              */
/* ------------------------------------------------------------------ */

/** Pontos da avaliação anterior: os vigentes, com o valor de antes nos critérios que a revisão alterou. */
export const pontosAnteriores = (e: Entrega): Record<CriterioChave, number> => ({ ...e.pontos, ...e.antes });
const somaDoc = (x: Record<CriterioChave, number>) => x.concepcao + x.verificacao + x.interpretacao + x.processo;

export const documental = (e: Entrega) => somaDoc(e.pontos);
export const total = (e: Entrega) => documental(e) + e.pontos.apresentacao;
export const notaBase = (e: Entrega) => total(e) / 10;
export const totalAnterior = (e: Entrega) => { const a = pontosAnteriores(e); return somaDoc(a) + a.apresentacao; };
/** Crédito documental comprovado na revisão, em pontos brutos (nunca negativo: a revisão não reduz critério). */
export const credito = (e: Entrega) => total(e) - totalAnterior(e);

/**
 * Régua da avaliação anterior, fixa: a menor nota base anterior vai a 7 e a maior a 10. Os extremos vêm dos pontos
 * anteriores e não mudam com as complementações.
 */
export function regua() {
  const bases = ENTREGAS.map((e) => totalAnterior(e) / 10);
  return { menor: Math.min(...bases), maior: Math.max(...bases), piso: 7, teto: 10 };
}
const naRegua = (base: number) => { const r = regua(); return Math.min(r.teto, r.piso + (r.teto - r.piso) * (base - r.menor) / (r.maior - r.menor)); };

/** Nota da avaliação anterior (12/09/2026). */
export const notaAnterior = (e: Entrega) => naRegua(totalAnterior(e) / 10);
/** Nota antes da última revisão, quando houve mais de uma; senão, nulo. */
export function notaIntermediaria(e: Entrega) {
  if (!e.intermediaria) return null;
  const x = { ...e.pontos, ...e.intermediaria.antes };
  return naRegua((somaDoc(x) + x.apresentacao) / 10);
}
/** Nota vigente: a anterior mais 3 × crédito ÷ 61 pela régua fixa, com teto 10. */
export const notaEquiparada = (e: Entrega) => naRegua(notaBase(e));
export const acrescimo = (e: Entrega) => notaEquiparada(e) - notaAnterior(e);
/** Nota de uma questão: (25C + 25V + 20I) ÷ 70. */
export const notaQuestao = (q: Questao) => (25 * q.c + 25 * q.v + 20 * q.i) / 70;

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
  return `${n2(documental(e))}/${DOCUMENTAL_MAX} na parte documental + ${pts(e.pontos.apresentacao)}/15 na apresentação = ${n2(total(e))}/${TOTAL_MAX}. Nota base: ${n2(notaBase(e))}/10. Pela régua fixa da avaliação anterior: ${n2(notaEquiparada(e))}/10.`;
}

/** Tudo o que a página do aluno precisa, já calculado. */
export function devolutiva(alunoId: string) {
  const aluno = alunoPorId(alunoId);
  const entrega = aluno ? entregaPorId(aluno.entrega) : null;
  if (!aluno || !entrega) return null;
  const colegas = integrantes(entrega.id).filter((a) => a.id !== aluno.id);
  return { aluno, entrega, colegas, nota: notaEquiparada(entrega), anterior: notaAnterior(entrega), intermediaria: notaIntermediaria(entrega), acrescimo: acrescimo(entrega), credito: credito(entrega), anteriores: pontosAnteriores(entrega), base: notaBase(entrega), documental: documental(entrega), total: total(entrega), regua: regua() };
}
export type Devolutiva = NonNullable<ReturnType<typeof devolutiva>>;

/** Consolidação para o professor: por entrega, por aluno e por critério. */
export function consolidacao() {
  const porEntrega = ENTREGAS.map((e) => ({ entrega: e, alunos: integrantes(e.id), documental: documental(e), total: total(e), base: notaBase(e), nota: notaEquiparada(e), anterior: notaAnterior(e), acrescimo: acrescimo(e), credito: credito(e) }))
    .sort((a, b) => b.nota - a.nota);
  const porAluno = ALUNOS.map((a) => { const e = entregaPorId(a.entrega)!; return { aluno: a, entrega: e, nota: notaEquiparada(e), anterior: notaAnterior(e), acrescimo: acrescimo(e), base: notaBase(e) }; })
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
    mediaAnteriorAlunos: media(porAluno.map((x) => x.anterior)),
    entregasComAcrescimo: porEntrega.filter((x) => x.acrescimo > 1e-9).length,
    alunosComAcrescimo: porAluno.filter((x) => x.acrescimo > 1e-9).length,
    minima: notas[0], maxima: notas[notas.length - 1],
  };
}
