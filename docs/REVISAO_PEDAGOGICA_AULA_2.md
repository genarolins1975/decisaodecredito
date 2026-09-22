# Revisão pedagógica da Aula 2

22/09/2026. Leitura da aula como professor, não como auditor de software: o que o aluno consegue fazer ao fim de cada página, se a evidência para isso está na tela, e se a pergunta que mede o entendimento tem objeto.

O escopo é a Aula 2, "Entender as três técnicas": capítulos 4, 5 e 6 do material (60 páginas, 21 delas essenciais, 165 minutos) e os 50 slides que a apresentam. Quatro leituras independentes cobriram os três capítulos e os slides contra as páginas. Cada achado foi reconferido por conta própria antes de virar correção; o que não sobreviveu à conferência não foi implementado.

## 1. Como cada número foi conferido

Fonte dos dados: `src/lib/visuais/did.json` (as 16 propostas didáticas), `content/generated/dados.json` (gerador Python, seção `DID` e a grade `grid`) e `aula_credito_html/app/dados/` (miniaturas do baralho). As contas foram refeitas fora do material, em Python e em Node, e comparadas com o que a tela exibe.

## 2. Erros de fato corrigidos

### 2.1 As propostas do lado errado da reta

O material afirmava, em quatro lugares, que "a #1 e a #15 ficam do lado errado em qualquer posição da reta": na resposta modelo de c4p19, na de c4p15, na condução e na nota visível de c5p2, e nas explicações da apostila de c04 e c05.

As duas partes da frase são falsas. Com os coeficientes do capítulo (β₀ = −5,6666, β₁ = 0,7453, β₂ = 1,3955), a #1 tem utilização 20%, atraso 25 dias, PD de 33,46% e não deu default: no corte de 50% ela é aprovada e está do lado certo. E nenhuma proposta erra em todo corte: varrendo o corte de 0,1% a 99,9%, o conjunto de erradas muda. No corte de 50% erram quatro, #2 (PD 26,65%, deu default), #5 (52,64%, pagou), #10 (30,53%, deu default) e #15 (73,91%, pagou); o melhor corte, em 52,7%, deixa três: #2, #10 e #15.

O mecanismo verdadeiro é outro, e é mais instrutivo: o par que impede qualquer corte perfeito é #15 contra #2, porque a #2 deu default e pontua abaixo da #15, que pagou. É isso que nenhuma reta resolve.

### 2.2 As duas margens da raiz da árvore

O material dizia que o segundo colocado na raiz tem ganho de 0,07143, com margem de quase quatro vezes, e a figura ao lado exibia o segundo em 0,19841. Os 21 candidatos, recalculados: 0,28125 (utilização ≤ 57,5%), depois 0,19841 (utilização ≤ 52,5% e ≤ 62,5%, empatados), 0,13333, 0,08182, e só então 0,07143, que é o melhor corte de atraso.

São duas margens diferentes e elas respondem a perguntas diferentes. Sobre o corte vizinho, 1,4 vez: decide o ponto de corte e é apertada. Sobre a outra variável, quase quatro vezes: decide a variável da raiz e é folgada, e é ela que faz a raiz resistir à retirada de qualquer uma das dezesseis propostas (conferido nas 16 retiradas). O texto agora nomeia as duas.

### 2.3 A linha de M na tabela de hiperparâmetros

c6p15 dizia que M é "o freio contra o sobreajuste, e o único que precisa ser escolhido observando amostra fora do treino". A resposta modelo da mesma página diz "Todos, rigorosamente". O aluno lia a tabela, respondia M e era corrigido pela própria página. Além da contradição, a afirmação é errada duas vezes: M é o acelerador, não o freio, e os outros três também se escolhem fora do treino.

### 2.4 O pico de sensibilidade da PD

c4p12 dizia, na resposta modelo e no guia, que a sensibilidade é máxima perto de PD de 50%. O componente que a própria página renderiza exibe o contrário: "o maior impacto ocorre perto de uma PD inicial de 40,8%, com aumento de aproximadamente 18,42 pp". Os dois estão certos sobre coisas diferentes: a inclinação local p(1 − p) é máxima em 50%, mas para o aumento finito desta página, Δz = 0,7453, o máximo do deslocamento está em p* = 1 ÷ (1 + √m) = 40,8%, com +18,42 pontos contra +17,82 partindo de 50%. A resposta agora separa as duas leituras.

## 3. Lacunas estruturais fechadas

| Onde | O que faltava | O que entrou |
|---|---|---|
| c6p13 (essencial) | O objetivo cobra "o procedimento de cinco linhas", que não estava escrito em lugar nenhum, e a página abre uma tabela com F em log odds sem nunca ter dito que F vive em log odds | Caixa de cinco linhas no topo: F₀ = ln(π ÷ (1 − π)), p = σ(F), alvo r = y − p, árvore rasa sobre r, F ← F + η × h. Com a ressalva de que a folha recebe a média do gradiente negativo, sem passo de Newton |
| c6p6 (essencial) | A página já aplicava η, que só c6p7 explica, e anunciava "somar o toco inteiro tem um problema" sem nunca somar o toco inteiro | Fecha somando a correção inteira: x = 8 vai a 9,375 contra 12,00 observado, e a mesma correção derruba x = 5 de +1,50 para −1,375. Cinco dos oito resíduos trocam de sinal. η voltou para c6p7 |
| c6p7, c6p13, c6p16 (duas essenciais) | Quatro curvas de erro que só descem, nenhuma nomeada como treino, e uma comparação entre boosting e logística feita sobre a amostra de ajuste | Todo rótulo diz "de treino", e c6p13 passou a dizer por que essa comparação não decide nada |
| c6p5 (essencial) | F₀ = 6,50 nunca construído, e "erro" nomeando tanto o resíduo do momento quanto o erro do modelo pronto | A soma dos oito y dividida por 8, com o argumento de que a média minimiza erro quadrático, e a distinção explícita: +5,50 é o que falta agora, 1,14 é o que sobra depois das quatro árvores |
| c6p17 (essencial) | Seis linhas no gráfico, treino e fora do tempo, e nenhuma de validação, que é a que escolhe a configuração | Terceira família de linhas, pontilhada, com a AUC de validação e a escolhida marcada em 60 árvores e 8 folhas. A leitura direta passou a registrar que com 4 folhas o fora do tempo ainda sobe de 60 para 100 árvores antes de cair |
| c6p10 (essencial) | η descrito como "quanto confiar nesta etapa", o que confirma a imagem de peso por árvore | "O mesmo fator em todas as etapas, escolhido antes do treino", com a linha que desfaz o equívoco |
| c5p4 (essencial) | O Gini apresentado como probabilidade de errar, sem nunca distinguir impureza de taxa de erro | Terceira curva, mín(p, 1 − p), e o contraexemplo desta base: o segundo nível derruba o Gini de 0,21875 para 0,12500 sem tirar um único erro, que continua em 2 nas dezesseis |
| c5p9 | "O algoritmo é guloso" como afirmação inverificável pelo aluno | O contraexemplo desta base: a raiz utilização ≤ 27,5%, com ganho imediato de exatamente zero, termina em impureza 0,10938 contra 0,12500 da gulosa. Com a ressalva de que o contraexemplo depende do mínimo por folha igual a 1 |
| c5p10 (essencial) | O objetivo promete interpretar a taxa junto com o tamanho, e "instável" nunca virava número | O intervalo de Wilson na tela, 9,5% a 90,5%, e a pergunta estendida para o que a folha autoriza a afirmar |
| c5p18 (essencial) | "árvore 0%" e "árvore 100%" sem o n da folha, contra a regra que o próprio capítulo estabelece | n e intervalo de cada folha na comparação |
| c5p3 (essencial) | O objetivo é "profundidade conta divisões, não nós" e a pergunta media contagem de folhas | A pergunta passou a medir profundidade, com a contagem de folhas confirmando a partição |
| c5p17 | Os cortes de atraso em 15 e 27,5 dias empatam exatamente em 0,07143 por Gini, e a tabela apresentava 27,5 como escolha do critério | Nota registrando o empate e dizendo que quem desempata é a entropia |

## 4. Os slides

| Slide | O que mudou e por quê |
|---|---|
| 50 | O fecho pedia a comparação dos três modelos e mostrava as mesmas fichas de entrada do slide 02. A tabela existia calculada em `pd_modelos_calibrada` e só era usada no material impresso. Agora está na tela: Ana 3,06 / 5,62 / 5,49; Bruno 35,09 / 24,00 / 25,78; Carla 14,21 / 17,80 / 19,56; Diego 68,51 / 60,61 / 64,91, com a decisão no corte de 20%. A lição está no resultado: os três concordam na decisão dos quatro e discordam em até 11,1 pontos de PD, e Carla fica a 0,44 ponto do corte no boosting |
| 34, 36, 42 | Os quatro clientes aparecem no problema, em todo o logit e em toda a árvore, e somem entre 31 e 42. Com o corte da miniatura em comprometimento 40, Ana (22) e Bruno (38) caem no grupo A e Carla (48) e Diego (55) no B. As folhas passaram a dizer isso, o seletor do 36 nomeia quem está onde, e o exercício do 42 passou a ser sobre Carla. Ganho extra: Ana e Bruno recebem a mesma PD, o que motiva sozinho por que duas árvores não bastam |
| 26 | O objetivo de c5p18 é comparar fronteira suave com regiões em degraus, e a aula desenhava as duas nos mesmos eixos com nove slides de distância, nunca juntas. Um botão agora troca o mapa de regiões por um gráfico de PD por comprometimento com os degraus da árvore e as duas curvas do logit, e os quatro clientes plotados |
| 19 | O painel maior era a terceira repetição do mesmo organograma sem números, e a nota de aprofundar prometia uma comparação de fronteiras que não existia em lugar nenhum. Entrou a evidência que a própria pergunta de diagnóstico pede: risco por faixa de comprometimento com as duas curvas do logit, e faixas que mudam com a situação selecionada, declaradas como ilustrativas. A promessa da nota passou a apontar para o slide 26, onde a comparação agora existe |
| 30 | O logit tem o slide 19 e o boosting tem o 40; a árvore não tinha equivalente, e o aluno saía com critério explícito para duas técnicas de três. O painel foi escrito, mas a revisão de layout da rodada seguinte mostrou que ele não cabe em nenhuma tela do bloco com o exercício revelado, em nenhuma resolução: o critério ficou nas notas do professor do slide 30, que alimentam o painel ao vivo e os dois guias em PDF, onde os critérios dos outros dois blocos também são detalhados |
| 36 | A miniatura rodava presa em η igual a 1, e o slide 37 cobra justamente que multiplicar as contribuições no fim não reproduz outro treinamento. Agora há um seletor de dois valores: com η de 0,40 as mesmas duas árvores dão 17,6347% no grupo A e 22,5912% no B, contra 14,7267% e 26,4985% com η igual a 1 |
| 07, 24, 33 | Os números dos slides e os das páginas vêm de exemplos diferentes, e isso só estava reconciliado no bloco do logit. Três notas de aprofundar passaram a dizer qual é qual: comprometimento com β 0,40 e razão de chances 1,49 nos slides contra utilização com β 0,7453 e 2,11 nas páginas; raiz de mil contratos a 10% com ganho 0,020 contra dezesseis propostas a 50% com ganho 0,28125; miniatura de dez registros contra a base de dezesseis com η de 0,40 |
| ritmo | A proposta era 25 / 45 / 35 / 35 / 25, com boosting e árvore no mesmo tempo. Somando os minutos das páginas essenciais: capítulo 4 pede 49, capítulo 5 pede 49 e capítulo 6 pede 67. O conteúdo declara o boosting como o mais pesado por larga margem. A proposta passou a 20 / 45 / 33 / 39 / 28, somando os mesmos 165 |

## 5. O veredito que faltava

Das 21 páginas essenciais da aula, 18 tinham apenas a pergunta aberta de checagem, cuja resposta modelo aparece ao clicar em Conferir sem que nada seja avaliado. Só c4p10, c6p17 e, depois do piloto, c6p6 tinham pergunta de múltipla escolha com gabarito, que é o que conta em `/acompanhamento`. O aluno que estudava sozinho podia percorrer a aula inteira sem nunca saber se entendeu.

`content/questoes-curadas.json` traz dezesseis perguntas novas, no mesmo formato das que vêm do material original: uma alternativa certa, dois distratores que são o equívoco real do aluno, e um diagnóstico por alternativa errada com confusão, conceito, o que você escolheu e o que seria adequado. Os distratores não foram inventados: saíram dos erros previstos no guia do professor de cada página, que o material já carregava para uso em sala.

Agora 18 das 21 essenciais têm veredito. As três sem são as aberturas de capítulo (c4p1, c5p1, c6p1), páginas de quatro minutos que mapeiam o capítulo; um veredito ali não mediria nada.

A plataforma foi ajustada para isso: `getPage` passou a carregar todas as questões da página, e não só as ancoradas em bloco, e a página de aula mostra as não ancoradas depois do conteúdo e antes da pergunta aberta. O aluno que erra recebe a recuperação em duas etapas antes de poder ver a resposta, como nas demais questões do curso.

## 6. O que não foi feito

Não foi feita validação com alunos, e nenhum número desta revisão vem de teste em sala: as faixas observadas do slide 19 são ilustrativas e estão declaradas como tais na tela. O ritmo por bloco continua sendo proposta, não medição. Os capítulos 1 a 3 e 7 a 11 não foram revistos; o mesmo tipo de leitura provavelmente encontraria achados equivalentes neles, em especial a ausência de veredito nas páginas essenciais, que é convenção do curso inteiro e não da Aula 2.

## 7. Como verificar

```bash
node scripts/content/extract.mjs && node scripts/content/build-legacy.mjs
npm run content:import -- --republish
node aula_credito_html/build.mjs && node aula_credito_html/qa.mjs
node aula_credito_html/material.mjs
npm test && npx playwright test
```
