# Mapa dos 50 slides

Cada linha aponta para a especificação completa. Implemente em ordem, consultando os guias comuns. Os roteiros incluem objetivo, tela, dados, controles, sequência didática, notas, transição e aceite.

| Nº | Bloco | Roteiro detalhado | Interação principal |
|---:|---|---|---|
| 01 | Problema | [Quem merece receber crédito?](01_slides/01_a_decisao_de_credito.md) | Escolha local de aprovação e revelação de atributos |
| 02 | Problema | [Quatro clientes acompanharão os três modelos](01_slides/02_quatro_clientes_um_mesmo_problema.md) | Comparação de dois perfis e exploração do dicionário |
| 03 | Problema | [Uma PD precisa de evento, horizonte e população](01_slides/03_definir_evento_e_horizonte.md) | Linha do tempo e classificação de alvo incompleto |
| 04 | Problema | [A previsão só pode usar o que já era conhecido](01_slides/04_informacao_disponivel_e_vazamento.md) | Classificação de informações por disponibilidade |
| 05 | Problema | [O teste deve representar uma decisão no futuro](01_slides/05_validacao_temporal_e_maturacao.md) | Calendário com contratações, maturação e decisões |
| 06 | Problema | [Três maneiras de transformar dados em PD](01_slides/06_tres_modelos_tres_mecanismos.md) | Três mecanismos com construção progressiva |
| 07 | Logit | [O logit começa com uma soma ponderada](01_slides/07_logit_combinacao_em_escore.md) | Waterfall de contribuições com seleção de cliente |
| 08 | Logit | [Um escore livre precisa de uma transformação](01_slides/08_por_que_o_escore_nao_e_pd.md) | Reta de probabilidade com regiões inválidas |
| 09 | Logit | [A curva logística transforma escore em PD](01_slides/09_curva_logistica_interativa.md) | Sigmoide com ponto móvel e zoom de baixas PDs |
| 10 | Logit | [Probabilidade, odds e log-odds são escalas diferentes](01_slides/10_probabilidade_odds_logodds.md) | Grade de 100 pontos e conversão entre escalas |
| 11 | Logit | [O coeficiente altera as odds, não diretamente a PD](01_slides/11_interpretar_coeficientes_e_odds_ratio.md) | Transformação de odds e barras antes/depois |
| 12 | Logit | [Da ficha do cliente à PD, sem caixa-preta](01_slides/12_calculadora_de_pd_do_cliente.md) | Calculadora completa de PD e contribuições |
| 13 | Logit | [Aprender coeficientes significa reduzir uma perda](01_slides/13_como_o_logit_aprende_logloss.md) | Curvas de log-loss com y e p controláveis |
| 14 | Logit | [O mesmo coeficiente produz efeitos diferentes na PD](01_slides/14_efeito_marginal_e_ponto_de_partida.md) | Comparação de efeito exato e aproximação marginal |
| 15 | Logit | [Categorias entram por comparação com uma referência](01_slides/15_categorias_e_referencia.md) | Codificação categórica e troca de referência |
| 16 | Logit | [O logit pode representar relações não lineares](01_slides/16_nao_linearidades_no_logit.md) | Função linear por partes e conversão para PD |
| 17 | Logit | [Uma característica pode mudar o efeito de outra](01_slides/17_interacoes_no_logit.md) | Interações vistas nas escalas z e p |
| 18 | Logit | [Regularizar ajuda a controlar sensibilidade aos dados](01_slides/18_regularizacao_e_complexidade.md) | Trajetórias de coeficientes e validação por penalização |
| 19 | Logit | [Quando o logit é uma boa escolha?](01_slides/19_forcas_e_limites_do_logit.md) | Diagnóstico de adequação em casos de negócio |
| 20 | Logit | [Exercício: o que muda na PD de Bruno?](01_slides/20_exercicio_logit_e_ponte.md) | Exercício numérico com feedback e solução em etapas |
| 21 | Árvore | [Uma árvore organiza a previsão em perguntas](01_slides/21_arvore_como_perguntas_sucessivas.md) | Percurso dos quatro clientes em uma árvore |
| 22 | Árvore | [A PD vem dos contratos que chegaram à folha](01_slides/22_arvore_completa_e_pd_por_folha.md) | Contagens, regras completas e PDs das folhas |
| 23 | Árvore | [A árvore compara perguntas candidatas](01_slides/23_escolher_a_primeira_divisao.md) | Comparação de dois splits e composição dos grupos |
| 24 | Árvore | [O ganho mede a redução da mistura de classes](01_slides/24_gini_e_ganho_ponderado.md) | Cálculo do Gini e ganho ponderado passo a passo |
| 25 | Árvore | [A mesma taxa pode ter incerteza muito diferente](01_slides/25_tamanho_da_folha_e_incerteza.md) | Intervalos de Wilson com tamanho de folha variável |
| 26 | Árvore | [A árvore transforma o espaço em regiões](01_slides/26_particoes_e_interacoes_da_arvore.md) | Mapa de regiões sincronizado ao percurso da árvore |
| 27 | Árvore | [Mais divisões podem melhorar o treino e piorar o futuro](01_slides/27_sobreajuste_da_arvore.md) | Complexidade e perdas de treino/validação |
| 28 | Árvore | [Há diferentes maneiras de limitar a árvore](01_slides/28_profundidade_folha_e_poda.md) | Profundidade, mínimo de folha e poda em cenários reais |
| 29 | Árvore | [Uma pequena mudança nos dados pode mudar os caminhos](01_slides/29_instabilidade_da_arvore.md) | Comparação de réplicas e dispersão das previsões |
| 30 | Árvore | [Exercício: percorrer, interpretar e questionar a árvore](01_slides/30_exercicio_arvore_e_decisao.md) | Exercício de percurso, taxa e sensibilidade |
| 31 | Boosting | [Uma árvore pequena pode deixar padrões sem explicar](01_slides/31_por_que_combinar_arvores.md) | Padrões agregados nos resíduos de árvore rasa |
| 32 | Boosting | [O boosting constrói o escore em etapas](01_slides/32_boosting_sequencia_de_correcoes.md) | Ciclo de atualização do escore em quatro passos |
| 33 | Boosting | [O ponto de partida é uma previsão comum](01_slides/33_previsao_inicial_do_boosting.md) | Preditor constante e curva de log-loss |
| 34 | Boosting | [A primeira árvore aproxima a direção de melhoria](01_slides/34_primeira_arvore_do_boosting.md) | Primeira árvore ajustada aos gradientes negativos |
| 35 | Boosting | [A segunda árvore responde a um erro que já mudou](01_slides/35_segunda_arvore_residuos_atualizados.md) | Segunda árvore com resíduos recalculados |
| 36 | Boosting | [Somamos contribuições no escore e só então calculamos PD](01_slides/36_soma_das_arvores_e_conversao.md) | Waterfall por árvore e previsão de cliente novo |
| 37 | Boosting | [Passos menores mudam a trajetória de aprendizagem](01_slides/37_learning_rate_e_numero_de_arvores.md) | Trajetórias treinadas para cada learning rate |
| 38 | Boosting | [A profundidade define a complexidade de cada correção](01_slides/38_profundidade_e_interacoes_no_boosting.md) | Superfícies e capacidade de representar interações |
| 39 | Boosting | [A validação indica quando parar de acrescentar árvores](01_slides/39_early_stopping_sem_olhar_teste.md) | Revelação da curva de validação e regra de parada |
| 40 | Boosting | [Flexibilidade ajuda quando encontra sinal reproduzível](01_slides/40_quando_boosting_ajuda_e_quando_falha.md) | Casos de adequação e limites do boosting |
| 41 | Boosting | [Explicar a carteira e explicar um cliente são tarefas diferentes](01_slides/41_explicacao_global_e_local.md) | Importância global e explicação local calculadas |
| 42 | Boosting | [Exercício: reconstrua a previsão de um novo cliente](01_slides/42_exercicio_boosting.md) | Exercício de soma no escore e conversão em PD |
| 43 | Avaliação e decisão | [Uma comparação justa começa pelo protocolo](01_slides/43_comparacao_justa_dos_modelos.md) | Diagnóstico de comparações injustas e protocolo |
| 44 | Avaliação e decisão | [Discriminação é colocar maior risco acima de menor risco](01_slides/44_discriminacao_auc_ks.md) | AUC por pares e curvas ROC/KS |
| 45 | Avaliação e decisão | [Ranking bom não garante probabilidades corretas](01_slides/45_calibracao_das_probabilidades.md) | Reliability diagram e transformação monotônica |
| 46 | Avaliação e decisão | [O corte muda quem entra na carteira](01_slides/46_corte_aprovacao_e_inadimplencia.md) | Corte, aprovação e inadimplência entre aprovados |
| 47 | Avaliação e decisão | [A PD é uma entrada da decisão econômica](01_slides/47_pd_perda_esperada_e_resultado.md) | Simulador de perda, resultado e ponto de equilíbrio |
| 48 | Avaliação e decisão | [O modelo precisa continuar útil depois da implantação](01_slides/48_estabilidade_e_monitoramento.md) | Cenários de monitoramento com maturação |
| 49 | Avaliação e decisão | [Comitê: qual modelo e qual política você defenderia?](01_slides/49_comite_de_credito.md) | Comitê com evidências, escolhas e justificativa |
| 50 | Avaliação e decisão | [O modelo produz uma PD; a boa decisão exige mais](01_slides/50_sintese_e_plano_de_aplicacao.md) | Perguntas de recuperação e plano de aplicação |

## Ordem dos blocos

01–06 definem a decisão. 07–20 constroem o logit. 21–30 ensinam árvores. 31–42 desenvolvem boosting. 43–50 comparam as técnicas e conectam previsão à política de crédito.

As pausas e aprofundamentos são opcionais. O encerramento no slide 30 permite dividir a aula em dois encontros, sem interromper a demonstração de boosting.
