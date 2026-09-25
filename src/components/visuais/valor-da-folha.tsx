"use client";
import { useRef, useState } from "react";
import { acimaDoMinimo, CARTOES, FOLHAS, FOLHA_INICIAL, FORMULAS, fmtNum, fmtPct, frequencia, leitura, NOME_ARVORE, noMinimo, penalidade, perdaMedia, perdaMinima, pura, RODAPE, SUBTITULO, TITULO, TITULO_CTL, TITULO_CURVA, V_INICIAL, V_MAX, V_MIN, V_PASSO, type Folha } from "@/lib/visuais/valor-da-folha";
import { ComTex, Tex } from "./tex";

/**
 * A PD da folha é a frequência da folha (c5p12), no quadro 16:9 do sistema .rl. Na faixa, a PD como d ÷ n e a perda
 * média da folha em KaTeX; à esquerda, o que cada proposta da folha paga com o valor v escolhido (barras vinho para
 * quem deu default, azuis para quem pagou) e a média, que é a perda da folha; ao centro, a curva da perda média para
 * cada v, com o mínimo na frequência; à direita, o painel, com a folha (das árvores de um e de dois cortes) e o valor.
 * Clicar ou arrastar sobre a curva também move v. Contas em src/lib/visuais/valor-da-folha.ts. Substitui a versão com
 * a folha simétrica de 1 default em 2, em que o mínimo em 50% parecia o meio da escala, e não a frequência.
 */
const BW = 520, BH = 420, BML = 58, BMR = 12, BMT = 34, BMB = 64, BYMAX = 4.8;
const BY0 = BH - BMB;
const by = (x: number) => BMT + (1 - Math.min(x, BYMAX) / BYMAX) * (BY0 - BMT);

function Barras({ f, v }: { f: Folha; v: number }) {
  const props = [...Array<boolean>(f.d).fill(true), ...Array<boolean>(f.n - f.d).fill(false)];
  const passo = (BW - BML - BMR) / props.length, larg = Math.min(58, passo * 0.62);
  const media = perdaMedia(f.d, f.n, v);
  const aria = `Com v = ${fmtPct(v, 1)}, ${f.d ? `cada default paga ${fmtNum(penalidade(true, v), 2)}` : "não há default"} e ${f.n - f.d ? `cada proposta que pagou paga ${fmtNum(penalidade(false, v), 2)}` : "não há proposta que pagou"}; a média, ${fmtNum(media, 4)}, é a perda da folha.`;
  return (
    <svg viewBox={`0 0 ${BW} ${BH}`} className="fv-svg" role="img" aria-label={aria}>
      <rect x={BML} y={BMT} width={BW - BML - BMR} height={BY0 - BMT} className="fv-fundo" />
      {[0, 1, 2, 3, 4].map((t) => <g key={t}><line x1={BML} x2={BW - BMR} y1={by(t)} y2={by(t)} className={t ? "fv-grade" : "fv-zero"} /><text x={BML - 14} y={by(t) + 7} textAnchor="end" className="fv-tick">{t}</text></g>)}
      {props.map((dd, i) => { const x = BML + passo * (i + 0.5), val = penalidade(dd, v); return <rect key={`b${i}`} x={x - larg / 2} y={by(val)} width={larg} height={Math.max(0, by(0) - by(val))} rx={4} className={`fv-barra ${dd ? "fv-barra--d" : "fv-barra--p"}`} />; })}
      {/* a média passa por trás dos valores, que têm halo da cor do fundo */}
      <line x1={BML} x2={BW - BMR} y1={by(media)} y2={by(media)} className="fv-media" />
      {props.map((dd, i) => {
        const x = BML + passo * (i + 0.5), val = penalidade(dd, v);
        return (
          <g key={`t${i}`}>
            <text x={x} y={by(val) - 9} textAnchor="middle" className="fv-barra-v">{fmtNum(val, 2)}</text>
            <circle cx={x} cy={BY0 + 30} r={12} className={`fv-token ${dd ? "fv-token--d" : "fv-token--p"}`} />
          </g>
        );
      })}
    </svg>
  );
}

// MR 22: o rótulo "100%", centrado na ponta do eixo, tem cerca de 54 de largura na letra de 19
const CW = 600, CH = 420, CML = 58, CMR = 30, CMT = 18, CMB = 64, CYMAX = 3;
const CX0 = CML, CX1 = CW - CMR, CY0 = CH - CMB;
const cx = (v: number) => CX0 + v * (CX1 - CX0);
const cy = (l: number) => CMT + (1 - Math.min(l, CYMAX) / CYMAX) * (CY0 - CMT);
const caminho = (f: Folha) => {
  const pts: string[] = [];
  for (let k = 1; k < 500; k++) { const v = k / 500; pts.push(`${pts.length ? "L" : "M"}${cx(v).toFixed(1)} ${cy(perdaMedia(f.d, f.n, v)).toFixed(1)}`); }
  return pts.join("");
};
const CURVAS = new Map(FOLHAS.map((f) => [f.k, caminho(f)]));

function Curva({ f, v, onV }: { f: Folha; v: number; onV: (v: number) => void }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const arrastando = useRef(false);
  const l = perdaMedia(f.d, f.n, v), fora = l > CYMAX;
  const vm = pura(f) ? (f.d ? 1 : 0) : frequencia(f), lm = perdaMinima(f);
  const mover = (ev: React.PointerEvent) => {
    const svg = svgRef.current; if (!svg) return;
    const m = svg.getScreenCTM(); if (!m) return;
    const pt = svg.createSVGPoint(); pt.x = ev.clientX; pt.y = ev.clientY;
    const loc = pt.matrixTransform(m.inverse());
    const bruto = (loc.x - CX0) / (CX1 - CX0);
    onV(Math.min(V_MAX, Math.max(V_MIN, Math.round(bruto / V_PASSO) * V_PASSO)));
  };
  return (
    <svg ref={svgRef} viewBox={`0 0 ${CW} ${CH}`} className="fv-svg" role="img"
      aria-label={`Perda média da folha de ${f.d} default${f.d === 1 ? "" : "s"} em ${f.n}: ${fmtNum(l, 4)} com v = ${fmtPct(v, 1)}; mínimo ${fmtNum(lm, 4)} em ${fmtPct(vm, 1)}.`}>
      <defs><clipPath id="fv-area"><rect x={CX0} y={CMT} width={CX1 - CX0} height={CY0 - CMT} /></clipPath></defs>
      <rect x={CX0} y={CMT} width={CX1 - CX0} height={CY0 - CMT} className="fv-fundo" />
      {[0, 1, 2, 3].map((t) => <g key={t}><line x1={CX0} x2={CX1} y1={cy(t)} y2={cy(t)} className={t ? "fv-grade" : "fv-zero"} /><text x={CX0 - 18} y={cy(t) + 7} textAnchor="end" className="fv-tick">{t}</text></g>)}
      {[0, 0.25, 0.5, 0.75, 1].map((t) => <text key={t} x={cx(t)} y={CY0 + 28} textAnchor="middle" className="fv-tick">{fmtPct(t)}</text>)}
      <text x={(CX0 + CX1) / 2} y={CH - 8} textAnchor="middle" className="fv-eixo">valor v atribuído à folha</text>
      <line x1={cx(vm)} x2={cx(vm)} y1={CY0} y2={cy(lm)} className="fv-guia fv-guia--min" />
      <path d={CURVAS.get(f.k)} className="fv-curva" clipPath="url(#fv-area)" />
      <line x1={cx(v)} x2={cx(v)} y1={CY0} y2={fora ? CMT : cy(l)} className="fv-guia" />
      <circle cx={cx(vm)} cy={cy(lm)} r={11} className="fv-ponto fv-ponto--min" />
      {fora ? <path d={`M${cx(v) - 11} ${CMT + 16} L${cx(v)} ${CMT} L${cx(v) + 11} ${CMT + 16} Z`} className="fv-ponto fv-ponto--v" />
        : !noMinimo(f, v) && <circle cx={cx(v)} cy={cy(l)} r={10} className="fv-ponto fv-ponto--v" />}
      {noMinimo(f, v) && <circle cx={cx(v)} cy={cy(l)} r={17} className="fv-anel" />}
      <rect x={CX0} y={CMT} width={CX1 - CX0} height={CY0 - CMT} className="fv-alvo" aria-hidden="true"
        onPointerDown={(ev) => { arrastando.current = true; ev.currentTarget.setPointerCapture(ev.pointerId); mover(ev); }}
        onPointerMove={(ev) => { if (arrastando.current) mover(ev); }}
        onPointerUp={() => { arrastando.current = false; }} onPointerCancel={() => { arrastando.current = false; }} />
    </svg>
  );
}

export function ValorDaFolha({ pagina }: { pagina?: { index: number; total: number } }) {
  const [folha, setFolha] = useState<Folha>(FOLHA_INICIAL);
  const [v, setV] = useState(V_INICIAL);
  const p = frequencia(folha), l = perdaMedia(folha.d, folha.n, v), lm = perdaMinima(folha);
  const ponta = folha.d ? V_MAX : V_MIN;
  const irAoMinimo = () => setV(pura(folha) ? ponta : p);
  const restaurar = () => { setFolha(FOLHA_INICIAL); setV(V_INICIAL); };
  const chip = (f: Folha) => (
    <button key={f.k} type="button" className={`rl-btn rl-btn--mini ${f.k === folha.k ? "rl-btn--on" : ""}`} aria-pressed={f.k === folha.k}
      aria-label={`${NOME_ARVORE[f.arvore]}. ${f.onde} ${f.d} default${f.d === 1 ? "" : "s"} em ${f.n} propostas.`} onClick={() => setFolha(f)}>{f.d} de {f.n}</button>
  );
  return (
    <figure className="vz rl fv" data-vz="valor-da-folha">
      <section className="rl-slide" data-tela="12">
        <header className="rl-cab">
          <p className="rl-meta eyebrow"><span>Aula 2 · Capítulo 5 · Árvores de decisão</span><span>{pagina ? `${String(pagina.index).padStart(2, "0")} / ${pagina.total}` : "A PD da folha"}</span></p>
          <h3 className="rl-tit">{TITULO}</h3>
          <p className="rl-sub">{SUBTITULO}</p>
        </header>

        <div className="fv-eq">
          {FORMULAS.map((f) => <div key={f.k}><p className="fv-eq-k">{f.k}</p><Tex f={f.tex} className="fv-eq-f" /></div>)}
        </div>

        <div className="rl-corpo fv-corpo">
          <div className="fv-col">
            <p className="rl-k">O que cada proposta paga com v = {fmtPct(v, 1)}</p>
            <div className="fv-svg-wrap"><Barras f={folha} v={v} /></div>
            <p className="fv-legenda"><span className="fv-leg fv-leg--d">deu default: <Tex f={String.raw`-\ln v`} className="tx-linha" /></span><span className="fv-leg fv-leg--p">pagou: <Tex f={String.raw`-\ln(1 - v)`} className="tx-linha" /></span><span className="fv-leg fv-leg--m">média: {fmtNum(l, 4)}</span></p>
          </div>

          <div className="fv-col">
            <p className="rl-k">{TITULO_CURVA}</p>
            <div className="fv-svg-wrap"><Curva f={folha} v={v} onV={setV} /></div>
            <p className="fv-legenda"><span className="fv-leg fv-leg--min">mínimo, em {pura(folha) ? fmtPct(folha.d ? 1 : 0) : fmtPct(p, 1)}</span><span className="fv-leg fv-leg--v">v escolhido</span></p>
          </div>

          <aside className="fv-painel">
            <p className="rl-k">{TITULO_CTL}</p>
            <div className="fv-folhas" role="group" aria-label="Folha">
              <div className="fv-grupo"><span>Um corte</span>{FOLHAS.filter((f) => f.arvore === 1).map(chip)}</div>
              <div className="fv-grupo"><span>Dois cortes</span>{FOLHAS.filter((f) => f.arvore === 2).map(chip)}</div>
            </div>
            <p className="fv-onde">{folha.onde}</p>
            <div className="fv-ctl">
              <label htmlFor="fv-v"><b>Valor atribuído, v:</b> {fmtPct(v, 1)}</label>
              <input id="fv-v" type="range" min={V_MIN * 100} max={V_MAX * 100} step={V_PASSO * 100} value={Math.round(v * 1000) / 10}
                onChange={(e) => setV(Math.round(Number(e.target.value) * 10) / 1000)} aria-valuetext={`${fmtPct(v, 1)}; perda média ${fmtNum(l, 4)}`} />
            </div>
            <dl className="fv-res" aria-live="polite">
              <div><dt>Perda média com v</dt><dd>{fmtNum(l, 4)}</dd></div>
              <div><dt>Mínimo, em {pura(folha) ? fmtPct(folha.d ? 1 : 0) : fmtPct(p, 1)}</dt><dd className="fv-res-m">{fmtNum(lm, 4)}</dd></div>
              <div><dt>Acima do mínimo</dt><dd className="fv-res-a">{fmtNum(acimaDoMinimo(folha, v), 4)}</dd></div>
            </dl>
            <p className="fv-lei"><ComTex t={leitura(folha, v)} /></p>
            <div className="fv-acoes">
              <button type="button" className="rl-btn rl-btn--mini" onClick={irAoMinimo}>{pura(folha) ? `Ir para ${fmtPct(ponta)}` : "Ir ao mínimo"}</button>
              <button type="button" className="rl-btn rl-btn--mini" onClick={restaurar}>Restaurar exemplo</button>
            </div>
          </aside>
        </div>

        <div className="fv-base">
          {CARTOES.map((k) => <div key={k.k}><p className="fv-base-k">{k.k}</p><p className="fv-base-t"><ComTex t={k.t} /></p></div>)}
        </div>
        <p className="rl-rod nota"><ComTex t={RODAPE} /></p>
      </section>
    </figure>
  );
}
