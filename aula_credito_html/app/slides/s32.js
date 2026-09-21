Aula.slide({
  id: "32",
  bloco: "boosting",
  titulo: "A próxima árvore aprende a partir das previsões atuais",
  subtitulo: "Um ciclo de atualização em quatro passos",
  conclusao: "Cada árvore responde ao que ainda precisa melhorar na previsão atual.",
  fonte: Aula.dados.fontes.boosting,
  resumo: "Ciclo em quatro passos: prever, calcular a direção, ajustar a correção e atualizar o escore, com a régua do escore acumulado.",
  notas: {
    conducao: [
      "Pergunte se cada árvore produz uma nova PD a ser somada.",
      "Revele que o objeto somado é F, um escore na escala de log odds neste caso.",
      "Reconecte ao slide 09: só ao final aplicamos a função logística.",
    ],
    respostas: [
      "Novo escore é igual ao escore atual mais a taxa de aprendizagem vezes a contribuição da árvore.",
      "A árvore de regressão devolve números positivos ou negativos, não um voto entre adimplente e inadimplente.",
      "Em combinação independente, os modelos são ajustados sem esse encadeamento e depois agregados.",
    ],
    cuidados: [
      "O algoritmo pode otimizar perdas diferentes. Aqui o alvo é binário e a perda é logística.",
      "O gradiente depende da função de perda escolhida.",
      "Esta é uma apresentação de primeira ordem, didaticamente válida. Implementações podem usar atualizações diferentes nas folhas.",
    ],
    transicao: "Antes de corrigir qualquer coisa, precisamos de uma previsão inicial. Qual seria a melhor se tratássemos todos igualmente?",
  },
  impressao: function (e) { e.passo = 4; },

  montar: function (corpo, ctx) {
    var B = Aula.dados.boosting;
    var est = ctx.estado;
    if (est.passo === undefined) est.passo = 0;

    var hist = B.rodar(2, 1);
    /* Observação representativa do grupo B: comprometimento acima do corte. */
    var it1 = hist[1];
    var pAtual = hist[0].grupos.B.p;
    var FAtual = hist[0].grupos.B.F;
    var linhaB = it1.linhas.filter(function (l) { return l.grupo === "B" && l.y === 0; })[0];

    var passos = [
      { titulo: "1. Prever com o que já existe",
        conta: Mat.b("p = \\sigma(F) = \\frac{1}{1+e^{-F}} = \\frac{1}{1+e^{" + Mat.n(-FAtual, 4) + "}} = " +
          Mat.pct(pAtual, 4)),
        nota: "A previsão atual do grupo vem do escore acumulado até aqui, na mesma logística do slide 09." },
      { titulo: "2. Calcular a direção de melhoria",
        conta: Mat.b("r = -\\frac{\\partial L}{\\partial F} = y - p = " + Mat.n(linhaB.y, 0) + " - " +
          Mat.n(pAtual, 4) + " = " + Mat.n(linhaB.r, 4)),
        /* É aqui que o nome da técnica se justifica: o resíduo y menos p não é escolha arbitrária,
           é o gradiente negativo da perda logística em relação ao escore. */
        nota: "O resíduo não é escolha de conveniência: para a perda logística do slide 13, o gradiente negativo em relação ao escore é exatamente y menos p. Por isso a técnica se chama gradient boosting." },
      { titulo: "3. Ajustar uma árvore pequena aos r",
        conta: Mat.b("h_1(\\text{folha B}) = \\overline{r}_{\\text{B}} = " + Mat.n(it1.grupos.B.h, 6)),
        nota: "A árvore devolve um número por folha, positivo ou negativo. Não é um voto." },
      { titulo: "4. Atualizar o escore",
        conta: Mat.b("F_1 = F_0 + \\eta\\,h_1 = " + Mat.n(FAtual, 4) + " + 1 \\times " +
          Mat.n(it1.grupos.B.h, 6) + " = " + Mat.n(it1.grupos.B.F, 4)),
        nota: "Só depois de somar todas as contribuições aplicamos a função logística." },
    ];

    /* Régua do escore acumulado. */
    var g = Graf.novo({ w: 470, h: 240, m: { e: 130, d: 130, c: 46, b: 64 } });
    g.x(-1.8, -0.6).y(0, 1);
    g.eixoX({ ticks: [-1.8, -1.5, -1.2, -0.9, -0.6], em: 0.4,
              formato: function (v) { return F.dec(v, 1); }, rotulo: "escore F do grupo B" });
    g.add(sv("line", { x1: g.px(-1.8), x2: g.px(-0.6), y1: g.py(0.4), y2: g.py(0.4),
      stroke: "var(--rule)", "stroke-width": 3 }));
    var marcas = [
      { F: hist[0].grupos.B.F, rot: "início", visivel: true },
      { F: hist[1].grupos.B.F, rot: "depois da árvore 1", visivel: est.passo >= 4 },
      { F: hist[2].grupos.B.F, rot: "depois da árvore 2", visivel: false },
    ];
    marcas.forEach(function (m) {
      if (!m.visivel) return;
      g.ponto(m.F, 0.4, { r: 10, cor: "var(--boost)" });
      g.texto(m.F, 0.4, m.rot, { ancora: "middle", dy: -40, tamanho: 18, cor: "var(--ink)" });
      g.texto(m.F, 0.4, F.dec(m.F, 4), { ancora: "middle", dy: -20, tamanho: 17, peso: 400,
        cor: "var(--muted)" });
    });
    if (est.passo >= 4) {
      g.add(sv("line", { x1: g.px(hist[0].grupos.B.F), x2: g.px(hist[1].grupos.B.F),
        y1: g.py(0.4), y2: g.py(0.4), stroke: "var(--boost)", "stroke-width": 6,
        "stroke-linecap": "round" }));
    }

    corpo.appendChild(h("div", { class: "linha cresce" }, [
      h("div", { class: "coluna cresce" }, [
        h("div", { class: "painel cor" }, [
          h("p", { estilo: "font-family:var(--serif);font-size:27px;color:var(--ink);margin:0" },
            "novo escore = escore atual + taxa de aprendizagem × contribuição da árvore"),
          h("p", { class: "formula peq", estilo: "margin-top:8px;background:none;border:none;padding:0" },
            Mat.b("F_m = F_{m-1} + \\eta\\, h_m")),
        ]),
        h("div", { class: "g2 cresce" }, passos.map(function (p, i) {
          var visivel = i < est.passo;
          return h("div", {
            class: "painel" + (i === est.passo - 1 ? " cor" : " claro"),
            estilo: "padding:12px 16px" + (visivel ? "" : ";opacity:.4"),
          }, [
            h("h3", { class: "secao", estilo: "margin:0 0 6px" }, p.titulo),
            visivel
              ? h("div", {}, [
                  h("p", { estilo: "font-size:21px;color:var(--ink);margin:0" }, p.conta),
                  h("p", { class: "nota", estilo: "margin-top:6px" }, p.nota),
                ])
              : h("p", { class: "nota", estilo: "margin:0" }, "passo ainda não executado"),
          ]);
        })),
      ]),
      h("div", { class: "coluna", estilo: "flex:0 0 520px" }, [
        h("div", { class: "painel claro centro" }, [
          h("h3", { class: "secao" }, "A régua do escore acumulado"),
          g.svg,
          h("p", { class: "nota", estilo: "margin:0" },
            "PD aparece apenas depois da transformação logística: " +
            (est.passo >= 4
              ? F.pct(hist[0].grupos.B.p, 2) + " passa a " + F.pct(hist[1].grupos.B.p, 2)
              : "o ciclo ainda não terminou")),
        ]),
        h("div", { class: "painel" }, [
          h("div", { class: "grupo" }, [
            h("button", { class: "btn", type: "button", disabled: est.passo >= 4,
              onclick: function () { est.passo = Math.min(4, est.passo + 1); App.montar("32"); } },
              est.passo === 0 ? "Um ciclo" : "Próximo passo"),
            h("button", { class: "btn", type: "button", onclick: function () {
              est.comparar = !est.comparar; App.montar("32");
            } }, est.comparar ? "Esconder a comparação" : "Comparar mecanismos"),
            h("button", { class: "btn fantasma", type: "button", onclick: ctx.reiniciar },
              "Reiniciar exemplo"),
          ]),
          est.comparar
            ? h("p", { class: "nota", estilo: "margin-top:10px" },
                "Em uma combinação independente, cada modelo é ajustado sem conhecer o estado dos " +
                "demais e as previsões são agregadas no fim. No boosting, a árvore seguinte é " +
                "ajustada aos resíduos deixados pelas anteriores. É esse encadeamento que muda " +
                "o que cada árvore aprende.")
            : null,
        ]),
        h("p", { class: "nota" },
          "Miniatura didática de 10 registros, com taxa de aprendizagem igual a 1 apenas para " +
          "facilitar a leitura. O registro usado no passo 2 tem y = 0 e pertence ao grupo B."),
      ]),
    ]));
  },
});
