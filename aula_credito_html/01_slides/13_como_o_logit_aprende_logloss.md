# Slide 13 — Aprender coeficientes significa reduzir uma perda

**Bloco:** logit. **Tempo:** 5 min. **Reaproveitamento:** manter intuição de máxima verossimilhança do original, simplificando a tela se estiver densa.

## Objetivo e mensagem
Associar probabilidades ruins a uma penalização e entender que o ajuste considera todos os registros. Mensagem: “A log-loss pune previsões confiantes que contradizem o que ocorreu.”

## Tela e composição
Título: **“O modelo aprende penalizando previsões incompatíveis com os dados”**. Visual central com duas curvas de perda individual em função de p: uma para y=1 e outra para y=0, em painéis alinhados. Uma ficha de observação fictícia aparece ao lado com y conhecido e PD controlável. No rodapé, uma mini-tabela de seis observações mostra que a perda total agrega todos os casos.

## Dados e fórmula
Usar log natural e `L=−[y ln p+(1-y)ln(1-p)]`. Para y=1, p=0,10 produz L≈2,3026; p=0,90 produz ≈0,1054. Para y=0, a relação se inverte. Se mostrar seis registros, definir y=[0,0,0,0,1,1] e p=[0,05;0,10;0,20;0,40;0,60;0,80], calculando cada parcela e a média.

## Interação
Slider p 1–99%, padrão 10%; seletor y=0/1; ambos atualizam ponto, perda e interpretação. Botão “Olhar a amostra inteira” revela a tabela e a média, sem alterar as curvas. Um aprofundamento pode animar coeficientes de um logit pequeno somente se a trajetória de otimização for realmente calculada. Não desenhar redução monotônica fictícia de perda.

## Sequência
Escolha y=1 e p=10%, aumente para 90%. Troque y para 0 mantendo p=90% e pergunte por que a penalização aumenta. Mostre que uma observação não define sozinha os coeficientes. Conecte minimização de log-loss à maximização da verossimilhança sem derivação longa.

## Notas e ponte
Classificação correta a partir de um corte não é suficiente para medir qualidade da probabilidade. A perda depende do grau de confiança. Ponte: “Mesmo com um coeficiente fixo, o efeito observado na PD muda ao longo da curva logística.”

## Aceite específico
Conferir os quatro valores de referência e média calculada. Curvas não podem ser desenhadas em p=0/1 sem tratamento explícito. Não confundir a função objetivo do treino com garantia de melhor desempenho futuro.

## Contrato comum de implementação

Leia também os guias de [narrativa](../00_guias/01_narrativa_e_contrato.md), [design e interação](../00_guias/02_design_e_interacao.md), [dados e cálculos](../00_guias/03_dados_e_calculos.md) e [aceite](../00_guias/05_qualidade_e_aceite.md). O estado inicial precisa ensinar sem clique; a exploração amplia a explicação. Inclua reinício local, teclado, toque, descrição acessível, notas do professor e estado estático de impressão. Mantenha o padrão de fonte dos dados indicado neste roteiro.

Implemente este slide, execute os critérios específicos acima, registre evidências em `02_controle/STATUS_SLIDES.md` e só então avance. Uma especificação escrita não é implementação concluída.
