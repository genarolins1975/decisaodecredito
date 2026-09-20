# Qualidade e aceite da apresentação

## Portas de aceite

Um slide não está concluído se tem erro técnico, resultado sem origem, interação quebrada, informação essencial ilegível ou objetivo pedagógico não atendido. Uma nota média alta não compensa essas falhas. Se a ferramenta de inspeção não existir, registre a verificação como não realizada.

## Rubrica

| Dimensão | Peso | Evidência para nível 9 |
|---|---:|---|
| Correção técnica e numérica | 30% | Cálculos reproduzíveis, unidades corretas, interpretação sem exagero |
| Clareza didática | 25% | Pergunta clara, intuição, exemplo e conclusão que o aluno consegue explicar |
| Qualidade visual | 20% | Hierarquia, legibilidade em projeção, gráfico adequado e ausência de ruído |
| Interação útil | 15% | Controle responde à pergunta, estados coerentes, reset e alternativa acessível |
| Conexão narrativa | 10% | Retoma o que já foi aprendido e prepara o próximo passo |

Meta: ≥9 por dimensão e no conjunto, entendida como revisão interna. Evite notas 10 automáticas. Registre problema, correção e evidência. Um arquivo de avaliação sem inspeção não equivale a aceite. A avaliação global inclui ritmo, progressão, variedade visual, tratamento de limitações e capacidade de preparar o comitê final.

## Verificações concretas

**Conteúdo:** 50 IDs únicos, todos os objetivos presentes, quatro perfis consistentes, transições escritas, respostas dos exercícios completas, logit reaproveitado ou dependência registrada.

**Números:** soma das folhas igual à raiz; conversões de odds; comparação de unidades; atualização do boosting; domínios de PD; denominadores da aprovação/inadimplência; curvas obtidas de dados; ausência de calibração/seleção no teste.

**Comportamento:** exercitar todo controle principal; confirmar que ele altera o elemento correto; manter consistência entre gráfico e texto; reset; reload por URL; ida e volta; nenhum erro no console; sem requisições externas essenciais ao abrir offline.

**Visual:** examinar os 50 slides em 1366×768, mais estados extremos de interações. Verificar amostra representativa em 1920×1080, 1024×768 e celular; ampliar essa amostra somente se aparecerem problemas comuns. Capturar inicial/final dos exercícios e dos principais gráficos. Não declarar inspeção visual baseada apenas em captura que ninguém examinou.

**Acessibilidade:** navegar pelo teclado, foco visível, labels, toque equivalente, mensagens de resposta legíveis, não depender exclusivamente de cor, movimento reduzido e resumos de gráficos.

**Impressão:** conferir uma página por slide principal, estados finais úteis, fonte dos dados e notas separadas. Código e apêndices não entram na contagem de 50.

## Evidências e revisão final

Guardar screenshots e relatório de cálculos na pasta de saída da implementação. Referenciar o caminho em `STATUS_SLIDES.md`. Uma evidência pode cobrir um componente compartilhado, mas cada slide ainda precisa de conferência de conteúdo e composição.

Ao final, executar a aula em sequência e perguntar: cada técnica resolveu um problema percebido? O aluno distingue previsão e política? A comparação é justa? Os resultados são claramente sintéticos? O logit foi preservado sem comprometer coerência? O notebook sustenta o que aparece na tela?

Registrar limitações reais, por exemplo: material antigo ausente, experimento não executado, inspeção mobile pendente. Não substitua um bloqueio por métricas ilustrativas com aparência de dados reais.
