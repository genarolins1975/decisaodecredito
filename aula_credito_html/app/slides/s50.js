Aula.slide({
  id: "50",
  bloco: "decisao",
  titulo: "Você consegue explicar, comparar e usar os três modelos?",
  subtitulo: "Definir, estimar, validar e decidir são etapas conectadas",
  conclusao: "A técnica importa. A evidência que sustenta seu uso importa tanto quanto.",
  fonte: "Síntese do curso",
  resumo: "Tabela de síntese dos três modelos, três perguntas de recuperação e o roteiro de aplicação no trabalho.",
  notas: {
    conducao: [
      "Peça que um aluno resuma cada técnica em uma frase.",
      "Retome a decisão do slide 01 sem inventar quais respostas a turma deu. Se as escolhas locais foram salvas, identifique que são escolhas naquele dispositivo.",
      "Pergunte o que agora exigiriam antes de aprovar uma mudança de modelo.",
    ],
    respostas: [
      "Odds vezes 2 não é PD vezes 2: odds e probabilidade são escalas diferentes.",
      "Sim, a mesma folha agrupa atributos distintos que satisfazem as mesmas regras.",
      "Não: o boosting logístico soma no escore F e aplica a transformação depois.",
    ],
    cuidados: [
      "Complexidade pode ser útil, e a qualidade da decisão depende do processo inteiro.",
      "Referências, notebook e modo estudo ficam disponíveis nos recursos finais.",
      "Não existe um 51º slide de agradecimento: o fechamento é esta síntese.",
    ],
    transicao: "Fim da sequência principal.",
  },
  impressao: function (e) { e.respondidas = { odds: true, folha: true, soma: true }; },

  montar: function (corpo, ctx) {
    var D = Aula.dados;
    var est = ctx.estado;
    if (!est.respondidas) est.respondidas = {};

    var sintese = [
      { nome: "Regressão logística", cor: "var(--logit)",
        constroi: "soma funções das características em um escore e converte pela logística",
        cuidado: "especificação, unidade das variáveis e leitura dos coeficientes",
        evidencia: "validação da forma funcional e calibração fora do tempo" },
      { nome: "Árvore de decisão", cor: "var(--arvore)",
        constroi: "aprende regras sucessivas e usa a frequência observada na folha",
        cuidado: "complexidade, tamanho de folha e instabilidade entre amostras",
        evidencia: "desempenho fora do tempo e estabilidade entre reamostragens" },
      { nome: "Gradient boosting", cor: "var(--boost)",
        constroi: "acrescenta contribuições sucessivas ao escore e converte no fim",
        cuidado: "trajetória de ajuste, complexidade de cada árvore e explicação",
        evidencia: "curva de validação, parada definida antes e verificação de calibração" },
    ];

    var tabela = UI.tabela({
      compacta: true,
      colunas: [{ rotulo: "Técnica" }, { rotulo: "Como constrói a PD" },
                { rotulo: "Principal cuidado" }, { rotulo: "Evidência necessária" }],
      linhas: sintese.map(function (s) {
        return [s.nome, s.constroi, s.cuidado, s.evidencia];
      }),
      legenda: "Síntese das três técnicas",
    });
    [].forEach.call(tabela.querySelectorAll("tbody tr"), function (tr, i) {
      tr.firstChild.setAttribute("style", "color:" + sintese[i].cor);
    });

    var perguntas = [
      { chave: "odds", pergunta: "Odds multiplicadas por 2 significam PD multiplicada por 2?",
        resposta: "Não. Odds e probabilidade são escalas diferentes: com odds dobradas, 10% vira " +
          F.pct(M.porRazaoDeOdds(0.10, 2), 2) + " e 40% vira " +
          F.pct(M.porRazaoDeOdds(0.40, 2), 2) + ".",
        slide: "11" },
      { chave: "folha", pergunta: "A mesma folha pode conter clientes diferentes?",
        resposta: "Sim. A folha agrupa todos os contratos que satisfazem as mesmas regras, e " +
          "atribui a mesma previsão a todos eles.",
        slide: "22" },
      { chave: "soma", pergunta: "As árvores do boosting somam probabilidades?",
        resposta: "Não. A soma acontece no escore F, e a transformação logística é aplicada uma " +
          "única vez no final.",
        slide: "36" },
    ];

    var roteiro = [
      "Alvo: qual evento, em qual horizonte e para qual população elegível.",
      "Dados: o que existia e estava acessível na data da decisão.",
      "Referência: um modelo simples bem especificado, que os demais precisam superar.",
      "Protocolo: partições por data, maturação do alvo e regras congeladas antes do teste.",
      "Comparação: mesmo conjunto de informação, mesma métrica e incerteza declarada.",
      "Decisão: corte, economia da operação e plano de monitoramento com responsável.",
    ];

    var textoRoteiro = roteiro.map(function (t, i) { return (i + 1) + ". " + t; }).join("\n");

    corpo.appendChild(h("div", { class: "linha cresce" }, [
      h("div", { class: "coluna cresce" }, [
        h("div", { class: "painel claro" }, tabela),
        h("div", { class: "painel cor", estilo: "padding:10px 16px" }, [
          h("p", { class: "apoio", estilo: "color:var(--ink);margin:0;font-size:20px" },
            [h("strong", {}, "Para os três: "),
             "informação disponível na decisão, validação temporal, calibração das " +
             "probabilidades e conexão com a decisão econômica."]),
        ]),
        h("div", { class: "painel claro cresce", estilo: "padding:10px 16px" }, [
          h("div", { estilo: "display:flex;flex-wrap:wrap;justify-content:space-between;align-items:baseline;gap:10px;flex-wrap:wrap" }, [
            h("h3", { class: "secao", estilo: "margin:0" },
              "Os mesmos quatro clientes do começo"),
            h("span", { class: "nota" }, "qual modelo, qual política e por quê?"),
          ]),
          h("div", { estilo: "display:flex;gap:22px;flex-wrap:wrap;margin-top:6px" },
            D.clientes.map(function (c) {
              return h("span", { class: "apoio", estilo: "font-size:18px" }, [
                h("strong", { estilo: "font-size:21px" }, c.nome), " ",
                F.reais(c.renda) + " · comp " + F.dec(c.comp, 0) + "% · hist " +
                (c.hist ? "sim" : "não"),
              ]);
            })),
        ]),
      ]),
      h("div", { class: "coluna", estilo: "flex:0 0 600px" }, [
        h("div", { class: "painel", estilo: "padding:10px 16px" }, [
          h("div", { estilo: "display:flex;flex-wrap:wrap;justify-content:space-between;align-items:baseline;gap:10px" }, [
            h("h3", { class: "secao", estilo: "margin-bottom:4px" },
              "Três perguntas de recuperação"),
            h("button", { class: "btn min fantasma", estilo: "padding:2px 0;white-space:nowrap",
              type: "button", onclick: ctx.reiniciar, "aria-label": "Reiniciar exemplo" }, "Reiniciar"),
          ]),
          h("div", { class: "coluna", estilo: "gap:6px" }, perguntas.map(function (p) {
            var aberta = est.respondidas[p.chave];
            return h("div", { class: "painel" + (aberta ? " cor" : " claro"),
              estilo: "padding:7px 12px" }, [
              h("p", { estilo: "font-size:18px;color:var(--ink);margin:0 0 4px" }, p.pergunta),
              aberta
                ? h("div", {}, [
                    h("p", { class: "apoio", estilo: "margin:0;font-size:16px" }, p.resposta),
                    h("div", { class: "grupo", estilo: "margin-top:2px;gap:10px" }, [
                      h("button", { class: "btn min fantasma", estilo: "padding:2px 0",
                        type: "button", onclick: function () { ctx.ir(p.slide); } },
                        "Rever no slide " + p.slide),
                      h("button", { class: "btn min fantasma", estilo: "padding:2px 0",
                        type: "button", onclick: function () {
                          delete est.respondidas[p.chave]; App.montar("50");
                        } }, "Esconder"),
                    ]),
                  ])
                : h("button", { class: "btn min", type: "button", onclick: function () {
                    est.respondidas[p.chave] = true; App.montar("50");
                  } }, "Responder"),
            ]);
          })),
        ]),
        h("div", { class: "painel claro cresce", estilo: "padding:10px 16px" }, [
          h("div", { estilo: "display:flex;flex-wrap:wrap;justify-content:space-between;align-items:baseline;gap:10px" }, [
            h("h3", { class: "secao", estilo: "margin:0" }, "Aplicar no meu trabalho"),
            h("button", { class: "btn min", type: "button", onclick: function (ev) {
              var alvo = ev.target;
              try {
                navigator.clipboard.writeText(textoRoteiro).then(function () {
                  alvo.textContent = "roteiro copiado";
                }, function () { alvo.textContent = "cópia não disponível"; });
              } catch (e) { alvo.textContent = "cópia não disponível"; }
            } }, "Copiar roteiro"),
          ]),
          h("ol", { class: "apoio", estilo: "margin:3px 0 0;padding-left:20px;font-size:16px" },
            roteiro.map(function (t) { return h("li", { estilo: "margin-bottom:1px" }, t); })),
        ]),
        h("div", { class: "painel cor", estilo: "padding:10px 16px" }, [
          h("p", { class: "medio", estilo: "margin:0;font-size:22px" },
            "Leve os seis passos para a sua carteira. A conclusão da aula está na linha " +
            "de fechamento, abaixo."),
        ]),
      ]),
    ]));
  },
});
