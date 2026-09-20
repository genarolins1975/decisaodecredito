Aula.slide({
  id: "23",
  bloco: "arvore",
  titulo: "Qual pergunta separa melhor os comportamentos observados?",
  subtitulo: "Dois candidatos à primeira divisão, a partir da mesma raiz",
  conclusao: "Uma boa divisão cria grupos mais homogêneos segundo a função objetivo.",
  fonte: Aula.dados.fontes.arvore,
  resumo: "Raiz de 1.000 contratos com 10% de eventos e dois candidatos de divisão, cada um com duas barras de composição.",
  notas: {
    conducao: [
      "Peça que o aluno escolha visualmente e explique por quê.",
      "Se ele usar apenas a diferença entre taxas, pergunte o que aconteceria com uma folha de duas observações.",
      "Mostre o papel do tamanho do grupo antes de revelar a regra de escolha.",
    ],
    respostas: [
      "Histórico separa em 800 contratos com 5% e 200 contratos com 30%.",
      "Comprometimento separa em 680 contratos com aproximadamente 4,41% e 320 contratos com 21,88%.",
      "A regra de escolha é a menor impureza ponderada, calculada no próximo slide.",
    ],
    cuidados: [
      "Esta é a melhor divisão entre os candidatos comparados, não entre todas as variáveis possíveis.",
      "A busca é gulosa e local: a melhor divisão imediata não garante a árvore globalmente ótima.",
      "Com dados agregados não é possível varrer limiares intermediários sem inventar contagens.",
    ],
    transicao: "Vamos colocar essa comparação em números com o índice de Gini.",
  },
  impressao: function (e) { e.regra = true; },

  montar: function (corpo, ctx) {
    var A = Aula.dados.arvore;
    var est = ctx.estado;
    if (!est.escolha) est.escolha = null;

    function painelCandidato(cand) {
      var sel = est.escolha === cand.chave;
      var lados = [cand.esq, cand.dir];
      return h("div", {
        class: "painel" + (sel ? " cor" : " claro") + " cresce",
        estilo: sel ? "border-color:var(--arvore);border-width:2px" : "",
      }, [
        h("div", { estilo: "display:flex;justify-content:space-between;align-items:baseline;gap:10px" }, [
          h("h2", { class: "secao", estilo: "margin:0" }, cand.rotulo),
          h("button", {
            class: "btn min" + (sel ? " sel" : ""), type: "button",
            "aria-pressed": sel ? "true" : "false",
            onclick: function () { est.escolha = sel ? null : cand.chave; App.montar("23"); },
          }, sel ? "hipótese registrada" : "escolher este"),
        ]),
        h("div", { class: "coluna", estilo: "gap:14px;margin-top:12px" },
          lados.map(function (lado) {
            var peso = lado.n / A.n;
            return h("div", {}, [
              h("div", { estilo: "display:flex;justify-content:space-between;align-items:baseline" }, [
                h("span", { estilo: "font-size:22px;font-weight:700;color:var(--ink)" }, lado.rotulo),
                h("span", { class: "apoio" },
                  "n = " + F.inteiro(lado.n) + " · eventos " + F.inteiro(lado.d) +
                  " · taxa " + F.pct(lado.d / lado.n, 2)),
              ]),
              Comum.composicao(lado.n, lado.d, { w: 560, h: 30, rotulo: false }),
              est.comparar
                ? h("div", { estilo: "margin-top:6px" }, [
                    h("div", { estilo: "height:12px;background:var(--rule);border-radius:3px;" +
                      "width:" + (peso * 100).toFixed(1) + "%" }),
                    h("span", { class: "nota" },
                      "peso do grupo: " + F.inteiro(lado.n) + " de " + F.inteiro(A.n) +
                      " = " + F.pct(peso, 1)),
                  ])
                : null,
            ]);
          })),
      ]);
    }

    corpo.appendChild(h("div", { class: "linha", estilo: "align-items:center" }, [
      h("div", { class: "painel cor cresce", estilo: "display:flex;gap:24px;align-items:center;flex-wrap:wrap" }, [
        h("span", { class: "medio" }, "Raiz"),
        h("span", { class: "apoio" },
          F.inteiro(A.n) + " contratos · " + F.inteiro(A.d) + " eventos · taxa " +
          F.pct(A.raiz.pd, 0)),
        Comum.composicao(A.n, A.d, { w: 420, h: 30 }),
      ]),
    ]));

    corpo.appendChild(h("div", { class: "linha cresce" }, [
      painelCandidato(A.candidatos[0]),
      painelCandidato(A.candidatos[1]),
      h("div", { class: "coluna", estilo: "flex:0 0 400px" }, [
        h("div", { class: "painel" }, [
          h("h3", { class: "secao" }, "Exploração"),
          h("div", { class: "grupo vert" }, [
            UI.alterna({
              rotulo: "composição", valor: est.comparar,
              ligadoRotulo: "Esconder o peso dos grupos",
              desligadoRotulo: "Comparar composição e peso",
              aoMudar: function (v) { est.comparar = v; App.montar("23"); },
            }),
            h("button", { class: "btn", type: "button", onclick: function () {
              est.regra = true; App.montar("23");
            }, disabled: est.regra }, "Ver regra de escolha"),
            h("button", { class: "btn fantasma", type: "button", onclick: ctx.reiniciar },
              "Reiniciar exemplo"),
          ]),
        ]),
        est.regra
          ? h("div", { class: "resposta cresce" }, [
              h("p", {}, [h("strong", {}, "Regra de escolha: "),
                "a divisão escolhida é a de menor impureza ponderada, considerando " +
                "ao mesmo tempo a mistura de classes em cada lado e o tamanho de cada lado."]),
              h("p", { class: "nota", estilo: "margin-top:8px" },
                "O cálculo completo com o índice de Gini vem no próximo slide."),
            ])
          : h("div", { class: "painel claro cresce" }, [
              h("h3", { class: "secao" }, "Antes de calcular"),
              h("p", { class: "apoio" },
                "Uma diferença grande entre taxas, isoladamente, não basta: os tamanhos dos " +
                "grupos também importam. Uma folha com duas observações pode ter taxa de 50% " +
                "sem qualquer evidência."),
            ]),
        h("p", { class: "nota" },
          "Os dois candidatos partem exatamente da mesma raiz: " + F.inteiro(A.n) +
          " contratos e " + F.inteiro(A.d) + " eventos."),
      ]),
    ]));
  },
});
