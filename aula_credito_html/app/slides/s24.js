Aula.slide({
  id: "24",
  bloco: "arvore",
  titulo: "Histórico reduz o Gini de 0,180 para 0,160",
  subtitulo: "Impureza da raiz, média ponderada dos filhos e ganho",
  conclusao: "Não basta uma folha pura: importa como toda a amostra fica depois da divisão.",
  fonte: Aula.dados.fontes.arvore,
  resumo: "Três etapas do cálculo do ganho de Gini e curva de impureza binária em função da taxa de eventos.",
  notas: {
    conducao: [
      "Peça a conta do Gini da raiz antes de revelar.",
      "Antes de ponderar, pergunte por que não usar a média simples. Mostre a diferença entre 800 e 200 registros.",
      "Termine explicitando que o algoritmo compara vários candidatos, repete o procedimento em cada nó e precisa de uma regra para parar.",
    ],
    respostas: [
      "Raiz com 10% de eventos: Gini igual a 0,180.",
      "Por histórico: 0,8 vezes 0,095 mais 0,2 vezes 0,420 resulta em 0,160, com ganho de 0,020.",
      "Por comprometimento: impureza ponderada 0,166728 e ganho 0,013272.",
      "Impureza zero em grupo puro; máximo de 0,5 quando a taxa é 50%.",
    ],
    cuidados: [
      "Gini é critério de impureza no treino. Não é AUC, KS nem lucro.",
      "Outras perdas podem orientar árvores. Não misture entropia e Gini no mesmo cálculo.",
      "Ganho de impureza não é efeito causal do histórico.",
    ],
    transicao: "Ao dividir mais, as folhas parecem mais precisas. Mas quanto podemos confiar em uma taxa calculada com poucas observações?",
  },
  impressao: function (e) { e.etapa = 4; },

  montar: function (corpo, ctx) {
    var A = Aula.dados.arvore;
    var est = ctx.estado;
    if (est.etapa === undefined) est.etapa = 1;
    if (!est.cand) est.cand = "hist";

    var cand = A.candidatos.filter(function (c) { return c.chave === est.cand; })[0];
    var outro = A.candidatos.filter(function (c) { return c.chave !== est.cand; })[0];
    var r = A.ganho(cand);
    var rOutro = A.ganho(outro);

    var etapas = [
      { titulo: "1. Impureza da raiz",
        linhas: ["p = " + F.inteiro(A.d) + " / " + F.inteiro(A.n) + " = " + F.pct(A.raiz.pd, 0),
                 "Gini = 2 × p × (1 − p) = " + F.dec(r.pai, 3)] },
      { titulo: "2. Impureza de cada filho",
        linhas: [cand.esq.rotulo + ": p = " + F.pct(cand.esq.d / cand.esq.n, 2) +
                 ", Gini = " + F.dec(r.esq, 4),
                 cand.dir.rotulo + ": p = " + F.pct(cand.dir.d / cand.dir.n, 2) +
                 ", Gini = " + F.dec(r.dir, 4)] },
      { titulo: "3. Ponderação pelo tamanho",
        linhas: ["pesos: " + F.inteiro(cand.esq.n) + "/" + F.inteiro(A.n) + " = " +
                 F.dec(r.pesoEsq, 2) + " e " + F.inteiro(cand.dir.n) + "/" + F.inteiro(A.n) +
                 " = " + F.dec(r.pesoDir, 2),
                 "Gini ponderado = " + F.dec(r.pesoEsq, 2) + " × " + F.dec(r.esq, 4) +
                 " + " + F.dec(r.pesoDir, 2) + " × " + F.dec(r.dir, 4) + " = " +
                 F.dec(r.ponderado, 6)] },
      { titulo: "4. Ganho e comparação",
        linhas: ["ganho = " + F.dec(r.pai, 3) + " − " + F.dec(r.ponderado, 6) + " = " +
                 F.dec(r.ganho, 6),
                 "candidato " + outro.rotulo.toLowerCase() + ": ganho " + F.dec(rOutro.ganho, 6)] },
    ];

    var g = Graf.novo({ w: 520, h: 300, m: { e: 78, d: 24, c: 20, b: 56 } });
    g.x(0, 1).y(0, 0.55);
    g.grade({ y: [0, 0.18, 0.5] });
    g.eixoY({ ticks: [0, 0.1, 0.2, 0.3, 0.4, 0.5], formato: function (v) { return F.dec(v, 1); },
              rotulo: "Gini" });
    g.eixoX({ ticks: [0, 0.25, 0.5, 0.75, 1], formato: function (v) { return F.pct(v, 0); },
              rotulo: "taxa de eventos no grupo" });
    g.linha(M.linspace(0, 1, 200).map(function (v) { return [v, M.gini(v)]; }),
      { cor: "var(--arvore)", largura: 3 });
    var marcas = [{ p: A.raiz.pd, rot: "raiz" },
                  { p: cand.esq.d / cand.esq.n, rot: cand.esq.rotulo },
                  { p: cand.dir.d / cand.dir.n, rot: cand.dir.rotulo }];
    marcas.forEach(function (m, i) {
      g.ponto(m.p, M.gini(m.p), { r: 7, cor: i === 0 ? "var(--ink)" : "var(--arvore)" });
      g.texto(m.p, M.gini(m.p), m.rot,
        { dx: 10, dy: i === 2 ? 20 : -10, tamanho: 16, peso: 400, cor: "var(--muted)" });
    });

    var gb = Graf.barras({
      w: 520, h: 200, larguraRot: 210, m: { d: 110, c: 12, b: 48 },
      itens: A.candidatos.map(function (cc) {
        var rr = A.ganho(cc);
        return { rotulo: cc.rotulo, valor: rr.ganho,
                 cor: cc.chave === est.cand ? "var(--arvore)" : "var(--rule)",
                 texto: F.dec(rr.ganho, 4) };
      }),
      max: 0.025, ticks: [0, 0.005, 0.01, 0.015, 0.02, 0.025],
      formato: function (v) { return F.dec(v, 3); },
      rotuloX: "ganho de impureza",
    });

    corpo.appendChild(h("div", { class: "linha cresce" }, [
      h("div", { class: "coluna cresce" },
        etapas.map(function (e, i) {
          var visivel = i < est.etapa;
          return h("div", {
            class: "painel" + (i === est.etapa - 1 ? " cor" : " claro"),
            estilo: "padding:12px 16px" + (visivel ? "" : ";opacity:.35"),
          }, [
            h("h3", { class: "secao", estilo: "margin:0 0 6px" }, e.titulo),
            visivel
              ? h("div", {}, e.linhas.map(function (t) {
                  return h("p", { estilo: "font-family:var(--serif);font-size:22px;" +
                    "color:var(--ink);margin:0 0 4px" }, t);
                }))
              : h("p", { class: "nota", estilo: "margin:0" }, "etapa ainda não revelada"),
          ]);
        })),
      h("div", { class: "coluna", estilo: "flex:0 0 560px" }, [
        h("div", { class: "painel" }, [
          h("div", { class: "grupo" }, [
            h("button", { class: "btn", type: "button", disabled: est.etapa >= 4,
              onclick: function () { est.etapa = Math.min(4, est.etapa + 1); App.montar("24"); } },
              "Próxima etapa"),
            h("button", { class: "btn min", type: "button", onclick: function () {
              est.cand = est.cand === "hist" ? "comp" : "hist"; App.montar("24");
            } }, "Trocar candidato"),
            h("button", { class: "btn min fantasma", type: "button", onclick: ctx.reiniciar },
              "Reiniciar exemplo"),
          ]),
        ]),
        h("div", { class: "painel claro cresce centro" }, [
          h("h3", { class: "secao" }, "Impureza binária: 2p(1 − p)"),
          g.svg,
        ]),
        est.etapa >= 4
          ? h("div", { class: "painel claro" }, [gb.svg])
          : h("div", { class: "painel" }, [
              h("p", { class: "apoio", estilo: "margin:0" },
                "A média simples ignoraria que um lado tem " + F.inteiro(cand.esq.n) +
                " contratos e o outro tem " + F.inteiro(cand.dir.n) + "."),
            ]),
      ]),
    ]));
  },
});
