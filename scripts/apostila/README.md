# Apostila do curso (PDF, versões do aluno e do professor)

Gera a apostila a partir do conteúdo já importado (`content/generated/extract.json`), com os visuais interativos capturados da própria plataforma e figuras conceituais por capítulo.

```bash
export APOSTILA_DIR=tmp/apostila                    # fig/ e build/ ficam aqui (fora do git)
python3 scripts/apostila/figuras.py                 # figuras conceituais (matplotlib, SVG)
# com a aplicação rodando em http://localhost:3000 e a conta de teste aluno.a@example.test:
node scripts/apostila/captura-visuais.mjs           # captura as 180 páginas (PNG, 2x)
node scripts/apostila/gerar.mjs aluno todos --pdf   # build/capitulo-01-aluno.pdf … capitulo-11-aluno.pdf
node scripts/apostila/gerar.mjs professor todos --pdf
node scripts/apostila/gerar.mjs aluno 4 --pdf       # um capítulo
```

Cada capítulo é um PDF: capa (pergunta central, o que se aprende, ideia central e figura conceitual), mapa das páginas, uma seção por página da plataforma (objetivo, visual, apoio, questões, pergunta para discutir) e fecho (o que o aluno deve conseguir explicar e erros comuns; na versão do professor, roteiro do encontro com os tempos por página).

A versão do professor contém gabaritos e notas privadas: nunca publicar como material do aluno. `sinteses.json` traz a síntese e a legenda da figura conceitual de cada capítulo.
