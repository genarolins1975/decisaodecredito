/* Desenho vetorial: eixos, séries, barras, waterfall, árvores e mapas de região.
   Tudo é gerado a partir dos dados; nenhuma figura é imagem de valor exato. */

var Graf = (function () {

  /* Um desenho com resumo é uma imagem com nome para o leitor de tela. Sem resumo, ele fica
     fora da árvore de acessibilidade: o slide já traz um resumo textual oculto do visual, e uma
     "imagem" sem nome só produziria um item vazio na leitura. */
  function acessivel(svg, resumo) {
    if (resumo) {
      svg.setAttribute("role", "img");
      svg.setAttribute("aria-label", resumo);
    } else {
      svg.setAttribute("aria-hidden", "true");
    }
    return svg;
  }

  function novo(op) {
    op = op || {};
    var w = op.w || 800, hh = op.h || 420;
    var m = Object.assign({ e: 72, d: 20, c: 16, b: 58 }, op.m || {});
    var svg = sv("svg", {
      viewBox: "0 0 " + w + " " + hh,
      width: w, height: hh,
    });
    acessivel(svg, op.resumo);
    var raiz = sv("g", {});
    svg.appendChild(raiz);

    var g = {
      svg: svg, raiz: raiz, w: w, h: hh, m: m,
      largura: w - m.e - m.d,
      altura: hh - m.c - m.b,
      dx: [0, 1], dy: [0, 1],
    };

    g.x = function (a, b) { g.dx = [a, b]; return g; };
    g.y = function (a, b) { g.dy = [a, b]; return g; };
    g.px = function (v) {
      return m.e + ((v - g.dx[0]) / (g.dx[1] - g.dx[0])) * g.largura;
    };
    g.py = function (v) {
      return m.c + g.altura - ((v - g.dy[0]) / (g.dy[1] - g.dy[0])) * g.altura;
    };
    g.add = function (el) { raiz.appendChild(el); return el; };
    g.camada = function (cls) { return g.add(sv("g", { class: cls || "" })); };

    g.moldura = function (cor) {
      g.add(sv("rect", {
        x: m.e, y: m.c, width: g.largura, height: g.altura,
        fill: "none", stroke: cor || "var(--rule)", "stroke-width": 1,
      }));
      return g;
    };

    g.grade = function (op2) {
      op2 = op2 || {};
      var cam = sv("g", { class: "grade" });
      (op2.x || []).forEach(function (v) {
        cam.appendChild(sv("line", { x1: g.px(v), x2: g.px(v), y1: m.c, y2: m.c + g.altura }));
      });
      (op2.y || []).forEach(function (v) {
        cam.appendChild(sv("line", { y1: g.py(v), y2: g.py(v), x1: m.e, x2: m.e + g.largura }));
      });
      raiz.appendChild(cam);
      return g;
    };

    g.eixoX = function (op2) {
      op2 = op2 || {};
      var cam = sv("g", { class: "eixo" });
      var y0 = op2.em !== undefined ? g.py(op2.em) : m.c + g.altura;
      cam.appendChild(sv("line", { x1: m.e, x2: m.e + g.largura, y1: y0, y2: y0 }));
      (op2.ticks || []).forEach(function (v) {
        var x = g.px(v);
        cam.appendChild(sv("line", { x1: x, x2: x, y1: y0, y2: y0 + 6 }));
        cam.appendChild(sv("text", {
          x: x, y: y0 + 26, "text-anchor": "middle",
          texto: op2.formato ? op2.formato(v) : F.dec(v, 0),
        }));
      });
      if (op2.rotulo) {
        cam.appendChild(sv("text", {
          x: m.e + g.largura / 2, y: y0 + 46, "text-anchor": "middle",
          class: "rotulo", texto: op2.rotulo,
        }));
      }
      raiz.appendChild(cam);
      return g;
    };

    g.eixoY = function (op2) {
      op2 = op2 || {};
      var cam = sv("g", { class: "eixo" });
      var x0 = op2.em !== undefined ? g.px(op2.em) : m.e;
      cam.appendChild(sv("line", { x1: x0, x2: x0, y1: m.c, y2: m.c + g.altura }));
      (op2.ticks || []).forEach(function (v) {
        var y = g.py(v);
        cam.appendChild(sv("line", { x1: x0 - 6, x2: x0, y1: y, y2: y }));
        cam.appendChild(sv("text", {
          x: x0 - 11, y: y + 6, "text-anchor": "end",
          texto: op2.formato ? op2.formato(v) : F.dec(v, 0),
        }));
      });
      if (op2.rotulo) {
        cam.appendChild(sv("text", {
          x: 15, y: m.c + g.altura / 2, "text-anchor": "middle", class: "rotulo",
          transform: "rotate(-90 15 " + (m.c + g.altura / 2) + ")", texto: op2.rotulo,
        }));
      }
      raiz.appendChild(cam);
      return g;
    };

    g.caminho = function (pts) {
      return pts.map(function (p, i) {
        return (i ? "L" : "M") + g.px(p[0]).toFixed(2) + " " + g.py(p[1]).toFixed(2);
      }).join(" ");
    };

    g.linha = function (pts, op2) {
      op2 = op2 || {};
      return g.add(sv("path", {
        class: "serie", d: g.caminho(pts), stroke: op2.cor || "var(--cor)",
        "stroke-width": op2.largura || 3,
        "stroke-dasharray": op2.tracejado || null,
        opacity: op2.opacidade || null,
        "stroke-linejoin": "round", "stroke-linecap": "round",
      }));
    };

    g.area = function (pts, base, op2) {
      op2 = op2 || {};
      var d = g.caminho(pts) + " L" + g.px(pts[pts.length - 1][0]) + " " + g.py(base) +
        " L" + g.px(pts[0][0]) + " " + g.py(base) + " Z";
      return g.add(sv("path", {
        d: d, fill: op2.cor || "var(--cor-soft)", opacity: op2.opacidade || 1, stroke: "none",
      }));
    };

    g.ponto = function (x, y, op2) {
      op2 = op2 || {};
      var el = g.add(sv("circle", {
        cx: g.px(x), cy: g.py(y), r: op2.r || 8,
        fill: op2.cor || "var(--cor)", stroke: op2.borda || "#fff", "stroke-width": op2.bordaL || 2,
      }));
      return el;
    };

    g.guia = function (x, y, op2) {
      op2 = op2 || {};
      var cam = sv("g", { class: "grade" });
      cam.appendChild(sv("line", {
        x1: g.px(x), x2: g.px(x), y1: g.py(y), y2: m.c + g.altura,
        stroke: op2.cor || "var(--muted)", "stroke-dasharray": "4 4", "stroke-width": 1.5,
      }));
      cam.appendChild(sv("line", {
        x1: m.e, x2: g.px(x), y1: g.py(y), y2: g.py(y),
        stroke: op2.cor || "var(--muted)", "stroke-dasharray": "4 4", "stroke-width": 1.5,
      }));
      raiz.appendChild(cam);
      return cam;
    };

    g.texto = function (x, y, txt, op2) {
      op2 = op2 || {};
      return g.add(sv("text", {
        x: g.px(x) + (op2.dx || 0), y: g.py(y) + (op2.dy || 0),
        "text-anchor": op2.ancora || "start",
        class: op2.classe || "marca",
        fill: op2.cor || "var(--body)",
        "font-size": op2.tamanho || 19,
        "font-weight": op2.peso || 700,
        texto: txt,
      }));
    };

    g.retangulo = function (x0, y0, x1, y1, op2) {
      op2 = op2 || {};
      var a = g.px(x0), b = g.px(x1), c = g.py(y0), d = g.py(y1);
      return g.add(sv("rect", {
        x: Math.min(a, b), y: Math.min(c, d),
        width: Math.abs(b - a), height: Math.abs(d - c),
        fill: op2.cor || "var(--cor-soft)", opacity: op2.opacidade || 1,
        stroke: op2.borda || "none", "stroke-width": op2.bordaL || 1,
      }));
    };

    g.hachura = function (id, cor) {
      var def = sv("defs", {}, [
        sv("pattern", { id: id, width: 8, height: 8, patternUnits: "userSpaceOnUse",
                        patternTransform: "rotate(45)" }, [
          sv("rect", { width: 8, height: 8, fill: "#fff", opacity: .55 }),
          sv("line", { x1: 0, y1: 0, x2: 0, y2: 8, stroke: cor || "var(--alert)",
                       "stroke-width": 3, opacity: .38 }),
        ]),
      ]);
      raiz.appendChild(def);
      return "url(#" + id + ")";
    };

    return g;
  }

  /* -------------------------------------------------------------- waterfall */

  /* itens: [{rotulo, valor, cor, detalhe}]; base é o ponto de partida do escore. */
  function waterfall(op) {
    var itens = op.itens, base = op.base;
    var w = op.w || 860, hh = op.h || 380;
    var larguraRot = op.larguraRot || 210;
    var g = novo({ w: w, h: hh, m: { e: larguraRot, d: 96, c: 10, b: 44 } });
    var acumulado = base, min = base, max = base, passos = [];
    itens.forEach(function (it) {
      var de = acumulado;
      acumulado += it.valor;
      passos.push({ de: de, para: acumulado, item: it });
      min = Math.min(min, de, acumulado);
      max = Math.max(max, de, acumulado);
    });
    var folga = Math.max(0.35, (max - min) * 0.18);
    g.x(min - folga, max + folga);
    var n = itens.length + 2;
    g.y(0, n);

    var ticks = op.ticks || ticksAuto(min - folga, max + folga, 6);
    g.grade({ x: ticks });
    g.eixoX({ ticks: ticks, rotulo: op.rotuloX || "contribuição no escore z",
              formato: function (v) { return F.dec(v, 1); } });

    function faixa(i) { return n - 1 - i; }

    // linha do ponto de partida
    g.add(sv("line", {
      x1: g.px(base), x2: g.px(base), y1: g.py(n), y2: g.py(0),
      stroke: "var(--muted)", "stroke-dasharray": "5 5", "stroke-width": 1.5,
    }));
    g.texto(base, n - 0.2, op.rotuloBase || "partida", { dy: -4, dx: 0, ancora: "middle",
      cor: "var(--muted)", tamanho: 17, peso: 400 });

    var alturaBarra = (g.altura / n) * 0.62;
    passos.forEach(function (p, i) {
      var y = faixa(i + 1);
      var x0 = Math.min(p.de, p.para), x1 = Math.max(p.de, p.para);
      var cor = p.item.cor || (p.item.valor >= 0 ? "var(--alert)" : "var(--ok)");
      var visivel = op.visiveis === undefined || i < op.visiveis;
      if (!visivel) cor = "var(--rule)";
      var yc = g.py(y + 0.5);
      g.add(sv("rect", {
        x: g.px(x0), y: yc - alturaBarra / 2,
        width: Math.max(2, g.px(x1) - g.px(x0)), height: alturaBarra,
        fill: cor, opacity: visivel ? 1 : .35, rx: 2,
      }));
      g.add(sv("text", {
        x: g.m.e - 12, y: yc + 6, "text-anchor": "end", "font-size": 20,
        fill: visivel ? "var(--body)" : "var(--muted)", texto: p.item.rotulo,
      }));
      g.add(sv("text", {
        x: g.m.e + g.largura + 12, y: yc + 6, "font-size": 20, "font-weight": 700,
        fill: visivel ? "var(--ink)" : "var(--muted)",
        texto: visivel ? F.sinal(p.item.valor, 3) : "",
      }));
      if (i < passos.length - 1 && visivel) {
        g.add(sv("line", {
          x1: g.px(p.para), x2: g.px(p.para), y1: yc + alturaBarra / 2,
          y2: g.py(faixa(i + 2) + 0.5) - alturaBarra / 2,
          stroke: "var(--muted)", "stroke-width": 1, "stroke-dasharray": "3 3",
        }));
      }
    });

    // total
    var yt = g.py(faixa(itens.length + 1) + 0.5);
    var mostraTotal = op.visiveis === undefined || op.visiveis >= itens.length;
    g.add(sv("line", {
      x1: g.m.e, x2: g.m.e + g.largura, y1: yt + alturaBarra / 2 + 4,
      y2: yt + alturaBarra / 2 + 4, stroke: "var(--rule)", "stroke-width": 1,
    }));
    if (mostraTotal) {
      g.add(sv("rect", {
        x: g.px(Math.min(base, acumulado)), y: yt - alturaBarra / 2,
        width: Math.max(2, Math.abs(g.px(acumulado) - g.px(base))), height: alturaBarra,
        fill: "var(--ink)", rx: 2, opacity: .15,
      }));
      g.add(sv("circle", { cx: g.px(acumulado), cy: yt, r: 9, fill: "var(--ink)" }));
      g.add(sv("text", {
        x: g.m.e - 12, y: yt + 6, "text-anchor": "end", "font-size": 20,
        "font-weight": 700, fill: "var(--ink)", texto: op.rotuloTotal || "escore z",
      }));
      g.add(sv("text", {
        x: g.m.e + g.largura + 12, y: yt + 6, "font-size": 22, "font-weight": 700,
        fill: "var(--ink)", texto: F.dec(acumulado, 3),
      }));
    }
    g.total = acumulado;
    return g;
  }

  /* Quebra um rótulo em no máximo duas linhas de até max caracteres. */
  /* Quebra gulosa em quantas linhas forem necessárias. Uma palavra maior que o
     limite fica sozinha na linha: não há separação silábica, porque a casa não
     usa hífen. */
  function quebrar(texto, max) {
    texto = String(texto || "");
    if (texto.length <= max) return [texto];
    var linhas = [], atual = "";
    texto.split(" ").forEach(function (p) {
      if (!atual) { atual = p; return; }
      if ((atual + " " + p).length <= max) atual = atual + " " + p;
      else { linhas.push(atual); atual = p; }
    });
    if (atual) linhas.push(atual);
    return linhas.length ? linhas : [texto];
  }

  function ticksAuto(a, b, alvo) {
    var bruto = (b - a) / (alvo || 6);
    var mag = Math.pow(10, Math.floor(Math.log10(Math.abs(bruto) || 1)));
    var passo = mag;
    [1, 2, 2.5, 5, 10].some(function (k) {
      if (mag * k >= bruto) { passo = mag * k; return true; }
      return false;
    });
    var ini = Math.ceil(a / passo) * passo;
    var v = [];
    for (var x = ini; x <= b + 1e-9; x += passo) v.push(Math.round(x / passo) * passo);
    return v;
  }

  /* ------------------------------------------------------------- barras */

  /* itens: [{rotulo, valor, cor, texto}] horizontais */
  function barras(op) {
    var itens = op.itens;
    var w = op.w || 600, hh = op.h || 300;
    var g = novo({ w: w, h: hh, m: Object.assign({ e: op.larguraRot || 150, d: 80, c: 10, b: 42 }, op.m || {}) });
    var max = op.max !== undefined ? op.max : Math.max.apply(null, itens.map(function (i) { return i.valor; })) * 1.1;
    var min = op.min !== undefined ? op.min : 0;
    g.x(min, max).y(0, itens.length);
    var ticks = op.ticks || ticksAuto(min, max, 5);
    g.grade({ x: ticks });
    g.eixoX({ ticks: ticks, rotulo: op.rotuloX, formato: op.formato });
    var alt = (g.altura / itens.length) * 0.6;
    /* A base das barras é o zero quando ele pertence ao domínio; caso contrário,
       é a borda do domínio, para a barra nunca começar fora do gráfico. */
    var base = Math.min(Math.max(0, min), max);
    itens.forEach(function (it, i) {
      var yc = g.py(itens.length - i - 0.5);
      var x0 = g.px(base);
      var x1 = g.px(M.clamp(it.valor, min, max));
      g.add(sv("rect", {
        x: Math.min(x0, x1), y: yc - alt / 2, width: Math.max(2, Math.abs(x1 - x0)),
        height: alt, fill: it.cor || "var(--cor)", rx: 2, opacity: it.opacidade || 1,
      }));
      /* Rótulo mais largo que a coluna reservada quebra em até duas linhas; antes ele saía pela
         esquerda do desenho e era cortado. */
      var tam = op.tamanhoRot || 20;
      var linhasRot = quebrar(String(it.rotulo), Math.max(6, Math.floor((g.m.e - 16) / (tam * 0.6)))).slice(0, 2);
      linhasRot.forEach(function (t, k) {
        g.add(sv("text", {
          x: g.m.e - 12, y: yc + 6 + (k - (linhasRot.length - 1) / 2) * (tam + 2),
          "text-anchor": "end", "font-size": tam, texto: t,
        }));
      });
      g.add(sv("text", {
        x: Math.max(x0, x1) + 10, y: yc + 6, "font-size": op.tamanhoRot || 20,
        "font-weight": 700, fill: "var(--ink)",
        texto: it.texto !== undefined ? it.texto : (op.formato ? op.formato(it.valor) : F.dec(it.valor, 2)),
      }));
    });
    return g;
  }

  /* --------------------------------------------------------------- árvore */

  /* no: {rotulo, detalhe, cor, filhos:[{aresta, no}], destaque} */
  function arvore(op) {
    var raizNo = op.no;
    var w = op.w || 900, hh = op.h || 420;
    var larguraCaixa = op.caixaW || 150, alturaCaixa = op.caixaH || 62;
    var svg = sv("svg", { viewBox: "0 0 " + w + " " + hh, width: w, height: hh });
    acessivel(svg, op.resumo);
    var arestas = sv("g", {});
    var caixas = sv("g", {});
    svg.appendChild(arestas);
    svg.appendChild(caixas);

    var niveis = [];
    (function contar(no, d) {
      niveis[d] = (niveis[d] || 0) + 1;
      (no.filhos || []).forEach(function (f) { contar(f.no, d + 1); });
    })(raizNo, 0);
    /* Num nível cheio (oito folhas em 900 unidades) a caixa encolhe até caber lado a lado e o
       rótulo quebra na largura que sobrou; sem isso as caixas se sobrepunham e a da ponta saía
       do desenho. Nos níveis com folga a caixa mantém a largura pedida. */
    var larguraNivel = niveis.map(function (n) {
      return Math.max(60, Math.min(larguraCaixa, Math.floor((w - 44) / n) - 8));
    });
    /* Cada caixa cresce conforme as linhas que couberem na largura do nível, e cada
       nível recebe a altura da sua caixa mais alta. Sem isso, um rótulo longo
       empurra o texto para fora da caixa e o rótulo do ramo cai sobre o filho. */
    function linhasDe(no, d) {
      var maxChars = Math.max(6, Math.floor((larguraNivel[d] - 16) / 10.4));
      var l = quebrar(no.rotulo, maxChars).map(function (t) {
        return { texto: t, principal: true };
      });
      if (no.detalhe) l.push({ texto: no.detalhe });
      if (no.detalhe2) l.push({ texto: no.detalhe2 });
      return l;
    }

    var alturaNivel = [];
    (function medir(no, d) {
      no._linhas = linhasDe(no, d);
      no._altura = Math.max(alturaCaixa, no._linhas.length * 21 + 14);
      alturaNivel[d] = Math.max(alturaNivel[d] || 0, no._altura);
      (no.filhos || []).forEach(function (f) { medir(f.no, d + 1); });
    })(raizNo, 0);
    var prof = niveis.length;
    var somaAlturas = alturaNivel.reduce(function (a, b) { return a + b; }, 0);
    var espaco = prof > 1
      ? Math.max(30, (hh - 26 - somaAlturas) / (prof - 1)) : 0;
    var topoNivel = [];
    alturaNivel.reduce(function (acc, a, i) {
      topoNivel[i] = acc;
      return acc + a + espaco;
    }, 14);

    var contador = [];
    (function posicionar(no, d) {
      contador[d] = contador[d] || 0;
      if (!no.filhos || !no.filhos.length) {
        no._x = (contador[d]++ + 0.5) / niveis[d];
      } else {
        no.filhos.forEach(function (f) { posicionar(f.no, d + 1); });
        var xs = no.filhos.map(function (f) { return f.no._x; });
        no._x = (Math.min.apply(null, xs) + Math.max.apply(null, xs)) / 2;
        contador[d]++;
      }
      no._y = topoNivel[d];
    })(raizNo, 0);

    function cx(no) { return 22 + no._x * (w - 44); }

    (function desenhar(no, d) {
      var x = cx(no), y = no._y, base = y + no._altura;
      (no.filhos || []).forEach(function (f) {
        var fx = cx(f.no), fy = f.no._y, vao = fy - base;
        arestas.appendChild(sv("path", {
          d: "M" + x + " " + base + " C" + x + " " + (base + vao / 2) +
             ", " + fx + " " + (fy - vao / 2) + ", " + fx + " " + fy,
          fill: "none",
          stroke: f.destaque ? "var(--cor)" : "var(--rule)",
          "stroke-width": f.destaque ? 4 : 2,
        }));
        var mx = x + (fx - x) * 0.74, my = base + vao * 0.52;
        var larg = String(f.aresta).length * 9.5 + 14;
        arestas.appendChild(sv("rect", {
          x: mx - larg / 2, y: my - 17, width: larg, height: 25, rx: 3,
          fill: "var(--ground)", stroke: f.destaque ? "var(--cor)" : "var(--rule)",
        }));
        arestas.appendChild(sv("text", {
          x: mx, y: my, "text-anchor": "middle", "font-size": 18,
          "font-weight": f.destaque ? 700 : 400,
          fill: f.destaque ? "var(--cor)" : "var(--muted)", texto: f.aresta,
        }));
        desenhar(f.no, d + 1);
      });

      var folha = !no.filhos || !no.filhos.length;
      var cor = no.destaque ? "var(--cor)" : "var(--rule)";
      var altura = no._altura;
      var larguraDesta = larguraNivel[d];
      caixas.appendChild(sv("rect", {
        x: x - larguraDesta / 2, y: y, width: larguraDesta, height: altura, rx: 5,
        fill: no.destaque ? "var(--cor-soft)" : (folha ? "var(--surface)" : "var(--paper)"),
        stroke: cor, "stroke-width": no.destaque ? 3 : 1.5,
      }));
      var linhas = no._linhas;
      var topo = y + (altura - linhas.length * 21) / 2 + 16;
      linhas.forEach(function (t, i) {
        caixas.appendChild(sv("text", {
          x: x, y: topo + i * 21, "text-anchor": "middle",
          "font-size": t.principal ? 19 : 17,
          "font-weight": t.principal ? 700 : 400,
          fill: t.principal ? "var(--ink)" : "var(--muted)",
          texto: t.texto,
        }));
      });
      if (no.valor !== undefined) {
        caixas.appendChild(sv("text", {
          x: x, y: y + altura + 22, "text-anchor": "middle", "font-size": 21,
          "font-weight": 700, fill: no.destaque ? "var(--cor)" : "var(--ink)", texto: no.valor,
        }));
      }
    })(raizNo, 0);

    return svg;
  }

  /* Afasta rótulos que cairiam uns sobre os outros: recebe posições verticais em pixels do
     desenho e devolve as mesmas posições com um espaçamento mínimo entre vizinhos, preservando
     a ordem original. Usado onde várias curvas terminam quase no mesmo ponto. */
  function espalhar(ys, gap) {
    var ordem = ys.map(function (y, i) { return { y: y, i: i }; })
      .sort(function (a, b) { return a.y - b.y; });
    for (var k = 1; k < ordem.length; k++) {
      if (ordem[k].y < ordem[k - 1].y + gap) ordem[k].y = ordem[k - 1].y + gap;
    }
    var out = ys.slice();
    ordem.forEach(function (o) { out[o.i] = o.y; });
    return out;
  }

  return { novo: novo, waterfall: waterfall, barras: barras, arvore: arvore, ticks: ticksAuto,
           acessivel: acessivel, espalhar: espalhar };
})();
