/* Conteúdo didático dos slides 21 a 36 (blocos "Árvore de decisão" e início de "Gradient boosting").
   Números conforme app/dados/10-dados.js, app/dados/11-resultados.js e o texto exibido nos slides. */
const r = String.raw;

export const slides = {
  "21": {
    comoLer: "Uma árvore organiza a previsão em perguntas sucessivas. A raiz pergunta se houve atraso de 15 a 89 dias; cada ramo leva a uma segunda pergunta, se o comprometimento passa de 40%; e cada resposta termina numa folha, o grupo de contratos que satisfaz as mesmas regras. Ana responde hist igual a 0 na raiz e comp de 22%, até 40%, no segundo nó: chega à folha cuja regra completa é hist igual a 0 e comp até 40%. Só essas duas características entram nas perguntas desta árvore; renda, utilização e relacionamento ficam de fora, o que já antecipa uma propriedade importante: dois clientes com rendas muito diferentes podem receber a mesma previsão. O vocabulário fica fixado aqui. Raiz é a primeira pergunta; nó é qualquer pergunta; ramo é a resposta que leva adiante; folha é o grupo final, onde a previsão é atribuída. As perguntas e seus limites são aprendidos dos dados; a árvore pequena serve para enxergar o mecanismo.",
    naTela: "Escolha o cliente e avance com \"Próximo passo\" para percorrer a árvore pergunta a pergunta. O painel Percurso registra cada resposta.",
  },
  "22": {
    comoLer: "A PD de uma folha é a frequência observada no grupo. Na árvore didática de 1.000 contratos com 100 eventos (taxa 10%), a raiz separa 800 contratos sem histórico (40 eventos, PD 5%) de 200 com histórico (60 eventos, PD 30%). Depois do comprometimento, as quatro folhas ficam assim: hist 0 e comp até 40%, 600 contratos e 18 eventos, PD 3%; hist 0 e comp acima de 40%, 200 e 22, PD 11%; hist 1 e comp até 40%, 80 e 12, PD 15%; hist 1 e comp acima de 40%, 120 e 48, PD 40%. A conferência vale a pena: as folhas somam 1.000 contratos e 100 eventos, exatamente os totais da raiz. Ana cai na primeira folha: p̂ = 18 / 600 = 3%. Mesma folha, mesma previsão: dois clientes com rendas diferentes recebem a mesma PD, porque a renda não participa das perguntas. A previsão é uma frequência observada, sujeita à incerteza da contagem (slide 25) e à capacidade de generalizar (slide 27).",
    naTela: "Troque o cliente para destacar o percurso e a folha; \"Leitura simples, só a taxa\" esconde as contagens e mostra apenas a PD.",
    formulas: [
      { tex: r`\hat{p} = \frac{d}{n} = \frac{18}{600} = 3\%`, nota: "PD da folha de Ana: eventos divididos por contratos do grupo." },
    ],
  },
  "23": {
    comoLer: "Qual pergunta separa melhor os comportamentos observados? Dois candidatos partem exatamente da mesma raiz, 1.000 contratos e 100 eventos. Dividir pelo histórico produz 800 contratos com taxa de 5,00% e 200 com taxa de 30,00%. Dividir pelo comprometimento em 40% produz 680 contratos com taxa de 4,41% e 320 com taxa de 21,88%. As barras mostram a composição de cada lado: quanto mais um lado concentra eventos e o outro os evita, mais homogêneos ficam os grupos. A regra de escolha não olha só a folha mais pura: a divisão escolhida é a de menor impureza ponderada, considerando ao mesmo tempo a mistura de classes em cada lado e o tamanho de cada lado. O cálculo completo, com o índice de Gini, vem no próximo slide. Antes de avançar, tente prever qual candidato vence e por quê.",
    naTela: "Use \"escolher este\" em cada candidato e \"Comparar composição e peso\"; \"Ver regra de escolha\" enuncia o critério.",
  },
  "24": {
    comoLer: "O ganho de Gini em quatro etapas. Impureza da raiz: p = 100 / 1.000 = 10% e G(raiz) = 2p(1 − p) = 0,180. Impureza de cada filho da divisão pelo histórico: com p de 5,00% para hist igual a 0, G = 0,0950; com p de 30,00% para hist igual a 1, G = 0,4200. Ponderação pelo tamanho: 800/1.000 × 0,0950 + 200/1.000 × 0,4200 = 0,160000. Ganho: 0,180 − 0,160000 = 0,020000. O candidato comprometimento até 40% dá ganho de 0,013272, menor. O histórico vence. A curva de impureza binária ajuda a ler: G é zero num grupo puro, máximo de 0,5 quando a taxa é 50%, e o filho com 30% de eventos é o mais impuro dos três pontos marcados. Ainda assim a divisão compensa, porque o outro filho, com 800 contratos, ficou muito mais puro. Não basta uma folha pura: importa como toda a amostra fica depois da divisão.",
    naTela: "Avance com \"Próxima etapa\" e use \"Trocar candidato\" para refazer as contas com o comprometimento.",
    formulas: [
      { tex: r`G = 2\,p\,(1-p)`, nota: "Impureza de Gini para dois desfechos." },
      { tex: r`\bar{G} = \frac{n_{\text{esq}}}{n}\,G_{\text{esq}} + \frac{n_{\text{dir}}}{n}\,G_{\text{dir}} \qquad \Delta G = G(\text{raiz}) - \bar{G}`, nota: "Impureza ponderada dos filhos e ganho da divisão." },
    ],
  },
  "25": {
    comoLer: "Duas folhas com PD de 10% não trazem a mesma evidência. Com 2 eventos em 20 contratos, o intervalo de Wilson nominal de 95% vai de 2,8% a 30,1%, amplitude de 27,3 pontos. Com 100 eventos em 1.000 contratos, vai de 8,3% a 12,0%, amplitude de 3,7 pontos. A amplitude é proporcional à raiz de p̂(1 − p̂)/n: dividir a incerteza por dois exige quatro vezes mais contratos. A terceira linha mostra o caso traiçoeiro: uma folha com 0 eventos em 20 contratos não prova risco zero; o limite superior permanece positivo, 16,1%. É por isso que a árvore recebe um tamanho mínimo de folha como parâmetro. Ressalva do slide: o intervalo é binomial descritivo e não incorpora a escolha adaptativa das folhas, feita pelo próprio algoritmo olhando os dados.",
    naTela: "Arraste o tamanho da folha pequena mantendo a taxa em 10% e veja o intervalo estreitar. \"Esconder a folha sem eventos\" simplifica a leitura.",
    formulas: [
      { tex: r`\text{amplitude} \propto \sqrt{\hat{p}\,(1-\hat{p})/n}`, nota: "Mesma taxa, evidências diferentes: a incerteza cai com a raiz do tamanho da folha." },
      { tex: r`\frac{\hat{p} + \frac{z^2}{2n} \pm z\sqrt{\frac{\hat{p}(1-\hat{p})}{n} + \frac{z^2}{4n^2}}}{1 + \frac{z^2}{n}}`, nota: "Intervalo de Wilson, com z igual a 1,96 para 95% nominal." },
    ],
  },
  "26": {
    comoLer: "As regras da árvore dividem o espaço em regiões de previsão constante. O mapa mostra duas faixas de comprometimento, uma para cada valor de histórico, cortadas em 40%: sem histórico, PD de 3% até 40% e 11% acima; com histórico, 15% até 40% e 40% acima. Os quatro clientes estão posicionados: Ana em 22% sem histórico (3%), Carla em 48% sem histórico (11%), Bruno em 38% com histórico (15%) e Diego em 55% com histórico (40%). Dentro de uma região a previsão não muda: Bruno pode ir de 38% para 40% de comprometimento sem sair da folha de 15%; um ponto a mais e ele salta para 40%. É o oposto do logit, em que cada ponto de comprometimento move o escore continuamente. Em comprometimento exatamente igual a 40, o cliente segue pelo ramo até 40. Os efeitos dependem do caminho, e o mesmo aumento pode significar nada ou uma mudança de folha.",
    naTela: "Arraste o comprometimento do cliente selecionado e alterne o histórico; a regra atual e a PD aparecem abaixo do mapa.",
  },
  "27": {
    comoLer: "Quando a árvore cresce, o resultado fora do treino acompanha? O experimento auxiliar de duas variáveis mostra as regiões aprendidas com profundidade 2 (4 folhas, validação 0,275), 4 (16 folhas, validação 0,262) e 8 (70 folhas, validação 0,401): a profundidade 8 recorta o mapa em retalhos que memorizam o treino. Na base principal, com mínimo de 20 contratos por folha, a perda de treino cai sempre que a profundidade aumenta, mas a perda de validação passa por um mínimo na profundidade 4 (16 folhas, mediana de 366 contratos por folha, treino 0,3434 e validação 0,3496) e depois sobe forte: 0,51 na profundidade 12 e 0,66 sem limite. Uma árvore que memoriza o treino produz probabilidades frágeis fora dele. A validação, não o treino, escolhe a profundidade.",
    naTela: "Arraste a profundidade máxima apenas nos ajustes executados e acompanhe folhas, mediana por folha e as duas perdas.",
  },
  "28": {
    comoLer: "Três controles contêm o excesso de divisões. Profundidade máxima limita quantas perguntas em sequência a árvore pode fazer. Mínimo de contratos por folha impede grupos pequenos demais para sustentar uma taxa, como mostrou o slide 25. Poda por custo e complexidade remove divisões cujo ganho não compensa a penalidade escolhida. O modelo selecionado tem 24 folhas e aparece resumido até o nível 2: a raiz divide por hist até 0,5 (n de 16.000, PD 13,3%); à esquerda, comp até 43,5 (12.940 contratos, PD 9,4%); à direita, comp até 44,7 (3.060 contratos, PD 29,7%). Os cenários efetivamente ajustados, com mínimo por folha fixo em 300 contratos, dão log loss de validação 0,3619 na profundidade 2, 0,3526 na 3, 0,3510 na 4 e 0,3481 na 6. Controlar complexidade é escolher quais detalhes dos dados vale a pena manter.",
    naTela: "Alterne os três controles e arraste o cenário treinado; \"Como foi escolhido?\" explica a seleção pela validação.",
  },
  "29": {
    comoLer: "Se mudarmos um pouco a amostra, a árvore continua contando a mesma história? Vinte reamostragens do treino, com os mesmos hiperparâmetros (profundidade 3 e mínimo de 300 contratos por folha), dão árvores diferentes. A réplica 1 abre pelo comprometimento até 43,4 (8 folhas, AUC de validação 0,7028) e dá PD de 14,85% para Bruno; a réplica 3 abre pelo histórico (7 folhas, AUC 0,7065) e dá 27,59%. Entre as 20 réplicas, a raiz foi comprometimento em 10 e histórico em 10. A dispersão das PDs mostra o tamanho da instabilidade: Ana entre 3,6% e 7,3%, Bruno entre 14,1% e 29,1%, Carla entre 13,3% e 19,9%, Diego entre 58,4% e 67,2%. Uma regra fácil de ler pode ser sensível à amostra que a produziu, e é esse o preço da legibilidade: antes de apresentar uma árvore como \"a regra\", verifique se ela sobrevive a reamostragens.",
    naTela: "Escolha as réplicas A e B e o cliente; o gráfico marca as duas réplicas na nuvem das vinte PDs.",
  },
  "30": {
    comoLer: "O exercício percorre a árvore didática com Carla: R$ 10.000 por mês, comprometimento 48%, relacionamento 60 meses, utilização 85%, sem histórico, canal digital. A taxa da folha de Carla está oculta, e você precisa reconstruir essa taxa a partir das contagens do slide 22. Três tarefas: indicar o caminho, calcular a PD da folha em porcentagem e responder o que acontece se a renda de Carla dobrar mantendo fixas as entradas usadas pela árvore. A terceira pergunta é a mais importante: ela testa se você entendeu que a previsão só depende das características que entram nas perguntas. Uma regra legível ajuda a explicar o cálculo, mas não dispensa evidência de qualidade.",
    naTela: "Marque o caminho, digite a PD e escolha a resposta da terceira pergunta; Conferir corrige as três. \"Desafio final\" abre uma pergunta extra.",
    exercicio: {
      titulo: "Carla recebe qual PD nesta árvore?",
      instrucao: "Use a árvore de 1.000 contratos do slide 22 (contagens por folha) e o perfil de Carla.",
      itens: [
        "1. Indique o caminho: histórico igual a 0 e depois comprometimento acima de 40%; histórico igual a 0 e depois comprometimento até 40%; ou histórico igual a 1 e depois comprometimento acima de 40%.",
        "2. Calcule a PD da folha, em porcentagem, a partir de eventos e contratos da folha: ______ / ______ = ______%.",
        "3. Se a renda de Carla dobrasse, mantendo fixas as entradas usadas na árvore: a PD permanece a mesma, a PD cai pela metade, ou não é possível avaliar a função?",
      ],
    },
  },
  "31": {
    comoLer: "E se uma árvore pequena ainda deixar estrutura nos erros? No experimento auxiliar de duas variáveis, uma árvore de profundidade 2 prevê a PD em quatro regiões, e o mapa da média de y − p por região mostra o que sobra: vermelho onde a previsão ficou baixa demais (resíduo positivo, até 0,18 no canto de comprometimento e utilização altos) e verde onde ficou alta demais (até −0,13). Das 36 regiões, 13 têm resíduo positivo, com média 0,0567; as demais têm média −0,0325; a validação da árvore rasa é 0,2752. Os resíduos não são ruído aleatório: têm padrão espacial, concentrado nos cantos. Em vez de exigir tudo de uma árvore, podemos construir a previsão por acréscimos, com uma nova árvore ajustada ao que sobrou. Os resíduos mostrados são do conjunto usado no ajuste desta árvore auxiliar; nenhum resultado do teste participa.",
    naTela: "\"Onde a previsão ficou baixa?\" e \"E onde ficou alta?\" destacam cada sinal; \"Acrescentar uma correção\" mostra a próxima árvore atuando.",
  },
  "32": {
    comoLer: "O ciclo do gradient boosting tem quatro passos, mostrados com a miniatura de 10 registros e taxa de aprendizagem igual a 1. Passo 1, prever com o que já existe: p = σ(F), com F inicial de −1,3863, dá 20,0000%. Passo 2, calcular a direção de melhoria: para a perda logística, o gradiente negativo em relação ao escore é exatamente y − p; para um registro do grupo B sem evento, 0 − 0,2000 = −0,2000. É daí que vem o nome gradient boosting: o resíduo não é escolha de conveniência. Passo 3, ajustar uma árvore pequena aos resíduos: a folha B recebe a média dos seus r, 0,200000. A árvore devolve um número por folha, positivo ou negativo, não um voto. Passo 4, atualizar o escore: F1 = F0 + η h1 = −1,3863 + 1 × 0,200000 = −1,1863. A régua mostra o escore acumulado; a PD aparece só depois da transformação logística: 20,00% passa a 23,39%.",
    naTela: "Avance com \"Próximo passo\" e use \"Comparar mecanismos\" para contrastar com o logit e com a árvore única.",
    formulas: [
      { tex: r`F_m = F_{m-1} + \eta\,h_m`, nota: "Novo escore igual ao escore atual mais taxa de aprendizagem vezes a contribuição da árvore." },
      { tex: r`r = -\frac{\partial L}{\partial F} = y - p`, nota: "Para a perda logística, o gradiente negativo em relação ao escore é a diferença entre observado e previsto." },
    ],
  },
  "33": {
    comoLer: "Antes de usar características, o boosting precisa de um ponto de partida. Na miniatura, dez registros em dois grupos de comprometimento: grupo A, 30%, sem eventos em 5; grupo B, 50%, 2 eventos em 5. A taxa observada é 2 em 10, 20%, e o escore inicial correspondente é F0 = ln(0,20 / 0,80) = −1,3863. A curva da perda média em função de uma previsão constante confirma a escolha: o mínimo, 0,5004, ocorre exatamente em 20%, a média empírica de y. A curva é calculada diretamente com os dez rótulos, sem treinar biblioteca alguma; arraste a constante e veja a perda subir para os dois lados. É a versão mais simples do que o slide 13 mostrou: o melhor preditor constante da perda logarítmica no treino é a taxa observada. Nesta miniatura, taxa de aprendizagem 1 e apenas dois passos, para as contas caberem numa folha.",
    naTela: "Arraste a previsão constante e observe a perda; \"Usar melhor constante\" volta a 20%; \"Mostrar os resíduos\" preenche a coluna r.",
    formulas: [
      { tex: r`F_0 = \ln\!\left(\frac{0{,}20}{0{,}80}\right) = -1{,}3863`, nota: "Escore inicial: log odds da taxa observada nos dez registros." },
    ],
  },
  "34": {
    comoLer: "A primeira correção reduz A e aumenta B. Com a previsão inicial de 20,00% para todos, os resíduos são −0,2000 para os oito registros sem evento e 0,8000 para os dois com evento. A árvore de um nó corta o comprometimento em 40% e calcula a média dos resíduos por folha: folha A, cinco registros, h = −0,200000; folha B, cinco registros, h = 0,200000 (três de −0,2 e dois de 0,8). A média geral dos resíduos é 0,0000, como esperado quando a constante inicial é a taxa observada. A atualização, com taxa 1, dá escore −1,586294 e PD 16,9906% no grupo A, e escore −1,186294 e PD 23,3922% no grupo B. Repare que os dois registros com evento e os três sem evento do grupo B recebem a mesma correção: a árvore aprende um padrão nos gradientes e aplica a mesma correção a quem cai na mesma folha.",
    naTela: "Avance as quatro etapas e destaque o registro nº 6 (sem evento) ou nº 9 (com evento) para seguir a linha na tabela.",
    formulas: [
      { tex: r`h_1(\text{folha}) = \bar{r}_{\text{folha}} \qquad F_1 = F_0 + \eta\,h_1`, nota: "Cada folha recebe a média dos resíduos; o escore de cada registro é atualizado pela folha em que caiu." },
    ],
  },
  "35": {
    comoLer: "A primeira árvore mudou as previsões, e por isso mudam os gradientes. No grupo B, quem teve evento passou a resíduo 0,766078 (era 0,8) e quem não teve passou a −0,233922 (era −0,2). A segunda árvore usa o mesmo corte em 40%, mas as novas médias: h2 = −0,169906 na folha A e 0,166078 na folha B. Depois da segunda atualização, o grupo A chega ao escore −1,756200 e PD 14,7267%; o grupo B, ao escore −1,020217 e PD 26,4985%. A trajetória por iteração deixa claro o movimento: 20% para 16,99% e 14,73% no grupo A; 20% para 23,39% e 26,50% no grupo B. A correção média do grupo B continua positiva, mas caiu de 0,200000 para 0,166078: a próxima correção é recalculada depois da anterior, e não repete mecanicamente o mesmo passo. A exposição principal para em duas iterações.",
    naTela: "\"Ajustar segunda árvore\" recalcula as médias dos novos resíduos; \"Atualizar\" aplica a correção e estende a trajetória.",
  },
  "36": {
    comoLer: "Para prever um solicitante novo, sem desfecho conhecido, o cliente percorre as árvores já aprendidas e as contribuições são somadas no escore. Com comprometimento de 50%, ele cai na folha do grupo B nas duas árvores: F = −1,386294 + 0,200000 + 0,166078 = −1,020217, e só então p = σ(F) = 26,4985%. Se caísse no grupo A, chegaria a −1,756200 e PD 14,7267%. A cascata mostra o escore inicial e as duas contribuições; o painel de conversão aplica a logística uma única vez, no fim. Dois pontos para levar: nenhum campo de desfecho aparece na ficha do solicitante, porque o y foi usado apenas no treinamento; e as árvores não somam probabilidades, somam contribuições no escore. Esse é o erro que o exercício do slide 42 vai testar.",
    naTela: "Arraste o comprometimento do solicitante entre os grupos; \"Converter em PD\" aplica a logística; \"Como foi treinado?\" volta aos slides 33 a 35.",
    formulas: [
      { tex: r`F = F_0 + h_1 + h_2 = -1{,}386294 + 0{,}200000 + 0{,}166078 = -1{,}020217 \qquad p = \sigma(F) = 26{,}4985\%`, nota: "Soma no escore e conversão única em probabilidade." },
    ],
  },
};
