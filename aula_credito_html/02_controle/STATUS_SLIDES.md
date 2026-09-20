# Estado de implementação dos 50 slides

**Todos os 50 slides implementados, verificados e aceitos.** A verificação automática
roda com `node qa.mjs` e cobre, por slide: erros de console, hífen ou travessão no texto
visível, rolagem interna, transbordo em relação à área de 1600 por 900, rótulo de SVG
cortado e painel cujo conteúdo não cabe na caixa.

Resoluções verificadas, todas com 50 de 50 aprovados: 1366x768, 1920x1080, 1024x768 e
390x844. A varredura de estados interativos, `node qa.mjs --estados`, clica até 14
controles por slide e repete as mesmas checagens: 50 de 50 nas quatro resoluções.

Coluna **Cálculo** indica a origem dos números exibidos. Nenhum número é digitado duas
vezes: tudo vem de `app/dados/10-dados.js` ou de `app/dados/11-resultados.js`, gerado
por `experimento/experimento.py`.

Coluna **Evidência** aponta a captura de tela do slide em 1366x768. As capturas são
geradas por `node qa.mjs --shots` e ficam fora do versionamento, por serem 11 MB de
artefato refeito em um comando. A evidência versionada são os relatórios por resolução,
`qa/relatorio-1366.json`, `qa/relatorio-1920.json`, `qa/relatorio-1024.json` e
`qa/relatorio-390.json`, com medida por slide, e o PDF de impressão
`qa/aula_credito_impressao.pdf`, 75 páginas: 50 folhas mais o apêndice de notas.

| Slide | Roteiro | Estado HTML | Cálculo | Visual/interação | Evidência | Próxima ação |
|---:|---|---|---|---|---|---|
| 01 | [Quem merece receber crédito?](../01_slides/01_a_decisao_de_credito.md) | Aceito | esquema conceitual | 15 controles · 0 svg | `qa/slide-01-1366.png` | nenhuma |
| 02 | [Quatro clientes acompanharão os três modelos](../01_slides/02_quatro_clientes_um_mesmo_problema.md) | Aceito | esquema conceitual | 12 controles · 0 svg | `qa/slide-02-1366.png` | nenhuma |
| 03 | [Uma PD precisa de evento, horizonte e população](../01_slides/03_definir_evento_e_horizonte.md) | Aceito | contratos ilustrativos | 2 controles · 3 svg | `qa/slide-03-1366.png` | nenhuma |
| 04 | [A previsão só pode usar o que já era conhecido](../01_slides/04_informacao_disponivel_e_vazamento.md) | Aceito | registros didáticos | 16 controles · 0 svg | `qa/slide-04-1366.png` | nenhuma |
| 05 | [O teste deve representar uma decisão no futuro](../01_slides/05_validacao_temporal_e_maturacao.md) | Aceito | experimento sintético | 4 controles · 1 svg | `qa/slide-05-1366.png` | nenhuma |
| 06 | [Três maneiras de transformar dados em PD](../01_slides/06_tres_modelos_tres_mecanismos.md) | Aceito | esquema conceitual | 8 controles · 3 svg | `qa/slide-06-1366.png` | nenhuma |
| 07 | [O logit começa com uma soma ponderada](../01_slides/07_logit_combinacao_em_escore.md) | Aceito | logit manual | 7 controles · 1 svg | `qa/slide-07-1366.png` | nenhuma |
| 08 | [Um escore livre precisa de uma transformação](../01_slides/08_por_que_o_escore_nao_e_pd.md) | Aceito | logit manual | 4 controles · 3 svg | `qa/slide-08-1366.png` | nenhuma |
| 09 | [A curva logística transforma escore em PD](../01_slides/09_curva_logistica_interativa.md) | Aceito | logit manual | 8 controles · 1 svg | `qa/slide-09-1366.png` | nenhuma |
| 10 | [Probabilidade, odds e log-odds são escalas diferentes](../01_slides/10_probabilidade_odds_logodds.md) | Aceito | logit manual | 8 controles · 1 svg | `qa/slide-10-1366.png` | nenhuma |
| 11 | [O coeficiente altera as odds, não diretamente a PD](../01_slides/11_interpretar_coeficientes_e_odds_ratio.md) | Aceito | logit manual | 6 controles · 1 svg | `qa/slide-11-1366.png` | nenhuma |
| 12 | [Da ficha do cliente à PD, sem caixa-preta](../01_slides/12_calculadora_de_pd_do_cliente.md) | Aceito | logit manual | 16 controles · 1 svg | `qa/slide-12-1366.png` | nenhuma |
| 13 | [Aprender coeficientes significa reduzir uma perda](../01_slides/13_como_o_logit_aprende_logloss.md) | Aceito | logit manual | 6 controles · 2 svg | `qa/slide-13-1366.png` | nenhuma |
| 14 | [O mesmo coeficiente produz efeitos diferentes na PD](../01_slides/14_efeito_marginal_e_ponto_de_partida.md) | Aceito | logit manual | 9 controles · 1 svg | `qa/slide-14-1366.png` | nenhuma |
| 15 | [Categorias entram por comparação com uma referência](../01_slides/15_categorias_e_referencia.md) | Aceito | extensão do logit manual | 7 controles · 1 svg | `qa/slide-15-1366.png` | nenhuma |
| 16 | [O logit pode representar relações não lineares](../01_slides/16_nao_linearidades_no_logit.md) | Aceito | cenário do logit manual | 5 controles · 2 svg | `qa/slide-16-1366.png` | nenhuma |
| 17 | [Uma característica pode mudar o efeito de outra](../01_slides/17_interacoes_no_logit.md) | Aceito | cenário do logit manual | 6 controles · 2 svg | `qa/slide-17-1366.png` | nenhuma |
| 18 | [Regularizar ajuda a controlar sensibilidade aos dados](../01_slides/18_regularizacao_e_complexidade.md) | Aceito | experimento sintético | 4 controles · 2 svg | `qa/slide-18-1366.png` | nenhuma |
| 19 | [Quando o logit é uma boa escolha?](../01_slides/19_forcas_e_limites_do_logit.md) | Aceito | síntese, sem dados | 6 controles · 1 svg | `qa/slide-19-1366.png` | nenhuma |
| 20 | [Exercício: o que muda na PD de Bruno?](../01_slides/20_exercicio_logit_e_ponte.md) | Aceito | logit manual | 9 controles · 0 svg | `qa/slide-20-1366.png` | nenhuma |
| 21 | [Uma árvore organiza a previsão em perguntas](../01_slides/21_arvore_como_perguntas_sucessivas.md) | Aceito | árvore didática de 1.000 | 6 controles · 1 svg | `qa/slide-21-1366.png` | nenhuma |
| 22 | [A PD vem dos contratos que chegaram à folha](../01_slides/22_arvore_completa_e_pd_por_folha.md) | Aceito | árvore didática de 1.000 | 6 controles · 2 svg | `qa/slide-22-1366.png` | nenhuma |
| 23 | [A árvore compara perguntas candidatas](../01_slides/23_escolher_a_primeira_divisao.md) | Aceito | árvore didática de 1.000 | 5 controles · 5 svg | `qa/slide-23-1366.png` | nenhuma |
| 24 | [O ganho mede a redução da mistura de classes](../01_slides/24_gini_e_ganho_ponderado.md) | Aceito | árvore didática de 1.000 | 3 controles · 1 svg | `qa/slide-24-1366.png` | nenhuma |
| 25 | [A mesma taxa pode ter incerteza muito diferente](../01_slides/25_tamanho_da_folha_e_incerteza.md) | Aceito | pares binomiais ilustrativos | 3 controles · 1 svg | `qa/slide-25-1366.png` | nenhuma |
| 26 | [A árvore transforma o espaço em regiões](../01_slides/26_particoes_e_interacoes_da_arvore.md) | Aceito | árvore didática de 1.000 | 10 controles · 2 svg | `qa/slide-26-1366.png` | nenhuma |
| 27 | [Mais divisões podem melhorar o treino e piorar o futuro](../01_slides/27_sobreajuste_da_arvore.md) | Aceito | experimento sintético | 2 controles · 5 svg | `qa/slide-27-1366.png` | nenhuma |
| 28 | [Há diferentes maneiras de limitar a árvore](../01_slides/28_profundidade_folha_e_poda.md) | Aceito | experimento sintético | 6 controles · 2 svg | `qa/slide-28-1366.png` | nenhuma |
| 29 | [Uma pequena mudança nos dados pode mudar os caminhos](../01_slides/29_instabilidade_da_arvore.md) | Aceito | experimento sintético | 21 controles · 3 svg | `qa/slide-29-1366.png` | nenhuma |
| 30 | [Exercício: percorrer, interpretar e questionar a árvore](../01_slides/30_exercicio_arvore_e_decisao.md) | Aceito | árvore didática de 1.000 | 10 controles · 1 svg | `qa/slide-30-1366.png` | nenhuma |
| 31 | [Uma árvore pequena pode deixar padrões sem explicar](../01_slides/31_por_que_combinar_arvores.md) | Aceito | experimento auxiliar 2D | 4 controles · 3 svg | `qa/slide-31-1366.png` | nenhuma |
| 32 | [O boosting constrói o escore em etapas](../01_slides/32_boosting_sequencia_de_correcoes.md) | Aceito | miniatura de 10 registros | 3 controles · 1 svg | `qa/slide-32-1366.png` | nenhuma |
| 33 | [O ponto de partida é uma previsão comum](../01_slides/33_previsao_inicial_do_boosting.md) | Aceito | miniatura de 10 registros | 5 controles · 1 svg | `qa/slide-33-1366.png` | nenhuma |
| 34 | [A primeira árvore aproxima a direção de melhoria](../01_slides/34_primeira_arvore_do_boosting.md) | Aceito | miniatura de 10 registros | 4 controles · 1 svg | `qa/slide-34-1366.png` | nenhuma |
| 35 | [A segunda árvore responde a um erro que já mudou](../01_slides/35_segunda_arvore_residuos_atualizados.md) | Aceito | miniatura de 10 registros | 4 controles · 2 svg | `qa/slide-35-1366.png` | nenhuma |
| 36 | [Somamos contribuições no escore e só então calculamos PD](../01_slides/36_soma_das_arvores_e_conversao.md) | Aceito | miniatura de 10 registros | 6 controles · 2 svg | `qa/slide-36-1366.png` | nenhuma |
| 37 | [Passos menores mudam a trajetória de aprendizagem](../01_slides/37_learning_rate_e_numero_de_arvores.md) | Aceito | experimento sintético | 6 controles · 1 svg | `qa/slide-37-1366.png` | nenhuma |
| 38 | [A profundidade define a complexidade de cada correção](../01_slides/38_profundidade_e_interacoes_no_boosting.md) | Aceito | experimento auxiliar 2D | 12 controles · 4 svg | `qa/slide-38-1366.png` | nenhuma |
| 39 | [A validação indica quando parar de acrescentar árvores](../01_slides/39_early_stopping_sem_olhar_teste.md) | Aceito | experimento sintético | 3 controles · 1 svg | `qa/slide-39-1366.png` | nenhuma |
| 40 | [Flexibilidade ajuda quando encontra sinal reproduzível](../01_slides/40_quando_boosting_ajuda_e_quando_falha.md) | Aceito | síntese, com um resultado calculado | 6 controles · 0 svg | `qa/slide-40-1366.png` | nenhuma |
| 41 | [Explicar a carteira e explicar um cliente são tarefas diferentes](../01_slides/41_explicacao_global_e_local.md) | Aceito | experimento sintético | 11 controles · 2 svg | `qa/slide-41-1366.png` | nenhuma |
| 42 | [Exercício: reconstrua a previsão de um novo cliente](../01_slides/42_exercicio_boosting.md) | Aceito | miniatura de 10 registros | 7 controles · 0 svg | `qa/slide-42-1366.png` | nenhuma |
| 43 | [Uma comparação justa começa pelo protocolo](../01_slides/43_comparacao_justa_dos_modelos.md) | Aceito | experimento sintético | 5 controles · 1 svg | `qa/slide-43-1366.png` | nenhuma |
| 44 | [Discriminação é colocar maior risco acima de menor risco](../01_slides/44_discriminacao_auc_ks.md) | Aceito | microexemplo e experimento sintético | 7 controles · 1 svg | `qa/slide-44-1366.png` | nenhuma |
| 45 | [Ranking bom não garante probabilidades corretas](../01_slides/45_calibracao_das_probabilidades.md) | Aceito | experimento sintético | 7 controles · 2 svg | `qa/slide-45-1366.png` | nenhuma |
| 46 | [O corte muda quem entra na carteira](../01_slides/46_corte_aprovacao_e_inadimplencia.md) | Aceito | experimento sintético | 10 controles · 3 svg | `qa/slide-46-1366.png` | nenhuma |
| 47 | [A PD é uma entrada da decisão econômica](../01_slides/47_pd_perda_esperada_e_resultado.md) | Aceito | economia congelada | 5 controles · 2 svg | `qa/slide-47-1366.png` | nenhuma |
| 48 | [O modelo precisa continuar útil depois da implantação](../01_slides/48_estabilidade_e_monitoramento.md) | Aceito | experimento sintético | 5 controles · 1 svg | `qa/slide-48-1366.png` | nenhuma |
| 49 | [Comitê: qual modelo e qual política você defenderia?](../01_slides/49_comite_de_credito.md) | Aceito | experimento sintético | 10 controles · 0 svg | `qa/slide-49-1366.png` | nenhuma |
| 50 | [O modelo produz uma PD; a boa decisão exige mais](../01_slides/50_sintese_e_plano_de_aplicacao.md) | Aceito | síntese, sem dados | 4 controles · 0 svg | `qa/slide-50-1366.png` | nenhuma |
