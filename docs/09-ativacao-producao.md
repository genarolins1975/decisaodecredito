# Ativação de homologação e produção: o que falta exatamente

Nada foi implantado fora do ambiente local nesta sessão: não há URL de homologação nem de produção. Nenhum serviço pago foi contratado e nenhum e-mail real foi enviado. A lista abaixo é o que precisa existir para ativar.

## 1. Infraestrutura

1. Banco PostgreSQL 16 (Supabase, Neon ou servidor próprio) com `DATABASE_URL`.
2. Hospedagem Node 22 (Vercel, Railway, Fly, VPS). Definir `APP_URL` (https), `APP_SECRET` (32 bytes aleatórios), `NODE_ENV=production`.
3. Armazenamento: `STORAGE_DRIVER=s3` com `S3_ENDPOINT`, `S3_REGION`, `S3_BUCKET`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY` (bucket privado), ou `local` em VPS com disco persistente e backup.
4. Domínio e TLS.
5. Executar `npm run db:migrate`, `npm run db:seed` com `SEED_TEST_ACCOUNTS=0` e `SEED_PROFESSOR_EMAIL` definido (o professor define a senha por "Esqueci minha senha" após conectar o Gmail, ou por `SEED_PROFESSOR_PASSWORD` temporária trocada no primeiro acesso), e `npm run content:import`.

## 2. Gmail do professor

1. No Google Cloud Console, criar um projeto, ativar a Gmail API e criar credenciais OAuth 2.0 do tipo "aplicativo da Web" com URI de redirecionamento `${APP_URL}/api/professor/gmail/callback`.
2. Tela de consentimento: tipo externo; escopo `https://www.googleapis.com/auth/gmail.send`. Enquanto o app estiver em modo de teste, apenas contas listadas como usuários de teste podem autorizar e o refresh token tem vida limitada (documentação Google lida em 16/09/2026); para uso contínuo é necessário publicar e passar pela verificação de escopo sensível.
3. Definir `EMAIL_PROVIDER=gmail`, `GOOGLE_OAUTH_CLIENT_ID`, `GOOGLE_OAUTH_CLIENT_SECRET`, `EMAIL_FROM_NAME`.
4. Em Configurações, "Conectar meu Gmail" com a conta do professor e "Enviar teste" para o próprio e-mail. Só depois enviar convites.
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
