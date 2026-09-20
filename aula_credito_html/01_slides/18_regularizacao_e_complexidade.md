# Slide 18 — Regularizar ajuda a controlar sensibilidade aos dados

**Bloco:** logit. **Tempo:** 4 min. **Origem:** experimento sintético a executar. **Reaproveitamento:** manter intuição original de penalização.

## Objetivo e mensagem
Entender o compromisso entre ajuste e estabilidade dos coeficientes. Mensagem: “A melhor explicação do treino pode ser sensível demais para funcionar fora dele.”

## Tela e composição
Título: **“Coeficientes extremos podem estar aprendendo ruído”**. À esquerda, trajetórias de cinco coeficientes padronizados em função da força da penalização. À direita, perda de treino e validação usando a mesma grade de ajuste. Mostrar o valor selecionado na validação. Não colocar o teste final no painel.

## Dados e mecanismo
Calcular uma grade discreta de regularização L2 em pipeline ajustado corretamente. Padronizar variáveis numéricas dentro do treino; registrar tratamento das categorias. Se usar `C`, rotular “C menor = penalização maior”, ou converter para eixo de força da penalização. Não alternar entre λ e C sem explicação. Não prometer que cada coeficiente diminui monotonicamente em magnitude com features correlacionadas.

## Interação
Slider discreto percorre apenas valores treinados. Atualizar coeficientes, perdas e uma previsão de cliente. Identificar “resultados pré-calculados” se aplicável. Toggle opcional “L1” fica em aprofundamento com resultado realmente treinado, mostrando que algumas estimativas podem se tornar zero, sem apresentar L1 como seleção causal.

## Sequência
Comece com penalização fraca, observe magnitudes e validação. Aumente e discuta o que melhora ou piora. Se os dados não exibirem uma curva em U pronunciada, não a invente: explique o comportamento observado e use uma simulação separada claramente identificada para ilustrar o conceito, se necessário.

## Notas
Regularização reduz variância em muitas situações, mas não garante estabilidade em qualquer conjunto nem resolve mudança de população. Seleção de λ/C faz parte do treinamento ampliado. Coeficientes padronizados não são os mesmos números da fórmula manual, e a legenda deve evitar essa mistura.

## Ponte
“Podemos tornar o logit mais flexível e controlar sua complexidade. Em quais situações essa combinação é especialmente útil?”

## Aceite específico
Toda curva deve corresponder a execuções registradas. O slider não interpola modelos inexistentes. O teste não participa da seleção. Previsões e coeficientes exibidos pertencem ao mesmo pipeline e valor de penalização.

## Contrato comum de implementação

Leia também os guias de [narrativa](../00_guias/01_narrativa_e_contrato.md), [design e interação](../00_guias/02_design_e_interacao.md), [dados e cálculos](../00_guias/03_dados_e_calculos.md) e [aceite](../00_guias/05_qualidade_e_aceite.md). O estado inicial precisa ensinar sem clique; a exploração amplia a explicação. Inclua reinício local, teclado, toque, descrição acessível, notas do professor e estado estático de impressão. Mantenha o padrão de fonte dos dados indicado neste roteiro.

Implemente este slide, execute os critérios específicos acima, registre evidências em `02_controle/STATUS_SLIDES.md` e só então avance. Uma especificação escrita não é implementação concluída.
