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
- Fila de e-mail: a tela E-mail mostra falhas; Início mostra a contagem de mensagens com falha.
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
# 2) registro: pelo botão "Registrar pacote" em Bases e gabaritos ou, com DATABASE_URL, pelo script
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

Cada capítulo abre com um infográfico gerado de `content/infograficos/cNN.json` (`python3 scripts/apostila/infograficos.py`), que também alimenta os slides FGV de abertura (`scripts/apostila/slides/README.md`). A versão do aluno pode ser publicada como material comum; a versão do professor só como material com finalidade `labels` (só o professor baixa) e nunca no repositório, que é público. Regenerar sempre que o conteúdo for reimportado.


## 7.2. Visuais nativos das páginas (peças de assinatura)

Alguns visuais herdados (iframe do motor original) foram substituídos por componentes nativos, animados e responsivos, em `src/components/visuais/`. O registro em `src/components/visuais/registro.tsx` mapeia o slug da página para o componente; quando existe, o bloco `legacy` da página é trocado pelo visual nativo em aula, apresentação e aula ao vivo, sem alterar o banco.

- Capítulo 1, `c1p5`: "Cem vidas em doze meses" (`cem-vidas.tsx`). Simulação com risco mensal constante; sem dados externos.
- Capítulo 3, `c3p7`: "A linha do tempo do cliente" (`linha-do-tempo.tsx`) e `c3p11`: "A base amadurece" (`safras.tsx`). Regras em `src/lib/visuais/tempo.ts` (disponibilidade contra evento; maturação com horizonte 12 e apuração 1, que reproduz a partição da base: fora do tempo até dez 2023). Entram no lugar da figura estática (`substitui: "figura"`), preservando o texto ao redor.
- Capítulo 4, `c4p2`: "A reta que quebra" (`reta-que-quebra.tsx`, figura), `c4p9`: "Três escalas, um ponto" (`tres-escalas.tsx`) e `c4p19`: "A fronteira nasce" (`fronteira.tsx`). Regressão logística em `src/lib/visuais/logistica.ts` sobre as 16 propostas didáticas (`did.json`), conferida contra o gerador: descida com passo 0,1 chega a β = (−5,6666; 0,7453; 1,3955) em 20.000 iterações, #11 dá PD 56,18%, corte de 50% recusa 8 com 6 defaults evitados, mínimos quadrados negativos abaixo de 12,8% de utilização.
- Capítulo 7, `c7p6`: "A fila de risco" (`fila-de-risco.tsx`).
- Capítulo 8, `c8p8`: "A curva de lucro" (`curva-de-lucro.tsx`). Motor econômico em `src/lib/visuais/economia.ts` (parâmetros de c8p5 e c8p6, choque em log odds de c8p11), conferido contra o gerador: corte de 10% com 469 aprovados e R$ 585 mil, máximo em 14% com R$ 608 mil, realizado de R$ 378 mil na janela. Palpites da turma digitados pelo professor viram marcas na curva. Usa `src/lib/visuais/oot-logistica.json`, gerado por `node scripts/content/visuais-dados.mjs` a partir de `content/generated/dados.json` (737 propostas fora do tempo e PD da logística).

Os cálculos ficam em `src/lib/visuais/metricas.ts` (funções puras) e são conferidos contra o gerador em `tests/visuais.test.ts` (AUC 0,7257, KS 0,3621 em PD 9,74%, corte de 12% com 48 de 81 e 164 de 656). No slide (modo apresentação), a seção "Palco" de `globals.css` dá a cada peça alturas em `cqh` (fração da altura do slide), esconde painéis secundários e o componente `AjusteAoPalco` aplica um zoom entre 0,6 e 1 se ainda assim a peça não couber; o script `tmp/ux/medir-slides.mjs` (local) mede sobra e zoom em 1400×900 e 1920×1080. Regras das peças: botão de reproduzir e controle único, cores por papel (default em `--color-alert`, pagou em azul claro, corte em `--color-gold`), números tabulares, respeito a `prefers-reduced-motion`, layout por container query e variante compacta dentro do slide (`.slide-inner .vz`).

## 8. Procedimento antes de cada aula

1. Backup.
2. Confirmar data do encontro, link de videoconferência e material publicado.
3. Criar a sessão ao vivo em rascunho e revisar as questões a publicar.
4. Testar a chamada com a própria conta de teste.
