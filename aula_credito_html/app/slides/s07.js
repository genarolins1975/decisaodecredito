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
    aprofundar: [
      "Os números desta tela e os do capítulo 4 são de dois exemplos, não de dois modelos rivais. Aqui o escore usa seis variáveis na forma centrada, com intercepto −3,50 e comprometimento pesando 0,40 a cada 10 pontos, o que dá razão de chances 1,49. As páginas do capítulo usam duas variáveis na forma crua, com intercepto −5,6666 e utilização pesando 0,7453 a cada 10 pontos, razão de chances 2,11. O mecanismo é o mesmo; os números são de exemplos diferentes, e nenhum se converte no outro trocando de unidade.",
      "Material original, capítulo 4, página 13: o intercepto é âncora de nível, não coeficiente comum. Naquele exemplo, utilização zero e atraso zero não existem na carteira, então o intercepto não tem leitura como PD de um cliente real.",
      "Trocar o intercepto desloca a PD de todas as propostas e preserva a ordem de risco. É por isso que recalibrar um modelo cuja ordenação continua boa equivale a reestimar o nível, sem alterar a AUC. O mesmo fato aparece no slide 45.",
    ],
    transicao: "O escore pode ser qualquer número. Como converter esse escore em algo entre zero e um?",
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
      w: 780, h: 430, larguraRot: 220,
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
      h("div", { class: "painel claro centro", estilo: "display:flex;flex:0 0 auto;flex-direction:column;justify-content:flex-start" }, [
        h("p", { class: "formula peq", estilo: "background:none;border:none;padding:0;margin:0 0 2px" },
          Mat.b("z = \\beta_0 + \\sum_{j} \\beta_j\\,(x_j - \\bar{x}_j)")),
        h("p", { class: "nota", estilo: "margin:0 0 6px;text-align:center" }, [
          "cada barra abaixo é uma parcela da soma: ", Mat.i("\\beta_j\\,(x_j - \\bar{x}_j)"),
        ]),
        g.svg,
      ]),
      h("div", { class: "coluna cresce" }, [
        h("div", { class: "painel cor", estilo: "padding:10px 16px" }, [
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
        h("div", { class: "painel claro cresce", estilo: "padding:10px 14px" }, tabela),
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
            est.visiveis >= 5 ? Mat.i("z = " + Mat.n(z, 3)) : Mat.i("z \\text{ parcial}")),
        ]),
      ]),
    ]));
  },
});
