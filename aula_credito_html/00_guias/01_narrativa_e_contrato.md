# Narrativa e contrato pedagógico

## Pergunta que organiza a aula

“Temos os mesmos solicitantes e três maneiras de estimar o risco. Como cada uma funciona, qual evidência precisamos para compará-las e quando a previsão melhora a decisão de crédito?”

Comece com uma decisão incompleta, apresente os clientes e a definição de risco. Ensine o logit como escore convertido em probabilidade. Mostre a árvore como partição por perguntas e o boosting como construção sequencial de uma função de escore. Termine com evidências fora do tempo e política econômica. A complexidade cresce, mas o problema permanece igual.

## Progressão

| Slides | Pergunta do bloco | Evidência que o aluno deve produzir |
|---|---|---|
| 01–06 | Qual é o problema e como saber se aprendemos? | Definir alvo, horizonte e informações disponíveis |
| 07–20 | Como combinar características em uma PD? | Calcular e interpretar uma previsão de logit |
| 21–30 | Como segmentar clientes por regras aprendidas? | Percorrer uma árvore e avaliar sua complexidade |
| 31–42 | Como construir uma previsão por melhorias sucessivas? | Reconstruir duas atualizações do boosting |
| 43–50 | Qual modelo sustenta uma boa decisão? | Separar ranking, calibração e valor econômico |

## Padrão de cada roteiro

Cada Markdown especifica objetivo observável, conteúdo de tela, composição, dados, interação, sequência de aula, notas, ponte narrativa e aceite. O conteúdo pode ser lapidado ao implementar, mas nenhum objetivo central pode desaparecer. Mantenha uma frase de conclusão por slide, evitando repetir resumos extensos.

Não exiba todos os detalhes do roteiro na tela. A densidade do Markdown serve à implementação e ao professor. A tela projeta a ideia principal, o visual e os controles necessários. Demonstrações extensas, fórmulas auxiliares e respostas ficam em camadas acessíveis.

## Três níveis de leitura

1. **Projeção:** título, visual dominante, poucos valores e conclusão. Funciona em sala.
2. **Exploração:** controles e revelações que respondem a uma pergunta específica.
3. **Professor/estudo:** notas, desenvolvimento dos cálculos, limites, referências e respostas.

O conteúdo essencial não pode depender de hover. O estado inicial deve ser compreensível e correto. O estado final de impressão contém a conclusão e a evidência correspondente.

## Ritmo e participação

Em conceitos, dedique cerca de 2–4 minutos. Em demonstrações e exercícios, 4–7 minutos. Slides 20, 30, 42 e 49 são momentos de participação. As respostas locais não são uma pesquisa de sala em tempo real. Se não houver infraestrutura de coleta, o professor solicita mãos levantadas e usa o controle apenas para revelar a discussão.

Não use cronometragem automática que force transições. O professor controla o avanço. Uma pausa após o slide 30 é adequada. Na volta, retome a árvore e pergunte o que falta para melhorar a previsão.

## Linguagem

Use “inadimplência”, “probabilidade estimada”, “amostra”, “fora do tempo”, “concessão”, “corte” e “resultado econômico”. Introduza “log-odds”, “log-loss”, “learning rate” e “early stopping” com tradução verbal na primeira ocorrência. Escreva “gradient boosting” como nome da técnica, com “refinamento sequencial por gradiente” como explicação, sem criar uma tradução artificial recorrente.

Nunca afirme que um cliente individual tem destino conhecido a partir de sua PD. Evite frases causais sobre coeficientes e explicações de modelo. Não apresente um aumento de complexidade como avanço inevitável de qualidade.

## Integração dos exemplos

Os quatro clientes mantêm identidade e características. Um cenário alterado deve receber o rótulo “simulação” e permitir restaurar o perfil original. As PDs do exemplo manual de logit são diferentes das previsões do modelo treinado: o rótulo da origem precisa tornar isso inequívoco.

Os exemplos de 1.000 contratos da árvore e de 10 registros do boosting são miniaturas independentes para revelar mecanismos. Não os misture com a base empírica de comparação. Mostre uma breve identificação de fonte em cada slide.
