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

## Pendências técnicas ordenadas

0. Aula 2: R1 a R6 de `docs/PLANO_MELHORIAS.md` (aviso de turma sem encontros, perguntas para slides sem página ligada, verificação em Firefox, Safari e projetor, validação com usuários).

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
