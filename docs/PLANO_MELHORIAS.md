# Plano de melhorias da Aula 2: mudanças, dependências, critérios de aceite e status

Data de referência: 21 de setembro de 2026. Branch `claude/new-session-d2yt8t`. Ordem de execução: primeiro os componentes compartilhados que resolviam causas recorrentes (compilação, motor do baralho, rota), depois as cascas do professor e do aluno, depois os refinamentos. Cada mudança foi verificada antes da seguinte.

## 1. Implementado nesta revisão

| Id | Mudança | Arquivos | Depende de | Critério de aceite | Status e evidência |
|---|---|---|---|---|---|
| M1 | Compilação com três saídas e marca de versão: baralho completo, variante sem notas (remoção por AST com conferência frase a frase), notas em JSON; `00-versao.js`; favicon vazio; índice com filtro | `aula_credito_html/build.mjs`, `app/dados/00-versao.js`, `app/nucleo/01-nucleo.js` | acorn (já presente nas dependências) | `node build.mjs` produz os três arquivos com a mesma versão; falha se alguma frase de nota sobreviver | feito; `tests/aula-2-build.test.ts` (5 testes) |
| M2 | Motor do baralho: modo `projecao`, `App.definirModo`, `sessionStorage` versionado por usuário, `limparEstados`, filtro do índice com `aria-modal` e fundo inerte, botão Professor oculto sem notas, `aria-current` no índice | `app/nucleo/90-app.js` | M1 | verificações em jsdom: 28 conferências; QA 50 de 50 nas quatro resoluções com estados | feito |
| M3 | Gráficos acessíveis: `role="img"` só com resumo, senão `aria-hidden` | `app/nucleo/02-svg.js` | nenhuma | axe sem `svg-img-alt` | feito |
| M4 | Semântica de listas e contraste: `dl.kv` em 9 slides, etapas ocultas sem opacidade (20, 24, 32), âmbar `#9A5209`, `.painel.pendente`, `dl` sem margem, alvos de 44 px em tela estreita | `app/estilo/aula.css`, `s09, s13, s18, s20, s24, s31, s32, s37, s45, s46, s47, s48` | nenhuma | axe sem `dlitem` e `color-contrast`; nenhum controle abaixo de 44 px em 390 px | feito |
| M5 | Slide 46: total avaliado vem da partição; slide 50: botão Reiniciar | `s46.js`, `s50.js` | nenhuma | com corte 1%, o painel mostra "21 de 3.000"; os 50 slides têm Reiniciar | feito; varredura de extremos |
| M6 | Rota serve o arquivo pelo papel | `src/app/slides/aula-2/route.ts` | M1 | aluno recebe a variante sem notas; professor e monitor recebem a completa; 403 sem turma; redirecionamento sem sessão | feito; e2e "aula em slides" |
| M7 | Projeção em modo `projecao` com reenvio do slide pendente | `src/components/live/projecao-slides.tsx`, `src/app/apresentacao/slides/page.tsx` | M2 | `src` do iframe contém `modo=projecao`; sem rede o aviso aparece e o slide é publicado ao voltar | feito; jornada R1 e R2 |
| M8 | Tela do aluno: iframe único, modo em tempo de execução, `estado=<usuário>`, aviso do que fica salvo, indicador de silêncio | `live-student.tsx`, `src/app/(app)/ao-vivo/[id]/page.tsx`, `src/lib/client/use-live.ts` | M2 | exploração preservada ao trocar de modo e ao recarregar; "Sem atualização há N s" após 40 s sem sinal | feito; e2e e verificação com canal abortado |
| M9 | Painel do professor: "Roteiro do slide no ar" com condução, respostas fechadas por padrão, cuidados, aprofundamento, transição, "Avançar para NN"; seletor com título projetado | `live-teacher.tsx`, `src/app/professor/aovivo/[id]/page.tsx`, `roteiro-aula-2.ts` (tipo `NotaSlideAula2`), `next.config.ts` (rastreio do JSON) | M1 | painel contém a frase de condução do slide no ar | feito; e2e |
| M10 | Descrição do material da Aula 2 corrigida e propagada a bancos já importados | `scripts/import-content.ts` | nenhuma | `content:import` atualiza a descrição sem duplicar o material | feito; conferido no banco local |
| M11 | QA da variante do aluno | `aula_credito_html/qa.mjs --aluno` | M1 | 50 de 50 | feito em 1366 (com estados) e 390 |
| M12 | Testes: e2e "aula em slides" ampliado (troca de modo, recarga, variante sem notas, painel, projeção); teste unitário do contrato de compilação | `e2e/aceitacao.spec.ts`, `tests/aula-2-build.test.ts` | M1 a M9 | passam | feito |
| M14 | Rede de segurança da projeção e QA por estados: `ajustarCorpo` no motor (zoom até caber, mínimo 0,6, `data-zoom`); `qa.mjs` com três rodadas de cliques por slide, sem "Reiniciar" nem navegação, cobrando `.katex-error`, estouro, corte, transbordo, rolagem e zoom abaixo de 80% após cada rodada; `--dump` para ler o estado | `app/nucleo/90-app.js`, `aula_credito_html/qa.mjs` | M1 | `node qa.mjs --estados` sem falha nas quatro resoluções e na variante do aluno | feito em 21/09/2026, segunda rodada |
| M15 | Estados que não cabiam e rótulos fora do desenho: `Mat.t` escapa `% # & _`; slide 24 (fórmula, ticks, alturas, rótulo em duas linhas); 13 (amostra sob as curvas); 30 (coluna de 700 px, opções compactas, desafio sob a árvore); 46 (tabela no lugar das curvas, selo curto); 47 (hipóteses e alternativa exclusivas e no lugar do painel de hipóteses); 49 (argumentos no lugar dos requisitos, escolha sob os controles); 02 (coluna com `min-width` e tabela apertada); miniatura da sigmoide (margens e ticks no domínio); `Graf.arvore` com caixas por nível; `Graf.barras` com rótulo em duas linhas; 14, 16, 25, 28, 42 e 44 | `app/nucleo/02-svg.js`, `04-comum.js`, `05-mat.js`, `app/slides/s02, s13, s14, s15, s16, s24, s25, s28, s30, s42, s44, s46, s47, s49` | M14 | idem M14; 0 fórmulas com erro | feito em 21/09/2026, segunda rodada |
| M13 | Documentação: estes quatro documentos, `README.md`, `docs/04`, `docs/05`, `docs/PROGRESSO.md`, `aula_credito_html/LEIA_PRIMEIRO.md`, `02_controle/RETOMADA.md` e `REVISAO_FINAL.md`; capturas `docs/capturas/aula2-*.png` | | | leitura | feito |

## 2. Recomendações futuras

Ordenadas por valor para a aula; nenhuma bloqueia o uso da Aula 2.

| Id | Recomendação | Motivo | Dependência | Critério de aceite | Esforço estimado |
|---|---|---|---|---|---|
| R1 | Aviso no cartão da turma quando não há encontros, com "Criar as quatro aulas" ali mesmo | turma nova não consegue iniciar a aula sem passar por Aulas ao vivo | nenhuma | professor com turma sem encontros vê o aviso em Início e cria em um clique | pequeno |
| R2 | Filtro por capítulo no seletor de páginas do painel, ou perguntas próprias da Aula 2 ligadas ao roteiro para os slides sem página | 20 dos 50 slides não têm página ligada; perguntar exige escolher entre 180 páginas | conteúdo: decidir quais perguntas pertencem à Aula 2 | em qualquer slide, uma pergunta é publicada em até três cliques | pequeno a médio |
| R3 | Verificação em Firefox, Safari, tablet e no projetor da sala, inclusive tela cheia a partir do iframe da projeção | só Chromium foi verificado | acesso ao equipamento | roteiro de `VALIDACAO_JORNADAS.md` repetido nesses ambientes | pequeno, mas fora do repositório |
| R4 | Validação com o professor e com alunos em uma aula real | nenhum teste com usuários foi feito | R3 | registro do que confundiu e do que faltou, por jornada | fora do repositório |
| R5 | Impressão da variante do aluno com uma folha de "como estudar" na abertura | o aluno pode imprimir 50 folhas sem contexto de estudo | decisão pedagógica | folha inicial revisada pelo professor | pequeno |
| R6 | Manter a regra "nenhum hífen ou travessão no texto exibido" também nas cascas React da sessão ao vivo, que hoje usam travessão em rótulos herdados | consistência editorial | nenhuma | `lint-tracos` estendido às cascas | pequeno |
| R7 | Redesenhar os estados combinados que ainda cabem só reduzidos (82% a 99%) nos slides 04, 13, 16, 17, 18, 22, 28, 30, 31, 32, 34, 35, 36, 37, 40, 42, 43, 48 e 49 | a rede de segurança reduz o corpo em vez de cortar, mas texto reduzido lê pior no projetor | decidir por slide se dois painéis podem ficar abertos juntos | `node qa.mjs --estados` sem "coube reduzido" | médio |

## 3. Como verificar

```bash
cd aula_credito_html
node build.mjs                                   # três saídas, versão, conferência das notas
node qa.mjs --estados                            # 1366x768; repetir com --largura 1920x1080, 1024x768, 390x844
node qa.mjs --aluno --estados                    # variante do aluno
node lint-tracos.mjs
cd ..
npm run typecheck && npm run lint && npm test    # inclui tests/aula-2-build.test.ts
npm run test:e2e                                 # exige servidor e banco; "aula em slides" cobre a Aula 2
```

Depois de qualquer alteração em `aula_credito_html/app/`, recompilar antes de testar: a plataforma e a QA leem as saídas, não os fontes.

## 4. Evolução do status

| Data | Situação |
|---|---|
| 21/09/2026 | M1 a M13 implementados e verificados no ambiente local; R1 a R6 abertas |
| 21/09/2026, segunda rodada | M14 e M15 a partir da captura do professor no slide 24; R7 aberta |
