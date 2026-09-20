Aula.slide({
  id: "11",
  bloco: "logit",
  titulo: "Mais 10 pontos de comprometimento multiplicam as odds por 1,49",
  subtitulo: "O mesmo multiplicador de odds gera mudanças diferentes de PD",
  conclusao: "Uma mudança na variável multiplica as odds. A mudança de PD depende do ponto de partida.",
  fonte: Aula.dados.fontes.manual,
  resumo: "Faixa de cálculo do multiplicador de odds e três pares de barras antes e depois para PDs iniciais de 2%, 10% e 40%.",
  notas: {
    conducao: [
      "Peça que os alunos antecipem a PD quando as odds dobram, começando pelo cenário de 10%.",
      "Revele primeiro 10%, depois 2% e 40%.",
      "Explique que a leitura vale mantidas as outras variáveis do modelo.",
    ],
    respostas: [
      "Com odds multiplicadas por 2: 2% vira aproximadamente 3,92%; 10% vira 18,18%; 40% vira 57,14%.",
      "Com mais 10 pontos de comprometimento, o multiplicador é e elevado a 0,40, aproximadamente 1,4918.",
    ],
    cuidados: [
      "Razão de chances de 1,49 não significa que o risco aumenta 49%.",
      "Para uma mudança finita use a conversão exata, não o efeito marginal local.",
      "A leitura é associativa e condicionada às demais variáveis. Não é efeito causal.",
      "Os três riscos iniciais são cenários didáticos. Não são os quatro clientes.",
    ],
    transicao: "Vamos aplicar essa interpretação a um cliente completo e conferir todas as etapas da conta.",
  },

  montar: function (corpo, ctx) {
    var L = Aula.dados.logit;
    var est = ctx.estado;
    if (est.delta === undefined) est.delta = 10;
    if (!est.modo) est.modo = "comp";

    var beta = L.termos.filter(function (t) { return t.campo === "comp"; })[0].beta;
    var dz = est.modo === "odds2" ? Math.log(2) : beta * est.delta;
    var razao = Math.exp(dz);
    var cenarios = [0.02, 0.10, 0.40];

    var conta = est.modo === "odds2"
      ? ["odds × 2", "Δz = ln(2) = " + F.dec(dz, 4),
         "razão de chances = 2"]
      : ["Δcomp = " + F.sinal(est.delta, 0) + " p.p.",
         "Δz = " + F.dec(beta, 2) + " × " + F.dec(est.delta, 0) + " = " + F.dec(dz, 4),
         "razão de chances = e^" + F.dec(dz, 2) + " ≈ " + F.dec(razao, 4)];

    var gBarras = Graf.novo({ w: 890, h: 430, m: { e: 100, d: 200, c: 30, b: 60 } });
    var maxP = Math.max.apply(null, cenarios.map(function (p) {
      return Math.max(p, M.porRazaoDeOdds(p, razao));
    }));
    var topo = Math.min(1, Math.max(0.6, Math.ceil(maxP * 10) / 10));
    gBarras.x(0, topo).y(0, cenarios.length);
    var ticks = Graf.ticks(0, topo, 6);
    gBarras.grade({ x: ticks });
    gBarras.eixoX({ ticks: ticks, formato: function (v) { return F.pct(v, 0); },
                    rotulo: "probabilidade de inadimplência" });
    var alt = (gBarras.altura / cenarios.length) * 0.24;
    cenarios.forEach(function (p, i) {
      var novo = M.porRazaoDeOdds(p, razao);
      var yc = gBarras.py(cenarios.length - i - 0.5);
      [[p, "antes", "var(--rule)", -1], [novo, "depois", "var(--logit)", 1]].forEach(function (par) {
        var y = yc + par[3] * alt * 0.62;
        gBarras.add(sv("rect", { x: gBarras.px(0), y: y - alt / 2,
          width: Math.max(2, gBarras.px(par[0]) - gBarras.px(0)), height: alt,
          fill: par[2], rx: 2 }));
        gBarras.add(sv("text", { x: gBarras.px(par[0]) + 10, y: y + 7, "font-size": 19,
          "font-weight": 700, fill: "var(--ink)", texto: F.pct(par[0], 2) + "  " + par[1] }));
      });
      gBarras.add(sv("text", { x: gBarras.m.e - 14, y: yc - 2, "text-anchor": "end",
        "font-size": 21, "font-weight": 700, fill: "var(--ink)",
        texto: "PD inicial " + F.pct(p, 0) }));
      gBarras.add(sv("text", { x: gBarras.m.e - 14, y: yc + 22, "text-anchor": "end",
        "font-size": 18, fill: "var(--muted)",
        texto: F.ppSinal(novo - p, 2) }));
    });

    var tabela = UI.tabela({
      compacta: true,
      colunas: [{ rotulo: "PD inicial" }, { rotulo: "Odds antes" }, { rotulo: "Odds depois" },
                { rotulo: "PD depois" }, { rotulo: "Diferença", unidade: "p.p." }],
      linhas: cenarios.map(function (p) {
        var novo = M.porRazaoDeOdds(p, razao);
        return [F.pct(p, 0), F.dec(M.odds(p), 4), F.dec(M.odds(p) * razao, 4),
                F.pct(novo, 2), F.ppSinal(novo - p, 2)];
      }),
      legenda: "Conversão exata de odds para probabilidade em três pontos de partida",
    });

    corpo.appendChild(h("div", { class: "linha cresce" }, [
      h("div", { class: "coluna cresce" }, [
        h("div", { class: "painel cor", estilo: "display:flex;gap:26px;flex-wrap:wrap" },
          conta.map(function (t) {
            return h("span", { estilo: "font-family:var(--serif);font-size:26px;color:var(--ink)" }, t);
          })),
        h("div", { class: "painel claro cresce centro", estilo: "display:flex" }, gBarras.svg),
      ]),
      h("div", { class: "coluna", estilo: "flex:0 0 512px" }, [
        h("div", { class: "painel" }, [
          h("h3", { class: "secao" }, "Mudança aplicada"),
          UI.botoes({
            vertical: true,
            opcoes: [
              { valor: "mais1", rotulo: "+1 p.p. de comprometimento" },
              { valor: "comp", rotulo: "+10 p.p. de comprometimento" },
              { valor: "odds2", rotulo: "Odds multiplicadas por 2" },
            ],
            valor: est.modo === "comp" && est.delta !== 10 ? null : est.modo,
            aoMudar: function (v) {
              est.modo = v === "mais1" ? "comp" : v;
              if (v === "mais1") est.delta = 1;
              if (v === "comp") est.delta = 10;
              App.montar("11");
            },
          }),
          h("div", { estilo: "margin-top:12px" }, UI.slider({
            rotulo: "Exploração: variação de comprometimento", min: -20, max: 20, passo: 1,
            valor: est.delta,
            formato: function (v) { return "razão " + F.dec(Math.exp(beta * v), 4); },
            aoMudar: function (v) { est.delta = v; est.modo = "comp"; App.montar("11"); },
          })),
          h("button", { class: "btn fantasma", estilo: "margin-top:10px", type: "button",
            onclick: ctx.reiniciar }, "Reiniciar exemplo"),
        ]),
        h("div", { class: "painel claro" }, tabela),
        h("p", { class: "nota" },
          "Razão de chances de " + F.dec(razao, 2) + " não significa risco " +
          F.dec((razao - 1) * 100, 0) + "% maior. Odds e probabilidade são escalas diferentes."),
      ]),
    ]));
  },
});
