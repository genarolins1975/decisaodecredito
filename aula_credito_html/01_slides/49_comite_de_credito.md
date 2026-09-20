# Slide 49 — Comitê: qual modelo e qual política você defenderia?

**Bloco:** síntese aplicada. **Tempo:** 8–10 min. **Origem:** resultados efetivamente calculados e políticas pré-especificadas.

## Objetivo e mensagem
Integrar evidências sem escolher apenas pela maior AUC. Mensagem: “Uma recomendação precisa combinar desempenho, economia, estabilidade e capacidade de execução.”

## Tela e composição
Título: **“Defenda sua recomendação para o comitê”**. Tabela compacta de três modelos com AUC, um indicador de qualidade probabilística, aprovação, inadimplência dos aprovados e resultado econômico sob regra definida. Limitar a seis linhas principais; detalhamento fica acessível. Ao lado, requisitos da operação: equipe enxuta, explicação necessária e acompanhamento mensal. Não atribuir custos monetários inventados de implantação.

## Dados
Usar resultados do teste para descrever o desempenho das alternativas congeladas e resultados de seleção separados para explicar como parâmetros/políticas foram escolhidos. Identificar dados sintéticos e período. Mostrar médias previstas e resultados observados em linhas distintas quando relevantes. Não misturar políticas com volumes diferentes sem indicar a diferença. Se valores são próximos, não declarar superioridade conclusiva sem suporte.

## Interação
Selecionar modelo candidato e uma política já definida habilita um formulário de justificativa local: “por que”, “principal risco”, “como monitorar”. Botão “Ver argumentos possíveis” revela trade-offs condicionados aos resultados efetivos. Não predefinir boosting como resposta certa. Um cenário de restrição, como “prioridade em simplicidade de manutenção”, pode alterar a discussão, sem recalcular métricas arbitrariamente.

## Roteiro
Divida a turma em três grupos ou peça decisões individuais. Cada grupo tem dois minutos para recomendar e um minuto para defender. Solicite uma razão que faria mudar de opinião. Use as respostas para reforçar que uma evidência de teste não autoriza ajustar repetidamente o modelo no mesmo teste e chamá-lo de avaliação independente.

## Notas
A recomendação pode manter logit como referência operacional e avaliar outro método como challenger, se isso for sustentado pela evidência. Não obrigar essa conclusão. Resultados sintéticos servem à aprendizagem, não a uma decisão real de concessão. Inclua uma resposta-modelo escrita após executar o experimento, reconhecendo incertezas.

## Ponte
“Independentemente da escolha, quais princípios devem acompanhar qualquer modelagem de crédito?”

## Aceite específico
Tabela integralmente rastreável ao notebook e políticas. Nenhum vencedor predefinido. Formulário local não envia dados. Resposta comentada precisa refletir resultados reais, não um texto genérico incompatível com a tabela. Todos os modelos têm argumentos e limitações honestos.

## Contrato comum de implementação

Leia também os guias de [narrativa](../00_guias/01_narrativa_e_contrato.md), [design e interação](../00_guias/02_design_e_interacao.md), [dados e cálculos](../00_guias/03_dados_e_calculos.md) e [aceite](../00_guias/05_qualidade_e_aceite.md). O estado inicial precisa ensinar sem clique; a exploração amplia a explicação. Inclua reinício local, teclado, toque, descrição acessível, notas do professor e estado estático de impressão. Mantenha o padrão de fonte dos dados indicado neste roteiro.

Implemente este slide, execute os critérios específicos acima, registre evidências em `02_controle/STATUS_SLIDES.md` e só então avance. Uma especificação escrita não é implementação concluída.
