Aula.slide({
  id: "26",
  bloco: "arvore",
  titulo: "O mesmo aumento de comprometimento pode mudar de folha",
  subtitulo: "As regras da árvore dividem o espaço em regiões de previsão constante",
  conclusao: "Os efeitos dependem do caminho. Dentro de uma folha, a previsão é constante.",
  fonte: Aula.dados.fontes.arvore,
  resumo: "Duas faixas de comprometimento, uma para cada valor de histórico, com as quatro regiões da árvore e os quatro clientes posicionados.",
  notas: {
    conducao: [
      "Mova Bruno de 38 para 41 e compare com Ana ao redor do mesmo limite.",
      "A mudança é de 15% para 40% no ramo com histórico, e de 3% para 11% no ramo sem histórico.",
      "Pergunte se uma mudança pequena de risco verdadeiro deveria produzir esse salto: a descontinuidade é da aproximação do modelo.",
    ],
    cuidados: [
      "Árvores capturam interações porque a pergunta de um ramo depende das decisões anteriores. Isso não dispensa validação.",
      "Uma folha define uma região constante. Ensembles produzem funções mais detalhadas.",
      "O limite de 40% é deste exemplo. Não é política de crédito.",
      "Histórico é categórico: as duas faixas são categorias, não um eixo contínuo.",
    ],
    transicao: "Se continuarmos dividindo o espaço, podemos criar regiões cada vez menores. Quando isso começa a prejudicar?",
  },

  montar: function (corpo, ctx) {
    var D = Aula.dados, A = D.arvore;
    var est = ctx.estado;
    if (!est.cliente) est.cliente = "Bruno";
    if (!est.perfil) est.perfil = D.copia(D.cliente(est.cliente));

    var c = est.perfil;
    var original = D.cliente(est.cliente);
    var simulado = c.comp !== original.comp || c.hist !== original.hist;
    var folha = A.folhaDe(c);

    /* Mapa de regiões: uma faixa por valor de histórico. */
    var g = Graf.novo({ w: 900, h: 420, m: { e: 140, d: 130, c: 40, b: 60 },
      resumo: "Duas faixas de comprometimento, uma por valor de histórico, divididas em 40%." });
    g.x(0, 80).y(0, 2);
    g.eixoX({ ticks: [0, 20, 40, 60, 80], rotulo: "comprometimento em %" });

    var escala = [0, 0.40];
    function tom(pd) {
      var t = Math.min(1, pd / escala[1]);
      return "color-mix(in srgb, var(--arvore) " + (12 + t * 70).toFixed(0) + "%, #ffffff)";
    }

    [1, 0].forEach(function (hist, linhaIdx) {
      var y = 1.5 - linhaIdx;
      var nos = [A.raiz.esq, A.raiz.dir][hist];
      [nos.esq, nos.dir].forEach(function (f, k) {
        var x0 = k === 0 ? 0 : 40, x1 = k === 0 ? 40 : 80;
        g.retangulo(x0, y - 0.34, x1, y + 0.34,
          { cor: tom(f.pd), borda: "var(--rule)", bordaL: 1.5 });
        g.texto((x0 + x1) / 2, y, F.pct(f.pd, f.pd * 100 % 1 === 0 ? 0 : 1),
          { ancora: "middle", dy: 4, tamanho: 26, cor: "var(--ink)" });
        g.texto((x0 + x1) / 2, y - 0.2, "n = " + F.inteiro(f.n) + " · eventos " + F.inteiro(f.d),
          { ancora: "middle", dy: 4, tamanho: 16, peso: 400, cor: "var(--muted)" });
      });
      g.add(sv("text", { x: g.m.e - 16, y: g.py(y) + 8, "text-anchor": "end", "font-size": 21,
        "font-weight": 700, fill: "var(--ink)",
        texto: hist ? "histórico = 1" : "histórico = 0" }));
    });
    g.add(sv("line", { x1: g.px(40), x2: g.px(40), y1: g.py(0.1), y2: g.py(1.95),
      stroke: "var(--amber)", "stroke-width": 2, "stroke-dasharray": "6 4" }));
    g.texto(40, 1.95, "corte em 40%", { dx: 6, dy: -6, tamanho: 17, peso: 400, cor: "var(--amber)" });

    D.clientes.forEach(function (cl) {
      var y = cl.hist ? 1.5 : 0.5;
      var selecionado = cl.nome === est.cliente;
      if (selecionado) return;
      g.ponto(cl.comp, y - 0.44, { r: 6, cor: "var(--muted)", bordaL: 1.5 });
      g.texto(cl.comp, y - 0.44, cl.nome,
        { ancora: "middle", dy: 22, tamanho: 16, peso: 400, cor: "var(--muted)" });
    });
    var yc = c.hist ? 1.5 : 0.5;
    g.ponto(c.comp, yc - 0.44, { r: 10, cor: "var(--arvore)" });
    g.texto(c.comp, yc - 0.44, est.cliente + (simulado ? " (simulação)" : ""),
      { ancora: "middle", dy: 26, tamanho: 18, cor: "var(--ink)" });

    var arvore = Comum.arvoreDidatica({
      cliente: c, mostrarNumeros: false, mostrarPd: true,
      w: 460, h: 218, caixaW: 148, caixaH: 42,
      rotuloFolha: function () { return "folha"; },
    });

    corpo.appendChild(h("div", { class: "linha cresce" }, [
      h("div", { class: "painel claro cresce centro" }, g.svg),
      h("div", { class: "coluna", estilo: "flex:0 0 490px" }, [
        h("div", { class: "painel claro centro" }, arvore),
        h("div", { class: "painel" }, [
          h("div", { estilo: "display:flex;justify-content:space-between;align-items:baseline;gap:10px" }, [
            h("span", { class: "apoio" }, "Cliente"),
            simulado ? Comum.seloSimulacao("simulação local") : UI.selo("perfil original", "neutro"),
          ]),
          Comum.seletorCliente(est.cliente, function (v) {
            est.cliente = v; est.perfil = D.copia(D.cliente(v)); App.montar("26");
          }, { compacto: true }),
          h("div", { estilo: "margin-top:6px" }, UI.slider({
            rotulo: "Comprometimento", min: 0, max: 80, passo: 1, valor: c.comp,
            formato: function (v) {
              var t = D.copia(c); t.comp = v;
              return "PD " + F.pct(A.folhaDe(t).pd, 1);
            },
            aoMudar: function (v) { c.comp = v; App.montar("26"); },
          })),
          h("div", { class: "grupo", estilo: "margin-top:8px" }, [
            UI.botoes({
              compacto: true, rotulo: "histórico",
              opcoes: [{ valor: 0, rotulo: "histórico = 0" }, { valor: 1, rotulo: "histórico = 1" }],
              valor: c.hist,
              aoMudar: function (v) { c.hist = v; App.montar("26"); },
            }),
            h("button", { class: "btn min", type: "button", disabled: !simulado,
              onclick: function () {
                est.perfil = D.copia(D.cliente(est.cliente)); App.montar("26");
              } }, "Perfil original"),
            h("button", { class: "btn min fantasma", type: "button", onclick: ctx.reiniciar },
              "Reiniciar exemplo"),
          ]),
        ]),
        h("div", { class: "painel cor" }, [
          h("p", { estilo: "font-size:22px;color:var(--ink);margin:0" },
            "Regra atual: " + folha.regra + ", PD " +
            F.pct(folha.pd, folha.pd * 100 % 1 === 0 ? 0 : 1) + "."),
          h("p", { class: "nota", estilo: "margin-top:6px" },
            "Em comprometimento exatamente igual a 40, o cliente segue pelo ramo até 40."),
        ]),
      ]),
    ]));
  },
});
