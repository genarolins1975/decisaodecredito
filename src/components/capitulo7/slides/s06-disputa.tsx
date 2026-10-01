"use client";
import { useMemo, useState } from "react";
import { Botao, caminho, Eixos, escala, Expandir, Formula, Grafico, margens, Painel, Quadro, type Pagina } from "../base";
import { D, A, MINI, PL, Y } from "@/lib/capitulo7/dados";
import { aucPorPares, mulberry32 } from "@/lib/capitulo7/metricas";
import { int, num, pct } from "@/lib/capitulo7/formato";

/**
 * 06 · c7p5 · AUC como disputa entre dois clientes. Cada sorteio pega um default e um adimplente da janela (semente
 * 20261006) e compara as PDs: acerto, inversão ou empate. A proporção acumulada converge para a AUC exata, que usa
 * todos os 81 × 656 = 53.136 pares. O par escolhido à mão vem da mini-base e não entra na contagem.
 */
const SEMENTE = 20261006;
const IDX_D = Y.map((v, i) => (v ? i : -1)).filter((i) => i >= 0);
const IDX_A = Y.map((v, i) => (v ? -1 : i)).filter((i) => i >= 0);
const EXATA = aucPorPares(Y, PL);
type Sorteio = { d: number; a: number; r: "acerto" | "empate" | "inversao" };
function sortear(n: number): Sorteio[] {
  const r = mulberry32(SEMENTE); const out: Sorteio[] = [];
  for (let k = 0; k < n; k++) { const d = IDX_D[Math.floor(r() * IDX_D.length)], a = IDX_A[Math.floor(r() * IDX_A.length)]; out.push({ d, a, r: PL[d] > PL[a] ? "acerto" : PL[d] === PL[a] ? "empate" : "inversao" }); }
  return out;
}
const TODOS = sortear(1000);
const MD = MINI.filter((m) => m.y), MA = MINI.filter((m) => !m.y);
const FRASE = { acerto: "acerto: o default recebeu a PD maior", inversao: "inversão: o adimplente recebeu a PD maior", empate: "empate: PDs iguais, meio ponto" } as const;

export function S06Disputa({ pagina }: { pagina?: Pagina }) {
  const [n, setN] = useState(0);
  const [md, setMd] = useState(MD[0].id), [ma, setMa] = useState(MA[0].id);
  const vistos = TODOS.slice(0, n);
  const ac = vistos.filter((s) => s.r === "acerto").length, em = vistos.filter((s) => s.r === "empate").length;
  const est = n ? (ac + 0.5 * em) / n : null;
  const ult = n ? vistos[n - 1] : null;
  const serie = useMemo(() => { let a = 0; return TODOS.map((s, k) => { a += s.r === "acerto" ? 1 : s.r === "empate" ? 0.5 : 0; return a / (k + 1); }); }, []);
  const pd = MINI.find((m) => m.id === md)!.pd, pa = MINI.find((m) => m.id === ma)!.pd;
  const manual = pd > pa ? "acerto" : pd === pa ? "empate" : "inversao";
  return (
    <Quadro slug="c7p5" pagina={pagina} layout="gl"
      conclusao={n === 0 ? "Sorteie um par. A pergunta é sempre a mesma: o default recebeu a PD maior?" : n < 100 ? `Depois de ${n} sorteio${n > 1 ? "s" : ""}, a proporção de acertos é ${pct(est!, 1)}. Sorteie mais e veja para onde ela vai.`
        : <>Com {int(n)} sorteios, {pct(est!, 1)}. A AUC exata não sorteia: conta os <b>{int(EXATA.pares)}</b> pares e dá <b>{num(EXATA.auc!, 4)}</b>. Ela é uma probabilidade sobre pares, não sobre um cliente.</>}
      fonte={`Janela fora do tempo: ${D} defaults × ${A} adimplentes = ${int(EXATA.pares)} pares, PD da logística em precisão plena. Sorteios com reposição, semente ${SEMENTE}; Restaurar repete a mesma sequência.`}>
      <Painel titulo="Um default contra um adimplente, sorteados da janela">
        <div className="q7-s06-par" aria-live="polite">
          <div className="q7-s06-c" data-y="1"><span className="q7-k">Default sorteado</span><b>{ult ? `#${ult.d}` : "?"}</b><span className="q7-s06-pd">{ult ? pct(PL[ult.d], 1) : "PD ?"}</span></div>
          <div className="q7-s06-vs" data-r={ult?.r}>{ult ? (ult.r === "acerto" ? ">" : ult.r === "empate" ? "=" : "<") : "vs"}</div>
          <div className="q7-s06-c" data-y="0"><span className="q7-k">Adimplente sorteado</span><b>{ult ? `#${ult.a}` : "?"}</b><span className="q7-s06-pd">{ult ? pct(PL[ult.a], 1) : "PD ?"}</span></div>
          <p className="q7-s06-res" data-r={ult?.r}>{ult ? FRASE[ult.r] : "Nenhum par sorteado ainda"}</p>
        </div>
        <Grafico titulo="Proporção acumulada de acertos" sub="empate vale meio ponto" rotulo={`Proporção de acertos após ${n} sorteios: ${est === null ? "nenhum" : pct(est, 1)}; AUC exata ${num(EXATA.auc!, 4)}`} arCelular="16 / 8">
          {(d) => {
            const m = margens(d.fs, { l: 3, b: 2.6, t: 0.6 });
            const x = escala([0, 1000], [m.l, d.w - m.r]), y = escala([0.4, 1], [d.h - m.b, m.t]);
            const pts = serie.slice(0, n).map((v, k) => ({ x: x(k + 1), y: y(Math.max(0.4, v)) }));
            return (
              <g>
                <Eixos x={x} y={y} xt={[0, 250, 500, 750, 1000]} yt={[0.4, 0.6, 0.8, 1]} fx={(v) => int(v)} fy={(v) => pct(v, 0)} xTit="número de pares sorteados" />
                <line x1={x(0)} x2={x(1000)} y1={y(EXATA.auc!)} y2={y(EXATA.auc!)} stroke="#176C73" strokeWidth={2.5} strokeDasharray="8 6" />
                <text className="q7-rot" x={x(1000)} y={y(EXATA.auc!) - 8} textAnchor="end" style={{ fill: "#176C73" }}>AUC exata, todos os pares: {num(EXATA.auc!, 4)}</text>
                {n > 0 && <path className="q7-linha q7-linha--ink q7-linha--fina" d={caminho(pts)} />}
                {n > 0 && <circle cx={pts[pts.length - 1].x} cy={pts[pts.length - 1].y} r={d.fs * 0.35} fill="#00205B" />}
              </g>
            );
          }}
        </Grafico>
      </Painel>
      <Painel>
        <div className="q7-botoes"><Botao prim onClick={() => setN(Math.min(1000, n + 1))} desab={n >= 1000}>Sortear 1 par</Botao><Botao onClick={() => setN(Math.min(1000, n + 10))} desab={n >= 1000}>+10</Botao><Botao onClick={() => setN(Math.min(1000, n + 100))} desab={n >= 1000}>+100</Botao><Botao sec onClick={() => setN(0)}>Restaurar</Botao></div>
        <dl className="q7-lista">
          <div><dt>Acertos</dt><dd>{int(ac)}</dd></div>
          <div data-tom="mudo"><dt>Empates (½ cada)</dt><dd>{int(em)}</dd></div>
          <div data-tom="def"><dt>Inversões</dt><dd>{int(n - ac - em)}</dd></div>
          <div data-tom="prob"><dt>Proporção de acertos</dt><dd>{est === null ? "?" : pct(est, 1)}</dd></div>
        </dl>
        <Formula f={String.raw`\mathrm{AUC} = P(s_D > s_A) + \tfrac{1}{2}\,P(s_D = s_A)`} simbolos={[["s_D", "PD de um default sorteado"], ["s_A", "PD de um adimplente sorteado"]]} />
        <Expandir resumo="Compare você mesmo um par da mini-base">
          <div className="q7-s06-man">
            <label>Default <select value={md} onChange={(e) => setMd(Number(e.target.value))}>{MD.map((m) => <option key={m.id} value={m.id}>#{m.id} · {pct(m.pd, 0)}</option>)}</select></label>
            <label>Adimplente <select value={ma} onChange={(e) => setMa(Number(e.target.value))}>{MA.map((m) => <option key={m.id} value={m.id}>#{m.id} · {pct(m.pd, 0)}</option>)}</select></label>
          </div>
          <p className="q7-s06-res" data-r={manual}>{FRASE[manual]}. Este par não entra na contagem da janela.</p>
        </Expandir>
      </Painel>
    </Quadro>
  );
}
