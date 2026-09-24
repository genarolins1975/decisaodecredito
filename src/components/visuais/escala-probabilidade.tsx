"use client";
import { useState } from "react";
import { ATALHOS, cartoes, EIXO_MAX, esperados, FORMULAS, INCREMENTO_INICIAL, INCREMENTO_MAX, N_OPERACOES, NOTA_GRADE_CURTA, normalizarPd, oddsDe, PD_INICIAL, reguas, resultado, RODAPE, ROTULO_ATALHOS, SUBTITULO, TITULO, TITULO_CTL, TITULO_GRADE, tituloReguas } from "@/lib/visuais/escala-probabilidade";
import { Tex } from "./tex";

/**
 * Slide 3 do capítulo 4 (c4p3): a escala de probabilidade, na gramática do c4p2. Quadro 16:9 no sistema .rl: as duas
 * fórmulas em KaTeX na faixa; à esquerda, cem operações com a mesma PD, em que a grade conta os defaults esperados e
 * nunca diz quais; ao centro, o mesmo incremento somado em três pontos da escala, com a faixa acima de 100% em vinho;
 * à direita, o painel. Contas em src/lib/visuais/escala-probabilidade.ts.
 */
const CARTOES = cartoes();
const pct = (v: number) => `${Math.round(v * 100)}%`;

/** As três réguas de 0% a 120%: a partida, a seta do incremento e a faixa em que o resultado deixa de ser probabilidade. */
const RW = 560, RH = 372, ML = 22, MR = 22, TOPO = 44, PASSO = 108;
const rx = (v: number) => ML + (v / EIXO_MAX) * (RW - ML - MR);
function Reguas({ pd, inc }: { pd: number; inc: number }) {
  const rs = reguas(pd, inc);
  const aria = rs.map((r) => `${r.rotulo}${r.valido ? "" : ", acima de 100%"}`).join("; ");
  return (
    <svg viewBox={`0 0 ${RW} ${RH}`} className="ep-svg" role="img" aria-label={`O mesmo incremento de ${inc} pontos em três pontos da escala: ${aria}.`}>
      <rect x={rx(1)} y={TOPO - 14} width={rx(EIXO_MAX) - rx(1)} height={RH - TOPO - 20} className="ep-fora" />
      <line x1={rx(1)} x2={rx(1)} y1={TOPO - 14} y2={RH - 34} className="ep-limite" />
      <text x={rx(EIXO_MAX)} y={TOPO - 22} textAnchor="end" className="ep-fora-t">acima de 100%</text>
      {rs.map((r, i) => {
        const y0 = TOPO + i * PASSO, y = y0 + 44, cls = r.valido ? "ep-ok" : "ep-mau";
        const x0 = rx(r.de), x1 = rx(Math.min(r.para, EIXO_MAX)), anda = x1 - x0 > 1;
        return (
          <g key={i} className={r.selecionada ? "ep-regua ep-regua--sel" : "ep-regua"}>
            <text x={ML} y={y0 + 10} className={`ep-rot ${cls}`}>{r.rotulo}{r.selecionada && <tspan className="ep-rot-sel"> · PD escolhida</tspan>}</text>
            <line x1={rx(0)} x2={rx(1)} y1={y} y2={y} className="ep-eixo" />
            <line x1={rx(1)} x2={rx(EIXO_MAX)} y1={y} y2={y} className="ep-eixo ep-eixo--fora" />
            {[0, 0.5, 1].map((t) => <line key={t} x1={rx(t)} x2={rx(t)} y1={y - 7} y2={y + 7} className="ep-tick-l" />)}
            {anda && <line x1={x0} x2={x1 - 12} y1={y} y2={y} className={`ep-seta ${cls}`} />}
            {anda && <path d={`M${x1} ${y} l-16 -9 v18 z`} className={`ep-ponta ${cls}`} />}
            <circle cx={x0} cy={y} r={9} className="ep-ini" />
          </g>
        );
      })}
      {[0, 0.25, 0.5, 0.75, 1].map((t) => <text key={t} x={rx(t)} y={RH - 8} textAnchor="middle" className="ep-tick">{pct(t)}</text>)}
    </svg>
  );
}

export function EscalaProbabilidade({ pagina }: { pagina?: { index: number; total: number } }) {
  const [pd, setPd] = useState(PD_INICIAL);
  const [inc, setInc] = useState(INCREMENTO_INICIAL * 100);
  const e = esperados(pd), o = oddsDe(pd), res = resultado(pd, inc);
  const restaurar = () => { setPd(PD_INICIAL); setInc(INCREMENTO_INICIAL * 100); };
  return (
    <figure className="vz rl ep" data-vz="escala-probabilidade">
      <section className="rl-slide" data-tela="3">
        <header className="rl-cab">
          <p className="rl-meta eyebrow"><span>Aula 2 · Capítulo 4 · Regressão logística</span><span>{pagina ? `${String(pagina.index).padStart(2, "0")} / ${pagina.total}` : "Probabilidade"}</span></p>
          <h3 className="rl-tit">{TITULO}</h3>
          <p className="rl-sub">{SUBTITULO}</p>
        </header>

        <div className="ep-eq">
          {FORMULAS.map((f) => <div key={f.k}><p className="ep-eq-k">{f.k}</p><Tex f={f.tex} className="ep-eq-f" /></div>)}
        </div>

        <div className="rl-corpo ep-corpo">
          <div className="ep-grade">
            <p className="rl-k">{TITULO_GRADE}</p>
            <div className="ep-cem-wrap">
              <div className="ep-cem" role="img" aria-label={`Cem operações: ${e.defaults} defaults esperados e ${e.adimplentes} adimplentes esperados`} data-testid="grade-cem">
                {Array.from({ length: N_OPERACOES }, (_, i) => <i key={i} className={i < e.defaults ? "ep-q ep-q--d" : "ep-q ep-q--p"} />)}
              </div>
            </div>
            <p className="ep-cont"><span className="ep-sw ep-sw--d" aria-hidden="true" /><span><b>{e.defaults}</b> defaults esperados</span><span className="ep-sw ep-sw--p" aria-hidden="true" /><span><b>{e.adimplentes}</b> adimplentes</span></p>
            <p className="ep-nota">{NOTA_GRADE_CURTA}</p>
          </div>

          <div className="ep-reguas">
            <p className="rl-k">{tituloReguas(inc)}</p>
            <div className="ep-svg-wrap"><Reguas pd={pd} inc={inc} /></div>
          </div>

          <aside className="ep-painel">
            <p className="rl-k">{TITULO_CTL}</p>
            <div className="ep-ctl-topo">
              <label htmlFor="ep-pd"><b>PD por operação:</b> {pct(pd)}</label>
              <div className="ep-atalhos" role="group" aria-label="Atalhos de PD">
                <span>{ROTULO_ATALHOS}</span>
                {ATALHOS.map((a) => { const on = Math.abs(a - pd) < 1e-9; return <button key={a} type="button" className={`rl-btn rl-btn--mini ${on ? "rl-btn--on" : ""}`} aria-pressed={on} onClick={() => setPd(a)}>{pct(a)}</button>; })}
              </div>
            </div>
            <div className="ep-linha">
              <input id="ep-pd" type="range" min={0} max={100} step={1} value={Math.round(pd * 100)} onChange={(ev) => setPd(normalizarPd(Number(ev.target.value) / 100))} aria-valuetext={`${pct(pd)}: ${e.defaults} defaults esperados em ${N_OPERACOES}`} />
              <span className="ep-num"><input type="number" inputMode="numeric" min={0} max={100} step={1} value={Math.round(pd * 100)} aria-label="PD por operação, em porcentagem"
                onChange={(ev) => { const n = Number(ev.target.value); if (ev.target.value !== "" && Number.isFinite(n)) setPd(normalizarPd(n / 100)); }} /><span>%</span></span>
            </div>
            <label htmlFor="ep-inc" className="ep-ctl"><b>Incremento:</b> +{inc} pp</label>
            <input id="ep-inc" type="range" min={0} max={INCREMENTO_MAX} step={1} value={inc} onChange={(ev) => setInc(Number(ev.target.value))} aria-valuetext={`mais ${inc} pontos percentuais`} />
            <div className="ep-res" aria-live="polite">
              <p className="ep-res-k">PD escolhida com +{inc} pp</p>
              <p className={`ep-res-v ${res.invalida ? "ep-res-v--mau" : "ep-res-v--ok"}`}>{res.para}</p>
              <p className={`ep-lim ${res.invalida ? "ep-lim--mau" : "ep-lim--ok"}`} data-testid="mensagem-limite">{res.texto}</p>
            </div>
            <dl className="ep-odds"><div><dt>Odds desta PD</dt><dd>{o.texto}</dd></div></dl>
            <button type="button" className="rl-btn rl-btn--mini" onClick={restaurar}>Restaurar exemplo</button>
          </aside>
        </div>

        <div className="ep-cartoes">
          {CARTOES.map((c) => <div key={c.k}><p className="ep-cartao-k">{c.k}</p><p className="ep-cartao-t">{c.t}</p></div>)}
        </div>
        <p className="rl-rod nota">{RODAPE}</p>
      </section>
    </figure>
  );
}
