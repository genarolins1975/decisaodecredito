Aula.slide({
  id: "20",
  bloco: "logit",
  titulo: "Bruno aumenta seu comprometimento de 38% para 48%. E agora?",
  subtitulo: "Exercício: acompanhar a escala do escore e a escala da probabilidade",
  conclusao: "Entender o logit exige acompanhar a escala do escore e a escala da probabilidade.",
  fonte: Aula.dados.fontes.manual,
  resumo: "Perfil de Bruno com uma única alteração destacada e três alternativas de interpretação.",
  notas: {
    conducao: [
      "Dê um minuto em duplas. Peça a explicação de quem escolheu cada alternativa, sem expor pessoas.",
      "Use a solução para revisar a diferença entre coeficiente e alteração de PD.",
      "Pergunte oralmente: o que podemos afirmar sobre o efeito causal de reduzir o comprometimento?",
    ],
    respostas: [
      "A alternativa correta é a segunda: o escore sobe 0,40 e as odds são multiplicadas por e elevado a 0,40.",
      "Escore original −2,025 e PD 11,66%. Novo escore −1,625 e PD aproximadamente 16,45%. Diferença aproximada de 4,79 pontos.",
      "Sobre causalidade: o cálculo descreve o modelo mantendo as demais entradas fixas. Não identifica efeito causal.",
      "Desafio opcional: sem o histórico de atraso, o escore de Bruno cai 0,80 e a PD passa de 11,66% para aproximadamente 5,66%.",
    ],
    transicao: "Agora imagine que o modelo não some características, mas faça perguntas sucessivas: houve atraso? O comprometimento é alto? Essa é a lógica de uma árvore.",
  },
  impressao: function (e) { e.passos = 4; e.conferido = true; e.escolha = 1; },

  montar: function (corpo, ctx) {
    var D = Aula.dados, L = D.logit;
    var est = ctx.estado;
    if (est.passos === undefined) est.passos = 0;
    if (est.escolha === undefined) est.escolha = null;

    var bruno = D.cliente("Bruno");
    var novo = D.copia(bruno); novo.comp = 48;
    var semHist = D.copia(bruno); semHist.hist = 0;

    var z0 = L.z(bruno), p0 = M.sigmoid(z0);
    var z1 = L.z(novo), p1 = M.sigmoid(z1);
    var beta = L.termos.filter(function (t) { return t.campo === "comp"; })[0].beta;
    var dz = z1 - z0;

    var alternativas = [
      { rotulo: "A PD sobe 10 pontos percentuais.",
        correta: false,
        feedback: "Confusão de unidade: 10 pontos são a variação do comprometimento, não da probabilidade. " +
                  "A PD passa de " + F.pct(p0, 2) + " para " + F.pct(p1, 2) + ", ou seja " +
                  F.ppSinal(p1 - p0, 2) + "." },
      { rotulo: "O escore sobe 0,40 e as odds são multiplicadas por e elevado a 0,40.",
        correta: true,
        feedback: "A variação do escore é " + F.dec(beta, 2) + " × 10 = " + F.dec(dz, 2) +
                  ". As odds são multiplicadas por " + F.dec(Math.exp(dz), 4) +
                  " e a PD passa de " + F.pct(p0, 2) + " para " + F.pct(p1, 2) + "." },
      { rotulo: "A PD é multiplicada por e elevado a 0,40.",
        correta: false,
        feedback: "Quem é multiplicado são as odds, não a probabilidade. " +
                  "Multiplicar a PD daria " + F.pct(p0 * Math.exp(dz), 2) +
                  ", diferente do resultado correto de " + F.pct(p1, 2) + "." },
    ];

    var etapas = [
      { titulo: "Variação da característica",
        texto: "comprometimento passa de " + F.dec(bruno.comp, 0) + "% para " +
               F.dec(novo.comp, 0) + "%, ou seja Δcomp = +10 pontos" },
      { titulo: "Variação do escore",
        texto: "Δz = " + F.dec(beta, 2) + " × 10 = " + F.dec(dz, 3) +
               ", de " + F.dec(z0, 3) + " para " + F.dec(z1, 3) },
      { titulo: "Efeito nas odds",
        texto: "odds passam de " + F.dec(M.odds(p0), 4) + " para " + F.dec(M.odds(p1), 4) +
               ", multiplicadas por " + F.dec(Math.exp(dz), 4) },
      { titulo: "Nova probabilidade",
        texto: "p = 1 / (1 + e^" + F.dec(-z1, 3) + ") = " + F.pct(p1, 4) +
               ", diferença de " + F.ppSinal(p1 - p0, 2) },
    ];

    var quiz = UI.quiz({
      alternativas: alternativas,
      escolha: est.escolha,
      conferido: est.conferido,
      rotulo: "o que muda na PD de Bruno",
      aoEscolher: function (k) { est.escolha = k; est.conferido = false; },
      aoConferir: function () { est.conferido = true; },
    });

    var solucao = h("div", { class: "coluna", estilo: "gap:8px" },
      etapas.map(function (e, i) {
        var visivel = i < est.passos;
        return h("div", {
          class: "painel" + (visivel ? " cor" : ""),
          estilo: "padding:10px 14px" + (visivel ? "" : ";opacity:.4"),
        }, [
          h("h3", { class: "secao", estilo: "margin:0 0 4px" }, (i + 1) + ". " + e.titulo),
          h("p", { estilo: "font-size:21px;color:var(--ink);margin:0" },
            visivel ? e.texto : "etapa ainda não revelada"),
        ]);
      }));

    var desafio = h("div", { class: "painel", hidden: !est.desafio }, [
      h("h3", { class: "secao" }, "Desafio opcional, cenário separado"),
      h("p", { class: "apoio" },
        "Bruno sem o histórico de atraso, mantendo comprometimento em " +
        F.dec(bruno.comp, 0) + "% e os demais valores originais: escore " +
        F.dec(L.z(semHist), 3) + " e PD " + F.pct(M.sigmoid(L.z(semHist)), 2) + "."),
      h("p", { class: "nota" },
        "Este é um segundo cenário, independente do aumento de comprometimento."),
    ]);

    corpo.appendChild(h("div", { class: "linha cresce" }, [
      h("div", { class: "coluna", estilo: "flex:0 0 430px" }, [
        Comum.ficha(bruno, { cor: true, selo: "perfil original",
          rodape: "Uma única alteração: comprometimento de " + F.dec(bruno.comp, 0) +
                  "% para " + F.dec(novo.comp, 0) + "%." }),
        h("div", { class: "painel claro cresce" }, [
          h("h3", { class: "secao" }, "Revisão rápida"),
          h("div", { class: "grupo vert" }, [
            h("button", { class: "btn min fantasma", type: "button",
              onclick: function () { ctx.ir("11"); } },
              "Rever a razão de chances (slide 11)"),
            h("button", { class: "btn min fantasma", type: "button",
              onclick: function () { ctx.ir("12"); } },
              "Rever a calculadora de PD (slide 12)"),
          ]),
          h("p", { class: "nota", estilo: "margin-top:8px" },
            "A escolha feita aqui é preservada ao voltar."),
        ]),
      ]),
      h("div", { class: "coluna cresce" }, [
        h("div", { class: "painel claro cresce" }, [
          h("h3", { class: "secao" }, "Escolha uma alternativa"),
          quiz,
        ]),
        h("div", { class: "grupo" }, [
          h("button", { class: "btn", type: "button", onclick: function () {
            est.passos = Math.min(etapas.length, est.passos + 1); App.montar("20");
          }, disabled: est.passos >= etapas.length },
            est.passos ? "Próxima etapa da solução" : "Resolver passo a passo"),
          h("button", { class: "btn", type: "button", onclick: function () {
            est.desafio = !est.desafio; App.montar("20");
          } }, est.desafio ? "Esconder o desafio" : "Desafio opcional"),
          h("button", { class: "btn fantasma", type: "button", onclick: ctx.reiniciar },
            "Reiniciar exercício"),
        ]),
      ]),
      h("div", { class: "coluna", estilo: "flex:0 0 470px" }, [
        solucao,
        desafio,
      ]),
    ]));
  },
});
