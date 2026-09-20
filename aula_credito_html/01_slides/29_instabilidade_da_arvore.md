# Slide 29 — Uma pequena mudança nos dados pode mudar os caminhos

**Bloco:** árvore. **Tempo:** 4 min. **Origem:** reamostragens do treino sintético.

## Objetivo e mensagem
Separar transparência de uma árvore da estabilidade de sua estrutura e previsão. Mensagem: “Uma regra fácil de ler pode ser sensível à amostra que a produziu.”

## Tela e composição
Título: **“Se mudarmos um pouco a amostra, a árvore continua contando a mesma história?”**. Duas árvores pequenas lado a lado, mesmas restrições e dados de treino reamostrados. Mostrar a primeira divisão e dois níveis, com ramos adicionais resumidos. Abaixo, um gráfico de pontos com PDs dos quatro clientes nas diferentes reamostragens.

## Dados
Gerar, por exemplo, 20 reamostragens bootstrap do treino, sementes registradas, hiperparâmetros fixos. Não reamostrar teste para treinar. O dispersograma das previsões mostra sensibilidade ao treinamento, não intervalo preditivo calibrado do risco verdadeiro. Guardar splits, tamanho e previsões para cada réplica. Se mudanças pequenas não alterarem a raiz, reportar o que de fato mudou.

## Interação
Escolher réplica A e B com seletores discretos. Destacar automaticamente diferenças em pergunta, limiar e PD. Selecionar cliente realça seus pontos. “Mesma complexidade” exibe os parâmetros usados. Não permitir procurar uma réplica apenas para maximizar uma história dramática; escolher exemplos representativos e registrar o critério.

## Sequência
Pergunte qual das duas árvores é a “verdadeira”. Use a pergunta para discutir estimativa e variabilidade. Compare estrutura e PD: uma raiz diferente não significa necessariamente mudança enorme de previsão, e previsões podem variar mesmo com raízes iguais.

## Notas
Bootstrap ilustra sensibilidade e tem pressupostos; não oferece, neste exercício, inferência completa em séries temporais. Se houver dependência por cliente ou período, ajustar o esquema. No experimento proposto há um cliente por contrato. Não transformar este slide em aula de random forest, apenas situar que ensembles procuram explorar múltiplas funções.

## Ponte
“Antes de combinar várias árvores, vamos verificar se sabemos interpretar uma única árvore e suas limitações.”

## Aceite específico
Duas árvores realmente distintas apenas quando os ajustes produzirem distinção. Dispersion plot com eixos e legenda de réplica. Não rotular intervalo de bootstrap das previsões como risco individual verdadeiro. Mesmos hiperparâmetros verificados.

## Contrato comum de implementação

Leia também os guias de [narrativa](../00_guias/01_narrativa_e_contrato.md), [design e interação](../00_guias/02_design_e_interacao.md), [dados e cálculos](../00_guias/03_dados_e_calculos.md) e [aceite](../00_guias/05_qualidade_e_aceite.md). O estado inicial precisa ensinar sem clique; a exploração amplia a explicação. Inclua reinício local, teclado, toque, descrição acessível, notas do professor e estado estático de impressão. Mantenha o padrão de fonte dos dados indicado neste roteiro.

Implemente este slide, execute os critérios específicos acima, registre evidências em `02_controle/STATUS_SLIDES.md` e só então avance. Uma especificação escrita não é implementação concluída.
