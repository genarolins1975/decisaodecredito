# Slide 42 — Exercício: reconstrua a previsão de um novo cliente

**Bloco:** boosting. **Tempo:** 6 min. **Origem:** miniatura de primeira ordem.

## Objetivo e mensagem
Verificar que o aluno sabe somar em F, converter em PD e prever sem conhecer y. Mensagem: “Com as árvores treinadas, os atributos determinam o percurso e a soma determina a PD.”

## Tela e composição
Título: **“O novo cliente caiu no grupo B. Qual é a previsão?”**. Mostrar F0=−1,386294 e duas folhas +0,20 e +0,166078, com η=1. A PD final fica oculta. Oferecer três escolhas: somar como pontos percentuais; somar ao escore e aplicar sigmoid; tirar média das duas folhas. Uma faixa inferior contém uma segunda pergunta de interpretação sobre causalidade.

## Solução
F2=−1,0202167024 e PD≈26,4985%. Não confundir com 20%+20%+16,6078%. O modelo não conhece o futuro deste solicitante; a correção foi aprendida com registros históricos. A pergunta adicional: “Uma contribuição positiva do histórico prova que remover o atraso do cadastro reduziria o risco real?” Resposta: não, ela explica a função preditiva e não uma intervenção causal.

## Interação
Seleção de método, campo opcional para PD e “Conferir”. Feedback da soma de percentuais destaca as unidades; feedback da média explica a soma aditiva em F. “Ver resolução” constrói waterfall e mini-sigmoide em duas etapas. Um desafio de consolidação pergunta o que mudar ao reduzir η no treinamento: recalcular as rodadas e os resíduos, não apenas dividir a PD por dois.

## Roteiro
Dê um minuto individual, outro em duplas. Peça que verbalizem onde o desfecho y foi usado e onde deixou de ser necessário. Conclua o bloco conectando logit e boosting pela saída probabilística, com funções de escore diferentes.

## Notas
A miniatura continua separada das previsões de Bruno, Carla e demais perfis no modelo empírico. Evite dar nome de um cliente canônico ao grupo B sem calcular sua correspondência por atributos e sem indicar troca de universo.

## Ponte
“Sabemos como as três técnicas funcionam. Agora precisamos compará-las em condições iguais e verificar o que cada métrica realmente responde.”

## Aceite específico
Resposta e feedback usam a tabela canônica, com tolerância de arredondamento. Solução oculta inicialmente. Nenhuma afirmação de que cada árvore produz uma PD individual. O desafio de η não deve apresentar reescala de ensemble fixo como novo treinamento.

## Contrato comum de implementação

Leia também os guias de [narrativa](../00_guias/01_narrativa_e_contrato.md), [design e interação](../00_guias/02_design_e_interacao.md), [dados e cálculos](../00_guias/03_dados_e_calculos.md) e [aceite](../00_guias/05_qualidade_e_aceite.md). O estado inicial precisa ensinar sem clique; a exploração amplia a explicação. Inclua reinício local, teclado, toque, descrição acessível, notas do professor e estado estático de impressão. Mantenha o padrão de fonte dos dados indicado neste roteiro.

Implemente este slide, execute os critérios específicos acima, registre evidências em `02_controle/STATUS_SLIDES.md` e só então avance. Uma especificação escrita não é implementação concluída.
