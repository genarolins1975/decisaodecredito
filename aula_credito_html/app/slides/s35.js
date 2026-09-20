Aula.slide({
  id: "35",
  bloco: "boosting",
  titulo: "A primeira árvore mudou as previsões. Agora mudam os gradientes",
  subtitulo: "A segunda correção é recalculada depois da primeira",
  conclusao: "A próxima correção é recalculada depois da anterior. Ela não repete mecanicamente o mesmo passo.",
  fonte: Aula.dados.fontes.boosting,
  resumo: "Tabela com as previsões e resíduos antes e depois da primeira correção, segunda árvore com novas médias e trajetória de PD por iteração.",
  notas: {
    conducao: [
      "Antes de revelar a média do grupo B, pergunte se ela continuará em mais 0,2.",
      "Faça a turma perceber que o resíduo de um y = 1 diminuiu e o de um y = 0 ficou mais negativo.",
      "Mostre que a correção média positiva persiste, mas mudou de tamanho.",
    ],
    respostas: [
      "No grupo A, r1 = −0,1699058933 e a média da folha é o mesmo valor.",
      "No grupo B, três resíduos de −0,2339223413 e dois de +0,7660776587, média +0,1660776587.",
      "Com taxa 1: F do grupo A vai a −1,7562002544 e PD a 14,7267%. F do grupo B vai a −1,0202167024 e PD a 26,4985%.",
    ],
    cuidados: [
      "Os resíduos da segunda rodada usam p1, nunca p0.",
      "A nova árvore poderia usar outro corte em dados mais ricos. Aqui o corte permanece por construção da miniatura, que só tem dois valores de comprometimento.",
      "Nem toda correção diminui, e as previsões individuais não caminham necessariamente de forma monótona. Isso acontece aqui pela simplicidade dos grupos.",
      "O objetivo é reduzir a perda agregada, não acertar cada rótulo.",
    ],
    transicao: "Somamos duas contribuições. Vamos olhar essa soma como uma função que também pode prever um cliente novo.",
  },
  impressao: function (e) { e.etapa = 3; e.depois = true; },

  montar: function (corpo, ctx) {
    var B = Aula.dados.boosting;
    var est = ctx.estado;
    if (est.etapa === undefined) est.etapa = 0;
    if (est.depois === undefined) est.depois = false;

    var hist = B.rodar(2, 1);
    var it1 = hist[1], it2 = hist[2];

    var colunas = [{ rotulo: "Registro" }, { rotulo: "Grupo" }, { rotulo: "y" },
                   { rotulo: "p0" }, { rotulo: "r0" }];
    if (est.depois) colunas = colunas.concat([{ rotulo: "p1" }, { rotulo: "r1" }]);
    if (est.etapa >= 2) colunas = colunas.concat([{ rotulo: "F2" }, { rotulo: "p2" }]);

    var tabela = UI.tabela({
      compacta: true,
      colunas: colunas,
      linhas: it1.linhas.map(function (l, i) {
        var l2 = it2.linhas[i];
        var linha = ["nº " + l.id, l.grupo, String(l.y), F.pct(l.p, 2), F.dec(l.r, 4)];
        if (est.depois) linha = linha.concat([F.pct(l2.p, 4), F.dec(l2.r, 6)]);
        if (est.etapa >= 2) linha = linha.concat([F.dec(l2.F, 6), F.pct(l2.pNovo, 4)]);
        return linha;
      }),
      legenda: "Previsões e resíduos antes e depois da primeira correção",
    });

    var segunda = Graf.arvore({
      w: 500, h: 262, caixaW: 206, caixaH: 72,
      no: {
        rotulo: "comprometimento ≤ 40%",
        detalhe: "mesmo corte da primeira árvore",
        detalhe2: est.etapa >= 1 ? "novas médias de r1" : "ainda por ajustar",
        destaque: est.etapa >= 1,
        filhos: [
          { aresta: "sim (A)", destaque: est.etapa >= 1, no: {
            rotulo: "folha A",
            detalhe: est.etapa >= 1 ? "h2 = " + F.dec(it2.grupos.A.h, 6) : "h2 = ?",
            detalhe2: est.etapa >= 1 ? "antes: " + F.dec(it1.grupos.A.h, 6) : null,
            destaque: est.etapa >= 1 } },
          { aresta: "não (B)", destaque: est.etapa >= 1, no: {
            rotulo: "folha B",
            detalhe: est.etapa >= 1 ? "h2 = " + F.dec(it2.grupos.B.h, 6) : "h2 = ?",
            detalhe2: est.etapa >= 1 ? "antes: " + F.dec(it1.grupos.B.h, 6) : null,
            destaque: est.etapa >= 1 } },
        ],
      },
      resumo: "Segunda árvore, com o mesmo corte e novas médias.",
    });

    var g = Graf.novo({ w: 720, h: 180, m: { e: 84, d: 140, c: 14, b: 46 } });
    g.x(-0.3, 2.3).y(0.10, 0.30);
    g.grade({ y: [0.1, 0.15, 0.2, 0.25, 0.3] });
    g.eixoY({ ticks: [0.1, 0.15, 0.2, 0.25, 0.3],
              formato: function (v) { return F.pct(v, 0); }, rotulo: "PD do grupo" });
    g.eixoX({ ticks: [0, 1, 2], formato: function (v) { return String(v); },
              rotulo: "iteração" });
    ["A", "B"].forEach(function (grupo) {
      var cor = grupo === "A" ? "var(--ok)" : "var(--alert)";
      var ate = est.etapa >= 2 ? 2 : 1;
      var pts = [];
      for (var m = 0; m <= ate; m++) pts.push([m, hist[m].grupos[grupo].p]);
      g.linha(pts, { cor: cor, largura: 3 });
      pts.forEach(function (pt) { g.ponto(pt[0], pt[1], { r: 7, cor: cor }); });
      var fim = pts[pts.length - 1];
      g.texto(fim[0], fim[1], "grupo " + grupo + " · " + F.pct(fim[1], 2),
        { dx: 10, dy: 5, tamanho: 17, cor: cor });
    });

    corpo.appendChild(h("div", { class: "linha cresce" }, [
      h("div", { class: "painel claro cresce" }, [
        h("div", { estilo: "display:flex;flex-wrap:wrap;justify-content:space-between;align-items:baseline;gap:10px" }, [
          h("h3", { class: "secao", estilo: "margin:0" }, "Os mesmos dez registros"),
          UI.alterna({
            rotulo: "colunas", valor: est.depois,
            ligadoRotulo: "Antes da primeira correção",
            desligadoRotulo: "Depois da primeira correção",
            aoMudar: function (v) { est.depois = v; App.montar("35"); },
          }),
        ]),
        tabela,
        h("div", { class: "centro", estilo: "margin-top:4px" }, [g.svg]),
        est.depois
          ? h("p", { class: "nota", estilo: "margin-top:8px" },
              "No grupo B, o resíduo de quem teve evento caiu de " + F.dec(0.8, 1) + " para " +
              F.dec(it2.linhas.filter(function (l) { return l.grupo === "B" && l.y === 1; })[0].r, 6) +
              " e o de quem não teve ficou mais negativo, de " + F.dec(-0.2, 1) + " para " +
              F.dec(it2.linhas.filter(function (l) { return l.grupo === "B" && l.y === 0; })[0].r, 6) + ".")
          : null,
      ]),
      h("div", { class: "coluna", estilo: "flex:0 0 560px" }, [
        h("div", { class: "painel claro centro" }, [
          h("h3", { class: "secao" }, "A segunda árvore"),
          segunda,
        ]),
        h("div", { class: "painel" }, [
          h("div", { class: "grupo" }, [
            h("button", { class: "btn", type: "button", disabled: est.etapa >= 1,
              onclick: function () { est.etapa = 1; est.depois = true; App.montar("35"); } },
              "Ajustar segunda árvore"),
            h("button", { class: "btn", type: "button", disabled: est.etapa < 1 || est.etapa >= 2,
              onclick: function () { est.etapa = 2; App.montar("35"); } }, "Atualizar"),
            h("button", { class: "btn fantasma", type: "button", onclick: ctx.reiniciar },
              "Reiniciar exemplo"),
          ]),
          h("p", { class: "nota", estilo: "margin-top:8px" },
            "A exposição principal para em duas iterações. A correção média do grupo B continua " +
            "positiva, mas caiu de " + F.dec(it1.grupos.B.h, 6) + " para " +
            F.dec(it2.grupos.B.h, 6) + "."),
        ]),
      ]),
    ]));
  },
});
