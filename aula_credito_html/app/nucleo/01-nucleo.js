/* Núcleo da aula: registro de slides, formatação numérica e funções matemáticas
   compartilhadas. Todo valor exibido na tela vem daqui ou dos objetos de dados;
   nenhum número é digitado duas vezes em lugares diferentes. */

var Aula = (function () {
  var slides = [];
  var registro = {};

  function slide(def) {
    if (registro[def.id]) throw new Error("slide duplicado: " + def.id);
    registro[def.id] = def;
    slides.push(def);
    return def;
  }

  return {
    slides: slides,
    registro: registro,
    slide: slide,
    dados: {},
    resultados: null,
  };
})();

/* ------------------------------------------------------------- formatação */

var F = (function () {
  var MENOS = "−"; // sinal de menos, nunca hífen

  function trocaMenos(s) {
    return String(s).replace(/-/g, MENOS);
  }

  function dec(x, casas) {
    if (x === null || x === undefined || !isFinite(x)) return "indisponível";
    casas = casas === undefined ? 2 : casas;
    var s = Math.abs(x).toFixed(casas).replace(".", ",");
    return (x < 0 ? MENOS : "") + s;
  }

  function sinal(x, casas) {
    if (!isFinite(x)) return "indisponível";
    var s = dec(Math.abs(x), casas);
    return (x < 0 ? MENOS : "+") + s;
  }

  function pct(p, casas) {
    casas = casas === undefined ? 2 : casas;
    return dec(p * 100, casas) + "%";
  }

  function pp(x, casas) {
    casas = casas === undefined ? 2 : casas;
    return dec(x * 100, casas) + " p.p.";
  }

  function ppSinal(x, casas) {
    casas = casas === undefined ? 2 : casas;
    return sinal(x * 100, casas) + " p.p.";
  }

  function reais(x, casas) {
    casas = casas === undefined ? 0 : casas;
    var s = Math.abs(x).toFixed(casas);
    var partes = s.split(".");
    partes[0] = partes[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    return "R$ " + (x < 0 ? MENOS : "") + partes.join(",");
  }

  function inteiro(x) {
    return String(Math.round(x)).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  }

  function mes(iso) {
    var nomes = ["jan", "fev", "mar", "abr", "mai", "jun",
                 "jul", "ago", "set", "out", "nov", "dez"];
    var p = String(iso).split("-");
    return nomes[parseInt(p[1], 10) - 1] + "/" + p[0];
  }

  return {
    MENOS: MENOS, trocaMenos: trocaMenos, dec: dec, sinal: sinal, pct: pct,
    pp: pp, ppSinal: ppSinal, reais: reais, inteiro: inteiro, mes: mes,
  };
})();

/* ------------------------------------------------------------- matemática */

var M = (function () {
  function sigmoid(z) { return 1 / (1 + Math.exp(-z)); }
  function logito(p) { return Math.log(p / (1 - p)); }
  function odds(p) { return p / (1 - p); }
  function pDeOdds(o) { return o / (1 + o); }

  /* PD depois de multiplicar as odds por r, sem passar por arredondamento. */
  function porRazaoDeOdds(p, r) {
    return (r * p) / (1 - p + r * p);
  }

  function logLoss(y, p) {
    var e = 1e-12;
    var q = Math.min(Math.max(p, e), 1 - e);
    return -(y * Math.log(q) + (1 - y) * Math.log(1 - q));
  }

  function gini(p) { return 2 * p * (1 - p); }

  function entropia(p) {
    if (p <= 0 || p >= 1) return 0;
    return -(p * Math.log2(p) + (1 - p) * Math.log2(1 - p));
  }

  /* Intervalo de Wilson nominal de 95 por cento, z = 1,96. */
  function wilson(d, n, z) {
    z = z || 1.96;
    if (n === 0) return [0, 1];
    var p = d / n;
    var den = 1 + (z * z) / n;
    var centro = (p + (z * z) / (2 * n)) / den;
    var meio = (z * Math.sqrt((p * (1 - p)) / n + (z * z) / (4 * n * n))) / den;
    return [Math.max(0, centro - meio), Math.min(1, centro + meio)];
  }

  function clamp(x, a, b) { return Math.min(Math.max(x, a), b); }

  function linspace(a, b, n) {
    var v = [];
    for (var i = 0; i < n; i++) v.push(a + ((b - a) * i) / (n - 1));
    return v;
  }

  function soma(v) { return v.reduce(function (a, b) { return a + b; }, 0); }
  function media(v) { return v.length ? soma(v) / v.length : NaN; }

  /* AUC por contagem de pares, com meio crédito para empate. */
  function aucPares(escores, y) {
    var pos = [], neg = [], i;
    for (i = 0; i < y.length; i++) (y[i] === 1 ? pos : neg).push(escores[i]);
    if (!pos.length || !neg.length) return NaN;
    var c = 0;
    for (i = 0; i < pos.length; i++) {
      for (var j = 0; j < neg.length; j++) {
        if (pos[i] > neg[j]) c += 1;
        else if (pos[i] === neg[j]) c += 0.5;
      }
    }
    return c / (pos.length * neg.length);
  }

  return {
    sigmoid: sigmoid, logito: logito, odds: odds, pDeOdds: pDeOdds,
    porRazaoDeOdds: porRazaoDeOdds, logLoss: logLoss, gini: gini,
    entropia: entropia, wilson: wilson, clamp: clamp, linspace: linspace,
    soma: soma, media: media, aucPares: aucPares,
  };
})();

/* -------------------------------------------------------- criação de nós */

function h(tag, attrs, filhos) {
  var el = document.createElement(tag);
  aplicar(el, attrs);
  anexar(el, filhos);
  return el;
}

function sv(tag, attrs, filhos) {
  var el = document.createElementNS("http://www.w3.org/2000/svg", tag);
  if (attrs) {
    for (var k in attrs) {
      if (!Object.prototype.hasOwnProperty.call(attrs, k)) continue;
      var v = attrs[k];
      if (v === null || v === undefined || v === false) continue;
      if (k === "texto") el.textContent = v;
      else if (k.slice(0, 2) === "on" && typeof v === "function") {
        el.addEventListener(k.slice(2), v);
      } else el.setAttribute(k, v);
    }
  }
  anexar(el, filhos);
  return el;
}

function aplicar(el, attrs) {
  if (!attrs) return;
  for (var k in attrs) {
    if (!Object.prototype.hasOwnProperty.call(attrs, k)) continue;
    var v = attrs[k];
    if (v === null || v === undefined || v === false) continue;
    if (k === "class") el.className = v;
    else if (k === "texto") el.textContent = v;
    else if (k === "html") el.innerHTML = v;
    else if (k === "estilo") el.setAttribute("style", v);
    else if (k.slice(0, 2) === "on" && typeof v === "function") {
      el.addEventListener(k.slice(2), v);
    } else if (v === true) el.setAttribute(k, "");
    else el.setAttribute(k, v);
  }
}

function anexar(el, filhos) {
  if (filhos === null || filhos === undefined) return;
  if (!Array.isArray(filhos)) filhos = [filhos];
  filhos.forEach(function (f) {
    if (f === null || f === undefined || f === false) return;
    if (typeof f === "string" || typeof f === "number") {
      el.appendChild(document.createTextNode(String(f)));
    } else el.appendChild(f);
  });
}

function limpar(el) {
  while (el.firstChild) el.removeChild(el.firstChild);
  return el;
}
