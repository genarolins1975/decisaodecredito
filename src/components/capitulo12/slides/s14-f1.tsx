"use client";
import { useState } from "react";
import { Botao, Controle, Formula, Grafico, Painel, Quadro, type Pagina } from "@/components/capitulo7/base";
import { COR } from "../b2";
import { CV, FONTE_MNIST, M_SGD } from "@/lib/capitulo12/dados";
import { mediaHarmonica, mediaSimples } from "@/lib/capitulo12/metricas";
import { SLIDE } from "@/lib/capitulo12/roteiro";
import { int, pct } from "@/lib/capitulo7/formato";

/**
 * 14 · c12p14 · F1 resume precisão e recall pela média harmônica. Prova: com precisão 83,7% e recall 65,1%, o F1 do
 * detector é 73,3%; com P = 100% e R = 1%, a média simples dá 50,5% e o F1, 2,0%. Os dois controles mudam P e R (0 a
 * 100%) e as barras mostram P, R, a média simples e o F1 lado a lado. As duas formas da fórmula conferem com
 * metricas() (F1 = 2VP ÷ (2VP + FP + FN)). Estado inicial: P e R do detector. "Restaurar" volta a ele.
 */
const P0 = M_SGD.precisao!, R0 = M_SGD.recall!, F0 = M_SGD.f1!;
if (Math.abs(mediaHarmonica(P0, R0) - F0) > 1e-12) throw new Error("s14: as duas formas do F1 não coincidem");
const EXT = { p: 1, r: 0.01 };

export function S14F1({ pagina }: { pagina?: Pagina }) {
  const [p, setP] = useState(P0);
  const [r, setR] = useState(R0);
  const f1 = mediaHarmonica(p, r), ms = mediaSimples(p, r), det = p === P0 && r === R0, ext = p === EXT.p && r === EXT.r;
  const barras = [
    { k: "Precisão", curto: "P", v: p, tipo: "pr" }, { k: "Recall", curto: "R", v: r, tipo: "pr" },
    { k: "Média simples", curto: "Média", v: ms, tipo: "ms" }, { k: "F1 (harmônica)", curto: "F1", v: f1, tipo: "f1" },
  ];
  return (
    <Quadro slug="c12p14" pagina={pagina} layout="gl"
      conclusao={<>Com P = {pct(p, 1)} e R = {pct(r, 1)}, o F1 é <b>{pct(f1, 1)}</b> e a média simples, {pct(ms, 1)}. F1 pesa os dois erros igualmente. Quando um deles custa mais, a decisão volta para o limiar (slides {SLIDE.c12p16.n} e {SLIDE.c12p17.n}).</>}
      fonte={`${FONTE_MNIST}. F1 = 2PR ÷ (P + R) = 2VP ÷ (2VP + FP + FN). Os controles são um experimento com P e R quaisquer, não outro modelo.`}>
      <Painel className="q12-s14-esq">
        <Grafico rotulo={`Barras: precisão ${pct(p, 1)}, recall ${pct(r, 1)}, média simples ${pct(ms, 1)}, F1 ${pct(f1, 1)}`} arCelular="4 / 3">
          {(d) => {
            const m = { l: d.fs * 3, r: d.fs * 0.5, t: d.fs * 1.8, b: d.fs * 2.2 };
            const W = d.w - m.l - m.r, H = d.h - m.t - m.b, slot = W / barras.length, bw = Math.min(slot * 0.62, d.fs * 7);
            const y = (v: number) => m.t + H * (1 - v);
            return (
              <g>
                <defs><pattern id="q12-s14-h" patternUnits="userSpaceOnUse" width={8} height={8} patternTransform="rotate(45)"><line x1={0} y1={0} x2={0} y2={8} stroke={COR.mudo} strokeWidth={2.4} /></pattern></defs>
                {[0, 0.25, 0.5, 0.75, 1].map((v) => <g key={v}><line className="q7-grade" x1={m.l} x2={d.w - m.r} y1={y(v)} y2={y(v)} /><text className="q7-tick" x={m.l} dx="-.45em" y={y(v)} dy=".34em" textAnchor="end">{pct(v, 0)}</text></g>)}
                <line className="q7-eixo" x1={m.l} x2={d.w - m.r} y1={y(0)} y2={y(0)} />
                {barras.map((b, i) => {
                  const cx = m.l + slot * (i + 0.5);
                  return (
                    <g key={b.k}>
                      <rect className="q7-anim-d" x={cx - bw / 2} y={y(b.v)} width={bw} height={Math.max(0, y(0) - y(b.v))}
                        fill={b.tipo === "ms" ? "url(#q12-s14-h)" : COR.pos} fillOpacity={b.tipo === "pr" ? 0.45 : 1} stroke={b.tipo === "ms" ? COR.mudo : COR.pos} strokeWidth={b.tipo === "f1" ? 3 : 1.5} />
                      <text className="q7-rot" x={cx} y={y(b.v)} dy="-.45em" textAnchor="middle" style={{ fill: b.tipo === "ms" ? COR.mudo : COR.pos, fontSize: b.tipo === "pr" ? "1em" : "1.25em", fontWeight: 700 }}>{pct(b.v, 1)}</text>
                      <text className="q7-eixo-t" x={cx} y={y(0)} dy="1.3em" textAnchor="middle">{slot < d.fs * 8 ? b.curto : b.k}</text>
                    </g>
                  );
                })}
              </g>
            );
          }}
        </Grafico>
        <div className="q12-s14-ctl">
          <Controle rotulo="Precisão (P)" valor={p} min={0} max={1} passo={0.001} onChange={setP} mostrar={pct(p, 1)} escala={["0%", "100%"]} />
          <Controle rotulo="Recall (R)" valor={r} min={0} max={1} passo={0.001} onChange={setR} mostrar={pct(r, 1)} escala={["0%", "100%"]} />
        </div>
        <div className="q7-botoes">
          <Botao onClick={() => { setP(P0); setR(R0); }} desab={det}>Detector</Botao>
          <Botao onClick={() => { setP(EXT.p); setR(EXT.r); }} desab={ext}>P = {pct(EXT.p, 0)}, R = {pct(EXT.r, 0)}</Botao>
          <Botao sec onClick={() => { setP(P0); setR(R0); }} desab={det}>Restaurar</Botao>
        </div>
      </Painel>
      <Painel>
        <Formula f={String.raw`F_1=\frac{2PR}{P+R}=\frac{2\,\mathrm{VP}}{2\,\mathrm{VP}+\mathrm{FP}+\mathrm{FN}}`} compacta />
        <p className="q12-s14-conta">Detector: 2 × {int(CV.vp)} ÷ (2 × {int(CV.vp)} + {int(CV.fp)} + {int(CV.fn)})</p>
        <p className="q12-s14-res">{pct(F0, 1)}</p>
        <p className="q7-p">A média harmônica pune o desequilíbrio: o F1 nunca passa do dobro do menor dos dois. Para ser alto, exige P e R altos <b>ao mesmo tempo</b>.</p>
      </Painel>
    </Quadro>
  );
}
