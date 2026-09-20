# Slide 23 — A árvore compara perguntas candidatas

**Bloco:** árvore. **Tempo:** 4 min. **Origem:** contagens manuais compatíveis.

## Objetivo e mensagem
Entender que um split é escolhido por um critério, não por uma história econômica inventada depois. Mensagem: “Uma boa divisão cria grupos mais homogêneos segundo a função objetivo.”

## Tela e composição
Título: **“Qual pergunta separa melhor os comportamentos observados?”**. Raiz com 10% de inadimplência no topo. Abaixo, dois candidatos em paralelo: dividir por histórico ou por comp≤40. Cada candidato mostra duas barras de composição com n, eventos e taxa. Não revelar o vencedor inicialmente. Reserva inferior para o critério que aparecerá no próximo slide.

## Contagens
Histórico: 800/40 e 200/60. Comprometimento: 680/30 e 320/70. Calcular taxas 5%/30% e aproximadamente 4,41%/21,88%. Os candidatos precisam ter a mesma raiz de 1.000/100. Uma diferença grande entre taxas, isoladamente, não basta: os tamanhos dos grupos também importam.

## Interação
Escolher candidato registra uma hipótese local. “Comparar composição” realça simultaneamente o peso de cada filho e sua mistura de classes. “Ver regra de escolha” revela “menor impureza ponderada”, sem despejar ainda a equação inteira. Pode haver slider de limiar somente se o implementador gerar registros compatíveis e recalcular todos os candidatos. Com dados agregados, usar apenas os dois candidatos disponíveis.

## Roteiro
Peça que o aluno escolha visualmente e explique por quê. Se ele usar só a diferença entre taxas, pergunte o que aconteceria com uma folha de duas observações. Mostre o papel do tamanho do grupo. Não afirme que esta pergunta é a melhor entre todas as variáveis: ela é a melhor entre os candidatos comparados pelo critério que será calculado.

## Notas
A seleção gulosa é local: a melhor divisão imediata não garante a árvore globalmente ótima. Muitos pontos de corte aumentam oportunidades de ajustar ruído; controle de complexidade e validação continuam necessários.

## Transição
“Vamos colocar essa comparação em números com o índice de Gini.”

## Aceite específico
Ambos os candidatos têm totais idênticos. Nenhum slider inventa contagens entre agregados. Pergunta e resposta são separadas por ação. Composições usam a mesma escala e mantêm tamanhos/pesos visíveis.

## Contrato comum de implementação

Leia também os guias de [narrativa](../00_guias/01_narrativa_e_contrato.md), [design e interação](../00_guias/02_design_e_interacao.md), [dados e cálculos](../00_guias/03_dados_e_calculos.md) e [aceite](../00_guias/05_qualidade_e_aceite.md). O estado inicial precisa ensinar sem clique; a exploração amplia a explicação. Inclua reinício local, teclado, toque, descrição acessível, notas do professor e estado estático de impressão. Mantenha o padrão de fonte dos dados indicado neste roteiro.

Implemente este slide, execute os critérios específicos acima, registre evidências em `02_controle/STATUS_SLIDES.md` e só então avance. Uma especificação escrita não é implementação concluída.
