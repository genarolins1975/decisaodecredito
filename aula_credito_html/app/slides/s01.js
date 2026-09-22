Aula.slide({
  id: "01",
  bloco: "problema",
  titulo: "Você aprovaria estes quatro clientes?",
  subtitulo: "Crédito pessoal, horizonte de 12 meses",
  conclusao: "Aprovar exige estimar risco e definir uma política.",
  fonte: Aula.dados.fontes.conceito,
  resumo: "Quatro propostas de crédito pessoal com renda e comprometimento, cada uma com três opções de decisão.",
  notas: {
    conducao: [
      "Peça 20 segundos de avaliação silenciosa e registre uma opinião por perfil.",
      "Pergunte por que Carla, com a maior renda da mesa, ainda poderia exigir investigação.",
      "Se alguém pedir taxa, prazo e custos, reconheça que faltam elementos da política econômica. A conta aparece no slide 47.",
    ],
    cuidados: [
      "A seleção representa apenas a escolha neste dispositivo. Não existe contagem de turma nem resultado coletivo.",
      "Nenhuma proposta tem desfecho conhecido. Não atribua valor moral à renda nem ao nome do cliente.",
      "Um cliente de maior risco ainda pode ser economicamente aceitável sob certas condições. Cobrar mais não resolve qualquer risco.",
    ],
    transicao: "Antes de escolher uma técnica, precisamos conhecer os mesmos clientes e definir exatamente o que vamos prever.",
  },
  impressao: function (e) { e.revelado = true; e.desafio = true; },

  montar: function (corpo, ctx) {
    var D = Aula.dados;
    var est = ctx.estado;
    if (!est.escolhas) est.escolhas = {};
    if (!est.mudou) est.mudou = {};

    var opcoes = [
      { valor: "aprovar", rotulo: "Aprovar" },
      { valor: "recusar", rotulo: "Recusar" },
      { valor: "mais", rotulo: "Preciso de mais informação" },
    ];

    /* Espaçamento uniforme: com space-between as quatro fichas abriam espaços de tamanhos
       diferentes entre si, e o que deveria ser uma lista lia como quatro blocos soltos. */
    var lista = h("div", { class: "coluna", estilo: "gap:12px" });

    /* Cada característica vira um valor rotulado, e não um trecho de frase em cinza: é a
       primeira tela da aula e precisa ser lida do fundo da sala. Os três campos extras
       entram na mesma grade quando o professor revela, sem mudar a altura da ficha. */
    function valor(rot, val, forte) {
      return h("div", { estilo: "min-width:0" }, [
        h("div", { class: "rot", estilo: "font-size:15px;letter-spacing:.06em" }, rot),
        h("div", { class: "medio", estilo: "font-size:27px;line-height:1.1;white-space:nowrap" +
          (forte ? ";color:var(--cor)" : "") }, val),
      ]);
    }

    function linhaCliente(c) {
      var aviso = h("span", { class: "nota", estilo: "display:block;margin-top:2px",
        "aria-live": "polite" }, est.mudou[c.nome] ? "você mudou sua avaliação" : "");
      var campos = [valor("Renda por mês", F.reais(c.renda)),
                    valor("Comprometimento", F.dec(c.comp, 0) + "%", true)];
      if (est.revelado) {
        campos.push(valor("Histórico de atraso", c.hist ? "sim" : "não"));
        campos.push(valor("Utilização", F.dec(c.util, 0) + "%"));
        campos.push(valor("Relacionamento", F.dec(c.rel, 0) + " meses"));
      }
      var grupo = UI.botoes({
        rotulo: "decisão para " + c.nome,
        compacto: true,
        opcoes: opcoes,
        valor: est.escolhas[c.nome] || null,
        aoMudar: function (v) {
          if (est.escolhas[c.nome] && est.escolhas[c.nome] !== v) {
            est.mudou[c.nome] = true;
            aviso.textContent = "você mudou sua avaliação";
          }
          est.escolhas[c.nome] = v;
        },
      });
      grupo.setAttribute("style", "margin-left:auto;flex:1 1 auto;justify-content:flex-end");
      /* Altura natural, sem cresce: esticar uma ficha de uma linha só a deixa oca, que é pior
         do que a faixa de margem que sobra no pé do palco. */
      return h("div", { class: "painel claro", estilo: "padding:14px 20px" },
        h("div", { estilo: "display:flex;align-items:center;gap:30px;flex-wrap:wrap;width:100%" }, [
          h("div", { estilo: "flex:1 1 160px;min-width:150px" }, [
            h("div", { class: "medio", estilo: "font-size:32px;line-height:1.05" }, c.nome),
            aviso,
          ]),
          h("div", { estilo: "display:flex;gap:32px;flex-wrap:wrap;flex:1 1 auto;min-width:0" }, campos),
          grupo,
        ]));
    }

    D.clientes.forEach(function (c) { lista.appendChild(linhaCliente(c)); });

    var desafio = h("div", { class: "painel cor", hidden: !est.desafio }, [
      h("h2", { class: "secao" }, "O desafio da aula"),
      h("p", { class: "apoio", estilo: "font-size:24px;color:var(--ink)" },
        "Estimar PD, comparar modelos e transformar risco em decisão."),
    ]);

    var controles = h("div", { class: "grupo" }, [
      h("button", {
        class: "btn", type: "button", onclick: function () {
          est.revelado = true; App.montar("01");
        }, disabled: est.revelado,
      }, "Revelar mais informações"),
      h("button", {
        class: "btn", type: "button", onclick: function () {
          est.desafio = true; desafio.hidden = false;
        },
      }, "O desafio da aula"),
      h("button", { class: "btn fantasma", type: "button", onclick: ctx.reiniciar }, "Reiniciar exemplo"),
    ]);

    corpo.appendChild(h("div", { class: "linha cresce" }, [
      h("div", { class: "coluna cresce" }, [
        lista,
        h("div", { class: "painel cor", estilo: "padding:14px 20px;flex:0 0 auto" },
          h("p", { estilo: "font-size:27px;color:var(--ink);margin:0" },
            "Que informação faria você mudar de ideia?")),
      ]),
      h("div", { class: "coluna", estilo: "flex:0 0 400px" }, [
        h("div", { class: "painel" }, [
          h("h3", { class: "secao" }, "Como usar"),
          h("p", { class: "apoio" },
            "Escolha uma opção por cliente. A seleção fica apenas neste dispositivo e não vira estatística da turma."),
          controles,
        ]),
        desafio,
      ]),
    ]));
  },
});
