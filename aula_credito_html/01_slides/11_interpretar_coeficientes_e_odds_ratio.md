# Slide 11 — O coeficiente altera as odds, não diretamente a PD

**Bloco:** logit. **Tempo:** 4 min. **Reaproveitamento:** manter exemplos originais de interpretação, corrigindo odds confundidas com risco relativo.

## Objetivo e mensagem
O aluno deve interpretar β e exp(βΔx), incluindo a unidade de x. Mensagem: “Uma mudança na variável multiplica as odds; a mudança de PD depende do ponto de partida.”

## Tela e composição
Título: **“Mais 10 pontos de comprometimento multiplicam as odds por 1,49”**. Mostrar uma faixa de cálculo `Δcomp=10 p.p.; Δz=0,04×10=0,40; OR=e^0,40≈1,49`. Abaixo, três pares de barras antes/depois para PDs iniciais 2%, 10% e 40%. Cada par tem o mesmo multiplicador de odds e mudança de PD própria. Não usar altura de odds no mesmo eixo das probabilidades.

## Dados
Calcular p' pela fórmula de transformação do guia, sem arredondar OR antes de converter. Exibir PD antes, depois e diferença em pontos percentuais. Oferecer também o caso “odds dobram”, com resultados aproximados 3,92%, 18,18% e 57,14%. Rotular que os três riscos iniciais são cenários didáticos, não os quatro clientes.

## Interação
Botões “+1 p.p. de comprometimento”, “+10 p.p.” e “odds ×2”. Cada seleção altera a conta e as três barras. Um campo de Δcomp pode variar de −20 a +20, passo 1, em exploração avançada. O botão de odds ×2 deve mostrar Δz=ln(2), sem inventar que corresponde a β=0,80 do histórico.

## Sequência e notas
Peça que os alunos antecipem a PD quando odds dobram. Revele primeiro o cenário de 10%, depois os demais. Explique “mantidas as outras variáveis do modelo” e ressalve a natureza associativa. Não diga “o risco aumenta 49%” ao falar do OR de 1,49. Para aumento finito, use a conversão exata, não efeito marginal local.

## Ponte
“Vamos aplicar essa interpretação a um cliente completo e conferir todas as etapas da conta.”

## Aceite específico
Três barras devem usar a mesma transformação de odds e produzir variações distintas de PD. Rótulos separam %, p.p. e multiplicador. O caso Δcomp=0 não altera nenhum resultado; Δcomp negativo reduz odds. A explicação de causalidade fica nas notas e em aviso curto acessível.

## Contrato comum de implementação

Leia também os guias de [narrativa](../00_guias/01_narrativa_e_contrato.md), [design e interação](../00_guias/02_design_e_interacao.md), [dados e cálculos](../00_guias/03_dados_e_calculos.md) e [aceite](../00_guias/05_qualidade_e_aceite.md). O estado inicial precisa ensinar sem clique; a exploração amplia a explicação. Inclua reinício local, teclado, toque, descrição acessível, notas do professor e estado estático de impressão. Mantenha o padrão de fonte dos dados indicado neste roteiro.

Implemente este slide, execute os critérios específicos acima, registre evidências em `02_controle/STATUS_SLIDES.md` e só então avance. Uma especificação escrita não é implementação concluída.
