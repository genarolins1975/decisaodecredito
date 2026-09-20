Aula.slide({
  id: "21",
  bloco: "arvore",
  titulo: "Houve atraso? Qual é o comprometimento?",
  subtitulo: "Uma árvore organiza a previsão em perguntas sucessivas",
  conclusao: "A árvore encaminha clientes semelhantes para uma mesma estimativa de risco.",
  fonte: Aula.dados.fontes.arvore,
  resumo: "Árvore de profundidade dois: histórico na raiz e comprometimento em cada ramo, com o percurso de um cliente destacado.",
  notas: {
    conducao: [
      "Pergunte qual informação a árvore consultará primeiro.",
      "Leve Ana à esquerda e então à folha de comprometimento até 40%.",
      "Mostre Diego no outro ramo para criar contraste. Só depois nomeie nó, ramo e folha.",
      "Não explique Gini neste slide.",
    ],
    respostas: [
      "Ana: histórico 0 e comprometimento 22%, portanto ramo esquerdo e folha de comprometimento até 40%.",
      "Bruno: histórico 1 e comprometimento 38%, portanto ramo direito e folha de comprometimento até 40%.",
      "Carla: histórico 0 e comprometimento 48%, folha de comprometimento acima de 40%.",
      "Diego: histórico 1 e comprometimento 55%, folha de comprometimento acima de 40%.",
      "Comprometimento exatamente igual a 40 vai para o ramo até 40.",
    ],
    cuidados: [
      "O percurso é determinístico, mas a previsão ao final é probabilística. Duas pessoas diferentes podem cair na mesma folha.",
      "As perguntas e os limites são aprendidos dos dados. O limite de 40% é regra deste exemplo, não norma de crédito.",
      "Esta árvore pequena serve para enxergar o mecanismo. Não é o resultado do experimento maior.",
    ],
    transicao: "Depois de encaminhar o cliente, precisamos atribuir uma PD ao grupo ao qual ele pertence.",
  },
  impressao: function (e) { e.passo = 3; },

  montar: function (corpo, ctx) {
    var D = Aula.dados, A = D.arvore;
    var est = ctx.estado;
    if (!est.cliente) est.cliente = "Ana";
    if (est.passo === undefined) est.passo = 0;

    var c = D.cliente(est.cliente);
    var caminho = A.percurso(c);
    var etapas = [
      "A raiz pergunta pelo histórico.",
      "Resposta de " + c.nome + ": " + caminho[0].rotulo + ".",
      "Segundo nó: " + caminho[1].rotulo + ". Chega à folha.",
    ];

    var arvore = Comum.arvoreDidatica({
      cliente: est.passo > 0 ? c : null,
      passo: est.passo,
      mostrarNumeros: false,
      mostrarPd: false,
      w: 1000, h: 380, caixaW: 250, caixaH: 46,
      rotuloFolha: function () { return "grupo de contratos"; },
      resumo: "Árvore de profundidade dois. Raiz: houve atraso de 15 a 89 dias. " +
              "Cada ramo pergunta se o comprometimento passa de 40%.",
    });

    corpo.appendChild(h("div", { class: "linha cresce" }, [
      h("div", { class: "coluna cresce" }, [
        h("div", { class: "painel claro cresce centro" }, arvore),
        h("div", { class: "painel" }, [
          h("p", { class: "apoio", estilo: "margin:0" },
            "As perguntas e seus limites são aprendidos dos dados. Aqui usamos uma árvore pequena " +
            "para enxergar o mecanismo. As folhas ainda não mostram PD: primeiro a estrutura."),
        ]),
      ]),
      h("div", { class: "coluna", estilo: "flex:0 0 440px" }, [
        Comum.ficha(c, { cor: true, campos: ["comp", "hist"],
          rodape: "Só estas duas entram nas perguntas desta árvore." }),
        h("div", { class: "painel" }, [
          h("div", { class: "ctrl" }, [
            h("label", {}, "Cliente"),
            Comum.seletorCliente(est.cliente, function (v) {
              est.cliente = v; est.passo = 0; App.montar("21");
            }, { compacto: true }),
          ]),
          h("div", { class: "grupo", estilo: "margin-top:12px" }, [
            h("button", { class: "btn", type: "button", disabled: est.passo >= 3,
              onclick: function () { est.passo = Math.min(3, est.passo + 1); App.montar("21"); } },
              est.passo === 0 ? "Percorrer com " + c.nome : "Próximo passo"),
            h("button", { class: "btn fantasma", type: "button", onclick: ctx.reiniciar },
              "Reiniciar exemplo"),
          ]),
        ]),
        h("div", { class: "painel claro cresce" }, [
          h("h3", { class: "secao" }, "Percurso"),
          h("ol", { estilo: "margin:0;padding-left:20px;font-size:19px" },
            etapas.map(function (t, i) {
              return h("li", { estilo: "margin-bottom:5px;color:" +
                (i < est.passo ? "var(--ink)" : "var(--muted)") +
                ";opacity:" + (i < est.passo ? 1 : .55) }, t);
            })),
          est.passo >= 3
            ? h("p", { class: "resposta", estilo: "margin-top:10px" },
                "Regra completa da folha: " + caminho[2].no.regra + ".")
            : null,
        ]),
        h("p", { class: "nota", estilo: "margin:0" },
          "Raiz: primeira pergunta. Nó: qualquer pergunta. Ramo: resposta que leva adiante. " +
          "Folha: grupo final, onde a previsão é atribuída."),
      ]),
    ]));
  },
});
