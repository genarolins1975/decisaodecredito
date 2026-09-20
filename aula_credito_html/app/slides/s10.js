Aula.slide({
  id: "10",
  bloco: "logit",
  titulo: "10% de PD significa odds de 1 para 9",
  subtitulo: "Probabilidade, odds e log odds descrevem o mesmo risco em escalas diferentes",
  conclusao: "Odds comparam eventos e não eventos. Probabilidade compara eventos e total.",
  fonte: Aula.dados.fontes.manual,
  resumo: "Grade de cem pontos com a quantidade esperada de eventos, frações de conversão e o logaritmo das odds.",
  notas: {
    conducao: [
      "Pergunte 10 dividido por quê antes de revelar as odds.",
      "Mostre que trocar o denominador muda o conceito: 10 em 100 contra 10 para 90.",
      "Vá a 50% e depois a 20%. Termine lembrando que o escore z do logit é o log odds.",
    ],
    respostas: [
      "p = 50%: odds 1 e log odds 0.",
      "p = 20%: odds 0,25 e log odds aproximadamente −1,386.",
      "p = 10%: odds 1/9 aproximadamente 0,1111 e log odds aproximadamente −2,197.",
    ],
    cuidados: [
      "Odds não são outra porcentagem de risco. Podem passar de 1 e não se limitam a 100%.",
      "Uma razão escrita 1 para 9 é diferente do número decimal 0,1111 apenas na forma de escrever.",
      "Em p igual a 0 ou 1 o log odds vai a infinito. Por isso a entrada principal vai de 1% a 99%.",
    ],
    transicao: "Agora conseguimos interpretar o que acontece quando um coeficiente aumenta o log odds.",
  },

  montar: function (corpo, ctx) {
    var est = ctx.estado;
    if (est.p === undefined) est.p = 0.10;
    if (!est.destaque) est.destaque = null;

    var p = est.p;
    var eventos = Math.round(p * 100);
    var odds = M.odds(p);
    var logodds = Math.log(odds);

    var grade = Comum.grade100(eventos, { lado: 26, gap: 6, w: 320, h: 320 });

    function fracao(titulo, numerador, denominador, resultado, chave, explicacao) {
      var sel = est.destaque === chave;
      return h("button", {
        class: "painel" + (sel ? " cor" : " claro"),
        type: "button",
        estilo: "text-align:left;cursor:pointer;border-width:" + (sel ? "2px" : "1px") +
                ";font:inherit;color:inherit;width:100%",
        onclick: function () { est.destaque = sel ? null : chave; App.montar("10"); },
      }, [
        h("h3", { class: "secao", estilo: "margin:0 0 6px" }, titulo),
        h("p", { estilo: "font-size:30px;font-family:var(--serif);color:var(--ink);margin:0" },
          numerador + " / " + denominador + " = " + resultado),
        h("p", { class: "nota", estilo: "margin-top:6px" },
          sel ? explicacao : "denominador: " + denominador),
      ]);
    }

    var referencia = UI.botoes({
      rotulo: "PD de referência", compacto: true,
      opcoes: [{ valor: 0.10, rotulo: "10%" }, { valor: 0.20, rotulo: "20%" },
               { valor: 0.50, rotulo: "50%" }],
      valor: [0.10, 0.20, 0.50].indexOf(p) >= 0 ? p : null,
      aoMudar: function (v) { est.p = v; App.montar("10"); },
    });

    corpo.appendChild(h("div", { class: "linha cresce" }, [
      h("div", { class: "painel claro coluna centro", estilo: "flex:0 0 400px;display:flex" }, [
        h("h3", { class: "secao" }, "Frequência esperada em 100 exposições"),
        grade,
        h("p", { class: "nota", estilo: "text-align:center" },
          F.inteiro(eventos) + " eventos e " + F.inteiro(100 - eventos) + " não eventos. " +
          "Representação ilustrativa, não 100 contratos com resultado garantido."),
      ]),
      h("div", { class: "coluna cresce" }, [
        fracao("Probabilidade", F.inteiro(eventos), "100", F.pct(p, p * 100 % 1 === 0 ? 0 : 2),
          "p", "Compara eventos com o total de exposições."),
        fracao("Odds", F.inteiro(eventos), F.inteiro(100 - eventos), F.dec(odds, 4),
          "odds", "Compara eventos com não eventos. Pode ultrapassar 1 e não tem teto de 100%."),
        h("div", { class: "painel" + (est.destaque === "log" ? " cor" : " claro") }, [
          h("h3", { class: "secao", estilo: "margin:0 0 6px" }, "Log odds"),
          h("p", { estilo: "font-size:30px;font-family:var(--serif);color:var(--ink);margin:0" },
            "ln(" + F.dec(odds, 4) + ") = " + F.dec(logodds, 3)),
          h("p", { class: "nota", estilo: "margin-top:6px" },
            "É exatamente a escala em que o logit soma as contribuições: o escore z."),
        ]),
        h("div", { class: "painel" }, [
          UI.slider({
            rotulo: "Probabilidade de inadimplência", min: 1, max: 99, passo: 1,
            valor: Math.round(p * 100),
            formato: function (v) { return "odds " + F.dec(M.odds(v / 100), 4); },
            aoMudar: function (v) { est.p = v / 100; App.montar("10"); },
          }),
          h("div", { class: "grupo", estilo: "margin-top:10px;align-items:center" }, [
            h("span", { class: "apoio" }, "Referências"), referencia,
            h("button", { class: "btn fantasma", type: "button", onclick: ctx.reiniciar },
              "Reiniciar exemplo"),
          ]),
        ]),
      ]),
      h("div", { class: "coluna", estilo: "flex:0 0 330px" }, [
        h("div", { class: "painel cor cresce" }, [
          h("h3", { class: "secao" }, "Conversões nos dois sentidos"),
          h("p", { class: "formula peq" }, "odds = p / (1 − p)"),
          h("p", { class: "formula peq" }, "p = odds / (1 + odds)"),
          h("p", { class: "formula peq" }, "z = ln( p / (1 − p) )"),
          h("p", { class: "formula peq" }, "p = 1 / (1 + e^−z)"),
          h("p", { class: "nota", estilo: "margin-top:10px" },
            "Conferência de ida e volta: partindo de " + F.pct(p, 2) +
            ", a volta por odds devolve " + F.pct(M.pDeOdds(odds), 2) +
            " e a volta por log odds devolve " + F.pct(M.sigmoid(logodds), 2) + "."),
          h("p", { class: "nota" },
            "Nos limites 0% e 100% o log odds vai a infinito. Por isso a escala vai de 1% a 99%."),
        ]),
      ]),
    ]));
  },
});
