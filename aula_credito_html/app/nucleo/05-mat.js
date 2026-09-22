/* Matemática renderizada.
   Toda expressão da aula passa por aqui, para que o aluno veja notação, não código: expoente em
   cima, índice embaixo, fração com barra horizontal. O KaTeX vai embutido no pacote, com as fontes
   em base64, então a renderização é a mesma por HTTP e por file://, na tela e na impressão.
   A saída é htmlAndMathml: o MathML fica para o leitor de tela e a parte visual recebe aria-hidden.

   Convenção de símbolos da aula, definida uma vez e usada em todos os slides:
     z        escore em log odds            p      PD estimada
     y        desfecho observado, 0 ou 1    b0,bj  intercepto e coeficientes
     xj       característica j              L      perda de um contrato
     eta      taxa de aprendizagem          Fm     escore acumulado após m árvores
     hm       árvore m                      EL     perda esperada
   Número em português usa vírgula decimal; em modo matemático a vírgula é pontuação e ganharia
   espaço depois, então `Mat.n` a protege com chaves. */
var Mat = (function () {
  var pronto = typeof katex !== "undefined";

  function render(tex, bloco, classe) {
    var el = document.createElement(bloco ? "div" : "span");
    el.className = "mat" + (bloco ? " mat-bloco" : "") + (classe ? " " + classe : "");
    if (!pronto) { el.textContent = tex; return el; }
    try {
      katex.render(tex, el, {
        displayMode: !!bloco, throwOnError: false, output: "htmlAndMathml",
        strict: "ignore", trust: false, minRuleThickness: 0.06,
      });
    } catch (e) {
      el.textContent = tex;
      if (window.console) console.error("LaTeX inválido: " + tex, e);
    }
    return el;
  }

  /** Número em notação da aula, pronto para entrar numa expressão: vírgula protegida e menos real. */
  function n(x, casas) {
    var s = F.dec(x, casas);
    if (s === "indisponível") return "\\text{indisponível}";
    return s.replace(/−/g, "-").replace(/\./g, "{.}").replace(/,/g, "{,}");
  }
  function pct(p, casas) { return n(p * 100, casas === undefined ? 2 : casas) + "\\%"; }
  /** Inteiro com separador de milhar, protegido para não virar pontuação em modo matemático. */
  function int(x) { return F.inteiro(x).replace(/\./g, "{.}"); }
  /** Texto corrido dentro de uma expressão, com espaços preservados. Em modo texto o KaTeX ainda lê
      `%` como comentário e `#`, `&` e `_` como comandos: um rótulo como "comp ≤ 40%" derrubaria a
      expressão inteira, então esses caracteres saem escapados. O sinal de menos vira matemática. */
  function t(s) {
    var txt = String(s).replace(/[%#&_]/g, function (c) { return "\\" + c; }).replace(/−/g, "$-$");
    return "\\text{" + txt + "}";
  }

  return {
    /** Expressão no meio de uma frase. */
    i: function (tex, classe) { return render(tex, false, classe); },
    /** Expressão destacada, centralizada, própria para projeção. */
    b: function (tex, classe) { return render(tex, true, classe); },
    /** Sequência de passos alinhados pelo sinal de igual, um por linha. */
    passos: function (linhas, classe) {
      return render("\\begin{aligned}" + linhas.join(" \\\\[2pt] ") + "\\end{aligned}", true, classe);
    },
    n: n,
    pct: pct,
    int: int,
    t: t,
    disponivel: function () { return pronto; },
  };
})();
