Aula.slide({
  id: "22",
  bloco: "arvore",
  titulo: "Nesta folha, 18 de 600 contratos ficaram inadimplentes",
  subtitulo: "A PD da folha é a frequência observada no grupo",
  conclusao: "A previsão é a frequência observada no grupo, sujeita à incerteza e à generalização.",
  fonte: Aula.dados.fontes.arvore,
  resumo: "Árvore de 1.000 contratos com contagens em cada nó e PD por folha, com o percurso do cliente selecionado.",
  notas: {
    conducao: [
      "Construa a conta de Ana em voz alta e peça a de Bruno.",
      "Pergunte se clientes da mesma folha terão a mesma previsão mesmo com rendas diferentes: sim, nesta árvore, porque a renda não entra nas perguntas.",
    ],
    respostas: [
      "Ana 18/600 = 3%. Bruno 12/80 = 15%. Carla 22/200 = 11%. Diego 48/120 = 40%.",
      "As folhas somam 1.000 contratos e 100 eventos, iguais à raiz.",
    ],
    cuidados: [
      "A taxa aparente da folha não comprova calibração futura.",
      "Este exemplo é sem pesos. Com ajuste ponderado, a fórmula da folha refletiria os pesos.",
      "Estas PDs são da árvore didática. Não são previsões do experimento estimado, e não devem ser comparadas com as PDs manuais do logit como se uma fosse mais correta.",
    ],
    transicao: "Por que a primeira pergunta foi sobre histórico, e não sobre renda ou comprometimento?",
  },
  impressao: function (e) { e.denominadores = true; },

  montar: function (corpo, ctx) {
    var D = Aula.dados, A = D.arvore;
    var est = ctx.estado;
    if (!est.cliente) est.cliente = "Ana";
    if (est.denominadores === undefined) est.denominadores = true;

    var c = D.cliente(est.cliente);
    var folha = A.folhaDe(c);
    var folhas = A.folhas();

    var arvore = Comum.arvoreDidatica({
      cliente: c,
      mostrarNumeros: est.denominadores,
      mostrarPd: true,
      w: 962, h: 420, caixaW: 220, caixaH: est.denominadores ? 62 : 46,
      rotuloFolha: function () { return "folha"; },
      resumo: "Árvore com contagens: raiz de 1.000 contratos e 100 eventos, quatro folhas.",
    });

    var soma = folhas.reduce(function (a, f) { return { n: a.n + f.n, d: a.d + f.d }; },
      { n: 0, d: 0 });

    var tabela = UI.tabela({
      compacta: true,
      colunas: [{ rotulo: "Folha" }, { rotulo: "n" }, { rotulo: "Eventos" }, { rotulo: "PD" }],
      linhas: folhas.map(function (f) {
        return [f.regra, F.inteiro(f.n), F.inteiro(f.d), F.pct(f.pd, f.pd * 100 % 1 === 0 ? 0 : 1)];
      }),
      selecionada: folhas.indexOf(folha),
      legenda: "Contagens e taxas das quatro folhas",
    });
    tabela.querySelector("tbody").appendChild(h("tr", {}, [
      h("th", { scope: "row", class: "rotulo" }, "Soma das folhas"),
      h("td", {}, F.inteiro(soma.n)), h("td", {}, F.inteiro(soma.d)),
      h("td", {}, F.pct(soma.d / soma.n, 0)),
    ]));

    corpo.appendChild(h("div", { class: "linha cresce" }, [
      h("div", { class: "coluna cresce" }, [
        h("div", { class: "painel claro cresce centro" }, arvore),
        h("div", { class: "painel claro" }, tabela),
      ]),
      h("div", { class: "coluna", estilo: "flex:0 0 470px" }, [
        h("div", { class: "painel cor" }, [
          h("div", { estilo: "display:flex;flex-wrap:wrap;justify-content:space-between;align-items:baseline;gap:10px" }, [
            h("h3", { class: "secao", estilo: "margin:0" }, "Folha de " + c.nome),
            UI.selo("árvore didática", "neutro"),
          ]),
          h("p", { class: "apoio", estilo: "margin:6px 0" }, folha.regra),
          h("p", { class: "grande" },
            F.inteiro(folha.d) + " / " + F.inteiro(folha.n) + " = " +
            F.pct(folha.pd, folha.pd * 100 % 1 === 0 ? 0 : 1)),
          Comum.composicao(folha.n, folha.d, { w: 400, h: 30 }),
          h("p", { class: "nota", estilo: "margin-top:8px" },
            "Barra vermelha: contratos com evento. Barra clara: contratos sem evento."),
        ]),
        h("div", { class: "painel" }, [
          h("div", { class: "ctrl" }, [
            h("label", {}, "Cliente"),
            Comum.seletorCliente(est.cliente, function (v) {
              est.cliente = v; App.montar("22");
            }, { compacto: true }),
          ]),
          h("div", { class: "grupo", estilo: "margin-top:12px" }, [
            UI.alterna({
              rotulo: "denominadores", valor: est.denominadores,
              ligadoRotulo: "Leitura simples, só a taxa",
              desligadoRotulo: "Mostrar denominadores",
              aoMudar: function (v) { est.denominadores = v; App.montar("22"); },
            }),
            h("button", { class: "btn fantasma", type: "button", onclick: ctx.reiniciar },
              "Reiniciar exemplo"),
          ]),
        ]),
        h("div", { class: "painel claro cresce" }, [
          h("h3", { class: "secao" }, "Conferência"),
          h("p", { class: "apoio" },
            "As quatro folhas somam " + F.inteiro(soma.n) + " contratos e " +
            F.inteiro(soma.d) + " eventos, exatamente os totais da raiz."),
          h("p", { class: "nota" },
            "Mesma folha, mesma previsão: dois clientes com rendas diferentes recebem a mesma PD, " +
            "porque a renda não participa das perguntas desta árvore."),
        ]),
      ]),
    ]));
  },
});
