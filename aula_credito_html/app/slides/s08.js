Aula.slide({
  id: "08",
  bloco: "logit",
  titulo: "−2,025 não é uma probabilidade",
  subtitulo: "Uma previsão sem restrição pode sair do intervalo entre 0% e 100%",
  conclusao: "A PD precisa permanecer entre 0% e 100%, qualquer que seja o escore.",
  fonte: Aula.dados.fontes.manual,
  resumo: "Reta numérica dos escores dos quatro clientes, régua de probabilidade sem correspondência e uma reta de probabilidade que sai dos limites.",
  notas: {
    conducao: [
      "Peça que o aluno calcule a reta simplificada em comprometimento de 20%.",
      "Revele o resultado negativo, leve o controle até 70% e mostre o excesso acima de 100%.",
      "Volte a Bruno e lembre que o escore dele não foi definido como probabilidade.",
    ],
    cuidados: [
      "A reta usada aqui existe para mostrar o problema. Não é modelo estimado.",
      "Não conclua que todo modelo linear de probabilidade é inútil. A mensagem é a dificuldade de garantir limites.",
      "Truncar em 0 e 1 altera a função de forma improvisada e não substitui um modelo probabilístico.",
    ],
    transicao: "A função logística faz exatamente essa conversão, preservando a ordem dos escores.",
  },
  impressao: function (e) { e.comp = 70; e.revelou = true; },

  montar: function (corpo, ctx) {
    var D = Aula.dados, L = D.logit;
    var est = ctx.estado;
    if (est.comp === undefined) est.comp = 30;

    var pLinear = function (comp) { return 0.10 + 0.03 * (comp - 30); };
    var valor = pLinear(est.comp);
    var foraLimites = valor < 0 || valor > 1;

    /* Reta de escores com os quatro clientes. */
    var ge = Graf.novo({ w: 660, h: 216, m: { e: 40, d: 40, c: 80, b: 54 } });
    ge.x(-8, 4).y(0, 1);
    ge.eixoX({ ticks: [-8, -6, -4, -2, 0, 2, 4], em: 0.5, rotulo: "escore z" });
    /* Rótulos em dois níveis, alternados na ordem dos escores: Ana e Carla, vizinhas na reta,
       ficavam no mesmo nível e se sobrepunham. */
    D.clientes.map(function (c) { return { c: c, z: L.z(c) }; })
      .sort(function (a, b) { return a.z - b.z; })
      .forEach(function (o, i) {
        var alto = i % 2 === 1;
        ge.ponto(o.z, 0.5, { r: 9, cor: "var(--logit)" });
        ge.texto(o.z, 0.5, o.c.nome, { dy: alto ? -66 : -30, ancora: "middle", tamanho: 19,
                                       cor: "var(--ink)" });
        ge.texto(o.z, 0.5, F.dec(o.z, 3), { dy: alto ? -48 : -12, ancora: "middle", tamanho: 16,
                                            peso: 400, cor: "var(--muted)" });
      });

    /* Régua de probabilidade, ainda sem correspondência estabelecida. */
    var gp = Graf.novo({ w: 660, h: 140, m: { e: 40, d: 40, c: 24, b: 54 } });
    gp.x(0, 1).y(0, 1);
    gp.retangulo(0, 0.3, 1, 0.7, { cor: "var(--dots)", opacidade: .5 });
    gp.eixoX({ ticks: [0, 0.25, 0.5, 0.75, 1], em: 0.3,
               formato: function (v) { return F.pct(v, 0); }, rotulo: "probabilidade de inadimplência" });
    gp.texto(0.5, 0.82, "qual escore corresponde a qual probabilidade?",
      { ancora: "middle", tamanho: 18, peso: 400, cor: "var(--muted)" });

    /* Reta de probabilidade com faixas inválidas. */
    var gr = Graf.novo({ w: 624, h: 268, m: { e: 78, d: 26, c: 16, b: 52 } });
    gr.x(10, 80).y(-0.4, 1.5);
    var hachAlta = gr.hachura("fora-alta", "var(--alert)");
    gr.retangulo(10, 1, 80, 1.5, { cor: hachAlta });
    gr.retangulo(10, -0.4, 80, 0, { cor: hachAlta });
    gr.grade({ y: [0, 0.5, 1] });
    gr.eixoY({ ticks: [-0.4, 0, 0.5, 1, 1.5], formato: function (v) { return F.pct(v, 0); },
               rotulo: "previsão da reta" });
    gr.eixoX({ ticks: [10, 20, 30, 40, 50, 60, 70, 80], rotulo: "comprometimento em %" });
    gr.linha(M.linspace(10, 80, 71).map(function (v) { return [v, pLinear(v)]; }),
      { cor: "var(--logit)", largura: 3 });
    gr.texto(10.6, 1.28, "acima de 100%: fora dos limites",
      { tamanho: 17, peso: 400, cor: "var(--alert)" });
    gr.texto(10.6, -0.28, "abaixo de 0%: fora dos limites",
      { tamanho: 17, peso: 400, cor: "var(--alert)" });
    gr.guia(est.comp, valor, { cor: foraLimites ? "var(--alert)" : "var(--muted)" });
    gr.ponto(est.comp, valor, { cor: foraLimites ? "var(--alert)" : "var(--logit)" });

    var transformacao = h("div", { class: "painel cor cresce" }, [
      h("h3", { class: "secao" }, "Precisamos de uma transformação"),
      h("p", { class: "apoio" },
        "Em vez de restringir a reta, modelamos uma escala livre e a convertemos por uma função " +
        "que nunca sai do intervalo. É a curva logística do próximo slide."),
      Comum.miniSigmoide(null, { w: 300, h: 160 }),
    ]);

    corpo.appendChild(h("div", { class: "linha cresce" }, [
      h("div", { class: "coluna cresce" }, [
        h("div", { class: "painel claro" }, [
          h("h3", { class: "secao" }, "Os escores dos quatro clientes"),
          ge.svg,
        ]),
        est.revelou ? transformacao : h("div", { class: "painel claro cresce" }, [
          h("h3", { class: "secao" }, "A régua de probabilidade, ainda sem ligação"),
          gp.svg,
        ]),
      ]),
      h("div", { class: "coluna", estilo: "flex:0 0 660px" }, [
        h("div", { class: "painel claro" }, [
          h("div", { estilo: "display:flex;flex-wrap:wrap;justify-content:space-between;align-items:baseline;gap:10px" }, [
            h("h3", { class: "secao", estilo: "margin:0" },
              "Uma reta direto na probabilidade"),
            UI.selo("exemplo do problema", "sim"),
          ]),
          h("p", { class: "formula peq" },
            Mat.b("p_{\\text{reta}} = 0{,}10 + 0{,}03\\,(\\mathit{comp} - 30)")),
          gr.svg,
        ]),
        h("div", { class: "painel" }, [
          UI.slider({
            rotulo: "Comprometimento", min: 10, max: 80, passo: 1, valor: est.comp,
            formato: function (v) { return v + "%"; },
            aoMudar: function (v) { est.comp = v; App.montar("08"); },
          }),
          h("p", { estilo: "font-size:24px;margin-top:8px;color:" +
              (foraLimites ? "var(--alert)" : "var(--ink)") },
            "previsão da reta: " + F.pct(valor, 0) +
            (foraLimites ? " · fora dos limites de probabilidade" : "")),
          h("div", { class: "grupo", estilo: "margin-top:8px" }, [
            h("button", { class: "btn", type: "button", disabled: est.revelou,
              onclick: function () { est.revelou = true; App.montar("08"); } },
              "Precisamos de uma transformação"),
            h("button", { class: "btn fantasma", type: "button", onclick: ctx.reiniciar },
              "Reiniciar exemplo"),
          ]),
        ]),
      ]),
    ]));
  },
});
