"use client";
import { useEffect, useRef, useState } from "react";
import { CONCLUSAO, EIXO_MAX, ETAPAS, esperados, INCREMENTO_INICIAL, mensagemLimite, N_OPERACOES, NOTA_GRADE, normalizarPd, oddsDe, PD_INICIAL, reguas, visivel, type Etapa } from "@/lib/visuais/escala-probabilidade";

/**
 * Escala 1, probabilidade (capítulo 4, c4p3). Uma PD por operação, cem operações idênticas: quantos defaults esperamos,
 * não quais. Três réguas testam o mesmo incremento em três lugares da escala, sem limitar a 100%. Faixa final: a
 * passagem para odds. Revelação por etapas no palco; tudo à vista no estudo. Contas em src/lib/visuais/escala-probabilidade.ts.
 */
const pct = (v: number) => `${Math.round(v * 100)}%`;
const pl = (n: number, um: string, varios: string) => `${n} ${n === 1 ? um : varios}`;
const RW = 640, RH = 46, RL = 8, RR = 8;
const rx = (v: number) => RL + (v / EIXO_MAX) * (RW - RL - RR);

export function EscalaProbabilidade({ palco = false }: { palco?: boolean }) {
  const [pd, setPd] = useState(PD_INICIAL);
  const [inc, setInc] = useState(INCREMENTO_INICIAL * 100);
  const [etapa, setEtapa] = useState<Etapa>(palco ? "pd" : "tudo");
  const [cheia, setCheia] = useState(false);
  const figRef = useRef<HTMLElement>(null);
  const e = esperados(pd); const o = oddsDe(pd); const rs = reguas(pd, inc); const lim = mensagemLimite(pd, inc); const v = visivel(etapa);
  const restaurar = () => { setPd(PD_INICIAL); setInc(INCREMENTO_INICIAL * 100); setEtapa(palco ? "pd" : "tudo"); };
  useEffect(() => { const f = () => setCheia(Boolean(document.fullscreenElement)); document.addEventListener("fullscreenchange", f); return () => document.removeEventListener("fullscreenchange", f); }, []);
  const telaCheia = () => { if (document.fullscreenElement) void document.exitFullscreen(); else void figRef.current?.requestFullscreen?.(); };
  return (
    <figure className="vz vz-ep" data-vz="escala-probabilidade" data-etapa={etapa} ref={figRef}>
      <header className="vz-cab">
        <div>
          <p className="eyebrow">Regressão logística / Escala 1: probabilidade · cem operações · horizonte ilustrativo de 12 meses</p>
          <p className="vz-tit">PD: quantos esperamos, não quais clientes.</p>
          <p className="vz-ep-sub">A probabilidade expressa o risco no horizonte definido e precisa permanecer entre 0% e 100%.</p>
        </div>
        <div className="vz-acoes" role="group" aria-label="Etapas">
          {ETAPAS.map((t) => <button key={t.id} type="button" className={`btn btn-sm ${etapa === t.id ? "" : "btn-secondary"}`} aria-pressed={etapa === t.id} onClick={() => setEtapa(t.id)}>{t.rotulo}</button>)}
          <button type="button" className="btn btn-sm btn-ghost" onClick={restaurar}>Restaurar</button>
          <button type="button" className="btn btn-sm btn-ghost vz-ep-cheia" onClick={telaCheia}>{cheia ? "Sair da tela cheia" : "Tela cheia"}</button>
        </div>
      </header>
      <div className={`vz-estado ${lim.invalida && v.limites ? "vz-estado--alterado" : "vz-estado--ok"}`} aria-live="polite">
        <b>PD {pct(pd)} por operação: {pl(e.defaults, "default", "defaults")} e {pl(e.adimplentes, "adimplente esperado", "adimplentes esperados")} em {e.total}.</b>{v.limites && <> Com +{inc} pp: {lim.texto}</>}{v.odds && <> Odds {o.valor === null ? "→ ∞" : `= ${o.texto}`}.</>}
      </div>
      <div className="vz-ep-grade">
        <section className="vz-ep-col" aria-labelledby="ep-1">
          <p id="ep-1" className="vz-ep-k"><b>01</b> Interprete a probabilidade</p>
          <div className="vz-ep-pd">
            <p className="vz-ep-num" aria-live="polite">{pct(pd)}</p>
            <div>
              <label className="vz-slider vz-ep-slider"><span className="vz-slider-rotulo"><b>PD por operação</b> <span className="hint">mesmo perfil · horizonte de 12 meses</span></span>
                <span className="vz-ep-ctl"><input type="range" min={0} max={100} step={1} value={Math.round(pd * 100)} onChange={(ev) => setPd(normalizarPd(Number(ev.target.value) / 100))} aria-label="PD por operação" aria-valuetext={pct(pd)} />
                  <span className="vz-ep-num-in"><input type="number" inputMode="numeric" min={0} max={100} step={1} value={Math.round(pd * 100)} onChange={(ev) => { const n = Number(ev.target.value); if (ev.target.value !== "" && Number.isFinite(n)) setPd(normalizarPd(n / 100)); }} aria-label="PD por operação, em porcentagem" /><span>%</span></span></span></label>
            </div>
          </div>
          <div className="vz-ep-cem" role="img" aria-label={`Cem operações: ${e.defaults} defaults esperados e ${e.adimplentes} adimplentes esperados`} data-testid="grade-cem">
            {Array.from({ length: N_OPERACOES }, (_, i) => <i key={i} className={i < e.defaults ? "vz-ep-q vz-ep-q--default" : "vz-ep-q vz-ep-q--pagou"} />)}
          </div>
          <p className="vz-ep-cont"><b className="vz-ep-cont-d">{pl(e.defaults, "default esperado", "defaults esperados")}</b> <span>e {pl(e.adimplentes, "adimplente esperado", "adimplentes esperados")} em {e.total} operações.</span></p>
          <p className="vz-ep-nota">{NOTA_GRADE}</p>
        </section>
        <section className={`vz-ep-col vz-ep-col--lim ${v.limites ? "" : "vz-ep-oculto"}`} aria-labelledby="ep-2" aria-hidden={!v.limites}>
          <p id="ep-2" className="vz-ep-k"><b>02</b> Teste os limites da escala</p>
          <p className="vz-ep-perg">Somar +{inc} pp funciona em toda a escala?</p>
          <p className="hint">A mesma soma, aplicada diretamente à PD, pode produzir uma probabilidade impossível. É uma hipótese didática, não uma estimativa causal nem uma mudança de utilização.</p>
          <label className="vz-slider vz-ep-slider"><span className="vz-slider-rotulo"><b>Incremento na PD</b> <span className="vz-slider-valor">+{inc} pp</span></span>
            <span className="vz-ep-ctl"><input type="range" min={0} max={20} step={1} value={inc} onChange={(ev) => setInc(Number(ev.target.value))} aria-label="Incremento na PD, em pontos percentuais" aria-valuetext={`+${inc} pp`} />
              <span className="vz-ep-num-in"><input type="number" inputMode="numeric" min={0} max={20} step={1} value={inc} onChange={(ev) => { const n = Number(ev.target.value); if (ev.target.value !== "" && Number.isFinite(n)) setInc(Math.min(20, Math.max(0, Math.round(n)))); }} aria-label="Incremento na PD, campo em pontos percentuais" /><span>pp</span></span></span></label>
          <div className="vz-ep-reguas">
            {rs.map((r, i) => (
              <div key={i} className="vz-ep-regua">
                <p className={`vz-ep-regua-t ${r.valido ? "" : "vz-ep-regua-t--invalida"}`}>{r.rotulo}{r.selecionada && <span className="hint"> · PD selecionada</span>}</p>
                <svg viewBox={`0 0 ${RW} ${RH}`} role="img" aria-label={`${r.rotulo}${r.valido ? "" : ", acima de 100%"}`}>
                  <rect x={rx(1)} y={4} width={rx(EIXO_MAX) - rx(1)} height={RH - 8} className="vz-ep-invalido" />
                  <line x1={rx(0)} x2={rx(EIXO_MAX)} y1={RH / 2} y2={RH / 2} className="vz-ep-eixo" />
                  <line x1={rx(1)} x2={rx(1)} y1={2} y2={RH - 2} className="vz-ep-cem-linha" />
                  <line x1={rx(r.de)} x2={rx(r.para) - (r.para > r.de ? 6 : 0)} y1={RH / 2} y2={RH / 2} className={`vz-ep-seta ${r.valido ? "" : "vz-ep-seta--invalida"}`} />
                  {r.para > r.de && <polygon points={`${rx(r.para)},${RH / 2} ${rx(r.para) - 12},${RH / 2 - 6} ${rx(r.para) - 12},${RH / 2 + 6}`} className={`vz-ep-ponta ${r.valido ? "" : "vz-ep-ponta--invalida"}`} />}
                  <circle cx={rx(r.de)} cy={RH / 2} r={6} className={`vz-ep-inicio ${r.valido ? "" : "vz-ep-inicio--invalida"}`} />
                  {i === rs.length - 1 && [0, 0.5, 1].map((t) => <text key={t} x={rx(t)} y={RH - 2} textAnchor={t === 1 ? "end" : t === 0 ? "start" : "middle"} className="vz-tick">{pct(t)}</text>)}
                  {i === 0 && <text x={rx(1) + 4} y={12} className="vz-tick vz-tick--default">inválido</text>}
                </svg>
              </div>
            ))}
          </div>
          <p className={`vz-ep-lim ${lim.invalida ? "vz-ep-lim--invalida" : "vz-ep-lim--valida"}`} data-testid="mensagem-limite">{lim.texto}</p>
          <p className="hint">{CONCLUSAO} O efeito constante pode ser uma aproximação num intervalo restrito; a limitação global da escala é o que motiva odds e log odds.</p>
        </section>
      </div>
      <div className={`vz-ep-faixa ${v.odds ? "" : "vz-ep-oculto"}`} aria-hidden={!v.odds} data-testid="faixa-odds">
        <div>
          <p className="vz-ep-faixa-k">Próxima escala: odds</p>
          <p className="vz-ep-faixa-t">Compare defaults esperados com adimplentes esperados.</p>
          <p className="vz-ep-faixa-l">{o.leitura}</p>
        </div>
        <div className="vz-ep-odds">
          <p className="vz-ep-odds-f">odds = <span className="vz-ep-frac"><span>p</span><span>1 − p</span></span></p>
          <p className="vz-ep-odds-v">{o.conta}</p>
        </div>
      </div>
      <p className="vz-fonte">Exemplo ilustrativo; pp = pontos percentuais. Expectativa de defaults E[D] = {N_OPERACOES} × {pd.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} = {e.defaults}, pela soma das probabilidades das {N_OPERACOES} operações, sem hipótese de independência. A PD é de cada operação; o número realizado varia em torno da expectativa. Odds é a razão entre a probabilidade do evento e a do não evento na mesma operação, não uma razão de chances entre dois grupos.</p>
    </figure>
  );
}
