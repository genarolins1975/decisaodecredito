Aula.slide({
  id: "48",
  bloco: "decisao",
  titulo: "O que conseguimos monitorar agora? O que exige esperar?",
  subtitulo: "Indicadores imediatos e indicadores que dependem da maturação do alvo",
  conclusao: "Podemos observar a carteira entrando hoje, mas parte da qualidade do modelo só será conhecida depois.",
  fonte: Aula.dados.fontes.experimento,
  resumo: "Coortes mensais com indicadores imediatos e, para as coortes já maturadas, inadimplência observada.",
  notas: {
    conducao: [
      "Pergunte se PD média crescente prova piora do modelo. Pode ser mudança da população.",
      "Pergunte se ausência de inadimplência recente prova segurança. Pode ser falta de maturação.",
      "Relacione à definição do alvo do slide 03 e termine com a necessidade de versionar modelo, dados, regra e explicações.",
    ],
    respostas: [
      "Imediatos: distribuição de renda e comprometimento, ausentes, taxa de aprovação e PD média.",
      "Com alvo maturado: inadimplência observada, calibração, discriminação e resultado.",
      "A data de observação define o que pode ser medido: uma coorte só entra nas métricas de desfecho 12 meses depois da contratação.",
    ],
    cuidados: [
      "PSI, se citado, é indicador de mudança de distribuição e depende de faixas e tamanho de amostra. Não use limiares universais como regra automática.",
      "Mudança de distribuição não demonstra por si só perda de desempenho.",
      "Os cenários são sintéticos e construídos para a aula. Não são previsão macroeconômica nem backtest real.",
      "Nem todo alerta pede retreino: a ação depende do diagnóstico.",
    ],
    transicao: "Temos desempenho, probabilidades, economia e condições de operação. Agora vamos tomar uma decisão de comitê.",
  },

  montar: function (corpo, ctx) {
    var R = Aula.resultados;
    var est = ctx.estado;
    if (!R) {
      corpo.appendChild(h("p", { class: "resposta erro" },
        "Resultados do experimento não disponíveis: execute experimento/experimento.py e recompile."));
      return;
    }

    var coortes = R.monitoramento.coortes;
    function mesNum(m) {
      var p = m.split("-");
      return Number(p[0]) * 12 + Number(p[1]) - 1;
    }
    var primeiro = mesNum(coortes[0].mes);
    var ultimo = mesNum(coortes[coortes.length - 1].mes);
    if (est.obs === undefined) est.obs = ultimo + 12;

    var cenarios = R.monitoramento.cenarios;
    var nomesCenario = {
      composicao: "Mudança na composição dos solicitantes",
      ausentes: "Mais ausência em uma variável",
      relacao: "Relação entre características e risco alterada",
    };
    var acoes = {
      composicao: "Investigar a origem da mudança de perfil e conferir a política no novo volume.",
      ausentes: "Investigar a coleta antes de tocar no modelo: a imputação desloca a previsão.",
      relacao: "Esperar a maturação, comparar coortes e avaliar reestimativa se persistir.",
    };
    if (!est.cenario) est.cenario = null;

    var g = Graf.novo({ w: 950, h: 366, m: { e: 96, d: 34, c: 22, b: 58 },
      resumo: "Coortes mensais com PD média prevista e inadimplência observada quando maturada." });
    g.x(primeiro, ultimo).y(0, 0.30);
    g.grade({ y: [0, 0.1, 0.2, 0.3] });
    g.eixoY({ ticks: [0, 0.1, 0.2, 0.3], formato: function (v) { return F.pct(v, 0); },
              rotulo: "taxa" });
    var anos = [2018, 2019, 2021, 2022, 2024];
    g.eixoX({ ticks: anos.map(function (a) { return a * 12; }),
              formato: function (v) { return String(Math.round(v / 12)); },
              rotulo: "coorte de contratação" });

    var maturadas = coortes.filter(function (c) { return mesNum(c.mes) + 12 <= est.obs; });
    g.linha(coortes.map(function (c) { return [mesNum(c.mes), c.pd_media]; }),
      { cor: "var(--boost)", largura: 3 });
    if (maturadas.length > 1) {
      g.linha(maturadas.map(function (c) { return [mesNum(c.mes), c.inadimplencia]; }),
        { cor: "var(--alert)", largura: 3 });
    }
    /* As duas séries terminam juntas no fim da escala: a identificação fica em
       legenda acima do desenho, e não em rótulo solto ao lado da última coorte. */
    function legenda(cor, texto) {
      return h("span", { estilo: "display:flex;align-items:center;gap:8px" }, [
        h("span", { estilo: "width:26px;height:4px;border-radius:2px;background:" + cor }),
        h("span", { class: "apoio", estilo: "font-size:18px" }, texto),
      ]);
    }
    var limite = est.obs - 12;
    if (limite < ultimo) {
      var hach = g.hachura("naoMaturado", "var(--muted)");
      g.retangulo(Math.max(primeiro, limite), 0, ultimo, 0.30, { cor: hach, opacidade: .9 });
      g.texto((Math.max(primeiro, limite) + ultimo) / 2, 0.285,
        "alvo ainda não maturado", { ancora: "middle", tamanho: 17, peso: 400, cor: "var(--muted)" });
    }

    var imediatos = [
      ["comprometimento médio da coorte mais recente",
       F.dec(coortes[coortes.length - 1].comp_medio, 1) + "%"],
      ["utilização média", F.dec(coortes[coortes.length - 1].util_medio, 1) + "%"],
      ["ausência de utilização", F.pct(coortes[coortes.length - 1].ausentes_util, 1)],
      ["taxa de aprovação no corte congelado", F.pct(coortes[coortes.length - 1].aprovacao, 1)],
      ["PD média prevista", F.pct(coortes[coortes.length - 1].pd_media, 2)],
    ];
    var posteriores = maturadas.length
      ? [["inadimplência da coorte mais recente já maturada",
          F.pct(maturadas[maturadas.length - 1].inadimplencia, 2)],
         ["coorte correspondente", F.mes(maturadas[maturadas.length - 1].mes + "-01")],
         ["coortes já maturadas", F.inteiro(maturadas.length) + " de " + coortes.length]]
      : [["inadimplência observada", "nenhuma coorte maturada nesta data"]];

    var cen = est.cenario ? cenarios.filter(function (c) { return c.cenario === est.cenario; })[0] : null;

    corpo.appendChild(h("div", { class: "linha cresce" }, [
      h("div", { class: "coluna cresce" }, [
        h("div", { class: "painel claro cresce centro" }, [
          h("div", { estilo: "display:flex;gap:28px;align-self:flex-start;margin-bottom:2px" }, [
            legenda("var(--boost)", "PD média prevista"),
            maturadas.length > 1
              ? legenda("var(--alert)", "inadimplência observada")
              : h("span", { class: "nota" }, "nenhuma coorte maturada nesta data"),
          ]),
          g.svg,
        ]),
        h("div", { class: "g2" }, [
          h("div", { class: "painel", estilo: "padding:10px 16px" }, [
            h("h3", { class: "secao", estilo: "margin-bottom:4px" }, "Indicadores imediatos"),
            h("dl", { class: "kv", estilo: "font-size:18px;gap:1px 12px" },
              imediatos.reduce(function (a, p) {
                a.push(h("dt", {}, p[0])); a.push(h("dd", {}, p[1])); return a;
              }, [])),
          ]),
          h("div", { class: "painel", estilo: "padding:10px 16px" }, [
            h("h3", { class: "secao", estilo: "margin-bottom:4px" },
              "Indicadores com alvo maturado"),
            h("dl", { class: "kv", estilo: "font-size:18px;gap:1px 12px" },
              posteriores.reduce(function (a, p) {
                a.push(h("dt", {}, p[0])); a.push(h("dd", {}, p[1])); return a;
              }, [])),
          ]),
        ]),
      ]),
      h("div", { class: "coluna", estilo: "flex:0 0 470px" }, [
        h("div", { class: "painel", estilo: "padding:12px 16px" }, [
          UI.slider({
            rotulo: "Data de observação", min: primeiro + 12, max: ultimo + 12, passo: 1,
            valor: est.obs, discreto: true,
            formato: function (v) {
              return F.mes(Math.floor(v / 12) + "-" + String((v % 12) + 1).padStart(2, "0") + "-01");
            },
            aoMudar: function (v) { est.obs = v; App.montar("48"); },
          }),
          h("p", { class: "nota", estilo: "margin-top:4px" },
            F.inteiro(maturadas.length) + " coortes com alvo completo nesta data."),
        ]),
        h("div", { class: "painel", estilo: "padding:12px 16px" }, [
          h("h3", { class: "secao", estilo: "margin-bottom:5px" }, "Cenários sintéticos"),
          UI.botoes({
            vertical: true, rotulo: "cenário",
            opcoes: cenarios.map(function (c) {
              return { valor: c.cenario, rotulo: nomesCenario[c.cenario] };
            }),
            valor: est.cenario,
            aoMudar: function (v) { est.cenario = v; est.acao = false; App.montar("48"); },
          }),
        ]),
        cen
          ? h("div", { class: "painel cor cresce" }, [
              h("dl", { class: "kv", estilo: "font-size:17px;gap:0 12px" }, [
                h("dt", {}, "PD média prevista"), h("dd", {}, F.pct(cen.pd_media, 2)),
                h("dt", {}, "taxa de aprovação"), h("dd", {}, F.pct(cen.aprovacao, 1)),
                h("dt", {}, "ausência de utilização"), h("dd", {}, F.pct(cen.ausentes_util, 1)),
                h("dt", {}, "comprometimento médio"), h("dd", {}, F.dec(cen.comp_medio, 1) + "%"),
                h("dt", {}, "inadimplência, só depois de maturar"),
                h("dd", {}, F.pct(cen.inadimplencia, 2)),
                h("dt", {}, "AUC, só depois de maturar"), h("dd", {}, F.dec(cen.auc, 4)),
              ]),
              est.acao
                ? h("div", { class: "resposta", estilo: "margin-top:8px" }, acoes[cen.cenario])
                : h("button", { class: "btn", estilo: "margin-top:8px", type: "button",
                    onclick: function () { est.acao = true; App.montar("48"); } },
                    "Ação possível"),
              h("p", { class: "nota", estilo: "margin-top:4px" },
                "Cenário sintético de " + F.inteiro(cen.n) + " contratos."),
            ])
          : h("div", { class: "painel claro cresce" }, [
              h("p", { class: "apoio", estilo: "margin:0" },
                "Os dois primeiros indicadores de cada cenário aparecem no dia seguinte à " +
                "contratação. Inadimplência, calibração e discriminação só existem depois dos " +
                "12 meses de maturação."),
            ]),
        h("button", { class: "btn min fantasma", type: "button", onclick: ctx.reiniciar },
          "Reiniciar exemplo"),
      ]),
    ]));
  },
});
