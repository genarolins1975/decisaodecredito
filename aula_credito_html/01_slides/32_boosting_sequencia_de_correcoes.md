# Slide 32 — O boosting constrói o escore em etapas

**Bloco:** boosting. **Tempo:** 4 min. **Origem:** mecanismo conceitual com miniatura do guia.

## Objetivo e mensagem
Distinguir combinação sequencial de votação independente. Mensagem: “Cada árvore responde ao que ainda precisa melhorar na previsão atual.”

## Tela e composição
Título: **“A próxima árvore aprende a partir das previsões atuais”**. Visual em duas linhas para evitar uma cadeia horizontal longa: linha superior com escore atual e cálculo de gradiente; linha inferior com ajuste da pequena árvore e novo escore. Ao lado, uma régua de F acumula contribuições. PD aparece apenas depois da transformação logística.

## Conteúdo
Equação principal em linguagem legível: “novo escore = escore atual + taxa de aprendizagem × contribuição da árvore”. Fórmula `F_m=F_(m−1)+ηh_m`. A função logística é a mesma já estudada. Identificar h_m como árvore de regressão que retorna números positivos ou negativos, não voto adimplente/inadimplente.

## Interação
Botão “Um ciclo” executa quatro passos manuais: prever; calcular direção; ajustar correção; atualizar escore. Usar uma observação representativa do grupo B da miniatura, sem consultar seu desfecho no momento de nova previsão. “Comparar mecanismos” abre uma pequena nota: em votação independente, modelos são combinados sem esse mesmo encadeamento. Não abrir uma aula paralela de bagging.

## Sequência
Pergunte se cada árvore produz uma nova PD a ser somada. Revele que o objeto somado é F, um escore na escala log-odds neste caso. Reconecte ao slide 09: só ao final aplicamos sigmoid. Esse elo evita tratar boosting como algoritmo sem relação com o logit.

## Notas
O algoritmo pode otimizar perdas diferentes; aqui o alvo é binário e a perda é logística. O gradiente depende da função de perda. A apresentação de primeira ordem é um mecanismo didático válido, mas implementações podem usar atualizações diferentes nas folhas.

## Ponte
“Antes de corrigir qualquer coisa, precisamos de uma previsão inicial. Qual seria a melhor se tratássemos todos igualmente?”

## Aceite específico
Diagrama e texto não mostram votação majoritária, soma de PDs ou árvores que conhecem o futuro. Todas as atualizações em F e a conversão final estão distinguidas. O ciclo pode ser seguido sem animação automática.

## Contrato comum de implementação

Leia também os guias de [narrativa](../00_guias/01_narrativa_e_contrato.md), [design e interação](../00_guias/02_design_e_interacao.md), [dados e cálculos](../00_guias/03_dados_e_calculos.md) e [aceite](../00_guias/05_qualidade_e_aceite.md). O estado inicial precisa ensinar sem clique; a exploração amplia a explicação. Inclua reinício local, teclado, toque, descrição acessível, notas do professor e estado estático de impressão. Mantenha o padrão de fonte dos dados indicado neste roteiro.

Implemente este slide, execute os critérios específicos acima, registre evidências em `02_controle/STATUS_SLIDES.md` e só então avance. Uma especificação escrita não é implementação concluída.
