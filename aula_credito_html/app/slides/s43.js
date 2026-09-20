Aula.slide({
  id: "43",
  bloco: "decisao",
  titulo: "Estamos comparando modelos ou comparando condições diferentes?",
  subtitulo: "O protocolo precede qualquer métrica",
  conclusao: "Mesmo alvo, mesma informação e teste preservado são condições da comparação.",
  fonte: Aula.dados.fontes.experimento,
  resumo: "Tabela do protocolo com o que é comum aos três modelos e o que é próprio de cada um, mais a tira dos quatro períodos.",
  notas: {
    conducao: [
      "Recupere o slide 05 em miniatura na tira inferior.",
      "Pergunte por que usar todos os registros em todos os modelos ainda não garante justiça.",
      "Revele processamento e seleção, e só depois habilite a abertura dos resultados.",
    ],
    respostas: [
      "Boosting com variável futura: a comparação mede vazamento, não algoritmo. Correção: remover a variável e refazer o treinamento.",
      "Logit sem tratamento enquanto outros receberam engenharia: baseline artificialmente fraco. Correção: dar ao logit transformações e interações plausíveis, como a sensibilidade deste experimento.",
      "Configuração escolhida pela métrica do teste: o teste deixa de ser independente. Correção: escolher na validação e usar o teste uma única vez.",
    ],
    cuidados: [
      "Modelos especificados antes do teste podem ser comparados nele. Ajustes motivados por esse teste exigem nova avaliação independente.",
      "A exploração em aula não deve produzir um campeão otimizado depois de ver o resultado.",
      "Calibradores e cortes pertencem às partições definidas para isso.",
    ],
    transicao: "A primeira pergunta é se o modelo ordena corretamente os clientes de maior e menor risco.",
  },
  impressao: function (e) { e.protocolo = true; },

  montar: function (corpo, ctx) {
    var R = Aula.resultados;
    var est = ctx.estado;
    if (!R) {
      corpo.appendChild(h("p", { class: "resposta erro" },
        "Resultados do experimento não disponíveis: execute experimento/experimento.py e recompile."));
      return;
    }
    if (est.erro === undefined) est.erro = null;

    var P = R.protocolo;
    var linhas = [
      ["Amostra e alvo", "comum", "comum", "comum",
       "mesmas coortes, mesmo evento e mesmo horizonte de 12 meses"],
      ["Informação disponível", "comum", "comum", "comum",
       "as seis características, com a mesma regra de disponibilidade"],
      ["Pré processamento", "padronização, mais a imputação comum",
       "imputação pela mediana do treino e indicadores de ausência",
       "imputação pela mediana do treino e indicadores de ausência",
       "tratamento próprio é permitido, sem vantagem de informação"],
      ["Escolha de complexidade", "grade de penalização L2",
       "profundidade, mínimo por folha e poda",
       "taxa, profundidade e número de árvores",
       "sempre pela perda na validação fora do tempo"],
      ["Avaliação final", "teste congelado", "teste congelado", "teste congelado",
       "uma única passagem, com regras definidas antes"],
    ];

    var tabela = UI.tabela({
      compacta: true,
      colunas: [{ rotulo: "Condição" }, { rotulo: "Logit regularizado" },
                { rotulo: "Árvore controlada" }, { rotulo: "Gradient boosting" }],
      /* A observação acompanha a condição na primeira coluna. Em coluna própria
         ela ficaria estreita demais e estouraria a altura do painel. */
      linhas: linhas.map(function (l) {
        return [[l[0], h("span", { class: "nota", estilo: "display:block;font-weight:400" },
                         l[4])], l[1], l[2], l[3]];
      }),
      legenda: "Condições do protocolo de comparação",
    });
    /* Células iguais entre modelos viram uma só: a condição comum fica visível
       e o texto ganha a largura que gastaria repetido. */
    [].forEach.call(tabela.querySelectorAll("tbody tr"), function (tr, i) {
      var l = linhas[i];
      if (l[1] === l[2] && l[2] === l[3]) {
        var td = tr.children[1];
        td.setAttribute("colspan", "3");
        tr.removeChild(tr.children[3]);
        tr.removeChild(tr.children[2]);
        td.setAttribute("style", "text-align:center;background:var(--cor-soft);font-weight:700");
      } else if (l[2] === l[3]) {
        var td2 = tr.children[2];
        td2.setAttribute("colspan", "2");
        tr.removeChild(tr.children[3]);
        td2.setAttribute("style", "text-align:center");
      }
    });

    var erros = [
      { chave: "vazamento", rotulo: "Boosting com variável do futuro",
        texto: "Um dos modelos recebeu o atraso máximo dos 12 meses seguintes como entrada.",
        certo: "informacao",
        correcao: "Remover a variável e treinar de novo. A diferença medida era vazamento, não " +
          "capacidade do algoritmo." },
      { chave: "baseline", rotulo: "Logit sem tratamento",
        texto: "O logit ficou sem transformações e sem interações, enquanto os demais receberam " +
          "engenharia de atributos.",
        certo: "preprocessamento",
        correcao: "Dar ao logit a mesma oportunidade de especificação. Neste experimento isso " +
          "aparece como a sensibilidade do logit flexível." },
      { chave: "teste", rotulo: "Configuração escolhida pelo teste",
        texto: "A profundidade da árvore foi escolhida olhando a métrica do teste final.",
        certo: "avaliacao",
        correcao: "Escolher hiperparâmetros na validação e usar o teste uma única vez, " +
          "com as regras já congeladas." },
    ];
    var erroAtual = erros.filter(function (e) { return e.chave === est.erro; })[0];

    /* Tira dos quatro períodos, em miniatura. */
    var g = Graf.novo({ w: 972, h: 78, m: { e: 40, d: 40, c: 24, b: 28 } });
    function anoFrac(iso) {
      var p = iso.split("-");
      return Number(p[0]) + (Number(p[1]) - 1) / 12;
    }
    g.x(2018, 2026).y(0, 1);
    g.eixoX({ ticks: [2018, 2020, 2022, 2024, 2026],
              formato: function (v) { return String(Math.round(v)); } });
    var cores = { treino: "var(--ink)", validacao: "var(--logit)",
                  calibracao: "var(--amber)", teste: "var(--arvore)" };
    var nomes = { treino: "treino", validacao: "validação", calibracao: "calibração e política",
                  teste: "teste" };
    /* Só o nome sobre a barra: com o tamanho junto, os rótulos das partições
       vizinhas se sobrepõem nesta escala. Os n vão na linha abaixo. */
    P.particoes.forEach(function (p) {
      g.retangulo(anoFrac(p.inicio), 0.3, anoFrac(p.fim), 0.72,
        { cor: cores[p.nome] });
      g.retangulo(anoFrac(p.fim), 0.38, anoFrac(p.alvo_conhecido), 0.64,
        { cor: cores[p.nome], opacidade: .25 });
      g.texto((anoFrac(p.inicio) + anoFrac(p.alvo_conhecido)) / 2, 0.84, nomes[p.nome],
        { ancora: "middle", tamanho: 16, peso: 400, cor: "var(--muted)" });
    });

    corpo.appendChild(h("div", { class: "linha cresce" }, [
      h("div", { class: "coluna cresce" }, [
        h("div", { class: "painel claro cresce", estilo: "padding:10px 14px" }, tabela),
        h("div", { class: "painel claro", estilo: "padding:10px 16px" }, [
          h("h3", { class: "secao", estilo: "margin-bottom:2px" },
            "Os quatro períodos, com a maturação de 12 meses"),
          g.svg,
          h("p", { class: "nota", estilo: "margin:0" },
            P.particoes.map(function (p) {
              return nomes[p.nome] + " " + F.inteiro(p.n);
            }).join(" · ") + " contratos"),
        ]),
      ]),
      h("div", { class: "coluna", estilo: "flex:0 0 460px" }, [
        h("div", { class: "painel" }, [
          h("h3", { class: "secao" }, "Detectar comparação injusta"),
          UI.botoes({
            vertical: true, rotulo: "erro de comparação",
            opcoes: erros.map(function (e) { return { valor: e.chave, rotulo: e.rotulo }; }),
            valor: est.erro,
            aoMudar: function (v) { est.erro = v; est.revelado = false; App.montar("43"); },
          }),
        ]),
        erroAtual
          ? h("div", { class: "painel cor" }, [
              h("p", { class: "apoio", estilo: "color:var(--ink);font-size:21px" }, erroAtual.texto),
              h("p", { class: "nota", estilo: "margin-top:6px" },
                "Qual condição do protocolo foi violada?"),
              est.revelado
                ? h("div", { class: "resposta", estilo: "margin-top:8px" }, erroAtual.correcao)
                : h("button", { class: "btn", estilo: "margin-top:8px", type: "button",
                    onclick: function () { est.revelado = true; App.montar("43"); } },
                    "Como corrigir"),
            ])
          : null,
        h("div", { class: "painel claro cresce" }, [
          h("div", { class: "grupo" }, [
            h("button", { class: "btn min", type: "button", onclick: function () {
              est.protocolo = !est.protocolo; App.montar("43");
            } }, est.protocolo ? "Esconder metadados" : "Ver protocolo executado"),
            h("button", { class: "btn min fantasma", type: "button", onclick: ctx.reiniciar },
              "Reiniciar exemplo"),
          ]),
          est.protocolo
            ? h("div", { estilo: "margin-top:10px" }, [
                UI.tabela({
                  compacta: true,
                  colunas: [{ rotulo: "Partição" }, { rotulo: "Contratações" }, { rotulo: "n" },
                            { rotulo: "Eventos" }, { rotulo: "Alvo completo" }],
                  linhas: P.particoes.map(function (p) {
                    return [nomes[p.nome], F.mes(p.inicio) + " a " + F.mes(p.fim),
                            F.inteiro(p.n), F.inteiro(p.eventos), F.mes(p.alvo_conhecido)];
                  }),
                  legenda: "Metadados das partições",
                }),
                h("p", { class: "nota", estilo: "margin-top:8px" },
                  "semente " + F.inteiro(P.semente) + " · " +
                  (Aula.metadados
                    ? ("numpy " + Aula.metadados.numpy + " · sklearn " +
                       Aula.metadados.scikit_learn + " · python " + Aula.metadados.python)
                    : "versões no notebook")),
                Aula.metadados
                  ? h("p", { class: "nota" },
                      "sha256 do arquivo de resultados: " +
                      Aula.metadados.sha256_resultados.slice(0, 24) + "...")
                  : null,
              ])
            : h("p", { class: "apoio", estilo: "margin-top:10px" },
                "Antes de abrir qualquer resultado, vale conferir de onde vem cada número: " +
                "partições, tamanhos, semente e versões."),
        ]),
      ]),
    ]));
  },
});
