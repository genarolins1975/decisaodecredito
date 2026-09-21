# Arquitetura proposta para a Aula 2: estrutura, fluxo de dados, estados, contratos e decisões

Data de referência: 21 de setembro de 2026. A proposta está implementada no branch `claude/new-session-d2yt8t` salvo onde a seção 8 diz o contrário. O princípio é proporção: a menor complexidade operacional que resolve os problemas demonstrados em `AUDITORIA_ARQUITETURA.md`. Nenhum framework, banco, serviço ou reescrita foi acrescentado.

## 1. O que não muda, e por quê

- O baralho continua um HTML único, sem módulos e sem framework, para abrir por duplo clique e por `file://`. A plataforma o embute em iframe. Trocar isso por componentes React exigiria portar 7.300 linhas de 50 slides e perderia o uso offline sem ganho demonstrado.
- A sessão ao vivo continua com o banco como fonte de verdade, estado completo e versionado por SSE, atualização periódica como alternativa e tentativas idempotentes. Isso já cobria duplicação, ordem e reconexão.
- A autorização continua no servidor, por rota. O que muda é que o arquivo servido passa a depender do papel.

## 2. Responsabilidades

| Camada | Responsável por | Onde | Não é responsável por |
|---|---|---|---|
| Conteúdo pedagógico | Os 50 slides: título, subtítulo, conclusão, fonte, resumo textual, notas de condução, LaTeX e a função `montar` de cada um | `aula_credito_html/app/slides/sNN.js`; roteiro em `src/lib/content/roteiro-aula-2.ts` | Estado, navegação, persistência |
| Domínio | Cálculos e regras: logit manual, árvore de 1.000, miniatura de boosting, economia; resultados do experimento; formatação numérica; matemática compartilhada | `app/dados/10-dados.js`, `app/dados/11-resultados.js` (gerado), `app/nucleo/01-nucleo.js` (`F`, `M`), `05-mat.js` | Desenho e interface |
| Interface | Controles (`UI`), componentes compartilhados (`Comum`), desenho vetorial (`Graf`), estilo; casca React do professor e do aluno | `03-ui.js`, `04-comum.js`, `02-svg.js`, `estilo/aula.css`; `src/components/live/*` | Regras de cálculo |
| Estado | Navegação, modos, exploração por slide, persistência local e sua versão; sessão ao vivo e tentativas | `app/nucleo/90-app.js` (`App`); `src/lib/services/live.ts`, `src/lib/client/use-live.ts` | Conteúdo |
| Persistência e integrações | PostgreSQL para o coletivo; `sessionStorage` e `localStorage` para o individual local; nenhuma integração externa em tempo de aula | esquema em `src/lib/db/schema.ts`; rota `/slides/aula-2` | Nada além do identificado |

Compilação (`aula_credito_html/build.mjs`) é a costura entre as camadas: lê os fontes, calcula a marca da versão, produz três saídas e confere a separação das notas.

## 3. Fluxo de dados

```mermaid
sequenceDiagram
  participant Prof as Professor (painel)
  participant Proj as Projeção (iframe modo projecao)
  participant API as API /api/aovivo/{id}
  participant DB as PostgreSQL
  participant Aluno as Tela do aluno (iframe modo aluno ou livre)
  Prof->>API: POST /slide {slide:"12"} ou seta na projeção
  Proj->>API: POST /slide (hashchange; reenvio a cada 3 s se falhar)
  API->>DB: current_slide = "12", state_version + 1
  DB-->>Aluno: SSE "state" (estado completo) ou GET /estado a cada 5 s
  Aluno->>Aluno: iframe.location.hash = "#/slide/12" (sem recarregar)
  Prof->>API: POST /atividades, PATCH status open
  DB-->>Aluno: SSE com a atividade
  Aluno->>API: POST /responder {activityId, answer, clientRequestId}
  API->>DB: attempt idempotente por clientRequestId
  DB-->>Prof: SSE com agregados e painel privado
```

Regra de leitura: quem fala com a API é a casca React, nunca o baralho. O baralho só conhece o hash, o parâmetro de modo, o parâmetro de estado e a própria versão.

## 4. Estados e limites

| Estado | Dono | Fonte de verdade | Chave ou identificador | Trocar slide | Reiniciar exemplo | Recarregar | Fechar aba | Outro aparelho | Nova versão |
|---|---|---|---|---|---|---|---|---|---|
| Slide no ar | professor | `live_sessions.current_slide` | id da sessão + "NN" | muda | mantém | mantém | mantém | mantém | mantém |
| Exploração de um slide | quem mexe | memória do iframe, espelhada em `sessionStorage` | `aula-credito-estado:<usuário>` com `versao` | mantém | só aquele slide | mantém | apaga | não existe lá | descartada |
| Último slide aberto | navegador | `localStorage` | `aula-credito-slide` (arquivo local) ou `aula-credito-slide:<usuário>` (plataforma) | muda | mantém | mantém | mantém | não existe lá | mantém |
| Modo seguir ou livre | aluno | estado React | não persiste | mantém | mantém | volta a seguir | volta a seguir | volta a seguir | idem |
| Respostas ao vivo | aluno | `attempts` | `client_request_id` por tentativa | mantém | não se aplica | mantém | mantém | mantém | mantém |
| Perguntas e resultados | professor | `session_activities`, `state_version` | ids gerados | mantém | não se aplica | mantém | mantém | mantém | mantém |

Quem pode alterar: o professor ou monitor altera `current_slide` e atividades (`requireClassAccess` com papéis professor e monitor); o aluno altera só as próprias tentativas; a exploração é alterada por quem está na tela e nunca sai da máquina; ninguém altera a exploração de outro.

Sem estado global indiferenciado: navegação do professor, respostas do aluno e parâmetros de demonstração ficam em três lugares distintos (banco, banco, navegador do aluno) e reconectar não sobrescreve nada, porque o estado da sessão não carrega exploração.

Migração e invalidação: a marca `Aula.versao` é o resumo SHA-256 (12 caracteres) dos fontes do baralho, gravada por `build.mjs` nas três saídas. O estado local carrega a marca; marca diferente descarta o estado inteiro em vez de aplicá-lo a slides que podem ter mudado. Não há migração de exploração entre versões, de propósito: o custo de perder uma exploração local é menor do que o de mostrar um slide com um estado inválido. Estado ilegível é apagado e a aula abre normalmente. "Limpar minhas explorações", no índice, é o caminho manual de recuperação.

Identificadores estáveis: slides são "01" a "50" e a ordem é a do registro em `Aula.slides`; reordenar exige renumerar, e a numeração aparece em URL, roteiro, notas e painel. Respostas ao vivo apontam para `question_version_id` e `activity_id`, não para posição; reordenar o baralho não muda a que exercício uma resposta pertence, porque a resposta nunca é associada ao slide, e sim à questão versionada.

## 5. Contratos

### 5.1. Saídas da compilação

| Arquivo | Conteúdo | Quem recebe |
|---|---|---|
| `content/slides/aula-2.html` (e `dist/aula_credito.html`) | Baralho completo, com notas | professor e monitor por `/slides/aula-2`; uso offline |
| `content/slides/aula-2-aluno.html` (e `dist/aula_credito_aluno.html`) | Mesmo baralho sem a propriedade `notas` de cada slide, removida pela árvore sintática (acorn) e conferida frase a frase; botão Professor oculto porque não há nota | aluno por `/slides/aula-2` |
| `content/slides/aula-2-notas.json` (e `dist/aula_credito_notas.json`) | `{ versao, slides: [{ n, bloco, blocoNome, titulo, subtitulo, conclusao, fonte, resumo, notas: { conducao[], respostas[], cuidados[], aprofundar[], transicao }, proximo: { n, titulo } }] }` | painel do professor |

As três carregam a mesma `versao`; `tests/aula-2-build.test.ts` cobra isso e a ausência de notas na variante do aluno. A compilação falha se um slide não tiver exatamente um bloco de notas ou se alguma frase sobreviver na variante.

### 5.2. Baralho para a casca

| Item | Contrato |
|---|---|
| URL | `/slides/aula-2?modo=<aluno|livre|projecao>&estado=<id opaco>#/slide/NN`; parâmetros ausentes significam arquivo padrão e chave local |
| Modos | `aluno`: sem barra, teclado desligado, sem notas; `livre`: barra e teclado, sem notas e sem impressão; `projecao`: barra reduzida (índice, anterior, próximo, tela cheia), sem notas, impressão e modo estudo; vazio: tudo |
| `App.definirModo(modo)` | troca o modo em tempo de execução sem recarregar; devolve `false` para modo desconhecido |
| `App.modo()`, `App.atual()` | leitura |
| `App.limparEstados()` | apaga a exploração desta aula nesta aba e remonta |
| `App.salvarEstado()` | grava imediatamente (a casca não precisa chamar; o baralho grava a cada montagem e em `pagehide`) |
| `Aula.versao` | marca da compilação |
| Navegação | mudar `location.hash` do iframe; o baralho escuta `hashchange` |

### 5.3. API da sessão (inalterada)

`POST /api/aovivo/{id}/slide {slide: "NN" | null}` (professor ou monitor; "NN" validado contra o roteiro), `GET /estado` (estado por papel), `GET /eventos` (SSE com `state`, `ping` a cada 15 s, `revoked`), `POST /atividades`, `PATCH /atividades/{aid}`, `POST /responder`.

### 5.4. Compatibilidade de links

`/slides/aula-2` e `#/slide/NN` continuam válidos. `?modo=aluno` e `?modo=livre` continuam aceitos. O cartão em Aulas e Materiais continua apontando para `/slides/aula-2`; a diferença é o arquivo que a rota devolve.

## 6. Modo de uso e permissão

| Recurso | Quem decide | Como |
|---|---|---|
| Arquivo com ou sem notas | servidor | papel na turma ou staff global, em `route.ts`; `Cache-Control: private` e `Vary: Cookie` |
| Slide no ar, perguntas, liberação de resultados | servidor | `requireClassAccess(classId, ["professor","monitor"])` |
| Respostas | servidor | tentativa do próprio usuário, atividade aberta, prazo e limite |
| Barra, teclado, notas na tela | interface | parâmetro de modo; é conveniência, não controle |

O que o aluno recebe é público para ele: nada no arquivo dele é reservado. O que é reservado (notas, respostas ao vivo dos colegas, gabarito antes da liberação) não sai do servidor para a sessão dele.

## 7. Decisões

| Decisão | Problema concreto | Solução | Alternativa considerada | Custo | Evidência de que atende |
|---|---|---|---|---|---|
| Duas variantes do baralho na compilação | aluno recebia notas e respostas pelo material | `build.mjs` remove `notas` por AST e confere frase a frase; rota escolhe pelo papel | remover notas em tempo de requisição por expressão regular | ~60 linhas em `build.mjs`, 1,3 MB a mais versionados | teste unitário e e2e: nenhuma frase no arquivo do aluno, todas no do professor |
| Notas em JSON para o painel | professor sem visão do apresentador | `build.mjs` avalia os fontes em `vm` e grava `aula-2-notas.json`; página lê do disco | duplicar as notas em TypeScript | nenhum código novo de conteúdo; a fonte continua `sNN.js` | e2e: painel contém a frase de condução do slide no ar |
| Modo `projecao` | notas na tela da turma | terceiro modo no baralho, sem notas, impressão e estudo | segunda janela "apresentador" sincronizada | 10 linhas de CSS e JS | jornada: `p` inerte, botões ocultos |
| Modo trocado em tempo de execução | recarga apagava exploração | `App.definirModo`, `src` fixado uma vez | `postMessage` | igual em complexidade; `definirModo` é direto porque é a mesma origem | e2e: PD preservada nas duas trocas |
| `sessionStorage` versionado por usuário | recarga apagava exploração; usuários na mesma máquina se contaminariam | chave `aula-credito-estado:<usuário>` com `versao`; descarte em versão diferente | `localStorage` sem versão; servidor | `localStorage` sobreviveria a fechar a aba, mas acumularia estado entre dias e usuários; servidor exigiria tabela e API sem critério pedagógico para registrar exploração | jsdom: restaura, isola por usuário, descarta versão antiga, tolera corrompido |
| Reenvio na projeção e vigia de silêncio no aluno | queda de rede silenciosa | fila de um slide com nova tentativa a cada 3 s; `stale` após 40 s sem sinal | reconectar SSE mais cedo | dezenas de linhas | canal abortado: "Sem atualização há 45 s" e recuperação; slide reenviado |
| Gráfico sem resumo fora da árvore de acessibilidade | 40 imagens sem nome | `Graf.acessivel`: `role="img"` só com resumo; senão `aria-hidden` | exigir resumo em todo gráfico | uma função | axe sem violação; o resumo textual do slide permanece |
| Âmbar `#9A5209` | contraste 4,31:1 em botões selecionados | token alterado | manter e trocar só o botão | nenhum | 5,86:1 calculado |

## 8. Evolução recomendada, não implementada

1. Aviso no cartão da turma quando não há encontros, com o botão de criar as quatro aulas (P2.9).
2. Filtro por capítulo no seletor de páginas do painel, ou perguntas próprias da Aula 2 cadastradas como conteúdo, para os slides sem página ligada (P2.10).
3. Verificação em Firefox, Safari e no projetor da sala, inclusive tela cheia a partir do iframe (P2.12).
4. Se um dia a exploração de um slide precisar contar como evidência de aprendizagem, registrá-la como questão versionada publicada na sessão, nunca como estado do baralho. O critério pedagógico precisa vir antes do registro.
5. Recursos offline para a casca não são recomendados: o baralho já abre offline por arquivo, e a sessão ao vivo depende do servidor por definição.
