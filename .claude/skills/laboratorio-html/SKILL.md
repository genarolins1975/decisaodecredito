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

## Tipografia e medida

Títulos em serifa (`--font-serif`), corpo em `--font-sans`, números em `tabular-nums`. Corpo 16 px, texto de apoio 13 a 14 px, legendas 12,5 px, eyebrow 11 px em caixa alta com espaçamento. Texto corrido até `--measure` (66 caracteres).

## QA visual

`scripts/qa.mjs` usa o Chromium do ambiente (`/opt/pw-browsers`), salva `qa/<nome>-<largura>.png` ao lado do arquivo e imprime: largura de rolagem por viewport, ocorrências de hífen ou travessão no texto visível, elementos que estouram o contêiner. Corrigir e rodar de novo até zerar. Nunca entregar sem olhar as três capturas.
