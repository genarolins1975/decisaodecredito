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

- Fórmula cortada por `overflow: hidden` do painel: `.q7-formula { flex: none }` e `Formula compacta` em painel estreito.
- Interação que só alterna entre telas prontas (abas sem efeito na leitura): virou 8 em interação.
- Tabela onde um gráfico diria mais, ou duas peças do mesmo tamanho disputando: 8 em beleza.
- Previsão cujo resultado já aparece no gráfico antes da escolha: 8 em didática.
- Texto que generaliza além da amostra ("o modelo é bom"): 8 em rigor.
