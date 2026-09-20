# Slide 30 — Exercício: percorrer, interpretar e questionar a árvore

**Bloco:** árvore. **Tempo:** 6 min. **Origem:** árvore manual canônica.

## Objetivo e mensagem
O aluno deve encontrar a folha, calcular sua PD e reconhecer uma limitação. Mensagem: “Uma regra legível ajuda a explicar o cálculo, mas não dispensa evidência de qualidade.”

## Tela e composição
Título: **“Carla recebe qual PD nesta árvore?”**. Mostrar ficha de Carla e árvore inicialmente sem percursos destacados. Na folha correspondente, ocultar a taxa mantendo n=200 e d=22. Ao lado, três tarefas curtas: indicar caminho, calcular PD e dizer o que aconteceria se a renda dobrasse mantendo todas as entradas usadas na árvore fixas.

## Solução esperada
Carla tem hist=0 e comp=48>40; chega a 22/200=11%. Dobrar renda isoladamente, com comprometimento mantido artificialmente fixo, não altera esta árvore, pois renda não é usada nas perguntas. Ressaltar que numa mudança econômica real o comprometimento poderia variar; a simulação é sobre a função do modelo.

## Interação
Etapa 1: selecionar ramos. Etapa 2: preencher PD em porcentagem. Aceitar tolerância pequena e tratar 0,11 versus 11 com mensagem de unidade. Etapa 3: escolher “permanece”, “cai pela metade” ou “não é possível avaliar a função”. Depois de conferir, mostrar a resposta comentada e a condição de demais entradas fixas.

Desafio final opcional: Bruno passa de comp=38 para 41, demais valores fixos. A PD muda de 15% para 40%. Perguntar se isso prova um salto real de risco exatamente nesse limite. Resposta: é uma descontinuidade da aproximação aprendida.

## Condução
Reservar dois minutos em duplas. Não revelar a resposta ao primeiro clique em um ramo errado; explicar a regra e permitir corrigir. O professor conclui com a importância de tamanho de folha, validação e estabilidade. Este é um bom ponto para uma pausa na aula.

## Ponte
“Uma única árvore é clara, mas pode ser limitada ou instável. Podemos construir uma previsão melhor acrescentando várias árvores pequenas em sequência?”

## Aceite específico
Resposta 11% e caminho correto. Alteração hipotética da renda não pode recalcular comprometimento escondido. Feedback distingue erro de percurso, divisão e unidade. Respostas de exercício ficam ocultas no estado inicial e completas no modo professor.

## Contrato comum de implementação

Leia também os guias de [narrativa](../00_guias/01_narrativa_e_contrato.md), [design e interação](../00_guias/02_design_e_interacao.md), [dados e cálculos](../00_guias/03_dados_e_calculos.md) e [aceite](../00_guias/05_qualidade_e_aceite.md). O estado inicial precisa ensinar sem clique; a exploração amplia a explicação. Inclua reinício local, teclado, toque, descrição acessível, notas do professor e estado estático de impressão. Mantenha o padrão de fonte dos dados indicado neste roteiro.

Implemente este slide, execute os critérios específicos acima, registre evidências em `02_controle/STATUS_SLIDES.md` e só então avance. Uma especificação escrita não é implementação concluída.
