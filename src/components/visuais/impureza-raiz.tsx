"use client";
import { useState } from "react";
import { BASE, cartoes, conta, FORMULAS, fmtNum, GRUPO_INICIAL, GRUPOS, leitura, ORDEM, RODAPE, SUBTITULO, TITULO, CONFIRA, TITULO_BASE, TITULO_CONTA, TITULO_CTL, type ChaveGrupo } from "@/lib/visuais/impureza-raiz";
import { Tex } from "./tex";

/**
 * Slide 5 do capítulo 5 (c5p5): o Gini de um grupo contado à mão, na gramática do c4p2. Quadro 16:9 no sistema .rl:
 * as duas fórmulas em KaTeX na faixa; à esquerda, a base das 16 propostas, com as linhas do grupo escolhido acesas; ao
 * centro, as propostas do grupo, defaults primeiro, e a conta em duas linhas; à direita, o painel com a raiz e duas
 * folhas da árvore. Contas em src/lib/visuais/impureza-raiz.ts.
 */
const CARTOES = cartoes();

export function ImpurezaRaiz({ pagina }: { pagina?: { index: number; total: number } }) {
  const [k, setK] = useState<ChaveGrupo>(GRUPO_INICIAL);
  const g = GRUPOS[k];
  const noGrupo = new Set(g.ids);
  const doGrupo = BASE.filter((r) => noGrupo.has(r.id));
  const [linhaP, linhaGini] = conta(g);
  return (
    <figure className="vz rl ir" data-vz="impureza-raiz">
      <section className="rl-slide" data-tela="5">
        <header className="rl-cab">
          <p className="rl-meta eyebrow"><span>Aula 2 · Capítulo 5 · Árvores de decisão</span><span>{pagina ? `${String(pagina.index).padStart(2, "0")} / ${pagina.total}` : "Impureza na raiz"}</span></p>
          <h3 className="rl-tit">{TITULO}</h3>
          <p className="rl-sub">{SUBTITULO}</p>
        </header>

        <div className="ir-eq">
          {FORMULAS.map((f) => <div key={f.k}><p className="ir-eq-k">{f.k}</p><Tex f={f.tex} className="ir-eq-f" /></div>)}
        </div>

        <div className="rl-corpo ir-corpo">
          <div className="ir-base">
            <p className="rl-k">{TITULO_BASE}</p>
            <table className={`ir-tab ${g.n < BASE.length ? "ir-tab--recorte" : ""}`} aria-label={`Base das 16 propostas; no grupo escolhido: ${g.ids.map((i) => `#${i}`).join(", ")}`}>
              <thead><tr><th scope="col">#</th><th scope="col">Utilização, %</th><th scope="col">Atraso, dias</th><th scope="col">Default</th></tr></thead>
              <tbody>
                {BASE.map((r) => (
                  <tr key={r.id} className={noGrupo.has(r.id) ? "ir-on" : "ir-off"}>
                    <th scope="row">{r.id}</th><td>{r.util}</td><td>{r.atraso}</td><td className={r.y ? "ir-sim" : "ir-nao"}>{r.y ? "sim" : "não"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="ir-conta">
            <p className="rl-k">{TITULO_CONTA}</p>
            <p className="ir-conta-sub">{g.definicao}</p>
            <div className="ir-fileiras" role="img" aria-label={`${g.d} defaults e ${g.n - g.d} propostas que pagaram`}>
              {([["d", "Default", doGrupo.filter((r) => r.y)], ["p", "Pagou", doGrupo.filter((r) => !r.y)]] as const).map(([c, rot, rs]) => (
                <div key={c} className="ir-fileira">
                  <p className="ir-fileira-k">{rot} <b>{rs.length}</b></p>
                  <div className="ir-caixas">{rs.map((r) => <span key={r.id} className={`ir-caixa ir-caixa--${c}`}>{r.id}</span>)}</div>
                </div>
              ))}
            </div>
            <div className="ir-linhas">
              <Tex f={linhaP} className="ir-linha" />
              <Tex f={linhaGini} className="ir-linha ir-linha--gini" />
            </div>
            <p className="ir-confira">{CONFIRA}</p>
          </div>

          <aside className="ir-painel">
            <p className="rl-k">{TITULO_CTL}</p>
            <div className="ir-grupos" role="group" aria-label="Grupo">
              {ORDEM.map((c) => <button key={c} type="button" className={`rl-btn rl-btn--mini ${c === k ? "rl-btn--on" : ""}`} aria-pressed={c === k} onClick={() => setK(c)}>{GRUPOS[c].nome}</button>)}
            </div>
            <dl className="ir-res" aria-live="polite">
              <div><dt>Propostas</dt><dd>{g.n}</dd></div>
              <div><dt>Defaults</dt><dd>{g.d}</dd></div>
              <div><dt>Gini</dt><dd className="ir-res-g">{fmtNum(g.gini, 5)}</dd></div>
            </dl>
            <p className="ir-lei">{leitura(g)}</p>
          </aside>
        </div>

        <div className="ir-cartoes">
          {CARTOES.map((c) => <div key={c.k}><p className="ir-cartao-k">{c.k}</p><p className="ir-cartao-t">{c.t}</p></div>)}
        </div>
        <p className="rl-rod nota">{RODAPE}</p>
      </section>
    </figure>
  );
}
