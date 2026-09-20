Aula.slide({
  id: "27",
  bloco: "arvore",
  titulo: "A árvore cresce. O resultado fora do treino acompanha?",
  subtitulo: "Profundidade, perda de treino e perda de validação no experimento sintético",
  conclusao: "Uma árvore que memoriza o treino pode produzir probabilidades frágeis fora dele.",
  fonte: Aula.dados.fontes.experimento,
  resumo: "Mapas de regiões de um experimento auxiliar de duas variáveis para profundidades 2, 4 e 8, e curvas de perda de treino e validação por profundidade.",
  notas: {
    conducao: [
      "Comece raso, aumente a complexidade e peça que comparem treino e validação.",
      "Mostre a mediana de contratos por folha como pista de fragilidade, não como prova isolada.",
      "A seleção usa a validação fora do tempo, nunca o teste final.",
    ],
    cuidados: [
      "Os mapas vêm de um experimento auxiliar com apenas duas variáveis. Não são projeção exata do modelo completo.",
      "A perda mostrada usa log loss com proteção numérica de 10 elevado a menos 6, porque árvores produzem probabilidades iguais a 0 ou 1 em folhas puras. O Brier está disponível na tabela.",
      "Desempenho de uma única amostra varia. Diferenças pequenas podem não ser robustas.",
      "Nem toda árvore profunda é ruim: a profundidade interage com tamanho de folha e poda.",
    ],
    transicao: "Podemos controlar o crescimento de mais de uma maneira. Cada parâmetro restringe uma parte diferente da árvore.",
  },

  montar: function (corpo, ctx) {
    var R = Aula.resultados;
    var est = ctx.estado;
    if (!R) {
      corpo.appendChild(h("p", { class: "resposta erro" },
        "Resultados do experimento não disponíveis: execute experimento/experimento.py e recompile."));
      return;
    }

    var cenarios = R.modelos.arvore.cenarios.filter(function (c) { return c.min_folha === 20; });
    cenarios.sort(function (a, b) {
      return (a.profundidade < 0 ? 99 : a.profundidade) - (b.profundidade < 0 ? 99 : b.profundidade);
    });
    if (est.indice === undefined) {
      est.indice = cenarios.map(function (c) { return c.perda_validacao; })
        .indexOf(Math.min.apply(null, cenarios.map(function (c) { return c.perda_validacao; })));
    }
    var atual = cenarios[est.indice];
    var melhor = cenarios.reduce(function (a, b) {
      return b.perda_validacao < a.perda_validacao ? b : a;
    }, cenarios[0]);

    function rotuloProf(p) { return p < 0 ? "sem limite" : String(p); }

    var g = Graf.novo({ w: 700, h: 400, m: { e: 96, d: 130, c: 20, b: 58 } });
    var perdas = cenarios.map(function (c) { return c.perda_treino; })
      .concat(cenarios.map(function (c) { return c.perda_validacao; }));
    g.x(0, cenarios.length - 1).y(0.25, Math.max.apply(null, perdas) * 1.05);
    g.grade({ y: Graf.ticks(0.25, Math.max.apply(null, perdas), 5) });
    g.eixoY({ ticks: Graf.ticks(0.25, Math.max.apply(null, perdas), 5),
              formato: function (v) { return F.dec(v, 2); }, rotulo: "log loss" });
    g.eixoX({ ticks: cenarios.map(function (c, i) { return i; }),
              formato: function (v) { return rotuloProf(cenarios[v].profundidade); },
              rotulo: "profundidade máxima" });
    [["perda_treino", "var(--muted)", "treino"], ["perda_validacao", "var(--arvore)", "validação"]]
      .forEach(function (par) {
        var pts = cenarios.map(function (c, i) { return [i, c[par[0]]]; });
        g.linha(pts, { cor: par[1], largura: 3 });
        pts.forEach(function (pt) { g.ponto(pt[0], pt[1], { r: 5, cor: par[1], bordaL: 1.5 }); });
        g.texto(cenarios.length - 1, pts[pts.length - 1][1], par[2],
          { dx: 10, dy: 5, tamanho: 18, cor: par[1] });
      });
    g.add(sv("line", { x1: g.px(est.indice), x2: g.px(est.indice), y1: g.py(g.dy[0]),
      y2: g.py(g.dy[1]), stroke: "var(--ink)", "stroke-dasharray": "4 4" }));
    var iMelhor = cenarios.indexOf(melhor);
    g.add(sv("line", { x1: g.px(iMelhor), x2: g.px(iMelhor), y1: g.py(g.dy[0]),
      y2: g.py(g.dy[1]), stroke: "var(--ok)", "stroke-width": 2 }));
    g.texto(iMelhor, g.dy[1], "melhor na validação",
      { dx: 6, dy: 16, tamanho: 16, peso: 400, cor: "var(--ok)" });

    var mapas = ["2", "4", "8"].map(function (k) {
      var a = R.auxiliar_2d.arvores[k];
      var gm = Comum.mapaCalor(a.malha, { w: 212, h: 300, max: 0.5,
        resumo: "Regiões de previsão para profundidade " + k });
      return h("div", { class: "painel" + (String(atual.profundidade) === k ? " cor" : " claro"),
        estilo: "padding:12px" }, [
        h("h3", { class: "secao", estilo: "margin:0 0 4px" }, "profundidade " + k),
        gm.svg,
        h("p", { class: "nota", estilo: "margin:0" },
          F.inteiro(a.folhas) + " folhas · validação " + F.dec(a.perda_validacao, 3)),
      ]);
    });

    corpo.appendChild(h("div", { class: "linha cresce" }, [
      h("div", { class: "coluna cresce" }, [
        h("div", { estilo: "display:flex;flex-wrap:wrap;justify-content:space-between;align-items:baseline;gap:10px" }, [
          h("h3", { class: "secao", estilo: "margin:0" },
            "Experimento auxiliar de duas variáveis: as regiões aprendidas"),
          UI.selo("experimento auxiliar, não o modelo completo", "sim"),
        ]),
        h("div", { class: "g3 cresce" }, mapas),
        h("div", { estilo: "display:flex;gap:16px;align-items:center" }, [
          h("span", { class: "nota" }, "escala de PD prevista"),
          Comum.legendaCor(0.5, { w: 300 }),
        ]),
      ]),
      h("div", { class: "coluna", estilo: "flex:0 0 720px" }, [
        h("div", { class: "painel claro cresce centro" }, [
          h("h3", { class: "secao" },
            "Base principal: perda por profundidade, com mínimo de 20 contratos por folha"),
          g.svg,
        ]),
        h("div", { class: "painel" }, [
          UI.slider({
            rotulo: "Profundidade máxima, apenas nos ajustes executados", discreto: true,
            min: 0, max: cenarios.length - 1, passo: 1, valor: est.indice,
            formato: function (v) { return rotuloProf(cenarios[v].profundidade); },
            aoMudar: function (v) { est.indice = v; App.montar("27"); },
          }),
          h("div", { estilo: "display:flex;gap:26px;align-items:baseline;margin-top:10px;flex-wrap:wrap" }, [
            h("span", { class: "medio" }, F.inteiro(atual.folhas) + " folhas"),
            h("span", { class: "medio" },
              "mediana de " + F.inteiro(atual.mediana_n_folha) + " contratos por folha"),
            h("span", { class: "apoio" },
              "treino " + F.dec(atual.perda_treino, 4) + " · validação " +
              F.dec(atual.perda_validacao, 4)),
            h("button", { class: "btn min fantasma", type: "button", onclick: ctx.reiniciar },
              "Reiniciar exemplo"),
          ]),
        ]),
      ]),
    ]));
  },
});
