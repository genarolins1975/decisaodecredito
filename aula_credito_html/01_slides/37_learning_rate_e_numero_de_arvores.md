# Slide 37 — Passos menores mudam a trajetória de aprendizagem

**Bloco:** boosting. **Tempo:** 4 min. **Origem:** miniatura reexecutada ou experimento pré-calculado, explicitamente identificado.

## Objetivo e mensagem
Entender o trade-off entre learning rate e número de iterações sem confundir reescala com novo treinamento. Mensagem: “Mudar o passo altera previsões, gradientes e, portanto, o que as próximas árvores aprendem.”

## Tela e composição
Título: **“Learning rate e número de árvores precisam ser escolhidos juntos”**. Gráfico dominante: perda de treino/validação por iteração para três taxas. Usar seleção de uma taxa para manter duas curvas legíveis, com contexto discreto das outras. Ao lado, mostrar a equação de atualização e o valor de η escolhido. Não usar metáfora de escada que implique redução garantida fora do treino.

## Dados
Pré-calcular η=[0,03;0,10;0,30] no experimento com hiperparâmetros restantes iguais e até um número de árvores viável, por exemplo 300. Se usar miniatura, pode explorar η=[0,1;0,3;1] recalculando cada rodada. Não misturar perda da miniatura e validação do experimento na mesma curva.

## Interação
Seletor discreto η e slider do número de árvores apenas em iterações disponíveis. Atualizar ponto na curva, perda e PD de um cliente do experimento. Mostrar “trajetórias pré-calculadas” quando aplicável. Um botão didático “Por que não basta multiplicar no final?” revela que r depende de F atualizado.

## Condução
Compare taxas no mesmo número de árvores e depois permita mais árvores para a taxa menor. Pergunte se “menor η sempre melhor” é conclusão válida: não, há custo computacional, subajuste quando poucas árvores e comportamento dependente dos dados. O resultado observado deve orientar a discussão.

## Notas
O produto η×M não determina sozinho o modelo final, pois a trajetória muda. Não mostrar eta=0 como modelo treinado normal; se existir, descrevê-lo como ausência de atualização. O parâmetro se relaciona com regularização, mas não substitui validação temporal.

## Ponte
“Além de quantos passos dar e do tamanho de cada passo, importa o que cada árvore consegue representar.”

## Aceite específico
Cada curva resulta de treinamento com sua própria taxa. O controle não apenas reescala árvores aprendidas com outra configuração. Iterações e métricas sincronizadas. Teste final continua fora da escolha.

## Contrato comum de implementação

Leia também os guias de [narrativa](../00_guias/01_narrativa_e_contrato.md), [design e interação](../00_guias/02_design_e_interacao.md), [dados e cálculos](../00_guias/03_dados_e_calculos.md) e [aceite](../00_guias/05_qualidade_e_aceite.md). O estado inicial precisa ensinar sem clique; a exploração amplia a explicação. Inclua reinício local, teclado, toque, descrição acessível, notas do professor e estado estático de impressão. Mantenha o padrão de fonte dos dados indicado neste roteiro.

Implemente este slide, execute os critérios específicos acima, registre evidências em `02_controle/STATUS_SLIDES.md` e só então avance. Uma especificação escrita não é implementação concluída.
