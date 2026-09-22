Aula.slide({
  id: "04",
  bloco: "problema",
  titulo: "Esse dado existia quando o crédito foi aprovado?",
  subtitulo: "Classifique cada informação pela data em que ela ficou disponível",
  conclusao: "Uma variável excelente depois do evento pode ser inútil para decidir antes dele.",
  fonte: "Registros didáticos de disponibilidade; cálculo próprio",
  resumo: "Sete fichas de informação, cada uma com valor e data de disponibilidade, classificadas entre disponível na decisão e informação do futuro.",
  notas: {
    conducao: [
      "Classifique primeiro as três fáceis: renda verificada, histórico anterior e utilização conhecida.",
      "Use o atraso máximo dos 12 meses seguintes para estabelecer a regra.",
      "Termine com a consulta tardia de bureau: a informação pode descrever algo anterior, mas o acesso e a versão precisam existir na decisão.",
    ],
    respostas: [
      "Renda verificada, histórico anterior, utilização conhecida na data e comprometimento com a parcela proposta estão disponíveis na decisão.",
      "Valor renegociado três meses depois, atraso máximo dos 12 meses seguintes e consulta de bureau posterior à inadimplência são informação do futuro.",
      "O comprometimento com a parcela proposta é permitido porque a parcela é conhecida na simulação, e não depende de observar o desfecho.",
    ],
    cuidados: [
      "Data de referência e data de disponibilidade são coisas diferentes.",
      "Limpeza, imputação, seleção de variáveis e normalização também vazam informação se aprenderem com o teste.",
    ],
    transicao: "Além de separar passado e futuro dentro de cada proposta, precisamos separar as amostras usadas para aprender e avaliar.",
  },
  impressao: function (e) { e.conferido = true; },

  montar: function (corpo, ctx) {
    var est = ctx.estado;
    if (!est.escolhas) est.escolhas = {};

    var fichas = [
      { id: "renda", nome: "Renda verificada", valor: "R$ 4.500 por mês",
        quando: "documento verificado 3 dias antes da proposta",
        certo: "disponivel",
        porque: "A verificação acontece antes da decisão e não depende do desfecho." },
      { id: "hist", nome: "Histórico de atrasos", valor: "um atraso de 40 dias",
        quando: "apurado nos 12 meses anteriores à proposta",
        certo: "disponivel",
        porque: "Descreve o passado e já estava registrado quando a proposta foi analisada." },
      { id: "util", nome: "Utilização de limite", valor: "65%",
        quando: "último extrato fechado antes da proposta",
        certo: "disponivel",
        porque: "É o último dado disponível na data. Usar o extrato seguinte já seria informação do futuro." },
      { id: "comp", nome: "Comprometimento com a parcela proposta", valor: "38%",
        quando: "calculado na simulação da própria proposta",
        certo: "disponivel",
        porque: "A parcela proposta é conhecida na decisão. O cálculo combina renda verificada e parcelas contratadas, sem observar o desfecho." },
      { id: "reneg", nome: "Valor renegociado", valor: "R$ 3.200",
        quando: "registrado 3 meses depois da contratação",
        certo: "futuro",
        porque: "A renegociação acontece depois da decisão e costuma ser consequência do problema que se quer prever." },
      { id: "atraso", nome: "Atraso máximo nos 12 meses seguintes", valor: "95 dias",
        quando: "apurado no fim da janela de 12 meses",
        certo: "futuro",
        porque: "É o próprio alvo. Usar como entrada produz um modelo perfeito no papel e inútil na decisão." },
      { id: "bureau", nome: "Consulta de bureau", valor: "escore 480",
        quando: "consultada 2 dias depois da inadimplência",
        certo: "futuro",
        porque: "A informação pode descrever fatos anteriores, mas essa versão só existiu depois do evento. Vale a data de disponibilidade, não a data do fenômeno." },
    ];

    var destinos = [
      { valor: "disponivel", rotulo: "Disponível na decisão" },
      { valor: "futuro", rotulo: "Informação do futuro" },
    ];

    /* Espaçamento uniforme entre as sete fichas: space-between abria vãos de tamanhos
       diferentes e quebrava o ritmo da lista. */
    var linhas = h("div", { class: "coluna", estilo: "gap:10px" });
    fichas.forEach(function (f) {
      var escolha = est.escolhas[f.id] || null;
      var resultado = null;
      if (est.conferido && escolha) {
        var ok = escolha === f.certo;
        resultado = h("span", {
          class: "nota",
          estilo: "flex:1 1 250px;color:" + (ok ? "var(--ok)" : "var(--alert)"),
        }, (ok ? "correto. " : "reveja. ") + f.porque);
      } else if (est.conferido) {
        resultado = h("span", { class: "nota", estilo: "flex:1 1 250px" }, "sem classificação");
      }
      linhas.appendChild(h("div", {
        class: "painel claro",
        estilo: "padding:8px 14px;display:flex;gap:12px;align-items:center;flex-wrap:wrap",
      }, [
        h("div", { estilo: "flex:1 1 " + (est.conferido ? "380px" : "560px") + ";min-width:330px" }, [
          h("div", { estilo: "font-size:20px;font-weight:700;color:var(--ink)" },
            f.nome + ": " + f.valor),
          h("div", { class: "nota" }, "disponibilidade: " + f.quando),
        ]),
        UI.botoes({
          rotulo: "destino de " + f.nome, compacto: true, opcoes: destinos, valor: escolha,
          aoMudar: function (v) { est.escolhas[f.id] = v; est.conferido = false; App.montar("04"); },
        }),
        resultado,
      ]));
    });

    var total = fichas.filter(function (f) { return est.escolhas[f.id] === f.certo; }).length;
    var placar = est.conferido
      ? h("p", { class: "resposta" + (total === fichas.length ? "" : " neutra") },
          total + " de " + fichas.length + " fichas classificadas corretamente.")
      : h("p", { class: "nota" }, "Nada é corrigido antes de conferir.");

    corpo.appendChild(h("div", { class: "linha cresce" }, [
      linhas,
      h("div", { class: "coluna", estilo: "flex:0 0 350px" }, [
        h("div", { class: "painel cor" }, [
          h("h3", { class: "secao" }, "A fronteira da decisão"),
          h("p", { class: "apoio" },
            "Só entra no modelo o que já existia e já estava acessível no momento da proposta."),
        ]),
        h("div", { class: "painel" }, [
          h("div", { class: "grupo" }, [
            h("button", { class: "btn", type: "button", onclick: function () {
              est.conferido = true; App.montar("04");
            } }, "Conferir"),
            h("button", { class: "btn fantasma", type: "button", onclick: ctx.reiniciar },
              "Reiniciar exemplo"),
          ]),
          placar,
        ]),
        h("div", { class: "painel", hidden: !est.conferido }, [
          h("h3", { class: "secao" }, "A regra"),
          h("p", { class: "apoio" },
            "Vale a data de disponibilidade da informação, não a data do fenômeno que ela descreve."),
        ]),
      ]),
    ]));
  },
});
