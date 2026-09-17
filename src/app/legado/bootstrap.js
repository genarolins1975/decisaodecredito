/* Bootstrap do iframe legado: sem rede, sem armazenamento persistente, sem questões nativas. */
(function () {
  var mem = {};
  try { Object.defineProperty(window, "localStorage", { value: { getItem: function (k) { return k in mem ? mem[k] : null; }, setItem: function (k, v) { mem[k] = String(v); }, removeItem: function (k) { delete mem[k]; }, clear: function () { mem = {}; } } }); } catch (e) {}
  var slug = document.body.getAttribute("data-slug");
  var REVEALS = {};
  /* questões e previsões são renderizadas pela plataforma; aqui viram vazio */
  try { questao = function () { return ""; }; ligaQuestao = function () {}; abreRecuperacao = function () {}; } catch (e) {}
  try { prever = function () { return ""; }; ligaPrever = function (id, cb) { REVEALS[id] = cb || null; }; } catch (e) {}
  try { adicionaChecagemRapida = function () {}; } catch (e) {}
  try { narrativaVisualV6(); trabalhoFinalV10(); experienciaV13(); } catch (e) { console.error(e); }
  try {
    MODO = "professor"; recalculaLista();
    var j = LISTA.findIndex(function (p) { return p.id === slug; });
    if (j < 0) { document.body.textContent = "Página não encontrada."; return; }
    AT = j; desenha();
    document.body.className = "m-estudo nav-fechada";
  } catch (e) { console.error(e); document.body.textContent = "Falha ao renderizar o visual."; }
  /* fórmulas: o deck original escreve TeX puro (\[ \] e \( \)); a plataforma as renderiza com KaTeX, inclusive após cada redesenho */
  function formulas() { try { if (typeof renderMathInElement === "function") renderMathInElement(document.body, { delimiters: [{ left: "\\[", right: "\\]", display: true }, { left: "\\(", right: "\\)", display: false }, { left: "$$", right: "$$", display: true }], ignoredTags: ["script", "noscript", "style", "textarea"], throwOnError: false }); } catch (e) {} }
  formulas();
  try { var fT = null; new MutationObserver(function (ms) { for (var i = 0; i < ms.length; i++) { if (ms[i].addedNodes.length) { clearTimeout(fT); fT = setTimeout(formulas, 60); break; } } }).observe(document.getElementById("palco") || document.body, { childList: true, subtree: true }); } catch (e) {}
  var last = 0;
  function report() {
    var pal = document.getElementById("palco"); var h = pal ? Math.ceil(pal.getBoundingClientRect().bottom + window.scrollY) + 8 : document.documentElement.scrollHeight;
    if (Math.abs(h - last) > 2) { last = h; parent.postMessage({ type: "legacy:height", height: h }, "*"); }
  }
  try { new ResizeObserver(report).observe(document.body); } catch (e) { setInterval(report, 800); }
  report(); parent.postMessage({ type: "legacy:ready" }, "*");
  addEventListener("message", function (e) {
    var d = e.data || {};
    if (d.type === "legacy:reveal" && typeof d.slug === "string") {
      document.querySelectorAll('.oculto[data-para="' + d.slug + '"]').forEach(function (el) { el.classList.remove("oculto"); });
      var cb = REVEALS[d.slug]; if (cb) { try { cb(d.choice); } catch (err) {} }
      report();
    }
  });
  /* impede navegação e links externos */
  addEventListener("click", function (e) { var a = e.target && e.target.closest && e.target.closest("a"); if (a) e.preventDefault(); }, true);
})();
