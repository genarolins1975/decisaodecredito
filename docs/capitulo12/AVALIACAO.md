# Avaliação do capítulo 12

Gerado por `.claude/skills/quadro-capitulo/scripts/avaliar.mjs` em 2026-10-03. Mínimo 8 em cada item. Notas humanas: subagentes em contexto limpo, 2026-10-03.

**Resultado: REPROVADO, 2 item(ns) abaixo de 8.** Média dos 336 itens de slide: 8,93; menor: 7,0. Testes da biblioteca: passando (2 arquivos de teste da biblioteca passando).

## Itens abaixo do mínimo

- Slide 43 (c12p43), beleza: 7. corr2/c12p43-1920x1080-palco.png: a figura original ganhou largura (x 260 a 1210) e domina; a chave em português (Train/Treino, Validation/Validacao, Bad Rate, fx_SCORE, True/False Positive Rate) resolve a leitura. Continuam duas falhas da rubrica: cor fora do papel (validação em laranja na ROC e verde nas barras, fundo cinza do matplotlib, a ponto de a chave precisar explicar as cores) e área morta no painel de previsão, cerca de 145 px entre o fim da alternativa C (y≈630) e Restaurar (y≈775); os retornos (s43-sobreajuste.tsx, linhas 18 a 20) têm duas ou três linhas no painel mais estreito e não preenchem o vão.. Corrigir: Colocar Restaurar logo abaixo da alternativa C e do retorno (não preso ao rodapé do painel) e encurtar o painel ao conteúdo, ou subir a figura e o painel juntos. Com a figura original obrigatória, a cor fora do papel deixa o teto em 8, salvo se for registrada como exceção declarada de fidelidade ao material.
- Slide 51 (c12p51), beleza: 7. corr2/c12p51-1920x1080-palco.png: a peça principal ocupa agora x 260 a 1305 e domina; o painel lateral estreito está cheio (alternância, título, leitura, links), sem área morta relevante; a chave em português (safra, fx_SCORE 0 a 5, esquerda, direita, linha azul) resolve os rótulos em inglês. As duas falhas restantes estão dentro da figura raster: cor fora do papel (paleta categórica padrão do matplotlib para faixas ordinais: 0 azul, 1 verde, 2 vermelho, 3 roxo, 4 amarelo, 5 ciano, sem escala sequencial de risco; o azul da faixa 0 ainda se confunde com a 'linha azul' da chave) e rótulo sobreposto (no gráfico da direita, a linha ciano da faixa 5 atravessa a legenda sobre os itens '3.0' e '4.0' entre Aug e Oct, recorte x 1150 a 1290, y 270 a 410).. Corrigir: Sem redesenho, o teto é este: as duas falhas estão no raster. Para subir, redesenhar de forma nativa ao lado da original ou numa alternância 'Figura original / Redesenho' (faixas 0 a 5 em escala sequencial de risco, rótulo direto no fim de cada linha em vez de legenda, meses em português, linha tracejada nomeada 'início fora do tempo'); ou, se o professor aceitar, registrar a figura como exceção declarada de fidelidade, o que leva a 8.

## Storytelling do capítulo

| Item | Nota | Evidência |
|---|---|---|
| Coerência | 8,0 | O fio é declarado no c12p1 (pergunta 'Ele é bom?' e as quatro perguntas encadeadas, PERGUNTAS em roteiro.ts) e volta na trilha de todos os 52 quadros, nas aberturas de bloco (c12p2, c12p9, c12p22, c12p39, capturas final12) e no fecho (c12p48 com as quatro linhas, c12p49 com a resposta do slide 1). Três quebras: (1) 'combinação' nomeia duas coisas diferentes: o ensemble do bloco 3 e a regra 'Política e modelo' (união de duas regras, REGRAS em dados.ts); no c12p48 as linhas 03 e 04 são consecutivas ('A combinação explora a diversidade de erros' e '38,9% dos maus capturados pela combinação'), e no c12p47 'a combinação quase dobra o recall'. (2) A estabilidade no tempo é prometida para a decisão (subtítulo do c12p1, subtítulo do c12p39 'A decisão combina discriminação, estabilidade no tempo e volume de recusas', comentário do roteiro 'precisão, recall, volume recusado e estabilidade') e some no exercício: subtítulo do c12p47 'Use precisão, recall e volume do corte'; os três modelos validados fora do tempo no c12p42 (atraso curto baixa renda, alta renda, BVS) não são o modelo da regra Never Paid ('Modelo com cadastro e informações do BACEN') do c12p45 e c12p47, e nenhuma tela diz isso. (3) Os critérios anunciados no c12p1 ('os erros, o limiar e a estabilidade no tempo') não são os do c12p49 ('superar o trivial', limiar, tempo). |
| Arco narrativo | 8,0 | Tensão e virada existem e vêm do dado: c12p10 mostra que o modelo que nunca diz 5 acerta 91,0% contra 95,7% do detector; c12p28 e c12p38 mostram que o ganho dos ensembles é de poucos acertos (114 contra 111 de 125, cada acerto 0,8 ponto) e o capítulo diz isso; c12p42 mostra a AUC do exemplo BVS caindo de 0,832 para 0,645 (−22,5%). Cada bloco fecha abrindo o seguinte (conclusões do c12p8, c12p21, c12p38). Falham duas condições do 9: o gancho (c12p1 a c12p3) não tem nada em jogo, é um detector de 5 no MNIST sem decisão nem custo; o crédito só aparece no c12p3 como vocabulário. E o fecho volta ao gancho (c12p49) mas não decide: a leitura do c12p49 com o teste aberto diz 'O limiar e o tempo dependem da decisão que o modelo apoia', e no c12p47 'Depende do que o comitê aceita trocar' é marcada como certa junto com 'Política BACEN' (OPS com duas alternativas certa: true). |
| Exemplo prático | 8,0 | O caso agora abre o capítulo (corr/c12p1: 'aprovar todos acerta 92,9% no caso da aula', igual a 1 − 5.865/82.458), volta no c12p10 (conclusão após o acerto: 'aprovar todos acerta 92,9%', CORTE.curto.politica), no c12p16 (leitura remete ao slide 47) e decide o c12p47 pela razão de custos de equilíbrio (6,1 e 7,5). Mas o c12p16 só aponta para o caso, a conta ainda é feita no MNIST; o bloco 3 (ensembles, c12p22 a c12p38) nunca toca a carteira; o c12p42 continua mostrando a AUC de três modelos (baixa renda, alta renda, BVS) que não são o da regra Never Paid; e o c12p39 não declara que o caso é uma composição de peças do material. O c12p49 responde à pergunta de abertura com o teste do MNIST, não com os números do caso. |
| Progressão | 8,0 | A ordem vai do intuitivo ao formal: imagem e pixels (c12p4, c12p5), rótulo binário (c12p6), acurácia (c12p10), matriz (c12p11), precisão, recall e F1 com fórmula (c12p12 a c12p14), custo (c12p16), limiar (c12p17, c12p18), ROC e AUC como probabilidade de ordenar pares (c12p19, c12p21); no bloco 3, voto, (1 − 1/m)ᵐ (c12p32), η do boosting (c12p37). Aprofundamentos marcados no roteiro (c12p20, c12p32, c12p44) e puláveis; percurso essencial de 146 minutos (soma de min com nivel essencial em roteiro.ts), 163 com tudo. Falha uma condição: a validação cruzada é usada antes de ser apresentada. Todos os números do bloco 2 vêm de cross_val_predict(cv=3) (código no c12p11, fonte do c12p8), e a única menção na tela é a frase do c12p7 'as métricas do bloco 2 são medidas, por validação cruzada (slide 11)', logo depois do subtítulo 'medir a qualidade nos dados de treino superestima o desempenho'; o c12p11 (captura 11-c12p11-1920x1080-palco+abrir) mostra só o código. O aluno não vê por que 95,7% medido 'no treino' não é otimista. Menor: 'viés semelhante, variância menor' no c12p31 sem definição no capítulo, e o bloco 3 abre com 'Um modelo isolado tem limites' (c12p21) afirmado, não mostrado. |
| Estado da arte | 9,0 | essenciais 10/10; fronteira 5/5. Revisor: Os dez essenciais estão em slide funcionando com dados: E1 c12p10 a c12p15; E2 c12p7 e c12p49 (teste guardado e aberto no fim); E3 c12p16 (custo = c × FN + FP em 602 limiares); E4 c12p19 a c12p21 (AUC 0,9605 e pares sorteados); E5 c12p24 (1.001 aprendizes de 51%) e c12p28; E6 c12p29 a c12p31; E7 c12p32 a c12p34 (37% de fora, OOB); E8 c12p36 e c12p37 (η de 0,1 a 1); E9 c12p41 a c12p44 e c12p51; E10 c12p45, c12p47 e c12p50 (IV com a régua de Siddiqi). Os cinco de fronteira estão no apêndice c12p52, grupo 'Além da aula', com referência primária e o que resolvem; nenhum funciona com dados (o c12p35 só cita a permutação num item revelado). Ressalvas: E2 não tem a referência primária em lugar nenhum do capítulo (Hastie, Tibshirani e Friedman não aparece em c12p52 nem nas fontes); F4 (Wolpert) diz o que resolve mas não quando usar; F5 (Lessmann) aparece em c12p52 ligado ao c12p38, que não mostra o benchmark. Nada apresentado como atual está superado; a importância por impureza vem com o aviso de viés. |
| Fechamento e transferência | 8,0 | O c12p48 responde às quatro perguntas do c12p1 com um número cada (9,0%; 95,7% contra 91,0%; 114 de 125 contra 111; 38,9% recusando 15,6%) e diz o que falta para cada uma (painel 'o que ainda falta'); o c12p49 retoma a resposta do slide 1 e abre o teste guardado (94,9% contra 91,1% do trivial; precisão 66,2%, recall 88,0%, conferidos com mnist.teste em base.json); o c12p47 leva a uma recomendação ao comitê. Os guias batem com a tela nos números conferidos (c12p1, c12p47, c12p48, c12p49). Falha: a pergunta de abertura não é respondida com os números do caso. O critério de tempo do c12p49 é provado com outro modelo (BVS, 0,832 para 0,645), e o próprio quadro admite que 'o MNIST não tem safras'; a decisão do c12p47 termina em 'depende' sem a conta que decidiria (o custo do slide 16 nunca é aplicado ao corte). O material de apoio tem um desalinhamento: paginas.json diz que o capítulo 'dá o vocabulário ... usado nos capítulos 4 a 10', capítulos anteriores a ele e que o prereq lista como base. |

## Estado da arte

| id | Tema | Classe | Onde | Referência |
|---|---|---|---|---|
| E1 | Matriz de confusão, acurácia, precisão, recall e F1, com a armadilha da classe rara | essencial | c12p10, c12p11, c12p12, c12p13, c12p14, c12p15 | Saito e Rehmsmeier (2015), PLoS ONE 10(3) e0118432; em c12p52, grupo Métricas |
| E2 | Separação treino e teste, validação cruzada | essencial | c12p7, c12p11, c12p49 | Hastie, Tibshirani e Friedman (2009), The Elements of Statistical Learning, 2ª ed., cap. 7; ausente de c12p52 e das fontes dos quadros; validação cruzada só em código (c12p11) |
| E3 | Limiar de decisão pela razão de custos dos dois erros | essencial | c12p16, c12p18 | Elkan (2001), The foundations of cost-sensitive learning, IJCAI; em c12p52, grupo Métricas |
| E4 | ROC, AUC como probabilidade de ordenar um par, Gini = 2 AUC − 1, curvas que se cruzam | essencial | c12p19, c12p20, c12p21 | Fawcett (2006), Pattern Recognition Letters 27(8); em c12p52, grupo Métricas |
| E5 | Voto por maioria e o papel da independência dos erros | essencial | c12p23, c12p24, c12p27, c12p28 | Hansen e Salamon (1990), IEEE TPAMI 12(10); em c12p52, grupo Ensembles |
| E6 | Bagging e redução de variância | essencial | c12p29, c12p30, c12p31 | Breiman (1996), Bagging predictors, Machine Learning 24(2); em c12p52, grupo Ensembles |
| E7 | Florestas aleatórias e estimativa out of bag | essencial | c12p32, c12p33, c12p34 | Breiman (2001), Random forests, Machine Learning 45(1); em c12p52, grupo Ensembles |
| E8 | Gradient boosting: árvore ajustada ao gradiente negativo, taxa de aprendizado | essencial | c12p36, c12p37 | Friedman (2001), Annals of Statistics 29(5); em c12p52, grupo Ensembles |
| E9 | Validação fora do tempo e estabilidade entre safras | essencial | c12p41, c12p42, c12p43, c12p44, c12p51 | BCBS (2005), Studies on the Validation of Internal Rating Systems, WP 14; em c12p52, grupo Crédito |
| E10 | Regra de corte em crédito: volume recusado, taxa de maus e IV | essencial | c12p45, c12p47, c12p50 | Siddiqi (2017), Intelligent Credit Scoring, 2ª ed., Wiley; em c12p52, grupo Crédito |
| F1 | Viés da importância por impureza e importância por permutação | fronteira | apendice | Strobl et al. (2007), BMC Bioinformatics 8:25; em c12p52, Além da aula, com quando usar; o c12p35 só cita a permutação num item revelado, sem cálculo |
| F2 | Explicação por contrato com valores de Shapley (SHAP) | fronteira | apendice | Lundberg e Lee (2017), NeurIPS; em c12p52, Além da aula |
| F3 | Boosting regularizado por histograma (XGBoost, LightGBM) | fronteira | apendice | Chen e Guestrin (2016), KDD; Ke et al. (2017), NeurIPS; em c12p52, Além da aula |
| F4 | Stacking: um modelo aprende a combinar os votos | fronteira | apendice | Wolpert (1992), Neural Networks 5(2); em c12p52, Além da aula; a linha diz o que resolve, mas não quando usar |
| F5 | Benchmark de classificadores em crédito | fronteira | apendice | Lessmann et al. (2015), EJOR 247(1); em c12p52, grupo Crédito, ligado ao c12p38, que não mostra o benchmark |

## Slide a slide

| Slide | Layout | Legib. | Beleza | Didática | Interação | Rigor | Acess. |
|---|---|---|---|---|---|---|---|
| 2 c12p2 | 8,0 | 9,0 | 8,0 | 9,0 | 9,0 | 8,0 | 10,0 |
| 3 c12p3 | 9,1 | 9,0 | 8,0 | 9,0 | 9,0 | 9,0 | 10,0 |
| 4 c12p4 | 8,0 | 9,0 | 8,0 | 9,0 | 9,0 | 9,0 | 10,0 |
| 5 c12p5 | 8,0 | 9,0 | 9,0 | 9,0 | 9,0 | 9,0 | 10,0 |
| 6 c12p6 | 9,1 | 9,0 | 8,0 | 9,0 | 9,0 | 9,0 | 10,0 |
| 7 c12p7 | 9,1 | 9,0 | 8,0 | 8,0 | 9,0 | 9,0 | 10,0 |
| 8 c12p8 | 8,0 | 9,0 | 9,0 | 9,0 | 8,0 | 9,0 | 10,0 |
| 9 c12p9 | 8,0 | 9,0 | 8,0 | 9,0 | 9,0 | 8,0 | 10,0 |
| 10 c12p10 | 9,6 | 9,0 | 8,0 | 8,0 | 9,0 | 9,0 | 10,0 |
| 11 c12p11 | 8,0 | 9,0 | 9,0 | 9,0 | 8,0 | 9,0 | 10,0 |
| 12 c12p12 | 9,6 | 9,0 | 8,0 | 9,0 | 9,0 | 9,0 | 10,0 |
| 13 c12p13 | 9,6 | 9,0 | 8,0 | 9,0 | 9,0 | 9,0 | 10,0 |
| 14 c12p14 | 9,4 | 9,0 | 8,0 | 9,0 | 10,0 | 9,0 | 10,0 |
| 15 c12p15 | 8,0 | 9,0 | 9,0 | 8,0 | 9,0 | 8,0 | 10,0 |
| 16 c12p16 | 8,0 | 9,0 | 8,0 | 8,0 | 9,0 | 8,0 | 10,0 |
| 17 c12p17 | 9,1 | 9,0 | 8,0 | 8,0 | 9,0 | 8,0 | 10,0 |
| 18 c12p18 | 9,4 | 9,0 | 8,0 | 9,0 | 10,0 | 9,0 | 10,0 |
| 19 c12p19 | 9,4 | 9,0 | 8,0 | 9,0 | 9,0 | 9,0 | 10,0 |
| 20 c12p20 | 9,4 | 9,0 | 8,0 | 9,0 | 10,0 | 9,0 | 10,0 |
| 21 c12p21 | 9,4 | 9,0 | 8,0 | 8,0 | 9,0 | 9,0 | 10,0 |
| 22 c12p22 | 9,4 | 9,0 | 8,0 | 9,0 | 9,0 | 9,0 | 10,0 |
| 23 c12p23 | 9,4 | 9,0 | 8,0 | 9,0 | 8,0 | 9,0 | 10,0 |
| 25 c12p25 | 9,4 | 9,0 | 8,0 | 8,0 | 9,0 | 8,0 | 10,0 |
| 26 c12p26 | 8,0 | 9,0 | 8,0 | 9,0 | 9,0 | 8,0 | 10,0 |
| 27 c12p27 | 9,4 | 9,0 | 9,0 | 9,0 | 9,0 | 9,0 | 10,0 |
| 28 c12p28 | 9,4 | 9,0 | 9,0 | 10,0 | 9,0 | 10,0 | 10,0 |
| 29 c12p29 | 9,4 | 9,0 | 9,0 | 9,0 | 10,0 | 8,0 | 10,0 |
| 31 c12p31 | 9,4 | 9,0 | 8,0 | 8,0 | 9,0 | 8,0 | 10,0 |
| 32 c12p32 | 9,4 | 9,0 | 9,0 | 9,0 | 9,0 | 8,0 | 10,0 |
| 33 c12p33 | 9,1 | 9,0 | 9,0 | 8,0 | 9,0 | 10,0 | 10,0 |
| 34 c12p34 | 8,0 | 9,0 | 8,0 | 8,0 | 8,0 | 9,0 | 10,0 |
| 36 c12p36 | 9,1 | 9,0 | 8,0 | 8,0 | 9,0 | 9,0 | 10,0 |
| 37 c12p37 | 9,1 | 9,0 | 8,0 | 9,0 | 9,0 | 8,0 | 10,0 |
| 38 c12p38 | 9,1 | 9,0 | 9,0 | 9,0 | 9,0 | 8,0 | 10,0 |
| 39 c12p39 | 9,4 | 9,0 | 8,0 | 9,0 | 9,0 | 8,0 | 10,0 |
| 40 c12p40 | 9,1 | 9,0 | 8,0 | 9,0 | 9,0 | 8,0 | 10,0 |
| 41 c12p41 | 9,4 | 9,0 | 9,0 | 9,0 | 9,0 | 9,0 | 10,0 |
| 42 c12p42 | 9,1 | 9,0 | 8,0 | 9,0 | 9,0 | 8,0 | 10,0 |
| 43 c12p43 | 9,1 | 9,0 | **7,0** | 8,0 | 8,0 | 8,0 | 10,0 |
| 44 c12p44 | 9,1 | 9,0 | 8,0 | 8,0 | 9,0 | 8,0 | 10,0 |
| 45 c12p45 | 9,1 | 9,0 | 8,0 | 8,0 | 9,0 | 9,0 | 10,0 |
| 46 c12p46 | 9,1 | 9,0 | 9,0 | 9,0 | 9,0 | 9,0 | 10,0 |
| 47 c12p47 | 9,6 | 9,0 | 8,0 | 9,0 | 9,0 | 8,0 | 10,0 |
| 48 c12p48 | 9,1 | 9,0 | 8,0 | 9,0 | 9,0 | 8,0 | 10,0 |
| 49 c12p49 | 9,1 | 9,0 | 8,0 | 9,0 | 9,0 | 9,0 | 10,0 |
| 50 c12p50 | 8,0 | 9,0 | 8,0 | 9,0 | 9,0 | 9,0 | 10,0 |
| 51 c12p51 | 8,8 | 9,0 | **7,0** | 9,0 | 9,0 | 9,0 | 10,0 |
| 52 c12p52 | 9,1 | 9,0 | 9,0 | 9,0 | 9,0 | 8,0 | 10,0 |

## Evidências por slide

### 2. Uma imagem entra, um rótulo sai: como o modelo aprende essa função? (c12p2)

- **Layout 8,0:** auditoria 9.40 em 1920 × 1080 e 9.40 em 1400 × 900; varredura: 1920x1080:palco corte em 1 elemento(s); 1920x1080:palco corte em 1 elemento(s); 1366x768:palco corte em 1 elemento(s)
- **Legib. 9,0:** menor fonte 1.73% da altura (span:classificador)
- **Beleza 8,0:** Capturas fix12/01-c12p2-1920x1080-palco.png e 1366x768: o seletor de imagem (botões 1 a 6) e a borda superior do dígito ficam cortados pela borda do painel central (só a metade de cima dos botões aparece); o vetor x quebra '…)' sozinho na segunda linha.
- **Didática 9,0:** Uma ideia (imagem entra, rótulo sai); a saída fica '5 ou não 5?' com a verdade ao lado e o aviso de que o modelo chega no slide 8; leitura liga ao fluxo do bloco com links para os slides 4, 6, 7 e 8.
- **Interação 9,0:** Slide de abertura: o Seg troca a imagem entre seis (três 5, três não 5) e o vetor x é recalculado a partir dos pixels (linhas 22 a 24); os passos do 'Neste bloco' são links; o seletor volta a 1.
- **Rigor 8,0:** O slide mostra números (784 valores de 0 a 255, os pixels '0, 0, 3, 18, 18, 18, 126, 136, 175' da imagem 0) sem nenhuma linha de fonte: AberturaBloco (pecas.tsx) chama Quadro sem a prop fonte.
- **Acess. 10,0:** axe sem violações; teclado, foco e movimento reduzido conferidos

### 3. Quatro termos que usaremos a aula inteira (c12p3)

- **Layout 9,1:** auditoria 9.10 em 1920 × 1080 e 9.10 em 1400 × 900; varredura limpa nos cenários medidos
- **Legib. 9,0:** menor fonte 1.73% da altura (span:Leitura)
- **Beleza 8,0:** Captura 03-c12p3-1920x1080-palco.png: no painel da direita há cerca de 180 px vazios entre a alternativa C e a nota sobre precisão e recall (área morta de um terço do painel no estado inicial).
- **Didática 9,0:** Previsão 'No crédito, qual é a classe positiva?' com a célula oculta ('?') até o acerto; retornos nomeiam a confusão ('Confunde positivo com bom'; 'trocar a classe positiva muda o sentido da precisão'); leitura no acerto liga ao slide 4; nota liga aos slides 12 e 13.
- **Interação 9,0:** Cada linha da tabela é um botão que troca a ilustração (pixel realçado de valor lido de EXEMPLOS[0]); previsão com 'Tentar outra'; Restaurar volta a 'Instância' e previsão em aberto (linha 98).
- **Rigor 9,0:** Termos corretos; 70.000 imagens e 784 pixels de MN; o pixel realçado é calculado por pixelCentral; fonte declara a imagem (índice 0, rótulo 5) e o critério do pixel.
- **Acess. 10,0:** axe sem violações; teclado, foco e movimento reduzido conferidos

### 4. MNIST: 70 mil algarismos escritos à mão (c12p4)

- **Layout 8,0:** auditoria 9.10 em 1920 × 1080 e 9.10 em 1400 × 900; varredura: 1920x1080:palco corte em 2 elemento(s); 1920x1080:palco corte em 2 elemento(s); 1366x768:palco corte em 2 elemento(s)
- **Legib. 9,0:** menor fonte 1.73% da altura (span.q7-kpi-r:Imagens)
- **Beleza 8,0:** Captura fix12/02-c12p4-1920x1080-palco.png: o botão Restaurar fica cortado pela borda inferior do painel da direita (só a metade de cima do texto aparece); a figura de Géron à esquerda tem o tamanho da grade de pixels e disputa com ela a posição de peça principal; os dois KPI (70.000, 784) repetem o subtítulo.
- **Didática 9,0:** Uma ideia (a escrita varia, o rótulo permanece); a leitura usa os números da tela ('o pixel da linha 7, coluna 9 vai de 0 a 253 entre as 7 imagens') e liga ao slide 5.
- **Interação 9,0:** Clique ou setas escolhem o pixel; sete imagens de 5 escolhem a escrita; linha, coluna, índice (7 × 28 + 9 = 205), intensidade e a faixa da leitura são recalculados; Restaurar volta à imagem 0 e ao pixel central.
- **Rigor 9,0:** Índice = linha × 28 + coluna, coerente com reshape(28, 28) (b1.ts); intensidades lidas de base.json; fonte declara a amostra (semente 12, entre as 3.000 primeiras de cada classe), conferida em scripts/capitulo12/referencia.py linha 96.
- **Acess. 10,0:** axe sem violações; teclado, foco e movimento reduzido conferidos

### 5. A base em código: 70 mil linhas, 784 colunas (c12p5)

- **Layout 8,0:** auditoria 9.10 em 1920 × 1080 e 9.10 em 1400 × 900; varredura: 1366x768:estudo corte em 2 elemento(s)
- **Legib. 9,0:** menor fonte 1.72% da altura (span.q12-py-k:import)
- **Beleza 9,0:** Captura fix12/03-c12p5-1920x1080-palco.png: o diagrama X (70.000 × 784) com a linha 0 realçada, o vetor y e a faixa de 784 números dominam o painel direito; código e controles à esquerda em hierarquia secundária; realce dourado consistente no código, na matriz e no dígito.
- **Didática 9,0:** Uma ideia (linha = imagem, coluna = pixel, y = rótulos); leitura com 70.000 linhas e 784 colunas e reshape(28, 28); liga ao slide 6.
- **Interação 9,0:** Seg de leitura (linha, coluna, y) muda o realce do diagrama, as linhas acesas do código e a última linha (X_digits[:, 205]); Seg de linha troca a imagem e a faixa; Restaurar volta à linha 0 (captura b1s/c12p5-1920x1080-palco-e1.png).
- **Rigor 9,0:** Formas (70000, 784) e (70000,) corretas para fetch_openml; pixel 205 = linha 7, coluna 9; fonte declara a origem das linhas e da coluna.
- **Acess. 10,0:** axe sem violações; teclado, foco e movimento reduzido conferidos

### 6. Simplificamos para duas classes: 5 ou não 5 (c12p6)

- **Layout 9,1:** auditoria 9.10 em 1920 × 1080 e 9.10 em 1400 × 900; varredura limpa nos cenários medidos
- **Legib. 9,0:** menor fonte 1.73% da altura (span.q7-kpi-r:Positivos no treino)
- **Beleza 8,0:** Captura 06-c12p6-1920x1080-palco.png: entre a legenda da barra (y 510) e os KPI (y 660) há cerca de 140 px vazios no painel esquerdo; a figura de Géron à direita (vinte dígitos com 'label = ') ocupa um terço do quadro e não carrega o argumento do slide (prevalência do positivo).
- **Didática 9,0:** Título afirmativo; leitura com 5.421 de 60.000 (9,0%) e a faixa de 9,0% a 11,2% para qualquer algarismo; liga ao slide 10 e ao slide 3 (crédito).
- **Interação 9,0:** Os segmentos da barra são botões: escolher outro algarismo muda o código, os KPI, a legenda e a leitura (linhas 29 a 34); Restaurar volta ao 5.
- **Rigor 9,0:** CONTAGEM_DIGITOS soma 60.000 (verificado na linha 20); 5.421 é o mínimo e 6.742 (o 1) dá 11,2%; fonte declara np.bincount no treino.
- **Acess. 10,0:** axe sem violações; teclado, foco e movimento reduzido conferidos

### 7. Treino com 60 mil imagens, teste com 10 mil (c12p7)

- **Layout 9,1:** auditoria 9.10 em 1920 × 1080 e 9.10 em 1400 × 900; varredura limpa nos cenários medidos
- **Legib. 9,0:** menor fonte 1.73% da altura (span:Leitura)
- **Beleza 8,0:** Captura 07-c12p7-1920x1080-palco.png: área morta de cerca de 100 px entre o código e a mensagem no painel esquerdo e de cerca de 120 px entre a alternativa C e a nota no painel direito; a barra 'Teste 10.000' não traz a porcentagem que o treino traz (86%).
- **Didática 8,0:** O subtítulo ('medir a qualidade nos dados de treino superestima o desempenho') responde à previsão do painel direito antes da tentativa; e a previsão usa as duas luas e uma árvore (problema apresentado só no slide 26), um segundo conjunto de dados num slide sobre a divisão do MNIST.
- **Interação 9,0:** Previsão com três alternativas e retornos; no acerto aparecem barras com 100,0% (375 de 375) e 85,6% (107 de 125); a barra treino e teste acende as linhas do código; Restaurar volta ao estado inicial.
- **Rigor 9,0:** Divisão 60.000 e 10.000 confere com MN (verificação na linha 20); 100,0% e 85,6% vêm de LUAS.modelos.arvore com conferência de acertos (linhas 22 a 25); a fonte declara DecisionTreeClassifier(random_state=42), make_moons e o split; a nota avisa que a acurácia de teste do MNIST só aparece no slide 49.
- **Acess. 10,0:** axe sem violações; teclado, foco e movimento reduzido conferidos

### 8. O primeiro classificador: linear, ajustado por SGD (c12p8)

- **Layout 8,0:** auditoria 9.10 em 1920 × 1080 e 9.10 em 1400 × 900; varredura: 390x844:estudo corte em 1 elemento(s)
- **Legib. 9,0:** menor fonte 1.73% da altura (span:prevê não 5)
- **Beleza 9,0:** Captura 08-c12p8-1920x1080-palco.png: a reta do score com as doze miniaturas, regiões 'prevê não 5' e 'prevê 5' e limiar 0 em âmbar domina; marcas ✓ e ✗ além da cor; painel lateral com o selecionado e a contagem 8 de 12.
- **Didática 9,0:** Leitura com os números da tela ('acerta 8: os 6 que não são 5 e 2 dos 6 cincos') e a pergunta que abre o slide 9; SGD e hinge explicados em uma linha cada.
- **Interação 8,0:** Clicar numa miniatura só troca o cartão lateral (real, score, previsão); a leitura e a contagem 8 de 12 não mudam, e os ✓ e ✗ já estão todos à vista no estado inicial: é consulta entre telas prontas, sem experimento.
- **Rigor 9,0:** Scores e previsões de EXEMPLOS (verificação score > 0 na linha 19); fonte declara que o score é da validação cruzada e que a amostra 6 e 6 não tem valor de estimativa. Ressalva: o 1.201 da primeira imagem é o score de validação cruzada, não o do sgd_clf ajustado no código ao lado; a fonte o diz.
- **Acess. 10,0:** axe sem violações; teclado, foco e movimento reduzido conferidos

### 9. Como medir os erros que importam? (c12p9)

- **Layout 8,0:** auditoria 9.40 em 1920 × 1080 e 9.40 em 1400 × 900; varredura: 1366x768:palco corte em 1 elemento(s)
- **Legib. 9,0:** menor fonte 1.73% da altura (dt:5 acima do limiar)
- **Beleza 8,0:** Captura fix12/04-c12p9-1920x1080-palco.png: o botão 'Restaurar limiar 0' é cortado pela borda inferior do painel (recorte conferido em ampliação); as barras das pontas (−60.000 e 30.000) aparecem como picos porque somam as caudas, sem nenhuma marca que o diga.
- **Didática 9,0:** Abertura do bloco 2 com o objeto que o bloco inteiro lê; leitura com 1.891 cincos perdidos e 687 não 5 acima do limiar; liga aos slides 10 e 21.
- **Interação 9,0:** Controle do limiar move a linha âmbar pelas bordas do histograma e recalcula 5 acima, alarmes falsos e cincos perdidos (confusaoNoIndice); Restaurar volta ao limiar 0; links do fluxo do bloco.
- **Rigor 8,0:** Os números conferem (no limiar 0, 3.530, 687 e 1.891, verificado na linha 25), mas o slide não tem linha de fonte (AberturaBloco não passa fonte ao Quadro), e a convenção das caudas somadas nas barras das pontas fica só no comentário do código.
- **Acess. 10,0:** axe sem violações; teclado, foco e movimento reduzido conferidos

### 10. A acurácia esconde quem errou (c12p10)

- **Layout 9,6:** auditoria 9.60 em 1920 × 1080 e 9.60 em 1400 × 900; varredura limpa nos cenários medidos
- **Legib. 9,0:** menor fonte 1.73% da altura (span.q7-kpi-r:Detector SGD (só para o 5))
- **Beleza 8,0:** Captura 10-c12p10-1920x1080-palco.png: no estado inicial, o painel da previsão tem cerca de 250 px vazios abaixo da alternativa D; a grade de cem marcas e os dois KPI ocupam bem o painel esquerdo.
- **Didática 8,0:** A previsão pergunta quanto acerta o modelo que nunca diz 5, mas a legenda da grade já mostra 'não 5 (91,0%)' no estado inicial (s10-acuracia.tsx, linha 49): a resposta certa está na tela antes da tentativa.
- **Interação 9,0:** Previsão com quatro alternativas e retornos; no acerto, o seletor de algarismo positivo recalcula prevalência, grade e acurácia trivial (de 88,8% a 91,0%), e a leitura acompanha; Restaurar volta ao início.
- **Rigor 9,0:** 91,0% = 1 − 5.421/60.000 com verificação (linha 19); 88,8% para o 1 (6.742) confere; fonte com a definição do modelo trivial.
- **Acess. 10,0:** axe sem violações; teclado, foco e movimento reduzido conferidos

### 11. A matriz de confusão separa acertos e dois tipos de erro (c12p11)

- **Layout 8,0:** auditoria 9.10 em 1920 × 1080 e 9.10 em 1400 × 900; varredura: 390x844:estudo corte em 2 elemento(s)
- **Legib. 9,0:** menor fonte 1.72% da altura (span.q12-py-k:from)
- **Beleza 9,0:** Captura 11-c12p11-1920x1080-palco.png: matriz no formato da aula com FP em foco, quatro alarmes falsos com o rótulo e o score, erros em vinho com rótulo VN, FP, FN, VP além da cor; hierarquia código, matriz, detalhe.
- **Didática 9,0:** Uma ideia (dois tipos de erro); leitura com 2.578 erros = 687 + 1.891; os rostos dos erros mostram o que a acurácia junta; liga aos slides 12 e 13.
- **Interação 8,0:** As quatro células são botões que trocam o cartão da direita entre quatro textos prontos; a leitura (linha 37) não muda com a escolha e nenhum número responde a uma causa que o aluno altere.
- **Rigor 9,0:** 53.892, 687, 1.891 e 3.530 de CV; 687 ÷ 54.579 = 1,3% confere; acurácia (53.892 + 3.530) ÷ 60.000 = 95,7%; fonte declara o critério das imagens (score mais alto entre FP, mais baixo entre FN).
- **Acess. 10,0:** axe sem violações; teclado, foco e movimento reduzido conferidos

### 12. Precisão: quando o modelo diz 5, quanto acerta? (c12p12)

- **Layout 9,6:** auditoria 9.60 em 1920 × 1080 e 9.60 em 1400 × 900; varredura limpa nos cenários medidos
- **Legib. 9,0:** menor fonte 1.73% da altura (span.q12-mx-n:verdadeiro negativo)
- **Beleza 8,0:** Captura 12-c12p12-1920x1080-palco.png: no estado inicial, o painel esquerdo tem cerca de 100 px vazios acima da matriz e 100 px abaixo do Restaurar, e o painel direito cerca de 250 px vazios abaixo da alternativa D.
- **Didática 9,0:** Previsão com quatro alternativas que são as confusões típicas (acurácia, recall, complemento), cada uma com retorno que nomeia a confusão e a conta; conta e resultado ocultos até o acerto; leitura liga ao recall (slide 13).
- **Interação 9,0:** A previsão muda a leitura, acende a coluna 'Previsto: 5' e mostra a grade de 100 marcas; 'Tentar outra' e Restaurar voltam ao início (captura b2/c12p12-ok-1920x1080.png).
- **Rigor 9,0:** 3.530 ÷ 4.217 = 83,7% de M_SGD; denominador visível ('a coluna Previsto: 5'); grade arredondada pelos maiores restos e declarada na fonte.
- **Acess. 10,0:** axe sem violações; teclado, foco e movimento reduzido conferidos

### 13. Recall: dos 5 que existem, quantos o modelo encontra? (c12p13)

- **Layout 9,6:** auditoria 9.60 em 1920 × 1080 e 9.60 em 1400 × 900; varredura limpa nos cenários medidos
- **Legib. 9,0:** menor fonte 1.73% da altura (span.q12-mx-n:verdadeiro negativo)
- **Beleza 8,0:** Captura 13-c12p13-1920x1080-palco.png: mesma composição do slide 12, com cerca de 100 px vazios acima e abaixo da matriz e 250 px vazios no painel da previsão no estado inicial.
- **Didática 9,0:** Previsão com recall, precisão, acurácia e complemento, retornos que nomeiam a confusão; leitura junta precisão 83,7% e recall 65,1% e liga ao F1 (slide 14).
- **Interação 9,0:** A previsão acende a linha 'Real: 5', mostra a conta, o resultado e os quatro cincos mais rejeitados com o score (captura b2/c12p13-ok-1920x1080.png); Restaurar volta ao início.
- **Rigor 9,0:** 3.530 ÷ 5.421 = 65,1%; a nota '53.983 alarmes falsos' é cota inferior correta (FP na primeira borda acima do maior score dos quatro, linha 21) e diz 'ao menos'.
- **Acess. 10,0:** axe sem violações; teclado, foco e movimento reduzido conferidos

### 14. F1 resume precisão e recall pela média harmônica (c12p14)

- **Layout 9,4:** auditoria 9.40 em 1920 × 1080 e 9.40 em 1400 × 900; varredura limpa nos cenários medidos
- **Legib. 9,0:** menor fonte 1.73% da altura (span:100%)
- **Beleza 8,0:** Captura 14-c12p14-1920x1080-palco.png: o gráfico de barras domina e a média simples hachurada se distingue do F1; mas os botões 'Detector' e 'Restaurar' fazem a mesma coisa (linhas 63 e 65) e o painel da fórmula tem cerca de 180 px vazios embaixo.
- **Didática 9,0:** Título afirmativo; leitura com os números da tela (73,3% contra 74,4%); o atalho P = 100% e R = 1% mostra o caso extremo (F1 2,0%, média 50,5%); liga aos slides 16 e 17.
- **Interação 10,0:** Dois controles mudam P e R e as quatro barras e a leitura respondem: é o próprio experimento do título (a média harmônica pune o desequilíbrio); atalho para o extremo; Restaurar.
- **Rigor 9,0:** F1 = 7.060 ÷ 9.638 = 73,3%, conferido contra mediaHarmonica na linha 17; a afirmação 'nunca passa do dobro do menor dos dois' é verdadeira (2PR/(P+R) ≤ 2 min(P, R)); fonte declara que os controles não são outro modelo.
- **Acess. 10,0:** axe sem violações; teclado, foco e movimento reduzido conferidos

### 15. Uma métrica sozinha faz o modelo trivial parecer razoável (c12p15)

- **Layout 8,0:** auditoria 9.10 em 1920 × 1080 e 9.10 em 1400 × 900; varredura: 390x844:estudo corte em 1 elemento(s)
- **Legib. 9,0:** menor fonte 1.73% da altura (span:Leitura)
- **Beleza 9,0:** Captura 15-c12p15-1920x1080-palco.png: tabela com barras embutidas por métrica, a linha que engana destacada e a matriz do modelo de comparação ao lado; 'indefinida (0/0)' com texto, não só cor.
- **Didática 8,0:** A etiqueta 'ENGANA' marca a linha certa já no estado inicial, sem pergunta antes; e o título ('Só a acurácia faz o modelo trivial parecer razoável') é desmentido pelo próprio slide no estado 'Sempre diz 5', em que a etiqueta vai para o recall de 100%.
- **Interação 9,0:** O Seg troca o modelo de comparação e muda tabela, matriz, texto e leitura (linha 42); Restaurar volta a 'Nunca diz 5'. São só dois estados prontos, sem variável contínua.
- **Rigor 8,0:** Números conferem (precisão do 'sempre' = prevalência 9,0%, verificação na linha 30; precisão indefinida 0/0 no 'nunca'), mas o título generaliza além do que a tela mostra: com 'Sempre diz 5', é o recall de 100,0% que faz o trivial parecer bom, não a acurácia.
- **Acess. 10,0:** axe sem violações; teclado, foco e movimento reduzido conferidos

### 16. Em crédito, os dois erros têm custos diferentes (c12p16)

- **Layout 8,0:** auditoria 9.10 em 1920 × 1080 e 9.10 em 1400 × 900; varredura: 1920x1080:palco corte em 2 elemento(s); 1920x1080:palco corte em 2 elemento(s); 1366x768:palco corte em 2 elemento(s); 1366x768:estudo corte em 2 elemento(s); 390x844:estudo corte em 2 elemento(s)
- **Legib. 9,0:** menor fonte 1.73% da altura (p.q12-s16-tit:Falso positivo)
- **Beleza 8,0:** corr/c12p16-1920x1080-palco.png: a curva de custo agora é q7-linha--ink (azul escuro), cortada no topo do eixo por abaixoDe(); só os marcadores usam a cor de decisão (● menor custo, ○ limiar 0), com halo que não deixa o rótulo sobre a curva; c = 10 abre com o mínimo deslocado (−6.892, 9.964 contra 19.597). Resta uma falha: os cartões FP e FN da coluna esquerda mostram só 'Consequências no acerto.' e têm cerca de 100 px vazios cada no estado inicial (linhas 63 e 68 de s16), uma terceira coluna que disputa espaço com o gráfico; o eixo x não tem título (limiar do score).
- **Didática 8,0:** No estado inicial c = 1, o custo é FN + FP, isto é, o número de erros: o 'menor custo' em −1.260 é o limiar de maior acurácia, e a leitura diz 'depende da razão entre os dois custos, e não da acurácia' justamente no único estado em que a razão é 1. A pergunta de crédito (previsão) e a analogia do MNIST disputam a tela.
- **Interação 9,0:** O controle c de 1 a 30 move o limiar de menor custo em todas as 602 bordas e a tabela e a leitura respondem; previsão com 'Tentar outra'; Restaurar volta a c = 1 e previsão em aberto.
- **Rigor 8,0:** Números conferem (custo 2.578 no limiar 0; 2.517 em −1.260), mas a leitura em c = 1 opõe o ótimo de custo à acurácia quando, com c = 1, minimizar c × FN + FP é exatamente maximizar a acurácia (s16-custos.tsx, linha 54).
- **Acess. 10,0:** axe sem violações; teclado, foco e movimento reduzido conferidos

### 17. O score vira decisão quando cruza o limiar (c12p17)

- **Layout 9,1:** auditoria 9.10 em 1920 × 1080 e 9.10 em 1400 × 900; varredura limpa nos cenários medidos
- **Legib. 9,0:** menor fonte 1.73% da altura (span:← previsto não 5)
- **Beleza 8,0:** Captura 17-c12p17-1920x1080-palco.png: a figura de Géron repete os mesmos doze dígitos da fita e disputa com ela; o rótulo 'alarme falso' do cartão do 6 encosta nas duas bordas do cartão (espremido).
- **Didática 8,0:** Há algo a descobrir (o que acontece com precisão e recall ao subir o limiar) e não há previsão: a tabela já mostra os três resultados; os doze dígitos da figura não são as doze imagens reais do slide 8, que têm score medido, e a turma passa a ver duas amostras de doze.
- **Interação 9,0:** O controle move o limiar entre as 13 posições e precisão, recall, fita e leitura respondem; botões da tabela levam às três posições da figura; Restaurar volta à posição 7.
- **Rigor 8,0:** A leitura afirma sem condição 'Subir o limiar troca recall por precisão', mas na própria fita a precisão cai ao subir o limiar: posição 7 para 8, de 4/5 = 80% para 3/4 = 75%; posição 4 para 5, de 6/8 = 75% para 5/7 = 71%. O slide 18 faz a ressalva; este não.
- **Acess. 10,0:** axe sem violações; teclado, foco e movimento reduzido conferidos

### 18. Subir o limiar troca recall por precisão (c12p18)

- **Layout 9,4:** auditoria 9.40 em 1920 × 1080 e 9.40 em 1400 × 900; varredura limpa nos cenários medidos
- **Legib. 9,0:** menor fonte 1.73% da altura (span:−49.876)
- **Beleza 8,0:** final12/18-c12p18-1920x1080-palco.png: o gráfico de precisão e recall domina, mas a figura de Géron no painel direito (s18, Figura precisao-recall-limiar) concorre com ele, tem rótulos ilegíveis e codifica ao contrário (no livro a precisão é tracejada e o recall contínuo; no gráfico nativo o recall é tracejado navy e a precisão contínua petróleo). Com o limiar acima de cerca de 6.000 (b2/c12p18-alto-1920x1080.png) a linha âmbar atravessa a anotação 'precisão oscila no topo'.
- **Didática 9,0:** Título afirma a troca; subtítulo antecipa o erro comum (a precisão não é monotônica) e o gráfico o mostra no dado (elipse vinho, 95,5% → 92,0%). Leitura com os números da tela (83,7% e 65,1% no limiar 0, matriz do slide 11) e ponte para o slide 19. A leitura não comenta a oscilação, que é o achado do slide.
- **Interação 10,0:** O controle 'Limiar do score' move a causa que o título afirma e a precisão, o recall, os denominadores (3.530 de 4.217; 3.530 de 5.421) e a matriz respondem na hora; Restaurar volta ao limiar 0 (s18 linha do Botao sec).
- **Rigor 9,0:** Números de CURVA_SGD e confusaoNoIndice (dados.ts, metricas.ts), conferidos contra a matriz do slide 11; o código checa que o recall nunca sobe e procura no dado a última queda da precisão. Fonte com amostra, CV em três partes, versão. Ressalva de redação: 'o recall só pode cair' e 'recall (só cai)' contradizem o trecho plano em 100% à esquerda; o correto é 'nunca sobe'.
- **Acess. 10,0:** axe sem violações; teclado, foco e movimento reduzido conferidos

### 19. Cada limiar é um ponto; o conjunto forma a curva ROC (c12p19)

- **Layout 9,4:** auditoria 9.40 em 1920 × 1080 e 9.40 em 1400 × 900; varredura limpa nos cenários medidos
- **Legib. 9,0:** menor fonte 1.73% da altura (span:mais 5 ditos)
- **Beleza 8,0:** final12/19-c12p19-1920x1080-palco.png: o plano ROC quadrado ocupa cerca de 550 px de largura e o painel lateral, com duas fórmulas, controle, KPIs e um parágrafo, cerca de 850 px: a peça principal é menor que o painel de apoio.
- **Didática 9,0:** Título afirma o mecanismo; o controle percorre a curva e o ponto do limiar 0 (1,3%; 65,1%) liga ao slide anterior; leitura com números e ponte explícita para os slides 20 e 21.
- **Interação 9,0:** Controle de limiar move o ponto âmbar e os KPIs com denominadores (3.530 de 5.421; 687 de 54.579); seletor amplia o eixo da FPR para 0 a 10%; Restaurar volta ao limiar 0 e ao eixo inteiro.
- **Rigor 9,0:** s19 linha 39: o polígono é `${caminhoRoc(pts, x, y)}L${x(pts[0].fpr)} ${y(0)}Z`, que fecha pela base; em corr/c12p19-1920x1080-palco.png o sombreado ocupa toda a área sob a curva e o rótulo 'AUC 0,9605: área sob a curva' está dentro dele. No eixo ampliado o polígono fecha em FPR 10% e o rótulo da AUC some (linha 44, !zoom). Denominadores visíveis e conferidos: TPR 3.530 de 5.421 = 65,1%; FPR 687 de 54.579 = 1,3% (54.579 = 60.000 − 5.421). Fonte com amostra, semente, versão e convenção dos 602 limiares.
- **Acess. 10,0:** axe sem violações; teclado, foco e movimento reduzido conferidos

### 20. Quando as curvas se cruzam, a região de operação decide (c12p20)

- **Layout 9,4:** auditoria 9.40 em 1920 × 1080 e 9.40 em 1400 × 900; varredura limpa nos cenários medidos
- **Legib. 9,0:** menor fonte 1.73% da altura (span:90%)
- **Beleza 8,0:** final12/20-c12p20-1920x1080-palco.png: plano ROC quadrado de cerca de 560 px ao lado de um painel de cerca de 830 px com seletor, controle, dois KPIs e uma frase, com faixas brancas grandes entre eles (área morta). Rótulos diretos nas curvas e símbolos ● e ■ além da cor estão corretos.
- **Didática 9,0:** Uma ideia (dominância contra cruzamento); leitura com os números da tela (56% contra 15% na FPR de 5%; cruzam em 29%) e ligação com crédito e com a AUC do slide 21. Usa 'floresta' antes do slide 34, mas só como rótulo de outro modelo.
- **Interação 10,0:** O controle 'FPR tolerada' é o experimento do título: ao passar de 29% o vencedor troca de A para B, com TPR e AUC nos KPIs; o seletor mostra o caso de dominância com dados do MNIST; Restaurar volta ao cruzamento em 5%.
- **Rigor 9,0:** Conferi as binormais: AUC_A = Φ(0,9815 ÷ √1,25) = 0,81; AUC_B = Φ(1,588 ÷ √3,56) = 0,80; cruzamento Φ(−0,6065 ÷ 1,1) = 29%; TPR em 5%: Φ(0,159) = 56,3% e Φ(−1,044) = 14,8%, como na tela. Dominância verificada no código em todos os pontos. Modelos A e B declarados conceituais na fonte.
- **Acess. 10,0:** axe sem violações; teclado, foco e movimento reduzido conferidos

### 21. AUC resume a curva; o Gini reescala a mesma informação (c12p21)

- **Layout 9,4:** auditoria 9.40 em 1920 × 1080 e 9.40 em 1400 × 900; varredura limpa nos cenários medidos
- **Legib. 9,0:** menor fonte 1.73% da altura (span:Leitura)
- **Beleza 8,0:** final12/21-c12p21-1920x1080-palco.png: três peças disputam (régua AUC e Gini, tabela que repete a régua, gráfico de convergência dos pares); floresta (0,9983) e perfeito (1) se sobrepõem na régua e dividem um rótulo. O cursor de AUC e a curva de convergência usam âmbar, cor reservada a limiar e decisão.
- **Didática 8,0:** Duas ideias no mesmo quadro (Gini como reescala e AUC como probabilidade de ordenar um par). A leitura fecha com 'Um modelo isolado tem limites. E se combinarmos vários?', sem nada na tela que mostre o limite; a floresta, que é um ensemble com AUC 0,9983 contra 0,9605, está na régua e não é usada como evidência.
- **Interação 9,0:** Botões 10, 100, 1.000 e 10.000 sorteiam pares com semente 20261003 e a fração converge para a AUC (b2/c12p21-pares-1920x1080.png: 949 de 1.000, 94,9%); o controle de AUC só converte para Gini, sem experimento; Restaurar volta ao estado inicial.
- **Rigor 9,0:** AUC de roc_auc_score e AUC do histograma 0,96049 declaradas; empate de faixa vale meio ponto, declarado; Gini = 2 × AUC − 1 correto; o código barra diferença acima de 0,0005 entre as duas AUCs.
- **Acess. 10,0:** axe sem violações; teclado, foco e movimento reduzido conferidos

### 22. Por que a combinação de modelos medianos pode superar o melhor deles? (c12p22)

- **Layout 9,4:** auditoria 9.40 em 1920 × 1080 e 9.40 em 1400 × 900; varredura limpa nos cenários medidos
- **Legib. 9,0:** menor fonte 1.73% da altura (span:Neste bloco)
- **Beleza 8,0:** final12/22-c12p22-1920x1080-palco.png: os dois planos das luas ocupam cerca de 240 px cada numa faixa de 1.400 px, com uma área branca larga entre eles; os pontos e os anéis de erro ficam pequenos.
- **Didática 9,0:** Abertura de bloco com a pergunta do título, prévia concreta (107 contra 113 de 125) e leitura que avisa 'quando o ganho é pequeno demais para concluir'; fluxo com links aos slides 23, 29, 34 e 36.
- **Interação 9,0:** Seletor Bagging, Votação, Floresta troca a região e os acertos (+6, +7, +7); links do fluxo navegam; voltar ao Bagging é o estado inicial (slide de navegação).
- **Rigor 9,0:** Acertos conferidos no base.json: árvore 107, bag500 113, soft 114, rf500 114 de 125; o código barra ensemble que não supere a árvore. Ressalva: o rótulo diz '125 pontos de teste' e o plano desenha 122.
- **Acess. 10,0:** axe sem violações; teclado, foco e movimento reduzido conferidos

### 23. Votação: vários algoritmos, vence a maioria (c12p23)

- **Layout 9,4:** auditoria 9.40 em 1920 × 1080 e 9.40 em 1400 × 900; varredura limpa nos cenários medidos
- **Legib. 9,0:** menor fonte 1.73% da altura (span:Leitura)
- **Beleza 8,0:** final12/23-c12p23-1920x1080-palco.png: a figura de Géron (em inglês) e o painel nativo de quatro votantes têm o mesmo tamanho e mostram a mesma coisa (três votos na classe 1, um na 2): duas peças concorrentes.
- **Didática 9,0:** Uma ideia (voto por maioria); leitura com a contagem da tela e ponte para o slide 24; o caso de empate 2 a 2 é explicado e liga ao número ímpar do slide seguinte.
- **Interação 8,0:** Clicar troca o voto e o resultado responde, mas não há classe verdadeira: o aluno não vê a maioria corrigir o erro de um votante, que é o que a leitura afirma ('A maioria só corrige um votante se os outros errarem em casos diferentes').
- **Rigor 9,0:** Sem números de dados, declarado na fonte; a regra de desempate confere com o VotingClassifier (argmax de bincount, menor classe). O retorno do slide 25 fala em 'três algoritmos', aqui são quatro: alinhar.
- **Acess. 10,0:** axe sem violações; teclado, foco e movimento reduzido conferidos

### 25. Quatro formas de produzir erros diferentes (c12p25)

- **Layout 9,4:** auditoria 9.40 em 1920 × 1080 e 9.40 em 1400 × 900; varredura limpa nos cenários medidos
- **Legib. 9,0:** menor fonte 1.73% da altura (span.q12-s25-t:treino: ?)
- **Beleza 8,0:** final12/25-c12p25-1920x1080-palco.png: cada cartão tem cerca de 110 px em branco entre o texto e o rodapé; os ícones de boosting (degraus) e de bagging (pontos) são quase decorativos e não se leem sem legenda.
- **Didática 8,0:** A previsão (qual treina em sequência?) tem a resposta escrita no cartão 04 antes da tentativa: 'Cada modelo se concentra nos erros dos anteriores'. A pergunta (paralelo ou sequência) também não é a ideia do título (independência dos erros).
- **Interação 9,0:** Previsão com quatro alternativas, retorno por alternativa e 'Tentar outra'; cartões são links para os slides 23, 29, 34 e 36.
- **Rigor 8,0:** O título 'Quatro formas de aproximar a independência' põe o boosting no mesmo saco: no boosting os modelos são dependentes por construção (cada um ajusta o resíduo do anterior) e o ganho vem sobretudo da redução de viés, não da média de erros independentes.
- **Acess. 10,0:** axe sem violações; teclado, foco e movimento reduzido conferidos

### 26. Um problema de teste: duas luas entrelaçadas (c12p26)

- **Layout 8,0:** auditoria 9.40 em 1920 × 1080 e 9.40 em 1400 × 900; varredura: 1366x768:estudo corte em 2 elemento(s)
- **Legib. 9,0:** menor fonte 1.72% da altura (span.q12-py-k:from)
- **Beleza 8,0:** final12/26-c12p26-1920x1080-palco.png e ...-palco+abrir.png: a figura de Géron das luas aparece como miniatura de cerca de 55 px, ilegível; o plano nativo deixa cerca de 150 px vazios à direita dentro do painel.
- **Didática 9,0:** Leitura com números (500, 375, 125, 25%) e convite a sobrepor a logística; com a reta, a leitura passa a 0,864 (108 de 125) e liga ao slide 27.
- **Interação 9,0:** Seletor treino, teste, ambos; botão que sobrepõe a fronteira da logística com erros circulados; destaque de linha no código acompanha o seletor; Restaurar volta ao treino sem fronteira.
- **Rigor 8,0:** O subtítulo do plano diz '375 pontos de treino', mas PlanoLuas desenha 359: 16 pontos de treino (e 3 de teste) caem fora da grade [−1,5; 2,5] × [−1; 1,5] e são descartados em silêncio (pecas.tsx, filtro dos pts). Conferido no base.json.
- **Acess. 10,0:** axe sem violações; teclado, foco e movimento reduzido conferidos

### 27. Votação em código: três algoritmos, um voto (c12p27)

- **Layout 9,4:** auditoria 9.40 em 1920 × 1080 e 9.40 em 1400 × 900; varredura limpa nos cenários medidos
- **Legib. 9,0:** menor fonte 1.72% da altura (span.q12-py-k:from)
- **Beleza 9,0:** final12/27-c12p27-1920x1080-palco.png: código à esquerda com linhas acesas e plano das luas à direita, rótulos e legenda com símbolo além da cor. O bloco de código rola por dentro e esconde a linha voting_clf.fit(X_train, y_train).
- **Didática 9,0:** Leitura com os números da tela (0,896, 112 de 125, contra 0,888 do SVC, 1 acerto a mais) e pergunta que leva ao slide 28.
- **Interação 9,0:** Seletor de cinco modelos troca a região, os erros circulados, a linha acesa e o próprio código (probability=True e voting='soft'); Restaurar volta ao hard voting.
- **Rigor 9,0:** Acertos conferidos no base.json (lr 108, rf10 109, svc 111, hard 112, soft 114); o código barra a leitura se o SVC deixar de ser o melhor isolado. Ressalva: 3 dos 125 pontos de teste não são desenhados.
- **Acess. 10,0:** axe sem violações; teclado, foco e movimento reduzido conferidos

### 28. O voto vence os modelos isolados, por poucos acertos (c12p28)

- **Layout 9,4:** auditoria 9.40 em 1920 × 1080 e 9.40 em 1400 × 900; varredura limpa nos cenários medidos
- **Legib. 9,0:** menor fonte 1.73% da altura (span:Leitura)
- **Beleza 9,0:** final12/28-c12p28-1920x1080-palco.png e b3e/c12p28-1-1920x1080.png: a matriz de erros (uma coluna por ponto, agrupada por quantos erram) é a forma do argumento e domina; resta área vazia no pé do painel direito antes da revelação.
- **Didática 10,0:** Previsão antes de revelar, com retornos que nomeiam a confusão (a alternativa 'uns 5' é o esperado sob independência, 5,4, e o retorno mostra que os três erram juntos em 6 pontos contra 0,2 esperado): o aluno vê o erro de supor independência no próprio dado. Leitura com números e ponte para o bagging (slide 29).
- **Interação 9,0:** Previsão de três alternativas que revela as linhas do hard e do soft, a tabela e a nota; 'Tentar outra' volta ao início.
- **Rigor 10,0:** Conferi: erros 17, 16, 14; hard erra 6 + 7 = 13; esperado sob independência 125 × 0,136 × 0,128 × 0,112 = 0,24 e para a maioria 5,4; o código garante que o hard erra onde dois ou três erram. A nota 'Diferenças de 1 a 3 acertos (0,8 a 2,4 pontos) pedem validação cruzada' mostra a limitação que muda a conclusão.
- **Acess. 10,0:** axe sem violações; teclado, foco e movimento reduzido conferidos

### 29. Bagging: o mesmo algoritmo em amostras diferentes (c12p29)

- **Layout 9,4:** auditoria 9.40 em 1920 × 1080 e 9.40 em 1400 × 900; varredura limpa nos cenários medidos
- **Legib. 9,0:** menor fonte 1.73% da altura (span.q12-s29-v:fora)
- **Beleza 9,0:** final12/29-c12p29-1920x1080-palco.png: a grade de 20 instâncias, com ×n, pontos empilhados e 'fora' tracejado, domina; classe por símbolo (▲, ●); a figura de Géron à direita é secundária.
- **Didática 9,0:** Leitura com os números da tela (6 de 20 de fora, 30%, 4 repetidas, esperado 35,8%) e pontes para os slides 32 e 33; o caso pasting com 20 de 20 explica por que o pasting precisa de amostras menores.
- **Interação 10,0:** O aluno muda a causa (com ou sem reposição, número de sorteios, nova semente) e vê o efeito (de fora, repetidas, esperado); sementes 1, 2, 3 declaradas; Restaurar volta a bagging, 20 sorteios, semente 1.
- **Rigor 8,0:** Contagens conferidas na captura (10 × 1, 2 × 2, 2 × 3, 6 de fora). Mas o terceiro item do painel diz 'Os preditores são independentes: treinam em paralelo', logo depois de os slides 24 e 25 usarem independência no sentido estatístico dos erros: os preditores do bagging não são independentes (as amostras se sobrepõem e os erros se correlacionam, como o slide 28 mostrou).
- **Acess. 10,0:** axe sem violações; teclado, foco e movimento reduzido conferidos

### 31. O ensemble suaviza a fronteira de decisão (c12p31)

- **Layout 9,4:** auditoria 9.40 em 1920 × 1080 e 9.40 em 1400 × 900; varredura limpa nos cenários medidos
- **Legib. 9,0:** menor fonte 1.73% da altura (li:classe 0)
- **Beleza 8,0:** corr2/c12p31-1920x1080-palco.png: a recomposição funcionou. Os dois planos agora dominam (eixos de y≈360 a 643 num painel de 265 a 780, contra 375 a 628 antes), a fronteira escura e as ilhas da árvore provam o título, classe 0 em círculo azul e classe 1 em triângulo verde (símbolo além da cor), erro em anel vermelho; o painel lateral ficou estreito e a miniatura de Géron virou referência pequena acima da tabela, sem concorrer. Resta uma falha da rubrica: rótulo colado, o título 'x₁' encosta no tick '3' nos dois planos (recorte ampliado lê 'x₁3', x≈700 a 725, y≈660). Folgas menores: cerca de 60 px entre os títulos 'Árvore única'/'Bagging de 500 árvores' e o topo dos eixos, e cerca de 90 px vazios no painel lateral abaixo do texto (y≈690 a 780).
- **Didática 8,0:** Com os pontos de treino, a leitura diz 'a região abre ilhas para acertar pontos isolados', e a tela não mostra ilhas (b3e/c12p31-1-1920x1080.png): o aluno não vê o que a frase afirma.
- **Interação 9,0:** Seletor teste e treino troca os pontos, os erros circulados, os subtítulos e a leitura; Restaurar volta ao teste.
- **Rigor 8,0:** Números conferidos (treino 1,000 e 0,939; teste 0,856 e 0,904; 18 e 12 erros). Mas o subtítulo 'Viés semelhante, variância menor' e a leitura 'o recorte que acerta o treino é variância' afirmam viés e variância sem medi-los (uma só partição); e o plano de treino desenha 359 dos 375 pontos que diz mostrar.
- **Acess. 10,0:** axe sem violações; teclado, foco e movimento reduzido conferidos

### 32. Com amostras do tamanho do treino, cada árvore deixa de fora cerca de 37% (c12p32)

- **Layout 9,4:** auditoria 9.40 em 1920 × 1080 e 9.40 em 1400 × 900; varredura limpa nos cenários medidos
- **Legib. 9,0:** menor fonte 1.73% da altura (span.q7-kpi-r:Dentro, m = 20)
- **Beleza 9,0:** final12/32-c12p32-1920x1080-palco.png: a curva domina, com assíntota identificada, ponto âmbar rotulado e legenda de duas séries.
- **Didática 9,0:** Leitura com números (35,8% com m = 20; 36,7% com m = 375; 1/e = 36,8%) e ponte para o slide 33. O título fala em 'de fora' e a curva mostra 'dentro', o que obriga o aluno a subtrair.
- **Interação 9,0:** Controle de m de 1 a 40, botão m = 375 e Restaurar para m = 20 (a amostra do slide 29).
- **Rigor 8,0:** A conta está certa, mas o título 'Cada árvore deixa de fora cerca de 37% das instâncias' vale só quando cada árvore sorteia tantas instâncias quanto o treino. No bagging do slide 30, logo antes, max_samples=100 de 375: cada árvore deixa de fora (1 − 1/375)^100 ≈ 76,6%. O slide não diz a condição.
- **Acess. 10,0:** axe sem violações; teclado, foco e movimento reduzido conferidos

### 33. A validação out of bag antecipa o teste? (c12p33)

- **Layout 9,1:** auditoria 9.10 em 1920 × 1080 e 9.10 em 1400 × 900; varredura limpa nos cenários medidos
- **Legib. 9,0:** menor fonte 1.72% da altura (span.q12-cod-l:bag_clf = BaggingClassifier()
- **Beleza 9,0:** final12/33-c12p33-1920x1080-palco.png e b3e/c12p33-1-1920x1080.png: régua de duas estimativas com intervalo de 95% é a peça principal, com o código acima e a previsão ao lado; o código encolhe a fonte depois da revelação.
- **Didática 8,0:** Previsão com retornos que nomeiam a confusão ('Confunde OOB com acurácia no treino'), mas o título 'A validação out of bag antecipa o teste' entrega a alternativa A antes da tentativa.
- **Interação 9,0:** Previsão de três alternativas revela o comentário do código, o KPI e o ponto do teste na régua; 'Tentar outra' volta.
- **Rigor 10,0:** OOB 0,8987 (337 de 375) e teste 0,912 (114 de 125) do base.json; intervalos de Wilson conferidos (OOB de 86,4% a 92,5% contém 0,912); a leitura diz 'menos de 2 acertos de teste' (1,3 ÷ 0,8 = 1,67). A fonte declara a diferença para a aula (0,901). O intervalo é a incerteza que muda a conclusão.
- **Acess. 10,0:** axe sem violações; teclado, foco e movimento reduzido conferidos

### 34. Floresta aleatória: amostras e características sorteadas (c12p34)

- **Layout 8,0:** auditoria 9.40 em 1920 × 1080 e 9.40 em 1400 × 900; varredura: 1920x1080:palco corte em 2 elemento(s); 1920x1080:palco corte em 2 elemento(s); 1366x768:palco corte em 2 elemento(s); 1366x768:estudo corte em 2 elemento(s)
- **Legib. 9,0:** menor fonte 1.72% da altura (span.q12-py-k:from)
- **Beleza 8,0:** final12/34-c12p34-1920x1080-palco.png: a figura de Géron (árvores sobre colinas) é decorativa e minúscula; o último item da lista do painel direito encosta na borda inferior.
- **Didática 8,0:** O subtítulo afirma 'árvores menos correlacionadas' e nada na tela mostra isso; a leitura, honesta, admite que 'aqui não se isola o efeito do sorteio'. O slide informa o mecanismo, mas não o ensina.
- **Interação 8,0:** O seletor floresta ou bagging alterna entre duas telas quase iguais (114 contra 113 acertos, regiões parecidas): escolhe entre telas prontas sem mudar a leitura do conceito do título.
- **Rigor 9,0:** Acertos conferidos (rf500 114, bag500 113); a leitura declara que os hiperparâmetros diferem (max_leaf_nodes=16 contra árvores sem limite e max_samples=100) e não atribui a diferença ao sorteio; ⌊√2⌋ = 1 característica por divisão correto. Ressalva: 3 pontos de teste não desenhados.
- **Acess. 10,0:** axe sem violações; teclado, foco e movimento reduzido conferidos

### 36. Gradient boosting em três árvores (c12p36)

- **Layout 9,1:** auditoria 9.10 em 1920 × 1080 e 9.10 em 1400 × 900; varredura limpa nos cenários medidos
- **Legib. 9,0:** menor fonte 1.72% da altura (span.q12-py-c:# Base)
- **Beleza 8,0:** 36-c12p36-1920x1080-palco.png: o bloco de código (16 linhas, coluna esquerda) tem a mesma largura e altura do gráfico de degraus à direita; as duas peças disputam a atenção e o gráfico, que prova o subtítulo, não domina.
- **Didática 8,0:** Título 'Gradient boosting em três árvores' (roteiro.ts, c12p36) é rótulo, não afirmação; a leitura é boa ('o erro quadrático médio cai de 0,126 para 0,013') e liga ao slide 37, mas o título não diz o que concluir, e o slide 37 repete a mesma ideia.
- **Interação 9,0:** Seletor Etapa 1, 2, 3 troca o bloco de código aceso, o alvo plotado (y, y2, y3 com marca +) e os dois KPIs de erro (0,126 → 0,013 → 0,006 → 0,005, capturas b3e/c12p36-2); Restaurar volta à etapa 1 (s36, linha do Botao).
- **Rigor 9,0:** Árvores de boosting() em metricas.ts, conferidas no teste; ETAPAS.mse com checagem de queda no próprio módulo (s36, 'throw' se não cair); fonte declara 100 pontos, semente 42, y = 3x² + 0,05 × ruído e scikit-learn 1.9.1.
- **Acess. 10,0:** axe sem violações; teclado, foco e movimento reduzido conferidos

### 37. Gradient boosting: cada árvore ajusta o resíduo (c12p37)

- **Layout 9,1:** auditoria 9.10 em 1920 × 1080 e 9.10 em 1400 × 900; varredura limpa nos cenários medidos
- **Legib. 9,0:** menor fonte 1.73% da altura (span:0,1)
- **Beleza 8,0:** 37-c12p37-1920x1080-palco.png: a figura raster de Géron (painel esquerdo, três linhas de gráficos com texto de cerca de 6 px, ilegível) repete o que o gráfico nativo do centro mostra e compete com ele; a figura não pode ser lida em sala.
- **Didática 9,0:** Título afirmativo; leitura com os números do estado ('vai de 0,126 a 0,005, caindo a cada etapa'), frase sobre η e ligação ao slide 38; uma ideia: somar árvores que corrigem o resíduo.
- **Interação 9,0:** Controles M (1 a 10) e η (0,1 a 1) recalculam boosting() e mudam a curva, o tracejado da etapa anterior, o gráfico de erro e o KPI (b3e/c12p37-1: M = 10, η = 0,1, erro 0,021); Restaurar volta a M = 3, η = 1.
- **Rigor 8,0:** A fórmula KaTeX fixa 'ŷ(x) = h1(x) + h2(x) + h3(x)' (s37, Formula) continua na tela com M = 10 e η = 0,1 (b3e/c12p37-1), quando o modelo exibido é η·Σ h_m; e o subtítulo 'a previsão acompanha melhor a curva' se apoia só no erro de treino, que sempre cai com mais árvores e não mede ajuste à curva 3x².
- **Acess. 10,0:** axe sem violações; teclado, foco e movimento reduzido conferidos

### 38. Síntese: quatro formas de produzir diversidade (c12p38)

- **Layout 9,1:** auditoria 9.10 em 1920 × 1080 e 9.10 em 1400 × 900; varredura limpa nos cenários medidos
- **Legib. 9,0:** menor fonte 1.73% da altura (span:Leitura)
- **Beleza 9,0:** 38-c12p38-1920x1080-palco.png: tabela de quatro métodos domina, linha de boosting destacada como sequencial; embaixo, eixo único de acertos com ■ ensemble e ○ isolado e rótulos diretos sem sobreposição ('soft e floresta 500' agrupados em 114).
- **Didática 9,0:** Leitura com os números da tela ('acertam de 112 a 114 de 125, contra 107 da árvore única') e pergunta que abre o bloco 4 com link ao slide 39; cada método liga ao slide em que começa.
- **Interação 9,0:** Slide de síntese e consulta: cada método é link ao slide de origem (23, 29, 34, 36) e a leitura liga ao 39; a regra permite navegação como interação em consulta.
- **Rigor 8,0:** Coluna 'Combinação' diz 'Maioria' para bagging e floresta, mas os números 0,904 e 0,912 vêm de BaggingClassifier e RandomForestClassifier do scikit-learn, que fazem a média das probabilidades; e a leitura 'a diversidade ajuda' se apoia em 113 contra 107 acertos em 125: no pareamento, o bagging acerta 12 pontos que a árvore erra e erra 6 que ela acerta (McNemar exato p ≈ 0,24, calculado de base.json).
- **Acess. 10,0:** axe sem violações; teclado, foco e movimento reduzido conferidos

### 39. Como um classificador vira uma decisão de corte? (c12p39)

- **Layout 9,4:** auditoria 9.40 em 1920 × 1080 e 9.40 em 1400 × 900; varredura limpa nos cenários medidos
- **Legib. 9,0:** menor fonte 1.73% da altura (i:corte <)
- **Beleza 8,0:** 39-c12p39-1920x1080-palco.png: duas navegações disputam o mesmo quadro (os três pratos com links para 42, 41 e 47, fora de ordem, e a faixa 'Neste bloco' com 40, 41, 45, 46); os cartões dos pratos têm cerca de um terço de área vazia entre o texto e 'slide 42'.
- **Didática 9,0:** Pergunta do bloco no título; leitura com os números do caso ('82.458 contratos e 7,1% de maus; o corte pode remover menos de 10%') e ligação ao slide 40; a barra mostra 7,1% de maus contra o limite de 10%.
- **Interação 9,0:** Slide de abertura de bloco: pratos e passos são links (LinkSlide) para os slides 40 a 47; sem estado a restaurar, como declarado no cabeçalho de s39.
- **Rigor 8,0:** A legenda define 'mau: não paga as primeiras parcelas', o título do slide 40 diz 'quem não paga nenhuma parcela' e a fonte (HZ.curto.def em b4.ts) diz 'atraso nas três primeiras parcelas'; são três definições diferentes do mesmo alvo target_never_paid.
- **Acess. 10,0:** axe sem violações; teclado, foco e movimento reduzido conferidos

### 40. O caso: identificar quem não paga nenhuma parcela (c12p40)

- **Layout 9,1:** auditoria 9.10 em 1920 × 1080 e 9.10 em 1400 × 900; varredura limpa nos cenários medidos
- **Legib. 9,0:** menor fonte 1.73% da altura (dt:Problema)
- **Beleza 8,0:** 40-c12p40-1920x1080-palco.png: no estado inicial, o painel de ligação ocupa 920 px de largura com três linhas de botões e cerca de 200 px vazios abaixo; o painel esquerdo é texto em três cartões, com cara de documento.
- **Didática 9,0:** Ligação exigência → métrica antes de revelar, com retorno que nomeia a confusão em cada alternativa errada ('Recall é uma parcela dos maus, não da população: confunde os denominadores') e 'Tentar outra'; leitura liga aos slides 41, 45 e 47.
- **Interação 9,0:** Três grupos de botões com retorno, 'Tentar outra' por linha e Restaurar (s40, INICIAL); a leitura muda com o número de ligações certas.
- **Rigor 8,0:** 'Proposta do material: ... grupo de corte com mais de 60% de maus; rating A com 5%' aparece sem denominador ao lado de um caso de 7,1% de maus em que nenhuma regra passa de 22,7% de maus no corte (só no longo prazo a política chega a 61,6%); '5%' não diz de quê. Além disso, o título 'não paga nenhuma parcela' diverge da fonte 'atraso nas três primeiras parcelas'.
- **Acess. 10,0:** axe sem violações; teclado, foco e movimento reduzido conferidos

### 41. Fora do tempo: treinar no passado, testar no futuro (c12p41)

- **Layout 9,4:** auditoria 9.40 em 1920 × 1080 e 9.40 em 1400 × 900; varredura limpa nos cenários medidos
- **Legib. 9,0:** menor fonte 1.73% da altura (span:Leitura)
- **Beleza 9,0:** 41-c12p41-1920x1080-palco.png: o esquema de 12 safras domina, treino em azul com ● e validação hachurada em verde com ■, chaves e marcos sem sobreposição; a previsão ocupa o painel lateral.
- **Didática 9,0:** Previsão 'Por que não sortear a validação?' com resultado escondido, retorno que nomeia a confusão ('Confunde quantidade com período'), modo 'Sorteada' liberado só no acerto e leitura que liga ao slide 42.
- **Interação 9,0:** Controle do início da validação (3 a 10 safras) muda o esquema e a leitura; no acerto, o seletor Sorteada conta as safras 'antes' (mulberry32, semente 41); Restaurar volta a 8 de 12 (capturas b4e/c12p41-sorteio, min, max).
- **Rigor 9,0:** Fonte declara 'esquema ilustrativo, sem datas nem dados do caso' e a semente 41; nenhum número do caso é usado; retorno C correto ('em média, o sorteio preserva a taxa de maus').
- **Acess. 10,0:** axe sem violações; teclado, foco e movimento reduzido conferidos

### 42. Fora do tempo, os três modelos do caso perdem discriminação (c12p42)

- **Layout 9,1:** auditoria 9.10 em 1920 × 1080 e 9.10 em 1400 × 900; varredura limpa nos cenários medidos
- **Legib. 9,0:** menor fonte 1.73% da altura (span:Leitura)
- **Beleza 8,0:** 42-c12p42-1920x1080-palco.png: o rótulo '−22,5%' do haltere BVS cruza a linha do eixo x; os modelos não selecionados ficam com opacidade 0,6 (texto apagado) e a tabela abaixo repete os seis números do gráfico; o painel lateral tem metade vazia.
- **Didática 9,0:** Título afirmativo, leitura com os números ('Quedas de 5,9% e 8,9% na AUC contrastam com 22,5%') e ligação ao slide 43; a nota do painel desmonta a confusão de régua ('a variação relativa depende da régua').
- **Interação 9,0:** Seletor AUC ou Gini troca a régua e as variações (−22,5% vira −56,3% no BVS, b4e/c12p42-gini); clique no modelo atualiza o painel; Restaurar volta a AUC com BVS em foco.
- **Rigor 8,0:** O título 'Fora do tempo, todo modelo perde discriminação' generaliza a partir de três modelos de um caso; a fonte não traz o tamanho das amostras de treino e de validação nem o período, e as quedas de 5,9% e 8,9% aparecem sem intervalo.
- **Acess. 10,0:** axe sem violações; teclado, foco e movimento reduzido conferidos

### 43. Fora do tempo, as faixas de score se aproximam (c12p43)

- **Layout 9,1:** auditoria 9.10 em 1920 × 1080 e 9.10 em 1400 × 900; varredura limpa nos cenários medidos
- **Legib. 9,0:** menor fonte 1.73% da altura (b:Train / Treino)
- **Beleza **7,0**:** corr2/c12p43-1920x1080-palco.png: a figura original ganhou largura (x 260 a 1210) e domina; a chave em português (Train/Treino, Validation/Validacao, Bad Rate, fx_SCORE, True/False Positive Rate) resolve a leitura. Continuam duas falhas da rubrica: cor fora do papel (validação em laranja na ROC e verde nas barras, fundo cinza do matplotlib, a ponto de a chave precisar explicar as cores) e área morta no painel de previsão, cerca de 145 px entre o fim da alternativa C (y≈630) e Restaurar (y≈775); os retornos (s43-sobreajuste.tsx, linhas 18 a 20) têm duas ou três linhas no painel mais estreito e não preenchem o vão. Corrigir: Colocar Restaurar logo abaixo da alternativa C e do retorno (não preso ao rodapé do painel) e encurtar o painel ao conteúdo, ou subir a figura e o painel juntos. Com a figura original obrigatória, a cor fora do papel deixa o teto em 8, salvo se for registrada como exceção declarada de fidelidade ao material.
- **Didática 8,0:** O subtítulo já responde ('na validação, a escada achata') e as barras verdes da validação estão visíveis antes da previsão; a pergunta é contrafactual e a alternativa certa se denuncia ('como no treino').
- **Interação 8,0:** Depois do acerto, o seletor 'Taxa por faixa' ou 'Curva ROC' só troca um parágrafo pronto (LEITURA em s43); a figura não muda.
- **Rigor 8,0:** O título afirma 'Sobreajuste:' como diagnóstico, enquanto o slide seguinte mostra que a mesma figura é compatível com mudança na população (a faixa 0 sobe de cerca de 1% para 16%, mudança de nível); a fonte não informa n por faixa nem período.
- **Acess. 10,0:** axe sem violações; teclado, foco e movimento reduzido conferidos

### 44. Sobreajuste ou mudança na população? Que evidência separa as hipóteses? (c12p44)

- **Layout 9,1:** auditoria 9.10 em 1920 × 1080 e 9.10 em 1400 × 900; varredura limpa nos cenários medidos
- **Legib. 9,0:** menor fonte 1.73% da altura (span:Leitura)
- **Beleza 8,0:** 44-c12p44-1920x1080-palco.png: a coluna 'Apoia sobreajuste' usa vinho, cor reservada ao default; no estado inicial as três colunas tracejadas ficam vazias (cerca de 300 px de altura) e o painel direito tem um vão entre as opções e a nota.
- **Didática 8,0:** A leitura final ('2 evidências apontam para sobreajuste, 3 para mudança na população e 1 não separa', b4e/c12p44-todas) conta o gabarito como se fosse resultado do caso e fala em 'as duas checagens' sem dizê-las.
- **Interação 9,0:** Seis evidências a classificar em três colunas, retorno por alternativa, 'Tentar outra', 'Próxima evidência' e Restaurar (s44); o cartão desce para a coluna certa.
- **Rigor 8,0:** Evidência e1 ('Queda muito maior no modelo complexo que nos simples, na mesma janela') vem com 'se só o complexo cai, a causa está nele: decorou o treino'; um modelo que usa variáveis que mudaram também cai mais sob mudança na população, sem sobreajuste.
- **Acess. 10,0:** axe sem violações; teclado, foco e movimento reduzido conferidos

### 45. Três regras de corte: onde ficam os maus (c12p45)

- **Layout 9,1:** auditoria 9.10 em 1920 × 1080 e 9.10 em 1400 × 900; varredura limpa nos cenários medidos
- **Legib. 9,0:** menor fonte 1.73% da altura (span:Leitura)
- **Beleza 8,0:** 45-c12p45-1920x1080-palco.png: os rótulos '6,0%', '5,7%' e '5,1%' são cortados pela linha tracejada da taxa da base (7,1%); as regras não selecionadas ficam com opacidade 0,55 e a tabela da direita repete os números do gráfico.
- **Didática 8,0:** O título 'onde ficam os maus' é respondido só com taxas; o subtítulo 'Todas concentram os maus no grupo removido' pode ser lido como captura, quando 61% a 79% dos maus ficam no grupo mantido (recall de 21,2% a 38,9%, CORTE.curto): é a confusão precisão contra recall que o slide 40 ensinou.
- **Interação 9,0:** Seletor Curto prazo ou Longo prazo troca barras, escala e leitura (b4e/c12p45-longo); clique na regra muda o painel '3,8× a taxa'; Restaurar volta a curto prazo com a política.
- **Rigor 9,0:** Números conferidos com avaliaCorte sobre base.json: 22,7%/6,0%, 18,0%/5,7%, 17,8%/5,1% no curto prazo e 61,6%, 53,9%, 54,0% no longo; fonte com alvos, 82.458 contratos e 61.138 classificados e 'sem efeito causal'.
- **Acess. 10,0:** axe sem violações; teclado, foco e movimento reduzido conferidos

### 46. Cada métrica da aula responde a uma pergunta do comitê (c12p46)

- **Layout 9,1:** auditoria 9.10 em 1920 × 1080 e 9.10 em 1400 × 900; varredura limpa nos cenários medidos
- **Legib. 9,0:** menor fonte 1.73% da altura (span:Leitura)
- **Beleza 9,0:** 46-c12p46-1920x1080-palco.png: tabela de cinco métricas domina, linha selecionada destacada, cartão lateral com pergunta, conta e os dois exemplos; sem sobreposição.
- **Didática 9,0:** Leitura que faz a distinção nova do slide ('Precisão, recall e volume medem o mesmo grupo recusado; AUC e validação fora do tempo julgam o score antes do corte') e liga ao 47; cada métrica liga ao slide em que nasceu.
- **Interação 9,0:** Slide de consulta: o clique na métrica troca conta, exemplo do detector e do caso, e o link 'Nasceu no slide 12' (13, 21, 41, 40) navega; Restaurar volta à precisão.
- **Rigor 9,0:** Precisão 83,7% e recall 65,1% do detector (M_SGD), AUC do detector de AUC_SGD, quedas de 5,9% a 22,5% de AUC_TEMPO; contas corretas e mau como classe positiva declarado.
- **Acess. 10,0:** axe sem violações; teclado, foco e movimento reduzido conferidos

### 47. Política, modelo ou os dois: qual regra você levaria ao comitê? (c12p47)

- **Layout 9,6:** auditoria 9.60 em 1920 × 1080 e 9.60 em 1400 × 900; varredura limpa nos cenários medidos
- **Legib. 9,0:** menor fonte 1.73% da altura (span:Leitura)
- **Beleza 8,0:** b4e/c12p47-d-1920x1080-palco.png (mesmo código do final): o rótulo 'Política BACEN' começa no ponto em 6,6% e atravessa a linha tracejada da meta de 10%; os três pontos estão no mesmo azul escuro.
- **Didática 9,0:** Escolha antes de revelar, com o gráfico vazio até a tentativa (47-c12p47-1920x1080-palco.png), retorno por alternativa e 'Tentar outra'; leitura com os números ('38,9% contra 21,2%, 1,8×, mas recusa 15,6%') e ligação ao 48.
- **Interação 9,0:** Previsão revela pontos e tabela; seletor de horizonte troca pontos, tabela e leitura; Restaurar volta à previsão aberta no curto prazo.
- **Rigor 8,0:** O erro conceitual saiu: o retorno de Never Paid diz que 11,7% é o corte do material e que subir o limiar reduziria o volume, sem recall conhecido nesse corte; a alternativa certa usa a razão de equilíbrio das contagens do caso (conjunta: 6.325 bons a mais para 1.036 maus a menos, 6,1; Never Paid: 3.691 para 489, 7,5, conferidos em CASO.curto.regras), ligada ao c do slide 16. Resta uma frase que generaliza: a leitura do longo prazo (s47, ramo h ≠ curto) diz 'só a política cumpre a meta' sem a ressalva 'no corte do material' que o curto prazo tem; e o retorno da alternativa certa diz que a conjunta 'vence a política' acima de 6,1 sem lembrar que ela recusa 15,6%, fora da meta de 10%.
- **Acess. 10,0:** axe sem violações; teclado, foco e movimento reduzido conferidos

### 48. Síntese da aula: quatro perguntas, quatro respostas (c12p48)

- **Layout 9,1:** auditoria 9.10 em 1920 × 1080 e 9.10 em 1400 × 900; varredura limpa nos cenários medidos
- **Legib. 9,0:** menor fonte 1.73% da altura (span:Leitura)
- **Beleza 8,0:** 48-c12p48-1920x1080-palco.png: o painel 'Crédito: o que ainda falta' tem texto até cerca de 470 px e fica vazio até o botão Restaurar em 775 px, mais da metade da área.
- **Didática 9,0:** Quatro linhas, uma por bloco, cada uma com o número que a sustenta; leitura 'cada bloco deixou um número e uma lacuna' e ligação ao slide 49.
- **Interação 9,0:** Slide de síntese: o clique na linha troca a lacuna e o link 'Rever o bloco' (slides 2, 9, 22, 39); Restaurar volta a Crédito.
- **Rigor 8,0:** A linha Ensembles prova 'A combinação explora a diversidade de erros' com 114 contra 111 acertos em 125; no pareamento, o voto suave acerta 4 pontos que o SVC erra e erra 1 que ele acerta (McNemar exato p ≈ 0,38, calculado de base.json): a diferença não se distingue do acaso.
- **Acess. 10,0:** axe sem violações; teclado, foco e movimento reduzido conferidos

### 49. De volta à pergunta de abertura (c12p49)

- **Layout 9,1:** auditoria 9.10 em 1920 × 1080 e 9.10 em 1400 × 900; varredura limpa nos cenários medidos
- **Legib. 9,0:** menor fonte 1.73% da altura (span:Leitura)
- **Beleza 8,0:** 49-c12p49-1920x1080-palco.png: no estado inicial, o painel direito tem a resposta e o botão 'Abrir as 10.000 imagens de teste' até cerca de 470 px e fica vazio até Restaurar em 745 px.
- **Didática 9,0:** Volta à pergunta do slide 1 com a resposta da turma (useRespostaAbertura) e veredito por alternativa; três critérios com o número e o slide que os provou; leitura com 91,0% e −22,5%.
- **Interação 9,0:** Clique nos critérios troca o detalhe e os links; o botão abre o teste guardado desde o slide 7 (94,9% contra 91,1%, precisão 66,2%, recall 88,0%, conferidos em base.json); Restaurar fecha o teste e volta ao critério 1.
- **Rigor 9,0:** TESTE e TRIVIAL_TESTE de dados.ts; nota 'Não diz: a troca entre erros mudou' honesta (66,2% e 88,0% no teste contra 83,7% e 65,1% na validação cruzada); fonte com MNIST, semente e versão.
- **Acess. 10,0:** axe sem violações; teclado, foco e movimento reduzido conferidos

### 50. Apêndice: dados do caso no curto e no longo prazo (c12p50)

- **Layout 8,0:** auditoria 8.80 em 1920 × 1080 e 8.80 em 1400 × 900; varredura: 1920x1080:palco corte em 2 elemento(s); 1920x1080:palco corte em 2 elemento(s); 1366x768:palco corte em 2 elemento(s)
- **Legib. 9,0:** menor fonte 1.73% da altura (span:Leitura)
- **Beleza 8,0:** 50-c12p50-1920x1080-palco.png: na régua de IV, a linha vertical de 0,240 corta o rótulo '▲ 0,248' e a linha de 0,347 corta a palavra 'forte'; o painel da régua tem cerca de 100 px vazios entre a régua e as notas.
- **Didática 9,0:** Apêndice com leitura que usa os números ('5.865 maus entre 82.458 classificados (7,1%)... lidera o recall (38,9%) e recusa 15,6%') e nota que explica os 425 contratos sem classificação no longo prazo.
- **Interação 9,0:** Seletor de horizonte troca as duas tabelas, a régua e a leitura; Restaurar volta ao curto prazo.
- **Rigor 9,0:** WoE e IV recalculados conferem: WoE −1,35 e 0,18 na política, IV 0,240, 0,248 e 0,347 (b4.ts confere contra o declarado com tolerância 0,0015); fonte com fórmulas de WoE e IV.
- **Acess. 10,0:** axe sem violações; teclado, foco e movimento reduzido conferidos

### 51. Apêndice: volume e taxa de maus por safra no exemplo de sobreajuste (c12p51)

- **Layout 8,8:** auditoria 8.80 em 1920 × 1080 e 8.80 em 1400 × 900; varredura limpa nos cenários medidos
- **Legib. 9,0:** menor fonte 1.73% da altura (b:safra)
- **Beleza **7,0**:** corr2/c12p51-1920x1080-palco.png: a peça principal ocupa agora x 260 a 1305 e domina; o painel lateral estreito está cheio (alternância, título, leitura, links), sem área morta relevante; a chave em português (safra, fx_SCORE 0 a 5, esquerda, direita, linha azul) resolve os rótulos em inglês. As duas falhas restantes estão dentro da figura raster: cor fora do papel (paleta categórica padrão do matplotlib para faixas ordinais: 0 azul, 1 verde, 2 vermelho, 3 roxo, 4 amarelo, 5 ciano, sem escala sequencial de risco; o azul da faixa 0 ainda se confunde com a 'linha azul' da chave) e rótulo sobreposto (no gráfico da direita, a linha ciano da faixa 5 atravessa a legenda sobre os itens '3.0' e '4.0' entre Aug e Oct, recorte x 1150 a 1290, y 270 a 410). Corrigir: Sem redesenho, o teto é este: as duas falhas estão no raster. Para subir, redesenhar de forma nativa ao lado da original ou numa alternância 'Figura original / Redesenho' (faixas 0 a 5 em escala sequencial de risco, rótulo direto no fim de cada linha em vez de legenda, meses em português, linha tracejada nomeada 'início fora do tempo'); ou, se o professor aceitar, registrar a figura como exceção declarada de fidelidade, o que leva a 8.
- **Didática 9,0:** Subtítulo afirmativo; leitura cautelosa com os números ('a AUC cai de 0,832 para 0,645. Subida que começa antes da linha também é compatível com mudança na população') e links de volta aos slides 43 e 44.
- **Interação 9,0:** Apêndice de consulta: o seletor Taxa de maus ou Volume troca a leitura descritiva de cada metade e os links levam aos slides 43 e 44; Restaurar volta à taxa.
- **Rigor 9,0:** A leitura confere com a figura: faixas 0, 1 e 2 sobem a partir de julho, antes da linha de agosto, e a faixa 5 cai de cerca de 0,69 para 0,48; fonte declara período (dezembro de 2018 a outubro de 2019) e que é leitura sem os valores.
- **Acess. 10,0:** axe sem violações; teclado, foco e movimento reduzido conferidos

### 52. Apêndice: referências e métodos além da aula (c12p52)

- **Layout 9,1:** auditoria 9.10 em 1920 × 1080 e 9.10 em 1400 × 900; varredura limpa nos cenários medidos
- **Legib. 9,0:** menor fonte 1.73% da altura (span:Hands-On Machine Learning with)
- **Beleza 9,0:** 52-c12p52-1920x1080-palco.png: grade de duas colunas com autor, obra, o que resolve e slides; abas por grupo; sem sobreposição.
- **Didática 9,0:** Cada referência diz o que resolve e onde aparece na aula ('Na aula: slide 19, slide 20, slide 21'); grupo 'Além da aula' com quando usar.
- **Interação 9,0:** Slide de consulta: abas Métricas, Ensembles, Crédito, Além da aula filtram a lista e os links levam aos slides; Restaurar volta a Métricas.
- **Rigor 8,0:** Falta a referência primária do item essencial E2 do estado da arte (Hastie, Tibshirani e Friedman, 2009, cap. 7: treino e teste, validação cruzada), que não aparece em nenhum arquivo do capítulo (grep sem resultado); e Géron é citado na 3ª edição em inglês aqui e como 'Mãos à obra' (tradução) no crédito do slide 37.
- **Acess. 10,0:** axe sem violações; teclado, foco e movimento reduzido conferidos

## Exceções declaradas da varredura

- *, 390x844:estudo: tabelas e réguas largas rolam no próprio contêiner no celular

## Fontes das medidas

- a1920: `tmp/ux/auditoria-c12-1920.json`
- a1400: `tmp/ux/auditoria-c12-1400.json`
- varredura: `tmp/shots/final12/relatorio.json`
- axe: `tmp/axe12.json`
- funcional: `tmp/funcional-c12.txt`
- avaliacao: `docs/capitulo12/avaliacao.json`
