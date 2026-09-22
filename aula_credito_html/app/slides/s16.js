Aula.slide({
  id: "16",
  bloco: "logit",
  titulo: "O efeito pode se intensificar depois de um limite",
  subtitulo: "Linearidade é nos parâmetros, não na forma das variáveis",
  conclusao: "A linearidade é nos parâmetros. A forma das variáveis pode ser flexível.",
  fonte: "Cenário separado da fórmula manual; cálculo próprio",
  resumo: "Contribuição ao escore e PD resultante em função do comprometimento, com e sem mudança de inclinação em 40%.",
  notas: {
    conducao: [
      "Mostre primeiro a relação na escala do escore.",
      "Ative a transformação e peça que identifiquem onde a inclinação muda.",
      "Acompanhe a tradução para PD e pergunte como decidir se a flexibilidade ajudou: a resposta cita validação, não a beleza da curva.",
    ],
    respostas: [
      "Antes de 40% a inclinação é 0,04 por ponto. Depois de 40% passa a 0,08 por ponto.",
      "A função é contínua no nó: em comprometimento de 40% as duas formas coincidem.",
    ],
    cuidados: [
      "Escolher o nó olhando o teste vaza informação.",
      "Flexibilidade custa parâmetros e exige controle de complexidade.",
      "Este é um exemplo linear por partes, não uma spline cúbica.",
      "Árvores não são necessárias para representar toda não linearidade.",
    ],
    aprofundar: [
      "Material original, capítulo 4, página 21: faixas devolvem flexibilidade sem trocar de família, ao custo de um coeficiente por faixa em vez de um por variável.",
      "As regras declaradas lá continuam válidas: volume mínimo por faixa, monotonicidade quando existe hipótese econômica de direção, estabilidade das fronteiras nas safras seguintes e fronteiras definidas antes de olhar o alvo.",
      "O WoE é esse mesmo tratamento com um valor específico por faixa, o logaritmo da razão entre a distribuição dos adimplentes e a dos inadimplentes. A mudança de inclinação deste slide é a alternativa contínua, com um parâmetro adicional apenas.",
    ],
    transicao: "Além de mudar a forma de um efeito, podemos permitir que ele dependa de outra característica.",
  },
  impressao: function (e) { e.flex = true; },

  montar: function (corpo, ctx) {
    var est = ctx.estado;
    if (est.comp === undefined) est.comp = 55;
    if (est.flex === undefined) est.flex = false;

    var z0 = -3.50, b1 = 0.04, b2 = 0.04, no = 40;
    function contrib(comp, flex) {
      return b1 * (comp - 30) + (flex ? b2 * Math.max(comp - no, 0) : 0);
    }
    function z(comp, flex) { return z0 + contrib(comp, flex); }

    function grafico(escalaPD) {
      var g = Graf.novo({ w: 476, h: 330, m: { e: 84, d: 24, c: 22, b: 58 } });
      g.x(10, 70);
      if (escalaPD) {
        g.y(0, 0.35);
        g.grade({ y: [0, 0.1, 0.2, 0.3] });
        g.eixoY({ ticks: [0, 0.1, 0.2, 0.3], formato: function (v) { return F.pct(v, 0); },
                  rotulo: "PD do perfil de referência" });
      } else {
        g.y(-1, 1.6);
        g.grade({ y: [-1, 0, 1] });
        g.eixoY({ ticks: [-1, 0, 1], rotulo: "contribuição no escore" });
      }
      g.eixoX({ ticks: [10, 20, 30, 40, 50, 60, 70], rotulo: "comprometimento em %" });
      g.add(sv("line", { x1: g.px(no), x2: g.px(no), y1: g.py(g.dy[0]), y2: g.py(g.dy[1]),
        stroke: "var(--amber)", "stroke-width": 1.5, "stroke-dasharray": "5 4" }));
      g.texto(no, g.dy[1], "nó em 40%", { dx: -6, dy: 18, ancora: "end", tamanho: 16, peso: 400, cor: "var(--amber)" });

      [[false, "var(--rule)", "linear"], [true, "var(--logit)", "com mudança de inclinação"]]
        .forEach(function (par) {
          if (par[0] && !est.flex) return;
          var pts = M.linspace(10, 70, 121).map(function (v) {
            return [v, escalaPD ? M.sigmoid(z(v, par[0])) : contrib(v, par[0])];
          });
          g.linha(pts, { cor: est.flex && !par[0] ? "var(--rule)" : par[1],
                         largura: par[0] || !est.flex ? 3 : 2,
                         tracejado: est.flex && !par[0] ? "6 5" : null });
        });

      var v = escalaPD ? M.sigmoid(z(est.comp, est.flex)) : contrib(est.comp, est.flex);
      g.guia(est.comp, v, { cor: "var(--muted)" });
      g.ponto(est.comp, v, { cor: "var(--logit)", r: 9 });
      /* Perto do topo do domínio o rótulo desce para baixo do ponto, em vez de sair do desenho. */
      var pertoDoTopo = v > g.dy[0] + (g.dy[1] - g.dy[0]) * 0.88;
      g.texto(est.comp, v, escalaPD ? F.pct(v, 2) : F.dec(v, 3),
        { dx: 12, dy: pertoDoTopo ? 26 : -12, tamanho: 21, cor: "var(--ink)" });
      return g.svg;
    }

    var equacao = est.flex
      ? "z = -3{,}50 + 0{,}04\\,(\\mathit{comp} - 30) + 0{,}04\\,\\max(\\mathit{comp} - 40,\\, 0)"
      : "z = -3{,}50 + 0{,}04\\,(\\mathit{comp} - 30)";

    corpo.appendChild(h("div", { class: "linha cresce" }, [
      h("div", { class: "painel claro igual centro", estilo: "display:flex" }, [
        h("h3", { class: "secao" }, "Na escala do escore"),
        grafico(false),
      ]),
      h("div", { class: "painel claro igual centro", estilo: "display:flex" }, [
        h("h3", { class: "secao" }, "Na escala da probabilidade"),
        grafico(true),
      ]),
      h("div", { class: "coluna", estilo: "flex:0 0 420px" }, [
        h("div", { class: "painel cor" }, [
          h("p", { class: "formula peq", estilo: "background:none;border:none;padding:0;margin:0" },
            Mat.b(equacao)),
          est.verEquacao ? h("p", { class: "nota", estilo: "margin-top:8px" },
            "A nova variável máx(comp − 40, 0) vale zero abaixo de 40% e cresce depois disso. " +
            "Ela entra com coeficiente próprio, e o modelo continua linear nos parâmetros.") : null,
        ]),
        h("div", { class: "painel" }, [
          UI.slider({
            rotulo: "Comprometimento", min: 10, max: 70, passo: 1, valor: est.comp,
            formato: function (v) { return F.pct(M.sigmoid(z(v, est.flex)), 2); },
            aoMudar: function (v) { est.comp = v; App.montar("16"); },
          }),
          h("div", { class: "grupo", estilo: "margin-top:12px" }, [
            UI.alterna({
              rotulo: "forma", valor: est.flex,
              ligadoRotulo: "Voltar à forma linear",
              desligadoRotulo: "Ativar mudança de inclinação",
              aoMudar: function (v) { est.flex = v; App.montar("16"); },
            }),
            h("button", { class: "btn", type: "button", onclick: function () {
              est.verEquacao = !est.verEquacao; App.montar("16");
            } }, "Ver como entra na equação"),
            h("button", { class: "btn fantasma", type: "button", onclick: ctx.reiniciar },
              "Reiniciar exemplo"),
          ]),
        ]),
        h("div", { class: "painel claro cresce" }, [
          h("h3", { class: "secao" }, "Inclinação por faixa"),
          UI.tabela({
            compacta: true,
            colunas: [{ rotulo: "Faixa" }, { rotulo: "Inclinação no escore", unidade: "por ponto" }],
            linhas: [
              ["comprometimento até 40%", F.dec(b1, 2)],
              ["comprometimento acima de 40%", F.dec(est.flex ? b1 + b2 : b1, 2)],
            ],
            legenda: "Inclinação antes e depois do nó",
          }),
          h("p", { class: "nota", estilo: "margin-top:8px" },
            "No nó, as duas formas coincidem: contribuição " +
            F.dec(contrib(no, true), 3) + " em ambos os casos. A função é contínua."),
        ]),
      ]),
    ]));
  },
});
