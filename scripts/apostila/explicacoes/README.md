# Explicações das páginas (guias do aluno e do professor)

Um arquivo por capítulo, `cNN.json`, com uma entrada por página da plataforma (`c4p7`, ...):

```json
{ "c4p7": { "aluno": "...", "professor": "..." } }
```

Fonte de verdade dos fatos: `content/generated/extract.json` (títulos, objetivo, apoio, guia docente, texto e questões de cada página) e, para as páginas com peça nativa, o componente em `src/components/visuais/*.tsx` (o comentário de abertura e o parágrafo `vz-fonte` trazem os números exatos que o visual mostra). Nunca inventar números; todo número citado precisa existir na página ou no componente.

## O texto do aluno ("Como ler esta página"), 100 a 170 palavras

1. O que o visual mostra, com os números que aparecem nele.
2. Como ler: por onde começar, o que comparar, o que muda quando se mexe no controle (para páginas interativas).
3. O que levar: a ideia em uma frase, e onde ela volta no curso (capítulo).
Quando a página tem pergunta de previsão, pedir ao leitor que responda antes de ler a revelação. Não revelar gabarito de questão de múltipla escolha (a alternativa correta de "questoes" não entra no texto do aluno); a revelação das perguntas de "prever" pode entrar, porque é conteúdo da página.

## O texto do professor ("Como conduzir esta página"), 130 a 200 palavras

Roteiro de fala em segunda pessoa, na ordem em que a aula acontece: o que projetar e apontar, o que pedir à turma antes de revelar, a pergunta para a turma e a resposta esperada, o erro previsível e a intervenção, o sinal de que a página está cumprida e a transição para a próxima. Sintetiza `guia.funcao`, `guia.conducao`, `guia.leitura`, `guia.pergunta`, `guia.resposta`, `guia.erros`, `guia.verificacao`, `guia.transicao` e `guia.hipotese` em prosa corrida, sem repetir os rótulos. Pode citar o gabarito das questões quando ajuda a conduzir.

## Regras de escrita

- Português do Brasil, tom executivo e humano, frases curtas, uma ideia por frase.
- Nunca usar hífen ou travessão como pontuação (nem "—", nem "–", nem " - "). Use ponto, vírgula, dois pontos ou parênteses. Palavras compostas com hífen ortográfico (pré-requisito, log-odds) são permitidas.
- Números em formato brasileiro (R$ 9.000, 12%, 0,725). Negativo com o sinal "−" (U+2212).
- Nada de metacomentário ("nesta página vamos ver"), nada de clichê, nada de didatizar o óbvio para um leitor sênior.
- Descrever só o que a página mostra hoje na plataforma: confira na captura (`fig/<slug>.png`) antes de citar tabela, botão, posição ou número. O guia docente do material original às vezes descreve um visual que uma revisão trocou.
- Não repetir o objetivo da página palavra por palavra; ele já aparece no cabeçalho da seção.
- Validação: `node scripts/apostila/validar-explicacoes.mjs` confere cobertura, tamanhos e caracteres proibidos.

O capítulo 1 (`c01.json`) é o padrão de qualidade e de voz.
