# Revisão final da implementação HTML

Executada ao fim da construção dos 50 slides. Cada linha abaixo aponta o arquivo ou o
comando que produz a evidência, e as limitações estão declaradas no final.

## Entregáveis

| Item | Estado | Caminho/evidência | Limitação |
|---|---|---|---|
| HTML offline com 50 slides | Entregue | `dist/aula_credito.html`, 1.325 KB com o KaTeX embutido, arquivo único | Abre por `file://`; nenhuma requisição externa, confirmado pelo QA |
| Variante do aluno sem notas e notas em JSON (21/09/2026) | Entregue | `dist/aula_credito_aluno.html` (1.269 KB) e `dist/aula_credito_notas.json` (89 KB); conferência frase a frase na compilação e em `tests/aula-2-build.test.ts` | Os exercícios continuam revelando a própria resposta ao conferir, por desenho |
| Código organizado por slide | Entregue | `app/slides/s01.js` a `s50.js` (7.321 linhas), `app/nucleo/` e `app/dados/` (1.906 linhas), `app/estilo/aula.css` | Um arquivo por slide, sem framework, `script` clássico para funcionar em `file://` |
| Notas do professor e respostas | Entregue | Painel de notas por tecla `p` ou botão Professor; oculto por padrão | Notas de aprofundamento existem em 6 slides do bloco de logit |
| Modo estudo | Entregue | Tecla `e` ou botão Estudo; automático abaixo de 1100px | Verificado em 1024x768 e 390x844 |
| Impressão | Entregue | `qa/aula_credito_impressao.pdf`, 75 páginas | 50 folhas, uma por slide, mais apêndice de notas; `node imprimir.mjs` regenera |
| Notebook executado | Entregue | `experimento/experimento.ipynb`, 8 células de código, todas com saída | Gerado e executado por `python3 experimento/gerar_notebook.py` |
| Dados sintéticos | Entregue | `experimento/saida/base_sintetica.csv.gz`, 28.000 linhas, 560 KB | gzip com mtime fixo: o resumo criptográfico é estável entre execuções |
| Resultados exportados | Entregue | `experimento/saida/resultados.json` (380 KB) e `metadados.json` | sha256 e versões gravados em `metadados.json` e reconferidos no notebook |
| Ambiente reproduzível | Entregue | `experimento/requisitos.txt` | Python 3.11.15, numpy 2.4.6, sklearn 1.9.1, semente 20260920 |
| Mapa de reaproveitamento | Entregue | `02_controle/MAPA_REAPROVEITAMENTO.md` | Capítulo 4 mapeado página a página; demais capítulos, por título |
| Verificação numérica | Entregue | `experimento/experimento.ipynb`, seções 4 a 7 | Ver a seção "Conferências numéricas" abaixo |
| Inspeção visual dos 50 slides | Entregue | `node qa.mjs --shots` gera `qa/slide-NN-1366.png` | Capturas não versionadas, 11 MB, refeitas em um comando; a medida por slide está nos relatórios JSON |
| Navegação e controles | Entregue | `node qa.mjs --estados` clica todos os botões de cada slide em três rodadas e mede fórmulas, estouro, corte, transbordo, rolagem e zoom após cada uma (21/09/2026) | 50 de 50 em 1366x768, 1920x1080, 1024x768 e 390x844, e na variante do aluno |
| Abertura offline | Entregue | QA registra requisições externas; nenhuma encontrada | `qa/relatorio-1366.json`, campo `externas` vazio |

## O que a verificação automática cobre

`node qa.mjs` abre a distribuição offline e, por slide, mede:

1. erros de console e de página;
2. hífen ou travessão no texto visível, incluindo o modo estudo;
3. rolagem interna do corpo do slide, na projeção, e rolagem horizontal da página, no
   modo estudo;
4. transbordo de qualquer elemento além da área de 1600 por 900;
5. rótulo de SVG que sai da viewBox e aparece cortado na tela;
6. painel cujo conteúdo não cabe na caixa, situação em que o excedente fica sob o
   painel vizinho;
7. requisições fora de `file://` ou `data:`.

`node lint-tracos.mjs` varre todo o texto declarado dos 50 slides, inclusive notas do
professor, que só aparecem no modo estudo e na impressão: 0 ocorrências de hífen ou
travessão.

`node imprimir.mjs` gera o PDF e confere folhas montadas, blocos de notas no apêndice,
controles visíveis na impressão e conteúdo além do palco.

## Conferências numéricas

| Conferência | Resultado |
|---|---|
| Eficiência de Shapley, 4 clientes | base mais contribuições igual ao escore, erro 0,00e+00 nos quatro |
| Calibração de Platt é monótona | AUC bruta igual à calibrada nos três modelos, igualdade exata |
| Medianas de imputação | calculadas só no treino e aplicadas a todas as partições |
| Maturação do alvo | cada partição tem alvo completo 12 meses após a última contratação |
| Amplitude de AUC no teste | 0,005392 entre logit, árvore e boosting, sem vencedor predeterminado |
| Resumo criptográfico dos arquivos | conferido no notebook contra o disco: confere |

## Revisão de narrativa

- **A abertura produz uma pergunta que o final responde.** O slide 01 pede a decisão
  sobre quatro clientes sem modelo; o slide 50 retoma os mesmos quatro, agora com as
  três técnicas, a política e a evidência exigida.
- **Os clientes permanecem coerentes.** Ana, Bruno, Carla e Diego têm as mesmas seis
  características do slide 02 ao 50, lidas sempre de `app/dados/10-dados.js`.
- **Cada transição torna necessário o assunto seguinte.** As transições estão nas notas
  do professor e foram escritas como ponte, não como resumo.
- **Prática antes da comparação.** Exercícios com resposta verificada nos slides 20, 30
  e 42, um por bloco, antes do bloco de avaliação.
- **Boosting compreensível sem experiência prévia.** A sequência 31 a 36 usa dez
  registros e duas iterações com números fechados, e só depois vai ao experimento.
- **Ranking, calibração e política ficam separados.** Slide 44 para ordenação, 45 para
  calibração, 46 e 47 para política e economia. O slide 45 mostra explicitamente que a
  AUC não muda com a calibração.
- **Ritmo.** 50 slides principais, com aprofundamentos identificados nas notas, não na
  sequência projetada.

## Reconciliações com a especificação

| Ponto | Especificação | Implementado | Por quê |
|---|---|---|---|
| Cor de alerta | `#A42B3A` | `#8C2332` | Contraste insuficiente do tom original sobre `--ground` em projeção clara |
| "log odds" e "log loss" | grafia com hífen em alguns roteiros | sem hífen | Regra da casa: nenhum hífen em texto exibido |
| Exemplo canônico de logit | pacote permite adotar o exemplo do original | mantido o do pacote | Ver `MAPA_REAPROVEITAMENTO.md`, seção "Controle do exemplo canônico" |
| Descida de gradiente no logit | páginas c4p16 e c4p17 do original | realocada ao bloco de boosting | Aparece uma vez só, onde também é o mecanismo de ajuste |

## Limitações reais da entrega

1. **Base sintética.** Os resultados de modelo vêm de dados gerados por
   `experimento/experimento.py` com semente 20260920. Nenhum número descreve carteira
   real. Os 13 slides que exibem resultado do experimento trazem a linha de fonte
   "Experimento sintético; semente e versões no notebook", e o slide 49, que é a
   decisão de comitê, traz também o selo "base sintética".
2. **Economia didática.** Margem, LGD e EAD do slide 47 são hipóteses declaradas na
   tela, não medições. Nenhum custo de implantação foi atribuído aos modelos porque
   nenhum foi medido, e isso está dito no slide 49.
3. **Cenários de monitoramento.** Os três cenários do slide 48 são construídos para a
   aula. Não são previsão macroeconômica nem backtest.
4. **Leitura do material original.** O capítulo 4 foi lido página a página. Os demais
   capítulos foram lidos por título e metadados, o suficiente para mapear blocos, não
   para auditar cada página.
5. **Formulário do slide 49.** O texto digitado fica apenas no dispositivo e não é
   enviado nem persistido.
6. **Navegador verificado.** Chromium 1194, via Playwright. Não houve verificação em
   Firefox nem em Safari.
7. **Impressão.** O PDF foi gerado pelo Chromium com A4 paisagem e margem zero.
   Impressoras com margem obrigatória podem reduzir a folha proporcionalmente.
8. **Guias em PDF.** As capturas dos slides nos dois guias são imagens de 1600 por 900
   pixels feitas no Chromium; os controles aparecem, mas não funcionam no papel, e o texto
   miúdo de alguns painéis fica legível apenas com ampliação. O ritmo por bloco do guia do
   professor é uma proposta calculada sobre os 165 minutos úteis do desenho do curso, não
   uma medição em sala.
