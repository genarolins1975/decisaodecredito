# Slide 38 — A profundidade define a complexidade de cada correção

**Bloco:** boosting. **Tempo:** 4 min. **Origem:** experimento auxiliar bidimensional e configurações calculadas.

## Objetivo e mensagem
Distinguir número de árvores de capacidade de interação de cada árvore. Mensagem: “Muitas regras simples somadas não são sempre equivalentes a regras que combinam condições.”

## Tela e composição
Título: **“Uma correção pode depender de uma característica ou da combinação de várias”**. Dois painéis com a mesma superfície sintética de risco: soma de stumps e boosting com profundidade 2 ou 3. Um terceiro elemento pequeno mostra uma regra que exige duas condições. Use escala de cor única com valores rotulados, não mapas 3D que dificultem comparar.

## Dados e rigor
Criar um exemplo auxiliar onde risco aumenta principalmente quando comprometimento e utilização são altos juntos, com ruído. Treinar modelos correspondentes com protocolo documentado. Explicar que a soma de stumps é aditiva no escore F; a transformação logística pode induzir não aditividade na escala p. Portanto, não dizer simplesmente que “stumps não produzem interação na PD”.

## Interação
Seleção de profundidade [1,2,3] atualiza superfície e perda de validação, mantendo taxa e orçamento de árvores explicitados. Cursor/foco em ponto mostra coordenadas e PD prevista nos painéis. Um marcador de cliente sintético se move por controle de duas variáveis ou presets “baixo/alto” para cada uma, com alternativa ao arraste.

## Sequência
Mostre a combinação alto/alto e pergunte que regra a descreve. Compare a representação por uma única condição e por duas condições. Revele que árvores mais profundas capturam estruturas mais complexas, mas cada passo também pode ajustar mais ruído.

## Notas
Não transformar profundidade máxima em contagem universal exata da ordem de interações sem definir a convenção. Profundidade 2 permite caminhos com duas condições; implementações e repetição de variável importam. Não usar experimento auxiliar para afirmar desempenho da base de crédito principal.

## Ponte
“Temos vários controles de complexidade. O acompanhamento da validação ajuda a decidir quando interromper a construção.”

## Aceite específico
Mesma escala e domínio nos painéis. Distinção entre aditividade em F e em p explícita nas notas. Configurações treinadas e perdas rastreáveis. Nenhuma superfície desenhada manualmente como resultado empírico.

## Contrato comum de implementação

Leia também os guias de [narrativa](../00_guias/01_narrativa_e_contrato.md), [design e interação](../00_guias/02_design_e_interacao.md), [dados e cálculos](../00_guias/03_dados_e_calculos.md) e [aceite](../00_guias/05_qualidade_e_aceite.md). O estado inicial precisa ensinar sem clique; a exploração amplia a explicação. Inclua reinício local, teclado, toque, descrição acessível, notas do professor e estado estático de impressão. Mantenha o padrão de fonte dos dados indicado neste roteiro.

Implemente este slide, execute os critérios específicos acima, registre evidências em `02_controle/STATUS_SLIDES.md` e só então avance. Uma especificação escrita não é implementação concluída.
