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
