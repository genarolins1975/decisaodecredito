"use client";
import { useState } from "react";
import { Botao, Eixos, Grafico, Painel, Quadro, Seg, escala, type Pagina } from "@/components/capitulo7/base";
import { CORTE, FONTE_CASO, REGRAS, type NomeRegra } from "@/lib/capitulo12/dados";
import { HORIZONTES, HZ, faixa, type Horizonte } from "@/lib/capitulo12/b4";
import { SLIDE } from "@/lib/capitulo12/roteiro";
import { int, pct, vezes } from "@/lib/capitulo7/formato";

/**
 * 45 · c12p45 · Três regras de corte: onde ficam os maus. Taxa de maus no grupo removido (precisão do corte) contra a
 * do grupo mantido, por regra, no curto prazo (target_never_paid) e no longo (target_60ever9p): CORTE de dados.ts
 * (avaliaCorte sobre as contagens do caso). Barras agrupadas com a taxa da base inteira como referência; a tabela da
 * aula ao lado do gráfico. O seletor troca o horizonte; clicar numa regra mostra quantas vezes o corte concentra os
 * maus. O volume do corte fica para o slide 47 (é a pergunta do exercício). Estado inicial: curto prazo, Política
 * BACEN em foco; "Restaurar" volta a ele.
 */
const SIMB: Record<NomeRegra, string> = { politica: "●", never_paid: "▲", combinada: "◆" };

export function S45Regras({ pagina }: { pagina?: Pagina }) {
  const [h, setH] = useState<Horizonte>("curto");
  const [sel, setSel] = useState<NomeRegra>("politica");
  const C = CORTE[h], base = C.politica.taxaMaus;
  const [pMin, pMax] = faixa(h, (c) => c.precisao), [rMin, rMax] = faixa(h, (c) => c.mausNoResto);
  const s = C[sel], nomeSel = REGRAS.find((r) => r.id === sel)!.nome;
  return (
    <Quadro slug="c12p45" pagina={pagina} layout="gl"
      conclusao={<>No {HZ[h].nome.toLowerCase()}, o grupo removido tem <b>{pct(pMin, 1)} a {pct(pMax, 1)} de maus</b>, contra {pct(rMin, 1)} a {pct(rMax, 1)} no restante. Todas concentram os maus; o slide {SLIDE.c12p47.n} pergunta quanto da base cada uma recusa.</>}
      fonte={`${FONTE_CASO}. Curto prazo: ${HZ.curto.alvo} (${HZ.curto.def}), ${int(CORTE.curto.politica.contratos)} contratos; longo prazo: ${HZ.longo.alvo}, ${int(CORTE.longo.politica.classificados)} contratos classificados. Comparação entre grupos observados, sem efeito causal.`}>
      <Painel className="q12-s45-esq">
        <Grafico titulo={`Taxa de maus, ${HZ[h].nome.toLowerCase()}`} sub="corte (removido) contra restante (mantido)"
          rotulo={`Taxa de maus por regra no ${HZ[h].nome.toLowerCase()}: ${REGRAS.map((r) => `${r.nome}, ${pct(C[r.id].precisao, 1)} no corte e ${pct(C[r.id].mausNoResto, 1)} no restante`).join("; ")}. Base inteira: ${pct(base, 1)}`} arCelular="4 / 3">
          {(d) => {
            const m = { l: d.fs * 3, r: d.fs * 0.6, t: d.fs * 1.4, b: d.fs * 1.8 };
            const ymax = h === "curto" ? 0.25 : 0.7;
            const y = escala([0, ymax], [d.h - m.b, m.t]);
            const x = escala([0, REGRAS.length], [m.l, d.w - m.r]);
            const bw = Math.min(d.fs * 4.2, (x(1) - x(0)) * 0.32);
            const yt = Array.from({ length: Math.round(ymax / (h === "curto" ? 0.05 : 0.1)) + 1 }, (_, i) => Math.round(i * (h === "curto" ? 0.05 : 0.1) * 100) / 100);
            return (
              <g>
                <Eixos x={x} y={y} xt={[]} yt={yt} fx={() => ""} fy={(v) => pct(v, 0)} />
                <line x1={m.l} x2={d.w - m.r} y1={y(base)} y2={y(base)} stroke="#2A3342" strokeWidth={1.8} strokeDasharray="7 5" />
                {REGRAS.map((r, i) => {
                  const c = C[r.id], cx = x(i + 0.5), on = r.id === sel;
                  return (
                    <g key={r.id} opacity={on ? 1 : 0.55} style={{ cursor: "pointer" }} onClick={() => setSel(r.id)}>
                      <rect className="q7-anim-d" x={cx - bw - 2} y={y(c.precisao)} width={bw} height={y(0) - y(c.precisao)} fill="#A85A0C" />
                      <rect className="q7-anim-d" x={cx + 2} y={y(c.mausNoResto)} width={bw} height={y(0) - y(c.mausNoResto)} fill="#8FA3C4" />
                      <text className="q7-rot" x={cx - bw / 2 - 2} y={y(c.precisao)} dy="-.4em" textAnchor="middle" style={{ fill: "#A85A0C", paintOrder: "stroke", stroke: "#fff", strokeWidth: "0.3em", strokeLinejoin: "round" }}>{pct(c.precisao, 1)}</text>
                      <text className="q7-rot" x={cx + bw / 2 + 2} y={y(c.mausNoResto)} dy="-.4em" textAnchor="middle" style={{ fill: "#3D5A8A", paintOrder: "stroke", stroke: "#fff", strokeWidth: "0.3em", strokeLinejoin: "round" }}>{pct(c.mausNoResto, 1)}</text>
                      <text className="q7-rot" x={cx} y={y(0)} dy="1.3em" textAnchor="middle" style={{ fill: "#00205B", fontWeight: on ? 700 : 600 }}>{SIMB[r.id]} {r.nome}</text>
                    </g>
                  );
                })}
              </g>
            );
          }}
        </Grafico>
        <ul className="q7-leg"><li><span className="q7-mk q12-s45-mk-c" aria-hidden="true" />grupo removido pelo corte</li><li><span className="q7-mk q12-s45-mk-r" aria-hidden="true" />grupo mantido</li><li><span className="q7-mk q7-mk--trac q7-mk--ink" aria-hidden="true" />taxa da base inteira: {pct(base, 1)}</li></ul>
        <p className="q12-s45-sel"><b>{nomeSel}</b>, {HZ[h].nome.toLowerCase()}: o grupo removido tem <b>{vezes(s.precisao / s.mausNoResto, 1)}</b> a taxa de maus do mantido ({pct(s.precisao, 1)} contra {pct(s.mausNoResto, 1)}).</p>
      </Painel>
      <Painel>
        <div className="q12-s45-ctl">
          <Seg rotulo="Horizonte" opcoes={HORIZONTES.map((x) => ({ v: x.v, r: x.nome }))} valor={h} onChange={setH} />
          <Botao sec onClick={() => { setH("curto"); setSel("politica"); }} desab={h === "curto" && sel === "politica"}>Restaurar</Botao>
        </div>
        <table className="q7-tab q12-s45-tab" data-h={h}>
          <thead><tr><th className="q7-t-l">Regra e o que usa</th><th data-c="curto">Maus no corte (curto)</th><th data-c="curto">Maus no restante (curto)</th><th data-c="longo">Maus no corte (longo)</th></tr></thead>
          <tbody>{REGRAS.map((r) => (
            <tr key={r.id} data-on={r.id === sel ? "1" : undefined}>
              <th className="q7-t-l"><button type="button" className="q12-s45-reg" aria-pressed={r.id === sel} onClick={() => setSel(r.id)}><b>{SIMB[r.id]} {r.nome}</b><span>{r.usa}</span></button></th>
              <td data-c="curto">{pct(CORTE.curto[r.id].precisao, 1)}</td><td data-c="curto">{pct(CORTE.curto[r.id].mausNoResto, 1)}</td><td data-c="longo">{pct(CORTE.longo[r.id].precisao, 1)}</td>
            </tr>
          ))}</tbody>
        </table>
      </Painel>
    </Quadro>
  );
}
