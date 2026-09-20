"use client";
import { useState } from "react";
import { comparacao, CONCLUSOES, cruzamento, DOMINIO, EIXO_X_T, EIXO_Y, EIXO_Y_T, equacao, EQUACAO_UNIDADES, fmt, fmtPct, fmtPp, FORMULA_TRUNCADA, forasDoIntervalo, FRASE_RETA, FRASE_TRUNCADA, leitura, NOTA_TRUNCAR, PASSO_COMPARACAO, previsao, previsaoTruncada, RODAPE, ROTULO_COMPARAR, ROTULO_TRUNCAR, TICKS_X, TICKS_Y, TITULO_CTL, TITULO_GRAF, TRANSICAO, UTIL_INICIAL, validarUtil } from "@/lib/visuais/reta-na-probabilidade";

/**
 * Slide 2 do capítulo 4 (c4p2): uma reta ajustada na probabilidade não garante previsões entre 0 e 1. Quadro 16:9
 * no sistema .rl. A reta é a do projeto, por mínimos quadrados sobre as 16 propostas; o truncamento é sobreposto
 * quando pedido, e a comparação de +10 pp mostra a diferença entre a reta e a função truncada. Contas em
 * src/lib/visuais/reta-na-probabilidade.ts.
 */
const W = 1180, H = 560, ML = 96, MR = 34, MT = 34, MB = 78;
const sx = (u: number) => ML + ((u - DOMINIO[0]) / (DOMINIO[1] - DOMINIO[0])) * (W - ML - MR);
const sy = (p: number) => MT + ((EIXO_Y[1] - p) / (EIXO_Y[1] - EIXO_Y[0])) * (H - MT - MB);
const limitar = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const ZERO = cruzamento(0);
const FORA = forasDoIntervalo();

function Campo({ mostrado, onValor }: { mostrado: string; onValor: (v: number) => void }) {
  const [texto, setTexto] = useState(mostrado); const [editando, setEditando] = useState(false); const [ultimo, setUltimo] = useState(mostrado); const [erro, setErro] = useState<string | null>(null);
  if (!editando && mostrado !== ultimo) { setUltimo(mostrado); setTexto(mostrado); }
  return (
    <div className="rp-campo">
      <label htmlFor="rp-util">Utilização, campo em %</label>
      <span className="rp-campo-in">
        <input id="rp-util" type="text" inputMode="numeric" value={texto} aria-invalid={Boolean(erro)} aria-describedby="rp-util-msg"
          onFocus={() => setEditando(true)} onBlur={() => { setEditando(false); setTexto(mostrado); setErro(null); }}
          onChange={(e) => { setTexto(e.target.value); const r = validarUtil(e.target.value); if (r.ok) { onValor(r.valor); setErro(null); } else setErro(r.erro); }} />
        <span>%</span>
      </span>
      <p id="rp-util-msg" className="rp-msg" aria-live="polite">{erro ?? ""}</p>
    </div>
  );
}

export function RetaNaProbabilidade({ pagina }: { pagina?: { index: number; total: number } }) {
  const [util, setUtil] = useState(UTIL_INICIAL);
  const [truncado, setTruncado] = useState(false);
  const [comparar, setComparar] = useState(false);
  const p = previsao(util), t = previsaoTruncada(util);
  const lei = leitura(util);
  const c = comparacao(util, PASSO_COMPARACAO);
  const reta = `M${sx(DOMINIO[0])} ${sy(previsao(DOMINIO[0]))} L${sx(DOMINIO[1])} ${sy(previsao(DOMINIO[1]))}`;
  const trunc = [DOMINIO[0], ...(ZERO !== null ? [ZERO] : []), DOMINIO[1]].map((u, i) => `${i ? "L" : "M"}${sx(u).toFixed(1)} ${sy(previsaoTruncada(u)).toFixed(1)}`).join("");
  const restaurar = () => { setUtil(UTIL_INICIAL); setTruncado(false); setComparar(false); };
  return (
    <figure className="vz rl rp" data-vz="reta-na-probabilidade">
      <section className="rl-slide" data-tela="2">
        <header className="rl-cab">
          <p className="rl-meta eyebrow"><span>Aula 2 · Capítulo 4 · Regressão logística</span><span>{pagina ? `${String(pagina.index).padStart(2, "0")} / ${pagina.total}` : "Reta na probabilidade"}</span></p>
          <h3 className="rl-tit">Uma reta não garante probabilidades válidas</h3>
          <p className="rl-sub">O efeito é constante em pontos percentuais, mas a previsão pode ultrapassar os limites de 0% e 100%.</p>
        </header>

        <div className="rp-eq">
          <div><p className="rp-eq-k">Reta ajustada na probabilidade</p><p className="rp-eq-f">{equacao()}</p></div>
          <div><p className="rp-eq-k">Unidades</p><p className="rp-eq-u">{EQUACAO_UNIDADES}</p></div>
        </div>

        <div className="rl-corpo rp-corpo">
          <div className="rp-graf">
            <p className="rl-k">{TITULO_GRAF}</p>
            <div className="rp-svg-wrap">
              <svg viewBox={`0 0 ${W} ${H}`} className="rp-svg" role="img" aria-label={`Previsão linear da PD em função da utilização; em ${fmt(util, 0)}% a previsão é ${fmtPct(p)}`}>
                <rect x={sx(DOMINIO[0])} y={sy(1)} width={sx(DOMINIO[1]) - sx(DOMINIO[0])} height={sy(0) - sy(1)} className="rp-valido" />
                {TICKS_Y.map((v) => <g key={v}><line x1={sx(DOMINIO[0])} x2={sx(DOMINIO[1])} y1={sy(v)} y2={sy(v)} className={v === 0 || v === 1 ? "rp-limite" : "rp-grade"} /><text x={ML - 14} y={sy(v) + 7} textAnchor="end" className="rp-tick">{fmt(v * 100, 0)}%</text></g>)}
                {TICKS_X.map((v) => <text key={v} x={sx(v)} y={H - MB + 30} textAnchor="middle" className="rp-tick">{v}%</text>)}
                <text x={sx(50)} y={H - 14} textAnchor="middle" className="rp-eixo">{EIXO_X_T}</text>
                <text x={12} y={MT - 12} className="rp-eixo">{EIXO_Y_T}</text>
                <text x={sx(DOMINIO[1])} y={sy(1) - 10} textAnchor="end" className="rp-lim-t">Limite superior 100%</text>
                <text x={sx(DOMINIO[1])} y={sy(0) + 26} textAnchor="end" className="rp-lim-t">Limite inferior 0%</text>
                {FORA.map((f) => <line key={f.lado} x1={sx(f.de)} y1={sy(previsao(f.de))} x2={sx(f.ate)} y2={sy(previsao(f.ate))} className="rp-fora" />)}
                <path d={reta} className={`rp-reta ${truncado ? "rp-reta--fina" : ""}`} />
                {truncado && <path d={trunc} className="rp-trunc" />}
                {ZERO !== null && <g><line x1={sx(ZERO)} x2={sx(ZERO)} y1={sy(0)} y2={sy(EIXO_Y[0])} className="rp-proj" /><text x={sx(DOMINIO[1])} y={sy(EIXO_Y[0]) - 10} textAnchor="end" className="rp-marca-t">a reta cruza 0% em {fmt(ZERO, 1)}% de utilização</text></g>}
                {comparar && c.possivel && <g className="rp-comp">
                  <line x1={sx(c.util)} y1={sy(truncado ? c.t0 : c.p0)} x2={sx(c.fim)} y2={sy(truncado ? c.t0 : c.p0)} className="rp-comp-l" />
                  <line x1={sx(c.fim)} y1={sy(truncado ? c.t0 : c.p0)} x2={sx(c.fim)} y2={sy(truncado ? c.t1 : c.p1)} className="rp-comp-l" />
                  <circle cx={sx(c.fim)} cy={sy(truncado ? c.t1 : c.p1)} r={9} className="rp-comp-p" />
                  <text x={sx(c.fim) + 14} y={sy(truncado ? Math.max(c.t0, c.t1) : Math.max(c.p0, c.p1)) - 14} className="rp-comp-t">{fmtPp(truncado ? c.deltaTruncada : c.deltaLinear)}</text>
                </g>}
                <line x1={sx(util)} x2={sx(util)} y1={sy(truncado ? t : p)} y2={sy(EIXO_Y[0])} className="rp-proj" />
                <line x1={sx(DOMINIO[0])} x2={sx(util)} y1={sy(truncado ? t : p)} y2={sy(truncado ? t : p)} className="rp-proj" />
                <circle cx={sx(util)} cy={sy(p)} r={11} className={`rp-ponto ${lei.valida ? "" : "rp-ponto--fora"}`} />
                {truncado && <circle cx={sx(util)} cy={sy(t)} r={9} className="rp-ponto rp-ponto--trunc" />}
                <text x={limitar(sx(util) + 18, ML, W - MR - 300)} y={limitar(p < 0.25 ? sy(p) + 40 : sy(p) - 20, MT + 20, H - MB - 8)} className={`rp-ponto-t ${lei.valida ? "" : "rp-ponto-t--fora"}`}>{fmt(util, 0)}% → {fmtPct(p)}</text>
              </svg>
            </div>
            <p className="rp-legenda">
              <span className="rp-leg rp-leg--reta">Reta ajustada</span>
              <span className="rp-leg rp-leg--fora">Fora de 0% a 100%</span>
              {truncado && <span className="rp-leg rp-leg--trunc">Previsão truncada</span>}
            </p>
          </div>

          <aside className="rp-painel">
            <p className="rl-k">{TITULO_CTL}</p>
            <div className="rp-ctl">
              <label htmlFor="rp-range"><b>Utilização:</b> {fmt(util, 0)}%</label>
              <input id="rp-range" type="range" min={DOMINIO[0]} max={DOMINIO[1]} step={1} value={util} onChange={(e) => setUtil(Number(e.target.value))}
                aria-valuetext={`${fmt(util, 0)} por cento; previsão linear ${fmtPct(p)}`} />
            </div>
            <Campo mostrado={String(util)} onValor={setUtil} />
            <div className={`rp-res ${truncado ? "rp-res--duo" : ""}`} aria-live="polite">
              <div><p className="rp-k">Previsão linear</p><p className={`rp-v ${lei.valida ? "" : "rp-v--fora"}`}>{fmtPct(p)}</p></div>
              {truncado && <div><p className="rp-k">Após truncar</p><p className="rp-v rp-v--trunc">{fmtPct(t)}</p></div>}
            </div>
            <div className="rp-lei-area">
              <p className={`rp-lei ${lei.valida ? "" : "rp-lei--fora"}`}>{lei.frase}</p>
              {truncado && <p className="rp-formula">{FORMULA_TRUNCADA}</p>}
            </div>
            <div className="rp-acoes">
              <button type="button" className={`rl-btn rl-btn--mini ${truncado ? "rl-btn--on" : ""}`} aria-pressed={truncado} onClick={() => setTruncado((v) => !v)}>{ROTULO_TRUNCAR}</button>
              <button type="button" className={`rl-btn rl-btn--mini ${comparar ? "rl-btn--on" : ""}`} aria-pressed={comparar} disabled={!c.possivel} onClick={() => setComparar((v) => !v)}>{ROTULO_COMPARAR}</button>
              <button type="button" className="rl-btn rl-btn--mini" onClick={restaurar}>Restaurar exemplo</button>
            </div>
            {!c.possivel && <p className="rp-nota">{c.motivo}</p>}
            {truncado && !(comparar && c.possivel) && <p className="rp-nota">{NOTA_TRUNCAR}</p>}
            {comparar && c.possivel && (
              <div className="rp-comp-box" aria-live="polite">
                <p className="rp-k">De {fmt(c.util, 0)}% para {fmt(c.fim, 0)}% de utilização</p>
                <p className="rp-comp-v">Na reta <b>{fmtPp(c.deltaLinear)}</b>{truncado && <> · Truncada <b className="rp-comp-v--trunc">{fmtPp(c.deltaTruncada)}</b></>}</p>
                <p className="rp-comp-f">{truncado ? FRASE_TRUNCADA : FRASE_RETA}</p>
              </div>
            )}
          </aside>
        </div>

        <div className="rp-base">
          {CONCLUSOES.map((k) => <div key={k.k}><p className="rp-base-k">{k.k}</p><p className="rp-base-t">{k.t}</p></div>)}
          <div><p className="rp-base-k">Próximo passo</p><p className="rp-base-t">{TRANSICAO}</p></div>
        </div>
        <p className="rl-rod nota">{RODAPE}</p>
      </section>
    </figure>
  );
}
