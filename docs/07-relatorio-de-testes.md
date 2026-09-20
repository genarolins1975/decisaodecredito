# Relatório de testes e avaliação visual

Ambiente: sessão de desenvolvimento local em 16/09/2026, Node 22.22, PostgreSQL 16.13, Chromium 141 (Playwright 1.56), servidor Next.js em modo `dev` com 4 vCPUs. Nenhum teste tocou ambiente de produção nem enviou e-mail real. Capturas em `docs/capturas/` (seleção) e `content/generated/shots/` (540 capturas da varredura, não versionadas por tamanho).

## 1. Testes automatizados executados

| Conjunto | Comando | Resultado |
|---|---|---|
| Unidade, reconciliação numérica, TLS, feedback em dois estágios e prerrequisitos, identidade Gmail, importação de listas, visuais nativos contra o gerador (regras temporais, motor econômico, regressão logística, árvore, boosting, monitoramento, perda e descida, política em três zonas, vazamento, avaliação fora do tempo, economia por proposta e política que fecha) compositor do deck, página do capítulo, infográficos e laboratório de regressão logística, escalas 1, 2 e 3, abertura em dois quadros, decomposição do escore, leitura do coeficiente, razão de odds, curva do impacto em PD, unidade do coeficiente, log loss, reta na probabilidade e uma iteração do gradiente (239 testes) | `npm test` | 239 passaram em 20/09/2026 |
| Aceitação por API e interface (18 testes: seção 13 do briefing, feedback em dois estágios, prerrequisitos, teste cego por base, registro do pacote, início da aula em um clique, visuais nativos com o laboratório de regressão logística, as escalas 1, 2 e 3, os dois quadros de abertura, a decomposição do escore, a leitura do coeficiente, a razão de odds, a curva do impacto em PD, a unidade do coeficiente, a log loss, a reta na probabilidade e a iteração do gradiente do capítulo 4, abertura do capítulo) | `npm run test:e2e` | 18 passaram em 19/09/2026 |
| Auditoria de layout da apresentação (180 páginas, tela a tela, seis critérios de 0 a 10; ver `docs/06-operacao.md`, 7.3) | `node scripts/palco/auditoria.mjs tmp/ux/auditoria-palco.json todas 1400x900` e `1920x1080` | 18/09/2026, antes do compositor (mesmo critério): média 8,88, 83 páginas abaixo de 9, 10 abaixo de 7, 55 telas rolando, pior página c4p14 com 5,3. Depois, em 1400×900: média 9,93, 176 páginas em 9,5 ou mais e 4 entre 9,0 e 9,4, nenhuma abaixo de 9, nenhuma tela abaixo de 8 nem rolando (270 telas). Em 1920×1080: média 9,91, 172 em 9,5 ou mais e 8 entre 9,0 e 9,4, nenhuma abaixo de 9 (263 telas). Pior página nos dois tamanhos: c2p10 com 9,3 |
| Varredura das 180 páginas em 3 modos (540 cargas) | `node scripts/content/sweep.mjs --shots` | 0 erros de console, 0 fórmulas cruas, 84/84 visuais legados carregados em cada modo; 3 estouros horizontais no celular corrigidos e reverificados |
| Acessibilidade axe-core (27 telas, regras WCAG 2.x A/AA e boas práticas) | `node scripts/content/a11y.mjs` | 24 telas sem violação; 3 violações moderadas restantes (ordem de títulos em conteúdo herdado com h4 após h2 em c3p7 e na sessão ao vivo; ver 4.3) |
| Carga com 100 alunos simultâneos | `node scripts/load-test.mjs 100` | 100/100 sucessos, 100 tentativas gravadas, 9,6 s no total |
| Backup e restauração | `scripts/backup.sh` e `scripts/restore.sh` em banco isolado | restaurado com 360 páginas (180 originais + 180 da edição duplicada no teste), usuários, matrículas, tentativas, arquivos e auditoria; manifesto sha256 conferido |

### 1.1. Cobertura dos cenários obrigatórios

| Cenário do briefing | Como foi demonstrado | Situação |
|---|---|---|
| Edição 2026 criada; professor cadastra 2027; duplicação não copia alunos nem registros e exige revisão de datas | e2e "edições": duplicação copia 180 páginas, zero turmas e matrículas, aviso de revisão | demonstrado |
| Só e-mails cadastrados ativam; importação identifica duplicidades; conta sem matrícula não acessa; revogação bloqueia sessões existentes | e2e "matrícula" e "isolamento" | demonstrado |
| Telefone e LinkedIn vazios permitem onboarding; preenchimento opcional, validado e privado | e2e "credencial temporária" | demonstrado |
| Gmail conectado envia convite real; credencial permite definir senha; expiração e reutilização recusadas; reenvio invalida anterior; aluno existente não recebe senha | credencial, expiração, reutilização, reenvio e aluno existente demonstrados por e2e com a fila; **envio real não demonstrado** (sem conta Gmail conectada) | parcial: depende de credenciais |
| Desconexão ou falha do Gmail aparece no painel; fila não dispara repetidas; sem senhas ou tokens em log; aceito ≠ entregue | painel de Configurações mostra estado e fila; `dedupeKey` único; tokens cifrados; rótulo "aceito pelo Gmail (não comprova entrega)"; **falha real do Gmail não simulada** | parcial: depende de credenciais |
| Login, recuperação, troca obrigatória e expiração por API direta; senha nunca por e-mail | e2e: rotas 403 antes da senha, redefinição com link único, corpo do e-mail sem senha | demonstrado |
| A não lê nem altera dados de B; turma não acessa outra; monitor não vira administrador | e2e "isolamento", "aula ao vivo" (tentativa de B invisível a A), "trabalhos" (arquivo 403) | demonstrado |
| Professor abre questão; aluno responde; atualização e reconexão preservam envio; duplicação não duplica; fechada recusa | e2e "aula ao vivo": mesma `clientRequestId` devolve a mesma tentativa; contagem 1 no banco; 409 após encerrar | demonstrado |
| Gabaritos e notas privadas inacessíveis em bundle, APIs, downloads, caches e tempo real | verificação de vazamento do motor legado (0 em 962 KB); e2e verifica ausência de `answerKey`, `porqueCerta` e "Notas do professor" nas respostas e no HTML | demonstrado |
| Check-in válido registra evidência; código expirado recusado; revisão docente exige motivo; cálculo respeita cancelados e regra | e2e "check-in"; regra não definida exibe "regra não definida"; encontros cancelados fora do denominador (`attendanceMap`) | demonstrado |
| Upload interrompido não gera entrega; envio válido gera recibo; reenvio preserva histórico; prazo e exceções pelo servidor | e2e "trabalhos" e roteiro por API (v1 devolvida → v2 reenviada, ambas preservadas; prazo passado marca atraso) | demonstrado |
| Grupo entrega; membros consultam; mudança de composição não altera autoria anterior; defesa individual separada | roteiro por API: B baixa arquivo do grupo; remoção de B não altera `membersSnapshot`; `individualDefense` por membro | demonstrado |
| Nota não publicada permanece privada; rubrica calcula; ausência de nota não vira zero; exportações reconciliam | e2e "trabalhos": grade nula antes de publicar; caderno mostra `nao_corrigido` sem total; CSV com a mesma função | demonstrado |
| Congelamento e liberação OOT respeitam ordem; teste cego não vaza rótulos nem permite tuning ilimitado | roteiro por API: OOT 403 antes do congelamento; segundo congelamento 409; rótulos 403 para aluno; limite de submissões 409; arquivo inválido recusado sem consumir limite; métricas só para o professor | demonstrado |
| Slides, fórmulas e simuladores não quebram; números batem; migração não perde atividades | varredura 540/540; 13 páginas com KaTeX sem TeX cru; reconciliação numérica; 222 questões importadas (29 + 13 + 180) | demonstrado |
| Teclado, celular e projetor viáveis; conteúdo longo não sobrepõe controles | Alt+setas no estudo; setas, espaço, F, N e Esc na projeção; varredura em 390 px sem estouro; slide 16:9 acima da barra de controles (1028 px + 52 px em 1080 p) | demonstrado |
| Carga representativa | 100 alunos: p95 de login 3,9 s, estado 3,2 s, resposta 2,9 s em modo dev (argon2id e compilação sob demanda inflam o login); esperado menor em `next start` | demonstrado com ressalva de ambiente |
| Backup restaurável; reinício preserva dados; rollback praticável | ensaio de restauração; dados em PostgreSQL e disco; versões de conteúdo imutáveis | demonstrado |

Não demonstrados nesta sessão (exigem homologação): envio real pelo Gmail, recuperação por link público, armazenamento S3, SSE atrás do proxy do provedor, domínio e TLS. Lista em `docs/09-ativacao-producao.md`.

## 2. Segurança (verificações executadas)

- CSRF: rotas mutáveis exigem cabeçalho `x-requested-with: fetch` e origem coerente; cookie `SameSite=Lax`, `httpOnly`, `secure` em produção (teste: POST sem cabeçalho → 403).
- Autorização no servidor em toda rota (`requireClassAccess`, `requireStaff`); e2e cobre aluno de outra turma, sem matrícula e monitor.
- Uploads: extensão permitida por trabalho, tamanho, tipo real pelos bytes (PDF falso recusado no e2e), gravação antes do registro completo, download por rota autorizada com `nosniff`.
- Motor legado: iframe `sandbox="allow-scripts"` (origem opaca, sem cookies), CSP `default-src 'none'`, sem rede, sem armazenamento persistente, recursos por token assinado de 15 minutos; guia e gabaritos removidos do código com verificação automática.
- Segredos: hash argon2id; tokens de convite, redefinição e sessão só como SHA-256; tokens OAuth cifrados com AES-256-GCM; nenhum segredo no cliente; `.env` fora do repositório.
- Limitação de abuso persistida no banco por IP e por e-mail (login, ativação, recuperação, check-in); limite por IP alto o bastante para uma sala inteira atrás do mesmo endereço (achado do teste de carga, corrigido).
- Pendências: TOTP para o professor; auditoria de dependências (`npm audit` aponta 4 vulnerabilidades moderadas em pacotes de desenvolvimento, a revisar antes da produção).

## 3. Acessibilidade (WCAG 2.2 como referência)

Verificado por axe-core e inspeção: contraste corrigido (rótulos dourados e selos de atenção escurecidos), links sublinhados em texto corrido, foco visível dourado de 3 px, alvos de toque de 44 px, rótulos em todos os campos e botões de ícone, erros de formulário com `role="alert"`, `aria-live` em estados de envio e cronômetros, camadas ocultas da apresentação com `inert`, `prefers-reduced-motion` respeitado, fórmulas com MathML, tabelas com cabeçalhos, navegação por teclado nos modos estudo e apresentação. Residual: ordem de títulos em conteúdo herdado que usa h4 (moderado); leitura por leitor de tela dos visuais legados depende do HTML original (SVG com `role="img"` e rótulos presentes na maior parte).

## 4. Avaliação por tela (escala 0 a 10, com evidência)

Dimensões: clareza (C), hierarquia visual (H), legibilidade (L), usabilidade e interatividade (U), acessibilidade (A), rigor (R), conexão narrativa (N). Notas atribuídas por inspeção das capturas e dos testes; defeitos encontrados e corrigidos estão indicados.

| Tela | C | H | L | U | A | R | N | Evidência e observações |
|---|---|---|---|---|---|---|---|---|
| Entrar, ativar, recuperar, definir senha | 9 | 9 | 9 | 9 | 9 | 9 | — | capturas do fluxo; sem violações axe; mensagens que não revelam cadastro |
| Visão geral do aluno | 9 | 9 | 9 | 9 | 9 | 9 | 9 | `aluno-visao-geral.png`: próxima aula, preparação, pendências, retomada e avisos; sessão aberta em destaque |
| Aulas (mapa do curso) | 9 | 9 | 9 | 9 | 9 | 9 | 9 | `aluno-aulas.png`: 4 aulas + trabalho final, minutos essenciais por capítulo |
| Página de estudo (estática) | 9 | 9 | 9 | 9 | 9 | 9 | 9 | `estudo-c3p7-questao.png`: objetivo, apoio, visual, questão com recuperação, checagem, "a seguir" |
| Página de estudo (visual legado) | 9 | 9 | 9 | 8 | 8 | 9 | 9 | `estudo-c8p7-simulador-legado.png`: simulador funcional em iframe isolado; U e A limitados por depender do HTML original (pendência: porte nativo) |
| Página de estudo no celular | 9 | 9 | 9 | 9 | 9 | 9 | 9 | `celular-c3p7.png`, `celular-c2p13.png`: navegação do capítulo recolhida, grades em coluna única, sem estouro (defeito encontrado na varredura e corrigido) |
| Modo apresentação | 9 | 9 | 9 | 9 | 9 | 9 | 9 | `projecao-c8p7.png`: 16:9, revelação progressiva, teclado, notas privadas |
| Sessão ao vivo (aluno) | 9 | 9 | 9 | 9 | 9 | 9 | 9 | `aluno-sessao-ao-vivo.png`: acompanhar/explorar, atividade lateral, presença, estado do canal |
| Trabalho (aluno) | 9 | 9 | 9 | 9 | 9 | 9 | 9 | `aluno-trabalho-final.png`: missões, rubrica, recibo, teste cego com ordem obrigatória, cálculo da nota exposto |
| Painel do professor | 9 | 9 | 9 | 9 | 9 | 9 | — | `professor-painel.png`: sinais verificáveis e links para a ação |
| Alunos e convites | 9 | 9 | 9 | 9 | 9 | 9 | — | `professor-alunos.png`: estados, convite, último envio, importação com prévia |
| Sessão ao vivo (professor) | 9 | 9 | 9 | 9 | 9 | 9 | — | `professor-sessao-ao-vivo.png`: slide, publicação de questões, distribuição agregada, painel privado, chamada com QR |
| Frequência | 9 | 9 | 9 | 9 | 9 | 9 | — | `professor-frequencia.png`: "regra não definida" explícita, correção com motivo, exportação |
| Trabalho (professor) | 9 | 9 | 9 | 9 | 9 | 9 | — | `professor-trabalho-final.png`: entregas, correção por rubrica, exceções, missões, teste cego com métricas privadas |
| Editor de conteúdo | 9 | 9 | 9 | 8 | 9 | 9 | — | `professor-editor-conteudo.png`: versões, blocos, notas privadas, questões; U 8 por edição em HTML bruto (sem editor visual) |
| Configurações e fila | 9 | 9 | 9 | 9 | 9 | 9 | — | `professor-configuracoes.png`: estado do remetente, teste, fila com aceito ≠ entregue |

Nenhuma dimensão aplicável ficou abaixo de 8; as duas notas 8 têm causa e pendência declaradas (porte nativo dos visuais legados; editor visual). Não há defeito crítico conhecido: nenhum erro numérico aberto, nenhum vazamento de dados detectado, nenhum fluxo quebrado nos testes.

## 5. Defeitos encontrados e corrigidos durante os testes

1. Links de navegação invisíveis (CSS base fora de camada sobrepunha utilitários): corrigido com `@layer base/components`.
2. Recursos do iframe legado sem cookies (origem opaca): assinados por token de curta validade e liberados no proxy.
3. Nomes trocados nos vetores do boosting no material e duas convenções de faixa: documentados; núcleo alinhado às tabelas exibidas.
4. Estouro horizontal em três páginas no celular: grades herdadas viram coluna única.
5. Contraste de rótulos dourados e selos de atenção abaixo de 4,5:1: escurecidos.
6. Camadas ocultas da apresentação focáveis: `inert`.
7. Limite de login por IP bloqueava uma turma inteira atrás do mesmo endereço: limite por IP elevado, limite por e-mail mantido.
8. Arquivo inválido no teste cego consumia o limite de submissões: agora é recusado com diagnóstico sem contar.
9. Limite de login por e-mail contava também entradas válidas: quem entrasse dez vezes em dez minutos ficava bloqueado (surgiu na reexecução da suíte e2e com o professor). Agora o limite por e-mail conta apenas falhas; o limite por IP continua contando todas as tentativas.
12. (17/09/2026, prioridade 4 da auditoria) Prerrequisitos existiam só no guia docente. Agora o campo "Pré-requisito" é exibido ao aluno como "Antes desta página", com referências a capítulos e páginas convertidas em links por um resolvedor puro (`src/lib/content/prerequisites.ts`), e a primeira página de cada capítulo mostra "O que este capítulo assume", derivado dos prerrequisitos de todas as páginas do capítulo. Nada mais do guia docente sai para o aluno (teste e2e verifica). Testes: `tests/prerequisitos.test.ts` e e2e "prerrequisitos visíveis".
11. (17/09/2026, após auditoria didática) Feedback revelava a alternativa correta e a explicação na primeira resposta errada, e a tentativa seguinte contava como acerto; nota nula aparecia como 0 em Meu acompanhamento. Implementado feedback em dois estágios com divulgação registrada (`revealed_at`, `disclosed_before`), botão "Ver a resposta", contadores de acerto próprio, e "sem nota" para total nulo. Testes: unitário `tests/feedback-dois-estagios.test.ts` e e2e "estudo: feedback em dois estágios". Gabarito da pergunta de retomada de c3p7 corrigido por versão nova da questão.
10. Teste e2e de notas dependia do estado deixado pela rodada anterior (nota já publicada): teste tornado reexecutável. Regra confirmada e documentada: recorrigir uma nota já publicada mantém a publicação e grava o estado anterior no histórico.
