"use client";
import { useState } from "react";
import { ATALHOS, cuidado, FORMULAS, fmtEscore, fmtOdds, fmtPd, fmtPdCurta, fmtZ, linhaMaisProxima, NOMES, NOTAS, PD_INICIAL, posicao, RODAPE, ROTULO_ATALHOS, SUBTITULO, TABELA_PDS, TICKS, TITULO, TITULO_CTL, TITULO_REGUAS, TITULO_TABELA, traduzir, USOS, valor, type Escala, type Traducao } from "@/lib/visuais/quatro-escalas";
import { Tex } from "./tex";

/**
 * Slide 6 do capítulo 4 (c4p6): probabilidade, odds, log odds e escore, na gramática do c4p2. Quadro 16:9 no sistema
 * .rl: as conversões em KaTeX na faixa; à esquerda, a mesma PD em quatro réguas, ligadas por uma linha que nunca
 * cruza (a ordem é a mesma em todas); ao centro, a tabela de tradução com a linha mais próxima acesa; à direita, o
 * painel; na base, onde cada escala é usada. Contas em src/lib/visuais/quatro-escalas.ts.
 */
const ORDEM: Escala[] = ["p", "odds", "z", "escore"];
const W = 640, H = 426, ML = 26, MR = 26, PASSO = 104, TOPO = 6;
const rx = (t: number) => ML + t * (W - ML - MR);

function Reguas({ t }: { t: Traducao }) {
  const pts = ORDEM.map((e, k) => ({ e, k, x: rx(posicao(e, t).t), y: TOPO + k * PASSO + 56 }));
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="qe-svg" role="img"
      aria-label={`PD ${fmtPdCurta(t.p)}: odds ${fmtOdds(t.odds)}, log odds ${fmtZ(t.z)}, escore ${fmtEscore(t.escore)}. A mesma posição relativa nas quatro réguas.`}>
      <polyline points={pts.map((q) => `${q.x},${q.y}`).join(" ")} className="qe-liga" />
      {pts.map(({ e, k, x, y }) => {
        const y0 = TOPO + k * PASSO;
        const anc = x > W - MR - 70 ? "end" : x < ML + 70 ? "start" : "middle";
        const dx = anc === "end" ? 10 : anc === "start" ? -10 : 0;
        return (
          <g key={e} className={`qe-regua qe-regua--${e}`}>
            <text x={ML} y={y0 + 18} className="qe-nome">{NOMES[e]}</text>
            <text x={W - MR} y={y0 + 18} textAnchor="end" className="qe-nota">{NOTAS[e](t)}</text>
            <line x1={rx(0)} x2={rx(1)} y1={y} y2={y} className="qe-eixo" />
            {e === "p"
              ? <><line x1={rx(0)} x2={rx(0)} y1={y - 10} y2={y + 10} className="qe-parede" /><line x1={rx(1)} x2={rx(1)} y1={y - 10} y2={y + 10} className="qe-parede" /></>
              : <><path d={`M${rx(0) - 16} ${y} l12 -7 v14 z`} className="qe-seta" /><path d={`M${rx(1) + 16} ${y} l-12 -7 v14 z`} className="qe-seta" /></>}
            {TICKS[e].map((m) => <g key={m.texto}><line x1={rx(m.t)} x2={rx(m.t)} y1={y - 6} y2={y + 6} className="qe-tick-l" /><text x={rx(m.t)} y={y0 + 86} textAnchor="middle" className={`qe-tick ${m.t === 0 ? "qe-tick--ini" : m.t === 1 ? "qe-tick--fim" : ""}`}>{m.texto}</text></g>)}
            <circle cx={x} cy={y} r={9} className="qe-ponto" />
            <text x={x + dx} y={y0 + 42} textAnchor={anc} className="qe-valor">{valor(e, t)}</text>
          </g>
        );
      })}
    </svg>
  );
}

export function QuatroEscalas({ pagina }: { pagina?: { index: number; total: number } }) {
  const [p, setP] = useState(PD_INICIAL);
  const t = traduzir(p), perto = linhaMaisProxima(p);
  return (
    <figure className="vz rl qe" data-vz="quatro-escalas">
      <section className="rl-slide" data-tela="6">
        <header className="rl-cab">
          <p className="rl-meta eyebrow"><span>Aula 2 · Capítulo 4 · Regressão logística</span><span>{pagina ? `${String(pagina.index).padStart(2, "0")} / ${pagina.total}` : "Quatro escalas"}</span></p>
          <h3 className="rl-tit">{TITULO}</h3>
          <p className="rl-sub">{SUBTITULO}</p>
        </header>

        <div className="qe-eq">
          {FORMULAS.map((f) => <div key={f.k}><p className="qe-eq-k">{f.k}</p><Tex f={f.tex} className="qe-eq-f" /></div>)}
        </div>

        <div className="rl-corpo qe-corpo">
          <div className="qe-reguas">
            <p className="rl-k">{TITULO_REGUAS}</p>
            <div className="qe-svg-wrap"><Reguas t={t} /></div>
          </div>

          <div className="qe-tabela">
            <p className="rl-k">{TITULO_TABELA}</p>
            <table className="qe-tab" aria-label={`Tabela de tradução; a linha mais próxima da PD escolhida é ${fmtPd(perto)}`}>
              <thead><tr><th scope="col">PD</th><th scope="col">Odds</th><th scope="col">Log odds</th><th scope="col">Escore</th></tr></thead>
              <tbody>
                {TABELA_PDS.map((q) => { const r = traduzir(q); return (
                  <tr key={q} className={q === perto ? "qe-on" : undefined}><th scope="row">{fmtPd(q)}</th><td>{fmtOdds(r.odds)}</td><td>{fmtZ(r.z)}</td><td>{fmtEscore(r.escore)}</td></tr>
                ); })}
              </tbody>
            </table>
          </div>

          <aside className="qe-painel">
            <p className="rl-k">{TITULO_CTL}</p>
            <div className="qe-ctl-topo">
              <label htmlFor="qe-range"><b>PD:</b> {fmtPdCurta(p)}</label>
              <div className="qe-atalhos" role="group" aria-label="Atalhos de PD">
                <span>{ROTULO_ATALHOS}</span>
                {ATALHOS.map((a) => { const on = Math.abs(a - p) < 1e-9; return <button key={a} type="button" className={`rl-btn rl-btn--mini ${on ? "rl-btn--on" : ""}`} aria-pressed={on} onClick={() => setP(a)}>{fmtPdCurta(a)}</button>; })}
              </div>
            </div>
            <input id="qe-range" type="range" min={1} max={99} step={1} value={Math.round(p * 100)} onChange={(ev) => setP(Number(ev.target.value) / 100)} aria-valuetext={`${fmtPdCurta(p)}: escore ${fmtEscore(t.escore)}`} />
            <dl className="qe-res" aria-live="polite">
              <div><dt>Odds</dt><dd>{fmtOdds(t.odds)}</dd></div>
              <div><dt>Log odds</dt><dd>{fmtZ(t.z)}</dd></div>
              <div><dt>Escore</dt><dd className="qe-res-e">{fmtEscore(t.escore)}</dd></div>
            </dl>
            <p className="qe-cuidado"><b>Cuidado:</b> {cuidado()}</p>
            <button type="button" className="rl-btn rl-btn--mini" onClick={() => setP(PD_INICIAL)}>Restaurar exemplo</button>
          </aside>
        </div>

        <div className="qe-cartoes">
          {USOS.map((u) => <div key={u.k}><p className="qe-cartao-k">{u.k}</p><p className="qe-cartao-t">{u.t}</p></div>)}
        </div>
        <p className="rl-rod nota">{RODAPE}</p>
      </section>
    </figure>
  );
}
