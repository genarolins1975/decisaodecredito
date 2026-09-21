Aula.slide({
  id: "46",
  bloco: "decisao",
  titulo: "Até qual PD vamos aprovar?",
  subtitulo: "O corte define quem entra na carteira e o que se observa depois",
  conclusao: "A mesma previsão pode sustentar políticas diferentes. A política é uma decisão adicional ao modelo.",
  fonte: Aula.dados.fontes.experimento,
  resumo: "Histograma das PDs com a linha de corte, taxa de aprovação e inadimplência observada entre aprovados.",
  notas: {
    conducao: [
      "Reduza o corte e observe volume e composição.",
      "Pergunte se menor inadimplência implica melhor resultado. Não: pode haver perda de receita.",
      "Compare dois modelos no mesmo corte e depois no mesmo volume, e explique que são perguntas diferentes.",
    ],
    respostas: [
      "Taxa de aprovação é o número de aprovados dividido pelo total avaliado.",
      "Inadimplência entre aprovados é a soma de eventos entre aprovados dividida pelo número de aprovados. Contratos recusados não entram no denominador.",
      "Média das PDs aprovadas e taxa observada são coisas diferentes: a primeira é previsão, a segunda é desfecho.",
    ],
    cuidados: [
      "A avaliação usa contratos com desfecho conhecido da população sintética, o que permite simular recusa. Em dados reais de apenas concedidos, inferir o desempenho dos rejeitados exige hipóteses adicionais.",
      "Limite de crédito, preço e prazo permanecem fixos aqui, para isolar a decisão de aprovação.",
      "Empates na PD, comuns na árvore, seguem a regra de aprovar todos no limite. Nenhum desempate usa y.",
      "Se ninguém for aprovado, a inadimplência entre aprovados fica indefinida.",
    ],
    transicao: "Para escolher um corte, precisamos colocar receitas e perdas na mesma conta.",
  },

  montar: function (corpo, ctx) {
    var R = Aula.resultados;
    var est = ctx.estado;
    if (!R) {
      corpo.appendChild(h("p", { class: "resposta erro" },
        "Resultados do experimento não disponíveis: execute experimento/experimento.py e recompile."));
      return;
    }
    if (!est.modelo) est.modelo = "boosting";
    if (!est.particao) est.particao = "calibracao";
    var congelado = R.politica[est.modelo].corte_congelado;
    if (est.corte === undefined) est.corte = congelado;

    var pol = R.politica[est.modelo][est.particao];
    function linhaDoCorte(lista, c) {
      var melhor = lista[0], dist = Infinity;
      lista.forEach(function (l) {
        var d = Math.abs(l.corte - c);
        if (d < dist) { dist = d; melhor = l; }
      });
      return melhor;
    }
    var atual = linhaDoCorte(pol, est.corte);
    var aval = R.avaliacao[est.modelo];
    var hist = aval.histograma_teste;

    var gh = Graf.novo({ w: 840, h: 300, m: { e: 92, d: 34, c: 20, b: 54 },
      resumo: "Histograma das PDs previstas com a linha de corte." });
    var maxC = Math.max.apply(null, hist.contagens);
    gh.x(0, 0.6).y(0, maxC * 1.05);
    gh.eixoY({ ticks: [0, Math.round(maxC / 2), maxC], formato: function (v) { return F.inteiro(v); },
               rotulo: "contratos" });
    gh.eixoX({ ticks: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6],
               formato: function (v) { return F.pct(v, 0); }, rotulo: "PD prevista calibrada" });
    hist.contagens.forEach(function (c, i) {
      var x0 = hist.bordas[i], x1 = hist.bordas[i + 1];
      var aprovado = x1 <= est.corte;
      gh.retangulo(x0, 0, x1, c,
        { cor: aprovado ? "var(--cor-soft)" : "var(--paper)",
          borda: aprovado ? "var(--amber)" : "var(--rule)" });
    });
    gh.add(sv("line", { x1: gh.px(est.corte), x2: gh.px(est.corte), y1: gh.py(0),
      y2: gh.py(maxC * 1.05), stroke: "var(--alert)", "stroke-width": 3 }));
    gh.texto(est.corte, maxC * 1.05, "corte " + F.pct(est.corte, 1),
      { dx: 8, dy: 4, tamanho: 19, cor: "var(--alert)" });

    /* O nome completo da série fica no título do painel: girado no eixo, ele
       ultrapassaria a altura do desenho. */
    function curva(campo, cor, titulo, formato) {
      var g = Graf.novo({ w: 420, h: 240, m: { e: 80, d: 26, c: 16, b: 50 } });
      var vals = pol.filter(function (l) { return l[campo] !== null; })
        .map(function (l) { return l[campo]; });
      var topo = Math.max.apply(null, vals) * 1.1;
      g.x(0.01, 0.5).y(0, topo);
      var ticks = Graf.ticks(0, topo, 4);
      g.grade({ y: ticks });
      g.eixoY({ ticks: ticks, formato: formato, rotulo: "taxa" });
      g.eixoX({ ticks: [0.1, 0.2, 0.3, 0.4, 0.5],
                formato: function (v) { return F.pct(v, 0); }, rotulo: "corte" });
      g.linha(pol.filter(function (l) { return l[campo] !== null; })
        .map(function (l) { return [l.corte, l[campo]]; }), { cor: cor, largura: 3 });
      g.add(sv("line", { x1: g.px(est.corte), x2: g.px(est.corte), y1: g.py(0), y2: g.py(topo),
        stroke: "var(--alert)", "stroke-width": 2 }));
      if (atual[campo] !== null) {
        g.ponto(atual.corte, atual[campo], { r: 8, cor: cor });
        g.texto(atual.corte, atual[campo], formato(atual[campo]),
          { dx: 10, dy: -10, tamanho: 19, cor: "var(--ink)" });
      }
      return g.svg;
    }

    var mesmoVolume = null;
    if (est.comparar) {
      var alvo = atual.aprovacao;
      mesmoVolume = ["logit", "arvore", "boosting"].map(function (k) {
        var lista = R.politica[k][est.particao];
        var melhor = lista[0], dist = Infinity;
        lista.forEach(function (l) {
          var d = Math.abs(l.aprovacao - alvo);
          if (d < dist) { dist = d; melhor = l; }
        });
        return { modelo: k, linha: melhor };
      });
    }

    corpo.appendChild(h("div", { class: "linha cresce" }, [
      h("div", { class: "coluna cresce" }, [
        h("div", { class: "painel claro centro" }, gh.svg),
        /* A tabela de mesmo volume entra no lugar das duas curvas, que são do modelo escolhido:
           na coluna da direita ela não cabia e o excedente ficava fora do palco. */
        mesmoVolume
          ? h("div", { class: "painel claro cresce" }, [
              h("h3", { class: "secao" }, "Mesmo volume de aprovação"),
              UI.tabela({
                compacta: true,
                colunas: [{ rotulo: "Modelo" }, { rotulo: "Corte" }, { rotulo: "Aprovação" },
                          { rotulo: "Inadimplência" }],
                linhas: mesmoVolume.map(function (m) {
                  return [Aula.dados.modelos[m.modelo].nome, F.pct(m.linha.corte, 1),
                          F.pct(m.linha.aprovacao, 1),
                          m.linha.inadimplencia === null ? "não definida"
                                                         : F.pct(m.linha.inadimplencia, 2)];
                }),
                legenda: "Cada modelo no corte que produz aproximadamente o mesmo volume",
              }),
              h("p", { class: "nota", estilo: "margin-top:6px" },
                "Mesmo corte e mesmo volume são perguntas diferentes: com cortes iguais os " +
                "modelos aprovam quantidades distintas."),
            ])
          : h("div", { class: "linha cresce" }, [
          h("div", { class: "painel claro cresce centro", estilo: "padding:8px 14px" }, [
            h("h3", { class: "secao", estilo: "margin:0 0 2px;display:flex;gap:8px;align-items:baseline" },
              ["Taxa de aprovação", h("span", { estilo: "text-transform:none;letter-spacing:0;font-size:15px" },
                Mat.i("\\frac{\\#\\{\\hat{p} \\le c\\}}{n}"))]),
            curva("aprovacao", "var(--ink-soft)", null,
              function (v) { return F.pct(v, 0); }),
          ]),
          h("div", { class: "painel claro cresce centro", estilo: "padding:8px 14px" }, [
            h("h3", { class: "secao", estilo: "margin:0 0 2px;display:flex;gap:8px;align-items:baseline;flex-wrap:wrap" },
              ["Inadimplência entre aprovados", h("span", { estilo: "text-transform:none;letter-spacing:0;font-size:15px" },
                Mat.i("\\frac{\\sum_{\\hat{p} \\le c} y}{\\#\\{\\hat{p} \\le c\\}}"))]),
            curva("inadimplencia", "var(--alert)", null,
              function (v) { return F.pct(v, 1); }),
          ]),
        ]),
      ]),
      h("div", { class: "coluna", estilo: "flex:0 0 480px" }, [
        h("div", { class: "painel cor" }, [
          h("div", { estilo: "display:flex;flex-wrap:wrap;justify-content:space-between;align-items:baseline;gap:10px" }, [
            h("h3", { class: "secao", estilo: "margin:0 0 4px" }, "No corte de " + F.pct(atual.corte, 1)),
            UI.selo(est.particao === "teste" ? "análise retrospectiva" : "partição de política",
              est.particao === "teste" ? "sim" : "neutro"),
          ]),
          h("dl", { class: "kv", estilo: "font-size:18px;gap:1px 12px" }, [
            h("dt", {}, "aprovados"),
            /* O total avaliado vem da partição, não da divisão aprovados/taxa: com ninguém
               aprovado a divisão daria "0 de 0", e o denominador é conhecido. */
            h("dd", {}, F.inteiro(atual.aprovados) + " de " + F.inteiro(aval[est.particao].n)),
            h("dt", {}, "taxa de aprovação"), h("dd", {}, F.pct(atual.aprovacao, 1)),
            h("dt", {}, "eventos entre aprovados"), h("dd", {}, F.inteiro(atual.eventos)),
            h("dt", {}, "inadimplência entre aprovados"),
            h("dd", {}, atual.inadimplencia === null ? "não definida"
                                                     : F.pct(atual.inadimplencia, 2)),
            h("dt", {}, "PD média dos aprovados"),
            h("dd", {}, atual.pd_media_aprovados === undefined ? "não definida"
                                                               : F.pct(atual.pd_media_aprovados, 2)),
          ]),
        ]),
        h("div", { class: "painel" }, [
          UI.slider({
            rotulo: "Corte de aprovação", min: 1, max: 50, passo: 0.5, valor: est.corte * 100,
            formato: function (v) {
              var l = linhaDoCorte(pol, v / 100);
              return "aprovação " + F.pct(l.aprovacao, 1);
            },
            aoMudar: function (v) { est.corte = v / 100; App.montar("46"); },
          }),
          h("div", { class: "grupo", estilo: "margin-top:10px" }, [
            UI.botoes({
              compacto: true, rotulo: "modelo",
              opcoes: ["logit", "arvore", "boosting"].map(function (k) {
                return { valor: k, rotulo: Aula.dados.modelos[k].curto };
              }),
              valor: est.modelo,
              aoMudar: function (v) { est.modelo = v; App.montar("46"); },
            }),
          ]),
          h("div", { class: "grupo", estilo: "margin-top:8px" }, [
            UI.botoes({
              compacto: true, rotulo: "partição",
              opcoes: [{ valor: "calibracao", rotulo: "Partição de política" },
                       { valor: "teste", rotulo: "Teste, modo final" }],
              valor: est.particao,
              aoMudar: function (v) { est.particao = v; App.montar("46"); },
            }),
            h("button", { class: "btn min", type: "button", onclick: function () {
              est.corte = congelado; App.montar("46");
            } }, "Corte congelado " + F.pct(congelado, 0)),
            h("button", { class: "btn min", type: "button", onclick: function () {
              est.comparar = !est.comparar; App.montar("46");
            } }, est.comparar ? "Esconder comparação" : "Mesmo volume de aprovação"),
            h("button", { class: "btn min fantasma", type: "button", onclick: ctx.reiniciar },
              "Reiniciar exemplo"),
          ]),
        ]),
        h("p", { class: "nota" },
              mesmoVolume
                ? "A tabela ao lado compara os três modelos no corte que produz o mesmo volume " +
                  "de aprovação do corte atual."
                : est.particao === "teste"
                ? "No modo final o corte congelado é aplicado ao teste. Mover o controle aqui é " +
                  "análise retrospectiva e não seleciona política."
                : "A política é definida nesta partição, antes de qualquer olhar ao teste."),
      ]),
    ]));
  },
});
