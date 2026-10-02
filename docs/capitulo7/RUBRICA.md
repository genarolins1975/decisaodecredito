# Capítulo 7: rubrica por slide e avaliação do capítulo

Data de referência: 02/10/2026. Escala de 0 a 10 em quatro critérios, com a evidência ao lado de cada nota.

- **D, didática**: uma ideia por slide, objetivo explícito, previsão antes de revelar quando cabe, conexão com o slide seguinte, retorno que nomeia a confusão.
- **E, estética**: hierarquia, sistema de cores com símbolo além da cor, nada cortado. Ancorada na auditoria do palco e na varredura visual.
- **I, interatividade**: controle que muda a leitura, estado inicial interpretável, restauração, sem dependência de passar o mouse, teclado.
- **R, rigor**: número da biblioteca conferida, denominador visível, limitação declarada, nenhuma afirmação além do que os dados mostram.

As colunas "Palco 1920" e "Palco 1400" são as notas da auditoria automática (`scripts/palco/auditoria.mjs`, mínimo exigido 9); "Axe" é o resultado do axe-core no quadro; "Varredura" resume os cinco cenários do relatório de validação.

| # | Slide | D | E | I | R | Média | Palco 1920 | Palco 1400 | Axe | Varredura | Evidência e limite |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 01 | c7p1: Da PD à decisão: quatro perguntas para confiar no modelo | 9 | 9 | 9 | 9 | 9,0 | 9,1 | 9,1 | ok | sem corte | mapa navegável das quatro perguntas com o número da janela em cada uma; links no modo certo, texto na sessão ao vivo |
| 02 | c7p21: Estamos prevendo qual evento, para quem e em quanto tempo? | 9 | 9 | 9 | 9 | 9,0 | 9,1 | 9,1 | ok | sem corte | linha do tempo de safras e maturação; troca de população mostra o mesmo modelo com AUC 0,7257 e 0,7548; previsão sobre comparar AUCs entre bancos |
| 03 | c7p2: Aprovar todos pode produzir alta acurácia | 10 | 9 | 9 | 10 | 9,5 | 9,4 | 9,4 | ok | sem corte | previsão bloqueia a revelação; total fixo de 737 com prevalência variável; comparação com a logística só na prevalência real, que é a única observada |
| 04 | c7p3: Ordenar, prever e decidir são tarefas distintas | 9 | 9 | 9 | 9 | 9,0 | 9,4 | 9,4 | ok | sem corte | mesmos quatro clientes em fila, escala e corte; dois controles separam o que muda e o que fica |
| 05 | c7p4: A fila de risco é o que as métricas de ordenação leem | 9 | 9 | 9 | 10 | 9,25 | 9,4 | 9,4 | ok | sem corte | ordenar e revelar passo a passo; 2 defaults no topo contra 5 do perfeito e 1,25 do acaso |
| 06 | c7p5: AUC é uma disputa entre um default e um adimplente | 10 | 9 | 9 | 10 | 9,5 | 9,6 | 9,6 | ok | sem corte | disputa sorteada com semente; convergência para 38.559 pares certos e 2 empates em 53.136 |
| 07 | c7p22: A AUC exata conta todos os pares, com meio ponto por empate | 9 | 9 | 9 | 10 | 9,25 | 9,4 | 9,4 | ok | sem corte; no celular a matriz rola na horizontal, de propósito | matriz de 75 pares; empate por arredondamento vira inversão em precisão plena (0,8067 para 0,8000) |
| 08 | c7p23: Cada corte transforma a fila numa matriz de confusão | 9 | 9 | 9 | 10 | 9,25 | 9,1 | 9,1 | ok | sem corte | corte, matriz e três taxas reveladas uma a uma com denominador escrito |
| 09 | c7p6: A ROC percorre todos os cortes da fila | 10 | 9 | 9 | 10 | 9,5 | 9,6 | 9,6 | ok | sem corte | ROC construída corte a corte com degrau, diagonal de empate e passo manual; janela inteira com a mesma regra |
| 10 | c7p24: O que a AUC responde e o que deixa em aberto | 9 | 9 | 9 | 9 | 9,0 | 9,1 | 9,1 | ok | sem corte | ponte de transformações: crescente, embaralhada, invertida; fecha com o que a AUC não informa |
| 11 | c7p7: KS: onde as duas distribuições mais se separam? | 9 | 9 | 9 | 10 | 9,25 | 9,4 | 9,4 | ok | sem corte | acumuladas por corte, KS de 0,3621 em 9,75% contra o corte econômico de 14,0% do capítulo 8 |
| 12 | c7p8: Que parcela dos defaults está nos 10% mais arriscados? | 9 | 9 | 9 | 10 | 9,25 | 9,6 | 9,6 | ok | sem corte | ganho por fração examinada com a barra por decil; estado compartilhado com o slide 13, documentado |
| 13 | c7p25: Lift: quantas vezes melhor que escolher ao acaso? | 9 | 9 | 8 | 10 | 9,0 | 9,6 | 9,6 | ok | sem corte depois do ajuste do título do eixo | lift como razão de taxas; controle compartilhado com o slide 12 |
| 14 | c7p26: Com evento raro, precisão e recall contam outra história | 9 | 9 | 9 | 10 | 9,25 | 9,6 | 9,6 | ok | sem corte | precisão e recall com prevalência hipotética; precisão média contra a prevalência |
| 15 | c7p27: Laboratório de discriminação | 10 | 9 | 10 | 9 | 9,5 | 9,4 | 9,4 | ok | sem corte | laboratório com previsão bloqueante, ruído com semente e quatro métricas se movendo juntas |
| 16 | c7p28: Uma boa fila ainda pode cobrar o risco errado | 9 | 9 | 8 | 9 | 8,75 | 9,1 | 9,1 | ok | sem corte | mesma fila, dois níveis; perda esperada contra realizada; escolha com retorno por alternativa |
| 17 | c7p9: Uma PD de 10% fala de um grupo, não de uma pessoa | 10 | 9 | 9 | 10 | 9,5 | 9,6 | 9,6 | ok | sem corte | simulação com histograma da contagem contra a binomial exata e as 100 propostas reais perto de 10% |
| 18 | c7p29: Média prevista igual à observada não prova calibração | 9 | 9 | 9 | 10 | 9,25 | 9,6 | 9,6 | ok | sem corte | observado ÷ esperado 1,13; modelo comprimido acerta a média e erra as duas metades |
| 19 | c7p10: A curva de confiabilidade, construída faixa a faixa | 10 | 9 | 9 | 10 | 9,5 | 9,6 | 9,6 | ok | sem corte | curva construída faixa a faixa, com régua de PDs e tabela; contagem por faixa visível |
| 20 | c7p30: As faixas escolhidas mudam a leitura da curva | 9 | 9 | 9 | 10 | 9,25 | 9,4 | 9,4 | ok | sem corte | faixas fixas e de mesmo tamanho, ocupação de cada faixa e número de faixas |
| 21 | c7p31: Cinco defaults em cem casos não são uma verdade exata | 9 | 9 | 9 | 10 | 9,25 | 9,4 | 9,4 | ok | sem corte | Wilson contra intervalo normal com n e confiança; diferença entre faixas vizinhas com intervalo próprio |
| 22 | c7p32: Erro de nível e erro de inclinação têm assinaturas diferentes | 9 | 9 | 9 | 10 | 9,25 | 9,1 | 9,1 | ok | sem corte | quatro assinaturas sobre a PD verdadeira, com intercepto e slope de calibração; cartões acessíveis por teclado |
| 23 | c7p33: Brier: o custo quadrático de errar a probabilidade | 9 | 9 | 9 | 10 | 9,25 | 9,6 | 9,6 | ok | sem corte | perda de um cliente e Brier da carteira contra a referência honesta do treino, não a da própria janela |
| 24 | c7p34: Log loss: confiança errada custa caro | 9 | 9 | 9 | 10 | 9,25 | 9,1 | 9,1 | ok | sem corte | log loss e Brier em eixos próprios; tabela de confiança errada; nenhuma previsão usou o limite numérico |
| 25 | c7p11: Menor Brier não prova melhor calibração | 9 | 9 | 9 | 10 | 9,25 | 9,1 | 9,1 | ok | sem corte | A com Brier menor e pior calibrado; decomposição de Murphy calculada |
| 26 | c7p35: Laboratório: boa fila, probabilidades ruins | 10 | 9 | 10 | 9 | 9,5 | 9,4 | 9,4 | ok | sem corte | a e b em controles, exemplos prontos; o melhor ajuste nesta janela é rotulado como referência, não avaliação |
| 27 | c7p16: Recalibrar exige uma amostra própria | 10 | 9 | 9 | 10 | 9,5 | 9,1 | 9,1 | ok | sem corte | protocolo contra atalho na mesma janela: o atalho parece melhor e o protocolo mostra que o calibrador piora |
| 28 | c7p12: Correção de nível: um ajuste de intercepto | 9 | 9 | 9 | 10 | 9,25 | 9,4 | 9,4 | ok | sem corte depois de quebrar a fórmula em duas linhas | Newton passo a passo na amostra de calibração; teste fechado até o botão; efeito no teste declarado |
| 29 | c7p13: Platt corrige nível e inclinação sem mexer na fila | 9 | 9 | 9 | 10 | 9,25 | 9,4 | 9,4 | ok | sem corte | previsão bloqueante; três versões com seis métricas; convenção do scikit-learn conferida (b 0,7204, a −0,4025) |
| 30 | c7p36: Isotônica: flexível, com degraus e empates | 9 | 9 | 9 | 10 | 9,25 | 9,6 | 9,6 | ok | sem corte | isotônica com 3.000 e 300 casos; pares certos, empatados e invertidos; queda de AUC por empate |
| 31 | c7p37: O que muda depois de recalibrar | 9 | 9 | 9 | 10 | 9,25 | 9,1 | 9,1 | ok | sem corte | 121 decisões mudam com corte fixo e nenhuma com a mesma fração; prometido contra realizado |
| 32 | c7p18: A probabilidade não escolhe sozinha a política | 9 | 9 | 10 | 9 | 9,25 | 9,1 | 9,1 | ok | sem corte | corte econômico com perda e receita ajustáveis contra o KS fixo; o melhor corte visto depois é rotulado como inexistente na decisão |
| 33 | c7p14: A métrica também é uma estatística | 9 | 9 | 9 | 10 | 9,25 | 9,4 | 9,4 | ok | sem corte | bootstrap pareado com semente (0,0008 a 0,0587, igual à referência) e janelas novas que mostram a sorte da janela |
| 34 | c7p15: Comparação justa: mesmos casos, mesma pergunta | 9 | 9 | 8 | 10 | 9,0 | 9,1 | 9,1 | ok | sem corte | treino, validação e janela; DeLong; comparações injustas nomeadas; árvore declarada indisponível |
| 35 | c7p17: OOT: a prova depois de congelar as escolhas | 10 | 9 | 9 | 10 | 9,5 | 9,1 | 9,1 | ok | sem corte | reabertura com otimismo medido em janelas novas; otimismo da própria logística declarado |
| 36 | c7p38: Você colocaria este modelo em produção? | 10 | 9 | 9 | 9 | 9,25 | 9,6 | 9,6 | ok | sem corte | dossiê com quatro cartões; decisão bloqueada até três tipos de evidência; retorno por alternativa |
| 37 | c7p20: Confiar no modelo exige quatro respostas | 9 | 9 | 9 | 9 | 9,0 | 9,1 | 9,1 | ok | sem corte | quatro respostas com o que falta em cada uma e diagnóstico por sintoma com links |
| 38 | c7p19: Apêndice: fórmulas, métricas fora do protocolo e referências | 8 | 9 | 8 | 9 | 8,5 | 9,6 | 9,6 | ok | sem corte visível; o alerta é o traço interno do radical do KaTeX, recortado por ele mesmo | consulta: fórmulas, métricas fora do protocolo, referências e reprodução; fora do percurso |

Média do capítulo: 9,23; mínimo 8,5; slides com média abaixo de 9: 2.

## Avaliação do capítulo

Evidência. Média das quatro notas por slide: 9,23. Auditoria do palco: 38 de 38 slides com nota de 9 ou mais a 1920 × 1080 e a 1400 × 900 (média 9,35 nas duas). Axe-core: nenhuma violação nos 38 quadros. Números: maior diferença para a referência em Python de 4,3 × 10⁻⁹. Testes: 418 unitários e 24 de aceitação passando.

Inferência. O capítulo cumpre o patamar de 9 em didática, estética, interatividade e rigor no conjunto, com duas exceções que ficam abaixo na média do slide:

- **Slide 16 (c7p28), 8,75**: a interação é uma escolha com retorno, sem controle que mude o gráfico. A ideia (mesma fila, níveis diferentes, provisão diferente) já está inteira na tela; um controle de deslocamento repetiria o slide 26.
- **Slide 38 (c7p19), 8,5**: é consulta, fora do percurso e do tempo de aula; a nota menor em didática e interatividade é esperada para um apêndice.

Recomendação. Se o professor quiser levar o slide 16 a 9, o caminho é acrescentar um controle de nível do modelo B com a perda esperada respondendo ao vivo, mantendo a escolha como fecho.
