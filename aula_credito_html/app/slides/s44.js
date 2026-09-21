Aula.slide({
  id: "44",
  bloco: "decisao",
  titulo: "Quem aparece primeiro na fila de risco?",
  subtitulo: "AUC contada por pares e curvas do experimento sintético",
  conclusao: "Um modelo pode ordenar bem mesmo que suas probabilidades estejam na escala errada.",
  fonte: "Microexemplo de ranking e experimento sintético, em abas identificadas",
  resumo: "Seis registros ordenados por escore com comparação de pares, e curvas ROC e acumuladas do KS.",
  notas: {
    conducao: [
      "Comece pelo par, não pela integral.",
      "Pergunte se o escore 0,8 significa 80% de PD calibrada. Neste exemplo não há essa evidência.",
      "Revele as curvas como resumo da ordenação e diferencie taxa de falsos positivos de inadimplência entre aprovados.",
    ],
    respostas: [
      "São 9 pares, 7 corretamente ordenados: AUC igual a 7 dividido por 9, aproximadamente 0,7778.",
      "Empates contam meio par.",
      "Mudar o corte não muda a AUC: ela percorre todos os cortes.",
    ],
    cuidados: [
      "Orientação declarada: escore maior significa maior risco.",
      "AUC por pares não é acurácia, taxa de acerto de aprovados nem rentabilidade.",
      "KS e AUC resumem aspectos diferentes: um não determina o outro.",
      "Diferenças pequenas entre modelos podem exigir avaliação de incerteza.",
    ],
    transicao: "Mesmo que o ranking esteja certo, precisamos perguntar se uma previsão de 10% corresponde a cerca de 10% de eventos.",
  },
  impressao: function (e) { e.aba = "modelos"; e.contados = true; },

  montar: function (corpo, ctx) {
    var R = Aula.resultados;
    var est = ctx.estado;
    if (!est.aba) est.aba = "pares";
    if (est.sel === undefined) est.sel = null;

    var inadimplentes = [0.8, 0.6, 0.4];
    var adimplentes = [0.7, 0.3, 0.2];
    var escores = inadimplentes.concat(adimplentes);
    var ys = [1, 1, 1, 0, 0, 0];
    var auc = M.aucPares(escores, ys);

    function abaPares() {
      var g = Graf.novo({ w: 700, h: 430, m: { e: 182, d: 130, c: 30, b: 58 } });
      g.x(0, 1).y(0, 2);
      g.eixoX({ ticks: [0, 0.2, 0.4, 0.6, 0.8, 1], rotulo: "escore de risco",
                formato: function (v) { return F.dec(v, 1); } });
      var linhas = [
        { y: 1.35, lista: inadimplentes, rotulo: "inadimplentes", cor: "var(--alert)" },
        { y: 0.55, lista: adimplentes, rotulo: "adimplentes", cor: "var(--ok)" },
      ];
      if (est.sel !== null) {
        adimplentes.forEach(function (a) {
          var ok = inadimplentes[est.sel] > a;
          g.add(sv("line", { x1: g.px(inadimplentes[est.sel]), y1: g.py(1.35),
            x2: g.px(a), y2: g.py(0.55),
            stroke: ok ? "var(--ok)" : "var(--alert)", "stroke-width": 3,
            "stroke-dasharray": ok ? null : "6 4" }));
        });
      }
      linhas.forEach(function (l) {
        g.add(sv("text", { x: g.m.e - 16, y: g.py(l.y) + 7, "text-anchor": "end",
          "font-size": 20, "font-weight": 700, fill: l.cor, texto: l.rotulo }));
        l.lista.forEach(function (v, i) {
          var sel = l.cor === "var(--alert)" && est.sel === i;
          g.ponto(v, l.y, { r: sel ? 13 : 10, cor: l.cor });
          g.texto(v, l.y, F.dec(v, 1), { ancora: "middle", dy: -18, tamanho: 18,
                                         cor: "var(--ink)" });
        });
      });
      var acertos = est.sel === null ? null
        : adimplentes.filter(function (a) { return inadimplentes[est.sel] > a; }).length;
      return h("div", { class: "painel claro cresce centro" }, [
        h("h3", { class: "secao" }, "Seis registros com desfecho conhecido"),
        g.svg,
        h("p", { class: "apoio", estilo: "margin:0" },
          est.sel === null
            ? "Selecione um inadimplente para comparar com os três adimplentes."
            : ("O inadimplente de escore " + F.dec(inadimplentes[est.sel], 1) +
               " está acima de " + acertos + " dos três adimplentes.")),
      ]);
    }

    function abaModelos() {
      if (!R) {
        return h("p", { class: "resposta erro" },
          "Resultados do experimento não disponíveis: execute experimento/experimento.py.");
      }
      if (!est.modelo) est.modelo = "boosting";
      var aval = R.avaliacao[est.modelo];
      var roc = aval.roc_teste;
      var ks = aval.ks_teste;

      var gr = Graf.novo({ w: 480, h: 400, m: { e: 78, d: 26, c: 22, b: 58 } });
      gr.x(0, 1).y(0, 1);
      gr.grade({ x: [0.25, 0.5, 0.75], y: [0.25, 0.5, 0.75] });
      gr.eixoY({ ticks: [0, 0.5, 1], formato: function (v) { return F.pct(v, 0); },
                 rotulo: "taxa de verdadeiros positivos" });
      gr.eixoX({ ticks: [0, 0.5, 1], formato: function (v) { return F.pct(v, 0); },
                 rotulo: "taxa de falsos positivos" });
      gr.linha([[0, 0], [1, 1]], { cor: "var(--rule)", largura: 2, tracejado: "6 5" });
      gr.linha(roc.fpr.map(function (v, i) { return [v, roc.tpr[i]]; }),
        { cor: "var(--amber)", largura: 3 });
      gr.texto(0.55, 0.35, "AUC " + F.dec(aval.teste.auc, 4),
        { tamanho: 24, cor: "var(--ink)" });

      var gk = Graf.novo({ w: 480, h: 400, m: { e: 78, d: 26, c: 22, b: 58 } });
      gk.x(0, 1).y(0, 1);
      gk.grade({ y: [0.25, 0.5, 0.75] });
      gk.eixoY({ ticks: [0, 0.5, 1], formato: function (v) { return F.pct(v, 0); },
                 rotulo: "proporção acumulada" });
      gk.eixoX({ ticks: [0, 0.25, 0.5], formato: function (v) { return F.pct(v, 0); },
                 rotulo: "PD prevista" });
      var lim = Math.max.apply(null, ks.limites);
      gk.x(0, Math.min(0.6, lim));
      gk.linha(ks.limites.map(function (t, i) { return [t, ks.acum_adimplentes[i]]; }),
        { cor: "var(--ok)", largura: 3 });
      gk.linha(ks.limites.map(function (t, i) { return [t, ks.acum_inadimplentes[i]]; }),
        { cor: "var(--alert)", largura: 3 });
      var iMax = 0;
      ks.limites.forEach(function (t, i) {
        if (ks.acum_adimplentes[i] - ks.acum_inadimplentes[i] >
            ks.acum_adimplentes[iMax] - ks.acum_inadimplentes[iMax]) iMax = i;
      });
      gk.add(sv("line", { x1: gk.px(ks.limites[iMax]), x2: gk.px(ks.limites[iMax]),
        y1: gk.py(ks.acum_inadimplentes[iMax]), y2: gk.py(ks.acum_adimplentes[iMax]),
        stroke: "var(--ink)", "stroke-width": 3 }));
      gk.texto(ks.limites[iMax], ks.acum_adimplentes[iMax], "KS " + F.dec(ks.ks, 4),
        { dx: 10, dy: -10, tamanho: 22, cor: "var(--ink)" });
      gk.texto(gk.dx[1], 0.35, "inadimplentes",
        { ancora: "end", tamanho: 17, peso: 400, cor: "var(--alert)" });
      gk.texto(gk.dx[1], 0.88, "adimplentes",
        { ancora: "end", tamanho: 17, peso: 400, cor: "var(--ok)" });

      return h("div", { class: "linha cresce" }, [
        h("div", { class: "painel claro cresce centro" }, [
          h("h3", { class: "secao" }, "Curva ROC no teste"), gr.svg]),
        h("div", { class: "painel claro cresce centro" }, [
          h("h3", { class: "secao" }, "Acumuladas e distância do KS"), gk.svg]),
      ]);
    }

    var tabelaPares = UI.tabela({
      compacta: true,
      colunas: [{ rotulo: "Inadimplente" }, { rotulo: "0,7" }, { rotulo: "0,3" }, { rotulo: "0,2" }],
      linhas: inadimplentes.map(function (p) {
        return [F.dec(p, 1)].concat(adimplentes.map(function (a) {
          return p > a ? "acima" : p === a ? "empate" : "abaixo";
        }));
      }),
      selecionada: est.sel,
      legenda: "Comparação dos nove pares",
    });

    corpo.appendChild(h("div", { class: "linha", estilo: "align-items:center" }, [
      UI.botoes({
        rotulo: "visão",
        opcoes: [{ valor: "pares", rotulo: "Microexemplo de pares" },
                 { valor: "modelos", rotulo: "Curvas do experimento" }],
        valor: est.aba,
        aoMudar: function (v) { est.aba = v; App.montar("44"); },
      }),
      est.aba === "modelos" && R
        ? h("div", { class: "grupo", estilo: "margin-left:auto;align-items:center" }, [
            h("span", { class: "apoio" }, "modelo"),
            UI.botoes({
              compacto: true, rotulo: "modelo",
              opcoes: ["logit", "arvore", "boosting"].map(function (k) {
                return { valor: k, rotulo: Aula.dados.modelos[k].curto };
              }),
              valor: est.modelo || "boosting",
              aoMudar: function (v) { est.modelo = v; App.montar("44"); },
            }),
            h("span", { class: "nota" },
              "teste, " + F.inteiro(R.avaliacao.logit.teste.n) + " contratos de fev a jul de 2024"),
          ])
        : h("span", { class: "nota", estilo: "margin-left:auto" },
            "Escores de ranking, sem alegação de calibração"),
    ]));

    if (est.aba === "pares") {
      corpo.appendChild(h("div", { class: "linha cresce" }, [
        abaPares(),
        h("div", { class: "coluna", estilo: "flex:0 0 520px" }, [
          h("div", { class: "painel claro" }, tabelaPares),
          h("div", { class: "painel cor" }, [
            h("h3", { class: "secao" }, "AUC por contagem de pares"),
            h("p", { estilo: "font-size:26px;color:var(--ink);margin:0" },
              est.contados
                ? Mat.i("\\text{AUC} = 7/9 = " + Mat.n(auc, 4))
                : "9 pares possíveis. Quantos estão na ordem certa?"),
            h("p", { class: "formula peq", estilo: "background:none;border:none;padding:0;margin:6px 0 0;font-size:16px" },
              Mat.b("\\text{AUC} = \\Pr\\bigl(s_+ > s_-\\bigr) + \\tfrac{1}{2}\\Pr\\bigl(s_+ = s_-\\bigr)")),
            h("p", { class: "nota", estilo: "margin-top:4px" }, [
              Mat.i("s_+"), " é o escore de um inadimplente sorteado e ", Mat.i("s_-"),
              " o de um adimplente. Empate conta meio par; aqui não há empates.",
            ]),
          ]),
          h("div", { class: "painel" }, [
            h("div", { class: "grupo" }, [
              UI.botoes({
                compacto: true, rotulo: "inadimplente selecionado",
                opcoes: inadimplentes.map(function (p, i) {
                  return { valor: i, rotulo: "escore " + F.dec(p, 1) };
                }),
                valor: est.sel,
                aoMudar: function (v) { est.sel = est.sel === v ? null : v; App.montar("44"); },
              }),
              h("button", { class: "btn min", type: "button", onclick: function () {
                est.contados = true; App.montar("44");
              } }, "Contar todos"),
              h("button", { class: "btn min fantasma", type: "button", onclick: ctx.reiniciar },
                "Reiniciar exemplo"),
            ]),
            h("p", { class: "nota", estilo: "margin-top:10px" },
              "O escore 0,8 não significa 80% de PD: aqui não há evidência de calibração, " +
              "apenas de ordenação."),
          ]),
        ]),
      ]));
    } else {
      corpo.appendChild(abaModelos());
      if (R) {
        var aval = R.avaliacao[est.modelo || "boosting"];
        corpo.appendChild(h("div", { class: "painel cor",
          estilo: "display:flex;gap:30px;flex-wrap:wrap;align-items:baseline" }, [
          h("span", { class: "medio" }, "AUC " + F.dec(aval.teste.auc, 4)),
          h("span", { class: "medio" }, "KS " + F.dec(aval.teste.ks, 4)),
          h("span", { class: "apoio" },
            "n = " + F.inteiro(aval.teste.n) + " contratos, " +
            F.inteiro(aval.teste.eventos) + " eventos"),
          h("span", { class: "nota" },
            "Mudar o corte não altera a AUC. A taxa de falsos positivos do eixo não é a " +
            "inadimplência da carteira aprovada."),
        ]));
      }
    }
  },
});
