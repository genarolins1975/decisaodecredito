/* Controles didáticos. Todo controle tem rótulo, unidade, domínio, passo, valor
   inicial e resposta numérica. Slider sempre acompanhado de entrada numérica. */

var UI = (function () {

  var seq = 0;
  function id(p) { seq += 1; return (p || "c") + seq; }

  /* Slider com entrada numérica equivalente. op: {rotulo, min, max, passo,
     valor, unidade, formato, aoMudar, largura} */
  function slider(op) {
    var idc = id("sl");
    var faixa = h("input", {
      type: "range", id: idc, min: op.min, max: op.max,
      step: op.passo === undefined ? 1 : op.passo, value: op.valor,
    });
    /* Entrada equivalente em texto, para manter a notação do português do Brasil:
       vírgula decimal e sinal de menos U+2212 em vez de hífen. */
    var passo = op.passo === undefined ? 1 : Number(op.passo);
    var casas = (String(passo).split(".")[1] || "").length;
    function escrever(v) { return F.dec(v, casas); }
    function ler(t) {
      return Number(String(t).replace(/\u2212/g, "-").replace(/\./g, "").replace(",", "."));
    }
    var numero = h("input", {
      type: "text", inputmode: "decimal", value: escrever(op.valor),
      "aria-label": op.rotulo + (op.unidade ? " em " + op.unidade : ""),
    });
    var saida = h("span", { class: "unidade num", "aria-live": "off" },
      op.formato ? op.formato(Number(op.valor)) : (op.unidade || ""));

    function emitir(v, origem) {
      v = Number(v);
      if (!isFinite(v)) return;
      v = M.clamp(v, Number(op.min), Number(op.max));
      if (origem !== "faixa") faixa.value = v;
      if (origem !== "numero") numero.value = escrever(v);
      saida.textContent = op.formato ? op.formato(v) : (op.unidade || "");
      if (op.aoMudar) op.aoMudar(v);
    }
    faixa.addEventListener("input", function () { emitir(faixa.value, "faixa"); });
    numero.addEventListener("change", function () { emitir(ler(numero.value), "numero"); });
    numero.addEventListener("blur", function () { numero.value = escrever(Number(faixa.value)); });

    var caixa = h("div", { class: "ctrl", estilo: op.largura ? "width:" + op.largura : "" }, [
      h("label", { for: idc }, op.rotulo),
      h("div", { class: "ctrl-linha" }, [faixa, numero, saida]),
    ]);
    caixa.definir = function (v) { emitir(v); };
    caixa.valor = function () { return Number(faixa.value); };
    return caixa;
  }

  /* Grupo de botões exclusivo. op: {opcoes:[{valor,rotulo,cor}], valor, aoMudar,
     rotulo, vertical, compacto} */
  function botoes(op) {
    var atual = op.valor;
    var lista = [];
    var caixa = h("div", { class: "grupo" + (op.vertical ? " vert" : ""), role: "group",
                           "aria-label": op.rotulo || "" });
    op.opcoes.forEach(function (o) {
      var b = h("button", {
        class: "btn" + (op.compacto ? " min" : "") + (o.valor === atual ? " sel" : ""),
        type: "button",
        "aria-pressed": o.valor === atual ? "true" : "false",
        estilo: o.cor && o.valor === atual ? "background:" + o.cor + ";border-color:" + o.cor : "",
        onclick: function () { definir(o.valor); if (op.aoMudar) op.aoMudar(o.valor); },
      }, o.rotulo);
      b._valor = o.valor;
      b._cor = o.cor;
      lista.push(b);
      caixa.appendChild(b);
    });
    function definir(v) {
      atual = v;
      lista.forEach(function (b) {
        var s = b._valor === v;
        b.classList.toggle("sel", s);
        b.setAttribute("aria-pressed", s ? "true" : "false");
        if (b._cor) b.setAttribute("style", s ? "background:" + b._cor + ";border-color:" + b._cor : "");
      });
    }
    caixa.definir = definir;
    caixa.valor = function () { return atual; };
    return caixa;
  }

  /* Revelação por passos: botão avança um passo por vez, sem animação automática.
     op: {passos:[{rotulo}], indice, aoMudar, rotuloBotao, rotuloFim} */
  function passos(op) {
    var i = op.indice || 0;
    var texto = h("span", { class: "nota" }, "");
    var btn = h("button", { class: "btn", type: "button", onclick: function () {
      if (i < op.passos.length) { i += 1; atualizar(); }
    } }, op.rotuloBotao || "Próximo passo");
    var volta = h("button", { class: "btn min fantasma", type: "button", onclick: function () {
      if (i > 0) { i -= 1; atualizar(); }
    } }, "Voltar um passo");
    function atualizar() {
      btn.disabled = i >= op.passos.length;
      volta.disabled = i <= 0;
      texto.textContent = i === 0
        ? (op.rotuloInicio || "passo 0 de " + op.passos.length)
        : "passo " + i + " de " + op.passos.length + ": " + (op.passos[i - 1].rotulo || "");
      if (op.aoMudar) op.aoMudar(i);
    }
    var caixa = h("div", { class: "grupo", estilo: "align-items:center" }, [btn, volta, texto]);
    caixa.definir = function (v) { i = v; atualizar(); };
    caixa.valor = function () { return i; };
    atualizar();
    return caixa;
  }

  /* Quiz de alternativa única com justificativa por alternativa.
     op: {alternativas:[{rotulo, correta, feedback}], escolha, aoEscolher,
          aoConferir, rotuloConferir} */
  function quiz(op) {
    var escolha = op.escolha === undefined ? null : op.escolha;
    var conferido = op.conferido || false;
    var letras = ["A", "B", "C", "D", "E"];
    var botoesAlt = [];
    var lista = h("div", { class: "coluna", estilo: "gap:8px", role: "radiogroup",
                           "aria-label": op.rotulo || "alternativas" });
    op.alternativas.forEach(function (a, k) {
      var b = h("button", {
        class: "alternativa", type: "button", role: "radio",
        "aria-checked": escolha === k ? "true" : "false",
        onclick: function () { escolha = k; conferido = false; pintar();
                               if (op.aoEscolher) op.aoEscolher(k); },
      }, [h("span", { class: "letra" }, letras[k]), a.rotulo]);
      botoesAlt.push(b);
      lista.appendChild(b);
    });

    var retorno = h("div", { class: "resposta neutra", hidden: true, "aria-live": "polite" });
    var conferir = h("button", {
      class: "btn", type: "button", onclick: function () {
        if (escolha === null) {
          retorno.hidden = false;
          retorno.className = "resposta neutra";
          retorno.textContent = "Escolha uma alternativa antes de conferir.";
          return;
        }
        conferido = true;
        pintar();
        if (op.aoConferir) op.aoConferir(escolha);
      },
    }, op.rotuloConferir || "Conferir");

    function pintar() {
      botoesAlt.forEach(function (b, k) {
        b.classList.toggle("sel", escolha === k && !conferido);
        b.setAttribute("aria-checked", escolha === k ? "true" : "false");
        b.classList.toggle("certa", conferido && op.alternativas[k].correta);
        b.classList.toggle("errada", conferido && escolha === k && !op.alternativas[k].correta);
      });
      if (conferido && escolha !== null) {
        var a = op.alternativas[escolha];
        retorno.hidden = false;
        retorno.className = "resposta " + (a.correta ? "" : "erro");
        limpar(retorno);
        retorno.appendChild(h("p", {}, [
          h("strong", {}, a.correta ? "Correta. " : "Ainda não. "), a.feedback,
        ]));
      } else {
        retorno.hidden = true;
      }
    }

    var caixa = h("div", { class: "coluna" }, [lista, h("div", { class: "grupo" }, [conferir]), retorno]);
    caixa.definir = function (k, c) { escolha = k; conferido = !!c; pintar(); };
    caixa.valor = function () { return { escolha: escolha, conferido: conferido }; };
    caixa.retorno = retorno;
    pintar();
    return caixa;
  }

  /* Alternador simples, com dois estados nomeados. */
  function alterna(op) {
    var ligado = !!op.valor;
    var b = h("button", {
      class: "btn" + (ligado ? " sel" : ""), type: "button",
      "aria-pressed": ligado ? "true" : "false",
      onclick: function () { ligado = !ligado; pintar(); if (op.aoMudar) op.aoMudar(ligado); },
    }, ligado ? (op.ligadoRotulo || op.rotulo) : (op.desligadoRotulo || op.rotulo));
    function pintar() {
      b.classList.toggle("sel", ligado);
      b.setAttribute("aria-pressed", ligado ? "true" : "false");
      b.textContent = ligado ? (op.ligadoRotulo || op.rotulo) : (op.desligadoRotulo || op.rotulo);
    }
    b.definir = function (v) { ligado = !!v; pintar(); };
    b.valor = function () { return ligado; };
    return b;
  }

  /* Botão que revela um bloco. */
  function revela(rotuloMostrar, rotuloEsconder, conteudo, aberto) {
    var alvo = h("div", { hidden: !aberto }, conteudo);
    var b = h("button", { class: "btn", type: "button", "aria-expanded": aberto ? "true" : "false",
      onclick: function () {
        alvo.hidden = !alvo.hidden;
        b.textContent = alvo.hidden ? rotuloMostrar : (rotuloEsconder || rotuloMostrar);
        b.setAttribute("aria-expanded", alvo.hidden ? "false" : "true");
      } }, aberto ? (rotuloEsconder || rotuloMostrar) : rotuloMostrar);
    var caixa = h("div", { class: "coluna", estilo: "gap:8px" }, [b, alvo]);
    caixa.alvo = alvo;
    caixa.botao = b;
    caixa.definir = function (v) {
      alvo.hidden = !v;
      b.textContent = v ? (rotuloEsconder || rotuloMostrar) : rotuloMostrar;
      b.setAttribute("aria-expanded", v ? "true" : "false");
    };
    return caixa;
  }

  /* Tabela com cabeçalho e linhas; colunas: [{rotulo, unidade, classe}] */
  function tabela(op) {
    var thead = h("thead", {}, h("tr", {}, op.colunas.map(function (c) {
      return h("th", { scope: "col" }, c.unidade
        ? [c.rotulo, h("br"), h("span", { estilo: "font-weight:400;text-transform:none" }, c.unidade)]
        : c.rotulo);
    })));
    var tbody = h("tbody", {}, (op.linhas || []).map(function (l, i) {
      return h("tr", { class: op.selecionada === i ? "sel" : "" }, l.map(function (v, j) {
        return h(j === 0 ? "th" : "td", j === 0 ? { scope: "row", class: "rotulo" } : {}, v);
      }));
    }));
    var t = h("table", { class: "tabela" + (op.compacta ? " compacta" : "") },
      [op.legenda ? h("caption", { class: "oculto-visual" }, op.legenda) : null, thead, tbody]);
    return t;
  }

  function kv(pares) {
    var itens = [];
    pares.forEach(function (p) {
      itens.push(h("dt", {}, p[0]));
      itens.push(h("dd", {}, p[1]));
    });
    return h("dl", { class: "kv" }, itens);
  }

  function selo(texto, tipo) {
    return h("span", { class: "selo" + (tipo ? " " + tipo : "") }, texto);
  }

  /* Descrição textual do visual, para leitor de tela e modo estudo. */
  function resumoGrafico(texto) {
    return h("p", { class: "oculto-visual" }, texto);
  }

  return {
    slider: slider, botoes: botoes, passos: passos, quiz: quiz, alterna: alterna,
    revela: revela, tabela: tabela, kv: kv, selo: selo, resumoGrafico: resumoGrafico, id: id,
  };
})();
