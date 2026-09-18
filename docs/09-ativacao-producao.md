# Ativação de homologação e produção: o que falta exatamente

Nada foi implantado fora do ambiente local nesta sessão: não há URL de homologação nem de produção. Nenhum serviço pago foi contratado e nenhum e-mail real foi enviado. A lista abaixo é o que precisa existir para ativar.

## 1. Infraestrutura

1. Banco PostgreSQL 16 (Supabase, Neon ou servidor próprio) com `DATABASE_URL`. Em provedor gerenciado, use a string do pooler em modo sessão com `?sslmode=require`; para verificação completa da cadeia TLS, cole o certificado raiz do provedor em `DATABASE_SSL_CA`. `DATABASE_SSL=no-verify` cifra sem verificar e serve apenas para homologação.
2. Hospedagem Node 22 (Vercel, Railway, Fly, VPS) na mesma região do banco: com o banco em São Paulo, as funções da Vercel ficam em `gru1` (`vercel.json`); em `iad1` cada consulta custava 120 a 140 ms e páginas autenticadas passavam de três segundos. Definir `APP_URL` (https), `APP_SECRET` (32 bytes aleatórios), `NODE_ENV=production`.
3. Armazenamento: `STORAGE_DRIVER=s3` com `S3_ENDPOINT`, `S3_REGION`, `S3_BUCKET`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY` (bucket privado), ou `local` em VPS com disco persistente e backup. Para as bases do trabalho final (15 arquivos de 60 a 120 MB, 1,5 GB no total) o Supabase Storage gratuito não serve (1 GB no total, 50 MB por arquivo); o Cloudflare R2 serve (10 GB gratuitos, sem custo de saída, compatível com S3): `S3_ENDPOINT=https://<account_id>.r2.cloudflarestorage.com`, `S3_REGION=auto`, token de API com permissão Object Read & Write restrito ao bucket. Downloads saem por URL assinada de 5 minutos, sem passar pela função.
4. Domínio e TLS.
5. Banco inicial. Na Vercel, basta definir `BOOTSTRAP_ON_BUILD=1`, `SEED_PROFESSOR_EMAIL` e `SEED_PROFESSOR_PASSWORD` (temporária; a troca é exigida no primeiro acesso): o script `scripts/vercel-build.sh` aplica as migrações, cria curso, edição, turma e a conta do professor sem contas de teste, e importa o conteúdo antes de compilar. As três etapas são idempotentes, então a variável pode ficar ligada para que futuras migrações sejam aplicadas a cada deploy; remova `SEED_PROFESSOR_PASSWORD` após o primeiro acesso. Fora da Vercel, o equivalente manual é `npm run db:migrate`, `NODE_ENV=production SEED_TEST_ACCOUNTS=0 npm run db:seed` e `npm run content:import`. Não defina `NODE_ENV` manualmente na Vercel: isso impede a instalação das dependências de build.

## 2. Gmail do professor

O cliente OAuth pede três escopos: `gmail.send` (envio), `openid` e `email` (só para identificar a conta conectada; o perfil do Gmail exige escopos de leitura, que não são pedidos). Publicar o app na tela de permissão OAuth exige nome, e-mail de suporte, página inicial pública (`/entrar`) e política de privacidade pública (`/politica-de-privacidade`). A Gmail API precisa estar ativada no projeto (APIs e serviços → Biblioteca).

1. No Google Cloud Console, criar um projeto, ativar a Gmail API e criar credenciais OAuth 2.0 do tipo "aplicativo da Web" com URI de redirecionamento `${APP_URL}/api/professor/gmail/callback`.
2. Tela de consentimento: tipo externo; escopo `https://www.googleapis.com/auth/gmail.send`. Enquanto o app estiver em modo de teste, apenas contas listadas como usuários de teste podem autorizar e o refresh token tem vida limitada (documentação Google lida em 16/09/2026); para uso contínuo é necessário publicar e passar pela verificação de escopo sensível.
3. Definir `EMAIL_PROVIDER=gmail`, `GOOGLE_OAUTH_CLIENT_ID`, `GOOGLE_OAUTH_CLIENT_SECRET`, `EMAIL_FROM_NAME`.
4. Em E-mail, "Conectar meu Gmail" com a conta do professor e "Enviar teste" para o próprio e-mail. Só depois enviar convites.
5. Limites: contas Workspace pagas enviam até 2.000 mensagens por dia; a fila respeita isso naturalmente (turmas de até 100 alunos).

## 3. Verificações em homologação (não comprováveis localmente)

- Convite real a uma conta de teste autorizada pelo professor e ativação pelo link público.
- Recuperação de senha pelo link público.
- Upload e download com o armazenamento escolhido (URL assinada).
- Sessão ao vivo com SSE atrás do proxy do provedor (se a plataforma limitar a duração, a atualização periódica assume).
- Domínio, TLS e cookies `secure`.

## 4. Evoluções recomendadas antes da primeira turma

- Autenticação adicional (TOTP) para a conta do professor.
- Rota administrativa agendada para limpeza de uploads pendentes e processamento da fila de e-mail (hoje a fila é processada ao enviar convites e pelo botão "Processar fila").
- Fluxo de troca de e-mail do aluno pelo painel (hoje por script, preservando o histórico).
