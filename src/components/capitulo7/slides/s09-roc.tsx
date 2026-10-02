"use client";
import { useEffect, useState } from "react";
import { Botao, Painel, Quadro, Seg, useMovimentoReduzido, type Pagina } from "../base";
import { Roc } from "../graficos";
import { Matriz } from "../pecas";
import { MINI, PL, Y, N, D } from "@/lib/capitulo7/dados";
import { aucPorPares, curvaRoc } from "@/lib/capitulo7/metricas";
import { int, num, pct } from "@/lib/capitulo7/formato";

/**
 * 09 · c7p6 · A ROC construída corte a corte. Na mini-base, cada clique baixa o corte até a próxima PD distinta: um
 * default recusado sobe a curva 1/5; um adimplente a desloca 1/15 para a direita; um empate entre os dois desenha a
 * diagonal do degrau. A matriz menor acompanha o passo. Na janela (737), a curva inteira e a AUC da mesma amostra.
 */
const MY = MINI.map((m) => m.y), MP = MINI.map((m) => m.pd);
const PTS = curvaRoc(MY, MP);
const AUC_MINI = aucPorPares(MY, MP).auc!;
const PTS_J = curvaRoc(Y, PL); const AUC_J = aucPorPares(Y, PL).auc!;
type Base = "mini" | "janela";

export function S09Roc({ pagina }: { pagina?: Pagina }) {
  const [base, setBase] = useState<Base>("mini");
  const [s, setS] = useState(0);
  const [tocando, setTocando] = useState(false);
  const reduzido = useMovimentoReduzido();
  const rodando = tocando && !reduzido && s < PTS.length - 1;
  useEffect(() => { if (!rodando) return; const t = setTimeout(() => setS((v) => Math.min(PTS.length - 1, v + 1)), 750); return () => clearTimeout(t); }, [rodando, s]);
  const p = PTS[s], ant = PTS[Math.max(0, s - 1)];
  const novos = s ? MINI.filter((m) => m.pd === p.limiar) : [];
  const dd = p.vp - ant.vp, dg = p.fp - ant.fp;
  const passo = s === 0 ? "Nenhuma recusa: o ponto está na origem." : dd && dg ? `PD ${pct(p.limiar, 0)}: ${dd} default e ${dg} adimplente empatados; a curva anda na diagonal.` : dd ? `PD ${pct(p.limiar, 0)}: ${dd === 1 ? "um default recusado" : `${dd} defaults recusados`}; a curva sobe ${dd} × 1/5.` : `PD ${pct(p.limiar, 0)}: ${dg === 1 ? "um adimplente recusado" : `${dg} adimplentes recusados`}; a curva anda ${dg} × 1/15 para a direita.`;
  const mini = base === "mini";
  return (
    <Quadro slug="c7p6" pagina={pagina} layout="qd"
      conclusao={mini ? (s < PTS.length - 1 ? passo : <>Todos os cortes percorridos. A área sob a curva é <b>{num(AUC_MINI, 4)}</b>, a mesma contagem de pares do slide anterior. O canto superior esquerdo seria recusar todos os defaults sem recusar nenhum adimplente.</>)
        : <>Na janela, {int(PTS_J.length - 1)} cortes distintos desenham a curva; AUC {num(AUC_J, 4)} na mesma amostra. A ROC não sabe quanto custa cada erro: ela não escolhe o corte.</>}
      fonte={mini ? "Mini-base de 20 propostas (5 defaults, 15 adimplentes), PD da logística em pontos inteiros; um ponto por PD distinta. Recusa quando PD ≥ corte." : `Janela fora do tempo: ${N} propostas, ${D} defaults; PD da logística em precisão plena; um ponto por PD distinta.`}>
      <Roc rotulo={mini ? `Curva ROC da mini-base até o corte ${s}` : "Curva ROC da logística na janela"} titulo="Curva ROC" sub={mini ? "eixos com o denominador de cada classe: 5 defaults, 15 adimplentes" : `${D} defaults, ${N - D} adimplentes`}
        series={mini ? [{ pts: PTS.slice(0, s + 1), classe: "ord" }] : [{ pts: PTS_J, classe: "ord", area: true }]}
        ponto={mini ? { fpr: p.fpr, tpr: p.tpr, rot: s ? `corte ${pct(p.limiar, 0)}` : "início" } : null}
        xTit={mini ? "Adimplentes recusados, de 15" : "Adimplentes recusados (falso positivo)"} yTit={mini ? "Defaults recusados, de 5" : "Defaults recusados (verdadeiro positivo)"} />
      <Painel>
        <Seg rotulo="Base" opcoes={[{ v: "mini" as Base, r: "Mini-base (20)" }, { v: "janela" as Base, r: "Janela (737)" }]} valor={base} onChange={(v) => { setBase(v); setTocando(false); }} />
        {mini ? (
          <>
            <div className="q7-botoes"><Botao prim onClick={() => setS(Math.min(PTS.length - 1, s + 1))} desab={s >= PTS.length - 1}>Baixar o corte</Botao><Botao onClick={() => setS(Math.max(0, s - 1))} desab={s === 0}>Voltar</Botao>{!reduzido && <Botao onClick={() => { if (s >= PTS.length - 1) setS(0); setTocando(!rodando); }}>{rodando ? "Pausar" : "Reproduzir"}</Botao>}<Botao sec onClick={() => { setS(0); setTocando(false); }}>Restaurar</Botao></div>
            <p className="q7-p">{passo}</p>
            {novos.length > 0 && <p className="q7-nota">Recusadas neste passo: {novos.map((m) => `#${m.id} (${m.y ? "default" : "pagou"})`).join(", ")}.</p>}
            <Matriz vp={p.vp} fp={p.fp} fn={5 - p.vp} vn={15 - p.fp} compacta rotulos={false} />
            <dl className="q7-lista"><div><dt>TPR = VP ÷ 5</dt><dd>{pct(p.tpr, 0)}</dd></div><div><dt>FPR = FP ÷ 15</dt><dd>{pct(p.fpr, 1)}</dd></div></dl>
          </>
        ) : (
          <dl className="q7-lista"><div><dt>Cortes distintos</dt><dd>{int(PTS_J.length - 1)}</dd></div><div data-tom="prob"><dt>AUC (mesma amostra)</dt><dd>{num(AUC_J, 4)}</dd></div><div><dt>Diagonal</dt><dd>sorteio</dd></div></dl>
        )}
      </Painel>
    </Quadro>
  );
}
