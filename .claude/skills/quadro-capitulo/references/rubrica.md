# Rubrica

Escala de 0 a 10. Mínimo 9 em todos os itens. A nota é o menor degrau cujas condições estão todas satisfeitas; uma condição de 9 que falha derruba a nota para 8 ou menos, por mais que as outras sejam ótimas.

## Por slide: sete itens

### 1. Layout (automático)

Calculado pelo portão: menor média da auditoria do palco (`scripts/palco/auditoria.mjs`) entre 1920 × 1080 e 1400 × 900, com uma casa decimal. Teto 8 se a varredura achar, em qualquer cenário, corte, saída do quadro, rolagem horizontal da página ou erro de console. Alertas que a varredura gera sobre conteúdo que rola de propósito dentro de um contêiner próprio (tabela larga no celular) ou sobre geometria interna do KaTeX entram como exceção declarada em `avaliacao.json` (`excecoesVarredura`), com a justificativa.

### 2. Legibilidade (automático)

Menor nota do critério de legibilidade da auditoria entre as telas e as duas resoluções: 10 com a menor fonte de texto corrido em 1,9% da altura do slide ou mais; 9 com 1,7%; 7 com 1,5%. Linha acima de 95 caracteres tira um ponto.

### 3. Beleza (revisor)

- **10:** tudo do 9, e o slide tem uma solução visual memorável e própria do conceito (a forma do gráfico é o argumento), sem nenhum elemento que se possa tirar.
- **9:** uma peça principal que domina e prova o título; hierarquia clara (título, subtítulo, peça, leitura, fonte); cores pelo papel do sistema (ordenação, probabilidade, decisão, validação, default) e símbolo além da cor; alinhamento de grade; nenhum rótulo sobreposto, cortado ou espremido; espaço em branco que separa grupos; nada decorativo.
- **8:** um destes falha: peça concorrente com a principal, rótulo sobreposto, área morta grande, tabela onde um gráfico diria mais, cor fora do papel.
- **7 ou menos:** dois ou mais falham, ou o slide parece documento, não quadro.

### 4. Didática (revisor)

- **10:** tudo do 9, e o slide antecipa e desmonta o erro mais comum do tema com o próprio dado (o aluno vê a confusão acontecer).
- **9:** uma ideia; título que é afirmação ou pergunta útil; objetivo cumprível em poucos minutos; quando há algo a descobrir, previsão antes de revelar, com retorno que nomeia a confusão de cada alternativa errada e nova tentativa; leitura (rodapé) que diz o que concluir com os números da tela; ligação explícita com o slide anterior ou o seguinte; nada que exija conhecimento ainda não dado.
- **8:** um destes falha: duas ideias disputando, previsão que mostra a resposta antes da tentativa, retorno que só diz "errado", leitura genérica, salto de pré-requisito.
- **7 ou menos:** o slide informa, mas não ensina.

### 5. Interação (revisor, com `funcional.mjs` como evidência)

- **10:** tudo do 9, e a interação é o próprio experimento do conceito (o aluno muda a causa e vê o efeito que o título afirma, com números que respondem).
- **9:** ao menos um controle que muda a leitura do slide; estado inicial interpretável; "Restaurar" ou seletor que volta ao início; reinício ao voltar ao slide (ou exceção documentada); nada depende de passar o mouse; teclado e foco visível; sorteios com semente; em slide de consulta, navegação útil (abas, links) conta como interação.
- **8:** interação que só escolhe entre telas prontas sem mudar a leitura, ou falta restauração.
- **7 ou menos:** slide estático onde o conceito pedia experimento.

### 6. Rigor (revisor, com teto automático)

Teto 8 se `npm test` falhar na biblioteca do capítulo.

- **10:** tudo do 9, e o slide mostra também a incerteza ou a limitação que muda a conclusão (intervalo, tamanho de amostra, o que o dado não permite).
- **9:** todo número sai da biblioteca conferida; denominadores visíveis; fonte com amostra, período, semente e convenções; terminologia correta (AUC não é acurácia, KS não é corte, média não é calibração, Brier não é calibração pura); nenhuma afirmação além do que os dados mostram; dado sintético declarado como tal.
- **8:** um número sem origem, um denominador escondido ou uma frase que generaliza além da amostra.
- **7 ou menos:** erro conceitual.

### 7. Acessibilidade (automático, com `funcional.mjs`)

10 com zero violações do axe-core no quadro e as verificações de teclado e foco passando; 8 com violações só de impacto "minor"; 6 com qualquer "serious" ou "critical".

## Storytelling do capítulo: seis itens (revisor)

### A. Coerência

- **9:** um fio declarado no primeiro slide (perguntas, caso) volta em todo slide (trilha, títulos, transições) e na conclusão; nenhum slide fora do fio; terminologia constante do início ao fim.
- **10:** além disso, cada slide termina com uma frase que pede o seguinte.

### B. Arco narrativo

- **9:** gancho nos três primeiros slides com algo em jogo (uma decisão real, um erro caro); tensão que cresce (cada parte resolve uma dúvida e abre outra); virada (algo que o aluno achava verdadeiro cai, com dado); fecho que volta ao gancho e decide.
- **10:** a virada é surpreendente e honesta (vem do dado, não do roteiro).

### C. Exemplo prático

- **9:** um caso concreto do domínio atravessa o capítulo (mesma carteira, mesmos números); tamanho e contexto plausíveis; a decisão final usa o caso; dados sintéticos declarados, com o que eles permitem que dados reais não permitiriam.
- **10:** o caso tem consequência econômica ou regulatória mensurável e atual.

### D. Progressão

- **9:** do intuitivo ao formal; nenhum conceito usado antes de apresentado; aprofundamentos marcados e puláveis sem quebrar o fio; tempo do percurso essencial cabe na aula.
- **10:** cada novo conceito nasce de uma limitação do anterior, mostrada na tela.

### E. Estado da arte

Pontuado pelo checklist de `references/estado-da-arte.md`: 9 exige todos os itens marcados como essenciais cobertos (em slide ou no apêndice, com referência primária) e ao menos metade dos de fronteira; 10 exige todos os de fronteira. Um item essencial ausente derruba para 8.

### F. Fechamento e transferência

- **9:** conclusão que responde às perguntas do primeiro slide com os números do caso, diz o que ainda falta e leva a uma ação (diagnóstico, decisão, checklist); material de apoio (guias, questões, apostila) alinhado ao que a tela mostra.
- **10:** o aluno sai com um procedimento que aplicaria amanhã numa carteira real.
