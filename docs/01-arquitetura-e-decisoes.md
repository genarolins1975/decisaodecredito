# Arquitetura, decisões e dimensionamento

Data de referência: 16 de setembro de 2026. Todos os preços e limites citados foram lidos nas páginas públicas indicadas nessa data e devem ser reconferidos antes de contratar.

## 1. Diagnóstico inicial

Evidência. O repositório `genarolins1975/decisaodecredito` estava vazio (sem commits, sem stack prévia). O único material de conteúdo foi `apresentacao-curso-pd.html` (1,44 MB): corpo HTML vazio, 58 KB de CSS e 1,36 MB de JavaScript com o objeto de dados `DADOS`, a base didática `DID`, os 180 slides definidos por código e três revisões internas (v6, v10, v13) que sobrescrevem páginas anteriores em tempo de execução. Não havia bases, notebooks, templates, manifesto, roteiro de testes nem PDFs.

Inferência. Extrair apenas o HTML estático ou as primeiras definições não reproduziria o curso. A extração precisou executar o arquivo em navegador e ler o estado final. O inventário completo está em `docs/02-inventario-e-mapa-de-cobertura.md`.

## 2. Benchmark sucinto (documentação pública)

| Referência | O que foi aproveitado | Fonte e data |
|---|---|---|
| Moodle 5.0, atividade Presença | Estados presente, ausente, atrasado e justificado; autorregistro do aluno por senha de sessão ou QR; exportação por sessão e aluno | docs.moodle.org/500/en/Attendance_activity, lida em 16/09/2026 |
| Moodle 5.0, Quiz e Quiz settings | Janelas de abertura e fechamento, limite de tempo com tolerância de envio, tentativas, comportamento de feedback (imediato ou diferido) e fases de revisão; exceções por usuário e grupo | docs.moodle.org/500/en/Quiz_activity e /Quiz_settings, lidas em 16/09/2026 |
| Gmail API, envio | Escopo de envio `gmail.send`, endpoint `users.messages.send`, mensagem RFC 2822 em base64url | developers.google.com/gmail/api/guides/sending, lida em 16/09/2026 |
| Limites de envio Gmail (Workspace) | 2.000 mensagens por dia por conta paga; 500 em contas de teste; janela móvel de 24 h; limites de contas gmail.com gratuitas não constam na página | knowledge.workspace.google.com, "Gmail sending limits in Google Workspace", lida em 16/09/2026 |
| Verificação de app OAuth Google | Em modo de teste o app só atende usuários de teste listados e o refresh token tem vida limitada; escopos sensíveis como `gmail.send` exigem verificação para publicação | developers.google.com/identity/protocols/oauth2/production-readiness/brand-verification, lida em 16/09/2026 |
| WCAG 2.2 | Recomendação W3C de 12/12/2024; princípios perceptível, operável, compreensível e robusto usados como referência da revisão de acessibilidade | w3.org/TR/WCAG22, lida em 16/09/2026 |
| Canvas e Open edX | As páginas públicas de guia de quizzes (Canvas) e de avaliação (Open edX) não puderam ser lidas nesta sessão (redirecionamentos e 404). Nenhuma afirmação sobre esses produtos é feita neste documento. | tentativa em 16/09/2026 |

Decisões derivadas: presença com estados configuráveis e evidência separada da decisão; questões com fluxo rascunho → aberta → encerrada → liberada, tempo, tentativas e rodadas; exceções de prazo por aluno e grupo; envio por Gmail com escopo mínimo e fila; contraste, foco, teclado e alvos de toque verificados em capturas.

## 3. Stack escolhida

| Camada | Escolha | Motivo |
|---|---|---|
| Aplicação | Next.js 16.3 (App Router) + React 19 + TypeScript 5.9 | Uma aplicação modular, renderização no servidor, rotas de API no mesmo código, sem microserviços |
| Banco | PostgreSQL 16 com Drizzle ORM 0.45 e migrações SQL versionadas (`drizzle/`) | Relacional, transações, constraints explícitas, portável entre provedores |
| Autenticação | Própria: argon2id (`@node-rs/argon2`), sessões em banco com cookie httpOnly, credencial temporária de uso único, revogação | Necessidade de troca obrigatória de senha validada no servidor, convite vinculado à matrícula e revogação imediata; provedores gerenciados avaliados não oferecem esse fluxo exato sem camada própria (ver 3.1) |
| Armazenamento | Adaptador local (disco) e S3 compatível (Supabase Storage, R2, MinIO) | Arquivos privados com download autorizado; URL assinada quando o provedor suporta |
| E-mail | Gmail API por OAuth 2.0 (escopo `gmail.send`), fila em banco com tentativas e backoff; modo `outbox` sem envio para desenvolvimento e homologação | Exigência de remetente do professor; nada é enviado por outro serviço |
| Tempo real | Server-Sent Events com o banco como fonte de verdade e atualização periódica como alternativa | Sem serviço externo; reconexão recupera o estado completo versionado |
| Fórmulas | KaTeX no servidor, com MathML | Acessível, sem script de terceiros na origem autenticada |
| Testes | Vitest (unidade e reconciliação numérica) e Playwright (aceitação e varredura visual) | |

### 3.1. Por que não Supabase Auth ou Auth.js como autenticação

Supabase Auth oferece convite por e-mail com link mágico e define senha na sessão criada, mas o e-mail sai pelo remetente do Supabase ou por SMTP customizado, não pela Gmail API autorizada pelo professor; a troca obrigatória de senha e a invalidação de convite anterior teriam de ser reimplementadas por cima. Auth.js não gerencia senhas nem convites. A implementação própria concentra 400 linhas auditáveis (`src/lib/auth`, `src/lib/services/auth.ts`) com: hash argon2id (19 MiB, t=2), tokens de 32 bytes armazenados apenas como SHA-256, sessões com expiração absoluta de 30 dias e ociosidade de 7 dias, limitação de tentativas por IP e e-mail, respostas que não revelam cadastro e trilha de auditoria. Autenticação adicional para administradores (TOTP) não foi implementada; está listada como evolução em `docs/09-ativacao-producao.md`.

## 4. Modelo de dados

Curso → edição (ano letivo explícito) → turma (código único na edição) → matrícula (e-mail autorizado, estado, papel). Conteúdo pertence à edição: unidades → capítulos → páginas → versões (blocos públicos e guia privado). Questões versionadas com gabarito em coluna separada, nunca serializada para alunos. Encontros → sessões ao vivo → atividades → tentativas (idempotentes por `client_request_id`). Janelas de chamada → evidências de check-in → registro de frequência (decisão) → histórico. Grupos com histórico de entrada e saída. Trabalhos → etapas (missões) → submissões versionadas com composição congelada e recibo → notas com rubrica versionada e histórico → publicação. Teste cego: congelamentos (manifesto e hashes), arquivos OOT e rótulos (só professor), submissões limitadas. Arquivos, notificações, avisos, fila de e-mail, conexão Gmail cifrada e auditoria. O esquema completo está em `src/lib/db/schema.ts` (43 tabelas).

## 5. Permissões

Toda rota e página verifica no servidor: sessão válida, senha definida, papel global (staff) e matrícula ativa na turma (`requireClassAccess`). Ocultar botões não é controle de acesso. Downloads passam por `/api/arquivos/[id]` com regras por finalidade (submissão, devolutiva, base, OOT, rótulos). O canal SSE revalida a matrícula a cada 15 s e encerra o fluxo quando revogada. O visual legado roda em iframe `sandbox="allow-scripts"` com CSP restrita, origem opaca e sem cookies; seus recursos são servidos com token assinado de 15 minutos.

## 6. Hospedagem sugerida e custos estimados

Pressupostos: uma turma de até 100 alunos simultâneos (hipótese de dimensionamento, não dado confirmado), 4 encontros de 180 minutos, arquivos de entrega de até 50 MB por arquivo, bases de até 500 MB.

| Opção | Componentes | Custo mensal estimado | Fonte lida em 16/09/2026 |
|---|---|---|---|
| A. Baixo custo | Vercel Hobby (US$ 0) + Neon Free (0,5 GB, 100 CU-h) + Supabase Storage Free (1 GB) | US$ 0, insuficiente para arquivos de entrega (1 GB) e sem garantias | vercel.com/pricing; neon.com/pricing; supabase.com/pricing |
| B. Recomendada | Vercel Pro (US$ 20) + Supabase Pro (US$ 25: 8 GB de banco e 100 GB de arquivos) | ≈ US$ 45 por mês mais excedentes; Vercel Pro inclui crédito de US$ 20 | idem |
| C. Servidor único | VPS com Node, PostgreSQL e disco local (o adaptador local já funciona) | tipicamente US$ 10 a 30 por mês; exige administração própria e backup por script | não verificado em página pública nesta sessão |

Ambientes: desenvolvimento (local, `EMAIL_PROVIDER=outbox`), homologação (mesma stack, banco separado, Gmail de teste do professor) e produção. Nunca reutilizar o banco entre ambientes.

## 7. Limites conhecidos e recuperação de falhas

- SSE em plataformas serverless tem duração máxima por função; a alternativa periódica (5 s) cobre a sessão ao vivo se o canal cair. Em VPS não há esse limite.
- O envio de e-mail depende da conexão Gmail; se expirar, a fila retém as mensagens e o painel mostra o erro e o botão de reconexão. Alunos já ativados não são afetados.
- Uploads gravam primeiro no armazenamento e só então marcam o registro como completo; falha parcial deixa o arquivo como pendente, nunca como entrega.
- Backup: `scripts/backup.sh` (pg_dump custom + tar dos arquivos) e `scripts/restore.sh`; ensaio documentado em `docs/06-operacao.md`.
- Rollback: cada versão de conteúdo é imutável; publicar uma versão anterior é uma ação do painel. Para a aplicação, reimplantar a tag anterior; as migrações são aditivas.
