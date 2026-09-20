Aula.slide({
  id: "15",
  bloco: "logit",
  titulo: "Canal digital não significa duas vezes agência",
  subtitulo: "Categorias entram por comparação com uma referência",
  conclusao: "O número atribuído a uma categoria não deve inventar uma ordem econômica.",
  fonte: "Extensão pedagógica da fórmula manual; cálculo próprio",
  resumo: "Três categorias de canal, tabela de indicadores e contribuição adicional ao escore, com troca da categoria de referência.",
  notas: {
    conducao: [
      "Pergunte o que ficaria implícito ao usar canal igual a 1, 2 e 3 diretamente.",
      "Mostre a tabela de indicadores e só então troque a referência.",
      "Use o momento para separar interpretação de coeficientes e previsão do modelo.",
    ],
    respostas: [
      "Com agência como referência: digital soma 0,30 e parceiro soma 0,60 ao escore.",
      "Com digital como referência: intercepto passa a −3,20, agência recebe −0,30 e parceiro +0,30. As PDs por categoria não mudam.",
      "Categoria omitida não é categoria ausente: ela está no intercepto.",
    ],
    cuidados: [
      "Este é um exemplo separado, que não altera a fórmula canônica dos slides 07 a 14 nem as PDs dos quatro clientes.",
      "Uma categoria nova em produção exige tratamento definido na codificação. Não invente coeficiente.",
      "Canal pode refletir seleção, não causalidade.",
      "Manter todas as indicadoras junto com o intercepto cria redundância na parametrização.",
    ],
    transicao: "A codificação determina a forma que o modelo enxerga a informação. Podemos também flexibilizar a forma das variáveis numéricas.",
  },

  montar: function (corpo, ctx) {
    var est = ctx.estado;
    if (!est.canal) est.canal = "Agência";
    if (!est.ref) est.ref = "Agência";

    var zBase = -3.50;
    /* Parametrização com agência como referência. */
    var efeito = { "Agência": 0, "Digital": 0.30, "Parceiro": 0.60 };
    var canais = ["Agência", "Digital", "Parceiro"];

    /* Reexpressão na referência escolhida: as previsões ficam idênticas. */
    function intercepto() { return zBase + efeito[est.ref]; }
    function coef(canal) { return efeito[canal] - efeito[est.ref]; }
    function z(canal) { return intercepto() + coef(canal); }
    function indicadores(canal) {
      var outros = canais.filter(function (c) { return c !== est.ref; });
      return outros.map(function (c) { return canal === c ? 1 : 0; });
    }

    var outros = canais.filter(function (c) { return c !== est.ref; });

    var tabela = UI.tabela({
      colunas: [{ rotulo: "Canal" }]
        .concat(outros.map(function (c) { return { rotulo: "indicador " + c.toLowerCase() }; }))
        .concat([{ rotulo: "Contribuição", unidade: "no escore" }, { rotulo: "Escore z" },
                 { rotulo: "PD" }]),
      linhas: canais.map(function (c) {
        return [c].concat(indicadores(c).map(String))
          .concat([F.sinal(coef(c), 2), F.dec(z(c), 2), F.pct(M.sigmoid(z(c)), 2)]);
      }),
      selecionada: canais.indexOf(est.canal),
      legenda: "Codificação por indicadores e previsão por categoria",
    });

    var gb = Graf.barras({
      w: 620, h: 300, larguraRot: 130, m: { d: 130 },
      itens: canais.map(function (c) {
        return { rotulo: c, valor: M.sigmoid(z(c)),
                 cor: c === est.canal ? "var(--logit)" : "var(--rule)",
                 texto: F.pct(M.sigmoid(z(c)), 2) };
      }),
      max: 0.09, ticks: [0, 0.02, 0.04, 0.06, 0.08],
      formato: function (v) { return F.pct(v, 0); },
      rotuloX: "PD do perfil de referência por canal",
    });

    var erro = h("div", { class: "painel", estilo: "border-color:var(--alert)" }, [
      h("h3", { class: "secao", estilo: "color:var(--alert)" }, "O que 1, 2 e 3 imporia"),
      h("p", { class: "apoio" },
        "Usar canal = 1, 2 e 3 em uma única variável imporia que a diferença entre agência e " +
        "digital é igual à diferença entre digital e parceiro, e que a ordem econômica existe. " +
        "Nada nos dados garante isso."),
    ]);

    corpo.appendChild(h("div", { class: "linha cresce" }, [
      h("div", { class: "coluna cresce" }, [
        h("div", { class: "painel cor" }, [
          h("div", { estilo: "display:flex;flex-wrap:wrap;justify-content:space-between;align-items:baseline;gap:12px;flex-wrap:wrap" }, [
            h("h3", { class: "secao", estilo: "margin:0" },
              "Referência atual: " + est.ref),
            UI.selo("extensão pedagógica da fórmula", "neutro"),
          ]),
          h("p", { class: "formula peq", estilo: "margin-top:8px" },
            "z = " + F.dec(intercepto(), 2) +
            outros.map(function (c) {
              return " + " + F.dec(coef(c), 2) + " × [" + c.toLowerCase() + "]";
            }).join("")),
        ]),
        h("div", { class: "painel claro cresce" }, tabela),
        erro,
      ]),
      h("div", { class: "coluna", estilo: "flex:0 0 660px" }, [
        h("div", { class: "painel claro" }, gb.svg),
        h("div", { class: "painel" }, [
          h("div", { class: "ctrl" }, [
            h("label", {}, "Canal do cliente"),
            UI.botoes({
              compacto: true, rotulo: "canal",
              opcoes: canais.map(function (c) { return { valor: c, rotulo: c }; }),
              valor: est.canal,
              aoMudar: function (v) { est.canal = v; App.montar("15"); },
            }),
          ]),
          h("div", { class: "grupo", estilo: "margin-top:12px" }, [
            UI.botoes({
              compacto: true, rotulo: "categoria de referência",
              opcoes: canais.map(function (c) {
                return { valor: c, rotulo: "Referência: " + c };
              }),
              valor: est.ref,
              aoMudar: function (v) { est.ref = v; App.montar("15"); },
            }),
            h("button", { class: "btn min fantasma", type: "button", onclick: ctx.reiniciar },
              "Reiniciar exemplo"),
          ]),
          h("p", { class: "nota", estilo: "margin-top:10px" },
            "Trocar a referência muda o intercepto e os coeficientes. As três PDs permanecem " +
            F.pct(M.sigmoid(zBase), 2) + ", " + F.pct(M.sigmoid(zBase + 0.30), 2) + " e " +
            F.pct(M.sigmoid(zBase + 0.60), 2) + " em qualquer parametrização."),
        ]),
      ]),
    ]));
  },
});
