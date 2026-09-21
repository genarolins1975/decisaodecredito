/* Conteúdo didático dos slides 01 a 20 (blocos "O problema de crédito" e "Regressão logística").
   comoLer: explicação para o aluno. naTela: o que mexer no slide. formulas: notação dos slides.
   exercicio: enunciado sem gabarito (o gabarito da edição do professor vem das notas do baralho).
   Números conforme app/dados/10-dados.js e o texto exibido nos slides. */
const r = String.raw;

export const slides = {
  "01": {
    comoLer: "A aula começa pelo problema, não pela técnica. Quatro propostas de crédito pessoal chegam ao mesmo tempo, cada uma com renda, comprometimento, histórico de atraso, utilização de limite e tempo de relacionamento. Ana tem a renda alta e o comprometimento mais baixo; Diego tem a renda mais baixa, comprometimento de 55% e atraso recente. Entre os dois, Bruno e Carla misturam sinais: Carla ganha R$ 10.000 por mês, mas compromete 48% da renda e usa 85% dos limites. Nenhum deles tem desfecho conhecido. O que o slide pede é que você registre uma decisão por cliente e perceba que, sem uma estimativa de risco e sem uma regra de aprovação, a decisão vira opinião. É exatamente isso que os 49 slides seguintes constroem: estimar a PD com três técnicas, comparar as três e transformar risco em política.",
    naTela: "Escolha Aprovar, Recusar ou Preciso de mais informação para cada cliente. A seleção fica apenas no seu dispositivo. \"Revelar mais informações\" mostra histórico, utilização e relacionamento; \"O desafio da aula\" resume o percurso.",
    exercicio: {
      titulo: "Antes de qualquer modelo",
      instrucao: "Registre uma decisão por cliente e anote, em uma linha, a informação que faria você mudar de ideia.",
      itens: [
        "Ana: R$ 7.000 por mês, comprometimento 22%, sem histórico de atraso, utilização 30%, relacionamento 36 meses.",
        "Bruno: R$ 4.500 por mês, comprometimento 38%, com histórico de atraso, utilização 65%, relacionamento 8 meses.",
        "Carla: R$ 10.000 por mês, comprometimento 48%, sem histórico de atraso, utilização 85%, relacionamento 60 meses.",
        "Diego: R$ 3.500 por mês, comprometimento 55%, com histórico de atraso, utilização 90%, relacionamento 4 meses.",
      ],
      opcoes: ["Aprovar", "Recusar", "Preciso de mais informação"],
    },
  },
  "02": {
    comoLer: "Tudo o que os modelos vão usar está nesta tabela: seis características por cliente, cada uma com unidade e momento de observação. Renda em reais por mês, verificada na proposta. Comprometimento em porcentagem da renda, já incluindo a parcela proposta. Relacionamento em meses completos. Utilização dos limites existentes, em porcentagem. Histórico como indicador 0 ou 1: houve atraso de 15 a 89 dias nos 12 meses anteriores, o que não é inadimplência corrente. Canal como categoria (agência, digital ou parceiro), variável preditiva sem leitura causal. Repare que nenhuma coluna decide sozinha: Carla tem a maior renda e também o segundo maior comprometimento. A ficha ampliada à direita mostra o cliente selecionado; o dicionário explica cada cabeçalho. Esses quatro perfis voltam em quase todos os slides, então vale memorizar os números de Bruno, o cliente que servirá de exemplo de cálculo.",
    naTela: "Clique num nome para ampliar a ficha e num cabeçalho para ler unidade, definição e momento de observação. \"Comparar dois clientes\" coloca dois perfis lado a lado.",
  },
  "03": {
    comoLer: "Antes de estimar uma probabilidade é preciso dizer probabilidade de quê, para quem e até quando. A definição adotada na aula: atraso superior a 90 dias em qualquer momento dos 12 meses seguintes à contratação, para solicitantes elegíveis sem inadimplência corrente, com um contrato de crédito pessoal como unidade. Os três contratos ilustram o que a definição faz. O contrato A cruza os 90 dias no mês 8 e recebe y igual a 1. O contrato B chega exatamente a 90 dias no mês 6 e volta a zero: como o evento exige mais de 90, ele termina a janela com y igual a 0. O contrato C foi contratado há 6 meses e a janela ainda não fechou: o alvo é desconhecido, e ele não pode entrar no treino. A conclusão vale para qualquer comparação de modelos ou de carteiras: com definições diferentes de inadimplência, duas PDs não são comparáveis.",
    naTela: "Arraste o controle da data até a qual conhecemos os dados e veja a máscara avançar sobre os três contratos. Com menos de 12 meses, o contrato C fica sem alvo.",
  },
  "04": {
    comoLer: "Este slide treina a pergunta mais importante da preparação de dados: essa informação existia e estava acessível no momento da proposta? Sete fichas trazem um valor e a data em que ele ficou disponível. Renda verificada três dias antes da proposta, histórico apurado nos 12 meses anteriores, utilização do último extrato fechado e comprometimento calculado na própria simulação estavam disponíveis na decisão. Valor renegociado três meses depois da contratação, atraso máximo apurado no fim da janela e consulta ao bureau feita dois dias depois da inadimplência são informação do futuro: descrevem o desfecho ou só existiram depois dele. A regra que resolve todos os casos: vale a data de disponibilidade da informação, não a data do fenômeno que ela descreve. Uma variável excelente para explicar o passado pode ser inútil, ou perigosa, para decidir antes do evento.",
    naTela: "Classifique cada ficha como \"Disponível na decisão\" ou \"Informação do futuro\" e clique em Conferir. O placar mostra quantas ficaram certas.",
    exercicio: {
      titulo: "Classifique as sete informações",
      instrucao: "Para cada ficha, marque se estava disponível na decisão ou se é informação do futuro. Justifique pela data de disponibilidade.",
      itens: [
        "Renda verificada: R$ 4.500 por mês (documento verificado 3 dias antes da proposta).",
        "Histórico de atrasos: um atraso de 40 dias (apurado nos 12 meses anteriores à proposta).",
        "Utilização de limite: 65% (último extrato fechado antes da proposta).",
        "Comprometimento com a parcela proposta: 38% (calculado na simulação da própria proposta).",
        "Valor renegociado: R$ 3.200 (registrado 3 meses depois da contratação).",
        "Atraso máximo nos 12 meses seguintes: 95 dias (apurado no fim da janela de 12 meses).",
        "Consulta de bureau: escore 480 (consultada 2 dias depois da inadimplência).",
      ],
      opcoes: ["Disponível na decisão", "Informação do futuro"],
    },
  },
  "05": {
    comoLer: "O experimento sintético que sustenta a segunda metade da aula tem 28.000 contratos divididos por calendário em quatro partições. Treino: contratações de janeiro de 2018 a dezembro de 2019, 16.000 contratos, alvo completo em dezembro de 2020. Validação de ajuste: janeiro a junho de 2021, 4.000 contratos, alvo em junho de 2022. Calibração e política: agosto a dezembro de 2022, 3.000 contratos, alvo em dezembro de 2023. Teste final: fevereiro a julho de 2024, 5.000 contratos, alvo em julho de 2025. A barra clara depois de cada faixa são os 12 meses de maturação: só depois deles o desfecho existe. A linha vertical marca o momento da decisão; uma faixa apagada indica alvo ainda desconhecido nessa data. A separação por calendário reproduz a vida real, em que o modelo aprende no passado e é usado no futuro. E o teste tem uma regra: é avaliado uma única vez, com as escolhas já congeladas. O teste não escolhe nada.",
    naTela: "Alterne entre \"Pronto para ajustar\", \"Pronto para calibrar\" e \"Pronto para testar\" para ver quais partições já têm alvo completo em cada momento. \"Erro comum\" mostra o que acontece quando o teste participa da escolha.",
  },
  "06": {
    comoLer: "Bruno é o mesmo nos três painéis: R$ 4.500 por mês, comprometimento 38%, relacionamento 8 meses, utilização 65%, histórico de atraso. O que muda é como cada técnica transforma essa ficha em probabilidade. A regressão logística combina as características num escore z, uma soma ponderada, e converte o escore em PD pela curva logística. A árvore faz perguntas sucessivas (houve atraso? o comprometimento passa de 40%?) e atribui a taxa observada no grupo final. O gradient boosting parte de um escore inicial e acrescenta correções sucessivas, uma por árvore; só no fim o escore somado vira PD. Antes de comparar as técnicas, o slide fixa três perguntas que valem para todas: elas ordenam o risco? Estimam probabilidades na escala certa, de modo que 10% previsto vire cerca de 10% observado? Apoiam uma decisão que melhora o resultado? Guarde essas três perguntas: são os critérios do bloco final.",
    naTela: "Avance as etapas de cada painel com \"Próxima etapa\" para ver o mecanismo se montar. \"O que vamos verificar?\" mostra as três perguntas comuns.",
  },
  "07": {
    comoLer: "A regressão logística começa com uma soma. Cada característica contribui com coeficiente vezes a diferença entre o valor do cliente e o valor do perfil de referência: renda R$ 5.000, comprometimento 30%, relacionamento 12 meses, utilização 40% e sem histórico de atraso. O intercepto, menos 3,50, é o escore desse perfil. Para Bruno, comprometimento 0,04 × (38 − 30) = +0,320; histórico 0,80 × (1 − 0) = +0,800; relacionamento −0,02 × (8 − 12) = +0,080, porque ter menos tempo que a referência aumenta o escore; utilização 0,01 × (65 − 40) = +0,250; renda −0,00005 × (4500 − 5000) = +0,025. Somando ao intercepto, z = −2,025. O gráfico em cascata mostra cada parcela como um degrau. Dois detalhes importam para ler qualquer coeficiente: o sinal diz a direção, e o tamanho depende da unidade da variável (um ponto de comprometimento vale 0,04; um real de renda vale 0,00005). Comparar coeficientes crus entre variáveis de unidades diferentes não faz sentido.",
    naTela: "Troque o cliente e veja as parcelas mudarem. \"Recomeçar uma por vez\" monta a cascata parcela a parcela.",
    formulas: [
      { tex: r`z = \beta_0 + \sum_j \beta_j\,(x_j - \bar{x}_j)`, nota: "Escore como intercepto mais a soma das contribuições, cada uma medida em relação ao perfil de referência." },
    ],
  },
  "08": {
    comoLer: "O escore de Bruno é −2,025; o de Ana, −4,500; o de Carla, −3,540; o de Diego, −0,965. Nenhum deles é uma probabilidade: um escore pode ser qualquer número real, e uma reta ajustada direto na probabilidade não respeita os limites. O exemplo do painel direito mostra o problema: p igual a 0,10 + 0,03 × (comp − 30) dá 130% para um comprometimento de 70% e valores negativos para comprometimentos baixos. A solução não é truncar a reta, e sim modelar uma escala livre (o escore) e converter esse escore por uma função que nunca sai do intervalo entre 0% e 100%. Essa função é a curva logística do próximo slide. A régua de probabilidade ainda sem correspondência, no meio do slide, é proposital: o escore e a probabilidade são escalas diferentes, e a ponte entre elas é o assunto seguinte.",
    naTela: "Arraste o comprometimento e veja a reta sair dos limites. \"Precisamos de uma transformação\" mostra a curva que resolve o problema.",
  },
  "09": {
    comoLer: "A curva logística converte qualquer escore em probabilidade: p = 1 / (1 + e elevado a −z). Em z igual a 0 a probabilidade é 50%, a referência matemática da curva. Para z muito negativo a curva se aproxima de 0%; para z muito positivo, de 100%. Bruno, com z = −2,025, fica em 11,66%: aproximadamente 11,7 eventos em 100 exposições semelhantes, e não uma contagem garantida. Ana (−4,500) está em 1,10%, Carla (−3,540) em 2,82% e Diego (−0,965) em 27,59%. Observe o formato: a curva é quase plana nos extremos e íngreme no centro. Por isso a mesma variação de escore pode produzir mudanças muito diferentes de probabilidade, dependendo de onde o cliente está. Esse fato explica os slides 11 e 14.",
    naTela: "Arraste o escore e leia a PD; use \"Ampliar as PDs baixas\" para ver com detalhe a região entre 0% e 30%, onde os quatro clientes estão.",
    formulas: [
      { tex: r`p = \frac{1}{1 + e^{-z}}`, nota: "Curva logística: converte o escore z em probabilidade entre 0% e 100%." },
    ],
  },
  "10": {
    comoLer: "Probabilidade, odds e log odds descrevem o mesmo risco em escalas diferentes. Com PD de 10%, esperamos 10 eventos e 90 não eventos em 100 exposições. A probabilidade compara eventos com o total: 10 / 100 = 10%. As odds comparam eventos com não eventos: 10 / 90 = 0,1111, ou 1 para 9. O log odds é o logaritmo natural das odds: ln(0,1111) = −2,197, e essa é exatamente a escala do escore z, onde o logit soma as contribuições. As quatro conversões do painel direito permitem ir e voltar: odds = p / (1 − p), p = odds / (1 + odds), z = ln(p / (1 − p)) e p = 1 / (1 + e elevado a −z). Nos limites 0% e 100% o log odds vai a infinito, e é por isso que o controle vai de 1% a 99%. Domine essas conversões: o próximo slide mostra por que um coeficiente do logit é lido em odds, não em pontos de probabilidade.",
    naTela: "Arraste a probabilidade e acompanhe a grade de cem pontos, as odds e o log odds. Os botões 10%, 20% e 50% marcam referências úteis.",
    formulas: [
      { tex: r`\text{odds} = \frac{p}{1-p} \qquad p = \frac{\text{odds}}{1+\text{odds}}`, nota: "Ida e volta entre probabilidade e odds." },
      { tex: r`z = \ln\!\left(\frac{p}{1-p}\right) \qquad p = \frac{1}{1+e^{-z}}`, nota: "Ida e volta entre probabilidade e log odds, a escala do escore." },
    ],
  },
  "11": {
    comoLer: "Mais 10 pontos de comprometimento elevam o escore em 0,04 × 10 = 0,40, e isso multiplica as odds por e elevado a 0,40, aproximadamente 1,4918. O multiplicador é o mesmo para qualquer cliente; a mudança de PD não é. Partindo de 2%, as odds vão de 0,0204 para 0,0304 e a PD vai a 2,95%, mais 0,95 ponto. Partindo de 10%, as odds vão de 0,1111 para 0,1658 e a PD vai a 14,22%, mais 4,22 pontos. Partindo de 40%, as odds vão de 0,6667 para 0,9945 e a PD vai a 49,86%, mais 9,86 pontos. É a mesma conversão exata, cliente a cliente. Daí a regra de leitura: uma mudança na variável multiplica as odds, e a mudança de PD depende do ponto de partida. E o alerta do rodapé: razão de chances de 1,49 não significa risco 49% maior. Odds e probabilidade são escalas diferentes.",
    naTela: "Compare \"+1 p.p.\", \"+10 p.p.\" e \"Odds multiplicadas por 2\"; o controle de exploração aplica qualquer variação de comprometimento e recalcula a razão.",
    formulas: [
      { tex: r`\Delta z = \beta\,\Delta x = 0{,}04 \times 10 = 0{,}40 \qquad \frac{\text{odds}_{\text{depois}}}{\text{odds}_{\text{antes}}} = e^{\Delta z} = e^{0{,}40} \approx 1{,}4918`, nota: "A razão de chances é o multiplicador das odds, não a variação da PD." },
    ],
  },
  "12": {
    comoLer: "Este é o slide de referência para todo o bloco: a PD de Bruno em duas etapas auditáveis. Etapa 1, somar o escore: intercepto −3,500; comprometimento 0,04 × (38 − 30) = +0,320; histórico 0,80 × (1 − 0) = +0,800; relacionamento −0,02 × (8 − 12) = +0,080; utilização 0,01 × (65 − 40) = +0,250; renda −0,00005 × (4500 − 5000) = +0,025. Soma: z = −2,025. Etapa 2, aplicar a logística: p = 1 / (1 + e elevado a 2,025) = 11,66%, ou 0,1166029692 sem arredondamento. O canal de Bruno é digital, mas ele não participa desta fórmula manual; o slide 15 mostra como uma categoria entraria. A ficha é editável de propósito: mude uma característica e veja a parcela correspondente, o escore e a PD se recalcularem. Faça isso com o comprometimento em 48% antes de chegar ao exercício do slide 20.",
    naTela: "Edite qualquer característica pelos controles ou troque de cliente. \"Restaurar Bruno\" volta ao perfil original.",
    formulas: [
      { tex: r`z = -3{,}50 + 0{,}04\,(38-30) + 0{,}80\,(1-0) - 0{,}02\,(8-12) + 0{,}01\,(65-40) - 0{,}00005\,(4500-5000) = -2{,}025`, nota: "Etapa 1: a soma das parcelas de Bruno." },
      { tex: r`p = \frac{1}{1+e^{2{,}025}} = 11{,}66\%`, nota: "Etapa 2: a logística aplicada ao escore." },
    ],
  },
  "13": {
    comoLer: "Como o modelo escolhe os coeficientes? Penalizando previsões incompatíveis com o que ocorreu. A perda logarítmica de uma observação é L = −[y ln p + (1 − y) ln(1 − p)]. Se houve evento (y igual a 1) e o modelo previu 10%, a perda é −ln(0,10) = 2,3026; se tivesse previsto 90%, seria 0,1054. Se não houve evento (y igual a 0), a perda cresce quando a previsão se aproxima de 100%. A tabela dos seis contratos mostra as perdas individuais: uma observação sem evento prevista em 5% custa 0,0513; uma com evento prevista em 60% custa 0,5108; a média das seis é 0,2708. O ajuste minimiza essa média sobre todos os contratos do treino, não a perda de uma observação. As curvas dizem o essencial: a log loss pune com força previsões confiantes que contradizem o desfecho, e é indiferente a acertos que já eram prováveis.",
    naTela: "Arraste a probabilidade prevista e alterne y igual a 0 ou 1 para ver a perda de uma observação. \"Mostrar a amostra\" abre a tabela dos seis contratos.",
    formulas: [
      { tex: r`L = -\left[\,y\,\ln p + (1-y)\,\ln(1-p)\,\right]`, nota: "Perda de uma observação com desfecho y e probabilidade prevista p." },
      { tex: r`L(\beta) = \frac{1}{n}\sum_{i=1}^{n} -\left[\,y_i \ln p_i + (1-y_i)\ln(1-p_i)\,\right]`, nota: "O que o ajuste minimiza: a média das perdas do treino." },
    ],
  },
  "14": {
    comoLer: "O mesmo deslocamento de 0,40 no escore produz alturas diferentes na sigmoide. A partir de 2%, a PD sobe 0,955 ponto; a partir de 10%, 4,219 pontos; a partir de 40%, 9,863 pontos. A tabela compara a variação exata com a aproximação pela derivada, β p (1 − p) por ponto percentual de comprometimento: 0,784, 3,600 e 9,600 pontos, respectivamente. A aproximação local é boa para mudanças pequenas e subestima a variação quando a curva se encurva ao longo do trecho; em 10% a diferença é de 0,619 ponto. A leitura para a prática: a resposta em probabilidade é mais intensa na região central da curva, perto de 50%, e mais suave nas caudas. Quando alguém pedir \"o efeito de um ponto de comprometimento na PD\", a resposta honesta é: depende do ponto de partida do cliente.",
    naTela: "Escolha a PD inicial (2%, 10%, 40% ou valor livre de 1% a 60%) e a mudança em comprometimento; \"Mostrar a aproximação local\" desenha a tangente.",
    formulas: [
      { tex: r`\frac{\partial p}{\partial\,\text{comp}} = \beta\,p\,(1-p) = 0{,}04\,p\,(1-p)`, nota: "Efeito marginal em probabilidade por ponto percentual: vale para mudanças pequenas." },
    ],
  },
  "15": {
    comoLer: "Categorias entram no logit por comparação com uma referência, nunca como números 1, 2 e 3. Com agência como referência, o canal entra por dois indicadores: z = −3,50 + 0,30 × 1[digital] + 0,60 × 1[parceiro]. Para o perfil de referência, isso dá escore −3,50 e PD 2,93% na agência, −3,20 e 3,92% no digital, −2,90 e 5,22% no parceiro. Trocar a referência muda o intercepto e os coeficientes, mas as três PDs permanecem 2,93%, 3,92% e 5,22% em qualquer parametrização: a previsão não depende de qual categoria você chamou de base. Usar canal = 1, 2 e 3 numa única variável imporia que a diferença entre agência e digital é igual à diferença entre digital e parceiro, e que existe uma ordem econômica entre eles. Nada nos dados garante isso. É uma extensão pedagógica da fórmula manual: no cálculo de Bruno, no slide 12, o canal não participa.",
    naTela: "Troque o canal do cliente e a categoria de referência e confira que os coeficientes mudam enquanto as PDs ficam iguais.",
    formulas: [
      { tex: r`z = -3{,}50 + 0{,}30\,\mathbb{1}[\text{digital}] + 0{,}60\,\mathbb{1}[\text{parceiro}]`, nota: "Indicadores em relação à referência agência; cada categoria recebe a sua contribuição." },
    ],
  },
  "16": {
    comoLer: "Linearidade é nos parâmetros, não na forma das variáveis. O cenário separado deste slide acrescenta um nó em 40% de comprometimento: z = −3,50 + 0,04 (comp − 30) + 0,04 max(comp − 40, 0). Até 40% a inclinação no escore é 0,04 por ponto; acima, 0,08. No nó as duas formas coincidem, com contribuição 0,400, e a função é contínua. Em comprometimento de 55%, a forma flexível dá contribuição 1,600 e PD de 13,01% para o perfil de referência, contra a reta pontilhada da forma linear. O modelo continua sendo um logit: os coeficientes entram somando, e é isso que o ajuste estima. O que mudou foi a variável, transformada para permitir que o efeito se intensifique depois de um limite. Splines, logaritmos e faixas fazem o mesmo. A escolha dessas formas é do analista, e por isso precisa ser documentada e validada fora do tempo.",
    naTela: "Arraste o comprometimento e alterne entre a forma linear e a forma com nó; \"Ver como entra na equação\" mostra o termo adicional.",
    formulas: [
      { tex: r`z = -3{,}50 + 0{,}04\,(\text{comp}-30) + 0{,}04\,\max(\text{comp}-40,\,0)`, nota: "Um nó em 40%: a inclinação passa de 0,04 para 0,08 por ponto, sem descontinuidade." },
    ],
  },
  "17": {
    comoLer: "Uma interação é uma diferença de inclinação na escala do escore. No cenário do slide, z = −3,50 + 0,80 hist + (0,04 + δ hist)(comp − 30): para quem tem histórico de atraso, cada ponto de comprometimento vale 0,04 + δ. Com δ igual a 0,03, em comprometimento de 40% as inclinações são 0,04 e 0,07 por ponto, os escores são −3,10 (sem histórico) e −2,00 (com histórico), diferença de 1,100 no escore, e as PDs são 4,3% e 11,9%, diferença de 7,61 pontos. Um detalhe que engana: mesmo sem interação, a diferença em PD entre as duas curvas varia com o comprometimento, porque a sigmoide é não linear. A interação existe quando as retas do painel esquerdo, na escala do escore, têm inclinações diferentes. É lá que se enxerga o termo cruzado.",
    naTela: "Alterne \"sem interação\" e \"interação de 0,03\", arraste o comprometimento e veja as duas escalas. \"Ver o termo cruzado\" destaca o produto hist × (comp − 30).",
    formulas: [
      { tex: r`z = -3{,}50 + 0{,}80\,\text{hist} + (0{,}04 + \delta\,\text{hist})\,(\text{comp}-30)`, nota: "Com δ diferente de zero, a inclinação do comprometimento depende do histórico." },
    ],
  },
  "18": {
    comoLer: "Coeficientes extremos podem estar aprendendo ruído. A regularização acrescenta à perda uma penalidade sobre o tamanho dos coeficientes, 1/(2C) vezes a soma dos quadrados: quanto menor C, maior a força e mais os coeficientes encolhem. As trajetórias do painel esquerdo, em coeficientes padronizados, mostram isso ao longo da grade efetivamente treinada. O painel direito compara a perda de treino com a de validação. Na amostra reduzida de 600 contratos, com a especificação flexível, a perda de treino continua caindo enquanto a de validação sobe: a melhor explicação do treino é sensível demais para funcionar fora dele. O mínimo de validação ocorre em C = 0,0100, força 100, com log loss de validação 0,35472, log loss de treino 0,32275 e AUC de validação 0,7170. O teste final não participa dessa escolha: a validação escolhe, o teste só confirma uma vez.",
    naTela: "Arraste C apenas nos valores treinados e alterne \"Amostra reduzida\" e \"Treino completo\" para ver quando a penalização faz diferença.",
    formulas: [
      { tex: r`L_{\text{pen}} = L + \frac{1}{2C}\sum_j \beta_j^2`, nota: "Perda penalizada: C menor significa força maior e coeficientes menores." },
    ],
  },
  "19": {
    comoLer: "O logit oferece uma estrutura explícita: função compacta e auditável, interpretação condicionada à codificação, previsão rápida e fácil de implantar, regularização e transformações disponíveis. Os limites vêm da mesma origem: a forma funcional é escolhida, não descoberta; variáveis ausentes ou mal medidas continuam ausentes; a extrapolação fora da faixa observada é frágil; correlação entre atributos dificulta a leitura de um coeficiente; mudança de população desloca o nível da previsão. Três situações práticas mostram como decidir. Sinal predominantemente aditivo: pergunte se as curvas de risco por faixa são compatíveis com uma soma de efeitos na escala do escore e, se forem, mantenha o logit como referência, documente a especificação e verifique calibração fora do tempo. Interação relevante omitida e amostra pequena ou instável têm perguntas e ações próprias. Explicar a estrutura é vantagem; especificar a estrutura é responsabilidade.",
    naTela: "Escolha cada situação para ler a pergunta de diagnóstico e a ação possível; \"Critérios de escolha\" resume o que decide entre manter o logit e testar outra técnica.",
  },
  "20": {
    comoLer: "O exercício fecha o bloco com o perfil de Bruno e uma única alteração: o comprometimento passa de 38% para 48%. As três alternativas testam a confusão mais comum da regressão logística. Resolva em quatro etapas, como a solução do slide: variação da característica, variação do escore (coeficiente vezes a variação), efeito nas odds (multiplicação por e elevado à variação do escore) e nova probabilidade (a volta pela logística). Use os números do slide 12 como ponto de partida: escore −2,025 e PD 11,66%. O desafio opcional é um cenário separado, independente do aumento de comprometimento: Bruno sem o histórico de atraso, mantendo tudo o mais igual. Escreva cada etapa antes de conferir na tela.",
    naTela: "Escolha uma alternativa e clique em Conferir; \"Resolver passo a passo\" abre as quatro etapas uma a uma; \"Desafio opcional\" mostra o cenário sem histórico.",
    exercicio: {
      titulo: "Bruno passa de 38% para 48% de comprometimento. O que muda na PD?",
      instrucao: "Marque a alternativa correta e depois preencha as quatro etapas com os seus números.",
      itens: [
        "A. A PD sobe 10 pontos percentuais.",
        "B. O escore sobe 0,40 e as odds são multiplicadas por e elevado a 0,40.",
        "C. A PD é multiplicada por e elevado a 0,40.",
      ],
      etapas: [
        "Variação da característica: Δcomp = ______ pontos",
        "Variação do escore: Δz = 0,04 × ______ = ______, de −2,025 para ______",
        "Efeito nas odds: odds passam de ______ para ______, multiplicadas por ______",
        "Nova probabilidade: p = 1 / (1 + e elevado a ______) = ______%, diferença de ______ p.p.",
      ],
      desafio: "Cenário separado: Bruno sem o histórico de atraso, com comprometimento em 38% e os demais valores originais. Qual é o novo escore e a nova PD? E o que esse cálculo diz, ou não diz, sobre o efeito causal de remover o atraso do cadastro?",
    },
  },
};
