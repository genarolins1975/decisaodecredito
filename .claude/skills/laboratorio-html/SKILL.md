---
name: laboratorio-html
description: Produz páginas HTML no padrão visual do Laboratório de Decisão de Crédito (FGV): relatórios, painéis, infográficos de capítulo, páginas de aula e materiais para alunos. Use SEMPRE que o pedido for um HTML, uma página, um infográfico ou um material visual ligado ao curso de decisão de crédito, à plataforma decisaodecredito.com ou às aulas do Prof. Genaro. Cobre tokens (cores, tipografia, espaçamento), arquétipos de página, a gramática do infográfico de abertura e o QA visual obrigatório por captura de tela em três larguras.
---

# Laboratório HTML

Toda página sai sobre os tokens de `assets/tokens.css` e os componentes de `assets/base.css`, os mesmos da plataforma (`src/app/globals.css`) e do design system publicado "Laboratório de Decisão de Crédito". A skill entrega o arquivo pronto para uso real, conferido por captura de tela.

## Regras invioláveis

1. Nenhum hífen nem travessão em texto exibido. Reescrever com vírgula, dois pontos, "e", "ou" ou parênteses. Única exceção: o sinal de menos em número ou fórmula, com "−" (U+2212).
2. Acentuação correta em português do Brasil em todo texto gerado.
3. Todo número exibido tem origem no conteúdo do curso (`content/generated/extract.json`, `content/infograficos/*.json`) ou é calculado e declarado como tal. Nunca inventar valor.
4. Paleta travada em `tokens.css`. Acentos por papel: `--color-ink-soft` (azul, primeira ideia), `--color-amber` (âmbar, segunda), `--color-ok` (verde, terceira ou resultado positivo), `--color-ink` (navy, síntese), `--color-alert` (vermelho, só default ou resultado negativo), `--color-muted` (neutro). A cor do capítulo entra por `--cap` e `--cap-soft`.
5. Um único tema, claro, com `body` de fundo `--color-ground`. Contraste mínimo 4,5:1 no texto.
6. Sem sombras decorativas, gradientes, ícones ou emoji. Estrutura com informação: numeração só quando há sequência real.
7. QA visual obrigatório antes de entregar (abaixo). Texto cortado, sobreposto ou rolagem horizontal é defeito, não detalhe.

## Fluxo

1. Ler `references/design-system.md` (tokens, escala tipográfica, arquétipos e a gramática do infográfico).
2. Reunir o conteúdo com os números na fonte. Página de capítulo: partir de `content/infograficos/cNN.json` quando existir.
3. Escolher o arquétipo (abaixo). Começar de `templates/pagina.html`, que já importa `tokens.css` e `base.css` inline.
4. Escrever o HTML completo, com `<title>` curto, `lang="pt-BR"`, sem dependências externas além de fontes do Google quando pedidas.
5. Rodar o QA: `node scripts/qa.mjs caminho/da/pagina.html` gera capturas em 1400, 960 e 400 px, verifica rolagem horizontal, texto com hífen ou travessão e contraste dos tokens. Abrir as capturas e corrigir o que aparecer.
6. Entregar o arquivo e, se for para a plataforma, integrar pelos componentes existentes em vez de duplicar CSS.

## Arquétipos

- **Infográfico de abertura**: cabeçalho numerado, fluxo em quatro cartões, três números com faixa de fórmula, três painéis de evidência (pontos, tempo, barras, chave e valor, lista) e faixa final de três ideias. Estrutura `.info` de `base.css`, idêntica ao componente `InfograficoCapitulo` da plataforma. Dados no JSON do capítulo.
- **Página de aula**: eyebrow do capítulo, título, objetivo, apoio, corpo em blocos, questão com alternativas, "para discutir em aula", "a seguir".
- **Relatório executivo**: título, síntese em um parágrafo, três a cinco números em tiles, seções com tabelas `.table` e chamadas `.callout`, fonte e data de cada número.
- **Painel de acompanhamento**: resumo antes do detalhe, estado codificado em `.badge`, tabela com `tabular-nums`, sem gráfico sem escala.
- **Material do aluno**: texto corrido com `--measure`, caixas `.caixa-objetivo`, `.caixa-apoio`, `.caixa-discutir`, tabela de erros comuns ao final.

## Palco: qualquer coisa que vá para a apresentação

A apresentação da plataforma é um deck 16:9 (`/apresentacao/<slug>`), e cada tela obedece às regras de um slide de PowerPoint:

1. **Tudo cabe na área visível.** Nada rola dentro do slide. Uma página vira uma sequência de telas compostas a partir das unidades do conteúdo (parágrafo, painel, figura, questão), inclusive dentro do HTML do material: o compositor (`src/lib/palco/compositor.ts`, lado DOM em `unidades.ts`) mede cada unidade e escolhe o menor número de telas que cabem, equilibradas entre si. Cabeça (título, `.rot`, kicker) nunca fica separada do corpo; legenda nunca fica separada da figura.
2. **Nenhuma tela vazia nem rala.** A tela é centrada na área e escalada com reflow (zoom entre 0,55 e 1,5) até preencher a altura. O compositor não abre tela nova quando a ocupação média cairia abaixo de 50% antes do zoom. Largura da tela sempre em 100%: com o zoom padrão do navegador as porcentagens já se resolvem no espaço ampliado.
3. **Colunas do material lado a lado.** `.palcoflex` fica em duas colunas no slide (`.esq` 40% ou a proporção declarada em `data-colunas`); quando uma coluna começa por figura e cabe folgada, ela persiste em todas as telas enquanto a outra coluna é paginada.
4. **Uma ideia por tela.** Peça principal grande, painéis secundários escondidos no slide (`.slide-inner` em `globals.css`, seção "Palco"). Episódio de abertura e síntese de fecho têm leiaute próprio de palco (`palco-episodio`, `palco-sintese`): tudo visível, sem abas.
5. **Alturas em cqh, tipografia proporcional.** Dentro do slide, gráficos e figuras têm altura em fração da altura do slide (`height: 40cqh`, `max-height: 58cqh`), largura automática e `max-width: 100%`. Corpo do material em `clamp(14px, 2.4cqh, 26px)`; tamanhos em px do material são sobrescritos por `em`. Visual interativo herdado (iframe) é reduzido por `transform` até 72% da altura do slide, porque o zoom externo não alcança o documento do iframe.
6. **Nota mínima 9 em toda página.** Antes de entregar qualquer página, visual ou mudança no deck, rodar a auditoria e reconstruir até que toda página tenha média 9,0 ou mais e nenhuma tela abaixo de 8:

   ```
   node scripts/palco/auditoria.mjs tmp/ux/auditoria-palco.json todas 1400x900
   node scripts/palco/auditoria.mjs tmp/ux/auditoria-palco.json <slugs> 1920x1080 <pasta de capturas>
   ```

   A auditoria pontua cada tela em seis critérios de 0 a 10 e a página recebe a média das telas:

   | Critério | Peso | Como se mede | 10 | 9 | 7 | 5 |
   |---|---|---|---|---|---|---|
   | Ajuste | 25% | rolagem interna ou elemento cortado pela borda da área | nada cortado | | corte até 2% | corte maior (4); rola (0) |
   | Ocupação | 20% | altura da tela dividida pela altura da área | ≥ 66% | ≥ 55% | ≥ 45% | ≥ 35% |
   | Legibilidade | 20% | menor fonte de texto corrido em % da altura do slide; comprimento de linha em parágrafos | ≥ 1,9% | ≥ 1,7% | ≥ 1,5% | ≥ 1,3% (linha acima de 95 caracteres tira 1 ponto; acima de 115, 2) |
   | Densidade | 15% | palavras visíveis na tela | ≤ 100 | ≤ 140 | ≤ 180 | ≤ 230 |
   | Estrutura | 10% | cabeça órfã no fim da tela (menos 4), parágrafo viúvo sozinho (menos 3), legenda solta no início (menos 3) | sem ocorrência | | | |
   | Foco | 10% | unidades de topo visíveis na tela | ≤ 4 | | 5 a 6 (8) | 7 a 8 (6) |

   Referências de 1,9% da altura do slide: 15 px em 1400×900, 20 px em 1920×1080. O relatório imprime, por tela, as seis notas, ocupação, zoom, menor fonte, palavras e unidades, e nomeia o elemento cortado ou a fonte miúda. Corrigir a causa (leiaute, CSS do palco, unidade indivisível grande demais), nunca o critério.

## Tipografia e medida

Títulos em serifa (`--font-serif`), corpo em `--font-sans`, números em `tabular-nums`. Corpo 16 px, texto de apoio 13 a 14 px, legendas 12,5 px, eyebrow 11 px em caixa alta com espaçamento. Texto corrido até `--measure` (66 caracteres).

## QA visual

`scripts/qa.mjs` usa o Chromium do ambiente (`/opt/pw-browsers`), salva `qa/<nome>-<largura>.png` ao lado do arquivo e imprime: largura de rolagem por viewport, ocorrências de hífen ou travessão no texto visível, elementos que estouram o contêiner. Corrigir e rodar de novo até zerar. Nunca entregar sem olhar as três capturas.
