Aula.slide({
  id: "13",
  bloco: "logit",
  titulo: "O modelo aprende penalizando previsões incompatíveis com os dados",
  subtitulo: "Perda logarítmica de uma observação, em função da probabilidade prevista",
  conclusao: "A log loss pune previsões confiantes que contradizem o que ocorreu.",
  fonte: Aula.dados.fontes.manual,
  resumo: "Duas curvas de perda individual em função da probabilidade prevista, uma para y igual a 1 e outra para y igual a 0.",
  notas: {
    conducao: [
      "Escolha y = 1 com p = 10% e depois aumente p até 90%.",
      "Troque y para 0 mantendo p = 90% e pergunte por que a penalização aumenta.",
      "Mostre que uma observação não define sozinha os coeficientes: a perda total agrega todos os casos.",
    ],
    respostas: [
      "Para y = 1: p = 0,10 gera perda aproximadamente 2,3026; p = 0,90 gera aproximadamente 0,1054.",
      "Para y = 0 a relação se inverte: p = 0,90 gera aproximadamente 2,3026.",
      "Minimizar a log loss equivale a maximizar a verossimilhança do modelo logístico.",
    ],
    cuidados: [
      "Classificar corretamente a partir de um corte não basta para medir a qualidade da probabilidade.",
      "A perda depende do grau de confiança, não apenas do lado do corte.",
      "A função objetivo do treino não garante o melhor desempenho futuro.",
      "Em p igual a 0 ou 1 a perda vai a infinito. As curvas são desenhadas entre 0,1% e 99,9%.",
    ],
    aprofundar: [
      "Material original, capítulo 4, páginas 15 a 17: a perda de cada observação determina os coeficientes, e a descida de gradiente percorre os parâmetros uma iteração por vez até a convergência.",
      "Nesta aula a descida aparece no bloco de boosting, slides 32 a 35, com a mesma mecânica de resíduo, passo e atualização do escore.",
      "Página 18 do original: navegador, Python com a mesma regra e sklearn chegam ao mesmo resultado, com diferença máxima de 0,000327 no intercepto. A conferência equivalente aqui está nos metadados do slide 43 e no notebook.",
    ],
    transicao: "Mesmo com um coeficiente fixo, o efeito observado na PD muda ao longo da curva logística.",
  },
  impressao: function (e) { e.amostra = true; },

  montar: function (corpo, ctx) {
    var est = ctx.estado;
    if (est.p === undefined) est.p = 0.10;
    if (est.y === undefined) est.y = 1;

    var amostra = {
      y: [0, 0, 0, 0, 1, 1],
      p: [0.05, 0.10, 0.20, 0.40, 0.60, 0.80],
    };
    var perdas = amostra.y.map(function (y, i) { return M.logLoss(y, amostra.p[i]); });
    var mediaPerda = M.media(perdas);

    function curva(y, destaque) {
      var g = Graf.novo({ w: 430, h: 330, m: { e: 74, d: 22, c: 22, b: 58 } });
      g.x(0, 1).y(0, 5);
      g.grade({ y: [1, 2, 3, 4, 5] });
      g.eixoY({ ticks: [0, 1, 2, 3, 4, 5], rotulo: "perda da observação" });
      g.eixoX({ ticks: [0, 0.25, 0.5, 0.75, 1], formato: function (v) { return F.pct(v, 0); },
                rotulo: "probabilidade prevista" });
      var pts = M.linspace(0.001, 0.999, 300).map(function (v) {
        return [v, Math.min(5, M.logLoss(y, v))];
      });
      g.linha(pts, { cor: y === 1 ? "var(--alert)" : "var(--ok)", largura: 3 });
      if (destaque) {
        var v = Math.min(5, M.logLoss(y, est.p));
        g.guia(est.p, v, { cor: "var(--muted)" });
        g.ponto(est.p, v, { cor: y === 1 ? "var(--alert)" : "var(--ok)", r: 9 });
        g.texto(est.p, v, F.dec(M.logLoss(y, est.p), 4),
          { dx: 12, dy: -12, tamanho: 20, cor: "var(--ink)" });
      }
      return h("div", { class: "painel" + (destaque ? " cor" : " claro"), estilo: "flex:1 1 0" }, [
        h("h3", { class: "secao" }, y === 1 ? "Observação com y = 1 (houve evento)"
                                            : "Observação com y = 0 (não houve evento)"),
        g.svg,
      ]);
    }

    var tabela = UI.tabela({
      compacta: true,
      colunas: [{ rotulo: "Observação" }, { rotulo: "y" }, { rotulo: "p prevista" },
                { rotulo: "Perda" }],
      linhas: amostra.y.map(function (y, i) {
        return ["nº " + (i + 1), String(y), F.pct(amostra.p[i], 0), F.dec(perdas[i], 4)];
      }),
      legenda: "Seis observações e suas perdas individuais",
    });
    tabela.querySelector("tbody").appendChild(h("tr", { class: "sel" }, [
      h("th", { scope: "row", class: "rotulo" }, "Média"),
      h("td", {}, ""), h("td", {}, ""), h("td", {}, F.dec(mediaPerda, 4)),
    ]));

    corpo.appendChild(h("div", { class: "linha cresce" }, [
      curva(1, est.y === 1),
      curva(0, est.y === 0),
      h("div", { class: "coluna", estilo: "flex:0 0 430px" }, [
        h("div", { class: "painel cor" }, [
          h("p", { class: "formula peq", estilo: "background:none;border:none;padding:0;margin:0" },
            Mat.b("L = -\\bigl[\\, y\\,\\ln p + (1 - y)\\,\\ln(1 - p) \\,\\bigr]")),
          h("div", { class: "kv", estilo: "margin-top:10px;font-size:22px" }, [
            h("dt", {}, "observação"), h("dd", {}, "y = " + est.y),
            h("dt", {}, "previsão"), h("dd", {}, F.pct(est.p, 1)),
            h("dt", {}, "perda"), h("dd", {}, F.dec(M.logLoss(est.y, est.p), 4)),
          ]),
        ]),
        h("div", { class: "painel" }, [
          UI.slider({
            rotulo: "Probabilidade prevista", min: 1, max: 99, passo: 1,
            valor: Math.round(est.p * 100),
            formato: function (v) { return "perda " + F.dec(M.logLoss(est.y, v / 100), 4); },
            aoMudar: function (v) { est.p = v / 100; App.montar("13"); },
          }),
          h("div", { class: "ctrl", estilo: "margin-top:10px" }, [
            h("label", {}, "Desfecho observado"),
            UI.botoes({
              compacto: true, rotulo: "desfecho",
              opcoes: [{ valor: 0, rotulo: "y = 0" }, { valor: 1, rotulo: "y = 1" }],
              valor: est.y,
              aoMudar: function (v) { est.y = v; App.montar("13"); },
            }),
          ]),
          h("div", { class: "grupo", estilo: "margin-top:12px" }, [
            h("button", { class: "btn", type: "button", onclick: function () {
              est.amostra = !est.amostra; App.montar("13");
            } }, est.amostra ? "Esconder a amostra" : "Olhar a amostra inteira"),
            h("button", { class: "btn fantasma", type: "button", onclick: ctx.reiniciar },
              "Reiniciar exemplo"),
          ]),
        ]),
        est.amostra ? h("div", { class: "painel claro cresce" }, [tabela,
          h("p", { class: "formula peq", estilo: "background:none;border:none;padding:0;margin:8px 0 0" },
            Mat.b("\\mathcal{L}(\\beta) = \\frac{1}{n}\\sum_{i=1}^{n} " +
              "-\\bigl[\\, y_i\\,\\ln p_i + (1 - y_i)\\,\\ln(1 - p_i) \\,\\bigr]")),
          h("p", { class: "nota", estilo: "margin-top:6px" },
            "Esta é a função que o ajuste minimiza: a média das perdas dos " + amostra.y.length +
            " contratos, e não a perda de uma observação. Os coeficientes são os que dão o menor valor dela.")]) : null,
      ]),
    ]));
  },
});
