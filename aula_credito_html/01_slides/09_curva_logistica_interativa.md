# Slide 09 — A curva logística transforma escore em PD

**Bloco:** logit. **Tempo:** 4 min. **Reaproveitamento:** preservar boa figura da sigmoide, tornando-a explorável.

## Objetivo e mensagem
Relacionar z, posição na curva e probabilidade. Mensagem: “A mesma variação de escore pode gerar mudanças diferentes de probabilidade.”

## Tela e composição
Título: **“Um escore, uma probabilidade entre 0% e 100%”**. Curva logística ocupa 70% da tela, eixo x de −8 a +4 e y de 0 a 100%. Um ponto móvel tem guias até os eixos. Ao lado, equação grande `p=1/(1+e^(−z))`, valor de z e PD. Marcar z=0/p=50% como referência matemática, sem sugerir corte de aprovação.

## Dados e estado
Padrão Bruno, z=−2,025 e p≈11,66%. Mostrar um pequeno marcador para cada outro cliente sem poluir a curva. A curva é calculada em resolução suficiente; todos os valores vêm da função comum. As áreas baixas de PD precisam ser distinguíveis: oferecer zoom opcional de 0–30%, com indicação explícita do eixo alterado.

## Interação
Slider z de −8 a +4, passo 0,025, entrada numérica equivalente e botões dos quatro clientes. Ao mover, atualizar ponto, guias, PD e a interpretação “aproximadamente X eventos em 100 exposições semelhantes”, com cuidado para não prometer contagem determinística. Mostrar “simulação de escore” ao afastar-se do perfil canônico.

## Roteiro
Comece em Bruno. Vá a z=0 e pergunte o valor esperado. Compare movimentos de +1 em z=−5 e em z=0. Termine em Ana e Bruno para mostrar que a função preserva a ordem dos escores. Evite chamar o ponto 50% de “limite natural de risco”.

## Notas
A sigmoide é estritamente crescente; ranking de z e p é igual. Um z finito não gera exatamente 0 ou 1. Formatação pode arredondar para 0,00%, mas tooltip deve informar valor mais preciso e evitar declaração de impossibilidade de inadimplência.

## Transição
“Para interpretar os coeficientes, precisamos entender a escala em que a soma foi feita: o logaritmo das odds.”

## Aceite específico
Testar z=0, −2,025 e extremos. Sem saturação incorreta ou rótulo fora do gráfico. Zoom preserva unidade. Alterar slider não modifica perfis em outros slides. A impressão mostra a curva e Bruno identificado.

## Contrato comum de implementação

Leia também os guias de [narrativa](../00_guias/01_narrativa_e_contrato.md), [design e interação](../00_guias/02_design_e_interacao.md), [dados e cálculos](../00_guias/03_dados_e_calculos.md) e [aceite](../00_guias/05_qualidade_e_aceite.md). O estado inicial precisa ensinar sem clique; a exploração amplia a explicação. Inclua reinício local, teclado, toque, descrição acessível, notas do professor e estado estático de impressão. Mantenha o padrão de fonte dos dados indicado neste roteiro.

Implemente este slide, execute os critérios específicos acima, registre evidências em `02_controle/STATUS_SLIDES.md` e só então avance. Uma especificação escrita não é implementação concluída.
