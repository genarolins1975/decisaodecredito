Aula.slide({
  id: "19",
  bloco: "logit",
  titulo: "Explicar a estrutura é vantagem; especificar a estrutura é responsabilidade",
  subtitulo: "Adequação do logit em três situações práticas",
  conclusao: "O logit oferece uma estrutura explícita, mas a qualidade depende da especificação e da validação.",
  fonte: "Síntese conceitual aplicada; sem dados",
  resumo: "Risco por faixa de comprometimento com as duas curvas do logit ao centro, três situações práticas de adequação e uma síntese de critérios de escolha.",
  notas: {
    conducao: [
      "Percorra as três situações olhando só o gráfico, e peça a resposta da pergunta de diagnóstico antes de revelar a ação. Na segunda, a abertura entre as faixas é visível: é o que uma interação omitida faz.",
      "Peça uma razão para manter o logit mesmo se outro algoritmo tiver AUC um pouco maior.",
      "Aceite manutenção, clareza de especificação e estabilidade, sempre condicionadas a evidência.",
      "Depois peça uma situação em que insistir em um logit mal especificado seria prejudicial.",
    ],
    cuidados: [
      "As faixas do gráfico são ilustrativas e servem para treinar a leitura, não para afirmar nada sobre a carteira. A figura está declarada como conceitual na fonte do slide.",
      "Interpretável depende da quantidade de termos, transformações, interações e do público. Um logit com centenas de variáveis não é automaticamente fácil de explicar.",
      "Coeficiente não é causa.",
      "O desempenho de uma formulação simples não é o limite de toda a classe.",
      "Produzir uma probabilidade não garante que ela esteja calibrada.",
    ],
    aprofundar: [
      "Material original, capítulo 4, página 20: a linearidade em log odds é o limite da família. Um padrão não monótono na utilização não é representável sem transformar a variável.",
      "Página 19: a fronteira de decisão do logit é uma reta no plano das variáveis, porque o escore é uma soma. Mudar o corte desloca a reta paralelamente e mudar um coeficiente gira a reta. A comparação com as regiões em degraus da árvore está no slide 26: o botão Sobrepor o logit desenha estas mesmas curvas por cima das quatro regiões, nos mesmos eixos.",
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
      },
      interacao: {
        rotulo: "Interação relevante omitida",
        situacao: "O efeito do comprometimento parece depender do histórico, e a especificação não tem termo cruzado.",
        pergunta: "As curvas por grupo diferem além do que a especificação permite?",
        acao: "Testar um termo plausível ou um método mais flexível, escolhendo por validação e não pela aparência da curva.",
      },
      pequena: {
        rotulo: "Amostra pequena ou instável",
        situacao: "Poucos eventos por faixa, coortes curtas e população em mudança.",
        pergunta: "Os coeficientes mudam muito entre reamostragens e períodos?",
        acao: "Reduzir complexidade, regularizar, agrupar faixas e declarar a incerteza das estimativas.",
      },
      sintese: {
        rotulo: "Critérios de escolha",
        situacao: "Nenhuma técnica vence por definição. A escolha depende de evidência fora do tempo, das restrições de operação e da necessidade de explicação.",
        pergunta: "Qual evidência faria você trocar de técnica?",
        acao: "Comparação com o mesmo conjunto de informação, protocolo congelado e ganho que persiste fora da amostra de ajuste.",
      },
    };
    var caso = casos[est.caso];

    /* O painel maior passa a mostrar a evidência que a pergunta de diagnóstico pede: risco por
       faixa de comprometimento, com o que o logit prevê e o que se observou. O organograma de
       caixas que estava aqui já aparece nos slides 06 e 07, e não respondia a nenhuma das três
       perguntas. As faixas observadas são ilustrativas, declaradas na nota abaixo do gráfico. */
    var L = Aula.dados.logit;
    var FAIXAS = [20, 30, 40, 50, 60, 70];
    function pdModelo(comp, hist) {
      var perfil = Aula.dados.copia(L.referencia);
      perfil.comp = comp; perfil.hist = hist;
      return L.pd(perfil);
    }
    /* Desvios fixos por cenário, escritos aqui e não sorteados: o slide precisa mostrar
       sempre a mesma figura. */
    var CENA = {
      aditivo:   { h0: [1, 1, 1, 1, 1, 1], h1: [1, 1, 1, 1, 1, 1], n: 900,
                   leitura: "As faixas observadas caem sobre as duas curvas, e a distância entre elas é a mesma em toda a extensão. É o que uma soma de efeitos produz." },
      interacao: { h0: [1, 1, 1, 1, 1, 1], h1: [0.72, 0.86, 1.06, 1.34, 1.62, 1.92], n: 900,
                   leitura: "Com histórico, o risco observado cresce mais rápido do que o modelo permite: as duas curvas deveriam ser paralelas na escala do escore, e as faixas abrem. É interação, e a especificação não tem termo cruzado." },
      pequena:   { h0: [0.55, 1.5, 0.7, 1.35, 0.85, 1.25], h1: [1.4, 0.65, 1.3, 0.75, 1.35, 0.7], n: 40,
                   leitura: "As faixas saltam para os dois lados da curva, e o intervalo de cada uma cobre boa parte do gráfico. Com poucos eventos por faixa, a figura não distingue um modelo bem especificado de um mal especificado." },
      sintese:   { h0: null, h1: null, n: 900,
                   leitura: "Só o modelo, sem faixas observadas. É exatamente o que uma apresentação sem evidência fora da amostra entrega: uma curva bonita e nenhuma razão para acreditar nela." },
    };
    var cena = CENA[est.caso];

    var g = Graf.novo({ w: 700, h: 340, m: { e: 74, d: 140, c: 20, b: 52 } });
    g.x(15, 75).y(0, 0.45);
    g.grade({ y: [0, 0.15, 0.30, 0.45] });
    g.eixoY({ ticks: [0, 0.15, 0.30, 0.45], formato: function (v) { return F.pct(v, 0); },
              rotulo: "PD" });
    g.eixoX({ ticks: FAIXAS, rotulo: "comprometimento em %" });
    [0, 1].forEach(function (hist) {
      var pts = M.linspace(15, 75, 61).map(function (v) { return [v, pdModelo(v, hist)]; });
      g.linha(pts, { cor: hist ? "var(--logit)" : "var(--muted)", largura: hist ? 3 : 2.4 });
      g.texto(75, pdModelo(75, hist), hist ? "histórico = 1" : "histórico = 0",
        { dx: 8, dy: 4, tamanho: 17, peso: 400, cor: hist ? "var(--logit)" : "var(--muted)" });
    });
    if (cena.h0) {
      [0, 1].forEach(function (hist) {
        var fator = hist ? cena.h1 : cena.h0;
        FAIXAS.forEach(function (comp, i) {
          var pObs = M.clamp(pdModelo(comp, hist) * fator[i], 0.002, 0.44);
          if (cena.n <= 60) {
            var ic = M.wilson(Math.round(pObs * cena.n), cena.n);
            g.add(sv("line", { x1: g.px(comp), x2: g.px(comp),
              y1: g.py(Math.min(0.45, ic[1])), y2: g.py(ic[0]),
              stroke: "var(--rule)", "stroke-width": 2.5 }));
          }
          g.ponto(comp, pObs, { r: 6, cor: hist ? "var(--logit)" : "var(--ink)", bordaL: 1.5 });
        });
      });
    }

    var forcas = ["função compacta e auditável", "interpretação condicionada à codificação",
                  "previsão rápida e fácil de implantar", "regularização e transformações disponíveis"];
    var limites = ["a forma funcional é escolhida, não descoberta",
                   "variáveis ausentes ou mal medidas continuam ausentes",
                   "extrapolação fora da faixa observada é frágil",
                   "correlação entre atributos dificulta a leitura de um coeficiente",
                   "mudança de população desloca o nível da previsão"];

    corpo.appendChild(h("div", { class: "linha cresce" }, [
      h("div", { class: "coluna cresce" }, [
        h("div", { class: "painel claro cresce centro" }, [
          g.svg,
          h("p", { class: "nota", estilo: "margin:4px 0 0;text-align:left" }, cena.leitura),
          h("p", { class: "nota", estilo: "margin:4px 0 0;text-align:left" },
            "Curvas: o logit manual desta aula, no perfil de referência. Pontos: faixas ilustrativas " +
            "escritas para a situação selecionada, não são dados observados. " +
            (cena.n <= 60 ? "As barras são intervalos de Wilson com " + F.inteiro(cena.n) +
             " contratos por faixa." : "")),
        ]),
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
