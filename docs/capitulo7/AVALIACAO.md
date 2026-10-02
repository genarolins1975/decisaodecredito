# Avaliação do capítulo 7

Gerado por `.claude/skills/quadro-capitulo/scripts/avaliar.mjs` em 2026-10-02. Mínimo 9 em cada item. Notas humanas: subagentes em contexto limpo, 2026-10-02.

**Resultado: REPROVADO, 5 item(ns) abaixo de 9.** Média dos 266 itens de slide: 9,31; menor: 8,0. Testes da biblioteca: passando (2 arquivos de teste da biblioteca passando).

## Itens abaixo do mínimo

- Slide 36 (c7p38), rigor: 8. Números conferidos por conta independente (b/conf.py) e pela biblioteca (b/lib.ts, b/lib2.ts): DeLong 0,7257 contra 0,6958, p 0,0492, IC 0,0001 a 0,0596; candidato O/E 0,832, 1 − p 0,0352; cortes de 14% nos dois, esperado R$ 608 mil e R$ 328 mil; corte refeito 13,5%, 492 aprovados, promessa R$ 496.437 contra R$ 469.834 pela PD verdadeira; 76 decisões mudam no corte antigo, todas de aprovada para recusada; sorte 12,3%, faixa exata 11,3% a 13,4%. Falha: o cartão Decisão diz '492 aprovados (eram 580; 76 decisões mudam)' (p38-certa-dossie-1920 em textos.json). Lido na tela, 580 menos 492 são 88 mudanças; os 76 são as do corte antigo de 14%, qualificação que só existe no rótulo acessível do slide 37 e no guia. É um número com a definição escondida, ao lado de outro que o contradiz. E a alternativa certa diz 'nas safras recentes', enquanto o quadro, um palmo acima, diz 'todas as safras maturadas fora do treino'; 'recentes' também descreve 'só a janela'.. Corrigir: Cartão Decisão: '492 aprovados (eram 580): 76 recusas novas já no corte antigo de 14% e mais 12 com o corte de 13,5%'. Alternativa C: 'Manter a logística e recalibrar o nível em todas as safras fora do treino'. Para 10: dizer na leitura que o valor pela PD verdadeira quase não muda (R$ 472 mil antes, R$ 470 mil depois): recalibrar corrige a promessa e a provisão, não o valor da fila. E que a promessa segue R$ 26 mil acima porque o intercepto acerta a média, não a região aprovada (ali a PD recalibrada média é 7,3% contra 8,0% verdadeira, b/conf.py).
- Slide 37 (c7p20), rigor: 8. Conferido por cadeia exata, sem sorteio (b/mon.py, convolução da binomial com limites de Jeffreys bilaterais, m = 150, p0 = 12,01%): uma safra rejeita com d ≤ 10 ou d ≥ 27, falso alarme 4,39% e poder 5,94% (tela 4,5% e 6,0%); acumulado com 5% ÷ 12 em duas caudas: 2,28% e 11,24% (tela 2,2% e 11%); sem repartir 20,38% (apêndice 20,7%). Diferenças dentro do erro de 20.000 sorteios. Corte 13,5%, 492, R$ 496 mil, R$ 470 mil e KS 12,2% conferidos (b/conf.py). Duas falhas. (1) O procedimento manda 'reancorar a cada 12 safras' sem dizer em quais safras; a regra do slide 2, 'todas as safras maturadas fora do treino', aplicada na primeira reancoragem junta 22 safras (2023-03 a 2024-12) e cresce sem limite, o contrário do 'nível corrente' da finalidade. E o diagnóstico do sintoma 'Curva fora da diagonal' diz 'nas safras maturadas mais recentes' (p20-cal-1366.png), que na tabela do slide 27 é 'só a janela', a âncora que a regra não escolhe. (2) A miniatura de probabilidade mostra 'Jeffreys p: janela 0,12; validação 0,001; validação e janela 0,0013' sem dizer que são unilaterais (a do BCE) e sem os denominadores (100 de 760; 181 de 1.497), ao lado de um monitoramento bilateral.. Corrigir: Passo Nível: 'intercepto após a prova nas safras maturadas fora do treino; reancorar a cada 12 safras com as últimas 10 safras maturadas' (ou o número que o contrato fixar), e o mesmo texto no slide 2. Diagnóstico 'cal': trocar 'nas safras maturadas mais recentes' por 'nas safras que o contrato fixa (slide 2)'. Miniatura: 'Jeffreys unilateral p: janela 0,12 (81 de 737); validação 0,001 (100 de 760); validação e janela 0,0013 (181 de 1.497)'.
- Slide 38 (c7p19), rigor: 8. A correção da rodada 7 foi feita: Reprodução lista 'monitoramento do nível 20261041 (20.000 sorteios; slides 37 e 38)' e 'réplicas da âncora de produção 20261043 (2.000; slides 27 e 36)', e a Fronteira traz 'Simulação de 20.000 sorteios, semente 20261041' (p19-repro-1920, p19-fronteira-1920). Gini 2 × 0,72569 − 1 = 0,4514 e 1 − 81/737 = 89,0% conferidos. Duas frases ficaram inexatas no ponto central desta rodada. (1) O item do Jeffreys abre com 'O teste do BCE no backtesting de PD, unilateral' e segue 'Repetido no acumulado a cada safra... 12 olhadas a 5% dão 20,7%'; os 20,7%, 2,2% e 11% são do teste bilateral (dados.ts, monitorarNivel). Com o unilateral do BCE, 12 olhadas a 5% dão 18,5% (conta exata, b/mon.py). (2) O item do ciclo diz 'o caso declara antes as maturadas mais recentes'; o contrato do slide 2 declara 'todas as safras maturadas fora do treino', e 'as mais recentes' é como o guia do slide 27 descreve 'só a janela'.. Corrigir: Jeffreys: 'Com as duas caudas, como no monitoramento (slide 37): 12 olhadas a 5% dão 20,7%; com 5% repartido, 2,2%, e poder de 11% contra 1 ponto'. Ciclo: 'o caso declara antes, no slide 2, o intercepto em todas as safras maturadas fora do treino, sem ajuste prospectivo'. Corrigir o mesmo no guia de c7p19.
- Storytelling, Coerência: 8. Resolvido desde a rodada 7: a regra do nível está no contrato do slide 2 (linhas Finalidade e Regra do nível, captura 02-c7p21-c.png) e o 16, o 27 e o 36 remetem a ela; o corte é refeito com a PD recalibrada (36 depois do acerto: 'corte refeito em 13,5%, promessa de R$ 496 mil (R$ 470 mil pela PD verdadeira; antes, R$ 608 mil)', 36-c7p38-dossie.png); o cartão Decisão do 36 cobra as duas promessas ('Pela PD verdadeira, os aprovados valem ● R$ 472 mil e □ R$ 462 mil'); o 37 diz 'Jeffreys acumulado nas duas caudas ... (para provisão, superestimar também custa)' e o 38 remete a ele; 'Sua decisão' se mantém depois da escolha. O fio das quatro perguntas segue na trilha dos 38. Defeitos que restam ou nasceram com a correção: (1) A regra que decide o caso tem três redações. Slide 2 e quadro do 36: 'após a prova, intercepto em todas as safras maturadas fora do treino'; alternativa certa do 36: 'recalibrar o nível nas safras recentes'; sintoma do 37: 'nas safras maturadas mais recentes'; apêndice: 'o caso declara antes as maturadas mais recentes'. 'Mais recentes' é como o guia do 27 chama a linha Só a janela ('as cinco safras mais recentes, sem a validação'), que é outra âncora da tabela (11,0%, O/E verd. 1,059). E as duas redações divergem justamente no procedimento que o 37 manda aplicar: reancorando 'a cada 12 safras maturadas', 'todas fora do treino' vira uma janela que cresce sem fim (22, 34 safras), o oposto de 'nível corrente' da Finalidade; 'mais recentes' é janela móvel. (2) O 37 mostra 'KS 12,2%' (captura 37-c7p20-a.png) contra 'KS em 9,7%' do slide 1 e 'Corte do KS 9,7%' do 32, sem dizer na tela que é o mesmo ponto da fila na escala recalibrada; a distância KS contra corte econômico, que o slide 1 anuncia como 4,3 pontos, chega ao fim com 1,3 ponto sem comentário. (3) Referência circular para a prova do nível: o 27 diz 'a prova do nível vem das safras seguintes (slide 37)' e o 37 diz 'Falta: o nível novo no tempo (slide 27)'; nenhum dos dois diz que teste, com que poder. (4) Resíduos: 'Platt do curso' (29, 31) e 'boosting com Platt' ou 'candidato' (36) para o mesmo objeto; os dois 727 (27 '727 aparecem', 30 '727 PDs distintas').. Corrigir: Para 9: uma redação só da regra, em todo lugar (2, 36 no quadro e na alternativa C, 37 no sintoma e no passo Nível, 38, guias), que fixe a janela e sobreviva à reancoragem, por exemplo 'após a prova, intercepto nas 10 safras maturadas mais recentes fora do treino (hoje, validação e janela); a cada reancoragem, as 10 mais recentes'; trocar 'safras recentes' da alternativa C por 'validação e janela, pela regra do slide 2'; no 37, rotular 'KS 12,2% (o mesmo ponto da fila que era 9,7%)' e dizer em meia linha que a distância ao corte econômico caiu com o nível; desfazer a referência circular 27 e 37 dizendo, no 37, o que prova o nível (O/E acumulado das safras de 2024 contra 12,0%, com o poder do monitoramento). Para 10: um nome só para o candidato em 29, 31 e 36, desfazer os dois 727 e uma frase final que peça o slide seguinte em toda leitura (faltam, no estado final, ao menos 10, 11, 13, 14, 16, 20, 21, 26, 32 e 34).
- Storytelling, Fechamento e transferência: 8. Resolvido desde a rodada 7: a resposta 'Sustenta a decisão?' do 37 usa a PD recalibrada ('Com o corte refeito: 13,5%', 'corte 13,5%, 492 aprovados', 'esperado, máximo R$ 496 mil', 'pela PD verdadeira, R$ 470 mil'); a miniatura de probabilidade mostra a evidência da recalibração ('Jeffreys p: janela 0,12 (não rejeita); validação 0,001; validação e janela 0,0013') e o nível novo (△ recalibrada 12,0%); a ação depois da produção é de calendário ('reancorar a cada 12 safras maturadas, sem esperar alarme'), com o alarme para desvios grandes; as quatro respostas têm os números do caso e o que falta; diagnóstico por sintoma com links; 'Para aplicar amanhã' em seis passos (captura 37-c7p20-a.png). O que impede 9: (1) material de apoio desalinhado da tela: a questão curada c7p17q (content/questoes-curadas.json) diz 'o escolhido teria AUC esperada de 0,6588 em janelas novas, abaixo dos 0,6697 da logística' e fala de 'dez variações'; a tela do 35 mostra 'nas réplicas esperaria 0,6565, abaixo dos 0,6673 dela' (com 10 e com 20 reaberturas, captura 35-c7p17-20.png), e 'janelas novas' é o termo abandonado na rodada 4. (2) A ação que o aluno leva é ambígua: o passo 'Nível: intercepto após a prova; reancorar a cada 12 safras' não diz em quais safras, e a regra do slide 2 ('todas as safras maturadas fora do treino') aplicada a cada reancoragem acumula safras antigas, contra a finalidade 'nível corrente'; o sintoma do 37 diz outra coisa ('safras maturadas mais recentes'). Restam ainda: o passo 'Probabilidade: ... segmentos' nunca aparece funcionando; 'KS 12,2%' na miniatura de decisão sem explicação diante dos 9,7% do slide 1.. Corrigir: Para 9: reescrever c7p17q com os números e o termo da tela (10 ou 20 reaberturas, 0,7286 na janela, 0,6565 nas réplicas contra 0,6673 da logística, 'réplicas sintéticas da janela') e conferir as outras nove questões do capítulo contra a tela; no passo Nível do 37, dizer a amostra de cada reancoragem com a mesma redação da regra do slide 2 (por exemplo, 'intercepto nas 10 safras maturadas mais recentes, refeito a cada 12 safras; corte refeito junto'). Para 10: cada passo de 'Para aplicar amanhã' com entrada, conta e critério (por exemplo, 'Ordenação: AUC com IC de DeLong pareado; troca só se o limite inferior da diferença passar de 0'), aplicado uma vez ao caso na tela; o passo de segmentos mostrado com uma variável da base (curva de confiabilidade por faixa de utilização, por exemplo); e o que prova o nível novo nas safras de 2024, com o poder desse teste.

## Storytelling do capítulo

| Item | Nota | Evidência |
|---|---|---|
| Coerência | **8,0** | Resolvido desde a rodada 7: a regra do nível está no contrato do slide 2 (linhas Finalidade e Regra do nível, captura 02-c7p21-c.png) e o 16, o 27 e o 36 remetem a ela; o corte é refeito com a PD recalibrada (36 depois do acerto: 'corte refeito em 13,5%, promessa de R$ 496 mil (R$ 470 mil pela PD verdadeira; antes, R$ 608 mil)', 36-c7p38-dossie.png); o cartão Decisão do 36 cobra as duas promessas ('Pela PD verdadeira, os aprovados valem ● R$ 472 mil e □ R$ 462 mil'); o 37 diz 'Jeffreys acumulado nas duas caudas ... (para provisão, superestimar também custa)' e o 38 remete a ele; 'Sua decisão' se mantém depois da escolha. O fio das quatro perguntas segue na trilha dos 38. Defeitos que restam ou nasceram com a correção: (1) A regra que decide o caso tem três redações. Slide 2 e quadro do 36: 'após a prova, intercepto em todas as safras maturadas fora do treino'; alternativa certa do 36: 'recalibrar o nível nas safras recentes'; sintoma do 37: 'nas safras maturadas mais recentes'; apêndice: 'o caso declara antes as maturadas mais recentes'. 'Mais recentes' é como o guia do 27 chama a linha Só a janela ('as cinco safras mais recentes, sem a validação'), que é outra âncora da tabela (11,0%, O/E verd. 1,059). E as duas redações divergem justamente no procedimento que o 37 manda aplicar: reancorando 'a cada 12 safras maturadas', 'todas fora do treino' vira uma janela que cresce sem fim (22, 34 safras), o oposto de 'nível corrente' da Finalidade; 'mais recentes' é janela móvel. (2) O 37 mostra 'KS 12,2%' (captura 37-c7p20-a.png) contra 'KS em 9,7%' do slide 1 e 'Corte do KS 9,7%' do 32, sem dizer na tela que é o mesmo ponto da fila na escala recalibrada; a distância KS contra corte econômico, que o slide 1 anuncia como 4,3 pontos, chega ao fim com 1,3 ponto sem comentário. (3) Referência circular para a prova do nível: o 27 diz 'a prova do nível vem das safras seguintes (slide 37)' e o 37 diz 'Falta: o nível novo no tempo (slide 27)'; nenhum dos dois diz que teste, com que poder. (4) Resíduos: 'Platt do curso' (29, 31) e 'boosting com Platt' ou 'candidato' (36) para o mesmo objeto; os dois 727 (27 '727 aparecem', 30 '727 PDs distintas'). |
| Arco narrativo | 9,0 | Gancho nos três primeiros: comitê anunciado no 1 ('No slide 36, o comitê decide se o boosting substitui a logística'), AUC de 0,80 de outro banco que não serve de régua (2), aprovar todos com 89,0% sem recusar nenhum dos 81 defaults (3). Tensão que cresce e se reabre: 15 fecha 'Só a ordem move as quatro'; 16 abre o nível (mesma AUC 0,7257, perda esperada de R$ 607 mil a R$ 1,16 mi); 18 mostra O/E 1,00 escondendo 9,2% contra 4,9%; 25, Brier menor com MCB fora da banda; 27, o atalho 0,3136 que entrega 0,3437; 31, 121 decisões mudam com corte fixo. Viradas do dado: boosting 0,8196 no treino e 0,6958 na janela (p = 0,049); janela favorável (0,7257 contra 0,6673 nas réplicas, 35); KS realiza R$ 660 mil contra R$ 588 mil por acaso (32); a janela não rejeita o nível (Jeffreys p = 0,12), a validação rejeita (p = 0,001). O spoiler do 16 saiu: o retorno certo agora pergunta 'Qual nível vai para produção, e com que amostra? O slide 36 responde com a regra do slide 2' (captura 16-c7p28-c.png). Fecho volta ao gancho e decide com números (manter, recalibrar a 12,0%, corte 13,5%). |
| Exemplo prático | 9,0 | Uma carteira atravessa o capítulo: janela de 737 propostas aprovadas, safras 2023-08 a 2023-12, 81 defaults, logística do capítulo 4 e boosting do capítulo 6; a linha do tempo do 2 (treino 2.103, validação 760, janela 737, base fechada em 31/01/2025) volta no 27 e no 36. A decisão usa o caso com consequência em reais: perda esperada por âncora (R$ 607 mil sem recalibrar, R$ 751 mil na âncora da regra, R$ 724 mil pela PD verdadeira), ligada à provisão de estágio 1 pela Res. CMN 4.966/2021, e agora o corte refeito (14,0% para 13,5%, 580 para 492 aprovados, 76 decisões mudam no corte antigo, promessa de R$ 608 mil para R$ 496 mil contra R$ 470 mil pela PD verdadeira). Base sintética declarada em toda fonte, com o que ela permite: desfecho dos recusados (2), PD verdadeira (22, 27, 31, 32, 36), réplicas (10, 27, 33 a 37), sorte da âncora em 2.000 réplicas (27, 36). |
| Progressão | 9,0 | Do intuitivo ao formal em cada pergunta (fila, disputa entre pares, conta exata, matriz, ROC; PD de um grupo, média, faixas, incerteza, assinaturas, perdas, amostra própria, intercepto, Platt, isotônica; corte; bootstrap, comparação justa, janela congelada). O 16 define LGD e EAD na leitura; Jeffreys é definido antes do uso decisivo (18, 21, 28) e a mudança para duas caudas é dita e justificada no 37; o monitoramento nasce de uma limitação na tela (uma safra: poder 6,0% contra acaso 4,5%; acumulado: falso alarme 2,2%, poder 11%) e leva à regra de calendário. Aprofundamentos marcados e puláveis (7, 10, 13, 14, 15, 20, 26, 30, 33). Tempo: 100 minutos essenciais e 34 de aprofundamento (roteiro.ts), com ordem de corte no guia do slide 1. |
| Estado da arte | 10,0 | essenciais 12/12; fronteira 6/6. Revisor: Essenciais 12 de 12 e fronteira 6 de 6 pelo checklist (lista abaixo). Em slide, com os dados da janela: AUC por pares, matriz, ROC e KS 0,3621 (6 a 11); bootstrap pareado e DeLong, diferença 0,0299, IC 0,0001 a 0,0596 (33, 34); curva PR com carteira de 2% (14); Wilson e Jeffreys por faixa (19 a 21); O/E 1,00 que esconde 9,2% contra 4,9% (18), assinaturas com intercepto e slope (22), slope com IC (29, 36, 37); Brier contra a constante com IC pareado (23), log loss (24), CORP com MCB, DSC, UNC (20, 25); intercepto, Platt e isotônica em amostra própria (27 a 30); corte econômico contra KS e agora refeito com a PD recalibrada (32, 36, 37); linha do tempo e reaberturas (2, 34, 35); provisão de estágio 1 pela 4.966 com perda esperada por âncora (16, 27, 36). Jeffreys unilateral do BCE nos testes e bilateral no monitoramento, com o motivo, na tela (37) e no apêndice. Hosmer e Lemeshow, ECE, acurácia e PSI fora do protocolo com motivo. Apêndice com referência primária e quando usar para F2 a F6. |
| Fechamento e transferência | **8,0** | Resolvido desde a rodada 7: a resposta 'Sustenta a decisão?' do 37 usa a PD recalibrada ('Com o corte refeito: 13,5%', 'corte 13,5%, 492 aprovados', 'esperado, máximo R$ 496 mil', 'pela PD verdadeira, R$ 470 mil'); a miniatura de probabilidade mostra a evidência da recalibração ('Jeffreys p: janela 0,12 (não rejeita); validação 0,001; validação e janela 0,0013') e o nível novo (△ recalibrada 12,0%); a ação depois da produção é de calendário ('reancorar a cada 12 safras maturadas, sem esperar alarme'), com o alarme para desvios grandes; as quatro respostas têm os números do caso e o que falta; diagnóstico por sintoma com links; 'Para aplicar amanhã' em seis passos (captura 37-c7p20-a.png). O que impede 9: (1) material de apoio desalinhado da tela: a questão curada c7p17q (content/questoes-curadas.json) diz 'o escolhido teria AUC esperada de 0,6588 em janelas novas, abaixo dos 0,6697 da logística' e fala de 'dez variações'; a tela do 35 mostra 'nas réplicas esperaria 0,6565, abaixo dos 0,6673 dela' (com 10 e com 20 reaberturas, captura 35-c7p17-20.png), e 'janelas novas' é o termo abandonado na rodada 4. (2) A ação que o aluno leva é ambígua: o passo 'Nível: intercepto após a prova; reancorar a cada 12 safras' não diz em quais safras, e a regra do slide 2 ('todas as safras maturadas fora do treino') aplicada a cada reancoragem acumula safras antigas, contra a finalidade 'nível corrente'; o sintoma do 37 diz outra coisa ('safras maturadas mais recentes'). Restam ainda: o passo 'Probabilidade: ... segmentos' nunca aparece funcionando; 'KS 12,2%' na miniatura de decisão sem explicação diante dos 9,7% do slide 1. |

## Estado da arte

| id | Tema | Classe | Onde | Referência |
|---|---|---|---|---|
| E1 | Discriminação, calibração e decisão como perguntas distintas | essencial | c7p1, c7p3, c7p24, c7p28, c7p20 | Van Calster e outros (2019), BMC Medicine 17:230. Mesmos quatro clientes numa fila, numa escala de PD e diante de um corte (4); mesma AUC 0,7257 com perda esperada de R$ 607 mil a R$ 1,16 mi (16); quatro respostas (37). |
| E2 | ROC, AUC (com Gini = 2 AUC menos 1) e KS | essencial | c7p5, c7p22, c7p23, c7p6, c7p7, apendice | Hanley e McNeil (1982), Radiology 143(1); Fawcett (2006), Pattern Recognition Letters 27(8). AUC por pares, ROC corte a corte, KS 0,3621 em 9,75%; Gini 0,4514 no apêndice. |
| E3 | Incerteza da AUC e comparação pareada de modelos | essencial | c7p14, c7p15, c7p38 | DeLong, DeLong e Clarke Pearson (1988), Biometrics 44(3). Bootstrap pareado (33), diferença 0,0299 com IC 0,0001 a 0,0596 (34), p = 0,049 no comitê (36). |
| E4 | Evento raro: precisão, recall e curva PR | essencial | c7p26 | Saito e Rehmsmeier (2015), PLoS ONE 10(3). Precisão 23,9% contra 11,0% e carteira de 2% com precisão 4,9% (14, aprofundamento). |
| E5 | Curva de confiabilidade com intervalo por faixa | essencial | c7p10, c7p30, c7p31 | Wilson (1927), JASA 22(158). F8 com 15 em 74 e IC de 12,7% a 30,8% (21). |
| E6 | Hierarquia de calibração: média, intercepto e slope, curva | essencial | c7p29, c7p10, c7p32, c7p13, c7p38, c7p20 | Cox (1958), Biometrika 45; Van Calster e outros (2019). O/E 1,00 que esconde 9,2% contra 4,9% (18), assinaturas (22), slope 0,88 com IC 0,55 a 1,21 (29), slopes 1,12 e 1,20 (36). |
| E7 | Regras de pontuação próprias: Brier, log loss, decomposição de Murphy | essencial | c7p33, c7p34, c7p11, apendice | Brier (1950); Murphy (1973); Gneiting e Raftery (2007), JASA 102(477). Brier 0,09128 contra 0,09803 com IC pareado (23), log loss 0,31487 contra 0,34745 (24), MCB, DSC, UNC (25). |
| E8 | Recalibração em amostra própria: intercepto, Platt, isotônica | essencial | c7p16, c7p12, c7p13, c7p36 | Platt (2000); Zadrozny e Elkan (2002), KDD; Niculescu Mizil e Caruana (2005), ICML. Atalho 0,3136 contra 0,3437 nas réplicas (27); intercepto 0,1822 na calibração (28); isotônica com 16 degraus (30). |
| E9 | Corte por custo e receita, não por métrica estatística | essencial | c7p37, c7p18, c7p1, c7p38, c7p20 | Elkan (2001), IJCAI. Corte econômico 14,0% contra KS 9,7% (32); 121 decisões mudam com corte fixo depois do Platt (31); corte refeito em 13,5% com a PD recalibrada, 492 aprovados, 76 decisões mudam (36, 37). |
| E10 | Validação fora do tempo com escolhas congeladas | essencial | c7p21, c7p15, c7p17 | BCBS (2005), Working Paper 14. Linha do tempo com maturação de 12 meses (2), mesmos casos (34), reaberturas e otimismo de seleção, 0,7286 na janela contra 0,6565 nas réplicas (35). |
| E11 | Teste de aderência da PD por faixa usado por supervisores (binomial, Jeffreys) | essencial | c7p9, c7p29, c7p31, c7p12, c7p16, c7p38, c7p20 | ECB (2019), Instructions for reporting the validation results of internal models. Binomial (17), Jeffreys por faixa (21), p = 0,12 na janela (18, 28), validação p = 0,001 (27, 36), monitoramento acumulado nas duas caudas, com o motivo na tela (37). |
| E12 | PD calibrada como insumo de perda esperada e provisão no Brasil | essencial | c7p21, c7p28, c7p16, c7p38, apendice | Resolução CMN 4.966/2021 e Resolução BCB 352/2023. Finalidade no contrato (2); perda esperada Σ PD × 65% × EAD (16); perda por âncora, R$ 607 mil a R$ 808 mil contra R$ 724 mil (27, 36). |
| F1 | Diagrama de confiabilidade estável por regressão isotônica (CORP) e decomposição MCB, DSC, UNC | fronteira | c7p30, c7p11 | Dimitriadis, Gneiting e Jordan (2021), PNAS 118(8) e2016191118. 'Sem faixas (CORP)' no 20; MCB fora da banda de 200 sorteios no 25. |
| F2 | Calibradores além de Platt: beta calibration, temperature scaling | fronteira | apendice | Kull, Silva Filho e Flach (2017), AISTATS; Guo e outros (2017), ICML. Fórmula e quando usar. |
| F3 | Probabilidades com garantia de validade: Venn-Abers e predição conformal | fronteira | apendice | Vovk e Petej (2014), UAI. Quando usar: amostra de calibração pequena. |
| F4 | Benefício líquido e curva de decisão | fronteira | apendice | Vickers e Elkin (2006), Medical Decision Making 26(6). O capítulo não calcula; usa o resultado esperado em reais. |
| F5 | Calibração por segmento e multicalibração | fronteira | apendice | Hébert-Johnson e outros (2018), ICML. Só apêndice e a palavra 'segmentos' no procedimento do 37. |
| F6 | PD de longo prazo e ajuste ao ciclo (through the cycle) | fronteira | apendice | EBA (2017), EBA/GL/2017/16. A base tem 24 meses e não cobre um ciclo; PD de capital fora do capítulo. |

## Slide a slide

| Slide | Layout | Legib. | Beleza | Didática | Interação | Rigor | Acess. |
|---|---|---|---|---|---|---|---|
| 1 c7p1 | 9,1 | 9,0 | 9,0 | 9,0 | 9,0 | 9,0 | 10,0 |
| 2 c7p21 | 9,1 | 9,0 | 9,0 | 9,0 | 9,0 | 9,0 | 10,0 |
| 3 c7p2 | 9,4 | 9,0 | 9,0 | 10,0 | 10,0 | 9,0 | 10,0 |
| 4 c7p3 | 9,1 | 9,0 | 9,0 | 9,0 | 10,0 | 9,0 | 10,0 |
| 5 c7p4 | 9,1 | 9,0 | 9,0 | 9,0 | 9,0 | 9,0 | 10,0 |
| 6 c7p5 | 9,4 | 9,0 | 9,0 | 9,0 | 9,0 | 9,0 | 10,0 |
| 7 c7p22 | 9,1 | 9,0 | 9,0 | 9,0 | 9,0 | 9,0 | 10,0 |
| 8 c7p23 | 9,1 | 9,0 | 9,0 | 9,0 | 10,0 | 9,0 | 10,0 |
| 9 c7p6 | 9,4 | 9,0 | 9,0 | 9,0 | 10,0 | 9,0 | 10,0 |
| 10 c7p24 | 9,1 | 9,0 | 9,0 | 9,0 | 9,0 | 10,0 | 10,0 |
| 11 c7p7 | 9,4 | 9,0 | 9,0 | 10,0 | 10,0 | 9,0 | 10,0 |
| 12 c7p8 | 9,4 | 9,0 | 9,0 | 9,0 | 9,0 | 9,0 | 10,0 |
| 13 c7p25 | 9,4 | 9,0 | 9,0 | 9,0 | 10,0 | 10,0 | 10,0 |
| 14 c7p26 | 9,4 | 9,0 | 9,0 | 9,0 | 10,0 | 9,0 | 10,0 |
| 15 c7p27 | 9,1 | 9,0 | 9,0 | 10,0 | 10,0 | 9,0 | 10,0 |
| 16 c7p28 | 9,1 | 9,0 | 9,0 | 9,0 | 10,0 | 9,0 | 10,0 |
| 17 c7p9 | 9,4 | 9,0 | 9,0 | 9,0 | 10,0 | 9,0 | 10,0 |
| 18 c7p29 | 9,1 | 9,0 | 9,0 | 9,0 | 10,0 | 9,0 | 10,0 |
| 19 c7p10 | 9,4 | 9,0 | 9,0 | 9,0 | 9,0 | 10,0 | 10,0 |
| 20 c7p30 | 9,4 | 9,0 | 9,0 | 9,0 | 10,0 | 9,0 | 10,0 |
| 21 c7p31 | 9,1 | 9,0 | 9,0 | 9,0 | 10,0 | 10,0 | 10,0 |
| 22 c7p32 | 9,1 | 9,0 | 9,0 | 9,0 | 10,0 | 9,0 | 10,0 |
| 23 c7p33 | 9,4 | 9,0 | 9,0 | 10,0 | 10,0 | 10,0 | 10,0 |
| 24 c7p34 | 9,1 | 9,0 | 9,0 | 9,0 | 10,0 | 9,0 | 10,0 |
| 25 c7p11 | 9,1 | 9,0 | 9,0 | 10,0 | 10,0 | 10,0 | 10,0 |
| 26 c7p35 | 9,1 | 9,0 | 9,0 | 9,0 | 10,0 | 9,0 | 10,0 |
| 27 c7p16 | 9,1 | 9,0 | 9,0 | 9,0 | 9,0 | 9,0 | 10,0 |
| 28 c7p12 | 9,1 | 9,0 | 9,0 | 9,0 | 9,0 | 10,0 | 10,0 |
| 29 c7p13 | 9,4 | 9,0 | 9,0 | 9,0 | 9,0 | 9,0 | 10,0 |
| 30 c7p36 | 9,1 | 9,0 | 9,0 | 10,0 | 10,0 | 10,0 | 10,0 |
| 31 c7p37 | 9,4 | 9,0 | 9,0 | 9,0 | 10,0 | 9,0 | 10,0 |
| 32 c7p18 | 9,1 | 9,0 | 9,0 | 9,0 | 10,0 | 9,0 | 10,0 |
| 33 c7p14 | 9,1 | 9,0 | 9,0 | 9,0 | 9,0 | 10,0 | 10,0 |
| 34 c7p15 | 9,1 | 9,0 | 9,0 | 9,0 | 10,0 | 9,0 | 10,0 |
| 35 c7p17 | 9,1 | 9,0 | 9,0 | 10,0 | 10,0 | 10,0 | 10,0 |
| 36 c7p38 | 9,1 | 9,0 | 9,0 | 9,0 | 9,0 | **8,0** | 10,0 |
| 37 c7p20 | 9,1 | 9,0 | 9,0 | 9,0 | 9,0 | **8,0** | 10,0 |
| 38 c7p19 | 9,4 | 9,0 | 9,0 | 9,0 | 9,0 | **8,0** | 10,0 |

## Evidências por slide

### 1. Da PD à decisão: quatro perguntas para confiar no modelo (c7p1)

- **Layout 9,1:** auditoria 9.10 em 1920 × 1080 e 9.10 em 1400 × 900; varredura limpa nos cenários medidos
- **Legib. 9,0:** menor fonte 1.73% da altura (a.q7-s01-k:Armadilha da acurácia)
- **Beleza 9,0:** Captura 01-c7p1-palco: três cartões em fluxo com setas (Ordenação, Probabilidade, Decisão) e a Validação como faixa que atravessa; cor e símbolo por pergunta (● ▲ ◆ ■); no cartão Decisão, a régua põe KS 9,7% e econômico 14,0% na mesma escala, a única peça gráfica e a que já antecipa a tensão do capítulo. Hierarquia título, sub, mapa, atalhos, leitura, fonte limpa.
- **Didática 9,0:** Título afirma o percurso; sub põe o que está em jogo (o comitê do slide 36 decide se o boosting substitui a logística); leitura com os números da tela (AUC 0,7257; 9,7% previsto contra 11,0% observado; KS e economia em cortes diferentes) e ligação explícita: "Primeiro, a pergunta: slide 2". O cartão Validação não antecipa o vencedor.
- **Interação 9,0:** Slide de consulta: cada cartão lista os slides como links no mesmo modo (funcional-c7.txt: "link do mapa abre o slide no palco (http://localhost:3000/apresentacao/c7p6)"); atalhos Começar, Comitê 36, Conclusão 37, Apêndice 38 em s01-mapa.tsx.
- **Rigor 9,0:** npx tsx: delong(Y,PL,PGR).auc1 = 0,72569; ks(Y,PL) = 0,36209 no limiar 0,097464; calibracaoGlobal pdMedia 0,09721 contra 81/737 = 0,10991; otimo(curva(...)).corte = 0,14. Todos batem com a tela. Fonte declara base sintética, semente, safras, 737 propostas e 81 defaults.
- **Acess. 10,0:** axe sem violações; teclado, foco e movimento reduzido conferidos

### 2. Estamos prevendo qual evento, para quem e em quanto tempo? (c7p21)

- **Layout 9,1:** auditoria 9.10 em 1920 × 1080 e 9.10 em 1400 × 900; varredura limpa nos cenários medidos
- **Legib. 9,0:** menor fonte 1.73% da altura (dt:Evento)
- **Beleza 9,0:** c7p21-ini-1920.png e c7p21-todos-1366.png: a linha do tempo das três partições domina; a legenda (barra cheia, tracejada) agora fica dentro da figura, na coluna dos rótulos; o contrato ganhou duas linhas inteiras, Finalidade e Regra do nível, com dt e dd na mesma linha, sem nada cortado nas duas resoluções.
- **Didática 9,0:** O pedido da rodada foi atendido: o contrato declara 'Finalidade: provisão de estágio 1 (Res. CMN 4.966/2021) e corte (slide 32): nível corrente' e 'Regra do nível: após a prova, intercepto em todas as safras maturadas fora do treino' (FINALIDADE, s02-contrato.tsx), e a leitura diz 'Finalidade e regra do nível decidem o slide 36. Próximo: a armadilha da acurácia' (log.json c7p21-ini-1920). A regra bate com o que o slide 36 aplica (ANCORA.recentes = validação e janela, dados.ts). Previsão antes do seletor (desab={prev === null}), retornos A e C nomeiam a confusão, Tentar outra presente.
- **Interação 9,0:** Seletor 'Só aprovados / Aprovados e recusados' muda taxa (11,0% para 17,9%), AUC (0,7257 para 0,7548), o contrato (População, Janela, Recusadas) e a leitura (c7p21-todos-1366.png); Restaurar volta a só aprovados com a previsão aberta e o subtítulo em pergunta (log.json c7p21-rest-1920).
- **Rigor 9,0:** Conferido com npx tsx (a/c-outros.ts): N 737, D 81, taxa 10,99%, AUC por pares 0,72569 (tela 0,7257), população completa 0,7548 e 17,918%; recusadas R = 340, 112 defaults, aprovação 68,4% (tela 'cerca de 340', 'perto de 68%', declarados como aproximação na fonte). Finalidade correta: PD de 12 meses é a do estágio 1 da 4.966. npm test do capítulo passa.
- **Acess. 10,0:** axe sem violações; teclado, foco e movimento reduzido conferidos

### 3. Aprovar todos pode produzir alta acurácia (c7p2)

- **Layout 9,4:** auditoria 9.40 em 1920 × 1080 e 9.40 em 1400 × 900; varredura limpa nos cenários medidos
- **Legib. 9,0:** menor fonte 1.73% da altura (span.q7-sr:Decisão)
- **Beleza 9,0:** Captura c7p2-revelado: pictograma de 100 marcas (11 cheias vinho, 89 anéis), matriz com FP e FN no tom de decisão e VN destacado com 656, KPI 89,0% dominante no painel. Antes da previsão as células ficam em "?" (captura 03-c7p2-palco).
- **Didática 10,0:** Previsão com matriz oculta; retornos nomeiam cada confusão (A: "11% é a prevalência... Quanto ela acerta?"; B: sorteio; D: "depende só de quantos pagaram"), Tentar outra, e a matriz só abre no acerto. O erro clássico é desmontado com o dado: "a logística, recusando PD ≥ 12%, acerta 73,3% e recusa 48 dos 81", contra 89,0% de quem não recusa ninguém. Leitura liga ao slide 4.
- **Interação 10,0:** O controle de defaults (1% a 50% da carteira de 737) muda a raridade, que é a causa do título, e a acurácia, a matriz e a frase respondem ("quanto mais raro o evento, maior a acurácia de não fazer nada"); botões "Voltar à janela real: 81" e "Carteira com 2%"; liberado só no acerto.
- **Rigor 9,0:** npx tsx: confusao(Y,PL,0,12) dá vp 48, fp 164, fn 33, vn 492, acurácia 0,7327; 656/737 = 89,0%. Denominadores na tela (656 acertos de 737; 0 de 81). Cenário do controle declarado ilustrativo; regra de recusa na fonte.
- **Acess. 10,0:** axe sem violações; teclado, foco e movimento reduzido conferidos

### 4. Ordenar, prever e decidir são tarefas distintas (c7p3)

- **Layout 9,1:** auditoria 9.10 em 1920 × 1080 e 9.10 em 1400 × 900; varredura limpa nos cenários medidos
- **Legib. 9,0:** menor fonte 1.73% da altura (span:deu default)
- **Beleza 9,0:** Captura c7p3-certa: três faixas (fila de cartões, escala de PD, decisão) com círculos tracejados nas posições originais, vinho e anel para classe, laranja para recusa; painel lateral com igual e mudou. Rótulos de PD alternam acima e abaixo sem colisão.
- **Didática 9,0:** Previsão com δ = +0,8 e corte de 12%; retornos nomeiam "nível com ordem" e "ordenar com decidir"; no acerto a leitura diz "o nível mudou a decisão de #137. O nível importa quando o corte é em PD" e liga ao slide 5.
- **Interação 10,0:** Dois controles que são as causas do título: δ em log odds (nível) e corte (decisão); a tabela "A fila / As PDs / Decisões pelo nível / Decisões pelo corte" e as contagens "3 de 4" respondem; Restaurar zera δ, corte e previsão.
- **Rigor 9,0:** npx tsx: QUATRO = #85 20%, #194 16%, #137 11%, #312 5%; σ(logit p + 0,8) = 35,7%, 29,8%, 21,6%, 10,5%, iguais à captura; só #137 cruza 12%. Fonte declara PD em pontos inteiros e a fórmula p' = σ(logit p + δ).
- **Acess. 10,0:** axe sem violações; teclado, foco e movimento reduzido conferidos

### 5. A fila de risco é o que as métricas de ordenação leem (c7p4)

- **Layout 9,1:** auditoria 9.10 em 1920 × 1080 e 9.10 em 1400 × 900; varredura limpa nos cenários medidos
- **Legib. 9,0:** menor fonte 1.73% da altura (span.q7-ficha-id:115)
- **Beleza 9,0:** Captura c7p4-fim: 20 fichas em duas linhas com PD em destaque, D vinho para default, borda e régua marcando as 5 primeiras; quatro clientes do slide 4 sublinhados; KPIs "2 de 5" contra "1,25" ao lado.
- **Didática 9,0:** Sequência ordenar, apostar, revelar de cima para baixo; retornos nomeiam "fila com sorteio" (média 1,25) e "boa ordem com ordem perfeita" ("PD de 20% ainda quer dizer que 8 em 10 pagam"); leitura final com 2 dos 5, perfeita 5, acaso 1,25, e ligação aos slides 4 e 6.
- **Interação 9,0:** Botões Ordenar pela PD, Revelar o próximo, Revelar todos e Restaurar; revelar só abre depois da aposta (pode = ordenada && esc !== null); a leitura acompanha "x defaults em y posições até aqui".
- **Rigor 9,0:** npx tsx: ordenando MINI por PD e número, o topo é #85 D, #64, #179 D, #194, #383: 2 defaults; acaso 5 × 5/20 = 1,25. Fonte declara semente 3, PD em pontos inteiros, desempate pelo número e "não somar com os da janela (737)".
- **Acess. 10,0:** axe sem violações; teclado, foco e movimento reduzido conferidos

### 6. AUC é uma disputa entre um default e um adimplente (c7p5)

- **Layout 9,4:** auditoria 9.40 em 1920 × 1080 e 9.40 em 1400 × 900; varredura limpa nos cenários medidos
- **Legib. 9,0:** menor fonte 1.73% da altura (dd:PD do default e do adimplente )
- **Beleza 9,0:** Captura c7p5-mil: par sorteado em dois cartões com o sinal "<" entre eles, série acumulada convergindo à linha tracejada da AUC exata 0,7257, contagens ao lado e fórmula compacta. O eixo de sorteios acompanha n.
- **Didática 9,0:** Aposta antes do primeiro sorteio; retornos nomeiam "fila ao acaso" e "ordem quase perfeita" (com ligação à fila do slide 5); linha da AUC exata só depois de 100 sorteios; leitura final "probabilidade sobre pares, não acurácia".
- **Interação 9,0:** Sortear 1 par, +10, +100 e Restaurar; semente 20261006 declarada ("Restaurar repete a mesma sequência"); contagens de acertos, empates e inversões respondem; par escolhido à mão na mini base, fora da contagem.
- **Rigor 9,0:** npx tsx: aucPorPares(Y,PL) = 0,72569 com 38.559 corretos, 2 empates, 14.575 inversões, 53.136 = 81 × 656 pares, igual à fonte; fórmula P(sD > sA) + ½ P(sD = sA) correta.
- **Acess. 10,0:** axe sem violações; teclado, foco e movimento reduzido conferidos

### 7. A AUC exata conta todos os pares, com meio ponto por empate (c7p22)

- **Layout 9,1:** auditoria 9.10 em 1920 × 1080 e 9.10 em 1400 × 900; varredura limpa nos cenários medidos
- **Legib. 9,0:** menor fonte 1.73% da altura (span:Leitura)
- **Beleza 9,0:** Captura c7p22-ini.png e c7p22-plena.png: a matriz 5 × 15 é a peça e prova o título célula a célula (1, ½, 0), somas por linha à direita, empate #179 × #64 destacado em precisão plena.
- **Didática 9,0:** A linha do #85 vem preenchida como exemplo; a previsão só abre depois de 'Todos os pares' e é dedutível da tela (½ ÷ 75 = 0,0067 nos dois sentidos); retornos A e C nomeiam a confusão; leitura 'Soma 60,0 sobre 75 pares: AUC 0,8000 ... contra 0,8067 em pontos inteiros'.
- **Interação 9,0:** Clique em célula dá a leitura do par (c7p22-cel: '#179 (17%) contra #536 (15%): ... vale 1'); modo Um par / Todos os pares; a resposta certa troca a PD para precisão plena e a AUC cai; Restaurar limpa tudo.
- **Rigor 9,0:** Rodado aucPorPares: inteiros 60 corretos, 1 empate, 14 invertidos, AUC 0,80667; plena 60, 0, 15, AUC 0,8000; #179 16,74% contra #64 17,19%; janela 0,72569. Fonte declara que os 75 pares não são independentes.
- **Acess. 10,0:** axe sem violações; teclado, foco e movimento reduzido conferidos

### 8. Cada corte transforma a fila numa matriz de confusão (c7p23)

- **Layout 9,1:** auditoria 9.10 em 1920 × 1080 e 9.10 em 1400 × 900; varredura limpa nos cenários medidos
- **Legib. 9,0:** menor fonte 1.73% da altura (span.q7-ficha-id:179)
- **Beleza 9,0:** Captura c7p23-taxas: fila com a fronteira laranja "corte 14%", matriz com VP e VN neutros e FP e FN no tom de decisão, três taxas com numerador e denominador escritos ("50% = VP ÷ (VP + FP) = 4 ÷ 8").
- **Didática 9,0:** Taxas uma por vez; antes da precisão, aposta entre 80%, 50% e 100% com retornos que nomeiam a confusão ("80%: é o recall (÷ 5 defaults); a precisão divide pelos 8 recusados"; "recusar não garante default"); leitura com 4 evitados, 4 bons recusados, 1 default aprovado e ligação ao slide 9.
- **Interação 10,0:** O controle de corte (2% a 21%) é a causa do título: desloca a fronteira na fila e as quatro contagens, as taxas e a aposta (que se refaz com os valores do novo corte) respondem; Restaurar volta a 14%.
- **Rigor 9,0:** npx tsx: confusao(MINI, 0,14) dá vp 4, fp 4, fn 1, vn 11, sensibilidade 0,8, especificidade 0,733, precisão 0,5, iguais à captura. "Positivo é a recusa" declarado; fonte com regra PD ≥ corte e desfecho em 12 meses.
- **Acess. 10,0:** axe sem violações; teclado, foco e movimento reduzido conferidos

### 9. A ROC percorre todos os cortes da fila (c7p6)

- **Layout 9,4:** auditoria 9.40 em 1920 × 1080 e 9.40 em 1400 × 900; varredura limpa nos cenários medidos
- **Legib. 9,0:** menor fonte 1.73% da altura (span.q7-sr:Decisão do modelo)
- **Beleza 9,0:** Capturas c7p6-meio e c7p6-janela: ROC quadrada dominante à esquerda, diagonal rotulada "sorteio: AUC 0,5", ponto do corte em laranja; à direita a matriz do mesmo corte e a fila do slide 8 com a fronteira. Na janela, a área sombreada e a matriz 48, 164, 33, 492.
- **Didática 9,0:** Previsão a cada passo (sobe, direita, diagonal) com retorno que nomeia a confusão ("Subir é recusar um default... Recusar um adimplente é falso positivo"); Tentar outra desfaz o passo; ao fim, "A área sob a curva é 0,8067, a mesma AUC da contagem de pares (slide 7)"; na janela, ligação ao slide 11.
- **Interação 10,0:** Baixar o corte, Voltar, Reproduzir (sem reprodução automática com movimento reduzido, conforme funcional-c7.txt) e Restaurar; na janela, controle de corte que move o ponto e a matriz da janela. O aluno muda o corte e vê o ponto da ROC, a matriz e TPR e FPR responderem.
- **Rigor 9,0:** npx tsx: curvaRoc(MINI) dá os passos 20% (0,2; 0), 17% (0,4; 0,067) em diagonal pelo empate, 15% (0,4; 0,267); areaTrapezio = 0,8067; na janela 723 PDs distintas e confusao(Y,PL,0,12) = 48, 164, 33, 492. Denominadores nos eixos (de 5, de 15; 81 e 656).
- **Acess. 10,0:** axe sem violações; teclado, foco e movimento reduzido conferidos

### 10. O que a AUC responde e o que deixa em aberto (c7p24)

- **Layout 9,1:** auditoria 9.10 em 1920 × 1080 e 9.10 em 1400 × 900; varredura limpa nos cenários medidos
- **Legib. 9,0:** menor fonte 1.73% da altura (span:Leitura)
- **Beleza 9,0:** Capturas tmp/revisao6/a/shots/p24-op1.png, p24-op1-1366b.png, p24-op1-embaralhada.png, p24-op1-invertida-1366.png, p24-op1-verdadeira.png. O pedido da rodada anterior foi atendido: a ROC do cenário agora usa o azul de ordenação tracejado nos quatro cenários (classe 'ord q7-s10-trac' em s10-limites-auc.tsx), e na crescente o cinza aparece entre os traços. Ponte sem cruzamento na crescente, feixe único na invertida, marcas empilhadas com haste fora da faixa entre os eixos. Nada cortado nem sobreposto.
- **Didática 9,0:** O defeito da rodada anterior foi resolvido: o subtítulo, a leitura e o bloco 'O que a AUC não diz' dependem de acertou = esc !== null && OPS[esc].certa. Com alternativa errada (p24-op0.png, p24-op0-emb.png, p24-op3-inv.png) o subtítulo continua pergunta ('Um número como 0,7257 mede exatamente o quê?') e a leitura diz só 'Essa frase não vale. Troque o cenário... use Tentar outra'; retornos nomeiam acurácia, nível e corte. Com a certa (p24-op1.png) entra o subtítulo do roteiro e as leituras por cenário; na PD verdadeira a leitura agora fala da ponte: 'A verdadeira troca 41 dos 190 pares da logística e ainda ordena melhor' (p24-op1-verdadeira.png). Tentar outra volta à instrução (p24-tentar.json).
- **Interação 9,0:** Seletor de quatro cenários redesenha a ponte, a ROC e a AUC do subtítulo do gráfico mesmo antes da resposta (o aluno testa a frase); previsão com retorno e Tentar outra; 21 capturas sem erro de console.
- **Rigor 10,0:** Rodado (tmp/revisao6/a/num.ts): cruzamentos na mini base 0, 85, 190 e 41; AUC 0,72569 (crescente igual à logística), 0,50139, 0,27431, 0,73733; AUC média nas 300 réplicas 0,70256 (PT) contra 0,66733 (PL); logística acima em 9 de 300. Tudo igual ao que a tela mostra. A frase da invertida foi corrigida: 'Aqui é sentido trocado do escore, não um modelo pior que o acaso: 1 − AUC devolve 0,7257' (p24-op1-invertida-1366.png). Mostra a incerteza que muda a conclusão (9 de 300 réplicas em que a logística supera a verdadeira), com semente e número de sorteios na fonte.
- **Acess. 10,0:** axe sem violações; teclado, foco e movimento reduzido conferidos

### 11. KS: onde as duas distribuições mais se separam? (c7p7)

- **Layout 9,4:** auditoria 9.40 em 1920 × 1080 e 9.40 em 1400 × 900; varredura limpa nos cenários medidos
- **Legib. 9,0:** menor fonte 1.73% da altura (span:Leitura)
- **Beleza 9,0:** Captura c7p7-max: uma peça principal com as duas acumuladas (vinho para defaults, cinza para adimplentes), barra azul do KS 0,3621 com rótulo em halo e o corte econômico tracejado em laranja; legenda com marca além da cor (● e ○).
- **Didática 10,0:** Antecipa e desmonta o erro do tema com o dado: "O corte do KS é o de maior resultado esperado?"; só no acerto aparecem a barra do KS em 9,75% e o corte econômico em 14,0% no mesmo gráfico ("KS não é corte"). O retorno de A dá o peso implícito do KS, um default aprovado igual a cerca de 8 bons recusados (656 ÷ 81); leitura liga aos slides 9 e 32.
- **Interação 10,0:** O controle de corte (passo 0,25 ponto) é a definição do KS em ação: a distância "40,7% · 33 de 81 menos 16,0% · 105 de 656 = 0,2473" responde a cada posição até o máximo; Ir ao máximo, Corte econômico depois do acerto, Restaurar; funcional-c7.txt confirma setas no controle e foco visível em "Ir ao máximo".
- **Rigor 9,0:** npx tsx: ks(Y,PL) = 0,36209 no limiar 0,097464 com 272 recusadas, TPR 0,6914 (56 de 81), FPR 0,3293 (216 de 656), iguais à captura; corte econômico 0,14 do mesmo motor de economia.ts. KS = máx(TPR menos FPR) correto e peso A/D correto.
- **Acess. 10,0:** axe sem violações; teclado, foco e movimento reduzido conferidos

### 12. Que parcela dos defaults está nos 10% mais arriscados? (c7p8)

- **Layout 9,4:** auditoria 9.40 em 1920 × 1080 e 9.40 em 1400 × 900; varredura limpa nos cenários medidos
- **Legib. 9,0:** menor fonte 1.73% da altura (span.q7-kpi-r:Ganho acumulado)
- **Beleza 9,0:** Captura c7p8-cinquenta: curva de ganho entre a diagonal do acaso e a fila perfeita pontilhada, área até a fração examinada, ponto laranja com 79,0%; barras por faixa de 10% no canto que a curva não ocupa, faixa atual em laranja.
- **Didática 9,0:** Antes de revelar só aparecem acaso e fila perfeita; retornos nomeiam "acaso" e "superestima a ordem" (com a perfeita em 91%, 74 de 81); leitura com 64 dos 81, ganho 79,0%, "só 8 de 74, abaixo da taxa da carteira" e ligação ao slide 13.
- **Interação 9,0:** Controle da fração examinada (5% a 100%) e atalhos 10%, 20%, 30%; curva, ponto, barras e KPIs respondem; Restaurar; a fração compartilhada com o slide 13 é exceção documentada em estado.ts.
- **Rigor 9,0:** npx tsx: ganho(Y,PL,0,1) = 22 de 81 em 74 examinados (27,2%); 0,3 dá 49 de 81 em 221; 0,5 dá 64 de 81 em 369; faixas 22, 12, 15, 7, 8, 4, 5, 4, 3, 1 somam 81. Fonte declara desempate e a regra ⌊q·737 + ½⌋.
- **Acess. 10,0:** axe sem violações; teclado, foco e movimento reduzido conferidos

### 13. Lift: quantas vezes melhor que escolher ao acaso? (c7p25)

- **Layout 9,4:** auditoria 9.40 em 1920 × 1080 e 9.40 em 1400 × 900; varredura limpa nos cenários medidos
- **Legib. 9,0:** menor fonte 1.73% da altura (span:Leitura)
- **Beleza 9,0:** Captura 13-c7p25-palco: linha do lift acumulado com ponto laranja 2,71×, linha tracejada do acaso em 1×, barras de faixa com o valor no topo; painel com a conta explícita.
- **Didática 9,0:** Aposta antes de embaralhar; retornos nomeiam "nível das PDs com a ordem" e "zero seria um topo sem nenhum default"; a leitura desfaz a confusão entre ganho e taxa com o dado ("27,2% dos defaults capturados e 29,7% de inadimplência entre os examinados").
- **Interação 10,0:** Embaralhar a fila é mudar a causa (a ordem) mantendo as PDs: o lift dos 10% cai de 2,71× para 0,86× (7 ÷ 74) e a curva achata em 1; o controle de fração e Restaurar completam.
- **Rigor 10,0:** npx tsx: lift 0,1 = 2,705 (22 ÷ 74 ÷ 81/737); embaralhada AUC 0,5014 e lift 0,861; liftFaixa da faixa 30% a 40% embaralhada 1,721 contra 1,496 da faixa 10% a 20% da logística, como na leitura. Denominadores à vista (22 ÷ 74; 81 ÷ 737), semente 7 declarada, e a leitura mostra a limitação que muda a conclusão: uma faixa de 74 casos oscila tanto que a fila sorteada supera a logística.
- **Acess. 10,0:** axe sem violações; teclado, foco e movimento reduzido conferidos

### 14. Com evento raro, precisão e recall contam outra história (c7p26)

- **Layout 9,4:** auditoria 9.40 em 1920 × 1080 e 9.40 em 1400 × 900; varredura limpa nos cenários medidos
- **Legib. 9,0:** menor fonte 1.73% da altura (span:Leitura)
- **Beleza 9,0:** Captura c7p26-ini.png e c7p26-certa.png: curva PR é a peça, linha do acaso rotulada, corte em laranja de decisão com rótulo; na hipótese, a curva da janela vai a cinza e a nova tracejada, com legenda.
- **Didática 9,0:** Previsão com três números plausíveis (24%, 11%, 5%); retorno B nomeia a confusão ('11% é o acaso nesta janela; com 2%, o acaso cai para 2%'); leitura com 23,9% e 2,2× a prevalência, e ponte com a ROC do slide 9.
- **Interação 10,0:** Corte e prevalência são as causas do título: com 2% a curva inteira desce e o corte de 15% vai a 4,9% (c7p26-certa.png); com corte 10% vai a 4,1% e recall 67,9% (c7p26-pi10.png); Voltar à janela e Restaurar.
- **Rigor 9,0:** Rodado: corte 15%: VP 33, FP 105, precisão 23,9%, Wilson 17,6% a 31,7%, recall 40,7%; com π = 2%, 4,94%; AP 0,2554 e trapezoidal 0,2476. Denominadores visíveis; hipótese declarada como cálculo.
- **Acess. 10,0:** axe sem violações; teclado, foco e movimento reduzido conferidos

### 15. Só a ordem move AUC, KS, ganho e lift (c7p27)

- **Layout 9,1:** auditoria 9.10 em 1920 × 1080 e 9.10 em 1400 × 900; varredura limpa nos cenários medidos
- **Legib. 9,0:** menor fonte 1.73% da altura (span:Leitura)
- **Beleza 9,0:** Capturas tmp/revisao6/a/shots/p27-ini.png, p27-op2.png, p27-ruido3-1366.png, p27-inv.png: quatro pequenos múltiplos na mesma linguagem (cenário azul de ordenação, logística cinza, acaso tracejado), tabela logística → cenário com seta, controle de nível sob os gráficos; nada sobreposto ou cortado nas duas resoluções.
- **Didática 10,0:** Os dois pedidos da rodada anterior foram atendidos: o retorno certo não cita mais o nível ('Isso: a mesma constante em log odds sobe todas as PDs e ninguém troca de lugar', p27-op2.png), e a leitura do ruído diz que o nível subiu e que o intercepto o corrige: 'A PD média sobe de 9,7% para 25,3%, erro que um intercepto corrige; o que derruba as quatro juntas são os pares trocados' (p27-ruido3.json; σ = 1: 12,9%, p27-ruido1.json; σ = 0: 'fica em 9,7%'). Retornos errados nomeiam a confusão (p27-op0.png: nível com ordem; op1: corte na fila com corte de PD; op3: calibração com ordenação). Antes da certa os cenários ficam travados (p27-cen-antes: clique em Fila invertida recusado) e nada revela a resposta. O aluno vê o erro comum desmontado no dado: nível de −1,5 a +1,5 leva a PD média de 2,5% a 29,9% com a tabela parada em 0,7257 → 0,7257 (p27-nivm15.json, p27-niv15.json).
- **Interação 10,0:** Controle de nível é o experimento do título; cenários e ruído movem as quatro juntas (σ = 3: 0,6249, 0,236, 13 de 81, 1,6×); combinação ruído 3 com nível +1,5 mantém as quatro e leva a média de 25,3% a 39,7% (p27-ruido3-niv15.json); Restaurar volta à logística com previsão em aberto (p27-rest.json); sementes declaradas.
- **Rigor 9,0:** Rodado (tmp/revisao6/a/num.ts): +1 dá média 21,41% com AUC 0,72569, KS 0,36209, 22 capturados, lift 2,705; −1,5 dá 2,46%; +1,5 dá 29,95%; σ = 1, 2, 3 dão média 12,86%, 19,25%, 25,26% e AUC 0,6842, 0,6429, 0,6249; invertida KS 0,00305, 1 capturado, lift 0,12. O guia foi corrigido (content/capitulo7/paginas.json, c7p27: resposta 'Sim: ruído simétrico em log odds infla a média (9,7% para 12,9% com σ = 1 e 25,3% com σ = 3)'; leitura descreve os quatro múltiplos e a tabela; o seletor de foco sumiu). npm test do capítulo: 97 de 97.
- **Acess. 10,0:** axe sem violações; teclado, foco e movimento reduzido conferidos

### 16. Uma boa fila ainda pode cobrar o risco errado (c7p28)

- **Layout 9,1:** auditoria 9.10 em 1920 × 1080 e 9.10 em 1400 × 900; varredura limpa nos cenários medidos
- **Legib. 9,0:** menor fonte 1.73% da altura (span.q7-kpi-r:AUC)
- **Beleza 9,0:** c7p28-opC-1920.png e c7p28-min-1366.png: dois blocos de barras (72 e 136 defaults esperados; R$ 607 mil e R$ 1,16 mi) com a linha vinho do observado e rótulo direto; B hachurado além da cor; cartões com AUC 0,7257 iguais; nada sobreposto em −1,00 nem em +1,50.
- **Didática 9,0:** O 'corrigir' anterior foi resolvido: o retorno certo agora termina em 'Qual nível vai para produção, e com que amostra? O slide 36 responde com a regra do slide 2' (log.json c7p28-opC-1920), sem a PD de produção de 12,0% (ANCORA.recentes.pdMedia = 0,1201, que não aparece em nenhum estado; o import de ANCORA saiu do arquivo). O guia diz 'Não antecipe o número'. Retornos A (71,6 contra 81, ainda subestima) e B (136,3 contra 81) nomeiam a confusão; leitura define LGD e EAD e liga ao slide 32.
- **Interação 10,0:** O controle de −1,0 a +1,5 move defaults e perda (R$ 246 mil em −1,00, R$ 1,89 mi em +1,50) com a AUC parada em 0,7257 (c7p28-min-1366.png, log.json c7p28-max-1920): o aluno muda o nível e vê o custo mudar sem a fila mudar, que é o título. 'B no total observado' leva a +0,15 e R$ 687 mil; Restaurar volta a +0,80 e reabre a previsão.
- **Rigor 9,0:** Conferido (a/c-outros.ts): Σ PD 71,64; com +0,8, 136,30; perda A R$ 606.772, B R$ 1.160.790, observada R$ 686.732, em −1,0 R$ 245.892; ajuste 0,1451 dá PD média 10,99% = taxa da janela; AUC de B em +1,5 igual a 0,72569; LGD 65% de PARAMETROS.lgd. Fonte com base, safras e normas.
- **Acess. 10,0:** axe sem violações; teclado, foco e movimento reduzido conferidos

### 17. Uma PD de 10% fala de um grupo, não de uma pessoa (c7p9)

- **Layout 9,4:** auditoria 9.40 em 1920 × 1080 e 9.40 em 1400 × 900; varredura limpa nos cenários medidos
- **Legib. 9,0:** menor fonte 1.73% da altura (span.q7-kpi-r:Defaults esperados)
- **Beleza 9,0:** Grade de 100 propostas com contorno dos esperados ao lado do histograma das amostras, com a binomial só depois do acerto; vinho para default, petróleo para o esperado (c7p9-50-1920.png).
- **Didática 9,0:** Título provisório em pergunta até o acerto; binomial e '+50 amostras' travados; retornos A ('confunde a PD de um grupo com uma contagem garantida') e C ('confunde incerteza com ignorância') com 'Tentar outra'; leitura com as contagens (amostra 70: 13; média 10,3) e ligação aos slides 18 e 21.
- **Interação 10,0:** PD de 2% a 30%, 'Nova amostra', '+50 amostras', origem simulação ou janela, 'Restaurar'; sementes 20261017 + n. O aluno muda a PD e sorteia, e vê a contagem variar em torno do esperado.
- **Rigor 9,0:** Conferido com SciPy: Bin(100; 0,1) tem P(X ≤ 4) = 0,0237 e P(X ≤ 16) = 0,9794, logo 5 a 16 cobre 95,6%; P(X ≥ 25) = 1,3 × 10⁻⁵ (tela 0,0013%). Na janela, 10 defaults em 100 com PD média 9,7%, Wilson 5,5% a 17,4%. Simulação declarada fora da base.
- **Acess. 10,0:** axe sem violações; teclado, foco e movimento reduzido conferidos

### 18. Média prevista igual à observada não prova calibração (c7p29)

- **Layout 9,1:** auditoria 9.10 em 1920 × 1080 e 9.10 em 1400 × 900; varredura limpa nos cenários medidos
- **Legib. 9,0:** menor fonte 1.73% da altura (span:0,3: comprime)
- **Beleza 9,0:** Capturas tmp/revisao5/a/shots/c7p29-logantes.png, c7p29-b07.png, c7p29-log.png: barras de previsto (verde de probabilidade) e observado (vinho de default) com intervalo de Wilson e rótulos; metades ocultas com '?' até a previsão; seletor visivelmente desabilitado antes da resposta.
- **Didática 9,0:** Título e subtítulo são perguntas até a resposta certa (c7p29-logantes.png); retornos A e C nomeiam a confusão; leitura com 9,2% contra 4,9% e 12,8% contra 17,1%, O/E 1,00 e ponte para o slide 19; na logística, Jeffreys com ponte para o 21; Tentar outra volta ao comprimido com a leitura própria (c7p29-log-tentar.png).
- **Interação 10,0:** O seletor Modelo fica travado até a resposta certa (desab={!revelado} em s18-global.tsx; o clique em Logística antes da previsão expira, botões listados como disabled em tmp/revisao5/a/shots/c7p29-logantes.json e c7p29-op0-log.json). Depois da certa, o controle b é o experimento do título: o total fica em O/E = 1,00 e a tabela de metades responde (b = 0,30: 0,53 e 1,34; b = 0,70: 0,71 e 1,13; b = 1: 0,90 e 1,03, conferido); Restaurar e Tentar outra voltam ao comprimido em b = 0,30.
- **Rigor 9,0:** Rodado (tmp/revisao5/a/num2.ts): comprimido b = 0,3 com a = −1,376, 81,00 esperados, metades 9,17% contra 4,88% (18 de 369) e 12,81% contra 17,12% (63 de 368); logística 71,64 esperados, O/E 1,1306, metades 1,037 e 1,161, Jeffreys 0,1233. A leitura depende do modelo em todos os estados: antes da resposta só existe o comprimido; depois, a logística tem frase própria (c7p29-log.png). O defeito da rodada anterior (frase falsa com a logística antes da resposta) não se reproduz.
- **Acess. 10,0:** axe sem violações; teclado, foco e movimento reduzido conferidos

### 19. Cada faixa vira um ponto: acima da diagonal, risco subestimado (c7p10)

- **Layout 9,4:** auditoria 9.40 em 1920 × 1080 e 9.40 em 1400 × 900; varredura limpa nos cenários medidos
- **Legib. 9,0:** menor fonte 1.73% da altura (span:Leitura)
- **Beleza 9,0:** O defeito da rodada anterior foi resolvido: com os intervalos ligados os rótulos defaults/n saem do desenho (lug = ic ? null : ... em s19-confiabilidade.tsx), e nenhum texto corta traço de intervalo nem a diagonal (tmp/revisao6/a/shots/p10-op1.png, p10-op1-1366.png). Sem intervalos, os rótulos ficam em lugar livre, sem tocar a diagonal nem a curva (p10-todas.png, p10-f5.png, p10-f8errou.png). Curva larga, eixo a 45% para caber F10 (20,5% a 40,9%), diagonal rotulada no canto vazio.
- **Didática 9,0:** Previsão antes de cada faixa com retorno que separa ruído de padrão quando cabe ('Desvio de 0,3 ponto, menor que o desvio padrão da frequência com 74 casos (3,0): ruído', p10-f5.png); previsão conceitual com retornos que nomeiam a confusão; conclusão com 10 de 10 dentro do intervalo e 6 de 10 acima com probabilidade 0,38 (p10-op1.png). O guia foi alinhado à tela ('o eixo vertical vai a 45%'; rótulos saem com os intervalos).
- **Interação 9,0:** Botões ▲ acima e ▼ abaixo constroem a curva faixa a faixa com acertos contados, Todas, Restaurar (p10-rest.json volta à instrução inicial); régua das 737 PDs destaca a faixa corrente (p10-f5.png).
- **Rigor 10,0:** Rodado faixasQuantis k = 10 (tmp/revisao6/a/num.ts): F1 1/74, PD 2,48%, intervalo 0,24% a 7,27%; F5 5/74, 7,08% contra 6,76%; F8 15/74, 13,10% contra 20,27%, 12,69% a 30,79%; F10 22/74, 25,15% contra 29,73%, 20,53% a 40,93%; 10 de 10 compatíveis; 6 acima com P = 0,37695; O/E 1,1306. Tudo bate com p10-op1.png e p10-todas.png. Fonte com n por faixa (73 ou 74) e Wilson de 95%; a hipótese da conta 0,38 (faixas independentes, ½ para cada lado) está escrita na leitura.
- **Acess. 10,0:** axe sem violações; teclado, foco e movimento reduzido conferidos

### 20. As faixas escolhidas mudam a leitura da curva (c7p30)

- **Layout 9,4:** auditoria 9.40 em 1920 × 1080 e 9.40 em 1400 × 900; varredura limpa nos cenários medidos
- **Legib. 9,0:** menor fonte 1.73% da altura (span:Leitura)
- **Beleza 9,0:** Capturas c7p30-ini, c7p30-certa, c7p30-corp: curva com ocupação ao lado, faixa vazia marcada no eixo e nunca como zero, frequência acima de 50% como ▲ com 3/5 = 60%, degraus do CORP desenhados como escada.
- **Didática 9,0:** Previsão sobre 20 faixas fixas; retornos A e C nomeiam a confusão (largura contra ocupação; pequena contra vazia); leituras com números (3 vazias e 10 com menos de 30; decis de 1,5% a 3,1% contra 19,6% a 45,2%); ligações aos slides 19, 25 e 30.
- **Interação 10,0:** Tipo de faixa e número de faixas (3 a 20) mudam a curva, a ocupação e a leitura na hora; é o próprio experimento do título; Restaurar volta a 10 decis.
- **Rigor 9,0:** Rodado faixasFixas com 20 bordas de 0% a 50%: ocupação 32, 181, 139, ..., 0, 0, 1, 0; 3 vazias, 10 pequenas, F14 com 3/5; corp: 11 degraus de 8 a 151 casos; 4 PDs acima de 35%. Convenção (a, b] declarada.
- **Acess. 10,0:** axe sem violações; teclado, foco e movimento reduzido conferidos

### 21. Cinco defaults em cem casos não são uma verdade exata (c7p31)

- **Layout 9,1:** auditoria 9.10 em 1920 × 1080 e 9.10 em 1400 × 900; varredura limpa nos cenários medidos
- **Legib. 9,0:** menor fonte 1.73% da altura (span:Leitura)
- **Beleza 9,0:** Capturas p31-ini.png, p31-n0-99.png, p31-n0-90-1366.png, p31-n10-90.png, p31-n3-99-1366.png: três linhas Wilson cheias com a normal tracejada abaixo, linha de 5%, eixo que vai a 35% em 99% (1 em 20: Wilson 0,6% a 31,8%) sem cortar nada; faixa abaixo de 0% em cinza com rótulo cinza; nenhum rótulo sobreposto nas 22 capturas do slide.
- **Didática 9,0:** Previsão antes de revelar (p31-ini.png, linha '? preveja ao lado'); retornos A e C nomeiam a confusão ('Confunde a frequência com o número de casos', 'Essa é a aproximação normal', p31-op0.png, p31-op2.json); leitura com números do estado e ponte explícita com o slide 19.
- **Interação 10,0:** Número de casos e nível mudam as três linhas, o eixo, a frase da normal e agora também a ponte: 90% com 2.000 casos 'intervalo de 90% de 4,3% a 5,9%. Com muitos casos, os dois métodos quase coincidem' (p31-n10-90.png); nível travado antes da resposta (p31-99antes.json: 90%, 95% e 99% desabilitados); Restaurar e Tentar outra voltam a 20 casos e 95% (p31-rest.json, p31-tentar.json).
- **Rigor 10,0:** O defeito da rodada anterior foi resolvido: a ponte usa o z escolhido (s21-wilson.tsx linha 25, ponte(z)) e a leitura diz o nível. Conferido com npx tsx (a/num.ts) contra a tela: 90% F8 13,70% a 28,94%, F9 10,53% a 24,75%, diferença −6,66 a +14,32 pp (tela 13,7% a 28,9%, 10,5% a 24,7%, −6,7 a +14,3, p31-n0-90-1366.png); 99% F8 10,93% a 34,50%, F9 8,18% a 30,29%, diferença −12,59 a +20,26 (tela 10,9% a 34,5%, 8,2% a 30,3%, −12,6 a +20,3, p31-n0-99.png); Wilson 1 em 20 a 99% 0,59% a 31,83%; normal 1 em 20 a 90% −3,0% a 13,0%. O intervalo da diferença contém o zero em todos os níveis e a tela tira daí que a inversão F8/F9 é compatível com ruído: a incerteza muda a conclusão. Guia do professor alinhado (paginas.json, c7p31, 99%: 10,9% a 34,5% e −12,6 a +20,3).
- **Acess. 10,0:** axe sem violações; teclado, foco e movimento reduzido conferidos

### 22. Erro de nível e erro de inclinação têm assinaturas diferentes (c7p32)

- **Layout 9,1:** auditoria 9.10 em 1920 × 1080 e 9.10 em 1400 × 900; varredura limpa nos cenários medidos
- **Legib. 9,0:** menor fonte 1.73% da altura (span:intercepto (slope 1):)
- **Beleza 9,0:** c7p32-opB-1920.png e c7p32-ini-1366.png: quatro miniaturas na mesma escala com um só '0%' na origem (yt sem o zero, Mini em s22), slope e intercepto numa linha abaixo; ampliado com eixo até o teto (90% em a = 2, b = 0,3, c7p32-f-a2b03-obs-1920.png) e ▲/▼ fora dos dados.
- **Didática 9,0:** O defeito anterior foi resolvido: os casos de inclinação giram em torno de aNeutro(b) (a = 1,386 e −1,064), com PD média 11,6% e intercepto com slope 1 igual a 0,00; NOME_DA_LEITURA(classificar(...)) devolve exatamente o nome do painel nos quatro casos prontos (a/c22.ts: ok true em Subestimação, Superestimação, Extremas e Comprimidas), e a leitura da tela diz 'erro de inclinação (PDs extremas demais, excesso de confiança), com o nível no lugar (PD média 11,6% contra 11,6%)' (c7p32-opB-1920.png). Um passo em a não troca o nome em nenhum dos quatro (a ±0,05 e com o encaixe do controle: 1,45 e 1,35 em Extremas seguem 'erro de inclinação, com o nível no lugar', log.json c7p32-f-ext-a+-1920).
- **Interação 10,0:** a e b criam a assinatura e todos os números respondem (slope 2,00 e intercepto 0,10 em b = 0,50, c7p32-f-comp-b+-1366.png; slope 3,79 com IC 2,68 a 4,91 em a = 2, b = 0,3, observada); quatro cartões ampliam, frequência esperada ou observada, Ver os quatro e Restaurar (volta aos cartões, previsão aberta e esperada, log.json c7p32-rest-1920). Sem erro de console nos 38 estados.
- **Rigor 9,0:** Conferido (a/c22.ts, a/c-outros.ts): esperada dá slope 1 e intercepto ∓0,70 nos casos de nível e slope 1/b (0,5556 e 2,2222) com intercepto 0 nos de inclinação; observada de Extremas slope 0,632 (IC 0,446 a 0,818), tela 0,63 (0,45 a 0,82); PD verdadeira na janela intercepto 0,18 e slope 1,14 (tela igual); guia a = 0,70, b = 2,20: PD média 4,4%, intercepto 1,33, slope 0,45, igual à biblioteca. Incerteza na tela (IC do slope e slope 1,14 da referência).
- **Acess. 10,0:** axe sem violações; teclado, foco e movimento reduzido conferidos

### 23. Brier: o custo quadrático de errar a probabilidade (c7p33)

- **Layout 9,4:** auditoria 9.40 em 1920 × 1080 e 9.40 em 1400 × 900; varredura limpa nos cenários medidos
- **Legib. 9,0:** menor fonte 1.73% da altura (span:Leitura)
- **Beleza 9,0:** c7p33-n+1-1920.png: régua de quatro linhas domina, '0,10336 (fora do eixo)' em +1,00, margens laterais maiores (escala com fs * 1,6); inserção do cliente ao lado (c7p33-cli-1366.png: Default com PD 2% custa 0,9604), eixo y da inserção sem o zero duplicado.
- **Didática 10,0:** O 'corrigir' anterior foi resolvido: o retorno certo acompanha o controle e usa o mesmo intervalo da leitura: em 0 '6,9% abaixo'; em +0,45 '6,2% abaixo, sem descartar empate'; em +1,00 '5,4% acima, sem descartar empate'; em −1,00 '0,6% acima, sem descartar empate' (log.json c7p33-*-1920). Varri os 41 níveis de −1 a +1 (a/c23.ts): retorno e leitura concordam em todos, e nenhum nível dá diferença significativamente positiva (onde a leitura diria empate por engano). O slide desmonta o erro comum com o dado: a constante que não separa ninguém também tem Brier perto de zero (0,09803).
- **Interação 10,0:** O nível da logística é o experimento: em +1,00 Brier 0,10336, IC −0,0050 a 0,0156, razão DSC/MCB 0,6; em +0,45 o intervalo passa a conter o zero; cliente Pagou ou Default responde (0,0100 com PD 10%; 0,9604 com Default e PD 2%); Restaurar volta a tudo (log.json c7p33-rest-1920).
- **Rigor 10,0:** Conferido (a/c23.ts): Brier 0,091276, constante do treino 0,098031 = brierConstante(9,56%, 10,99%), constante da janela 0,097826, PD verdadeira 0,090371, diferença −0,0068 (−0,0108 a −0,0027), DSC/MCB 3,7; tela igual. A leitura traz a incerteza que muda a conclusão (intervalo pareado: 'melhor que a referência' em 0, 'não descarta empate' em +1,00) e diz que o Brier soma calibração e separação.
- **Acess. 10,0:** axe sem violações; teclado, foco e movimento reduzido conferidos

### 24. Log loss: confiança errada custa caro (c7p34)

- **Layout 9,1:** auditoria 9.10 em 1920 × 1080 e 9.10 em 1400 × 900; varredura limpa nos cenários medidos
- **Legib. 9,0:** menor fonte 1.73% da altura (span:0,1%)
- **Beleza 9,0:** Brier e log loss lado a lado, cada um no seu eixo, curva cheia contra tracejada, chave laranja marcando a subida de 1% para 0,1% (c7p34-prev-c-1920.png).
- **Didática 9,0:** Título provisório até o acerto; log loss oculta; retornos A ('confunde as duas escalas') e B (vale para o Brier, não para a log loss) com 'Tentar outra'; leitura com 0,990 e 5,298; ligações aos slides 17, 23 e 25.
- **Interação 10,0:** PD de 0,1% a 99,9%, desfecho e atalho: o aluno empurra a PD para o extremo e vê a log loss crescer sem teto enquanto o Brier para em 1; 'Restaurar'.
- **Rigor 9,0:** Conferido: Δ Brier = 0,999² − 0,99² = 0,0179 (tela 0,018) e Δ log loss = ln 10 = 2,303 (tela 2,30); log loss da logística 0,31487 contra 0,34745 da constante do treino, nenhuma previsão limitada pelo EPS (limitadas = 0).
- **Acess. 10,0:** axe sem violações; teclado, foco e movimento reduzido conferidos

### 25. Menor Brier não prova melhor calibração (c7p11)

- **Layout 9,1:** auditoria 9.10 em 1920 × 1080 e 9.10 em 1400 × 900; varredura limpa nos cenários medidos
- **Legib. 9,0:** menor fonte 1.73% da altura (span:Leitura)
- **Beleza 9,0:** Curva de A por decil com IC, B como quadrado rotulado, barras de MCB e DSC com '▲ fora' (p11-a0.png, p11-a1.4-1366.png); fórmula do cartão em duas linhas (p11-como.png).
- **Didática 10,0:** O detalhe anterior foi resolvido: 'Com a = 0: MCB de A 0,00242, dentro da banda 0,00185 a 0,00394' (p11-a0.png, aTxt em s25-brier-calibracao.tsx linha 56). Retornos A e C com números (a = 0,4: 0,09156 contra 0,09783; a = 1,4: 0,12412) e a confusão nomeada (p11-op0.json, p11-op2.json); a resposta certa abre em +0,7, onde a MCB 0,00633 sai da banda 0,00306 a 0,00586 com A ainda à frente: o aluno vê o erro 'menor Brier, melhor calibrado' acontecer (p11-op1.json). Isotônica, MCB, DSC e UNC definidos na tela.
- **Interação 10,0:** Nível de A de 0 a +1,4: em +0,7 MCB fora com A vencendo; em +1,2 'B passa a ter o Brier menor', MCB 0,02329, PD média 24,6% (p11-a1.2.json); em +1,4 0,12412 contra 0,09783 (p11-a1.4-1366.png). Restaurar presente.
- **Rigor 10,0:** Conferido (a/num.ts, a/s25.ts): virada em a = 0,8204 (tela 0,82); Brier a 0,4 = 0,091556; a 1,4 = 0,124119, MCB 0,035267, DSC 0,008974, UNC 0,097826; PD média a 1,2 = 24,61%. A banda de 200 sorteios declara o viés da MCB na amostra e é a incerteza que decide 'dentro' ou 'fora'; fonte com semente 20261025 e CORP.
- **Acess. 10,0:** axe sem violações; teclado, foco e movimento reduzido conferidos

### 26. Laboratório: boa fila, probabilidades ruins (c7p35)

- **Layout 9,1:** auditoria 9.10 em 1920 × 1080 e 9.10 em 1400 × 900; varredura limpa nos cenários medidos
- **Legib. 9,0:** menor fonte 1.73% da altura (span.q7-kpi-r:AUC)
- **Beleza 9,0:** Confiabilidade original em cinza e nova em petróleo, transformação desenhada, quatro KPIs com seta e valor anterior (c7p35-prev-c-1920.png).
- **Didática 9,0:** Título provisório; controles travados até o acerto; retornos A (calibração com ordenação) e B (as duas escalas, slide 24); leitura com os números; o 'melhor ajuste' se declara otimista e aponta o slide 27.
- **Interação 10,0:** a e b livres, quatro atalhos e 'Restaurar'; a AUC fica em 0,7257 em todos os estados enquanto Brier, log loss e curva mudam, que é o título.
- **Rigor 9,0:** Conferido: excesso com b = 2,2 e a = 2,214 mantém a PD média; Brier +3,81% e log loss +7,08% (tela +3,8% e +7,1%); AUC 0,7257 inalterada; melhor ajuste a = 0,392 e b = 1,122 com Brier 0,09089, isotônica 0,08885, ambos declarados otimistas.
- **Acess. 10,0:** axe sem violações; teclado, foco e movimento reduzido conferidos

### 27. Recalibrar exige uma amostra própria (c7p16)

- **Layout 9,1:** auditoria 9.10 em 1920 × 1080 e 9.10 em 1400 × 900; varredura limpa nos cenários medidos
- **Legib. 9,0:** menor fonte 1.73% da altura (span:Leitura)
- **Beleza 9,0:** Linha do tempo com espessura pelo n e setas que mudam com o modo e a âncora; na âncora validação e janela, chave à direita da janela, nó 'Nível a +0,25' e 'prova: safras seguintes (slide 37)' no lugar de 'mede' (p16-safras-recentes-1920.png, -1366.png); treino e validação com chave e 'a +0,10' (p16-safras-varias-1366.png); atalho com nó vermelho '✕ leu a prova' (p16-certa-atalho-1366.png); tabela de cinco âncoras com ● e fundo na linha ativa, linha da PD verdadeira em itálico. Sem sobreposição nas capturas.
- **Didática 9,0:** Os dois pedidos da rodada 7 foram atendidos: a leitura da âncora validação e janela diz 'O acerto tem sorte (réplicas, ao lado); a prova do nível vem das safras seguintes (slide 37)', e todas as âncoras terminam com 'A âncora não se escolhe por esta tabela: a regra está no contrato do slide 2, e o slide 36 a aplica', sem dizer qual vence (p16-safras-*-1920 em textos.json). Previsão antes do atalho, retornos A e B nomeiam a confusão (p16-altA, p16-altB). Leitura com os números de cada âncora (−1,9 pp, R$ 607 mil contra R$ 724 mil; só a janela −0,6 pp, R$ 687 mil, 'iguala a taxa da janela por construção').
- **Interação 9,0:** Previsão libera Protocolo, Atalho e Safras; no modo Safras, cada linha da tabela é um botão com aria-pressed que move a seta 'ajusta o nível', troca o a do nó (0,00; +0,34; +0,10; +0,15; +0,25) e a leitura (p16-safras-sem, -val, -varias, -janela, -recentes, nas duas resoluções); Restaurar volta à previsão (p16-restaurar-1366.png); réplicas da âncora calculadas só ao abrir Safras, com semente 20261043 na fonte; nenhum erro de console nas 26 capturas.
- **Rigor 9,0:** Recalculado de forma independente em Python (tmp/revisao8/b/conf.py, brentq e scipy, sem a biblioteca): validação a = 0,3413, 12,92%, O/E 0,850 e 0,900, R$ 808 mil; treino e validação 301/2.863, 10,59%, R$ 661 mil; só a janela a = 0,1451, 10,99% (igual à taxa), O/E verd. 1,059, R$ 687 mil; validação e janela a = 0,2518, 12,01%, 0,915 e 0,969, R$ 750.774 contra R$ 723.753; Jeffreys da validação p = 0,00109. Sorte da âncora: tela 12,3% (11,2% a 13,4%); pela distribuição exata do número de defaults (Poisson binomial das 737 PDs verdadeiras), média 12,32% e faixa de 11,30% a 13,42%; com outra semente em 2.000 réplicas, 12,32% e 11,30% a 13,42%. A diferença no limite inferior (11,2 contra 11,3) é erro de simulação da semente declarada. Log loss 0,3149, 0,3140, 0,3167, 0,3136 e esperadas 0,3439, 0,3419, 0,3409, 0,3437; 249 de 300 (npx tsx tmp/revisao8/b/lib.ts). Questão c7p16q reescrita e certa: 0,0018 com 81 defaults é ruído, o 0,3136 não vale, a recalibração vem da validação e da regra do contrato. npm test do capítulo passa (109 testes).
- **Acess. 10,0:** axe sem violações; teclado, foco e movimento reduzido conferidos

### 28. Correção de nível: um ajuste de intercepto (c7p12)

- **Layout 9,1:** auditoria 9.10 em 1920 × 1080 e 9.10 em 1400 × 900; varredura limpa nos cenários medidos
- **Legib. 9,0:** menor fonte 1.73% da altura (span:Leitura)
- **Beleza 9,0:** O defeito anterior foi resolvido: ▲ fica acima do eixo de cima e ▼ abaixo do de baixo, fora da faixa dos segmentos, nos dois modelos e nas duas resoluções (zoom-p12-Boo-op1-1366.png, zoom-p12-Log-op1.png); marcas 0% a 40% só embaixo, grade vertical clara entre os eixos.
- **Didática 9,0:** O defeito anterior foi resolvido: antes da previsão, 'Newton chega ao intercepto do boosting sem recalibrar: a = 0,1829' (p12-Boo-ini.json). Retorno A dá o motivo e o contraexemplo (0,12412 para 0,09092), retorno C nomeia a confusão com o intervalo 8,9% a 13,5% (p12-Log-op2.json); leitura revelada liga ao slide 29.
- **Interação 9,0:** Previsão abre a janela; Logística e Boosting mudam gráfico, KPI, tabela e leitura (p12-troca.json); Restaurar volta à previsão e à logística (p12-rest.json).
- **Rigor 10,0:** O 'Para 10' anterior foi atendido: a leitura diz 'pela PD verdadeira (média exata), a log loss esperada cai de 0,3439 para 0,3419' e a fonte 'perda esperada pela PD verdadeira (média exata sobre o desfecho, sem sorteio)'. Conferido (a/num.ts): a = 0,182177 e 0,182864 (tela 0,1822 e 0,1829); diferença de logits 0,171427 e 0,171832; Brier 0,091276 para 0,090924, boosting 0,095162 para 0,095179; MCB 0,002423 e 0,002858; DSC 0,008974 e 0,005521; Jeffreys 0,123 e 0,133; esperada 0,34393 para 0,34189. Mostra a limitação que muda a conclusão: a PD média antes já cabia no IC de Wilson (8,9% a 13,5%) e a evidência vem da calibração de 3.000 casos.
- **Acess. 10,0:** axe sem violações; teclado, foco e movimento reduzido conferidos

### 29. Platt corrige nível e inclinação sem mexer na fila (c7p13)

- **Layout 9,4:** auditoria 9.40 em 1920 × 1080 e 9.40 em 1400 × 900; varredura limpa nos cenários medidos
- **Legib. 9,0:** menor fonte 1.73% da altura (span:Leitura)
- **Beleza 9,0:** A curva de confiabilidade por decis, com a transformação em miniatura, domina (c7p13-1920-cal.png). Sem calibrar fica em cinza, o Platt da calibração em petróleo e o do curso tracejado, com a nota 'AUC 0,6958 igual nas três versões: a fila não muda' sob a miniatura. A tabela fica ao lado com a coluna escolhida destacada.
- **Didática 9,0:** O título é pergunta ('Platt muda a fila?') até a previsão e afirmação depois. Os retornos nomeiam a confusão, e a leitura agora diz 'o slope vai de 0,80 para 1,11: passou de 1, mais perto dele que antes' (ladoSlope), além de 'a janela não mostra a correção' e da ponte com o slide 28 (b = 1).
- **Interação 9,0:** A previsão libera o seletor Sem calibrar, Curso e Calibração, que move a curva e a coluna destacada. Há o botão da fórmula e do scikit-learn (c7p13-*-formula.png), e Restaurar limpa tudo.
- **Rigor 9,0:** Conferi com npx tsx (b/c29.ts): a = −0,39756, b = 0,72275; slope na janela 1,218 (IC 0,766 a 1,671); slope pela PD verdadeira 0,802, 1,089 (curso) e 1,110; log loss 0,3277 contra 0,3282; esperada 0,34577, 0,34405 e 0,34297; PD média 11,43%; AUC 0,6958 nas três versões. Os dois reparos da rodada anterior foram feitos: a fonte traz semente e safras, e a leitura diz que o slope passou de 1.
- **Acess. 10,0:** axe sem violações; teclado, foco e movimento reduzido conferidos

### 30. Isotônica: flexível, com degraus e empates (c7p36)

- **Layout 9,1:** auditoria 9.10 em 1920 × 1080 e 9.10 em 1400 × 900; varredura limpa nos cenários medidos
- **Legib. 9,0:** menor fonte 1.73% da altura (span:Leitura)
- **Beleza 9,0:** c7p36-opB-1920.png, c7p36-b4-1366.png, c7p36-b6-1366.png, c7p36-b8-1920.png: escada domina, rótulos de saída acima do quadro e sem colisão ('isotônica até 100%' e 'Platt até 66%' no bloco 6), rótulo dos defaults com PD 0% longe das curvas, tabela com a linha PD de 0% ou 100% destacada.
- **Didática 10,0:** Previsão com retornos que nomeiam a confusão (não decrescente, não estritamente crescente; função monotônica não cria pares certos novos). Dado que desmonta o erro: 727 PDs viram 16 degraus, 8.061 empates novos, AUC 0,6958 para 0,6911 (c7p36-opB-1920.png). '(1 cortadas)' corrigido: blocos 7 e 10 dizem '1 previsão dá ... cortada em 10⁻¹⁵ (+34,5)' e a tabela '(1 cortada)'. Liga ao slide 31.
- **Interação 10,0:** 3.000 casos ou um dos dez blocos; degraus, empates, PD 0% ou 100%, setas, log loss e leitura respondem em todos os 11 estados nas duas resoluções (c7p36-b1 a b10, log.json); Restaurar volta à previsão (c7p36-rest).
- **Rigor 10,0:** O 'corrigir' anterior foi resolvido: piso e teto saem de limiteExigido(I.zeros, I.uns), as PDs de 0% e 100% atribuídas, não dos desfechos. Recalculei a isotônica de cada bloco por fora (a/c30.tsx) e comparei com a leitura renderizada: bloco 1 11 PDs 0% → piso; 2 151 → piso; 3 119 e 2 → piso e teto; 4 9 e 3 → piso e teto (antes só teto); 5 72 → piso; 6 193 e 2 → piso e teto; 7 20 → piso; 8 9 PDs 100% → teto; 9 5 e 2 → piso e teto (antes só teto); 10 49 → piso; 11 de 11 iguais. Modo 3.000 casos: 1 PD 0%, nenhuma 100% → 'exige piso de PD' (log.json c7p36-opB-1920). Números: AUC 0,69582 para 0,69112, esperada 0,3430 Platt e 0,3446 isotônica (limite), bloco 2 log loss 0,5754 e esperada 0,6735 contra 0,3445. A limitação que muda a conclusão está na tela ('A janela, com 81 defaults, não separa os dois'; o nível do Platt varia de 9,3% a 16,4% entre blocos).
- **Acess. 10,0:** axe sem violações; teclado, foco e movimento reduzido conferidos

### 31. O que muda depois de recalibrar (c7p37)

- **Layout 9,4:** auditoria 9.40 em 1920 × 1080 e 9.40 em 1400 × 900; varredura limpa nos cenários medidos
- **Legib. 9,0:** menor fonte 1.73% da altura (span:Leitura)
- **Beleza 9,0:** As 737 linhas entre as duas escalas dominam e provam o título; depois da previsão, o feixe âmbar das 121 que cruzam 14,0% (p37-certa-1920.png), 205 em 6,0% (p37-corte06-1920.png), 9 em 25,0% (p37-corte25-1366.json) e nenhuma com a mesma fração, corte 17,73% (p37-fracao-1366.png); cortes rotulados fora do feixe; tabela com a linha da PD verdadeira destacada.
- **Didática 9,0:** O pedido da rodada 4 foi feito: o veredito diz as duas promessas, 'sem calibrar, R$ 150 mil acima do que os aprovados valem; com o Platt (nível da validação, 13,2% de default), R$ 134 mil abaixo' (p37-certa-1920.png). Previsão antes de revelar, retornos que nomeiam a confusão ('Confunde fila com corte'; 'Subestima o deslocamento: ... média de 9,8% para 13,2%'), Tentar outra; ligação ao slide 32. O veredito também conversa com a decisão do slide 36: o Platt ancorado no nível da validação promete menos do que entrega, o mesmo lado da âncora da última safra no slide 27.
- **Interação 10,0:** Previsão, depois regra de corte e controle de 6% a 25%: feixe, contagem, tabela e veredito respondem com números (205 decisões e −R$ 266 mil em 6%; 121 e +R$ 16 mil em 14%; 9 e +R$ 5 mil em 25%; 0 com a mesma fração). O aluno muda a causa (corte e regra) e vê o efeito que o título afirma. Restaurar volta à previsão com corte de 14%.
- **Rigor 9,0:** Conferido com npx tsx (c/num2.ts): 121 recusas e 0 aprovações a mais em 14%; antes 604 aprovados, 53 defaults (8,8%), esperado R$ 595.848, realizado R$ 531.066, PD verdadeira R$ 445.924; depois 483, 31 (6,4%), R$ 327.721, R$ 568.630, R$ 462.408; 596 − 446 = 150 e 328 − 462 = −134 (difMil sobre os arredondados); corte transportado 0,1773 com esperado R$ 303.045; PD média 9,77% para 13,21%; RES.gbm_val.obs 13,158%. Fonte com base, safras, parâmetros do Platt e a conta do motor (28%, 65%, 12% + 2%, R$ 120); 'PD verdadeira só em base sintética'.
- **Acess. 10,0:** axe sem violações; teclado, foco e movimento reduzido conferidos

### 32. A probabilidade não escolhe sozinha a política (c7p18)

- **Layout 9,1:** auditoria 9.10 em 1920 × 1080 e 9.10 em 1400 × 900; varredura limpa nos cenários medidos
- **Legib. 9,0:** menor fonte 1.73% da altura (span.q7-kpi-r:Corte econômico)
- **Beleza 9,0:** Captura 32: curva do esperado (petróleo) e do realizado (tracejada) por corte, com o corte econômico em âmbar, o KS pontilhado em azul de ordenação e o melhor visto depois; fórmula com as cinco hipóteses e dois KPIs. Hierarquia clara.
- **Didática 9,0:** Uma ideia; leitura com números que muda com os controles ('mais, por acaso'; com receita 40%, 23,5% realiza R$ 1,57 mi contra R$ 1,47 mi do KS) e ponte explícita com o slide 31.
- **Interação 10,0:** Modelo, perda no default e receita mudam a curva, o corte econômico, os KPIs e a leitura, enquanto o KS fica parado: é o experimento do título. Restaurar volta a logística, 65% e 28%.
- **Rigor 9,0:** npx tsx: logística, corte econômico 14,0% (esperado R$ 608 mil, realiza R$ 588 mil), KS 9,75% realiza R$ 660 mil, melhor realizado 9,75%; pela PD verdadeira R$ 471.784 e R$ 471.777, que a fonte mostra como 'R$ 472 mil nos dois cortes'; receita 40%: 23,5%, R$ 1,57 mi contra R$ 1,47 mi, verdade R$ 1,45 mi contra R$ 1,25 mi.
- **Acess. 10,0:** axe sem violações; teclado, foco e movimento reduzido conferidos

### 33. A métrica também é uma estatística (c7p14)

- **Layout 9,1:** auditoria 9.10 em 1920 × 1080 e 9.10 em 1400 × 900; varredura limpa nos cenários medidos
- **Legib. 9,0:** menor fonte 1.73% da altura (span.q7-kpi-r:IC percentil de 100 reamostrag)
- **Beleza 9,0:** O histograma domina; com a resposta, '▲ média nas réplicas sintéticas da janela 0,0067' cabe numa linha e a linha tracejada 'na janela 0,0299' se interrompe sob o rótulo (c7p14-1920-compCerta.png); 'IC percentil 95%' troca de lado quando não cabe; em 1366 nada se sobrepõe nas vistas diferença e AUC (mosaico-c7p14-1366.png).
- **Didática 9,0:** A rodada 5 separou os termos: 'reamostragem' é o bootstrap (eixo 'Reamostragens', KPI '25 de 1.000 reamostragens') e 'réplicas sintéticas da janela' são os 300 sorteios. O retorno C agora diz 'vai de 0,0008 a 0,0587, acima de zero' (c7p14-1920-compErrC.txt), sem o 'mal toca zero' de antes; conferi que o limite inferior fica acima de zero em todo k de 100 a 1.000 (mínimo 0,00049 em k = 987, b/c33b.ts). Retorno A nomeia 'Confunde a janela com a população'; leitura liga ao slide 34.
- **Interação 9,0:** Sortear 1 (101: IC 0,0068 a 0,0579), Mais 100 (200: 0,0074 a 0,0575), Completar 1.000 (0,0008 a 0,0587, 25 em zero ou abaixo), vista AUC (0,681 a 0,781 com 100), previsão e Restaurar, que volta a 100 e à vista da diferença (c7p14-1920-rest.txt); reinício ao voltar conferido (volta.mjs). Semente 20260501; as 100 iniciais são o começo das 1.000 (prefixo idêntico, b/c33.ts).
- **Rigor 10,0:** Conferi com npx tsx (b/c33.ts): IC percentil 0,000808 a 0,058679 com 1.000; 25 de 1.000 em zero ou abaixo; DeLong 0,000104 a 0,059630, p = 0,0492, correlação 0,864; réplicas sintéticas 0,66733 contra 0,66065, vantagem 0,00668, 17 de 300 acima da observada; razão observada sobre esperada 4,47, que justifica 'perto de um quarto'. A fonte traz as duas sementes, e o slide mostra a limitação que muda a conclusão (o bootstrap herda a sorte da janela).
- **Acess. 10,0:** axe sem violações; teclado, foco e movimento reduzido conferidos

### 34. Comparação justa: mesmos casos, mesma pergunta (c7p15)

- **Layout 9,1:** auditoria 9.10 em 1920 × 1080 e 9.10 em 1400 × 900; varredura limpa nos cenários medidos
- **Legib. 9,0:** menor fonte 1.73% da altura (span:Leitura)
- **Beleza 9,0:** AUC por amostra com disco e quadrado, ligação na cor e no traço do nível (verde cheia justa, âmbar pontilhada otimista, vinho tracejada viciada e injusta: c7p15-inicial-1920.png, c7p15-val-1366.png, c7p15-treino-1920.png, c7p15-injusto-1366.png) e a régua da diferença pareada com o IC de DeLong e o zero marcado; nada sobreposto.
- **Didática 9,0:** Uma ideia; a leitura de cada estado diz o que concluir com os números: na janela, 0,0299 com IC 0,0001 a 0,0596 e 'isso não é empate: ... correlação 0,86', vantagem esperada 0,0067 e 102 réplicas em que o boosting empata ou vence; no treino, 0,8196 contra 0,6968 'mede sobreajuste'; na validação, 0,6476 contra 0,6408 'otimista para ele' e a mudança de safra (13,2%); amostras diferentes, −0,0939 contra 0,0299.
- **Interação 10,0:** Dois seletores escolhem em que amostra cada modelo é medido; veredito, ligação, tabela e leitura mudam nos quatro níveis; Exemplo injusto e Restaurar; reinício ao voltar conferido (volta2.mjs).
- **Rigor 9,0:** O 'corrigir' anterior foi resolvido: veredito em quatro níveis (VEREDITO em s34-comparacao-justa.tsx; treino 'Viciada', validação 'Otimista: mesmos casos, usados para escolher o boosting', janela 'Justa', amostras diferentes 'Injusta') e a semente 20261033 das réplicas na fonte. Conferido com npx tsx: DeLong 0,72569 e 0,69582, diferença 0,02987, IC 0,00010 a 0,05963, p 0,049, correlação 0,864; vantagem esperada 0,00668; boosting empata ou vence em 102 de 300; O/E 1,131, 1,125, 0,832; slopes 1,12, 0,88, 1,20; AUC treino 0,6968 e 0,8196, validação 0,6408 e 0,6476.
- **Acess. 10,0:** axe sem violações; teclado, foco e movimento reduzido conferidos

### 35. Janela fora do tempo: a prova depois de congelar as escolhas (c7p17)

- **Layout 9,1:** auditoria 9.10 em 1920 × 1080 e 9.10 em 1400 × 900; varredura limpa nos cenários medidos
- **Legib. 9,0:** menor fonte 1.73% da altura (span:Leitura)
- **Beleza 9,0:** A escada da AUC do escolhido na janela sobe acima da logística (0,7286 contra 0,7257) e a esperada desce abaixo da dela (0,6565 contra 0,6673), candidatos em pontos cinza (c7p17-vinte-1366.png); antes da previsão, só a escada da janela (c7p17-inicial-1920.png).
- **Didática 10,0:** Os dois pontos da rodada anterior foram resolvidos: a escada tracejada e os KPIs só aparecem depois da previsão certa, e a leitura passa a 'Previsão feita: reabra a janela e veja quanto o escolhido sobe nela' (c7p17-prevB-1920.png). Retornos nomeiam a confusão (c7p17-prevC-1366.png: 'o máximo de 20 sorteios sobe'); o aluno vê o erro acontecer: o escolhido passa a logística na janela e fica abaixo dela nas réplicas; ligação ao slide 36.
- **Interação 10,0:** Reabrir e Mais 5 são o experimento, travados até a previsão certa; o otimismo cresce de 0,0452 (k = 1) a 0,0721 (k = 20); Restaurar; semente 20261035; reinício ao voltar conferido.
- **Rigor 10,0:** Recalculado com npx tsx (conf3.ts): trajetória 0,7028, 0,7205 (k = 2), 0,7286 (k = 7 em diante), esperada 0,6577, 0,6587, 0,6565; logística 0,72569 e 0,66733; otimismo 0,07213 contra 0,05835, 0,01378 de seleção. A fonte agora traz semente da base e safras (declararBase corrigido), sementes 20261035 e 20261033 e 'só possível em base sintética'; mostra a limitação que muda a conclusão: a própria janela era favorável à logística (0,7257 contra 0,6673 esperada).
- **Acess. 10,0:** axe sem violações; teclado, foco e movimento reduzido conferidos

### 36. Você colocaria este modelo em produção? (c7p38)

- **Layout 9,1:** auditoria 9.10 em 1920 × 1080 e 9.10 em 1400 × 900; varredura limpa nos cenários medidos
- **Legib. 9,0:** menor fonte 1.73% da altura (b:Finalidade:)
- **Beleza 9,0:** Dossiê de quatro miniaturas com codificação constante (logística disco e traço cheio, candidato quadrado vazado e tracejado), cor e símbolo da pergunta; quadro 'Declarado antes, no slide 2' com Restaurar no cabeçalho; depois do acerto, régua das cinco âncoras contra PD verdadeira 11,6% e observado 11,0% com rótulos em fileiras e tabela de O/E e perda (p38-certa-conf-1920.png, -1366.png); trava de decisão legível (p38-inicial-1366.png).
- **Didática 9,0:** Uma decisão; trava de três consultas; quatro alternativas de tamanho parecido com Tentar outra; retornos com números e com a confusão nomeada, agora coerentes com o quadro: A e B perdem pela ordenação ('o Platt é monótono e não muda a fila'), D pela rejeição da validação (O/E 1,35, p = 0,001; validação e janela p = 0,0013) (p38-altA, -altB, -altD); leitura certa dá a ação com os números (9,7% a 12,0%, corte 13,5%, promessa R$ 496 mil, R$ 470 mil pela PD verdadeira) e liga ao slide 37. A regra vem do slide 2, não da tabela.
- **Interação 9,0:** Cartões contam as consultas e liberam a decisão com três (p38-cart1, -cart3, -cart4); depois do acerto, seletor Dossiê e Conferência (p38-certa-conf, p38-certa-dossie) e o cartão Decisão muda para o corte refeito; Restaurar zera consultas e decisão (p38-restaurar-1366.png); réplicas só ao abrir a Conferência; sem erro de console.
- **Rigor **8,0**:** Números conferidos por conta independente (b/conf.py) e pela biblioteca (b/lib.ts, b/lib2.ts): DeLong 0,7257 contra 0,6958, p 0,0492, IC 0,0001 a 0,0596; candidato O/E 0,832, 1 − p 0,0352; cortes de 14% nos dois, esperado R$ 608 mil e R$ 328 mil; corte refeito 13,5%, 492 aprovados, promessa R$ 496.437 contra R$ 469.834 pela PD verdadeira; 76 decisões mudam no corte antigo, todas de aprovada para recusada; sorte 12,3%, faixa exata 11,3% a 13,4%. Falha: o cartão Decisão diz '492 aprovados (eram 580; 76 decisões mudam)' (p38-certa-dossie-1920 em textos.json). Lido na tela, 580 menos 492 são 88 mudanças; os 76 são as do corte antigo de 14%, qualificação que só existe no rótulo acessível do slide 37 e no guia. É um número com a definição escondida, ao lado de outro que o contradiz. E a alternativa certa diz 'nas safras recentes', enquanto o quadro, um palmo acima, diz 'todas as safras maturadas fora do treino'; 'recentes' também descreve 'só a janela'. Corrigir: Cartão Decisão: '492 aprovados (eram 580): 76 recusas novas já no corte antigo de 14% e mais 12 com o corte de 13,5%'. Alternativa C: 'Manter a logística e recalibrar o nível em todas as safras fora do treino'. Para 10: dizer na leitura que o valor pela PD verdadeira quase não muda (R$ 472 mil antes, R$ 470 mil depois): recalibrar corrige a promessa e a provisão, não o valor da fila. E que a promessa segue R$ 26 mil acima porque o intercepto acerta a média, não a região aprovada (ali a PD recalibrada média é 7,3% contra 8,0% verdadeira, b/conf.py).
- **Acess. 10,0:** axe sem violações; teclado, foco e movimento reduzido conferidos

### 37. Confiar no modelo exige quatro respostas (c7p20)

- **Layout 9,1:** auditoria 9.10 em 1920 × 1080 e 9.10 em 1400 × 900; varredura limpa nos cenários medidos
- **Legib. 9,0:** menor fonte 1.73% da altura (b:Falta:)
- **Beleza 9,0:** Quatro respostas com miniatura, cor e símbolo da pergunta; a miniatura de probabilidade agora marca ▲ 9,7%, △ recalibrada 12,0% e □ observado 11,0% com Wilson, e as três rejeições de Jeffreys abaixo; a de decisão traz a curva recalibrada, corte 13,5% com 492 aprovados e KS 12,2% (p20-inicial-1920.png, -1366.png); procedimento de seis passos cabe na caixa nas duas resoluções.
- **Didática 9,0:** A correção da rodada 7 foi feita: a síntese responde ao slide 16 com o número e dá a ação de calendário ('A logística fica, com o nível recalibrado (9,7% para 12,0%; slide 16) e o corte em 13,5%. Depois, reancorar a cada 12 safras maturadas, sem esperar alarme'); o passo Nível diz 'intercepto após a prova; reancorar a cada 12 safras'; o Monitorar diz para que servem falso alarme e poder. Seletor de sintoma com diagnóstico e links (p20-auc, -cal, -dec, -oot).
- **Interação 9,0:** Seletor de quatro sintomas troca diagnóstico e links (p20-*-1920, -1366); Mapa e Caso integrador; Restaurar volta ao procedimento (p20-restaurar-1366.png); monitoramento simulado ao abrir, com semente; sem erro de console.
- **Rigor **8,0**:** Conferido por cadeia exata, sem sorteio (b/mon.py, convolução da binomial com limites de Jeffreys bilaterais, m = 150, p0 = 12,01%): uma safra rejeita com d ≤ 10 ou d ≥ 27, falso alarme 4,39% e poder 5,94% (tela 4,5% e 6,0%); acumulado com 5% ÷ 12 em duas caudas: 2,28% e 11,24% (tela 2,2% e 11%); sem repartir 20,38% (apêndice 20,7%). Diferenças dentro do erro de 20.000 sorteios. Corte 13,5%, 492, R$ 496 mil, R$ 470 mil e KS 12,2% conferidos (b/conf.py). Duas falhas. (1) O procedimento manda 'reancorar a cada 12 safras' sem dizer em quais safras; a regra do slide 2, 'todas as safras maturadas fora do treino', aplicada na primeira reancoragem junta 22 safras (2023-03 a 2024-12) e cresce sem limite, o contrário do 'nível corrente' da finalidade. E o diagnóstico do sintoma 'Curva fora da diagonal' diz 'nas safras maturadas mais recentes' (p20-cal-1366.png), que na tabela do slide 27 é 'só a janela', a âncora que a regra não escolhe. (2) A miniatura de probabilidade mostra 'Jeffreys p: janela 0,12; validação 0,001; validação e janela 0,0013' sem dizer que são unilaterais (a do BCE) e sem os denominadores (100 de 760; 181 de 1.497), ao lado de um monitoramento bilateral. Corrigir: Passo Nível: 'intercepto após a prova nas safras maturadas fora do treino; reancorar a cada 12 safras com as últimas 10 safras maturadas' (ou o número que o contrato fixar), e o mesmo texto no slide 2. Diagnóstico 'cal': trocar 'nas safras maturadas mais recentes' por 'nas safras que o contrato fixa (slide 2)'. Miniatura: 'Jeffreys unilateral p: janela 0,12 (81 de 737); validação 0,001 (100 de 760); validação e janela 0,0013 (181 de 1.497)'.
- **Acess. 10,0:** axe sem violações; teclado, foco e movimento reduzido conferidos

### 38. Apêndice: fórmulas, métricas fora do protocolo e referências (c7p19)

- **Layout 9,4:** auditoria 9.40 em 1920 × 1080 e 9.40 em 1400 × 900; varredura limpa nos cenários medidos
- **Legib. 9,0:** menor fonte 1.73% da altura (dd:acumuladas da PD em adimplente)
- **Beleza 9,0:** Seis abas e cinco subabas de referências; Fronteira em duas colunas sem sobreposição (p19-fronteira-1920.png, -1366.png); KaTeX com tradução dos símbolos nas abas de fórmulas (p19-formulas, p19-comparar).
- **Didática 9,0:** Cada item da Fronteira diz o que o método resolve e quando usar; o Jeffreys no tempo diz 'Repetido no acumulado a cada safra' (o pedido da rodada 6 para 10 foi feito); o ajuste ao ciclo diz que 24 meses não cobrem um ciclo; cada referência leva ao slide que a usa (p19-refs-*).
- **Interação 9,0:** Navegação por abas e subabas com links; simulação só ao abrir a Fronteira; todas as abas capturadas sem erro de console (textos.json, errs vazio).
- **Rigor **8,0**:** A correção da rodada 7 foi feita: Reprodução lista 'monitoramento do nível 20261041 (20.000 sorteios; slides 37 e 38)' e 'réplicas da âncora de produção 20261043 (2.000; slides 27 e 36)', e a Fronteira traz 'Simulação de 20.000 sorteios, semente 20261041' (p19-repro-1920, p19-fronteira-1920). Gini 2 × 0,72569 − 1 = 0,4514 e 1 − 81/737 = 89,0% conferidos. Duas frases ficaram inexatas no ponto central desta rodada. (1) O item do Jeffreys abre com 'O teste do BCE no backtesting de PD, unilateral' e segue 'Repetido no acumulado a cada safra... 12 olhadas a 5% dão 20,7%'; os 20,7%, 2,2% e 11% são do teste bilateral (dados.ts, monitorarNivel). Com o unilateral do BCE, 12 olhadas a 5% dão 18,5% (conta exata, b/mon.py). (2) O item do ciclo diz 'o caso declara antes as maturadas mais recentes'; o contrato do slide 2 declara 'todas as safras maturadas fora do treino', e 'as mais recentes' é como o guia do slide 27 descreve 'só a janela'. Corrigir: Jeffreys: 'Com as duas caudas, como no monitoramento (slide 37): 12 olhadas a 5% dão 20,7%; com 5% repartido, 2,2%, e poder de 11% contra 1 ponto'. Ciclo: 'o caso declara antes, no slide 2, o intercepto em todas as safras maturadas fora do treino, sem ajuste prospectivo'. Corrigir o mesmo no guia de c7p19.
- **Acess. 10,0:** axe sem violações; teclado, foco e movimento reduzido conferidos

## Fontes das medidas

- a1920: `tmp/ux/auditoria-c7-1920.json`
- a1400: `tmp/ux/auditoria-c7-1400.json`
- varredura: `tmp/shots/final/relatorio.json`
- axe: `tmp/axe7.json`
- funcional: `tmp/funcional-c7.txt`
- avaliacao: `docs/capitulo7/avaliacao.json`
