# Estado da arte

O item E do storytelling pergunta se o capítulo entrega o que um especialista atual esperaria encontrar sobre o tema. Responder exige uma lista escrita antes do conteúdo, não depois.

## Como montar o checklist de um tema

1. Liste os temas em duas classes. **Essencial**: o que um validador ou supervisor cobraria hoje; ausência é lacuna. **Fronteira**: método publicado nos últimos dez anos, ou prática regulatória recente, que muda como se faz.
2. Para cada tema, uma referência primária (artigo, norma, documentação oficial) conferida na fonte, com ano. Nada citado de memória sem conferir.
3. Registre em `avaliacao.json` (`estadoDaArte`) onde o capítulo cobre cada tema: slugs dos slides ou "apêndice". Tema não coberto fica com `slides: []`.
4. Nota do item E: 9 com todos os essenciais cobertos e pelo menos metade dos de fronteira; 10 com todos; 8 se faltar um essencial. O portão confere a conta.
5. Cobertura no apêndice vale só com referência primária e uma frase do que o método resolve e quando usar. Cobertura em slide exige que o método apareça funcionando com os dados do caso.

## Checklist preenchido: avaliação e calibração de modelos de PD (capítulo 7)

Conferido em outubro de 2026.

### Essenciais

| id | Tema | Referência primária |
|---|---|---|
| E1 | Discriminação, calibração e decisão como perguntas distintas | Van Calster et al. (2019), Calibration: the Achilles heel of predictive analytics, BMC Medicine 17:230 |
| E2 | ROC, AUC (com Gini = 2 AUC − 1) e KS | Hanley e McNeil (1982), Radiology 143(1); Fawcett (2006), Pattern Recognition Letters 27(8) |
| E3 | Incerteza da AUC e comparação pareada de modelos | DeLong, DeLong e Clarke-Pearson (1988), Biometrics 44(3) |
| E4 | Evento raro: precisão, recall e curva PR | Saito e Rehmsmeier (2015), PLoS ONE 10(3) |
| E5 | Curva de confiabilidade com intervalo por faixa | Wilson (1927), JASA 22(158) |
| E6 | Hierarquia de calibração: média, intercepto e slope, curva | Cox (1958), Biometrika 45; Van Calster et al. (2019) |
| E7 | Regras de pontuação próprias: Brier, log loss, decomposição de Murphy | Brier (1950); Murphy (1973); Gneiting e Raftery (2007), JASA 102(477) |
| E8 | Recalibração em amostra própria: intercepto, Platt, isotônica | Platt (1999); Zadrozny e Elkan (2002), KDD; Niculescu-Mizil e Caruana (2005), ICML |
| E9 | Corte por custo e receita, não por métrica estatística | Elkan (2001), The foundations of cost-sensitive learning, IJCAI |
| E10 | Validação fora do tempo com escolhas congeladas | BCBS (2005), Studies on the Validation of Internal Rating Systems, WP 14 |
| E11 | Teste de aderência da PD por faixa usado por supervisores (binomial, Jeffreys) | ECB (2019), Instructions for reporting the validation results of internal models |
| E12 | PD calibrada como insumo de perda esperada e provisão no Brasil | Resolução CMN 4.966/2021 (vigente desde 1/1/2025); Resolução BCB 352/2023 |

### Fronteira

| id | Tema | Referência primária |
|---|---|---|
| F1 | Diagrama de confiabilidade estável por regressão isotônica (CORP) e decomposição MCB, DSC, UNC | Dimitriadis, Gneiting e Jordan (2021), PNAS 118(8) e2016191118 |
| F2 | Calibradores além de Platt: beta calibration, temperature scaling | Kull, Silva Filho e Flach (2017), AISTATS; Guo et al. (2017), ICML |
| F3 | Probabilidades com garantia de validade: Venn-Abers e predição conformal | Vovk e Petej (2014), Venn-Abers predictors, UAI |
| F4 | Benefício líquido e curva de decisão | Vickers e Elkin (2006), Medical Decision Making 26(6) |
| F5 | Calibração por segmento e multicalibração | Hébert-Johnson et al. (2018), Multicalibration, ICML |
| F6 | PD de longo prazo e ajuste ao ciclo (through the cycle) | EBA (2017), Guidelines on PD estimation, LGD estimation and the treatment of defaulted exposures, EBA/GL/2017/16 |

## Perguntas que o revisor responde no item E

- Algum essencial está ausente? Qual, e onde deveria entrar?
- O que está em slide funciona com os dados do caso ou é só citação?
- Há algo apresentado como atual que a literatura já superou (por exemplo, Hosmer e Lemeshow como teste principal de calibração)?

## Checklist preenchido: gradient boosting com árvores em crédito (capítulo 6)

Conferido em outubro de 2026.

### Essenciais

| id | Tema | Referência primária |
|---|---|---|
| E1 | Modelo aditivo construído em etapas: palpite inicial mais correções | Friedman (2001), Greedy function approximation: a gradient boosting machine, Annals of Statistics 29(5) |
| E2 | Pseudo-resíduo como gradiente negativo da perda; em log loss, y − p na escala de log odds | Friedman (2001); Friedman, Hastie e Tibshirani (2000), Additive logistic regression, Annals of Statistics 28(2) |
| E3 | Valor da folha por passo de Newton (soma dos gradientes sobre soma das curvaturas) | Friedman (2001); Chen e Guestrin (2016), XGBoost, KDD |
| E4 | Taxa de aprendizagem e número de árvores acoplados; parada antecipada por validação | Friedman (2001); Hastie, Tibshirani e Friedman (2009), The Elements of Statistical Learning, cap. 10 |
| E5 | Profundidade (ordem de interação), mínimo por folha e subamostragem como controles | Friedman (2002), Stochastic gradient boosting, Computational Statistics & Data Analysis 38(4) |
| E6 | Validação fora do tempo: treino sempre melhora, janela futura decide a complexidade | BCBS (2005), Studies on the Validation of Internal Rating Systems, WP 14 |
| E7 | Probabilidades do boosting distorcidas e recalibração | Niculescu-Mizil e Caruana (2005), ICML |
| E8 | Comparação com a logística como referência em crédito | Lessmann, Baesens, Seow e Thomas (2015), EJOR 247(1) |
| E9 | Explicação por contribuições aditivas (TreeSHAP) e limites da importância por ganho | Lundberg et al. (2020), Nature Machine Intelligence 2(1) |
| E10 | Restrições monotônicas para respeitar a lógica de negócio | documentação de XGBoost, LightGBM e scikit-learn (monotonic_cst) |
| E11 | Governança: validação independente e backtesting de modelos | Resolução CMN 4.557/2017; EBA (2023), Follow-up report on machine learning for IRB models |

### Fronteira

| id | Tema | Referência primária |
|---|---|---|
| F1 | Objetivo regularizado de segunda ordem | Chen e Guestrin (2016), KDD |
| F2 | Histogramas e amostragem por gradiente | Ke et al. (2017), LightGBM, NeurIPS |
| F3 | Vazamento de alvo em variáveis categóricas e boosting ordenado | Prokhorenkova et al. (2018), CatBoost, NeurIPS |
| F4 | Modelos aditivos explicáveis com interações (GA2M, EBM) | Lou, Caruana, Gehrke e Hooker (2013), KDD |
| F5 | Árvores ainda à frente de redes profundas em dados tabulares | Grinsztajn, Oyallon e Varoquaux (2022), NeurIPS Datasets and Benchmarks |
| F6 | Explicações contrafactuais para decisões adversas | Wachter, Mittelstadt e Russell (2018), Harvard Journal of Law & Technology 31(2) |

## Checklist preenchido: classificação e ensembles (capítulo 12)

Conferido em outubro de 2026.

### Essenciais

| id | Tema | Referência primária |
|---|---|---|
| E1 | Matriz de confusão, acurácia, precisão, recall e F1, com a armadilha da classe rara | Saito e Rehmsmeier (2015), PLoS ONE 10(3) e0118432 |
| E2 | Separação treino e teste, validação cruzada | Hastie, Tibshirani e Friedman (2009), The Elements of Statistical Learning, 2ª ed., cap. 7 |
| E3 | Limiar de decisão pela razão de custos dos dois erros | Elkan (2001), The foundations of cost-sensitive learning, IJCAI |
| E4 | ROC, AUC como probabilidade de ordenar um par, Gini = 2 AUC − 1, curvas que se cruzam | Fawcett (2006), Pattern Recognition Letters 27(8) |
| E5 | Voto por maioria e o papel da independência dos erros | Hansen e Salamon (1990), IEEE TPAMI 12(10) |
| E6 | Bagging e redução de variância | Breiman (1996), Bagging predictors, Machine Learning 24(2) |
| E7 | Florestas aleatórias e estimativa out of bag | Breiman (2001), Random forests, Machine Learning 45(1) |
| E8 | Gradient boosting: árvore ajustada ao gradiente negativo, taxa de aprendizado | Friedman (2001), Annals of Statistics 29(5) |
| E9 | Validação fora do tempo e estabilidade entre safras | BCBS (2005), Studies on the Validation of Internal Rating Systems, WP 14 |
| E10 | Regra de corte em crédito: volume recusado, taxa de maus e IV | Siddiqi (2017), Intelligent Credit Scoring, 2ª ed., Wiley |

### Fronteira

| id | Tema | Referência primária |
|---|---|---|
| F1 | Viés da importância por impureza e importância por permutação | Strobl et al. (2007), BMC Bioinformatics 8:25 |
| F2 | Explicação por contrato com valores de Shapley (SHAP) | Lundberg e Lee (2017), NeurIPS |
| F3 | Boosting regularizado por histograma (XGBoost, LightGBM) | Chen e Guestrin (2016), KDD; Ke et al. (2017), NeurIPS |
| F4 | Stacking: um modelo aprende a combinar os votos | Wolpert (1992), Neural Networks 5(2) |
| F5 | Benchmark de classificadores em crédito | Lessmann et al. (2015), EJOR 247(1) |
