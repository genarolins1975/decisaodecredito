Aula.slide({
  id: "39",
  bloco: "boosting",
  titulo: "Continuar melhorando o treino pode deixar de ajudar a validação",
  subtitulo: "Regra de parada com tolerância e paciência, definida antes de olhar o teste",
  conclusao: "A melhor iteração é escolhida usando uma amostra destinada a essa escolha.",
  fonte: Aula.dados.fontes.experimento,
  resumo: "Log loss de treino e de validação por iteração, com a melhor iteração e a iteração de parada marcadas.",
  notas: {
    conducao: [
      "Peça que a turma sugira onde parar antes de revelar toda a curva.",
      "Compare o palpite com a regra: tolerância e paciência evitam reagir a variações pequenas.",
      "Mostre que o mínimo aparente pode ser ruidoso.",
    ],
    cuidados: [
      "Melhor iteração e iteração de parada são coisas diferentes. A parada acontece depois da paciência, não no mínimo.",
      "A validação usada é fora do tempo, definida no protocolo. Não é um corte aleatório interno da biblioteca.",
      "Escolher o número de árvores é seleção de hiperparâmetro, e usa a mesma amostra de validação.",
      "Um eventual reajuste com mais dados precisa respeitar a disponibilidade temporal e ser definido antes de calibrar e testar.",
    ],
    transicao: "Com esses controles, podemos avaliar em que condições a flexibilidade do boosting oferece ganhos e quais custos ela traz.",
  },
  impressao: function (e) { e.revelado = 300; },

  montar: function (corpo, ctx) {
    var R = Aula.resultados;
    var est = ctx.estado;
    if (!R) {
      corpo.appendChild(h("p", { class: "resposta erro" },
        "Resultados do experimento não disponíveis: execute experimento/experimento.py e recompile."));
      return;
    }

    var B = R.modelos.boosting;
    var cen = B.cenarios.filter(function (c) {
      return c.taxa === B.taxa && c.profundidade === B.profundidade;
    })[0];
    var nMax = cen.perdas_validacao.length;
    if (est.revelado === undefined) est.revelado = 20;
    if (est.selecionada === undefined) est.selecionada = null;

    var vis = Math.min(est.revelado, nMax);

    var g = Graf.novo({ w: 1000, h: 540, m: { e: 100, d: 150, c: 28, b: 64 },
      resumo: "Curvas de perda de treino e validação por iteração." });
    var todas = cen.perdas_treino.concat(cen.perdas_validacao);
    g.x(1, nMax).y(Math.min.apply(null, todas) - 0.004, Math.max.apply(null, todas) + 0.004);
    var ticksY = Graf.ticks(g.dy[0], g.dy[1], 5);
    g.grade({ y: ticksY });
    g.eixoY({ ticks: ticksY, formato: function (v) { return F.dec(v, 3); }, rotulo: "log loss" });
    g.eixoX({ ticks: [1, 50, 100, 150, 200, 250, 300], rotulo: "iteração" });

    [["perdas_treino", "var(--muted)", "treino"], ["perdas_validacao", "var(--boost)", "validação"]]
      .forEach(function (par) {
        var pts = cen[par[0]].slice(0, vis).map(function (v, i) { return [i + 1, v]; });
        if (pts.length < 2) return;
        g.linha(pts, { cor: par[1], largura: 3 });
        g.texto(pts[pts.length - 1][0], pts[pts.length - 1][1], par[2],
          { dx: 10, dy: 5, tamanho: 19, cor: par[1] });
      });

    if (vis >= cen.melhor_iteracao) {
      g.add(sv("line", { x1: g.px(cen.melhor_iteracao), x2: g.px(cen.melhor_iteracao),
        y1: g.py(g.dy[0]), y2: g.py(g.dy[1]), stroke: "var(--ok)", "stroke-width": 2 }));
      g.texto(cen.melhor_iteracao, g.dy[1], "melhor iteração " + cen.melhor_iteracao,
        { dx: 6, dy: 18, tamanho: 17, peso: 400, cor: "var(--ok)" });
    }
    if (vis >= cen.iteracao_parada && cen.iteracao_parada < nMax) {
      g.add(sv("line", { x1: g.px(cen.iteracao_parada), x2: g.px(cen.iteracao_parada),
        y1: g.py(g.dy[0]), y2: g.py(g.dy[1]), stroke: "var(--alert)", "stroke-width": 2,
        "stroke-dasharray": "6 4" }));
      g.texto(cen.iteracao_parada, g.dy[0], "parada " + cen.iteracao_parada,
        { dx: 6, dy: -10, tamanho: 17, peso: 400, cor: "var(--alert)" });
    }
    if (est.selecionada) {
      g.ponto(est.selecionada, cen.perdas_validacao[est.selecionada - 1], { r: 10, cor: "var(--ink)" });
    }

    /* Contador de paciência calculado com a mesma regra do notebook. */
    var espera = 0, referencia = Infinity;
    for (var i = 0; i < vis; i++) {
      if (cen.perdas_validacao[i] < referencia - B.tolerancia) {
        referencia = cen.perdas_validacao[i]; espera = 0;
      } else { espera += 1; }
    }

    corpo.appendChild(h("div", { class: "linha cresce" }, [
      h("div", { class: "painel claro cresce centro" }, g.svg),
      h("div", { class: "coluna", estilo: "flex:0 0 470px" }, [
        h("div", { class: "painel cor", estilo: "padding:10px 16px" }, [
          h("h3", { class: "secao", estilo: "margin-bottom:4px" },
            "Regra definida antes de treinar"),
          h("p", { class: "apoio", estilo: "margin:0;font-size:18px" },
            "máximo de " + F.inteiro(B.n_estimators) + " iterações · tolerância " +
            F.dec(B.tolerancia, 6) + " · paciência " + F.inteiro(B.paciencia) +
            " · escolha na validação fora do tempo"),
        ]),
        h("div", { class: "painel" }, [
          h("div", { class: "grupo" }, [
            h("button", { class: "btn", type: "button", disabled: vis >= nMax,
              onclick: function () {
                est.revelado = Math.min(nMax, vis + 20); App.montar("39");
              } }, "Avançar treinamento"),
            h("button", { class: "btn", type: "button", onclick: function () {
              est.revelado = nMax; est.selecionada = cen.melhor_iteracao; App.montar("39");
            } }, "Ir para a melhor iteração"),
            h("button", { class: "btn fantasma", type: "button", onclick: ctx.reiniciar },
              "Reiniciar exemplo"),
          ]),
          h("p", { class: "apoio", estilo: "margin-top:10px;font-size:18px" },
            F.inteiro(vis) + " de " + nMax + " iterações reveladas · melhor validação até aqui " +
            F.dec(referencia, 5) + " · paciência " +
            (espera > 0 ? F.inteiro(espera) + " de " + B.paciencia : "sem espera")),
          h("p", { class: "nota", estilo: "margin-top:4px" },
            "Curvas calculadas no notebook, reveladas em lotes de 20 iterações."),
        ]),
        h("div", { class: "painel claro cresce", estilo: "padding:12px 16px" }, [
          h("h3", { class: "secao", estilo: "margin-bottom:5px" },
            "Melhor iteração e iteração de parada"),
          h("p", { class: "apoio", estilo: "font-size:18px" },
            "Melhor iteração na validação: " + F.inteiro(cen.melhor_iteracao) +
            ", com log loss " + F.dec(cen.perda_validacao, 5) + ". " +
            (cen.iteracao_parada < nMax
              ? ("A paciência encerraria em " + F.inteiro(cen.iteracao_parada) +
                 ", depois do mínimo. O modelo servido é o da melhor iteração.")
              : ("A paciência não foi atingida antes do limite de " + F.inteiro(nMax) +
                 ". A escolha recai sobre a melhor iteração observada."))),
          h("p", { class: "nota" }, "A curva do teste não aparece em nenhum seletor."),
        ]),
      ]),
    ]));
  },
});
