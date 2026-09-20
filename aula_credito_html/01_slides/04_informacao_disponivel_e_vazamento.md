# Slide 04 — A previsão só pode usar o que já era conhecido

**Bloco:** problema. **Tempo:** 4 min. **Origem:** registros didáticos de disponibilidade.

## Objetivo e mensagem
Identificar vazamento temporal mesmo quando uma variável parece economicamente relevante. Mensagem: “Uma variável excelente depois do evento pode ser inútil para decidir antes dele.”

## Tela e composição
Título: **“Esse dado existia quando o crédito foi aprovado?”** Divida a tela em duas áreas com uma fronteira vertical “decisão”. Seis fichas de variáveis começam em uma faixa neutra. Destinos: “Disponível na decisão” e “Informação do futuro”. Evite diagrama decorativo: cada ficha deve conter valor e timestamp de disponibilidade.

## Conteúdo
Fichas: renda verificada antes da proposta; histórico de atrasos anterior; utilização de limite conhecida na data; valor renegociado três meses depois; atraso máximo nos 12 meses seguintes; informação de bureau consultada após a inadimplência. Acrescente um sétimo caso opcional: comprometimento incluindo a prestação proposta, calculável na decisão. Defina claramente por que ele pode ser permitido sem observar o futuro.

## Interação
O aluno seleciona uma ficha e escolhe o destino com botão ou arraste. Nada é corrigido automaticamente antes de “Conferir”. Ao conferir, uma justificativa explica a classificação e realça o timestamp, não apenas a cor. Resposta incorreta permanece visível com possibilidade de corrigir. Reiniciar volta todas as fichas à origem. Alternativa acessível: lista com select por ficha.

## Sequência
Primeiro classifique as três fáceis. Use “atraso máximo futuro” para estabelecer a regra. Termine com a consulta tardia de bureau: a informação pode descrever algo anterior, mas seu acesso e versão precisam ser conhecidos no momento da decisão. Esse detalhe evita ensinar que basta olhar a data do fenômeno.

## Notas do professor
Explique a diferença entre data de referência e data de disponibilidade. Lembre que limpeza, imputação, seleção de variáveis e normalização também podem vazar informação se aprenderem com o teste. Não amplie ainda para pipeline detalhado. O objetivo é fixar a fronteira de informação.

## Transição
“Além de separar passado e futuro dentro de cada proposta, precisamos separar as amostras usadas para aprender e avaliar.”

## Aceite específico
Cada ficha tem resposta e justificativa específica. O dado renegociado e a consulta tardia não podem ser aceitos como disponíveis. O comprometimento da operação proposta deve ser explicado corretamente. Nenhum arraste é obrigatório para usar o exercício.

## Contrato comum de implementação

Leia também os guias de [narrativa](../00_guias/01_narrativa_e_contrato.md), [design e interação](../00_guias/02_design_e_interacao.md), [dados e cálculos](../00_guias/03_dados_e_calculos.md) e [aceite](../00_guias/05_qualidade_e_aceite.md). O estado inicial precisa ensinar sem clique; a exploração amplia a explicação. Inclua reinício local, teclado, toque, descrição acessível, notas do professor e estado estático de impressão. Mantenha o padrão de fonte dos dados indicado neste roteiro.

Implemente este slide, execute os critérios específicos acima, registre evidências em `02_controle/STATUS_SLIDES.md` e só então avance. Uma especificação escrita não é implementação concluída.
