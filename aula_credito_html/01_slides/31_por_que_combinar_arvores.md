# Slide 31 — Uma árvore pequena pode deixar padrões sem explicar

**Bloco:** boosting. **Tempo:** 3 min. **Origem:** experimento auxiliar sintético.

## Objetivo e mensagem
Motivar a combinação de funções simples antes de apresentar a matemática. Mensagem: “Em vez de exigir tudo de uma árvore, podemos construir a previsão por acréscimos.”

## Tela e composição
Título: **“E se uma árvore pequena ainda deixar estrutura nos erros?”**. Mostrar um gráfico bidimensional de duas variáveis do experimento auxiliar e a previsão de uma árvore rasa. Ao lado, resíduos `y−p` agrupados em regiões ou média de resíduo por faixa, com eixo centrado em zero. Não chamar qualquer resíduo individual de padrão: a visualização deve destacar regularidade agregada.

## Dados
Usar mini-experimento separado ou projeção claramente identificada. Se houver um gerador conhecido, mostrar a probabilidade geradora apenas em modo professor, nunca como variável de entrada. Calcular resíduos da árvore escolhida no conjunto que participa do ajuste. Não usar resultados do teste para construir a próxima árvore.

## Interação
Botão “Onde a previsão ficou sistematicamente baixa?” destaca regiões com média positiva de y−p. Outro destaca média negativa. “Acrescentar uma correção” revela uma pequena função adicional como ideia, sem fingir que já é uma execução de boosting. Se exibir resultado numérico, ele precisa vir de uma atualização calculada.

## Roteiro
Retome o slide 27: aumentar uma única árvore não é a única opção. Mostre que há grupos em que a previsão pode estar baixa ou alta. Pergunte como uma próxima função poderia atuar nesses grupos. Termine apresentando a palavra “sequencial”: a próxima árvore usa o estado das previsões anteriores.

## Notas
Diferença entre subajuste e variabilidade não precisa ser resolvida com boosting em todos os casos. Combinar árvores também acrescenta complexidade e pode sobreajustar. Não prometer que toda correção de treino melhora a validação. O título é uma hipótese a ilustrar com dados, não um diagnóstico automático.

## Ponte
“Vamos entender a regra de construção: partir de um escore simples, calcular a direção de melhoria e acrescentar uma árvore.”

## Aceite específico
Os resíduos exibidos são derivados da previsão mostrada. Regiões de correção são do treino. Não apresentar a animação conceitual como treinamento executado. O mesmo código de cor para contribuição positiva/negativa será mantido nos próximos slides.

## Contrato comum de implementação

Leia também os guias de [narrativa](../00_guias/01_narrativa_e_contrato.md), [design e interação](../00_guias/02_design_e_interacao.md), [dados e cálculos](../00_guias/03_dados_e_calculos.md) e [aceite](../00_guias/05_qualidade_e_aceite.md). O estado inicial precisa ensinar sem clique; a exploração amplia a explicação. Inclua reinício local, teclado, toque, descrição acessível, notas do professor e estado estático de impressão. Mantenha o padrão de fonte dos dados indicado neste roteiro.

Implemente este slide, execute os critérios específicos acima, registre evidências em `02_controle/STATUS_SLIDES.md` e só então avance. Uma especificação escrita não é implementação concluída.
