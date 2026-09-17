# Apostila do curso (PDF, versões do aluno e do professor)

Gera a apostila a partir do conteúdo já importado (`content/generated/extract.json`), com os visuais interativos capturados da própria plataforma e figuras conceituais por capítulo.

```bash
export APOSTILA_DIR=tmp/apostila                # fig/ e build/ ficam aqui (fora do git)
python3 scripts/apostila/figuras.py             # figuras conceituais (matplotlib, SVG)
# com a aplicação rodando em http://localhost:3000 e a conta de teste aluno.a@example.test:
node scripts/apostila/captura-visuais.mjs       # captura os 105 visuais interativos (PNG, 2x)
node scripts/apostila/gerar.mjs aluno --pdf     # apostila completa do aluno
node scripts/apostila/gerar.mjs professor --pdf # versão do professor: gabaritos e guia docente
node scripts/apostila/gerar.mjs aluno 4 --pdf   # um capítulo
```

A versão do professor contém gabaritos e notas privadas: nunca publicar como material do aluno. `sinteses.json` traz a síntese e a legenda da figura conceitual de cada capítulo.
