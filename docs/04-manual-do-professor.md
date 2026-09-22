# Manual do professor

Acesso: `/professor` após entrar com a conta de professor. Todas as ações têm confirmação e ficam na trilha de auditoria.

Lugares da área do professor (barra do topo): Início, Turmas, Conteúdo, Bases e gabaritos, E-mail. Dentro de uma turma: Resumo, Alunos, Aulas ao vivo, Presença, Trabalhos, Grupos, Notas, Ajustes. "Ver como aluno" (no topo) mostra a plataforma como o aluno a vê; a faixa clara traz o caminho de volta.

## 0. Roteiro de uma aula (o caminho curto)
1. Início → no cartão da turma, "Iniciar aula". Isso abre a aula ao vivo para os alunos e leva ao painel da aula. Se a aula já estiver aberta, o botão vira "Entrar na aula".
2. No painel da aula: "Projetar em tela cheia" abre a apresentação em outra aba; ela avisa os alunos a cada página que você avança. Na apresentação cada página vira uma ou mais telas que cabem inteiras no projetor (o rodapé mostra "tela 2 de 3"); setas ou espaço avançam tela a tela e depois de página, N mostra as notas privadas, F tela cheia, Esc sai.
3. "Presença" → "Abrir chamada": o código muda a cada minuto e há QR para projetar. O aluno digita o código em Ao vivo.
4. "Perguntar à turma": escolha uma pergunta da página (ou crie uma), "Adicionar à lista", depois "Abrir". Encerre e "Liberar resultados" quando quiser que o aluno veja acerto e explicação.
5. Ao final, "Encerrar aula".

O aluno, do lado dele: entra, vê em Início o aviso "A aula ao vivo começou" e clica em "Entrar na aula" (ou vai em Ao vivo). Segue o professor por padrão, pode "Navegar por conta própria" e voltar, responde às perguntas ao lado e registra presença com o código.

## 1. Criar ano letivo e turma
1. Turmas → "Nova edição (ano letivo)": informe o ano. A edição nasce vazia.
2. Para reaproveitar o material, use "Duplicar edição" a partir de 2026: copia unidades, capítulos, páginas publicadas, questões, rubricas, materiais e catálogo de bases. Não copia turmas, matrículas, grupos, respostas, frequência, entregas ou notas. Revise prazos antes de publicar.
3. "Nova turma nesta edição": código único (ex.: 2027-A) e nome. Uma edição pode ter várias turmas.
4. Ativar a edição quando estiver pronta; arquivar ao encerrar (histórico preservado, novas interações bloqueadas).

## 2. Importar a lista de alunos autorizados

A coluna nome pode ficar vazia quando só o e-mail é conhecido: o convite sai com saudação neutra ("Olá."), o painel mostra o e-mail no lugar do nome e o aluno informa o nome completo no primeiro acesso (campo obrigatório no perfil enquanto o cadastro só tiver o e-mail).
1. Turma → Alunos → "Importar uma lista (CSV)". Baixe o modelo (colunas nome, email, papel). Ano e turma vêm do contexto.
2. Clique em Conferir: cada linha recebe ok, duplicada no arquivo, já matriculada ou inválida.
3. Importar grava apenas as linhas válidas. Nenhum e-mail é enviado nesta etapa.
4. Cadastro manual: formulário "Adicionar um aluno". Papel monitor tem permissões restritas por turma.

## 3. Conectar o Gmail
1. E-mail → "Conectar meu Gmail". É preciso ter `EMAIL_PROVIDER=gmail` e as credenciais OAuth configuradas no servidor (ver `docs/09-ativacao-producao.md`).
2. Autorize apenas o escopo de envio. A conta remetente aparece na tela; desconectar revoga o token.
3. "Enviar teste" manda uma mensagem para o seu próprio e-mail (ou outro que você informar). Nunca para alunos.
4. A fila mostra cada mensagem: na fila, aceita pelo Gmail (não comprova entrega), falhou (com erro e reenvio manual).

### 3.1. Se os e-mails não chegaram
Verifique nesta ordem, em E-mail:
1. **Estado do remetente.** "pronto para enviar" com a conta certa. Qualquer outro texto (nenhuma conta conectada, credenciais não configuradas, conexão expirada) significa que nada saiu: os convites estão na fila. Reconecte e clique em "Processar fila agora".
2. **Fila de e-mails.** Cada convite tem um estado. "Na fila" com tentativas 0 significa que ninguém processou; use "Processar fila agora". "Falhou" mostra o erro do Gmail na coluna ao lado (por exemplo, escopo insuficiente, token revogado, limite diário) e permite reenviar. "Aceita" significa que o Gmail recebeu a mensagem: confira a pasta Enviados da conta remetente e peça ao aluno para olhar spam e promoções.
3. **Estado das matrículas.** Em Alunos, "autorizado" indica que o convite ainda não foi aceito pelo Gmail; "convidado" indica que foi.
4. Envios interrompidos no meio (limite de tempo do servidor) voltam sozinhos para a fila após 10 minutos, com a observação "Envio interrompido antes da confirmação".

## 4. Enviar e reemitir convites
1. Turma → Alunos → selecione os alunos (ou "Selecionar quem ainda não ativou") → "Enviar convites".
2. Cada convite cria uma credencial individual de 12 caracteres, válida por 72 horas e de uso único, enviada com o link da plataforma. Reenviar invalida a anterior.
3. Quem já tem conta com senha (outra turma) recebe apenas aviso de nova matrícula e link de login; a senha não muda.
4. Situações: sem convite → convidado → com acesso. Suspender ou encerrar bloqueia na hora o acesso à turma, inclusive sessões abertas.

## 5. Aulas e datas
Turma → Aulas ao vivo → "Criar as quatro aulas" (uma por unidade, sem data) e "Editar data e detalhes": data e hora (horário de São Paulo), local, link de videoconferência, o que o aluno prepara, se conta presença. Cancelar uma aula a retira da conta de presença; reposição referencia a aula original.

## 6. Publicar aula e conteúdo
- Conteúdo → escolha o ano → capítulo → página: "ver", "tela cheia" ou "editar".
- O monitor da turma acompanha a aula ao vivo pela vista do aluno, não pelo painel de condução, que é seu. Por isso ele não vê os atalhos de editar conteúdo e conduzir a aula.
- Cada tela de turma abre com o nome da turma na aba do navegador, e o editor de página traz o link de volta a Conteúdo no alto, ao lado do título da página.
- Bases e gabaritos mostra um cartão por turma com a situação do trabalho final e a política do OOT. Material cadastrado com endereço aparece clicável ali, inclusive o guia do professor da Aula 2.
- A Aula 2 aparece em Conteúdo como um bloco próprio com os 50 slides: "ver" abre o slide na página da plataforma (`/aulas/aula-2/slide/NN`) e "tela cheia" abre o baralho direto nele. Os slides não se editam pelo painel: mudam nos fontes de `aula_credito_html/app/slides/` e voltam pela compilação (`node aula_credito_html/build.mjs`).
- Editar cria uma nova versão (título, objetivo, apoio, blocos HTML com fórmulas, notas do professor, questões). "Salvar rascunho" não muda o que o aluno vê; "Publicar nova versão" torna visível. Respostas já dadas mantêm a versão anterior.
- Página pode ser essencial ou complementar, ter minutos e ficar oculta (rascunho).

## 7. Aula ao vivo e perguntas
1. Início → "Iniciar aula" (ou Turma → Aulas ao vivo → "Iniciar aula ao vivo"). A aula fica aberta para os alunos na hora.
2. Escolha a página e "Mostrar aos alunos", ou "Projetar em tela cheia": a apresentação avisa os alunos a cada página que você avança (N mostra as notas privadas, F tela cheia, Esc sai).
   Na Aula 2, conduzida pelos 50 slides, o bloco "Conduzir pelos slides" escolhe o slide e "Projetar os slides" abre a janela projetada: nela você navega com as setas, Home, End e o índice (tecla I, com filtro por número, título ou bloco), e a tela dos alunos acompanha. A janela projetada não tem notas, impressão nem modo estudo: o que a turma vê é só o slide. As notas de condução, as respostas esperadas (fechadas até você abrir), os cuidados e a transição do slide no ar ficam no bloco "Roteiro do slide no ar", no painel, na sua tela; "Avançar para NN" leva ao próximo. Se a conexão com a sessão cair, a projeção avisa e reenvia o slide sozinha quando a rede voltar. Para dar a aula sem a plataforma, abra o arquivo da aula direto: nele a tecla P e o botão Professor mostram as notas ao lado do slide.
   A Aula 2 tem dois guias em PDF, gerados a partir do próprio baralho (`content/materiais/aula-2-guia-do-professor.pdf` e `aula-2-guia-do-aluno.pdf`): o do professor reúne, slide a slide, a captura do slide no estado revelado, condução, respostas esperadas, cuidados, aprofundamentos e transição, mais o ritmo proposto por bloco, a síntese dos três modelos no teste e os sinais para observar na turma; o do aluno traz a captura (nos exercícios, antes de conferir), a explicação de como ler cada slide, as fórmulas na notação dos slides, os exercícios sem gabarito, a lista de verificação de saída e o glossário. Os dois saem pela plataforma: o guia do aluno em Materiais e na abertura da aula, para quem está matriculado; o guia do professor na abertura da aula e em Conteúdo, só para você e para o monitor (a área Materiais do aluno não o lista, e o aluno recebe "reservado ao professor" se tentar o endereço). O guia do professor contém gabaritos e notas reservadas: não o distribua por fora. Para regenerar depois de editar um slide: `node aula_credito_html/build.mjs` e depois `node aula_credito_html/material.mjs`.
   A Aula 2 tem capítulos como as outras: os capítulos 4, 5 e 6, com as 60 páginas das três técnicas. Os 50 slides são como ela é apresentada em sala, não o conteúdo dela: a abertura de cada um desses capítulos traz "Apresentar pelos slides", que abre o baralho no slide em que aquele assunto começa (capítulo 4 no slide 07, capítulo 5 no 21, capítulo 6 no 31), e o baralho inteiro também aparece como material da aula em Aulas e em Conteúdo. A barra do baralho tem o link "Aulas", que volta para a página que o slide cobre.
   O aluno recebe uma versão compilada sem as suas notas, tanto na tela ao vivo quanto em Aulas; o que ele mexe nos slides fica só no navegador dele, e o aviso "O que fica salvo" diz isso a ele.
3. "Perguntar à turma": escolha uma pergunta da página ou crie uma nova (alternativa única, múltipla, numérica com unidade e tolerância, texto curto, decisão de crédito com justificativa, previsão). Defina tempo e tentativas e clique em Abrir.
4. A distribuição agregada aparece na tela (pode ser projetada). "Mostrar nomes" é só para a sua tela.
5. Encerrar → Liberar resultados (o aluno vê acerto e explicação). "Reabrir em nova rodada" serve para enquetes antes e depois da discussão.

## 8. Validar presença
1. No painel da aula, Presença → "Abrir chamada": defina duração e, se quiser, minuto a partir do qual conta como atraso. O código muda a cada 60 s e há QR para projeção.
2. O aluno digita o código autenticado; o servidor valida matrícula, janela, código e limite de tentativas. O código pode ser compartilhado por mensagem: confira a sala e corrija no mapa quando necessário.
3. Turma → Presença → clique na célula para corrigir (presente, ausente, atrasado, justificado, pendente) com motivo obrigatório. Pedidos de revisão do aluno aparecem com "!".
4. Turma → Ajustes → regra de presença (mínimo, atraso, justificado). Sem regra, nada é calculado e ninguém é reprovado. Exportar CSV traz legenda e regra aplicada.

## 9. Receber e corrigir trabalhos
1. Trabalhos → abra o trabalho → "Editar" para enunciado, entregáveis, formatos, tamanho, prazo, regra de atraso, modo (individual ou grupo) e rubrica → Publicar.
2. Grupos → crie grupos, adicione membros e atribua bases. A composição no momento do envio fica congelada no recibo.
3. Entregas vigentes → Corrigir: marque cada dimensão da rubrica (o total, o máximo e a regra de corte aparecem), registre a defesa individual por membro, comentários e anexo → "Salvar correção". Situações: corrigido, dispensado, não entregue, zero.
4. "Publicar notas corrigidas" libera aos alunos. "Devolver" pede revisão; o reenvio cria nova versão sem apagar a anterior.
5. Exceções de prazo por aluno ou grupo, com justificativa.
6. Teste cego (trabalho final): com uma base por grupo, o OOT sem desfecho e os rótulos verdadeiros de cada base já estão no catálogo (Painel do professor → Bases e gabaritos, publicados pelo script de dados); o aluno recebe o OOT da base do seu grupo. Os campos de OOT e rótulos na tela do trabalho são o fallback para turmas com base única. Defina máximo de submissões e nível de devolutiva. O aluno só baixa o OOT após congelar o modelo; exceções de congelamento são registradas com motivo.
7. Bases do trabalho final: qualquer matriculado baixa qualquer base e dicionário. Se os resultados forem recebidos fora da plataforma (por e-mail), abra o trabalho final → Teste cego → "Liberação do OOT: livre": o OOT sem desfecho de todas as bases passa a aparecer em Materiais para todos os alunos, sem grupo nem congelamento. Os rótulos e os gabaritos nunca chegam ao aluno em nenhuma política. Entregas das aulas 1 a 4 em rascunho ficam invisíveis aos alunos; só o que está publicado aparece.
   Bases: 15 bases sintéticas (cerca de 1 milhão de propostas cada, OOT de 100.000 IDs), com dicionário, README e sujeira controlada. Atribua uma base a cada grupo em Grupos. O gabarito de cada base (processo gerador, sujeira plantada com contagens e exemplos de IDs, métricas de referência dos três modelos e dos pipelines ingênuos, respostas esperadas das doze missões) está em Bases e gabaritos → "Gabarito" e no material "Gabaritos consolidados". Nada do gabarito, do gerador ou dos rótulos fica no repositório público.

### Trabalho final com dois componentes
O trabalho final avalia o mesmo produto de crédito em dois componentes: o modelo (doze missões; dossiê, código, manifesto, previsões OOT, defesa individual) e o blueprint da operação (etapas 13 a 16: fluxo de concessão, governança e três linhas de defesa, modelo de decisão integrado, monitoramento e apresentação ao Conselho). A rubrica tem oito critérios de 0 a 2 (máximo 16): quatro do modelo e quatro do blueprint (coerência, aderência regulatória, viabilidade operacional, clareza para o Conselho). Turmas cujo trabalho final ainda tinha o enunciado original foram atualizadas pelo patch de importação; um trabalho já editado à mão não é alterado.

### Página do capítulo e a listagem de Conteúdo

Cada capítulo tem uma abertura própria em `/aulas/capitulo/N` (ligada em Aulas, na lateral das páginas e na listagem de Conteúdo). Para o professor ela mostra também o roteiro do guia docente: exposição, exemplo, prática e discussão por página e no total. Os PDFs do capítulo aparecem ali quando publicados em Materiais com "Capítulo N" no título; a versão do professor só aparece com status "professor".

Na listagem de Conteúdo, "ver" abre a página como o aluno a vê, na edição da turma ativa no seletor do topo, e não no ano escolhido na listagem. Se a turma ativa pertence a outra edição, a página informa que não está publicada naquela edição; troque a turma no seletor. "Editar" abre o editor pelo identificador da página: se a listagem estiver desatualizada em relação ao banco, a tela pede para recarregar a listagem. Qualquer falha ao montar uma página mostra um código de erro (digest) que identifica o registro no servidor da hospedagem.

### Área do professor e visão do aluno
A área do professor (faixa dourada no topo) é a área de trabalho: Início, Turmas, Conteúdo, Bases e gabaritos, E-mail. "Ver como aluno" abre a área do aluno com uma faixa de aviso e mostra exatamente o que o aluno vê: rascunhos não aparecem. As bases, os gabaritos e o registro do pacote ficam em Bases e gabaritos; a visão do aluno não mostra nada do professor.

## 10. Exportar notas
Turma → Notas → "Exportar CSV". O arquivo usa a mesma função de cálculo da tela e diferencia não corrigido, não entregue, dispensado e zero; células com fórmula são neutralizadas.

## 11. Situações comuns
- Convite expirado: reenviar (invalida o anterior).
- Aluno esqueceu a senha: ele usa "Esqueci minha senha"; você nunca vê nem define senhas.
- Aluno em duas turmas: mesma conta; ele alterna a turma no topo.
- Gmail expirou: E-mail mostra o erro; reconecte e processe a fila.
