Aula.slide({
  id: "41",
  bloco: "boosting",
  titulo: "O que o modelo usa em geral? O que pesou para Bruno?",
  subtitulo: "Importância global por permutação e contribuição local no escore",
  conclusao: "Uma variável importante na carteira não precisa ser o principal fator da previsão de todo cliente.",
  fonte: Aula.dados.fontes.experimento,
  resumo: "Importância global por queda de AUC ao permutar cada variável e decomposição local do escore de um cliente.",
  notas: {
    conducao: [
      "Peça a variável mais relevante na carteira e a que mais eleva a previsão de Bruno. Mostre que podem ser diferentes.",
      "Compare Bruno e Carla mantendo as escalas.",
      "Termine com a pergunta: se alterarmos essa variável, garantimos essa redução de risco? Resposta: explicação de previsão não identifica efeito causal.",
    ],
    respostas: [
      "As duas leituras respondem a perguntas diferentes: uma descreve a carteira, a outra descreve uma previsão.",
      "A soma da referência com as contribuições reproduz o escore do cliente, o que é conferido numericamente.",
    ],
    cuidados: [
      "Importância por permutação tem unidade própria, aqui queda de AUC na validação. Não é a mesma escala das contribuições locais, que estão em escore.",
      "Variáveis correlacionadas afetam atribuição e importância.",
      "Importância por redução de impureza tem limitações distintas das da permutação.",
      "As contribuições locais são valores de Shapley com expectativa intervencional sobre uma amostra de referência, calculados no notebook, e não um mecanismo econômico.",
    ],
    transicao: "Vamos verificar se conseguimos separar a construção da previsão de sua interpretação.",
  },

  montar: function (corpo, ctx) {
    var R = Aula.resultados, D = Aula.dados;
    var est = ctx.estado;
    if (!R) {
      corpo.appendChild(h("p", { class: "resposta erro" },
        "Resultados do experimento não disponíveis: execute experimento/experimento.py e recompile."));
      return;
    }
    if (!est.cliente) est.cliente = "Bruno";
    if (!est.variavel) est.variavel = null;

    var E = R.explicacao;
    var local = E.locais.filter(function (l) { return l.cliente === est.cliente; })[0];
    var nomes = { renda: "renda", comp: "comprometimento", rel: "relacionamento",
                  util: "utilização", hist: "histórico", canal: "canal" };

    var gGlobal = Graf.barras({
      w: 470, h: 330, larguraRot: 168, m: { d: 86, c: 14, b: 54 },
      itens: E.global_permutacao.map(function (g) {
        return { rotulo: nomes[g.variavel] || g.variavel, valor: g.queda_auc,
                 cor: est.variavel === g.variavel ? "var(--boost)" : "var(--ink-soft)",
                 texto: F.dec(g.queda_auc, 4) };
      }),
      max: Math.max.apply(null, E.global_permutacao.map(function (g) { return g.queda_auc; })) * 1.25,
      formato: function (v) { return F.dec(v, 2); },
      rotuloX: "queda de AUC ao permutar a variável",
    });

    var ordem = E.global_permutacao.map(function (g) { return g.variavel; });
    var itens = ordem.map(function (v) {
      return { rotulo: nomes[v] || v, valor: local.contribuicoes[v],
               cor: est.variavel === v ? "var(--ink)"
                 : (local.contribuicoes[v] >= 0 ? "var(--alert)" : "var(--ok)") };
    });
    var gLocal = Graf.waterfall({
      w: 470, h: 352, larguraRot: 172,
      base: local.base, rotuloBase: "referência " + F.dec(local.base, 3),
      rotuloTotal: "escore de " + local.cliente, rotuloX: "escore do boosting",
      itens: itens,
    });

    var erro = Math.abs(local.conferencia_soma - local.escore);

    corpo.appendChild(h("div", { class: "linha cresce" }, [
      h("div", { class: "painel claro cresce centro" }, [
        h("div", { estilo: "display:flex;justify-content:space-between;width:100%;align-items:baseline;gap:10px" }, [
          h("h3", { class: "secao", estilo: "margin:0" }, "Global: importância na carteira"),
          h("span", { class: "nota" }, E.amostra_global),
        ]),
        gGlobal.svg,
        h("p", { class: "nota", estilo: "margin:0" },
          "AUC de referência na validação: " + F.dec(E.auc_base_validacao, 4) +
          ". A barra mostra quanto a AUC cai quando os valores da variável são embaralhados."),
      ]),
      h("div", { class: "painel claro cresce centro" }, [
        h("div", { estilo: "display:flex;justify-content:space-between;width:100%;align-items:baseline;gap:10px" }, [
          h("h3", { class: "secao", estilo: "margin:0" }, "Local: o escore de " + local.cliente),
          UI.selo("contribuições em escore", "neutro"),
        ]),
        gLocal.svg,
        h("p", { class: "nota", estilo: "margin:0" },
          "Conferência: referência mais a soma das contribuições é " +
          F.dec(local.conferencia_soma, 6) + ", e o escore do modelo é " +
          F.dec(local.escore, 6) + ". " +
          (erro < 1e-9 ? "Diferença menor que 10 elevado a menos 9."
                       : "Diferença de " + F.dec(erro, 9) + ".")),
      ]),
      h("div", { class: "coluna", estilo: "flex:0 0 430px" }, [
        h("div", { class: "painel cor", estilo: "padding:12px 16px" }, [
          h("h3", { class: "secao", estilo: "margin-bottom:4px" }, "Do escore à PD"),
          UI.kv([
            ["escore do boosting", F.dec(local.escore, 4)],
            ["PD do modelo", F.pct(local.pd, 2)],
            ["PD depois da calibração", F.pct(local.pd_calibrada, 2)],
          ]),
        ]),
        h("div", { class: "painel", estilo: "padding:12px 16px" }, [
          h("div", { class: "ctrl" }, [
            h("label", {}, "Cliente"),
            Comum.seletorCliente(est.cliente, function (v) {
              est.cliente = v; App.montar("41");
            }, { compacto: true }),
          ]),
          h("div", { class: "ctrl", estilo: "margin-top:8px" }, [
            h("label", {}, "Destacar uma variável (nome abreviado)"),
            UI.botoes({
              compacto: true, rotulo: "variável",
              opcoes: ordem.map(function (v) { return { valor: v, rotulo: v }; }),
              valor: est.variavel,
              aoMudar: function (v) {
                est.variavel = est.variavel === v ? null : v; App.montar("41");
              },
            }),
          ]),
          h("button", { class: "btn min fantasma", estilo: "margin-top:8px", type: "button",
            onclick: ctx.reiniciar }, "Reiniciar exemplo"),
        ]),
        h("div", { class: "painel claro cresce", estilo: "padding:12px 16px" }, [
          h("h3", { class: "secao", estilo: "margin-bottom:4px" }, "Como ler"),
          h("p", { class: "apoio", estilo: "font-size:17px" },
            "O painel global mede desempenho: quanto a AUC cai ao embaralhar a variável. " +
            "O local mede escore: quanto a característica desloca a previsão daquele cliente. " +
            "Alterar a variável não garante essa redução: explicação não identifica causa."),
        ]),
      ]),
    ]));
  },
});
