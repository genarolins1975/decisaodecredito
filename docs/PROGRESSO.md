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
