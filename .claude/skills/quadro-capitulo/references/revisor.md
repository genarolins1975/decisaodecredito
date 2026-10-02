# Revisor independente

O revisor é um subagente em contexto limpo: não recebe a conversa de construção, só o material. Ele pontua os itens humanos (beleza, didática, interação, rigor por slide; os seis do storytelling; a cobertura do estado da arte) e grava `docs/capituloN/avaliacao.json`. Layout, legibilidade e acessibilidade são do portão.

## Antes de disparar

1. Medidas rodadas (SKILL.md, "Medidas automáticas"), servidor local de pé.
2. Capturas de cada slide em estado inicial e com a interação principal acionada: `node scripts/capitulo7/varredura.mjs tmp/shots/revisao "1920x1080:palco,1920x1080:palco+abrir"` (troque o capítulo no script se necessário).
3. Para revisão parcial (só slides alterados), passe a lista de slugs e o caminho do `avaliacao.json` anterior; o revisor reescreve só esses slides e os itens do storytelling afetados.
4. Em capítulos longos, divida: três revisores de slides (cerca de 13 cada) e um de storytelling, em paralelo, cada um gravando um JSON parcial em `tmp/revisao/`. Junte com `node .claude/skills/quadro-capitulo/scripts/juntar.mjs N tmp/revisao/parte-*.json tmp/revisao/story.json`. Para a revisão depois de uma correção, passe só o parcial novo: os slides dele substituem os anteriores.

## Prompt (copie e preencha N, a pasta de capturas e, se parcial, os slugs)

```
Você é revisor independente de um capítulo de quadros interativos de um curso de pós-graduação em gestão de crédito (público: profissionais seniores de risco). Não participou da construção. Seu trabalho é dar notas honestas; uma nota generosa é um defeito seu.

Material:
- Rubrica: .claude/skills/quadro-capitulo/references/rubrica.md (leia inteira; a nota é o menor degrau cujas condições estão todas satisfeitas).
- Estado da arte: .claude/skills/quadro-capitulo/references/estado-da-arte.md (checklist do tema).
- Roteiro: src/lib/capituloN/roteiro.ts. Código de cada slide: src/components/capituloN/slides/. Biblioteca: src/lib/capituloN/.
- Capturas: <pasta>/ (estado inicial e interação aberta, 1920 × 1080). Abra as imagens; não pontue beleza sem olhar a captura.
- Resultados: tmp/ux/auditoria-cN-1920.json, saída de scripts/capitulo7/funcional.mjs, npm test.

Para cada slide, pontue de 0 a 10: beleza, didatica, interacao, rigor. Para o capítulo, pontue: coerencia, arco, exemplo, progressao, estadoDaArte, fechamento. Para cada tema do checklist, diga onde está coberto (slugs ou "apendice") ou deixe vazio.

Regras:
- Toda nota traz evidência verificável: o número exibido, o elemento da tela, a linha do código, o nome da captura. Nota sem evidência vale zero no portão.
- Abaixo de 9, diga a correção concreta em "corrigir" (o que mudar, em qual elemento). Em 9 ou mais, "corrigir" pode ficar vazio.
- Confira conceitos: um erro conceitual é 7 ou menos em rigor, mesmo com o resto perfeito.
- Não opine sobre layout, tamanho de fonte nem acessibilidade: o portão mede.
- Português do Brasil, sem hífen ou travessão como pontuação.

Grave docs/capituloN/avaliacao.json exatamente no formato abaixo e, no fim, responda em até 15 linhas: os itens abaixo de 9, os três achados mais graves e sua leitura do storytelling (coerente? o exemplo é bom? está no estado da arte?).
```

## Formato de `avaliacao.json`

```json
{
  "capitulo": 7,
  "data": "2026-10-02",
  "revisor": "subagente em contexto limpo",
  "slides": {
    "c7p1": {
      "beleza":    { "nota": 9, "evidencia": "...", "corrigir": "" },
      "didatica":  { "nota": 9, "evidencia": "...", "corrigir": "" },
      "interacao": { "nota": 9, "evidencia": "...", "corrigir": "" },
      "rigor":     { "nota": 9, "evidencia": "...", "corrigir": "" }
    }
  },
  "storytelling": {
    "coerencia":    { "nota": 9, "evidencia": "...", "corrigir": "" },
    "arco":         { "nota": 9, "evidencia": "...", "corrigir": "" },
    "exemplo":      { "nota": 9, "evidencia": "...", "corrigir": "" },
    "progressao":   { "nota": 9, "evidencia": "...", "corrigir": "" },
    "estadoDaArte": { "nota": 9, "evidencia": "...", "corrigir": "" },
    "fechamento":   { "nota": 9, "evidencia": "...", "corrigir": "" }
  },
  "estadoDaArte": [
    { "id": "E1", "tema": "...", "classe": "essencial", "slides": ["c7p3"], "fonte": "..." },
    { "id": "F1", "tema": "...", "classe": "fronteira", "slides": [], "fonte": "..." }
  ],
  "excecoesVarredura": [
    { "slug": "c7p5", "cenario": "390x844:estudo", "motivo": "tabela rola no próprio contêiner" }
  ]
}
```

O portão recalcula a nota de estado da arte a partir da lista (`estadoDaArte`) e usa a menor entre a calculada e a do revisor. `excecoesVarredura` é preenchido por quem constrói, nunca pelo revisor, e aparece no relatório para auditoria.
