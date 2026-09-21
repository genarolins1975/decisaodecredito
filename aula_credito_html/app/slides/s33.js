Aula.slide({
  id: "33",
  bloco: "boosting",
  titulo: "Dois eventos em dez contratos: começamos em 20%",
  subtitulo: "O melhor preditor constante da perda logarítmica no treino",
  conclusao: "Antes de usar características, a taxa observada fornece o ponto de partida do exemplo.",
  fonte: Aula.dados.fontes.boosting,
  resumo: "Dez registros divididos em dois grupos, previsão inicial constante e curva da perda média em função dessa constante.",
  notas: {
    conducao: [
      "Pergunte qual PD seria razoável antes de olhar qualquer característica.",
      "Compare 10%, 20% e 40% na perda média.",
      "Revele que a média empírica minimiza a perda do modelo constante não ponderado, e conecte F0 à conversão do slide 10.",
      "Só então mostre os grupos A e B, anunciando que eles permitirão melhorar a previsão uniforme.",
    ],
    respostas: [
      "Média de y igual a 0,2, que é o mínimo da curva de perda.",
      "F0 = ln(0,20 / 0,80) = −1,3863, com logaritmo natural.",
    ],
    cuidados: [
      "O ponto inicial depende da perda, dos pesos e da implementação. Este exemplo é sem pesos e binário.",
      "A taxa de 20% descreve esta miniatura. Não descreve o mercado de crédito nem a base principal.",
      "Os desfechos aqui são atributos de treinamento conhecidos, não informação sobre um cliente novo.",
      "Ao avançar para a miniatura canônica, a previsão inicial volta a 20%.",
    ],
    transicao: "Agora compare o que aconteceu com o que previmos: essa diferença indica a direção da primeira correção.",
  },
  impressao: function (e) { e.p0 = 20; e.grupos = true; },

  montar: function (corpo, ctx) {
    var B = Aula.dados.boosting;
    var est = ctx.estado;
    if (est.p0 === undefined) est.p0 = 20;

    var p0 = est.p0 / 100;
    var F0 = Math.log(p0 / (1 - p0));
    var perda = B.perdaConstante(p0);
    var taxa = B.taxaObservada;
    var melhor = B.perdaConstante(taxa);

    var g = Graf.novo({ w: 560, h: 318, m: { e: 82, d: 30, c: 20, b: 54 } });
    g.x(0.01, 0.6).y(0.4, 1.4);
    g.grade({ y: [0.5, 0.75, 1, 1.25] });
    g.eixoY({ ticks: [0.5, 0.75, 1, 1.25], formato: function (v) { return F.dec(v, 2); },
              rotulo: "perda média dos 10 registros" });
    g.eixoX({ ticks: [0.1, 0.2, 0.3, 0.4, 0.5, 0.6],
              formato: function (v) { return F.pct(v, 0); }, rotulo: "previsão constante" });
    g.linha(M.linspace(0.01, 0.6, 200).map(function (v) { return [v, B.perdaConstante(v)]; }),
      { cor: "var(--boost)", largura: 3 });
    g.add(sv("line", { x1: g.px(taxa), x2: g.px(taxa), y1: g.py(0.4), y2: g.py(melhor),
      stroke: "var(--ok)", "stroke-width": 2, "stroke-dasharray": "5 4" }));
    g.texto(taxa, melhor, "mínimo em " + F.pct(taxa, 0),
      { dx: 10, dy: -12, tamanho: 17, peso: 400, cor: "var(--ok)" });
    g.ponto(p0, perda, { r: 10, cor: "var(--boost)" });
    g.texto(p0, perda, F.dec(perda, 4), { dx: 12, dy: 22, tamanho: 19, cor: "var(--ink)" });

    var registros = B.registros;
    function coluna(grupo) {
      var lista = registros.filter(function (r) { return r.grupo === grupo; });
      var eventos = M.soma(lista.map(function (r) { return r.y; }));
      return h("div", { class: "painel claro cresce" }, [
        h("div", { estilo: "display:flex;flex-wrap:wrap;justify-content:space-between;align-items:baseline;gap:6px 14px" }, [
          h("h3", { class: "secao", estilo: "margin:0" }, "Grupo " + grupo),
          h("span", { class: "nota" },
            "comprometimento " + lista[0].comp + "% · " + F.inteiro(eventos) + " eventos em " +
            lista.length),
        ]),
        UI.tabela({
          compacta: true,
          colunas: [{ rotulo: "Registro" }, { rotulo: Mat.i("y") },
                    { rotulo: Mat.i("p_0") }, { rotulo: Mat.i("r = y - p_0") }],
          linhas: lista.map(function (r) {
            return ["nº " + r.id, String(r.y), F.pct(p0, 2),
                    est.residuos ? F.dec(r.y - p0, 4) : ""];
          }),
          legenda: "Registros do grupo " + grupo,
        }),
      ]);
    }

    corpo.appendChild(h("div", { class: "linha cresce" }, [
      h("div", { class: "coluna cresce" }, [
        h("div", { class: "painel cor", estilo: "display:flex;gap:28px;flex-wrap:wrap;align-items:baseline" }, [
          h("span", { class: "medio" }, "previsão inicial " + F.pct(p0, 2)),
          h("span", { class: "apoio", estilo: "display:flex;gap:6px;align-items:baseline" }, [
            Mat.i("F_0 = \\ln\\!\\left(\\frac{" + Mat.n(p0, 2) + "}{" + Mat.n(1 - p0, 2) +
              "}\\right) = " + Mat.n(F0, 4)),
          ]),
          h("span", { class: "apoio" }, "perda média " + F.dec(perda, 4)),
          UI.selo("miniatura didática, distinta da base de comparação", "sim"),
        ]),
        h("div", { class: "linha cresce" }, [coluna("A"), coluna("B")]),
      ]),
      h("div", { class: "coluna", estilo: "flex:0 0 620px" }, [
        h("div", { class: "painel claro cresce centro" }, [
          h("h3", { class: "secao" }, "Perda média em função da previsão constante"),
          g.svg,
        ]),
        h("div", { class: "painel" }, [
          UI.slider({
            rotulo: "Previsão constante", min: 1, max: 60, passo: 1, valor: est.p0,
            formato: function (v) { return "perda " + F.dec(B.perdaConstante(v / 100), 4); },
            aoMudar: function (v) { est.p0 = v; App.montar("33"); },
          }),
          h("div", { class: "grupo", estilo: "margin-top:12px" }, [
            h("button", { class: "btn", type: "button", onclick: function () {
              est.p0 = Math.round(taxa * 100); App.montar("33");
            } }, "Usar melhor constante"),
            h("button", { class: "btn", type: "button", onclick: function () {
              est.residuos = !est.residuos; App.montar("33");
            } }, est.residuos ? "Esconder resíduos" : "Mostrar os resíduos"),
            h("button", { class: "btn fantasma", type: "button", onclick: ctx.reiniciar },
              "Reiniciar exemplo"),
          ]),
          h("p", { class: "nota", estilo: "margin-top:10px" },
            "A curva é calculada diretamente com os dez rótulos, sem treinar biblioteca alguma. " +
            "O mínimo ocorre na média empírica de y, igual a " + F.pct(taxa, 0) + "."),
        ]),
      ]),
    ]));
  },
});
