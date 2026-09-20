# Slide 45 — Ranking bom não garante probabilidades corretas

**Bloco:** avaliação. **Tempo:** 5 min. **Origem:** previsões empíricas e transformação ilustrativa.

## Objetivo e mensagem
Interpretar um gráfico de calibração e separar transformação monotônica de qualidade probabilística. Mensagem: “Calibrar é verificar a escala das probabilidades, não apenas a ordem dos clientes.”

## Tela e composição
Título: **“Entre os clientes com PD próxima de 10%, quantos ficaram inadimplentes?”**. Reliability diagram central: média prevista no eixo x e frequência observada no y, diagonal de referência. Cada faixa mostra n e número de eventos ao selecionar. Abaixo, histograma das probabilidades com faixas alinhadas. Se houver incerteza, representar intervalos sem sobrecarregar.

## Dados e cálculos
Usar faixas com contagem suficiente, indicando agrupamento por quantis ou limites fixos. Uma transformação ilustrativa `p'=sigmoid(logit(p)+ln2)` multiplica odds por dois e preserva ranking sem empates novos. AUC deve permanecer igual dentro da tolerância, enquanto calibração e perdas podem mudar. Não afirmar que sempre pioram: a direção depende da calibração inicial.

## Interação
Toggle “previsões originais / odds multiplicadas por 2” mostra o efeito, identificado como perturbação ilustrativa, não novo modelo treinado. Seletor de modelo para o experimento. “Após calibração” só aparece se calibrador foi ajustado na partição apropriada e aplicado ao teste sem refit. O resultado pode melhorar ou piorar; mostrar o observado.

## Sequência
Leia um ponto completo: probabilidade média, proporção observada, n e eventos. Aplique a transformação e pergunte o que deve acontecer com AUC antes de revelar. Discuta por que PD em escala errada pode distorcer perda esperada e política de corte.

## Notas
Wilson por faixa é descrição binomial aproximada e não incorpora toda seleção/modelagem. Brier e log-loss avaliam qualidade probabilística, mas não são medidas exclusivas de calibração. Evitar selecionar número de bins, calibrador ou versão favorita pelo teste final.

## Ponte
“Uma PD só vira ação quando definimos uma política. Vamos observar como um corte altera a carteira aprovada.”

## Aceite específico
A transformação preserva ordem e AUC numericamente. Cada ponto usa média prevista da própria faixa. Denominadores visíveis. Calibrador e dados de ajuste rastreáveis. Não impor curva perfeita por construção visual.

## Contrato comum de implementação

Leia também os guias de [narrativa](../00_guias/01_narrativa_e_contrato.md), [design e interação](../00_guias/02_design_e_interacao.md), [dados e cálculos](../00_guias/03_dados_e_calculos.md) e [aceite](../00_guias/05_qualidade_e_aceite.md). O estado inicial precisa ensinar sem clique; a exploração amplia a explicação. Inclua reinício local, teclado, toque, descrição acessível, notas do professor e estado estático de impressão. Mantenha o padrão de fonte dos dados indicado neste roteiro.

Implemente este slide, execute os critérios específicos acima, registre evidências em `02_controle/STATUS_SLIDES.md` e só então avance. Uma especificação escrita não é implementação concluída.
