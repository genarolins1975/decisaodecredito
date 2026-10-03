"use client";
import { useState } from "react";
import { Botao, caminho, Controle, Eixos, escala, Grafico, margens, Painel, Previsao, Quadro, type Pagina } from "@/components/capitulo7/base";
import { COR, sc } from "../b2";
import { FONTE_MNIST, HIST, INDICE_ZERO, M_SGD } from "@/lib/capitulo12/dados";
import { confusaoNoIndice, limiarDeMenorCusto } from "@/lib/capitulo12/metricas";
import { SLIDE } from "@/lib/capitulo12/roteiro";
import { int, pct } from "@/lib/capitulo7/formato";

/**
 * 16 · c12p16 · Em crédito, os dois erros têm custos diferentes. Os dois cartões da aula (falso positivo = recusar um
 * bom pagador; falso negativo = aprovar um mau pagador) e a pergunta da aula como previsão; as consequências de cada
 * erro abrem no acerto. O experimento é uma analogia declarada no detector de 5: perder um 5 custa c alarmes falsos
 * (c de 1 a 30); custo = c × FN + FP em todas as 602 bordas do histograma da validação cruzada (limiarDeMenorCusto
 * sobre HIST), com a curva de custo entre os scores −25.000 e 10.000 e o limiar 0 (a matriz do slide 11) contra o de
 * menor custo. Estado inicial: previsão em aberto, c = 1. "Restaurar" volta a ele.
 */
const C0 = 1;
const ZERO = confusaoNoIndice(HIST, INDICE_ZERO);
const I_DE = HIST.bordas.findIndex((b) => b >= -25000), I_ATE = HIST.bordas.findIndex((b) => b >= 10000);
const CONF = Array.from({ length: I_ATE - I_DE + 1 }, (_, k) => ({ t: HIST.bordas[I_DE + k], c: confusaoNoIndice(HIST, I_DE + k) }));
// o ótimo de todo c do controle cai dentro da faixa desenhada
for (let c = 1; c <= 30; c++) { const o = limiarDeMenorCusto(HIST, c, 1); if (o.i < I_DE || o.i > I_ATE) throw new Error(`s16: ótimo de c = ${c} fora da faixa desenhada`); }

const OPCOES = [
  { texto: "O falso positivo: recusar um bom pagador", certa: false, retorno: <>Esse custo existe (margem perdida, cliente na concorrência), mas é pouco visível e costuma ser menor que uma <b>perda de crédito</b>, que leva parte do saldo.</> },
  { texto: "O falso negativo: aprovar um mau pagador", certa: true, retorno: <>Em geral, sim: a perda é <b>EAD × LGD</b>, com provisão e capital. Mas o falso positivo não custa zero: o limiar depende da <b>razão</b> entre os dois.</> },
  { texto: "Custam o mesmo: um erro é um erro", certa: false, retorno: <>É o que a <b>acurácia</b> assume ao somar os erros. Em crédito, as consequências são diferentes.</> },
];

export function S16Custos({ pagina }: { pagina?: Pagina }) {
  const [esc, setEsc] = useState<number | null>(null);
  const [c, setC] = useState(C0);
  const ok = esc !== null && OPCOES[esc].certa;
  const o = limiarDeMenorCusto(HIST, c, 1), t = HIST.bordas[o.i];
  const custo0 = c * ZERO.fn + ZERO.fp;
  const restaurar = () => { setEsc(null); setC(C0); };
  return (
    <Quadro slug="c12p16" pagina={pagina} layout="gl"
      conclusao={<>O limiar ótimo depende da razão entre os dois custos, e não da acurácia: com um 5 perdido valendo <b>{int(c)}</b> alarme{c > 1 ? "s" : ""} falso{c > 1 ? "s" : ""}, o menor custo está no limiar <b>{sc(t)}</b>: {int(o.custo)} contra {int(custo0)} no limiar 0 ({pct(1 - o.custo / custo0, 0)} a menos). O slide {SLIDE.c12p17.n} mostra como o limiar vira decisão.</>}
      fonte={`${FONTE_MNIST}. Analogia: custo = c × FN + FP, procurado em todas as ${int(HIST.bordas.length)} bordas do histograma de scores (contagem exata em cada borda).`}>
      <Painel className="q12-s16-esq">
        <div className="q12-s16-g">
        <div className="q12-s16-cart">
          <div className="q12-s16-c" data-c="fp">
            <p className="q12-s16-tit"><b>FP</b> Falso positivo</p>
            <p className="q12-s16-def">Recusar um bom pagador</p>
            {ok ? <ul><li>Receita e margem perdidas</li><li>Cliente vai para a concorrência</li><li><b>Pouco visível:</b> fora da inadimplência</li></ul> : <p className="q7-nota">Consequências no acerto.</p>}
          </div>
          <div className="q12-s16-c" data-c="fn">
            <p className="q12-s16-tit"><b>FN</b> Falso negativo</p>
            <p className="q12-s16-def">Aprovar um mau pagador</p>
            {ok ? <ul><li>Perda: EAD × LGD</li><li>Provisão e capital</li><li><b>Visível:</b> aparece nas safras</li></ul> : <p className="q7-nota">Consequências no acerto.</p>}
          </div>
        </div>
        <div className="q12-s16-exp">
          <p className="q7-k">Analogia: perder um 5 custa c alarmes falsos</p>
          <Grafico rotulo={`Custo total contra o limiar com c = ${c}: menor custo no limiar ${sc(t)}, ${int(o.custo)}, contra ${int(custo0)} no limiar 0`} arCelular="16 / 9">
            {(d) => {
              const m = margens(d.fs, { l: 3.6, b: 2.4, t: 1.4, r: 0.8 });
              const pts = CONF.map((p) => ({ t: p.t, v: c * p.c.fn + p.c.fp }));
              // eixo até 2,2 vezes o custo no limiar 0: o vale do ótimo e o limiar 0 ficam legíveis; a curva sai pelo topo
              const ym = custo0 * 2.2;
              const x = escala([-25000, 10000], [m.l, d.w - m.r]), y = escala([0, ym], [d.h - m.b, m.t]);
              const cabem = Math.max(2, Math.floor((d.h - m.t - m.b) / (d.fs * 1.8)));
              const bruto = ym / cabem, pot = 10 ** Math.floor(Math.log10(bruto));
              const passo = [1, 2, 2.5, 5, 10].map((k) => k * pot).find((v) => v >= bruto)!;
              const yt: number[] = []; for (let v = 0; v <= ym; v += passo) yt.push(v);
              return (
                <g>
                  <clipPath id="q12-s16-clip"><rect x={m.l} y={m.t} width={d.w - m.l - m.r} height={d.h - m.t - m.b} /></clipPath>
                  <Eixos x={x} y={y} xt={[-20000, -10000, 0, 10000]} yt={yt} fx={sc} fy={(v) => int(v)} yTit="Custo total = c × FN + FP" />
                  <path className="q7-linha q7-linha--def" d={caminho(pts.map((p) => ({ x: x(p.t), y: y(p.v) })))} clipPath="url(#q12-s16-clip)" />
                  <circle cx={x(0)} cy={y(custo0)} r={d.fs * 0.45} fill="#fff" stroke={COR.lim} strokeWidth={3} />
                  <text className="q7-corte-t" x={x(0) + d.fs * 0.5} y={y(custo0)} dy="-.7em">limiar 0</text>
                  <circle cx={x(t)} cy={y(o.custo)} r={d.fs * 0.45} fill={COR.lim} stroke="#fff" strokeWidth={2} />
                  <text className="q7-corte-t" x={x(t) - d.fs * 0.5} y={y(o.custo)} dy="-.7em" textAnchor="end">menor custo</text>
                </g>
              );
            }}
          </Grafico>
          <Controle rotulo="Um falso negativo custa c falsos positivos" valor={c} min={1} max={30} passo={1} onChange={setC} mostrar={`c = ${int(c)}`} escala={["1", "30"]} />
        </div>
        </div>
      </Painel>
      <Painel>
        <Previsao pergunta="Em crédito, a classe positiva é o mau pagador. Qual erro custa mais?" opcoes={OPCOES} escolha={esc} onEscolha={setEsc} recolher />
        <table className="q7-tab q12-s16-tab">
          <thead><tr><th className="q7-t-l">Com c = {int(c)}</th><th>Limiar 0</th><th>Menor custo</th></tr></thead>
          <tbody>
            <tr><th scope="row">Limiar</th><td>0</td><td>{sc(t)}</td></tr>
            <tr><th scope="row">FP</th><td>{int(ZERO.fp)}</td><td>{int(o.c.fp)}</td></tr>
            <tr><th scope="row">FN</th><td>{int(ZERO.fn)}</td><td>{int(o.c.fn)}</td></tr>
            <tr data-on="1"><th scope="row">Custo</th><td>{int(custo0)}</td><td><b>{int(o.custo)}</b></td></tr>
          </tbody>
        </table>
        <div className="q7-botoes"><Botao sec onClick={restaurar} desab={esc === null && c === C0}>Restaurar</Botao></div>
      </Painel>
    </Quadro>
  );
}
