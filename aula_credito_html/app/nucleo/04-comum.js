/* Componentes compartilhados entre slides: ficha de cliente, seletor dos quatro
   perfis, curva logística pequena, árvore didática e barra de composição.
   Cada componente calcula a partir de Aula.dados; nada é texto fixo com número. */

var Comum = (function () {
  var D = Aula.dados;

  function seletorCliente(valor, aoMudar, op) {
    op = op || {};
    return UI.botoes({
      rotulo: op.rotulo || "cliente",
      compacto: op.compacto,
      opcoes: D.clientes.map(function (c) { return { valor: c.nome, rotulo: c.nome }; })
        .concat(op.extra || []),
      valor: valor,
      aoMudar: aoMudar,
    });
  }

  /* Ficha com as características do perfil. campos limita o que aparece. */
  function ficha(c, op) {
    op = op || {};
    var campos = op.campos || ["renda", "comp", "rel", "util", "hist", "canal"];
    var linhas = campos.map(function (k) {
      var d = D.dicionario.filter(function (x) { return x.campo === k; })[0];
      var v;
      if (k === "renda") v = F.reais(c.renda);
      else if (k === "comp") v = F.dec(c.comp, 0) + "%";
      else if (k === "rel") v = F.dec(c.rel, 0) + " meses";
      else if (k === "util") v = F.dec(c.util, 0) + "%";
      else if (k === "hist") v = c.hist ? "sim" : "não";
      else v = c.canal;
      return [d.nome, v];
    });
    return h("div", { class: "painel" + (op.cor ? " cor" : ""), estilo: op.estilo || "" }, [
      h("div", { estilo: "display:flex;justify-content:space-between;align-items:baseline;gap:10px" }, [
        h("h2", { class: "secao", estilo: "margin:0" }, c.nome),
        op.selo ? UI.selo(op.selo, op.seloTipo) : null,
      ]),
      UI.kv(linhas),
      op.rodape ? h("p", { class: "nota", estilo: "margin-top:8px" }, op.rodape) : null,
    ]);
  }

  /* Ficha em uma linha, para quando o perfil é contexto e não o assunto. */
  function fichaLinha(c, op) {
    op = op || {};
    var partes = [
      F.reais(c.renda) + " por mês",
      "comprometimento " + F.dec(c.comp, 0) + "%",
      "relacionamento " + F.dec(c.rel, 0) + " meses",
      "utilização " + F.dec(c.util, 0) + "%",
      "histórico " + (c.hist ? "sim" : "não"),
      "canal " + c.canal.toLowerCase(),
    ];
    if (op.campos) {
      var mapa = { renda: 0, comp: 1, rel: 2, util: 3, hist: 4, canal: 5 };
      partes = op.campos.map(function (k) { return partes[mapa[k]]; });
    }
    return h("div", { class: "painel" + (op.cor ? " cor" : " claro"),
      estilo: "padding:10px 16px;display:flex;align-items:baseline;gap:14px;flex-wrap:wrap;" +
              (op.estilo || "") }, [
      h("span", { class: "medio" }, c.nome),
      h("span", { class: "apoio" }, partes.join(" · ")),
      op.selo ? UI.selo(op.selo, op.seloTipo) : null,
    ]);
  }

  /* Curva logística pequena com um ponto marcado. */
  function miniSigmoide(z, op) {
    op = op || {};
    var g = Graf.novo({ w: op.w || 300, h: op.h || 190, m: { e: 54, d: 14, c: 12, b: 40 } });
    g.x(op.zmin === undefined ? -8 : op.zmin, op.zmax === undefined ? 4 : op.zmax).y(0, 1);
    g.grade({ y: [0, 0.25, 0.5, 0.75, 1] });
    g.eixoY({ ticks: [0, 0.5, 1], formato: function (v) { return F.pct(v, 0); } });
    g.eixoX({ ticks: [-8, -4, 0, 4], rotulo: op.rotuloX || "escore z" });
    var pts = M.linspace(g.dx[0], g.dx[1], 160).map(function (v) { return [v, M.sigmoid(v)]; });
    g.linha(pts, { cor: "var(--cor)", largura: 3 });
    if (z !== null && z !== undefined) {
      g.guia(z, M.sigmoid(z));
      g.ponto(z, M.sigmoid(z), { cor: "var(--cor)" });
      g.texto(z, M.sigmoid(z), F.pct(M.sigmoid(z)), { dx: 10, dy: -10, cor: "var(--ink)" });
    }
    return g.svg;
  }

  /* Árvore didática de 1.000 contratos.
     op: {cliente, mostrarNumeros, mostrarPd, ocultarFolha, w, h, aoSelecionar} */
  function arvoreDidatica(op) {
    op = op || {};
    var A = D.arvore;
    var caminho = op.cliente ? A.percurso(op.cliente) : [];
    /* passo limita quantos nós do percurso já estão destacados, para a
       revelação manual de três etapas do slide 21. */
    var quantos = op.passo === undefined ? caminho.length : op.passo;
    var destacados = caminho.slice(0, quantos).map(function (p) { return p.no; });

    function detalhe(no) {
      if (!op.mostrarNumeros) return null;
      return "n = " + F.inteiro(no.n) + " · eventos " + F.inteiro(no.d);
    }
    function valor(no) {
      if (!op.mostrarPd) return undefined;
      if (op.ocultarFolha && no === op.ocultarFolha) return "PD = ?";
      return "PD " + F.pct(no.pd, no.pd * 100 % 1 === 0 ? 0 : 1);
    }
    /* A PD entra como linha da caixa, e não solta embaixo, para não cruzar arestas. */
    function construir(no) {
      var dest = destacados.indexOf(no) >= 0;
      if (no.tipo === "folha") {
        return {
          rotulo: op.rotuloFolha ? op.rotuloFolha(no) : "folha",
          detalhe: detalhe(no), detalhe2: valor(no), destaque: dest,
        };
      }
      var ordem = destacados.indexOf(no);
      var ramoRevelado = ordem >= 0 && ordem + 1 < quantos;
      var esqDest = ramoRevelado && caminho.some(function (p) { return p.no === no && p.esq; });
      var dirDest = ramoRevelado && caminho.some(function (p) { return p.no === no && !p.esq && !p.folha; });
      return {
        rotulo: no.pergunta, detalhe: detalhe(no), detalhe2: valor(no), destaque: dest,
        filhos: [
          { aresta: no.rotuloEsq, destaque: esqDest, no: construir(no.esq) },
          { aresta: no.rotuloDir, destaque: dirDest, no: construir(no.dir) },
        ],
      };
    }
    return Graf.arvore({
      no: construir(A.raiz), w: op.w || 940, h: op.h || 360,
      caixaW: op.caixaW || 210, caixaH: op.caixaH || (op.mostrarNumeros ? 58 : 44),
      resumo: op.resumo || "Árvore de profundidade dois: histórico na raiz e comprometimento em cada ramo.",
    });
  }

  var NOMES_COLUNAS = {
    renda: "renda", comp: "comprometimento", rel: "relacionamento", util: "utilização",
    hist: "histórico", canal_digital: "canal digital", canal_parceiro: "canal parceiro",
    renda_ausente: "renda ausente", util_ausente: "utilização ausente",
  };

  /* Desenha uma árvore treinada do experimento, a partir da estrutura exportada. */
  function arvoreTreinada(estrutura, op) {
    op = op || {};
    function unidade(v) {
      if (v === "renda") return " R$";
      if (v === "comp" || v === "util") return "%";
      if (v === "rel") return " meses";
      return "";
    }
    var curto = op.compacto;
    function construir(no, nivel) {
      var nome = curto ? no.variavel : (NOMES_COLUNAS[no.variavel] || no.variavel);
      var base = {
        rotulo: no.folha ? (no.resumido ? "ramo resumido" : "folha") :
          nome + " \u2264 " + F.dec(no.limite, no.variavel === "renda" ? 0 : 1) +
          (curto ? "" : unidade(no.variavel)),
        detalhe: curto
          ? "n = " + F.inteiro(no.n) + " · PD " + F.pct(no.pd, 1)
          : "n = " + F.inteiro(no.n) + " · eventos " + F.inteiro(no.eventos),
        detalhe2: curto ? null : "PD " + F.pct(no.pd, 1),
      };
      if (!no.folha && nivel < (op.profundidade || 2)) {
        base.filhos = [
          { aresta: "sim", no: construir(no.esq, nivel + 1) },
          { aresta: "não", no: construir(no.dir, nivel + 1) },
        ];
      } else if (!no.folha) {
        /* Nó interno além da profundidade exibida: mantém a pergunta e sinaliza o resumo. */
        base.detalhe2 = "ramo resumido";
      }
      return base;
    }
    return Graf.arvore({
      no: construir(estrutura, 0), w: op.w || 900, h: op.h || 340,
      caixaW: op.caixaW || 210, caixaH: op.caixaH || 74,
      resumo: op.resumo || "Árvore treinada no experimento sintético.",
    });
  }

  /* Mapa de calor de uma malha {comp:[], util:[], pd:[]} do experimento auxiliar. */
  function mapaCalor(malha, op) {
    op = op || {};
    var w = op.w || 300, hh = op.h || 300;
    var m = { e: 54, d: 12, c: 12, b: 46 };
    var nx = malha.comp.length, ny = malha.util.length;
    var lim = op.max || 0.5;
    var g = Graf.novo({ w: w, h: hh, m: m, resumo: op.resumo || "" });
    g.x(malha.comp[0], malha.comp[nx - 1]).y(malha.util[0], malha.util[ny - 1]);
    var larg = (g.largura / (nx - 1)) + 0.6, alt = (g.altura / (ny - 1)) + 0.6;
    for (var j = 0; j < ny; j++) {
      for (var i = 0; i < nx; i++) {
        var pd = malha.pd[j * nx + i];
        var t = Math.min(1, pd / lim);
        g.add(sv("rect", {
          x: g.px(malha.comp[i]) - larg / 2, y: g.py(malha.util[j]) - alt / 2,
          width: larg, height: alt,
          fill: "color-mix(in srgb, var(--cor) " + (6 + t * 88).toFixed(0) + "%, #ffffff)",
        }));
      }
    }
    g.eixoX({ ticks: op.ticksX || [20, 40, 60, 80], rotulo: op.rotuloX || "comprometimento" });
    g.eixoY({ ticks: op.ticksY || [0, 50, 100], rotulo: op.rotuloY || "utilização" });
    return g;
  }

  /* Faixa de legenda da escala de cor, de 0 até max. */
  function legendaCor(max, op) {
    op = op || {};
    var w = op.w || 260, hh = 46;
    var svg = sv("svg", { viewBox: "0 0 " + w + " " + hh, width: w, height: hh, role: "img",
      "aria-label": "escala de PD de 0 a " + F.pct(max, 0) });
    for (var i = 0; i < 40; i++) {
      svg.appendChild(sv("rect", { x: (i * w) / 40, y: 0, width: w / 40 + 0.6, height: 18,
        fill: "color-mix(in srgb, var(--cor) " + (6 + (i / 39) * 88).toFixed(0) + "%, #ffffff)" }));
    }
    svg.appendChild(sv("text", { x: 0, y: 36, "font-size": 16, fill: "var(--muted)", texto: "0%" }));
    svg.appendChild(sv("text", { x: w, y: 36, "text-anchor": "end", "font-size": 16,
      fill: "var(--muted)", texto: F.pct(max, 0) }));
    return svg;
  }

  /* Barra horizontal de composição eventos e não eventos. */
  function composicao(n, d, op) {
    op = op || {};
    var w = op.w || 320, hh = op.h || 34;
    var frac = d / n;
    var svg = sv("svg", { viewBox: "0 0 " + w + " " + hh, width: w, height: hh, role: "img",
      "aria-label": F.inteiro(d) + " eventos em " + F.inteiro(n) + " contratos, " + F.pct(frac, 1) });
    svg.appendChild(sv("rect", { x: 0, y: 0, width: w, height: hh, fill: "var(--dots)", rx: 3 }));
    svg.appendChild(sv("rect", { x: 0, y: 0, width: Math.max(2, w * frac), height: hh,
                                 fill: "var(--alert)", rx: 3 }));
    if (op.rotulo !== false) {
      svg.appendChild(sv("text", { x: Math.max(2, w * frac) + 8, y: hh / 2 + 6, "font-size": 18,
        "font-weight": 700, fill: "var(--ink)", texto: F.pct(frac, 1) }));
    }
    return svg;
  }

  /* Grade de 100 pontos: frequência esperada ilustrativa. */
  function grade100(eventos, op) {
    op = op || {};
    var lado = op.lado || 26, gap = op.gap || 5, cols = 10;
    var w = cols * (lado + gap), hh = cols * (lado + gap);
    var svg = sv("svg", { viewBox: "0 0 " + w + " " + hh, width: op.w || w, height: op.h || hh,
      role: "img", "aria-label": "grade de 100 pontos com " + eventos + " marcados como evento" });
    for (var i = 0; i < 100; i++) {
      var c = i % cols, r = Math.floor(i / cols);
      svg.appendChild(sv("rect", {
        x: c * (lado + gap), y: r * (lado + gap), width: lado, height: lado, rx: 3,
        fill: i < eventos ? "var(--alert)" : "var(--dots)",
      }));
    }
    return svg;
  }

  /* Rótulo de simulação local, usado sempre que um perfil é alterado. */
  function seloSimulacao(texto) {
    return UI.selo(texto || "simulação: demais atributos fixos", "sim");
  }

  function linhaFonte(texto) {
    return h("p", { class: "nota" }, texto);
  }

  /* Tabela dos quatro clientes. */
  function tabelaClientes(op) {
    op = op || {};
    var colunas = [
      { rotulo: "Cliente" },
      { rotulo: "Renda", unidade: "R$ por mês" },
      { rotulo: "Comprometimento", unidade: "%" },
      { rotulo: "Relacionamento", unidade: "meses" },
      { rotulo: "Utilização", unidade: "%" },
      { rotulo: "Histórico", unidade: "0 ou 1" },
      { rotulo: "Canal", unidade: "categoria" },
    ];
    var linhas = D.clientes.map(function (c) {
      return [c.nome, F.inteiro(c.renda), F.dec(c.comp, 0), F.dec(c.rel, 0),
              F.dec(c.util, 0), String(c.hist), c.canal];
    });
    var sel = op.selecionado ? D.clientes.map(function (c) { return c.nome; }).indexOf(op.selecionado) : -1;
    return UI.tabela({ colunas: colunas, linhas: linhas, selecionada: sel,
                       legenda: "Características dos quatro clientes no momento da proposta" });
  }

  return {
    seletorCliente: seletorCliente, ficha: ficha, fichaLinha: fichaLinha, miniSigmoide: miniSigmoide,
    arvoreDidatica: arvoreDidatica, composicao: composicao, grade100: grade100,
    seloSimulacao: seloSimulacao, linhaFonte: linhaFonte, tabelaClientes: tabelaClientes,
    arvoreTreinada: arvoreTreinada, NOMES_COLUNAS: NOMES_COLUNAS,
    mapaCalor: mapaCalor, legendaCor: legendaCor,
  };
})();
