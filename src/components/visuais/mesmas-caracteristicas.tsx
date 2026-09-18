"use client";
import { useState } from "react";
import { fmtPct } from "@/lib/visuais/metricas";
import { wilson } from "@/lib/visuais/arvore";

/**
 * Mesmas características, desfechos diferentes (capítulo 2, c2p6). Duas pessoas, dezesseis, e uma retirada: o mundo
 * não mudou, mas a frequência observada mudou. O intervalo de Wilson mostra o quanto cada amostra sustenta.
 */
const DEZESSEIS = [0, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 1];
type Amostra = "duas" | "dezesseis" | "menos";

export function MesmasCaracteristicas() {
  const [amostra, setAmostra] = useState<Amostra>("duas");
  const [retirada, setRetirada] = useState(14); // a #15, como na página herdada
  const y = amostra === "duas" ? [0, 1] : amostra === "dezesseis" ? DEZESSEIS : DEZESSEIS.filter((_, i) => i !== retirada);
  const d = y.reduce((s, v) => s + v, 0), n = y.length, p = d / n, w = wilson(d, n);
  const frase = amostra === "duas" ? "Uma de duas pessoas entrou em default. A frequência é 50%, mas uma única pessoa muda tudo." : amostra === "dezesseis" ? "Oito defaults em dezesseis propostas. A frequência continua 50%, agora sustentada por mais casos." : `${d} default${d === 1 ? "" : "s"} em ${n} propostas. A prevalência ${p > 0.5 ? "sobe" : p < 0.5 ? "cai"  : "fica"} em ${fmtPct(p, 1)} sem mudar nenhuma característica individual.`;
  const todos = [{ rot: "2 pessoas", y: [0, 1] }, { rot: "16 pessoas", y: DEZESSEIS }, { rot: "15 pessoas", y: DEZESSEIS.filter((_, i) => i !== retirada) }].map((a) => { const dd = a.y.reduce((s, v) => s + v, 0); return { ...a, d: dd, n: a.y.length, p: dd / a.y.length, w: wilson(dd, a.y.length) }; });
  return (
    <figure className="vz" data-vz="mesmas-caracteristicas">
      <header className="vz-cab">
        <div>
          <p className="eyebrow">Mesmas características, desfechos diferentes · a frequência observada varia entre amostras</p>
          <p className="vz-tit">Pessoas parecidas têm desfechos diferentes. Alterne o tamanho da amostra e retire um caso: o mundo não mudou, a estimativa mudou.</p>
        </div>
        <div className="vz-acoes" role="group" aria-label="Amostra">
          <button type="button" className={`btn btn-sm ${amostra === "duas" ? "" : "btn-secondary"}`} onClick={() => setAmostra("duas")}>2 pessoas</button>
          <button type="button" className={`btn btn-sm ${amostra === "dezesseis" ? "" : "btn-secondary"}`} onClick={() => setAmostra("dezesseis")}>16 pessoas</button>
          <button type="button" className={`btn btn-sm ${amostra === "menos" ? "" : "btn-secondary"}`} onClick={() => setAmostra("menos")}>retire 1 caso</button>
        </div>
      </header>
      <div className="vz-estado"><b>{n} pessoas, prevalência observada {fmtPct(p, 1)}, intervalo de Wilson de {fmtPct(w.lo, 1)} a {fmtPct(w.hi, 1)}.</b> {frase}</div>
      <div className="vz-mc-grade">
        <div className="vz-mc-painel">
          <p className="vz-grafico-t">A amostra <span className="hint">D marca default, ✓ marca quem pagou{amostra !== "duas" ? " · clique num caso para retirá-lo" : ""}</span></p>
          <div className="vz-mc-pontos">
            {(amostra === "duas" ? [0, 1] : DEZESSEIS).map((v, i) => { const fora = amostra === "menos" && i === retirada; return <button key={i} type="button" className={`vz-mc-ponto ${v ? "vz-mc-ponto--default" : ""} ${fora ? "vz-mc-ponto--fora" : ""}`} onClick={() => { if (amostra !== "duas") { setRetirada(i); setAmostra("menos"); } }} aria-label={`Caso ${i + 1}, ${v ? "default" : "pagou"}${fora ? ", retirado" : ""}`}>{v ? "D" : "✓"}</button>; })}
          </div>
          <div className="vz-tiles vz-tiles--3">
            <div className="vz-tile"><p className="eyebrow">Defaults</p><p className="vz-num vz-num--default">{d}</p></div>
            <div className="vz-tile"><p className="eyebrow">Propostas</p><p className="vz-num">{n}</p></div>
            <div className="vz-tile"><p className="eyebrow">Prevalência</p><p className="vz-num">{fmtPct(p, 1)}</p></div>
          </div>
        </div>
        <div className="vz-mc-lado">
          <div className="vz-grafico">
            <p className="vz-grafico-t">O que cada amostra sustenta <span className="hint">intervalo de Wilson de 95% para a prevalência</span></p>
            <svg viewBox="0 0 640 170" role="img" aria-label={todos.map((a) => `${a.rot}: ${fmtPct(a.p, 1)}, de ${fmtPct(a.w.lo, 1)} a ${fmtPct(a.w.hi, 1)}`).join("; ")}>
              {[0, 0.25, 0.5, 0.75, 1].map((v) => <g key={v}><line x1={140 + v * 480} x2={140 + v * 480} y1={14} y2={140} className="vz-grade" /><text x={140 + v * 480} y={158} textAnchor="middle" className="vz-tick">{fmtPct(v)}</text></g>)}
              {todos.map((a, i) => { const on = (amostra === "duas" && i === 0) || (amostra === "dezesseis" && i === 1) || (amostra === "menos" && i === 2); const yy = 34 + i * 40; return <g key={a.rot} className={on ? "" : "vz-mc-fraco"}>
                <text x={130} y={yy + 4} textAnchor="end" className="vz-tick vz-tick--forte">{a.rot}</text>
                <line x1={140 + a.w.lo * 480} x2={140 + a.w.hi * 480} y1={yy} y2={yy} className="vz-ind-ic-linha" />
                <circle cx={140 + a.p * 480} cy={yy} r={7} className="vz-ind-ic-pt" />
                <text x={140 + a.w.hi * 480 + 8} y={yy + 4} className="vz-tick">{fmtPct(a.w.lo)} a {fmtPct(a.w.hi)}</text>
              </g>; })}
            </svg>
          </div>
          <div className="vz-tile vz-tile--ok"><p className="eyebrow">O que muda e o que não muda</p><p className="vz-num vz-num--texto">Uma pessoa a mais ou a menos move a frequência em pontos inteiros quando a amostra é pequena, e quase nada quando ela é grande. A prevalência é uma estimativa; a incerteza dela é calculável, e o capítulo 2 termina calculando.</p></div>
        </div>
      </div>
      <p className="vz-fonte">Duas pessoas com um default: 50%, intervalo de 9% a 91%. Dezesseis com oito: 50%, de 28% a 72%. Retirando a #15: 8 em 15, 53,3%, de 30% a 75%. Os dezesseis desfechos são os da base didática usada nos capítulos 4 a 6.</p>
    </figure>
  );
}
