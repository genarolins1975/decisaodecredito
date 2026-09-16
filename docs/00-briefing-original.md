# Prompt para Claude Code — plataforma acadêmica de crédito e risco

Você deve IMPLEMENTAR uma plataforma web completa, funcional e publicável para meu curso de modelagem de risco de crédito no Mestrado Profissional da FGV. Sou o Prof. Genaro Dueire Lins. Entregue o software, a migração e melhoria do conteúdo, os testes e a documentação de operação. Não encerre com planejamento, protótipo visual, telas com dados fictícios ou instruções para eu desenvolver depois.

Quero uma experiência acadêmica de padrão internacional: visual excepcional, didática clara, rigor técnico verificável, uso simples por alunos e gestão simples por um professor sem equipe técnica permanente. A primeira turma será a de 2026. Somente alunos cujos e-mails eu cadastrar e autorizar poderão acessar o curso. O aluno receberá pelo meu Gmail uma credencial temporária de primeiro acesso, definirá sua senha pessoal e poderá acessar aulas, responder às atividades, acompanhar sua situação e entregar trabalhos. O professor deve ministrar a aula pela plataforma, acompanhar respostas, registrar frequência, receber e avaliar trabalhos e publicar devolutivas.

## 1. Primeiro: conhecer os arquivos e o projeto

Leia as instruções do repositório, identifique a stack existente e preserve trabalho prévio. Localize os anexos disponibilizados no ambiente, sobretudo `apresentacao-curso-pd.html`. Não presuma que caminhos locais de outra conversa existem aqui.

O HTML fornecido contém a organização abaixo; confirme-a no arquivo e na aplicação renderizada:

| Módulo | Capítulos | Tema | Entrega indicada |
|---|---|---|---|
| Aula 1 | 1–3 | Formular o problema e compreender a base | Especificação do modelo, inventário dos dados e proposta de divisão temporal |
| Aula 2 | 4–6 | Entender as três técnicas | Comparação fundamentada dos modelos e exercícios de interpretação |
| Aula 3 | 7–8 | Validar e transformar previsão em decisão | Relatório de validação e recomendação de política |
| Aula 4 | 9–10 | Defender, reproduzir e monitorar | Plano de monitoramento e decisão integrada de comitê |
| Trabalho final | 11 | Construir, testar e defender o modelo de PD | Dossiê final, código reproduzível, teste OOT e defesa individual |

As quatro aulas têm previsão de 180 minutos, incluindo intervalo de 15 minutos. Não transforme automaticamente o trabalho final em uma quinta aula presencial. A plataforma deve permitir alterar a organização e cadastrar novos módulos, turmas e encontros sem editar código.

Os 11 capítulos tratam de decisão de crédito; fundamentos estatísticos; base e variáveis; regressão logística; árvores; gradient boosting; avaliação e calibração; decisão econômica; monitoramento e governança; laboratório integrado; trabalho final. O trabalho contém 12 missões: preserve a sequência e transforme-a em etapas acompanháveis.

O HTML contém conteúdo gerado por JavaScript e revisões posteriores que sobrescrevem partes anteriores. Inspecione código E estado final renderizado: extrair apenas o HTML estático ou apenas as primeiras definições não basta. Conte os slides e atividades efetivamente disponíveis. Preserve identificadores e crie mapa origem → destino.

Procure os arquivos citados no trabalho, como bases, notebooks, templates, manifesto, roteiros de testes e arquivo OOT sem desfecho. Diferencie arquivo existente, referência sem arquivo e conteúdo a produzir. Não transforme referências textuais em downloads inexistentes. Se houver PDFs adicionais, leia-os antes de classificá-los como bibliografia ou material do curso; não suponha relevância pelo nome.

Entregue inventário com: arquivo, módulo, slides, questões, interações, fontes, dependências, presença de gabaritos, material restrito e lacunas. Preserve os originais. Se faltarem arquivos, implemente o restante, disponibilize cadastro posterior e registre a pendência. Não substitua silenciosamente bases originais por bases sintéticas.

## 2. Benchmark, arquitetura e decisões

Pesquise documentação pública atual de referências como Canvas, Moodle, edX e plataformas de ensino executivo. Identifique práticas aplicáveis de navegação, aula, avaliação e acompanhamento, com links e data. Não copie marcas ou aparência proprietária nem afirme ter inspecionado áreas autenticadas sem acesso. Use a pesquisa para decidir, não para produzir um relatório interminável.

Prefira uma aplicação modular simples, com banco relacional, autenticação gerenciada e armazenamento privado de arquivos. Uma candidata é TypeScript/React/Next.js com PostgreSQL e Supabase Auth/Storage, mas verifique documentação, compatibilidade e versões antes de escolher; preserve a stack existente quando adequada. Evite microserviços e dependência obrigatória de LLM na operação cotidiana.

Registre brevemente arquitetura, modelo de dados, permissões, hospedagem, dependências, custos estimados com fontes e pressupostos, limites e recuperação de falhas. Considere inicialmente uma turma de até 100 alunos simultâneos como hipótese de dimensionamento, não dado confirmado. Separe desenvolvimento, homologação e produção.

Se faltarem credenciais, construa e teste localmente com serviços equivalentes e adaptadores reais. Liste exatamente o necessário para ativar a produção. Não finja envio de e-mail, persistência, autenticação ou publicação.

## 3. Usuários, matrícula e autenticação

Perfis: administrador/professor, monitor com permissões restritas, aluno. Autorizações devem ser verificadas no servidor, banco, armazenamento e canais em tempo real. Ocultar botões não é controle de acesso.

### 3.1. Ano letivo, turmas e histórico

Organize a plataforma em curso → edição/ano letivo → turma → matrícula. Crie a edição 2026 como inicial e permita cadastrar 2027 e anos posteriores pelo painel, sem alterar código. Permita mais de uma turma no mesmo ano, com identificadores distintos; ano não é identificador único de turma. O ano letivo é atributo explícito, não inferido da data do login ou da entrega.

Exiba “Turma 2026” de forma clara na área inicial e mantenha o contexto de ano/turma em aulas, encontros, trabalhos, grupos, notas, frequência, relatórios e exportações. Professor pode filtrar e alternar ano e turma. Aluno só pode selecionar edições e turmas nas quais tenha matrícula autorizada. Histórico de 2026 nunca deve se misturar ao de anos posteriores.

Duplicar uma edição copia apenas conteúdo e configurações selecionadas. Não copiar matrículas, grupos, respostas, frequência, submissões ou notas. Datas e prazos devem ser revisados antes da publicação. Preservar a versão do material usada em cada edição. Arquivar ano/turma mantém o histórico e bloqueia novas interações conforme política configurável; não remove dados nem concede acesso a antigos alunos automaticamente. Mudanças de conteúdo em 2027 não alteram a experiência histórica ou a avaliação de 2026.

### 3.2. Lista fechada de alunos autorizados

Eu, professor, cadastrarei os nomes e respectivos e-mails dos alunos que poderão entrar. Implementar cadastro manual e importação por CSV com nome, e-mail, ano letivo e turma. No cadastro dentro de uma turma já selecionada, ano e turma podem ser preenchidos pelo contexto. Oferecer modelo de CSV, prévia, validação, identificação de duplicidades e relatório por linha antes de confirmar. Importar a lista não envia e-mails automaticamente: permitir selecionar alunos e acionar “Enviar convites”.

Não haverá cadastro público, solicitação pública de matrícula nem inscrição por domínio de e-mail. Ter conta no provedor de autenticação não dá acesso ao curso. A autorização depende da matrícula ativa vinculada ao e-mail cadastrado e verificado. Não exigir conta Google do aluno: pode utilizar qualquer provedor de e-mail.

Remover espaços e aplicar a política de normalização do provedor; não remover pontos ou sufixos “+” indiscriminadamente nem fundir endereços diferentes. A mesma pessoa pode estar em várias turmas com uma única conta. Uma nova matrícula de quem já possui conta não redefine sua senha. Mudança de e-mail exige fluxo administrativo e nova verificação, preservando identidade e histórico.

Estados de matrícula: autorizado/aguardando convite, convidado, ativo, suspenso e encerrado. Registrar separadamente estados e tentativas de envio do convite. Professor vê quem foi convidado, quem ativou a conta, último envio e eventuais falhas, sem jamais visualizar senhas. Revogar matrícula bloqueia imediatamente APIs, arquivos e canais da turma, inclusive em sessões existentes; não bloqueia outras matrículas válidas da mesma pessoa.

### 3.3. Perfil do aluno

Nome e e-mail vêm do cadastro autorizado. No primeiro acesso, o aluno pode preencher **telefone e URL do LinkedIn, ambos facultativos**. Incluir “Preencher depois”; campos vazios não impedem ativação, aula, presença, resposta ou entrega. Permitir editar ou remover posteriormente. Validar telefone e URL somente quando preenchidos, sem consultar ou extrair dados do LinkedIn.

Explicar a finalidade dos campos opcionais. Visibilidade padrão: próprio aluno e professor/administrador autorizado; não publicar em diretório de turma nem compartilhar com colegas. Não incluir esses campos nos relatórios acadêmicos por padrão. Coletar apenas informações necessárias e respeitar a política de retenção.

### 3.4. Primeiro acesso, senha e vínculo com meu Gmail

Vincular o envio de convites e recuperação de acesso à minha conta Gmail, por integração autorizada pelo professor. O vínculo é do remetente; não significa obrigar o aluno a usar “Entrar com Google”.

Para atender ao envio de senha por e-mail, preferir **credencial temporária de primeiro acesso**, individual, aleatória, de curta validade e uso único, enviada pelo meu Gmail junto ao link HTTPS da plataforma, nome do curso e turma/ano. Após validá-la, o aluno deve definir sua senha pessoal antes de acessar conteúdo protegido. A senha definitiva nunca é enviada por e-mail, exibida ao professor ou recuperável em texto puro.

Use o fluxo nativo seguro de convite/ativação do provedor de autenticação. Se ele não suportar senha temporária com expiração, uso único e troca obrigatória, implemente link de ativação ou código de uso único por e-mail para definir a senha. Documente a alternativa na entrega; não improvise armazenamento de senhas ou permita uso continuado da credencial inicial. A restrição de primeiro acesso precisa valer no servidor, não apenas por redirecionamento visual.

O convite deve estar vinculado ao e-mail e à matrícula corretos, expirar, ser invalidado após uso e permitir reenvio controlado, invalidando a credencial anterior. Usuários existentes recebem aviso de nova matrícula e link de login, sem nova senha. Recuperação usa link/código temporário para definir nova senha, nunca envia a senha antiga.

Implemente login por e-mail e senha, logout, troca e recuperação de senha, expiração de sessão e revogação. Use mecanismos seguros do provedor, proteção contra abuso e respostas que não revelem a terceiros se um e-mail está cadastrado. O professor nunca vê ou define a senha pessoal do aluno. Nunca grave senha em texto puro, logs ou tabelas próprias. Prever autenticação adicional para administradores quando suportada.

### 3.5. Integração real com Gmail

Verifique a documentação atual da Gmail API e do provedor de autenticação para definir a integração. Preferir OAuth 2.0 autorizado pelo professor, com o menor escopo de envio compatível; não solicitar leitura da caixa de entrada nem acesso a contatos. Não pedir minha senha do Gmail no chat, não embutir segredos e não registrar tokens. Guardar credenciais e refresh tokens de modo protegido exclusivamente no servidor, com desconexão e revogação.

O provedor de autenticação continua responsável por gerar e validar credenciais; a camada de entrega pelo Gmail não substitui a segurança da autenticação. Verifique se o provedor suporta envio customizado seguro. Se houver incompatibilidade ou requisito externo, identifique precisamente o bloqueio e a solução suportada, sem afirmar que o vínculo funciona antes de testá-lo.

Painel de configuração deve permitir conectar/desconectar Gmail, mostrar a conta remetente conectada e enviar teste para endereço autorizado pelo professor. Respeitar limites vigentes da conta e requisitos OAuth, inclusive limitações de modo de teste e eventual verificação do aplicativo. Implementar fila, tentativas limitadas, backoff, prevenção de duplicação e registro de erro sem expor credenciais.

Template em português, com nome do aluno, nome do curso, ano/turma, link, validade e orientação de acesso. Não incluir notas, trabalhos ou outros dados acadêmicos sensíveis no convite. Distinguir “aceito para envio pelo Gmail” de “entregue ao destinatário”; não declarar entrega sem evidência. Se a conexão expirar ou for revogada, informar ao professor e permitir reconexão e reenvio, sem prejudicar o login de alunos já ativados.

Prepare a integração completa e teste sem disparar mensagens para alunos reais. A conexão efetiva à minha conta e o envio real dependem da minha autorização. Não usar remetente fictício, simulação de e-mail ou outro serviço silenciosamente em produção.

Uma pessoa pode estar em mais de uma turma, com papéis por turma. Aluno vê apenas seus registros e os trabalhos dos grupos dos quais faz parte. Monitor não pode elevar privilégios. Mudanças de matrícula e de integrantes devem preservar o histórico acadêmico.

## 4. Experiência do aluno

Tela inicial responde imediatamente: qual é a próxima aula, o que preparar, o que está pendente e qual é o prazo. Mostrar aula atual, continuidade do estudo, entregas próximas, avisos e devolutivas. Evite painel de cartões e indicadores sem ação.

Navegação: Visão geral; Aulas; Trabalhos; Materiais; Meu acompanhamento. Perfil e ajuda discretos. Em cada aula: objetivos, pré-requisitos, preparação, apresentação, atividades, leituras e síntese. Busca por conceito, aula e material respeitando permissões.

Dois modos de conteúdo:
- **Apresentação:** 16:9, tela cheia, teclado, legível em projetor, notas do professor privadas, transições discretas e controle de revelação.
- **Estudo:** leitura responsiva, explicações ampliadas, gráficos interativos, glossário contextual, referências e retomada do ponto anterior.

Não exiba uma apresentação inteira em iframe minúsculo no celular. Reconstrua o conteúdo em componentes e blocos estruturados; se houver iframe temporário, isole-o e documente sua retirada. Preserve fórmulas, gráficos e interações úteis. Não importe scripts arbitrários de uploads para a origem autenticada.

## 5. Aula ao vivo e respostas

O professor cria um encontro, abre a sessão, apresenta o slide e publica questões vinculadas a ele. O aluno entra na sessão autenticado e matriculado, pelo computador ou celular. Disponibilize “acompanhar professor” e “explorar livremente”, com retorno fácil à atividade atual. Sessão ao vivo é sincronização de aula e atividades; videoconferência pode ser um link externo, sem construir serviço próprio de vídeo.

Questões: alternativa única, múltiplas alternativas, resposta numérica com unidade e tolerância, texto curto, decisão de crédito com justificativa e saída de simulador. Extraia e adapte as atividades existentes antes de inventar novas.

Fluxo: rascunho → aberta → encerrada → resultados liberados. Professor controla tempo, reabertura, tentativas e momento de mostrar gabarito. Registrar versão da questão, aluno, sessão, tentativa, resposta, horário do servidor e status de envio. Salvar rascunhos e distinguir claramente “salvando”, “salvo” e “enviado”. Reenvio por falha de rede deve ser idempotente.

O professor vê distribuição das respostas, quantidade de respondentes e dificuldades conceituais; nomes ficam em painel privado. A projeção pública mostra agregados, sem expor erros individuais. Atividades formativas não viram nota automaticamente. Prever enquete antes/depois da discussão, mantendo as duas rodadas identificadas.

Gabaritos e notas do docente não podem estar escondidos no JavaScript, HTML, JSON público, source maps, arquivos baixáveis ou mensagens em tempo real antes da liberação. O material original pode conter respostas embutidas: separe-as durante a importação.

Use persistência no banco como fonte de verdade. Após reconexão, recuperar estado confirmado e reconciliar eventos duplicados ou fora de ordem. Tenha alternativa de atualização periódica caso o serviço em tempo real falhe. Não perder respostas ao navegar ou atualizar a página.

## 6. Frequência: separar presença, participação e aprendizado

Implemente chamada por encontro com janela definida pelo professor. Aluno autenticado faz check-in com código temporário ou QR renovável, ligado à sessão. Valide matrícula, janela, token e horário no servidor; limite tentativas. Check-out e pontos de confirmação podem ser configurados quando fizerem sentido.

Abertura de página, tempo de aba aberta e acerto de questão não comprovam presença. Código pode ser compartilhado: explique essa limitação no manual e permita validação docente. Não use câmera, biometria, localização obrigatória ou rastreamento invasivo.

Estados: presente, ausente, atrasado, justificado e pendente de validação, com regras configuráveis. Correções exigem motivo e deixam trilha de auditoria. Registre evidências e resultado final separadamente. Cancelamento e reposição de encontro precisam refletir corretamente no denominador.

Professor define quais encontros contam, regra de atraso e tratamento de justificativas. Não invente percentual institucional de aprovação. Antes da configuração, a plataforma mostra “regra não definida”, sem reprovar ninguém. Aluno consulta sua frequência e solicita revisão. Exportar mapa por aluno e encontro, com legenda e regra aplicada.

## 7. Trabalhos, grupos, missões e notas

Transforme as entregas previstas e as 12 missões do trabalho final em atividades configuráveis, sem presumir que toda missão tem nota ou prazo separado. Cada trabalho deve ter enunciado, objetivos, pré-requisitos, materiais, entregáveis, formato, tamanho máximo, prazo, rubrica e regra de atraso.

Suportar trabalho individual e em grupo; cadastro de grupos, integrantes e distribuição de bases; entrega coletiva e defesa individual. Congelar a composição associada à entrega para que alterações posteriores não mudem autoria retroativamente.

Aceitar formatos necessários, como PDF, ZIP, CSV, notebooks e links, com validação de tipo real, tamanho e segurança. Arquivos privados, downloads autorizados e URLs temporárias. Não executar notebooks ou código enviado por alunos no servidor da aplicação. Qualquer execução futura exige sandbox separado, limites de recursos e rede e desenho específico de segurança.

Fluxo: rascunho, enviado, atrasado, devolvido para revisão, reenviado, corrigido e resultado publicado. Cada envio produz recibo com versão, arquivos, integridade e horário do servidor. Confirmar entrega apenas após upload e registro concluídos. Manter versões anteriores; evitar arquivos órfãos e inconsistência após falha parcial. Nova versão substitui a vigente sem apagar histórico.

Prazos devem usar America/Sao_Paulo na interface e instantes inequívocos no banco. Permitir exceção individual ou por grupo com justificativa. Tratar upload que começou antes e terminou depois do prazo por regra explícita, não por acaso de implementação.

Correção por rubrica, comentários, anexos de devolutiva e publicação controlada. Mostrar cálculo da nota, pesos e arredondamento. Diferenciar não corrigido, não entregue, dispensado e nota zero. Versionar mudanças de rubrica e recalcular apenas de forma explícita e auditável. Extrair as rubricas do material final renderizado: elas podem variar entre laboratório e trabalho final; não unificá-las por conveniência.

No trabalho de PD, implementar congelamento do manifesto/modelo antes do teste cego: guardar versão, hashes e horário; liberar arquivos OOT sem desfecho conforme política; manter rótulos verdadeiros exclusivamente no servidor e restritos ao professor. Limitar submissões e detalhamento de feedback no teste cego para não transformá-lo em validação iterativa. Registrar exceções. Hash documenta integridade, mas não prova sozinho que não houve acesso prévio.

Permitir cadastrar múltiplas bases por produto e população, com dicionário, versão e atribuição a grupos. Importar as bases anexadas que existirem. Não criar dez bases novas como substituição automática das ausentes: registrar a lacuna e preparar a estrutura de cadastro.

## 8. Painel do professor e operação sem código

Permitir criar/editar anos letivos/edições, turmas, listas de alunos autorizados, encontros, módulos, slides estruturados, perguntas, leituras, trabalhos, grupos, prazos, rubricas e avisos; duplicar uma turma sem copiar respostas, notas ou dados pessoais; ordenar conteúdo; arquivar e publicar versões.

Fornecer prévia como aluno, sem alterar identidade nem gravar respostas reais. Diferenciar rascunho e publicação. Conteúdo versionado não deve mudar retroativamente o enunciado respondido ou a avaliação já entregue.

Painel deve responder: quem falta confirmar matrícula; quem está presente; quem respondeu; onde a turma teve dificuldade; quais entregas faltam; o que precisa de correção. Não rotular alunos como “de risco” por algoritmo opaco. Apresentar sinais verificáveis para acompanhamento docente.

Exportar frequência, entregas, respostas e notas em CSV compatível com planilhas, com filtros e proteção contra formula injection. Avisos dentro da plataforma e e-mails transacionais com registro de falhas e reenvio controlado. Testes nunca enviam mensagens a alunos reais.

## 9. Melhoria didática e rigor acadêmico

Revise slide a slide, questão a questão e a narrativa completa. Preserve meu encadeamento intelectual, os exemplos brasileiros e a progressão da decisão de crédito até a validação e governança. Público com probabilidade e regressão, mas domínio desigual de outras técnicas: introduza conceitos antes de exigir sua aplicação.

Para cada unidade: pergunta central → intuição → exemplo verificável → formalização necessária → aplicação → pergunta de checagem → conexão seguinte. Use revelação progressiva. Mova demonstrações extensas para aprofundamento, preservando acesso e referência. Não resolva densidade reduzindo fontes.

Audite, quando presentes: definição de default, unidade observacional, população, horizonte, maturação e censura; datas de disponibilidade; leakage; viés de seleção; separação temporal; pré-processamento ajustado apenas no treino; tuning e calibração fora do teste; WoE/IV e convenções; interpretação da logística; árvores e boosting; AUC, KS, Brier, log loss e calibração; incerteza; PD/LGD/EAD; hipóteses de rentabilidade; PSI e monitoramento; equidade e limites de inferência.

Reconcilie números repetidos entre texto, gráficos, tabelas e simuladores a partir de uma fonte de dados única. Recalcule o que for possível com scripts reproduzíveis. Se faltarem dados para verificar um resultado, marque-o como não verificado: não invente execução, referência ou precisão. Rotule exemplos sintéticos, dados observados, reconstruções e hipóteses. Não chame um resultado calculado em base sintética de evidência empírica do mercado.

Use Siddiqi, Thomas e Ghosh, BIS, IMF, BCB e literatura pertinente, após verificar obra, edição, documento e suporte à afirmação. Para regras regulatórias, identifique vigência e fonte primária. Bibliografia não substitui verificação dos números. Não prometa “rigor absoluto” como infalibilidade: implemente rastreabilidade e explicite incertezas.

## 10. Visual de excelência e acessibilidade

Meta estética: 10/10 como ambição de projeto, demonstrada por telas reais e revisão crítica. Linguagem acadêmica executiva, sóbria e contemporânea. Fundo off-white, azul-marinho, cinzas e dourado discreto são um ponto de partida; vermelho reservado a alertas. Tipografia limpa, alinhamento preciso, espaço em branco, hierarquia e gráficos legíveis. Evite excesso de cartões, gradientes, ilustrações decorativas, emojis e animações.

Identificação “Prof. Genaro Dueire Lins”. Só use logos oficiais fornecidos ou autorizados; não invente selo de aprovação institucional. Identidade do curso consistente entre site, slides e materiais.

Crie componentes reutilizáveis para conceito, caso, comparação, fórmula, linha do tempo, gráfico, exercício e feedback. Gráficos devem declarar unidades, população, janela, fonte e limitações; oferecer tabela/texto alternativo e não depender exclusivamente de hover ou cor.

Verifique acessibilidade com a versão vigente da WCAG como referência: contraste, teclado, foco, rótulos, erros de formulário, leitores de tela, zoom, redução de movimento e alvos de toque. Renderize e inspecione todas as telas e todos os slides, incluindo conteúdo longo e estados de erro, vazio, carregamento e sucesso. Teste celular, tablet, notebook e projeção 16:9. Use capturas reais; não considere revisão apenas do código suficiente.

## 11. Segurança, privacidade e dados

Modele entidades para cursos, edições/anos letivos, turmas, alunos autorizados, perfis opcionais, matrículas, convites e tentativas de envio pelo Gmail, papéis, versões de conteúdo, encontros, atividades, tentativas, eventos e decisões de frequência, grupos, trabalhos, submissões, arquivos, rubricas, notas, publicação, notificações e auditoria. Defina chaves, constraints e transações. Teste isolamento inclusive por acesso direto à API, URL de arquivo e canal em tempo real.

Nunca coloque chaves privilegiadas no cliente. Sanitizar conteúdo editável; tratar uploads como não confiáveis; proteger contra XSS, injeção, CSRF conforme arquitetura e abuso. Não registrar senhas, tokens ou conteúdo acadêmico privado em telemetria desnecessária. Restringir auditoria e não permitir que alunos apaguem eventos relevantes.

Colete apenas dados necessários. Prepare aviso de privacidade e política de retenção como rascunhos para revisão institucional, sem alegar conformidade jurídica certificada. Defina exportação, correção, arquivamento e exclusão conforme política acadêmica aprovada. Não envie respostas ou trabalhos a serviços de IA externos por padrão.

Implementar backup de banco E arquivos, recuperação documentada e ensaio de restauração em ambiente isolado. Definir observabilidade básica, alertas de falha e procedimento de rollback. Backup não é comprovado apenas porque existe uma configuração.

## 12. Execução por etapas, com evidências

Mantenha um checklist de requisitos e continue até concluir. Faça perguntas apenas quando a resposta mudar materialmente escopo, custo, permissão ou regra acadêmica. Para decisões reversíveis, escolha e documente. Datas, pesos, frequência mínima e cadastro real ficam configuráveis e sem publicação automática de valores inventados.

1. Inventário, auditoria inicial, benchmark sucinto e decisões de arquitetura.
2. Modelo de dados, migrações, autenticação, matrícula e isolamento.
3. Fluxo completo de uma aula real: conteúdo, questão, resposta persistida, presença e painel docente.
4. Trabalhos, grupos, versões, correção, devolutiva e teste cego.
5. Migração integral e revisão técnica, didática e visual do material.
6. Testes de aceitação, segurança, acessibilidade, carga e restauração.
7. Homologação, publicação quando autorizada e manual de operação.

Uma aula ponta a ponta é um marco intermediário, não a entrega final. Não deixe o restante como “próximos passos” sem informar claramente o que impediu a conclusão. Mantenha registro de progresso que permita continuar o trabalho em outra sessão sem perder contexto.

## 13. Testes de aceitação obrigatórios

Use contas de teste isoladas: professor, monitor, aluno A, aluno B, aluno de outra turma e usuário sem matrícula. Demonstre:

- Edição 2026 é criada; professor cadastra 2027; dados e permissões permanecem separados; duplicação não copia alunos nem registros acadêmicos e exige revisão de datas.
- Só e-mails cadastrados pelo professor ativam matrícula; importação identifica duplicidades; conta sem matrícula não acessa o curso; revogação bloqueia sessões existentes na turma correspondente.
- Telefone e LinkedIn vazios permitem concluir onboarding e usar todos os fluxos; preenchimento é editável, opcional e privado.
- Gmail conectado envia convite real a uma conta de teste autorizada; credencial temporária/link permite definir senha; expiração e reutilização são recusadas; reenvio invalida convite anterior; aluno existente não recebe senha nova.
- Desconexão ou falha do Gmail aparece no painel; fila não dispara mensagens repetidas indevidamente; não são registrados senhas ou tokens; não se confunde envio aceito com entrega comprovada.
- Login, recuperação, troca obrigatória da credencial temporária e expiração funcionam também por acesso direto à API; senha definitiva nunca é enviada por e-mail.
- Sem matrícula não há acesso; aluno A não lê nem altera resposta, arquivo, nota ou frequência de B; turma não acessa outra turma; monitor não se torna administrador.
- Professor abre questão; aluno responde; atualização de página e reconexão preservam envio; duplicação não duplica tentativa; questão fechada recusa envio fora da regra.
- Gabaritos, notas privadas e desfechos cegos permanecem inacessíveis inclusive no bundle, APIs, downloads, caches e eventos em tempo real.
- Check-in válido registra evidência; código expirado é recusado; revisão docente exige motivo; cálculo da frequência respeita encontros cancelados e regras configuradas.
- Upload interrompido não produz entrega falsa; envio válido gera recibo; reenvio preserva histórico; prazo e exceções funcionam pelo horário do servidor.
- Grupo entrega; membros autorizados consultam; mudança de composição não altera autoria anterior; defesa e avaliação individual são registradas separadamente.
- Nota não publicada permanece privada; rubrica calcula corretamente; ausência de nota não vira zero; exportações reconciliam com a tela.
- Congelamento do modelo e liberação OOT respeitam ordem e restrições; teste cego não vaza rótulos nem permite tuning ilimitado.
- Slides, fórmulas e simuladores não quebram; números críticos batem com cálculo independente; migração não perde atividades.
- Uso por teclado, celular e projetor é viável; conteúdo longo não sobrepõe controles.
- Carga representativa do dimensionamento escolhido suporta entrada e respostas simultâneas; documentar ambiente e latências, sem inventar resultados.
- Backup é restaurável; reinício e nova implantação preservam dados; rollback é praticável.

Testes locais não comprovam integrações externas: valide separadamente e-mail, recuperação por link público, armazenamento, conexão em tempo real e configuração de domínio em homologação. Não realize testes destrutivos em produção.

## 14. Critério de qualidade e entrega final

Produza avaliação por tela e por slide nas dimensões: clareza, hierarquia visual, legibilidade, usabilidade/interatividade, acessibilidade, rigor e conexão narrativa. Use escala de 0–10 com evidências, defeitos e correções. Para qualidade técnica, mantenha checklist objetivo separado das notas subjetivas. Meta: nenhuma dimensão aplicável abaixo de 9 e nenhum defeito crítico; aspirar a 10 no visual. Não atribua notas altas sem capturas e demonstrações.

Não compense erro numérico, vazamento de dados ou fluxo quebrado com média estética. Se não atingir um critério, declare-o e continue corrigindo, ou identifique o bloqueio real.

Entregue:
1. Repositório funcional, dependências fixadas, migrações, configuração de exemplo sem segredos e comandos de execução.
2. Plataforma com conteúdo real migrado, painel do professor e área do aluno.
3. URL de homologação; URL de produção somente se efetivamente implantada e verificada.
4. Inventário e mapa de cobertura dos anexos, com pendências explícitas.
5. Registro de correções técnicas e didáticas, referências e cálculos reproduzíveis.
6. Relatório de testes e avaliação visual com capturas de tela.
7. Manual curto do professor: criar ano/turma, importar lista autorizada, conectar Gmail, enviar/reemitir convites, matricular, publicar aula, abrir questões, validar presença, receber/corrigir trabalho e exportar notas.
8. Guia curto do aluno: ativar acesso recebido por e-mail, definir senha, preencher ou pular telefone/LinkedIn, selecionar turma autorizada, entrar na aula, responder, entregar e consultar devolutivas.
9. Procedimentos de backup, restauração, atualização, rollback e custos de operação.

Não contrate serviços pagos, envie convites reais nem exponha materiais e dados a público aberto sem autorização. Prepare antes uma implantação concreta e revisável. Se as credenciais e a autorização de publicação já estiverem disponíveis, execute a implantação e verifique os fluxos essenciais.

Comece agora pelo inventário do material e pelo diagnóstico do repositório. Apresente brevemente o que encontrou e avance para a implementação. Quero uma plataforma que eu consiga usar para ministrar o curso e gerir a turma de verdade.
