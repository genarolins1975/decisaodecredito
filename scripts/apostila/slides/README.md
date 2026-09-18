# Slides de abertura (padrão FGV)

Cada capítulo tem um arquivo `Capitulo-NN-infografico.pptx` com cinco slides: pôster de abertura (o mesmo infográfico da capa da apostila) e quatro slides de projeção, um por bloco. O conteúdo vem de `content/infograficos/cNN.json`; a composição é o arquétipo `infografico` e `infograficoBlocos` acrescentado à biblioteca `fgv.js` da skill FGV Aula (design system Executive Academic), que não é versionada aqui.

```bash
# em um diretório de trabalho com scripts/fgv.js (com os dois arquétipos), assets/fgv-logo.png e pptxgenjs instalado:
node build.js            # os 11 arquivos
node build.js 4,7        # só os capítulos 4 e 7
```

QA visual: converter com LibreOffice Impress e a fonte Carlito (métrica da Calibri) e inspecionar slide a slide.
