# Prompt mestre: implementar a aula HTML, slide por slide

Você é professor de mestrado profissional, especialista em modelagem de crédito e desenvolvedor de experiências educacionais em HTML. Construa uma apresentação interativa completa, com exatamente 50 slides principais, seguindo os arquivos desta pasta. O objetivo é ensinar regressão logística, árvore de decisão e gradient boosting em um caso de concessão de crédito pessoal.

**Execute a tarefa. Não entregue apenas outro planejamento, um resumo dos arquivos ou um esqueleto com placeholders.** Os Markdown são especificações para você implementar. Não são o produto final da aula.

## 1. Ordem obrigatória de leitura

1. `LEIA_PRIMEIRO.md` e `00_guias/01_narrativa_e_contrato.md`.
2. `00_guias/02_design_e_interacao.md` e `00_guias/03_dados_e_calculos.md`.
3. `00_guias/04_reaproveitamento_logit.md` e a apresentação original anexada pelo professor.
4. `00_guias/05_qualidade_e_aceite.md`, `00_guias/06_referencias.md` e `MAPA_DOS_50_SLIDES.md`.
5. Os 50 arquivos de `01_slides/`, inicialmente para entender o encadeamento. Durante a implementação, releia o arquivo específico antes de trabalhar no slide correspondente.

O detalhe técnico comum pertence aos guias; as escolhas de conteúdo e interação de cada slide pertencem ao seu Markdown. Em conflito, preserve a correção matemática e a intenção didática, documentando a solução. Não mude silenciosamente o exemplo canônico, a definição de PD ou o número de slides.

## 2. Material original e prioridade de logit

Examine os anexos integralmente. Reaproveite o máximo possível de conteúdo bom do logit: exemplos, figuras, equações, linguagem do professor, sequência e ativos editáveis. Adapte o conteúdo aos objetivos dos slides 7–20. Não confunda reaproveitamento com colocar uma captura ilegível do slide antigo como fundo. Reconstrua árvore e boosting quando isso melhorar a aula.

Preencha `02_controle/MAPA_REAPROVEITAMENTO.md` com identificação do original, trecho utilizado, destino e justificativa. Se o material original não estiver disponível, marque essa dependência, produza uma versão provisória de logit baseada nos roteiros e continue. Não alegue ter lido arquivos ausentes e não invente a correspondência.

## 3. Preparação antes da implementação

Estabeleça primeiro o sistema visual, o mecanismo de navegação e os contratos de dados. Execute o notebook para produzir os resultados empíricos antes de preencher gráficos comparativos. Os exemplos pequenos de mecanismo já estão definidos nos guias e devem ser recalculados.

Preserve o ambiente existente se já houver um projeto HTML funcional. Em projeto novo, priorize uma estrutura simples, com módulos por slide, recursos locais e compilação para uma distribuição que abra offline. Evite infraestrutura de servidor desnecessária. Não publique na internet sem pedido do professor.

Crie o mecanismo de slides sem marcar nenhum conteúdo como concluído. Em seguida implemente os slides na ordem 01 a 50. Componentes compartilhados podem ser preparados antes, mas cada slide precisa de conteúdo, visualização e teste próprios.

## 4. Ciclo obrigatório para cada slide

Para `NN` de 01 a 50:

1. Leia integralmente `01_slides/NN_*.md` e releia a transição do slide anterior.
2. Identifique objetivo, mensagem central, dados, interações, estado inicial, sequência de revelação, notas e critérios de aceite.
3. Implemente o slide em módulo identificável. Não reduza sua especificação a um título e três bullets.
4. Ligue todos os controles a cálculos ou estados reais. Se um seletor muda o cenário, ele deve mudar os gráficos e valores relacionados de maneira coerente.
5. Revise o cálculo em uma função independente ou no notebook. Confira origem, unidade, população e período.
6. Abra e examine a renderização inicial e pelo menos dois estados relevantes, incluindo um extremo quando houver slider.
7. Teste teclado, toque equivalente, reinício, navegação de ida e volta e impressão estática.
8. Faça uma revisão crítica de técnica, didática, visual e fluidez. Corrija os problemas encontrados.
9. Registre em `02_controle/STATUS_SLIDES.md` o status real, as evidências e as pendências. Atualize `02_controle/REVISAO_FINAL.md` quando cabível.
10. Passe ao slide seguinte quando o atual cumprir o aceite. Se uma dependência externa impedir a conclusão, registre-a com precisão, mantenha o slide identificado como pendente e continue nos itens independentes. Não dê aceite artificial.

Não peça confirmação entre slides ou para ajustes rotineiros. Se a sessão terminar, atualize `02_controle/RETOMADA.md` com o último slide aceito, o próximo arquivo, a última ação executada e as pendências. Na retomada, continue desse ponto. Não substitua slides existentes por uma nova versão resumida para economizar contexto.

## 5. O que significa interatividade didática

Use amplamente recursos visuais que ensinem: cálculo passo a passo, comparação antes/depois, curvas com ponto móvel, percurso na árvore, partição do espaço, contribuições aditivas, curva de perda, probabilidades por faixa, política de corte e exercícios com feedback.

Cada slide tem uma interação principal especificada. Algumas interações são numéricas; outras são revelações progressivas ou escolhas conceituais. Não crie um painel com muitos controles concorrentes. O professor deve conseguir explicar a mensagem inicial sem clicar e conduzir a exploração em menos de um minuto, salvo nos exercícios.

Proíba interações falsas: métricas digitadas para parecer resultado, botões que só mudam a cor, sliders sem efeito nos cálculos, curvas desenhadas para garantir a vitória do boosting ou respostas inventadas de uma suposta votação da turma. A seleção local representa apenas a escolha no dispositivo.

## 6. Entregáveis finais

- Apresentação HTML interativa com 50 slides principais, em português, pronta para projetar.
- Código-fonte organizado por slide e recursos locais.
- Versão offline, preferencialmente `dist/aula_credito.html` autossuficiente, e pasta de distribuição quando indispensável.
- Modo professor com notas, respostas e transições, oculto por padrão.
- Modo estudo e impressão com os estados relevantes visíveis, sem depender de hover.
- Notebook Python executado, dados sintéticos, arquivos de resultados e ambiente reproduzível.
- Mapa de reaproveitamento, evidências de revisão, limitações e instruções para abrir a aula.

Se o ambiente não permitir executar Python ou abrir um navegador, não declare execução ou inspeção. Entregue o que for possível, identifique o bloqueio e deixe os resultados não calculados explicitamente pendentes. Nunca complete uma tabela experimental com números inventados.

## 7. Aceite final

Examine a apresentação de ponta a ponta depois de revisar cada slide. Confirme que os quatro clientes, as definições de variáveis, as cores, os períodos e os resultados permanecem coerentes. Teste os links dos 50 slides, a abertura offline e a volta dos exercícios à narrativa.

Entregue um resumo objetivo do que foi construído e verificado, o local dos arquivos e as pendências reais. O sucesso consiste em uma aula que permita ao aluno explicar como cada técnica produz uma PD e defender uma decisão de crédito com evidências.
