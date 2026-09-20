/* Dados canônicos da aula. Quatro universos separados e identificados:
   exemplo manual de logit, árvore de 1.000 contratos, miniatura de boosting de
   10 registros e experimento sintético treinado (este último em 11-resultados.js).
   Nenhum destes números descreve uma carteira real. */

(function () {
  var D = Aula.dados;

  D.fontes = {
    manual: "Exemplo didático de logit; cálculo próprio",
    arvore: "Árvore didática de 1.000 contratos; cálculo próprio",
    boosting: "Miniatura didática de 10 registros; cálculo próprio",
    experimento: "Experimento sintético; semente e versões no notebook",
    auxiliar: "Experimento auxiliar de duas variáveis; cálculo próprio",
    conceito: "Esquema conceitual; sem dados",
    economia: "Economia didática declarada na tela; cálculo próprio",
  };

  /* --------------------------------------------------------- perfis fixos */

  D.clientes = [
    { nome: "Ana", renda: 7000, comp: 22, rel: 36, util: 30, hist: 0, canal: "Agência" },
    { nome: "Bruno", renda: 4500, comp: 38, rel: 8, util: 65, hist: 1, canal: "Digital" },
    { nome: "Carla", renda: 10000, comp: 48, rel: 60, util: 85, hist: 0, canal: "Digital" },
    { nome: "Diego", renda: 3500, comp: 55, rel: 4, util: 90, hist: 1, canal: "Parceiro" },
  ];

  D.cliente = function (nome) {
    return D.clientes.filter(function (c) { return c.nome === nome; })[0];
  };
  D.copia = function (c) { return JSON.parse(JSON.stringify(c)); };

  D.dicionario = [
    { campo: "renda", nome: "Renda", unidade: "R$ por mês",
      descricao: "Renda verificada na proposta.",
      disponibilidade: "Conhecida até a decisão." },
    { campo: "comp", nome: "Comprometimento", unidade: "%",
      descricao: "Parcela mensal total, já incluindo a operação proposta, dividida pela renda verificada.",
      disponibilidade: "Calculável no momento da decisão." },
    { campo: "rel", nome: "Relacionamento", unidade: "meses",
      descricao: "Meses completos de relacionamento com a instituição.",
      disponibilidade: "Conhecido até a decisão." },
    { campo: "util", nome: "Utilização", unidade: "%",
      descricao: "Uso dos limites já existentes.",
      disponibilidade: "Último dado disponível até a decisão." },
    { campo: "hist", nome: "Histórico", unidade: "0 ou 1",
      descricao: "Houve atraso de 15 a 89 dias nos 12 meses anteriores. Não é inadimplência corrente.",
      disponibilidade: "Histórico conhecido na decisão." },
    { campo: "canal", nome: "Canal", unidade: "categoria",
      descricao: "Agência, digital ou parceiro. Variável preditiva, sem leitura causal.",
      disponibilidade: "Registrado na proposta." },
  ];

  D.alvo = {
    evento: "atraso superior a 90 dias em qualquer momento dos 12 meses seguintes à contratação",
    horizonte: 12,
    unidade: "contrato de crédito pessoal, um cliente por registro",
    populacao: "solicitantes elegíveis, sem inadimplência corrente na data da proposta",
  };

  /* ------------------------------------------------------- logit manual */

  var L = {
    intercepto: -3.50,
    termos: [
      { campo: "comp", nome: "Comprometimento", beta: 0.04, centro: 30, unidade: "p.p." },
      { campo: "hist", nome: "Histórico de atraso", beta: 0.80, centro: 0, unidade: "indicador" },
      { campo: "rel", nome: "Relacionamento", beta: -0.02, centro: 12, unidade: "mês" },
      { campo: "util", nome: "Utilização", beta: 0.01, centro: 40, unidade: "p.p." },
      { campo: "renda", nome: "Renda", beta: -0.00005, centro: 5000, unidade: "R$" },
    ],
  };

  L.contribuicoes = function (c) {
    return L.termos.map(function (t) {
      var dx = c[t.campo] - t.centro;
      return {
        campo: t.campo, nome: t.nome, beta: t.beta, centro: t.centro,
        valor: c[t.campo], desvio: dx, contribuicao: t.beta * dx,
        conta: F.dec(t.beta, t.campo === "renda" ? 5 : 2) + " × (" +
               F.dec(c[t.campo], 0) + " " + F.MENOS + " " + F.dec(t.centro, 0) + ") = " +
               F.dec(t.beta * dx, 3),
      };
    });
  };
  L.z = function (c) {
    return L.contribuicoes(c).reduce(function (a, t) { return a + t.contribuicao; }, L.intercepto);
  };
  L.pd = function (c) { return M.sigmoid(L.z(c)); };
  L.referencia = { renda: 5000, comp: 30, rel: 12, util: 40, hist: 0, canal: "Agência" };
  D.logit = L;

  /* ------------------------------------------- árvore didática de 1.000 */

  function folha(regra, n, d, rotulo) {
    return { tipo: "folha", regra: regra, n: n, d: d, pd: d / n, rotulo: rotulo };
  }

  var A = {
    n: 1000, d: 100,
    raiz: {
      pergunta: "Houve atraso de 15 a 89 dias?",
      campo: "hist",
      teste: function (c) { return c.hist === 0; },
      rotuloEsq: "não (hist = 0)",
      rotuloDir: "sim (hist = 1)",
      esq: {
        pergunta: "Comprometimento acima de 40%?",
        campo: "comp",
        teste: function (c) { return c.comp <= 40; },
        rotuloEsq: "não (comp ≤ 40%)",
        rotuloDir: "sim (comp > 40%)",
        n: 800, d: 40,
        esq: folha("hist = 0 e comp ≤ 40%", 600, 18),
        dir: folha("hist = 0 e comp > 40%", 200, 22),
      },
      dir: {
        pergunta: "Comprometimento acima de 40%?",
        campo: "comp",
        teste: function (c) { return c.comp <= 40; },
        rotuloEsq: "não (comp ≤ 40%)",
        rotuloDir: "sim (comp > 40%)",
        n: 200, d: 60,
        esq: folha("hist = 1 e comp ≤ 40%", 80, 12),
        dir: folha("hist = 1 e comp > 40%", 120, 48),
      },
    },
  };

  /* n e d dos nós internos conferidos a partir das folhas. */
  (function somar(no) {
    if (no.tipo === "folha") return { n: no.n, d: no.d };
    var e = somar(no.esq), dd = somar(no.dir);
    no.n = e.n + dd.n; no.d = e.d + dd.d; no.pd = no.d / no.n;
    return { n: no.n, d: no.d };
  })(A.raiz);
  A.raiz.pd = A.raiz.d / A.raiz.n;

  A.percurso = function (c) {
    var no = A.raiz, caminho = [];
    while (no.tipo !== "folha") {
      var esq = no.teste(c);
      caminho.push({ no: no, esq: esq, rotulo: esq ? no.rotuloEsq : no.rotuloDir });
      no = esq ? no.esq : no.dir;
    }
    caminho.push({ no: no, folha: true });
    return caminho;
  };
  A.folhaDe = function (c) {
    var p = A.percurso(c);
    return p[p.length - 1].no;
  };
  A.folhas = function () {
    var out = [];
    (function anda(no) {
      if (no.tipo === "folha") { out.push(no); return; }
      anda(no.esq); anda(no.dir);
    })(A.raiz);
    return out;
  };

  /* Candidatos comparados no slide 23: mesmas 1.000 observações da raiz. */
  A.candidatos = [
    { chave: "hist", rotulo: "Histórico de atraso",
      esq: { rotulo: "hist = 0", n: 800, d: 40 }, dir: { rotulo: "hist = 1", n: 200, d: 60 } },
    { chave: "comp", rotulo: "Comprometimento até 40%",
      esq: { rotulo: "comp ≤ 40%", n: 680, d: 30 }, dir: { rotulo: "comp > 40%", n: 320, d: 70 } },
  ];
  A.ganho = function (cand) {
    var pai = M.gini(A.n ? A.d / A.n : 0);
    var ge = M.gini(cand.esq.d / cand.esq.n);
    var gd = M.gini(cand.dir.d / cand.dir.n);
    var we = cand.esq.n / A.n, wd = cand.dir.n / A.n;
    var pond = we * ge + wd * gd;
    return { pai: pai, esq: ge, dir: gd, pesoEsq: we, pesoDir: wd, ponderado: pond, ganho: pai - pond };
  };
  D.arvore = A;

  /* ------------------------------------- miniatura de boosting, 10 registros */

  var B = {
    registros: [
      { id: 1, grupo: "A", comp: 30, y: 0 }, { id: 2, grupo: "A", comp: 30, y: 0 },
      { id: 3, grupo: "A", comp: 30, y: 0 }, { id: 4, grupo: "A", comp: 30, y: 0 },
      { id: 5, grupo: "A", comp: 30, y: 0 },
      { id: 6, grupo: "B", comp: 50, y: 0 }, { id: 7, grupo: "B", comp: 50, y: 0 },
      { id: 8, grupo: "B", comp: 50, y: 0 }, { id: 9, grupo: "B", comp: 50, y: 1 },
      { id: 10, grupo: "B", comp: 50, y: 1 },
    ],
    corte: 40,
    p0: 0.2,
  };
  B.taxaObservada = M.media(B.registros.map(function (r) { return r.y; }));

  /* Duas iterações de descida por gradiente funcional de primeira ordem:
     folha recebe a média dos gradientes negativos r = y − p, com passo eta. */
  B.rodar = function (iteracoes, eta, p0) {
    eta = eta === undefined ? 1 : eta;
    p0 = p0 === undefined ? B.p0 : p0;
    var F0 = Math.log(p0 / (1 - p0));
    var estado = B.registros.map(function (r) {
      return { reg: r, F: F0, p: p0 };
    });
    var hist = [{
      iteracao: 0, F0: F0,
      grupos: { A: { F: F0, p: p0, h: null }, B: { F: F0, p: p0, h: null } },
      linhas: estado.map(function (e) {
        return { id: e.reg.id, grupo: e.reg.grupo, y: e.reg.y, p: e.p, r: null, F: e.F };
      }),
      perda: M.media(estado.map(function (e) { return M.logLoss(e.reg.y, e.p); })),
    }];
    for (var m = 1; m <= iteracoes; m++) {
      var res = estado.map(function (e) { return e.reg.y - e.p; });
      var mediaA = M.media(estado.filter(function (e, i) { return e.reg.comp <= B.corte; })
        .map(function (e) { return e.reg.y - e.p; }));
      var mediaB = M.media(estado.filter(function (e) { return e.reg.comp > B.corte; })
        .map(function (e) { return e.reg.y - e.p; }));
      var linhas = estado.map(function (e, i) {
        return { id: e.reg.id, grupo: e.reg.grupo, y: e.reg.y, p: e.p, r: res[i],
                 h: e.reg.comp <= B.corte ? mediaA : mediaB };
      });
      estado = estado.map(function (e, i) {
        var hm = e.reg.comp <= B.corte ? mediaA : mediaB;
        var Fn = e.F + eta * hm;
        return { reg: e.reg, F: Fn, p: M.sigmoid(Fn) };
      });
      linhas.forEach(function (l, i) { l.F = estado[i].F; l.pNovo = estado[i].p; });
      hist.push({
        iteracao: m, eta: eta,
        grupos: {
          A: { h: mediaA, F: estado[0].F, p: estado[0].p },
          B: { h: mediaB, F: estado[9].F, p: estado[9].p },
        },
        linhas: linhas,
        perda: M.media(estado.map(function (e) { return M.logLoss(e.reg.y, e.p); })),
      });
    }
    return hist;
  };
  B.perdaConstante = function (p) {
    return M.media(B.registros.map(function (r) { return M.logLoss(r.y, p); }));
  };
  D.boosting = B;

  /* ------------------------------------------------------ economia didática */

  D.economia = {
    margem: 1200, lgd: 0.60, ead: 10000,
    perdaEsperada: function (p, e) {
      e = e || D.economia;
      return p * e.lgd * e.ead;
    },
    resultado: function (p, e) {
      e = e || D.economia;
      return e.margem - p * e.lgd * e.ead;
    },
    equilibrio: function (e) {
      e = e || D.economia;
      return e.margem / (e.lgd * e.ead);
    },
  };

  /* --------------------------------------------------------- nomes de bloco */

  D.blocos = {
    problema: "O problema de crédito",
    logit: "Regressão logística",
    arvore: "Árvore de decisão",
    boosting: "Gradient boosting",
    decisao: "Avaliação e decisão",
  };

  D.modelos = {
    logit: { nome: "Logit regularizado", cor: "var(--logit)", chave: "logit" },
    arvore: { nome: "Árvore controlada", cor: "var(--arvore)", chave: "arvore" },
    boosting: { nome: "Gradient boosting", cor: "var(--boost)", chave: "boosting" },
    logit_flex: { nome: "Logit flexível (sensibilidade)", cor: "var(--ink-soft)", chave: "logit_flex" },
  };
})();
