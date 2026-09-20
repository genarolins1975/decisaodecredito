Aula.slide({
  id: "40",
  bloco: "boosting",
  titulo: "Mais flexibilidade exige mais disciplina de validação",
  subtitulo: "Quatro situações, a pergunta de diagnóstico e a evidência que a responde",
  conclusao: "Capturar padrões complexos é uma capacidade. Demonstrar que eles persistem é uma obrigação.",
  fonte: "Síntese conceitual, com um resultado calculado como exemplo",
  resumo: "Quatro situações de adequação do boosting, cada uma com pergunta de diagnóstico e evidência aceitável.",
  notas: {
    conducao: [
      "Peça que a turma escolha uma situação em que começaria pelo logit e outra em que investigaria boosting.",
      "Discuta hipóteses e as evidências necessárias em cada caso.",
      "Não revele ainda a tabela final da comparação principal.",
    ],
    cuidados: [
      "Implementações como XGBoost, LightGBM e CatBoost existem e diferem entre si. Aqui não há catálogo de funcionalidades nem recomendação comercial.",
      "Suporte a dados ausentes e categóricos depende da implementação. Não é propriedade universal do método.",
      "A frase funciona bem em dados tabulares não substitui um experimento adequado no problema.",
      "Nenhuma nota subjetiva é atribuída aos algoritmos.",
    ],
    transicao: "Se o modelo usa muitas árvores, como explicar o que ele aprendeu e por que atribuiu determinada PD a um cliente?",
  },
  impressao: function (e) { e.revelado = true; },

  montar: function (corpo, ctx) {
    var R = Aula.resultados;
    var est = ctx.estado;
    if (!est.caso) est.caso = "aditivo";
    if (est.revelado === undefined) est.revelado = false;

    var situacoes = [
      { chave: "aditivo", rotulo: "Sinal aproximadamente aditivo",
        descricao: "As características contribuem de forma estável e quase somável na escala do escore.",
        pergunta: "O boosting ganha da especificação linear bem construída, fora do tempo?",
        evidencia: "Aceitar apenas ganho que persiste na validação fora do tempo contra um logit " +
          "com transformações e interações plausíveis. Se o ganho não persiste, o logit basta.",
        cuidado: "Complexidade sem ganho é custo de manutenção sem retorno." },
      { chave: "interacoes", rotulo: "Interações relevantes",
        descricao: "O risco depende de combinações de condições, como comprometimento alto junto de utilização alta.",
        pergunta: "A diferença aparece também fora da amostra de ajuste?",
        evidencia: "Comparar com um logit que também recebeu termos de interação. Medir em validação " +
          "e confirmar no teste congelado, uma única vez.",
        cuidado: "Encontrar interação no treino é fácil. Reproduzir a interação fora do tempo é o teste." },
      { chave: "poucos", rotulo: "Poucos eventos",
        descricao: "Volume pequeno de inadimplências, faixas finas e estimativas instáveis.",
        pergunta: "As previsões e a estrutura são estáveis entre reamostragens?",
        evidencia: "Verificar dispersão entre réplicas, limitar profundidade e número de árvores, " +
          "e declarar a incerteza das métricas.",
        cuidado: "Flexibilidade com poucos eventos costuma ajustar ruído." },
      { chave: "mudanca", rotulo: "Mudança de população",
        descricao: "A composição dos solicitantes muda ao longo do tempo.",
        pergunta: "A relação entre características e risco se manteve nas coortes recentes?",
        evidencia: "Monitorar distribuição de entrada agora e desempenho quando os alvos maturarem. " +
          "Recalibrar ou reestimar conforme o diagnóstico, não por regra automática.",
        cuidado: "Nenhum algoritmo corrige sozinho mudança de população." },
    ];
    var sit = situacoes.filter(function (s) { return s.chave === est.caso; })[0];

    var ganhos = ["relações não lineares sem especificação manual",
                  "interações capturadas pela profundidade das árvores",
                  "boa adaptação a dados tabulares com muitas colunas"];
    var custos = ["ajuste de hiperparâmetros e orçamento de busca",
                  "explicação menos direta que um coeficiente",
                  "risco de sobreajuste quando a validação é frouxa",
                  "manutenção, versionamento e verificação de calibração"];

    /* Exemplo calculado, se o experimento estiver disponível. */
    var comparacao = null;
    if (R) {
      var aval = R.avaliacao;
      comparacao = UI.tabela({
        compacta: true,
        colunas: [{ rotulo: "Modelo" }, { rotulo: "AUC validação" }, { rotulo: "Log loss validação" }],
        linhas: [
          ["Logit regularizado", F.dec(aval.logit.validacao.auc, 4),
           F.dec(aval.logit.validacao.log_loss, 5)],
          ["Logit flexível", F.dec(aval.logit_flex.validacao.auc, 4),
           F.dec(aval.logit_flex.validacao.log_loss, 5)],
          ["Gradient boosting", F.dec(aval.boosting.validacao.auc, 4),
           F.dec(aval.boosting.validacao.log_loss, 5)],
        ],
        legenda: "Sensibilidade observada na validação",
      });
    }

    corpo.appendChild(h("div", { class: "linha cresce" }, [
      h("div", { class: "coluna cresce" }, [
        h("div", { class: "g2 cresce" }, situacoes.map(function (s) {
          var sel = s.chave === est.caso;
          return h("button", {
            class: "painel" + (sel ? " cor" : " claro"),
            type: "button", "aria-pressed": sel ? "true" : "false",
            estilo: "text-align:left;font:inherit;color:inherit;cursor:pointer;" +
                    (sel ? "border-color:var(--boost);border-width:2px" : ""),
            onclick: function () { est.caso = s.chave; est.revelado = false; App.montar("40"); },
          }, [
            h("h3", { class: "secao", estilo: "margin:0 0 6px" }, s.rotulo),
            h("p", { class: "apoio", estilo: "margin:0" }, s.descricao),
            h("p", { class: "nota", estilo: "margin-top:8px" }, "cuidado: " + s.cuidado),
          ]);
        })),
        h("div", { class: "g2" }, [
          h("div", { class: "painel", estilo: "padding:10px 16px" }, [
            h("h3", { class: "secao", estilo: "margin-bottom:4px" }, "Ganhos possíveis"),
            h("ul", { class: "apoio", estilo: "margin:0;padding-left:20px;font-size:17px" },
              ganhos.map(function (t) { return h("li", {}, t); })),
          ]),
          h("div", { class: "painel", estilo: "padding:10px 16px" }, [
            h("h3", { class: "secao", estilo: "margin-bottom:4px" }, "Custos"),
            h("ul", { class: "apoio", estilo: "margin:0;padding-left:20px;font-size:17px" },
              custos.map(function (t) { return h("li", {}, t); })),
          ]),
        ]),
      ]),
      h("div", { class: "coluna", estilo: "flex:0 0 560px" }, [
        h("div", { class: "painel cor" }, [
          h("h3", { class: "secao" }, "O que verificar em " + sit.rotulo.toLowerCase()),
          h("p", { estilo: "font-size:22px;color:var(--ink);margin:0" }, sit.pergunta),
          est.revelado
            ? h("div", { class: "resposta", estilo: "margin-top:10px" },
                [h("strong", {}, "Qual evidência aceitar. "), sit.evidencia])
            : h("button", { class: "btn", estilo: "margin-top:10px", type: "button",
                onclick: function () { est.revelado = true; App.montar("40"); } },
                "Ver a evidência que responde"),
        ]),
        comparacao
          ? h("div", { class: "painel claro cresce" }, [
              h("div", { estilo: "display:flex;justify-content:space-between;align-items:baseline;gap:10px" }, [
                h("h3", { class: "secao", estilo: "margin:0" }, "Sensibilidade já calculada"),
                UI.selo("validação, não o teste", "neutro"),
              ]),
              comparacao,
              h("p", { class: "nota", estilo: "margin-top:6px" },
                "Neste experimento os três ficam próximos na validação. " +
                "Isso é o resultado observado aqui, não uma generalização de mercado."),
            ])
          : null,
        h("button", { class: "btn fantasma", type: "button", onclick: ctx.reiniciar },
          "Reiniciar exemplo"),
      ]),
    ]));
  },
});
