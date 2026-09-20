# Slide 01 — Quem merece receber crédito?

**Bloco:** problema de crédito. **Tempo:** 3 min. **Origem:** caso fictício. **Papel:** abrir com uma decisão que os modelos ajudarão a fundamentar.

## Objetivo e mensagem
O aluno deve reconhecer que aprovar exige estimar risco e definir uma política. Mensagem: “A mesma proposta pode parecer diferente quando olhamos o risco de forma estruturada.” Não prometa um algoritmo vencedor.

## Tela e composição
Título: **“Você aprovaria estes quatro clientes?”** Subtítulo discreto: “Crédito pessoal, horizonte de 12 meses”. No centro, quatro linhas/cartões horizontais com nome, renda e comprometimento dos perfis canônicos. Exiba apenas essas duas características inicialmente. À direita de cada cliente, botões “Aprovar”, “Recusar”, “Preciso de mais informação”. Abaixo, uma faixa de pergunta: “Que informação faria você mudar de ideia?” Evite qualquer PD antes de construir o problema.

## Dados e estado inicial
Use Ana, Bruno, Carla e Diego do guia de dados. Nenhuma alternativa começa selecionada. As propostas não têm desfecho conhecido. Os botões registram somente a opinião no dispositivo, sem contador de turma ou resultado coletivo fictício. Não atribua valor moral à renda ou ao cliente.

## Interação e sequência
1. O professor pede 20 segundos de avaliação silenciosa e seleciona uma opinião para cada perfil.
2. “Revelar mais informações” adiciona histórico, utilização e relacionamento, preservando a posição dos clientes.
3. Uma escolha revista recebe indicação textual “você mudou sua avaliação”, sem julgamento de certo/errado.
4. “O desafio da aula” revela: “Estimar PD, comparar modelos e transformar risco em decisão”.
5. Reiniciar apaga escolhas e volta às duas características iniciais. Teclado percorre clientes e opções; toque tem as mesmas funções.

## Condução e notas
Pergunte por que Carla, com renda alta, poderia exigir investigação. Se alguém pedir taxa, prazo e custos, reconheça que faltam elementos para a política econômica. Não antecipe a conta do slide 47. Explique que a aula construirá a estimativa antes da política. Diga que um cliente de maior risco ainda pode ser economicamente aceitável sob certas condições, sem afirmar que cobrar mais resolve qualquer risco.

## Transição
“Antes de escolher uma técnica, precisamos conhecer os mesmos clientes e definir exatamente o que vamos prever.” Avance para as fichas completas do slide 02.

## Aceite específico
Os quatro perfis devem coincidir com o guia. Não mostrar rótulos de inadimplência nem PDs. Mudança de opinião deve funcionar sem agregação simulada. A impressão mostra perfis completos e a pergunta, sem uma resposta normativa de aprovação.

## Contrato comum de implementação

Leia também os guias de [narrativa](../00_guias/01_narrativa_e_contrato.md), [design e interação](../00_guias/02_design_e_interacao.md), [dados e cálculos](../00_guias/03_dados_e_calculos.md) e [aceite](../00_guias/05_qualidade_e_aceite.md). O estado inicial precisa ensinar sem clique; a exploração amplia a explicação. Inclua reinício local, teclado, toque, descrição acessível, notas do professor e estado estático de impressão. Mantenha o padrão de fonte dos dados indicado neste roteiro.

Implemente este slide, execute os critérios específicos acima, registre evidências em `02_controle/STATUS_SLIDES.md` e só então avance. Uma especificação escrita não é implementação concluída.
