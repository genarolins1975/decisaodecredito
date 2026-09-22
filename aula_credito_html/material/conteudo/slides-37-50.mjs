/* Conteúdo didático dos slides 37 a 50 (fim de "Gradient boosting" e "Avaliação e decisão").
   Números conforme app/dados/11-resultados.js (experimento sintético, semente 20260920) e o texto
   exibido nos slides. */
const r = String.raw;

export const slides = {
  "37": {
    comoLer: "Taxa de aprendizagem e número de árvores precisam ser escolhidos juntos. As curvas mostram a log loss de validação por iteração para três taxas efetivamente treinadas no experimento sintético: com η igual a 0,30 a perda cai rápido e depois sobe, sinal de sobreajuste; com 0,03 ela cai devagar e ainda não convergiu em 300 árvores; com 0,10, a taxa selecionada, o mínimo de validação ocorre em 106 árvores, com log loss 0,34460. A linha tracejada é a perda de treino da taxa selecionada, que continua caindo: o treino nunca avisa quando parar. Com 105 árvores, as PDs dos quatro clientes são Ana 5,00%, Bruno 23,35%, Carla 17,60% e Diego 61,05%. Por que não basta multiplicar no final? Porque mudar o passo altera as previsões, logo os gradientes e, portanto, o que as próximas árvores aprendem. Trajetórias calculadas a cada cinco iterações e registradas no notebook.",
    naTela: "Alterne a taxa treinada e arraste o número de árvores apenas nas iterações calculadas; o painel mostra a melhor iteração de cada taxa.",
    formulas: [
      { tex: r`F_m = F_{m-1} + \eta\,h_m`, nota: "A taxa η escala cada contribuição: taxa menor exige mais árvores." },
    ],
  },
  "38": {
    comoLer: "Uma correção pode depender de uma característica ou da combinação de várias. No experimento auxiliar de duas variáveis, com taxa 0,1 e 150 árvores nos três painéis, muda apenas a profundidade de cada árvore. Profundidade 1 (um corte por árvore) só consegue somar efeitos de comprometimento e de utilização: a superfície é formada por faixas. Profundidade 2 combina as duas condições e captura a regra do canto alto e alto: se comprometimento acima de 40% e utilização acima de 50%, o risco sobe mais do que a soma dos dois efeitos isolados. Para o cliente sintético com comprometimento 65% e utilização 80%, a PD é 46,66% na profundidade 1 (validação 0,2549), 58,88% na profundidade 2 (validação 0,2535) e 47,53% na profundidade 3 (validação 0,2606). A validação prefere a profundidade 2: muitas regras simples somadas não são sempre equivalentes a regras que combinam condições, e mais profundidade não é sempre melhor.",
    naTela: "Escolha um dos quatro cantos ou arraste comprometimento e utilização; alterne a profundidade e compare a PD no ponto.",
  },
  "39": {
    comoLer: "Continuar melhorando o treino pode deixar de ajudar a validação. A regra de parada foi definida antes de treinar: máximo de 300 iterações, tolerância 0,000100, paciência 20, escolha na validação fora do tempo. Reveladas as 300 iterações, a melhor validação é 0,34460 na iteração 106, e a paciência teria encerrado o treino em 89, antes do mínimo, porque ali a validação passou 20 iterações sem melhorar além da tolerância. O modelo servido é o da melhor iteração observada. Dois cuidados que o slide deixa explícitos: a curva do teste não aparece em nenhum seletor, e a paciência é uma regra prática que pode parar cedo demais; por isso ela é declarada com antecedência, para não virar uma escolha feita olhando o resultado. A melhor iteração é escolhida usando uma amostra destinada a essa escolha.",
    naTela: "\"Avançar treinamento\" revela as curvas em lotes de 20 iterações; \"Ir para a melhor iteração\" marca 106 e a parada em 89.",
  },
  "40": {
    comoLer: "Mais flexibilidade exige mais disciplina de validação. Quatro situações, cada uma com pergunta de diagnóstico e evidência aceitável. Sinal aproximadamente aditivo: o boosting ganha do logit bem construído fora do tempo? Aceite apenas ganho que persiste na validação fora do tempo contra um logit com transformações e interações plausíveis; se o ganho não persiste, o logit basta. Interações relevantes: encontrar interação no treino é fácil; reproduzir a interação fora do tempo é o teste. Poucos eventos: flexibilidade com poucos eventos costuma ajustar ruído. Mudança de população: nenhum algoritmo corrige sozinho. A sensibilidade já calculada, na validação e não no teste, mostra os três próximos: logit regularizado AUC 0,7379 e log loss 0,34299; logit flexível 0,7385 e 0,34395; gradient boosting 0,7366 e 0,34460. É o resultado observado neste experimento, não uma generalização de mercado.",
    naTela: "Escolha cada situação para ler a pergunta e a evidência; a tabela de sensibilidade fica visível em todas.",
  },
  "41": {
    comoLer: "O que o modelo usa em geral e o que pesou para Bruno são perguntas diferentes. A importância global por permutação mede a queda da AUC de validação (referência 0,7366) quando os valores de uma variável são embaralhados: comprometimento 0,0618, histórico 0,0419, utilização 0,0177, relacionamento 0,0058, renda 0,0032 e canal 0,0030. A contribuição local decompõe o escore de Bruno em relação à referência −2,056: comprometimento −0,024, histórico +0,651, utilização +0,155, relacionamento +0,121, renda −0,004, canal −0,031, totalizando −1,189. A conferência fecha: referência mais contribuições dá −1,189179, igual ao escore do modelo, diferença menor que 10 elevado a menos 9. Do escore à PD: 23,34% no modelo e 25,78% depois da calibração. Para Bruno, o histórico pesa mais que o comprometimento, o inverso do ranking global. E explicação não identifica causa: alterar a variável não garante a redução prevista.",
    naTela: "Troque o cliente e destaque uma variável pelo nome abreviado para ler as duas medidas lado a lado.",
    formulas: [
      { tex: r`F(\text{Bruno}) = \text{referência} + \sum_j c_j = -2{,}056 + 0{,}867 = -1{,}189`, nota: "As contribuições locais somam exatamente o escore do modelo." },
    ],
  },
  "42": {
    comoLer: "O exercício de consolidação do boosting. O que já sabemos: escore inicial F0 de −1,386294, folha da árvore 1 de +0,200000, folha da árvore 2 de +0,166078, taxa de aprendizagem 1. O novo cliente caiu no grupo B nas duas árvores. Três métodos possíveis de combinação, e só um está certo. Antes de conferir, escreva a conta completa e converta o escore em PD uma única vez. A pergunta de interpretação vale tanto quanto a conta: uma contribuição positiva do histórico prova que remover o atraso do cadastro reduziria o risco real? A contribuição explica a função preditiva aprendida com registros históricos; ela não identifica o efeito de uma intervenção sobre o cadastro. Com as árvores treinadas, os atributos determinam o percurso e a soma determina a PD.",
    naTela: "Escolha o método e clique em Conferir; \"Desafio de consolidação\" abre uma variação com outro grupo.",
    exercicio: {
      titulo: "O novo cliente caiu no grupo B. Qual é a previsão?",
      instrucao: "Escore inicial −1,386294; folha da árvore 1 +0,200000; folha da árvore 2 +0,166078; taxa de aprendizagem 1. Marque o método correto e calcule a PD.",
      itens: [
        "A. Somar como pontos percentuais: 20% mais 20% mais 16,6078%.",
        "B. Somar ao escore e aplicar a função logística uma única vez.",
        "C. Tirar a média das duas folhas.",
      ],
      etapas: [
        "Escore final: ______ + ______ + ______ = ______",
        "PD final: 1 / (1 + e elevado a ______) = ______%",
      ],
      desafio: "Uma contribuição positiva do histórico prova que remover o atraso do cadastro reduziria o risco real? Responda em duas linhas.",
    },
  },
  "43": {
    comoLer: "Estamos comparando modelos ou comparando condições diferentes? O protocolo precede qualquer métrica. Comum aos três modelos: mesmas coortes, mesmo evento e mesmo horizonte de 12 meses; as seis características com a mesma regra de disponibilidade; avaliação final numa única passagem, com regras definidas antes, no teste congelado. Próprio de cada um: o pré processamento (padronização mais a imputação comum no logit; imputação pela mediana do treino e indicadores de ausência nos três) e a escolha de complexidade, sempre pela perda na validação fora do tempo: grade de penalização L2 no logit; profundidade, mínimo por folha e poda na árvore; taxa, profundidade e número de árvores no boosting. As partições: treino 16.000 contratos e 2.124 eventos; validação 4.000 e 522; calibração e política 3.000 e 464; teste 5.000 e 712. Semente 20260920, com versões de numpy, scikit learn e python registradas. Mesmo alvo, mesma informação e teste preservado são condições da comparação.",
    naTela: "Os três botões mostram comparações injustas típicas: boosting com variável do futuro, logit sem tratamento e configuração escolhida pelo teste. \"Ver protocolo executado\" abre os metadados.",
  },
  "44": {
    comoLer: "Quem aparece primeiro na fila de risco? A AUC é a probabilidade de um inadimplente receber escore maior que um adimplente escolhido ao acaso, e o microexemplo de seis registros a conta par a par. Nas curvas do experimento, no teste de 5.000 contratos e 712 eventos, o boosting tem AUC 0,7444 e KS 0,3769: a curva ROC acima da diagonal e a maior distância entre as acumuladas de inadimplentes e adimplentes. Dois avisos do rodapé: mudar o corte não altera a AUC, porque ela resume todos os cortes de uma vez; e a taxa de falsos positivos do eixo não é a inadimplência da carteira aprovada, que depende do corte e é medida no slide 46. A conclusão que o próximo slide vai explorar: um modelo pode ordenar bem mesmo que suas probabilidades estejam na escala errada.",
    naTela: "Na aba \"Microexemplo de pares\", selecione um inadimplente e compare com os adimplentes; na aba \"Curvas do experimento\", troque o modelo.",
    formulas: [
      { tex: r`\text{AUC} = P\big(s_{\text{inadimplente}} > s_{\text{adimplente}}\big) \qquad \text{KS} = \max_c \big|\,F_1(c) - F_0(c)\,\big|`, nota: "AUC como probabilidade de ordenação correta de um par; KS como maior distância entre as acumuladas." },
    ],
  },
  "45": {
    comoLer: "Entre os clientes com PD próxima de 10%, quantos ficaram inadimplentes? O diagrama de calibração compara, faixa a faixa por quantis das previsões no teste, a PD média prevista com a frequência observada, com intervalos de Wilson. Para o boosting, na faixa 6 a PD prevista é 11,17% e a observada 10,00% (7,7% a 12,9%); na faixa 8, prevista 16,24% e observada 21,13% (17,8% a 24,9%), a maior discrepância; na faixa 10, 46,40% contra 44,60%. No conjunto, PD média prevista 14,31% e taxa observada 14,24%, com AUC 0,744367, Brier 0,10676 e log loss 0,35694. A perturbação \"odds vezes 2\" é a demonstração central: multiplicar as odds equivale a somar ln 2 ao log odds, um deslocamento constante que não troca ninguém de lugar na fila, então a AUC permanece 0,744367, mas Brier e log loss pioram. Calibrar é verificar a escala das probabilidades, não apenas a ordem dos clientes.",
    naTela: "Troque o modelo e a versão das previsões (originais, odds vezes 2, calibradas por Platt) e acompanhe AUC, Brier e log loss.",
    formulas: [
      { tex: r`\text{Brier} = \frac{1}{n}\sum_{i=1}^{n}(p_i - y_i)^2 \qquad \text{odds}\times 2 \iff z + \ln 2`, nota: "Brier mede qualidade probabilística; o deslocamento constante em z preserva a ordem e muda a escala." },
    ],
  },
  "46": {
    comoLer: "Até qual PD vamos aprovar? O corte define quem entra na carteira e o que se observa depois. Com o boosting calibrado e corte de 20,0% na partição de política, são aprovados 2.372 de 3.000 contratos, taxa de aprovação de 79,1%; entre os aprovados há 236 eventos, inadimplência de 9,95%, com PD média de 9,86%. As duas curvas abaixo do histograma mostram o compromisso: subir o corte aprova mais e eleva a inadimplência entre aprovados; baixar o corte faz o oposto. A política é definida nesta partição, antes de qualquer olhar ao teste; \"Teste, modo final\" aplica o corte congelado uma única vez. A mesma previsão pode sustentar políticas diferentes, e a política é uma decisão adicional ao modelo: o slide seguinte mostra de onde vem o número 20%.",
    naTela: "Arraste o corte de aprovação, troque o modelo e a partição; \"Corte congelado 20%\" e \"Mesmo volume de aprovação\" fixam duas comparações justas.",
    formulas: [
      { tex: r`\text{taxa de aprovação} = \frac{\#\{\hat{p} \le c\}}{n} \qquad \text{inadimplência entre aprovados} = \frac{\sum_{\hat{p}\le c} y}{\#\{\hat{p} \le c\}}`, nota: "As duas curvas do slide, em função do corte c." },
    ],
  },
  "47": {
    comoLer: "Com estas hipóteses, o equilíbrio ocorre em PD de 20%. A aproximação didática por operação, no horizonte de 12 meses: resultado esperado igual à margem antes da perda, R$ 1.200, menos a perda esperada, PD vezes LGD de 60% vezes EAD de R$ 10.000. Em PD de 10%, a perda esperada é R$ 600 e o resultado R$ 600. O resultado zera quando p iguala m dividido por LGD vezes EAD: 1.200 / (0,6 × 10.000) = 20%. Acima disso, cada operação destrói valor em média; abaixo, cria. Esse é o corte de equilíbrio usado no slide 46 e na comparação do slide 49. A versão com margem condicional muda a formulação (margem só no adimplemento, custo por operação) e produz outro corte, que pertence só a ela. Um bom ranking só gera valor quando probabilidades e política se conectam à economia da operação.",
    naTela: "Arraste a PD do contrato; \"Mudar hipóteses\" altera margem, LGD e EAD e move o ponto de equilíbrio.",
    formulas: [
      { tex: r`\mathbb{E}[\text{resultado}] = m - p\,\text{LGD}\,\text{EAD} \qquad p^{*} = \frac{m}{\text{LGD}\,\text{EAD}} = \frac{1.200}{0{,}6 \times 10.000} = 20\%`, nota: "Resultado esperado por operação e PD de equilíbrio." },
    ],
  },
  "48": {
    comoLer: "O que conseguimos monitorar agora e o que exige esperar? Indicadores imediatos existem no dia seguinte à contratação: comprometimento médio da coorte mais recente 35,5%, utilização média 45,8%, ausência de utilização 4,6%, taxa de aprovação no corte congelado 77,2%, PD média prevista 16,57%. Indicadores com alvo maturado só existem 12 meses depois: na data de observação de julho de 2025, a coorte mais recente já maturada é a de julho de 2024, com inadimplência de 14,63%, e 41 de 41 coortes têm alvo completo. As linhas comparam PD média prevista e inadimplência observada por coorte de contratação. Os cenários sintéticos mostram como cada tipo de mudança aparece: composição dos solicitantes, mais ausência numa variável e relação entre características e risco alterada. Podemos observar a carteira entrando hoje, mas parte da qualidade do modelo só será conhecida depois.",
    naTela: "Arraste a data de observação e veja quantas coortes já maturaram; escolha um cenário sintético para ver os indicadores reagirem.",
  },
  "49": {
    comoLer: "Defenda sua recomendação para o comitê. No teste de fevereiro a julho de 2024, 5.000 contratos e 712 eventos, com a política congelada de aprovar PD calibrada até 20%: logit AUC 0,7446, Brier 0,10670, aprovação 74,8%, inadimplência entre aprovados 8,50%, resultado por aprovado R$ 690 e total R$ 2.578.800; árvore AUC 0,7392, Brier 0,10823, aprovação 77,7%, inadimplência 9,32%, R$ 641 e R$ 2.487.600; boosting AUC 0,7444, Brier 0,10707, aprovação 79,4%, inadimplência 9,22%, R$ 647 e R$ 2.565.600. A maior AUC é do logit, mas a diferença para o menor é de 0,0054, pequena diante da variabilidade de uma única amostra. Aprovação e inadimplência mudam junto com o modelo: comparar apenas AUC esconde a diferença de volume. Manter o logit como referência e avaliar outro método como desafiante é uma recomendação defensável, se a evidência sustentar. Nenhum resultado autoriza reajustar o modelo neste mesmo teste e chamar a nova medida de avaliação independente.",
    naTela: "Escolha modelo candidato, política e restrição; \"Ver argumentos possíveis\" lista o que a evidência sustenta. Escreva a sua justificativa nos três campos.",
    exercicio: {
      titulo: "Prepare a recomendação para o comitê",
      instrucao: "Escolha um modelo e uma política e responda em até três linhas cada pergunta, citando os números da tabela do teste.",
      itens: [
        "Por que este modelo e esta política?",
        "Qual é o principal risco desta escolha?",
        "Como monitorar depois da implantação?",
      ],
    },
  },
  "50": {
    comoLer: "A síntese das três técnicas em três colunas: como cada uma constrói a PD, o principal cuidado e a evidência necessária. A regressão logística soma funções das características num escore e converte pela logística; cuidado com especificação, unidade das variáveis e leitura dos coeficientes; exige validação da forma funcional e calibração fora do tempo. A árvore aprende regras sucessivas e usa a frequência da folha; cuidado com complexidade, tamanho de folha e instabilidade entre amostras; exige desempenho fora do tempo e estabilidade entre reamostragens. O boosting acrescenta contribuições sucessivas ao escore e converte no fim; cuidado com a trajetória de ajuste, a complexidade de cada árvore e a explicação; exige curva de validação, parada definida antes e verificação de calibração. Para os três: informação disponível na decisão, validação temporal, calibração e conexão com a decisão econômica. Os quatro clientes do começo voltam, e as três perguntas de recuperação testam as confusões mais comuns da aula.",
    naTela: "Abra cada pergunta de recuperação só depois de responder; \"Copiar roteiro\" leva os seis passos para o seu trabalho.",
    exercicio: {
      titulo: "Três perguntas de recuperação",
      instrucao: "Responda por escrito antes de abrir as respostas no slide. Cada uma remete a um slide da aula.",
      itens: [
        "Odds multiplicadas por 2 significam PD multiplicada por 2? (rever o slide 11)",
        "A mesma folha pode conter clientes diferentes? (rever o slide 22)",
        "As árvores do boosting somam probabilidades? (rever o slide 36)",
      ],
      desafio: "Para Ana, Bruno, Carla e Diego: qual modelo, qual política e por quê? Use as PDs dos slides 12, 22, 26 e 37 e o corte de 20% do slide 47.",
    },
  },
};
