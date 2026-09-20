# Aula prática de modelagem de crédito em HTML

Este pacote contém especificações detalhadas para **50 slides interativos**. Ele orienta a produção da apresentação pelo Claude. Não contém uma apresentação HTML já implementada nem resultados de treinamento já executados.

## Como usar

1. Extraia o ZIP em uma pasta de trabalho acessível ao Claude. Se o ambiente aceitar apenas anexos, envie o ZIP e peça que o extraia antes de começar.
2. Anexe a apresentação original, especialmente o material de logit. Se for HTML, inclua os recursos dos quais ele depende. Não envie apenas um endereço `file://` do seu computador.
3. Envie o conteúdo completo de [INICIAR_NO_CLAUDE.md](INICIAR_NO_CLAUDE.md) como instrução inicial.
4. Peça que o Claude mantenha os arquivos de controle atualizados e prossiga slide por slide até concluir os 50.

**Comando curto de início:** “Leia `INICIAR_NO_CLAUDE.md` e execute integralmente. Implemente os 50 slides HTML na ordem dos arquivos de `01_slides`, aproveitando o logit dos anexos e verificando cada slide antes de avançar. Prossiga autonomamente e registre seu avanço.”

## Organização

| Local | Conteúdo |
|---|---|
| `INICIAR_NO_CLAUDE.md` | Prompt operacional completo |
| `MAPA_DOS_50_SLIDES.md` | Índice, propósito e interação principal de cada slide |
| `00_guias/` | Narrativa, design, dados, reaproveitamento, qualidade e referências |
| `01_slides/` | Um Markdown detalhado para cada slide |
| `02_controle/` | Modelos para rastrear execução, reaproveitamento e revisão |

## Escolhas pedagógicas

A mesma concessão de crédito pessoal conecta todos os blocos. Ana, Bruno, Carla e Diego reaparecem ao longo da aula. Os exemplos numéricos de mecanismo são separados do experimento empírico sintético para não apresentar um cálculo inventado como modelo estimado.

A previsão é inadimplência superior a 90 dias nos 12 meses seguintes à contratação. A aula prioriza interpretação, comparação, generalização e decisão. Não pretende cobrir modelagem regulatória, IFRS 9 ou implantação bancária completa.

Planejamento de tempo: aproximadamente 180–210 minutos, com demonstrações e exercícios. O professor pode dividir em dois encontros, encerrando o primeiro no slide 30. As explorações opcionais ficam no modo estudo ou em aprofundamentos, sem aumentar os 50 slides principais.

O material original não foi fornecido nesta solicitação. Por isso, este pacote define um procedimento explícito de reaproveitamento, sem afirmar quais slides antigos serão mantidos. A correspondência será preenchida pelo Claude após ler os anexos.
