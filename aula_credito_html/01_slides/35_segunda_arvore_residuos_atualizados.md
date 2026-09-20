# Slide 35 — A segunda árvore responde a um erro que já mudou

**Bloco:** boosting. **Tempo:** 5 min. **Origem:** miniatura de primeira ordem.

## Objetivo e mensagem
Explicar a dependência sequencial entre árvores. Mensagem: “A próxima correção é recalculada depois da anterior; ela não repete mecanicamente o mesmo passo.”

## Tela e composição
Título: **“A primeira árvore mudou as previsões. Agora mudam os gradientes”**. Reutilizar tabela do slide 34, com colunas p0/p1 e r0/r1, reveladas em pares para não estreitar o texto. A segunda árvore aparece no centro com o mesmo split neste exemplo, mas novas médias. À direita, duas trajetórias discretas de PD por iteração, 0–2.

## Cálculos
A: r1=−0,1699058933. B: três resíduos −0,2339223413 e dois +0,7660776587; média +0,1660776587. Com η=1, F2_A=−1,7562002544 e p2_A≈14,7267%; F2_B=−1,0202167024 e p2_B≈26,4985%. Mostrar que o split permanece por construção desta miniatura, não por regra geral de boosting.

## Interação
Alternar “Antes da primeira correção” e “Depois da primeira correção” destaca mudanças em p e r. “Ajustar segunda árvore” calcula as médias novas. “Atualizar” move as trajetórias para a iteração 2. Se houver modo explorar, limitação de duas iterações no principal evita que a exposição vire uma demonstração longa.

## Condução
Antes de revelar a média de B, pergunte se continuará +0,2. Faça a turma perceber que o resíduo de um y=1 diminuiu e o de um y=0 ficou mais negativo. Mostre que a correção média positiva persiste, mas mudou de tamanho. Destaque que o objetivo é reduzir a perda agregada.

## Notas
A nova árvore poderia usar outro split em dados mais ricos. Não afirme que todas as correções sempre diminuem, nem que as previsões de cada indivíduo caminham monotonamente. Isso acontece aqui pela simplicidade dos grupos e não é propriedade universal.

## Ponte
“Somamos duas contribuições. Vamos olhar essa soma como uma função que também pode prever um cliente novo.”

## Aceite específico
Resíduos da segunda rodada calculados com p1, nunca p0. Manter precisão até o final. Trajetórias mostram pontos calculados, sem interpolação interpretada como novas iterações. O mesmo split recebe uma explicação explícita de exemplo restrito.

## Contrato comum de implementação

Leia também os guias de [narrativa](../00_guias/01_narrativa_e_contrato.md), [design e interação](../00_guias/02_design_e_interacao.md), [dados e cálculos](../00_guias/03_dados_e_calculos.md) e [aceite](../00_guias/05_qualidade_e_aceite.md). O estado inicial precisa ensinar sem clique; a exploração amplia a explicação. Inclua reinício local, teclado, toque, descrição acessível, notas do professor e estado estático de impressão. Mantenha o padrão de fonte dos dados indicado neste roteiro.

Implemente este slide, execute os critérios específicos acima, registre evidências em `02_controle/STATUS_SLIDES.md` e só então avance. Uma especificação escrita não é implementação concluída.
