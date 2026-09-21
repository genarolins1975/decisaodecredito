Aula.slide({
  id: "47",
  bloco: "decisao",
  titulo: "Com estas hipóteses, o equilíbrio ocorre em PD de 20%",
  subtitulo: "Aproximação didática por operação, horizonte de 12 meses",
  conclusao: "Um bom ranking só gera valor quando probabilidades e política se conectam à economia da operação.",
  fonte: Aula.dados.fontes.economia,
  resumo: "Resultado esperado por operação em função da PD, com o ponto de equilíbrio marcado e a decomposição em margem menos perda esperada.",
  notas: {
    conducao: [
      "Construa a perda esperada, depois o resultado, depois o equilíbrio.",
      "Pergunte o efeito de aumentar a fração perdida mantendo a PD.",
      "Mostre que o mesmo cliente pode ser aceitável sob uma estrutura econômica e inviável sob outra, sem defender simplesmente aumento de taxa.",
    ],
    respostas: [
      "Perda esperada é PD vezes LGD vezes EAD. Em PD de 10%: 0,10 vezes 60% vezes R$ 10.000, igual a R$ 600.",
      "Resultado esperado é margem menos perda esperada: R$ 1.200 menos R$ 600, igual a R$ 600.",
      "Equilíbrio: margem dividida por LGD vezes EAD, igual a 20%.",
    ],
    cuidados: [
      "A margem é considerada constante e já líquida dos custos definidos, apenas nesta simplificação. Não é receita recebida em todos os cenários do mundo real.",
      "Perda esperada não é lucro, e EAD não é o valor original do contrato sem a hipótese de igualdade.",
      "A versão alternativa, com margem condicional ao adimplemento, tem outro corte e não deve ser misturada a este gráfico.",
      "Resultados realizados usam y e são diferentes do valor esperado calculado com p.",
    ],
    transicao: "Antes de implantar, ainda precisamos saber se a relação continua válida no tempo e se conseguimos operar essa relação com controle.",
  },

  montar: function (corpo, ctx) {
    var E = Aula.dados.economia;
    var est = ctx.estado;
    if (est.pd === undefined) est.pd = 0.10;
    if (!est.par) est.par = { margem: E.margem, lgd: E.lgd, ead: E.ead };
    if (est.alternativa === undefined) est.alternativa = false;

    var par = est.par;
    var hip = { margem: par.margem, lgd: par.lgd, ead: par.ead };
    var el = E.perdaEsperada(est.pd, hip);
    var resultado = E.resultado(est.pd, hip);
    var equilibrio = E.equilibrio(hip);
    var foraDaFaixa = equilibrio >= 1;

    var g = Graf.novo({ w: 900, h: 470, m: { e: 120, d: 40, c: 28, b: 62 },
      resumo: "Resultado esperado por operação em função da PD." });
    var minY = E.resultado(0.5, hip), maxY = hip.margem;
    g.x(0, 0.5).y(Math.min(minY, -100) * 1.05, maxY * 1.1);
    var ticks = Graf.ticks(g.dy[0], g.dy[1], 6);
    g.grade({ y: ticks, x: [0.1, 0.2, 0.3, 0.4, 0.5] });
    g.eixoY({ ticks: ticks, formato: function (v) { return F.reais(v); },
              rotulo: "resultado esperado por operação" });
    g.eixoX({ ticks: [0, 0.1, 0.2, 0.3, 0.4, 0.5],
              formato: function (v) { return F.pct(v, 0); }, rotulo: "PD" });
    g.add(sv("line", { x1: g.px(0), x2: g.px(0.5), y1: g.py(0), y2: g.py(0),
      stroke: "var(--muted)", "stroke-width": 1.5 }));
    g.linha(M.linspace(0, 0.5, 120).map(function (v) { return [v, E.resultado(v, hip)]; }),
      { cor: "var(--amber)", largura: 3.5 });
    if (!foraDaFaixa && equilibrio <= 0.5) {
      g.add(sv("line", { x1: g.px(equilibrio), x2: g.px(equilibrio),
        y1: g.py(g.dy[0]), y2: g.py(0), stroke: "var(--alert)", "stroke-width": 2,
        "stroke-dasharray": "6 4" }));
      g.ponto(equilibrio, 0, { r: 10, cor: "var(--alert)" });
      g.texto(equilibrio, 0, "equilíbrio em " + F.pct(equilibrio, 1),
        { dx: 12, dy: -14, tamanho: 21, cor: "var(--alert)" });
    }
    g.guia(est.pd, resultado, { cor: "var(--amber)" });
    g.ponto(est.pd, resultado, { r: 11, cor: "var(--amber)" });
    g.texto(est.pd, resultado, F.reais(resultado),
      { dx: 12, dy: resultado > 0 ? -14 : 24, tamanho: 22, cor: "var(--ink)" });

    var gd = Graf.novo({ w: 420, h: 128, m: { e: 96, d: 24, c: 18, b: 30 } });
    gd.x(0, 3).y(Math.min(0, resultado) * 1.15, hip.margem * 1.15);
    gd.eixoY({ ticks: [0, hip.margem / 2, hip.margem],
               formato: function (v) { return F.reais(v); } });
    gd.add(sv("line", { x1: gd.px(0), x2: gd.px(3), y1: gd.py(0), y2: gd.py(0),
      stroke: "var(--muted)", "stroke-width": 1.5 }));
    [[0.5, hip.margem, "margem", "var(--ok)"],
     [1.5, -el, "perda esperada", "var(--alert)"],
     [2.5, resultado, "resultado", "var(--amber)"]].forEach(function (b) {
      var y0 = Math.min(0, b[1]), y1 = Math.max(0, b[1]);
      gd.retangulo(b[0] - 0.32, y0, b[0] + 0.32, y1, { cor: b[3] });
      gd.texto(b[0], b[1] > 0 ? b[1] : 0, F.reais(b[1]),
        { ancora: "middle", dy: -10, tamanho: 19, cor: "var(--ink)" });
      gd.texto(b[0], gd.dy[0], b[2],
        { ancora: "middle", dy: 26, tamanho: 17, peso: 400, cor: "var(--muted)" });
    });

    var alternativa = null;
    if (est.alternativa) {
      var mGood = 1400, custo = 200, perda = hip.lgd * hip.ead;
      var corteAlt = (mGood - custo) / (mGood + perda);
      var resAlt = (1 - est.pd) * mGood - est.pd * perda - custo;
      alternativa = h("div", { class: "painel", estilo: "border-color:var(--ink-soft)" }, [
        h("h3", { class: "secao" }, "Versão alternativa, separada"),
        h("p", { class: "formula peq" },
          Mat.b("\\mathbb{E}[\\text{resultado}] = (1-p)\\,m - p\\,L - c")),
        UI.kv([
          ["margem condicional ao adimplemento", F.reais(mGood)],
          ["custo por operação", F.reais(custo)],
          ["perda em caso de evento", F.reais(perda)],
          ["resultado em PD de " + F.pct(est.pd, 1), F.reais(resAlt)],
          ["corte desta versão", F.pct(corteAlt, 2)],
        ]),
        h("p", { class: "nota", estilo: "margin-top:6px" },
          "Este corte pertence a esta formulação. Não deve ser aplicado ao gráfico da " +
          "aproximação de margem fixa."),
      ]);
    }

    corpo.appendChild(h("div", { class: "linha cresce" }, [
      h("div", { class: "coluna cresce" }, [
        h("div", { class: "painel claro cresce centro" }, g.svg),
      ]),
      h("div", { class: "coluna", estilo: "flex:0 0 480px" }, [
        /* A versão alternativa ocupa o lugar do painel de hipóteses enquanto está aberta: os dois
           juntos, com os controles, passavam da altura do palco. Fechá-la traz as hipóteses de volta. */
        est.alternativa ? alternativa : h("div", { class: "painel cor", estilo: "padding:12px 16px" }, [
          h("div", { estilo: "display:flex;flex-wrap:wrap;justify-content:space-between;align-items:baseline;gap:10px" }, [
            h("h3", { class: "secao", estilo: "margin:0 0 4px" }, "Hipóteses"),
            UI.selo("aproximação didática, 12 meses", "neutro"),
          ]),
          h("p", { class: "formula peq", estilo: "background:none;border:none;padding:0;margin:0 0 4px;font-size:16px" },
            Mat.b("\\mathbb{E}[\\text{resultado}] = m - p\\,\\text{LGD}\\,\\text{EAD}"
              + (foraDaFaixa ? "" : "\\quad p^{*} = \\tfrac{m}{\\text{LGD}\\,\\text{EAD}} = " + Mat.pct(equilibrio, 0)))),
          h("dl", { class: "kv", estilo: "font-size:18px;gap:1px 12px" }, [
            h("dt", {}, "margem antes da perda"), h("dd", {}, F.reais(hip.margem)),
            h("dt", {}, "EAD"), h("dd", {}, F.reais(hip.ead)),
            h("dt", {}, "LGD"), h("dd", {}, F.pct(hip.lgd, 0)),
            h("dt", {}, "perda esperada"), h("dd", {}, F.reais(el)),
            h("dt", {}, "resultado esperado"), h("dd", {}, F.reais(resultado)),
            foraDaFaixa ? h("dt", {}, "equilíbrio") : null,
            foraDaFaixa ? h("dd", {}, "fora do intervalo de PD relevante") : null,
          ]),
        ]),
        h("div", { class: "painel" }, [
          UI.slider({
            rotulo: "PD do contrato", min: 0, max: 50, passo: 0.5, valor: est.pd * 100,
            formato: function (v) { return F.reais(E.resultado(v / 100, hip)); },
            aoMudar: function (v) { est.pd = v / 100; App.montar("47"); },
          }),
          h("div", { class: "grupo", estilo: "margin-top:10px" }, [
            /* Um painel de cada vez: hipóteses e versão alternativa juntas não cabem na coluna, e a
               própria tela diz que a alternativa não deve ser misturada ao gráfico principal. */
            h("button", { class: "btn min", type: "button", onclick: function () {
              est.hipoteses = !est.hipoteses; if (est.hipoteses) est.alternativa = false; App.montar("47");
            } }, est.hipoteses ? "Esconder hipóteses" : "Mudar hipóteses"),
            h("button", { class: "btn min", type: "button", onclick: function () {
              est.alternativa = !est.alternativa; if (est.alternativa) est.hipoteses = false; App.montar("47");
            } }, est.alternativa ? "Esconder a alternativa" : "Versão com margem condicional"),
            h("button", { class: "btn min fantasma", type: "button", onclick: ctx.reiniciar },
              "Reiniciar exemplo"),
          ]),
          est.hipoteses
            ? h("div", { estilo: "margin-top:10px" }, [
                UI.slider({
                  rotulo: "Margem antes da perda, em R$", min: 500, max: 2500, passo: 100,
                  valor: par.margem,
                  formato: function (v) { return F.reais(v); },
                  aoMudar: function (v) { par.margem = v; App.montar("47"); },
                }),
                h("div", { estilo: "margin-top:6px" }, UI.slider({
                  rotulo: "LGD em %", min: 20, max: 100, passo: 5, valor: par.lgd * 100,
                  formato: function (v) { return v + "%"; },
                  aoMudar: function (v) { par.lgd = v / 100; App.montar("47"); },
                })),
                h("div", { estilo: "margin-top:6px" }, UI.slider({
                  rotulo: "EAD em R$", min: 5000, max: 20000, passo: 1000, valor: par.ead,
                  formato: function (v) { return F.reais(v); },
                  aoMudar: function (v) { par.ead = v; App.montar("47"); },
                })),
              ])
            : null,
        ]),
        /* Com as hipóteses abertas, os três controles ocupam o lugar da decomposição, cujos
           números continuam no painel de hipóteses. */
        (est.hipoteses || est.alternativa) ? null : (h("div", { class: "painel claro cresce centro",
            estilo: "padding:10px 16px" }, [
          h("h3", { class: "secao", estilo: "margin-bottom:2px" }, "Margem menos perda esperada"),
          gd.svg,
        ])),
      ]),
    ]));
  },
});
