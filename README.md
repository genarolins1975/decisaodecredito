# Laboratório de Decisão de Crédito · plataforma do curso

Plataforma acadêmica do curso de modelagem de risco de crédito do Prof. Genaro Dueire Lins (Mestrado Profissional, FGV): aulas em modo estudo e apresentação, sessão ao vivo com questões e presença, trabalhos com grupos, rubricas e teste cego, painel do professor sem código.

## Executar localmente

Requisitos: Node 22, PostgreSQL 16.

```bash
cp .env.example .env         # DATABASE_URL, APP_SECRET, APP_URL
npm ci
npm run db:migrate
npm run db:seed              # edição 2026, turma 2026-A, professor e contas de teste (fora de produção)
node scripts/content/extract.mjs        # renderiza o HTML original em Chromium e extrai o estado final
node scripts/content/build-legacy.mjs   # motor legado sem guia nem gabaritos + CSS escopado
npm run content:import                  # importa páginas, questões, rubricas, bases e trabalhos
node aula_credito_html/build.mjs        # Aula 2: baralho completo, variante do aluno sem notas e notas em JSON (content/slides/)
node aula_credito_html/material.mjs     # Aula 2: guias em PDF do professor e do aluno (content/materiais/), gerados do baralho compilado
npm run dev                             # http://localhost:3000
```

Testes: `npm test` (unidade e reconciliação numérica), `npm run test:e2e` (aceitação com Playwright, exige servidor e banco), `npm run lint:tracos` (hífen e travessão como pontuação de prosa no texto exibido pelas cascas React), `node scripts/content/sweep.mjs --shots` (varredura das 180 páginas), `node scripts/content/a11y.mjs` (axe-core), `node scripts/load-test.mjs 100` (carga).

## Documentação

| Documento | Conteúdo |
|---|---|
| `docs/00-briefing-original.md` | Pedido original |
| `docs/01-arquitetura-e-decisoes.md` | Diagnóstico, benchmark, stack, modelo de dados, permissões, hospedagem e custos |
| `docs/02-inventario-e-mapa-de-cobertura.md` | Inventário do material e mapa origem → destino das 180 páginas |
| `docs/03-auditoria-tecnica-e-didatica.md` | Reconciliação numérica, achados e revisão didática |
| `docs/04-manual-do-professor.md` | Operação do painel |
| `docs/05-guia-do-aluno.md` | Uso pelo aluno |
| `docs/06-operacao.md` | Backup, restauração, atualização, rollback, observabilidade, custos |
| `docs/07-relatorio-de-testes.md` | Testes executados, capturas, acessibilidade, carga, avaliação por tela |
| `docs/08-privacidade-e-retencao.md` | Minutas para revisão institucional |
| `docs/09-ativacao-producao.md` | Lista exata para ativar homologação e produção |
| `docs/AUDITORIA_ARQUITETURA.md` | Aula 2: arquitetura atual, jornadas do professor e do aluno, matriz por slide e achados priorizados |
| `docs/ARQUITETURA_PROPOSTA.md` | Aula 2: responsabilidades, fluxo de dados, estados, contratos e decisões |
| `docs/PLANO_MELHORIAS.md` | Aula 2: mudanças implementadas, critérios de aceite, recomendações e status |
| `docs/VALIDACAO_JORNADAS.md` | Aula 2: cenários executados, evidências, limitações e pendências |
| `docs/PROGRESSO.md` | Registro de progresso para continuar em outra sessão |

## Estrutura

`src/app` (rotas e páginas), `src/lib` (banco, autenticação, serviços, núcleo numérico), `src/components`, `scripts` (migração, importação, backup, carga), `content/original` (HTML preservado), `content/generated` (artefatos gerados), `drizzle` (migrações), `tests` e `e2e`.
