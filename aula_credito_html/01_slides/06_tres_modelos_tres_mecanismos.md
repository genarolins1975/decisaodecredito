# Slide 06 — Três maneiras de transformar dados em PD

**Bloco:** problema. **Tempo:** 3 min. **Origem:** esquemas conceituais.

## Objetivo e mensagem
Dar ao aluno um mapa da aula sem exigir que já conheça os algoritmos. Mensagem: “Os dados e o objetivo são comuns; muda a forma de construir a previsão.”

## Tela e composição
Título: **“O mesmo cliente, três formas de aprender o risco”**. Três painéis alinhados com visual próprio: soma ponderada seguida de curva logística; árvore pequena com percurso; sequência de contribuições de pequenas árvores. Uma ficha do mesmo cliente aparece acima, alimentando os três painéis. Embaixo, três critérios escritos sem notas: ordenar risco, estimar probabilidades e apoiar a decisão.

## Conteúdo exato
Logit: “Combina efeitos em um escore”. Árvore: “Separa clientes por perguntas”. Boosting: “Acrescenta correções sucessivas ao escore”. Não preencher PDs dos modelos nem desenhar pódio. Use ícones ou miniaturas geométricas precisas, sem imagens genéricas de inteligência artificial.

## Interação
Selecionar um painel revela, dentro dele, uma animação manual de três etapas. Logit mostra entradas, soma e conversão; árvore mostra entrada, percurso e folha; boosting mostra escore inicial, contribuição e conversão. Duração total inferior a 20 segundos por painel. Um botão “O que vamos verificar?” revela os três critérios de comparação. A seleção deve funcionar por teclado e toque.

## Sequência de aula
Passe rapidamente pelos três mecanismos sem fórmulas. Pergunte: “Qual deles parece mais fácil de explicar? Isso basta para escolher?” Use a resposta para diferenciar facilidade de explicar e evidência de desempenho. Termine selecionando logit e mantendo-o destacado como início do próximo bloco.

## Notas
Não chame árvore de “regras definidas pelo gestor”: a estrutura é aprendida dos dados, embora o gestor imponha limites. Não chame boosting de votação majoritária. Não apresente logit como incapaz de não linearidades. Esses cuidados antecipam concepções que serão esclarecidas em profundidade.

## Transição
“Vamos começar pela ideia mais familiar: combinar características em um escore e transformá-lo em probabilidade.”

## Aceite específico
As três miniaturas precisam refletir os mecanismos corretos. Nenhum algoritmo recebe superioridade antecipada. O mesmo perfil de entrada aparece em todos os painéis. A animação para imediatamente em movimento reduzido, mostrando etapas estáticas numeradas.

## Contrato comum de implementação

Leia também os guias de [narrativa](../00_guias/01_narrativa_e_contrato.md), [design e interação](../00_guias/02_design_e_interacao.md), [dados e cálculos](../00_guias/03_dados_e_calculos.md) e [aceite](../00_guias/05_qualidade_e_aceite.md). O estado inicial precisa ensinar sem clique; a exploração amplia a explicação. Inclua reinício local, teclado, toque, descrição acessível, notas do professor e estado estático de impressão. Mantenha o padrão de fonte dos dados indicado neste roteiro.

Implemente este slide, execute os critérios específicos acima, registre evidências em `02_controle/STATUS_SLIDES.md` e só então avance. Uma especificação escrita não é implementação concluída.
