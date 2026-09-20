Aula.slide({
  id: "03",
  bloco: "problema",
  titulo: "Probabilidade de quê, para quem e até quando?",
  subtitulo: "Atraso superior a 90 dias em qualquer momento dos 12 meses após a contratação",
  conclusao: "Sem a mesma definição de inadimplência, duas PDs não são comparáveis.",
  fonte: "Trajetórias ilustrativas de contratos fictícios; cálculo próprio",
  resumo: "Três trajetórias de atraso em dias ao longo de 12 meses, com linha de 90 dias e máscara do que ainda não foi observado.",
  notas: {
    conducao: [
      "Peça a classificação do contrato C antes de mostrar o status.",
      "Separe explicitamente ainda não aconteceu de não acontecerá dentro da janela.",
      "Leve o controle até o mês 12 e consolide os três elementos: população elegível, evento e horizonte.",
    ],
    respostas: [
      "A atinge 95 dias no mês 8, portanto y = 1.",
      "B fecha os 12 meses com máximo de 88 dias, portanto y = 0.",
      "C tem apenas 6 meses observados e nenhum evento: alvo incompleto, nunca y = 0.",
      "Chegar exatamente a 90 dias não satisfaz superior a 90 dias. No mês 7 o contrato A ainda não tem evento.",
    ],
    cuidados: [
      "Esta é uma definição operacional didática. Não é transcrição de norma bancária.",
      "Mudar o limite de atraso ou o horizonte muda o alvo previsto, e portanto muda o modelo.",
    ],
    transicao: "Agora sabemos o que prever. Precisamos garantir que os dados usados para prever existiam antes do resultado.",
  },
  impressao: function (e) { e.mes = 12; },

  montar: function (corpo, ctx) {
    var est = ctx.estado;
    if (!est.mes) est.mes = 6;

    var contratos = [
      { nome: "Contrato A", serie: [0, 0, 0, 10, 30, 60, 90, 95, 125, 155, 185, 215], observado: 12,
        cor: "var(--alert)" },
      { nome: "Contrato B", serie: [0, 0, 20, 45, 70, 88, 60, 0, 0, 15, 30, 0], observado: 12,
        cor: "var(--ok)" },
      { nome: "Contrato C", serie: [0, 0, 0, 15, 35, 50], observado: 6, cor: "var(--muted)" },
    ];

    function status(c, ate) {
      var limite = Math.min(ate, c.observado);
      var evento = c.serie.slice(0, limite).some(function (v) { return v > 90; });
      var mesEvento = 0;
      c.serie.slice(0, limite).forEach(function (v, i) {
        if (v > 90 && !mesEvento) mesEvento = i + 1;
      });
      if (evento) return { chave: "evento", texto: "evento identificado no mês " + mesEvento + ", y = 1",
                           tipo: "sim" };
      if (limite >= 12) return { chave: "sem", texto: "janela completa sem evento, y = 0", tipo: "ok" };
      return { chave: "incompleto", texto: "janela incompleta, alvo ainda desconhecido", tipo: "neutro" };
    }

    function grafico(c) {
      var g = Graf.novo({ w: 440, h: 246, m: { e: 54, d: 16, c: 14, b: 36 } });
      g.x(0, 12).y(0, 240);
      var ate = Math.min(est.mes, c.observado);
      // máscara do que ainda não foi observado
      var hach = g.hachura("hach" + c.nome.replace(/\s/g, ""), "var(--muted)");
      if (ate < 12) {
        g.retangulo(ate, 0, 12, 240, { cor: hach, opacidade: .9 });
        g.texto(11.9, 222, "ainda não observado",
          { ancora: "end", cor: "var(--muted)", tamanho: 15, peso: 400 });
      }
      g.grade({ y: [90] });
      g.add(sv("line", { x1: g.px(0), x2: g.px(12), y1: g.py(90), y2: g.py(90),
        stroke: "var(--alert)", "stroke-width": 2, "stroke-dasharray": "6 4" }));
      g.texto(0.15, 100, "90 dias", { cor: "var(--alert)", tamanho: 16 });
      g.eixoX({ ticks: [0, 3, 6, 9, 12] });
      g.eixoY({ ticks: [0, 90, 180] });
      var pts = c.serie.slice(0, ate).map(function (v, i) { return [i + 1, v]; });
      if (pts.length) {
        g.linha(pts, { cor: c.cor, largura: 3 });
        pts.forEach(function (p) {
          g.ponto(p[0], p[1], { r: 4, cor: p[1] > 90 ? "var(--alert)" : c.cor, bordaL: 1 });
        });
      }
      return g.svg;
    }

    var cartoes = h("div", { class: "g3 cresce" }, contratos.map(function (c) {
      var s = status(c, est.mes);
      return h("div", { class: "painel claro coluna" }, [
        h("div", { estilo: "display:flex;justify-content:space-between;align-items:baseline" }, [
          h("h3", { class: "secao", estilo: "margin:0" }, c.nome),
          UI.selo(s.chave === "evento" ? "y = 1" : s.chave === "sem" ? "y = 0" : "alvo incompleto",
            s.tipo),
        ]),
        grafico(c),
        h("p", { class: "nota" }, s.texto),
        c.observado < 12
          ? h("p", { class: "nota" }, "Contratado há 6 meses: a janela de 12 meses ainda não terminou.")
          : null,
      ]);
    }));

    var controle = UI.slider({
      rotulo: "Data até a qual conhecemos os dados (mês desde a contratação)",
      min: 3, max: 12, passo: 1, valor: est.mes,
      formato: function (v) { return "mês " + v; },
      aoMudar: function (v) { est.mes = v; App.montar("03"); },
    });

    corpo.appendChild(h("div", { class: "linha topo" }, [
      h("div", { class: "painel cor cresce" }, [
        h("p", { estilo: "font-size:26px;color:var(--ink);margin:0" },
          "Evento: atraso superior a 90 dias em qualquer momento dos 12 meses seguintes à contratação."),
        h("p", { class: "nota", estilo: "margin-top:6px" },
          "População: solicitantes elegíveis, sem inadimplência corrente na proposta. Unidade: um contrato de crédito pessoal."),
      ]),
      h("div", { estilo: "flex:0 0 430px" }, h("div", { class: "painel" }, [
        controle,
        h("p", { class: "nota", estilo: "margin-top:8px" },
          "Atingir exatamente 90 dias não satisfaz a definição. O evento exige mais de 90."),
      ])),
    ]));
    corpo.appendChild(cartoes);
    corpo.appendChild(h("p", { class: "nota", estilo: "text-align:center;margin:0" },
      "Eixo horizontal: meses desde a contratação. Eixo vertical: atraso em dias."));
  },
});
