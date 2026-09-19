"use client";
import { useState } from "react";
import { EXEMPLO, LIMITES, NOTA_CONTA, PROPOSTA, RODAPE, SINTESE, fmt, fmtPct, linhas, representacoes, soma } from "@/lib/visuais/escore-soma";

/**
 * Slide 8 do capítulo 4 (c4p8): do dado à contribuição, da soma à probabilidade. Quadro 16:9 no mesmo sistema
 * visual dos quadros de abertura (.rl): controles da proposta, tabela de parcelas, faixa da soma e as três
 * representações do resultado. Um só estado (utilização e atraso) alimenta tudo; contas em
 * src/lib/visuais/escore-soma.ts. Substitui o bloco herdado, que trazia um diagrama de sete variáveis para uma
 * fórmula de duas e distribuía a tabela e a frase do resultado por telas diferentes no palco.
 */
export function EscoreSoma({ pagina }: { pagina?: { index: number; total: number } }) {
  const [util, setUtil] = useState(EXEMPLO.util);
  const [atraso, setAtraso] = useState(EXEMPLO.atraso);
  const ls = linhas(util, atraso);
  const r = representacoes(util, atraso);
  const restaurar = () => { setUtil(EXEMPLO.util); setAtraso(EXEMPLO.atraso); };
  return (
    <figure className="vz rl es" data-vz="escore-soma">
      <section className="rl-slide" data-tela="8">
        <header className="rl-cab">
          <p className="rl-meta eyebrow"><span>Aula 2 · Capítulo 4 · Regressão logística</span><span>{pagina ? `${String(pagina.index).padStart(2, "0")} / ${pagina.total}` : "Escore"}</span></p>
          <h3 className="rl-tit">Do dado à contribuição. Da soma à probabilidade.</h3>
          <p className="rl-sub">Cada característica recebe um peso e contribui para o escore em log odds.</p>
        </header>

        <div className="rl-corpo es-corpo">
          <div className="rl-painel es-painel">
            <div className="es-cab">
              <p className="es-proposta">Proposta #{PROPOSTA}</p>
              <button type="button" className="rl-btn" onClick={restaurar}>Restaurar exemplo</button>
            </div>
            <div className="es-controles">
              <div className="es-ctl es-ctl--ambar">
                <label htmlFor="es-util"><b>Utilização:</b> {fmt(util, 0)}%</label>
                <input id="es-util" type="range" min={LIMITES.util[0]} max={LIMITES.util[1]} step={1} value={util} onChange={(e) => setUtil(Number(e.target.value))} aria-valuetext={`${fmt(util, 0)} por cento`} />
                <p className="es-ctl-lim"><span>{LIMITES.util[0]}%</span><span>{LIMITES.util[1]}%</span></p>
              </div>
              <div className="es-ctl es-ctl--roxo">
                <label htmlFor="es-atraso"><b>Atraso:</b> {fmt(atraso, 0)} {atraso === 1 ? "dia" : "dias"}</label>
                <input id="es-atraso" type="range" min={LIMITES.atraso[0]} max={LIMITES.atraso[1]} step={1} value={atraso} onChange={(e) => setAtraso(Number(e.target.value))} aria-valuetext={`${fmt(atraso, 0)} dias`} />
                <p className="es-ctl-lim"><span>{LIMITES.atraso[0]}</span><span>{LIMITES.atraso[1]} dias</span></p>
              </div>
            </div>
            <table className="es-tab">
              <colgroup><col className="es-c1" /><col className="es-c2" /><col className="es-c3" /><col className="es-c4" /></colgroup>
              <thead><tr><th scope="col">Parcela</th><th scope="col">Coeficiente</th><th scope="col">Valor na escala</th><th scope="col">Contribuição</th></tr></thead>
              <tbody>
                {ls.map((l) => (
                  <tr key={l.id} className={`es-lin es-lin--${l.cor}`}>
                    <th scope="row">{l.parcela}{l.unidade && <span className="es-unidade">unidade: {l.unidade}</span>}</th>
                    <td>{fmt(l.coeficiente, 4)}</td>
                    <td>{l.escala}</td>
                    <td className="es-contrib">{fmt(l.contribuicao, 4, l.id !== "intercepto")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="es-soma" aria-live="polite"><span>Soma das contribuições</span><b>z ≈ {fmt(soma(ls), 4)}</b></p>
            <p className="es-nota nota">{NOTA_CONTA}</p>
          </div>

          <div className="rl-col es-res">
            <p className="rl-k es-res-t">Três representações do mesmo resultado</p>
            <div className="es-res-item">
              <p className="es-res-k">Escore · log odds</p>
              <p className="es-res-v es-res-v--z">{fmt(r.z, 4)}</p>
            </div>
            <p className="es-seta"><span className="es-seta-i" aria-hidden="true">↓</span><span>odds = e<sup>z</sup></span></p>
            <div className="es-res-item">
              <p className="es-res-k">Odds</p>
              <p className="es-res-v es-res-v--odds">{fmt(r.odds, 3)}</p>
            </div>
            <p className="es-seta"><span className="es-seta-i" aria-hidden="true">↓</span><span>PD = odds ÷ (1 + odds)</span></p>
            <div className="es-res-item">
              <p className="es-res-v es-res-v--pd">{fmtPct(r.pd)}</p>
              <p className="es-res-k es-res-k--pd">PD estimada</p>
            </div>
          </div>
        </div>

        <div className="rl-faixa es-sintese">
          {SINTESE.map((s) => <div key={s.k}><p className="es-sin-k">{s.k}</p><p className="es-sin-t">{s.t}</p></div>)}
        </div>
        <p className="rl-rod nota">{RODAPE}</p>
      </section>
    </figure>
  );
}
