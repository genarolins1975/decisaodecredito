# Operação: execução, backup, restauração, atualização, rollback, observabilidade e custos

## 1. Executar

```bash
cp .env.example .env            # ajuste DATABASE_URL, APP_SECRET, APP_URL
npm ci
npm run db:migrate              # aplica drizzle/*.sql
npm run db:seed                 # curso, edição 2026, turma 2026-A, professor (senha inicial só em desenvolvimento)
node scripts/content/extract.mjs && node scripts/content/build-legacy.mjs && npm run content:import
npm run dev                     # http://localhost:3000
npm run build && npm start      # produção
```

Contas de teste do seed (apenas fora de produção): professor `genaro.lins@gmail.com` / `professor-dev-2026`; aluno.a, aluno.b, monitor, sem.matricula e aluno.outra em `@example.test`.

Variáveis: ver `.env.example`. `APP_SECRET` cifra tokens OAuth e assina URLs curtas; trocá-la invalida a conexão Gmail (reconectar) e nada mais.

## 2. Backup

```bash
DATABASE_URL=... STORAGE_LOCAL_DIR=./storage scripts/backup.sh backups/
```

Gera `db-<data>.dump` (pg_dump formato custom), `files-<data>.tar.gz` (armazenamento local) e `manifest-<data>.sha256`. Com S3, use o versionamento e a replicação do provedor para os arquivos. Frequência sugerida: diário automático e imediatamente antes de cada aula e de cada publicação de notas. Guarde cópias fora do servidor.

## 3. Restauração (ensaio obrigatório em ambiente isolado)

```bash
createdb curso_restauracao
RESTORE_DATABASE_URL=postgres://.../curso_restauracao scripts/restore.sh backups/db-<data>.dump backups/files-<data>.tar.gz
```

Ensaio executado em 16/09/2026 nesta sessão: ver `docs/07-relatorio-de-testes.md`, seção "Backup e restauração". Verifique após restaurar: contagem de páginas (180), usuários, matrículas e último `audit_log`.

## 4. Atualização e rollback

- Atualização: `git pull`, `npm ci`, `npm run db:migrate`, `npm run build`, reiniciar. Migrações são aditivas; nunca edite uma migração aplicada.
- Rollback de aplicação: reimplantar a tag anterior. Como as migrações são aditivas, a versão anterior continua funcionando com o esquema novo.
- Rollback de conteúdo: Conteúdo → página → Versões → "publicar esta" na versão anterior.
- Rollback de dados: restaurar backup em banco novo e apontar a aplicação para ele (janela de manutenção).

## 5. Observabilidade e alertas

- `GET /api/health` responde `{ok:true}` com banco acessível: use em monitor externo (ex.: verificação a cada minuto).
- Fila de e-mail: Configurações mostra falhas; o painel inicial mostra contagem de mensagens com falha.
- Trilha de auditoria: tabela `audit_log` (ações de autenticação, matrícula, sessão, frequência, notas, arquivos). Alunos não podem apagar eventos.
- Logs da aplicação: erros internos vão para stderr com prefixo `[api]`; não registram senhas, tokens nem conteúdo acadêmico.
- Limpeza: `cleanupOrphans()` em `src/lib/services/files.ts` marca uploads pendentes com mais de 24 h; agende uma chamada diária (rota administrativa a criar) ou execute por script.

## 6. Custos de operação

Ver `docs/01-arquitetura-e-decisoes.md`, seção 6: opção recomendada ≈ US$ 45 por mês (Vercel Pro + Supabase Pro), preços lidos em 16/09/2026. Nenhum serviço pago foi contratado nesta sessão.

## 7. Procedimento antes de cada aula

1. Backup.
2. Confirmar data do encontro, link de videoconferência e material publicado.
3. Criar a sessão ao vivo em rascunho e revisar as questões a publicar.
4. Testar a chamada com a própria conta de teste.
