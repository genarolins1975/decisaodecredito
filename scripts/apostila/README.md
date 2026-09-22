# Guias de capítulo (PDF, versões do aluno e do professor)

Gera, por capítulo, um guia do aluno e um guia do professor a partir do conteúdo já importado (`content/generated/extract.json`), com os visuais capturados da própria plataforma e as figuras conceituais do capítulo.

```bash
export APOSTILA_DIR=tmp/apostila                    # fig/ e build/ ficam aqui (fora do git)
python3 scripts/apostila/figuras.py                 # figuras conceituais (matplotlib, SVG)
python3 scripts/apostila/infograficos.py 4,5,6      # infográficos de abertura
# com a aplicação rodando em http://localhost:3000 e a conta de teste aluno.a@example.test:
node scripts/apostila/captura-visuais.mjs 4,5,6     # captura as páginas dos capítulos (PNG, 2x)
node scripts/apostila/validar-explicacoes.mjs 4,5,6 # cobertura, tamanho e caracteres das explicações
node scripts/apostila/gerar.mjs aluno 4,5,6 --pdf   # build/capitulo-04-aluno.pdf ...
node scripts/apostila/gerar.mjs professor 4,5,6 --pdf
```

## O que cada guia traz

Os dois guias seguem a ordem das páginas da plataforma e usam o mesmo rótulo delas (4.10 é a décima página do capítulo 4, `c4p10` na plataforma).

- **Capa e panorama:** infográfico de abertura, pergunta central, o que se aprende, por que importa, a atividade, a ideia central com a figura conceitual, como usar o material e o mapa das páginas.
- **O fio da aula:** nas aulas com mais de um capítulo e frase em `aulas.json`, um quadro com a pergunta de cada capítulo da aula e como cada um termina (a conexão da última página), marcando o capítulo do guia. Na versão do professor, com as essenciais e os minutos de cada capítulo e a soma contra o tempo útil da aula (duração menos intervalo).
- **Em sala (só professor):** a folha de uso durante a aula. Só as essenciais, na ordem, com os tempos, a pergunta para a turma e a ponte para a próxima essencial: a frase `guia.aula` quando a próxima pula páginas, a transição do guia quando é a página seguinte. É a mesma frase que o painel da aula ao vivo mostra em "Roteiro da página no ar".
- **Uma seção por página:** captura (peça com mais de um quadro sai quadro a quadro, na largura da página), a abertura e a síntese impressas por inteiro (na plataforma são abas), o texto "Como ler esta página" ou "Como conduzir esta página" (`explicacoes/cNN.json`), o que está na tela, a pergunta para discutir (em aula, nas essenciais; no estudo, nas complementares) e as questões, inclusive as curadas de `content/questoes-curadas.json`, que a plataforma mostra junto com as do material original. No guia do aluno as questões vêm logo depois da captura, antes da explicação ("Antes de ler a explicação, responda"): a explicação ensina o que a questão verifica, e na ordem inversa a questão viraria releitura. A versão do professor acrescenta o gabarito com o diagnóstico de cada alternativa errada e a ficha "Na hora da aula" (resposta esperada, erros previsíveis com a intervenção, sinal de página cumprida, transição e a ponte de sala).
- **Fecho:** no aluno, o que se deve conseguir explicar antes da próxima aula e os erros comuns com a confusão por trás; no professor, os erros previsíveis com a intervenção.

O gerador confere o HTML antes de imprimir e sai com código 1 se houver imagem ausente, hífen ou travessão de pontuação no texto ou, no guia do aluno, qualquer marca de conteúdo do professor (gabarito, ficha, resposta esperada, intervenção).

## Publicação

**Guia do aluno.** Fica em `content/materiais/capitulo-NN-aluno.pdf`, copiado de `build/`, e sai pela rota `/api/materiais/[arquivo]` para qualquer matriculado (401 sem sessão, 403 sem turma). O importador (`scripts/import-content.ts`) cadastra o material "Capítulo N: guia do aluno (PDF)"; a página do capítulo o lista pelo número no título, e Materiais também. Hoje estão publicados os capítulos 4, 5 e 6, os da Aula 2.

**Guia do professor.** Contém gabaritos, e o repositório é público: nunca entra em `content/materiais/` (o `.gitignore` recusa `*-professor.pdf`) e a rota não o serve. Sai pelo canal privado dos gabaritos do trabalho final:

```bash
node scripts/apostila/pacote-professor.mjs guias-2026-09 tmp/pacote-guias 4,5,6   # PDFs e manifesto.json (bases: [], status "professor")
npx tsx --tsconfig scripts/tsconfig.json scripts/dados/publicar.ts tmp/pacote-guias --modo upload   # ou o painel do R2, pasta bases/vguias-2026-09/
```

Depois, na plataforma, Bases e gabaritos → "Registrar pacote" com a versão `guias-2026-09`. O registro cria "Capítulo N: guia do professor (PDF)" com status "professor": aparece na página do capítulo só para professor e monitor, com o selo "só professor", e o arquivo responde 403 ao aluno. Um manifesto sem bases só atualiza materiais; o teste cego das turmas não é tocado. Registrar de novo, com PDFs regenerados, atualiza no lugar.

`sinteses.json` traz a síntese e a legenda da figura conceitual de cada capítulo; `aulas.json`, a frase que amarra cada aula.
