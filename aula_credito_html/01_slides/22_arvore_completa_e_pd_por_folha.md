# Slide 22 — A PD vem dos contratos que chegaram à folha

**Bloco:** árvore. **Tempo:** 4 min. **Origem:** árvore manual de 1.000 contratos.

## Objetivo e mensagem
Associar a estimativa da folha a numerador, denominador e população. Mensagem: “A previsão é a frequência observada no grupo, sujeita à incerteza e à generalização.”

## Tela e composição
Título: **“Nesta folha, 18 de 600 contratos ficaram inadimplentes”**. Reutilizar a árvore do slide 21 com números visíveis: raiz 1.000/100; hist=0 800/40; hist=1 200/60; folhas 600/18, 200/22, 80/12 e 120/48. Em cada folha, priorizar `n`, eventos e PD, nesta ordem de construção. Destacar Ana e a conta 18/600=3%.

## Dados
Todas as contagens devem vir de um único objeto de árvore, com somas automáticas. Predições ilustrativas: Ana 3%, Bruno 15%, Carla 11%, Diego 40%. Rotular “árvore didática” para não apresentar essas PDs como experimento estimado. Não acrescentar a PD manual do logit lado a lado como se uma fosse mais correta.

## Interação
Selecionar cliente destaca o percurso e amplia a folha com uma barra de eventos/não eventos. “Mostrar denominadores” alterna entre leitura simples e números completos, preservando a taxa. Selecionar uma folha mostra a regra completa, por exemplo “hist=0 e comp≤40”. Não permitir editar contagens sem atualizar toda a árvore; preferir leitura neste slide.

## Condução
Construa a conta de Ana e peça a de Bruno. Pergunte se clientes da mesma folha terão a mesma previsão mesmo com rendas diferentes: sim, nesta árvore, porque a renda não está nos splits. Use a resposta para preparar a natureza segmentada da função de previsão.

## Notas
A taxa aparente da folha não comprova calibração futura. Se o ajuste for ponderado, a fórmula deve refletir pesos; este exemplo é não ponderado. A árvore de classificação costuma produzir a proporção por classe nas folhas, sujeita à implementação e eventual suavização explícita.

## Ponte
“Por que a primeira pergunta foi sobre histórico, e não sobre renda ou comprometimento?”

## Aceite específico
Folhas somam 1.000 contratos e 100 eventos. Taxas e percursos exatos. A regra completa deve acompanhar cada folha selecionada. Sem rótulo “risco verdadeiro” ou “certeza de inadimplência”.

## Contrato comum de implementação

Leia também os guias de [narrativa](../00_guias/01_narrativa_e_contrato.md), [design e interação](../00_guias/02_design_e_interacao.md), [dados e cálculos](../00_guias/03_dados_e_calculos.md) e [aceite](../00_guias/05_qualidade_e_aceite.md). O estado inicial precisa ensinar sem clique; a exploração amplia a explicação. Inclua reinício local, teclado, toque, descrição acessível, notas do professor e estado estático de impressão. Mantenha o padrão de fonte dos dados indicado neste roteiro.

Implemente este slide, execute os critérios específicos acima, registre evidências em `02_controle/STATUS_SLIDES.md` e só então avance. Uma especificação escrita não é implementação concluída.
