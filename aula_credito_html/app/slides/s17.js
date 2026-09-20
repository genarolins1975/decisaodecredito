Aula.slide({
  id: "17",
  bloco: "logit",
  titulo: "O comprometimento pesa igual para quem tem histórico de atraso?",
  subtitulo: "Interação é diferença de inclinação na escala do escore",
  conclusao: "Com interação, o efeito do comprometimento no escore depende do histórico.",
  fonte: "Cenário separado da fórmula manual; cálculo próprio",
  resumo: "Duas retas de escore por comprometimento, uma para cada valor de histórico, e as curvas de PD correspondentes.",
  notas: {
    conducao: [
      "Comece pelo escore, com as duas retas paralelas.",
      "Pergunte o que muda quando o termo cruzado é ativado. Só então observe a PD.",
      "Peça que o aluno separe efeito do histórico no escore de diferença de probabilidade.",
    ],
    respostas: [
      "Sem interação: inclinação 0,04 nos dois grupos, retas paralelas no escore.",
      "Com interação de 0,03: inclinação 0,04 para histórico zero e 0,07 para histórico um.",
      "Mesmo sem termo cruzado, a diferença de PD entre os grupos varia com o comprometimento, porque a sigmoide é não linear.",
    ],
    cuidados: [
      "Os coeficientes principais são condicionais ao valor de referência das demais variáveis.",
      "Com interação, o coeficiente do histórico não é efeito constante em qualquer comprometimento.",
      "A leitura é associativa e pode não representar uma intervenção viável.",
      "Ausência de termo cruzado não implica diferença constante de PD.",
    ],
    transicao: "Cada transformação ou interação acrescenta flexibilidade. Como evitar que isso capture particularidades da amostra?",
  },
  impressao: function (e) { e.delta = 0.03; },

  montar: function (corpo, ctx) {
    var est = ctx.estado;
    if (est.comp === undefined) est.comp = 40;
    if (est.delta === undefined) est.delta = 0;

    var z0 = -3.50, bComp = 0.04, bHist = 0.80;
    function z(comp, hist) {
      return z0 + bComp * (comp - 30) + bHist * hist + est.delta * (comp - 30) * hist;
    }

    function grafico(escalaPD) {
      var g = Graf.novo({ w: 470, h: 452, m: { e: 84, d: 36, c: 20, b: 56 } });
      g.x(10, 70);
      if (escalaPD) {
        g.y(0, 0.7);
        g.grade({ y: [0, 0.2, 0.4, 0.6] });
        g.eixoY({ ticks: [0, 0.2, 0.4, 0.6], formato: function (v) { return F.pct(v, 0); },
                  rotulo: "probabilidade de inadimplência" });
      } else {
        /* O domínio cobre z em toda a faixa de comprometimento, inclusive o
           mínimo em 10% sem histórico: a curva não é desenhada fora da moldura. */
        g.y(-4.6, 1.4);
        g.grade({ y: [-4, -3, -2, -1, 0, 1] });
        g.eixoY({ ticks: [-4, -3, -2, -1, 0, 1], rotulo: "escore z" });
      }
      g.eixoX({ ticks: [10, 20, 30, 40, 50, 60, 70], rotulo: "comprometimento em %" });
      [0, 1].forEach(function (hist) {
        var cor = hist ? "var(--alert)" : "var(--logit)";
        var pts = M.linspace(10, 70, 121).map(function (v) {
          return [v, escalaPD ? M.sigmoid(z(v, hist)) : z(v, hist)];
        });
        g.linha(pts, { cor: cor, largura: 3 });
        var fim = pts[pts.length - 1];
        var v = escalaPD ? M.sigmoid(z(est.comp, hist)) : z(est.comp, hist);
        g.ponto(est.comp, v, { cor: cor, r: 8 });
        var aDireita = est.comp <= 52;
        /* Perto do piso do domínio o valor sobe, para não cair sobre o eixo. */
        var noPiso = (v - g.dy[0]) / (g.dy[1] - g.dy[0]) < 0.14;
        g.texto(est.comp, v, escalaPD ? F.pct(v, 1) : F.dec(v, 2),
          { ancora: aDireita ? "start" : "end", dx: aDireita ? 10 : -10,
            dy: hist && !noPiso ? -12 : (noPiso ? -12 : 22), tamanho: 18, cor: "var(--ink)" });
      });
      g.add(sv("line", { x1: g.px(est.comp), x2: g.px(est.comp), y1: g.py(g.dy[0]),
        y2: g.py(g.dy[1]), stroke: "var(--muted)", "stroke-dasharray": "4 4" }));
      return g.svg;
    }

    /* As duas curvas se identificam em legenda acima do desenho: rótulo preso ao
       fim da curva disputaria espaço com o valor do ponto selecionado. */
    function legenda() {
      return h("div", { estilo: "display:flex;gap:20px;align-self:flex-start;margin-bottom:2px" },
        [[1, "var(--alert)", "histórico = 1"], [0, "var(--logit)", "histórico = 0"]]
          .map(function (l) {
            return h("span", { estilo: "display:flex;align-items:center;gap:7px" }, [
              h("span", { estilo: "width:24px;height:4px;border-radius:2px;background:" + l[1] }),
              h("span", { class: "apoio", estilo: "font-size:17px" }, l[2]),
            ]);
          }));
    }

    var termo = est.delta * (est.comp - 30);
    var difEscore = z(est.comp, 1) - z(est.comp, 0);
    var difPD = M.sigmoid(z(est.comp, 1)) - M.sigmoid(z(est.comp, 0));

    corpo.appendChild(h("div", { class: "linha cresce" }, [
      h("div", { class: "painel claro igual centro", estilo: "display:flex" }, [
        h("h3", { class: "secao" }, "Na escala do escore"),
        legenda(),
        grafico(false),
      ]),
      h("div", { class: "painel claro igual centro", estilo: "display:flex" }, [
        h("h3", { class: "secao" }, "Na escala da probabilidade"),
        legenda(),
        grafico(true),
      ]),
      h("div", { class: "coluna", estilo: "flex:0 0 430px" }, [
        h("div", { class: "painel cor", estilo: "padding:10px 14px" }, [
          h("p", { class: "formula peq", estilo: "background:none;border:none;padding:0;margin:0;font-size:19px" },
            Mat.passos([
              "z ={} & -3{,}50 + 0{,}80\\,\\mathit{hist}",
              "& + (0{,}04 + \\delta\\,\\mathit{hist})\\,(\\mathit{comp} - 30)",
            ])),

        ]),
        h("div", { class: "painel" }, [
          UI.botoes({
            compacto: true, rotulo: "δ, inclinação extra com histórico",
            opcoes: [{ valor: 0, rotulo: "sem interação" },
                     { valor: 0.03, rotulo: "interação de 0,03" }],
            valor: est.delta,
            aoMudar: function (v) { est.delta = v; App.montar("17"); },
          }),
          h("div", { estilo: "margin-top:6px" }, UI.slider({
            rotulo: "Comprometimento", min: 10, max: 70, passo: 1, valor: est.comp,
            formato: function (v) { return "termo " + F.dec(est.delta * (v - 30), 3); },
            aoMudar: function (v) { est.comp = v; App.montar("17"); },
          })),
          h("div", { class: "grupo", estilo: "margin-top:10px" }, [
            h("button", { class: "btn", type: "button", onclick: function () {
              est.verTermo = !est.verTermo; App.montar("17");
            } }, est.verTermo ? "Esconder o termo" : "Ver o termo cruzado"),
            h("button", { class: "btn fantasma", type: "button", onclick: ctx.reiniciar },
              "Reiniciar exemplo"),
          ]),
          est.verTermo ? h("p", { class: "nota", estilo: "margin-top:10px" },
            "(comp − 30) × hist = (" + F.dec(est.comp, 0) + " − 30) × hist. " +
            "Para histórico = 0 o termo some. Para histórico = 1 vale " +
            F.dec(est.comp - 30, 0) + ", e multiplicado por " + F.dec(est.delta, 2) +
            " soma " + F.dec(termo, 3) + " ao escore.") : null,
        ]),
        h("div", { class: "painel claro cresce" }, [
          h("h3", { class: "secao", estilo: "margin-bottom:4px" },
            "Em comprometimento de " + F.dec(est.comp, 0) + "%"),
          UI.kv([
            ["inclinações no escore",
             F.dec(bComp, 2) + " e " + F.dec(bComp + est.delta, 2) + " por ponto"],
            ["diferença no escore", F.dec(difEscore, 3)],
            ["diferença em PD", F.ppSinal(difPD, 2)],
          ]),
          h("p", { class: "nota", estilo: "margin-top:6px" },
            "Mesmo sem interação, a diferença em PD varia com o comprometimento: a sigmoide é não linear."),
        ]),
      ]),
    ]));
  },
});
