# Slide 17 — Uma característica pode mudar o efeito de outra

**Bloco:** logit. **Tempo:** 4 min. **Reaproveitamento:** conservar exemplos originais de interação que se liguem ao caso de crédito.

## Objetivo e mensagem
Identificar interação na escala apropriada. Mensagem: “Com interação, o efeito do comprometimento no escore depende do histórico.”

## Tela e composição
Título: **“O comprometimento pesa igual para quem tem histórico de atraso?”**. Dois gráficos pequenos: z por comprometimento à esquerda, PD à direita. Linhas hist=0 e hist=1 com rótulos diretos. Destacar a inclinação em z, onde o termo de interação é mais fácil de identificar. A diferença entre curvas de PD sozinha não prova interação no escore.

## Fórmula ilustrativa
Usar `z=−3,5+0,04(comp−30)+0,80hist+δ(comp−30)hist`, demais características na referência. δ=0 no início; δ=0,03 no cenário com interação. Para hist=0, inclinação 0,04; para hist=1, 0,04+δ. Este cenário não modifica o modelo manual central.

## Interação
Toggle δ=0/0,03, slider comp 10–70%, padrão 40. Mover o slider mostra valores em ambas as curvas. Selecionar “ver termo” destaca `(comp−30)×hist` e calcula seu valor no ponto. A legenda informa que mesmo com δ=0 a diferença entre PDs pode variar porque a sigmoide é não linear.

## Roteiro
Comece por z com linhas paralelas. Pergunte o que muda quando δ é ativado. Só então observe PD. Convide o aluno a explicar a diferença entre “efeito do histórico no escore” e “diferença de probabilidade”. A resposta esperada descreve dependência do comprometimento.

## Notas
Coeficientes principais são condicionais ao valor de referência das outras variáveis. Não interpretar β_hist isoladamente como efeito constante em qualquer comprometimento quando há interação. Essa é uma associação do modelo e pode não representar uma intervenção viável ou causal.

## Transição
“Cada transformação ou interação acrescenta flexibilidade. Como evitar que isso capture particularidades da amostra?”

## Aceite específico
Em δ=0, linhas de z paralelas; em δ=0,03, inclinações corretas. Hist=0 elimina o termo cruzado. Tooltip, equação e curvas concordam. Nenhum texto afirma que ausência de termo cruzado implica diferença constante de PD.

## Contrato comum de implementação

Leia também os guias de [narrativa](../00_guias/01_narrativa_e_contrato.md), [design e interação](../00_guias/02_design_e_interacao.md), [dados e cálculos](../00_guias/03_dados_e_calculos.md) e [aceite](../00_guias/05_qualidade_e_aceite.md). O estado inicial precisa ensinar sem clique; a exploração amplia a explicação. Inclua reinício local, teclado, toque, descrição acessível, notas do professor e estado estático de impressão. Mantenha o padrão de fonte dos dados indicado neste roteiro.

Implemente este slide, execute os critérios específicos acima, registre evidências em `02_controle/STATUS_SLIDES.md` e só então avance. Uma especificação escrita não é implementação concluída.
