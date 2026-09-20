Aula.slide({
  id: "09",
  bloco: "logit",
  titulo: "Um escore, uma probabilidade entre 0% e 100%",
  subtitulo: "A curva logística converte qualquer número real em probabilidade",
  conclusao: "A mesma variação de escore pode gerar mudanças muito diferentes de probabilidade.",
  fonte: Aula.dados.fontes.manual,
  resumo: "Curva logística com ponto móvel, guias até os eixos e marcadores dos quatro clientes.",
  notas: {
    conducao: [
      "Comece em Bruno. Vá até z = 0 e pergunte o valor esperado antes de revelar.",
      "Compare o efeito de somar 1 ao escore em z = −5 e em z = 0.",
      "Termine em Ana e Bruno para mostrar que a função preserva a ordem dos escores.",
    ],
    cuidados: [
      "A sigmoide é estritamente crescente: a ordem de z e a ordem de p são a mesma.",
      "Um escore finito nunca produz exatamente 0 ou 1. A formatação pode arredondar para 0,00%, o que não significa impossibilidade.",
      "O ponto de 50% é referência matemática, não corte de aprovação.",
    ],
    transicao: "Para interpretar os coeficientes, precisamos entender a escala em que a soma foi feita: o logaritmo das odds.",
  },
  impressao: function (e) { if (e.z === undefined) e.z = Aula.dados.logit.z(Aula.dados.cliente("Bruno")); },

  montar: function (corpo, ctx) {
    var D = Aula.dados, L = D.logit;
    var est = ctx.estado;
    var zBruno = L.z(D.cliente("Bruno"));
    if (est.z === undefined) est.z = zBruno;
    if (est.zoom === undefined) est.zoom = false;

    var p = M.sigmoid(est.z);
    var yMax = est.zoom ? 0.3 : 1;
    var ticksY = est.zoom ? [0, 0.05, 0.1, 0.15, 0.2, 0.25, 0.3] : [0, 0.25, 0.5, 0.75, 1];

    var g = Graf.novo({ w: 980, h: 580, m: { e: 92, d: 34, c: 26, b: 64 },
      resumo: "Curva logística de z igual a menos oito até quatro." });
    g.x(-8, 4).y(0, yMax);
    g.grade({ y: ticksY, x: [-8, -6, -4, -2, 0, 2, 4] });
    g.eixoY({ ticks: ticksY, formato: function (v) { return F.pct(v, 0); },
              rotulo: "probabilidade de inadimplência" });
    g.eixoX({ ticks: [-8, -6, -4, -2, 0, 2, 4], rotulo: "escore z" });
    var pts = M.linspace(-8, 4, 400).map(function (v) { return [v, M.sigmoid(v)]; });
    g.linha(pts.filter(function (q) { return q[1] <= yMax; }), { cor: "var(--logit)", largura: 4 });

    if (!est.zoom) {
      g.add(sv("line", { x1: g.px(0), x2: g.px(0), y1: g.py(0), y2: g.py(0.5),
        stroke: "var(--muted)", "stroke-dasharray": "4 4" }));
      g.texto(0, 0.5, "z = 0 e p = 50%, referência matemática",
        { dx: -10, dy: -12, ancora: "end", tamanho: 17, peso: 400, cor: "var(--muted)" });
    }

    D.clientes.forEach(function (c) {
      var z = L.z(c), pc = M.sigmoid(z);
      if (pc > yMax) return;
      g.ponto(z, pc, { r: 6, cor: "var(--ink)", bordaL: 1.5 });
      g.texto(z, pc, c.nome, { dx: 9, dy: -10, tamanho: 17, peso: 400, cor: "var(--muted)" });
    });

    if (p <= yMax) {
      g.guia(est.z, p, { cor: "var(--logit)" });
      g.ponto(est.z, p, { r: 11, cor: "var(--logit)" });
      g.texto(est.z, p, F.pct(p), { dx: 14, dy: -14, tamanho: 24, cor: "var(--ink)" });
    }

    var noPerfil = D.clientes.filter(function (c) {
      return Math.abs(L.z(c) - est.z) < 1e-9;
    })[0];

    corpo.appendChild(h("div", { class: "linha cresce" }, [
      h("div", { class: "painel claro cresce centro", estilo: "display:flex" }, g.svg),
      h("div", { class: "coluna", estilo: "flex:0 0 420px" }, [
        h("div", { class: "painel cor" }, [
          h("p", { class: "formula gg", estilo: "background:none;border:none;padding:0;margin:0" },
            "p = 1 / (1 + e^−z)"),
          h("div", { class: "kv", estilo: "margin-top:12px;font-size:24px" }, [
            h("dt", {}, "escore z"), h("dd", {}, F.dec(est.z, 3)),
            h("dt", {}, "PD"), h("dd", {}, F.pct(p, 2)),
          ]),
          h("p", { class: "nota", estilo: "margin-top:8px" },
            "Leitura: aproximadamente " + F.dec(p * 100, 1) +
            " eventos em 100 exposições semelhantes, e não uma contagem garantida."),
          h("p", { class: "nota" }, noPerfil
            ? "Escore do perfil de " + noPerfil.nome + "."
            : "Simulação de escore: nenhum perfil canônico tem exatamente este z."),
        ]),
        h("div", { class: "painel" }, [
          UI.slider({
            rotulo: "Escore z", min: -8, max: 4, passo: 0.025, valor: est.z,
            formato: function (v) { return F.pct(M.sigmoid(v), 2); },
            aoMudar: function (v) { est.z = v; App.montar("09"); },
          }),
          h("div", { class: "grupo", estilo: "margin-top:10px" },
            [Comum.seletorCliente(noPerfil ? noPerfil.nome : null, function (v) {
              est.z = L.z(D.cliente(v)); App.montar("09");
            }, { compacto: true })]),
          h("div", { class: "grupo", estilo: "margin-top:10px" }, [
            UI.alterna({
              rotulo: "zoom", valor: est.zoom,
              ligadoRotulo: "Voltar ao eixo de 0% a 100%",
              desligadoRotulo: "Ampliar as PDs baixas (0% a 30%)",
              aoMudar: function (v) { est.zoom = v; App.montar("09"); },
            }),
            h("button", { class: "btn fantasma", type: "button", onclick: ctx.reiniciar },
              "Reiniciar exemplo"),
          ]),
          est.zoom ? h("p", { class: "nota", estilo: "margin-top:8px" },
            "Eixo vertical alterado: agora vai de 0% a 30%.") : null,
        ]),
      ]),
    ]));
  },
});
