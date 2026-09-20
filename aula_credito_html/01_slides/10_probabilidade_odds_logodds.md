# Slide 10 — Probabilidade, odds e log-odds são escalas diferentes

**Bloco:** logit. **Tempo:** 4 min. **Reaproveitamento:** buscar analogias originais corretas e manter notação consistente.

## Objetivo e mensagem
Converter as três escalas e entender por que o modelo soma na última. Mensagem: “Odds comparam eventos e não eventos; probabilidade compara eventos e total.”

## Tela e composição
Título: **“10% de PD significa odds de 1 para 9”**. À esquerda, grade de 100 pontos, com 10 marcados como eventos no exemplo inicial. No centro, frações visuais: `10/100 = 10%` e `10/90 = 1/9`. À direita, `ln(1/9) ≈ −2,197`. Use caixas simples ligadas por rótulos de conversão, sem setas decorativas atravessando toda a página.

## Cálculos
Para p, odds=`p/(1-p)` e log-odds=`ln(p/(1-p))`. Conversões inversas explícitas no aprofundamento. Mostrar p=50% com odds=1 e log-odds=0; p=20% com odds=0,25 e log-odds≈−1,386. A grade representa frequência esperada ilustrativa, não 100 contratos reais com resultado garantido.

## Interação
Slider de PD de 1% a 99%, passo 1%, padrão 10%. Atualizar quantidade ilustrativa da grade, denominadores, odds e log-odds. Três botões de referência: 10%, 20%, 50%. Clique na fração destaca o denominador usado. Não permitir 0/100% na entrada principal; explicar que os limites levam log-odds a infinito.

## Condução
Pergunte “10 dividido por quê?” antes de revelar odds. Mostre que trocar denominador muda o conceito. Vá a 50% e depois 20%. Termine lembrando que o z do logit é justamente o log-odds, ligando a escala ao waterfall anterior.

## Notas e ponte
Evite dizer que odds são “outra porcentagem de risco”. Elas podem ultrapassar 1 e não se limitam a 100%. Diferencie uma razão escrita 1:9 do número decimal 0,1111. Ponte: “Agora conseguimos interpretar o que acontece quando um coeficiente aumenta o log-odds.”

## Aceite específico
Todas as conversões devem fechar em ida e volta. Grade preserva 100 pontos. Valores extremos não geram NaN. O slide deixa claro qual denominador pertence a cada escala e não usa p e odds como sinônimos.

## Contrato comum de implementação

Leia também os guias de [narrativa](../00_guias/01_narrativa_e_contrato.md), [design e interação](../00_guias/02_design_e_interacao.md), [dados e cálculos](../00_guias/03_dados_e_calculos.md) e [aceite](../00_guias/05_qualidade_e_aceite.md). O estado inicial precisa ensinar sem clique; a exploração amplia a explicação. Inclua reinício local, teclado, toque, descrição acessível, notas do professor e estado estático de impressão. Mantenha o padrão de fonte dos dados indicado neste roteiro.

Implemente este slide, execute os critérios específicos acima, registre evidências em `02_controle/STATUS_SLIDES.md` e só então avance. Uma especificação escrita não é implementação concluída.
