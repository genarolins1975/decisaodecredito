Aula.slide({
  id: "19",
  bloco: "logit",
  titulo: "Explicar a estrutura é vantagem; especificar a estrutura é responsabilidade",
  subtitulo: "Adequação do logit em três situações práticas",
  conclusao: "O logit oferece uma estrutura explícita, mas a qualidade depende da especificação e da validação.",
  fonte: "Síntese conceitual aplicada; sem dados",
  resumo: "Mecanismo do logit ao centro, com três situações práticas de adequação e uma síntese de critérios de escolha.",
  notas: {
    conducao: [
      "Peça uma razão para manter o logit mesmo se outro algoritmo tiver AUC um pouco maior.",
      "Aceite manutenção, clareza de especificação e estabilidade, sempre condicionadas a evidência.",
      "Depois peça uma situação em que insistir em um logit mal especificado seria prejudicial.",
    ],
    cuidados: [
      "Interpretável depende da quantidade de termos, transformações, interações e do público. Um logit com centenas de variáveis não é automaticamente fácil de explicar.",
      "Coeficiente não é causa.",
      "O desempenho de uma formulação simples não é o limite de toda a classe.",
      "Produzir uma probabilidade não garante que ela esteja calibrada.",
    ],
    aprofundar: [
      "Material original, capítulo 4, página 20: a linearidade em log odds é o limite da família. Um padrão não monótono na utilização não é representável sem transformar a variável.",
      "Página 19: a fronteira de decisão do logit é uma reta no plano das variáveis, porque o escore é uma soma. Mudar o corte desloca a reta paralelamente e mudar um coeficiente gira a reta. Compare com as regiões retangulares da árvore no slide 26.",
      "Página 22: a síntese do capítulo original é soma, curva e limite. Os três aparecem aqui nos slides 07, 09 e neste.",
    ],
    transicao: "Antes de mudar de técnica, vamos verificar se conseguimos usar o que aprendemos em uma decisão de interpretação.",
  },
  impressao: function (e) { e.respondeu = true; },

  montar: function (corpo, ctx) {
    var est = ctx.estado;
    if (!est.caso) est.caso = "aditivo";

    var casos = {
      aditivo: {
        rotulo: "Sinal predominantemente aditivo",
        situacao: "As características somam efeitos de forma estável e as faixas de risco crescem de forma regular.",
        pergunta: "As curvas de risco por faixa são compatíveis com uma soma de efeitos na escala do escore?",
        acao: "Manter o logit como referência, documentar a especificação e verificar calibração fora do tempo.",
        foco: "soma",
      },
      interacao: {
        rotulo: "Interação relevante omitida",
        situacao: "O efeito do comprometimento parece depender do histórico, e a especificação não tem termo cruzado.",
        pergunta: "As curvas por grupo diferem além do que a especificação permite?",
        acao: "Testar um termo plausível ou um método mais flexível, escolhendo por validação e não pela aparência da curva.",
        foco: "soma",
      },
      pequena: {
        rotulo: "Amostra pequena ou instável",
        situacao: "Poucos eventos por faixa, coortes curtas e população em mudança.",
        pergunta: "Os coeficientes mudam muito entre reamostragens e períodos?",
        acao: "Reduzir complexidade, regularizar, agrupar faixas e declarar a incerteza das estimativas.",
        foco: "curva",
      },
      sintese: {
        rotulo: "Critérios de escolha",
        situacao: "Nenhuma técnica vence por definição. A escolha depende de evidência fora do tempo, das restrições de operação e da necessidade de explicação.",
        pergunta: "Qual evidência faria você trocar de técnica?",
        acao: "Comparação com o mesmo conjunto de informação, protocolo congelado e ganho que persiste fora da amostra de ajuste.",
        foco: null,
      },
    };
    var caso = casos[est.caso];

    var g = Graf.novo({ w: 700, h: 340, m: { e: 16, d: 16, c: 14, b: 14 } });
    g.x(0, 10).y(0, 10);
    var realceSoma = caso.foco === "soma", realceCurva = caso.foco === "curva";
    ["comprometimento", "histórico", "utilização", "relacionamento"].forEach(function (t, i) {
      var y = 8.6 - i * 1.5;
      g.retangulo(0.2, y - 0.55, 3.2, y + 0.55,
        { cor: realceSoma ? "var(--cor-soft)" : "var(--surface)",
          borda: realceSoma ? "var(--logit)" : "var(--rule)" });
      g.texto(0.45, y - 0.2, t, { tamanho: 17, peso: 400 });
      g.add(sv("line", { x1: g.px(3.3), y1: g.py(y), x2: g.px(4.5), y2: g.py(5.2),
        stroke: realceSoma ? "var(--logit)" : "var(--rule)", "stroke-width": 2 }));
    });
    g.add(sv("circle", { cx: g.px(5.0), cy: g.py(5.2), r: 30,
      fill: realceSoma ? "var(--logit)" : "var(--paper)",
      stroke: realceSoma ? "var(--logit)" : "var(--rule)", "stroke-width": 2 }));
    g.add(sv("text", { x: g.px(5.0), y: g.py(5.2) + 9, "text-anchor": "middle", "font-size": 26,
      "font-weight": 700, fill: realceSoma ? "#fff" : "var(--muted)", texto: "z" }));
    var pts = M.linspace(-6, 6, 80).map(function (v) {
      return [6.2 + ((v + 6) / 12) * 3.2, 2.6 + M.sigmoid(v) * 5.2];
    });
    g.linha(pts, { cor: realceCurva ? "var(--logit)" : "var(--rule)", largura: 3 });
    g.add(sv("line", { x1: g.px(5.6), y1: g.py(5.2), x2: g.px(6.1), y2: g.py(5.2),
      stroke: realceCurva ? "var(--logit)" : "var(--rule)", "stroke-width": 2 }));
    g.texto(6.2, 8.6, "PD", { tamanho: 20, cor: realceCurva ? "var(--ink)" : "var(--muted)" });

    var forcas = ["função compacta e auditável", "interpretação condicionada à codificação",
                  "previsão rápida e fácil de implantar", "regularização e transformações disponíveis"];
    var limites = ["a forma funcional é escolhida, não descoberta",
                   "variáveis ausentes ou mal medidas continuam ausentes",
                   "extrapolação fora da faixa observada é frágil",
                   "correlação entre atributos dificulta a leitura de um coeficiente",
                   "mudança de população desloca o nível da previsão"];

    corpo.appendChild(h("div", { class: "linha cresce" }, [
      h("div", { class: "coluna cresce" }, [
        h("div", { class: "painel claro cresce centro" }, g.svg),
        h("div", { class: "g2" }, [
          h("div", { class: "painel" }, [
            h("h3", { class: "secao" }, "Forças"),
            h("ul", { class: "apoio", estilo: "margin:0;padding-left:20px" },
              forcas.map(function (t) { return h("li", {}, t); })),
          ]),
          h("div", { class: "painel" }, [
            h("h3", { class: "secao" }, "Limites"),
            h("ul", { class: "apoio", estilo: "margin:0;padding-left:20px" },
              limites.map(function (t) { return h("li", {}, t); })),
          ]),
        ]),
      ]),
      h("div", { class: "coluna", estilo: "flex:0 0 560px" }, [
        h("div", { class: "painel" }, [
          h("h3", { class: "secao" }, "Situação"),
          UI.botoes({
            vertical: true, rotulo: "situação",
            opcoes: Object.keys(casos).map(function (k) {
              return { valor: k, rotulo: casos[k].rotulo };
            }),
            valor: est.caso,
            aoMudar: function (v) { est.caso = v; est.respondeu = false; App.montar("19"); },
          }),
        ]),
        h("div", { class: "painel cor cresce" }, [
          h("p", { class: "apoio", estilo: "color:var(--ink);font-size:21px" }, caso.situacao),
          h("h3", { class: "secao", estilo: "margin-top:12px" }, "Pergunta de diagnóstico"),
          h("p", { estilo: "font-size:22px;color:var(--ink)" }, caso.pergunta),
          est.respondeu
            ? h("div", { class: "resposta", estilo: "margin-top:10px" },
                [h("strong", {}, "Ação possível. "), caso.acao])
            : h("div", { class: "grupo", estilo: "margin-top:10px" }, [
                h("button", { class: "btn", type: "button", onclick: function () {
                  est.respondeu = true; App.montar("19");
                } }, "Ver a ação possível"),
              ]),
        ]),
        h("button", { class: "btn fantasma", type: "button", onclick: ctx.reiniciar },
          "Reiniciar exemplo"),
      ]),
    ]));
  },
});
