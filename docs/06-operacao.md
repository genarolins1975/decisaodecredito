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

## 7. Publicar as bases do trabalho final

As bases, os gabaritos e o gerador ficam fora do repositório (ele é público). O pacote vai ao bucket privado sem passar pela Vercel (limite de 4,5 MB por requisição) e é registrado no catálogo em duas etapas separáveis, para que a máquina que gera o pacote não precise da senha do banco:

```bash
# 1) upload: só as variáveis do armazenamento (STORAGE_DRIVER=s3, S3_ENDPOINT, S3_REGION, S3_BUCKET, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY)
npx tsx --tsconfig scripts/tsconfig.json scripts/dados/publicar.ts /caminho/do/pacote --modo upload
# 2) registro: pelo botão "Registrar pacote" em Painel do professor → Bases e gabaritos ou, com DATABASE_URL, pelo script
npx tsx --tsconfig scripts/tsconfig.json scripts/dados/publicar.ts /caminho/do/pacote --modo registrar --edicao 2026
```

O diretório do pacote traz `manifesto.json` (versão, sha256 e tamanho de cada arquivo) e, por base: pacote do aluno (zip com desenvolvimento, dicionário e README), dicionário (csv), OOT sem desfecho (csv), rótulos do OOT (csv) e pacote do professor (zip com gabarito, verdades e métricas). Os objetos ficam em `bases/v<versao>/`. O registro confere existência e tamanho de cada objeto, grava `files` com chave estável e sha256 do manifesto, atualiza o catálogo (`datasets`: arquivo, dicionário, OOT, rótulos, gabarito, versão, status disponível), registra os materiais comuns (pacote do trabalho, publicado; gabaritos consolidados, só professor) e habilita o teste cego do trabalho final em cada turma da edição. Rótulos e gabaritos têm finalidade `labels`: só o professor baixa. Idempotente: registrar de novo atualiza no lugar; uma nova versão usa outro prefixo e o botão com a nova versão. Um manifesto só com materiais comuns (`bases: []`) atualiza apenas os materiais: o mesmo material em nova versão substitui o anterior no lugar (o título é comparado sem o sufixo de versão). Arquivos pequenos podem ser enviados pelo painel do R2 (pasta `bases/v<versao>/`), sem token.

## 7.1. Apostila em PDF (aluno e professor)

A apostila é gerada a partir de `content/generated/extract.json`, das capturas dos 180 visuais e de figuras conceituais, em duas versões: a do aluno (sem gabaritos nem notas privadas) e a do professor (com guia docente, gabaritos e erros previsíveis). Procedimento e dependências em `scripts/apostila/README.md`; resumo, com o servidor local no ar:

```bash
APOSTILA_DIR=tmp/apostila node scripts/apostila/captura-visuais.mjs      # capturas dos visuais (uma vez por versão do conteúdo)
python3 scripts/apostila/figuras.py                                        # figuras conceituais (matplotlib)
node scripts/apostila/gerar.mjs aluno todos --pdf && node scripts/apostila/gerar.mjs professor todos --pdf   # um PDF por capítulo e versão; "gerar.mjs aluno 4 --pdf" gera só o capítulo 4
```

A versão do aluno pode ser publicada como material comum; a versão do professor só como material com finalidade `labels` (só o professor baixa) e nunca no repositório, que é público. Regenerar sempre que o conteúdo for reimportado.

## 8. Procedimento antes de cada aula

1. Backup.
2. Confirmar data do encontro, link de videoconferência e material publicado.
3. Criar a sessão ao vivo em rascunho e revisar as questões a publicar.
4. Testar a chamada com a própria conta de teste.
