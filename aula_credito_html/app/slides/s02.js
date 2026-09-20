Aula.slide({
  id: "02",
  bloco: "problema",
  titulo: "O que sabemos no momento da proposta?",
  subtitulo: "Seis características por cliente, com unidade e momento de observação",
  conclusao: "Cada variável descreve uma dimensão do risco. Nenhuma decide sozinha.",
  fonte: Aula.dados.fontes.conceito,
  resumo: "Tabela de quatro clientes por seis características, com ficha ampliada do cliente selecionado.",
  notas: {
    conducao: [
      "Compare primeiro a renda de Carla e a de Bruno. Depois revele comprometimento e utilização.",
      "Contraste relacionamento e histórico por último.",
      "Pergunte: qual combinação parece mais informativa que uma variável isolada? Aceite hipóteses diferentes.",
    ],
    cuidados: [
      "Canal não é efeito causal nem evidência de qualidade moral. Uma variável útil para previsão pode refletir seleção.",
      "Comprometimento é a parcela total mensal já incluindo a nova operação, dividida pela renda verificada.",
      "Histórico registra atraso de 15 a 89 dias no passado. Não é inadimplência corrente.",
      "As unidades serão preservadas em toda a aula, especialmente percentual contra fração.",
    ],
    transicao: "Conhecer os atributos não basta: o que significa exatamente risco nesta aula?",
  },

  montar: function (corpo, ctx) {
    var D = Aula.dados;
    var est = ctx.estado;
    if (!est.sel) est.sel = "Ana";
    if (!est.coluna) est.coluna = null;
    if (est.comparar === undefined) est.comparar = false;

    var cliente = D.cliente(est.sel);

    var tabela = Comum.tabelaClientes({ selecionado: est.sel });
    // Nome clicável realça a linha; cabeçalho abre a explicação da coluna.
    [].forEach.call(tabela.querySelectorAll("tbody tr"), function (tr, i) {
      var nome = D.clientes[i].nome;
      var celula = tr.firstChild;
      var b = h("button", { class: "btn fantasma min", type: "button",
        estilo: "padding:0;text-decoration:none;font-size:21px",
        onclick: function () { est.sel = nome; App.montar("02"); } }, nome);
      limpar(celula).appendChild(b);
    });
    [].forEach.call(tabela.querySelectorAll("thead th"), function (th, j) {
      if (j === 0) return;
      var campo = D.dicionario[j - 1];
      var b = h("button", { class: "btn fantasma min", type: "button",
        estilo: "padding:0;text-align:right;font:inherit;color:inherit;text-decoration:none",
        onclick: function () { est.coluna = campo.campo; App.montar("02"); } },
        [campo.nome, h("br"), h("span", { estilo: "font-weight:400;text-transform:none" }, campo.unidade)]);
      limpar(th).appendChild(b);
      th.classList.toggle("sel", est.coluna === campo.campo);
      if (est.coluna === campo.campo) th.setAttribute("style", "background:var(--cor-soft)");
    });
    if (est.coluna) {
      var j = D.dicionario.map(function (d) { return d.campo; }).indexOf(est.coluna) + 1;
      [].forEach.call(tabela.querySelectorAll("tbody tr"), function (tr) {
        tr.children[j].setAttribute("style", "background:var(--cor-soft);font-weight:700");
      });
    }

    var explicacao = h("div", { class: "painel cor" });
    if (est.coluna) {
      var d = D.dicionario.filter(function (x) { return x.campo === est.coluna; })[0];
      explicacao.appendChild(h("h3", { class: "secao" }, d.nome + " (" + d.unidade + ")"));
      explicacao.appendChild(h("p", { class: "apoio" }, d.descricao));
      explicacao.appendChild(h("p", { class: "nota" }, d.disponibilidade));
    } else {
      explicacao.appendChild(h("h3", { class: "secao" }, "Dicionário"));
      explicacao.appendChild(h("p", { class: "apoio" },
        "Selecione um cabeçalho para ver unidade, definição e momento de observação da variável."));
    }

    var direita;
    if (est.comparar) {
      var a = D.cliente(est.parA || "Carla"), b2 = D.cliente(est.parB || "Bruno");
      var campos = ["renda", "comp", "rel", "util", "hist", "canal"];
      var linhas = campos.map(function (k) {
        var dd = D.dicionario.filter(function (x) { return x.campo === k; })[0];
        function fmt(c) {
          if (k === "renda") return F.inteiro(c.renda);
          if (k === "hist") return c.hist ? "sim" : "não";
          if (k === "canal") return c.canal;
          return F.dec(c[k], 0);
        }
        var dif = (k === "canal" || k === "hist")
          ? (a[k] === b2[k] ? "igual" : "diferente")
          : F.sinal(a[k] - b2[k], 0);
        return [dd.nome + " (" + dd.unidade + ")", fmt(a), fmt(b2), dif];
      });
      direita = h("div", { class: "coluna" }, [
        h("div", { class: "painel" }, [
          h("h3", { class: "secao" }, "Comparar dois clientes"),
          h("div", { class: "grupo" }, [
            Comum.seletorCliente(a.nome, function (v) { est.parA = v; App.montar("02"); }, { compacto: true }),
            h("span", { class: "apoio" }, "contra"),
            Comum.seletorCliente(b2.nome, function (v) { est.parB = v; App.montar("02"); }, { compacto: true }),
          ]),
          UI.tabela({
            compacta: true,
            colunas: [{ rotulo: "Característica" }, { rotulo: a.nome }, { rotulo: b2.nome },
                      { rotulo: "Diferença" }],
            linhas: linhas,
            legenda: "Comparação de dois perfis, valores originais lado a lado",
          }),
          h("p", { class: "nota" },
            "A comparação mostra os valores originais. Não gera escore, peso ou ranking."),
        ]),
      ]);
    } else {
      direita = h("div", { class: "coluna" }, [
        Comum.ficha(cliente, { cor: true, rodape: "Perfil fictício, elegível, sem desfecho revelado." }),
        explicacao,
      ]);
    }

    corpo.appendChild(h("div", { class: "linha topo cresce" }, [
      h("div", { class: "coluna cresce" }, [
        h("div", { class: "painel claro" }, tabela),
        h("div", { class: "grupo" }, [
          UI.alterna({
            rotulo: "Comparar dois clientes", valor: est.comparar,
            ligadoRotulo: "Voltar à ficha individual",
            desligadoRotulo: "Comparar dois clientes",
            aoMudar: function (v) { est.comparar = v; App.montar("02"); },
          }),
          h("button", { class: "btn fantasma", type: "button", onclick: ctx.reiniciar },
            "Reiniciar exemplo"),
        ]),
      ]),
      h("div", { estilo: "flex:0 0 470px" }, direita),
    ]));
  },
});
