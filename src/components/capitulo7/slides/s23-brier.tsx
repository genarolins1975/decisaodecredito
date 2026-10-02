"use client";
import { useState } from "react";
import { Botao, caminho, Controle, Eixos, escala, Expandir, Formula, Grafico, Painel, Quadro, Seg, margens, type Pagina } from "../base";
import { D, N, PL, PREVALENCIA, PT, Y } from "@/lib/capitulo7/dados";
import { brier, perdaBrier1 } from "@/lib/capitulo7/metricas";
import { num, pct } from "@/lib/capitulo7/formato";

/**
 * 23 · c7p33 · Brier. Um cliente: a perda (p − y)² conforme a PD dada a ele, para quem pagou e para quem deu default.
 * A carteira: a média dessas perdas na janela, ao lado de duas referências constantes. A honesta usa a prevalência do
 * treino (9,56%), conhecida no momento da previsão; a outra usa a taxa da própria janela, que só se conhece depois e
 * por isso não é referência legítima para avaliar o modelo.
 */
type Yv = 0 | 1;
const BS = brier(Y, PL);
const REF_TREINO = brier(Y, PL.map(() => PREVALENCIA.treino));
const REF_JANELA = brier(Y, PL.map(() => D / N));
const BS_PT = brier(Y, PT);

export function S23Brier({ pagina }: { pagina?: Pagina }) {
  const [y, setY] = useState<Yv>(0);
  const [p, setP] = useState(0.1);
  const perda = perdaBrier1(p, y);
  const itens = [
    { nome: "Logística", v: BS, cor: "#176C73", nota: "a avaliada" },
    { nome: `Constante ${pct(PREVALENCIA.treino, 2)}`, v: REF_TREINO, cor: "#9AA1AD", nota: "treino: referência honesta" },
    { nome: `Constante ${pct(D / N, 2)}`, v: REF_JANELA, cor: "#C9CDD5", nota: "taxa da janela: só depois" },
    { nome: "PD verdadeira", v: BS_PT, cor: "#00205B", nota: "só na base sintética" },
  ];
  return (
    <Quadro slug="c7p33" pagina={pagina} layout="gg"
      conclusao={<>Um cliente que {y ? "deu default" : "pagou"} com PD de {pct(p, 0)} custa <b>{num(perda, 4)}</b>. Na carteira, a logística tem Brier <b>{num(BS, 5)}</b>, contra {num(REF_TREINO, 5)} da constante honesta: {pct(1 - BS / REF_TREINO, 1)} melhor. O Brier mistura nível e separação; sozinho, não isola calibração.</>}
      fonte={`Janela fora do tempo: ${N} propostas, ${D} defaults. Brier = média de (p − y)², com y = 1 para default; escala de 0 a 1, menor é melhor. Prevalência do treino: safras de 2022-01 a 2023-02.`}>
      <Painel titulo="Um cliente">
        <Seg rotulo="Desfecho do cliente" opcoes={[{ v: 0 as Yv, r: "Pagou (y = 0)" }, { v: 1 as Yv, r: "Deu default (y = 1)" }]} valor={y} onChange={setY} />
        <Grafico rotulo={`Perda quadrática para y = ${y}: ${num(perda, 4)} com PD ${pct(p, 0)}`} arCelular="4 / 3">
          {(d) => {
            const m = margens(d.fs, { l: 3, b: 2.8, t: 1, r: 1 }); const x = escala([0, 1], [m.l, d.w - m.r]), yy = escala([0, 1], [d.h - m.b, m.t]);
            const pts = Array.from({ length: 101 }, (_, i) => ({ x: x(i / 100), y: yy(perdaBrier1(i / 100, y)) }));
            return (
              <g>
                <Eixos x={x} y={yy} xt={[0, 0.25, 0.5, 0.75, 1]} yt={[0, 0.25, 0.5, 0.75, 1]} fx={(v) => pct(v, 0)} fy={(v) => num(v, 2)} xTit="PD dada ao cliente" yTit="Perda (p − y)²" />
                <path className="q7-linha q7-linha--prob" d={caminho(pts)} />
                <line x1={x(p)} x2={x(p)} y1={yy(0)} y2={yy(perda)} stroke="#A85A0C" strokeWidth={2.5} strokeDasharray="5 4" />
                <circle cx={x(p)} cy={yy(perda)} r={d.fs * 0.45} fill="#A85A0C" stroke="#fff" strokeWidth={2.5} />
                <text className="q7-corte-t" x={x(p) + (p > 0.6 ? -d.fs * 0.6 : d.fs * 0.6)} y={yy(perda) - d.fs * 0.5} textAnchor={p > 0.6 ? "end" : "start"}>{num(perda, 4)}</text>
              </g>
            );
          }}
        </Grafico>
        <Controle rotulo="PD dada ao cliente" valor={p} min={0} max={1} passo={0.01} onChange={setP} mostrar={pct(p, 0)} />
      </Painel>
      <Painel titulo="A carteira: média das perdas, contra referências">
        <Grafico rotulo={itens.map((it) => `${it.nome}: ${num(it.v, 5)}`).join("; ")} arCelular="4 / 3">
          {(d) => {
            const x = escala([0.088, 0.1], [d.fs * 1, d.w - d.fs * 1]); const lh = (d.h - d.fs * 2.6) / itens.length;
            return (
              <g>
                {[0.088, 0.091, 0.094, 0.097, 0.1].map((v) => <g key={v}><line className="q7-grade" x1={x(v)} x2={x(v)} y1={0} y2={d.h - d.fs * 2.4} /><text className="q7-tick" x={x(v)} y={d.h - d.fs * 2.4} dy="1.2em" textAnchor="middle">{num(v, 3)}</text></g>)}
                <text className="q7-tick" x={x(0.088)} y={d.h}>Brier, menor é melhor; eixo começa em 0,088</text>
                {itens.map((it, k) => { const cy = lh * k + lh * 0.62; return (
                  <g key={it.nome}>
                    <text className="q7-rot" x={x(0.088)} y={cy - d.fs * 0.85}>{it.nome}<tspan className="q7-rot--peq" style={{ fill: "#5B6475" }} dx="8">{it.nota}</tspan></text>
                    <line x1={x(0.088)} x2={x(0.1)} y1={cy} y2={cy} stroke="#E7E4DC" strokeWidth={2} />
                    <circle cx={x(it.v)} cy={cy} r={d.fs * 0.5} fill={it.cor} stroke="#fff" strokeWidth={2} />
                    <text className="q7-rot" x={x(it.v) + (it.v > 0.097 ? -d.fs * 0.8 : d.fs * 0.8)} y={cy} dy=".35em" textAnchor={it.v > 0.097 ? "end" : "start"}>{num(it.v, 5)}</text>
                  </g>
                ); })}
              </g>
            );
          }}
        </Grafico>
        <Expandir resumo="Fórmula e leitura">
          <Formula f={String.raw`\mathrm{BS}=\frac{1}{n}\sum_{i=1}^{n}(p_i-y_i)^2`} simbolos={[["p_i", "PD da proposta i"], ["y_i", "1 se deu default, 0 se pagou"]]} />
          <p className="q7-nota">O valor só se lê ao lado de uma referência na mesma amostra. Uma constante igual à prevalência tem Brier π(1 − π), que depende da carteira: com evento raro, qualquer Brier parece pequeno.</p>
        </Expandir>
        <div className="q7-botoes"><Botao onClick={() => { setY(1); setP(0.05); }}>Default com PD de 5%</Botao><Botao sec onClick={() => { setY(0); setP(0.1); }}>Restaurar</Botao></div>
      </Painel>
    </Quadro>
  );
}
