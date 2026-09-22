# Validação das jornadas da Aula 2: cenários, evidências, limitações e pendências

Data: 21 de setembro de 2026. Ambiente: máquina única com Node 22.22, PostgreSQL 16, Next.js 16.3 em modo `dev` em `http://localhost:3000`, Chromium 1194 controlado por Playwright 1.56 (headless), contas de teste da semente (`genaro.lins@gmail.com` como professor, `aluno.a@example.test` como aluno), turma 2026-A com os quatro encontros criados pela API. Nenhum teste tocou produção, enviou e-mail ou usou dados reais.

Origem das evidências: script de jornadas (dois contextos autenticados, console e tempos gravados em `jornadas.json`, fora do repositório), capturas em `docs/capturas/aula2-*.png`, verificações em jsdom, `node qa.mjs`, `npm test` e `npx playwright test`. Nenhum percentual de melhoria foi estimado e nenhum teste com usuários foi realizado.

## 1. Cenários obrigatórios

| # | Cenário | Como foi executado | Resultado | Evidência |
|---|---|---|---|---|
| 1 | Professor abre a aula, encontra um tema, conduz uma simulação e volta ao roteiro | sessão iniciada pela API em um clique; painel com "Conduzir pelos slides" e "Roteiro do slide no ar"; projeção aberta; índice com filtro; Home e End; slide 12 conduzido com o slider do comprometimento; "Avançar para 13" | passou | `aula2-professor-roteiro-do-slide.png`; jornadas P1 a P4; e2e "aula em slides" |
| 2 | Notas e respostas reservadas não aparecem na projeção | tecla `p` e botões na janela projetada, antes e depois | antes: notas abriam na projeção; depois: `p` inerte, botões Professor, Imprimir e Estudo ocultos | `aula2-projecao-notas-antes.png`, `aula2-projecao-sem-notas-depois.png`; jornada P5 |
| 3 | Aluno compreende a tarefa, altera parâmetros, recebe feedback e tenta novamente | slide 12 pelo teclado (slider e botões), selo "simulação", PD de 11,66% a 12,08%; pergunta de alternativa única publicada pelo professor (c4p10q), respondida, recarregada: continua "Enviado" e o estado do aluno não contém gabarito | passou | jornadas A3, A13, A14, A15 |
| 4 | Texto, gráfico, tabela e equação coerentes após cada mudança | 50 slides com todo slider no mínimo e no máximo, campos vazios e inválidos, três rodadas de botões, impressão; busca por NaN, undefined, Infinity, null, "[object", exceção | passou; único caso limite declarado na tela (slide 46 sem aprovados: "não definida") | varredura em jsdom; QA 50 de 50 com `--estados` nas quatro resoluções |
| 5 | Reiniciar uma atividade não apaga dados de outra | em jsdom, reiniciar cada slide e comparar o estado de outro slide antes e depois | passou nos 50 | verificação em jsdom |
| 6 | Recarregar ou abrir link direto produz estado válido | recarga da tela do aluno no slide 12 com exploração; `/slides/aula-2#/slide/27` como aluno; `/slides/aula-2` sem hash | passou: slide e exploração preservados na recarga; link direto abre o slide 27 na variante sem notas; sem hash abre o último slide da máquina | jornadas A9, A10, A11; e2e |
| 7 | Trocar de modo preserva o que deve preservar | "Navegar por conta própria" e "Voltar ao slide do professor" com o slide 12 explorado | passou: exploração preservada nas duas trocas; barra aparece no modo livre e some ao voltar; tecla `p` não abre notas em nenhum modo | jornadas A5 a A8; e2e |
| 8 | Falha de rede gera recuperação clara | projeção sem rede: aviso e reenvio; aluno com canal SSE e atualização periódica abortados por 48 s, depois liberados | passou: "Sem conexão com a sessão: tentando de novo a cada 3 s" e "Conexão recuperada"; "Sem atualização há 45 s: tentando reconectar" e depois "Atualização periódica" | jornadas R1 e R2; script de rede |
| 9 | Teclado, zoom e tela pequena permitem concluir tarefas | slider por setas, Tab entre controles, Escape no índice; 390 por 844: modo estudo, sem rolagem horizontal, alvos de 44 px | passou | `aula2-aluno-celular-390.png`; jornadas C1 e C2; QA em 390 |
| 10 | Fórmulas LaTeX renderizam sem cortes, comandos expostos ou erros | 50 slides em modo aluno: `.katex-error`, TeX cru no texto, contagem de expressões e MathML | passou: 45 expressões em 23 slides, 45 com MathML, 0 erros | jornada V2 |
| 11 | Mudança de versão trata estados anteriores | estado gravado com outra versão, estado corrompido, outro usuário na mesma máquina | passou: descartado, apagado sem impedir a aula, isolado por usuário | verificação em jsdom |
| 12 | Se houver autenticação, dados e ações ficam restritos ao usuário e papel | aluno tenta publicar slide (403); sem sessão (redirecionamento); sem turma (403); arquivo do aluno sem notas, do professor com notas; estado do aluno sem `answerKey` | passou | e2e "aula em slides"; jornada A15 |

## 1b. Quarta rodada (21/09/2026): a Aula 2 na moldura da plataforma

Motivo: a Aula 2 abria como um arquivo em nova aba, sem a moldura das outras aulas e sem caminho de volta. Cenários executados por script no navegador (66 checagens, dois contextos autenticados, 1366 por 800 e 390 por 844) e pelo teste de aceitação "moldura da plataforma".

| # | Cenário | Como foi executado | Resultado | Evidência |
|---|---|---|---|---|
| 13 | A Aula 2 tem o mesmo formato das outras aulas | Aulas: cinco cartões, um por bloco; abertura `/aulas/aula-2` como a de um capítulo (pergunta, o que se aprende, os 50 slides, antes e depois, material, vizinhos); página por slide `/aulas/aula-2/slide/NN` com lateral, cabeçalho, baralho embutido, resumo, links do apêndice, Anterior e Próxima | passou | `aula2-aulas-cartoes.png`, `aula2-abertura.png`, `aula2-slide-12-aluno.png`; e2e "moldura da plataforma" |
| 14 | Há caminho de volta em todo ponto | "Aulas" no alto da abertura e da página do slide; "Abertura da aula" na lateral; no baralho aberto em tela cheia, o link "Aulas" na barra volta à página do slide atual e acompanha as setas; embutido na página ou na tela ao vivo, o link fica oculto | passou | `aula2-tela-cheia-retorno.png`; e2e |
| 15 | Navegar pela casca ou pelo baralho mantém endereço, lateral e cabeçalho em sincronia, sem recarregar | Próxima, lista lateral, setas com o foco na casca, setas e índice dentro do baralho, Voltar e Avançar do navegador | passou: uma marca posta na janela do baralho sobrevive a todas as trocas; Voltar desfaz um passo por navegação (sonda com `history.length`) | sonda de histórico; e2e |
| 16 | O roteiro do professor não chega ao aluno | página do slide 12 como aluno e como professor; frase de condução das notas procurada no HTML | passou | `aula2-slide-12-professor.png`; e2e |
| 17 | Guias por papel | aluno: 200 no guia do aluno e 403 no do professor; professor: 200 nos dois; anônimo 401; sem turma 403; arquivo desconhecido 404 | passou | e2e |
| 18 | A Aula 2 entra na sequência do curso | capítulo 3 aponta para a Aula 2, que aponta para o capítulo 4; unidade sem capítulos fora da Aula 2 não entra | passou | `tests/aula-2-plataforma.test.ts`; e2e |
| 19 | Celular | 390 por 844: página do slide sem rolagem horizontal, baralho em modo estudo com a largura inteira | passou | `aula2-slide-12-celular.png` |
| 20 | Conteúdo, Início e Materiais levam à plataforma, não ao arquivo | Conteúdo com os 50 slides ("ver" e "tela cheia"); Início com "Abrir a aula" quando o próximo encontro é a Aula 2; Materiais com a aula em `/aulas/aula-2` e o guia do aluno; o guia do professor na abertura da aula e em Conteúdo, para a equipe | passou | `aula2-conteudo-professor.png`; e2e |

Achado técnico registrado: no Chromium, um `location.replace` com fragmento feito de fora do iframe recarrega o arquivo inteiro (a marca na janela some), enquanto atribuir `location.hash` cria uma entrada a mais no histórico. A casca usa `App.trocar`, que faz `history.replaceState` dentro do próprio baralho. Não verificado em Firefox e Safari.

## 1c. Quinta rodada (21/09/2026): uniformidade de layout e UX nas 41 rotas

Motivo: o pedido era uniformizar todos os layouts, não só o da Aula 2. Método: auditoria em oito dimensões (moldura do aluno, caminho de volta, área do professor, reuso de componentes e tokens, tela estreita e acessibilidade, texto e terminologia, estados vazios e erros, entradas e links mortos), cada achado submetido a duas lentes adversariais independentes (a convenção está provada em pelo menos duas outras rotas; o desvio se reproduz no HTML renderizado), mais um crítico de cobertura. Foram 89 leituras, 40 achados levantados, 21 sobreviventes e 19 refutados. Os refutados ficam registrados: a maioria caiu porque a convenção alegada não existia na plataforma, ou porque a rota apontada tinha motivo documentado para ser diferente.

| # | Cenário | Como foi executado | Resultado | Evidência |
|---|---|---|---|---|
| 21 | Toda rota de detalhe tem caminho de volta ao nível acima | censo das rotas de detalhe do aluno e da equipe; `/trabalhos/[id]` era a única sem `.voltar` | corrigido e verificado | e2e "uniformidade das molduras" |
| 22 | Uma rota, um h1 | contagem de h1 nas oito rotas da área do aluno; `/materiais` tinha dois PageHeader, um por coluna | corrigido: um cabeçalho de página e duas seções em h2 | e2e; script de 33 checagens |
| 23 | `notFound()` cai em cartão da própria área, com um landmark e um alvo de pulo | `/aulas/aula-2/slide/99`, `/aulas/naoexiste`, `/aulas/capitulo/99`, `/trabalhos/naoexiste`, `/endereco-que-nao-existe`, `/professor/turmas/inexistente`, `/professor/naoexiste` e `/professor/conteudo/inexistente`, nos dois papéis, três passagens cada | corrigido: a Aula 2 ganhou not-found próprio, que cobre também a página de cada slide, e cada área com moldura ganhou o seu, que entrega só o cartão. O 404 da raiz voltou a abrir o próprio `main`, porque no endereço sem rota não há moldura que o dê. A primeira versão tirou o `main` do arquivo da raiz e deixou o endereço sem rota sem landmark e com o pulo "Ir para o conteúdo" morto: a verificação adversarial pegou, e a medição confirmou | e2e cobre a invariante de um `main` e um `#conteudo` em cada caso |
| 24 | O 404 fala com quem está lendo | o 404 de página de aula trazia um parágrafo dirigido ao professor e um botão que levava o aluno para fora da área | corrigido: sobrou o caminho para Aulas | e2e |
| 25 | Quem não tem turma não fica em beco | login de `sem.matricula@example.test`; os seis destinos da barra devolvem para `/sem-turma` | corrigido: a tela virou cartão com Ativar acesso, Ajuda e Meus dados, e Ajuda abre de verdade | e2e; script |
| 26 | Nenhuma tela do aluno rola de lado no celular | 390 por 844 em `/acompanhamento`, `/materiais`, `/trabalhos` e `/inicio` | corrigido: a tabela de presença passou a rolar dentro do cartão, e as colunas da grade receberam largura mínima zero, que era o que empurrava a página | e2e; script |
| 27 | Âncora não fica atrás do cabeçalho grudado | alturas medidas no Chromium em 390, 768, 1023, 1024 e 1366, nas três molduras: aluno, aluno visto por professor ou monitor, e professor | corrigido por `--topo-grudado`, uma variável por faixa e por moldura. A primeira versão media só a moldura do aluno e errava nas outras duas: com a faixa "vendo como aluno" o cabeçalho vai a 168px contra margem de 125, e na faixa de 768px o professor tem 140px contra 124. A verificação adversarial pegou as duas, e a medição confirmou | medição; e2e cobre as quatro larguras nas duas molduras |
| 28 | A aba do navegador diz onde se está | as nove telas de `/professor/turmas/[id]` abriam com o título genérico da plataforma | corrigido por `generateMetadata` no layout da turma | e2e |
| 29 | Bases e gabaritos conta o que promete | a consulta pegava toda entrega da turma e rotulava como trabalho final, repetindo o código da turma | corrigido: filtro por `trabalho-final`, um cartão por turma; material com url voltou a ser clicável | e2e compara o número de cartões com o de turmas e com o de entregas |
| 30 | Regra editorial fora do baralho | varredura de hífen e travessão em `src/app`, `src/components` e `src/lib`, e nos títulos importados | corrigido em quatro rótulos React e no título de c6p18, reimportado com `--republish`; a regra virou script e contrato de teste | `npm run lint:tracos`; `tests/lint-tracos-cascas.test.ts` |
| 31 | O retorno da ação se distingue | pedido de revisão de presença mostrava sucesso e falha na mesma linha cinza; quem redefinia a senha chegava a Entrar sem confirmação | corrigido com os blocos de sucesso e de erro já usados no resto da plataforma | script |
| 32 | A porta de entrada tem moldura completa | telas de primeiro acesso não tinham rodapé, e `(publico)` e `(auth)` não tinham limite de erro | corrigido: rodapé com a política de privacidade e um `error.tsx` por grupo | script |
| 33 | A confirmação de senha vale alguma coisa | reprodução no navegador em `/perfil`, com senha atual propositalmente errada para a API recusar e nada mudar | defeito confirmado ao vivo: o aviso "As senhas não coincidem" aparecia e o formulário enviava assim mesmo a senha do primeiro campo, porque ele é `noValidate`. Corrigido no `JsonForm`, que agora compara os dois campos e não chega a chamar a API; com as duas iguais o envio acontece como antes | reprodução antes e depois; e2e conta as chamadas à API |
| 34 | Link de recuperação inválido tem próximo passo | `/senha/redefinir` sem token | a tela dizia só que o link era inválido; agora oferece pedir um link novo e entrar | e2e |
| 35 | O monitor alcança o que a moldura promete | login como `monitor@example.test`, 27 sessões listadas, abertura de uma delas, e as páginas de capítulo e da Aula 2 | defeito confirmado ao vivo: clicar numa sessão devolvia o monitor a Início em silêncio, porque a rota mandava todo papel de equipe para a área do professor, que exige staff global; e as duas páginas ofereciam a ele editar conteúdo e conduzir a aula. Corrigido: só staff global é levado à condução, e os dois atalhos passaram a depender de staff global. O professor continua indo para a condução e mantendo os atalhos | reprodução antes e depois nos três papéis; e2e |

Limitação declarada: as duas edições em rascunho criadas pelo teste de aceitação ainda carregam o título antigo de c6p18, porque a importação atua sobre uma edição por vez. A edição ativa e o fonte estão corrigidos.

## 2. Verificações automatizadas executadas em 21/09/2026

| Verificação | Comando | Resultado |
|---|---|---|
| Tipos | `npm run typecheck` | sem erro |
| Lint | `npm run lint` | 0 erros, 5 avisos preexistentes (não tocados) |
| Unidade e contrato da compilação | `npm test` | 249 testes em 26 arquivos, todos passam |
| Aceitação da Aula 2 | `npx playwright test -g "aula em slides"` | passa (8,7 s) |
| Aceitação completa | `npx playwright test` | 20 de 20 em 2,2 min (21/09/2026) |
| QA do baralho completo | `node qa.mjs --estados` em 1366x768, 1920x1080, 1024x768, 390x844 (três rodadas de cliques por slide, medindo fórmulas, estouro, corte, transbordo, rolagem e zoom após cada rodada) | 50 de 50 em cada uma; antes das correções da segunda rodada, 24 slides falhavam em 1366 e 1920 e 8 em 1024 e 390 |
| QA da variante do aluno | `node qa.mjs --aluno --estados` (1366) e `--aluno --largura 390x844` | 50 de 50 |
| Hífen e travessão no texto | `node lint-tracos.mjs` | 0 ocorrências |
| Acessibilidade | axe-core 4.11, oito slides em modo aluno (01, 09, 12, 20, 30, 42, 46, 49) | antes: `dlitem`, `svg-img-alt`, `color-contrast` (sérias) em quatro slides; depois: nenhuma violação |
| Console | 50 slides sincronizados na tela do aluno | 0 erros do baralho; ver a seção 3 sobre o aviso de hidratação |
| Guias em PDF | `node aula_credito_html/material.mjs` (terceira rodada, 21/09/2026) | nas duas edições: 0 traços no texto, 0 fórmulas com erro, 0 imagens ausentes, 0 erros de página, os 50 slides localizados no mapa, paginação estável entre as duas passagens; páginas conferidas visualmente a partir de renderizações do PDF |
| Contrato do conteúdo dos guias | `npx vitest run tests/aula-2-material.test.ts` | 3 testes: 50 slides cobertos, exercícios nos slides 01, 04, 20, 30, 42, 49 e 50, blocos contíguos, ritmo de 165 minutos, nenhum traço no texto |
| Sequência do curso com a Aula 2 (quarta rodada) | `npx vitest run tests/aula-2-plataforma.test.ts` | 4 testes: ordem capítulos 1, 2, 3, Aula 2, 4, 5, 7, 11; vizinhos; unidade vazia fora da Aula 2 excluída |
| Aceitação da moldura (quarta rodada) | `npx playwright test -g "moldura da plataforma"` | passa; `npm test` com 256 testes; typecheck e lint (0 erros) repetidos |
| Uniformidade das molduras (quinta rodada) | `npx playwright test -g "uniformidade das molduras"` | passa: retorno em toda rota de detalhe, um h1 por rota, 404 dentro da moldura, saída para quem não tem turma, título de aba por turma, cartões de Bases por turma, âncora abaixo do cabeçalho, nenhuma rolagem lateral em 390px |
| Regra editorial nas cascas (quinta rodada) | `npm run lint:tracos` e `npx vitest run tests/lint-tracos-cascas.test.ts` | 0 ocorrências; o contrato distingue pontuação de prosa da marca de ausência de valor |
| Script de checagens da quinta rodada | script de navegador com 33 verificações, dois papéis e três larguras | todas passam |
| QA do baralho depois da barra com o link Aulas (quarta rodada) | `node qa.mjs --estados` em 1366x768, 1920x1080, 1024x768 e 390x844; `--aluno --estados`; `node lint-tracos.mjs` | 50 de 50 em cada uma, com as três rodadas de estados; 0 traços; relatórios em `aula_credito_html/qa/relatorio-*.json` |

## 3. Limitações do que foi verificado

- Navegador único: Chromium headless. Firefox, Safari, tablets e o projetor real não foram verificados.
- Tela cheia: `requestFullscreen` a partir do iframe devolveu sucesso no headless; a política em janela aberta por script varia por navegador e precisa de conferência na sala.
- Aviso de hidratação no painel do professor: apareceu apenas quando o script tirava uma captura de página inteira durante a hidratação; a diferença apontada foi um estilo `caret-color` que o próprio Playwright injeta para a captura. Sem captura, o painel carregou sem aviso (duas execuções). Não é defeito do produto, mas fica registrado.
- Rede: a emulação "offline" do navegador não derruba a conexão SSE já aberta; por isso a queda do aluno foi simulada abortando as rotas de eventos e de estado, o que reproduz o que a casca vê numa queda real, não a queda em si.
- Tempos medidos em servidor `dev` na mesma máquina: úteis para comparação, não como referência de produção.
- Estados combinados: a varredura clica todos os botões de um slide três vezes, o que produz combinações que uma aula dificilmente produz (desafio aberto junto com toda a solução e a comparação). Nesses estados 19 slides cabem só reduzidos entre 82% e 99% pela rede de segurança do motor; nenhum fica abaixo de 80% nem é cortado. A lista está em R7 do plano.
- Nenhuma validação com usuários. As jornadas demonstram que os caminhos funcionam e que as informações necessárias estão na tela; não demonstram que professor e alunos as compreendem sem instrução. Isso exige a aula real (R3 e R4 do plano).

## 4. Pendências

| Pendência | Situação |
|---|---|
| Firefox, Safari, tablet, projetor, tela cheia | não verificado; roteiro desta seção pronto para repetir |
| Validação com o professor e alunos | não realizada |
| R1 e R2 do plano | abertas |
