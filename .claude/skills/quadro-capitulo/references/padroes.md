# Padrões de quadro

Padrões que passaram na rubrica no capítulo 7. Cada um diz o que fazer e onde está o exemplo.

## Estrutura do slide

- **Um componente por slide**, em `src/components/capituloN/slides/sNN-nome.tsx`, com comentário de cabeçalho: número, slug, o que o slide prova e de onde vêm os números. Registro em `registro.tsx` pela ordem do roteiro.
- **`Quadro` sempre**: lê título, subtítulo, pergunta e trilha do roteiro; recebe `conclusao` (a leitura, com o número que a tela mostra em negrito) e `fonte` (amostra, período, n, eventos, método, semente). Leiautes: `gl` (gráfico grande + lateral), `um` (painel único), `duas`, `tres`.
- **Pergunta por cor**: `data-pergunta` define `--q7-cor`. Ordenação azul, probabilidade petróleo, decisão âmbar, validação verde; default em vinho, adimplente em cinza. Cor nunca é o único código: default tem símbolo (marca cheia, ●, ▲, ◆, ■) e rótulo.
- **Uma peça principal** ocupando a maior área; painéis laterais com no máximo três blocos (controle, número, leitura).

## Interação

- **Estado inicial interpretável**: o slide aberto, sem clique, já prova o título. A interação aprofunda; não é condição para entender.
- **Previsão antes de revelar** (`Previsao`): três alternativas plausíveis, cada uma com retorno que nomeia a confusão ("Confunde calibração com ordenação"), botão "Tentar outra", resultado escondido até a tentativa. Exemplo: `s29-platt.tsx`.
- **Experimento, não menu**: o controle muda a causa que o título afirma (corte, nível, inclinação, faixas, n) e os números respondem na hora. Exemplos: `s11-ks.tsx` (corte), `s26-laboratorio-calibracao.tsx` (nível e inclinação), `s21-wilson.tsx` (n).
- **Restaurar** (`Botao sec`) volta ao estado inicial; o quadro reinicia ao voltar ao slide (verificado por `funcional.mjs`).
- **Sorteio com semente** (`mulberry32` de `metricas.ts`), semente declarada na fonte. Animação respeita `useMovimentoReduzido()`: sem reprodução automática e transições zeradas.
- **Teclado**: setas num `input[type=range]` não trocam de slide; todo controle alcançável por Tab com foco dourado visível.

## Gráficos

- `Grafico` dá dimensões em px do contêiner (`d.w`, `d.h`, `d.fs`); use `escala`, `margens`, `Eixos`, `caminho`, `Marca`. Toda fonte de SVG em múltiplos de `d.fs`, nunca em px fixo.
- Toda figura tem `rotulo` (descrição para leitor de tela) e, quando os números importam, `tabela` (alternativa em tabela).
- Eixos com título e unidade; probabilidade em %, com vírgula decimal; diagonal ou referência sempre identificada; intervalo de confiança desenhado quando o n por ponto é pequeno.
- Rótulos diretos na série em vez de legenda distante; legenda (`Legenda`) só quando há mais de duas séries.

## Tipografia e medida (em cqw, no 16:9)

- Título 3,1 cqw serifa; subtítulo 1,75; texto de painel 1,4 a 1,6; leitura 1,6; rótulo (`q7-k`) 1,15 em caixa alta; fonte 1,05. Menor texto corrido ≥ 1,7% da altura do slide (portão de legibilidade).
- Até 140 palavras visíveis por tela; linha até 95 caracteres.
- Números em `tabular-nums`, vírgula decimal, "−" para menos, `pct`, `num` e `int` de `formato.ts` (nunca `toFixed` exibido).
- Celular (≤ 820 px): container query empilha painéis; tabela larga rola dentro do próprio contêiner, nunca a página.

## Conteúdo

- Título é afirmação ou pergunta útil, nunca rótulo ("Brier" não; "Brier: o custo quadrático de errar a probabilidade" sim).
- A leitura repete o número decisivo da tela e diz o que concluir. Proibido "como vemos", "é importante", "note que".
- Aprofundamento e apêndice marcados no roteiro; o percurso essencial cabe no tempo da aula (`minutos("essencial")`).
- Toda afirmação regulatória ou da literatura tem referência primária no apêndice.
- Guia do professor por página (objetivo, roteiro de fala, pergunta para a turma, erros comuns, gabarito) fica fora do repositório público.

## Antipadrões que já derrubaram nota

Rodada 1 da revisão independente do capítulo 7 (outubro de 2026): média 8,47 nos 152 itens humanos, 75 abaixo de 9. Os padrões que mais derrubaram nota, em ordem de frequência:

- **Resposta na tela antes da tentativa** (didática 8 em 25 slides): linha da AUC desenhada antes do sorteio, valor do KPI visível sob uma pergunta, leitura em negrito que já conclui, subtítulo que responde à própria previsão. Esconda o resultado até o acerto; se o slide não tem nada a descobrir, o título é afirmação e a leitura usa os números da tela.
- **Cor fora do papel** (beleza 8): laranja de decisão pintando PD ou perda, vinho de default pintando uma curva de perda. Probabilidade é petróleo; decisão só corte e política; vinho só default.
- **Peça principal pequena e área morta**: gráfico quadrado num painel largo, metade do painel vazia. O gráfico ocupa a largura; o espaço que sobra recebe a tabela ou o número que apoia a leitura.
- **Afirmação não conferida no dado**: "acima da diagonal em todas as faixas" quando duas estão abaixo; "a trapezoidal é otimista" ao lado de um número menor. Toda frase quantificadora é calculada no código, não escrita à mão.
- **Ruído lido como sinal**: slope, nível ou diferença sem intervalo e com verbo forte ("passou do ponto"). Mostre o intervalo; a frase acompanha o que o intervalo permite.
- **Um desfecho tratado como prova contra a PD**: "confiança errada" para PD de 10% num default. Fale em probabilidade baixa dada ao que aconteceu e em média de muitos casos.
- **Busca em grade que perde o ótimo**: o melhor corte realizado procurado de 0,5 em 0,5 ponto perdeu o corte do KS. Procure em todos os limiares distintos.
- **Dado sintético sem declaração na tela**: a amostra de calibração reusava os proponentes da janela; estava no documento, não no slide que dizia "amostra que ele nunca viu".
- **Conceito usado antes de apresentado**: Brier e isotônica no slide 20, apresentados em 23 e 30; log loss e slope marcados como aprofundamento e usados nos essenciais seguintes.
- **Recomendação final sem demonstração no capítulo**: o caso mandava corrigir o nível da logística e nenhum slide mostrava essa correção na logística.

Rodadas 2 a 4 (capítulos 6 e 7):

- **Régua estatística errada**: dispersão entre sementes usada como incerteza do efeito médio; mediana do erro de uma semente usada para julgar a média de dez; "1,8 vez o erro" ao lado de uma faixa de 1,96 erro com o mesmo nome. Uma régua só, com nome único em gráfico, tabela e leitura; erro pareado por proposta para comparar modelos na mesma amostra; t com os graus de liberdade certos.
- **Regra afirmada onde só há observação**: "a perda de treino cai a cada árvore" (com passo de Newton não é garantido); "passa do ponto" sem busca em linha. Constatação do que a tela mostra, com o contraexemplo quando a regra não vale.
- **Decomposição por hipótese apresentada como medida**: "0,056 é o custo da safra, 0,116 é do modelo". Escreva como estimativa condicional e diga a hipótese.
- **Recomendação que não diz de onde vem a amostra**: "recalibrar em amostra própria" com a amostra sintética da própria janela. Diga a amostra real (safras anteriores), mostre o que a deriva faz com ela e ancore o nível em várias safras.
- **Termo com dois sentidos**: "janelas novas" para réplicas sintéticas e "janela nova" para a safra futura. Um nome por objeto.
- **Fonte declarada pela metade**: atalho no código que pulava a declaração da base quando a fonte dizia "sintética". A base (semente e período) entra em toda fonte; teste o caminho.
- **Corte que só aparece depois de mexer no controle**: a varredura mede estados iniciais e expansões; tabelas que crescem com o seletor cortaram em 1366. Rode a verificação de corte em todos os estados de cada controle antes de pedir revisão.

Antipadrões anteriores:

- Fórmula cortada por `overflow: hidden` do painel: `.q7-formula { flex: none }` e `Formula compacta` em painel estreito.
- Interação que só alterna entre telas prontas (abas sem efeito na leitura): virou 8 em interação.
- Tabela onde um gráfico diria mais, ou duas peças do mesmo tamanho disputando: 8 em beleza.
- Previsão cujo resultado já aparece no gráfico antes da escolha: 8 em didática.
- Texto que generaliza além da amostra ("o modelo é bom"): 8 em rigor.
