# Slide 24 — O ganho mede a redução da mistura de classes

**Bloco:** árvore. **Tempo:** 5 min. **Origem:** árvore manual, cálculo próprio.

## Objetivo e mensagem
Calcular Gini do pai, média ponderada dos filhos e ganho. Mensagem: “Não basta uma folha pura; importa como toda a amostra fica depois da divisão.”

## Tela e composição
Título: **“Histórico reduz o Gini de 0,180 para 0,160”**. Usar três etapas horizontais compactas ou empilhadas: impureza da raiz, impureza dos filhos com pesos, redução final. Ao lado, uma curva pequena `Gini=2p(1-p)` destaca 10%, 5% e 30%. Mostrar números antes da fórmula geral para favorecer leitura.

## Cálculos obrigatórios
Raiz p=0,10, G=0,18. Filhos por histórico: G(0,05)=0,095; G(0,30)=0,42. Média 0,8×0,095+0,2×0,42=0,160. Ganho 0,020. Para comprometimento, p_esq=30/680 e p_dir=70/320; calcular média e ganho sem arredondar taxas previamente. O candidato histórico deve ter maior ganho neste conjunto.

## Interação
Botões “Raiz”, “Filhos”, “Ponderação”, “Comparar” revelam uma etapa por vez, mantendo as anteriores em baixa ênfase. Trocar candidato recalcula as mesmas etapas, em posições estáveis. Foco sobre peso mostra n_filho/n_pai. Botão de aprofundamento explora p de 0 a 1 na curva de Gini, sem alterar as contagens do exemplo principal.

## Condução
Peça a conta do Gini da raiz. Antes de ponderar, pergunte por que não usar a média simples. Mostre a diferença de 800 versus 200 registros. Termine explicitando que o algoritmo compara vários splits, repete o procedimento em cada nó e precisa de uma regra para parar.

## Notas
Gini é um critério de impureza no treino, não AUC, KS ou lucro. Outras perdas podem orientar árvores; não misturar entropia/log-loss com Gini no mesmo cálculo. Não interpretar ganho de impureza como efeito causal do histórico.

## Ponte
“Ao dividir mais, as folhas parecem mais precisas. Mas quanto podemos confiar em uma taxa calculada com poucas observações?”

## Aceite específico
Números de referência exatos e ponderação correta. Mostrar resultado do candidato alternativo realmente calculado. Estado puro p=0/1 dá Gini zero; p=0,5 dá 0,5. Nunca rotular a redução como ganho de AUC.

## Contrato comum de implementação

Leia também os guias de [narrativa](../00_guias/01_narrativa_e_contrato.md), [design e interação](../00_guias/02_design_e_interacao.md), [dados e cálculos](../00_guias/03_dados_e_calculos.md) e [aceite](../00_guias/05_qualidade_e_aceite.md). O estado inicial precisa ensinar sem clique; a exploração amplia a explicação. Inclua reinício local, teclado, toque, descrição acessível, notas do professor e estado estático de impressão. Mantenha o padrão de fonte dos dados indicado neste roteiro.

Implemente este slide, execute os critérios específicos acima, registre evidências em `02_controle/STATUS_SLIDES.md` e só então avance. Uma especificação escrita não é implementação concluída.
