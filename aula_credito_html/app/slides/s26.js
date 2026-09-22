Aula.slide({
  id: "26",
  bloco: "arvore",
  titulo: "O mesmo aumento de comprometimento pode mudar de folha",
  subtitulo: "As regras da árvore dividem o espaço em regiões de previsão constante",
  conclusao: "Os efeitos dependem do caminho. Dentro de uma folha, a previsão é constante.",
  fonte: Aula.dados.fontes.arvore,
  resumo: "Duas faixas de comprometimento, uma para cada valor de histórico, com as quatro regiões da árvore, os quatro clientes posicionados e a curva do logit sobreponível.",
  notas: {
    conducao: [
      "Mova Bruno de 38 para 41 e compare com Ana ao redor do mesmo limite.",
      "Depois clique em Sobrepor o logit. É a única tela da aula em que degrau e curva aparecem nos mesmos eixos. Pergunte qual das duas descreve melhor um cliente em 41%, e aceite que a tela não decide.",
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
    var L = D.logit;
    if (est.curva === undefined) est.curva = false;
    var original = D.cliente(est.cliente);
    var simulado = c.comp !== original.comp || c.hist !== original.hist;
    var folha = A.folhaDe(c);

    /* Mapa de regiões: uma faixa por valor de histórico. */
    var g = Graf.novo({ w: 870, h: 420, m: { e: 176, d: 118, c: 40, b: 60 },
      resumo: "Duas faixas de comprometimento, uma por valor de histórico, divididas em 40%." });
    /* O domínio começa abaixo de zero para os nomes dos clientes, sob as faixas, não caírem
       sobre os números do eixo. */
    g.x(0, 80).y(-0.3, 2);
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

    /* A comparação que o capítulo 5 pede e a aula nunca mostrou: a mesma abscissa, a árvore em
       degraus e a curva do logit manual, nos mesmos eixos de PD. É a única tela da aula em que
       as duas famílias aparecem juntas. Substitui o mapa de regiões enquanto está ligada. */
    var gc = null;
    if (est.curva) {
      gc = Graf.novo({ w: 870, h: 330, m: { e: 92, d: 152, c: 24, b: 58 },
        resumo: "PD por comprometimento: a árvore em degraus e a curva do logit, por valor de histórico." });
      gc.x(0, 80).y(0, 0.45);
      gc.grade({ y: [0, 0.15, 0.30, 0.45] });
      gc.eixoY({ ticks: [0, 0.15, 0.30, 0.45], formato: function (v) { return F.pct(v, 0); },
                 rotulo: "PD" });
      gc.eixoX({ ticks: [0, 20, 40, 60, 80], rotulo: "comprometimento em %" });
      gc.add(sv("line", { x1: gc.px(40), x2: gc.px(40), y1: gc.py(0), y2: gc.py(0.45),
        stroke: "var(--amber)", "stroke-width": 2, "stroke-dasharray": "6 4" }));
      gc.texto(40, 0.45, "corte em 40%",
        { dx: 6, dy: -6, tamanho: 17, peso: 400, cor: "var(--amber)" });
      [0, 1].forEach(function (hist) {
        var nos = [A.raiz.esq, A.raiz.dir][hist];
        var traco = hist ? null : "7 5";
        gc.linha([[0, nos.esq.pd], [40, nos.esq.pd]],
          { cor: "var(--arvore)", largura: 3.4, tracejado: traco });
        gc.linha([[40, nos.esq.pd], [40, nos.dir.pd]],
          { cor: "var(--arvore)", largura: 3.4, tracejado: traco });
        gc.linha([[40, nos.dir.pd], [80, nos.dir.pd]],
          { cor: "var(--arvore)", largura: 3.4, tracejado: traco });
        var perfil = D.copia(L.referencia);
        perfil.hist = hist;
        gc.linha(M.linspace(0, 80, 81).map(function (v) {
          perfil.comp = v; return [v, L.pd(perfil)];
        }), { cor: "var(--logit)", largura: 2.8, tracejado: traco });
        gc.texto(80, nos.dir.pd, "árvore, hist " + hist,
          { dx: 10, dy: 4, tamanho: 16, peso: 400, cor: "var(--arvore)" });
        perfil.comp = 80;
        gc.texto(80, L.pd(perfil), "logit, hist " + hist,
          { dx: 10, dy: 4, tamanho: 16, peso: 400, cor: "var(--logit)" });
      });
      D.clientes.forEach(function (cl) {
        var pdc = A.folhaDe(cl).pd;
        gc.ponto(cl.comp, pdc, { r: cl.nome === est.cliente ? 9 : 6,
          cor: cl.nome === est.cliente ? "var(--arvore)" : "var(--muted)", bordaL: 1.5 });
        gc.texto(cl.comp, pdc, cl.nome,
          { ancora: "middle", dy: cl.nome === "Carla" ? 26 : -14, tamanho: 16,
            peso: cl.nome === est.cliente ? 700 : 400,
            cor: cl.nome === est.cliente ? "var(--ink)" : "var(--muted)" });
      });
    }

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
      w: 518, h: 276, caixaW: 112, caixaH: 56,
      rotuloFolha: function () { return "folha"; },
      /* Caixa estreita: a pergunta aparece na forma curta usada nas fórmulas. */
      rotuloPergunta: function (no) {
        return no.pergunta.indexOf("atraso") >= 0 ? "histórico?" : "comp > 40%?";
      },
      rotuloRamo: function (no, esq) {
        if (no.pergunta.indexOf("atraso") >= 0) return esq ? "hist = 0" : "hist = 1";
        return esq ? "≤ 40%" : "> 40%";
      },
    });

    corpo.appendChild(h("div", { class: "linha cresce" }, [
      h("div", { class: "painel claro cresce centro" }, est.curva ? gc.svg : g.svg),
      h("div", { class: "coluna", estilo: "flex:0 0 560px" }, [
        h("div", { class: "painel claro centro", estilo: "padding:8px 14px" }, arvore),
        h("div", { class: "painel", estilo: "padding:10px 16px" }, [
          h("div", { estilo: "display:flex;flex-wrap:wrap;justify-content:space-between;align-items:baseline;gap:10px" }, [
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
            h("button", { class: "btn min" + (est.curva ? " sel" : ""), type: "button",
              "aria-pressed": est.curva ? "true" : "false",
              onclick: function () { est.curva = !est.curva; App.montar("26"); } },
              est.curva ? "Ver o mapa de regiões" : "Comparar com o logit"),
            h("button", { class: "btn min fantasma", type: "button", onclick: ctx.reiniciar },
              "Reiniciar exemplo"),
          ]),
        ]),
        h("div", { class: "painel cor", estilo: "padding:10px 16px" }, [
          h("p", { estilo: "font-size:22px;color:var(--ink);margin:0" },
            "Regra atual: " + folha.regra + ", PD " +
            F.pct(folha.pd, folha.pd * 100 % 1 === 0 ? 0 : 1) + "."),
          h("p", { class: "nota", estilo: "margin-top:6px" },
            "Em comprometimento exatamente igual a 40, o cliente segue pelo ramo até 40."),
          est.curva
            ? h("p", { class: "nota", estilo: "margin-top:6px" },
                "As duas famílias nos mesmos eixos. Com histórico, a árvore salta de 15% para 40% " +
                "no corte; o logit passa por 9,1% ali e só chega a 33,2% em 80%. Nenhuma está certa " +
                "por construção: elas erram de formas diferentes, e escolher exige o capítulo 7.")
            : null,
        ]),
      ]),
    ]));
  },
});
