/* Motor da apresentação: navegação, modos, estado por slide e impressão.
   Regra de estado: a exploração de um slide é preservada enquanto a aba estiver aberta,
   inclusive ao recarregar a página; "Reiniciar exemplo" devolve só aquele slide ao estado
   inicial. O estado fica em sessionStorage, por aba, e só é restaurado se a versão da aula for
   a mesma que o gravou. Abrir uma URL explícita prevalece sobre o slide guardado. */

var App = (function () {
  var estados = {};
  var atual = null;
  var professor = false;
  var estudo = false;
  var LARGURA_ESTUDO = 1100;
  /* Embutida na plataforma, a aula perde o que não é do aluno. "aluno" segue o professor e não
     navega; "livre" navega sozinho; "projecao" é a janela projetada pelo professor, sem notas e
     sem impressão, porque as notas ficam no painel dele, e não na tela da turma. Nos três, as
     notas do professor saem de cena. Sem parâmetro, o arquivo é o de sempre: projeção com notas,
     estudo offline, duplo clique. O modo pode mudar em tempo de execução por App.definirModo. */
  var MODOS = ["aluno", "livre", "projecao"];
  var MODO = lerModo(location.search);
  /* A plataforma passa um identificador opaco por usuário para que duas pessoas no mesmo
     navegador não herdem as explorações uma da outra. Sem ele, a chave é a do arquivo local. */
  var NS = (/[?&]estado=([A-Za-z0-9_-]{1,40})(?:&|$)/.exec(location.search) || [])[1] || "local";
  var CHAVE_SLIDE = "aula-credito-slide" + (NS === "local" ? "" : ":" + NS);
  var CHAVE_ESTADO = "aula-credito-estado:" + NS;
  var salvarTimer = null;

  function lerModo(q) {
    var m = /[?&]modo=([a-z]+)(?:&|$)/.exec(q || "");
    return m && MODOS.indexOf(m[1]) >= 0 ? m[1] : "";
  }

  function ordem() { return Aula.slides; }
  function indiceDe(id) {
    for (var i = 0; i < Aula.slides.length; i++) if (Aula.slides[i].id === id) return i;
    return -1;
  }

  function estadoDe(id) {
    if (!estados[id]) estados[id] = {};
    return estados[id];
  }

  /* ------------------------------------------------------- persistência */

  /* O estado gravado carrega a versão da aula: uma versão nova invalida o estado antigo em vez
     de tentar aplicá-lo a slides que podem ter mudado. Estado ilegível é descartado. */
  function salvarEstado() {
    salvarTimer = null;
    try {
      sessionStorage.setItem(CHAVE_ESTADO, JSON.stringify({ versao: Aula.versao, estados: estados }));
    } catch (e) { /* sem persistência: a aula segue só em memória */ }
  }
  function agendarSalvar() {
    if (salvarTimer) clearTimeout(salvarTimer);
    salvarTimer = setTimeout(salvarEstado, 200);
  }
  function restaurarEstado() {
    var bruto = null;
    try { bruto = sessionStorage.getItem(CHAVE_ESTADO); } catch (e) { return; }
    if (!bruto) return;
    try {
      var s = JSON.parse(bruto);
      if (s && s.versao === Aula.versao && s.estados && typeof s.estados === "object" && !Array.isArray(s.estados)) {
        estados = s.estados;
        return;
      }
    } catch (e) { /* corrompido: cai no descarte abaixo */ }
    try { sessionStorage.removeItem(CHAVE_ESTADO); } catch (e) { /* nada a fazer */ }
  }
  /* Caminho de recuperação: apaga toda exploração desta aula nesta aba e remonta o slide. */
  function limparEstados() {
    estados = {};
    try { sessionStorage.removeItem(CHAVE_ESTADO); } catch (e) { /* nada a fazer */ }
    if (atual) montar(atual);
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
    ajustarCorpo();
    agendarSalvar();
  }

  /* Rede de segurança da projeção. O palco tem 900 px fixos e a moldura esconde o que passa
     deles: um estado revelado que não coubesse (um desafio aberto junto com a solução, uma
     comparação ligada) sumiria da tela da turma sem aviso. Aqui o corpo recebe o menor zoom que
     o faz caber, nunca abaixo de 0,6, e o fator fica em data-zoom para o QA cobrar os slides em
     que a redução passa do aceitável. No modo estudo a página rola, e nada disto se aplica. */
  function ajustarCorpo() {
    var corpo = document.getElementById("corpo");
    if (!corpo) return;
    corpo.style.zoom = "";
    corpo.removeAttribute("data-zoom");
    if (estudo) return;
    /* O que falta é o maior entre o excedente do corpo inteiro e o do painel mais espremido: um
       painel que cresce dentro de uma coluna cheia é encolhido pelo flex e o conteúdo dele passa
       por baixo do vizinho sem aumentar a rolagem do corpo. */
    function faltando() {
      var f = corpo.scrollHeight - corpo.clientHeight;
      var paineis = corpo.querySelectorAll(".painel");
      for (var j = 0; j < paineis.length; j++) {
        var pn = paineis[j];
        var cs = getComputedStyle(pn);
        if (cs.overflowY === "auto" || cs.overflowY === "scroll") continue;
        f = Math.max(f, pn.scrollHeight - pn.clientHeight);
      }
      return f;
    }
    var k = 1;
    for (var i = 0; i < 5; i++) {
      var sobra = faltando();
      if (sobra <= 1) break;
      k = Math.max(0.6, k * (corpo.clientHeight / (corpo.clientHeight + sobra)) * 0.995);
      corpo.style.zoom = k.toFixed(3);
      if (k <= 0.6) break;
    }
    if (k < 1) corpo.setAttribute("data-zoom", k.toFixed(2));
  }

  function montarNotasEstudo(def) {
    var velho = document.getElementById("estudo-notas");
    if (velho) velho.parentNode.removeChild(velho);
    if (MODO || !def.notas) return;
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
    if (MODO || !def.notas) return;
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
        a.setAttribute("aria-current", a.getAttribute("data-id") === atual ? "true" : "false");
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
          /* o filtro procura no número, no título e no nome do bloco: "boosting" encontra o bloco
             inteiro mesmo que nenhum título traga a palavra */
          "data-busca": normalizar(s.id + " " + s.titulo + " " + Aula.dados.blocos[b] + " " + b),
          class: s.id === atual ? "atual" : "",
          "aria-current": s.id === atual ? "true" : "false",
          onclick: function () { fecharIndice(); },
        }, [h("b", {}, s.id), h("span", {}, s.titulo)]);
      }));
      cx.appendChild(h("div", { class: "indice-bloco", "data-bloco": b }, [
        h("h3", {}, Aula.dados.blocos[b]), lista,
      ]));
    });
  }

  /* Filtro do índice: número ou trecho do título, sem distinguir acentos nem caixa. Blocos sem
     resultado somem; a contagem é anunciada para leitor de tela. */
  function normalizar(s) {
    return String(s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  }
  function filtrarIndice(termo) {
    var q = normalizar(termo || "").trim();
    var visiveis = 0;
    [].forEach.call(document.querySelectorAll("#indice-lista .indice-bloco"), function (bloco) {
      var algum = false;
      [].forEach.call(bloco.querySelectorAll("a"), function (a) {
        var bate = !q || (a.getAttribute("data-busca") || normalizar(a.textContent)).indexOf(q) >= 0;
        a.hidden = !bate;
        if (bate) { algum = true; visiveis += 1; }
      });
      bloco.hidden = !algum;
    });
    var aviso = document.getElementById("indice-contagem");
    if (aviso) {
      aviso.textContent = q
        ? (visiveis === 0 ? "Nenhum slide corresponde a “" + termo + "”."
                          : visiveis + (visiveis === 1 ? " slide encontrado." : " slides encontrados."))
        : "";
    }
    return visiveis;
  }
  function primeiroVisivelDoIndice() {
    var links = document.querySelectorAll("#indice-lista a");
    for (var i = 0; i < links.length; i++) if (!links[i].hidden) return links[i];
    return null;
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
    var guardado = null;
    try { guardado = localStorage.getItem(CHAVE_SLIDE); } catch (e) { /* sem persistência */ }
    var id = m ? m[1] : (guardado || "01");
    if (!Aula.registro[id]) id = "01";
    montar(id);
    try { localStorage.setItem(CHAVE_SLIDE, id); } catch (e) { /* sem persistência */ }
  }

  /* ---------------------------------------------------------------- modos */

  /* A variante compilada para o aluno não tem nota nenhuma: nela o botão Professor e a tecla p
     não existem, em vez de abrirem um painel vazio. */
  function temNotas() {
    return Aula.slides.some(function (s) { return !!s.notas; });
  }

  function alternarProfessor(v) {
    if (MODO || !temNotas()) return;
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

  /* Troca de modo sem recarregar o arquivo: a casca da plataforma chama isto quando o aluno
     passa de "seguir o professor" a "navegar por conta própria" e volta, e a exploração de cada
     slide continua onde estava. Modo desconhecido é ignorado. */
  function definirModo(novo) {
    novo = novo || "";
    if (novo && MODOS.indexOf(novo) < 0) return false;
    if (novo === MODO) return true;
    MODO = novo;
    if (MODO) document.body.setAttribute("data-modo", MODO);
    else document.body.removeAttribute("data-modo");
    if (MODO) {
      professor = false;
      document.getElementById("notas").hidden = true;
      document.getElementById("btn-professor").classList.remove("ativo");
      document.getElementById("btn-professor").setAttribute("aria-pressed", "false");
      var velho = document.getElementById("estudo-notas");
      if (velho) velho.parentNode.removeChild(velho);
      fecharIndice();
    } else if (atual) {
      atualizarNotas(Aula.registro[atual]);
      if (estudo) montarNotasEstudo(Aula.registro[atual]);
    }
    escalar();
    return true;
  }

  function telaCheia() {
    if (document.fullscreenElement) document.exitFullscreen();
    else if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().catch(function () { /* recusado */ });
    }
  }

  var focoAntesDoIndice = null;
  function abrirIndice() {
    var indice = document.getElementById("indice");
    if (!indice.hidden) return;
    focoAntesDoIndice = document.activeElement;
    indice.hidden = false;
    /* Enquanto o índice está aberto, o resto da página não recebe foco nem clique. */
    ["moldura", "barra"].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.inert = true;
    });
    var busca = document.getElementById("indice-busca");
    if (busca) { busca.value = ""; filtrarIndice(""); busca.focus(); return; }
    var a = document.querySelector("#indice-lista a.atual") || document.querySelector("#indice-lista a");
    if (a) a.focus();
  }
  function fecharIndice() {
    var indice = document.getElementById("indice");
    if (indice.hidden) return;
    indice.hidden = true;
    ["moldura", "barra"].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.inert = false;
    });
    if (focoAntesDoIndice && focoAntesDoIndice.focus && document.contains(focoAntesDoIndice)) {
      focoAntesDoIndice.focus();
    } else {
      document.getElementById("btn-indice").focus();
    }
    focoAntesDoIndice = null;
  }

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

  /* Uma folha por slide, com o mesmo palco de 1600 por 900 reduzido para caber
     na página. As notas e as respostas vão para o apêndice, depois das 50
     folhas, como pede o critério de aceite. */
  function prepararImpressao() {
    var cx = document.getElementById("impressao");
    limpar(cx);
    Aula.slides.forEach(function (def) {
      var palco = h("div", { class: "palco-folha" });
      palco.appendChild(h("div", { class: "trilho" }, [
        h("span", {}, Aula.dados.blocos[def.bloco]),
        h("span", { class: "passo" }, " slide " + def.id + " de 50"),
      ]));
      palco.appendChild(h("h1", { class: "titulo" }, def.titulo));
      if (def.subtitulo) palco.appendChild(h("p", { class: "subtitulo" }, def.subtitulo));
      var corpo = h("div", { class: "corpo" });
      palco.appendChild(corpo);
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
      palco.appendChild(h("p", { class: "conclusao" }, def.conclusao || ""));
      palco.appendChild(h("p", { class: "fonte" }, def.fonte || ""));
      cx.appendChild(h("article", { class: "folha" }, palco));
    });

    var comNotas = Aula.slides.filter(function (def) { return !!def.notas; });
    if (!comNotas.length) return;
    var apendice = h("section", { class: "apendice" }, [
      h("h1", { class: "titulo" }, "Apêndice: notas do professor e respostas"),
      h("p", { class: "subtitulo" },
        "Mesma ordem dos slides. Cada bloco traz condução, respostas, cuidados e transição."),
    ]);
    comNotas.forEach(function (def) {
      apendice.appendChild(h("div", { class: "bloco-notas" }, [
        h("h2", {}, def.id + " · " + def.titulo),
        h("p", { class: "fonte" }, def.fonte || ""),
        blocosDeNotas(def),
      ]));
    });
    cx.appendChild(apendice);
  }

  /* ------------------------------------------------------------- teclado */

  function editando(alvo) {
    if (!alvo) return false;
    var t = (alvo.tagName || "").toLowerCase();
    return t === "input" || t === "textarea" || t === "select" || alvo.isContentEditable;
  }

  function teclado(e) {
    if (e.defaultPrevented) return;
    if (MODO === "aluno") return;
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
      case "p": case "P": if (!MODO) alternarProfessor(); break;
      case "e": case "E": if (MODO !== "projecao") alternarEstudo(); break;
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
    var busca = document.getElementById("indice-busca");
    if (busca) {
      busca.addEventListener("input", function () { filtrarIndice(busca.value); });
      busca.addEventListener("keydown", function (e) {
        if (e.key === "Enter") {
          var a = primeiroVisivelDoIndice();
          if (a) { e.preventDefault(); fecharIndice(); navegar(a.getAttribute("data-id")); }
        } else if (e.key === "ArrowDown") {
          var b = primeiroVisivelDoIndice();
          if (b) { e.preventDefault(); b.focus(); }
        }
      });
    }
    var limparBtn = document.getElementById("btn-limpar-estado");
    if (limparBtn) {
      limparBtn.addEventListener("click", function () {
        fecharIndice();
        limparEstados();
      });
    }
    window.addEventListener("hashchange", doHash);
    window.addEventListener("resize", checarLargura);
    window.addEventListener("keydown", teclado);
    window.addEventListener("pagehide", salvarEstado);
    window.addEventListener("beforeprint", function () {
      if (!document.getElementById("impressao").childElementCount) prepararImpressao();
    });
    if (MODO) document.body.setAttribute("data-modo", MODO);
    if (!temNotas()) document.getElementById("btn-professor").hidden = true;
    if (window.innerWidth < LARGURA_ESTUDO) {
      estudo = true;
      document.body.classList.add("estudo");
      document.getElementById("btn-estudo").classList.add("ativo");
    }
    restaurarEstado();
    doHash();
    escalar();
  }

  return {
    iniciar: iniciar, navegar: navegar, montar: montar, estadoDe: estadoDe,
    prepararImpressao: prepararImpressao, escalar: escalar,
    definirModo: definirModo, modo: function () { return MODO; },
    limparEstados: limparEstados, salvarEstado: salvarEstado,
    atual: function () { return atual; },
  };
})();

document.addEventListener("DOMContentLoaded", function () {
  if (Aula.slides.length !== 50 && window.console) {
    console.warn("slides registrados: " + Aula.slides.length);
  }
  App.iniciar();
});
