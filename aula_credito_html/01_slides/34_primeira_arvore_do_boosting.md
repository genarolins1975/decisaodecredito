# Slide 34 — A primeira árvore aproxima a direção de melhoria

**Bloco:** boosting. **Tempo:** 5 min. **Origem:** primeira ordem, miniatura de 10 registros.

## Objetivo e mensagem
Reconstruir resíduos, média por folha e atualização do escore. Mensagem: “A árvore aprende um padrão nos gradientes e aplica a mesma correção a quem cai na mesma folha.”

## Tela e composição
Título: **“A primeira correção reduz A e aumenta B”**. À esquerda, as dez linhas do slide anterior com coluna `r=y−p`. No centro, um stump que divide comp≤40 e >40. Nas folhas, média dos resíduos. À direita, escore e PD atualizados dos dois grupos. Organizar leitura da esquerda para a direita, sem exigir que todas as fórmulas apareçam ao mesmo tempo.

## Cálculos obrigatórios
p0=0,2 para todos. Em A, cinco resíduos −0,2; média −0,2. Em B, três resíduos −0,2 e dois +0,8; média +0,2. η=1. F1_A=−1,586294 e p1_A≈16,9906%; F1_B=−1,186294 e p1_B≈23,3922%. O stump é ajustado por mínimos quadrados aos gradientes negativos, sem atualização Newton.

## Interação
Botão “Calcular resíduos”, depois “Agrupar e tirar médias”, depois “Atualizar escore”, depois “Converter para PD”. Cada etapa realça a coluna pertinente. Selecionar um y=0 do grupo B demonstra que sua PD também sobe, pois compartilha a folha. Não permitir editar y neste percurso; a coerência é mais importante que um simulador com todos os controles.

## Condução
Peça o resíduo de um evento e de um não evento. Calcule a média de B em voz alta. Depois pergunte por que três adimplentes de B receberam aumento. Resposta: o modelo tenta capturar o risco do grupo, não reproduzir perfeitamente cada rótulo. A previsão de um novo registro depende dos atributos e da função aprendida.

## Notas
`y−p` é o gradiente negativo da perda logística em relação a F nesta parametrização. Isso não significa que toda biblioteca utiliza exatamente a média como valor final da folha. A identificação “primeira ordem didática” permanece visível e a diferença de implementações fica no aprofundamento.

## Ponte
“Depois da atualização, os resíduos mudaram. Por isso a segunda árvore precisa olhar novamente para as previsões.”

## Aceite específico
Conferir todas as médias e PDs contra o guia. Contribuições são unidades de F, não p.p. O y=0 de B deve receber aumento. A animação deve calcular os números e não apenas trocar textos pré-escritos inconsistentes.

## Contrato comum de implementação

Leia também os guias de [narrativa](../00_guias/01_narrativa_e_contrato.md), [design e interação](../00_guias/02_design_e_interacao.md), [dados e cálculos](../00_guias/03_dados_e_calculos.md) e [aceite](../00_guias/05_qualidade_e_aceite.md). O estado inicial precisa ensinar sem clique; a exploração amplia a explicação. Inclua reinício local, teclado, toque, descrição acessível, notas do professor e estado estático de impressão. Mantenha o padrão de fonte dos dados indicado neste roteiro.

Implemente este slide, execute os critérios específicos acima, registre evidências em `02_controle/STATUS_SLIDES.md` e só então avance. Uma especificação escrita não é implementação concluída.
