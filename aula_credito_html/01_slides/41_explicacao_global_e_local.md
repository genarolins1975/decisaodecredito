# Slide 41 — Explicar a carteira e explicar um cliente são tarefas diferentes

**Bloco:** boosting. **Tempo:** 5 min. **Origem:** modelo empírico treinado e explicações calculadas.

## Objetivo e mensagem
Distinguir relevância global, contribuição local e causalidade. Mensagem: “Uma variável importante na carteira não precisa ser o principal fator da previsão de todo cliente.”

## Tela e composição
Título: **“O que o modelo usa em geral? O que pesou para Bruno?”**. Dois painéis simultâneos: importância global por permutação ou SHAP médio absoluto e waterfall local de Bruno. O gráfico global tem cinco/seis variáveis e unidade explícita; o local começa no valor de referência, soma contribuições e chega à saída. A conversão para PD fica ao lado, sem misturar escalas.

## Dados e método
Escolher uma implementação verificável de explicação. Se usar SHAP, registrar background, versão, tratamento de dependência e escala de saída. Em escala raw/log-odds, verificar `base + soma(phi) = F(x)` e `sigmoid(F)=PD` para o boosting binário adotado. Se a biblioteca explicar probabilidade diretamente, declarar essa escala e não aplicar sigmoid novamente.

## Interação
Seletor Ana/Bruno/Carla/Diego atualiza somente o painel local e sua PD do modelo empírico. Global permanece fixo, indicando amostra em que foi calculado. Clicar variável destaca sua posição nos dois painéis. Toggle “Como ler” revela uma contribuição de cada vez e explica sinal. A interpretação global por permutação, se utilizada, não deve ter unidade rotulada como SHAP.

## Condução
Peça a variável mais relevante na carteira e a que mais eleva a previsão de Bruno. Mostre que podem ser diferentes. Compare Bruno e Carla mantendo escalas. Termine com a pergunta “Se alterarmos essa variável, garantimos essa redução de risco?” Resposta: explicação de previsão não identifica efeito causal.

## Notas
Variáveis correlacionadas afetam atribuição e importância. Importância por redução de impureza tem limitações distintas da permutação. Não apresentar SHAP como verdade única sobre o mecanismo econômico. Se o método não puder ser executado, registrar a limitação e usar uma explicação exata por árvore devidamente rotulada, sem fabricar contribuições por variável.

## Ponte
“Vamos verificar se conseguimos separar a construção da previsão de sua interpretação.”

## Aceite específico
Waterfall fecha numericamente na saída explicada. As quatro PDs são do mesmo modelo treinado. Escala e amostra globais visíveis. Sem confusão entre contribuição por árvore, SHAP e causalidade. Botões não alteram o treinamento.

## Contrato comum de implementação

Leia também os guias de [narrativa](../00_guias/01_narrativa_e_contrato.md), [design e interação](../00_guias/02_design_e_interacao.md), [dados e cálculos](../00_guias/03_dados_e_calculos.md) e [aceite](../00_guias/05_qualidade_e_aceite.md). O estado inicial precisa ensinar sem clique; a exploração amplia a explicação. Inclua reinício local, teclado, toque, descrição acessível, notas do professor e estado estático de impressão. Mantenha o padrão de fonte dos dados indicado neste roteiro.

Implemente este slide, execute os critérios específicos acima, registre evidências em `02_controle/STATUS_SLIDES.md` e só então avance. Uma especificação escrita não é implementação concluída.
