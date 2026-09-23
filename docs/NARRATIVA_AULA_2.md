# Aula 2: uma aula só, contada pelas mesmas 16 propostas

Registro da decisão de 22/09/2026 e do desenho que a implementa. Fonte dos números: `content/generated/extract.json` extraído nesta data do material original (`content/original/apresentacao-curso-pd.html`), salvo indicação.

## 1. A decisão

**Evidência.** Até esta rodada a Aula 2 existia duas vezes na plataforma: os capítulos 4, 5 e 6 (as páginas) e o baralho de 50 slides, cadastrado em Materiais como "Aula 2 em 50 slides", com dois guias em PDF próprios, um botão "Apresentar pelos slides" em cada capítulo e um modo ao vivo por slide. O professor pediu uma aula só, com o mesmo layout das outras e guias do aluno e do professor por capítulo.

**Decisão tomada.** O baralho saiu da plataforma. A aula é a dos capítulos 4, 5 e 6, apresentada e conduzida pelas próprias páginas, como as Aulas 1, 3 e 4. O que só existia no baralho e servia à narrativa entrou nas páginas; o resto ficou registrado na seção 5. Os endereços antigos redirecionam para o conteúdo equivalente. A pasta `aula_credito_html/` continua no repositório como fonte de referência (ver `aula_credito_html/LEIA_PRIMEIRO.md`).

## 2. O fio

As mesmas 16 propostas, cada uma com utilização, atraso e desfecho observado, atravessam os três capítulos. Cada capítulo parte do caso que o anterior deixou em aberto:

| Capítulo | Pergunta | Caso que fecha o capítulo e abre o seguinte |
|---|---|---|
| 4 · Regressão logística | Como características viram probabilidade? | Nenhuma reta separa a #15 (90% de utilização, pagou) da #2 (25%, deu default): a #15 pontua z = 1,04 e a #2, z = −1,01 |
| 5 · Árvores de decisão | Como perguntas sucessivas dividem a população em grupos de risco? | A árvore acerta a #10 (100% na folha de seis defaults, onde a reta dava 30,5%) e deixa a #15 numa folha de duas propostas, com 50% e intervalo de 95% de 9,5% a 90,5% |
| 6 · Gradient boosting | Como uma sequência de árvores melhora uma previsão? | O fecho da aula (c6p20) põe as três PDs lado a lado e deixa para a Aula 3 a pergunta que o treino não responde |

Onde o fio aparece na plataforma: o apoio de `c4p1` anuncia o fio; as conexões das sínteses `c4p22`, `c5p19` e `c6p19` nomeiam o caso; a página `c6p20` fecha a aula; os guias de capítulo trazem o quadro "O fio da aula".

## 3. O percurso de sala

Em sala entram só as páginas essenciais. As complementares ficam para o estudo e estão nos guias.

| Capítulo | Essenciais | Minutos |
|---|---|---|
| 4 | c4p1, c4p3, c4p4, c4p5, c4p7, c4p8, c4p10 | 49 |
| 5 | c5p1, c5p3, c5p4, c5p7, c5p10, c5p18 | 49 |
| 6 | c6p1, c6p2, c6p5, c6p6, c6p7, c6p10, c6p13, c6p17, c6p20 | 73 |
| **Aula 2** | **22 páginas** | **171** |

A aula tem 180 min com 15 de intervalo, 165 úteis (`DUR_AULA` e `INTERVALO` do material original). **O roteiro passa 6 min do tempo útil:** até esta rodada os essenciais somavam 165; o fecho `c6p20` acrescentou 6 (3 de exposição e 3 de discussão). Decisão pendente, na seção 6.

Quando a próxima essencial pula páginas, a nota do professor da página traz a ponte de sala (campo `aula` do guia: o que dizer e o que fica para o estudo). São 14 pontes: c4p1 → c4p3, c4p5 → c4p7, c4p8 → c4p10, c4p10 → c5p1, c5p1 → c5p3, c5p4 → c5p7, c5p7 → c5p10, c5p10 → c5p18, c5p18 → c6p1, c6p2 → c6p5, c6p7 → c6p10, c6p10 → c6p13, c6p13 → c6p17, c6p17 → c6p20. Nas demais, a próxima essencial é a página seguinte e basta a transição do guia. A ponte aparece em três lugares: na nota do professor da página, no painel ao vivo ("Roteiro da página no ar", com o botão "Próxima essencial") e na folha "Em sala" do guia do professor de cada capítulo.

## 4. O fecho: `c6p20`, "Três modelos, as mesmas 16 propostas"

Uma linha por proposta, com a PD da logística do capítulo 4 (coeficientes da aula), da árvore de profundidade 2 do capítulo 5 e do boosting de 4 árvores com η = 0,4 do capítulo 6, calculadas por `src/lib/visuais/tres-modelos.ts` sobre a base didática (`src/lib/visuais/did.json`) e fixadas em `tests/tres-modelos.test.ts`.

- Da #3 à #14 os três ficam do mesmo lado de 50%, com duas exceções: a #5 (52,6% na logística, 0% na árvore) e a #10 (30,5% e 100%).
- A maior distância é a da #10: 69,5 pontos entre a menor e a maior PD. É o gabarito da questão curada `c6p20q`.
- Log loss média no treino: 0,43282 na logística, 0,18844 na árvore (folhas puras limitadas a 2% e 98%) e 0,47481 no boosting de 4 árvores; com 50 árvores o boosting desce a 0,15503, com 200 a 0,05444. No treino vence quem ajusta mais; a escolha fora da amostra é o capítulo 7.
- A entrega da aula 2 passou de `c6p17` para o fecho.

## 5. O que do baralho não entrou, e por quê

| Slides | Assunto | Por que não entrou |
|---|---|---|
| 01 a 06 | O problema: decisão, evento e horizonte, vazamento, validação temporal, os três mecanismos | Conteúdo da Aula 1 (capítulos 1 a 3) e da abertura de cada capítulo |
| 02, 20 e o fio de Ana, Bruno, Carla e Diego | Os quatro clientes do baralho | A aula já tem um fio, as 16 propostas; dois fios concorrentes confundem |
| 15 | Categorias e referência | Codificação por faixa é assunto do capítulo 3; categorias com referência não têm página nos capítulos 4 a 6 |
| 17 | Interação no logit | O limite aparece em `c4p20` e `c4p21` e a resposta é a árvore (`c5p2`) |
| 18 | Regularização | Sem página correspondente nos capítulos 4 a 6: lacuna registrada, não resolvida nesta rodada |
| 43 a 49 | Comparação, AUC e KS, calibração, corte, perda esperada, monitoramento, comitê | Conteúdo das Aulas 3 e 4 (capítulos 7 a 10) |

## 6. Decisão pendente: os 6 minutos acima do tempo útil

**Evidência.** Essenciais somam 171 min para 165 úteis (seção 3). O próprio material marca, no roteiro de 120 minutos (`CORE_120`), quais essenciais o autor dispensaria primeiro; `c5p18` é uma delas.

**Inferência.** `c5p18` (10 min) compara logística e árvore nas mesmas propostas, com as mesmas #5, #10 e #15 e as mesmas perdas de treino, e `c6p20` faz essa comparação com as três famílias. Em sala, as duas páginas repetem o argumento.

**Recomendação.** Passar `c5p18` para o estudo: a aula fica em 161 min, com 4 de folga. Exige reescrever a ponte de `c5p10`, que passa a apontar para `c6p1`, e a referência de `c6p20` a `c5p18` no erro previsível. Não aplicado: é decisão do professor.

## 7. Onde está cada peça

| Peça | Arquivo |
|---|---|
| Camada narrativa (apoio, conexões, pontes, sínteses) | `content/original/apresentacao-curso-pd.html`, função `narrativaAula2V14` |
| Guia do professor alinhado ao que a tela mostra (leitura, condução, interação, erros e respostas dos capítulos 4 a 6) | mesmo arquivo, função `guiaDaTelaV15` |
| Página de fecho e questão curada | `c6p20` no mesmo arquivo; `content/questoes-curadas.json` (`c6p20q`) |
| Visual do fecho | `src/components/visuais/tres-modelos.tsx`, `src/lib/visuais/tres-modelos.ts` |
| Painel ao vivo por página | `src/components/live/live-teacher.tsx`, `src/lib/services/content.ts` (`guiasDaUnidade`) |
| Guias de capítulo | `scripts/apostila/` (gerador, textos e `pacote-professor.mjs`); guia do aluno em `content/materiais/capitulo-0N-aluno.pdf`, pela rota `src/app/api/materiais/[arquivo]/route.ts`; guia do professor pelo bucket privado e "Registrar pacote", porque traz gabaritos e o repositório é público |
| Redirecionamentos do baralho | `src/app/slides/aula-2/route.ts`, `src/app/(app)/aulas/aula-2/slide/[n]/page.tsx`, `src/app/apresentacao/slides/page.tsx`, `src/app/api/materiais/aula-2/[arquivo]/route.ts` |
