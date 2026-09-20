Aula.slide({
  id: "07",
  bloco: "logit",
  titulo: "Cada informação altera o escore do cliente",
  subtitulo: "Do perfil de referência às diferenças do cliente",
  conclusao: "O sinal e o tamanho de cada contribuição dependem do coeficiente e da unidade da variável.",
  fonte: Aula.dados.fontes.manual,
  resumo: "Waterfall das contribuições de cada característica ao escore, partindo do intercepto do perfil de referência.",
  notas: {
    conducao: [
      "Comece no perfil de referência: renda R$ 5.000, comprometimento 30%, relacionamento 12 meses, utilização 40% e sem histórico de atraso.",
      "Acrescente comprometimento e histórico. Pergunte qual teve maior contribuição neste cliente.",
      "Mostre que um coeficiente pequeno pode gerar efeito relevante quando a variável muda muito.",
      "Revele z e pergunte se esse número já é uma probabilidade.",
    ],
    cuidados: [
      "A contribuição exibida é relativa à codificação de referência escolhida. Não é decomposição causal nem medida universal de importância.",
      "Coeficiente e contribuição observada são coisas diferentes: a contribuição multiplica o coeficiente pelo desvio da variável.",
      "Centrar as variáveis facilita a interpretação do intercepto e não muda a classe de funções.",
    ],
    transicao: "O escore pode ser qualquer número. Como transformá-lo em algo entre zero e um?",
  },
  impressao: function (e) { e.visiveis = 5; },

  montar: function (corpo, ctx) {
    var D = Aula.dados, L = D.logit;
    var est = ctx.estado;
    if (!est.cliente) est.cliente = "Bruno";
    if (est.visiveis === undefined) est.visiveis = 5;

    var c = D.cliente(est.cliente);
    var contrib = L.contribuicoes(c);
    var z = L.z(c);

    var g = Graf.waterfall({
      w: 840, h: 430, larguraRot: 240,
      base: L.intercepto, visiveis: est.visiveis,
      rotuloBase: "intercepto " + F.dec(L.intercepto, 2),
      rotuloTotal: "escore z",
      itens: contrib.map(function (t) {
        return {
          rotulo: t.nome, valor: t.contribuicao,
          cor: t.contribuicao >= 0 ? "var(--alert)" : "var(--ok)",
        };
      }),
    });

    var unidades = { comp: "p.p.", hist: "indicador", rel: "meses", util: "p.p.", renda: "R$" };
    var tabela = UI.tabela({
      compacta: true,
      colunas: [{ rotulo: "Característica" },
                { rotulo: "Conta", unidade: "coeficiente \u00d7 (valor \u2212 referência)" },
                { rotulo: "Contribuição", unidade: "no escore z" }],
      linhas: contrib.map(function (t) {
        return [t.nome + " (" + unidades[t.campo] + ")", t.conta.split(" = ")[0],
                F.sinal(t.contribuicao, 3)];
      }).concat([["Intercepto (perfil de referência)", F.dec(L.intercepto, 2), ""]]),
      legenda: "Contribuições de cada característica ao escore",
    });
    [].forEach.call(tabela.querySelectorAll("tbody tr"), function (tr, i) {
      if (i < est.visiveis) return;
      tr.setAttribute("style", "opacity:.35");
    });

    corpo.appendChild(h("div", { class: "linha cresce" }, [
      h("div", { class: "painel claro centro", estilo: "display:flex;flex:0 0 auto" }, g.svg),
      h("div", { class: "coluna cresce" }, [
        h("div", { class: "painel cor" }, [
          h("div", { estilo: "display:flex;gap:14px;align-items:baseline;flex-wrap:wrap" }, [
            h("span", { class: "apoio" }, "Cliente"),
            Comum.seletorCliente(est.cliente, function (v) {
              est.cliente = v; App.montar("07");
            }, { compacto: true }),
          ]),
          h("p", { class: "nota", estilo: "margin-top:8px" },
            "Perfil de referência: renda R$ 5.000, comprometimento 30%, relacionamento 12 meses, " +
            "utilização 40% e sem histórico de atraso. O intercepto vale para esse perfil."),
        ]),
        h("div", { class: "painel claro cresce" }, tabela),
        h("div", { class: "grupo" }, [
          h("button", { class: "btn", type: "button",
            onclick: function () {
              est.visiveis = est.visiveis >= 5 ? 1 : est.visiveis + 1; App.montar("07");
            } },
            est.visiveis >= 5 ? "Recomeçar uma por vez" : "Próxima contribuição"),
          h("button", { class: "btn", type: "button", disabled: est.visiveis >= 5,
            onclick: function () { est.visiveis = 5; App.montar("07"); } }, "Mostrar todas"),
          h("button", { class: "btn fantasma", type: "button", onclick: ctx.reiniciar },
            "Reiniciar exemplo"),
          h("span", { class: "medio", estilo: "margin-left:auto" },
            est.visiveis >= 5 ? "z = " + F.dec(z, 3) : "z parcial"),
        ]),
      ]),
    ]));
  },
});
