Aula.slide({
  id: "28",
  bloco: "arvore",
  titulo: "Três controles, três formas de conter o excesso de divisões",
  subtitulo: "Profundidade máxima, mínimo de contratos por folha e poda por complexidade",
  conclusao: "Controlar complexidade é escolher quais detalhes dos dados vale a pena manter.",
  fonte: Aula.dados.fontes.experimento,
  resumo: "Árvore treinada resumida até o terceiro nível e três controles de complexidade com cenários efetivamente ajustados.",
  notas: {
    conducao: [
      "Mostre primeiro a profundidade, depois uma folha pequena que ainda existe mesmo em árvore rasa.",
      "Use essa folha para motivar o mínimo de contratos por folha.",
      "Por fim, explique que a poda considera retirar partes de uma árvore já crescida.",
    ],
    respostas: [
      "O parâmetro de folha é mínimo de observações, não mínimo de inadimplentes.",
      "O alfa da poda não tem unidade universal de nós removidos: ele é o preço por folha no critério de custo e complexidade.",
      "A seleção usa a perda de validação fora do tempo.",
    ],
    cuidados: [
      "Cada configuração corresponde a uma árvore realmente treinada, não a uma ocultação visual de nós.",
      "Aumentar o mínimo por folha não melhora calibração automaticamente.",
      "O critério final continua sendo desempenho fora da amostra de ajuste.",
    ],
    transicao: "Mesmo árvores de tamanho parecido podem mudar bastante quando mudamos a amostra usada para aprender.",
  },

  montar: function (corpo, ctx) {
    var R = Aula.resultados;
    var est = ctx.estado;
    if (!R) {
      corpo.appendChild(h("p", { class: "resposta erro" },
        "Resultados do experimento não disponíveis: execute experimento/experimento.py e recompile."));
      return;
    }
    if (!est.aba) est.aba = "profundidade";
    if (est.i === undefined) est.i = 0;

    var cen = R.modelos.arvore.cenarios;
    var escolhido = R.modelos.arvore;

    var abas = {
      profundidade: {
        rotulo: "Profundidade máxima",
        explicacao: "Limita quantas perguntas em sequência a árvore pode fazer. " +
          "Aqui o mínimo por folha fica fixo em " + F.inteiro(escolhido.min_folha) + " contratos.",
        itens: [2, 3, 4, 6].map(function (p) {
          var c = cen.filter(function (x) {
            return x.profundidade === p && x.min_folha === escolhido.min_folha;
          })[0];
          return { rotulo: "profundidade " + p, c: c, valor: p };
        }),
      },
      folha: {
        rotulo: "Mínimo de contratos por folha",
        explicacao: "Impede que a árvore crie grupos pequenos demais para sustentar uma taxa. " +
          "Aqui a profundidade fica fixa em " +
          (escolhido.profundidade < 0 ? "sem limite" : escolhido.profundidade) + ".",
        itens: [20, 50, 100, 300].map(function (f) {
          var c = cen.filter(function (x) {
            return x.min_folha === f && x.profundidade === escolhido.profundidade;
          })[0];
          return { rotulo: "mínimo " + f, c: c, valor: f };
        }),
      },
      poda: {
        rotulo: "Poda por custo e complexidade",
        explicacao: ["Cresce a árvore e depois retira ramos que não pagam seu preço por folha: minimiza ",
          Mat.i("R_\\alpha(T) = R(T) + \\alpha\\,|T|"), ", em que ", Mat.i("R(T)"),
          " é a impureza da árvore, ", Mat.i("|T|"), " o número de folhas e ", Mat.i("\\alpha"), " o preço de cada uma."],
        itens: R.modelos.arvore.poda.map(function (p) {
          return { rotulo: "alfa " + F.dec(p.alpha, 6), c: {
            folhas: p.folhas, perda_validacao: p.perda_validacao,
            auc_validacao: p.auc_validacao,
          }, valor: p.alpha };
        }),
      },
    };
    var aba = abas[est.aba];
    if (est.i >= aba.itens.length) est.i = 0;
    var item = aba.itens[est.i];
    var anterior = est.i > 0 ? aba.itens[est.i - 1] : null;

    var profArvore = est.aba === "profundidade" ? Math.min(item.valor, 3) : 3;
    var arvore = Comum.arvoreTreinada(R.modelos.arvore.estrutura, {
      profundidade: profArvore, compacto: true, w: 900, h: 430, caixaW: 190, caixaH: 62,
      resumo: "Árvore treinada, resumida até o nível " + profArvore + ".",
    });

    var gb = Graf.barras({
      w: 540, h: 158, larguraRot: 170, m: { d: 130, c: 6, b: 46 },
      itens: aba.itens.map(function (it, k) {
        return { rotulo: it.rotulo, valor: it.c ? it.c.perda_validacao : 0,
                 cor: k === est.i ? "var(--arvore)" : "var(--rule)",
                 texto: it.c ? F.dec(it.c.perda_validacao, 4) : "não calculado" };
      }),
      min: 0.33, max: 0.38, ticks: [0.33, 0.35, 0.37],
      formato: function (v) { return F.dec(v, 2); },
      rotuloX: "log loss de validação",
    });

    corpo.appendChild(h("div", { class: "linha cresce" }, [
      h("div", { class: "coluna cresce" }, [
        h("div", { class: "painel claro cresce centro" }, [
          h("h3", { class: "secao" },
            "Modelo selecionado, resumido até o nível " + profArvore),
          arvore,
        ]),
        h("p", { class: "nota" },
          "Nomes abreviados nas caixas: comp é comprometimento, hist é histórico, util é " +
          "utilização, rel é relacionamento. Ramos além do nível mostrado aparecem resumidos. " +
          "A árvore selecionada tem " + F.inteiro(escolhido.folhas) + " folhas."),
      ]),
      h("div", { class: "coluna", estilo: "flex:0 0 560px" }, [
        h("div", { class: "grupo" }, Object.keys(abas).map(function (k) {
          return h("button", {
            class: "btn" + (est.aba === k ? " sel" : ""), type: "button",
            "aria-pressed": est.aba === k ? "true" : "false",
            onclick: function () { est.aba = k; est.i = 0; App.montar("28"); },
          }, abas[k].rotulo);
        })),
        h("div", { class: "painel cor", estilo: "padding:10px 14px" }, [
          h("p", { class: "apoio", estilo: "color:var(--ink);margin:0;font-size:18px" },
            Array.isArray(aba.explicacao) ? aba.explicacao : [aba.explicacao]),
        ]),
        h("div", { class: "painel" }, [
          UI.slider({
            rotulo: "Cenário treinado", discreto: true, min: 0, max: aba.itens.length - 1, passo: 1,
            valor: est.i,
            formato: function (v) { return aba.itens[v].rotulo; },
            aoMudar: function (v) { est.i = v; App.montar("28"); },
          }),
          h("div", { estilo: "display:flex;gap:24px;margin-top:10px;flex-wrap:wrap" }, [
            h("span", { class: "medio" }, item.c ? F.inteiro(item.c.folhas) + " folhas" : "sem ajuste"),
            item.c && item.c.mediana_n_folha
              ? h("span", { class: "apoio" },
                  "mediana de " + F.inteiro(item.c.mediana_n_folha) + " contratos por folha")
              : null,
            h("span", { class: "apoio" },
              item.c ? "validação " + F.dec(item.c.perda_validacao, 4) : ""),
          ]),
          anterior && anterior.c && item.c
            ? h("p", { class: "nota", estilo: "margin-top:8px" },
                "Em relação ao cenário anterior (" + anterior.rotulo + "): " +
                F.sinal(item.c.folhas - anterior.c.folhas, 0) + " folhas e " +
                F.sinal(item.c.perda_validacao - anterior.c.perda_validacao, 4) +
                " na perda de validação.")
            : null,
        ]),
        h("div", { class: "painel claro cresce" }, [gb.svg]),
        h("div", { class: "grupo" }, [
          h("button", { class: "btn min", type: "button", onclick: function () {
            est.como = !est.como; App.montar("28");
          } }, est.como ? "Esconder a regra" : "Como foi escolhido?"),
          h("button", { class: "btn min fantasma", type: "button", onclick: ctx.reiniciar },
            "Reiniciar exemplo"),
        ]),
        est.como
          ? h("div", { class: "resposta" },
              "A configuração final é a de menor log loss na validação fora do tempo, " +
              "entre todas as combinações de profundidade e mínimo por folha treinadas: " +
              "profundidade " + (escolhido.profundidade < 0 ? "sem limite" : escolhido.profundidade) +
              " e mínimo de " + F.inteiro(escolhido.min_folha) + " contratos por folha. " +
              "O teste final não participa.")
          : null,
      ]),
    ]));
  },
});
