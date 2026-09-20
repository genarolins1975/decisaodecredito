Aula.slide({
  id: "36",
  bloco: "boosting",
  titulo: "Escore inicial mais árvore 1 mais árvore 2 é a nova PD",
  subtitulo: "Somamos contribuições no escore e só então calculamos a probabilidade",
  conclusao: "Para prever, o cliente percorre as árvores já aprendidas. Não precisamos conhecer seu desfecho.",
  fonte: Aula.dados.fontes.boosting,
  resumo: "Waterfall do escore inicial e das duas contribuições, com a conversão logística ao lado e a ficha de um solicitante novo.",
  notas: {
    conducao: [
      "Apresente o solicitante novo e pergunte onde está o y dele.",
      "Mostre que y só foi usado no treinamento das duas árvores.",
      "Faça o percurso nas duas árvores, some e converta. Compare com o waterfall do logit: ambos somam em uma escala de escore, com funções diferentes.",
    ],
    respostas: [
      "Grupo B: −1,386294 mais 0,200000 mais 0,166078 é igual a −1,020217, e a PD é 26,4985%.",
      "Grupo A: −1,386294 menos 0,200000 menos 0,169906 é igual a −1,756200, e a PD é 14,7267%.",
    ],
    cuidados: [
      "Não some as PDs de cada árvore nem chame as contribuições de probabilidades.",
      "Um conjunto real tem muitas árvores e padrões mais ricos. A miniatura de duas árvores só torna o mecanismo visível.",
      "Esta não é uma explicação por variável: é a decomposição exata da soma das árvores.",
      "Com taxa de aprendizagem diferente de 1, o que se soma é a taxa multiplicada pela contribuição.",
    ],
    transicao: "Se cada passo for menor, precisaremos de mais etapas. Como escolher o tamanho dos passos e o número de árvores?",
  },
  impressao: function (e) { e.converter = true; },

  montar: function (corpo, ctx) {
    var B = Aula.dados.boosting;
    var est = ctx.estado;
    if (est.comp === undefined) est.comp = 50;
    if (est.converter === undefined) est.converter = false;

    var hist = B.rodar(2, 1);
    var grupo = est.comp > B.corte ? "B" : "A";
    var h1 = hist[1].grupos[grupo].h;
    var h2 = hist[2].grupos[grupo].h;
    var F0 = hist[0].grupos[grupo].F;
    var total = hist[2].grupos[grupo].F;
    var pd = hist[2].grupos[grupo].p;

    var g = Graf.waterfall({
      w: 760, h: 330, larguraRot: 282,
      base: F0, rotuloBase: "escore inicial " + F.dec(F0, 6), rotuloTotal: "escore final",
      rotuloX: "escore F",
      itens: [
        { rotulo: "árvore 1, folha do grupo " + grupo, valor: h1,
          cor: h1 >= 0 ? "var(--boost)" : "var(--ok)" },
        { rotulo: "árvore 2, folha do grupo " + grupo, valor: h2,
          cor: h2 >= 0 ? "var(--boost)" : "var(--ok)" },
      ],
    });

    var gs = Graf.novo({ w: 460, h: 118, m: { e: 66, d: 20, c: 10, b: 34 } });
    gs.x(-2.4, 0.4).y(0, 0.5);
    gs.grade({ y: [0, 0.1, 0.2, 0.3, 0.4, 0.5] });
    gs.eixoY({ ticks: [0, 0.25, 0.5], formato: function (v) { return F.pct(v, 0); },
               rotulo: "PD" });
    gs.eixoX({ ticks: [-2, -1, 0], rotulo: "escore F" });
    gs.linha(M.linspace(-2.4, 0.4, 160).map(function (v) { return [v, M.sigmoid(v)]; }),
      { cor: "var(--boost)", largura: 3 });
    if (est.converter) {
      gs.guia(total, pd, { cor: "var(--boost)" });
      gs.ponto(total, pd, { cor: "var(--boost)", r: 10 });
      gs.texto(total, pd, F.pct(pd, 4), { dx: 12, dy: -12, tamanho: 21, cor: "var(--ink)" });
    }

    var outro = grupo === "B" ? "A" : "B";
    var totalOutro = hist[2].grupos[outro].F;

    var percurso = ["árvore 1", "árvore 2"].map(function (nome, k) {
      var valor = k === 0 ? h1 : h2;
      return h("div", { class: "painel claro", estilo: "padding:10px 14px" }, [
        h("div", { estilo: "display:flex;flex-wrap:wrap;justify-content:space-between;align-items:baseline;gap:6px 14px" }, [
          h("span", { estilo: "font-weight:700;color:var(--ink);font-size:20px" }, nome),
          h("span", { class: "medio", estilo: "font-size:22px" }, F.sinal(valor, 6)),
        ]),
        h("p", { class: "nota", estilo: "margin:0" },
          "comprometimento " + F.dec(est.comp, 0) + "% " +
          (est.comp > B.corte ? "é maior que" : "não passa de") + " 40, portanto folha do grupo " +
          grupo),
      ]);
    });

    corpo.appendChild(h("div", { class: "linha cresce" }, [
      h("div", { class: "coluna cresce" }, [
        h("div", { class: "painel claro cresce centro" }, g.svg),
        h("div", { class: "painel cor", estilo: "display:flex;gap:26px;flex-wrap:wrap;align-items:baseline" }, [
          h("span", { class: "medio" }, "escore final " + F.dec(total, 6)),
          est.converter
            ? h("span", { class: "medio" }, "PD " + F.pct(pd, 4))
            : h("span", { class: "apoio" }, "a PD só aparece depois da conversão"),
          h("span", { class: "apoio" },
            "grupo " + outro + " chegaria a " + F.dec(totalOutro, 6) +
            (est.converter ? " e PD " + F.pct(hist[2].grupos[outro].p, 4) : "")),
        ]),
      ]),
      h("div", { class: "coluna", estilo: "flex:0 0 520px" }, [
        h("div", { class: "painel", estilo: "padding:10px 16px" }, [
          h("div", { estilo: "display:flex;flex-wrap:wrap;justify-content:space-between;align-items:baseline;gap:10px" }, [
            h("h3", { class: "secao", estilo: "margin:0" }, "Solicitante novo"),
            UI.selo("sem desfecho conhecido", "neutro"),
          ]),
          UI.slider({
            rotulo: "Comprometimento do solicitante", min: 20, max: 60, passo: 1, valor: est.comp,
            formato: function (v) { return "grupo " + (v > B.corte ? "B" : "A"); },
            aoMudar: function (v) { est.comp = v; App.montar("36"); },
          }),
          h("p", { class: "nota", estilo: "margin-top:8px" },
            "Nenhum campo de desfecho aparece nesta ficha. O y foi usado apenas no treinamento."),
        ]),
        h("div", { class: "coluna", estilo: "gap:8px" }, percurso),
        h("div", { class: "painel claro cresce centro", estilo: "padding:8px 14px" }, [
          h("h3", { class: "secao", estilo: "margin-bottom:2px" }, "Conversão do escore somado"),
          gs.svg,
        ]),
        h("div", { class: "grupo" }, [
          h("button", { class: "btn", type: "button", onclick: function () {
            est.converter = false; App.montar("36");
          }, disabled: !est.converter }, "Ver somente o escore"),
          h("button", { class: "btn", type: "button", onclick: function () {
            est.converter = true; App.montar("36");
          }, disabled: est.converter }, "Converter em PD"),
          h("button", { class: "btn", type: "button", onclick: function () {
            est.treino = !est.treino; App.montar("36");
          } }, est.treino ? "Esconder o resumo" : "Como foi treinado?"),
          h("button", { class: "btn fantasma", type: "button", onclick: ctx.reiniciar },
            "Reiniciar exemplo"),
        ]),
        est.treino
          ? h("p", { class: "nota" },
              "As duas folhas vieram das médias dos resíduos dos dez registros de treinamento: " +
              F.dec(hist[1].grupos.B.h, 6) + " e " + F.dec(hist[2].grupos.B.h, 6) +
              " no grupo B. Para prever um solicitante novo não calculamos y menos p: " +
              "apenas percorremos as árvores já aprendidas.")
          : null,
      ]),
    ]));
  },
});
