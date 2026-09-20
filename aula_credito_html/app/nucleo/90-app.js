/* Motor da apresentação: navegação, modos, estado por slide e impressão.
   Regra de estado: a exploração de um slide é preservada enquanto a sessão
   estiver aberta; "Reiniciar exemplo" devolve o slide ao estado inicial.
   Abrir uma URL explícita prevalece sobre o slide guardado. */

var App = (function () {
  var estados = {};
  var atual = null;
  var professor = false;
  var estudo = false;
  var LARGURA_ESTUDO = 1100;

  function ordem() { return Aula.slides; }
  function indiceDe(id) {
    for (var i = 0; i < Aula.slides.length; i++) if (Aula.slides[i].id === id) return i;
    return -1;
  }

  function estadoDe(id) {
    if (!estados[id]) estados[id] = {};
    return estados[id];
  }

  /* --------------------------------------------------------------- render */

  function montar(id) {
    var def = Aula.registro[id];
    if (!def) { id = Aula.slides[0].id; def = Aula.registro[id]; }
    atual = id;
    document.body.setAttribute("data-bloco", def.bloco);

    var palco = document.getElementById("palco");
    limpar(palco);

    var n = indiceDe(id) + 1;
    var cabeca = h("header", { class: "cabeca" }, [
      h("div", { class: "trilho" }, [
        h("span", {}, Aula.dados.blocos[def.bloco]),
        h("span", { class: "passo" }, "slide " + def.id + " de 50"),
      ]),
      h("h1", { class: "titulo" }, def.titulo),
      def.subtitulo ? h("p", { class: "subtitulo" }, def.subtitulo) : null,
    ]);
    var corpo = h("div", { id: "corpo" });
    var rodape = h("footer", { class: "rodape" }, [
      h("p", { class: "conclusao" }, def.conclusao || ""),
      h("p", { class: "fonte" }, def.fonte || ""),
    ]);
    palco.appendChild(cabeca);
    palco.appendChild(corpo);
    palco.appendChild(rodape);

    if (def.resumo) corpo.appendChild(UI.resumoGrafico(def.resumo));

    var ctx = {
      estado: estadoDe(id),
      professor: professor,
      estudo: estudo,
      reiniciar: function () { estados[id] = {}; montar(id); },
      ir: function (outro) { navegar(outro); },
      impressao: false,
    };
    try {
      def.montar(corpo, ctx);
    } catch (e) {
      corpo.appendChild(h("p", { class: "resposta erro" },
        "Falha ao montar o slide " + id + ": " + e.message));
      if (window.console) console.error(e);
    }

    atualizarBarra(def, n);
    atualizarNotas(def);
    atualizarIndice();
    if (estudo) montarNotasEstudo(def);
    escalar();
  }

  function montarNotasEstudo(def) {
    var velho = document.getElementById("estudo-notas");
    if (velho) velho.parentNode.removeChild(velho);
    if (!def.notas) return;
    var caixa = h("section", { id: "estudo-notas", class: "estudo-notas" },
      h("div", { class: "painel" }, [
        h("h3", { class: "secao" }, "Notas do professor e aprofundamento"),
        blocosDeNotas(def),
      ]));
    document.getElementById("moldura").appendChild(caixa);
  }

  function blocosDeNotas(def) {
    var itens = [];
    var mapa = [
      ["conducao", "Condução em aula"],
      ["respostas", "Respostas"],
      ["cuidados", "Cuidados e limites"],
      ["aprofundar", "Aprofundamento"],
    ];
    mapa.forEach(function (par) {
      var v = def.notas && def.notas[par[0]];
      if (!v || !v.length) return;
      itens.push(h("h3", {}, par[1]));
      itens.push(h("ul", {}, v.map(function (t) { return h("li", {}, t); })));
    });
    if (def.notas && def.notas.transicao) {
      itens.push(h("h3", {}, "Transição"));
      itens.push(h("p", {}, def.notas.transicao));
    }
    return h("div", {}, itens);
  }

  function atualizarNotas(def) {
    var cx = document.getElementById("notas");
    limpar(cx);
    cx.appendChild(h("h2", {}, def.id + " · " + def.titulo));
    cx.appendChild(h("p", { class: "nota" }, def.fonte || ""));
    cx.appendChild(blocosDeNotas(def));
  }

  function atualizarBarra(def, n) {
    document.getElementById("rotulo-id").textContent = def.id + "/50";
    document.getElementById("rotulo-titulo").textContent = def.titulo;
    document.getElementById("progresso-barra").style.width =
      ((n / Aula.slides.length) * 100).toFixed(2) + "%";
    var ant = document.getElementById("btn-anterior");
    var pro = document.getElementById("btn-proximo");
    ant.disabled = n <= 1;
    pro.disabled = n >= Aula.slides.length;
  }

  function atualizarIndice() {
    var cx = document.getElementById("indice-lista");
    if (cx.childElementCount) {
      [].forEach.call(cx.querySelectorAll("a"), function (a) {
        a.classList.toggle("atual", a.getAttribute("data-id") === atual);
      });
      return;
    }
    var porBloco = {};
    Aula.slides.forEach(function (s) {
      (porBloco[s.bloco] = porBloco[s.bloco] || []).push(s);
    });
    Object.keys(Aula.dados.blocos).forEach(function (b) {
      if (!porBloco[b]) return;
      var lista = h("div", { class: "indice-lista" }, porBloco[b].map(function (s) {
        return h("a", {
          href: "#/slide/" + s.id, "data-id": s.id,
          class: s.id === atual ? "atual" : "",
          onclick: function () { fecharIndice(); },
        }, [h("b", {}, s.id), h("span", {}, s.titulo)]);
      }));
      cx.appendChild(h("div", { class: "indice-bloco" }, [
        h("h3", {}, Aula.dados.blocos[b]), lista,
      ]));
    });
  }

  /* ------------------------------------------------------------ navegação */

  function navegar(id) {
    if (!Aula.registro[id]) return;
    if (location.hash !== "#/slide/" + id) {
      location.hash = "#/slide/" + id;
    } else {
      montar(id);
    }
  }
  function passo(d) {
    var i = indiceDe(atual) + d;
    if (i < 0 || i >= Aula.slides.length) return;
    navegar(Aula.slides[i].id);
  }

  function doHash() {
    var m = /^#\/slide\/(\d{2})$/.exec(location.hash || "");
    var id = m ? m[1] : (localStorage.getItem("aula-credito-slide") || "01");
    if (!Aula.registro[id]) id = "01";
    montar(id);
    try { localStorage.setItem("aula-credito-slide", id); } catch (e) { /* sem persistência */ }
  }

  /* ---------------------------------------------------------------- modos */

  function alternarProfessor(v) {
    professor = v === undefined ? !professor : v;
    document.getElementById("notas").hidden = !professor;
    document.getElementById("btn-professor").classList.toggle("ativo", professor);
    document.getElementById("btn-professor").setAttribute("aria-pressed", professor ? "true" : "false");
    escalar();
  }

  function alternarEstudo(v) {
    estudo = v === undefined ? !estudo : v;
    document.body.classList.toggle("estudo", estudo);
    document.getElementById("btn-estudo").classList.toggle("ativo", estudo);
    document.getElementById("btn-estudo").setAttribute("aria-pressed", estudo ? "true" : "false");
    var velho = document.getElementById("estudo-notas");
    if (velho) velho.parentNode.removeChild(velho);
    montar(atual);
  }

  function telaCheia() {
    if (document.fullscreenElement) document.exitFullscreen();
    else if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().catch(function () { /* recusado */ });
    }
  }

  function abrirIndice() {
    document.getElementById("indice").hidden = false;
    var a = document.querySelector("#indice-lista a.atual") || document.querySelector("#indice-lista a");
    if (a) a.focus();
  }
  function fecharIndice() { document.getElementById("indice").hidden = true; }

  /* ------------------------------------------------------------- escala */

  function escalar() {
    if (estudo) return;
    var palco = document.getElementById("palco");
    var moldura = document.getElementById("moldura");
    var lados = professor && moldura.clientWidth > 1200 ? 430 : 0;
    var k = Math.min((moldura.clientWidth - lados - 16) / 1600,
                     (moldura.clientHeight - 16) / 900);
    palco.style.transform = "scale(" + k.toFixed(4) + ")";
    palco.style.marginRight = lados ? lados + "px" : "0";
  }

  function checarLargura() {
    var estreito = window.innerWidth < LARGURA_ESTUDO;
    if (estreito && !estudo) alternarEstudo(true);
    else escalar();
  }

  /* ----------------------------------------------------------- impressão */

  function prepararImpressao() {
    var cx = document.getElementById("impressao");
    limpar(cx);
    Aula.slides.forEach(function (def) {
      var folha = h("article", { class: "folha" });
      folha.appendChild(h("div", { class: "trilho" }, [
        h("span", {}, Aula.dados.blocos[def.bloco]),
        h("span", { class: "passo" }, " slide " + def.id + " de 50"),
      ]));
      folha.appendChild(h("h1", { class: "titulo" }, def.titulo));
      if (def.subtitulo) folha.appendChild(h("p", { class: "subtitulo" }, def.subtitulo));
      var corpo = h("div", { class: "corpo" });
      folha.appendChild(corpo);
      var est = JSON.parse(JSON.stringify(estadoDe(def.id)));
      if (def.impressao) def.impressao(est);
      try {
        def.montar(corpo, {
          estado: est, professor: true, estudo: false, impressao: true,
          reiniciar: function () {}, ir: function () {},
        });
      } catch (e) {
        corpo.appendChild(h("p", {}, "Slide não renderizado para impressão: " + e.message));
      }
      folha.appendChild(h("p", { class: "conclusao" }, def.conclusao || ""));
      folha.appendChild(h("p", { class: "fonte" }, def.fonte || ""));
      if (def.notas) {
        folha.appendChild(h("div", { class: "painel", estilo: "margin-top:8px" }, [
          h("h3", { class: "secao" }, "Notas e respostas"), blocosDeNotas(def),
        ]));
      }
      cx.appendChild(folha);
    });
  }

  /* ------------------------------------------------------------- teclado */

  function editando(alvo) {
    if (!alvo) return false;
    var t = (alvo.tagName || "").toLowerCase();
    return t === "input" || t === "textarea" || t === "select" || alvo.isContentEditable;
  }

  function teclado(e) {
    if (e.defaultPrevented) return;
    if (e.key === "Escape") {
      if (!document.getElementById("indice").hidden) { fecharIndice(); return; }
    }
    if (editando(e.target)) return;
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    switch (e.key) {
      case "ArrowRight": case "PageDown": passo(1); e.preventDefault(); break;
      case "ArrowLeft": case "PageUp": passo(-1); e.preventDefault(); break;
      case "Home": navegar(Aula.slides[0].id); e.preventDefault(); break;
      case "End": navegar(Aula.slides[Aula.slides.length - 1].id); e.preventDefault(); break;
      case "p": case "P": alternarProfessor(); break;
      case "e": case "E": alternarEstudo(); break;
      case "f": case "F": telaCheia(); break;
      case "i": case "I":
        if (document.getElementById("indice").hidden) abrirIndice(); else fecharIndice();
        break;
      default: break;
    }
  }

  /* --------------------------------------------------------------- início */

  function iniciar() {
    document.getElementById("btn-anterior").addEventListener("click", function () { passo(-1); });
    document.getElementById("btn-proximo").addEventListener("click", function () { passo(1); });
    document.getElementById("btn-indice").addEventListener("click", abrirIndice);
    document.getElementById("btn-fechar-indice").addEventListener("click", fecharIndice);
    document.getElementById("btn-professor").addEventListener("click", function () { alternarProfessor(); });
    document.getElementById("btn-estudo").addEventListener("click", function () { alternarEstudo(); });
    document.getElementById("btn-tela").addEventListener("click", telaCheia);
    document.getElementById("btn-imprimir").addEventListener("click", function () {
      prepararImpressao();
      setTimeout(function () { window.print(); }, 60);
    });
    window.addEventListener("hashchange", doHash);
    window.addEventListener("resize", checarLargura);
    window.addEventListener("keydown", teclado);
    window.addEventListener("beforeprint", function () {
      if (!document.getElementById("impressao").childElementCount) prepararImpressao();
    });
    if (window.innerWidth < LARGURA_ESTUDO) {
      estudo = true;
      document.body.classList.add("estudo");
      document.getElementById("btn-estudo").classList.add("ativo");
    }
    doHash();
    escalar();
  }

  return {
    iniciar: iniciar, navegar: navegar, montar: montar, estadoDe: estadoDe,
    prepararImpressao: prepararImpressao, escalar: escalar,
  };
})();

document.addEventListener("DOMContentLoaded", function () {
  if (Aula.slides.length !== 50 && window.console) {
    console.warn("slides registrados: " + Aula.slides.length);
  }
  App.iniciar();
});
