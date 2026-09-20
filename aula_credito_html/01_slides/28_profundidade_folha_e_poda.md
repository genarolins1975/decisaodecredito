# Slide 28 — Há diferentes maneiras de limitar a árvore

**Bloco:** árvore. **Tempo:** 4 min. **Origem:** cenários pré-calculados do experimento.

## Objetivo e mensagem
Diferenciar profundidade máxima, tamanho mínimo da folha e poda. Mensagem: “Controlar complexidade é escolher quais detalhes dos dados vale a pena manter.”

## Tela e composição
Título: **“Três controles, três formas de conter o excesso de divisões”**. Uma árvore central, legível, e três abas com explicação curta. Profundidade realça níveis; mínimo de folha realça grupos pequenos; poda mostra uma subárvore colapsada. Não exibir dezenas de nós ilegíveis: resumir ramos extensos e permitir ampliar um ramo por vez.

## Dados e parâmetros
Preparar cenários reais para cada controle, mantendo os outros explicitados. Profundidade [2,3,4,6]; mínimo de folha [20,50,100,300]; alpha de poda em poucos valores obtidos do caminho de complexidade do treino. O valor de alpha não tem unidade universal de “nós removidos”. Não definir limite de folha como mínimo de inadimplentes; é mínimo de observações, salvo parâmetro distinto declarado.

## Interação
Selecionar aba mostra um único controle ativo e o parâmetro correspondente. Alternar entre antes/depois da configuração realça o que mudou. Exibir tamanho da árvore e perda de validação do cenário. Um botão “Como foi escolhido?” revela a regra de seleção em validação. Os modelos podem ser pré-calculados, devidamente identificados.

## Condução
Mostre primeiro profundidade, depois uma folha pequena que ainda existe mesmo numa árvore rasa. Use-a para motivar `min_samples_leaf`. Por fim, explique que poda considera retirar partes de uma árvore já crescida, conforme o procedimento utilizado. Não detalhar algoritmo de otimização além do necessário.

## Notas
Restrições mudam splits e estrutura; não são apenas esconder nós após o treino, exceto quando explicando visualmente a poda com correspondência ao modelo calculado. Não prometa que aumentar n mínimo sempre melhora calibração. O critério final continua fora da amostra.

## Ponte
“Mesmo árvores de tamanho parecido podem mudar bastante quando mudamos a amostra usada para aprender.”

## Aceite específico
Cada alteração precisa corresponder a árvore treinada, não mera ocultação visual. Distinção entre profundidade, n por folha e alpha correta. Métrica e configuração compatíveis. Só um controle principal ativo por vez.

## Contrato comum de implementação

Leia também os guias de [narrativa](../00_guias/01_narrativa_e_contrato.md), [design e interação](../00_guias/02_design_e_interacao.md), [dados e cálculos](../00_guias/03_dados_e_calculos.md) e [aceite](../00_guias/05_qualidade_e_aceite.md). O estado inicial precisa ensinar sem clique; a exploração amplia a explicação. Inclua reinício local, teclado, toque, descrição acessível, notas do professor e estado estático de impressão. Mantenha o padrão de fonte dos dados indicado neste roteiro.

Implemente este slide, execute os critérios específicos acima, registre evidências em `02_controle/STATUS_SLIDES.md` e só então avance. Uma especificação escrita não é implementação concluída.
