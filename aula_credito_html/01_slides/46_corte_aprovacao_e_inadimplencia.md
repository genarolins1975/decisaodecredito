# Slide 46 — O corte muda quem entra na carteira

**Bloco:** decisão. **Tempo:** 5 min. **Origem:** partição de política; teste em modo final separado.

## Objetivo e mensagem
Relacionar corte, volume e composição da carteira. Mensagem: “A mesma previsão pode sustentar políticas diferentes; a política é uma decisão adicional ao modelo.”

## Tela e composição
Título: **“Até qual PD vamos aprovar?”**. Histograma das PDs com linha vertical de corte e região aprovada p≤c. Abaixo, dois gráficos alinhados ao corte: taxa de aprovação e inadimplência observada entre aprovados. Mostrar também contagem aprovada e eventos, como rótulos do gráfico, sem grande painel de KPIs.

## Cálculos
Aprovação=`n(p≤c)/N`; inadimplência aprovada=`sum(y entre aprovados)/n_aprovados`. Explicar diferença entre média das PDs aprovadas e taxa observada. Se nenhum aprovado, inadimplência “não definida”. Empates na PD devem ter regra explícita, especialmente na árvore: aprovar todos no limite ou política de desempate pré-definida, sem escolher por y.

## Interação
Slider c de 1–50%, passo 0,5 p.p., padrão conforme política pré-especificada. Seletor de modelo e botão “Mesmo volume de aprovação”, este calculado na amostra de política. O modo final aplica cortes congelados ao teste e desabilita otimização. Uma exploração livre no teste, se oferecida, recebe rótulo “análise retrospectiva; não seleciona política”.

## Roteiro
Reduza corte, observe volume e composição. Pergunte se menor inadimplência implica melhor resultado: não, pode haver perda de receita. Compare dois modelos no mesmo corte e depois no mesmo volume para explicar que são perguntas diferentes. Não afirmar que a inadimplência observada varia monotonamente em toda amostra finita.

## Notas
A avaliação usa contratos com desfecho conhecido da população sintética, permitindo simular recusa. Em dados reais de apenas concedidos, inferir desempenho dos rejeitados exige hipóteses adicionais. Limite de crédito, preço e prazo permanecem fixos aqui para isolar a decisão de aprovação.

## Ponte
“Para escolher um corte, precisamos colocar receitas e perdas na mesma conta.”

## Aceite específico
Limites zero/todos aprovados tratados. Soma e denominadores corretos. Empates sem uso de y. Curvas e histograma sincronizados. Nenhum corte ótimo é escolhido depois de olhar o teste sem sinalização.

## Contrato comum de implementação

Leia também os guias de [narrativa](../00_guias/01_narrativa_e_contrato.md), [design e interação](../00_guias/02_design_e_interacao.md), [dados e cálculos](../00_guias/03_dados_e_calculos.md) e [aceite](../00_guias/05_qualidade_e_aceite.md). O estado inicial precisa ensinar sem clique; a exploração amplia a explicação. Inclua reinício local, teclado, toque, descrição acessível, notas do professor e estado estático de impressão. Mantenha o padrão de fonte dos dados indicado neste roteiro.

Implemente este slide, execute os critérios específicos acima, registre evidências em `02_controle/STATUS_SLIDES.md` e só então avance. Uma especificação escrita não é implementação concluída.
