Aula.slide({
  id: "38",
  bloco: "boosting",
  titulo: "Uma correção pode depender de uma característica ou da combinação de várias",
  subtitulo: "Profundidade de cada árvore no experimento auxiliar de duas variáveis",
  conclusao: "Muitas regras simples somadas não são sempre equivalentes a regras que combinam condições.",
  fonte: Aula.dados.fontes.auxiliar,
  resumo: "Superfícies de PD prevista para boosting com profundidade 1, 2 e 3, na mesma escala e no mesmo domínio.",
  notas: {
    conducao: [
      "Mostre a combinação de comprometimento alto com utilização alta e pergunte que regra a descreve.",
      "Compare a representação por uma única condição e por duas condições.",
      "Revele que árvores mais profundas capturam estruturas mais complexas, e que cada passo também pode ajustar mais ruído.",
    ],
    cuidados: [
      "Profundidade máxima não é contagem universal e exata da ordem de interações. Profundidade 2 permite caminhos com duas condições, e implementações e repetição de variável importam.",
      "A soma de stumps é aditiva no escore F. A transformação logística pode induzir não aditividade na escala da probabilidade. Não diga que stumps não produzem interação na PD.",
      "Este experimento auxiliar não fala sobre o desempenho na base de crédito principal.",
    ],
    transicao: "Temos vários controles de complexidade. O acompanhamento da validação ajuda a decidir quando interromper a construção.",
  },

  montar: function (corpo, ctx) {
    var R = Aula.resultados;
    var est = ctx.estado;
    if (!R) {
      corpo.appendChild(h("p", { class: "resposta erro" },
        "Resultados do experimento não disponíveis: execute experimento/experimento.py e recompile."));
      return;
    }
    if (est.prof === undefined) est.prof = 1;
    if (est.comp === undefined) est.comp = 65;
    if (est.util === undefined) est.util = 80;

    var chaves = ["1", "2", "3"];
    function pdNaMalha(malha, comp, util) {
      var i = 0, j = 0, melhorI = 1e9, melhorJ = 1e9;
      malha.comp.forEach(function (v, k) {
        if (Math.abs(v - comp) < melhorI) { melhorI = Math.abs(v - comp); i = k; }
      });
      malha.util.forEach(function (v, k) {
        if (Math.abs(v - util) < melhorJ) { melhorJ = Math.abs(v - util); j = k; }
      });
      return malha.pd[j * malha.comp.length + i];
    }

    var paineis = chaves.map(function (k) {
      var b = R.auxiliar_2d.boosting[k];
      var sel = String(est.prof) === k;
      var gm = Comum.mapaCalor(b.malha, { w: 280, h: 288, max: 0.6,
        resumo: "Superfície de PD para boosting com profundidade " + k });
      gm.ponto(est.comp, est.util, { r: 9, cor: "var(--ink)", borda: "#fff", bordaL: 2 });
      return h("div", {
        class: "painel" + (sel ? " cor" : " claro") + " cresce centro",
        estilo: sel ? "border-color:var(--boost);border-width:2px" : "",
      }, [
        h("h3", { class: "secao", estilo: "margin:0 0 4px" }, "profundidade " + k),
        gm.svg,
        h("p", { class: "nota", estilo: "margin:0;text-align:center" },
          "PD no ponto: " + F.pct(pdNaMalha(b.malha, est.comp, est.util), 2) +
          " · validação " + F.dec(b.perda_validacao, 4)),
      ]);
    });

    var pdAtual = pdNaMalha(R.auxiliar_2d.boosting[String(est.prof)].malha, est.comp, est.util);

    corpo.appendChild(h("div", { class: "linha cresce" }, [
      h("div", { class: "coluna cresce" }, [
        h("div", { estilo: "display:flex;flex-wrap:wrap;justify-content:space-between;align-items:baseline;gap:10px" }, [
          h("h3", { class: "secao", estilo: "margin:0" },
            "Mesma escala e mesmo domínio nos três painéis"),
          UI.selo("experimento auxiliar de duas variáveis", "sim"),
        ]),
        h("div", { class: "g3 cresce" }, paineis),
        h("div", { estilo: "display:flex;gap:16px;align-items:center;flex-wrap:wrap" }, [
          h("span", { class: "nota" }, "escala de PD prevista"),
          Comum.legendaCor(0.6, { w: 260 }),
          h("span", { class: "nota", estilo: "flex:1 1 380px" },
            "A regra do canto alto e alto: se comprometimento acima de 40% e utilização acima " +
            "de 50%, o risco sobe mais do que a soma dos dois efeitos isolados. " +
            "Taxa 0,1 e 150 árvores nos três painéis; muda apenas a profundidade."),
        ]),
      ]),
      h("div", { class: "coluna", estilo: "flex:0 0 470px" }, [
        h("div", { class: "painel cor", estilo: "padding:10px 16px" }, [
          h("p", { estilo: "font-size:21px;color:var(--ink);margin:0 0 6px" },
            "Cliente sintético: comprometimento " + F.dec(est.comp, 0) + "%, utilização " +
            F.dec(est.util, 0) + "%, PD " + F.pct(pdAtual, 2) +
            " na profundidade " + est.prof + "."),
          h("div", { class: "grupo" }, [
            h("button", { class: "btn min", type: "button", onclick: function () {
              est.comp = 65; est.util = 80; App.montar("38");
            } }, "Alto e alto"),
            h("button", { class: "btn min", type: "button", onclick: function () {
              est.comp = 65; est.util = 20; App.montar("38");
            } }, "Alto e baixo"),
            h("button", { class: "btn min", type: "button", onclick: function () {
              est.comp = 20; est.util = 80; App.montar("38");
            } }, "Baixo e alto"),
            h("button", { class: "btn min", type: "button", onclick: function () {
              est.comp = 20; est.util = 20; App.montar("38");
            } }, "Baixo e baixo"),
          ]),
        ]),
        h("div", { class: "painel" }, [
          UI.slider({
            rotulo: "Comprometimento", min: 5, max: 80, passo: 1, valor: est.comp,
            formato: function (v) { return v + "%"; },
            aoMudar: function (v) { est.comp = v; App.montar("38"); },
          }),
          h("div", { estilo: "margin-top:6px" }, UI.slider({
            rotulo: "Utilização", min: 0, max: 100, passo: 1, valor: est.util,
            formato: function (v) { return v + "%"; },
            aoMudar: function (v) { est.util = v; App.montar("38"); },
          })),
          h("div", { class: "grupo", estilo: "margin-top:8px" }, [
            UI.botoes({
              compacto: true, rotulo: "profundidade",
              opcoes: chaves.map(function (k) {
                return { valor: Number(k), rotulo: "profundidade " + k };
              }),
              valor: est.prof,
              aoMudar: function (v) { est.prof = v; App.montar("38"); },
            }),
            h("button", { class: "btn min fantasma", type: "button", onclick: ctx.reiniciar },
              "Reiniciar exemplo"),
          ]),
        ]),
      ]),
    ]));
  },
});
