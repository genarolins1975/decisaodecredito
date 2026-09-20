Aula.slide({
  id: "29",
  bloco: "arvore",
  titulo: "Se mudarmos um pouco a amostra, a árvore continua contando a mesma história?",
  subtitulo: "Vinte reamostragens do treino, com os mesmos hiperparâmetros",
  conclusao: "Uma regra fácil de ler pode ser sensível à amostra que a produziu.",
  fonte: Aula.dados.fontes.experimento,
  resumo: "Duas árvores de réplicas diferentes lado a lado e a dispersão das PDs dos quatro clientes nas vinte réplicas.",
  notas: {
    conducao: [
      "Pergunte qual das duas árvores é a verdadeira e use a pergunta para discutir estimativa e variabilidade.",
      "Compare estrutura e previsão: uma raiz diferente não significa mudança enorme de PD, e previsões podem variar mesmo com raízes iguais.",
    ],
    cuidados: [
      "O bootstrap ilustra sensibilidade ao treinamento. Não é intervalo preditivo calibrado do risco verdadeiro de um cliente.",
      "Não reamostramos o teste para treinar.",
      "As réplicas exibidas foram escolhidas por critério declarado: a primeira réplica de cada variável de raiz observada, e não a mais dramática.",
      "Este slide não é uma aula de random forest. Apenas situa por que ensembles exploram múltiplas funções.",
    ],
    transicao: "Antes de combinar várias árvores, vamos verificar se sabemos interpretar uma única árvore e suas limitações.",
  },

  montar: function (corpo, ctx) {
    var R = Aula.resultados;
    var D = Aula.dados;
    var est = ctx.estado;
    if (!R) {
      corpo.appendChild(h("p", { class: "resposta erro" },
        "Resultados do experimento não disponíveis: execute experimento/experimento.py e recompile."));
      return;
    }

    var reps = R.replicas_arvore.replicas;
    var raizes = R.replicas_arvore.raizes;
    /* Critério declarado de escolha: primeira réplica de cada variável de raiz. */
    var variaveis = Object.keys(raizes);
    function primeiraCom(v) {
      for (var i = 0; i < reps.length; i++) if (reps[i].raiz_variavel === v) return i;
      return 0;
    }
    if (est.a === undefined) est.a = primeiraCom(variaveis[0]);
    if (est.b === undefined) est.b = primeiraCom(variaveis[variaveis.length - 1]);
    if (!est.cliente) est.cliente = "Bruno";

    var A = reps[est.a], B = reps[est.b];
    var idxCliente = D.clientes.map(function (c) { return c.nome; }).indexOf(est.cliente);

    function painelReplica(rep, letra) {
      return h("div", { class: "painel claro cresce centro" }, [
        h("div", { estilo: "display:flex;justify-content:space-between;width:100%;align-items:baseline" }, [
          h("h3", { class: "secao", estilo: "margin:0" },
            "Réplica " + letra + ": nº " + rep.replica),
          h("span", { class: "nota" },
            F.inteiro(rep.folhas) + " folhas · AUC validação " + F.dec(rep.auc_validacao, 4)),
        ]),
        Comum.arvoreTreinada(rep.estrutura, {
          profundidade: 1, compacto: true, w: 660, h: 270, caixaW: 200, caixaH: 72,
          resumo: "Árvore da réplica " + rep.replica,
        }),
        h("p", { class: "nota", estilo: "margin:0" },
          "nomes abreviados nas caixas. raiz: " +
          (Comum.NOMES_COLUNAS[rep.raiz_variavel] || rep.raiz_variavel) +
          " ≤ " + F.dec(rep.raiz_limite, 2) +
          " · PD de " + est.cliente + ": " + F.pct(rep.pd_clientes[idxCliente], 2)),
      ]);
    }

    /* Dispersão das previsões por cliente. */
    var g = Graf.novo({ w: 600, h: 380, m: { e: 96, d: 60, c: 24, b: 60 } });
    var todos = [];
    reps.forEach(function (r) { r.pd_clientes.forEach(function (v) { todos.push(v); }); });
    var topo = Math.min(1, Math.ceil(Math.max.apply(null, todos) * 10) / 10);
    g.x(0, topo).y(0, 4);
    g.grade({ x: Graf.ticks(0, topo, 5) });
    g.eixoX({ ticks: Graf.ticks(0, topo, 5), formato: function (v) { return F.pct(v, 0); },
              rotulo: "PD prevista na réplica" });
    D.clientes.forEach(function (c, i) {
      var y = 3.5 - i;
      var vals = reps.map(function (r) { return r.pd_clientes[i]; });
      var media = M.media(vals);
      g.add(sv("text", { x: g.m.e - 14, y: g.py(y) + 7, "text-anchor": "end", "font-size": 20,
        "font-weight": 700, fill: c.nome === est.cliente ? "var(--ink)" : "var(--muted)",
        texto: c.nome }));
      vals.forEach(function (v, k) {
        var destaque = c.nome === est.cliente;
        var ehA = k === est.a, ehB = k === est.b;
        g.ponto(v, y + (k % 5 - 2) * 0.055, {
          r: ehA || ehB ? 8 : 5,
          cor: ehA ? "var(--arvore)" : ehB ? "var(--amber)" : "var(--muted)",
          bordaL: 1.2,
        });
        if (!destaque) return;
      });
      g.add(sv("line", { x1: g.px(Math.min.apply(null, vals)), x2: g.px(Math.max.apply(null, vals)),
        y1: g.py(y - 0.32), y2: g.py(y - 0.32), stroke: "var(--rule)", "stroke-width": 3 }));
      g.add(sv("text", { x: g.px(Math.max.apply(null, vals)) + 10, y: g.py(y - 0.32) + 6,
        "font-size": 16, fill: "var(--muted)",
        texto: F.pct(Math.min.apply(null, vals), 1) + " a " + F.pct(Math.max.apply(null, vals), 1) }));
    });

    corpo.appendChild(h("div", { class: "linha cresce" }, [
      h("div", { class: "coluna cresce" }, [
        h("div", { class: "linha cresce" }, [painelReplica(A, "A"), painelReplica(B, "B")]),
        h("div", { class: "painel cor" }, [
          h("p", { estilo: "font-size:21px;color:var(--ink);margin:0" },
            A.raiz_variavel === B.raiz_variavel
              ? ("As duas réplicas mantiveram a mesma variável na raiz, com limites " +
                 F.dec(A.raiz_limite, 2) + " e " + F.dec(B.raiz_limite, 2) + ".")
              : ("A raiz mudou de " + (Comum.NOMES_COLUNAS[A.raiz_variavel] || A.raiz_variavel) +
                 " para " + (Comum.NOMES_COLUNAS[B.raiz_variavel] || B.raiz_variavel) +
                 " apenas por reamostragem do treino.")),
          h("p", { class: "nota", estilo: "margin-top:6px" },
            "Entre as " + reps.length + " réplicas, a raiz foi " +
            variaveis.map(function (v) {
              return (Comum.NOMES_COLUNAS[v] || v) + " em " + raizes[v] + " delas";
            }).join(" e ") + "."),
        ]),
      ]),
      h("div", { class: "coluna", estilo: "flex:0 0 620px" }, [
        h("div", { class: "painel claro cresce centro" }, [
          h("h3", { class: "secao" }, "PD dos quatro clientes nas " + reps.length + " réplicas"),
          g.svg,
        ]),
        h("div", { class: "painel" }, [
          h("div", { class: "grupo" }, [
            h("span", { class: "apoio" }, "Réplica A"),
            UI.botoes({
              compacto: true, rotulo: "réplica A",
              opcoes: reps.slice(0, 8).map(function (r, i) {
                return { valor: i, rotulo: String(r.replica) };
              }),
              valor: est.a,
              aoMudar: function (v) { est.a = v; App.montar("29"); },
            }),
          ]),
          h("div", { class: "grupo", estilo: "margin-top:8px" }, [
            h("span", { class: "apoio" }, "Réplica B"),
            UI.botoes({
              compacto: true, rotulo: "réplica B",
              opcoes: reps.slice(8, 16).map(function (r, i) {
                return { valor: i + 8, rotulo: String(r.replica) };
              }),
              valor: est.b,
              aoMudar: function (v) { est.b = v; App.montar("29"); },
            }),
          ]),
          h("div", { class: "grupo", estilo: "margin-top:8px" }, [
            Comum.seletorCliente(est.cliente, function (v) {
              est.cliente = v; App.montar("29");
            }, { compacto: true }),
            h("button", { class: "btn min fantasma", type: "button", onclick: ctx.reiniciar },
              "Reiniciar exemplo"),
          ]),
          h("p", { class: "nota", estilo: "margin-top:8px" },
            "Mesma complexidade nas " + reps.length + " réplicas: profundidade " +
            R.replicas_arvore.profundidade + " e mínimo de " +
            F.inteiro(R.replicas_arvore.min_folha) + " contratos por folha."),
        ]),
      ]),
    ]));
  },
});
