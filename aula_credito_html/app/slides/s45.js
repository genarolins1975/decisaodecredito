Aula.slide({
  id: "45",
  bloco: "decisao",
  titulo: "Entre os clientes com PD próxima de 10%, quantos ficaram inadimplentes?",
  subtitulo: "Média prevista contra frequência observada, faixa a faixa",
  conclusao: "Calibrar é verificar a escala das probabilidades, não apenas a ordem dos clientes.",
  fonte: Aula.dados.fontes.experimento,
  resumo: "Diagrama de calibração com dez faixas por quantis, intervalos de Wilson e histograma das probabilidades previstas.",
  notas: {
    conducao: [
      "Leia um ponto completo: probabilidade média, proporção observada, n e eventos.",
      "Aplique a perturbação das odds e pergunte o que deve acontecer com a AUC antes de revelar.",
      "Discuta por que PD em escala errada distorce perda esperada e política de corte.",
    ],
    respostas: [
      "A transformação multiplica as odds por dois e preserva a ordem, portanto a AUC permanece idêntica.",
      "A calibração e as perdas mudam, e a direção depende de como o modelo já estava calibrado.",
    ],
    cuidados: [
      "Wilson por faixa é descrição binomial aproximada e não incorpora toda a seleção e modelagem.",
      "Brier e log loss avaliam qualidade probabilística, mas não são medidas exclusivas de calibração.",
      "Número de faixas, calibrador e versão não devem ser escolhidos pelo teste final.",
      "O calibrador de Platt foi ajustado na partição de calibração e aplicado ao teste sem reajuste.",
    ],
    aprofundar: [
      "O calibrador de Platt foi ajustado na partição de calibração e aplicado ao teste sem reajuste. O efeito observado na tela é o desse procedimento, não de um recalibrador ajustado no próprio teste.",
      "Platt é uma logística sobre o escore: p_calibrada = σ(a·z + b). Como a transformação é monotônica em z quando a é positivo, ela não altera a ordem nem a AUC, e é exatamente por isso que serve para corrigir nível sem estragar ordenação.",
    ],
    transicao: "Uma PD só vira ação quando definimos uma política. Vamos observar como um corte altera a carteira aprovada.",
  },

  montar: function (corpo, ctx) {
    var R = Aula.resultados;
    var est = ctx.estado;
    if (!R) {
      corpo.appendChild(h("p", { class: "resposta erro" },
        "Resultados do experimento não disponíveis: execute experimento/experimento.py e recompile."));
      return;
    }
    if (!est.modelo) est.modelo = "boosting";
    if (!est.versao) est.versao = "original";
    if (est.faixa === undefined) est.faixa = null;

    var aval = R.avaliacao[est.modelo];
    var mapa = {
      original: { bins: aval.calibracao_teste, auc: aval.teste.auc, brier: aval.teste.brier,
                  ll: aval.teste.log_loss, rotulo: "previsões originais" },
      odds2: { bins: aval.calibracao_teste_odds2, auc: aval.auc_odds2, brier: aval.brier_odds2,
               ll: aval.log_loss_odds2, rotulo: "odds multiplicadas por 2" },
      calibrada: { bins: aval.calibracao_teste_calibrada, auc: aval.teste.auc_calibrada,
                   brier: aval.teste.brier_calibrada, ll: aval.teste.log_loss_calibrada,
                   rotulo: "depois da calibração de Platt" },
    };
    var atual = mapa[est.versao];
    var bins = atual.bins;

    var maxV = Math.max.apply(null, bins.map(function (b) {
      return Math.max(b.prev_media, b.obs, b.wilson[1]);
    }));
    var lim = Math.min(1, Math.ceil(maxV * 10) / 10);

    var g = Graf.novo({ w: 372, h: 420, m: { e: 88, d: 26, c: 22, b: 58 },
      resumo: "Diagrama de calibração com dez faixas." });
    g.x(0, lim).y(0, lim);
    var ticks = Graf.ticks(0, lim, 5);
    g.grade({ x: ticks, y: ticks });
    g.eixoY({ ticks: ticks, formato: function (v) { return F.pct(v, 0); },
              rotulo: "frequência observada" });
    g.eixoX({ ticks: ticks, formato: function (v) { return F.pct(v, 0); },
              rotulo: "PD média prevista na faixa" });
    g.linha([[0, 0], [lim, lim]], { cor: "var(--rule)", largura: 2, tracejado: "6 5" });
    bins.forEach(function (b, i) {
      var sel = est.faixa === i;
      g.add(sv("line", { x1: g.px(b.prev_media), x2: g.px(b.prev_media),
        y1: g.py(b.wilson[0]), y2: g.py(b.wilson[1]),
        stroke: "var(--amber)", "stroke-width": sel ? 4 : 2, opacity: sel ? 1 : .5 }));
      g.ponto(b.prev_media, b.obs, { r: sel ? 11 : 7, cor: "var(--amber)" });
    });
    if (est.faixa !== null && bins[est.faixa]) {
      var b = bins[est.faixa];
      g.texto(b.prev_media, b.obs, F.pct(b.obs, 2) + " observado",
        { dx: 12, dy: -12, tamanho: 19, cor: "var(--ink)" });
    }

    /* Histograma das probabilidades previstas, alinhado às faixas. */
    var hist = aval.histograma_teste;
    var gh = Graf.novo({ w: 372, h: 160, m: { e: 88, d: 26, c: 14, b: 48 } });
    var maxC = Math.max.apply(null, hist.contagens);
    gh.x(0, lim).y(0, maxC);
    gh.eixoY({ ticks: [0, maxC], formato: function (v) { return F.inteiro(v); },
               rotulo: "contratos" });
    gh.eixoX({ ticks: ticks, formato: function (v) { return F.pct(v, 0); },
               rotulo: "PD prevista (versão calibrada)" });
    hist.contagens.forEach(function (c, i) {
      var x0 = hist.bordas[i], x1 = hist.bordas[i + 1];
      if (x0 > lim) return;
      gh.retangulo(x0, 0, Math.min(x1, lim), c, { cor: "var(--cor-soft)", borda: "var(--amber)" });
    });

    var tabela = UI.tabela({
      compacta: true, apertada: true,
      colunas: [{ rotulo: "Faixa" }, { rotulo: "n" }, { rotulo: "Eventos" },
                { rotulo: "Prevista" }, { rotulo: "Observada" }, { rotulo: "Wilson" }],
      linhas: bins.map(function (b, i) {
        return [String(i + 1), F.inteiro(b.n), F.inteiro(b.eventos),
                F.pct(b.prev_media, 2), F.pct(b.obs, 2),
                F.pct(b.wilson[0], 1) + " a " + F.pct(b.wilson[1], 1)];
      }),
      selecionada: est.faixa,
      legenda: "Faixas por quantis das previsões no teste",
    });
    [].forEach.call(tabela.querySelectorAll("tbody tr"), function (tr, i) {
      tr.setAttribute("style", "cursor:pointer");
      tr.addEventListener("click", function () {
        est.faixa = est.faixa === i ? null : i; App.montar("45");
      });
    });

    corpo.appendChild(h("div", { class: "linha cresce" }, [
      h("div", { class: "coluna cresce centro" }, [
        h("div", { class: "painel claro cresce centro" }, g.svg),
        h("div", { class: "painel claro" }, gh.svg),
      ]),
      h("div", { class: "coluna cresce" }, [
        h("div", { class: "painel claro cresce" }, tabela),
      ]),
      h("div", { class: "coluna", estilo: "flex:0 0 400px" }, [
        h("div", { class: "painel cor" }, [
          h("h3", { class: "secao" }, atual.rotulo),
          h("dl", { class: "kv", estilo: "font-size:19px;gap:2px 12px" }, [
            h("dt", {}, "AUC"), h("dd", {}, F.dec(atual.auc, 6)),
            h("dt", {}, "Brier"), h("dd", {}, F.dec(atual.brier, 5)),
            h("dt", {}, "log loss"), h("dd", {}, F.dec(atual.ll, 5)),
            h("dt", {}, "PD média prevista"),
            h("dd", {}, F.pct(est.versao === "calibrada" ? aval.teste.pd_media_calibrada
                                                         : aval.teste.pd_media, 2)),
            h("dt", {}, "taxa observada"),
            h("dd", {}, F.pct(aval.teste.eventos / aval.teste.n, 2)),
          ]),
        ]),
        h("div", { class: "painel" }, [
          h("div", { class: "ctrl" }, [
            h("label", {}, "Modelo"),
            UI.botoes({
              compacto: true, rotulo: "modelo",
              opcoes: ["logit", "arvore", "boosting"].map(function (k) {
                return { valor: k, rotulo: Aula.dados.modelos[k].curto };
              }),
              valor: est.modelo,
              aoMudar: function (v) { est.modelo = v; est.faixa = null; App.montar("45"); },
            }),
          ]),
          h("div", { class: "ctrl", estilo: "margin-top:10px" }, [
            h("label", {}, "Versão das previsões"),
            UI.botoes({
              compacto: true, rotulo: "versão",
              opcoes: [
                { valor: "original", rotulo: "Originais" },
                { valor: "odds2", rotulo: "Odds vezes 2 (perturbação)" },
                { valor: "calibrada", rotulo: "Calibradas (Platt)" },
              ],
              valor: est.versao,
              aoMudar: function (v) { est.versao = v; est.faixa = null; App.montar("45"); },
            }),
          ]),
          h("button", { class: "btn min fantasma", estilo: "margin-top:10px", type: "button",
            onclick: ctx.reiniciar }, "Reiniciar exemplo"),
        ]),
        h("div", { class: "painel claro cresce", estilo: "padding:10px 16px" }, [
          h("p", { class: "apoio", estilo: "font-size:17px;margin:0" }, [
            h("span", { estilo: "color:var(--ink)" }, Mat.i("\\text{odds}\\times 2 \\iff z + \\ln 2")),
            ": deslocamento constante no log odds não troca ninguém de lugar na fila, então a AUC permanece " +
            F.dec(aval.auc_odds2, 6) + ". Brier e log loss mudam."]),
        ]),
      ]),
    ]));
  },
});
