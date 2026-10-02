"use client";
import { useState } from "react";
import { Botao, caminho, Controle, Eixos, escala, Grafico, Kpi, Painel, Previsao, Quadro, margens, type Pagina } from "../base";
import { Confiabilidade } from "../graficos";
import { D, N, PL, Y } from "@/lib/capitulo7/dados";
import { aucPorPares, brier, calibracaoGlobal, corp, faixasQuantis, interceptoESlope, logit, logLoss, media, sigmoide, transformar } from "@/lib/capitulo7/metricas";
import { num, pct } from "@/lib/capitulo7/formato";

/**
 * 26 · c7p35 · Laboratório: boa fila, probabilidades ruins. p' = σ(a + b · logit p) sobre a logística da janela, com
 * b > 0 (estritamente crescente). Curva de confiabilidade, Brier, log loss, PD média e a transformação desenhada; a AUC
 * fica parada enquanto b > 0. O exemplo "melhor ajuste nesta janela" usa a própria janela para estimar a e b: serve de
 * referência visual e não é avaliação independente (slide 27). Nos atalhos de excesso e falta de confiança, a é
 * escolhido por bisseção para manter a PD média da logística: só a inclinação muda.
 */
const AUC0 = aucPorPares(Y, PL).auc!;
const AJ = interceptoESlope(Y, PL);
const PM = media(PL)!;
/** a que mantém a PD média da logística para um dado b (a média transformada cresce com a). */
const aMesmaMedia = (b: number) => { let lo = -10, hi = 10; for (let k = 0; k < 80; k++) { const m = (lo + hi) / 2; if (media(transformar(PL, m, b))! < PM) lo = m; else hi = m; } return (lo + hi) / 2; };
const EXCESSO = { a: aMesmaMedia(2.2), b: 2.2 }, FALTA = { a: aMesmaMedia(0.45), b: 0.45 };
const BS_ISO = corp(Y, PL).bsRc;
const PRESETS = [
  { r: "Erro de nível", a: 0.8, b: 1 },
  { r: "Excesso de confiança", ...EXCESSO },
  { r: "Falta de confiança", ...FALTA },
  { r: "Melhor ajuste nesta janela", a: AJ.intercepto, b: AJ.slope },
  { r: "Restaurar", a: 0, b: 1 },
];
const OPS = [
  { texto: "A AUC cai", retorno: <>Com b positivo ninguém troca de lugar: a fila e a AUC ficam. Confunde calibração com ordenação.</> },
  { texto: "A AUC fica e o Brier sobe", certa: true, retorno: <>Isso. As PDs se espalham demais, o Brier piora, e a AUC não percebe nada.</> },
  { texto: "As duas melhoram", retorno: <>Espalhar PDs que já estavam na ordem certa não melhora a ordem, e aqui exagera a confiança: o Brier piora.</> },
];

export function S26LaboratorioCalibracao({ pagina }: { pagina?: Pagina }) {
  const [a, setA] = useState(0);
  const [b, setB] = useState(1);
  const [esc, setEsc] = useState<number | null>(null);
  const P = transformar(PL, a, b); const F = faixasQuantis(Y, P, 10); const g = calibracaoGlobal(Y, P);
  const auc = aucPorPares(Y, P).auc!;
  const bs = brier(Y, P), ll = logLoss(Y, P).valor, bs0 = brier(Y, PL), ll0 = logLoss(Y, PL).valor;
  const juste = Math.abs(a - AJ.intercepto) < 1e-9 && Math.abs(b - AJ.slope) < 1e-9;
  return (
    <Quadro slug="c7p35" pagina={pagina} layout="gl"
      conclusao={juste ? <>Com a e b estimados na própria janela, os pontos encostam na diagonal e o Brier cai para {num(bs, 5)}: <b>o melhor ajuste de a e b nesta amostra</b>, otimista por construção. A isotônica na mesma amostra iria além ({num(BS_ISO, 5)}).</>
        : <>a = {num(a, 2)}, b = {num(b, 2)}: PD média {pct(g.pdMedia!, 1)} contra {pct(D / N, 1)} observados; Brier {num(bs, 5)} e log loss {num(ll, 4)}. A AUC continua <b>{num(auc, 4)}</b>: com b positivo nenhuma proposta troca de lugar.</>}
      fonte={`Janela fora do tempo: ${N} propostas, ${D} defaults; transformação aplicada à PD da logística. Nos atalhos de excesso e falta de confiança, a mantém a PD média em ${pct(PM, 1)}.`}>
      <Painel>
        <div className="q7-s26-g">
          <Confiabilidade titulo="Confiabilidade" sub="cinza: original · petróleo: nova" rotulo={`Curva de confiabilidade com a = ${num(a, 2)} e b = ${num(b, 2)}`} max={0.5} ticks={[0, 0.25, 0.5]} series={[{ faixas: faixasQuantis(Y, PL, 10), classe: "mudo", linha: true }, { faixas: F, classe: "prob", linha: true }]} anotar={false} />
          <Grafico titulo="A transformação" sub="tracejada cinza: sem mudança" rotulo={`Transformação p' = σ(${num(a, 2)} + ${num(b, 2)} logit p)`} arCelular="1 / 1">
            {(d) => {
              const m = margens(d.fs, { l: 3, b: 2.8, t: 1, r: 0.8 }); const lado = Math.min(d.w - m.l - m.r, d.h - m.t - m.b);
              const x = escala([0, 0.5], [m.l, m.l + lado]), y = escala([0, 0.5], [m.t + lado, m.t]);
              const pts = Array.from({ length: 100 }, (_, i) => 0.0025 + (i / 99) * 0.4975).map((q) => ({ x: x(q), y: y(Math.min(0.5, sigmoide(a + b * logit(q)))) }));
              return <g><Eixos x={x} y={y} xt={[0, 0.25, 0.5]} yt={[0, 0.25, 0.5]} fx={(v) => pct(v, 0)} fy={(v) => pct(v, 0)} xTit="PD original" yTit="PD nova" /><line className="q7-diag" x1={x(0)} y1={y(0)} x2={x(0.5)} y2={y(0.5)} /><path className="q7-linha q7-linha--prob" d={caminho(pts)} /></g>;
            }}
          </Grafico>
        </div>
        <div className="q7-s26-ctl">
          <Controle rotulo="a: nível de todas as PDs" valor={a} min={-2} max={2} passo={0.05} onChange={setA} mostrar={num(a, 2)} escala={["mais baixas", "mais altas"]} />
          <Controle rotulo="b: inclinação" valor={b} min={0.2} max={3} passo={0.05} onChange={setB} mostrar={num(b, 2)} escala={["b < 1 comprime", "b > 1 espalha"]} />
          <Botao sec onClick={() => { setA(0); setB(1); setEsc(null); }}>Restaurar</Botao>
        </div>

      </Painel>
      <Painel>
        <div className="q7-kpis q7-kpis--2">
          <Kpi rotulo="AUC" valor={num(auc, 4)} detalhe={Math.abs(auc - AUC0) < 1e-12 ? "igual à original" : "mudou"} tam="mini" />
          <Kpi rotulo="PD média" valor={pct(g.pdMedia!, 1)} detalhe={`observado ${pct(D / N, 1)}`} tam="mini" tom="prob" />
          <Kpi rotulo="Brier" valor={num(bs, 5)} detalhe={bs > bs0 + 1e-12 ? `▲ pior: era ${num(bs0, 5)}` : bs < bs0 - 1e-12 ? `▼ melhor: era ${num(bs0, 5)}` : `original ${num(bs0, 5)}`} tam="mini" tom={bs < bs0 - 1e-12 ? "val" : undefined} />
          <Kpi rotulo="Log loss" valor={num(ll, 4)} detalhe={ll > ll0 + 1e-12 ? `▲ pior: era ${num(ll0, 4)}` : ll < ll0 - 1e-12 ? `▼ melhor: era ${num(ll0, 4)}` : `original ${num(ll0, 4)}`} tam="mini" tom={ll < ll0 - 1e-12 ? "val" : undefined} />
        </div>
        <Previsao pergunta={`Com b = ${num(EXCESSO.b, 1)} e a mesma PD média:`} opcoes={OPS} escolha={esc} onEscolha={(i) => { setEsc(i); if (i !== null && OPS[i].certa) { setA(EXCESSO.a); setB(EXCESSO.b); } }} recolher />
        <div className="q7-g2-grade2 q7-g2-atalhos" role="group" aria-label="Exemplos prontos">{PRESETS.filter((pr) => pr.r !== "Restaurar").map((pr) => <Botao key={pr.r} onClick={() => { setA(pr.a); setB(pr.b); }}>{pr.r}</Botao>)}</div>
      </Painel>
    </Quadro>
  );
}
