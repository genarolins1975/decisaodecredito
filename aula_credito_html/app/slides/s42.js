Aula.slide({
  id: "42",
  bloco: "boosting",
  titulo: "O novo cliente caiu no grupo B. Qual é a previsão?",
  subtitulo: "Exercício: somar em escore e converter uma única vez",
  conclusao: "Com as árvores treinadas, os atributos determinam o percurso e a soma determina a PD.",
  fonte: Aula.dados.fontes.boosting,
  resumo: "Escore inicial e duas folhas do grupo B, com três métodos possíveis de combinação.",
  notas: {
    conducao: [
      "Dê um minuto individual e outro em duplas.",
      "Peça que verbalizem onde o desfecho y foi usado e onde deixou de ser necessário.",
      "Conclua o bloco conectando logit e boosting pela saída probabilística, com funções de escore diferentes.",
    ],
    respostas: [
      "Soma em escore: −1,386294 mais 0,200000 mais 0,166078 é igual a −1,020217. A PD é 26,4985%.",
      "Somar percentuais daria 20% mais 20% mais 16,6078%, o que não é a operação do modelo.",
      "A média das duas folhas ignoraria o escore inicial e a natureza aditiva da construção.",
      "Sobre causalidade: uma contribuição positiva do histórico não prova que remover o atraso do cadastro reduziria o risco real.",
      "Reduzir a taxa de aprendizagem exige recalcular as rodadas e os resíduos, não dividir a PD.",
    ],
    cuidados: [
      "A soma das árvores acontece na escala de log odds. Somar contribuições em probabilidade dá resultado errado.",
      "A miniatura tem 10 registros e serve para ver o mecanismo. Não é modelo ajustado nem sustenta comparação de desempenho.",
      "Reconstruir a previsão de um cliente novo não valida o modelo: validação exige amostra fora do tempo, no bloco seguinte.",
    ],
    transicao: "Sabemos como as três técnicas funcionam. Agora precisamos comparar as três em condições iguais e verificar o que cada métrica responde.",
  },
  impressao: function (e) { e.escolha = 1; e.conferido = true; e.passos = 2; },

  montar: function (corpo, ctx) {
    var B = Aula.dados.boosting;
    var est = ctx.estado;
    if (est.escolha === undefined) est.escolha = null;
    if (est.passos === undefined) est.passos = 0;

    var hist = B.rodar(2, 1);
    var F0 = hist[0].grupos.B.F;
    var h1 = hist[1].grupos.B.h, h2 = hist[2].grupos.B.h;
    var total = hist[2].grupos.B.F;
    var pd = hist[2].grupos.B.p;
    var somaPercentuais = 0.20 + 0.20 + 0.166078;
    var mediaFolhas = (h1 + h2) / 2;

    var alternativas = [
      { rotulo: "Somar como pontos percentuais: 20% mais 20% mais 16,6078%.",
        correta: false,
        feedback: "As folhas não estão em pontos percentuais: elas estão na escala do escore. " +
          "Essa soma daria " + F.pct(somaPercentuais, 2) +
          ", o que não corresponde a nenhuma etapa do modelo." },
      { rotulo: "Somar ao escore e aplicar a função logística uma única vez.",
        correta: true,
        feedback: "Escore final " + F.dec(F0, 6) + " mais " + F.dec(h1, 6) + " mais " +
          F.dec(h2, 6) + " é igual a " + F.dec(total, 6) + ". Aplicando a logística, PD de " +
          F.pct(pd, 4) + "." },
      { rotulo: "Tirar a média das duas folhas.",
        correta: false,
        feedback: "A média das folhas seria " + F.dec(mediaFolhas, 6) +
          ", o que descarta o escore inicial e trata a construção como votação. " +
          "O boosting soma as contribuições, não as promedia." },
    ];

    var quiz = UI.quiz({
      alternativas: alternativas,
      escolha: est.escolha,
      conferido: est.conferido,
      rotulo: "como combinar as contribuições",
      aoEscolher: function (k) { est.escolha = k; est.conferido = false; },
      aoConferir: function () { est.conferido = true; },
    });

    var g = Graf.waterfall({
      w: 578, h: 300, larguraRot: 196,
      base: F0, rotuloBase: "escore inicial", rotuloTotal: "escore final", rotuloX: "escore F",
      visiveis: est.passos >= 1 ? 2 : 0,
      itens: [
        { rotulo: "folha da árvore 1", valor: h1, cor: "var(--boost)" },
        { rotulo: "folha da árvore 2", valor: h2, cor: "var(--boost)" },
      ],
    });

    corpo.appendChild(h("div", { class: "linha cresce" }, [
      h("div", { class: "coluna", estilo: "flex:0 0 480px" }, [
        h("div", { class: "painel cor" }, [
          h("h3", { class: "secao" }, "O que já sabemos"),
          UI.kv([
            ["escore inicial F0", F.dec(F0, 6)],
            ["folha da árvore 1", F.sinal(h1, 6)],
            ["folha da árvore 2", F.sinal(h2, 6)],
            ["taxa de aprendizagem", F.dec(1, 0)],
            ["PD final", est.conferido ? F.pct(pd, 4) : "oculta"],
          ]),
        ]),
        h("div", { class: "painel claro cresce" }, [
          h("h3", { class: "secao" }, "Pergunta de interpretação"),
          h("p", { class: "apoio" },
            "Uma contribuição positiva do histórico prova que remover o atraso do cadastro " +
            "reduziria o risco real?"),
          est.conferido
            ? h("div", { class: "resposta" },
                "Não. A contribuição explica a função preditiva aprendida com registros " +
                "históricos. Ela não identifica o efeito de uma intervenção sobre o cadastro.")
            : h("p", { class: "nota" }, "A resposta aparece ao conferir a alternativa."),
        ]),
      ]),
      h("div", { class: "coluna cresce" }, [
        h("div", { class: "painel claro cresce" }, [
          h("h3", { class: "secao" }, "Escolha o método correto"),
          quiz,
        ]),
        h("div", { class: "grupo" }, [
          h("button", { class: "btn", type: "button", disabled: est.passos >= 2,
            onclick: function () { est.passos = Math.min(2, est.passos + 1); App.montar("42"); } },
            est.passos === 0 ? "Ver resolução" : est.passos === 1 ? "Converter em PD" : "Resolvido"),
          h("button", { class: "btn", type: "button", onclick: function () {
            est.desafio = !est.desafio; App.montar("42");
          } }, est.desafio ? "Esconder o desafio" : "Desafio de consolidação"),
          h("button", { class: "btn fantasma", type: "button", onclick: ctx.reiniciar },
            "Reiniciar exercício"),
        ]),
      ]),
      h("div", { class: "coluna", estilo: "flex:0 0 620px" }, [
        h("div", { class: "painel claro cresce centro" }, [
          est.passos >= 1
            ? g.svg
            : h("p", { class: "apoio", estilo: "text-align:center" },
                "A resolução aparece em duas etapas: primeiro a soma no escore, depois a conversão."),
          est.passos >= 2
            ? h("div", { estilo: "display:flex;gap:20px;align-items:center;margin-top:10px;flex-wrap:wrap;justify-content:center" }, [
                Comum.miniSigmoide(total, { w: 320, h: 180, zmin: -2.4, zmax: 0.4 }),
                h("div", {}, [
                  h("p", { class: "grande" }, F.pct(pd, 4)),
                  h("p", { class: "nota" }, "sigmoid(" + F.dec(total, 6) + ")"),
                ]),
              ])
            : null,
        ]),
        est.desafio
          ? h("div", { class: "painel cor" }, [
              h("h3", { class: "secao" }, "Desafio de consolidação"),
              h("p", { class: "apoio" },
                "O que muda ao reduzir a taxa de aprendizagem no treinamento?"),
              est.conferido
                ? h("div", { class: "resposta" },
                    "Com passo menor, a primeira atualização desloca menos o escore, os resíduos " +
                    "da segunda rodada ficam diferentes e as árvores seguintes aprendem outra " +
                    "coisa. É preciso recalcular as rodadas inteiras, e não dividir a PD final.")
                : h("p", { class: "nota" }, "A resposta aparece ao conferir a alternativa."),
            ])
          : null,
      ]),
    ]));
  },
});
