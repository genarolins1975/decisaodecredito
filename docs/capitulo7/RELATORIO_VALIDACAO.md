# Capítulo 7: relatório de validação

Data de referência: 02/10/2026. Branch `claude/new-session-05kw73`. Ambiente local (Next.js em modo de desenvolvimento, PostgreSQL 16, Chromium do Playwright). Nada foi publicado em produção: a produção se atualiza a cada merge na branch principal, e este trabalho não foi mesclado.

## 1. Escopo

38 slides (37 no percurso e o apêndice), um quadro interativo nativo por slide em `src/components/capitulo7/slides`, roteiro em `src/lib/capitulo7/roteiro.ts`, números em `src/lib/capitulo7/metricas.ts` sobre a fonte única `src/lib/capitulo7/base.json`. Planejamento, mapa antigo para novo, regras de interação e registro dos dados em `docs/CAPITULO_7_RECONSTRUCAO.md`.

## 2. Verificação numérica

Evidência. Cada função da biblioteca foi comparada com uma implementação de referência em Python 3.11 (scikit-learn 1.9.1, SciPy 1.17.1, statsmodels 0.15.0, NumPy 2.4.6) sobre os mesmos vetores: `scripts/capitulo7/referencia.py` grava `tests/fixtures/capitulo7-referencia.json`, e `tests/capitulo7-metricas.test.ts` (56 testes) confere cada valor, além dos casos de borda (classe ausente, n = 0, empates, faixas vazias, log de zero).

Maior diferença absoluta entre a biblioteca e a referência, em 40 grandezas: 4,3 × 10⁻⁹ (valor p de DeLong, por causa da aproximação da função de erro); todas as demais abaixo de 10⁻¹⁵.

| Grandeza | Biblioteca do capítulo | Referência em Python | Diferença |
|---|---|---|---|
| pl AUC | 0.7256850346 | 0.7256850346 | 0.0e+0 |
| pl precisão média | 0.2553913287 | 0.2553913287 | 5.6e-17 |
| pl Brier | 0.09127570273 | 0.09127570273 | 4.2e-17 |
| pl log loss | 0.3148726313 | 0.3148726313 | 1.7e-16 |
| pl KS | 0.3620897320 | 0.3620897320 | 0.0e+0 |
| pl intercepto | 0.3918358881 | 0.3918358881 | 1.1e-16 |
| pl slope | 1.122405880 | 1.122405880 | 0.0e+0 |
| pl intercepto com slope 1 | 0.1450884125 | 0.1450884125 | 8.3e-17 |
| pgr AUC | 0.6958182776 | 0.6958182776 | 0.0e+0 |
| pgr precisão média | 0.1909852025 | 0.1909852025 | 0.0e+0 |
| pgr Brier | 0.09516223732 | 0.09516223732 | 8.3e-17 |
| pgr log loss | 0.3282170948 | 0.3282170948 | 0.0e+0 |
| pgr KS | 0.3328063836 | 0.3328063836 | 0.0e+0 |
| pgr intercepto | -0.1089965004 | -0.1089965004 | 1.1e-16 |
| pgr slope | 0.8804388536 | 0.8804388536 | 7.8e-16 |
| pgr intercepto com slope 1 | 0.1391394453 | 0.1391394453 | 5.6e-17 |
| pg AUC | 0.6958182776 | 0.6958182776 | 0.0e+0 |
| pg precisão média | 0.1909852025 | 0.1909852025 | 0.0e+0 |
| pg Brier | 0.09491026146 | 0.09491026146 | 4.2e-17 |
| pg log loss | 0.3298495546 | 0.3298495546 | 5.6e-17 |
| pg KS | 0.3328063836 | 0.3328063836 | 0.0e+0 |
| pg intercepto | 0.1271918610 | 0.1271918610 | 9.2e-16 |
| pg slope | 1.195220047 | 1.195220047 | 8.9e-16 |
| pg intercepto com slope 1 | -0.2159836083 | -0.2159836083 | 1.1e-16 |
| pt AUC | 0.7373343872 | 0.7373343872 | 1.1e-16 |
| pt precisão média | 0.2683153124 | 0.2683153124 | 2.2e-16 |
| pt Brier | 0.09037123600 | 0.09037123600 | 2.8e-17 |
| pt log loss | 0.3126941253 | 0.3126941253 | 1.7e-16 |
| pt KS | 0.4015545017 | 0.4015545017 | 0.0e+0 |
| pt intercepto | 0.1792030287 | 0.1792030287 | 1.7e-16 |
| pt slope | 1.137263868 | 1.137263868 | 4.4e-16 |
| pt intercepto com slope 1 | -0.06865691746 | -0.06865691746 | 1.4e-17 |
| mini AUC | 0.8066666667 | 0.8066666667 | 0.0e+0 |
| DeLong diferença | 0.02986675700 | 0.02986675700 | 4.4e-16 |
| DeLong erro padrão | 0.01518550704 | 0.01518550704 | 1.4e-17 |
| DeLong p | 0.04920701441 | 0.04920701874 | 4.3e-9 |
| bootstrap dif 2,5% | 0.0008080020853 | 0.0008080020853 | 0.0e+0 |
| bootstrap dif 97,5% | 0.05867926514 | 0.05867926514 | 0.0e+0 |
| Platt (calibração) a | -0.3975556299 | -0.3975556299 | 1.7e-16 |
| Platt (calibração) b | 0.7227478609 | 0.7227478609 | 6.7e-16 |

Pontos conferidos à parte:

- Platt na amostra de calibração: a máxima verossimilhança simples dá b = 0,7227 e a = −0,3976; o `CalibratedClassifierCV` do scikit-learn, que suaviza os alvos como Platt (1999), dá b = 0,7204 e a = −0,4025. O slide 29 mostra os dois.
- Isotônica: PAV com agrupamento de PDs iguais e interpolação linear, como o `IsotonicRegression`; a contagem de 16 valores distintos e a AUC de 0,6911 conferem com a referência.
- Bootstrap pareado: o mesmo gerador (mulberry32) foi portado para Python; o intervalo da diferença (0,0008 a 0,0587, 1.000 réplicas, semente 20260501) é idêntico nas duas linguagens.
- DeLong: diferença 0,0299, erro padrão 0,0152, intervalo 0,0001 a 0,0596, igual ao registrado pelo gerador do curso.
- Todo quadro foi renderizado no servidor (`tests/capitulo7-roteiro.test.ts`): nenhum exibe NaN, undefined, Infinity, null, travessão ou meia risca.

Inferência. Os números exibidos em sala reproduzem as bibliotecas de referência do mercado; uma divergência futura aparece no teste antes de chegar ao aluno.

## 3. Verificação funcional

| Verificação | Resultado |
|---|---|
| Setas num controle mudam o valor e não trocam de slide (palco) | ok |
| Tab chega aos botões com foco visível (contorno de 3 px) | ok |
| Ao sair e voltar, o quadro reabre no estado inicial | ok |
| Links do mapa abrem o slide no mesmo modo (palco) | ok |
| Retorno da previsão oculto antes da tentativa | ok |
| Alternativa errada nomeia a confusão e oferece nova tentativa | ok |
| Acerto abre a comparação (slides 29 e 30) | ok |
| Movimento reduzido: sem reprodução automática, transições zeradas | ok |
| Expansões: uma aberta por painel; se não cabe, sobe sobre o painel | ok, verificado com todas abertas a 1920 × 1080 |
| Sem erro de console nos 38 slides em cinco cenários | ok na varredura final |

Scripts: `node scripts/capitulo7/funcional.mjs`, `node scripts/capitulo7/varredura.mjs <pasta> "1920x1080:palco,1920x1080:palco+abrir,1366x768:palco,1366x768:estudo,390x844:estudo"` e `node scripts/capitulo7/acessibilidade.mjs`, todos contra o servidor local com a base semeada.

Testes automatizados:

| Suíte | Resultado |
|---|---|
| `npx tsc --noEmit` | sem erro |
| `npm run lint` | 0 erros; 5 avisos anteriores a este trabalho, fora do capítulo 7 |
| `npm run lint:tracos` | 0 travessões como pontuação |
| `npm test` | 418 testes em 42 arquivos, todos passando; inclui `tests/capitulo7-metricas.test.ts` (56), `tests/capitulo7-roteiro.test.ts` (7) e as questões curadas |
| `npx playwright test` | 24 de 24 testes de aceitação passando (2,4 min), com o teste de visuais nativos atualizado para o capítulo 7 |
| `node scripts/apostila/validar-explicacoes.mjs` | ok em todos os capítulos |

## 4. Verificação visual

Varredura de todos os 38 slides em cinco condições: palco a 1920 × 1080 com expansões fechadas e com todas abertas, palco a 1366 × 768, estudo a 1366 × 768 e estudo a 390 px (celular). O script mede, em cada captura, elementos cortados pela borda do painel, saídas do quadro, rolagem horizontal da página, menor fonte e erros de console. Capturas finais do palco a 1920 × 1080 em `docs/capitulo7/depois/`; as do capítulo antigo continuam em `docs/capitulo7/antes/`.

| Cenário | Slides | Cortes, saídas do quadro ou rolagem horizontal | Erros de console |
|---|---|---|---|
| Palco 1920 × 1080, expansões fechadas | 38 | 0 | 0 |
| Palco 1920 × 1080, todas as expansões abertas | 38 | 0 | 0 |
| Palco 1366 × 768 | 38 | 0 | 0 |
| Estudo 1366 × 768 | 38 | 0 (o alerta do slide 38 é o traço interno do radical do KaTeX, recortado por ele mesmo) | 0 |
| Estudo 390 px | 38 | 0 depois dos ajustes finais; a matriz do slide 7 rola na horizontal dentro do quadro, de propósito | 0 |

Auditoria do palco (`scripts/palco/auditoria.mjs`, seis critérios ponderados, nota mínima exigida 9):

| Resolução | Slides | Média | Abaixo de 9 | Abaixo de 7 |
|---|---|---|---|---|
| 1920 × 1080 | 38 | 9,35 | 0 | 0 |
| 1400 × 900 | 38 | 9,35 | 0 | 0 |

Nota sobre o critério: a auditoria já excluía da medida de fonte mínima os rótulos de seção, notas, fontes, legendas e títulos de gráfico das outras peças da plataforma (`.eyebrow`, `.nota`, `.vz-fonte`, `.vz-legenda`, `.vz-grafico-t`). Os equivalentes do capítulo 7 (`.q7-k`, `.q7-trilha`, `.q7-num`, `.q7-nota`, `.q7-fonte`, `.q7-leg`, `.q7-graf-t`) foram acrescentados à mesma lista; os pesos e as faixas dos critérios não mudaram. O texto corrido do capítulo passou a ter piso de 1,25cqw (cerca de 1,73% da altura do slide).

Acessibilidade (axe-core 4 sobre cada quadro, no estudo): nenhuma violação nos 38 quadros, depois de corrigir o contraste do âmbar e o cabeçalho vazio da matriz de confusão.

Ajustes feitos a partir dessas medições: cor âmbar do capítulo escurecida de #B8640F para #A85A0C (contraste de 4,31 para 5,08 sobre branco); piso de 1,25cqw para texto corrido; tabelas de dados como descrição oculta do gráfico (`aria-describedby`); expansões que sobem sobre o painel quando não cabem; leiaute da matriz de confusão, do KS, do Wilson, da comparação de modelos e da política refeitos; previsões dos slides 29 e 30 passam a mostrar o retorno do erro e a pedir nova tentativa antes de abrir a comparação.

## 5. Correções de conteúdo encontradas durante a validação

- O slide 28 dizia que Brier e log loss pioravam depois do ajuste de intercepto; o Brier piora (0,09516 para 0,09518) e a log loss melhora (0,3282 para 0,3274). O texto agora mostra os dois valores e diz que quase não mudam.
- O guia do slide 16 apontava "A" como resposta; o quadro, corretamente, pede verificar o nível faixa a faixa antes de escolher. O guia foi alinhado ao quadro.
- A base sintética permite repetir a janela: em 300 janelas novas dos mesmos proponentes, a vantagem esperada da logística sobre o boosting é 0,0067, não 0,0299. A janela observada exagerou a diferença. Os slides 33, 35 e 36 mostram isso; a decisão do caso integrador não depende da diferença de AUC.

## 6. Pendências e limites declarados

- Árvore do capítulo 5: o gerador não salvou previsões dela na janela fora do tempo; ela fica fora da comparação (slide 34), sem estimativa.
- A janela tem 81 defaults: todos os intervalos são largos, e o quadro diz isso onde importa.
- Apresentação em celular: o palco foi desenhado para projeção 16:9; em 390 px o modo previsto é o estudo, que passa na varredura. No palco a 390 px a grade de pessoas dos slides 3 e 17 não se ajusta.
- A matriz de 75 pares (slide 7) rola na horizontal no celular, de propósito, dentro do próprio quadro.
- Os PDFs da apostila não foram regenerados neste ambiente; as explicações do capítulo 7 (`scripts/apostila/explicacoes/c07.json`) foram reescritas e passam no validador.
- Questões com gabarito continuam no repositório público, como antes (pendência anterior a este trabalho).
- Produção não foi tocada; a publicação acontece no merge.
