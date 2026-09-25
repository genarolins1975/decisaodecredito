# Registro de progresso (para continuar em outra sessão)

Última atualização: 23 de setembro de 2026. Branch: `claude/new-session-d2yt8t`.

## Estado por etapa do briefing

| Etapa | Situação | Evidência |
|---|---|---|
| 1. Inventário, auditoria inicial, benchmark e arquitetura | concluída | docs/01, docs/02, docs/03 |
| 2. Modelo de dados, migrações, autenticação, matrícula, isolamento | concluída | `drizzle/0000_*.sql`, testes e2e de matrícula e isolamento |
| 3. Aula ponta a ponta (conteúdo, questão, resposta, presença, painel) | concluída | testes e2e "aula ao vivo"; capturas em `content/generated/shots` |
| 4. Trabalhos, grupos, versões, correção, devolutiva, teste cego | concluída | testes e2e "trabalhos"; fluxo completo verificado por API |
| 5. Migração integral e revisão técnica, didática e visual | concluída com pendências declaradas | 180 páginas migradas e o fecho da Aula 2 (c6p20), 181 no total; 84 visuais em iframe legado isolado (a portar); docs/03 |
| 6. Testes de aceitação, segurança, acessibilidade, carga, restauração | concluída no ambiente local | docs/07 |
| 7. Homologação, publicação e manuais | manuais concluídos; produção no ar, e cada merge publica código e conteúdo (confirmado em 23/09/2026); homologação separada sem registro | docs/09 |

## O que impede a conclusão total

- Produção está no ar e se atualiza a cada merge (docs/09). O que ainda exige credencial ausente deste ambiente é o armazenamento privado: guia do professor e bases do trabalho final sobem pelo bucket e são registrados em Bases e gabaritos.
- Envio real de e-mail exige a conta Gmail conectada pelo professor.
- Bases dos casos, pacote do trabalho final e rótulos OOT não foram fornecidos: cadastro pelo painel está pronto.

## Revisão da Aula 2 (21/09/2026)

Auditoria de arquitetura e experiência da aula em 50 slides, com correções implementadas e verificadas: `docs/AUDITORIA_ARQUITETURA.md`, `docs/ARQUITETURA_PROPOSTA.md`, `docs/PLANO_MELHORIAS.md` e `docs/VALIDACAO_JORNADAS.md`. Em resumo: o baralho passa a ser compilado em três saídas (completo para professor e monitor, variante sem notas para o aluno, notas em JSON para o painel); a projeção abre em modo próprio, sem notas; o painel do professor ganhou o roteiro do slide no ar; a exploração do aluno sobrevive à troca de modo e à recarga, com aviso do que fica salvo; queda de rede tem aviso e reenvio; acessibilidade dos gráficos, listas e contraste corrigida. Verificado em 21/09/2026: typecheck, lint (0 erros), `npm test` (249), `npx playwright test` (20 de 20, 2,2 min), QA do baralho 50 de 50 em quatro resoluções e na variante do aluno.

Segunda rodada de 21/09/2026, a partir de uma captura do professor no slide 24: fórmula com `%` em modo texto, rótulos de gráfico cortados e estados revelados que não cabiam na projeção em 24 slides. Correções em `docs/PLANO_MELHORIAS.md` (M14 e M15); a QA do baralho passou a varrer estados de verdade (`node qa.mjs --estados`), e o motor ganhou uma rede de segurança que reduz o corpo em vez de cortar.

Depois de editar qualquer slide: `node aula_credito_html/build.mjs`, que regrava `content/slides/aula-2.html`, `aula-2-aluno.html` e `aula-2-notas.json`; a plataforma lê essas cópias, não os fontes.

Terceira rodada de 21/09/2026: dois guias da Aula 2 em PDF, gerados pelo próprio baralho (`node aula_credito_html/material.mjs`): guia do professor (captura de cada slide no estado revelado, condução, respostas, cuidados, aprofundamentos, transição, ritmo proposto por bloco, comparação dos três modelos no teste e sinais para observar na turma) e guia do aluno (captura sem gabarito nos exercícios, explicação de como ler cada slide, o que mexer na tela, fórmulas em LaTeX, exercícios sem respostas, lista de verificação de saída e glossário). Os textos didáticos ficam em `aula_credito_html/material/conteudo/`, com contrato em `tests/aula-2-material.test.ts`; as saídas versionadas ficam em `content/materiais/`. A revisão das capturas levou a correções de rótulos sobrepostos ou cortados em 17 slides (M16 em `docs/PLANO_MELHORIAS.md`).

Quarta rodada de 21/09/2026: a Aula 2 ganhou a mesma moldura das outras aulas e um caminho de volta em todo ponto (M18). Abertura `/aulas/aula-2` no formato da abertura de capítulo; uma página por slide em `/aulas/aula-2/slide/NN` (lista lateral, cabeçalho, baralho embutido em modo livre, resumo, links do apêndice, roteiro do slide para a equipe, Anterior e Próxima); cinco cartões por bloco em Aulas; Aula 2 na sequência do curso (vizinha dos capítulos 3 e 4); Conteúdo com os 50 slides; Início com "Abrir a aula"; materiais apontando para a plataforma; guias em PDF servidos por papel em `/api/materiais/aula-2/`; link "Aulas" na barra do baralho aberto direto. A sincronia casca e baralho usa o hash e `App.trocar` (troca sem entrada dupla no histórico), porque um `location.replace` de fora do iframe recarrega o arquivo no Chromium. Verificado: typecheck, lint (0 erros), `npm test` (256), e2e "aula em slides" e "moldura da plataforma", script de 66 checagens no navegador, QA do baralho 50 de 50 nas quatro resoluções e na variante do aluno.

Quinta rodada de 21/09/2026: auditoria de uniformidade de layout e de UX sobre as 41 rotas, em oito dimensões, com verificação adversarial de cada achado (89 agentes de leitura, 40 achados levantados, 21 sobreviveram às duas lentes, 19 refutados). As correções (M19 em `docs/PLANO_MELHORIAS.md`) atingem as duas áreas: link de volta na página de trabalho; um só h1 por rota em Materiais; not-found próprio da Aula 2 e limite próprio em cada área com moldura; o 404 de página de aula sem recado dirigido ao professor; tela de quem não tem turma com saída própria; 404 global sem landmark aninhado; tabela de presença que não empurra mais a página de lado no celular; âncoras que param abaixo do cabeçalho grudado nas três molduras, inclusive com a faixa "vendo como aluno"; título de aba nas nove telas de turma; Bases e gabaritos contando um trabalho final por turma, com material clicável; estado vazio na aba Trabalhos; editor de página com eyebrow, h1 e link de volta no padrão; travessão de prosa fora das cascas React e do título de c6p18; confirmação de senha redefinida; confirmação divergente barrando o envio nas telas de senha; link de recuperação inválido com próximo passo; becos do papel monitor, que era devolvido em silêncio ao clicar numa sessão ao vivo; sucesso e falha distintos no pedido de revisão e no editor de página; rodapé nas telas de primeiro acesso; limites de erro em (publico) e (auth). A regra editorial virou contrato: `scripts/lint-tracos-cascas.mjs` (também `npm run lint:tracos`) e `tests/lint-tracos-cascas.test.ts`, que atendem R6.

Sexta rodada de 22/09/2026: a Aula 2 passou a ter capítulos, como as outras aulas, e o apêndice deixou de existir. O material original sempre lhe deu os capítulos 4, 5 e 6, e a soma dos essenciais deles é 165 minutos, exatamente a duração útil da aula; o apêndice era um contorno de quando a aula era só um baralho de slides. O importador voltou ao arranjo original, move os capítulos para a unidade certa e remove a unidade de apêndice depois de repontar trabalhos, materiais e encontros. Com isso caíram todos os casos especiais: `ehAulaEmSlides`, os cartões por bloco em Aulas, a abertura e a página por slide em `/aulas/aula-2`, a tabela de 50 slides em Conteúdo e o ramo da Aula 2 em Início. Os 50 slides continuam sendo a apresentação da aula: cada capítulo dela abre o baralho no slide em que o assunto começa (04 no 07, 05 no 21, 06 no 31), derivado do roteiro, e o painel ao vivo segue conduzindo por slides, agora por uma regra tirada do roteiro e não da ausência de capítulos. Os endereços antigos redirecionam para o conteúdo equivalente.

Sétima rodada de 22/09/2026: revisão pedagógica da Aula 2, capítulo a capítulo e slide a slide, com quatro leituras independentes (capítulos 4, 5, 6 e os 50 slides contra as páginas) e verificação própria de cada achado antes de corrigir. Detalhe e evidência em `docs/REVISAO_PEDAGOGICA_AULA_2.md`; as correções estão em M21 de `docs/PLANO_MELHORIAS.md`.

Quatro erros de fato saíram do material, todos reconferidos contra `src/lib/visuais/did.json` e `content/generated/dados.json`. A afirmação de que as propostas #1 e #15 ficam do lado errado da reta em qualquer posição era falsa em duas contagens: a #1 tem PD de 33,46% e não deu default, portanto está do lado certo, e nenhuma proposta erra em todo corte; no corte de 50% erram #2, #5, #10 e #15, e o melhor corte deixa três erros. A margem da raiz da árvore confundia duas coisas diferentes: 0,28125 contra 0,19841 é a margem sobre o corte vizinho, de 1,4 vez, e 0,28125 contra 0,07143 é a margem sobre a outra variável, de quase quatro vezes; só a segunda sustenta a estabilidade da raiz. A tabela de hiperparâmetros do capítulo 6 dizia que M é o freio contra o sobreajuste e o único escolhido fora do treino, contradizendo a resposta modelo da própria página. E o pico de sensibilidade da PD, para o aumento finito de 0,7453 em z, fica em 40,8% e não em 50%, como o próprio componente da página já exibia.

Sete lacunas estruturais foram fechadas. O capítulo 6 ganhou a ponte para classificação que faltava, em cinco linhas no topo de c6p13, com F₀ em log odds, alvo y − p e a ressalva de que a folha recebe a média do gradiente negativo, sem passo de Newton. c6p6 voltou a fechar com o problema que anuncia: soma o toco inteiro, mostra que cinco dos oito resíduos trocam de sinal e devolve a taxa de aprendizagem para c6p7, onde ela é apresentada. Toda curva de erro das páginas essenciais passou a dizer que é de treino. F₀ = 6,50 passou a ser construído na tela a partir dos oito valores de y, e resíduo passou a ser distinguido de erro final. O gráfico de c6p17 ganhou a curva de validação, que é a que escolhe a configuração, com a escolhida marcada. No capítulo 5, c5p4 ganhou a terceira curva, mín(p, 1 − p), e o contraexemplo de que o segundo nível derruba o Gini de 0,21875 para 0,12500 sem tirar um único erro; c5p9 ganhou o contraexemplo do guloso, com a raiz de ganho zero que termina em 0,10938 contra 0,12500 da gulosa; c5p10 passou a imprimir o intervalo de Wilson ao lado da taxa; c5p18 passou a trazer o n e o intervalo de cada folha; e a pergunta de c5p3 passou a medir profundidade, que é o objetivo declarado.

Oito slides mudaram. O fecho da aula (50) recebeu a comparação que a aula prometia no slide 01 e só existia no material impresso: os quatro clientes com as três PDs calibradas e a decisão no corte de 20%, onde os três modelos concordam na decisão e discordam em até 11,1 pontos de PD. O fio dos quatro clientes, que se perdia entre os slides 31 e 42, foi reatado: as folhas do boosting passaram a dizer quem cairia em cada uma e o exercício do slide 42 passou a ser sobre Carla. O slide 26 ganhou a comparação que o objetivo de c5p18 pede e a aula nunca mostrou: um botão troca o mapa de regiões pelo gráfico de PD por comprometimento com os degraus da árvore e a curva do logit nos mesmos eixos. O slide 19 trocou a terceira repetição do organograma pela evidência que a própria pergunta de diagnóstico pede, risco por faixa com as duas curvas do logit, e a promessa de comparação da nota de aprofundar passou a apontar para o slide 26, onde ela agora existe. O bloco da árvore ganhou o painel de quando usar, que o logit e o boosting já tinham. A miniatura de boosting deixou de ser fixa em η igual a 1 no slide 36, para que a afirmação do slide 37 possa ser verificada. E três notas de aprofundar passaram a reconciliar os números dos slides com os das páginas, que vêm de exemplos diferentes.

O ritmo dos blocos foi refeito a partir do peso do conteúdo: somando os minutos das páginas essenciais, o capítulo 4 pede 49 minutos, o 5 pede 49 e o 6 pede 67, enquanto o baralho dava 45, 35 e 35. A proposta passou a 20, 45, 33, 39 e 28, somando os mesmos 165 minutos.

Dezoito das vinte e uma páginas essenciais da aula passaram a ter veredito. Antes eram três: as perguntas de checagem são abertas e não entram em `/acompanhamento`, então o aluno que estudava sozinho não tinha como saber se entendeu. `content/questoes-curadas.json` traz dezesseis perguntas de múltipla escolha escritas no mesmo formato das do material original, com os distratores tirados dos erros previstos no guia do professor de cada página e diagnóstico por alternativa errada. As três sem veredito são as aberturas de capítulo (c4p1, c5p1, c6p1), páginas de quatro minutos que mapeiam o capítulo e onde um veredito não mediria nada. O importador junta as curadas às da página; `getPage` passou a carregar todas as questões da página, não só as ancoradas em bloco, e a página as mostra depois do conteúdo e antes da pergunta aberta.

Verificado em 22/09/2026: typecheck, lint (0 erros, 5 avisos preexistentes), `npm run lint:tracos` (0 ocorrências), `npm test` (260), `npx playwright test` (22 de 22), QA do baralho 50 de 50 em 1366x768 sem falha, os dois PDFs regerados (71 páginas cada, 0 traços, 0 fórmulas com erro) e conferência no navegador das dezesseis perguntas novas e dos oito slides alterados.

Oitava rodada de 22/09/2026: análise de layout da Aula 2, nas duas superfícies. O defeito era sistêmico e mensurável: `.linha` usava `align-items: stretch`, então toda caixa com moldura era esticada até a altura da coluna, independentemente do que continha. Medidos nos 50 slides, isso produzia 46 painéis ocos (o pior com 392 px vazios dentro da moldura) e 31 colunas com mais de 90 px de vazio no pé. Na projeção um retângulo com borda e nada dentro lê como conteúdo faltando.

O alinhamento passou a ser pelo topo, com `.linha.esticada` disponível para quem precisar do comportamento antigo. Com isso os 46 painéis ocos e as 31 colunas vazias foram a zero, e o espaço que sobra virou uma faixa única no pé do palco, que lê como margem. A mesma troca foi feita em `.capx-duas`, na abertura de capítulo da plataforma, onde o bloco "Onde isto é usado depois" era esticado até a altura do bloco de prerrequisitos.

Uma tentativa de preencher a faixa restante esticando as fichas do slide 01 foi revertida: fichas de uma linha esticadas viram caixas ocas, que é pior do que a margem. Fica o princípio: altura natural sempre, e a folga se resolve aumentando o elemento que tem o que mostrar, não inflando o que não tem.

Além do sistêmico: as listas verticais dos slides 01 e 04 usavam `justify-content: space-between` e abriam vãos de tamanhos diferentes entre itens iguais, agora com espaçamento uniforme; as fichas dos quatro clientes no slide de abertura passaram a trazer renda e comprometimento como valores rotulados, legíveis de longe, em vez de um trecho de frase em cinza; os dois controles do slide 06 ficavam soltos ao lado da ficha, sem moldura, e entraram nela; o slide 42 mostrava uma faixa de texto larga e vazia onde a resolução aparece, e passou a mostrar o eixo do waterfall desde o início, com zero barras; e o gráfico do slide 13 cresceu, porque era o conteúdo da tela.

O defeito virou verificação permanente: `qa.mjs` passou a medir painel oco, com limite de 180 px, e falha o slide que passar disso. Rodando a varredura completa apareceram sete estados que não cabiam, todos de conteúdo acrescentado na sétima rodada e não detectados lá porque aquela rodada só varreu o estado inicial: slides 01 e 06 estouravam a largura em 390 px, e 02, 26, 30 e 36 ficavam abaixo de 80% de escala com tudo revelado. Todos corrigidos. O critério de quando a árvore é uma boa escolha não coube em nenhuma tela do bloco com o exercício revelado, e foi para as notas do professor do slide 30 e para os dois guias, que é onde os critérios dos outros dois blocos também são detalhados.

Verificado em 22/09/2026: `qa.mjs` 50 de 50 em 1920x1080, 1366x768, 1024x768 e 390x844, e 50 de 50 nas mesmas quatro na variante do aluno com estados explorados; painéis ocos e colunas vazias em zero; typecheck, lint (0 erros), `lint:tracos` (0), `npm test` (265), `npx playwright test` (22 de 22); os dois PDFs regerados com 71 páginas, 0 traços e 0 fórmulas com erro.

### Nona rodada (22/09/2026): o caminho do conteúdo até produção

O PR 7 foi mesclado na branch padrão. Ao verificar o que isso de fato coloca no ar, apareceu uma falha de caminho, não de código: o build da Vercel chama `npm run content:import` sem `--republish`, e o importador só publicava página que ainda não existia. Consequência: as 16 perguntas curadas, por terem slug novo, chegariam ao aluno; as correções de texto das páginas dos capítulos 4, 5 e 6, não. O material ficaria meio corrigido, com slide e página discordando um do outro.

A correção não foi ligar `--republish` no build, que republica tudo e passa por cima do que o professor editar pelo painel. O importador passou a decidir página a página: republica quando o conteúdo de origem mudou **e** a versão publicada foi escrita pelo próprio importador (`page_versions.created_by` nulo, que é o que distingue máquina de pessoa, já que toda escrita do painel preenche esse campo). Página com edição do painel não é tocada e sai listada no log, para o professor resolver à mão. Sem diferença, nenhuma versão nova.

Dois defeitos apareceram no teste e foram corrigidos antes de qualquer entrega:

- as 11 aberturas de capítulo republicavam a cada execução, porque o bloco de episódio carrega `missions: undefined` quando não há missão, e a chave some ao virar jsonb; a comparação passou a descartar chave com valor `undefined`, como o `JSON.stringify` faz;
- as seis páginas do capítulo 11 oscilavam para sempre: o importador publicava o texto cru e `patchCapitulo11` o corrigia logo depois, então a execução seguinte via diferença de novo. As substituições do capítulo 11 passaram a ser aplicadas já na construção dos blocos, de modo que a saída canônica do importador e a do patch sejam a mesma. `patchCapitulo11` ficou para bancos antigos e passou a respeitar a mesma regra de autoria.

Verificado em 22/09/2026 contra o banco local, que tem as 180 páginas publicadas: primeira execução converge e não cria versão nenhuma; com uma página rebaixada ao texto antigo (c5p2) e outra rebaixada e marcada como editada pelo painel (c4p19), a execução republica apenas c5p2, com nota de mudança citando o sha256 da origem, e lista c4p19 como divergente sem tocá-la; a execução seguinte não cria nada. `scripts/vercel-build.sh` ganhou `CONTENT_SYNC_ON_BUILD=1`, que roda só a importação, sem migrar nem semear, para quem desligou o bootstrap depois do primeiro deploy; as cinco combinações de variáveis foram exercitadas com `npm` e `next` substituídos por stubs. `tests/conteudo-publicado.test.ts` prende as duas falhas possíveis da comparação: acusar diferença onde não há, que faria todo build versionar 180 páginas, e não acusar onde há, que manteria o erro no ar.

Produção conferida em 22/09/2026: `decisaodecredito.com` responde 308 para `www.decisaodecredito.com`, que responde 307 para `/entrar`, e `/entrar` responde 200. Deste ambiente não há credencial de produção nem acesso ao banco real, então o conteúdo efetivamente publicado lá não foi inspecionado; `docs/09-ativacao-producao.md`, que afirmava que nada havia sido implantado, foi corrigido.

Verificado em 22/09/2026: typecheck, `lint:tracos` (0), `npm test` (276 em 31 arquivos).

### Décima rodada (22/09/2026): a Aula 2 na plataforma, tela a tela

O professor mandou a captura de uma página da Aula 2 com a faixa "Na característica → No escore z → Nas odds" cortada ao meio pelo painel de baixo, e perguntou se as telas haviam sido conferidas uma a uma. Não haviam. As nove rodadas anteriores conferiram o baralho de 50 slides, que tem instrumento próprio (`aula_credito_html/qa.mjs`), e nunca as 60 páginas da aula renderizadas pela plataforma, que é onde vivem os visuais nativos em React.

**Três causas de origem, cada uma com sua evidência.**

1. Dois componentes usavam `data-tela="2"`: `logit-slides` (segundo quadro de c4p1) e `reta-na-probabilidade` (c4p2). As regras de `grid-template-rows` não diziam de quem eram, então a última do arquivo vencia e o quadro de c4p1 recebia as linhas de c4p2: 78fr em vez de 152fr na linha 3. A diferença dá 35px naquela largura, exatamente o transbordo medido. Toda regra `.rl-slide[data-tela=...]` passou a ser escopada pelo `data-vz` do dono.
2. Na apresentação, o que não declara tamanho próprio herdava de fora: no estudo, dos px da página; na projeção, do `clamp` em cqh que `.slide-inner .vz` escreve para os visuais antigos. Os mesmos botões mediam 10,8px no estudo e 13,3px na projeção, e por isso uma ficha que cabia na tela estourava ao projetar. O quadro ganhou base tipográfica própria em cqw, como o resto do sistema.
3. A regra que troca o layout do próprio quadro consultava um elemento e as que trocam o layout dos filhos consultavam outro. Em 1024x768 projetado, resolução comum de projetor, as colunas empilhavam dentro de uma caixa de altura fixa e as três fichas de c4p1 perdiam de 170 a 260px cada. As consultas do sistema passaram a nomear um contêiner só, declarado na figura.

**Defeitos corrigidos.** Onze quadros tiveram linhas redimensionadas a partir da altura real do conteúdo, não por tentativa: c4p1 (dois quadros), c4p2, c4p8, c4p10, c4p11, c4p12, c4p14, c4p15. Cinco deles só aparecem depois de clicar: a lista de alternativas de c4p10 passava 13px e o aviso de baixo ficava por baixo dela; a de c4p11, com o resultado revelado, 25px; o resultado de c4p12, 8px; a razão de odds de c4p14, 28px; a leitura do caso de c4p15, 15px. Em c4p14, o mais denso, o espaço veio do respiro entre faixas, da entrelinha da tabela, do corpo do número e da razão de odds em linha em vez de empilhada, porque a tela estava cheia. Em 390px, a tabela de seis colunas de c4p14 passou a rolar na horizontal, a ficha de c4p8 passou a quebrar em duas linhas e o palco da apresentação deixou de impor 16:9 em retrato, onde reduzia a aula a uma faixa de 219px.

**Instrumento.** `qa-plataforma/varre.mjs` percorre as 60 páginas em duas rotas, quatro larguras e com os estados revelados, e mede três coisas: conteúdo cortado por uma caixa que não rola, conteúdo que vaza da própria caixa e cai sobre a caixa seguinte, e caixas irmãs que se cobrem. A segunda medida foi acrescentada depois de verificar que as duas primeiras versões do detector não pegavam o defeito relatado: as caixas não se encostam, então a sobreposição não vê; ninguém corta, então o corte também não. O que existe é conteúdo passando de uma borda que não corta, dentro de uma tela que não cresce. A verificação dessa medida foi feita rodando o detector contra o CSS ainda com o defeito, onde ele acusa os mesmos 35px. O detector ignora desenho (SVG), interior de tabela, conteúdo só para leitor de tela (o MathML do KaTeX) e o que está ao alcance de uma rolagem.

Verificado em 22/09/2026: 60 de 60 páginas sem defeito nas duas rotas, em 1920x1080, 1366x768, 1024x768 e 390x844, com os estados revelados clicando cada botão e cada alternativa. `tests/quadros-rl.test.ts` prende as duas armadilhas de origem: regra de linhas sem dono declarado e consulta de largura sem contêiner nomeado. typecheck, `lint:tracos` (0), `npm test` (281 em 32 arquivos).

Fora da Aula 2, a mesma varredura encontrou defeitos pré-existentes que este trabalho não introduziu, confirmado rodando o instrumento contra o CSS em produção: c9p4 e c11p6 (marca de 20px recortada por trilho de 14px com `overflow: hidden`, sem efeito visível), c8p8 e c8p11 (1px do botão de segmento em 390) e c2p2 (390). Ficam registrados, não corrigidos nesta rodada.

Lição de método, a terceira sobre o mesmo ponto: instrumento que não foi testado contra o defeito conhecido não serve de garantia. As duas primeiras versões do detector davam 60 de 60 com o defeito na tela.

### Décima primeira rodada (22/09/2026): uma Aula 2 só, com narrativa única e guias por capítulo

O professor mostrou Materiais listando a Aula 2 duas vezes, o baralho de 50 slides e o guia do baralho, e pediu uma aula só, narrada de forma fluida, com o layout das outras aulas e guias do aluno e do professor por capítulo. Decisões dele: aposentar o baralho; guias dos capítulos 4, 5 e 6, publicados na página de cada capítulo, o do aluno aberto ao aluno e o do professor restrito à equipe.

**A aula.** O baralho saiu de Materiais (o importador o arquiva), do botão "Apresentar pelos slides" e do ao vivo por slide; os endereços antigos redirecionam para o conteúdo equivalente. O ao vivo conduz pelas páginas, e "Próxima essencial" não atravessa mais de capítulo. O fio das mesmas 16 propostas amarra os três capítulos, com 14 pontes de sala e a página de fecho c6p20; o desenho, os números e o que do baralho ficou de fora estão em `docs/NARRATIVA_AULA_2.md`.

**Os guias.** Gerados por `scripts/apostila` a partir das páginas publicadas, com a captura de cada página, a explicação ("Como ler" no aluno, "Como conduzir" no professor), as questões e, no professor, gabarito, ficha de aula e a folha "Em sala". O guia do aluno fica em `content/materiais` e sai pela rota `/api/materiais/[arquivo]` só para matriculados. O guia do professor traz gabaritos e o repositório é público: não entra no repositório (o `.gitignore` recusa) e sai pelo canal privado dos gabaritos, bucket e "Registrar pacote", com o pacote montado por `pacote-professor.mjs`. O registro de pacote tinha um defeito que este caminho expôs e foi corrigido: manifesto sem bases zerava a lista esperada do teste cego.

**Guia contra tela.** Evidência: dois revisores independentes compararam guia e explicações com a plataforma renderizada e acharam 54 divergências no capítulo 4 e 60 nos capítulos 5 e 6. Causa principal: o registro de visuais nativos trocou 21 visuais e o guia seguia descrevendo o HTML antigo (tabelas que não existem mais, "à direita" onde a peça empilha, "página expositiva" em página com controles). Todas corrigidas, pela camada `guiaDaTelaV15` do material original e pelos textos de `scripts/apostila/explicacoes`.

**Erros de conteúdo** (recalculados com `src/lib/visuais` e presos em teste):

- c6p7 e a questão c6p7q afirmavam que, com quatro árvores fixas, η = 1 dá o menor erro de treino. Na faixa do controle (0,1 a 1, passo 0,1) o menor é η = 0,7, com 0,1422; η = 1 termina em 0,4078 e η = 0,1 em 5,48. O material original trazia a mesma premissa ("O maior", e a nota "η menor produz erro maior"). Guia, questão e explicações corrigidos.
- c5p16: o contador do nó direito dizia "trocou de variável" sem a #14 (só o ponto médio muda, de 87,5% para 85%) e sem a #15 (o nó fica puro e perde o corte), e o da raiz dizia "mudou" sem a #8 ou a #9, com a mesma divisão. O contador passou a comparar a divisão; só a #10 troca a variável, como o guia afirma.
- c6p9 dizia que as parcelas encolhem. Para x = 8, a maior é a da árvore 2 (+2,03), não a da 1 (+1,44).

**Layout e formatação.** Tabelas com coluna atrás da rolagem: c5p18 em qualquer largura e c5p7, c5p14 e c5p16 a 1.000 px, zero depois. Rótulos atravessados por curvas em c4p19 (virou legenda), c6p15 e c5p12. Marca do observado desalinhada entre linhas em c6p9 e c6p14 (grade compartilhada). Clique restaurado em c6p3, com as cores de c6p7 a c6p9. Caixa alta transformando η e β em Η e Β, lidos como H e B, em seis cabeçalhos de tabela e dois rótulos de questão.

**Importador.** Passa a sincronizar os textos do capítulo (título, pergunta, pré-requisitos, objetivos, motivação, atividade, usos) e as questões de checagem e curadas quando a origem muda e o professor não as editou pelo painel.

Verificado em 22/09/2026: typecheck; lint (0 erros); `lint:tracos` (0); `npm test` (283 em 31 arquivos); `npx playwright test` (23 de 23); varredura 61 de 61 páginas em Aulas (1920x1080, 1366x768, 1024x768, 390x844) e em Apresentação (1920x1080, 1366x768), com estados revelados; palco das 11 páginas alteradas com média 9,79 e nenhuma abaixo de 9; seis PDFs regerados (aluno com 34, 31 e 30 páginas; professor com 43, 40 e 40), sem imagem ausente, sem traço de pontuação e sem conteúdo do professor no guia do aluno; importação idempotente na segunda execução.

**Não verificado.** O pacote do professor não foi enviado ao bucket nem registrado em produção: deste ambiente não há credencial. O conteúdo publicado em produção não foi inspecionado.

### Décima segunda rodada (23/09/2026): o capítulo 5 redesenhado para o palco

O professor apontou os slides 69 e 70 da apresentação (c5p1 e c5p2) e pediu a revisão de layout do capítulo 5 inteiro, com menos texto, didático e objetivo.

**Diagnóstico** (capturas do palco a 1920x1080, antes da mudança). c5p1 ocupava três telas: infográfico, desafio em caixas de texto e etapas. c5p2 ocupava duas, com a árvore de um corte só e pontos cortados pelo eixo. c5p13 repetia o mesmo gráfico em quatro telas. Cabeçalhos com objetivo e apoio de duas ou três linhas. O capítulo somava 28 telas.

**O que mudou.**

- Sete peças nativas novas, desenhadas para caber numa tela: abertura com a árvore que acende a parte de que cada etapa fala (c5p1); reta contra cortes nos mesmos eixos, com o balanço do que a árvore ganha e perde (c5p2); raiz escolhida (c5p8); uma proposta dentro da árvore, com o intervalo da folha (c5p10); valor da folha (c5p12); confiança da folha (c5p13); Gini ou entropia (c5p17). O plano das 16 propostas é compartilhado (`plano-16.tsx`).
- Dois modos novos no registro de visuais: `episodio`, que troca o bloco do desafio e recebe o texto dele, e `conteudo`, que troca o conteúdo herdado e mantém as questões da página. No palco, c5p1 dispensa o infográfico (`ABERTURA_NATIVA`); um teste prende o registro e o palco na mesma lista.
- As outras doze páginas recompostas para o palco: o cabeçalho interno dos visuais sai (o quadro já traz título e objetivo), plano e árvore crescem, controles e contadores secundários ficam só no estudo, a escala do plano ganhou margem para nenhum ponto ser cortado pelo eixo e os rótulos de regra cabem nas caixas.
- Cabeçalhos das 19 páginas reescritos na camada `capitulo5NoPalcoV16`: título e objetivo numa linha a 1920 px, apoio só quando instrui o uso da página.
- Roteiro do professor (leitura, condução, interação e checagem) e explicações dos guias refeitos para as sete peças. No guia impresso, a abertura de c5p1 não repete o desafio, que a captura já traz.

**Resultado** (medido nesta rodada).

| Medida | Antes | Depois | Como |
|---|---|---|---|
| Telas do capítulo no palco, 1920x1080 | 28 | 22 | capturas tela a tela |
| Palavras dos cabeçalhos (título, objetivo, apoio e conexão das 19 páginas) | 1.071 | 676 | `extract.json` do commit 39fcb36 contra o atual |
| Palavras do conteúdo de c5p2, c5p8, c5p10, c5p12, c5p13 e c5p17 | 835 | 344 | HTML herdado contra a peça renderizada, sem SVG e sem nota de fonte |
| Auditoria do palco, 19 páginas | sem medida comparável guardada | 9,96 em 1400x900 e em 1920x1080; pior página 9,8 | `scripts/palco/auditoria.mjs` |

**Erro de conteúdo corrigido.** A nota do professor de c5p13 dizia que, com este volume, nenhuma folha era comprovadamente diferente das outras. Falso para o par 0 default em 6 contra 6 em 6: teste exato de Fisher, p = 0,0022. As folhas de 50% (1 em 2) não se distinguem de nenhuma outra (p = 0,25). A nota passou a dizer que as barras sugerem e o teste da diferença decide, sem contradizer a questão c5p13q.

**Checagem de c5p2.** A pergunta acompanha o desenho novo: quantos cortes a mais a árvore de profundidade 2 precisaria para isolar a #15. Resposta: um, entre a #15 e a #16. O importador criou versão nova da questão; as respostas antigas ficam na anterior.

Verificado em 23/09/2026: typecheck; lint (0 erros; 5 avisos, todos anteriores a esta rodada); `lint:tracos` (0); `npm test` (291, oito novos: cada peça nova, renderizada no servidor, exibe os números conferidos, e registro e palco concordam na abertura nativa); `npx playwright test` (23 de 23); varredura 61 de 61 páginas nas duas rotas e nas quatro larguras, com estados revelados; notas do professor novas no ar no palco; guias do capítulo 5 regerados (aluno com 28 páginas, professor com 36); guias dos capítulos 4 e 6 idênticos, em texto e em imagem, aos publicados.

**Não verificado.** Pacote do professor não enviado ao bucket (sem credencial neste ambiente). Produção não inspecionada. Nenhum teste com alunos ou em projetor real.

### Décima terceira rodada (23/09/2026): o capítulo 6 redesenhado para o palco

Depois do capítulo 5, o professor pediu a mesma revisão no capítulo 6: layout de apresentação revisto, menos texto, didático e objetivo.

**Diagnóstico** (capturas do palco a 1920x1080 e auditoria antes da mudança). A abertura c6p1 ocupava três telas: infográfico em duas e o desafio na terceira, como c5p1 antes da rodada anterior. c6p4 repetia o mesmo gráfico de resíduos em duas telas. c6p11, c6p16 e c6p20 empurravam texto para uma segunda tela, e c6p17 para duas. c6p5 e c6p6 eram faixas de texto; o gráfico de fecho da c6p20 ocupava um terço da tela, com rótulos de 12 px quase ilegíveis.

**O que mudou.**

- Seis peças nativas novas, cada uma numa tela: abertura com os oito pontos acendendo palpite, resíduo e soma (c6p1); palpite constante, com a tabela e a parábola do erro no desenho de c5p12 (c6p4); o erro como alvo, com os oito resíduos rotulados (c6p5); a primeira correção, com as duas regiões do toco e anéis nos cinco resíduos que trocam de sinal (c6p6); a soma em log odds, com as duas colunas lado a lado e a fórmula numa linha (c6p11); η e árvores, com a tabela recalculada ao lado da curva e da referência 1,5 ÷ η (c6p16). O plano dos oito pontos é compartilhado (`plano-8.tsx`).
- c6p17 e c6p20 passam ao modo `conteudo`: a peça de c6p17 já trazia nos cartões o que o texto herdado repetia; a de c6p20 ganhou ao lado do gráfico a perda de treino das três famílias, a pergunta da Aula 3 e a entrega.
- As demais páginas: o cabeçalho interno dos visuais sai do quadro (a regra do capítulo 5 passa a valer para o 6), gráficos de c6p2, c6p13 e c6p20 maiores, rótulos do fecho em 12,5 px e cor de texto.
- Cabeçalhos das 20 páginas reescritos na camada `capitulo6NoPalcoV17`; roteiro do professor das oito páginas redesenhadas e explicações dos guias refeitos.

**Resultado** (medido nesta rodada, mesmo instrumento antes e depois).

| Medida | Antes | Depois | Como |
|---|---|---|---|
| Telas do capítulo no palco | 29 | 22 | capturas a 1920x1080 |
| Palavras exibidas no palco, 20 páginas | 3.657 | 2.193 | `scripts/palco/auditoria.mjs`, 1400x900 |
| Palavras dos cabeçalhos (título, objetivo, apoio e conexão) | 1.020 | 655 | `extract.json` antes e depois |
| Auditoria do palco, média | 9,75 (1400x900) e 9,71 (1920x1080) | 9,89 nas duas | mesma auditoria; nenhuma página abaixo de 9 |

**Defeito evitado antes da entrega.** O contêiner novo da c6p20 recebeu o nome `vz-tm-grade`, que já era a classe das linhas de grade do gráfico, com traço de 1 px; o traço vazou para todo o texto do SVG e deixou os rótulos claros. Achado pela inspeção do estilo computado e corrigido com outro nome, antes do commit.

Verificado em 23/09/2026: typecheck; lint (0 erros; 5 avisos anteriores); `lint:tracos` (0); `npm test` (298, sete novos: cada peça nova, renderizada no servidor, exibe os números conferidos); `npx playwright test` (23 de 23); varredura das 61 páginas em Aulas e em Apresentação nas quatro larguras (1920x1080, 1366x768, 1024x768, 390x844), com estados, sem defeito; capítulo 5 reauditado sem regressão (9,96, 22 telas); modo estudo das oito páginas redesenhadas em 1366 e 390 px sem rolagem lateral; guias do capítulo 6 regerados (aluno com 28 páginas, professor com 38).

**Verificado em produção em 23/09/2026.** Merge de e1369b1 às 08:18 UTC; às 08:22 UTC o CSS publicado trazia as classes do capítulo 6 e `/api/health` respondia com 4 migrações, as 4 de `drizzle/`. Depois, a captura enviada pelo professor mostrou c6p4 com o título e o objetivo novos, o que confirma a importação do conteúdo no build.

**Não verificado.** Pacote do professor não enviado ao armazenamento (sem credencial `S3_*` neste ambiente); nenhum teste com alunos ou em projetor real.

### Décima quarta rodada (23/09/2026): c4p2, a reta que sai pelas duas pontas

Pedido do professor, com captura do palco: a cor não deixava evidente o trecho fora de 0% a 100%, e o exemplo não permitia passar de 100%.

**Causa.** Dois defeitos. O trecho vinho era desenhado antes da reta azul, com 7 contra 5 unidades de traço, e ficava coberto por ela: sobrava uma borda de uma unidade de cada lado. E o domínio parava em 100% de utilização, onde a reta prevê 97,50%; ela só passa de 100% a partir de 102,24%. O material original ia a 115%, com faixas rosas nas duas zonas inválidas; a peça nativa tinha perdido as duas coisas.

**O que mudou.** Domínio de 0% a 120%, com o trecho acima de 100% marcado no eixo como saldo acima do limite. As duas zonas fora de 0% a 100% são sombreadas e rotuladas, a faixa válida fica branca, os trechos vinho são desenhados por cima da reta azul e os cruzamentos ficam marcados em 12,8% e 102,2%. Atalhos 5%, 60% e 110%: 5% e 110% ficam os dois 8,68 pp fora do intervalo, um de cada lado, porque a reta é simétrica em torno de 57,5%, onde prevê 50%. O cartão Limites passa a dizer os dois cruzamentos; as frases do painel ficaram mais curtas e a fórmula do truncamento foi para a legenda. Roteiro do professor (leitura e interação) e explicações do guia do capítulo 4 reescritos: diziam que neste exemplo a reta não passava de 100%.

**Palco.** A primeira versão desta rodada ficou em 8,7 na auditoria (185 palavras, rótulos do painel a 1,56% da altura do slide) e foi corrigida pela causa, com frases mais curtas e corpo mínimo de 1,3cqw nos rótulos: 9,4 em 1400x900 e em 1920x1080, com 168 palavras e menor fonte a 1,76%. A nota da página antes da rodada não foi medida.

Verificado em 23/09/2026: typecheck; lint (0 erros; 5 avisos anteriores); `lint:tracos` (0); `npm test` (300, dois novos: as duas zonas rotuladas com os trechos vinho desenhados depois da reta azul, e os atalhos); `npx playwright test` (23 de 23, com o teste de aceitação atualizado para o texto novo e para a ponta de cima); varredura das 61 páginas nas duas rotas e quatro larguras (1920x1080, 1366x768, 1024x768, 390x844), com os estados clicados, sem defeito no build final; guias do capítulo 4 regerados (aluno com 34 páginas e professor com 43, as mesmas de antes), o do aluno copiado para `content/materiais`; pacote `guias-2026-09` remontado com o capítulo 4 novo.

**Não verificado.** Produção (esta rodada não foi publicada); pacote do professor não enviado ao armazenamento (sem credencial `S3_*` neste ambiente); nenhum teste com alunos ou em projetor real.

### Décima quinta rodada (23/09/2026): o editor de página em produção, c4p5 e c4p15

**Editor de página.** Em produção, o link "editar" de Conteúdo abria a página estática de erro 500 do Next. Localmente os 181 editores abriam. Evidência de que o defeito era de carregamento, e não de dado: sem sessão, `GET /api/professor/conteudo/paginas/<id>` respondia 500 em produção e 401 localmente, enquanto uma rota de controle respondia 405 nos dois lugares. O módulo do editor (`content-admin.ts`) importava no topo o sanitizador, que carrega o jsdom. O jsdom 30.0.1 declara Node 22.22.2 ou mais novo e, reproduzido aqui com os binários de Node do registro do npm, não carrega em Node 22.11 (dependência só em ES module) nem em 20.19; carrega em 22.14 e 24.0. O build da Vercel, num Node mais novo, rodava a importação com ele; as funções, não. Correção: jsdom fixado em 26.1.0 (Node 18 ou mais novo; conferido com DOMPurify em 20.19, 22.11, 22.14, 22.22 e 24.0, com a mesma saída), jsdom e dompurify movidos para as dependências de produção (estavam como de desenvolvimento, embora rodem no servidor), e o sanitizador passa a carregar só na hora de salvar, de modo que abrir o editor não depende dele. Testes: `tests/sanitize.test.ts` (o que o sanitizador remove e mantém, a versão do jsdom e a ausência de import no topo) e o teste de aceitação "editor de página", que abre o editor pela listagem, salva um rascunho com script e evento e confere a versão gravada limpa.

**c4p5 e c4p15.** Mesma correção do c4p2: frases mais curtas, sem mudar o sentido, e corpo mínimo nos rótulos. c4p5 de 8,7 para 9,4 em 1400x900 e de 9,1 para 9,4 em 1920x1080 (184 para 175 palavras); c4p15 de 8,7 para 9,4 nas duas (196 para 174 palavras; no painel, "Sem default · y = 0", a forma que a dica do gráfico já usava, para caber com a proposta #15 selecionada).

Verificado em 23/09/2026: typecheck; lint (0 erros; 5 avisos anteriores); `lint:tracos` (0); `npm test` (303, três novos); `npx playwright test` (24 de 24, um novo); varredura das 61 páginas nas duas rotas e quatro larguras, com os estados clicados, sem defeito (antes, a varredura pegou o painel do c4p15 vazando 16 px com a proposta #15 selecionada, corrigido nesta rodada); importação local com o jsdom 26 sem erro nas 181 páginas; guias do capítulo 4 regerados (34 e 43 páginas) e pacote do professor remontado.

**Não verificado.** O editor salvando em produção depende de login de professor, que não uso; a verificação possível sem credencial é a sonda sem sessão, feita depois do deploy.

### Décima sexta rodada (23/09/2026): c4p5 e c4p15 redesenhados na gramática do c4p2

**Diagnóstico.** Depois da décima quinta rodada, o c4p5 continuava no visual anterior ao sistema `.rl` (título serifado, três colunas, abas Réguas e Ver a função, pergunta com revelação), e no palco a moldura da página aparecia em volta dele. O c4p15 já estava no quadro 16:9, mas com gráfico de barras, sem faixa marcada, sem controle contínuo e com a base num formato diferente do c4p2.

**c4p5.** Quadro 16:9 no sistema `.rl`, com a página inteira substituída (`"pagina"`) e o quadro como tela do palco (`PALCO_PROPRIO`), como o c4p2. Faixa com a identidade ln(2 × odds) = ln(odds) + ln(2); à esquerda, a régua de PD (paredes em 0% e 100%) e a de log odds (setas nas pontas), cada uma com os dois passos e o veredito no alto; à direita, o painel com atalhos, controle, campo, tabela de odds, PD e log odds e a leitura; na base, Passos, Cuidado e Próximo passo. "Comparar os dois passos" espelha o passo ÷ 2 e pinta a diferença em vinho: 3,38 pp a mais em 33%, 4,44 pp a menos em 80%, nada em log odds. Saíram as três colunas, a aba da função e a revelação; a pergunta sobre a partida em 50% ficou no roteiro. As réguas mantêm uma geometria própria para o celular.

**c4p15.** O gráfico de barras deu lugar às duas curvas de perda, −ln(PD) em vinho para quem teve default e −ln(1 − PD) em verde para quem não teve, com as 16 propostas sobre elas; a faixa acima de ln 2 ≈ 0,69 marca onde o modelo deu mais de 50% ao outro desfecho (#2, #5, #10 e #15). Painel com atalhos #2, #10 e #15, controle de #1 a #16 e a conta da perda. "Subir o intercepto em 0,5" desloca os 16 pontos sobre as curvas: a #2 cai de 1,3223 para 0,9818, a #15 sobe de 1,3435 para 1,7352 e a média vai de 0,43282 para 0,45089, porque os coeficientes da aula já dão a menor média (gradiente da ordem de 10⁻⁶). Base em três cartões, como no c4p2.

**Defeitos achados e corrigidos na própria rodada.** Rótulo da proposta escolhida fora do gráfico (#12) ou sobre vizinhos (#3): o rótulo agora procura a posição livre mais próxima, com linha-guia quando fica afastado, e um teste percorre as 16 escolhas. Contorno de foco retangular nos pontos, vindo de regra sem camada do conteúdo legado: anel no próprio círculo. Painel do c4p5 cortado em até 31 px com mensagem do campo e comparação ligadas: a caixa da comparação ocupa o lugar da leitura e as mensagens do campo cabem numa linha. Aviso do campo que continuava depois de Restaurar. Painel do c4p15 cortado em 1 a 2 px com a #15 e a simulação ligadas: espaçamentos menores.

Verificado em 23/09/2026: typecheck; lint (0 erros; os mesmos 5 avisos); `lint:tracos` (0); `npm test` (311, oito novos); `npx playwright test` (24 de 24, blocos c4p5 e c4p15 reescritos); auditoria de palco com c4p2, c4p5 e c4p15 em 9,4 nas resoluções 1920x1080, 1400x900, 1366x768 e 1024x768 (177 e 167 palavras); varredura das 61 páginas em Aulas e Apresentação nas quatro larguras, com estados clicados, 61 de 61 nas oito combinações; estados fora da varredura (campo do c4p5 com 0,3; 0,5; 12,5; 99,8; 99,99; 0,01; texto; 0 e 100, com e sem comparação; c4p15 com as 16 propostas e a simulação ligada) sem corte em seis combinações de rota e largura; importação local (origem atualizada em c4p5 e c4p15); guias do capítulo 4 regerados (aluno com 33 páginas, antes 34; professor com 43) e pacote do professor remontado.

**Não verificado.** No celular, o gráfico do c4p15 encolhe com a tela, como o do c4p2, e os rótulos ficam pequenos; o painel ao lado tem os mesmos números.

### Décima sétima rodada (23/09/2026): c5p4 no quadro `.rl`, com fórmulas em KaTeX e a taxa de erro do nó

**Pedido.** Fórmulas em LaTeX e melhor exposição dos dois gráficos do c5p4, as curvas de impureza e o quadrado Como ler o Gini.

**Diagnóstico.** O c5p4 estava no visual anterior ao sistema `.rl`: fórmulas numa caixa monoespaçada, curvas num desenho de 640 × 300 com a entropia tracejada e só o valor do Gini no ponto, e o quadrado da leitura com 220 px de lado, as células de erro sem valor. Achado da rodada: a distinção entre impureza e taxa de erro do nó que a revisão pedagógica pediu para esta página (M21, em 22/09/2026: a terceira curva, mín(p, 1 − p), e o contraexemplo de 0,21875 para 0,12500) foi escrita só no visual herdado, que o componente nativo substitui desde 18/09/2026. Na plataforma, nunca apareceu.

**c5p4.** Quadro 16:9 no sistema `.rl`, página inteira e tela do palco, como c4p2, c4p5 e c4p15. Faixa com as duas fórmulas em KaTeX, pelo componente `tex.tsx`, com MathML para leitor de tela. À esquerda, Gini e entropia contra p, com a taxa de erro do nó pontilhada por baixo e o nome dela deitado no flanco livre; os três pontos na guia de p; os valores de Gini e entropia ao lado dos pontos, postos por um posicionador que evita curvas, pontos, textos e bordas, entre 7% e 93% (fora disso, os pontos se juntam no canto e os valores ficam só no painel); o simétrico 1 − p sob demanda; clique ou arrasto sobre o gráfico. Ao centro, o quadrado com as quatro células legíveis, as de erro em vinho, e Pr(erro) = 2p(1 − p) em KaTeX. À direita, o painel, com a leitura das duas chances de errar: em 10%, "Prevendo a maioria, o nó erra 10%; sorteando o rótulo, 18,0%, que é o Gini." Na base, Não é taxa de erro (o contraexemplo, calculado pela própria árvore do curso: do 1º para o 2º nível, o Gini ponderado cai de 0,21875 para 0,12500 e os erros seguem 2 em 16), Não é risco e No curso. Roteiro do professor, apoio da página e explicações do guia reescritos com a mesma distinção.

**Defeitos achados e corrigidos na própria rodada.** Primeira versão do quadro com 186 palavras e nota 9,1 no palco: enxugada para 177 e, com a M21, 174. Células com uma casa que não somavam o Gini: duas casas. Células finas sem rótulo: rótulo deitado ou em pé. Valores sobre as curvas em 50% e, com a terceira curva, rótulos longe dos pontos e linhas-guia cruzando texto: posicionador com custos e restrições, conferido por um teste independente em 202 estados. Rótulos p e 1 − p do simétrico sobre os pontos perto da base (1% e 99%, defeito anterior à rodada): agora os dois somem juntos quando encostam num ponto. No celular, a fórmula da entropia quebrava: 15 px com rolagem lateral na faixa.

Verificado em 23/09/2026: typecheck; lint (0 erros; os mesmos 5 avisos); `lint:tracos` (0); `npm test` (319, oito no arquivo do c5p4, entre eles a conferência independente dos rótulos contra as curvas em 202 estados e a renderização do c5p5); `npx playwright test` (24 de 24, bloco do c5p4 novo); auditoria de palco com o c5p4 em 9,4 nas resoluções 1920x1080, 1400x900, 1366x768 e 1024x768 (174 palavras; menor fonte a 1,76% da altura); varredura das 61 páginas em Aulas e Apresentação nas quatro larguras, com estados clicados, 61 de 61 nas oito combinações; painel e quadrado do c5p4 sem corte em sete combinações de rota e largura, com o simétrico ligado, em 0%, 1%, 3%, 10%, 36%, 50%, 64%, 90%, 97%, 99% e 100%; importação local (origem atualizada em c5p4); guias do capítulo 5 regerados (aluno com 28 páginas, as mesmas de antes; professor com 36) e pacote do professor remontado.

**Não verificado.** No celular, o gráfico encolhe com a tela e os rótulos ficam pequenos, como no c4p2 e no c4p15; o painel ao lado tem os mesmos números. As caixas de colisão têm folga para a fonte Inter, primeira da pilha, mas o desenho foi conferido só com a fonte que o ambiente tem (métrica de Arial).

### Décima oitava rodada (24/09/2026): fórmulas em KaTeX nos componentes nativos, c5p5 com a tabela base e c5p6 reestruturado

**Pedido.** Levar ao KaTeX as fórmulas que ainda estavam em caixa monoespaçada; no slide 5, a tabela base não aparecia; o slide 6, além do layout ruim, não era didático e precisava ser reestruturado.

**Diagnóstico.** A tabela das 16 propostas do c5p5 existia no componente, mas uma regra de palco da décima segunda rodada (`.vz-imp-base { display: none }`) a escondia para a página caber; só aparecia no estudo e no guia. O c5p6 ocupava duas telas no palco, repetia a mesma conta em quatro lugares (frase de estado, tabela, fórmula monoespaçada e rodapé), mostrava as propostas em círculos de 11 px na projeção e não tinha uma sequência de passos. Restavam 12 fórmulas em caixa monoespaçada em 11 componentes nativos.

**Fórmulas.** Componente `Formula` sobre o `tex.tsx` do c5p4, que mantém a caixa e a classe `.vz-formula`, para as regras de palco continuarem valendo. Convertidas as fórmulas de c1p7, c2p7, c3p15, c3p16, c3p17, c5p15 e c6p2, visíveis no estudo; as de c4p17 (modos perda e gradiente) e a de `curva-logistica.tsx` ficam em caminhos sem página e foram convertidas por consistência; as de c5p5 e c5p6 entraram nos redesenhos. Não resta caixa monoespaçada nos componentes nativos, e as páginas convertidas mantiveram a nota de palco.

**c5p5.** Quadro 16:9 no sistema `.rl`, página inteira e tela do palco. A base das 16 propostas fica na tela, com as linhas do grupo escolhido acesas; ao centro, as propostas do grupo em duas fileiras, default e pagou, e a conta em KaTeX; no painel, a raiz e as duas folhas, tiradas da própria árvore de profundidade 2: a pura, 0 default em 6 (#3 a #8), e a mista, 1 em 2 (#15 e #16). Cartões A referência, Folha pura e O tamanho conta.

**c5p6.** Reestruturado em passos, na mesma gramática. Onde cortar: as 16 propostas em ordem da variável, com o corte como linha entre duas delas; cada fronteira entre valores diferentes é um candidato clicável, e dentro de um empate não há fronteira, porque nenhum corte separa valores iguais. A conta, passo a passo: 1, antes (a raiz); 2, cada lado, com o peso na aresta; 3, a média ponderada; 4, o ganho, em KaTeX. No painel, utilização e atraso, atalhos 22,5%, 27,5%, 57,5% e 62,5% (7,5, 15 e 27,5 dias no atraso), controle, leitura e Comparar com a média simples, que ataca o erro previsível do roteiro: em 22,5%, 0,25111 sem ponderar contra 0,03333 do ganho correto; em 57,5%, as duas médias coincidem, porque os lados têm 8 propostas cada. Cartões Pesa o tamanho, Ganho zero e O melhor da raiz. A pergunta de checagem continua na página de estudo; no palco, a página passa de duas telas para uma. (Correção da décima nona rodada: a questão c5p6q, ancorada no texto e não curada, sumiu do estudo com a troca do registro para `"pagina"` e voltou na rodada seguinte.)

**Defeitos achados e corrigidos na própria rodada.** A regra sem camada do conteúdo herdado (`.conteudo thead th`, `.conteudo td`) pintava de azul-marinho o cabeçalho da tabela nova e cortava as três últimas linhas no palco: regras da tabela com especificidade maior, sem `!important`. A régua numérica do c5p6 deixava as propostas com 11 px na projeção: trocada pela lista ordenada. Nós da árvore com textos sobrepostos, coluna central alargada pelas contas em KaTeX (nó da direita e conta cortados), "1 propostas" e passos numerados em duplicidade: corrigidos. A primeira versão dos dois quadros ficou em 9,1 no palco (182 e 198 palavras) e foi enxugada para 174 e 177. A varredura de layout acusou os 15 botões de candidato do c5p6 passando 4 px abaixo da linha de cada proposta: os botões entraram na própria linha, com o losango e o traço do corte desenhados na borda de baixo. A questão curada do c5p6 falava em quinze propostas com sete defaults do outro lado, mas a própria explicação calcula o corte de 22,5%, que deixa quinze com oito, como o slide mostra: corrigida para oito na origem e, no banco, por um patch do importador (`patchC5p6q`, no molde do de c3p7q), porque questão do material original só ganha versão nova com `--republish`; a resposta e o ganho (0,03333) não mudam. A importação roda no build de produção (`docs/09-ativacao-producao.md`), e a nova versão entra no próximo deploy. CSS das versões antigas (`vz-imp-*`, `vz-cc-*`) removido, e o componente antigo do c5p5 apagado (três das regras `vz-cc-*` ainda estavam em uso em c2p7, c5p9 e c5p18 e voltaram na vigésima segunda rodada).

Verificado em 24/09/2026: typecheck; lint (0 erros; os mesmos 5 avisos); `lint:tracos` (0); `npm test` (326; c5p5 com 3 testes e c5p6 com 5, entre eles a conta do exemplo, a ponderação em 22,5% e 57,5%, ganho nunca negativo nos 21 candidatos e a lista com os 15 candidatos da utilização); `npx playwright test` (24 de 24, blocos do c5p5 e do c5p6 reescritos; repetido depois da correção dos botões de candidato); auditoria de palco com c5p5 e c5p6 em 9,4 em 1920x1080, 1400x900, 1366x768 e 1024x768 (174 e 177 palavras; medida antes da correção dos botões de candidato, que trouxe o rótulo do corte a 1,15 cqw e levou o c5p6 a 9,0, corrigido para 9,4 na décima nona rodada) e as páginas do item 1 com as mesmas notas de antes (c1p7 9,9; c2p7 9,9; c3p15 9,8; c3p16 9,9; c3p17 9,9; c4p17 9,9; c5p15 9,9; c6p2 10,0, em 1920x1080 e 1366x768); fórmulas convertidas sem estouro na página de estudo; estados dos dois quadros sem corte em sete combinações de rota e largura (os três grupos do c5p5; os 21 cortes do c5p6 com a comparação ligada); varredura das 61 páginas em Aulas e Apresentação nas quatro larguras, com estados clicados: 61 de 61 nas oito combinações; importação local (origem atualizada em c5p5 e c5p6; o patch da c5p6q criou a versão 6 na edição 2026, e a importação seguinte não criou outra); guias dos capítulos 5 e 6 regerados (capítulo 5: aluno com 28 páginas e professor com 36; capítulo 6: 28 e 38, as mesmas de antes; o do capítulo 5 regerado de novo com a questão corrigida) e pacote do professor remontado.

**Não verificado.** A nota de palco do c5p5 caiu de 10,0 para 9,4, porque a tabela de 16 linhas soma palavras ao quadro: é o custo de pôr a base no slide. No celular, a árvore do c5p6 encolhe com a tela, como os gráficos dos outros quadros.

### Décima nona rodada (24/09/2026): c4p3, c4p4 e c4p6 no quadro .rl; a questão do c5p6 de volta ao estudo

**Pedido.** Seguir com o redesenho de c4p3, c4p4 e c4p6 na gramática do c4p2, como c4p5, c4p15 e c5p4 a c5p6.

**Diagnóstico.** Os três slides ainda usavam o visual anterior ao sistema `.rl`: no palco, a moldura com o título da página, botões de etapa e, no c4p3, uma grade de cem quadrados que ocupava a tela inteira; no c4p4, o gráfico com rótulos de 10 px na projeção e as fórmulas em frações de texto; no c4p6, quatro réguas e uma tabela de 13 linhas com cabeçalho azul-marinho. A auditoria de palco dava 9,8, 9,4 e 9,9, porque mede densidade e tamanho de fonte, não a gramática. Na mesma leitura, duas falhas da rodada anterior: a questão c5p6q não aparecia mais no estudo, e o c5p6 publicado estava em 9,0 no palco, não em 9,4.

**c4p3.** Quadro 16:9, página inteira e tela do palco. Faixa com defaults esperados = 100 × PD e 0% ≤ PD ≤ 100% em KaTeX. Cem operações com a mesma PD numa grade de 10 × 10; o mesmo incremento em três pontos da escala (5%, 50% e a PD escolhida), com a faixa acima de 100% em vinho; no painel, a PD escolhida mais o incremento em destaque e as odds da PD, a ponte para a página seguinte. As etapas de revelação saíram. Cartões O que ela afirma, Onde ela aperta e Próxima escala.

**c4p4.** A função odds(p) numa janela fixa de 0 a 20, com a linha de odds 1 e a assíntota; a mesma PD em três leituras ligadas (20%, 0,25 e 1 : 4); no painel, a conversão nos dois sentidos e "Comparar p e 1 − p", que põe o complemento no gráfico e mostra as odds recíprocas e, no logaritmo, simétricas. Cartões Leitura, Sem teto e Assimetria.

**c4p6.** A mesma PD em quatro réguas ligadas por uma linha tracejada (a ordem é a mesma nas quatro), a tabela de tradução com nove PDs e a linha mais próxima acesa, o painel com o quadro Cuidado (de 1% para 2%, o escore cai 64 pontos; de 5% para 10%, 67) e, na base, os quatro usos. `escalas.tsx` foi apagado.

**Correções da rodada anterior.** A troca do c5p6 para `"pagina"` tirou do estudo a questão c5p6q, que está ancorada no texto da página e não é o exercício do quadro (em c4p10 e c4p11, que também têm questão ancorada, ela é o exercício e fica no quadro). O c5p6 passou a `"conteudo"`, e o `ContentBlocks` agora mostra, nesse modo, só o quadro no palco de quadro próprio: no estudo, a questão volta depois do quadro; no palco, continua uma tela. O rótulo do corte do c5p6, que a correção dos botões de candidato deixou em 1,15 cqw, passou a 1,3 cqw, e o c5p6 volta a 9,4.

**Defeitos achados e corrigidos na própria rodada.** A primeira versão dos três quadros ficou em 9,0, 9,0 e 8,7 no palco: textos a 1,2 cqw abaixo do piso de legibilidade e, no c4p6, 185 palavras; textos a 1,3 cqw e tabela de 11 para 9 linhas, mantendo os pares complementares. No c4p4, o rótulo da assíntota ficava riscado pela linha de odds 1, a caixa da comparação cortava na coluna das leituras (foi para o painel) e a marca "acima da janela" colidia com o rótulo de 95%. Ao clicar em "Restaurar exemplo" com um erro no campo, o erro sumia no blur, o botão subia e o clique caía fora dele (o e2e pegou); a mensagem agora fica até o valor mudar. Na verificação de estados extremos: o aviso longo do campo de odds transbordava o painel (avisos encurtados, campos empilhados), a regra sem camada `.conteudo table` dava 8 px de margem à tabela do c4p6 e a deixava 2 px maior que a caixa em 1024x768 (neutralizada também na do c5p5), e, no celular, a fórmula longa da faixa do c4p6 ficava centralizada num contêiner com rolagem e perdia a parte esquerda (faixas alinhadas à esquerda e com quebra de linha). Nas réguas do c4p6, a linha tracejada riscava notas e marcas (halo branco) e as paredes cortavam 0% e 100%. CSS dos visuais anteriores removido por seletor (168 seletores de `vz-ep-*`, `vz-eo-*` e das réguas antigas), sem tocar nas regras compartilhadas.

Verificado em 24/09/2026: typecheck; lint (0 erros; os mesmos 5 avisos); `lint:tracos` (0); `npm test` (334; c4p3 com 6 testes, c4p4 com 9 e c4p6 com 4, entre eles a reprodução da tabela de tradução, a ordem nas quatro escalas e a renderização dos três quadros); `npx playwright test` (24 de 24, blocos de c4p3, c4p4 e c4p6 reescritos e o do c5p6 cobrindo a questão no estudo e a ausência dela no palco); auditoria de palco com c4p3, c4p4, c4p6, c5p5 e c5p6 em 9,4 em 1920x1080, 1400x900, 1366x768 e 1024x768 (166, 165, 177, 174 e 177 palavras; menor fonte a 1,76% da altura); 252 estados extremos dos três quadros sem corte em sete combinações de rota e largura; varredura das 61 páginas em Aulas e Apresentação nas quatro larguras, com estados clicados: 61 de 61 nas oito combinações; importação local (origem atualizada em c4p3, c4p4 e c4p6); guias do capítulo 4 regerados (aluno com 32 páginas, eram 33; professor com 43) e do capítulo 5 (28 e 36, as mesmas), com as figuras novas; pacote do professor remontado.

**Não verificado.** A questão c5p6q em produção, que depende deste deploy e só aparece com sessão de aluno. No celular, as réguas e o gráfico encolhem com a tela, como os gráficos dos outros quadros; o texto das réguas do c4p3 e do c4p6 ganhou tamanho próprio na largura estreita.

### Vigésima rodada (24/09/2026): fórmulas de c4p2, c4p5 e c4p15 em KaTeX

**Pedido.** Converter para KaTeX as fórmulas das faixas de c4p2, c4p5 e c4p15, que apareciam em texto simples a 2,1 cqw, fora do padrão de c4p3, c4p4, c4p6 e c5p4 a c5p6.

**O que mudou.** Faixas em KaTeX, no tamanho das faixas dos quadros novos (1,6 cqw): no c4p2, a reta p(u) = −0,1426 + 0,011176 × u; no c4p5, a identidade ln(2 × odds) = ln(odds) + ln(2) e a definição dos log odds; no c4p15, perda = −ln(PD) e perda = −ln(1 − PD), nas cores de cada desfecho. Na mesma leva, as outras duas fórmulas de texto desses quadros: a do truncamento na legenda do c4p2, mín(1; máx(0; p)), e a conta da perda no painel do c4p15 (−ln(0,2665) ≈ 1,3223 na proposta #2), que agora pode quebrar depois do ≈ quando o painel estreita. Cada fórmula leva o texto como rótulo acessível (`role="img"`), e os testes passaram a conferir a fórmula exata por esse rótulo. As versões em texto continuam nas bibliotecas; as versões TeX saem das mesmas contas, com a vírgula decimal protegida. No celular, as faixas alinham à esquerda e quebram linha, como nos quadros novos.

Verificado em 24/09/2026: typecheck; lint (0 erros; os mesmos 5 avisos); `lint:tracos` (0); as 22 fórmulas TeX novas renderizadas pelo KaTeX sem erro (incluindo a conta das 16 propostas do c4p15); `npm test` (334, com os testes de renderização dos três quadros conferindo o KaTeX e o rótulo acessível); `npx playwright test` (24 de 24, blocos de c4p2, c4p5 e c4p15 conferindo as fórmulas pelo rótulo); auditoria de palco com c4p2, c4p5 e c4p15 em 9,4 em 1920x1080, 1400x900, 1366x768 e 1024x768 (165, 170 e 164 palavras; antes, 168, 177 e 167); 245 estados extremos sem corte em sete combinações de rota e largura (atalhos, campos nos extremos, truncamento, comparações e as 16 propostas do c4p15 com e sem a simulação); varredura das 61 páginas em Aulas e Apresentação nas quatro larguras, com estados clicados: 61 de 61 nas oito combinações; guia do capítulo 4 regerado com as figuras novas (aluno com 32 páginas e professor com 43, as mesmas) e pacote do professor remontado.

**Não verificado.** A leitura das fórmulas por leitor de tela real; o rótulo acessível foi conferido pelo papel e pelo nome no e2e.

### Vigésima primeira rodada (24/09/2026): fórmulas e contas de c4p1, c4p10, c4p11, c4p12, c4p14 e c4p16 em KaTeX

**Pedido.** Seguir com a conversão para KaTeX nos seis quadros `.rl` do capítulo 4 que ainda mostravam fórmulas e contas em texto.

**Regra aplicada.** Vai para KaTeX toda expressão com operador ou relação: equações e definições (=, ≈), contas (×, ÷, +, −), frações, potências e funções (exp, média). Vale também para o trecho de fórmula dentro de uma frase, que sai em linha pelo novo `ComTex` (`src/components/visuais/tex.tsx`: texto com trechos TeX entre cifrões); na mesma frase, os símbolos soltos acompanham. Continuam em texto: títulos, subtítulos, cabeçalhos e células de tabela, rótulos dentro dos gráficos, valores isolados com unidade (+10 pp, × 2,11, 56,18%) e o glossário de siglas do rodapé. A fórmula que é bloco próprio leva o texto como rótulo acessível (`role="img"`); nas frases, a leitura vem do MathML do KaTeX.

**O que mudou.**
- c4p1: a soma z = β₀ + β₁x₁ + β₂x₂, as contas das unidades (70% ÷ 10 pp = 7,0 unidades), as contas das parcelas (0,7453 × 7,0), o escore z ≈ 0,2483, a PD em fração, a potência e^0,7453 ≈ 2,11, o coeficiente fixo e a conta de p novo com m = e^(β·Δx).
- c4p10: o β = 0,7453 do enunciado, as contas Δx = (80 − 70) ÷ 10 = 1 e Δz = β × 1 = 0,7453, os trechos de fórmula dos retornos B e C e a síntese depois de conferir.
- c4p11: as três fórmulas do caminho e as três contas da conversão (odds₀ = 0,10 ÷ 0,90; odds₁ = odds₀ × 2,1071; PD₁ = odds₁ ÷ (1 + odds₁)).
- c4p12: o Δz = +0,7453 do experimento, a conta da PD final, a legenda de p e m e o m = exp(Δz) do rodapé.
- c4p14: a definição de x de cada unidade, a soma −5,6666 + 5,2171 + 0,6978, o escore e o detalhe da razão de odds (o Δx de cada unidade, β × Δx = 0,7453 e OR = exp(β × Δx) ≈ 2,11). A tabela das três unidades continua em texto.
- c4p16: os coeficientes (β₀ = β₁ = β₂ = 0 no começo; depois da primeira iteração, o vetor β = (β₀; β₁; β₂), no lugar de "β₀ 0,00000 · β₁ 0,05938 · β₂ 0,02344"), as três componentes do gradiente com o valor, o exemplo g₁ e a sua conta, a regra β novo = β atual − ηg com η = 0,10 e os símbolos da legenda e das contribuições.
- Tamanhos: o KaTeX desenha a 1,21 em; as caixas das fórmulas ficaram cerca de 7% menores que a letra do texto que substituíram, e os trechos em linha a 1,1 em, para a altura dos algarismos bater com a do texto. Onde um valor em KaTeX divide a linha com valores em texto (c4p10, c4p12, c4p14 e c4p16), a altura de linha do KaTeX foi igualada à dos vizinhos, para os rótulos continuarem alinhados.

**Achados e correções da verificação.**
1. c4p16 no celular: o quadro "Exemplo: coeficiente da utilização" não tinha tamanho próprio na tela estreita e caía a 4 a 9 px (medido a 390 px antes da mudança). Agora vai de 12 a 22 px, e o título das contribuições fica a 14 px.
2. c4p16 no palco: depois da primeira iteração, o vetor na forma (β₀; β₁; β₂) = (…) invadia a coluna vizinha. Ficou β = (…; …; …), e a primeira coluna ganhou largura.
3. c4p1 no estudo, em 1366 e 1920 px: o painel da tela 2 passava 5 px da caixa (a frase com β em KaTeX tem descendente). Os intervalos do painel diminuíram.
4. c4p12 no estudo a 1920 px: com a conta aberta, a conta da PD final escrita em fração ocupava duas linhas e espremia os resultados do painel; a varredura acusou 10 px de vazamento, que a checagem de estados extremos não pegava (ela olha caixas que cortam, e esta vazava por cima da vizinha). A conta voltou à forma em linha, a mesma do texto original.
5. Auditoria de palco: a contagem de palavras incluía o MathML do KaTeX, que só existe para leitor de tela; com isso o c4p14 caía de 9,0 para 8,7 sem nenhuma mudança visível. A contagem passou a ignorá-lo, como a checagem de corte já fazia; a mudança só mantém ou sobe a nota de páginas com KaTeX. As nove páginas convertidas nas rodadas anteriores (c4p2 a c4p6, c4p15 e c5p4 a c5p6) foram remedidas nas quatro resoluções: continuam em 9,4, agora com 160 a 173 palavras; c4p2, c4p5 e c4p15 tinham 165, 170 e 164 pela contagem antiga e ficaram com 163, 166 e 160.

**Notas de palco** (auditoria em 1920x1080, 1400x900, 1366x768 e 1024x768; antes e depois, em 24/09/2026):

| Quadro | Antes | Depois | Palavras antes e depois (1920x1080) |
|---|---|---|---|
| c4p1 | 9,0 nas duas telas | 9,2 na tela 1 e 9,0 na tela 2 | 160 e 152; 132 e 149 |
| c4p10 | 9,4 (9,0 em 1024x768) | 9,4 (9,0 em 1024x768) | 164; 162 |
| c4p11 | 9,0 | 9,0 | 170; 157 |
| c4p12 | 9,3 | 9,3 | 127; 123 |
| c4p14 | 9,0 | 9,0 | 180; 178 |
| c4p16 | 9,1 (8,7 em 1024x768) | 9,4 (9,0 em 1024x768) | 209; 175 |

Verificado em 24/09/2026: typecheck; lint (0 erros; os mesmos 5 avisos); `lint:tracos` (0); `npm test` (337, com `tests/tex-capitulo-4.test.ts` renderizando pelo KaTeX mais de 400 expressões dos seis quadros em todos os estados dos controles, sem % solto, vírgula decimal sem proteção nem sinal de menos tipográfico, e conferindo o KaTeX e o rótulo acessível de cada quadro); `npx playwright test` (24 de 24, blocos dos seis quadros conferindo as fórmulas pelo rótulo); auditoria de palco na tabela acima; 287 estados extremos sem corte em sete combinações de rota e largura, com uma checagem nova de fórmula que passa da caixa que a contém (40 iterações no c4p16, os extremos dos campos, todas as alternativas conferidas); varredura das 61 páginas em Aulas e Apresentação nas quatro larguras, com estados clicados: 61 de 61 nas oito combinações (a primeira passada acusou o c4p12, corrigido); guia do capítulo 4 regerado com as figuras novas (aluno com 32 páginas e professor com 43, as mesmas) e pacote do professor remontado.

**Não verificado.** A leitura por leitor de tela real, inclusive a das frases com trechos em KaTeX, lidas pelo MathML; os rótulos acessíveis foram conferidos pelo papel e pelo nome no e2e. No celular, o c4p14 continua com a tabela das três unidades em rolagem lateral, como antes desta rodada.

### Vigésima segunda rodada (24/09/2026): o capítulo 5 revisto com as lentes do capítulo 4

**Pedido.** Revisar o capítulo seguinte com o que se aprendeu no capítulo 4. Lentes aplicadas às 19 páginas do capítulo 5: fórmulas e contas em KaTeX pela regra da vigésima primeira rodada; nota de palco 9 ou mais; legibilidade no celular; nada vazando no estudo; estados extremos; rótulos que se atropelam nos gráficos.

**Linha de base** (medida em 24/09/2026, antes das mudanças). Palco: 16 páginas entre 9,8 e 10; c5p4, c5p5 e c5p6 em 9,4 (densidade: 168 a 171 palavras); c5p2 em 9,4 só em 1366x768 (rótulos "Logística" e "Árvore" a 1,68% da altura do slide). Fórmulas e contas em texto em c5p3, c5p4, c5p7, c5p12, c5p14, c5p15, c5p16 e c5p18. Rótulos atropelados por linhas em c5p7, c5p14, c5p15 e c5p16 e números das propostas fora dos pontos em c5p9 e c5p18 (regressão descrita abaixo). Três legendas citavam caminho de arquivo. No celular (390 px), os gráficos em SVG desenham rótulos de 4,8 a 6,5 px.

**Refinamentos da regra.** A regra continua a da vigésima primeira rodada; o capítulo 5 pediu quatro esclarecimentos, que valem daqui em diante:
1. A regra de corte que nomeia um nó ou uma opção (utilização ≤ 57,5%, atraso ≤ 2,5 dias) fica em texto em qualquer lugar, inclusive dentro de frase: é o nome da pergunta, como um rótulo.
2. Fórmula escrita com palavras vai para KaTeX quando tem operador ou relação (ganho = Gini antes − média ponderada do Gini dos dois lados); a frase que descreve a conta sem símbolo fica em texto.
3. Fração usada como valor com unidade (peso 1/16) fica em texto, como os demais valores com unidade.
4. Letra grega usada como nome (α em "Preço de cada folha, α") fica em texto; na frase que tem fórmula convertida, acompanha a fórmula.

**O que mudou.**
- Fórmulas e contas em KaTeX:
  - c5p3: o d de "profundidade máxima d" e a frase "profundidade d permite até 2^d folhas".
  - c5p4: a chance de errar ao sortear o rótulo, Pr(erro) = 2p(1 − p) = 50,00%, com o texto como rótulo acessível.
  - c5p7, c5p14 e c5p16: a conta do ganho do candidato, 0,50000 − (9 ÷ 16 × 0,3457 + 7 ÷ 16 × 0,2449) = 0,19841, com o texto como rótulo acessível (`contaGanho` em `arvore-que-cresce.tsx`), e a fórmula do ganho na legenda.
  - c5p12: a conta 1 ÷ 2 = 50,0%, que continua inteira numa linha (`.tx-inteira`), e a fórmula da perda média na legenda, com d = 1 e n = 2.
  - c5p15: o α atual e os dois pontos de troca na frase de estado, e as três igualdades de α da legenda.
  - c5p18: o y da proposta na frase de estado e os três da legenda.
  - Os números entram nas fórmulas por `src/lib/visuais/tex.ts` (`paraTex` e `pctTex`: sinal de menos do TeX, vírgula decimal protegida e % escapado), agora compartilhado com o capítulo 4. Nas frases de estado, os trechos em KaTeX não quebram linha por dentro.
- Rótulos nos gráficos:
  - c5p15: os nomes das quatro retas saíram de cima das linhas, onde "1 folha" era cortado pela reta de duas folhas, para a margem direita, depois da ponta de cada reta; o rótulo do α atual, que ficava junto do ponto, no cruzamento das quatro retas, subiu para a faixa livre do topo, ligado ao ponto por uma régua vertical que atravessa o gráfico; as linhas de troca param abaixo dessa faixa, e os nomes das trocas ganharam halo e passam na frente da régua.
  - c5p7, c5p14 e c5p16: os rótulos das regiões do plano (8 · 1 def · PD 13%) passaram a ser desenhados depois da linha do corte candidato, com halo.
  - c5p9: o rótulo do melhor corte subiu para cima do gráfico.
  - O rótulo "100%" do eixo horizontal era cortado na borda direita do desenho em c5p7, c5p8, c5p11, c5p12, c5p14 e c5p16 (de 1,2 a 6 px, conforme a tela) e em c5p4 no celular: margens direitas ampliadas. A do plano das 16 propostas vale também para o c5p2, que usa a mesma geometria e ficava no limite, sem corte medido.
- Palco: no c5p2 em 1366x768, os rótulos "Logística" e "Árvore" ficavam a 12,9 px, abaixo do mínimo de 1,7% da altura; ganharam piso de 13,5 px.
- Legendas sem caminho de arquivo: c5p8 (`content/generated/dados.json`), c5p10 e c5p13 (`src/lib/visuais/arvore.ts`).

**Regressão corrigida, introduzida na décima oitava rodada.** A limpeza de CSS do commit 95d8ed6 (24/09/2026) apagou, junto com o CSS do c5p6 antigo, que usava o mesmo prefixo, três regras ainda em uso: `.vz-cc-id` (o número da proposta dentro do ponto) e `.vz-cc-tile--esq` e `.vz-cc-tile--dir` (a borda colorida dos cartões de cada lado). Efeito em produção desde aquela rodada até esta: em c2p7, c5p9 e c5p18, os números das propostas saíam em preto, na letra padrão, maiores que os pontos e por cima deles; em c2p7 e c5p9, os cartões perderam a borda verde ou vinho. As regras voltaram, com comentário sobre quem as usa; a revisão da limpeza da décima nona rodada não achou outra regra em uso apagada. A varredura e a auditoria de palco não pegam esse defeito, porque o texto continua dentro do desenho; foi achado olhando as telas.

**Achados fora do capítulo 5, não corrigidos.** A checagem de rótulos de SVG criada nesta rodada (sobreposição entre rótulos e corte na borda do desenho, no estado inicial, estudo e palco, 390 e 1920 px) acusou nos capítulos 4 e 6: c4p4 no celular, «0» sobre «0%» e "100%" cortado; c4p6 no celular, "100%" cortado; c6p12, c6p13 e c6p14, rótulos de porcentagem sobrepostos («45%» sobre «55%», «33%» sobre «58%») e "100%" cortado, no estudo e no palco; c6p20 no palco a 1920 px, «DESFECHO» fora do desenho. Estão nas pendências.

**Notas de palco** (auditoria em 1920x1080, 1400x900, 1366x768 e 1024x768; antes e depois, em 24/09/2026; pior nota das quatro resoluções):

| Página | Antes | Depois | Palavras a 1920x1080, antes e depois |
|---|---|---|---|
| c5p2 | 9,4 (em 1366x768; 9,8 nas demais) | 9,8 (10 em 1024x768) | 96 e 96 |
| c5p3 | 10 | 10 | 70 e 64 |
| c5p4, c5p5 e c5p6 | 9,4 | 9,4 | 171, 168 e 169, iguais |
| c5p12 | 10 | 10 | 88 e 87 |
| c5p15 | 9,9 | 9,9 | 111 e 105 |
| c5p18 | 9,9 | 9,9 | 113 e 110 |
| c5p1, c5p7 a c5p11, c5p13, c5p14, c5p16, c5p17 e c5p19 | 9,8 a 10 | iguais | iguais |
| c2p7 | não medido | 9,9 | 115 |

c5p4, c5p5 e c5p6 seguem em 9,4 pela densidade de texto dos quadros `.rl` (168 a 171 palavras; 9 no critério pede até 140), como desde a décima oitava rodada.

Verificado em 24/09/2026: typecheck; lint (0 erros; os mesmos 5 avisos); `lint:tracos` (0); `npm test` (340, com `tests/tex-capitulo-5.test.ts` renderizando pelo KaTeX mais de 300 expressões: a conta do ganho de todos os candidatos nas duas variáveis, com a base completa e sem cada uma das 16 propostas, Pr(erro) de 0% a 100% e α de 0 a 0,35, sem % solto, vírgula decimal sem proteção nem sinal de menos tipográfico, e conferindo o KaTeX e o rótulo acessível de seis quadros); `npx playwright test` (24 de 24; o bloco do c5p4 passou a conferir a chance de errar pelo rótulo acessível); auditoria de palco na tabela acima; rótulos do c5p15 em 71 valores de α, de 0 a 0,35, sem cruzar linha, outro rótulo nem o ponto (o detector acusou 23 estados quando a régua deixou de ser dispensada); rótulos de SVG do capítulo 5 e do c2p7 sem sobreposição nem corte na borda em 1920x1080, 1366x768, 1024x768 e 390x844, estudo e palco; 455 estados extremos sem corte (cada botão, cada opção de lista e cada controle no mínimo e no máximo de c2p7, c5p3, c5p4, c5p7, c5p9, c5p12, c5p14, c5p15, c5p16 e c5p18, em Apresentação 1920x1080, 1366x768 e 1024x768 e Aulas 1366x768 e 390x844; com cortes forçados por estilo injetado, o detector os acusou); varredura das 61 páginas em Aulas e Apresentação nas quatro larguras, com estados clicados: 61 de 61 nas oito combinações; telas conferidas no palco, no estudo e a 390 px; guia do capítulo 5 regerado com as figuras novas (aluno com 28 páginas e professor com 36, as mesmas de antes) e pacote do professor remontado.

**Não verificado.** A leitura por leitor de tela real; os rótulos acessíveis foram conferidos pelo papel e pelo nome. No celular, os gráficos do capítulo 5 continuam com rótulos pequenos (pendência abaixo, com a recomendação), e a tabela do c5p15 continua com rolagem lateral, como antes.

### Vigésima terceira rodada (24/09/2026): o capítulo 6 revisto com as lentes dos capítulos 4 e 5

**Pedido.** Seguir com o capítulo 6, aplicando às 20 páginas as lentes da rodada anterior: fórmulas e contas em KaTeX pela regra; nota de palco 9 ou mais; legibilidade no celular; nada vazando no estudo; estados extremos; rótulos que se atropelam ou são cortados nos gráficos. No mesmo pacote, os rótulos de c4p4 e c4p6 achados na vigésima segunda rodada.

**Linha de base** (medida em 24/09/2026, antes das mudanças). Palco: as 20 páginas entre 9,6 e 10 na pior das quatro resoluções; c6p7, c6p8, c6p9, c6p12 e c6p20 em 9,6. Fórmulas e contas em texto em 17 das 20 páginas; c6p17, c6p18 e c6p19 não têm nenhuma pela regra. Rótulos: em c6p12, c6p13 e c6p14, porcentagens de PD umas sobre as outras («45%» sobre «55%», «33%» sobre «58%») e "100%" cortado na borda, no estudo e no palco; em c6p20, «DESFECHO» fora do desenho no palco a 1920 px; em c4p4 no celular, «0» sobre «0%» e "100%" cortado; em c4p6 no celular, "100%" cortado. Cinco legendas citavam caminho de arquivo ou nome de variável do código (c6p1, c6p5, c6p6, c6p16 e c6p17). A fórmula em bloco do c6p10 era lida pelo leitor de tela em notação crua ("F_m(x) = F_{m−1}(x) + η × h_m(x)"). No celular (390 px), os índices da fórmula do c6p10 saíam deslocados para cima (defeito da plataforma, descrito abaixo), e 14 páginas têm rótulos de SVG abaixo de 8 px, o menor com 4,4 px.

**Decisões da regra.** A regra continua a das rodadas 21 e 22. O capítulo 6 pediu duas decisões:
1. Enunciado de questão e nota do professor ficam em texto, com índices em Unicode (Fₘ₋₁(x), hₘ(x)) no lugar da notação com sublinhado. O enunciado é guardado no banco e aparece no estudo, no ao vivo, no acompanhamento e nos guias, que o mostram como texto; KaTeX ali pede mudança no componente de questão e em todas as telas que o exibem.
2. O infográfico de abertura de capítulo fica fora desta rodada; está nas pendências.

**O que mudou.**
- Fórmulas e contas em KaTeX:
  - c6p1: a legenda de cada etapa (x = 8 e η = 0,5) e a legenda do gráfico.
  - c6p2: o x = 8 da frase de estado e do primeiro passo.
  - c6p3: x, y e o erro inicial (y − 6,5 = +5,5) da frase de estado; os oito valores de y, F₀ = 6,5 e y − F₀ na legenda.
  - c6p4: a conta 52,0 ÷ 8 = 6,50, com o texto como rótulo acessível; na legenda, o erro quadrático médio de um valor constante c, 10,1875 + (6,5 − c)².
  - c6p5: a conta 12,00 − 6,50 = +5,50, com o texto como rótulo acessível; resíduo = y − previsão atual na legenda.
  - c6p6: x = 5, y − 6,5 e η = 1.
  - c6p7 a c6p9: o corte e o η da frase de estado, as duas dicas, o caso η = 1 e a regra F = F + η h na legenda.
  - c6p10, página herdada, editada na fonte (`content/original/apresentacao-curso-pd.html`): os três termos da anatomia, Fₘ₋₁(x), η e hₘ(x), e as duas contas do caso x = 8 (6,50 + 0,5 × 2,875 = 7,94 e 12,00 − 7,94 = 4,06).
  - c6p11: a faixa das três fórmulas, antes em texto com índices em HTML, com o texto como rótulo acessível; σ(2,25) = 90,47% e π na legenda.
  - c6p12 a c6p14: F₀ = log odds da prevalência e o η da frase de estado, a dica e as fórmulas da legenda (F₀ = ln(π ÷ (1 − π)), y − p, F = F + η h, PD = σ(F)).
  - c6p15: y − p, η e M na legenda.
  - c6p16: η × árvores, η e η = 1 nas notas.
  - c6p20: o vetor β = (−5,6666; 0,7453; 1,3955) e η = 0,4 na legenda.
  - Questão c6p10q e notas do professor do c6p10 (roteiro e explicações do guia): índices em Unicode no lugar de F_{m−1}, h_m e F_m.
- Rótulos nos gráficos:
  - c6p12 a c6p14 (`perda-que-cai.tsx`): o rótulo de PD de cada proposta procura, entre acima, à direita, abaixo e à esquerda do ponto, a primeira posição que não bate em outro rótulo, em ponto nem na borda (`posicoesDasPds`); antes, a posição era fixa e os rótulos de #8 e #10 se sobrepunham. Margem direita de 12 para 17: o "100%" não perde o %.
  - c6p20 (`tres-modelos.tsx`): «DESFECHO» e os valores do desfecho alinhados pela direita, dentro do desenho.
  - c4p4 e c4p6 no celular: as marcas das pontas do eixo, 0% e 100%, ancoradas para dentro na consulta de contêiner de até 820 px.
- Legendas sem caminho de arquivo nem nome de variável do código: c6p1, c6p5, c6p6, c6p16 e c6p17.
- Leitor de tela: a fórmula em bloco do c6p10 ganhou o LaTeX explícito na fonte e o texto falado como rótulo ("F m de x igual a F m menos 1 de x mais eta vezes h m de x"); o desenho não muda. Outras sete fórmulas herdadas têm rótulo em notação crua na fonte (c2p12, c4p6, c4p7, c4p11, c5p6, c6p7 e c6p11), mas não aparecem na tela: essas páginas trocaram o bloco por visual nativo.
- Quebra de linha e entrelinha:
  - `ComTex` marca com `.tx-curta` o trecho de até 32 caracteres visíveis; nos visuais de texto corrido, a igualdade curta não quebra entre o sinal e o valor (antes, "η =" podia ficar no fim de uma linha e "0,5" no começo da seguinte). "No caso x = 8", no c6p10, não quebra dentro da fórmula.
  - O KaTeX em linha de frase (`.tx-linha .katex`) passou a ter caixa de linha 1. Com a 1,2 do KaTeX, a linha com fórmula ficava 2 a 3 px mais alta que as outras, e no palco isso reduzia o zoom: com as fórmulas novas, o c6p7 caía de 9,9 para 9,6 em 1400x900. A regra vale para os capítulos 4 e 5; as dez páginas deles com fórmula em frase (c4p1, c4p12, c4p16, c5p3, c5p7, c5p12, c5p14, c5p15, c5p16 e c5p18) mantiveram a nota nas quatro resoluções.
  - A conta grande do c6p5, a faixa do c6p11 e os termos da anatomia do c6p10 ficaram com o KaTeX na altura da letra vizinha.

**Defeito da plataforma corrigido: KaTeX no celular.** Na tela até 720 px, `.conteudo [style*="height:"] { height: auto !important }`, pensada para desenhos herdados com altura fixa em estilo em linha, alcançava também os spans internos do KaTeX, que posicionam índices, expoentes e frações com alturas em linha (a régua `.pstrut`). A 390 px, índices e expoentes subiam: no c6p10 (Fₘ₋₁(x) e hₘ(x)) e, fora do capítulo 6, em c7p13, c11p8 e c11p13 (varredura das 181 páginas a 390 px; c3p15 e c4p1 foram acusados e conferidos na tela, sem defeito). A regra e a de `width` deixam o KaTeX de fora (`:not(.katex *)`). As duas regras existem desde o commit 23d0ec2 (18/09/2026).

**Notas de palco** (auditoria em 1920x1080, 1400x900, 1366x768 e 1024x768; antes e depois, em 24/09/2026; pior nota das quatro resoluções):

| Página | Antes | Depois | Palavras a 1920x1080, antes e depois |
|---|---|---|---|
| c6p10 | 9,9 | 10 | 114 e 99 |
| c6p11 | 9,9 | 10 | 104 e 86 |
| c6p7 | 9,6 (em 1366x768; 9,9 nas demais) | 9,6 (em 1366x768; 9,9 nas demais) | 123 e 113 |
| c6p9 | 9,6 (em 1400x900 e 1366x768; 9,9 nas demais) | igual | 111 e 104 |
| c6p8 | 9,6 | 9,6 | 148 e 141 |
| c6p12 | 9,6 | 9,6 | 124 e 120 |
| c6p20 | 9,6 | 9,6 | 134 e 134 |
| c6p3 | 9,8 (em 1920x1080; 10 nas demais) | igual | 53 e 43 |
| c6p19 | 9,8 (em 1920x1080 e 1400x900; 10 nas demais) | igual | 61 e 61 |
| c6p1, c6p2, c6p4 a c6p6 e c6p13 a c6p18 | 9,9 a 10 | iguais | iguais ou menos |
| c4p4 e c4p6 | 9,4 | 9,4 | 162 e 173, iguais |

c6p8 fica em 9,6 pela densidade: 141 palavras, entre elas os 48 valores da tabela de cada árvore (9 no critério pede até 140). c6p7, c6p9, c6p12 e c6p20 ficam em 9,6 pela menor letra, entre 1,76% e 1,89% da altura do slide na resolução em que caem (10 pede 1,9%), somada à densidade de 104 a 134 palavras (10 pede até 100). c6p3 fica em 9,8 só em 1920x1080, pela letra do rótulo "Previsão inicial F₀" (1,72%), e c6p19, página herdada, pela ocupação. c4p4 e c4p6 seguem em 9,4 pela densidade dos quadros `.rl`, como desde a décima nona rodada.

Verificado em 24/09/2026: typecheck; lint (0 erros; os mesmos 5 avisos); `lint:tracos` (0); `npm test` (345, com `tests/tex-capitulo-6.test.ts`: todas as expressões TeX dos visuais renderizadas pelo KaTeX com η de 0,1 a 1, os cortes e os oito pontos; o KaTeX e o rótulo acessível de c6p3, c6p4, c6p5, c6p11, c6p13 e c6p16; os rótulos de PD sem sobreposição em todo η, iteração e tamanho de ponto; nenhuma notação crua no c6p10, no rótulo da fórmula, na questão c6p10q e nas notas); `npx playwright test` (24 de 24; o bloco do c6p2 passou a conferir a frase de estado por trechos e o KaTeX do x = 8); auditoria de palco na tabela acima; rótulos de PD de c6p12 a c6p14 em 60 estados (as três páginas, η de 0,1 a 1 e as cinco iterações) sem bater em rótulo, ponto ou borda; rótulos de SVG de c6p1 a c6p20, c4p4 e c4p6 sem sobreposição nem corte na borda em 1920x1080, 1366x768, 1024x768 e 390x844, estudo e palco; 540 estados extremos sem corte (cada botão, cada opção de lista e cada controle deslizante no mínimo e no máximo das figuras de c6p1 a c6p20, c4p4 e c4p6, e o conteúdo herdado de c6p10 e c6p19, em Apresentação 1920x1080, 1366x768 e 1024x768 e Aulas 1366x768 e 390x844; os dois acusados na primeira passada eram o título do c6p19 oculto para leitor de tela, recortado de propósito, e o detector passou a ignorá-lo; com cortes forçados por estilo injetado, o detector os acusou); varredura das 61 páginas em Aulas e Apresentação nas quatro larguras, com estados clicados: 61 de 61 nas oito combinações; fórmulas com índice nas 181 páginas a 390 px conferidas depois da correção da plataforma; telas conferidas no palco, no estudo e a 390 px; guia do capítulo 6 regerado com as figuras novas (aluno com 28 páginas e professor com 38, as mesmas de antes) e pacote do professor remontado; figuras dos capítulos 4 e 5 recapturadas e comparadas com as dos guias atuais, iguais salvo deslocamento de 1 a 3 px em linhas com fórmula (c4p1, c4p12 e c5p3), e os guias desses capítulos mantidos.

**Não verificado.** A leitura por leitor de tela real; os rótulos acessíveis foram conferidos pelo papel, pelo nome e pelo MathML. No celular, os gráficos em SVG do capítulo 6 continuam com rótulos pequenos (pendência abaixo, junto com a do capítulo 5).

### Vigésima quarta rodada (25/09/2026): c5p9, a coluna "esq / dir"

**Pedido.** No c5p9 (Recursão), o rótulo "esq / dir" de uma coluna da tabela não estava claro.

**Diagnóstico.** A coluna dava quantas propostas do nó cada corte candidato manda para cada um dos dois nós novos: no nó esquerdo, "2 / 6" em utilização 27,5 queria dizer 2 propostas com utilização até 27,5% e 6 acima. "esq / dir" se confundia com os lados da raiz, que a página alterna nos botões "lado esquerdo" e "lado direito" e nomeia nos títulos dos dois nós; e a variável e o valor do corte ficavam em colunas separadas, sem o sinal.

**O que mudou.**
- A tabela (`recursao.tsx`) passou a ter "Corte candidato", com a regra escrita como no gráfico e na frase de estado (utilização ≤ 27,5%, atraso ≤ 2,5 d); "Propostas", em duas colunas, "≤ corte" e "> corte", o mesmo vocabulário da tabela do c5p7; e "Ganho".
- A frase de estado diz "novas folhas com 2 e 6 propostas" (antes, "casos"); o texto do aluno no guia do capítulo 5 ganhou uma frase sobre as duas colunas.
- No celular, a regra quebra depois do nome da variável, com espaço inseparável entre o sinal e o valor, e as células têm menos respiro lateral no quadro estreito: a tabela cabe em 390 px sem rolagem, como antes (a 360 px rola 13 px; antes, 39 px). No palco, a primeira célula da segunda linha do cabeçalho ("≤ corte") fica alinhada à direita, como os números, contra a regra herdada que alinha à esquerda a primeira célula de cada linha.

**Nota de palco** (c5p9, 25/09/2026, as quatro resoluções): de 10 para 9,9, pela densidade. A contagem da auditoria foi de 97 para 111 palavras: ela ignora textos de até dois caracteres, e por isso as contagens "2 / 6" não somavam nada antes; agora cada linha escreve a regra inteira (três palavras em vez de duas) e o cabeçalho tem os nomes novos.

Verificado em 25/09/2026: typecheck; lint (0 erros; os mesmos 5 avisos); `lint:tracos` (0); `npm test` (346, com um teste novo do c5p9: o cabeçalho nos dois nós, a regra e as contagens da primeira linha de cada nó e o empate do lado direito, sem "esq / dir"); `npx playwright test` (24 de 24); auditoria de palco do c5p9 nas quatro resoluções (9,9); rótulos de SVG do c5p9 nas oito combinações; 15 estados extremos do c5p9 sem corte; varredura das 61 páginas em Aulas e Apresentação nas quatro larguras, com estados: 61 de 61 nas oito combinações; tabela conferida no palco a 1920 px, no estudo a 1366 px e no celular a 390 px; guia do capítulo 5 regerado com a figura nova do c5p9 (aluno com 28 páginas e professor com 36, as mesmas de antes) e pacote do professor remontado.

### Vigésima quinta rodada (25/09/2026): c5p12 e c5p13 refeitos para a mensagem ficar clara

**Pedido.** Com capturas do palco de c5p12 ("A previsão da folha é a frequência da folha") e c5p13 ("Quanto cada folha afirma"): os dois slides não estavam didáticos; refazer tornando mais clara a mensagem.

**Diagnóstico** (versões de 24/09/2026, no código e nas capturas do pedido).
- c5p12 usava a folha de 1 default em 2. Com ela, o mínimo da perda cai em 50%, no meio da escala, e a tela não separava "o mínimo é a frequência" de "o mínimo é o centro". A tabela de cinco valores repetia pontos da curva, e a curva mostrava o resultado sem a causa: o que cada proposta paga com o valor atribuído. As três consequências vinham em texto corrido, e nada se movia.
- c5p13 punha lado a lado uma tabela e barras com os mesmos números (n, defaults, PD, intervalo e largura) e pedia para comparar larguras com distâncias, sem critério de decisão: a consequência de um intervalo largo ficava abstrata. O efeito do volume era uma nota fixa (0 em 600 vai até 0,6%).

**Mensagem de cada tela.** c5p12: a PD da folha é a frequência da folha porque é o valor que dá a menor perda média às propostas da folha. c5p13: com poucas propostas, o intervalo de 95% é largo demais para a folha decidir contra o limite da política; com mais propostas e a mesma frequência, ela passa a decidir.

**O que mudou.**
- c5p12 no quadro `.rl` (`valor-da-folha.tsx`, contas em `src/lib/visuais/valor-da-folha.ts`). Na faixa, a PD como d ÷ n e a perda média com o valor v, em KaTeX. À esquerda, o que cada proposta paga com v (vinho para quem deu default, −ln v; azul para quem pagou, −ln(1 − v)) e a média tracejada; ao centro, a curva da perda média para cada v, com o mínimo marcado, clique e arraste; à direita, as cinco folhas das árvores de um e de dois cortes, o controle de v, a perda contra o mínimo e uma frase que diz para onde mover v. A folha inicial é a de 1 default em 8, com o mínimo em 12,5%, longe do meio; a de 1 em 2 segue entre as opções. Três cartões: o equilíbrio, a ligação com a log loss do capítulo 2 e o limite da folha pura, gancho da página seguinte.
- c5p13 no quadro `.rl` (`confianca-da-folha.tsx`, contas em `src/lib/visuais/confianca-da-folha.ts`). A política aprova a folha se a PD ficar abaixo de um limite L, de início 20%. Na faixa, a estimativa e a regra: aprova se o limite superior do intervalo fica abaixo de L, recusa se o inferior fica acima; se o intervalo cruza L, a folha não decide. As quatro folhas aparecem com a PD, o intervalo de Wilson a 95% e o veredito, contra a linha do limite; botões multiplicam as propostas por 10 ou 100 com a mesma frequência. Três cartões: 0 de 6 não é risco zero, a PD sempre com o n e o mínimo por folha, gancho do c5p14. No celular, o gráfico troca para uma geometria compacta própria.
- Os dois quadros ocupam a tela inteira no palco (`PALCO_PROPRIO`); a questão do c5p13 (c5p13q) segue no estudo. No roteiro do professor, título, objetivo, apoio, leitura, condução e interação refeitos na fonte; explicações do guia do capítulo 5 reescritas para as telas novas, com a calibração por construção no treino e o boosting do capítulo 6, que a tela antiga citava.
- CSS sem uso removido: `.vz-cf-*` (c5p13 antigo) e as regras de palco `.vz-grafico` dos dois quadros antigos. As `.vz-vf-*` ficam, usadas no capítulo 6.
- Toque no celular: a curva do c5p12 deixa a página rolar na vertical e mantém o arraste horizontal (`touch-action: pan-y`), e o gráfico do c5p13, sem arraste, não bloqueia a rolagem. Na primeira versão desta rodada, os três desenhos travavam a rolagem; medido com toques reais a 390 px: 0 px antes, cerca de 300 px depois, com o arraste levando v de 50% a 18%.

**Números das telas** (base de 16 propostas, `src/lib/visuais/did.json`; conferidos em `tests/folha-valor-confianca.test.ts`, 25/09/2026).
- c5p12, folha de 1 default em 8: com v = 50%, cada proposta paga 0,69 e a perda média é 0,6931; o mínimo é 0,3768, em 12,5%, 0,3163 abaixo. Em 12,5%, o default paga 2,08 e cada uma das sete que pagaram, 0,13.
- c5p13, limite de 20%: com as propostas da árvore, decide 1 de 4 folhas (a folha 3, 6 em 6, recusa; a folha 2, 0 em 6, vai até 39,0% e não decide). Com 10 vezes as propostas, as quatro decidem (a folha 2 aprova, de 0% a 6,0%). Com limite de 50% e 100 vezes, as folhas de 1 em 2 seguem sem decidir (43,1% a 56,9%).
- Teste exato de Fisher citado na condução do professor, recalculado nesta rodada: 0 em 6 contra 6 em 6, p = 0,0022; 1 em 2 contra 0 em 6 ou contra 6 em 6, p = 0,25.

**Notas de palco** (auditoria em 1920x1080, 1400x900, 1366x768 e 1024x768, 25/09/2026; iguais nas quatro):

| Página | Antes | Depois | Palavras, antes e depois | Menor letra (% da altura do slide) |
|---|---|---|---|---|
| c5p12 | 10 | 9,4 | 88 e 178 | 1,76 |
| c5p13 | entre 9,8 e 10 (registro da vigésima segunda rodada) | 9,4 | 61 e 70 em duas telas (medição de 23/09/2026 a 1920x1080) e 172 em uma | 1,76 |

Evidência: a primeira medição do redesenho deu 8,7 (c5p12, 228 palavras, menor letra 1,56%) e 9,1 (c5p13, 215 palavras, 1,70%); subtítulos, cartões, rodapés e frases do painel foram encurtados e a letra do painel subiu para 1,3cqw. Inferência: a queda de 10 para 9,4 vem da densidade (teto de 180 palavras para nota 7) e da menor letra (1,9% para nota 10); é o patamar dos outros quadros `.rl` (c4p2, c4p5, c4p15, c5p4 e c5p6: 9,4 com 160 a 171 palavras, medidos em 25/09/2026 a 1920x1080). A auditoria mede ajuste, ocupação, letra, densidade, estrutura e foco; clareza didática não entra na nota.

Verificado em 25/09/2026, no build final: typecheck; lint (0 erros; os mesmos 5 avisos); `lint:tracos` (0); `npm test` (355, com `tests/folha-valor-confianca.test.ts`: folhas, perda média, mínimo em d ÷ n numa grade de passo 0,0005, diferença exibida fechando com os dois números da tela, folha pura, intervalos de 1, 10 e 100 vezes as propostas e vereditos coerentes em todo limite e volume; e os testes de KaTeX e de renderização dos dois quadros atualizados); `npx playwright test` (24 de 24); auditoria de palco nas quatro resoluções (9,4 nos dois quadros); estados extremos de c5p12 e c5p13 (85 de 85 sem corte, em cinco combinações); rótulos de SVG nas oito combinações (2 de 2 em cada); menor letra a 390 px (SVG de 11,9 e 15 px, nenhum rótulo abaixo de 8 px); toques reais a 390 px (arraste da curva e rolagem sobre os três desenhos); varredura das 61 páginas (61 de 61 nas oito combinações, com estados clicados); guia do capítulo 5 regerado (aluno com 28 páginas, a mesma de antes; professor com 37, antes 36) e pacote do professor remontado, com o envio ao bucket pendente como antes.

## Pendências técnicas ordenadas

0. Guia do professor dos capítulos 4, 5 e 6: enviar o pacote `guias-2026-09` a `bases/vguias-2026-09/` no bucket e registrar em Bases e gabaritos (instruções em `scripts/apostila/README.md`).
0. Questão c5p13q, explicação da alternativa c: diz que intervalos que não se tocam não demonstram diferença. Com intervalos de 95%, a não sobreposição é critério conservador de diferença (aqui, Fisher dá p = 0,0022 para 0 em 6 contra 6 em 6). Revisar a redação com o professor.
0. Celular (390 px): 13 páginas dos capítulos 4 a 6 mostram tabela com rolagem lateral, padrão anterior a esta rodada; em 1.024 px ou mais, nenhuma.
0. Tempo da Aula 2: essenciais somam 171 min para 165 úteis; decisão do professor, recomendação em `docs/NARRATIVA_AULA_2.md`, seção 6.
0. Repositório público: gabaritos estão nos fontes do material e o guia do professor do baralho, de uma rodada anterior, continua no histórico do git. Recomendação: tornar o repositório privado.
0. Fórmulas em texto fora dos capítulos 4, 5 e 6: uma busca grosseira no código em 24/09/2026 (×, ÷, ≈, exp e ln em texto), anterior à revisão do capítulo 5, acusava 85 dos 94 arquivos de visual nativo fora do capítulo 4. A busca não separa fórmula de valor com unidade nem de rótulo de gráfico, que a regra mantém em texto; o número é teto, não inventário. Os capítulos 5 e 6 foram inventariados e convertidos na vigésima segunda e na vigésima terceira rodadas. Os infográficos de abertura (`content/infograficos/cNN.json`) ficaram fora das três revisões e também trazem fórmulas e contas em texto (no c06, Fₘ(x) = Fₘ₋₁(x) + η · hₘ(x) e F₁ = 6,50 + 0,5 × 2,875 = 7,94). Recomendação: seguir capítulo a capítulo, a começar pelo 7, com as mesmas lentes, e tratar os infográficos numa passada própria.
0. Celular (390 px), gráficos em SVG dos capítulos 5 e 6: o desenho é o da projeção reduzido à largura do telefone; no capítulo 5, 11 páginas têm rótulos abaixo de 8 px, de 4,3 a 6,5 px (medição de 24/09/2026, rótulos abaixo de 8 px por página: c5p1 41, c5p2 41, c5p3 41, c5p7 53, c5p8 19, c5p10 44, c5p11 41, c5p14 71, c5p15 21, c5p16 71, c5p18 25). c5p12 e c5p13 saíram da lista na vigésima quinta rodada: menor letra de SVG a 390 px de 11,9 e 15 px (medição de 25/09/2026). O texto em HTML fica entre 10 e 12 px. Recomendação: geometria compacta própria do celular em cada desenho, como a das réguas do c4p5 e a dos intervalos do c5p13; cerca de cinco desenhos cobrem as 11 páginas do capítulo 5 (diagrama da árvore, plano das 16 propostas, plano e barras da árvore que cresce, retas da poda). No capítulo 6, 14 páginas têm rótulos abaixo de 8 px, o menor de cada página entre 4,4 e 6,5 px (medição de 24/09/2026, antes e depois desta rodada, iguais: c6p1 3, c6p2 8, c6p3 4, c6p4 5, c6p5 11, c6p6 5, c6p7 6, c6p8 6, c6p9 12, c6p15 12, c6p16 8, c6p17 14, c6p18 18, c6p20 47); c6p12 a c6p14 já desenham a 8 px ou mais. Decisão do professor, pelo custo.
0. Toque no celular: o desenho do c5p4 (`.im-svg`, `touch-action: none`) não deixa a página rolar quando o deslize vertical começa sobre ele (medido em 25/09/2026 com toques reais a 390 px: rolagem de 604 para 604); o laboratório logístico do c4p2 (`lab-logistica.tsx`) tem o mesmo estilo, não medido. Correção como a do c5p12 nesta rodada: `touch-action: pan-y` onde há arraste horizontal, nada onde não há.
0. Legibilidade no palco dos quadros do capítulo 4: c4p1, c4p11, c4p12 e c4p14 têm a menor letra a 1,56% a 1,63% da altura do slide (rótulos, campos e alternativas), abaixo do 1,7% que dá 9 no critério; c4p10 e c4p16 ficam em 1,69% em 1024x768. É o que segura esses quadros entre 9,0 e 9,3; anterior à vigésima primeira rodada.
0. Guias dos capítulos 1 a 3 e 7 a 11: as sínteses da revisão 13 provavelmente trazem o mesmo descompasso entre guia e tela corrigido aqui nos capítulos 4 a 6; não auditadas.
0. Enunciados de questão com fórmula: ficam em texto, com índices em Unicode (decisão da vigésima terceira rodada). Se o professor quiser KaTeX neles, o caminho é desenhar os trechos entre cifrões no componente de questão e nas telas que o reaproveitam (estudo, ao vivo, acompanhamento e guias), para todas as questões de uma vez. Decisão do professor.
0. Legenda com nome de variável do código fora dos capítulos 4 a 6: c9p6 (`equidade.tsx`, "DADOS.fair").
0. Aula 2: R1 a R4 e R7 de `docs/PLANO_MELHORIAS.md` (aviso de turma sem encontros, perguntas para slides sem página ligada, verificação em Firefox, Safari e projetor, validação com usuários, traços nas cascas, estados combinados que cabem reduzidos).

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
