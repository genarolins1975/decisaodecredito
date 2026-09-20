# Slide 47 — A PD é uma entrada da decisão econômica

**Bloco:** decisão. **Tempo:** 5 min. **Origem:** economia didática explícita.

## Objetivo e mensagem
Calcular perda esperada e resultado esperado sob hipóteses claras. Mensagem: “Um bom ranking só gera valor quando probabilidades e política se conectam à economia da operação.”

## Tela e composição
Título: **“Com estas hipóteses, o equilíbrio ocorre em PD de 20%”**. Gráfico central de resultado esperado por PD, com ponto de equilíbrio marcado. À esquerda, três entradas: margem antes da perda R$1.200, EAD R$10.000, LGD 60%. À direita, decomposição do resultado do cenário selecionado: margem menos perda esperada. Explicitar “aproximação didática, horizonte de 12 meses”.

## Fórmulas e hipótese
EL=`p×LGD×EAD`. Resultado esperado=`m−EL`, assumindo m constante e já líquido dos custos definidos, independente do desfecho somente nesta simplificação. Equilíbrio `p*=m/(LGD×EAD)=0,20`. Se p*=1 ou maior, mostrar fora do intervalo de PD relevante; se margens negativas, tratar inviabilidade. Não chamar EL de lucro ou confundir EAD com valor original sem a hipótese de igualdade.

## Interação
PD 0–50%, passo 0,5; m R$500–2.500, passo 100; LGD 20–100%, passo 5; EAD R$5.000–20.000, passo 1.000. Um grupo principal controla PD, os parâmetros econômicos ficam em expansão “mudar hipóteses”. Todas as curvas, EL e corte são recalculados. Padrão p=10% gera EL=R$600 e resultado=R$600.

## Sequência
Construa EL, depois resultado, depois equilíbrio. Pergunte o efeito de aumentar LGD mantendo PD. Mostre que um mesmo cliente pode ser aceitável sob uma estrutura econômica e inviável sob outra, sem defender simplesmente aumento de taxa como solução.

## Notas
Disponibilizar a versão alternativa com margem condicional ao adimplemento: `(1-p)m_good−pL−c`, em aprofundamento separado, com outro corte. Não aplicar fórmula de uma versão ao gráfico da outra. Na avaliação observada, resultados realizados usam y e são diferentes do valor esperado usando p.

## Ponte
“Antes de implantar, ainda precisamos saber se a relação continua válida no tempo e se conseguimos operá-la com controle.”

## Aceite específico
Padrão e equilíbrio conferidos. Unidades R$/operação e horizonte visíveis. Mudança de parâmetro atualiza gráfico e texto. Distinção entre hipótese de margem fixa e versão condicional sem ambiguidade. Nenhuma promessa de rentabilidade real.

## Contrato comum de implementação

Leia também os guias de [narrativa](../00_guias/01_narrativa_e_contrato.md), [design e interação](../00_guias/02_design_e_interacao.md), [dados e cálculos](../00_guias/03_dados_e_calculos.md) e [aceite](../00_guias/05_qualidade_e_aceite.md). O estado inicial precisa ensinar sem clique; a exploração amplia a explicação. Inclua reinício local, teclado, toque, descrição acessível, notas do professor e estado estático de impressão. Mantenha o padrão de fonte dos dados indicado neste roteiro.

Implemente este slide, execute os critérios específicos acima, registre evidências em `02_controle/STATUS_SLIDES.md` e só então avance. Uma especificação escrita não é implementação concluída.
