# Slide 33 — O ponto de partida é uma previsão comum

**Bloco:** boosting. **Tempo:** 4 min. **Origem:** miniatura de 10 registros.

## Objetivo e mensagem
Entender o melhor preditor constante da log-loss no treino. Mensagem: “Antes de usar características, a taxa observada fornece o ponto de partida do exemplo.”

## Tela e composição
Título: **“Dois eventos em dez contratos: começamos em 20%”**. Dez linhas ou fichas compactas, separadas em grupos A/B com cinco registros cada. Exibir y, previsão inicial p=20% e espaço ainda vazio para o resíduo. Abaixo, transformação `F0=ln(0,2/0,8)=−1,3863`. Os eventos são atributos de treinamento conhecidos, não informação de um novo cliente.

## Dados
Grupo A: y=[0,0,0,0,0], todos com comp=30. Grupo B: y=[0,0,0,1,1], todos com comp=50. Apenas comp entra no stump desta miniatura, de modo que o único corte entre valores observados é 40. Total 2/10. Identificar “miniatura didática; distinta da base de comparação”. Não usar nomes Ana/Bruno aqui para evitar confundir desfechos fictícios com clientes de concessão.

## Interação
Slider da previsão constante p0 de 1–60%, passo 1%, padrão 20%. Curva de log-loss média aparece em painel secundário e atualiza o ponto selecionado. “Usar melhor constante” retorna 20%, marca o mínimo calculado e fixa F0 para os próximos passos. A curva pode ser calculada diretamente com os dez rótulos, sem treinamento de biblioteca.

## Roteiro
Pergunte qual PD seria razoável antes de olhar características. Compare 10%, 20% e 40% na perda. Revele que a média empírica minimiza a perda do modelo constante não ponderado. Conecte F0 à conversão do slide 10. Só então mostre os grupos A/B, anunciando que eles permitirão melhorar a previsão uniforme.

## Notas
O ponto inicial depende de perda, pesos e implementação. Este exemplo é não ponderado e binário. A taxa de 20% não descreve o mercado de crédito nem a base principal. Não apresentar a mesma escolha como universal para qualquer boosting.

## Ponte
“Agora compare o que aconteceu com o que previmos: essa diferença indica a direção da primeira correção.”

## Aceite específico
Média y=0,2 e mínimo da perda coerentes. F0 calculado com log natural. Slider não modifica y nem o número de registros. Se explorar p0 diferente, reiniciar em 20% ao avançar para a miniatura canônica seguinte, com indicação explícita.

## Contrato comum de implementação

Leia também os guias de [narrativa](../00_guias/01_narrativa_e_contrato.md), [design e interação](../00_guias/02_design_e_interacao.md), [dados e cálculos](../00_guias/03_dados_e_calculos.md) e [aceite](../00_guias/05_qualidade_e_aceite.md). O estado inicial precisa ensinar sem clique; a exploração amplia a explicação. Inclua reinício local, teclado, toque, descrição acessível, notas do professor e estado estático de impressão. Mantenha o padrão de fonte dos dados indicado neste roteiro.

Implemente este slide, execute os critérios específicos acima, registre evidências em `02_controle/STATUS_SLIDES.md` e só então avance. Uma especificação escrita não é implementação concluída.
