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

Verificado em 23/09/2026: typecheck; lint (0 erros; 5 avisos anteriores); `lint:tracos` (0); `npm test` (300, dois novos: as duas zonas rotuladas com os trechos vinho desenhados depois da reta azul, e os atalhos); `npx playwright test` (23 de 23, com o teste de aceitação atualizado para o texto novo e para a ponta de cima); varredura do c4p2 nas duas rotas e quatro larguras, com os estados clicados, sem defeito (a das 61 páginas no build final vem no commit seguinte); guias do capítulo 4 regerados (aluno com 34 páginas e professor com 43, as mesmas de antes), o do aluno copiado para `content/materiais`; pacote `guias-2026-09` remontado com o capítulo 4 novo.

**Não verificado.** Produção (esta rodada não foi publicada); pacote do professor não enviado ao armazenamento (sem credencial `S3_*` neste ambiente); nenhum teste com alunos ou em projetor real.

## Pendências técnicas ordenadas

0. Guia do professor dos capítulos 4, 5 e 6: enviar o pacote `guias-2026-09` a `bases/vguias-2026-09/` no bucket e registrar em Bases e gabaritos (instruções em `scripts/apostila/README.md`).
0. Palco do capítulo 4: reauditado em 23/09/2026, média 9,48 em 1400x900 e 9,44 em 1920x1080, com duas páginas abaixo de 9 que esta rodada não tocou: c4p5 (8,7 em 1400x900 e 9,1 em 1920x1080; 184 palavras, rótulo "PD de partida, campo em %" a 1,69% da altura) e c4p15 (8,7 nas duas; 196 palavras, leitura a 1,56%). Mesma correção do c4p2: frases mais curtas e corpo mínimo nos rótulos.
0. Questão c5p13q, explicação da alternativa c: diz que intervalos que não se tocam não demonstram diferença. Com intervalos de 95%, a não sobreposição é critério conservador de diferença (aqui, Fisher dá p = 0,0022 para 0 em 6 contra 6 em 6). Revisar a redação com o professor.
0. Celular (390 px): 13 páginas dos capítulos 4 a 6 mostram tabela com rolagem lateral, padrão anterior a esta rodada; em 1.024 px ou mais, nenhuma.
0. Tempo da Aula 2: essenciais somam 171 min para 165 úteis; decisão do professor, recomendação em `docs/NARRATIVA_AULA_2.md`, seção 6.
0. Repositório público: gabaritos estão nos fontes do material e o guia do professor do baralho, de uma rodada anterior, continua no histórico do git. Recomendação: tornar o repositório privado.
0. Guias dos capítulos 1 a 3 e 7 a 11: as sínteses da revisão 13 provavelmente trazem o mesmo descompasso entre guia e tela corrigido aqui nos capítulos 4 a 6; não auditadas.
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
