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
