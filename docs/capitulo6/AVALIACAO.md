# Avaliação do capítulo 6

Gerado por `.claude/skills/quadro-capitulo/scripts/avaliar.mjs` em 2026-10-02. Mínimo 9 em cada item. Notas humanas: subagentes em contexto limpo, 2026-10-02.

**Resultado: APROVADO.** Média dos 140 itens de slide: 9,26; menor: 9,0. Testes da biblioteca: passando (2 arquivos de teste da biblioteca passando).

## Storytelling do capítulo

| Item | Nota | Evidência |
|---|---|---|
| Coerência | 9,0 | O fio de c6p1 (queda de 0,172 do candidato contra 0,056 da logística, excesso estimado de 0,116; três escalas do caso; quatro perguntas com os slides de cada uma) segue na trilha dos 21 slides de aula e volta no fecho de c6p21 ('O excesso de 0,116 do slide 1 era otimismo do treino ... Prova: só troca a logística se ganhar na janela futura', c6p21-esgotou-1920). As mudanças desta rodada mantiveram o fio: c6p15 e c6p16 terminam em 'Slide 17: contra a logística'; o título novo de c6p16, 'Sortear metade: ganho consistente, dentro do erro da validação', bate com a leitura ('sortear não muda a decisão tomada na parada', story-c6p16-revelado); o de c6p17, 'Com três variáveis, a logística ordena melhor na validação', bate com a leitura ('Só a AUC separa os modelos') e com a virada do roteiro ('com três variáveis a logística ordena melhor', roteiro.ts linha 10); c6p21 usa 'empate na régua aproximada' e c6p17 'empate' com IC, mesma palavra para a mesma situação. 'Validação sorteada' (631) e 'validação temporal' (760) seguem distintas. Leituras que pedem o seguinte (story-textos-1-22.json): 1 → 2, 2 → 3, 3 → 4, 4 → 5, 6 → 7, 8 → 9, 9 → 10, 10 → 11, 12 → 13, 13 → 14, 14 → 15, 15 → 17, 16 → 17, 17 → 18, 18 → 19, 19 → 20, 20 → 21, 21 → capítulo 7. |
| Arco narrativo | 9,0 | Gancho em c6p1 com algo em jogo (o candidato do comitê cai 0,172; 0,648 é otimista porque escolheu os hiperparâmetros). Tensão que cresce: votar estaciona e corrigir cai em todas (c6p2); Newton contra a média (c6p6); o ajuste melhora em 300 de 300 árvores e a validação volta ao palpite (c6p11); a validação para em 16 (c6p15). Virada do dado, com título provisório em pergunta e afirmação depois da previsão: 'Com três variáveis, a logística ordena melhor na validação', AUC 0,7006 contra 0,6553, IC de DeLong de 0,020 a 0,070, log loss sem diferença distinguível (IC de −0,0053 a 0,0099; recalculado em b/num17.ts). O título novo é mais honesto que o anterior ('valida melhor'), porque a log loss não separa. Fecho volta ao gancho e decide: o excesso de 0,116 era otimismo do treino, os dois empatam na validação temporal e erram a mesma safra, o boosting vai como desafiante (c6p21). |
| Exemplo prático | 9,0 | O caso atravessa o capítulo em três escalas ligadas na tela (cartões de c6p1: 16 propostas nos slides 2 a 10, 2.103 nos 11 a 20, candidato de 7 variáveis no 21), com a proposta 10 seguida em c6p8, c6p9 e c6p10 e a carteira de 1.472 e 631 em c6p11 a c6p20. Tamanho e contexto plausíveis (5.000 propostas, safras mensais, 9,6% de default no treino, 13,2% na validação temporal). A decisão final usa o próprio candidato. A frase do sintético em c6p21 ficou exata nesta rodada: 'PD verdadeira de cada proposta, que nenhuma carteira real dá, e janela futura intocada; o capítulo 7 usa as duas' (c6p21-ini-1920). |
| Progressão | 9,0 | Do intuitivo ao formal: três estratégias (c6p2), algoritmo à mão nas 16 propostas (c6p3 a c6p8), fórmula de Friedman só em c6p10, apêndice c6p22 com fórmulas ligadas aos slides. Conceitos que nascem de limitações mostradas: a média do erro pede Newton (c6p6, 37,8% contra 11,9%); a validação que volta ao palpite pede parada e controles (c6p11 a c6p16); a logística que ordena melhor pede conferir as PDs (c6p17 → c6p18, slope 0,42 com IC de 0,18 a 0,66); o atraso com contribuição zero abre a monotonia (c6p19 → c6p20). Aprofundamentos marcados (9, 10, 12, 14, 16 com o selo 'Aprofundamento', story-c6p16-revelado) e puláveis: c6p15 e c6p16 levam os dois ao 17. Tempo: 57 minutos essenciais e 15 de aprofundamento (roteiro.ts). |
| Estado da arte | 9,0 | essenciais 11/11; fronteira 6/6. Revisor: Pelo checklist do capítulo 6, os onze essenciais aparecem em slide com os dados do caso e os seis de fronteira estão no apêndice com referência primária, o que resolve e quando usar (FRONTEIRA em s22-apendice.tsx, linhas 25 a 32). Nada mudou nesta rodada nos itens que impediam 10, e as mudanças de c6p17 não tiraram cobertura: E8 continua com DeLong pareado e agora também com a log loss pareada, e Lessmann et al. (2015) segue na fonte de c6p17 e no apêndice. A conta formal daria 10; fica em 9 porque E7 está coberto pela metade: a distorção é medida com o caso (c6p18, slope 0,42) mas a recalibração não aparece funcionando nem tem cartão no apêndice; Niculescu-Mizil e Caruana (2005) só está na lista de referências (s22 linha 50). E10 cita Potharst e Feelders (2002), não a documentação de monotonic_cst que o checklist pede (s22 linha 46). |
| Fechamento e transferência | 9,0 | A leitura revelada de c6p21 responde às quatro perguntas do slide 1 com os números do candidato (Mecanismo: F₀ = −2,25 mais 60 árvores × 0,05; Probabilidade: log odds, sigmoide no fim, contribuições do slide 19; Controle: 60 árvores, 8 folhas, na borda; Prova: só troca a logística se ganhar na janela futura), fecha a conta do slide 1 (0,116 = (0,8196 − 0,6476) − (0,6968 − 0,6408), recalculado) e diz o que falta item a item no modo 'O que pedir' (DeLong pareado nas 760, recalibrar os dois com slope cujo IC contenha 1, AUC em outras propostas e grade além da borda, monotonia e contribuições nas árvores, janela aberta uma vez com modelo e corte congelados; c6p21-certa-pedir-1366). A pendência da origem da correlação 0,95 foi resolvida: saiu da tela, e o guia de c6p21 explica que é de outro par. Material alinhado: o guia de c6p17 repete os dois ICs e 'Só a AUC separa os modelos'; o de c6p19 descreve as cinco propostas distintas. |

## Estado da arte

| id | Tema | Classe | Onde | Referência |
|---|---|---|---|---|
| E1 | Modelo aditivo construído em etapas: palpite inicial mais correções | essencial | c6p2, c6p3, c6p8, c6p9, c6p10, c6p11, c6p21 | Friedman (2001), Annals of Statistics 29(5), na fonte de c6p6 e c6p10 e no apêndice. Funciona com o caso: F₀ e quatro correções nas 16 propostas; PD da proposta 10 em 0,00 + 0,80 − 0,16 − 0,10 + 0,51 = 1,05 (c6p9); candidato como F₀ = −2,25 mais 60 árvores × 0,05 (c6p21). |
| E2 | Pseudo-resíduo como gradiente negativo da perda; em log loss, y − p na escala de log odds | essencial | c6p4, c6p10 | Friedman (2001); Friedman, Hastie e Tibshirani (2000), Annals of Statistics 28(2), no apêndice. Resíduos ±0,50 nas 16 propostas (c6p4). |
| E3 | Valor da folha por passo de Newton (soma dos gradientes sobre soma das curvaturas) | essencial | c6p6 | Friedman (2001) na fonte de c6p6; Chen e Guestrin (2016) no cartão XGBoost do apêndice. Folha B: média −0,50, Newton −2,00, PD de 50% a 11,9%. |
| E4 | Taxa de aprendizagem e número de árvores acoplados; parada antecipada por validação | essencial | c6p7, c6p13, c6p14, c6p15 | Friedman (2001); Hastie, Tibshirani e Friedman (2009), cap. 10, no apêndice. Mínimo de validação em 16 árvores com η 0,1 e em 34 com η 0,05 (0,2955 nos dois); parada no mínimo (c6p15). |
| E5 | Profundidade (ordem de interação), mínimo por folha e subamostragem como controles | essencial | c6p12, c6p13, c6p16 | Friedman (2002), Computational Statistics & Data Analysis 38(4), no subtítulo de c6p16 e no apêndice. Subamostra de 50%: ganho de 0,0010 na parada, z = 0,37, dentro do erro da validação (c6p16). |
| E6 | Validação fora do tempo: treino sempre melhora, janela futura decide a complexidade | essencial | c6p1, c6p11, c6p15, c6p21 | BCBS (2005), WP 14, no apêndice. Validação temporal de 760 propostas em c6p1 e c6p21, grade escolhida nela; c6p11 e c6p15 com validação sorteada declarada; janela fora do tempo (737) congelada para o capítulo 7. |
| E7 | Probabilidades do boosting distorcidas e recalibração | essencial | c6p18 | Niculescu-Mizil e Caruana (2005), ICML, só na lista de referências do apêndice. Coberto pela metade: distorção medida com o caso (slope 0,42, IC de 0,18 a 0,66, com 300 árvores); recalibração pedida em c6p18 e c6p21 e feita no capítulo 7. |
| E8 | Comparação com a logística como referência em crédito | essencial | c6p17, c6p21 | Lessmann, Baesens, Seow e Thomas (2015), EJOR 247(1), na fonte de c6p17 e no apêndice. AUC 0,7006 contra 0,6553, IC de DeLong de 0,020 a 0,070, e log loss pareada 0,0023, IC de −0,0053 a 0,0099 (c6p17); no candidato, 0,6476 contra 0,6408 na régua aproximada (c6p21). |
| E9 | Explicação por contribuições aditivas (TreeSHAP) e limites da importância por ganho | essencial | c6p19 | Lundberg et al. (2020), Nature Machine Intelligence 2(1), no apêndice; contribuições conferidas com shap.TreeExplainer. Cascata −2,38 − 0,15 + 0,00 + 0,08 = −2,45; ganho de 89% do score contra a utilização que mais pesa na proposta. |
| E10 | Restrições monotônicas para respeitar a lógica de negócio | essencial | c6p20 | O checklist pede a documentação de monotonic_cst; o apêndice cita Potharst e Feelders (2002). Funciona com o caso: PD livre cai em 10 trechos, monotônica em 0; AUC 0,5979 contra 0,6756 (IC da diferença de 0,035 a 0,121). |
| E11 | Governança: validação independente e backtesting de modelos | essencial | c6p21 | Resolução CMN 4.557/2017 e EBA (2023), Follow-up report on machine learning for IRB models, no apêndice. Lista do validador com estado, evidência e pedido por item; backtesting como janela fora do tempo congelada. |
| F1 | Objetivo regularizado de segunda ordem | fronteira | apendice | Chen e Guestrin (2016), KDD. Cartão com w* = −G ÷ (H + λ), o que resolve e quando usar; ligado a c6p6. |
| F2 | Histogramas e amostragem por gradiente | fronteira | apendice | Ke et al. (2017), LightGBM, NeurIPS 30. Cartão ligado a c6p16. |
| F3 | Vazamento de alvo em variáveis categóricas e boosting ordenado | fronteira | apendice | Prokhorenkova et al. (2018), CatBoost, NeurIPS. Cartão: codificação ordenada sem vazar o alvo; CEP, CNAE e loja. |
| F4 | Modelos aditivos explicáveis com interações (GA2M, EBM) | fronteira | apendice | Lou, Caruana, Gehrke e Hooker (2013), KDD; Nori et al. (2019). Cartão ligado a c6p12. |
| F5 | Árvores ainda à frente de redes profundas em dados tabulares | fronteira | apendice | Grinsztajn, Oyallon e Varoquaux (2022), NeurIPS Datasets and Benchmarks. Cartão ligado a c6p17. |
| F6 | Explicações contrafactuais para decisões adversas | fronteira | apendice | Wachter, Mittelstadt e Russell (2018), Harvard JOLT 31(2). Cartão ligado a c6p20: motivo de recusa. |

## Slide a slide

| Slide | Layout | Legib. | Beleza | Didática | Interação | Rigor | Acess. |
|---|---|---|---|---|---|---|---|
| 2 c6p2 | 9,1 | 9,0 | 9,0 | 9,0 | 9,0 | 9,0 | 10,0 |
| 3 c6p3 | 9,4 | 9,0 | 9,0 | 9,0 | 10,0 | 9,0 | 10,0 |
| 4 c6p4 | 9,4 | 9,0 | 9,0 | 9,0 | 9,0 | 9,0 | 10,0 |
| 5 c6p5 | 9,4 | 9,0 | 9,0 | 9,0 | 10,0 | 9,0 | 10,0 |
| 6 c6p6 | 9,4 | 9,0 | 9,0 | 10,0 | 9,0 | 9,0 | 10,0 |
| 7 c6p7 | 9,4 | 9,0 | 9,0 | 9,0 | 9,0 | 9,0 | 10,0 |
| 8 c6p8 | 9,4 | 9,0 | 9,0 | 9,0 | 9,0 | 9,0 | 10,0 |
| 9 c6p9 | 9,4 | 9,0 | 9,0 | 9,0 | 9,0 | 9,0 | 10,0 |
| 10 c6p10 | 9,1 | 9,0 | 9,0 | 9,0 | 9,0 | 9,0 | 10,0 |
| 12 c6p12 | 9,4 | 9,0 | 9,0 | 9,0 | 10,0 | 9,0 | 10,0 |
| 13 c6p13 | 9,4 | 9,0 | 9,0 | 9,0 | 9,0 | 9,0 | 10,0 |
| 14 c6p14 | 9,4 | 9,0 | 9,0 | 9,0 | 9,0 | 9,0 | 10,0 |
| 15 c6p15 | 9,4 | 9,0 | 9,0 | 9,0 | 10,0 | 9,0 | 10,0 |
| 16 c6p16 | 9,1 | 9,0 | 9,0 | 9,0 | 9,0 | 9,0 | 10,0 |
| 17 c6p17 | 9,1 | 9,0 | 9,0 | 10,0 | 9,0 | 9,0 | 10,0 |
| 18 c6p18 | 9,1 | 9,0 | 9,0 | 9,0 | 10,0 | 9,0 | 10,0 |
| 19 c6p19 | 9,1 | 9,0 | 9,0 | 10,0 | 9,0 | 9,0 | 10,0 |
| 20 c6p20 | 9,4 | 9,0 | 9,0 | 9,0 | 10,0 | 9,0 | 10,0 |
| 21 c6p21 | 9,1 | 9,0 | 9,0 | 9,0 | 9,0 | 9,0 | 10,0 |
| 22 c6p22 | 9,6 | 10,0 | 9,0 | 9,0 | 9,0 | 9,0 | 10,0 |

## Evidências por slide

### 2. Escolher, votar ou corrigir: o boosting corrige em sequência (c6p2)

- **Layout 9,1:** auditoria 9.10 em 1920 × 1080 e 9.10 em 1400 × 900; varredura limpa nos cenários medidos
- **Legib. 9,0:** menor fonte 1.73% da altura (span:Leitura)
- **Beleza 9,0:** Captura rev2p1/c6p2-revelado.png: as três estratégias no mesmo eixo com forma além da cor (quadrado vazado para votar, disco para corrigir, tracejado para escolher), definições dentro do gráfico, rótulos finais sem sobreposição; antes da previsão, a caixa tracejada 'de 2 a 20: preveja antes'.
- **Didática 9,0:** Previsão antes das curvas, retornos que nomeiam a confusão (média de árvores no mesmo y reduz variância, não o erro comum) com números (0,346 com 2, 0,232 com 8, oscila até 0,252); leitura com votar 0,237 e corrigir 0,030 e link ao slide 3.
- **Interação 9,0:** Depois do acerto, o controle de árvores (1 a 20) redesenha as duas curvas, a leitura e o alvo da árvore k na proposta #3 (y = 0 contra −0,31 na árvore 2, −0,01 na 20); Restaurar volta ao início.
- **Rigor 9,0:** Corrigir conferido com a biblioteca e com o scikit-learn: 0,693, 0,452, 0,330, 0,263, 0,217 e 0,030 com 20 árvores; votar sai do mesmo ajustar() com semente 20260502 declarada; 16 propostas e 8 defaults na fonte.
- **Acess. 10,0:** axe sem violações; teclado, foco e movimento reduzido conferidos

### 3. O palpite inicial são as log odds da carteira (c6p3)

- **Layout 9,4:** auditoria 9.40 em 1920 × 1080 e 9.40 em 1400 × 900; varredura limpa nos cenários medidos
- **Legib. 9,0:** menor fonte 1.73% da altura (span:Leitura)
- **Beleza 9,0:** Captura rev2p1/c6p3-revelado.png: a curva da log loss da PD única domina, a faixa das 16 barras iguais diz 'a mesma PD para todas', o mínimo tem marca e rótulo (taxa 50% · F₀ = 0,00), o ponto do controle mostra 0,780.
- **Didática 9,0:** Título provisório em pergunta durante a previsão; distratores nomeiam probabilidade tomada por log odds (0,5 daria 62,2%) e chance tomada por log odds; leitura com 9,44%, ln(139 ÷ 1.333) = −2,26 e perda 0,313; link ao slide 4.
- **Interação 10,0:** O controle de PD única move o ponto sobre a curva com a perda respondendo (0,780 em 30% nas 16; 0,437 em 30% no ajuste) e o seletor de carteira desloca o mínimo para 9,44%: o aluno muda a causa e vê o mínimo cair na taxa, que é o título. Restaurar e reinício conferidos (rev2p1/c6p3-restaurado.png).
- **Rigor 9,0:** Conferido com a biblioteca: 139 defaults em 1.472, F₀ = −2,261, perda de partida 0,3127; o F₀ das 16 é conferido contra modelo() no próprio código (s03-palpite.tsx linha 27); amostra, sementes e safras na fonte.
- **Acess. 10,0:** axe sem violações; teclado, foco e movimento reduzido conferidos

### 4. O erro de cada proposta vira o alvo da próxima árvore (c6p4)

- **Layout 9,4:** auditoria 9.40 em 1920 × 1080 e 9.40 em 1400 × 900; varredura limpa nos cenários medidos
- **Legib. 9,0:** menor fonte 1.73% da altura (span:Leitura)
- **Beleza 9,0:** Capturas rev2p1/c6p4-revelado.png e c6p4-Faj.png: em cima a perda de um default e de um adimplente com as tangentes e a inclinação rotulada; embaixo os 16 erros como barras alinhadas às marcas de classe (cheia e vazada); sem sobreposição em F = 0 e em F = −2,26.
- **Didática 9,0:** Distratores 'o próprio y' (ligado ao votar do slide 2) e 'a perda de cada uma' (ln 2, confunde perda com inclinação) com retornos que nomeiam a confusão; leitura com +0,91 e −0,09 no F₀ do ajuste e o peso 9,6; derivação na expansão; link ao slide 5.
- **Interação 9,0:** Controle do palpite comum F move tangentes e as 16 barras com números; atalhos F₀ do ajuste e das 16; Restaurar.
- **Rigor 9,0:** σ(−2,26) = 9,44%; 1 − p = 0,906; 1.333 ÷ 139 = 9,59; a inclinação por diferença central confere p − y no código (s04-erro-alvo.tsx linha 23).
- **Acess. 10,0:** axe sem violações; teclado, foco e movimento reduzido conferidos

### 5. A primeira árvore separa onde o palpite errou (c6p5)

- **Layout 9,4:** auditoria 9.40 em 1920 × 1080 e 9.40 em 1400 × 900; varredura limpa nos cenários medidos
- **Legib. 9,0:** menor fonte 1.73% da altura (span:Leitura)
- **Beleza 9,0:** Capturas rev2p1/c6p5-revelado.png e c6p5-arvore.png: plano utilização por atraso com as 16 numeradas, corte e regiões sombreadas; com o segundo nível, as quatro folhas com nome, tamanho e média acima do gráfico; nada sobreposto.
- **Didática 9,0:** Distratores de domínio (atraso ≤ 15 dias, o sinal clássico: deixa 3,43 de 4,00, empatado com atraso ≤ 27,5; há corte melhor) e de mecânica (isolar #1 e #2, erros opostos: 4,00 continua 4,00); leitura com 4,00 para 1,75, quatro folhas com 1,00 e o empate explicado; links aos slides 4, 6 e 8; subtítulo antecipa que a primeira árvore é igual à de default.
- **Interação 10,0:** Seletor de variável e controle do corte percorrem os 18 cortes válidos com o erro quadrático restante respondendo (1,75 o melhor de utilização; o melhor de atraso é pior), e 'Crescer o segundo nível' mostra as quatro folhas: o aluno faz a busca de corte que o título descreve. Restaurar conferido.
- **Rigor 9,0:** Árvore 1 da biblioteca: raiz utilização ≤ 57,5; folhas {#1, #2} 0, {#3 a #8} −2,00, {#9 a #14} +2,00, {#15, #16} 0; 18 cortes válidos com mínimo 2 por folha (13 de utilização, 5 de atraso); árvore igual à do scikit-learn no teste da biblioteca.
- **Acess. 10,0:** axe sem violações; teclado, foco e movimento reduzido conferidos

### 6. O valor da folha é um passo de Newton, não a média do erro (c6p6)

- **Layout 9,4:** auditoria 9.40 em 1920 × 1080 e 9.40 em 1400 × 900; varredura limpa nos cenários medidos
- **Legib. 9,0:** menor fonte 1.73% da altura (span:Leitura)
- **Beleza 9,0:** Captura rev2p1/c6p6-revelado.png: perda exata e parábola tracejada no mesmo eixo; losango (Newton), X (média) e disco (γ atual) com formas distintas e legenda no canto vazio; tabela das quatro folhas como apoio.
- **Didática 10,0:** O erro mais comum (usar a média do erro, −0,50) acontece no próprio gráfico: na folha B, o X da média fica em perda 2,84 contra 0,76 do Newton, e o retorno diz que a PD só iria de 50% a 37,8%; o distrator 'menos infinito' desmonta o mínimo exato numa folha pura; leitura com números (4,16 para 0,76; 11,9%) e link ao slide 7.
- **Interação 9,0:** Controle de γ (−4 a 4) responde com PD e perda da folha; seletor de folha A a D; expansão com a derivação; Restaurar.
- **Rigor 9,0:** −3,0 ÷ (6 × 0,25) = −2,00; σ(−2) = 11,9%; σ(−0,5) = 37,8%; folha C +2,00 e 88,1%; o valor é conferido contra valorArvore no código (s06-passo-newton.tsx linha 32) e a biblioteca reproduz o scikit-learn.
- **Acess. 10,0:** axe sem violações; teclado, foco e movimento reduzido conferidos

### 7. Taxa de aprendizagem: no treino, taxas perto de 1 descem mais rápido (c6p7)

- **Layout 9,4:** auditoria 9.40 em 1920 × 1080 e 9.40 em 1400 × 900; varredura limpa nos cenários medidos
- **Legib. 9,0:** menor fonte 1.73% da altura (span:Leitura)
- **Beleza 9,0:** Capturas a/c6p7-B-certa-1920.png, a/c6p7-eta1-1920.png, a/c6p7-eta08-1366.png, a/c6p7-eta005-1920.png: curva escolhida em azul forte com pontos e valores; referências com marcador próprio (η = 0,10 tracejada, η = 0,95 pontilhada com ○, η = 1 contínua cinza com ■); rótulos finais afastados mesmo quando 0,80 (0,103) e 1 (0,102) quase coincidem (eta08-1366); no estado inicial a caixa 'outras taxas: preveja antes' esconde as referências. Em η = 1 a pontilhada de 0,95 encosta no rótulo 0,268, mas o halo do texto a cobre (a/zoom-eta1.png).
- **Didática 9,0:** Título e subtítulo em pergunta até o acerto (a/c6p7-ini-1920.png, a/c6p7-C-errada-1366.png) e afirmação depois; retornos nomeiam a confusão ('Confunde regularização com ajuste', 'Confunde convenção com ótimo') com números (0,622 contra 0,268; 0,452 contra 0,268) e 'Tentar outra'; leitura com 0,073 e 0,102 e ponte para os slides 14 e 15. Uma ideia só.
- **Interação 9,0:** Controle de η de 0,05 a 1 redesenha curva e rótulos (0,05: 0,565; 0,80: 0,103; 0,95: 0,073; 1: 0,102, capturas eta005, eta08, eta1); referências só após o acerto; Restaurar volta a η = 0,4 com a previsão aberta (a/c6p7-restaurado-1920.png); sem erros de console.
- **Rigor 9,0:** Título revelado agora é 'Taxa de aprendizagem: no treino, taxas perto de 1 descem mais rápido' (roteiro.ts linha 42). Conferi na biblioteca (a/num.ts, 20 taxas × 4 árvores) que ele vale em todos os estados do gráfico: após a árvore 1 a perda cai a cada aumento de η (1: 0,2685, a menor); após as árvores 2, 3 e 4, toda taxa de 0,80 a 1 fica abaixo de toda taxa menor (máximo das altas contra mínimo das baixas: 0,1983 contra 0,2091; 0,1542 contra 0,1655; 0,1026 contra 0,1070). O gráfico mostra η = 1 (0,102) acima de 0,95 (0,073) e a leitura explica sem dizer que passa do ponto; o subtítulo restringe 'a maior taxa' à primeira árvore, o que o dado confirma. Biblioteca conferida contra o scikit-learn (testes tests/capitulo6-* passam, 33 de 33).
- **Acess. 10,0:** axe sem violações; teclado, foco e movimento reduzido conferidos

### 8. Nas quatro árvores, a perda de treino cai (c6p8)

- **Layout 9,4:** auditoria 9.40 em 1920 × 1080 e 9.40 em 1400 × 900; varredura limpa nos cenários medidos
- **Legib. 9,0:** menor fonte 1.73% da altura (span:Leitura)
- **Beleza 9,0:** Capturas a/c6p8-B-certa-1920.png, a/c6p8-est-rvore2-1920.png e a/c6p8-p16-arv4-1366.png: trajetórias de PD agrupadas por folhas, a acompanhada em traço grosso com rótulos de PD em cada estágio (69,0%, 65,4%, 63,2%), rótulos finais com marca de classe (● default, ○ adimplente, as duas no grupo misto #1 e #2), faixa do estágio ativo sombreada, log loss alinhada abaixo do eixo; nada sobreposto nas duas resoluções.
- **Didática 9,0:** Árvores 2 a 4 ocultas até o acerto (a/c6p8-ini-1920.png); retornos nomeiam a confusão ('A árvore corrige grupos, não propostas'; na C, 'A pergunta era outra' com o contraexemplo); leitura revelada com valor da folha, η vezes valor e PD antes e depois (árvore 4, #10: +1,27, +0,51, 63,2% a 74,1%) e link ao slide 9.
- **Interação 9,0:** Seletor de estágio F₀ a árvore 4 e lista de proposta mudam a curva em destaque e a leitura (#16 na árvore 4: folha −0,45, PD de 75,9% a 72,4%, a/c6p8-p16-arv4-1366.png); Restaurar volta à árvore 4, #10 e previsão aberta (a/c6p8-restaurado-1920.png).
- **Rigor 9,0:** Log loss 0,693, 0,452, 0,330, 0,263, 0,217 e trajetórias de #10 (69,0, 65,4, 63,2, 74,1%) e #16 (50,0, 65,1, 75,9, 72,4%) conferidas na biblioteca e no scikit-learn (a/num.ts, a/sk.py). O retorno da C agora diz 'Costuma cair; não é garantido' com contraexemplo calculado: p = 1%, metade de defaults, γ = 49,49, perda de 2,308 a 7,601 com η = 0,4 (conferido). Fonte com 8 defaults, F₀ = 0,00, taxa, profundidade, mínimo por folha e semente.
- **Acess. 10,0:** axe sem violações; teclado, foco e movimento reduzido conferidos

### 9. A PD final se decompõe em parcelas rastreáveis (c6p9)

- **Layout 9,4:** auditoria 9.40 em 1920 × 1080 e 9.40 em 1400 × 900; varredura limpa nos cenários medidos
- **Legib. 9,0:** menor fonte 1.73% da altura (span:Leitura)
- **Beleza 9,0:** Captura rev2p1/c6p9-revelado.png: cascata em log odds sobre a sigmoide no mesmo eixo, barras cheias para parcela positiva e vazadas para negativa, regra da folha sob cada árvore, ponto final ligado à PD por tracejado.
- **Didática 9,0:** Previsão com quatro alternativas, cada errada com a confusão nomeada (log odds tomada por pontos de PD; PD como soma; inversão da curvatura); leitura com 0,00 + 0,80 − 0,16 − 0,10 + 0,51 = 1,05 e PD 74,1%; links aos slides 8 e 10.
- **Interação 9,0:** Os 16 botões de proposta redesenham cascata, regras e leitura (proposta 16: 0,00 + 0,00 + 0,62 + 0,52 − 0,18 = 0,96, PD 72,4%); Restaurar.
- **Rigor 9,0:** Conferido com a biblioteca: #10 F = 0,800, 0,636, 0,541, 1,051, PD 74,1% (scikit-learn 0,7409); ganhos 10,88 pp e 4,60 pp; #9 e #10 na mesma folha da árvore 4 (valor 1,274 nas duas).
- **Acess. 10,0:** axe sem violações; teclado, foco e movimento reduzido conferidos

### 10. A fórmula de Friedman resume os passos já vistos (c6p10)

- **Layout 9,1:** auditoria 9.10 em 1920 × 1080 e 9.10 em 1400 × 900; varredura limpa nos cenários medidos
- **Legib. 9,0:** menor fonte 1.73% da altura (span:Leitura)
- **Beleza 9,0:** Capturas a/c6p10-ini-1920.png e a/c6p10-m3-p15-1920.png: cinco linhas numeradas com o laço recuado, fórmula, papel com link e exemplo em colunas alinhadas, números do exemplo em negrito; linha 5 com 'F_m = ?' antes do acerto; seletores de árvore e de proposta com marca de classe (● default, ○ adimplente) e desativados até a previsão.
- **Didática 9,0:** A linha 5 inteira (fórmula e exemplo) fica oculta até o acerto, corrigindo a rodada anterior; quatro alternativas com retornos que nomeiam a confusão (A: soma a correção inteira; C: a taxa não encolhe o acumulado; D: 'Confunde as escalas', a/c6p10-D-errada-1920.png); leitura liga ao slide 9 e ao 11.
- **Interação 9,0:** Seletores de árvore (1 a 4) e das 16 propostas recalculam as cinco linhas com a biblioteca (árvore 3, proposta 15: 0 − σ(−0,16) = −0,46; −0,11 ÷ 0,47 = −0,24; −0,16 + 0,4 × (−0,24) = −0,26, a/c6p10-m3-p15-1920.png); travados até a previsão; Restaurar volta à árvore 2, proposta 10 e previsão aberta.
- **Rigor 9,0:** Conferido com a biblioteca e o scikit-learn: F₁(#10) = 0,800, γ₂ = −0,4095, F₂ = 0,6362 (0,64 na tela); F₂(#15) = −0,1638, γ₃ = −0,2381, F₃ = −0,2591 (−0,26); F₀ = 0,00 com 8 de 16. O rodapé agora diz 'A perda costuma cair a cada m, sem garantia (slide 8)'. Fonte com amostra, semente, configuração e Friedman (2001), Annals of Statistics 29(5).
- **Acess. 10,0:** axe sem violações; teclado, foco e movimento reduzido conferidos

### 12. Profundidade é a ordem de interação (c6p12)

- **Layout 9,4:** auditoria 9.40 em 1920 × 1080 e 9.40 em 1400 × 900; varredura limpa nos cenários medidos
- **Legib. 9,0:** menor fonte 1.73% da altura (span:Leitura)
- **Beleza 9,0:** Peça única domina: log odds por utilização em três scores, cada curva com traço próprio (contínuo, tracejado, pontilhado) além da cor de probabilidade, rótulo com o efeito na ponta (+0,17, +0,10, +0,01 em profundidade 2; +0,07 nos três com tocos) e faixas cinza que mostram onde o efeito é medido (captura rev2p2/c6p12-certa.png). Com 300 árvores a forma serrilhada mostra a decoreba (c6estados2/c6p12-1920x1080-4-arv300.png). No estado inicial sobra um vão entre as alternativas e o Restaurar no painel direito, sem chegar a área morta grande.
- **Didática 9,0:** Uma ideia (profundidade fixa a ordem de interação); previsão antes de revelar com seletores travados; retorno da B nomeia a confusão (um toco corta uma variável só, nenhuma folha conhece score e utilização juntos) e o da C distingue degrau de reta; leitura com os números da tela e ligação ao slide 13; a leitura revelada já desmonta 'mais fundo é melhor': a melhor perda é a dos tocos (0,2936 contra 0,2955 e 0,2974).
- **Interação 10,0:** Seletores de profundidade (1, 2, 3) e de árvores (parada ou 300) recalculam as curvas e os três efeitos; o aluno muda a causa (profundidade) e vê o efeito que o título afirma (curvas paralelas com tocos, efeito dependente do score com profundidade 2), com números que respondem; Restaurar volta ao estado inicial; botões de teclado; nada depende de passar o mouse.
- **Rigor 9,0:** Conferido: paradas 20, 16 e 8 árvores com 0,2936, 0,2955 e 0,2974; validação com 300 árvores 0,3289; efeitos +0,17, +0,10, +0,01 (parada) e +1,36, +0,73, −1,09 (300); percentil 95 da utilização 60,7% e scores 712 a 927. Fonte com 1.472 e 631 propostas, 62 defaults, η, mínimo, semente e definição do efeito; base sintética declarada; a leitura limita a conclusão ('interação só vale se validar').
- **Acess. 10,0:** axe sem violações; teclado, foco e movimento reduzido conferidos

### 13. Quatro controles mexem na mesma complexidade (c6p13)

- **Layout 9,4:** auditoria 9.40 em 1920 × 1080 e 9.40 em 1400 × 900; varredura limpa nos cenários medidos
- **Legib. 9,0:** menor fonte 1.73% da altura (span.q7-kpi-r:Perda de ajuste)
- **Beleza 9,0:** Curva de perda por árvores domina, ajuste em azul contínuo com círculo, validação em verde tracejado com triângulo, referência em cinza só depois da previsão; quatro KPI pequenos e subordinados; controles agrupados sob a peça (rev2p2/c6p13-eta05-m40.png).
- **Didática 9,0:** Pergunta útil no título antes da resposta ('Qual dos quatro controles freia a complexidade?'), afirmação depois; cada alternativa errada tem retorno calculado que nomeia o engano (taxa: 0,252 com η 0,05 contra 0,142 com η 0,5, 'acelera, não freia'; profundidade: 0,276 contra 0,175); leitura com números e ligação ao slide 14; a leitura admite que a melhor validação escolhida na própria validação é otimista.
- **Interação 9,0:** Taxa, profundidade, mínimo e número de árvores mudam a curva, os quatro KPI e a leitura; modelos ajustados ao vivo; Restaurar; o retorno ao slide reinicia a previsão (testado: depois de revelar, avançar e voltar, nenhuma alternativa marcada).
- **Rigor 9,0:** Conferido: referência com 300 árvores, ajuste 0,234, validação 0,329, AUC 0,874 e 0,587; retornos 0,252 e 0,142 (η), 0,276 e 0,175 (profundidade), 0,197 e 0,259 (mínimo 5 e 160). Fonte com 1.472 propostas e 139 defaults, 631 e 62, configuração da referência; terminologia correta.
- **Acess. 10,0:** axe sem violações; teclado, foco e movimento reduzido conferidos

### 14. Metade da taxa pede o dobro de árvores (c6p14)

- **Layout 9,4:** auditoria 9.40 em 1920 × 1080 e 9.40 em 1400 × 900; varredura limpa nos cenários medidos
- **Legib. 9,0:** menor fonte 1.73% da altura (span.q7-kpi-r:Mínimo com η 0,1)
- **Beleza 9,0:** A solução visual é própria do conceito: no eixo η × árvores as duas curvas de validação colapsam numa só (rev2p2/c6p14-alinhado.png), círculo e triângulo vazado distinguem as taxas além do traço. Há repetição: 16 e 34 árvores aparecem nos KPI, nos rótulos da figura, na lista de passo total e na leitura.
- **Didática 9,0:** Previsão com a curva de η 0,05 escondida; retornos nomeiam cada engano ('a taxa não importa', 'taxa menor chega antes'); leitura com números (16 e 34 árvores, 2,1 vezes, distância máxima 0,0023), admite que o ponto exato do mínimo é ruidoso e liga ao slide 15 com uma regra de ação (fixe a taxa, ache as árvores na validação).
- **Interação 9,0:** Par de taxas e eixo (árvores ou η × árvores) mudam a figura e os números; Restaurar; controles travados até a resposta certa.
- **Rigor 9,0:** Conferido: η 0,1 mínimo em 16 (0,2955), η 0,05 em 34 (0,2955), η 0,025 em 73 (0,2959); passo total 1,60 e 1,70; distância máxima 0,0023 no primeiro par. Fonte com 631 propostas e 62 defaults, profundidade, mínimo e a definição da distância.
- **Acess. 10,0:** axe sem violações; teclado, foco e movimento reduzido conferidos

### 15. A validação diz quando parar (c6p15)

- **Layout 9,4:** auditoria 9.40 em 1920 × 1080 e 9.40 em 1400 × 900; varredura limpa nos cenários medidos
- **Legib. 9,0:** menor fonte 1.73% da altura (span.q7-kpi-r:Perda)
- **Beleza 9,0:** Corrigir anterior resolvido: o rótulo 'mínimo: 16 árvores, 0,2955' agora é posicionado por busca de caixa livre que testa as duas curvas (função cruza em s15-quando-parar.tsx). Medido no DOM (a/rotulo15.mjs, getBBox contra getPointAtLength das duas curvas): zero pontos de curva dentro do rótulo e folga mínima de 14,4 / 15,5 / 14,5 / 13,6 px no eixo 0 a 300 e de 14,4 / 11,2 / 10,3 / 9,5 px no eixo 0 a 60, em 1920, 1400, 1366 e 1280. Visualmente: eixo 300 com o rótulo acima da subida da validação, sem cruzar (a/zoom-c6p15-eixo300-m300-1920.png, -1366.png, zoom-c6p15-eixo300-m16-1920.png); eixo 60 com o rótulo sobre o marcador e o cursor escondido pelo halo (a/det-c6p15-eixo60-m16-1920.png). Os KPI ocultos mostram '?' em vez de '·' (a/c6p15-ini-1920.png). Faixa verde de 11 a 22, peça única, sem erro de console.
- **Didática 9,0:** Pergunta no título com a validação oculta e KPI com '?' (a/c6p15-ini-1920.png); retornos com dado: A 'O ajuste não sabe parar. Com 300 árvores, a perda de validação é 0,3289, contra 0,2955 no mínimo'; B '... já sobe antes de 100: 0,3039 com 50 árvores, 0,3096 com 100 e 0,3289 com 300' (a/c6p15-B-errada-1920.png). Leitura revelada com números e limitação ('de 11 a 22 tanto faz; escolhido nesta amostra, o ponto não se mede sem viés'), ligação aos slides 11 e 17.
- **Interação 10,0:** 'Parar em M árvores' é o experimento do título: M = 23 dá 0,2966, fora da faixa (a/c6p15-m23-1366.png); M = 300 dá 0,3289 (a/c6p15-eixo300-m300-1920.png); seletor de eixo 0 a 60 ou 0 a 300; tabela de paciência; Restaurar volta à pergunta, M = 300 e eixo inteiro (a/c6p15-restaurado-1920.png).
- **Rigor 9,0:** Recalculado (a/num.ts): mínimo da validação em 16, 0,29554; 0,29633 com 9, 0,30385 com 50, 0,30961 com 100, 0,32889 com 300; faixa contínua a 0,001 do mínimo de 11 a 22; AUC de ajuste 0,7431 em 16 e 0,8740 em 300, AUC de validação 0,6553 em 16. Igual à tela (a/c6p15-C-certa-1366.png: 0,2955, 0,743, 0,655; paciência 14, 21, 26, 36 e 11, 16, 16, 16, +0,0003). Fonte com amostras, defaults, sementes e configuração.
- **Acess. 10,0:** axe sem violações; teclado, foco e movimento reduzido conferidos

### 16. Sortear metade: ganho consistente, dentro do erro da validação (c6p16)

- **Layout 9,1:** auditoria 9.40 em 1920 × 1080 e 9.10 em 1400 × 900; varredura limpa nos cenários medidos
- **Legib. 9,0:** menor fonte 1.73% da altura (span:Leitura)
- **Beleza 9,0:** Peça única que domina: gráfico de pontos em duas filas (parada em 16 e 200 árvores), zero tracejado, faixa cinza da validação com o valor no cabeçalho (±0,0051 e ±0,0111 com 50%), losango da média com barra entre sementes, legenda com símbolos; tabela da régua ao lado, leitura e fonte abaixo (a/c6p16-B-certa-1920.png, a/c6p16-B-certa-1366.png). Com 80% e 30% a escala se ajusta e nenhum rótulo se sobrepõe (a/c6p16-f80-1366.png, a/c6p16-f30-1366.png). Sem erro de console em nenhum caminho (shots.mjs).
- **Didática 9,0:** Previsão antes de revelar, com a fila da parada oculta ('sementes: abrem depois da previsão', a/c6p16-ini-1920.png). Retornos nomeiam a confusão: A 'Confunde ganho que se repete nas sementes com ganho que a validação distingue: nem com 200 árvores, em que 10 de 10 sementes ganham, o ganho passa da faixa (z = 1,92, abaixo de 1,96)' (a/c6p16-A-errada-1920.png); C 'Confunde a dispersão de cada semente com a incerteza do efeito médio' (a/c6p16-C-errada-1920.png). Leitura revelada conclui com os números da tela e liga ao slide 17 ('o ganho se repete nas sementes, por pouco, mas fica dentro do erro da validação de 631 propostas; é um controle barato, não uma prova', a/c6p16-B-certa-1920.png); a de antes liga ao slide 15 (0,2955 em 16, 0,3228 com 200). Com 80% ou 30% o retorno da certa diz 'Isso, com 50%, a fração da pergunta. A tabela dá a régua com 80%' (a/c6p16-f80-1366.png).
- **Interação 9,0:** Corrigir anterior resolvido: acerto, 80%, 'Tentar outra' volta a pergunta, gráfico ('Subamostra de 50%', fila da parada oculta, média +0,0109 embaixo) e seletor a 50%, travado ('Fração por árvore: depois da previsão') (a/c6p16-f80-tentar-1920.png); a A errada em seguida cita z = 1,92 com o gráfico de 50% na tela (a/c6p16-f80-tentar-A-1366.png); C e B no mesmo caminho também coerentes (a/c6p16-f80-tentar-C-1920.png, -f80-tentar-B-1920.png). O mesmo com 30% (a/c6p16-f30-tentar-1920.png). Seletor desabilitado antes da previsão e com resposta errada (isDisabled true nas três frações, textos.json 'seletor-desab'). Restaurar volta a 50% e à pergunta a partir de 80% revelado e de A errada (a/c6p16-restaurado-1920.png, -restaurado-de-A-1920.png); ao sair para o slide 17 e voltar, o quadro reinicia (a/c6p16-retorno-1920.png). A fração muda pontos, médias, faixas, tabela, título, subtítulo e leitura.
- **Rigor 9,0:** Régua recalculada por conta própria (a/num.ts gera as perdas por proposta da biblioteca; a/regua16.py com scipy): t de 9 graus 2,2622, t de 630 graus 1,9637, parada k0 = 16. 50%: parada +0,000963, faixa entre sementes ±0,000899 (+0,000064 a +0,001861), 8 de 10, erro pareado 0,002589, faixa ±0,005084, z 0,372; 200 árvores +0,010916, ±0,002050, 10 de 10, erro 0,005671, ±0,011136, z 1,925. 80%: +0,000740 ±0,000962 (−0,000222 a +0,001702, toca o zero), 6 de 10, z 0,711; 200: +0,005894 ±0,001362, z 1,462. 30%: −0,003017 ±0,001336, 1 de 10, z −0,916; 200: +0,007417 ±0,003144, z 1,110. Tudo igual à tela. Os dois corrigir anteriores foram resolvidos: com 80% o subtítulo já não dá razão ('Na parada, +0,0007; com 200 árvores, +0,0059, que cabe na faixa', z 1,46 abaixo de 0,9 × 1,964), e com 50% também não (porPouco: +0,000064 < 0,1 × 0,000963), com 'chega ao limite da faixa' certo (1,925 ≥ 1,767); a leitura de 50% trocou 'o ganho existe' por 'o ganho se repete nas sementes, por pouco'. Títulos batem com sinalS nas três frações ('ganho consistente' / 'ganho só longe da parada' / 'piora na parada e ganho longe dela'); 30%: 'piora a parada em 9 de 10 sementes' confere (uma semente +0,00058). Guia (paginas.json c6p16): números de apoio, condução, leitura e resposta conferem, e a resposta já não diz 'existe'. npm test do capítulo: 33 de 33.
- **Acess. 10,0:** axe sem violações; teclado, foco e movimento reduzido conferidos

### 17. Com três variáveis, a logística ordena melhor na validação (c6p17)

- **Layout 9,1:** auditoria 9.10 em 1920 × 1080 e 9.10 em 1400 × 900; varredura limpa nos cenários medidos
- **Legib. 9,0:** menor fonte 1.73% da altura (span:Leitura)
- **Beleza 9,0:** Peça única com AUC e log loss em escala log, logística como reta tracejada, ajuste em cinza fino e validação em verde (papel de validação), marcador quadrado no ajuste e círculo na validação, símbolo além da cor. A pendência da rodada anterior foi resolvida: com 300 árvores o quadrado do marcador não encosta mais no rótulo 'boosting, ajuste' (xe = d.w − m.r + 0,75 fs, linha 75 de s17-logistica.tsx; c6p17-k300-1366.png). Antes da previsão, as caixas 'validação: abre depois da previsão' não cruzam nenhuma curva (c6p17-ini-1920.png, c6p17-B-errada-1366.png). Rótulos 'logística, validação' e 'logística, ajuste' empilhados sem sobreposição nos dois painéis (c6p17-C-certa-1920.png). O expansor que cobria a tabela saiu.
- **Didática 10,0:** Virada com o próprio dado: a leitura inicial mostra o boosting passando a logística no ajuste com 4 árvores e chegando a 0,8740 com 300; os retornos nomeiam 'Confunde ajuste com validação' (0,5869 contra 0,7006) e 'O melhor boosting não é o melhor modelo' (AUC 0,6553 contra 0,7006, 'fora do ruído'; log loss 0,2955 contra 0,2932, 'empate dentro do ruído'), sem entregar a alternativa certa; a certa dá o pico 0,6893 em 6 árvores e diz que a menor log loss 'só empata'. Título provisório em pergunta antes, afirmação 'Com três variáveis, a logística ordena melhor na validação' depois (c6p17-C-certa-1920.png), coerente com a leitura 'Só a AUC separa os modelos'. Liga ao slide 18. O aluno vê a confusão ajuste contra validação acontecer nas curvas que divergem.
- **Interação 9,0:** O controle de 1 a 300 árvores move os marcadores das quatro curvas e a linha da tabela (k = 1: 0,6741 / 0,6791 / 0,3138; k = 6: 0,6997 / 0,6893 / 0,2990; k = 300: 0,8740 / 0,5869 / 0,3289; c6p17-k1, k6, k300). Pendência da rodada anterior resolvida: o expansor que cobria tabela, controle e Restaurar foi retirado (diff de s17-logistica.tsx). Restaurar volta a 16 árvores e à pergunta (c6p17-restaurado); reinício ao voltar conferido (voltar.mjs: depois de Próxima e Anterior, título provisório, controle em 16, três alternativas); Enter na alternativa com foco revela (voltar.mjs). Antes da previsão o controle já move o ajuste (c6p17-pre-k300).
- **Rigor 9,0:** Recalculado com código próprio (b/num17.ts: AUC por pares, log loss própria, DeLong próprio pelas componentes V10 e V01, diferença pareada própria): logística 0,7006 na validação e 0,6934 no ajuste; boosting parado em 16 (mínimo da log loss 0,29554), 0,6553; pico 0,6893 em 6; 0,5869 em 300; passa a logística no ajuste com 4 árvores. DeLong logística menos boosting: 0,04537, EP 0,01269, IC de 0,0205 a 0,0702 (tela 0,045, de 0,020 a 0,070). Log loss pareada boosting menos logística: 0,00230, IC de −0,00533 a 0,00994 (tela 0,0023, de −0,0053 a 0,0099): o 'corrigir' da rodada anterior entrou na leitura, no retorno da B e no guia. Em nenhum k a log loss do boosting fica abaixo da logística (0 de 300), o que sustenta 'Não, em nenhum número de árvores'. Fonte com 139 e 62 defaults, parada escolhida nesta validação, os dois ICs pareados nomeados. npm test do capítulo passa (33 de 33).
- **Acess. 10,0:** axe sem violações; teclado, foco e movimento reduzido conferidos

### 18. Árvores demais distorcem as PDs, mesmo com a média certa (c6p18)

- **Layout 9,1:** auditoria 9.10 em 1920 × 1080 e 9.10 em 1400 × 900; varredura limpa nos cenários medidos
- **Legib. 9,0:** menor fonte 1.73% da altura (span.q7-kpi-r:PD média)
- **Beleza 9,0:** O corte da rodada anterior foi resolvido: a nota do slope foi para o detalhe do KPI ('IC 0,80 a 1,58 / < 1: extremas / > 1: tímidas'), e a varredura nos 9 pontos do controle, nas duas erradas e no estado inicial, em 1920, 1400 e 1366, não acha nada fora do painel (o título do eixo y passa poucos pixels do topo do SVG, sem corte, c6p18-k16-1366.png). Curva de confiabilidade como peça única, diagonal com as duas regiões nomeadas, barras de Wilson, referência do modelo parado em quadrados cinza; o leque com 300 árvores se lê na forma (c6p18-B-certa-1920.png).
- **Didática 9,0:** Desmonta 'se a média bate, as faixas batem' com o dado: PD média 9,3% e 8,9%, as duas no intervalo de 7,7% a 12,4%, enquanto o slope vai de 1,19 a 0,42 e as faixas no intervalo de 3 para 1 de 5; retornos 'Confunde média com calibração' e 'Confunde dispersão com nível' com números; 'Com 1 árvore' corrigido (c6p18-k1); a tradução do slope aparece desde o estado inicial (c6p18-ini-1920.png); leitura do modelo parado com 'sinais mistos, que 631 propostas não resolvem'.
- **Interação 10,0:** O controle (1, 5, 10, 16, 30, 50, 100, 200, 300) redesenha curva, barras, KPI e leitura contra a referência do modelo parado: 1 árvore, slope 5,86, 'PDs tímidas demais'; 30, slope 0,94, 'a amostra não distingue o slope de 1'; 300, slope 0,42, 1 de 5 (c6p18-k1, k30, B-certa); a resposta certa leva o controle a 300; Restaurar volta ao parado e à pergunta.
- **Rigor 9,0:** Recalculado com regressão logística própria por Newton (b/num19.ts): parado em 16, PD média 9,3227%, slope 1,1892 (0,7968 a 1,5816); com 300, PD média 8,8996%, slope 0,4187 (0,1759 a 0,6615); igual à tela. Taxa 62 de 631 = 9,83% com Wilson 7,7% a 12,4%. Frases sobre faixas e slope calculadas; a limitação aparece ('631 propostas não resolvem').
- **Acess. 10,0:** axe sem violações; teclado, foco e movimento reduzido conferidos

### 19. Por que esta PD? A contribuição de cada variável (c6p19)

- **Layout 9,1:** auditoria 9.10 em 1920 × 1080 e 9.10 em 1400 × 900; varredura limpa nos cenários medidos
- **Legib. 9,0:** menor fonte 1.73% da altura (span:Leitura)
- **Beleza 9,0:** Cascata do valor esperado ao escore como forma do conceito, ▲ e ▼ além da cor, barras ocultas em caixas tracejadas com '?' antes da previsão (c6p19-ini-1366.png), '0,00: sem corte' no atraso, escala que se ajusta a cada proposta e rótulo do escore que não sai do quadro (score 650: −0,82 (30,6%), c6p19-score650-1366.png; maior PD −0,47 (38,5%)). Nenhum rótulo sobreposto nos estados capturados em 1920 e 1366.
- **Didática 10,0:** Os dois 'para 10' da rodada anterior foram resolvidos: a definição de ganho aparece antes da previsão ('Ganho: quanto os cortes na variável reduzem a perda, somado na carteira e sem sinal', c6p19-ini-1920) e o retorno da certa agora fica visível na leitura ('Sua previsão acertou: a utilização move −0,15 na log odds, 1,9 vezes o que o score move. A carteira corta mais no score; esta proposta depende mais da utilização. Caso raro: 9 das 631 propostas', c6p19-A-certa-1920 e c6p19-A-certa-direto). A proposta (0,3%, 9 dias, 830) faz errar quem responde pela coluna de ganho visível (score 89%); retornos nomeiam 'Confunde importância na carteira com peso na proposta' e 'Confunde valor alarmante com contribuição: nenhuma das 16 árvores corta no atraso'. O aluno vê a confusão acontecer com o dado. Liga ao slide 20.
- **Interação 9,0:** O 'corrigir' da rodada anterior foi resolvido: 'Menor PD' procura só entre adimplentes e abre a proposta 0,0%, 4 dias, 875,5; 'Default, PD baixa' abre 0,0%, 6 dias, 928,8, um default (c6p19-menor-pd e c6p19-default-pd-baixa-1920; b/num19.ts confirma 56 empatadas em 4,68%, 7 defaults). Cinco propostas e três controles recalculam contribuições, escore e PD com a soma conferida; score 650 leva a PD a 30,6% e a utilização de −0,15 para −0,20; atraso 40 não muda nada (c6p19-atraso40); Restaurar volta à proposta e à previsão; reinício ao voltar conferido (voltar.mjs). Mas os dois botões novos mostram a mesma cascata e a mesma PD (−0,15, 0,00, −0,48, = −3,01, 4,7%): a leitura só muda no parêntese.
- **Rigor 9,0:** Recalculado com Shapley exato próprio (b/num19.ts, expectativa condicional por cobertura e soma sobre os 2³ subconjuntos): proposta 31, valor esperado −2,3760, contribuições −0,1541, 0, +0,0809, escore −2,4492, PD 7,95%, razão 1,905 (tela 1,9); 9 das 631 propostas em que a maior contribuição não é a do score; 16 árvores sem corte no atraso; score 650: −0,2023, 0, +1,7572, escore −0,8211, PD 30,55% (tela −0,20, +1,76, −0,82, 30,6%); 56 propostas na menor PD com 7 defaults (tela 'uma das 49 adimplentes' e 'um dos 7 defaults'); 13 na maior PD (tela 'uma das 13'). O 'para 10' anterior entrou. Ganho 0,1057, 0, 0,8943 (importanciaGanho). Fonte com amostra, parada e conferência com shap.TreeExplainer.
- **Acess. 10,0:** axe sem violações; teclado, foco e movimento reduzido conferidos

### 20. PD que cai quando o atraso sobe? Restrição monotônica (c6p20)

- **Layout 9,4:** auditoria 9.40 em 1920 × 1080 e 9.40 em 1400 × 900; varredura limpa nos cenários medidos
- **Legib. 9,0:** menor fonte 1.73% da altura (span:Leitura)
- **Beleza 9,0:** Dependência parcial em degraus (livre tracejado, monotônico contínuo, rótulos na ponta) sobre o observado por faixa com intervalo de Wilson e contagens defaults/propostas no eixo; a faixa de 31 a 60 dias sombreada e nomeada (rev2p2/c6p20-certa.png).
- **Didática 9,0:** Título inicial é o fato (11 propostas, nenhuma em default), a leitura já desmonta 'zero default prova risco baixo' com o Wilson até 25,9%; previsão com retornos que nomeiam o engano ('o modelo não conhece a lógica de crédito, só os dados'); leitura com números e ligação ao slide 21; nota 'Monotonia não é calibração'.
- **Interação 10,0:** Árvores (parada, 100, 300) e mínimo por folha (10, 40) mudam as duas curvas, a contagem de quedas, AUC, log loss e o IC de DeLong; o aluno muda a complexidade e vê a violação aparecer e sumir com a restrição; Restaurar.
- **Rigor 9,0:** Conferido: 0 defaults em 11 propostas acima de 30 dias (Wilson até 25,9%), 31/305, 89/958, 16/167, 3/31; livre com 300 árvores e mínimo 10: 14,6% em 30 dias, 3,4% a partir de 34, pico 28,9% em 27, 10 quedas; monotônico 0 quedas; AUC 0,5979 e 0,6756, diferença 0,078 (0,035 a 0,121); na parada, 0,6574 e 0,6796, 0,022 (0,003 a 0,041). Parada na mesma validação declarada na fonte.
- **Acess. 10,0:** axe sem violações; teclado, foco e movimento reduzido conferidos

### 21. O candidato do comitê: o que o boosting precisa provar (c6p21)

- **Layout 9,1:** auditoria 9.10 em 1920 × 1080 e 9.10 em 1400 × 900; varredura limpa nos cenários medidos
- **Legib. 9,0:** menor fonte 1.73% da altura (b:Base sintética:)
- **Beleza 9,0:** As duas falhas que davam 8 foram corrigidas: antes da revelação, as células enviadas são pontos com rótulo próprio ('60 × 16: 0,6388' e '100 × 8: 0,6391') e linha de chamada, sem o empilhamento que formava um '8' (zoom-mini-escolha.png, de c6p21-err-60x16-2a-1920); a pílula riscada do score tem a legenda visível 'fora do candidato' na mesma linha (zoom-mini-esgotou.png). Lista com evidência gráfica por item no papel de cor do sistema, selos ✓ ✗ ? com forma além da cor, grade como experimento à direita (c6p21-esgotou-1920, c6p21-certa-pedir-1366). Nenhum rótulo sobreposto nos 12 estados em 1920 e 1366.
- **Didática 9,0:** Grade sem célula e envio desabilitado no início; envio errado abre só a célula enviada e dá a direção ('A maior validação tem menos árvores', 'tem menos folhas'); a célula de maior treino nomeia 'Confunde ajuste com generalização'; a vizinha 60 × 4 recebe 'Não é erro: 0,0076 abaixo da maior, dentro de um erro padrão (0,031)'; a terceira tentativa revela a maior (c6p21-esgotou); a leitura revelada fecha a conta do slide 1 ('O excesso de 0,116 do slide 1 era otimismo do treino') e responde às quatro perguntas, com o link ao capítulo 7. A frase do sintético agora é exata ('PD verdadeira de cada proposta, que nenhuma carteira real dá, e janela futura intocada; o capítulo 7 usa as duas').
- **Interação 9,0:** Doze células escolhíveis, envio desabilitado sem escolha, 'Tentar outra', três tentativas com contagem na leitura ('tentativa 2 de 3', 'tentativa 3 de 3' em c6p21-duas-enviadas-sel), Restaurar (c6p21-restaurado: nenhuma célula aberta, modo Evidência), seletor Evidência / O que pedir que troca o texto dos cinco itens (c6p21-certa contra c6p21-certa-pedir). O mini da escolha agora acompanha cada envio com o valor da célula (c6p21-err-100x8, err-60x16-2a, err-240x4-60x16). Reinício ao voltar: com a célula certa enviada, Próxima e Anterior devolvem 0 células abertas (voltar.mjs). Sem erro de console nas duas resoluções (shots.mjs).
- **Rigor 9,0:** Os dois defeitos que davam 8 foram corrigidos: a correlação 0,95 de outro par saiu da tela ('DeLong pareado nas 760: IC da diferença acima de zero', c6p21-certa-pedir; correlacaoS17 removida do código) e a frase do sintético atribui só à PD verdadeira o que nenhuma carteira real dá. A ressalva menor também entrou: 'empate na régua aproximada' no modo Evidência. Números conferidos em Python a partir de base.json: 100 defaults em 760 (0,13158 × 760 = 100,0008), Wilson de 10,94% a 15,75% (tela 10,9% a 15,7%); EP de Hanley e McNeil 0,03144 (tela 0,031), régua 0,0616 (tela 0,062), diferença 0,0068; 11 de 12 células a menos de um EP; F₀ = −2,2473; excesso 0,1160; 60 × 4 a 0,0076, 100 × 8 a 0,0085, 60 × 16 a 0,0088 da maior (telas iguais). A fonte define o candidato, a amostra temporal e o período.
- **Acess. 10,0:** axe sem violações; teclado, foco e movimento reduzido conferidos

### 22. Apêndice: fórmulas, fronteira e referências (c6p22)

- **Layout 9,6:** auditoria 9.60 em 1920 × 1080 e 9.60 em 1400 × 900; varredura limpa nos cenários medidos
- **Legib. 10,0:** menor fonte 2.42% da altura (p.q7-sub:Material de consulta; o percur)
- **Beleza 9,0:** Abas limpas e uma peça por aba: oito fórmulas em grade de duas colunas, cada título é link para o slide de origem, legenda única de símbolos (c6p22-formulas-1920x1080.png); seis cartões de fronteira com autor, fórmula quando há, o que resolve e 'Quando usar' em faixa própria (c6p22-fronteira-1366x768.png); referências em duas colunas com DOI ou 'acesso' (c6p22-validacao-1366x768.png). Nenhum rótulo cortado nas duas resoluções.
- **Didática 9,0:** Declarado como consulta fora do percurso (subtítulo e fonte: 'a aula termina no slide 21'); cada fórmula aponta o slide em que nasce; a nota do Shapley diz que a soma dá F(x) − E[F]; cada método da fronteira diz o que resolve e quando usar, ligado a um slide do curso (XGBoost ao 6, LightGBM ao 16, EBM ao 12, redes ao 17, contrafactual ao 20). O guia (paginas.json, c6p22) traz pergunta e erro previsto alinhados à aba Fronteira.
- **Interação 9,0:** Slide de consulta: cinco abas que trocam todo o conteúdo do painel (cinco capturas por resolução), links internos para os slides 3, 4, 6, 7, 12, 15, 16, 17, 19 e 20 e links externos para cada referência.
- **Rigor 9,0:** As 15 DOIs resolvem em doi.org (302) e batem no Crossref com título, autores, revista, volume e número citados (Friedman 2001, Annals 29(5); Friedman, Hastie e Tibshirani 2000, Annals 28(2); Friedman 2002, CSDA 38(4); Hastie, Tibshirani e Friedman 2009; Chen e Guestrin, KDD 2016; Lou, Caruana, Gehrke e Hooker, KDD 2013; Potharst e Feelders, SIGKDD Explorations 4(1); Niculescu-Mizil e Caruana, ICML 2005; Lessmann, Baesens, Seow e Thomas, EJOR 247(1), título completo; Lundberg et al., Nat. Mach. Intell. 2(1); Shapley 1953; Wachter, Mittelstadt e Russell; Wilson, JASA 22(158); Hanley e McNeil, Radiology 143(1); DeLong et al., Biometrics 44(3)). Os sete endereços sem DOI respondem 200 com o documento certo: LightGBM nos anais do NeurIPS 2017 (título confere), CatBoost arXiv 1706.09516, InterpretML 1909.09223, Grinsztajn et al. 2207.08815, BCBS WP 14 (página da versão revista), Resolução 4.557 em PDF (cabeçalho confere) e EBA/REP/2023/28 em PDF. Conferido com npx tsx (confere22.ts): na folha B do slide 6, G = 3,0 e H = 1,5, e −G ÷ (H + λ) com λ = 0 dá −2,00, o passo de Newton, como diz o cartão do XGBoost; Reprodução diz 1.472 e 631 e taxa 0,1, profundidade 2, mínimo 40, até 300 árvores, iguais a NA, NV e CFG_CARTEIRA.
- **Acess. 10,0:** axe sem violações; teclado, foco e movimento reduzido conferidos

## Fontes das medidas

- a1920: `tmp/ux/auditoria-c6-1920.json`
- a1400: `tmp/ux/auditoria-c6-1400.json`
- varredura: `tmp/shots/c6final/relatorio.json`
- axe: `tmp/axe6.json`
- funcional: `tmp/funcional-c6.txt`
- avaliacao: `docs/capitulo6/avaliacao.json`
