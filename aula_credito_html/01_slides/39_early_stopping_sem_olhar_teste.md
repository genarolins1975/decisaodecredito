# Slide 39 — A validação indica quando parar de acrescentar árvores

**Bloco:** boosting. **Tempo:** 4 min. **Origem:** histórico de treinamento pré-calculado.

## Objetivo e mensagem
Entender early stopping e preservar a independência do teste. Mensagem: “A melhor iteração é escolhida usando uma amostra destinada a essa escolha.”

## Tela e composição
Título: **“Continuar melhorando o treino pode deixar de ajudar a validação”**. Gráfico grande com log-loss de treino e validação por iteração. Linha vertical marca a melhor iteração observada segundo o critério definido. Outra marca pode mostrar o ponto em que a paciência encerrou o processo. Diferenciar “melhor iteração” e “iteração de parada” em texto direto.

## Dados e regra
Definir paciência, tolerância e máximo de iterações no notebook. Usar validação fora do tempo explícita, sem aceitar silenciosamente um split aleatório interno que contradiga o protocolo. Se a biblioteca não permite passar a partição desejada, usar avaliação por estágios e seleção controlada. Não usar o teste final para desenhar a regra de parada.

## Interação
Botão “Avançar treinamento” revela a curva em lotes de 10/20 iterações. Contador de paciência aparece apenas quando há falta de melhoria segundo tolerância. Botão “Ir para a melhor iteração” seleciona o modelo correspondente. Os dados podem estar pré-calculados, identificado; não simular consumo de treinamento real.

## Roteiro
Peça que a turma sugira parar antes de revelar toda a curva. Compare esse palpite com a regra. Mostre que o mínimo aparente pode ser ruidoso e que tolerância/paciência evitam reação a variações pequenas. Não exigir uma curva com piora acentuada se ela não ocorrer no experimento.

## Notas
Após escolher configuração, eventual reajuste com mais dados precisa respeitar disponibilidade temporal e ser definido antes de calibrar/testar. Escolher número de árvores é seleção de hiperparâmetro. A iteração de parada não deve ser confundida automaticamente com o modelo que será servido.

## Ponte
“Com esses controles, podemos avaliar em que condições a flexibilidade do boosting oferece ganhos e quais custos ela traz.”

## Aceite específico
Melhor iteração, tolerância, paciência e ponto de parada calculados conforme regra documentada. A linha do teste não aparece no seletor. O modelo final corresponde ao estágio indicado. Botão de avanço não inventa dados intermediários.

## Contrato comum de implementação

Leia também os guias de [narrativa](../00_guias/01_narrativa_e_contrato.md), [design e interação](../00_guias/02_design_e_interacao.md), [dados e cálculos](../00_guias/03_dados_e_calculos.md) e [aceite](../00_guias/05_qualidade_e_aceite.md). O estado inicial precisa ensinar sem clique; a exploração amplia a explicação. Inclua reinício local, teclado, toque, descrição acessível, notas do professor e estado estático de impressão. Mantenha o padrão de fonte dos dados indicado neste roteiro.

Implemente este slide, execute os critérios específicos acima, registre evidências em `02_controle/STATUS_SLIDES.md` e só então avance. Uma especificação escrita não é implementação concluída.
