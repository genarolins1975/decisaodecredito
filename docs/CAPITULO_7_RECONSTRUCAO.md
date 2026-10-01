# Capítulo 7 reconstruído: avaliação, calibração, decisão e validação

Registro do trabalho de reconstrução integral do capítulo 7 (Aula 3), pedido em 1º de outubro de 2026. Este arquivo é o plano curto exigido antes da implementação, o mapeamento do capítulo antigo para o novo e o índice dos demais registros (dados, verificação e rubrica).

## 1. Como o capítulo é produzido na plataforma

| Etapa | Onde | O que faz |
|---|---|---|
| Fonte do roteiro | `content/original/apresentacao-curso-pd.html`, camada `capitulo7ReconstruidoV18()` | título, objetivo, apoio, conexão, nível, minutos, ordem (`n`) e guia do professor de cada página; páginas novas entram por `P()` na mesma camada |
| Extração | `node scripts/content/extract.mjs` | renderiza o HTML em Chromium e grava `content/generated/extract.json` |
| Importação | `npm run content:import` | grava páginas, versões e questões; republica só o que mudou e não foi editado pelo painel |
| Quadros nativos | `src/components/capitulo7/*` registrados em `src/components/visuais/registro.tsx` | cada página do capítulo é um quadro 16:9 próprio (`PALCO_PROPRIO`), igual no estudo e na apresentação |
| Cálculo | `src/lib/capitulo7/*` | métricas, dados dos exemplos e roteiro, sem React |
| Questões com veredito | `content/questoes-curadas.json` | correção no servidor, gabarito só depois da tentativa, recuperação por alternativa |
| Referência numérica | `scripts/capitulo7/referencia.py` | recalcula as métricas com scikit-learn 1.9.1, SciPy 1.17.1 e statsmodels 0.15.0 e grava `tests/fixtures/capitulo7-referencia.json`, contra o qual os testes conferem o código TypeScript |

Os endereços das 20 páginas antigas (`/aulas/c7p1` a `/aulas/c7p20`) continuam válidos: nenhuma página foi apagada e nenhum identificador foi reaproveitado para outro assunto. As 18 páginas novas recebem `c7p21` a `c7p38`. A ordem no capítulo é dada pelo número da página (`n`), não pelo identificador.

## 2. Convenções do capítulo

| Item | Convenção | Fonte |
|---|---|---|
| Evento | default = atraso de 90 dias ou mais em até 12 meses após a concessão | c3p10 e `DADOS.meta.horizonte` |
| Codificação | y = 1 é default; y = 0 é adimplente | `DADOS.oot.y` |
| Escala de PD | proporção de 0 a 1, exibida em % | todos os vetores `DADOS.oot.p*` |
| Sentido | PD maior é risco maior; a fila é decrescente em PD | igual ao capítulo 4 |
| Regra de decisão | recusar quando PD ≥ t; aprovar quando PD < t | `matrizConfusao` em `src/lib/visuais/avaliacao.ts` (mesma regra) |
| Positivo | default previsto = proposta recusada pela regra | matriz de confusão |
| Base principal | janela fora do tempo (OOT), safras de 2023-08 a 2023-12, 737 propostas aprovadas, 81 defaults | `DADOS.meta`, `DADOS.oot` |
| Maturação | a última safra (dezembro de 2023) completa 12 meses em dezembro de 2024; data de referência da base 31/01/2025 | `DADOS.meta.data_referencia` |
| População | só propostas aprovadas têm desfecho; a população completa da mesma janela tem prevalência de 17,92% | `DADOS.res.prevalencia` |
| Modelos | logística (`pl`), boosting bruto (`pgr`), boosting recalibrado por Platt (`pg`); PD verdadeira do gerador (`pt`) só existe porque a base é sintética | `DADOS.oot`, docs/03, achado A1 |
| Árvore | não há PD da árvore do capítulo 5 na janela OOT (a base não guarda renda por proposta OOT); a comparação de modelos é entre logística e boosting, e a ausência é declarada no quadro | `DADOS.oot` |

## 3. Inventário do capítulo antigo

Estado extraído em 1º de outubro de 2026 (`content/generated/extract.json`, sha256 da origem `3f3b9fe7…`). "Nativo" é o componente React registrado; "herdado" é HTML do material original.

| ID | n | Título | Objetivo | Componente e interação | Dados | Ligações |
|---|---|---|---|---|---|---|
| c7p1 | 1 | Validação, calibração e teste fora do tempo | protocolo seleção, calibração, congelamento, teste | episódio herdado (três etapas, três telas no palco); infográfico c07 na página do capítulo | números agregados OOT | abre a Aula 3; c6p20 aponta para cá |
| c7p2 | 2 | Acerto de classificação mede a prevalência, não o modelo | acerto dominado pela classe majoritária | `AcertoQueEngana`, controle de corte; questão c7p2q | OOT logística | c8 (corte) |
| c7p3 | 3 | Ordenação e nível de risco | distinguir discriminação de calibração | estático: tabela das quatro combinações e deslocamento de 0,8 em log odds | OOT logística | c4p13 (intercepto) |
| c7p4 | 4 | Ordenar é montar uma fila de risco | ordenação é posição relativa | estático: fila de nove propostas | `FILA_DIDATICA` | c7p5 |
| c7p5 | 5 | AUC é uma contagem de pares | AUC como chance de o default receber risco maior | `Pares`, 20 pares revelados um a um; questão c7p5q | fila didática e OOT | c10p7 |
| c7p6 | 6 | A curva ROC é a consequência de percorrer todos os cortes | cada ponto é um corte | `FilaDeRisco`, controle de corte | OOT logística | c9 |
| c7p7 | 7 | KS é uma distância | KS e ponto de medição | `KsEDecis` modo ks, controle de corte | OOT logística | c9p7 (gatilhos) |
| c7p8 | 8 | Ganho e alavancagem | capacidade de trabalho | `KsEDecis` modo ganho, controle de decis; teste da diferença D2 × D3 | OOT logística e boosting | c8 |
| c7p9 | 9 | Calibração só pode ser verificada em grupos | PD como frequência em grupo | `CalibracaoPorFaixa` modo grupos (três grupos com números escritos à mão, sem origem rastreável) | inline | c2p16 (Wilson) |
| c7p10 | 10 | Compatibilidade entre previsão e frequência, faixa por faixa | intervalo por faixa | `CalibracaoPorFaixa` modo faixas, revelação faixa a faixa | OOT logística | c8, c11p13 |
| c7p11 | 11 | Brier e log loss resumem tudo num número | não isolam calibração | `BrierELogLoss` modo deslocamento; questão c7p11q | OOT logística | c10 |
| c7p12 | 12 | Recalibração e reestimação | recalibrar contra reestimar | `BrierELogLoss` modo recalibrar | OOT logística | c9 |
| c7p13 | 13 | Platt corrige o nível e não pode alterar a ordenação | invariância e empates | estático em três telas; questão c7p13q | OOT boosting bruto e Platt | c9 |
| c7p14 | 14 | A métrica também é uma estatística | AUC por reamostragem | estático em duas telas (400 réplicas, semente 20260501) | OOT logística | c10 |
| c7p15 | 15 | Comparar duas AUCs exige DeLong | diferença correlacionada | estático em quatro telas; questão c7p15q | `DADOS.res.comparacao_auc` | c10p7 |
| c7p16 | 16 | Treino, validação e OOT têm papéis diferentes | papel de cada amostra | `TresAmostras` | `DADOS.res` | c6p17 |
| c7p17 | 17 | O protocolo completo antes de abrir o OOT | congelar antes de testar | estático: oito passos e desempate | texto | c11 (trabalho final) |
| c7p18 | 18 | Cada decisão pede uma evidência diferente | métrica conforme a decisão | `DecisaoEvidencia` | texto | c8, c10 |
| c7p19 | 19 | Métricas que este curso não usa | Gini, F1, acurácia balanceada | estático em duas telas | OOT logística | nenhuma |
| c7p20 | 20 | Síntese: três perguntas de validação | consolidar | síntese nativa (checkpoint) | texto | c8p1 |

Situação medida no palco a 1920×1080 antes da mudança: 32 telas para 20 páginas; seis páginas em mais de uma tela (c7p1 em três, c7p13 em três, c7p15 em quatro); visuais herdados com tabelas e textos competindo por espaço (capturas em `docs/capitulo7/antes/`).

## 4. Matriz do capítulo antigo para o novo

| Página antiga | Conceito | Problema encontrado | Destino |
|---|---|---|---|
| c7p1 | mapa do capítulo | três telas, quatro cartões de texto, sem mapa navegável | **01** infográfico das quatro perguntas, navegável (mesmo ID) |
| c7p2 | prevalência e acurácia | só o corte se move; a prevalência, que é o fenômeno, fica fixa | **03** prevalência controlada, matriz de confusão e previsão antes de revelar (mesmo ID, questão c7p2q mantida) |
| c7p3 | ordenação contra nível | tabela de texto | **04** os mesmos quatro clientes em fila, escala e corte (mesmo ID) |
| c7p4 | fila | nove propostas, PD arredondada sem aviso | **05** fila de 20 propostas reais com revelação dos defaults (mesmo ID) |
| c7p5 | AUC por pares | revelação de pares sem a pergunta probabilística | **06** disputa entre dois clientes com sorteio reprodutível (mesmo ID, questão c7p5q mantida); a conta exata vai para **07** |
| (novo) | AUC exata | não existia matriz completa com empate | **07** c7p22 |
| (novo) | matriz de confusão | denominadores dispersos em três páginas | **08** c7p23 |
| c7p6 | ROC | curva pronta, corte em PD | **09** curva construída corte a corte (mesmo ID) |
| (novo) | limites da AUC | espalhado em c7p3, c7p5 e c7p13 | **10** c7p24 |
| c7p7 | KS | declaração correta, visual denso | **11** acumuladas, ponto de máximo e corte operacional (mesmo ID) |
| c7p8 | ganho, alavancagem e teste D2 × D3 | quatro ideias numa tela | **12** ganho (mesmo ID), **13** lift c7p25; o teste da diferença entre faixas vizinhas vai para **21** |
| (novo) | precisão e recall | ausente | **14** c7p26 |
| (novo) | laboratório | ausente | **15** c7p27 |
| (novo) | transição para nível | ausente | **16** c7p28 |
| c7p9 | PD em grupo | grupos escritos à mão, sem origem | **17** cem propostas da própria janela, amostras repetidas com semente (mesmo ID) |
| (novo) | calibração global | ausente; média certa tratada como prova | **18** c7p29 |
| c7p10 | curva de confiabilidade | gráfico pequeno, painel vazio | **19** curva construída faixa a faixa (mesmo ID) |
| (novo) | agrupamento | faixas sempre por decil, sem discutir a escolha | **20** c7p30 |
| (novo) | Wilson | intervalo só como traço no gráfico | **21** c7p31, com o teste da diferença entre faixas vizinhas (antes em c7p8) |
| (novo) | nível e inclinação | ausente | **22** c7p32 |
| (novo) | Brier | junto com log loss e calibração | **23** c7p33 |
| (novo) | log loss | idem | **24** c7p34 |
| c7p11 | Brier não isola calibração | demonstração por deslocamento | **25** dois modelos, Brier e curvas lado a lado (mesmo ID, questão c7p11q mantida) |
| (novo) | laboratório de recalibração | ausente | **26** c7p35 |
| c7p16 | papéis das amostras | só AUC das três amostras | **27** linha do tempo do protocolo com a amostra de calibração (mesmo ID) |
| c7p12 | recalibrar contra reestimar | deslocamento pela diferença de logits das médias, apresentado como exato | **28** ajuste de intercepto estimado por máxima verossimilhança numa amostra de calibração (mesmo ID); a tabela recalibrar contra reestimar vai para a conclusão |
| c7p13 | Platt | três telas | **29** mecanismo e parâmetros (mesmo ID, questão c7p13q mantida) |
| (novo) | isotônica | ausente | **30** c7p36 |
| (novo) | efeito da recalibração na decisão | ausente | **31** c7p37 |
| c7p18 | decisão e evidência | tabela de texto | **32** simulador econômico com corte de KS contra corte econômico (mesmo ID); a tabela decisão e evidência vai para a conclusão |
| c7p14 | incerteza da métrica | histograma estático | **33** reamostragem pareada da diferença de AUC (mesmo ID) |
| c7p15 | DeLong | quatro telas | **34** comparação justa dos modelos com a tabela enxuta e DeLong (mesmo ID, questão c7p15q mantida) |
| c7p17 | protocolo | tabela de oito passos | **35** congelamento, deriva, segmentos e seleção (mesmo ID) |
| (novo) | caso integrador | ausente | **36** c7p38 |
| c7p20 | síntese | checkpoint sem retomar o mapa | **37** conclusão com o infográfico preenchido e o fluxo de diagnóstico (mesmo ID) |
| c7p19 | métricas fora do protocolo | página solta no meio | **38** apêndice: fórmulas, métricas fora do protocolo e referências (mesmo ID) |

Nenhum conteúdo foi descartado. Duas afirmações antigas foram corrigidas: o deslocamento de c7p12 era a diferença de logits das médias, que não iguala a média recalibrada à taxa observada (o novo c7p12 resolve a equação por máxima verossimilhança), e os três grupos de c7p9 tinham números sem origem (o novo c7p9 usa propostas da janela).

## 5. Roteiro final

Quatro perguntas organizam o capítulo e voltam na abertura, nas transições e na conclusão: **Ordenação** (o modelo põe os mais arriscados antes?), **Probabilidade** (entre os de PD perto de 10%, cerca de 10% dão default?), **Decisão** (como a PD vira ação?) e **Validação** (o resultado se sustenta fora da amostra, no tempo e nos segmentos?).

| # | ID | Pergunta | Título | Nível | Min |
|---|---|---|---|---|---|
| 01 | c7p1 | todas | Da PD à decisão: quatro perguntas para confiar no modelo | essencial | 4 |
| 02 | c7p21 | todas | Estamos prevendo qual evento, para quem e em quanto tempo? | essencial | 3 |
| 03 | c7p2 | Ordenação | Aprovar todos pode produzir alta acurácia | essencial | 4 |
| 04 | c7p3 | Ordenação | Ordenar, prever e decidir são tarefas distintas | essencial | 4 |
| 05 | c7p4 | Ordenação | A fila de risco é o que as métricas de ordenação leem | essencial | 3 |
| 06 | c7p5 | Ordenação | AUC é uma disputa entre um default e um adimplente | essencial | 4 |
| 07 | c7p22 | Ordenação | A AUC exata conta todos os pares, com meio ponto por empate | aprofundamento | 4 |
| 08 | c7p23 | Ordenação | Cada corte transforma a fila em uma matriz de confusão | essencial | 4 |
| 09 | c7p6 | Ordenação | A ROC percorre todos os cortes da fila | essencial | 4 |
| 10 | c7p24 | Ordenação | O que a AUC responde e o que deixa em aberto | essencial | 4 |
| 11 | c7p7 | Ordenação | KS: onde as duas distribuições mais se separam? | essencial | 3 |
| 12 | c7p8 | Ordenação | Que parcela dos defaults está nos 10% mais arriscados? | essencial | 3 |
| 13 | c7p25 | Ordenação | Lift: quantas vezes melhor que escolher ao acaso? | aprofundamento | 3 |
| 14 | c7p26 | Ordenação | Com evento raro, precisão e recall contam outra história | aprofundamento | 4 |
| 15 | c7p27 | Ordenação | Laboratório de discriminação | essencial | 5 |
| 16 | c7p28 | Probabilidade | Uma boa fila ainda pode cobrar o risco errado | essencial | 3 |
| 17 | c7p9 | Probabilidade | Uma PD de 10% fala de um grupo, não de uma pessoa | essencial | 3 |
| 18 | c7p29 | Probabilidade | Média prevista igual à observada não prova calibração | essencial | 3 |
| 19 | c7p10 | Probabilidade | A curva de confiabilidade, construída faixa a faixa | essencial | 4 |
| 20 | c7p30 | Probabilidade | As faixas escolhidas mudam a leitura da curva | aprofundamento | 3 |
| 21 | c7p31 | Probabilidade | Cinco defaults em cem casos não são uma verdade exata | essencial | 3 |
| 22 | c7p32 | Probabilidade | Erro de nível e erro de inclinação têm assinaturas diferentes | aprofundamento | 4 |
| 23 | c7p33 | Probabilidade | Brier: o custo quadrático de errar a probabilidade | essencial | 3 |
| 24 | c7p34 | Probabilidade | Log loss: confiança errada custa caro | aprofundamento | 3 |
| 25 | c7p11 | Probabilidade | Menor Brier não prova melhor calibração | essencial | 3 |
| 26 | c7p35 | Probabilidade | Laboratório: boa fila, probabilidades ruins | essencial | 5 |
| 27 | c7p16 | Validação | Recalibrar exige uma amostra própria | essencial | 3 |
| 28 | c7p12 | Probabilidade | Correção de nível: um ajuste de intercepto | essencial | 3 |
| 29 | c7p13 | Probabilidade | Platt corrige nível e inclinação sem mexer na fila | essencial | 3 |
| 30 | c7p36 | Probabilidade | Isotônica: flexível, com degraus e empates | aprofundamento | 3 |
| 31 | c7p37 | Decisão | O que muda depois de recalibrar | essencial | 4 |
| 32 | c7p18 | Decisão | A probabilidade não escolhe sozinha a política | essencial | 4 |
| 33 | c7p14 | Validação | A métrica também é uma estatística | aprofundamento | 3 |
| 34 | c7p15 | Validação | Comparação justa: mesmos casos, mesma pergunta | essencial | 4 |
| 35 | c7p17 | Validação | OOT: a prova depois de congelar as escolhas | essencial | 4 |
| 36 | c7p38 | todas | Você colocaria este modelo em produção? | essencial | 6 |
| 37 | c7p20 | todas | Confiar no modelo exige quatro respostas | essencial | 4 |
| 38 | c7p19 | apoio | Apêndice: fórmulas, métricas fora do protocolo e referências | apêndice | 3 |

Percurso essencial: 28 páginas, 104 minutos de sala em ritmo de leitura ativa; o professor pode cortar para 95 minutos pulando as perguntas de discussão de 15 e 26. Percurso completo com os aprofundamentos: 141 minutos. O capítulo 8 completa a Aula 3.

## 6. Regras de interação

- Todo quadro abre num estado inicial interpretável e volta a ele por "Restaurar". Ao sair e voltar a um slide, o estado reinicia: a regra é a mesma em todo o capítulo e não depende do navegador.
- Sorteios (pares, amostras repetidas) usam semente exibida no quadro; "Restaurar" volta à primeira semente e repete a mesma sequência.
- Nenhuma leitura depende de passar o mouse: valores essenciais ficam escritos no quadro.
- Controles com rótulo, valor e unidade; teclado e toque; foco visível; setas dentro de um controle não trocam de slide.
- Movimento só para mostrar sequência ou causa, desligado com `prefers-reduced-motion`; todo passo animado tem avanço manual.
- Questões com veredito ficam no estudo, abaixo do quadro, com correção no servidor; no palco o professor as publica pela sessão ao vivo. Previsões dentro do quadro ("antes de revelar") servem à aula e não são nota: a resposta delas é o próprio gráfico.
