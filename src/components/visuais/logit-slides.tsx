"use client";
import { useState } from "react";
import { ATALHOS_DELTA, cenarios, contaUnidade, efeitoCoeficiente, escoreTex, escoreTexto, EXEMPLO, fmt, fmtPct, fmtPp, FORMULA_M, FORMULA_M_TEX, FORMULA_PD, FORMULA_PD_TEX, FORMULA_PNOVO, FORMULA_PNOVO_TEX, FORMULA_Z, FORMULA_Z_TEX, FRASE_COEFICIENTE, fraseDeltaX, interpretarPd, JANELA_Z, LIMITES, potenciaTex, potenciaTexto, proposta, sigmoide } from "@/lib/visuais/logit-slides";
import { ComTex, Tex } from "./tex";

/**
 * Dois primeiros slides do capítulo 4 (c4p1), em quadros 16:9 com sistema visual próprio: (1) como o logit transforma
 * uma proposta em PD, com as características como controles e coeficientes fixos; (2) o que um coeficiente significa,
 * com a transformação +10 pp → +0,7453 em z → × 2,11 nas odds e as quatro réguas de partida. Um só estado alimenta
 * tudo; contas em src/lib/visuais/logit-slides.ts. No palco cada quadro é uma tela; no estudo, os dois em sequência.
 * Fórmulas e contas em KaTeX desde 24/09/2026, com o texto como rótulo acessível; nas frases, trechos em linha (ComTex).
 */
const pad = (n: number) => String(n).padStart(2, "0");
const clamp = (v: number, [lo, hi]: readonly [number, number]) => Math.min(hi, Math.max(lo, v));

function Controle({ id, rotulo, valor, unidade, min, max, onChange, cor, destaque, explicacao }: { id: string; rotulo: string; valor: number; unidade: string; min: number; max: number; onChange: (v: number) => void; cor: "ambar" | "roxo"; destaque: string; explicacao: { texto: string; tex: string } }) {
  return (
    <div className="rl-ctl">
      <p className="rl-ctl-rot" id={`${id}-rot`}>{rotulo}</p>
      <p className={`rl-num rl-num--${cor}`}>{destaque}</p>
      <div className="rl-ctl-linha">
        <input type="range" min={min} max={max} step={1} value={valor} onChange={(e) => onChange(Number(e.target.value))} aria-labelledby={`${id}-rot`} aria-valuetext={destaque} />
        <span className="rl-ctl-num"><input type="number" inputMode="numeric" min={min} max={max} step={1} value={valor} onChange={(e) => { const n = Number(e.target.value); if (e.target.value !== "" && Number.isFinite(n)) onChange(clamp(Math.round(n), [min, max])); }} aria-label={`${rotulo}, campo`} /><span>{unidade}</span></span>
      </div>
      <p className="rl-exp" role="img" aria-label={explicacao.texto}><Tex f={explicacao.tex} className="tx-linha" /></p>
    </div>
  );
}

const CW = 580, CH = 220, CL = 46, CR = 14, CT = 16, CB = 36;
const cx = (z: number) => CL + ((z - JANELA_Z.min) / (JANELA_Z.max - JANELA_Z.min)) * (CW - CL - CR);
const cy = (p: number) => CT + (1 - p) * (CH - CT - CB);

function Curva({ z, pd, fora }: { z: number; pd: number; fora: "esquerda" | "direita" | null }) {
  const d = Array.from({ length: 121 }, (_, i) => JANELA_Z.min + i * 0.1).map((v, i) => `${i ? "L" : "M"}${cx(v).toFixed(1)} ${cy(sigmoide(v)).toFixed(1)}`).join("");
  const esq = z > 0; const lx = esq ? cx(z) - 12 : cx(z) + 12; const ly = Math.max(CT + 12, cy(pd) - 14);
  return (
    <svg viewBox={`0 0 ${CW} ${CH}`} className="rl-curva" role="img" aria-label={`Função logística: z ${fmt(z, 4)} corresponde a PD ${fmtPct(pd)}`}>
      {[0, 0.5, 1].map((p) => <g key={p}><line x1={cx(JANELA_Z.min)} x2={cx(JANELA_Z.max)} y1={cy(p)} y2={cy(p)} className="rl-grade" /><text x={CL - 8} y={cy(p) + 4} textAnchor="end" className="rl-tick">{fmtPct(p, 0)}</text></g>)}
      {[-6, -3, 0, 3, 6].map((v) => <text key={v} x={cx(v)} y={CH - CB + 16} textAnchor="middle" className="rl-tick">{v < 0 ? `−${-v}` : v > 0 ? `+${v}` : "0"}</text>)}
      <text x={cx(0)} y={CH - 4} textAnchor="middle" className="rl-tick">escore z</text>
      <path d={d} className="rl-curva-l" />
      {fora === null && <>
        <line x1={cx(z)} x2={cx(z)} y1={cy(pd)} y2={cy(0)} className="rl-proj" /><line x1={cx(JANELA_Z.min)} x2={cx(z)} y1={cy(pd)} y2={cy(pd)} className="rl-proj" />
        <circle cx={cx(z)} cy={cy(pd)} r={7} className="rl-ponto" />
        <text x={lx} y={ly} textAnchor={esq ? "end" : "start"} className="rl-ponto-t">z {fmt(z, 2)} · PD {fmtPct(pd)}</text>
      </>}
      {fora !== null && <g><polygon points={fora === "direita" ? `${cx(JANELA_Z.max)},${cy(pd)} ${cx(JANELA_Z.max) - 12},${cy(pd) - 7} ${cx(JANELA_Z.max) - 12},${cy(pd) + 7}` : `${cx(JANELA_Z.min)},${cy(pd)} ${cx(JANELA_Z.min) + 12},${cy(pd) - 7} ${cx(JANELA_Z.min) + 12},${cy(pd) + 7}`} className="rl-ponto" /><text x={fora === "direita" ? cx(JANELA_Z.max) - 16 : cx(JANELA_Z.min) + 16} y={cy(pd) + (pd > 0.5 ? 20 : -12)} textAnchor={fora === "direita" ? "end" : "start"} className="rl-ponto-t">fora da faixa: z {fmt(z, 2)}</text></g>}
    </svg>
  );
}

const RW = 1280, RH = 400, RL = 120, RR = 1080, RT = 44, ROWS = 4, RSTEP = (RH - RT - 40) / ROWS;
const rx = (p: number) => RL + p * (RR - RL);

function Reguas({ deltaPp }: { deltaPp: number }) {
  const linhas = cenarios(deltaPp);
  return (
    <svg viewBox={`0 0 ${RW} ${RH}`} className="rl-reguas" role="img" aria-label={`Quatro cenários: ${linhas.map((l) => `${fmtPct(l.p0)} para ${fmtPct(l.p1)}`).join("; ")}`}>
      {[0, 0.25, 0.5, 0.75, 1].map((p) => <g key={p}><line x1={rx(p)} x2={rx(p)} y1={RT - 6} y2={RH - 30} className="rl-grade" /><text x={rx(p)} y={RT - 14} textAnchor="middle" className="rl-tick">{fmtPct(p, 0)}</text></g>)}
      <text x={RR + 40} y={RT - 14} textAnchor="start" className="rl-tick">variação</text>
      {linhas.map((l, i) => {
        const y = RT + RSTEP * (i + 0.55); const x0 = rx(l.p0), x1 = rx(l.p1); const perto = Math.abs(x1 - x0) < 70;
        const sobe = l.p1 >= l.p0;
        return (
          <g key={l.p0}>
            <line x1={rx(0)} x2={rx(1)} y1={y} y2={y} className="rl-eixo" />
            <text x={RL - 16} y={y + 5} textAnchor="end" className="rl-regua-rot">PD {fmtPct(l.p0, 0)}</text>
            {l.semMudanca ? <>
              <circle cx={x0} cy={y} r={9} className="rl-p-ini" /><text x={x0} y={y - 16} textAnchor="middle" className="rl-regua-v">{fmtPct(l.p0)} · sem mudança</text>
            </> : <>
              <line x1={x0} x2={x1 + (sobe ? -8 : 8)} y1={y} y2={y} className="rl-seg" />
              <polygon points={sobe ? `${x1},${y} ${x1 - 12},${y - 6} ${x1 - 12},${y + 6}` : `${x1},${y} ${x1 + 12},${y - 6} ${x1 + 12},${y + 6}`} className="rl-seg-ponta" />
              <circle cx={x0} cy={y} r={9} className="rl-p-ini" /><circle cx={x1} cy={y} r={9} className="rl-p-fim" />
              <text x={x0} y={y - 16} textAnchor="middle" className="rl-regua-v">{fmtPct(l.p0)}</text>
              <text x={x1} y={perto ? y + 30 : y - 16} textAnchor="middle" className="rl-regua-v rl-regua-v--fim">{fmtPct(l.p1)}</text>
            </>}
            <text x={RR + 40} y={y + 5} textAnchor="start" className={`rl-regua-d ${l.semMudanca ? "rl-regua-d--zero" : ""}`}>{l.semMudanca ? "0,00 pp" : `≈ ${fmtPp(l.deltaPp)}`}</text>
          </g>
        );
      })}
    </svg>
  );
}

export function LogitSlides({ pagina }: { palco?: boolean; pagina?: { index: number; total: number } }) {
  const [util, setUtil] = useState(EXEMPLO.util);
  const [atraso, setAtraso] = useState(EXEMPLO.atraso);
  const [delta, setDelta] = useState(10);
  const [conta, setConta] = useState(false);
  const p = proposta(util, atraso); const e = efeitoCoeficiente(delta);
  const numero = (k: number) => (pagina ? `${pad(pagina.index + k)} / ${pagina.total}` : pad(1 + k));
  const meta = "Aula 2 · Capítulo 4 · Regressão logística";
  return (
    <figure className="vz rl" data-vz="logit-slides" data-unidades="">
      <section className="rl-slide" data-tela="1" aria-label="Como o logit transforma uma proposta em PD">
        <header className="rl-cab">
          <div className="rl-meta eyebrow"><span>{meta}</span><span>{numero(0)}</span></div>
          <h2 className="rl-tit">Como o logit transforma uma proposta em PD</h2>
          <p className="rl-sub">As características geram contribuições; a soma passa pela função logística e se torna uma probabilidade.</p>
        </header>
        <div className="rl-corpo rl-corpo--3">
          <div className="rl-col">
            <p className="rl-k">01 · Características da proposta</p>
            <Controle id="rl-util" rotulo="Utilização do limite" valor={util} unidade="%" min={LIMITES.util[0]} max={LIMITES.util[1]} onChange={setUtil} cor="ambar" destaque={`${util}%`} explicacao={contaUnidade(util, "util")} />
            <Controle id="rl-atraso" rotulo="Atraso observado" valor={atraso} unidade="dias" min={LIMITES.atraso[0]} max={LIMITES.atraso[1]} onChange={setAtraso} cor="roxo" destaque={`${atraso} ${atraso === 1 ? "dia" : "dias"}`} explicacao={contaUnidade(atraso, "atraso")} />
            <button type="button" className="rl-btn" onClick={() => { setUtil(EXEMPLO.util); setAtraso(EXEMPLO.atraso); }}>Restaurar exemplo</button>
          </div>
          <span className="rl-conector" aria-hidden="true">→</span>
          <div className="rl-col">
            <p className="rl-k">02 · Soma das contribuições</p>
            <p className="rl-formula" role="img" aria-label={FORMULA_Z}><Tex f={FORMULA_Z_TEX} /></p>
            <dl className="rl-parcelas">
              {p.parcelas.map((q) => <div key={q.id} className={`rl-parcela rl-parcela--${q.cor}`}><dt>{q.rotulo}{q.conta && <span className="rl-parcela-c"> · <span role="img" aria-label={q.conta}><Tex f={q.contaTex} className="tx-linha" /></span></span>}</dt><dd>{fmt(q.valor, 4, true)}</dd></div>)}
            </dl>
            <div className="rl-escore"><p className="rl-escore-rot">Escore do modelo</p><p className="rl-escore-v" role="img" aria-label={escoreTexto(p.z)}><Tex f={escoreTex(p.z)} /></p></div>
            <p className="rl-exp">Essa soma está na escala de log odds.</p>
          </div>
          <span className="rl-conector" aria-hidden="true">→</span>
          <div className="rl-col rl-col--pd">
            <p className="rl-k">03 · Probabilidade estimada</p>
            <p className="rl-pd" aria-live="polite">{fmtPct(p.pd)}</p>
            <p className="rl-pd-rot">probabilidade estimada de default</p>
            <Curva z={p.z} pd={p.pd} fora={p.foraDaJanela} />
            <p className="rl-formula rl-formula--pd" role="img" aria-label={FORMULA_PD}><Tex f={FORMULA_PD_TEX} /></p>
          </div>
        </div>
        <div className="rl-faixa"><p className="rl-faixa-t">{interpretarPd(p.pd)}</p><p className="rl-faixa-s">É uma frequência esperada pelo modelo, não uma certeza sobre esta proposta.</p></div>
        <p className="rl-rod nota">A seguir: o que significa aumentar uma característica em uma unidade?</p>
      </section>

      <section className="rl-slide" data-tela="2" aria-label="O coeficiente soma no escore e multiplica as odds">
        <header className="rl-cab">
          <div className="rl-meta eyebrow"><span>{meta}</span><span>{numero(1)}</span></div>
          <h2 className="rl-tit">O coeficiente soma no escore e multiplica as odds</h2>
          <p className="rl-sub">Na probabilidade, o impacto depende do ponto de partida, mantidas as demais variáveis.</p>
        </header>
        <div className="rl-transf" aria-live="polite">
          <div className="rl-etapa"><p className="rl-etapa-k">Na característica</p><p className="rl-etapa-v rl-num--ambar">{fmt(delta, 0, true)} pp de utilização</p></div>
          <span className="rl-conector" aria-hidden="true">→</span>
          <div className="rl-etapa"><p className="rl-etapa-k">No escore z</p><p className="rl-etapa-v">{fmt(e.dz, 4, true)}</p></div>
          <span className="rl-conector" aria-hidden="true">→</span>
          <div className="rl-etapa"><p className="rl-etapa-k">Nas odds</p><p className="rl-etapa-v rl-num--verde">× {fmt(e.m, 2)}</p><p className="rl-etapa-n" role="img" aria-label={potenciaTexto(e.dz, e.m)}><Tex f={potenciaTex(e.dz, e.m)} /></p></div>
        </div>
        <div className="rl-corpo rl-corpo--2">
          <div className="rl-painel">
            <p className="rl-k">Experimente o tamanho da mudança</p>
            <p className="rl-ctl-rot" id="rl-delta-rot">Variação da utilização: <b>{fmt(delta, 0, true)} pp</b></p>
            <input type="range" min={LIMITES.delta[0]} max={LIMITES.delta[1]} step={1} value={delta} onChange={(ev) => setDelta(Number(ev.target.value))} aria-labelledby="rl-delta-rot" aria-valuetext={`${fmt(delta, 0, true)} pp`} className="rl-range" />
            <div className="rl-atalhos" role="group" aria-label="Atalhos">{ATALHOS_DELTA.map((a) => <button key={a} type="button" className={`rl-btn rl-btn--mini ${a === delta ? "rl-btn--on" : ""}`} aria-pressed={a === delta} onClick={() => setDelta(a)}>{a === 0 ? "0" : fmt(a, 0, true) + " pp"}</button>)}</div>
            <p className="rl-exp"><ComTex t={FRASE_COEFICIENTE} /></p>
            <dl className="rl-res"><div><dt>Variação do escore</dt><dd>{fmt(e.dz, 4, true)}</dd></div><div><dt>Multiplicador das odds</dt><dd className="rl-num--verde">{fmt(e.m, 2)}×</dd></div></dl>
            <p className="rl-obs">Dobrar as odds não significa dobrar a PD.</p>
            <button type="button" className="rl-btn" aria-pressed={conta} onClick={() => setConta((v) => !v)}>{conta ? "Ocultar a conta" : "Ver a conta"}</button>
            <div className={`rl-conta ${conta ? "" : "rl-conta--oculta"}`} aria-hidden={!conta}>
              <p className="rl-formula rl-formula--conta"><span role="img" aria-label={FORMULA_PNOVO}><Tex f={FORMULA_PNOVO_TEX} /></span><span role="img" aria-label={FORMULA_M}><Tex f={FORMULA_M_TEX} /></span></p>
              <p className="rl-exp"><ComTex t={fraseDeltaX(delta)} /></p>
            </div>
          </div>
          <div className="rl-graf">
            <p className="rl-k">O mesmo multiplicador, impactos diferentes na PD</p>
            <Reguas deltaPp={delta} />
            <p className="rl-exp">Quatro cenários de partida com o mesmo multiplicador das odds, não quatro observações de uma base real.</p>
          </div>
        </div>
        <div className="rl-faixa"><p className="rl-faixa-t">Mesmo incremento em z. Mesmo multiplicador nas odds. Diferentes variações na PD.</p><p className="rl-faixa-s">No modelo apresentado, essa interpretação vale mantendo as demais variáveis constantes, sem interações envolvendo a utilização.</p></div>
        <p className="rl-rod nota">A seguir: as três escalas do risco, uma por uma.</p>
      </section>
    </figure>
  );
}
