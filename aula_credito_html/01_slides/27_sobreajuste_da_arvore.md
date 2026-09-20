# Slide 27 — Mais divisões podem melhorar o treino e piorar o futuro

**Bloco:** árvore. **Tempo:** 4 min. **Origem:** experimento sintético a executar.

## Objetivo e mensagem
Distinguir capacidade de ajuste e generalização. Mensagem: “Uma árvore que memoriza o treino pode produzir probabilidades frágeis fora dele.”

## Tela e composição
Título: **“A árvore cresce. O resultado fora do treino acompanha?”**. À esquerda, comparação de partições de uma projeção bidimensional para profundidades 2, 4 e 8. À direita, curvas de perda de treino e validação com marcadores nos modelos efetivamente ajustados. O modelo maior não deve ser desenhado automaticamente como pior se os dados não mostrarem isso.

## Dados
Treinar árvores com a mesma base de informação e vários limites de profundidade. Se a figura usa apenas duas variáveis, explicitar que é um experimento auxiliar bidimensional; não atribuir a ele a métrica do modelo completo. Para log-loss de árvores com probabilidades 0/1, registrar o clipping numérico e sua razão. Como alternativa visual estável, Brier pode ser a perda principal, com definição nas notas.

## Interação
Slider discreto de profundidade [1,2,3,4,6,8,12,sem limite], restrito aos ajustes executados. Atualizar árvore resumida, número de folhas, mediana de n por folha e perdas. Escolher no máximo dois desses indicadores em tela para evitar painel excessivo; os demais ficam no detalhe. Seleção baseada na validação, não no teste final.

## Sequência
Comece raso, aumente complexidade e peça que compare treino e validação. Se a perda de validação se estabilizar em vez de piorar, discuta a ausência de ganho e a preferência por parcimônia, sem fabricar uma curva em U. Mostre folhas pequenas como pista de fragilidade, não como prova isolada.

## Notas
Desempenho de uma única amostra varia; diferenças pequenas podem não ser robustas. Não generalizar que toda árvore profunda é ruim. A profundidade interage com tamanho de folha e poda. “Futuro” neste gráfico significa validação fora do tempo especificada.

## Ponte
“Podemos controlar o crescimento de mais de uma maneira. Cada parâmetro restringe uma parte diferente da árvore.”

## Aceite específico
Modelos, métricas e partições correspondentes ao mesmo cenário. Não usar desenho bidimensional como projeção exata do modelo completo sem explicação. Valores não calculados permanecem indisponíveis. O teste final não aparece como botão de otimização.

## Contrato comum de implementação

Leia também os guias de [narrativa](../00_guias/01_narrativa_e_contrato.md), [design e interação](../00_guias/02_design_e_interacao.md), [dados e cálculos](../00_guias/03_dados_e_calculos.md) e [aceite](../00_guias/05_qualidade_e_aceite.md). O estado inicial precisa ensinar sem clique; a exploração amplia a explicação. Inclua reinício local, teclado, toque, descrição acessível, notas do professor e estado estático de impressão. Mantenha o padrão de fonte dos dados indicado neste roteiro.

Implemente este slide, execute os critérios específicos acima, registre evidências em `02_controle/STATUS_SLIDES.md` e só então avance. Uma especificação escrita não é implementação concluída.
