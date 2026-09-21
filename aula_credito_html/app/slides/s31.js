Aula.slide({
  id: "31",
  bloco: "boosting",
  titulo: "E se uma árvore pequena ainda deixar estrutura nos erros?",
  subtitulo: "Resíduos agregados por região, no experimento auxiliar de duas variáveis",
  conclusao: "Em vez de exigir tudo de uma árvore, podemos construir a previsão por acréscimos.",
  fonte: Aula.dados.fontes.auxiliar,
  resumo: "Mapa de previsão de uma árvore rasa e média do resíduo observado menos previsto por região.",
  notas: {
    conducao: [
      "Retome o slide 27: aumentar uma única árvore não é a única opção.",
      "Mostre que há grupos em que a previsão ficou sistematicamente baixa ou alta.",
      "Pergunte como uma próxima função poderia atuar nesses grupos. Termine apresentando a palavra sequencial.",
    ],
    cuidados: [
      "Um resíduo individual não é padrão. A leitura só faz sentido na média por região.",
      "Subajuste e variabilidade não se resolvem com boosting em todos os casos: combinar árvores também acrescenta complexidade e pode sobreajustar.",
      "Os resíduos aqui vêm do conjunto usado no ajuste, nunca do teste.",
      "O título é uma hipótese a ilustrar com dados, não um diagnóstico automático.",
    ],
    transicao: "Vamos entender a regra de construção: partir de um escore simples, calcular a direção de melhoria e acrescentar uma árvore.",
  },

  montar: function (corpo, ctx) {
    var R = Aula.resultados;
    var est = ctx.estado;
    if (!R) {
      corpo.appendChild(h("p", { class: "resposta erro" },
        "Resultados do experimento não disponíveis: execute experimento/experimento.py e recompile."));
      return;
    }
    if (!est.destaque) est.destaque = null;

    var res = R.auxiliar_2d.residuos_arvore_rasa;
    var arv = R.auxiliar_2d.arvores["2"];

    var gm = Comum.mapaCalor(arv.malha, { w: 452, h: 364, max: 0.5,
      resumo: "Previsão de uma árvore de profundidade dois em comprometimento e utilização." });

    /* Mapa dos resíduos médios por região, com eixo centrado em zero. */
    var g = Graf.novo({ w: 452, h: 364, m: { e: 74, d: 26, c: 20, b: 54 } });
    g.x(5, 80).y(0, 100);
    g.eixoX({ ticks: [20, 40, 60, 80], rotulo: "comprometimento" });
    g.eixoY({ ticks: [0, 50, 100], rotulo: "utilização" });
    var maxAbs = Math.max.apply(null, res.map(function (r) { return Math.abs(r.residuo_medio); }));
    res.forEach(function (r) {
      var x0 = 5 + (r.i * 75) / 6, x1 = 5 + ((r.i + 1) * 75) / 6;
      var y0 = (r.j * 100) / 6, y1 = ((r.j + 1) * 100) / 6;
      var t = Math.min(1, Math.abs(r.residuo_medio) / maxAbs);
      var positivo = r.residuo_medio > 0;
      var apagado = (est.destaque === "positivo" && !positivo) ||
                    (est.destaque === "negativo" && positivo);
      var cor = positivo
        ? "color-mix(in srgb, var(--alert) " + (8 + t * 80).toFixed(0) + "%, #ffffff)"
        : "color-mix(in srgb, var(--ok) " + (8 + t * 80).toFixed(0) + "%, #ffffff)";
      g.retangulo(x0, y0, x1, y1,
        { cor: apagado ? "var(--paper)" : cor, borda: "var(--rule)", bordaL: 1,
          opacidade: apagado ? .35 : 1 });
      /* Duas casas: com três, os números de células vizinhas se encostam e a
         leitura da grade some. A cor já carrega a intensidade. */
      g.texto((x0 + x1) / 2, (y0 + y1) / 2, F.dec(r.residuo_medio, 2),
        { ancora: "middle", dy: 4, tamanho: 12, peso: 700,
          cor: apagado ? "var(--rule)" : "var(--ink)" });
    });

    var positivos = res.filter(function (r) { return r.residuo_medio > 0; });
    var negativos = res.filter(function (r) { return r.residuo_medio <= 0; });
    function media(lista) {
      var n = M.soma(lista.map(function (r) { return r.n; }));
      return M.soma(lista.map(function (r) { return r.residuo_medio * r.n; })) / n;
    }

    corpo.appendChild(h("div", { class: "linha cresce" }, [
      h("div", { class: "painel claro cresce centro" }, [
        h("h3", { class: "secao" }, "Previsão de uma árvore de profundidade 2"),
        gm.svg,
        h("div", { estilo: "display:flex;gap:14px;align-items:center;margin-top:6px" }, [
          h("span", { class: "nota" }, "PD prevista"),
          Comum.legendaCor(0.5, { w: 200 }),
        ]),
      ]),
      h("div", { class: "painel claro cresce centro" }, [
        h("h3", { class: "secao" }, "Média de y − p por região"),
        g.svg,
        h("p", { class: "nota", estilo: "margin:0" },
          "Vermelho: a previsão ficou baixa demais. Verde: ficou alta demais."),
      ]),
      h("div", { class: "coluna", estilo: "flex:0 0 470px" }, [
        h("div", { class: "painel cor", estilo: "padding:12px 16px" }, [
          h("h3", { class: "secao", estilo: "margin-bottom:6px" },
            "O que sobra depois da árvore rasa"),
          h("dl", { class: "kv", estilo: "font-size:18px;gap:2px 12px" }, [
            h("dt", {}, "regiões com resíduo positivo"),
            h("dd", {}, F.inteiro(positivos.length) + " de " + res.length),
            h("dt", {}, "média dessas regiões"), h("dd", {}, F.dec(media(positivos), 4)),
            h("dt", {}, "média das demais"), h("dd", {}, F.dec(media(negativos), 4)),
            h("dt", {}, "validação da árvore rasa"), h("dd", {}, F.dec(arv.perda_validacao, 4)),
          ]),
        ]),
        h("div", { class: "painel" }, [
          h("div", { class: "grupo vert" }, [
            h("button", { class: "btn" + (est.destaque === "positivo" ? " sel" : ""),
              type: "button", onclick: function () {
                est.destaque = est.destaque === "positivo" ? null : "positivo"; App.montar("31");
              } }, "Onde a previsão ficou baixa?"),
            h("button", { class: "btn" + (est.destaque === "negativo" ? " sel" : ""),
              type: "button", onclick: function () {
                est.destaque = est.destaque === "negativo" ? null : "negativo"; App.montar("31");
              } }, "E onde ficou alta?"),
            h("button", { class: "btn", type: "button", onclick: function () {
              est.correcao = !est.correcao; App.montar("31");
            } }, est.correcao ? "Esconder a ideia" : "Acrescentar uma correção"),
            h("button", { class: "btn fantasma", type: "button", onclick: ctx.reiniciar },
              "Reiniciar exemplo"),
          ]),
        ]),
        est.correcao
          ? h("div", { class: "resposta cresce" }, [
              h("p", {}, [h("strong", {}, "A ideia. "),
                "Ajustar uma segunda função pequena que some um valor positivo onde o resíduo " +
                "médio é positivo e um valor negativo onde ele é negativo. Essa função não " +
                "substitui a primeira: ela é acrescentada ao escore."]),
              h("p", { class: "nota", estilo: "margin-top:8px" },
                "A palavra que organiza o resto do bloco é sequencial: a próxima árvore usa o " +
                "estado das previsões anteriores. Os números da execução aparecem nos slides 33 a 36."),
            ])
          : h("div", { class: "painel claro cresce" }, [
              h("p", { class: "apoio", estilo: "margin:0" },
                "Os resíduos mostrados são do conjunto usado no ajuste desta árvore auxiliar, " +
                "com duas variáveis. Nenhum resultado do teste participa."),
            ]),
      ]),
    ]));
  },
});
