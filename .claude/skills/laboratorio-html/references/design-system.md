# Design system do Laboratório de Decisão de Crédito

Identidade acadêmica executiva: off-white, azul-marinho, cinzas quentes e dourado discreto; vermelho só em alerta ou default. Fonte da verdade: `src/app/globals.css` (plataforma) e `assets/tokens.css` (esta skill). O design system publicado como artefato "Laboratório de Decisão de Crédito" espelha os mesmos valores.

## Cores (tema único, claro)

| token | valor | uso |
|---|---|---|
| ground | #F5F4F0 | fundo da página |
| paper | #FBFAF7 | superfície secundária, quadros de apoio, painéis |
| surface | #FFFFFF | cartões, tabelas, tiles |
| ink | #00205B | títulos, links, negrito, faixa de síntese |
| ink-soft | #3D5A8A | acento azul (primeira ideia de uma série) |
| gold | #C9A84C | foco de teclado, filete do painel do professor, eyebrow sobre navy |
| gold-soft | #F4ECD6 | fundo de rótulo dourado, fórmula quando não há cor de capítulo |
| amber | #B8640F | acento âmbar (segunda ideia); legível como texto sobre paper |
| body | #333333 | corpo de texto |
| muted | #5B6475 | legendas, eixos, notas, nomes de tile |
| rule | #E2DFD6 | réguas e bordas |
| alert / alert-soft | #8C2332 / #FBF2F3 | erro, default, resultado negativo |
| ok / ok-soft | #2E6B4F / #F0F7F3 | bom, resultado positivo, terceira ideia |
| warn / warn-soft | #7a5309 / #FDF7E9 | alerta |
| dots | #C9D8F2 | pontos neutros de uma grade de frequência |
| cap-1 … cap-11 (e -soft) | ver tokens.css | cor forte e suave de cada capítulo; `--cap` e `--cap-soft` recebem o par em uso |

Regras: acento por papel, nunca por gosto; vermelho nunca como "quarta cor"; texto sempre em body, ink ou muted, nunca na cor da série (a série colore a marca ao lado do texto); sobre navy, texto branco ou #DCE7F3 e eyebrow em gold.

## Tipografia

| papel | fonte | tamanho | notas |
|---|---|---|---|
| h1 | serif 700 | clamp(24px, 2,6vw, 34px) | `text-wrap: balance` |
| h2 | serif 700 | clamp(20px, 2,1vw, 28px) | |
| h3 | serif 700 | 18px | |
| corpo | sans 400 | 16px / 1,5 | medida máxima 66ch |
| apoio | sans 400 | 13 a 14px / 1,4 | cartões, painéis |
| legenda, nota | sans 400 | 12,5px, muted | |
| eyebrow | sans 700 | 11px, caixa alta, espaçamento .09em | muted; sobre navy, gold |
| número de tile | serif 700 | 30px (até 4 caracteres), 24px (até 8), 18px (mais) | `tabular-nums` |
| número de capítulo | serif 700 | 52px, cor do capítulo | |

Serifa: "Iowan Old Style", Palatino, Georgia. Sans: sistema. Mono: sistema. Nenhum arquivo de fonte: são pilhas do sistema, o que dispensa carregamento.

## Espaço, raio, sombra

Espaços de 4, 8, 12, 16, 20, 24, 32 e 48 px. Raios 3 px (badge), 4 px (botão, input) e 6 px (cartão, painel). Sombra só em `.card` (`--shadow-card`); nunca em texto ou infográfico. Gutter lateral mínimo de 16 px em qualquer largura.

## Componentes (base.css)

`.card`, `.panel-soft`, `.callout` (e `-alert`, `-ok`, `-warn`), `.btn` (e `-secondary`, `-ghost`), `.badge` (e `-ink`, `-ok`, `-warn`, `-alert`, `-muted`), `.table` dentro de `.table-wrap`, `.kv`, `.eyebrow`, `.hint`, `.caixa` (`-objetivo`, `-apoio`, `-discutir`), `.questao`, e a família `.info-*` do infográfico.

## Gramática do infográfico de abertura

Quatro blocos, sempre nesta ordem, com os textos do JSON do capítulo (`content/infograficos/cNN.json`):

1. **Fluxo**: kicker "1 · …" e quatro cartões numerados (`.info-cartao`, `data-cor` steel, orange, navy, green), cada um com título curto e um parágrafo de duas a três linhas com os números do capítulo.
2. **Três números**: kicker "2 · …", três tiles (`.info-tile`) com sigla ou número grande, nome em muted e descrição de até três linhas; à direita a faixa de fórmula (`.info-formula`, fundo `--cap-soft`) com a fórmula em serifa e uma nota.
3. **Evidência**: kicker "3 · …" e três painéis (`.info-painel`) de tipos `pontos` (grade de 100 com defaults em alert), `tempo` (linha do tempo SVG com marca e janelas), `barras` (barras horizontais rotuladas, valor à direita), `kv` (linhas chave e valor) ou `lista` (marcadores quadrados).
4. **Faixa**: `.info-faixa` em navy com eyebrow em gold e três pares termo e definição, os mesmos "três ideias para levar" da página de síntese do capítulo.

Responsivo: quatro colunas até 960 px, duas até 560 px, uma abaixo. No modo apresentação o infográfico rola dentro do slide com a escala do slide.
