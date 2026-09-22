Aula.slide({
  id: "30",
  bloco: "arvore",
  titulo: "Carla recebe qual PD nesta árvore?",
  subtitulo: "Exercício: percorrer, calcular e questionar",
  conclusao: "Uma regra legível ajuda a explicar o cálculo, mas não dispensa evidência de qualidade.",
  fonte: Aula.dados.fontes.arvore,
  resumo: "Árvore didática com a taxa da folha de Carla oculta, três tarefas de percurso e cálculo, e o painel de quando a árvore é uma boa escolha.",
  notas: {
    conducao: [
      "Reserve dois minutos em duplas.",
      "Não revele a resposta ao primeiro clique em um ramo errado: explique a regra e permita corrigir.",
      "Antes da pausa, leia o painel de quando a árvore é uma boa escolha, no mesmo formato do slide 19 para o logit. Peça um caso da carteira de cada aluno que caia na coluna da esquerda.",
      "Conclua com a importância de tamanho de folha, validação e estabilidade. Este é um bom ponto para a pausa da aula.",
    ],
    respostas: [
      "Carla tem histórico 0 e comprometimento 48%, acima de 40%. Chega à folha de 22 eventos em 200 contratos, ou seja 11%.",
      "Dobrar a renda isoladamente, com o comprometimento mantido fixo, não altera esta árvore, porque a renda não é usada nas perguntas.",
      "Numa mudança econômica real o comprometimento poderia variar. A simulação é sobre a função do modelo.",
      "Desafio final: Bruno de 38% para 41% passa de 15% para 40%. Isso não prova um salto real de risco exatamente nesse limite: é uma descontinuidade da aproximação aprendida.",
    ],
    cuidados: [
      "A taxa de uma folha é estimativa com incerteza, e folhas pequenas têm intervalo largo. Ler a taxa sem o tamanho da folha é o erro mais comum aqui.",
      "A regra da árvore é associação aprendida na amostra, não relação causal: mudar a variável no cliente não move a PD dele pelo caminho da árvore.",
      "Esta árvore vem da miniatura de 1.000 contratos, separada da base do experimento. Não compare o desempenho dela com o dos modelos treinados.",
    ],
    transicao: "Uma única árvore é clara, mas pode ser limitada ou instável. Podemos construir uma previsão melhor acrescentando várias árvores pequenas em sequência?",
  },
  impressao: function (e) { e.conferido = true; e.pdTexto = "11"; e.ramo = "certo"; e.renda = 0; },

  montar: function (corpo, ctx) {
    var D = Aula.dados, A = D.arvore;
    var est = ctx.estado;
    var carla = D.cliente("Carla");
    var folha = A.folhaDe(carla);
    if (est.pdTexto === undefined) est.pdTexto = "";
    if (est.ramo === undefined) est.ramo = null;
    if (est.renda === undefined) est.renda = null;

    var caminhos = [
      { valor: "certo", rotulo: "histórico = 0, depois comprometimento acima de 40%", correto: true },
      { valor: "esq", rotulo: "histórico = 0, depois comprometimento até 40%", correto: false },
      { valor: "dir", rotulo: "histórico = 1, depois comprometimento acima de 40%", correto: false },
    ];

    var arvore = Comum.arvoreDidatica({
      cliente: est.conferido ? carla : null,
      mostrarNumeros: true, mostrarPd: true,
      ocultarFolha: est.conferido ? null : folha,
      w: 812, h: 340, caixaW: 180, caixaH: 74,
      rotuloFolha: function () { return "folha"; },
    });

    function retorno(ok, texto) {
      return h("div", { class: "resposta" + (ok ? "" : " erro"), estilo: "margin-top:8px" }, texto);
    }

    var pdValor = Number(String(est.pdTexto).replace(",", "."));
    var pdOk = Math.abs(pdValor - 11) < 0.6;
    var pdFracao = Math.abs(pdValor - 0.11) < 0.006;

    var entrada = h("input", {
      type: "text", inputmode: "decimal", value: est.pdTexto,
      "aria-label": "PD da folha em porcentagem",
      estilo: "width:130px;font:700 22px var(--sans);padding:6px 8px;border:1px solid var(--rule);" +
              "border-radius:4px;background:var(--surface);color:var(--ink)",
      onchange: function (ev) { est.pdTexto = ev.target.value; },
    });

    corpo.appendChild(h("div", { class: "linha cresce" }, [
      h("div", { class: "coluna cresce" }, [
        h("div", { class: "painel claro cresce centro" }, arvore),
        /* O desafio fica sob a árvore: na coluna das perguntas, junto com as três respostas
           conferidas, ele passava da altura do palco. */
        est.desafio
          ? h("div", { class: "painel cor" }, [
              h("h3", { class: "secao" }, "Desafio final"),
              h("p", { class: "apoio" },
                "Bruno passa de comprometimento 38% para 41%, com os demais valores fixos. " +
                "A PD muda de " + F.pct(A.folhaDe({ hist: 1, comp: 38 }).pd, 0) + " para " +
                F.pct(A.folhaDe({ hist: 1, comp: 41 }).pd, 0) +
                ". Isso prova um salto real de risco exatamente nesse limite?"),
              est.conferido
                ? h("p", { class: "resposta" },
                    "Não. É uma descontinuidade da aproximação aprendida. O limite foi escolhido " +
                    "por um critério de impureza em uma amostra, e não por um fenômeno econômico " +
                    "que mude bruscamente em 40%.")
                : h("p", { class: "nota" }, "A resposta aparece ao conferir."),
            ])
          : null,
        Comum.fichaLinha(carla, { cor: true }),
        h("div", { class: "painel claro", estilo: "padding:10px 16px" }, [
          h("h3", { class: "secao", estilo: "margin-bottom:5px" }, "Quando a árvore é uma boa escolha"),
          h("div", { class: "g2" }, [
            h("ul", { class: "apoio", estilo: "margin:0;padding-left:20px" }, [
              h("li", {}, "o efeito de uma variável depende do valor de outra, e a interação não " +
                "precisa ser escrita à mão"),
              h("li", {}, "a relação não é monótona, e transformar a variável seria um chute"),
              h("li", {}, "a regra precisa virar política operacional, legível linha a linha"),
            ]),
            h("ul", { class: "apoio", estilo: "margin:0;padding-left:20px" }, [
              h("li", {}, "não escolha pela leitura do diagrama: uma observação pode trocar a " +
                "variável de um nó"),
              h("li", {}, "não leia a taxa da folha sem o tamanho da folha"),
              h("li", {}, "não compare com outra família pela perda de treino"),
            ]),
          ]),
          h("p", { class: "nota", estilo: "margin-top:6px" },
            "À esquerda, o que a árvore entrega e a soma não entrega. À direita, o preço, e é o " +
            "mesmo preço em qualquer família: só evidência fora da amostra decide."),
        ]),
      ]),
      /* 700 de largura: cada opção do caminho cabe numa linha, e as três partes conferidas
         cabem na altura do palco. */
      h("div", { class: "coluna", estilo: "flex:0 0 700px" }, [
        h("div", { class: "painel", estilo: "padding:10px 16px" }, [
          h("h3", { class: "secao", estilo: "margin-bottom:5px" }, "1. Indique o caminho"),
          UI.botoes({
            vertical: true, compacto: true, rotulo: "caminho",
            opcoes: caminhos.map(function (c) { return { valor: c.valor, rotulo: c.rotulo }; }),
            valor: est.ramo,
            aoMudar: function (v) { est.ramo = v; est.conferido = false; App.montar("30"); },
          }),
          est.conferido && est.ramo
            ? retorno(est.ramo === "certo",
                est.ramo === "certo"
                  ? "Caminho correto: Carla tem histórico 0 e comprometimento 48%, acima de 40%."
                  : est.ramo === "esq"
                    ? "Erro de percurso no segundo nó: 48% é maior que 40%, portanto o ramo é o de comprometimento acima de 40%."
                    : "Erro de percurso na raiz: Carla não tem histórico de atraso, portanto segue por histórico 0.")
            : null,
        ]),
        h("div", { class: "painel", estilo: "padding:10px 16px" }, [
          h("h3", { class: "secao", estilo: "margin-bottom:5px" }, "2. Calcule a PD da folha"),
          h("div", { class: "grupo", estilo: "align-items:center" }, [
            entrada,
            h("span", { class: "apoio" }, "em porcentagem"),
          ]),
          est.conferido
            ? retorno(pdOk,
                pdOk ? "Correto: " + F.inteiro(folha.d) + " dividido por " + F.inteiro(folha.n) +
                       " resulta em " + F.pct(folha.pd, 0) + "."
                     : pdFracao
                       ? "O valor está certo, mas na unidade errada: 0,11 é a fração. Em porcentagem, escreva 11."
                       : "Reveja a conta: a folha tem " + F.inteiro(folha.d) + " eventos em " +
                         F.inteiro(folha.n) + " contratos, ou seja " + F.pct(folha.pd, 0) + ".")
            : null,
        ]),
        h("div", { class: "painel", estilo: "padding:10px 16px" }, [
          h("h3", { class: "secao", estilo: "margin-bottom:5px" },
            "3. Se a renda de Carla dobrasse, mantendo fixas as entradas usadas na árvore"),
          UI.botoes({
            compacto: true, rotulo: "efeito da renda",
            opcoes: [
              { valor: "permanece", rotulo: "A PD permanece a mesma" },
              { valor: "metade", rotulo: "A PD cai pela metade" },
              { valor: "impossivel", rotulo: "Não é possível avaliar a função" },
            ],
            valor: est.renda,
            aoMudar: function (v) { est.renda = v; est.conferido = false; App.montar("30"); },
          }),
          est.conferido && est.renda
            ? retorno(est.renda === "permanece",
                est.renda === "permanece"
                  ? "Correto: a renda não aparece em nenhuma pergunta desta árvore, e as demais entradas foram mantidas fixas."
                  : "A renda não participa das perguntas desta árvore. Com as demais entradas fixas, a previsão não muda. Em uma mudança econômica real, o comprometimento poderia variar.")
            : null,
        ]),
        h("div", { class: "grupo" }, [
          h("button", { class: "btn", type: "button", onclick: function () {
            est.conferido = true; App.montar("30");
          } }, "Conferir"),
          h("button", { class: "btn", type: "button", onclick: function () {
            est.desafio = !est.desafio; App.montar("30");
          } }, est.desafio ? "Esconder o desafio" : "Desafio final"),
          h("button", { class: "btn fantasma", type: "button", onclick: ctx.reiniciar },
            "Reiniciar exercício"),
        ]),

      ]),
    ]));
  },
});
