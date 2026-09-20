# Slide 20 — Exercício: o que muda na PD de Bruno?

**Bloco:** logit. **Tempo:** 5–6 min. **Origem:** fórmula manual canônica.

## Objetivo e mensagem
Verificar cálculo e interpretação, preparando uma forma alternativa de modelagem. Mensagem: “Entender o logit exige acompanhar a escala do escore e a escala da probabilidade.”

## Tela e composição
Título: **“Bruno aumenta seu comprometimento de 38% para 48%. E agora?”**. Mostrar perfil original e alteração única destacada. À direita, três alternativas sem resposta inicial: “A PD sobe 10 p.p.”; “O escore sobe 0,40 e as odds são multiplicadas por exp(0,40)”; “A PD é multiplicada por exp(0,40)”. Espaço abaixo reservado à solução construída em passos.

## Solução
Original z=−2,025 e PD≈11,66%. Novo z=−1,625. Nova PD calculada pela sigmoide, cerca de 16,45%. Diferença aproximada 4,79 p.p., sem arredondamento prematuro. A alternativa correta é a segunda. Acrescentar pergunta oral: “O que podemos afirmar sobre o efeito causal de reduzir o comprometimento?” Resposta: este cálculo descreve o modelo mantendo outras entradas fixas, não identifica causalidade.

## Interação
O aluno/professor escolhe uma opção. “Conferir” dá feedback específico: confusão de unidade, interpretação correta ou confusão odds/probabilidade. “Resolver passo a passo” revela Δx, Δz, odds e PD. Não revelar solução apenas porque a opção recebeu foco. Um segundo desafio opcional remove hist=1, recalculando Bruno com os demais valores originais, claramente separado do primeiro cenário.

## Condução
Dê um minuto em duplas. Peça a explicação de quem escolheu cada alternativa sem expor pessoas. Use a solução para revisar diferença entre coeficiente e alteração de PD. O professor pode retornar aos slides 11 ou 12 por links discretos e voltar ao exercício preservando a escolha.

## Ponte narrativa
“Agora imagine que o modelo não some características, mas faça perguntas sucessivas: houve atraso? O comprometimento é alto? Essa é a lógica de uma árvore.”

## Aceite específico
Resultado calculado com a fórmula canônica; alternativa correta independente da ordem visual das opções. Solução e feedback ocultos até ação deliberada. Links de revisão retornam corretamente. Impressão separa enunciado e resposta comentada.

## Contrato comum de implementação

Leia também os guias de [narrativa](../00_guias/01_narrativa_e_contrato.md), [design e interação](../00_guias/02_design_e_interacao.md), [dados e cálculos](../00_guias/03_dados_e_calculos.md) e [aceite](../00_guias/05_qualidade_e_aceite.md). O estado inicial precisa ensinar sem clique; a exploração amplia a explicação. Inclua reinício local, teclado, toque, descrição acessível, notas do professor e estado estático de impressão. Mantenha o padrão de fonte dos dados indicado neste roteiro.

Implemente este slide, execute os critérios específicos acima, registre evidências em `02_controle/STATUS_SLIDES.md` e só então avance. Uma especificação escrita não é implementação concluída.
