Aula.slide({
  id: "49",
  bloco: "decisao",
  titulo: "Defenda sua recomendação para o comitê",
  subtitulo: "Desempenho, economia, estabilidade e capacidade de execução na mesma mesa",
  conclusao: "Uma recomendação precisa combinar desempenho, economia, estabilidade e capacidade de execução.",
  fonte: Aula.dados.fontes.experimento,
  resumo: "Tabela comparativa dos três modelos no teste, com política congelada, e um formulário de justificativa local.",
  notas: {
    conducao: [
      "Divida a turma em três grupos ou peça decisões individuais.",
      "Cada grupo tem dois minutos para recomendar e um minuto para defender.",
      "Solicite uma razão que faria mudar de opinião.",
      "Reforce que uma evidência de teste não autoriza ajustar repetidamente o modelo no mesmo teste e chamar isso de avaliação independente.",
    ],
    cuidados: [
      "Os números são de base sintética e servem à aprendizagem, não a uma decisão real de concessão.",
      "Valores próximos não autorizam declarar superioridade conclusiva.",
      "O formulário fica apenas neste dispositivo e não envia nada.",
      "Nenhum custo monetário de implantação é atribuído aos modelos: eles não foram medidos.",
    ],
    transicao: "Independentemente da escolha, quais princípios devem acompanhar qualquer modelagem de crédito?",
  },
  impressao: function (e) { e.argumentos = true; },

  montar: function (corpo, ctx) {
    var R = Aula.resultados;
    var est = ctx.estado;
    if (!R) {
      corpo.appendChild(h("p", { class: "resposta erro" },
        "Resultados do experimento não disponíveis: execute experimento/experimento.py e recompile."));
      return;
    }
    if (!est.modelo) est.modelo = null;
    if (!est.politica) est.politica = "congelado";
    if (!est.form) est.form = { porque: "", risco: "", monitorar: "" };

    var chaves = ["logit", "arvore", "boosting"];
    var congelado = R.politica.logit.corte_congelado;

    function linhaPolitica(k) {
      var lista = R.politica[k].teste;
      var alvo = est.politica === "congelado" ? congelado : R.politica[k].corte_otimo_calibracao;
      var melhor = lista[0], dist = Infinity;
      lista.forEach(function (l) {
        var d = Math.abs(l.corte - alvo);
        if (d < dist) { dist = d; melhor = l; }
      });
      return melhor;
    }

    var dados = chaves.map(function (k) {
      var a = R.avaliacao[k].teste;
      var p = linhaPolitica(k);
      return { chave: k, aval: a, pol: p };
    });

    var tabela = UI.tabela({
      compacta: true,
      colunas: [{ rotulo: "Evidência no teste" }].concat(chaves.map(function (k) {
        return { rotulo: Aula.dados.modelos[k].curto };
      })),
      linhas: [
        ["AUC"].concat(dados.map(function (d) { return F.dec(d.aval.auc, 4); })),
        ["Brier, qualidade probabilística"].concat(dados.map(function (d) {
          return F.dec(d.aval.brier_calibrada, 5); })),
        ["Taxa de aprovação"].concat(dados.map(function (d) { return F.pct(d.pol.aprovacao, 1); })),
        ["Inadimplência entre aprovados"].concat(dados.map(function (d) {
          return d.pol.inadimplencia === null ? "não definida" : F.pct(d.pol.inadimplencia, 2); })),
        ["Resultado por aprovado"].concat(dados.map(function (d) {
          return d.pol.resultado_medio === null ? "não definido" : F.reais(d.pol.resultado_medio); })),
        ["Resultado total da carteira"].concat(dados.map(function (d) {
          return F.reais(d.pol.resultado_total); })),
      ],
      selecionada: est.modelo ? chaves.indexOf(est.modelo) : -1,
      legenda: "Comparação dos três modelos no teste, com a mesma política",
    });
    if (est.modelo) {
      var col = chaves.indexOf(est.modelo) + 1;
      [].forEach.call(tabela.querySelectorAll("tbody tr"), function (tr) {
        tr.className = "";
        tr.children[col].setAttribute("style",
          "background:var(--cor-soft);font-weight:700;color:var(--ink)");
      });
      tabela.querySelector("thead tr").children[col].setAttribute("style",
        "background:var(--cor-soft);color:var(--ink)");
    }

    var melhorAuc = dados.reduce(function (a, b) { return b.aval.auc > a.aval.auc ? b : a; });
    var melhorRes = dados.reduce(function (a, b) {
      return b.pol.resultado_total > a.pol.resultado_total ? b : a;
    });
    var difAuc = melhorAuc.aval.auc - Math.min.apply(null, dados.map(function (d) {
      return d.aval.auc; }));

    var campos = [
      { chave: "porque", rotulo: "Por que este modelo e esta política?" },
      { chave: "risco", rotulo: "Qual é o principal risco desta escolha?" },
      { chave: "monitorar", rotulo: "Como monitorar depois da implantação?" },
    ];

    var restricoes = {
      nenhuma: "Sem restrição adicional declarada.",
      simplicidade: "Prioridade em simplicidade de manutenção: equipe enxuta, poucas " +
        "dependências e explicação direta ao cliente e ao regulador.",
      explicacao: "Prioridade em explicação individual auditável para cada recusa.",
    };
    if (!est.restricao) est.restricao = "nenhuma";

    corpo.appendChild(h("div", { class: "linha cresce" }, [
      h("div", { class: "coluna cresce" }, [
        h("div", { class: "painel claro" }, [
          h("div", { estilo: "display:flex;flex-wrap:wrap;justify-content:space-between;align-items:baseline;gap:10px" }, [
            h("h3", { class: "secao", estilo: "margin:0" },
              "Teste de fev a jul de 2024, " + F.inteiro(R.avaliacao.logit.teste.n) +
              " contratos e " + F.inteiro(R.avaliacao.logit.teste.eventos) + " eventos"),
            UI.selo("base sintética", "sim"),
          ]),
          tabela,
          h("p", { class: "nota", estilo: "margin-top:6px" },
            est.politica === "congelado"
              ? ("Política congelada antes do teste: aprovar quando a PD calibrada não passa de " +
                 F.pct(congelado, 0) + ", que é o ponto de equilíbrio econômico do slide 47.")
              : "Política alternativa: o corte que maximizou o resultado na partição de política, " +
                "escolhido antes do teste e diferente para cada modelo."),
        ]),
        h("div", { class: "painel" }, [
          h("div", { class: "grupo" }, [
            h("span", { class: "apoio" }, "Modelo candidato"),
            UI.botoes({
              compacto: true, rotulo: "modelo",
              opcoes: chaves.map(function (k) {
                return { valor: k, rotulo: Aula.dados.modelos[k].curto };
              }),
              valor: est.modelo,
              aoMudar: function (v) { est.modelo = v; App.montar("49"); },
            }),
            h("span", { class: "apoio" }, "Política"),
            UI.botoes({
              compacto: true, rotulo: "política",
              opcoes: [{ valor: "congelado", rotulo: "Corte de equilíbrio" },
                       { valor: "otimo", rotulo: "Corte da partição de política" }],
              valor: est.politica,
              aoMudar: function (v) { est.politica = v; App.montar("49"); },
            }),
          ]),
          h("div", { class: "grupo", estilo: "margin-top:8px" }, [
            h("span", { class: "apoio" }, "Restrição"),
            UI.botoes({
              compacto: true, rotulo: "restrição",
              opcoes: [{ valor: "nenhuma", rotulo: "Nenhuma" },
                       { valor: "simplicidade", rotulo: "Simplicidade" },
                       { valor: "explicacao", rotulo: "Explicação individual" }],
              valor: est.restricao,
              aoMudar: function (v) { est.restricao = v; App.montar("49"); },
            }),
            h("button", { class: "btn min", type: "button", onclick: function () {
              est.argumentos = !est.argumentos; App.montar("49");
            } }, est.argumentos ? "Esconder argumentos" : "Ver argumentos possíveis"),
            h("button", { class: "btn min fantasma", type: "button", onclick: ctx.reiniciar },
              "Reiniciar exemplo"),
          ]),
          h("p", { class: "nota", estilo: "margin-top:8px" }, restricoes[est.restricao]),
        ]),
        /* A escolha registrada fica sob os controles: na coluna da direita, com o formulário, não cabia. */
        est.modelo
          ? h("div", { class: "painel cor" }, [
              h("h3", { class: "secao" }, "Escolha registrada"),
              h("p", { class: "apoio", estilo: "margin:0;color:var(--ink)" },
                Aula.dados.modelos[est.modelo].nome + " com " +
                (est.politica === "congelado"
                  ? "corte de equilíbrio em " + F.pct(congelado, 0)
                  : "corte de " + F.pct(linhaPolitica(est.modelo).corte, 1) +
                    ", escolhido na partição de política") +
                ": aprovação de " + F.pct(linhaPolitica(est.modelo).aprovacao, 1) +
                " e inadimplência de " + F.pct(linhaPolitica(est.modelo).inadimplencia, 2) +
                " entre aprovados."),
            ])
          : null,

      ]),
      h("div", { class: "coluna", estilo: "flex:0 0 520px" }, [
        /* Os argumentos ocupam o lugar dos requisitos enquanto estão abertos: sob a tabela, na
           coluna da esquerda, eles passavam da altura do palco. */
        est.argumentos
          ? h("div", { class: "painel cor" }, [
              h("h3", { class: "secao" }, "Argumentos que a evidência sustenta"),
              h("ul", { class: "apoio", estilo: "margin:0;padding-left:20px;font-size:18px" }, [
                h("li", {}, "A maior AUC no teste é de " +
                  Aula.dados.modelos[melhorAuc.chave].curto + ", com " +
                  F.dec(melhorAuc.aval.auc, 4) + ". A diferença para o menor é de " +
                  F.dec(difAuc, 4) + ", pequena diante da variabilidade de uma única amostra."),
                h("li", {}, "O maior resultado total sob a política escolhida é de " +
                  Aula.dados.modelos[melhorRes.chave].curto + ", com " +
                  F.reais(melhorRes.pol.resultado_total) + " em " +
                  F.inteiro(melhorRes.pol.aprovados) + " aprovados."),
                h("li", {}, "Aprovação e inadimplência entre aprovados mudam junto com o modelo: " +
                  "comparar apenas AUC esconde a diferença de volume."),
                h("li", {}, "Manter o logit como referência operacional e avaliar outro método " +
                  "como desafiante é uma recomendação defensável, se a evidência sustentar."),
                h("li", {}, "Nenhum resultado aqui autoriza reajustar o modelo neste mesmo teste " +
                  "e chamar a nova medida de avaliação independente."),
              ]),
            ])
          : h("div", { class: "painel" }, [
          h("h3", { class: "secao", estilo: "margin-bottom:4px" }, "Requisitos da operação"),
          h("ul", { class: "apoio", estilo: "margin:0;padding-left:20px;font-size:17px" }, [
            h("li", {}, "equipe enxuta, sem time dedicado a manutenção de modelos"),
            h("li", {}, "explicação da recusa exigida pelo canal e pela área de conduta"),
            h("li", {}, "acompanhamento mensal, com alvo maturando 12 meses depois"),
          ]),
        ]),
        h("div", { class: "painel claro cresce" }, [
          h("h3", { class: "secao", estilo: "margin-bottom:4px" }, "Sua justificativa"),
          h("div", { class: "coluna", estilo: "gap:8px" }, campos.map(function (c) {
            var id = "just-" + c.chave;
            return h("div", { class: "ctrl" }, [
              h("label", { for: id }, c.rotulo),
              h("textarea", {
                id: id, rows: 2,
                estilo: "width:100%;font:400 18px var(--sans);padding:6px 8px;" +
                        "border:1px solid var(--rule);border-radius:4px;background:var(--surface)",
                onchange: function (ev) { est.form[c.chave] = ev.target.value; },
              }, est.form[c.chave] || ""),
            ]);
          })),
          h("p", { class: "nota", estilo: "margin-top:6px" },
            "O texto fica apenas neste dispositivo."),
        ]),

      ]),
    ]));
  },
});
