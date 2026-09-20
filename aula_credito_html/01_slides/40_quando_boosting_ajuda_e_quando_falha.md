# Slide 40 — Flexibilidade ajuda quando encontra sinal reproduzível

**Bloco:** boosting. **Tempo:** 3 min. **Origem:** síntese e resultados de sensibilidade calculados, se disponíveis.

## Objetivo e mensagem
Avaliar boosting sem transformá-lo em vencedor inevitável. Mensagem: “Capturar padrões complexos é uma capacidade; demonstrar que eles persistem é uma obrigação.”

## Tela e composição
Título: **“Mais flexibilidade exige mais disciplina de validação”**. Uma matriz curta de quatro situações: sinal aproximadamente aditivo, interações relevantes, poucos eventos e mudança de população. Para cada situação, mostrar pergunta de diagnóstico e cuidado de modelagem. Um visual pequeno pode comparar curva linear e superfície com interação, identificado como mecanismo, não benchmark.

## Conteúdo
Ganhos possíveis: relações não lineares, interações e boa adaptação a dados tabulares. Custos: ajuste de hiperparâmetros, explicação menos direta, risco de sobreajuste, manutenção e necessidade de verificar calibração. Dados ausentes/categóricos dependem da implementação; não prometer suporte nativo universal.

## Interação
Selecionar uma situação revela “o que verificar” e “qual evidência aceitar”. Em interações: verificar ganho fora do tempo contra logit também bem especificado. Em poucos eventos: estabilidade, complexidade e incerteza. Em mudança de população: monitorar distribuição e desempenho quando os alvos maturarem. Não atribuir notas subjetivas automáticas aos algoritmos.

## Sequência
Peça que a turma escolha uma situação em que começaria com logit e outra em que investigaria boosting. Discuta hipóteses e evidências necessárias. Se já houver uma sensibilidade calculada, mostre-a como exemplo, sem generalização de mercado. Não revele ainda a tabela final da comparação principal.

## Notas
XGBoost, LightGBM e CatBoost podem ser citados em uma nota como implementações, sem catálogo de funcionalidades ou recomendação comercial. Variações do algoritmo, parâmetros e pré-processamento afetam resultados. A frase “funciona bem em dados tabulares” não substitui um experimento adequado no problema.

## Ponte
“Se o modelo usa muitas árvores, como explicar o que ele aprendeu e por que atribuiu determinada PD a um cliente?”

## Aceite específico
Nenhuma afirmação absoluta de superioridade. Toda métrica eventual deve ter origem. Pelo menos uma situação reconhece que logit pode ser suficiente e outra justifica testar flexibilidade. Não confundir suporte de biblioteca com propriedade universal do método.

## Contrato comum de implementação

Leia também os guias de [narrativa](../00_guias/01_narrativa_e_contrato.md), [design e interação](../00_guias/02_design_e_interacao.md), [dados e cálculos](../00_guias/03_dados_e_calculos.md) e [aceite](../00_guias/05_qualidade_e_aceite.md). O estado inicial precisa ensinar sem clique; a exploração amplia a explicação. Inclua reinício local, teclado, toque, descrição acessível, notas do professor e estado estático de impressão. Mantenha o padrão de fonte dos dados indicado neste roteiro.

Implemente este slide, execute os critérios específicos acima, registre evidências em `02_controle/STATUS_SLIDES.md` e só então avance. Uma especificação escrita não é implementação concluída.
