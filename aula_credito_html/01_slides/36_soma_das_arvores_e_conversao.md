# Slide 36 — Somamos contribuições no escore e só então calculamos PD

**Bloco:** boosting. **Tempo:** 4 min. **Origem:** miniatura de duas iterações.

## Objetivo e mensagem
Reproduzir a previsão aditiva e distinguir treino de uso. Mensagem: “Para prever, o cliente percorre as árvores já aprendidas; não precisamos conhecer seu desfecho.”

## Tela e composição
Título: **“Escore inicial + árvore 1 + árvore 2 = nova PD”**. Waterfall principal para grupo B: −1,386294, +0,200000, +0,166078, total −1,020217. Ao lado, mini-sigmoide converte o total em 26,50%. Abaixo, ficha “novo cliente com comp>40”, sem y. Pequenas miniaturas das duas árvores mostram o percurso dessa ficha.

## Dados
Usar contribuições reais da miniatura, com η=1 já aplicado. Grupo A disponível como comparação: contribuições −0,2 e −0,169906, total −1,756200 e PD≈14,73%. Distinguir claramente contribuição h de ηh se houver eta diferente em aprofundamento.

## Interação
Selecionar A/B ou escolher comp do novo cliente em slider 20–60%, passo 1. O percurso muda em 40/41 e atualiza todas as contribuições e a PD. “Ver somente escore” e “Converter em PD” servem à revelação. Botão “Como foi treinado?” abre resumo dos resíduos, sem sugerir que precisamos calcular y−p para um solicitante novo.

## Sequência
Apresente novo cliente e pergunte onde está y. Mostre que y só foi usado no treinamento. Faça o percurso nas duas árvores, some e converta. Compare com o waterfall do logit: ambos somam em uma escala de escore, mas as funções que produzem as contribuições são diferentes.

## Notas
Não somar as PDs de cada árvore nem chamar as contribuições de probabilidades. Um ensemble real tem muitas árvores e padrões mais ricos; a miniatura de duas árvores apenas torna o mecanismo visível. Esta não é uma explicação SHAP: é a decomposição exata da soma das árvores.

## Ponte
“Se cada passo for menor, precisaremos de mais etapas. Como escolher o tamanho dos passos e o número de árvores?”

## Aceite específico
Total do waterfall, sigmoide e PD devem coincidir. Nenhum y aparece no cadastro do novo cliente. O limite 40 respeita a regra. A legenda distingue decomposição por árvore de explicação por variável.

## Contrato comum de implementação

Leia também os guias de [narrativa](../00_guias/01_narrativa_e_contrato.md), [design e interação](../00_guias/02_design_e_interacao.md), [dados e cálculos](../00_guias/03_dados_e_calculos.md) e [aceite](../00_guias/05_qualidade_e_aceite.md). O estado inicial precisa ensinar sem clique; a exploração amplia a explicação. Inclua reinício local, teclado, toque, descrição acessível, notas do professor e estado estático de impressão. Mantenha o padrão de fonte dos dados indicado neste roteiro.

Implemente este slide, execute os critérios específicos acima, registre evidências em `02_controle/STATUS_SLIDES.md` e só então avance. Uma especificação escrita não é implementação concluída.
