# Slide 44 — Discriminação é colocar maior risco acima de menor risco

**Bloco:** avaliação. **Tempo:** 5 min. **Origem:** microexemplo de ranking e experimento sintético, em abas identificadas.

## Objetivo e mensagem
Interpretar AUC e KS sem confundi-los com calibração ou aprovação. Mensagem: “Um modelo pode ordenar bem mesmo que suas probabilidades estejam na escala errada.”

## Tela e composição
Título: **“Quem aparece primeiro na fila de risco?”**. Na visão inicial, seis registros ordenados por escore com resultado conhecido e linhas de conexão para comparação de pares. À direita, AUC construída por pares. Na visão “modelos”, mostrar ROC e curvas acumuladas para KS em painéis alternados ou focados, sem três gráficos minúsculos simultâneos.

## Microexemplo
Inadimplentes com escores [0,8;0,6;0,4]; adimplentes [0,7;0,3;0,2]. São escores de ranking, sem alegação de calibração. Há 9 pares, 7 corretamente ordenados: AUC=7/9≈0,7778. Empates contam meio, demonstrados em um cenário opcional calculado. KS no conjunto é calculado das distribuições com convenção e direção explícitas, não da AUC.

## Interação
Selecionar um inadimplente realça comparações com os três adimplentes. “Contar todos” revela 7/9. Na aba empírica, seletor de modelo atualiza ROC, AUC e ponto de maior distância do KS. Mover limiar mostra TPR e FPR, sem sugerir que a AUC muda com o corte. Exibir amostra e período.

## Roteiro
Comece pelo par, não pela integral. Pergunte se o escore 0,8 significa 80% de PD calibrada: neste exemplo, não há essa evidência. Revele as curvas como resumo da ordenação. Diferencie taxa de falsos positivos de inadimplência entre aprovados.

## Notas
Orientação: score maior significa maior risco. AUC baseada em pares não é acurácia, taxa de acerto de aprovados ou rentabilidade. KS e AUC resumem aspectos diferentes; um não determina o outro. Comparações pequenas podem exigir avaliação de incerteza, registrada em aprofundamento se calculada.

## Ponte
“Mesmo que o ranking esteja certo, precisamos perguntar se uma previsão de 10% corresponde a cerca de 10% de eventos.”

## Aceite específico
AUC manual 7/9 confirmada por cálculo independente. Curvas empíricas derivadas das mesmas previsões. Mudar corte não muda AUC. Nenhum eixo confunde TPR com aprovação ou FPR com inadimplência da carteira.

## Contrato comum de implementação

Leia também os guias de [narrativa](../00_guias/01_narrativa_e_contrato.md), [design e interação](../00_guias/02_design_e_interacao.md), [dados e cálculos](../00_guias/03_dados_e_calculos.md) e [aceite](../00_guias/05_qualidade_e_aceite.md). O estado inicial precisa ensinar sem clique; a exploração amplia a explicação. Inclua reinício local, teclado, toque, descrição acessível, notas do professor e estado estático de impressão. Mantenha o padrão de fonte dos dados indicado neste roteiro.

Implemente este slide, execute os critérios específicos acima, registre evidências em `02_controle/STATUS_SLIDES.md` e só então avance. Uma especificação escrita não é implementação concluída.
