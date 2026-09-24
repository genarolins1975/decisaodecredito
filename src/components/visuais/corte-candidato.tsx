"use client";
import { useState } from "react";
import { ATALHOS, avaliar, BASE, cartoes, comparacaoSimples, conta, CORTES, EIXO, fmtCorte, fmtNum, FORMULAS, indiceDe, INICIAL, leitura, NOME_CURTO, NOME_VAR, RODAPE, ROTULO_ATALHOS, ROTULO_SIMPLES, SUBTITULO, TITULO, TITULO_CONTA, TITULO_CTL, TITULO_REGUA, VARS, type Corte, type Variavel } from "@/lib/visuais/corte-candidato";
import { Tex } from "./tex";

/**
 * Slide 6 do capítulo 5 (c5p6): avaliar um corte candidato, na gramática do c4p2. Quadro 16:9 no sistema .rl: a
 * fórmula do ganho em KaTeX na faixa; à esquerda, onde cortar, com as 16 propostas sobre a régua da variável e os
 * pontos médios candidatos; ao centro, a conta em três passos, em forma de árvore: antes, cada lado com o seu peso, e o
 * ganho; à direita, o painel. A média simples entra sob demanda, como o erro que a ponderação evita. Contas em
 * src/lib/visuais/corte-candidato.ts.
 */
const CARTOES = cartoes();

/**
 * Onde cortar: as 16 propostas em ordem da variável, com o corte como linha entre duas delas. Cada fronteira entre valores
 * diferentes é um candidato (o ponto médio dos dois vizinhos) e é clicável; dentro de um empate não há fronteira, porque
 * nenhum corte separa valores iguais.
 */
function Lista({ v, a, onCorte }: { v: Variavel; a: Corte; onCorte: (i: number) => void }) {
  const ord = [...BASE].sort((x, y) => x[v] - y[v] || x.id - y.id);
  return (
    <ol className="ct-lista" aria-label={`As 16 propostas em ordem de ${NOME_VAR[v].toLowerCase()}; corte em ${fmtCorte(v, a.corte)}: ${a.nE} à esquerda, ${a.nD} à direita`}>
      {ord.map((r, j) => {
        const prox = ord[j + 1];
        const cand = prox && prox[v] !== r[v] ? (r[v] + prox[v]) / 2 : null;
        const k = cand === null ? -1 : CORTES[v].findIndex((c) => Math.abs(c - cand) < 1e-9);
        const atual = cand !== null && Math.abs(cand - a.corte) < 1e-9;
        const lado = r[v] <= a.corte ? "e" : "d";
        return (
          <li key={r.id} className={atual ? `ct-item ct-item--${lado} ct-item--corte` : `ct-item ct-item--${lado}`}>
            <span className="ct-item-id">#{r.id}</span>
            <span className="ct-item-v">{r[v]}</span>
            <span className={`ct-item-y ${r.y ? "ct-item-y--d" : "ct-item-y--p"}`} role="img" aria-label={r.y ? "default" : "pagou"}>{r.y ? "D" : "✓"}</span>
            {atual && cand !== null && <span className="ct-cand-t" aria-hidden="true">corte ≤ {fmtCorte(v, cand)}</span>}
            {cand !== null && <button type="button" className={atual ? "ct-cand ct-cand--on" : "ct-cand"} onClick={() => onCorte(k)} aria-pressed={atual} aria-label={`Cortar em ${fmtCorte(v, cand)}`} />}
          </li>
        );
      })}
    </ol>
  );
}

/** A conta em forma de árvore: a raiz em cima, os dois lados embaixo, com o peso de cada um na aresta. */
const AW = 580, AH = 360, NW = 244, NH = 120;
function No({ x, y, rot, n, d, gini, cls }: { x: number; y: number; rot: string; n: number; d: number; gini: number; cls: string }) {
  const bw = NW - 28, bd = n ? (bw * d) / n : 0;
  return (
    <g className={`ct-no ${cls}`} transform={`translate(${x}, ${y})`}>
      <rect width={NW} height={NH} rx={10} className="ct-no-caixa" />
      <text x={14} y={29} className="ct-no-t">{rot}</text>
      <rect x={14} y={40} width={bw} height={12} rx={3} className="ct-barra-p" />
      {bd > 0 && <rect x={14} y={40} width={bd} height={12} rx={3} className="ct-barra-d" />}
      <text x={14} y={79} className="ct-no-n">{n} proposta{n === 1 ? "" : "s"} · {d} D</text>
      <text x={14} y={108} className="ct-no-g">Gini {fmtNum(gini, 5)}</text>
    </g>
  );
}
function Arvore({ v, a }: { v: Variavel; a: Corte }) {
  const raiz = { x: (AW - NW) / 2, y: 26 }, e = { x: 0, y: AH - NH - 2 }, d = { x: AW - NW, y: AH - NH - 2 };
  const pe = { x: e.x + NW / 2, y: e.y }, pd = { x: d.x + NW / 2, y: d.y }, pr = { x: AW / 2, y: raiz.y + NH };
  return (
    <svg viewBox={`0 0 ${AW} ${AH}`} className="ct-arv" role="img" aria-label={`Antes, ${BASE.length} propostas com Gini ${fmtNum(a.giniAntes, 5)}; à esquerda, ${a.nE} com Gini ${fmtNum(a.giniEsq, 5)} e peso ${a.nE} em ${BASE.length}; à direita, ${a.nD} com Gini ${fmtNum(a.giniDir, 5)} e peso ${a.nD} em ${BASE.length}.`}>
      <text x={AW / 2} y={17} textAnchor="middle" className="ct-passo">1 · antes do corte</text>
      <text x={AW / 2} y={e.y - 12} textAnchor="middle" className="ct-passo">2 · cada lado</text>
      <path d={`M${pr.x} ${pr.y} L${pe.x} ${pe.y}`} className="ct-aresta" />
      <path d={`M${pr.x} ${pr.y} L${pd.x} ${pd.y}`} className="ct-aresta" />
      <text x={(pr.x + pe.x) / 2 - 14} y={(pr.y + pe.y) / 2 + 4} textAnchor="end" className="ct-peso">peso {a.nE}/{BASE.length}</text>
      <text x={(pr.x + pd.x) / 2 + 14} y={(pr.y + pd.y) / 2 + 4} className="ct-peso">peso {a.nD}/{BASE.length}</text>
      <No x={raiz.x} y={raiz.y} rot="Raiz" n={BASE.length} d={a.dE + a.dD} gini={a.giniAntes} cls="ct-no--raiz" />
      <No x={e.x} y={e.y} rot={`e: ≤ ${fmtCorte(v, a.corte)}`} n={a.nE} d={a.dE} gini={a.giniEsq} cls="ct-no--e" />
      <No x={d.x} y={d.y} rot={`d: > ${fmtCorte(v, a.corte)}`} n={a.nD} d={a.dD} gini={a.giniDir} cls="ct-no--d" />
    </svg>
  );
}

export function CorteCandidato({ pagina }: { pagina?: { index: number; total: number } }) {
  const [v, setV] = useState<Variavel>(INICIAL.v);
  const [i, setI] = useState(indiceDe(INICIAL.v, INICIAL.corte));
  const [simples, setSimples] = useState(false);
  const cortes = CORTES[v], idx = Math.min(i, cortes.length - 1);
  const a = avaliar(v, cortes[idx]);
  const c = conta(a);
  const trocarVar = (nv: Variavel) => { if (nv === v) return; setV(nv); setI(indiceDe(nv, ATALHOS[nv][ATALHOS[nv].length - 1])); };
  const restaurar = () => { setV(INICIAL.v); setI(indiceDe(INICIAL.v, INICIAL.corte)); setSimples(false); };
  return (
    <figure className="vz rl ct" data-vz="corte-candidato">
      <section className="rl-slide" data-tela="6">
        <header className="rl-cab">
          <p className="rl-meta eyebrow"><span>Aula 2 · Capítulo 5 · Árvores de decisão</span><span>{pagina ? `${String(pagina.index).padStart(2, "0")} / ${pagina.total}` : "Corte candidato"}</span></p>
          <h3 className="rl-tit">{TITULO}</h3>
          <p className="rl-sub">{SUBTITULO}</p>
        </header>

        <div className="ct-eq">
          {FORMULAS.map((f) => <div key={f.k}><p className="ct-eq-k">{f.k}</p><Tex f={f.tex} className="ct-eq-f" /></div>)}
        </div>

        <div className="rl-corpo ct-corpo">
          <div className="ct-regua">
            <p className="rl-k">{TITULO_REGUA}</p>
            <p className="ct-regua-sub">Em ordem de {EIXO[v]}</p>
            <Lista v={v} a={a} onCorte={setI} />
          </div>

          <div className="ct-conta">
            <p className="rl-k">{TITULO_CONTA}</p>
            <div className="ct-arv-wrap"><Arvore v={v} a={a} /></div>
            <dl className="ct-linhas">
              <dt>3 · ponderada</dt><dd><Tex f={c.depois} className="ct-linha" /></dd>
              <dt>4 · ganho</dt><dd><Tex f={c.ganho} className="ct-linha ct-linha--ganho" /></dd>
              {simples && <><dt className="ct-linhas-simples">sem ponderar</dt><dd><Tex f={c.simples} className="ct-linha ct-linha--simples" /></dd></>}
            </dl>
          </div>

          <aside className="ct-painel">
            <p className="rl-k">{TITULO_CTL}</p>
            <div className="ct-vars" role="group" aria-label="Variável">
              {VARS.map((k) => <button key={k} type="button" className={`rl-btn rl-btn--mini ${k === v ? "rl-btn--on" : ""}`} aria-pressed={k === v} onClick={() => trocarVar(k)}>{NOME_CURTO[k]}</button>)}
            </div>
            <div className="ct-atalhos" role="group" aria-label="Cortes de exemplo">
              <span>{ROTULO_ATALHOS}</span>
              {ATALHOS[v].map((x) => { const on = Math.abs(x - a.corte) < 1e-9; return <button key={x} type="button" className={`rl-btn rl-btn--mini ${on ? "rl-btn--on" : ""}`} aria-pressed={on} onClick={() => setI(indiceDe(v, x))}>{fmtCorte(v, x)}</button>; })}
            </div>
            <label className="ct-ctl" htmlFor="ct-range"><b>Corte:</b> ≤ {fmtCorte(v, a.corte)} · candidato {idx + 1} de {cortes.length}</label>
            <input id="ct-range" type="range" min={0} max={cortes.length - 1} step={1} value={idx} onChange={(ev) => setI(Number(ev.target.value))}
              aria-valuetext={`${NOME_VAR[v]} até ${fmtCorte(v, a.corte)}; ganho ${fmtNum(a.ganho, 5)}`} />
            <dl className="ct-res" aria-live="polite"><div><dt>Ganho</dt><dd className="ct-res-g">{fmtNum(a.ganho, 5)}</dd></div></dl>
            <p className="ct-lei">{leitura(a)}</p>
            <div className="ct-acoes">
              <button type="button" className={`rl-btn rl-btn--mini ${simples ? "rl-btn--on" : ""}`} aria-pressed={simples} onClick={() => setSimples((s) => !s)}>{ROTULO_SIMPLES}</button>
              <button type="button" className="rl-btn rl-btn--mini" onClick={restaurar}>Restaurar exemplo</button>
            </div>
            {simples && <div className="ct-comp" aria-live="polite"><p>{comparacaoSimples(a)}</p></div>}
          </aside>
        </div>

        <div className="ct-cartoes">
          {CARTOES.map((k) => <div key={k.k}><p className="ct-cartao-k">{k.k}</p><p className="ct-cartao-t">{k.t}</p></div>)}
        </div>
        <p className="rl-rod nota">{RODAPE}</p>
      </section>
    </figure>
  );
}
