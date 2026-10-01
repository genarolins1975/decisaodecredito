"use client";
import { useState } from "react";
import { Botao, caminho, Controle, Eixos, escala, Grafico, Kpi, Painel, Quadro, margens, type Pagina } from "../base";
import { Confiabilidade } from "../graficos";
import { D, N, PL, Y } from "@/lib/capitulo7/dados";
import { aucPorPares, brier, calibracaoGlobal, faixasQuantis, interceptoESlope, logit, logLoss, sigmoide, transformar } from "@/lib/capitulo7/metricas";
import { num, pct } from "@/lib/capitulo7/formato";

/**
 * 26 · c7p35 · Laboratório: boa fila, probabilidades ruins. p' = σ(a + b · logit p) sobre a logística da janela, com
 * b > 0 (estritamente crescente). Curva de confiabilidade, Brier, log loss, PD média e a transformação desenhada; a AUC
 * fica parada enquanto b > 0. O exemplo "melhor ajuste nesta janela" usa a própria janela para estimar a e b: serve de
 * referência visual e não é avaliação independente (slide 27).
 */
const AUC0 = aucPorPares(Y, PL).auc!;
const AJ = interceptoESlope(Y, PL);
const PRESETS = [
  { r: "Restaurar", a: 0, b: 1 },
  { r: "Erro de nível", a: 0.8, b: 1 },
  { r: "Excesso de confiança", a: logit(0.11) * (1 - 2.2), b: 2.2 },
  { r: "Falta de confiança", a: logit(0.11) * (1 - 0.45), b: 0.45 },
  { r: "Melhor ajuste nesta janela", a: AJ.intercepto, b: AJ.slope },
];

export function S26LaboratorioCalibracao({ pagina }: { pagina?: Pagina }) {
  const [a, setA] = useState(0);
  const [b, setB] = useState(1);
  const P = transformar(PL, a, b); const F = faixasQuantis(Y, P, 10); const g = calibracaoGlobal(Y, P);
  const auc = aucPorPares(Y, P).auc!;
  const bs = brier(Y, P), ll = logLoss(Y, P).valor, bs0 = brier(Y, PL), ll0 = logLoss(Y, PL).valor;
  const juste = Math.abs(a - AJ.intercepto) < 1e-9 && Math.abs(b - AJ.slope) < 1e-9;
  return (
    <Quadro slug="c7p35" pagina={pagina} layout="gl"
      conclusao={juste ? <>Com a e b estimados na própria janela, os pontos encostam na diagonal e o Brier cai para {num(bs, 5)}. É a melhor calibração possível <b>nesta amostra</b>: medida no mesmo lugar em que foi ajustada, é otimista por construção.</>
        : <>a = {num(a, 2)}, b = {num(b, 2)}: PD média {pct(g.pdMedia!, 1)} contra {pct(D / N, 1)} observados; Brier {num(bs, 5)} e log loss {num(ll, 4)}. A AUC continua <b>{num(auc, 4)}</b>: com b positivo nenhuma proposta troca de lugar.</>}
      fonte={`Janela fora do tempo: ${N} propostas, ${D} defaults; transformação aplicada à PD da logística. Excesso e falta de confiança giram em torno de 11% para não mexer no nível médio.`}>
      <Painel>
        <div className="q7-s26-g">
          <Confiabilidade titulo="Confiabilidade" sub="decis da PD nova" rotulo={`Curva de confiabilidade com a = ${num(a, 2)} e b = ${num(b, 2)}`} max={0.5} ticks={[0, 0.1, 0.2, 0.3, 0.4, 0.5]} series={[{ faixas: faixasQuantis(Y, PL, 10), classe: "mudo", linha: true }, { faixas: F, classe: "prob", linha: true }]} anotar={false} />
          <Grafico titulo="A transformação" sub="PD original → PD nova" rotulo={`Transformação p' = σ(${num(a, 2)} + ${num(b, 2)} logit p)`} arCelular="1 / 1">
            {(d) => {
              const m = margens(d.fs, { l: 3, b: 2.8, t: 1, r: 0.8 }); const lado = Math.min(d.w - m.l - m.r, d.h - m.t - m.b);
              const x = escala([0, 0.5], [m.l, m.l + lado]), y = escala([0, 1], [m.t + lado, m.t]);
              const pts = Array.from({ length: 100 }, (_, i) => 0.0025 + (i / 99) * 0.4975).map((q) => ({ x: x(q), y: y(sigmoide(a + b * logit(q))) }));
              return <g><Eixos x={x} y={y} xt={[0, 0.25, 0.5]} yt={[0, 0.5, 1]} fx={(v) => pct(v, 0)} fy={(v) => pct(v, 0)} xTit="PD original" yTit="PD nova" /><line className="q7-diag" x1={x(0)} y1={y(0)} x2={x(0.5)} y2={y(0.5)} /><path className="q7-linha q7-linha--dec" d={caminho(pts)} /></g>;
            }}
          </Grafico>
        </div>
        <div className="q7-s26-ctl">
          <Controle rotulo="a: nível (desloca todas as PDs)" valor={a} min={-2} max={2} passo={0.05} onChange={setA} mostrar={num(a, 2)} escala={["mais baixas", "mais altas"]} />
          <Controle rotulo="b: inclinação (b > 1 espalha; b < 1 comprime)" valor={b} min={0.2} max={3} passo={0.05} onChange={setB} mostrar={num(b, 2)} escala={["comprime", "espalha"]} />
        </div>
      </Painel>
      <Painel>
        <div className="q7-kpis q7-kpis--2">
          <Kpi rotulo="AUC" valor={num(auc, 4)} detalhe={Math.abs(auc - AUC0) < 1e-12 ? "igual à original" : "mudou"} tam="mini" />
          <Kpi rotulo="PD média" valor={pct(g.pdMedia!, 1)} detalhe={`observado ${pct(D / N, 1)}`} tam="mini" tom="prob" />
          <Kpi rotulo="Brier" valor={num(bs, 5)} detalhe={`original ${num(bs0, 5)}`} tam="mini" tom={bs < bs0 - 1e-12 ? "val" : bs > bs0 + 1e-12 ? "def" : undefined} />
          <Kpi rotulo="Log loss" valor={num(ll, 4)} detalhe={`original ${num(ll0, 4)}`} tam="mini" tom={ll < ll0 - 1e-12 ? "val" : ll > ll0 + 1e-12 ? "def" : undefined} />
        </div>
        <p className="q7-k">Exemplos prontos</p>
        <div className="q7-botoes">{PRESETS.map((pr) => <Botao key={pr.r} sec={pr.r === "Restaurar"} onClick={() => { setA(pr.a); setB(pr.b); }}>{pr.r}</Botao>)}</div>
        <p className="q7-nota">Cinza: a curva da logística sem transformação. Verde: a curva com a e b atuais.</p>
      </Painel>
    </Quadro>
  );
}
