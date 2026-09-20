# Slide 50 — O modelo produz uma PD; a boa decisão exige mais

**Bloco:** encerramento. **Tempo:** 4 min. **Origem:** síntese do curso.

## Objetivo e mensagem
Fazer o aluno reconstruir a jornada e transferi-la ao trabalho. Mensagem: “Definir, estimar, validar e decidir são etapas conectadas que não podem ser substituídas por uma métrica isolada.”

## Tela e composição
Título: **“Você consegue explicar, comparar e usar os três modelos?”**. No centro, tabela curta com três linhas: logit, árvore, boosting. Colunas: como constrói o escore/PD, principal cuidado e evidência necessária. Embaixo, uma faixa visual recupera os quatro clientes e a pergunta inicial, agora acompanhada de “qual modelo, qual política e por quê?”. Evite terminar com uma tela genérica de agradecimento.

## Conteúdo de síntese
Logit: soma de funções de características e conversão logística; cuidado com especificação, unidade e interpretação. Árvore: regras aprendidas e estimativa por folha; cuidado com complexidade, tamanho de folha e instabilidade. Boosting: contribuições sequenciais ao escore; cuidado com trajetória de ajuste, complexidade e explicação. Para todos: informação disponível, validação temporal, calibração e decisão econômica.

## Interação
Três perguntas de recuperação, uma por vez: “Odds ×2 significa PD ×2?”; “A mesma folha pode conter clientes diferentes?”; “As árvores do boosting somam probabilidades?”. A resposta revela uma frase e link ao slide pertinente. Em um segundo painel opcional, “Aplicar no meu trabalho”, oferecer um roteiro curto para descrever alvo, dados, baseline, protocolo, comparação e regra de decisão, com possibilidade de copiar texto.

## Condução
Peça que um aluno resuma cada técnica em uma frase. Retome a decisão do slide 01 sem inventar quais respostas a turma deu; se as escolhas locais foram salvas, identifique-as como escolhas naquele dispositivo. Pergunte o que agora exigiriam antes de aprovar uma mudança de modelo.

## Notas
Respostas: odds e PD são escalas diferentes; sim, a folha agrupa atributos distintos que satisfazem as mesmas regras; boosting logístico soma em F, aplicando a transformação depois. Reforce que complexidade pode ser útil, mas a qualidade da decisão depende do processo inteiro. Referências, notebook e modo estudo ficam disponíveis por links finais.

## Encerramento
Frase final proposta: “A técnica importa. A evidência que sustenta seu uso importa tanto quanto.” Não acrescentar um 51º slide principal de agradecimento ou referências; usar painel/aperfeiçoamento de estudo.

## Aceite específico
Tabela sem absolutos ou superioridade genérica. Três respostas e links de retorno funcionando. Recursos finais acessíveis offline, exceto fontes externas claramente identificadas. Contagem final continua exatamente 50 slides principais.

## Contrato comum de implementação

Leia também os guias de [narrativa](../00_guias/01_narrativa_e_contrato.md), [design e interação](../00_guias/02_design_e_interacao.md), [dados e cálculos](../00_guias/03_dados_e_calculos.md) e [aceite](../00_guias/05_qualidade_e_aceite.md). O estado inicial precisa ensinar sem clique; a exploração amplia a explicação. Inclua reinício local, teclado, toque, descrição acessível, notas do professor e estado estático de impressão. Mantenha o padrão de fonte dos dados indicado neste roteiro.

Implemente este slide, execute os critérios específicos acima, registre evidências em `02_controle/STATUS_SLIDES.md` e só então avance. Uma especificação escrita não é implementação concluída.
