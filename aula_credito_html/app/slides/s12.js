Aula.slide({
  id: "12",
  bloco: "logit",
  titulo: "Bruno: como chegamos à PD de 11,66%?",
  subtitulo: "Duas etapas auditáveis: somar o escore e aplicar a logística",
  conclusao: "O cálculo tem duas etapas auditáveis: somar o escore e aplicar a logística.",
  fonte: Aula.dados.fontes.manual,
  resumo: "Ficha editável do cliente, decomposição do escore e medidor de PD com curva logística.",
  notas: {
    conducao: [
      "Reconstrua a conta passo a passo antes de mexer nos controles.",
      "Peça uma alteração que reduza a PD e outra que a aumente.",
      "Questione se a alteração seria factível: reduzir comprometimento sem mudar parcela ou renda é uma simulação abstrata.",
    ],
    respostas: [
      "Ana 1,10%, Bruno 11,66%, Carla 2,82% e Diego 27,59%, com a fórmula manual.",
      "O recurso descreve a sensibilidade do modelo, não a garantia de uma ação causal disponível ao cliente.",
    ],
    cuidados: [
      "Canal aparece na ficha e não participa desta fórmula manual.",
      "Esta PD é do exemplo didático. Não é previsão de modelo treinado.",
    ],
    transicao: "Esses coeficientes foram escolhidos para tornar a conta transparente. Como um modelo aprende coeficientes a partir dos dados?",
  },

  montar: function (corpo, ctx) {
    var D = Aula.dados, L = D.logit;
    var est = ctx.estado;
    if (!est.base) est.base = "Bruno";
    if (!est.perfil) est.perfil = D.copia(D.cliente(est.base));

    var c = est.perfil;
    var original = D.cliente(est.base);
    var simulado = ["renda", "comp", "rel", "util", "hist"].some(function (k) {
      return c[k] !== original[k];
    });
    var contrib = L.contribuicoes(c);
    var z = L.z(c);
    var p = M.sigmoid(z);

    function controle(rotulo, campo, min, max, passo, formato) {
      return UI.slider({
        rotulo: rotulo, min: min, max: max, passo: passo, valor: c[campo],
        formato: formato,
        aoMudar: function (v) { c[campo] = v; App.montar("12"); },
      });
    }

    var ficha = h("div", { class: "painel", estilo: "display:flex;flex-direction:column;gap:10px" }, [
      h("div", { estilo: "display:flex;justify-content:space-between;align-items:baseline;gap:10px" }, [
        h("h3", { class: "secao", estilo: "margin:0" }, "Ficha do cliente"),
        simulado ? Comum.seloSimulacao() : UI.selo("perfil original", "neutro"),
      ]),
      Comum.seletorCliente(est.base, function (v) {
        est.base = v; est.perfil = D.copia(D.cliente(v)); App.montar("12");
      }, { compacto: true }),
      controle("Renda em R$ por mês", "renda", 1000, 20000, 100,
        function (v) { return F.reais(v); }),
      controle("Comprometimento em %", "comp", 5, 80, 1, function (v) { return v + "%"; }),
      controle("Relacionamento em meses", "rel", 0, 120, 1, function (v) { return v + " meses"; }),
      controle("Utilização em %", "util", 0, 100, 1, function (v) { return v + "%"; }),
      h("div", { class: "ctrl" }, [
        h("label", {}, "Histórico de atraso de 15 a 89 dias"),
        UI.botoes({
          compacto: true, rotulo: "histórico",
          opcoes: [{ valor: 0, rotulo: "não" }, { valor: 1, rotulo: "sim" }],
          valor: c.hist,
          aoMudar: function (v) { c.hist = v; App.montar("12"); },
        }),
      ]),
      h("p", { class: "nota" }, "Canal: " + c.canal +
        ". Informativo: não participa desta fórmula manual."),
      h("div", { class: "grupo" }, [
        h("button", { class: "btn min", type: "button", disabled: !simulado, onclick: function () {
          est.perfil = D.copia(D.cliente(est.base)); App.montar("12");
        } }, "Restaurar " + est.base),
        h("button", { class: "btn min fantasma", type: "button", onclick: ctx.reiniciar },
          "Reiniciar exemplo"),
      ]),
    ]);

    var linhas = contrib.map(function (t) {
      return [t.nome, t.conta.split(" = ")[0], F.sinal(t.contribuicao, 3)];
    });
    linhas.unshift(["Intercepto", "perfil de referência", F.dec(L.intercepto, 3)]);
    var tabela = UI.tabela({
      compacta: true,
      colunas: [{ rotulo: "Parcela" }, { rotulo: "Conta" }, { rotulo: "Valor" }],
      linhas: linhas,
      legenda: "Decomposição do escore do cliente",
    });
    var corpoTabela = tabela.querySelector("tbody");
    corpoTabela.appendChild(h("tr", { class: "sel" }, [
      h("th", { scope: "row", class: "rotulo" }, "Escore z"),
      h("td", {}, "soma das parcelas"),
      h("td", {}, F.dec(z, 3)),
    ]));

    var gm = Graf.novo({ w: 420, h: 300, m: { e: 76, d: 24, c: 20, b: 56 } });
    gm.x(-8, 4).y(0, 1);
    gm.grade({ y: [0, 0.25, 0.5, 0.75, 1] });
    gm.eixoY({ ticks: [0, 0.5, 1], formato: function (v) { return F.pct(v, 0); },
               rotulo: "PD" });
    gm.eixoX({ ticks: [-8, -4, 0, 4], rotulo: "escore z" });
    gm.linha(M.linspace(-8, 4, 200).map(function (v) { return [v, M.sigmoid(v)]; }),
      { cor: "var(--logit)", largura: 3 });
    gm.guia(z, p, { cor: "var(--logit)" });
    gm.ponto(z, p, { cor: "var(--logit)", r: 9 });

    corpo.appendChild(h("div", { class: "linha cresce" }, [
      h("div", { estilo: "flex:0 0 430px;display:flex" }, ficha),
      h("div", { class: "coluna cresce" }, [
        h("div", { class: "painel claro cresce" }, [
          h("h3", { class: "secao" }, "Etapa 1: somar o escore"),
          tabela,
        ]),
      ]),
      h("div", { class: "coluna", estilo: "flex:0 0 440px" }, [
        h("div", { class: "painel cor" }, [
          h("h3", { class: "secao" }, "Etapa 2: aplicar a logística"),
          h("p", { class: "formula peq", estilo: "background:none;border:none;padding:0" },
            "p = 1 / (1 + e^−z) = 1 / (1 + e^" + F.dec(-z, 3) + ")"),
          h("p", { class: "grande", estilo: "margin-top:10px" }, F.pct(p, 2)),
          h("p", { class: "nota" }, "valor sem arredondamento: " + p.toFixed(10).replace(".", ",")),
        ]),
        h("div", { class: "painel claro cresce centro", estilo: "display:flex" }, gm.svg),
      ]),
    ]));
  },
});
