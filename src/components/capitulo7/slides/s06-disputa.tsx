"use client";
import { useState } from "react";
import { Botao, caminho, Eixos, escala, Expandir, Formula, Grafico, margens, Painel, Previsao, Quadro, type Opcao, type Pagina } from "../base";
import { D, A, MINI, PL, Y } from "@/lib/capitulo7/dados";
import { aucPorPares, confusao, mulberry32 } from "@/lib/capitulo7/metricas";
import { int, num, pct } from "@/lib/capitulo7/formato";

/**
 * 06 · c7p5 · AUC como disputa entre dois clientes. Cada sorteio pega um default e um adimplente da janela (semente
 * 20261006) e compara as PDs: acerto, inversão ou empate. A proporção acumulada converge para a AUC exata, que usa
 * todos os 81 × 656 = 53.136 pares. A turma aposta antes do primeiro sorteio; a linha da AUC exata só aparece depois
 * de 100 sorteios, como confirmação. O par escolhido à mão vem da mini-base, não entra na contagem e só abre depois
 * da aposta, quando a previsão já recolheu e a expansão cabe no painel sem cobrir as contagens. O eixo de sorteios
 * acompanha n (100, 250, 500, 1.000).
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
const SERIE = (() => { let a = 0; return TODOS.map((s, k) => { a += s.r === "acerto" ? 1 : s.r === "empate" ? 0.5 : 0; return a / (k + 1); }); })();
const MD = MINI.filter((m) => m.y), MA = MINI.filter((m) => !m.y);
const REVELA = 100; // sorteios até a linha da AUC exata aparecer
const ACC12 = confusao(Y, PL, 0.12).acuracia!; // a acurácia de um corte qualquer: outra conta, sobre clientes
/** O eixo de sorteios acompanha n: com 100 sorteios a série ocupa o eixo inteiro, não o primeiro décimo. */
const xMax = (n: number) => (n <= 100 ? 100 : n <= 250 ? 250 : n <= 500 ? 500 : 1000);
const OPCOES: Opcao[] = [
  { texto: "Perto de 50%", retorno: <>Seria uma fila <b>ao acaso</b>, em que cada par é cara ou coroa. A logística põe o default acima na maioria dos pares.</> },
  { texto: `Perto de ${pct(EXATA.auc!, 0)}`, certa: true, retorno: <>Boa aposta. Sorteie {REVELA} pares e confira.</> },
  { texto: "Perto de 90%", retorno: <>Confunde boa ordem com ordem <b>quase perfeita</b>. Na fila do slide 5 havia defaults no meio da fila, abaixo de adimplentes.</> },
];
const FRASE = { acerto: "acerto: o default recebeu a PD maior", inversao: "inversão: o adimplente recebeu a PD maior", empate: "empate: PDs iguais, meio ponto" } as const;

export function S06Disputa({ pagina }: { pagina?: Pagina }) {
  const [n, setN] = useState(0);
  const [esc, setEsc] = useState<number | null>(null);
  const linha = esc !== null && n >= REVELA;
  const [md, setMd] = useState(MD[0].id), [ma, setMa] = useState(MA[0].id);
  const vistos = TODOS.slice(0, n);
  const ac = vistos.filter((s) => s.r === "acerto").length, em = vistos.filter((s) => s.r === "empate").length;
  const est = n ? (ac + 0.5 * em) / n : null;
  const ult = n ? vistos[n - 1] : null;
  const serie = SERIE;
  const pd = MINI.find((m) => m.id === md)!.pd, pa = MINI.find((m) => m.id === ma)!.pd;
  const manual = pd > pa ? "acerto" : pd === pa ? "empate" : "inversao";
  return (
    <Quadro slug="c7p5" pagina={pagina} layout="gl"
      conclusao={esc === null ? "Antes de sortear, aposte: depois de muitos pares, para onde vai a proporção de acertos?" : n === 0 ? "Sorteie um par. A pergunta é sempre a mesma: o default recebeu a PD maior?" : n < REVELA ? `Depois de ${n} sorteio${n > 1 ? "s" : ""}, a proporção de acertos é ${pct(est!, 1)}. Com ${REVELA} sorteios aparece a AUC exata.`
        : <>Com {int(n)} sorteios, {pct(est!, 1)}. A AUC exata conta os <b>{int(EXATA.pares)}</b> pares e dá <b>{num(EXATA.auc!, 4)}</b>: probabilidade sobre pares, não acurácia (no corte de 12%, a logística acerta {pct(ACC12, 1)} dos clientes, outra conta).</>}
      fonte={`Janela fora do tempo: ${D} defaults × ${A} adimplentes = ${int(EXATA.pares)} pares, PD da logística em precisão plena. Sorteios com reposição, semente ${SEMENTE}; Restaurar repete a mesma sequência.`}>
      <Painel titulo="Um default contra um adimplente, sorteados da janela">
        <div className="q7-s06-par" aria-live="polite">
          <div className="q7-s06-c" data-y="1"><span className="q7-k">Default sorteado</span><b>{ult ? `#${ult.d}` : "?"}</b><span className="q7-s06-pd">{ult ? pct(PL[ult.d], 1) : "PD ?"}</span></div>
          <div className="q7-s06-vs" data-r={ult?.r}>{ult ? (ult.r === "acerto" ? ">" : ult.r === "empate" ? "=" : "<") : "vs"}</div>
          <div className="q7-s06-c" data-y="0"><span className="q7-k">Adimplente sorteado</span><b>{ult ? `#${ult.a}` : "?"}</b><span className="q7-s06-pd">{ult ? pct(PL[ult.a], 1) : "PD ?"}</span></div>
        </div>
        <div className="q7-s06-acao">
          <p className="q7-s06-res" data-r={ult?.r}>{ult ? FRASE[ult.r] : esc === null ? "Aposte antes de sortear" : "Nenhum par sorteado ainda"}</p>
          <div className="q7-botoes"><Botao prim onClick={() => setN(Math.min(1000, n + 1))} desab={esc === null || n >= 1000}>Sortear 1 par</Botao><Botao onClick={() => setN(Math.min(1000, n + 10))} desab={esc === null || n >= 1000}>+10</Botao><Botao onClick={() => setN(Math.min(1000, n + 100))} desab={esc === null || n >= 1000}>+100</Botao><Botao sec onClick={() => { setN(0); setEsc(null); }}>Restaurar</Botao></div>
        </div>
        <Grafico titulo="Proporção acumulada de acertos" sub="empate vale meio ponto" rotulo={`Proporção de acertos após ${n} sorteios: ${est === null ? "nenhum" : pct(est, 1)}${linha ? `; AUC exata ${num(EXATA.auc!, 4)}` : ""}`} arCelular="16 / 8">
          {(d) => {
            const m = margens(d.fs, { l: 3, b: 2.6, t: 0.6 });
            const xm = xMax(n), x = escala([0, xm], [m.l, d.w - m.r]), y = escala([0.4, 1], [d.h - m.b, m.t]);
            const pts = serie.slice(0, n).map((v, k) => ({ x: x(k + 1), y: y(Math.max(0.4, v)) }));
            return (
              <g>
                <Eixos x={x} y={y} xt={[0, 0.25, 0.5, 0.75, 1].map((f) => f * xm)} yt={[0.4, 0.6, 0.8, 1]} fx={(v) => int(v)} fy={(v) => pct(v, 0)} xTit="número de pares sorteados" />
                {linha && <line x1={x(0)} x2={x(xm)} y1={y(EXATA.auc!)} y2={y(EXATA.auc!)} stroke="#3D5A8A" strokeWidth={2.5} strokeDasharray="8 6" />}
                {linha && <text className="q7-rot" x={x(xm)} y={y(EXATA.auc!) - 8} textAnchor="end" style={{ fill: "#3D5A8A" }}>AUC exata, todos os pares: {num(EXATA.auc!, 4)}</text>}
                {n > 0 && <path className="q7-linha q7-linha--ink q7-linha--fina" d={caminho(pts)} />}
                {n > 0 && <circle cx={pts[pts.length - 1].x} cy={pts[pts.length - 1].y} r={d.fs * 0.35} fill="#00205B" />}
              </g>
            );
          }}
        </Grafico>
      </Painel>
      <Painel>
        <Previsao rotulo="Antes de sortear" pergunta="Depois de muitos pares, a proporção de acertos ficará:" opcoes={OPCOES} escolha={esc} onEscolha={(i) => { setEsc(i); if (i === null) setN(0); }} recolher />
        <dl className="q7-lista q7-s06-l">
          <div><dt>Acertos</dt><dd>{int(ac)}</dd></div>
          <div data-tom="mudo"><dt>Empates (½ cada)</dt><dd>{int(em)}</dd></div>
          <div data-tom="def"><dt>Inversões</dt><dd>{int(n - ac - em)}</dd></div>
          <div><dt>Proporção</dt><dd>{est === null ? "?" : pct(est, 1)}</dd></div>
        </dl>
        <Formula compacta f={String.raw`\mathrm{AUC} = P(s_D > s_A) + \tfrac{1}{2}\,P(s_D = s_A)`} simbolos={[[String.raw`s_D,\ s_A`, "PD do default e do adimplente sorteados"]]} />
        {esc !== null && <Expandir resumo="Compare um par da mini-base">
          <div className="q7-s06-man">
            <label>Default <select value={md} onChange={(e) => setMd(Number(e.target.value))}>{MD.map((m) => <option key={m.id} value={m.id}>#{m.id} · {pct(m.pd, 0)}</option>)}</select></label>
            <label>Adimplente <select value={ma} onChange={(e) => setMa(Number(e.target.value))}>{MA.map((m) => <option key={m.id} value={m.id}>#{m.id} · {pct(m.pd, 0)}</option>)}</select></label>
          </div>
          <p className="q7-s06-res" data-r={manual}>{FRASE[manual]}; fora da contagem</p>
        </Expandir>}
      </Painel>
    </Quadro>
  );
}
