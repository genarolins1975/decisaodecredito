Aula.slide({
  id: "25",
  bloco: "arvore",
  titulo: "Duas folhas com PD de 10%. A evidência é igual?",
  subtitulo: "Intervalo binomial descritivo de Wilson, nominal de 95%",
  conclusao: "10% em 20 contratos não oferece a mesma precisão que 10% em 1.000.",
  fonte: "Pares binomiais ilustrativos; cálculo próprio",
  resumo: "Duas linhas com ponto em 10% e intervalo de Wilson, uma com 2 eventos em 20 contratos e outra com 100 em 1.000.",
  notas: {
    conducao: [
      "Pergunte qual folha transmitiria mais confiança e por quê.",
      "Aumente o tamanho da folha e peça que o aluno narre o que mudou.",
      "Mostre o caso de zero eventos e pergunte se o gestor poderia tratar o risco como impossível.",
    ],
    respostas: [
      "2 em 20: intervalo aproximado de 2,8% a 30,1%.",
      "100 em 1.000: intervalo aproximado de 8,3% a 12,0%.",
      "0 em 20: o limite superior continua positivo, aproximadamente 16,1%. Zero evento não prova risco zero.",
    ],
    cuidados: [
      "O intervalo descreve a dimensão binomial. Não incorpora a escolha adaptativa das folhas, a seleção da população nem a mudança temporal.",
      "Não é correto dizer que a PD individual tem 95% de chance de cair nesse intervalo.",
      "A incerteza real da árvore inclui a busca pelos cortes, e é maior que a mostrada aqui.",
    ],
    transicao: "Folhas maiores estabilizam estimativas, mas a árvore também precisa capturar diferenças relevantes entre clientes.",
  },
  impressao: function (e) { e.zero = true; },

  montar: function (corpo, ctx) {
    var est = ctx.estado;
    var tamanhos = [20, 50, 100, 200, 500, 1000];
    if (est.indice === undefined) est.indice = 0;
    if (est.zero === undefined) est.zero = false;

    var n = tamanhos[est.indice];
    var linhas = [
      { rotulo: "folha pequena", n: n, d: Math.round(n * 0.10) },
      { rotulo: "folha grande", n: 1000, d: 100 },
    ];
    if (est.zero) linhas.push({ rotulo: "folha sem eventos", n: 20, d: 0 });

    var g = Graf.novo({ w: 940, h: 400, m: { e: 260, d: 148, c: 30, b: 60 } });
    g.x(0, 0.4).y(0, linhas.length);
    g.grade({ x: [0, 0.1, 0.2, 0.3, 0.4] });
    g.eixoX({ ticks: [0, 0.1, 0.2, 0.3, 0.4], formato: function (v) { return F.pct(v, 0); },
              rotulo: "taxa de eventos na folha" });
    linhas.forEach(function (l, i) {
      var p = l.d / l.n;
      var iv = M.wilson(l.d, l.n);
      var yc = g.py(linhas.length - i - 0.5);
      g.add(sv("line", { x1: g.px(iv[0]), x2: g.px(iv[1]), y1: yc, y2: yc,
        stroke: "var(--arvore)", "stroke-width": 5, "stroke-linecap": "round", opacity: .45 }));
      [iv[0], iv[1]].forEach(function (v) {
        g.add(sv("line", { x1: g.px(v), x2: g.px(v), y1: yc - 12, y2: yc + 12,
          stroke: "var(--arvore)", "stroke-width": 3 }));
      });
      g.ponto(p, linhas.length - i - 0.5, { r: 10, cor: "var(--ink)" });
      g.add(sv("text", { x: g.m.e - 16, y: yc - 4, "text-anchor": "end", "font-size": 21,
        "font-weight": 700, fill: "var(--ink)",
        texto: F.inteiro(l.d) + " em " + F.inteiro(l.n) }));
      g.add(sv("text", { x: g.m.e - 16, y: yc + 20, "text-anchor": "end", "font-size": 17,
        fill: "var(--muted)", texto: l.rotulo + " · taxa " + F.pct(p, 1) }));
      g.add(sv("text", { x: g.m.e + g.largura + 14, y: yc + 7, "font-size": 18,
        fill: "var(--muted)",
        texto: F.pct(iv[0], 1) + " a " + F.pct(iv[1], 1) }));
    });

    var tabela = UI.tabela({
      compacta: true,
      colunas: [{ rotulo: "Folha" }, { rotulo: "Eventos" }, { rotulo: "n" },
                { rotulo: "Taxa" }, { rotulo: "Intervalo de Wilson" }],
      linhas: linhas.map(function (l) {
        var iv = M.wilson(l.d, l.n);
        return [l.rotulo, F.inteiro(l.d), F.inteiro(l.n), F.pct(l.d / l.n, 1),
                F.pct(iv[0], 1) + " a " + F.pct(iv[1], 1)];
      }),
      legenda: "Taxas iguais com evidências diferentes",
    });

    corpo.appendChild(h("div", { class: "linha cresce" }, [
      h("div", { class: "coluna cresce" }, [
        h("div", { class: "painel claro cresce centro" }, g.svg),
        h("div", { class: "painel claro" }, tabela),
      ]),
      h("div", { class: "coluna", estilo: "flex:0 0 440px" }, [
        h("div", { class: "painel cor" }, [
          h("h3", { class: "secao" }, "Leitura"),
          h("p", { class: "apoio", estilo: "color:var(--ink);font-size:21px" },
            "Mesma taxa, evidências diferentes: com " + F.inteiro(n) +
            " contratos o intervalo tem amplitude de " +
            F.pp(M.wilson(Math.round(n * 0.10), n)[1] - M.wilson(Math.round(n * 0.10), n)[0], 1) +
            "; com 1.000 contratos, " +
            F.pp(M.wilson(100, 1000)[1] - M.wilson(100, 1000)[0], 1) + "."),
        ]),
        h("div", { class: "painel" }, [
          UI.slider({
            rotulo: "Tamanho da folha pequena, mantendo a taxa em 10%", discreto: true,
            min: 0, max: tamanhos.length - 1, passo: 1, valor: est.indice,
            formato: function (v) {
              return F.inteiro(Math.round(tamanhos[v] * 0.10)) + " em " + F.inteiro(tamanhos[v]);
            },
            aoMudar: function (v) { est.indice = v; App.montar("25"); },
          }),
          h("div", { class: "grupo", estilo: "margin-top:12px" }, [
            UI.alterna({
              rotulo: "zero eventos", valor: est.zero,
              ligadoRotulo: "Esconder a folha sem eventos",
              desligadoRotulo: "Mostrar folha com zero eventos",
              aoMudar: function (v) { est.zero = v; App.montar("25"); },
            }),
            h("button", { class: "btn fantasma", type: "button", onclick: ctx.reiniciar },
              "Reiniciar exemplo"),
          ]),
        ]),
        h("div", { class: "painel claro cresce" }, [
          h("h3", { class: "secao" }, "Ressalva"),
          h("p", { class: "apoio" },
            "Intervalo binomial descritivo. Não incorpora a escolha adaptativa das folhas."),
          h("p", { class: "nota" },
            "Uma folha com zero eventos não prova risco zero: o limite superior permanece positivo."),
          h("p", { class: "nota" },
            "É por isso que a árvore recebe um tamanho mínimo de folha como parâmetro."),
        ]),
      ]),
    ]));
  },
});
