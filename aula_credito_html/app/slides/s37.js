Aula.slide({
  id: "37",
  bloco: "boosting",
  titulo: "Learning rate e número de árvores precisam ser escolhidos juntos",
  subtitulo: "Trajetórias de perda treinadas com cada taxa, no experimento sintético",
  conclusao: "Mudar o passo altera previsões, gradientes e, portanto, o que as próximas árvores aprendem.",
  fonte: Aula.dados.fontes.experimento,
  resumo: "Perda de treino e de validação por iteração para três taxas de aprendizagem, com o ponto selecionado e a PD de um cliente.",
  notas: {
    conducao: [
      "Compare as taxas no mesmo número de árvores e depois permita mais árvores para a taxa menor.",
      "Pergunte se taxa menor é sempre melhor. Não: há custo computacional, subajuste com poucas árvores e comportamento que depende dos dados.",
    ],
    respostas: [
      "Cada curva vem de um treinamento próprio com sua taxa. Não é a reescala de um conjunto fixo de árvores.",
      "Multiplicar as contribuições no fim não reproduz outro treinamento, porque os resíduos dependem do escore atualizado a cada passo.",
    ],
    cuidados: [
      "O produto entre taxa e número de árvores não determina sozinho o modelo final: a trajetória muda.",
      "A taxa se relaciona com regularização, mas não substitui validação temporal.",
      "O teste final continua fora de qualquer escolha.",
    ],
    transicao: "Além de quantos passos dar e do tamanho de cada passo, importa o que cada árvore consegue representar.",
  },

  montar: function (corpo, ctx) {
    var R = Aula.resultados, D = Aula.dados;
    var est = ctx.estado;
    if (!R) {
      corpo.appendChild(h("p", { class: "resposta erro" },
        "Resultados do experimento não disponíveis: execute experimento/experimento.py e recompile."));
      return;
    }

    var prof = R.modelos.boosting.profundidade;
    var cenarios = R.modelos.boosting.cenarios.filter(function (c) {
      return c.profundidade === prof;
    });
    cenarios.sort(function (a, b) { return a.taxa - b.taxa; });
    if (est.taxa === undefined) est.taxa = R.modelos.boosting.taxa;
    var atual = cenarios.filter(function (c) { return c.taxa === est.taxa; })[0] || cenarios[0];
    var nMax = atual.perdas_validacao.length;
    if (est.iter === undefined || est.iter > nMax) est.iter = atual.melhor_iteracao;

    var cores = { 0.03: "var(--ink-soft)", 0.1: "var(--boost)", 0.3: "var(--amber)" };

    var g = Graf.novo({ w: 900, h: 430, m: { e: 96, d: 150, c: 24, b: 58 },
      resumo: "Perda por iteração para três taxas de aprendizagem." });
    var todas = [];
    cenarios.forEach(function (c) {
      todas = todas.concat(c.perdas_validacao).concat(c.perdas_treino);
    });
    var pmin = Math.min.apply(null, todas), pmax = Math.max.apply(null, todas);
    g.x(1, nMax).y(pmin - 0.005, Math.min(pmax, 0.45));
    var ticksY = Graf.ticks(pmin, Math.min(pmax, 0.45), 5);
    g.grade({ y: ticksY });
    g.eixoY({ ticks: ticksY, formato: function (v) { return F.dec(v, 3); }, rotulo: "log loss" });
    g.eixoX({ ticks: [1, 50, 100, 150, 200, 250, 300], rotulo: "número de árvores" });

    cenarios.forEach(function (c) {
      var sel = c.taxa === est.taxa;
      var cor = cores[c.taxa] || "var(--muted)";
      var pts = c.perdas_validacao.map(function (v, i) { return [i + 1, v]; })
        .filter(function (p) { return p[1] <= g.dy[1]; });
      g.linha(pts, { cor: cor, largura: sel ? 3.5 : 2, opacidade: sel ? 1 : .35 });
      var fim = pts[pts.length - 1];
      var noFim = fim[0] > g.dx[0] + (g.dx[1] - g.dx[0]) * 0.72;
      g.texto(fim[0], fim[1], "η = " + F.dec(c.taxa, 2) + (sel ? ", validação" : ""),
        { ancora: noFim ? "end" : "start", dx: noFim ? -8 : 8, dy: noFim ? -12 : 5,
          tamanho: sel ? 19 : 17, peso: sel ? 700 : 400,
          cor: sel ? cor : "var(--muted)" });
      if (sel) {
        var ptsT = c.perdas_treino.map(function (v, i) { return [i + 1, v]; })
          .filter(function (p) { return p[1] <= g.dy[1]; });
        g.linha(ptsT, { cor: "var(--muted)", largura: 2, tracejado: "6 5" });
        g.texto(ptsT[ptsT.length - 1][0], ptsT[ptsT.length - 1][1], "treino",
          { dx: 8, dy: 5, tamanho: 17, peso: 400, cor: "var(--muted)" });
      }
    });
    g.add(sv("line", { x1: g.px(est.iter), x2: g.px(est.iter), y1: g.py(g.dy[0]),
      y2: g.py(g.dy[1]), stroke: "var(--ink)", "stroke-dasharray": "4 4" }));
    g.ponto(est.iter, atual.perdas_validacao[est.iter - 1], { r: 9, cor: cores[atual.taxa] });

    var traj = atual.clientes_por_iteracao || [];
    var pontoCli = traj.filter(function (t) { return t.iteracao <= est.iter; }).slice(-1)[0];

    var faixaClientes = pontoCli
      ? h("div", { class: "painel claro", estilo: "padding:10px 16px" }, [
          h("div", { estilo: "display:flex;gap:26px;align-items:baseline;flex-wrap:wrap" },
            [h("span", { class: "apoio" },
               "PD com " + F.inteiro(pontoCli.iteracao) + " árvores:")].concat(
              D.clientes.map(function (c, i) {
                return h("span", { class: "medio", estilo: "font-size:22px" },
                  c.nome + " " + F.pct(pontoCli.pd[i], 2));
              }))),
          h("p", { class: "nota", estilo: "margin:4px 0 0" },
            "Trajetórias calculadas a cada cinco iterações e registradas no notebook."),
        ])
      : null;

    corpo.appendChild(h("div", { class: "linha cresce" }, [
      h("div", { class: "coluna cresce" }, [
        h("div", { class: "painel claro cresce centro" }, g.svg),
        faixaClientes,
      ]),
      h("div", { class: "coluna", estilo: "flex:0 0 500px" }, [
        h("div", { class: "painel cor" }, [
          h("p", { class: "formula peq", estilo: "background:none;border:none;padding:0;margin:0" },
            "F_m = F_(m−1) + η × h_m"),
          h("div", { class: "kv", estilo: "margin-top:8px;font-size:19px;gap:2px 12px" }, [
            h("dt", {}, "taxa de aprendizagem"), h("dd", {}, F.dec(atual.taxa, 2)),
            h("dt", {}, "árvores usadas"), h("dd", {}, F.inteiro(est.iter)),
            h("dt", {}, "log loss de validação"),
            h("dd", {}, F.dec(atual.perdas_validacao[est.iter - 1], 5)),
            h("dt", {}, "melhor iteração desta taxa"),
            h("dd", {}, F.inteiro(atual.melhor_iteracao) + " com " +
              F.dec(atual.perda_validacao, 5)),
          ]),
        ]),
        h("div", { class: "painel" }, [
          h("div", { class: "ctrl" }, [
            h("label", {}, "Taxa de aprendizagem treinada"),
            UI.botoes({
              compacto: true, rotulo: "taxa",
              opcoes: cenarios.map(function (c) {
                return { valor: c.taxa, rotulo: "η = " + F.dec(c.taxa, 2) };
              }),
              valor: est.taxa,
              aoMudar: function (v) {
                est.taxa = v;
                var c = cenarios.filter(function (x) { return x.taxa === v; })[0];
                est.iter = Math.min(est.iter, c.perdas_validacao.length);
                App.montar("37");
              },
            }),
          ]),
          h("div", { estilo: "margin-top:10px" }, UI.slider({
            rotulo: "Número de árvores, apenas em iterações calculadas", discreto: true,
            min: 1, max: nMax, passo: 1, valor: est.iter,
            formato: function (v) {
              return F.inteiro(v) + " árvores · " + F.dec(atual.perdas_validacao[v - 1], 5);
            },
            aoMudar: function (v) { est.iter = v; App.montar("37"); },
          })),
          h("div", { class: "grupo", estilo: "margin-top:10px" }, [
            h("button", { class: "btn min", type: "button", onclick: function () {
              est.porque = !est.porque; App.montar("37");
            } }, est.porque ? "Esconder a explicação" : "Por que não basta multiplicar no final?"),
            h("button", { class: "btn min fantasma", type: "button", onclick: ctx.reiniciar },
              "Reiniciar exemplo"),
          ]),
        ]),
        est.porque
          ? h("div", { class: "resposta cresce" },
              "Porque os resíduos dependem do escore já atualizado. Com outra taxa, a primeira " +
              "árvore desloca o escore de forma diferente, os gradientes da segunda rodada mudam " +
              "e as árvores seguintes aprendem outra coisa. Multiplicar as contribuições de um " +
              "conjunto já treinado é perturbar um modelo fixo, não treinar com outra taxa.")
          : null,
      ]),
    ]));
  },
});
