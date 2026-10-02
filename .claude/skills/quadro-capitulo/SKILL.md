---
name: quadro-capitulo
description: Constrói, reconstrói e avalia capítulos de quadros interativos da plataforma do Laboratório de Decisão de Crédito (apresentação e estudo, 16:9), com exigência de nota mínima 9 slide por slide e item por item (layout, legibilidade, beleza, didática, interação, rigor, acessibilidade) e de 9 em cada item do storytelling do capítulo (coerência, arco, exemplo prático, progressão, estado da arte, fechamento). Use SEMPRE que o pedido for construir, refazer, revisar, pontuar ou aprovar um capítulo ou um slide da plataforma, montar o roteiro de um capítulo, conferir se um capítulo está pronto para aula, ou responder se o material é coerente, tem um exemplo bom e está no estado da arte.
---

# Quadro de capítulo

Um capítulo é uma sequência de quadros nativos, um por slide, lidos de um roteiro único, com números de uma biblioteca conferida e uma avaliação que só aprova com 9 ou mais em todos os itens. O capítulo 7 (`src/components/capitulo7`, `src/lib/capitulo7`) é a implementação de referência: copie o padrão, não reinvente.

## Regras invioláveis

1. Nota mínima 9 em cada um dos sete itens de cada slide e em cada um dos seis itens do storytelling. Média alta não compensa item baixo.
2. Nota sem evidência vale zero. Evidência cita o que se verifica: número exibido, elemento da tela, resultado de script, captura. "Bom", "claro", "bonito" não são evidência.
3. Quem constrói não dá nota humana ao próprio trabalho. As notas de beleza, didática, interação, rigor e storytelling vêm de um revisor em contexto limpo (subagente) com esta rubrica, as capturas e o código. Subir uma nota exige mudar o slide e pedir nova revisão, nunca reescrever a justificativa.
4. Nenhum número digitado: tudo sai da biblioteca do capítulo, conferida contra referência externa (scikit-learn, SciPy, statsmodels) em teste automatizado.
5. Português do Brasil, sem hífen ou travessão como pontuação; sinal de menos com "−".
6. Nada vai para produção sem autorização: a produção publica a cada merge.

## Fluxo

1. **Roteiro e arco.** Antes de qualquer quadro, escreva o roteiro (`src/lib/capituloN/roteiro.ts`): perguntas do capítulo, título de cada slide como afirmação ou pergunta útil, nível, minutos. Escreva o arco em cinco frases (gancho, pergunta, tensão, virada, decisão) e o caso que atravessa o capítulo. Preencha `references/estado-da-arte.md` para o tema antes de decidir o conteúdo.
2. **Dados e biblioteca.** Uma fonte de dados (`base.json`), funções puras (`metricas.ts`), referência em Python e teste que compara as duas. Registre origem, população, horizonte, semente e limitação de cada exemplo.
3. **Quadros.** Use o kit de `src/components/capitulo7/base.tsx` (Quadro, Painel, Grafico, Kpi, Controle, Seg, Previsao, Expandir, Formula, Legenda, LinkSlide) e o CSS `src/app/capitulo7.css`. Padrões obrigatórios em `references/padroes.md`.
4. **Origem e conteúdo.** Guia do professor completo por página, questões avaliadas com diagnóstico por alternativa, textos da apostila; injete na camada de origem e importe.
5. **Medir.** Rode as medidas automáticas (abaixo). Corrija até não haver corte, rolagem, erro de console nem violação de acessibilidade.
6. **Revisar.** Dispare o revisor em contexto limpo com `references/rubrica.md` e o prompt de `references/revisor.md`. Ele grava `docs/capituloN/avaliacao.json`.
7. **Portão.** `node .claude/skills/quadro-capitulo/scripts/avaliar.mjs N`. Sai com código 1 se qualquer item ficar abaixo de 9 ou sem evidência, e escreve `docs/capituloN/AVALIACAO.md`. Corrija o slide, meça de novo, peça nova revisão só dos itens afetados, repita até passar.

## Medidas automáticas (servidor local com a base semeada)

```bash
SL=$(node .claude/skills/quadro-capitulo/scripts/slugs.mjs N)         # slugs na ordem do roteiro
node scripts/palco/auditoria.mjs tmp/ux/auditoria-cN-1920.json $SL 1920x1080
node scripts/palco/auditoria.mjs tmp/ux/auditoria-cN-1400.json $SL 1400x900
node scripts/capitulo7/varredura.mjs tmp/shots/final "1920x1080:palco,1920x1080:palco+abrir,1366x768:palco,1366x768:estudo,390x844:estudo"
node scripts/capitulo7/acessibilidade.mjs                               # grava tmp/axeN.json
node scripts/capitulo7/funcional.mjs | tee tmp/funcional-cN.txt         # teclado, foco, reinício, previsão, movimento
npm test                                                               # o portão roda de novo os testes da biblioteca
```

Layout, legibilidade e acessibilidade são calculados pelo portão a partir desses arquivos; o revisor não opina sobre eles.

## Referências

- `references/rubrica.md`: os sete itens por slide e os seis do storytelling, com o que dá 10, 9, 8 e abaixo.
- `references/padroes.md`: padrões de quadro que já passaram (previsão antes de revelar, estado inicial, restauração, expansões, tipografia mínima, cores por papel).
- `references/estado-da-arte.md`: como montar e pontuar o checklist do estado da arte; versão preenchida para avaliação e calibração de modelos de PD.
- `references/revisor.md`: o prompt do revisor independente e o formato de `avaliacao.json`.
