Aula.slide({
  id: "06",
  bloco: "problema",
  titulo: "O mesmo cliente, três formas de aprender o risco",
  subtitulo: "A ficha de entrada é a mesma nos três mecanismos",
  conclusao: "Os dados e o objetivo são comuns. Muda a forma de construir a previsão.",
  fonte: Aula.dados.fontes.conceito,
  resumo: "Três painéis com o mecanismo de cada técnica: soma ponderada com curva logística, percurso em árvore e contribuições sucessivas ao escore.",
  notas: {
    conducao: [
      "Passe rapidamente pelos três mecanismos, sem fórmulas.",
      "Pergunte qual parece mais fácil de explicar e se isso basta para escolher.",
      "Termine selecionando logit, que abre o próximo bloco.",
    ],
    cuidados: [
      "A árvore não é um conjunto de regras definidas pelo gestor: a estrutura é aprendida dos dados, embora o gestor imponha limites.",
      "Boosting não é votação majoritária nem soma de probabilidades.",
      "O logit não é incapaz de representar não linearidades.",
      "Nenhum painel traz PD de modelo: aqui só existe o mecanismo.",
    ],
    transicao: "Vamos começar pela ideia mais familiar: combinar características em um escore e converter esse escore em probabilidade.",
  },
  impressao: function (e) { e.passos = { logit: 3, arvore: 3, boosting: 3 }; e.criterios = true; },

  montar: function (corpo, ctx) {
    var est = ctx.estado;
    if (!est.passos) est.passos = { logit: 0, arvore: 0, boosting: 0 };
    if (!est.sel) est.sel = "logit";

    var cliente = Aula.dados.cliente("Bruno");
    var NEUTRO = "var(--rule)", NEUTRO_TXT = "var(--muted)";

    var mecanismos = [
      { chave: "logit", nome: "Regressão logística", cor: "var(--logit)",
        frase: "Combina efeitos em um escore",
        etapas: ["As entradas do cliente", "A soma ponderada vira um escore",
                 "O escore vira probabilidade"] },
      { chave: "arvore", nome: "Árvore de decisão", cor: "var(--arvore)",
        frase: "Separa clientes por perguntas",
        etapas: ["As entradas do cliente", "O percurso pelas perguntas",
                 "A taxa observada na folha"] },
      { chave: "boosting", nome: "Gradient boosting", cor: "var(--boost)",
        frase: "Acrescenta correções sucessivas ao escore",
        etapas: ["O escore inicial, igual para todos", "Cada árvore acrescenta uma contribuição",
                 "Só no fim o escore vira probabilidade"] },
    ];

    /* Cada desenho já aparece completo, em tom neutro. As etapas apenas
       colorem a parte em discussão: nada essencial depende de clique. */
    function tom(passo, etapa, cor) { return passo >= etapa ? cor : NEUTRO; }

    function miniLogit(passo, cor) {
      var g = Graf.novo({ w: 392, h: 250, m: { e: 12, d: 12, c: 10, b: 10 } });
      g.x(0, 10).y(0, 10);
      ["comprometimento", "histórico", "utilização"].forEach(function (t, i) {
        var y = 8.4 - i * 1.6;
        g.retangulo(0.2, y - 0.6, 3.8, y + 0.6,
          { cor: passo >= 1 ? "var(--cor-soft)" : "var(--surface)", borda: tom(passo, 1, cor) });
        g.texto(0.45, y - 0.22, t, { tamanho: 16, peso: 400, cor: "var(--body)" });
        g.add(sv("line", { x1: g.px(3.9), y1: g.py(y), x2: g.px(5.3), y2: g.py(5.2),
          stroke: tom(passo, 2, cor), "stroke-width": 2 }));
      });
      g.add(sv("circle", { cx: g.px(5.9), cy: g.py(5.2), r: 27,
        fill: passo >= 2 ? cor : "var(--surface)", stroke: tom(passo, 2, cor), "stroke-width": 2 }));
      g.add(sv("text", { x: g.px(5.9), y: g.py(5.2) + 8, "text-anchor": "middle",
        "font-size": 23, "font-weight": 700, fill: passo >= 2 ? "#fff" : NEUTRO_TXT, texto: "z" }));
      g.add(sv("line", { x1: g.px(6.6), y1: g.py(5.2), x2: g.px(7.0), y2: g.py(5.2),
        stroke: tom(passo, 3, cor), "stroke-width": 2 }));
      var pts = M.linspace(-6, 6, 60).map(function (v) {
        return [7.1 + ((v + 6) / 12) * 2.6, 2.4 + M.sigmoid(v) * 5.0];
      });
      g.linha(pts, { cor: tom(passo, 3, cor), largura: 3 });
      g.texto(9.85, 9.2, "PD entre 0% e 100%",
        { ancora: "end", tamanho: 15, peso: 400,
          cor: passo >= 3 ? "var(--ink)" : NEUTRO_TXT });
      return g.svg;
    }

    function miniArvore(passo, cor) {
      function folha(rot, dest) { return { rotulo: rot, destaque: dest }; }
      var no = {
        rotulo: "histórico?", destaque: passo >= 1,
        filhos: [
          { aresta: "não", destaque: passo >= 2, no: {
            rotulo: "comp.?", destaque: passo >= 2,
            filhos: [
              { aresta: "≤", no: folha("grupo", false) },
              { aresta: ">", no: folha(passo >= 3 ? "taxa" : "grupo", passo >= 3) },
            ] } },
          { aresta: "sim", no: {
            rotulo: "comp.?",
            filhos: [
              { aresta: "≤", no: folha("grupo", false) },
              { aresta: ">", no: folha("grupo", false) },
            ] } },
        ],
      };
      return Graf.arvore({ no: no, w: 392, h: 250, caixaW: 84, caixaH: 34,
        resumo: "Árvore de duas perguntas com quatro grupos ao final." });
    }

    function miniBoost(passo, cor) {
      var g = Graf.novo({ w: 392, h: 250, m: { e: 48, d: 16, c: 14, b: 44 } });
      g.x(0, 4.2).y(-2.2, 0.4);
      g.eixoY({ ticks: [-2, -1, 0], rotulo: "escore F" });
      g.eixoX({ ticks: [0.5, 1.5, 2.5, 3.5],
        formato: function (v) { return v === 0.5 ? "início" : "árvore " + (v - 0.5); } });
      var F0 = -1.7, contrib = [0.38, 0.24, 0.16], acc = F0;
      g.add(sv("line", { x1: g.px(0.2), x2: g.px(4.0), y1: g.py(F0), y2: g.py(F0),
        stroke: "var(--rule)", "stroke-width": 1.5, "stroke-dasharray": "4 4" }));
      g.ponto(0.5, F0, { cor: tom(passo, 1, cor), r: 8 });
      contrib.forEach(function (c, i) {
        var x = 1.5 + i;
        g.add(sv("rect", { x: g.px(x) - 17, y: g.py(acc + c), width: 34,
          height: Math.abs(g.py(acc) - g.py(acc + c)),
          fill: tom(passo, 2, cor), opacity: passo >= 2 ? .85 : .55, rx: 2 }));
        acc += c;
        g.ponto(x, acc, { cor: tom(passo, 2, cor), r: 6 });
      });
      g.texto(4.05, acc, "escore somado",
        { ancora: "end", dy: -16, tamanho: 15, peso: 400,
          cor: passo >= 2 ? "var(--ink)" : NEUTRO_TXT });
      g.texto(4.05, F0 - 0.34, passo >= 3 ? "só agora vira PD" : "depois vira PD",
        { ancora: "end", tamanho: 15, peso: 400,
          cor: passo >= 3 ? "var(--ink)" : NEUTRO_TXT });
      return g.svg;
    }

    var desenhos = { logit: miniLogit, arvore: miniArvore, boosting: miniBoost };

    var paineis = h("div", { class: "g3 cresce" }, mecanismos.map(function (m) {
      var passo = est.passos[m.chave] || 0;
      var sel = est.sel === m.chave;
      return h("div", {
        class: "painel" + (sel ? " cor" : " claro"),
        estilo: "display:flex;flex-direction:column;gap:6px;padding:14px;" +
                (sel ? "border-color:" + m.cor + ";border-width:2px" : ""),
      }, [
        h("div", { estilo: "display:flex;flex-wrap:wrap;justify-content:space-between;align-items:baseline;gap:8px" }, [
          h("h2", { class: "secao", estilo: "margin:0;color:" + m.cor }, m.nome),
          h("span", { class: "nota" }, passo ? "etapa " + passo + " de 3" : ""),
        ]),
        h("p", { class: "apoio", estilo: "margin:0" }, m.frase),
        h("div", { class: "centro", estilo: "display:flex" }, desenhos[m.chave](passo, m.cor)),
        h("p", { class: "nota", estilo: "min-height:42px;margin:0" },
          passo ? m.etapas[passo - 1] : "Acompanhe o mecanismo em três etapas."),
        h("div", { class: "grupo" }, [
          h("button", { class: "btn min", type: "button", disabled: passo >= 3, onclick: function () {
            est.sel = m.chave;
            est.passos[m.chave] = Math.min(3, (est.passos[m.chave] || 0) + 1);
            App.montar("06");
          } }, passo >= 3 ? "Etapas completas" : "Próxima etapa"),
          h("button", { class: "btn min fantasma", type: "button", onclick: function () {
            est.passos[m.chave] = 0; App.montar("06");
          } }, "Reiniciar"),
        ]),
      ]);
    }));

    var criterios = h("div", { class: "painel", hidden: !est.criterios, estilo: "padding:10px 16px" },
      h("div", { class: "g3", estilo: "gap:16px" }, [
        h("p", { class: "apoio", estilo: "margin:0" },
          [h("strong", {}, "Ordenar risco: "), "o maior risco fica acima do menor?"]),
        h("p", { class: "apoio", estilo: "margin:0" },
          [h("strong", {}, "Estimar probabilidades: "), "10% previsto vira cerca de 10% observado?"]),
        h("p", { class: "apoio", estilo: "margin:0" },
          [h("strong", {}, "Apoiar a decisão: "), "a política resultante melhora o resultado?"]),
      ]));

    /* Os dois controles ficavam soltos ao lado da ficha, sem moldura e desalinhados dela.
       Dentro da própria ficha eles ganham a mesma linha de base e o mesmo fundo. */
    var ficha = Comum.fichaLinha(cliente, { cor: true, estilo: "flex:1 1 auto",
      campos: ["renda", "comp", "rel", "util", "hist"] });
    ficha.appendChild(h("div", { class: "grupo", estilo: "margin-left:auto;flex:1 1 auto;justify-content:flex-end" }, [
      h("button", { class: "btn", type: "button", onclick: function () {
        est.criterios = true; criterios.hidden = false;
      } }, "O que vamos verificar?"),
      h("button", { class: "btn fantasma", type: "button", onclick: ctx.reiniciar },
        "Reiniciar exemplo"),
    ]));
    corpo.appendChild(ficha);
    corpo.appendChild(criterios);
    corpo.appendChild(paineis);
  },
});
