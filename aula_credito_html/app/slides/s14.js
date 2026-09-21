Aula.slide({
  id: "14",
  bloco: "logit",
  titulo: "Aumentar o escore em 0,40 não aumenta toda PD pelo mesmo valor",
  subtitulo: "O mesmo deslocamento horizontal produz alturas diferentes na sigmoide",
  conclusao: "A resposta em probabilidade é mais intensa na região central da curva.",
  fonte: Aula.dados.fontes.manual,
  resumo: "Sigmoide com três segmentos destacados, partindo de PDs de 2%, 10% e 40%, e comparação entre variação exata e aproximação pela tangente.",
  notas: {
    conducao: [
      "Comece pelos três segmentos, todos com a mesma largura horizontal, e peça que comparem as alturas.",
      "Revele os valores e só então a derivada.",
      "Reduza a mudança para 1 ponto e mostre a aproximação local ficando mais próxima.",
    ],
    respostas: [
      "O efeito máximo da derivada da logística ocorre em p igual a 0,5. Isso é matemática, não recomendação de operar perto de 50% de PD.",
      "A derivada é aproximação para mudanças pequenas. Para 10 pontos de comprometimento, use a conversão exata.",
    ],
    cuidados: [
      "A variação de z continua sendo o coeficiente vezes a variação da variável.",
      "Valores em pontos percentuais não podem ser lidos em unidade de odds.",
      "Em variação zero, os dois métodos dão exatamente zero.",
    ],
    transicao: "Até aqui usamos variáveis numéricas e um indicador. Como incluir uma característica com várias categorias?",
  },
  impressao: function (e) { e.tangente = true; },

  montar: function (corpo, ctx) {
    var L = Aula.dados.logit;
    var est = ctx.estado;
    if (est.p0 === undefined) est.p0 = 0.10;
    if (est.dcomp === undefined) est.dcomp = 10;

    var beta = L.termos.filter(function (t) { return t.campo === "comp"; })[0].beta;
    var dz = beta * est.dcomp;
    var cenarios = [0.02, 0.10, 0.40];

    function exata(p) { return M.sigmoid(M.logito(p) + dz) - p; }
    function aproximada(p) { return beta * p * (1 - p) * est.dcomp; }

    var g = Graf.novo({ w: 880, h: 412, m: { e: 92, d: 60, c: 20, b: 54 },
      resumo: "Curva logística com três deslocamentos de mesma largura em escores diferentes." });
    g.x(-6, 3).y(0, 0.75);
    g.grade({ y: [0, 0.2, 0.4, 0.6], x: [-6, -4, -2, 0, 2] });
    g.eixoY({ ticks: [0, 0.2, 0.4, 0.6], formato: function (v) { return F.pct(v, 0); },
              rotulo: "probabilidade de inadimplência" });
    g.eixoX({ ticks: [-6, -4, -2, 0, 2], rotulo: "escore z" });
    g.linha(M.linspace(-6, 3, 320).map(function (v) { return [v, M.sigmoid(v)]; }),
      { cor: "var(--logit)", largura: 3 });

    cenarios.forEach(function (p) {
      var z0 = M.logito(p), z1 = z0 + dz, p1 = M.sigmoid(z1);
      var sel = Math.abs(p - est.p0) < 1e-9;
      var cor = sel ? "var(--alert)" : "var(--muted)";
      g.add(sv("line", { x1: g.px(z0), x2: g.px(z1), y1: g.py(p), y2: g.py(p),
        stroke: cor, "stroke-width": sel ? 4 : 2 }));
      g.add(sv("line", { x1: g.px(z1), x2: g.px(z1), y1: g.py(p), y2: g.py(p1),
        stroke: cor, "stroke-width": sel ? 4 : 2 }));
      g.ponto(z0, p, { r: sel ? 8 : 5, cor: "var(--ink)", bordaL: 1.5 });
      g.ponto(z1, p1, { r: sel ? 8 : 5, cor: cor, bordaL: 1.5 });
      g.texto(z1, p1, F.ppSinal(p1 - p, 2), { dx: 12, dy: -8, tamanho: sel ? 22 : 18,
        cor: sel ? "var(--ink)" : "var(--muted)" });
      g.texto(z0, p, F.pct(p, 0), { dx: -12, dy: 6, ancora: "end", tamanho: 18,
        peso: 400, cor: "var(--muted)" });
    });

    if (est.tangente) {
      var z0s = M.logito(est.p0);
      var incl = est.p0 * (1 - est.p0);
      /* A reta tangente fica dentro do desenho: em PD inicial alta ela subiria além do topo do
         eixo e o rótulo sairia do quadro. */
      var yMax = g.dy[1] - 0.03, yMin = g.dy[0] + 0.02;
      var x0 = Math.max(g.dx[0], z0s - 1.2, z0s + (yMin - est.p0) / incl);
      var x1 = Math.min(g.dx[1], z0s + 1.6, z0s + (yMax - est.p0) / incl);
      g.linha([[x0, est.p0 + incl * (x0 - z0s)], [x1, est.p0 + incl * (x1 - z0s)]],
        { cor: "var(--amber)", largura: 2, tracejado: "6 5" });
      g.texto(x1, est.p0 + incl * (x1 - z0s), "aproximação local",
        { dx: -4, dy: -12, ancora: "end", tamanho: 17, peso: 400, cor: "var(--amber)" });
    }

    var tabela = UI.tabela({
      compacta: true,
      colunas: [{ rotulo: "PD inicial" }, { rotulo: "Variação exata", unidade: "p.p." },
                { rotulo: "Aproximação local", unidade: "p.p." },
                { rotulo: "Diferença", unidade: "p.p." }],
      linhas: cenarios.map(function (p) {
        return [F.pct(p, 0), F.ppSinal(exata(p), 3), F.ppSinal(aproximada(p), 3),
                F.ppSinal(aproximada(p) - exata(p), 3)];
      }),
      selecionada: cenarios.indexOf(est.p0),
      legenda: "Comparação entre a conversão exata e a aproximação pela derivada",
    });

    corpo.appendChild(h("div", { class: "linha cresce" }, [
      h("div", { class: "coluna cresce" }, [
        h("div", { class: "painel claro cresce centro", estilo: "display:flex" }, g.svg),
        h("div", { class: "painel claro" }, [
          tabela,
          h("p", { class: "nota", estilo: "margin-top:6px;display:flex;gap:8px;align-items:baseline;flex-wrap:wrap" }, [
            h("span", { estilo: "font-size:19px;color:var(--ink)" },
              Mat.i("\\frac{\\partial p}{\\partial\\,\\mathit{comp}} = \\beta\\,p\\,(1-p) = " +
                Mat.n(beta, 2) + "\\,p\\,(1-p)")),
            "em probabilidade por ponto percentual; vale para mudanças pequenas.",
          ]),
        ]),
      ]),
      h("div", { class: "coluna", estilo: "flex:0 0 470px" }, [
        h("div", { class: "painel cor" }, [
          h("p", { estilo: "font-size:22px;margin:0" },
            Mat.b("\\Delta \\mathit{comp} = " + Mat.n(est.dcomp, 0) + "\\text{ p.p.} \\;\\Rightarrow\\; " +
              "\\Delta z = " + Mat.n(beta, 2) + "\\times " + Mat.n(est.dcomp, 0) + " = " + Mat.n(dz, 3))),
          h("p", { estilo: "font-size:22px;margin:6px 0 0" },
            Mat.b("p: " + Mat.pct(est.p0, 2) + " \\;\\longrightarrow\\; " + Mat.pct(est.p0 + exata(est.p0), 2) +
              "\\quad (" + Mat.n(exata(est.p0) * 100, 2) + "\\text{ p.p.})")),
        ]),
        h("div", { class: "painel cresce" }, [
          h("div", { class: "ctrl" }, [
            h("label", {}, "PD inicial"),
            UI.botoes({
              compacto: true, rotulo: "PD inicial",
              opcoes: cenarios.map(function (p) { return { valor: p, rotulo: F.pct(p, 0) }; }),
              valor: est.p0,
              aoMudar: function (v) { est.p0 = v; App.montar("14"); },
            }),
          ]),
          h("div", { estilo: "margin-top:6px" }, UI.slider({
            rotulo: "ou valor livre, de 1% a 60%", min: 1, max: 60, passo: 1,
            valor: Math.round(est.p0 * 100),
            formato: function (v) { return F.ppSinal(M.sigmoid(M.logito(v / 100) + dz) - v / 100, 2); },
            aoMudar: function (v) { est.p0 = v / 100; App.montar("14"); },
          })),
          h("div", { estilo: "margin-top:12px" }, UI.slider({
            rotulo: "Mudança em comprometimento, em pontos", min: 0, max: 15, passo: 1,
            valor: est.dcomp,
            formato: function (v) { return "\u0394z = " + F.dec(beta * v, 3); },
            aoMudar: function (v) { est.dcomp = v; App.montar("14"); },
          })),
          h("div", { class: "grupo", estilo: "margin-top:16px" }, [
            UI.alterna({
              rotulo: "tangente", valor: est.tangente,
              ligadoRotulo: "Esconder a aproximação local",
              desligadoRotulo: "Aproximação local",
              aoMudar: function (v) { est.tangente = v; App.montar("14"); },
            }),
            h("button", { class: "btn fantasma", type: "button", onclick: ctx.reiniciar },
              "Reiniciar exemplo"),
          ]),
        ]),
      ]),
    ]));
  },
});
