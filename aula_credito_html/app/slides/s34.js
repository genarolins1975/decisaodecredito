Aula.slide({
  id: "34",
  bloco: "boosting",
  titulo: "A primeira correção reduz A e aumenta B",
  subtitulo: "Resíduos, média por folha e atualização do escore",
  conclusao: "A árvore aprende um padrão nos gradientes e aplica a mesma correção a quem cai na mesma folha.",
  fonte: Aula.dados.fontes.boosting,
  resumo: "Dez registros com a coluna de resíduo, um stump que divide o comprometimento em 40 e as folhas com a média dos resíduos.",
  notas: {
    conducao: [
      "Peça o resíduo de um evento e o de um não evento.",
      "Calcule a média do grupo B em voz alta.",
      "Pergunte por que três adimplentes do grupo B receberam aumento. Resposta: o modelo captura o risco do grupo, não reproduz cada rótulo.",
    ],
    respostas: [
      "Em A, cinco resíduos de −0,2 e média −0,2.",
      "Em B, três resíduos de −0,2 e dois de +0,8, média +0,2.",
      "Com taxa de aprendizagem 1: F do grupo A vai a −1,586294 e PD a 16,9906%. F do grupo B vai a −1,186294 e PD a 23,3922%.",
    ],
    cuidados: [
      "y menos p é o gradiente negativo da perda logística em relação ao escore nesta parametrização.",
      "Isso não significa que toda biblioteca use exatamente a média como valor final da folha.",
      "As contribuições estão em unidades de escore, não em pontos percentuais de PD.",
      "Primeira ordem didática: a folha recebe a média do gradiente negativo, sem passo de Newton.",
    ],
    transicao: "Depois da atualização, os resíduos mudaram. Por isso a segunda árvore precisa olhar novamente para as previsões.",
  },
  impressao: function (e) { e.passo = 4; },

  montar: function (corpo, ctx) {
    var B = Aula.dados.boosting;
    var est = ctx.estado;
    if (est.passo === undefined) est.passo = 0;
    if (est.destaque === undefined) est.destaque = null;

    var hist = B.rodar(1, 1);
    var it = hist[1];
    var p0 = hist[0].grupos.A.p, F0 = hist[0].grupos.A.F;

    var linhas = it.linhas.map(function (l) {
      return ["nº " + l.id, l.grupo, String(l.y), F.pct(l.p, 2),
              est.passo >= 1 ? F.dec(l.r, 4) : "",
              est.passo >= 2 ? F.dec(l.h, 6) : "",
              est.passo >= 3 ? F.dec(l.F, 6) : "",
              est.passo >= 4 ? F.pct(l.pNovo, 4) : ""];
    });
    var tabela = UI.tabela({
      compacta: true,
      colunas: [{ rotulo: "Registro" }, { rotulo: "Grupo" }, { rotulo: Mat.i("y") },
                { rotulo: Mat.i("p_{\\text{atual}}") }, { rotulo: Mat.i("r = y - p") },
                { rotulo: Mat.i("h(\\text{folha})") }, { rotulo: Mat.i("F_{\\text{novo}}") },
                { rotulo: Mat.i("p_{\\text{novo}}") }],
      linhas: linhas,
      legenda: "Resíduos e atualização dos dez registros",
    });
    if (est.destaque) {
      [].forEach.call(tabela.querySelectorAll("tbody tr"), function (tr, i) {
        if (it.linhas[i].id === est.destaque) tr.className = "sel";
      });
    }

    var stump = Graf.arvore({
      w: 520, h: 240, caixaW: 214, caixaH: 70,
      no: {
        rotulo: "comprometimento ≤ 40%",
        detalhe: "10 registros",
        detalhe2: est.passo >= 1 ? "média dos r = " + F.dec(M.media(it.linhas.map(function (l) {
          return l.r; })), 4) : null,
        destaque: est.passo >= 2,
        filhos: [
          { aresta: "sim (grupo A)", destaque: est.passo >= 2, no: {
            rotulo: "folha A", detalhe: "5 registros",
            detalhe2: est.passo >= 2 ? "h = " + F.dec(it.grupos.A.h, 6) : "h = ?",
            destaque: est.passo >= 2 } },
          { aresta: "não (grupo B)", destaque: est.passo >= 2, no: {
            rotulo: "folha B", detalhe: "5 registros",
            detalhe2: est.passo >= 2 ? "h = " + F.dec(it.grupos.B.h, 6) : "h = ?",
            destaque: est.passo >= 2 } },
        ],
      },
      resumo: "Stump que divide os registros em comprometimento 40.",
    });

    var etapas = ["Calcular resíduos", "Agrupar e tirar médias", "Atualizar escore",
                  "Converter para PD"];

    var resumoGrupos = UI.tabela({
      compacta: true,
      colunas: [{ rotulo: "Por grupo" }, { rotulo: "A" }, { rotulo: "B" }],
      linhas: [
        ["escore inicial", F.dec(F0, 6), F.dec(F0, 6)],
        ["contribuição da árvore",
         est.passo >= 2 ? F.sinal(it.grupos.A.h, 6) : "ainda não",
         est.passo >= 2 ? F.sinal(it.grupos.B.h, 6) : "ainda não"],
        ["escore novo",
         est.passo >= 3 ? F.dec(it.grupos.A.F, 6) : "ainda não",
         est.passo >= 3 ? F.dec(it.grupos.B.F, 6) : "ainda não"],
        ["PD",
         est.passo >= 4 ? F.pct(it.grupos.A.p, 4) : F.pct(p0, 4),
         est.passo >= 4 ? F.pct(it.grupos.B.p, 4) : F.pct(p0, 4)],
      ],
      legenda: "Atualização por grupo",
    });

    corpo.appendChild(h("div", { class: "linha cresce" }, [
      h("div", { class: "painel claro cresce" }, [
        h("div", { estilo: "display:flex;flex-wrap:wrap;justify-content:space-between;align-items:baseline;gap:6px 14px" }, [
          h("h3", { class: "secao", estilo: "margin:0" }, "Os dez registros"),
          UI.selo("primeira ordem didática", "sim"),
        ]),
        tabela,
        h("div", { class: "grupo", estilo: "margin-top:10px" }, [
          h("span", { class: "nota" }, "destacar um registro:"),
          UI.botoes({
            compacto: true, rotulo: "registro do grupo B",
            opcoes: [{ valor: 6, rotulo: "nº 6 (y = 0)" }, { valor: 9, rotulo: "nº 9 (y = 1)" }],
            valor: est.destaque,
            aoMudar: function (v) { est.destaque = est.destaque === v ? null : v; App.montar("34"); },
          }),
        ]),
        est.destaque && est.passo >= 4
          ? h("p", { class: "resposta", estilo: "margin-top:8px" },
              est.destaque === 6
                ? "O registro nº 6 tem y = 0 e ainda assim teve a PD aumentada, porque " +
                  "compartilha a folha com os dois eventos do grupo. O modelo captura o risco do " +
                  "grupo e não reproduz o rótulo de cada pessoa."
                : "O registro nº 9 tem y = 1 e resíduo positivo grande. Mesmo assim a folha aplica " +
                  "a média do grupo, e não uma correção individual.")
          : null,
      ]),
      h("div", { class: "coluna", estilo: "flex:0 0 560px" }, [
        h("div", { class: "painel claro centro" }, [
          h("h3", { class: "secao" }, "A árvore ajustada aos resíduos"),
          stump,
        ]),
        h("div", { class: "painel" + (est.passo >= 3 ? " cor" : " claro") }, resumoGrupos),
        h("div", { class: "painel", estilo: "padding:10px 16px" }, [
          h("div", { class: "grupo" }, [
            h("button", { class: "btn", type: "button", disabled: est.passo >= 4,
              onclick: function () { est.passo = Math.min(4, est.passo + 1); App.montar("34"); } },
              est.passo >= 4 ? "Etapas completas" : etapas[est.passo]),
            h("button", { class: "btn fantasma", type: "button", onclick: ctx.reiniciar },
              "Reiniciar exemplo"),
            h("span", { class: "nota" }, "etapa " + est.passo + " de 4"),
          ]),
        ]),
      ]),
    ]));
  },
});
