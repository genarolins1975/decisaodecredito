# Registro de progresso (para continuar em outra sessão)

Última atualização: 21 de setembro de 2026. Branch: `claude/new-session-d2yt8t`.

## Estado por etapa do briefing

| Etapa | Situação | Evidência |
|---|---|---|
| 1. Inventário, auditoria inicial, benchmark e arquitetura | concluída | docs/01, docs/02, docs/03 |
| 2. Modelo de dados, migrações, autenticação, matrícula, isolamento | concluída | `drizzle/0000_*.sql`, testes e2e de matrícula e isolamento |
| 3. Aula ponta a ponta (conteúdo, questão, resposta, presença, painel) | concluída | testes e2e "aula ao vivo"; capturas em `content/generated/shots` |
| 4. Trabalhos, grupos, versões, correção, devolutiva, teste cego | concluída | testes e2e "trabalhos"; fluxo completo verificado por API |
| 5. Migração integral e revisão técnica, didática e visual | concluída com pendências declaradas | 180 páginas migradas; 84 visuais em iframe legado isolado (a portar); docs/03 |
| 6. Testes de aceitação, segurança, acessibilidade, carga, restauração | concluída no ambiente local | docs/07 |
| 7. Homologação, publicação e manuais | manuais concluídos; **homologação e produção não implantadas** (sem credenciais) | docs/09 |

## O que impede a conclusão total

- Implantação em homologação e produção exige credenciais (banco, hospedagem, armazenamento, OAuth Google) e autorização do professor: lista exata em docs/09.
- Envio real de e-mail exige a conta Gmail conectada pelo professor.
- Bases dos casos, pacote do trabalho final e rótulos OOT não foram fornecidos: cadastro pelo painel está pronto.

## Revisão da Aula 2 (21/09/2026)

Auditoria de arquitetura e experiência da aula em 50 slides, com correções implementadas e verificadas: `docs/AUDITORIA_ARQUITETURA.md`, `docs/ARQUITETURA_PROPOSTA.md`, `docs/PLANO_MELHORIAS.md` e `docs/VALIDACAO_JORNADAS.md`. Em resumo: o baralho passa a ser compilado em três saídas (completo para professor e monitor, variante sem notas para o aluno, notas em JSON para o painel); a projeção abre em modo próprio, sem notas; o painel do professor ganhou o roteiro do slide no ar; a exploração do aluno sobrevive à troca de modo e à recarga, com aviso do que fica salvo; queda de rede tem aviso e reenvio; acessibilidade dos gráficos, listas e contraste corrigida. Verificado em 21/09/2026: typecheck, lint (0 erros), `npm test` (249), `npx playwright test` (20 de 20, 2,2 min), QA do baralho 50 de 50 em quatro resoluções e na variante do aluno.

Segunda rodada de 21/09/2026, a partir de uma captura do professor no slide 24: fórmula com `%` em modo texto, rótulos de gráfico cortados e estados revelados que não cabiam na projeção em 24 slides. Correções em `docs/PLANO_MELHORIAS.md` (M14 e M15); a QA do baralho passou a varrer estados de verdade (`node qa.mjs --estados`), e o motor ganhou uma rede de segurança que reduz o corpo em vez de cortar.

Depois de editar qualquer slide: `node aula_credito_html/build.mjs`, que regrava `content/slides/aula-2.html`, `aula-2-aluno.html` e `aula-2-notas.json`; a plataforma lê essas cópias, não os fontes.

Terceira rodada de 21/09/2026: dois guias da Aula 2 em PDF, gerados pelo próprio baralho (`node aula_credito_html/material.mjs`): guia do professor (captura de cada slide no estado revelado, condução, respostas, cuidados, aprofundamentos, transição, ritmo proposto por bloco, comparação dos três modelos no teste e sinais para observar na turma) e guia do aluno (captura sem gabarito nos exercícios, explicação de como ler cada slide, o que mexer na tela, fórmulas em LaTeX, exercícios sem respostas, lista de verificação de saída e glossário). Os textos didáticos ficam em `aula_credito_html/material/conteudo/`, com contrato em `tests/aula-2-material.test.ts`; as saídas versionadas ficam em `content/materiais/`. A revisão das capturas levou a correções de rótulos sobrepostos ou cortados em 17 slides (M16 em `docs/PLANO_MELHORIAS.md`).

Quarta rodada de 21/09/2026: a Aula 2 ganhou a mesma moldura das outras aulas e um caminho de volta em todo ponto (M18). Abertura `/aulas/aula-2` no formato da abertura de capítulo; uma página por slide em `/aulas/aula-2/slide/NN` (lista lateral, cabeçalho, baralho embutido em modo livre, resumo, links do apêndice, roteiro do slide para a equipe, Anterior e Próxima); cinco cartões por bloco em Aulas; Aula 2 na sequência do curso (vizinha dos capítulos 3 e 4); Conteúdo com os 50 slides; Início com "Abrir a aula"; materiais apontando para a plataforma; guias em PDF servidos por papel em `/api/materiais/aula-2/`; link "Aulas" na barra do baralho aberto direto. A sincronia casca e baralho usa o hash e `App.trocar` (troca sem entrada dupla no histórico), porque um `location.replace` de fora do iframe recarrega o arquivo no Chromium. Verificado: typecheck, lint (0 erros), `npm test` (256), e2e "aula em slides" e "moldura da plataforma", script de 66 checagens no navegador, QA do baralho 50 de 50 nas quatro resoluções e na variante do aluno.

Quinta rodada de 21/09/2026: auditoria de uniformidade de layout e de UX sobre as 41 rotas, em oito dimensões, com verificação adversarial de cada achado (89 agentes de leitura, 40 achados levantados, 21 sobreviveram às duas lentes, 19 refutados). As correções (M19 em `docs/PLANO_MELHORIAS.md`) atingem as duas áreas: link de volta na página de trabalho; um só h1 por rota em Materiais; not-found próprio da Aula 2 e limite próprio em cada área com moldura; o 404 de página de aula sem recado dirigido ao professor; tela de quem não tem turma com saída própria; 404 global sem landmark aninhado; tabela de presença que não empurra mais a página de lado no celular; âncoras que param abaixo do cabeçalho grudado nas três molduras, inclusive com a faixa "vendo como aluno"; título de aba nas nove telas de turma; Bases e gabaritos contando um trabalho final por turma, com material clicável; estado vazio na aba Trabalhos; editor de página com eyebrow, h1 e link de volta no padrão; travessão de prosa fora das cascas React e do título de c6p18; confirmação de senha redefinida; confirmação divergente barrando o envio nas telas de senha; link de recuperação inválido com próximo passo; becos do papel monitor, que era devolvido em silêncio ao clicar numa sessão ao vivo; sucesso e falha distintos no pedido de revisão e no editor de página; rodapé nas telas de primeiro acesso; limites de erro em (publico) e (auth). A regra editorial virou contrato: `scripts/lint-tracos-cascas.mjs` (também `npm run lint:tracos`) e `tests/lint-tracos-cascas.test.ts`, que atendem R6.

Sexta rodada de 22/09/2026: a Aula 2 passou a ter capítulos, como as outras aulas, e o apêndice deixou de existir. O material original sempre lhe deu os capítulos 4, 5 e 6, e a soma dos essenciais deles é 165 minutos, exatamente a duração útil da aula; o apêndice era um contorno de quando a aula era só um baralho de slides. O importador voltou ao arranjo original, move os capítulos para a unidade certa e remove a unidade de apêndice depois de repontar trabalhos, materiais e encontros. Com isso caíram todos os casos especiais: `ehAulaEmSlides`, os cartões por bloco em Aulas, a abertura e a página por slide em `/aulas/aula-2`, a tabela de 50 slides em Conteúdo e o ramo da Aula 2 em Início. Os 50 slides continuam sendo a apresentação da aula: cada capítulo dela abre o baralho no slide em que o assunto começa (04 no 07, 05 no 21, 06 no 31), derivado do roteiro, e o painel ao vivo segue conduzindo por slides, agora por uma regra tirada do roteiro e não da ausência de capítulos. Os endereços antigos redirecionam para o conteúdo equivalente.

Sétima rodada de 22/09/2026: revisão pedagógica da Aula 2, capítulo a capítulo e slide a slide, com quatro leituras independentes (capítulos 4, 5, 6 e os 50 slides contra as páginas) e verificação própria de cada achado antes de corrigir. Detalhe e evidência em `docs/REVISAO_PEDAGOGICA_AULA_2.md`; as correções estão em M21 de `docs/PLANO_MELHORIAS.md`.

Quatro erros de fato saíram do material, todos reconferidos contra `src/lib/visuais/did.json` e `content/generated/dados.json`. A afirmação de que as propostas #1 e #15 ficam do lado errado da reta em qualquer posição era falsa em duas contagens: a #1 tem PD de 33,46% e não deu default, portanto está do lado certo, e nenhuma proposta erra em todo corte; no corte de 50% erram #2, #5, #10 e #15, e o melhor corte deixa três erros. A margem da raiz da árvore confundia duas coisas diferentes: 0,28125 contra 0,19841 é a margem sobre o corte vizinho, de 1,4 vez, e 0,28125 contra 0,07143 é a margem sobre a outra variável, de quase quatro vezes; só a segunda sustenta a estabilidade da raiz. A tabela de hiperparâmetros do capítulo 6 dizia que M é o freio contra o sobreajuste e o único escolhido fora do treino, contradizendo a resposta modelo da própria página. E o pico de sensibilidade da PD, para o aumento finito de 0,7453 em z, fica em 40,8% e não em 50%, como o próprio componente da página já exibia.

Sete lacunas estruturais foram fechadas. O capítulo 6 ganhou a ponte para classificação que faltava, em cinco linhas no topo de c6p13, com F₀ em log odds, alvo y − p e a ressalva de que a folha recebe a média do gradiente negativo, sem passo de Newton. c6p6 voltou a fechar com o problema que anuncia: soma o toco inteiro, mostra que cinco dos oito resíduos trocam de sinal e devolve a taxa de aprendizagem para c6p7, onde ela é apresentada. Toda curva de erro das páginas essenciais passou a dizer que é de treino. F₀ = 6,50 passou a ser construído na tela a partir dos oito valores de y, e resíduo passou a ser distinguido de erro final. O gráfico de c6p17 ganhou a curva de validação, que é a que escolhe a configuração, com a escolhida marcada. No capítulo 5, c5p4 ganhou a terceira curva, mín(p, 1 − p), e o contraexemplo de que o segundo nível derruba o Gini de 0,21875 para 0,12500 sem tirar um único erro; c5p9 ganhou o contraexemplo do guloso, com a raiz de ganho zero que termina em 0,10938 contra 0,12500 da gulosa; c5p10 passou a imprimir o intervalo de Wilson ao lado da taxa; c5p18 passou a trazer o n e o intervalo de cada folha; e a pergunta de c5p3 passou a medir profundidade, que é o objetivo declarado.

Oito slides mudaram. O fecho da aula (50) recebeu a comparação que a aula prometia no slide 01 e só existia no material impresso: os quatro clientes com as três PDs calibradas e a decisão no corte de 20%, onde os três modelos concordam na decisão e discordam em até 11,1 pontos de PD. O fio dos quatro clientes, que se perdia entre os slides 31 e 42, foi reatado: as folhas do boosting passaram a dizer quem cairia em cada uma e o exercício do slide 42 passou a ser sobre Carla. O slide 26 ganhou a comparação que o objetivo de c5p18 pede e a aula nunca mostrou: um botão troca o mapa de regiões pelo gráfico de PD por comprometimento com os degraus da árvore e a curva do logit nos mesmos eixos. O slide 19 trocou a terceira repetição do organograma pela evidência que a própria pergunta de diagnóstico pede, risco por faixa com as duas curvas do logit, e a promessa de comparação da nota de aprofundar passou a apontar para o slide 26, onde ela agora existe. O bloco da árvore ganhou o painel de quando usar, que o logit e o boosting já tinham. A miniatura de boosting deixou de ser fixa em η igual a 1 no slide 36, para que a afirmação do slide 37 possa ser verificada. E três notas de aprofundar passaram a reconciliar os números dos slides com os das páginas, que vêm de exemplos diferentes.

O ritmo dos blocos foi refeito a partir do peso do conteúdo: somando os minutos das páginas essenciais, o capítulo 4 pede 49 minutos, o 5 pede 49 e o 6 pede 67, enquanto o baralho dava 45, 35 e 35. A proposta passou a 20, 45, 33, 39 e 28, somando os mesmos 165 minutos.

Dezoito das vinte e uma páginas essenciais da aula passaram a ter veredito. Antes eram três: as perguntas de checagem são abertas e não entram em `/acompanhamento`, então o aluno que estudava sozinho não tinha como saber se entendeu. `content/questoes-curadas.json` traz dezesseis perguntas de múltipla escolha escritas no mesmo formato das do material original, com os distratores tirados dos erros previstos no guia do professor de cada página e diagnóstico por alternativa errada. As três sem veredito são as aberturas de capítulo (c4p1, c5p1, c6p1), páginas de quatro minutos que mapeiam o capítulo e onde um veredito não mediria nada. O importador junta as curadas às da página; `getPage` passou a carregar todas as questões da página, não só as ancoradas em bloco, e a página as mostra depois do conteúdo e antes da pergunta aberta.

Verificado em 22/09/2026: typecheck, lint (0 erros, 5 avisos preexistentes), `npm run lint:tracos` (0 ocorrências), `npm test` (260), `npx playwright test` (22 de 22), QA do baralho 50 de 50 em 1366x768 sem falha, os dois PDFs regerados (71 páginas cada, 0 traços, 0 fórmulas com erro) e conferência no navegador das dezesseis perguntas novas e dos oito slides alterados.

## Pendências técnicas ordenadas

0. Aula 2: R1 a R4 e R7 de `docs/PLANO_MELHORIAS.md` (aviso de turma sem encontros, perguntas para slides sem página ligada, verificação em Firefox, Safari e projetor, validação com usuários, traços nas cascas, estados combinados que cabem reduzidos).

1. Portar visuais legados de maior valor para componentes nativos (lista em docs/03, seção 6).
2. TOTP para o professor; rota agendada de manutenção (fila de e-mail e uploads órfãos).
3. Portar DeLong para o núcleo numérico.
4. Fluxo de troca de e-mail do aluno no painel.
5. Ampliar testes e2e de interface (celular) além da varredura visual.

## Como retomar

```bash
npm ci && npm run db:migrate && npm run db:seed
node scripts/content/extract.mjs && node scripts/content/build-legacy.mjs && npm run content:import
npm run dev; npm test; npm run test:e2e
```

Convenções: serviços em `src/lib/services` (regras e autorização), rotas em `src/app/api` (validação zod + `handle`), páginas em `src/app`, componentes cliente em `src/components`. Toda mutação passa por `requireClassAccess` ou `requireStaff` e registra `audit`.
