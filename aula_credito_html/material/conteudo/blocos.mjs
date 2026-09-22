/* Textos de abertura, blocos e fechamento dos materiais da Aula 2 (edições do professor e do aluno).
   Todo número citado aqui vem de app/dados/10-dados.js, de app/dados/11-resultados.js (experimento
   sintético, semente 20260920) ou da definição da aula em content/original (180 minutos com 15 de
   intervalo). Nenhum descreve carteira real. Sem hífen nem travessão no texto exibido. */

export const capa = {
  curso: "Laboratório de Decisão de Crédito",
  aula: "Aula 2",
  titulo: "Entender as três técnicas",
  subtitulo: "Regressão logística, árvore de decisão e gradient boosting aplicados à probabilidade de inadimplência, da previsão à decisão de crédito",
  entrega: "Comparação fundamentada dos modelos e exercícios de interpretação",
  duracao: "Encontro de 180 minutos, com 15 minutos de intervalo",
};

export const blocos = [
  {
    chave: "problema", nome: "O problema de crédito", de: "01", ate: "06",
    pergunta: "O que exatamente queremos prever, com que informação e para decidir o quê?",
    aprender: [
      "Formular o alvo: evento, horizonte, população e unidade de análise.",
      "Separar a informação que existia na decisão da informação que só aparece depois.",
      "Dividir a base por calendário respeitando os 12 meses de maturação do alvo.",
      "Reconhecer que as três técnicas partem dos mesmos dados e do mesmo objetivo.",
    ],
    ideias: [
      "Sem a mesma definição de inadimplência, duas PDs não são comparáveis.",
      "Vale a data em que a informação ficou disponível, não a data do fenômeno.",
      "O teste é avaliado uma única vez, com regras congeladas antes.",
    ],
    tempo: 20,
  },
  {
    chave: "logit", nome: "Regressão logística", de: "07", ate: "20",
    pergunta: "Como uma soma de efeitos vira uma probabilidade entre 0% e 100%, e como se lê cada coeficiente?",
    aprender: [
      "Montar o escore z a partir do intercepto e das diferenças de cada característica para o perfil de referência.",
      "Converter o escore em probabilidade pela curva logística e transitar entre probabilidade, odds e log odds.",
      "Ler um coeficiente como multiplicador de odds, cuja tradução em PD depende do ponto de partida.",
      "Entender o que o ajuste minimiza, como categorias e não linearidades entram e por que se penaliza coeficientes.",
    ],
    ideias: [
      "O cálculo tem duas etapas auditáveis: somar o escore e aplicar a logística.",
      "Uma mudança na variável multiplica as odds. A mudança de PD depende do ponto de partida.",
      "A linearidade é nos parâmetros. A forma das variáveis pode ser flexível.",
    ],
    tempo: 45,
  },
  {
    chave: "arvore", nome: "Árvore de decisão", de: "21", ate: "30",
    pergunta: "Como perguntas sucessivas separam grupos de risco, e o que sustenta a taxa de cada folha?",
    aprender: [
      "Percorrer uma árvore: raiz, nós, ramos e folhas, com a PD igual à frequência observada no grupo.",
      "Escolher uma divisão pelo ganho de impureza de Gini, ponderado pelo tamanho de cada lado.",
      "Ler a incerteza de uma folha pelo intervalo de Wilson e o efeito do tamanho mínimo por folha.",
      "Controlar a complexidade por profundidade, mínimo por folha e poda, e testar a estabilidade entre reamostragens.",
    ],
    ideias: [
      "A previsão é a frequência observada no grupo, sujeita à incerteza e à generalização.",
      "Não basta uma folha pura: importa como toda a amostra fica depois da divisão.",
      "Uma regra fácil de ler pode ser sensível à amostra que a produziu.",
    ],
    tempo: 33,
  },
  {
    chave: "boosting", nome: "Gradient boosting", de: "31", ate: "42",
    pergunta: "Como correções sucessivas, somadas no escore, constroem uma previsão melhor que a de uma árvore só?",
    aprender: [
      "Ver o que sobra nos resíduos de uma árvore rasa e por que vale acrescentar correções.",
      "Seguir o ciclo em quatro passos: prever, calcular o gradiente, ajustar uma árvore aos resíduos e atualizar o escore.",
      "Refazer a miniatura de 10 registros: escore inicial, duas árvores e conversão única em PD.",
      "Escolher taxa de aprendizagem, número de árvores e profundidade pela validação, com parada definida antes.",
    ],
    ideias: [
      "Cada árvore responde ao que ainda precisa melhorar na previsão atual.",
      "A soma acontece no escore F. A logística é aplicada uma única vez, no fim.",
      "Capturar padrões complexos é uma capacidade. Demonstrar que eles persistem é uma obrigação.",
    ],
    tempo: 39,
  },
  {
    chave: "decisao", nome: "Avaliação e decisão", de: "43", ate: "50",
    pergunta: "Como comparar os três modelos com justiça e transformar probabilidades em política de crédito?",
    aprender: [
      "Fixar o protocolo antes de qualquer métrica: mesmo alvo, mesma informação, teste congelado.",
      "Separar discriminação (AUC e KS) de calibração (previsto contra observado, faixa a faixa).",
      "Ligar o corte de aprovação à economia da operação e ao que se observa na carteira depois.",
      "Defender uma recomendação que combine desempenho, economia, estabilidade e capacidade de execução.",
    ],
    ideias: [
      "Um modelo pode ordenar bem mesmo com probabilidades na escala errada.",
      "A política é uma decisão adicional ao modelo.",
      "Parte da qualidade do modelo só será conhecida depois da maturação do alvo.",
    ],
    tempo: 28,
  },
];

/* Como o material se relaciona com a aula em slides. */
export const comoUsar = {
  aluno: [
    "Este guia acompanha os 50 slides interativos da Aula 2, na mesma ordem. Cada página mostra o slide como ele aparece na tela, explica como ler o que está nele e diz o que vale a pena mexer.",
    "Abra a aula pela plataforma, em Aulas ou em Materiais, e leia o guia ao lado. O que você mexe nos slides (controles, exercícios, escolhas) fica só no seu navegador: sobrevive a recarregar a página, some ao fechar a aba e não aparece em outro aparelho. \"Reiniciar exemplo\" devolve um slide ao início; \"Limpar minhas explorações\", no índice, apaga tudo.",
    "Durante a aula ao vivo você segue o professor por padrão. \"Navegar por conta própria\" libera as setas e o índice (tecla I, com filtro por número, título ou bloco); \"Voltar ao slide do professor\" não apaga o que você explorou.",
    "Os exercícios dos slides 01, 04, 20, 30, 42, 49 e 50 estão reproduzidos aqui sem gabarito. Resolva no papel antes de conferir na tela: o slide corrige na hora e explica cada alternativa.",
    "Todos os dados são sintéticos. Nenhum número descreve carteira real. As fórmulas aparecem na notação dos slides, para você reconhecer na hora o que está vendo.",
  ],
  professor: [
    "Este guia reúne, na ordem dos 50 slides, o que o painel da aula mostra no bloco \"Roteiro do slide no ar\": condução, respostas esperadas, cuidados e limites, aprofundamentos e a transição para o slide seguinte. Serve para preparar a aula e para conduzir sem depender da tela.",
    "Na plataforma, inicie a aula pelo cartão da turma e, no painel, use \"Conduzir pelos slides\" e \"Projetar os slides\". A janela projetada não mostra notas, impressão nem modo estudo: a turma vê só o slide. As notas ficam no painel e neste guia.",
    "Sem a plataforma, abra o arquivo completo da aula: a tecla P ou o botão Professor mostram as notas ao lado do slide. O aluno recebe uma versão compilada sem as notas, tanto na tela ao vivo quanto em Materiais.",
    "Cada slide vem capturado no estado revelado (solução aberta, etapas completas), que é o estado que a impressão do baralho também usa. Os exercícios trazem o gabarito em \"Respostas esperadas\". O guia do aluno reproduz os mesmos exercícios sem gabarito.",
    "O ritmo por bloco na tabela abaixo é uma proposta para os 165 minutos úteis do encontro, calculada a partir da duração definida no desenho do curso (180 minutos com 15 de intervalo). Não foi validada em sala: ajuste à turma.",
    "A repartição acompanha o peso do conteúdo: somando os minutos das páginas essenciais dos capítulos correspondentes, o capítulo 4 pede 49 minutos, o 5 pede 49 e o 6 pede 67. Por isso o bloco de boosting recebe mais que o de árvore, e não o mesmo. O bloco de decisão recebe 28 porque o exercício do slide 49 consome nove minutos sozinho. A pausa cai ao fim do bloco de árvore, aos 98 dos 165 minutos.",
  ],
};

export const fontesDosNumeros = [
  ["Logit manual de seis características", "slides 07 a 20, com conta aberta e conferível a mão; coeficientes escolhidos para ensinar, não estimados em dados"],
  ["Árvore didática de 1.000 contratos", "slides 21 a 30; contagens e taxas das folhas conferem com a raiz"],
  ["Miniatura de 10 registros", "slides 31 a 36 e 42; taxa de aprendizagem igual a 1 para facilitar a leitura"],
  ["Experimento sintético de 28.000 contratos", "slides 05, 18, 27 a 29, 37 a 41 e 43 a 49; semente 20260920, versões e conferências no notebook"],
  ["Economia declarada na tela", "slide 47: margem de R$ 1.200, EAD de R$ 10.000 e LGD de 60%"],
];

export const glossario = [
  ["PD", "Probabilidade de inadimplência: chance estimada de o evento definido ocorrer no horizonte definido. Deve ser lida como frequência esperada em exposições semelhantes, não como destino de um cliente."],
  ["Evento e horizonte", "Nesta aula, atraso superior a 90 dias em qualquer momento dos 12 meses seguintes à contratação. Atingir exatamente 90 dias não conta."],
  ["Escore z", "Soma do intercepto com as contribuições de cada característica, na escala do log odds. Pode ser qualquer número real."],
  ["Odds", "Razão entre a probabilidade do evento e a do não evento: p dividido por (1 menos p). PD de 10% corresponde a odds de 1 para 9, ou 0,1111."],
  ["Log odds", "Logaritmo natural das odds. É a escala em que o logit soma as contribuições."],
  ["Curva logística (sigmoide)", "Função que converte qualquer escore em probabilidade entre 0% e 100%: p igual a 1 dividido por (1 mais e elevado a menos z)."],
  ["Razão de chances", "Multiplicador das odds quando uma característica muda: e elevado ao coeficiente vezes a variação. Não é a variação da PD."],
  ["Log loss (perda logarítmica)", "Perda de uma observação: menos o logaritmo da probabilidade atribuída ao que de fato ocorreu. O ajuste minimiza a média das perdas."],
  ["Regularização", "Penalidade sobre o tamanho dos coeficientes, controlada por C. Força maior (C menor) encolhe coeficientes e reduz a sensibilidade ao ruído do treino."],
  ["Raiz, nó, ramo e folha", "Raiz é a primeira pergunta; nó é qualquer pergunta; ramo é a resposta que leva adiante; folha é o grupo final, onde a previsão é atribuída."],
  ["Impureza de Gini", "G igual a 2p(1 menos p) para dois desfechos: zero quando o grupo é puro, máximo de 0,5 quando a taxa é 50%. A divisão escolhida é a de menor impureza ponderada."],
  ["Intervalo de Wilson", "Intervalo binomial descritivo para a taxa de uma folha. Mesma taxa com menos contratos produz intervalo mais largo."],
  ["Poda por complexidade", "Remoção de divisões cujo ganho não compensa o custo de complexidade, escolhido pela validação."],
  ["Resíduo (gradiente negativo)", "Para a perda logística, y menos p: diferença entre o observado e a probabilidade atual. É o que a próxima árvore do boosting aprende."],
  ["Taxa de aprendizagem (η)", "Fração da contribuição de cada árvore que entra no escore. Taxa menor exige mais árvores e costuma generalizar melhor."],
  ["Parada com paciência", "Regra que interrompe o treino quando a validação não melhora além de uma tolerância por certo número de iterações. Definida antes de olhar o teste."],
  ["Importância por permutação", "Queda da AUC quando os valores de uma variável são embaralhados. Mede uso global, não efeito causal."],
  ["Contribuição local", "Quanto cada característica desloca o escore de um cliente em relação à referência. Explica a função aprendida, não identifica causa."],
  ["AUC", "Probabilidade de um inadimplente receber escore maior que um adimplente escolhido ao acaso. Mede ordenação, não escala."],
  ["KS", "Maior distância entre as distribuições acumuladas dos escores de inadimplentes e adimplentes."],
  ["Calibração", "Compatibilidade entre PD prevista e frequência observada, faixa a faixa. Brier e log loss medem qualidade probabilística; a AUC não a captura."],
  ["Corte de aprovação", "PD máxima aceita na política. Define taxa de aprovação e inadimplência entre aprovados, e é decidido na partição de política, antes do teste."],
  ["Ponto de equilíbrio", "PD em que o resultado esperado por operação é zero: margem dividida por LGD vezes EAD. Com as hipóteses da aula, 20%."],
  ["Maturação do alvo", "Os 12 meses que precisam passar depois da contratação para o desfecho existir. Indicadores de qualidade só aparecem depois dela."],
];

/* Erros frequentes, por bloco, com o que os corrige. Na edição do aluno aparecem como lista de
   cuidados de estudo; na do professor, como sinais para observar na turma. */
export const errosComuns = [
  ["problema", "Usar uma variável registrada depois da contratação, como valor renegociado ou consulta ao bureau posterior ao evento.", "Perguntar sempre a data de disponibilidade da informação, não a data do fenômeno."],
  ["problema", "Escolher hiperparâmetros olhando o teste.", "O teste é avaliado uma única vez, com regras congeladas antes. Escolhas usam a validação."],
  ["logit", "Ler o coeficiente como variação da PD.", "O coeficiente multiplica as odds. A variação da PD depende do ponto de partida e passa pela logística."],
  ["logit", "Tratar odds dobradas como PD dobrada.", "Odds de 0,1111 dobradas dão 0,2222, o que corresponde a PD de 18,18%, não de 20%."],
  ["logit", "Codificar canal como 1, 2 e 3 numa única variável.", "Categorias entram por indicadores em relação a uma referência. Números inventam uma ordem que os dados não garantem."],
  ["logit", "Confundir linearidade nos parâmetros com linearidade nas variáveis.", "Nós, transformações e interações mantêm o modelo linear nos parâmetros e mudam a forma do efeito."],
  ["arvore", "Confiar na taxa de uma folha pequena como se fosse precisa.", "10% em 20 contratos tem intervalo de 2,8% a 30,1%; em 1.000 contratos, 8,3% a 12,0%."],
  ["arvore", "Escolher a divisão pela folha mais pura.", "A regra é a menor impureza ponderada pelo tamanho de cada lado, medida em toda a amostra."],
  ["arvore", "Esperar que a renda mude a PD de Carla na árvore didática.", "A renda não participa das perguntas dessa árvore. Dentro da folha a previsão é constante."],
  ["boosting", "Somar as folhas do boosting em pontos percentuais.", "As contribuições somam no escore F. A logística é aplicada uma única vez, no fim."],
  ["boosting", "Repetir a mesma correção em cada iteração.", "Depois de cada árvore os gradientes são recalculados. A segunda correção do grupo B cai de 0,200000 para 0,166078."],
  ["boosting", "Ler contribuição positiva do histórico como efeito causal.", "A contribuição explica a função aprendida com registros históricos, não o efeito de mudar o cadastro."],
  ["decisao", "Comparar AUCs de modelos que usaram informação diferente.", "Mesmo alvo, mesma informação e teste preservado são condições da comparação."],
  ["decisao", "Tomar AUC boa como prova de probabilidades corretas.", "Multiplicar as odds por 2 não altera a AUC e piora Brier e log loss. Calibração é verificação à parte."],
  ["decisao", "Ler a taxa de falsos positivos da ROC como inadimplência da carteira aprovada.", "A inadimplência entre aprovados depende do corte e é medida na partição de política, faixa a faixa."],
  ["decisao", "Julgar a qualidade do modelo no dia seguinte à implantação.", "Composição, ausência e aprovação aparecem no dia seguinte. Inadimplência, calibração e discriminação só depois de 12 meses."],
];

/* Roteiro de aplicação do slide 50, reproduzido para o fecho dos dois materiais. */
export const roteiroAplicacao = [
  ["Alvo", "qual evento, em qual horizonte e para qual população elegível."],
  ["Dados", "o que existia e estava acessível na data da decisão."],
  ["Referência", "um modelo simples bem especificado, que os demais precisam superar."],
  ["Protocolo", "partições por data, maturação do alvo e regras congeladas antes do teste."],
  ["Comparação", "mesmo conjunto de informação, mesma métrica e incerteza declarada."],
  ["Decisão", "corte, economia da operação e plano de monitoramento com responsável."],
];

/* Lista de verificação de saída da aula (edição do aluno): o que você deve conseguir fazer. */
export const verificacaoSaida = [
  "Enunciar o alvo da aula com evento, horizonte, população e unidade, e explicar por que duas PDs com definições diferentes não se comparam.",
  "Classificar uma informação como disponível na decisão ou informação do futuro pela data de disponibilidade.",
  "Calcular a PD de Bruno em duas etapas, a partir dos coeficientes e do perfil de referência, e refazer a conta para um comprometimento de 48%.",
  "Converter probabilidade em odds e em log odds, nos dois sentidos, e explicar por que uma razão de chances de 1,49 não é risco 49% maior.",
  "Percorrer a árvore didática com qualquer um dos quatro clientes e calcular a PD da folha a partir das contagens.",
  "Calcular o ganho de Gini de uma divisão e dizer por que o histórico venceu o comprometimento na raiz.",
  "Refazer as duas iterações da miniatura de boosting e converter o escore final em PD uma única vez.",
  "Explicar por que taxa de aprendizagem, número de árvores e parada precisam ser escolhidos juntos e na validação.",
  "Distinguir discriminação de calibração e dizer o que muda quando as odds são multiplicadas por 2.",
  "Derivar o ponto de equilíbrio de 20% a partir das hipóteses econômicas e defender um corte para o comitê.",
];
