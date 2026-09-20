Aula.slide({
  id: "18",
  bloco: "logit",
  titulo: "Coeficientes extremos podem estar aprendendo ruído",
  subtitulo: "Trajetórias de coeficientes e perdas, na grade de penalização efetivamente treinada",
  conclusao: "A melhor explicação do treino pode ser sensível demais para funcionar fora dele.",
  fonte: Aula.dados.fontes.experimento,
  resumo: "Trajetórias de coeficientes padronizados em função da força da penalização e curvas de perda de treino e validação.",
  notas: {
    conducao: [
      "Comece com penalização fraca, observe as magnitudes e a validação.",
      "Aumente a penalização e discuta o que melhora e o que piora.",
      "Compare os dois cenários: na amostra completa o efeito é pequeno; na amostra reduzida ele aparece com clareza.",
    ],
    cuidados: [
      "Regularização reduz variância em muitas situações. Não garante estabilidade em qualquer conjunto nem resolve mudança de população.",
      "Coeficientes padronizados não são os números da fórmula manual dos slides 07 a 14.",
      "A escolha da penalização faz parte do treinamento, e usa validação, nunca o teste.",
      "Com variáveis correlacionadas, nem todo coeficiente diminui de magnitude de forma monótona.",
      "A força da penalização mostrada é 1 dividido por C. C menor significa penalização maior.",
    ],
    transicao: "Podemos tornar o logit mais flexível e controlar sua complexidade. Em quais situações essa combinação é especialmente útil?",
  },

  montar: function (corpo, ctx) {
    var R = Aula.resultados;
    var est = ctx.estado;
    if (!est.cenario) est.cenario = "pequena";

    if (!R) {
      corpo.appendChild(h("p", { class: "resposta erro" },
        "Resultados do experimento não disponíveis: execute experimento/experimento.py e recompile."));
      return;
    }

    var fonte = est.cenario === "completa"
      ? { grade: R.modelos.logit.grade, colunas: R.modelos.logit.colunas,
          escolhido: R.modelos.logit.C, n: R.protocolo.particoes[0].n,
          titulo: "Treino completo (" + F.inteiro(R.protocolo.particoes[0].n) + " contratos)" }
      : { grade: R.modelos.logit_amostra_pequena.grade,
          colunas: R.modelos.logit_amostra_pequena.colunas,
          escolhido: R.modelos.logit_amostra_pequena.C,
          n: R.modelos.logit_amostra_pequena.n,
          titulo: "Amostra reduzida do treino (600 contratos)" };

    var grade = fonte.grade;
    if (est.indice === undefined || est.indice >= grade.length) {
      est.indice = grade.map(function (g) { return g.C; }).indexOf(fonte.escolhido);
      if (est.indice < 0) est.indice = grade.length - 1;
    }
    var atual = grade[est.indice];
    var melhor = grade.reduce(function (a, b) {
      return b.perda_validacao < a.perda_validacao ? b : a;
    }, grade[0]);

    var vars = ["comp", "hist", "util", "rel", "renda"];
    var idx = vars.map(function (v) { return fonte.colunas.indexOf(v); });
    var cores = ["var(--logit)", "var(--alert)", "var(--arvore)", "var(--amber)", "var(--boost)"];

    function eixoForca(g) { return Math.log10(1 / g.C); }
    var xs = grade.map(eixoForca);
    var minX = Math.min.apply(null, xs), maxX = Math.max.apply(null, xs);

    var gc = Graf.novo({ w: 620, h: 330, m: { e: 88, d: 112, c: 18, b: 56 } });
    var todos = [];
    grade.forEach(function (g) { idx.forEach(function (j) { todos.push(g.coeficientes[j]); }); });
    var lim = Math.max(0.6, Math.ceil(Math.max.apply(null, todos.map(Math.abs)) * 2) / 2);
    gc.x(minX, maxX).y(-lim, lim);
    gc.grade({ y: [-lim, 0, lim] });
    gc.eixoY({ ticks: [-lim, -lim / 2, 0, lim / 2, lim], formato: function (v) { return F.dec(v, 1); },
               rotulo: "coeficiente padronizado" });
    gc.eixoX({ ticks: [minX, (minX + maxX) / 2, maxX],
               formato: function (v) { return F.dec(Math.pow(10, v), v > 1 ? 0 : 2); },
               rotulo: "força da penalização (1 dividido por C)" });
    vars.forEach(function (v, k) {
      var pts = grade.map(function (g) { return [eixoForca(g), g.coeficientes[idx[k]]]; });
      gc.linha(pts, { cor: cores[k], largura: 2.5 });
      var fim = pts[pts.length - 1];
      gc.texto(maxX, fim[1], v, { dx: 8, dy: 5, tamanho: 17, peso: 400, cor: cores[k] });
      gc.ponto(eixoForca(atual), atual.coeficientes[idx[k]], { r: 5, cor: cores[k], bordaL: 1.5 });
    });
    gc.add(sv("line", { x1: gc.px(eixoForca(atual)), x2: gc.px(eixoForca(atual)),
      y1: gc.py(-lim), y2: gc.py(lim), stroke: "var(--muted)", "stroke-dasharray": "4 4" }));

    var gp = Graf.novo({ w: 620, h: 330, m: { e: 92, d: 112, c: 18, b: 56 } });
    var perdas = grade.map(function (g) { return g.perda_treino; })
      .concat(grade.map(function (g) { return g.perda_validacao; }));
    var pmin = Math.min.apply(null, perdas), pmax = Math.max.apply(null, perdas);
    var folga = (pmax - pmin) * 0.12 || 0.01;
    gp.x(minX, maxX).y(pmin - folga, pmax + folga);
    gp.grade({ y: Graf.ticks(pmin - folga, pmax + folga, 4) });
    gp.eixoY({ ticks: Graf.ticks(pmin - folga, pmax + folga, 4),
               formato: function (v) { return F.dec(v, 3); }, rotulo: "log loss" });
    gp.eixoX({ ticks: [minX, (minX + maxX) / 2, maxX],
               formato: function (v) { return F.dec(Math.pow(10, v), v > 1 ? 0 : 2); },
               rotulo: "força da penalização (1 dividido por C)" });
    [["perda_treino", "var(--muted)", "treino"], ["perda_validacao", "var(--logit)", "validação"]]
      .forEach(function (par) {
        var pts = grade.map(function (g) { return [eixoForca(g), g[par[0]]]; });
        gp.linha(pts, { cor: par[1], largura: 3 });
        gp.texto(maxX, pts[pts.length - 1][1], par[2], { dx: 8, dy: 5, tamanho: 18, cor: par[1] });
        gp.ponto(eixoForca(atual), atual[par[0]], { r: 6, cor: par[1] });
      });
    gp.add(sv("line", { x1: gp.px(eixoForca(melhor)), x2: gp.px(eixoForca(melhor)),
      y1: gp.py(gp.dy[0]), y2: gp.py(gp.dy[1]), stroke: "var(--ok)", "stroke-width": 2 }));
    gp.texto(eixoForca(melhor), gp.dy[1], "escolhido na validação",
      { dx: 6, dy: 16, tamanho: 16, peso: 400, cor: "var(--ok)" });

    corpo.appendChild(h("div", { class: "linha cresce" }, [
      h("div", { class: "painel claro cresce centro", estilo: "display:flex" }, [
        h("h3", { class: "secao" }, "Trajetórias dos coeficientes"),
        gc.svg,
      ]),
      h("div", { class: "painel claro cresce centro", estilo: "display:flex" }, [
        h("h3", { class: "secao" }, "Perda de treino e de validação"),
        gp.svg,
      ]),
      h("div", { class: "coluna", estilo: "flex:0 0 420px" }, [
        h("div", { class: "painel cor" }, [
          h("h3", { class: "secao", estilo: "margin:0 0 6px" }, fonte.titulo),
          h("div", { class: "kv", estilo: "font-size:18px;gap:2px 12px" }, [
            h("dt", {}, "C e força"),
            h("dd", {}, F.dec(atual.C, atual.C < 1 ? 4 : 0) + "  ·  " +
              F.dec(atual.forca, atual.forca < 1 ? 3 : 0)),
            h("dt", {}, "log loss treino"), h("dd", {}, F.dec(atual.perda_treino, 5)),
            h("dt", {}, "log loss validação"), h("dd", {}, F.dec(atual.perda_validacao, 5)),
            h("dt", {}, "AUC validação"), h("dd", {}, F.dec(atual.auc_validacao, 4)),
          ]),
        ]),
        h("div", { class: "painel" }, [
          UI.slider({
            rotulo: "Penalização, apenas nos valores treinados", discreto: true, min: 0, max: grade.length - 1,
            passo: 1, valor: est.indice,
            formato: function (v) { return "C = " + F.dec(grade[v].C, grade[v].C < 1 ? 4 : 0); },
            aoMudar: function (v) { est.indice = v; App.montar("18"); },
          }),
          h("div", { class: "grupo", estilo: "margin-top:12px" }, [
            UI.botoes({
              compacto: true, rotulo: "cenário",
              opcoes: [{ valor: "pequena", rotulo: "Amostra reduzida" },
                       { valor: "completa", rotulo: "Treino completo" }],
              valor: est.cenario,
              aoMudar: function (v) { est.cenario = v; est.indice = undefined; App.montar("18"); },
            }),
            h("button", { class: "btn min fantasma", type: "button", onclick: ctx.reiniciar },
              "Reiniciar exemplo"),
          ]),
        ]),
        h("div", { class: "painel claro cresce" }, [
          h("p", { class: "apoio" }, est.cenario === "completa"
            ? ("Com " + F.inteiro(fonte.n) + " contratos de treino e nove colunas, a validação varia " +
               "apenas na quarta casa decimal: aqui a penalização quase não muda o resultado. " +
               "O comportamento observado é este, e não uma curva em U.")
            : ("Com 600 contratos e a especificação flexível, a perda de treino continua caindo " +
               "enquanto a de validação sobe. O mínimo de validação ocorre em C = " +
               F.dec(melhor.C, 4) + ", com log loss " + F.dec(melhor.perda_validacao, 5) + ".")),
          h("p", { class: "nota", estilo: "margin-top:8px" },
            "O teste final não participa desta escolha."),
        ]),
      ]),
    ]));
  },
});
