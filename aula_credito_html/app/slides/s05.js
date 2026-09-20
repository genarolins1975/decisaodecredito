Aula.slide({
  id: "05",
  bloco: "problema",
  titulo: "Aprender no passado, escolher sem olhar o teste",
  subtitulo: "Quatro partições, cada uma com 12 meses de maturação antes de o alvo existir",
  conclusao: "Separar por calendário só funciona se respeitarmos quando cada resultado ficou disponível.",
  fonte: Aula.dados.fontes.experimento,
  resumo: "Linha do tempo com quatro faixas de contratação, extensão clara de maturação de 12 meses e uma linha vertical de decisão.",
  notas: {
    conducao: [
      "Peça que o aluno aponte a diferença entre o fim das contratações e o fim da observação.",
      "Pergunte: podemos escolher o corte depois de ver os resultados finais? Revele que o teste avalia escolhas congeladas.",
      "Datas completas ficam aqui nas notas; a projeção mostra apenas os anos.",
    ],
    respostas: [
      "Treino: contratações de jan/2018 a dez/2019, alvo completo em dez/2020.",
      "Validação de ajuste: jan a jun/2021, alvo completo em jun/2022.",
      "Calibração e política: ago a dez/2022, alvo completo em dez/2023.",
      "Teste final: fev a jul/2024, alvo completo em jul/2025.",
    ],
    cuidados: [
      "Os espaços entre coortes tornam a maturação visível. Não são uma recomendação universal de desenho operacional.",
      "Divisão aleatória não é sempre inválida. Ela apenas não testa a generalização temporal buscada aqui.",
      "O modelo base é congelado antes da calibração, e a política antes do teste.",
    ],
    transicao: "Agora temos regras de comparação. Como cada técnica transforma os mesmos dados em uma PD?",
  },
  impressao: function (e) { e.cenario = "testar"; },

  montar: function (corpo, ctx) {
    var est = ctx.estado;
    if (!est.cenario) est.cenario = "ajustar";

    var R = Aula.resultados;
    function anoFrac(iso) {
      var p = iso.split("-");
      return Number(p[0]) + (Number(p[1]) - 1) / 12 + (Number(p[2] || 1) - 1) / 365;
    }

    var faixas = (R ? R.protocolo.particoes : []).map(function (p) {
      return {
        nome: { treino: "Treino", validacao: "Validação de ajuste",
                calibracao: "Calibração e política", teste: "Teste final" }[p.nome],
        chave: p.nome, ini: anoFrac(p.inicio), fim: anoFrac(p.fim),
        alvo: anoFrac(p.alvo_conhecido), n: p.n,
        rotulo: F.mes(p.inicio) + " a " + F.mes(p.fim),
        alvoRotulo: F.mes(p.alvo_conhecido),
      };
    });

    var cenarios = {
      ajustar: { rotulo: "Pronto para ajustar", em: faixas.length ? faixas[1].alvo : 2022.5,
        texto: "Com o alvo da validação completo, escolhemos hiperparâmetros e número de árvores. O modelo base fica congelado." },
      calibrar: { rotulo: "Pronto para calibrar", em: faixas.length ? faixas[2].alvo : 2024,
        texto: "Com o alvo da partição de calibração completo, ajustamos o calibrador e definimos o corte. O modelo base não é reajustado." },
      testar: { rotulo: "Pronto para testar", em: faixas.length ? faixas[3].alvo : 2025.5,
        texto: "Com o alvo do teste completo, avaliamos uma única vez as regras já congeladas. O teste não escolhe nada." },
      erro: { rotulo: "Erro comum", em: faixas.length ? faixas[1].alvo : 2022.5,
        texto: "Treinar com contratações recentes cujo desfecho ainda não existia na data pretendida de uso. A tabela parece pronta e o alvo não estava disponível." },
    };
    var cen = cenarios[est.cenario];

    var extras = est.cenario === "erro" ? [{
      nome: "Treino contaminado", chave: "erro", ini: 2022.0, fim: 2022.5,
      alvo: 2023.5, rotulo: "contratações de jan a jun/2022", alvoRotulo: "jun/2023", n: null,
    }] : [];
    var todas = faixas.concat(extras);

    var g = Graf.novo({ w: 1040, h: 545, m: { e: 270, d: 215, c: 30, b: 60 } });
    g.x(2018, 2026).y(0, todas.length + 0.4);
    g.grade({ x: [2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026] });
    g.eixoX({ ticks: [2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026],
              rotulo: "ano", formato: function (v) { return String(Math.round(v)); } });

    var alturaFaixa = g.altura / (todas.length + 0.4) * 0.52;
    var cores = { treino: "var(--ink)", validacao: "var(--logit)",
                  calibracao: "var(--amber)", teste: "var(--arvore)", erro: "var(--alert)" };
    todas.forEach(function (f, i) {
      var y = todas.length - i - 0.5;
      var yc = g.py(y);
      var conhecido = f.alvo <= cen.em + 1e-9;
      var cor = cores[f.chave] || "var(--muted)";
      // contratações
      g.add(sv("rect", { x: g.px(f.ini), y: yc - alturaFaixa / 2,
        width: Math.max(3, g.px(f.fim) - g.px(f.ini)), height: alturaFaixa, rx: 3,
        fill: cor, opacity: conhecido ? 1 : .32 }));
      // maturação
      g.add(sv("rect", { x: g.px(f.fim), y: yc - alturaFaixa / 2 + 4,
        width: Math.max(3, g.px(f.alvo) - g.px(f.fim)), height: alturaFaixa - 8, rx: 3,
        fill: cor, opacity: conhecido ? .22 : .12 }));
      g.add(sv("text", { x: g.m.e - 14, y: yc - 2, "text-anchor": "end", "font-size": 21,
        "font-weight": 700, fill: conhecido ? "var(--ink)" : "var(--muted)", texto: f.nome }));
      g.add(sv("text", { x: g.m.e - 14, y: yc + 20, "text-anchor": "end", "font-size": 17,
        fill: "var(--muted)", texto: f.rotulo + (f.n ? " · n = " + F.inteiro(f.n) : "") }));
      g.add(sv("text", { x: g.px(f.alvo) + 8, y: yc + 6, "font-size": 17,
        fill: conhecido ? "var(--ink)" : "var(--muted)",
        texto: "alvo em " + f.alvoRotulo + (conhecido ? "" : " (ainda não)") }));
    });

    g.add(sv("line", { x1: g.px(cen.em), x2: g.px(cen.em), y1: g.py(todas.length + 0.4),
      y2: g.py(0), stroke: "var(--alert)", "stroke-width": 3 }));
    g.add(sv("text", { x: g.px(cen.em), y: g.py(todas.length + 0.4) - 6, "text-anchor": "middle",
      "font-size": 18, "font-weight": 700, fill: "var(--alert)", texto: "decisão" }));

    corpo.appendChild(h("div", { class: "linha cresce" }, [
      h("div", { class: "painel claro cresce centro", estilo: "display:flex" }, g.svg),
      h("div", { class: "coluna", estilo: "flex:0 0 420px" }, [
        h("div", { class: "painel" }, [
          h("h3", { class: "secao" }, "Momento da decisão"),
          UI.botoes({
            vertical: true, rotulo: "cenário",
            opcoes: Object.keys(cenarios).map(function (k) {
              return { valor: k, rotulo: cenarios[k].rotulo };
            }),
            valor: est.cenario,
            aoMudar: function (v) { est.cenario = v; App.montar("05"); },
          }),
        ]),
        h("div", { class: "painel cor" }, [
          h("p", { class: "apoio", estilo: "color:var(--ink);font-size:21px" }, cen.texto),
          est.cenario === "erro"
            ? h("button", { class: "btn", estilo: "margin-top:10px", type: "button",
                onclick: function () { est.cenario = "ajustar"; App.montar("05"); } },
                "Corrigir e restaurar o protocolo")
            : null,
        ]),
        h("p", { class: "nota" },
          "Barra sólida: contratações. Barra clara: os 12 meses até o alvo existir. " +
          "Uma faixa apagada indica alvo ainda desconhecido na data da decisão."),
      ]),
    ]));
  },
});
