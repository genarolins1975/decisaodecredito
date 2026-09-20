# Slide 21 — Uma árvore organiza a previsão em perguntas

**Bloco:** árvore. **Tempo:** 3 min. **Origem:** árvore manual de 1.000 contratos.

## Objetivo e mensagem
Reconhecer raiz, decisão, ramo e folha por meio de um cliente. Mensagem: “A árvore encaminha clientes semelhantes para uma mesma estimativa de risco.”

## Tela e composição
Título: **“Houve atraso? Qual é o comprometimento?”**. Uma árvore de profundidade 2 domina a tela. Raiz pergunta hist=0 ou hist=1; cada ramo se divide por comp≤40 ou >40. As folhas começam com um símbolo de grupo, sem PD, para apresentar a estrutura antes dos números. Uma ficha de Ana fica na lateral, alinhada à raiz.

## Conteúdo
Nomear raiz e folha apenas uma vez com chamadas discretas. Ramos têm rótulos textuais, não apenas cores. Todas as perguntas se referem a informações disponíveis na concessão. Explicar abaixo: “As perguntas e seus limites são aprendidos dos dados; aqui usamos uma árvore pequena para enxergar o mecanismo.” Não apresentar essa estrutura como resultado já treinado no experimento maior.

## Interação
Botão “Percorrer com Ana” realça raiz, resposta e folha em três ações manuais. Em seguida, seletor de cliente permite explorar Bruno, Carla e Diego. O percurso usa os valores reais do perfil e as regras; não uma animação pré-fixada por nome. Ao selecionar um perfil, limpar o destaque anterior e preservar a estrutura.

## Sequência
Pergunte qual informação a árvore consultará primeiro. Leve Ana à esquerda e então à folha comp≤40. Mostre Diego no outro ramo para criar contraste. Só depois revele o vocabulário mínimo de nós e folhas. Não explique Gini neste slide.

## Notas do professor
O percurso é uma função determinística dos atributos, mas a previsão ao final é probabilística. Duas pessoas diferentes podem cair na mesma folha. Limites como 40% são regras do exemplo, não normas de crédito nem recomendações universais.

## Transição
“Depois de encaminhar o cliente, precisamos atribuir uma PD ao grupo ao qual ele pertence.”

## Aceite específico
Os quatro percursos corretos devem ser obtidos das regras. A igualdade comp=40 precisa ir para o ramo ≤40. Árvore cabe integralmente e cada ramo tem texto legível. Sem recurso de hover obrigatório e sem aprovação/reprovação automática nas folhas.

## Contrato comum de implementação

Leia também os guias de [narrativa](../00_guias/01_narrativa_e_contrato.md), [design e interação](../00_guias/02_design_e_interacao.md), [dados e cálculos](../00_guias/03_dados_e_calculos.md) e [aceite](../00_guias/05_qualidade_e_aceite.md). O estado inicial precisa ensinar sem clique; a exploração amplia a explicação. Inclua reinício local, teclado, toque, descrição acessível, notas do professor e estado estático de impressão. Mantenha o padrão de fonte dos dados indicado neste roteiro.

Implemente este slide, execute os critérios específicos acima, registre evidências em `02_controle/STATUS_SLIDES.md` e só então avance. Uma especificação escrita não é implementação concluída.
