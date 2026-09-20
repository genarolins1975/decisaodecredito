# Slide 12 — Da ficha do cliente à PD, sem caixa-preta

**Bloco:** logit. **Tempo:** 5 min. **Reaproveitamento:** aproveitar conta completa do original se compatível; caso contrário documentar adaptação ao caso comum.

## Objetivo e mensagem
O aluno deve conseguir reproduzir a PD manual de Bruno. Mensagem: “O cálculo tem duas etapas auditáveis: somar o escore e aplicar a logística.”

## Tela e composição
Título: **“Bruno: como chegamos à PD de 11,66%?”**. Três áreas: ficha editável, decomposição de z e medidor numérico de PD com mini-curva logística. Na ficha, cada variável tem unidade; na decomposição, a parcela ativa é realçada. Não usar velocímetro que associe automaticamente PD a aprovação.

## Estado e cálculo
Bruno é o padrão. Mostrar intercepto −3,50, contribuições +0,32, +0,80, +0,08, +0,25, +0,025 e total −2,025. Converter para 0,1166029692 e exibir 11,66%. A precisão de três casas no total é suficiente, mas a função interna conserva precisão integral.

## Controles
Renda R$1.000–20.000, passo 100; comp 5–80%, passo 1; relacionamento 0–120 meses, passo 1; utilização 0–100%, passo 1; histórico 0/1. Entradas numéricas acompanham sliders. Selecionar cliente repõe todos os campos. “Restaurar Bruno” limpa a simulação local. Canal aparece informativamente, explicitando que não participa desta fórmula manual.

Ao editar, mostrar “simulação: demais atributos fixos” e atualizar ficha, parcelas, z, ponto da sigmoide e PD juntos. Não mostrar consequência econômica ainda. Evitar disparar transições longas a cada movimento do slider.

## Condução
Reconstrua a conta passo a passo. Depois peça uma alteração que reduza a PD e outra que aumente. Questione se a alteração seria factível: reduzir comprometimento sem mudar parcela/renda pode representar uma simulação abstrata. O recurso descreve sensibilidade do modelo, não a garantia de uma ação causal disponível ao cliente.

## Transição
“Esses coeficientes foram escolhidos para tornar a conta transparente. Como um modelo aprende os coeficientes a partir dos dados?”

## Aceite específico
Reproduzir as quatro PDs canônicas. Testar mínimos e máximos sem overflow ou perda de sincronia. Não alterar perfis globais. A PD manual nunca aparece com selo de modelo treinado. Impressão mostra Bruno, equação e resultado completo.

## Contrato comum de implementação

Leia também os guias de [narrativa](../00_guias/01_narrativa_e_contrato.md), [design e interação](../00_guias/02_design_e_interacao.md), [dados e cálculos](../00_guias/03_dados_e_calculos.md) e [aceite](../00_guias/05_qualidade_e_aceite.md). O estado inicial precisa ensinar sem clique; a exploração amplia a explicação. Inclua reinício local, teclado, toque, descrição acessível, notas do professor e estado estático de impressão. Mantenha o padrão de fonte dos dados indicado neste roteiro.

Implemente este slide, execute os critérios específicos acima, registre evidências em `02_controle/STATUS_SLIDES.md` e só então avance. Uma especificação escrita não é implementação concluída.
