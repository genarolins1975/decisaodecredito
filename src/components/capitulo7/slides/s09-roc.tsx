"use client";
import { useEffect, useState, type ReactNode } from "react";
import { Botao, caminho, Eixos, escala, Grafico, margens, Painel, Previsao, Quadro, Seg, useMovimentoReduzido, type Opcao, type Pagina } from "../base";
import { Matriz } from "../pecas";
import { MINI, PL, Y, N, D } from "@/lib/capitulo7/dados";
import { aucPorPares, curvaRoc, type PontoRoc } from "@/lib/capitulo7/metricas";
import { int, num, pct } from "@/lib/capitulo7/formato";

/**
 * 09 · c7p6 · A ROC construída corte a corte. Na mini-base, cada clique baixa o corte até a próxima PD distinta: um
 * default recusado sobe a curva 1/5; um adimplente a desloca 1/15 para a direita; um empate entre os dois desenha a
 * diagonal do degrau. Antes de cada passo a turma pode apostar o movimento (escolher já revela o passo; "Tentar outra"
 * desfaz). A matriz acompanha o passo: cada ponto é uma matriz como a do slide 8. Na janela (737), a curva inteira.
 */
const MY = MINI.map((m) => m.y), MP = MINI.map((m) => m.pd);
const PTS = curvaRoc(MY, MP);
const ND = MY.filter(Boolean).length, NA = MY.length - ND;
const AUC_MINI = aucPorPares(MY, MP).auc!;
const PTS_J = curvaRoc(Y, PL); const AUC_J = aucPorPares(Y, PL).auc!;
const ULT = PTS.length - 1;
type Base = "mini" | "janela";
type Mov = 0 | 1 | 2; // sobe, direita, diagonal

/** O que muda do ponto k − 1 para o ponto k: quem entra na recusa e para onde a curva anda. */
function passoDe(k: number) {
  const p = PTS[k], a = PTS[k - 1];
  const dd = p.vp - a.vp, dg = p.fp - a.fp;
  const mov: Mov = dd && dg ? 2 : dd ? 0 : 1;
  const novos = MINI.filter((m) => m.pd === p.limiar);
  return { p, dd, dg, mov, novos };
}
const quem = (k: number) => passoDe(k).novos.map((m) => `#${m.id} (${m.y ? "default" : "pagou"})`).join(" e ");
const frase = (k: number) => {
  if (k === 0) return "Nenhuma recusa: o ponto está na origem. Cada ponto da curva é uma matriz como a do slide 8.";
  const { p, dd, dg } = passoDe(k);
  return dd && dg ? `PD ${pct(p.limiar, 0)}: ${dd} default e ${dg} adimplente empatados; a curva anda na diagonal.`
    : dd ? `PD ${pct(p.limiar, 0)}: ${dd === 1 ? "um default recusado" : `${dd} defaults recusados`}; a curva sobe ${dd} × 1/${ND}.`
    : `PD ${pct(p.limiar, 0)}: ${dg === 1 ? "um adimplente recusado" : `${dg} adimplentes recusados`}; a curva anda ${dg} × 1/${NA} para a direita.`;
};
/** Retorno de cada alternativa para o passo k: a certa confirma; as erradas nomeiam a confusão. */
function opcoes(k: number): Opcao[] {
  const { mov } = passoDe(k);
  const ret = (o: Mov): ReactNode => {
    if (o === mov) return <>Isso. {frase(k)}</>;
    if (mov === 2) return <>Os dois entram no mesmo corte porque têm a mesma PD: a curva sobe 1/{ND} e anda 1/{NA} ao mesmo tempo, <b>na diagonal</b>.</>;
    if (o === 2) return <>A diagonal só aparece quando um default e um adimplente têm a <b>mesma PD</b> e entram juntos. Aqui entra só {quem(k)}.</>;
    if (o === 0) return <>Subir é recusar um <b>default</b> (verdadeiro positivo). Recusar um adimplente é falso positivo: o ponto anda 1/{NA} para a direita.</>;
    return <>Andar para a direita é recusar um <b>adimplente</b>. Um default recusado é verdadeiro positivo: a curva sobe 1/{ND}.</>;
  };
  return [
    { texto: "Sobe", certa: mov === 0, retorno: ret(0) },
    { texto: "Anda para a direita", certa: mov === 1, retorno: ret(1) },
    { texto: "Anda na diagonal", certa: mov === 2, retorno: ret(2) },
  ];
}

/** ROC local: sem o 0% do eixo x (que se sobrepunha ao 0% do eixo y) e com o rótulo do ponto acima dele. */
function RocS09({ pts, area, ponto, rotulo, xTit, yTit, sub }: { pts: PontoRoc[]; area?: boolean; ponto: { fpr: number; tpr: number; rot: string } | null; rotulo: string; xTit: string; yTit: string; sub: string }) {
  return (
    <Grafico titulo="Curva ROC" sub={sub} rotulo={rotulo} arCelular="1 / 1">
      {(d) => {
        const m = margens(d.fs, { l: 3.1, b: 2.9, t: 1.2, r: 0.8 });
        const lado = Math.min(d.w - m.l - m.r, d.h - m.t - m.b);
        const x = escala([0, 1], [m.l, m.l + lado]), y = escala([0, 1], [m.t + lado, m.t]);
        const xy = pts.map((p) => ({ x: x(p.fpr), y: y(p.tpr) }));
        const dir = ponto && ponto.fpr > 0.6; // perto da borda direita, o rótulo vai para a esquerda do ponto
        const baixo = ponto && ponto.tpr > 0.85; // perto do topo, o rótulo vai para baixo do ponto
        return (
          <g>
            <Eixos x={x} y={y} xt={[0.25, 0.5, 0.75, 1]} yt={[0, 0.25, 0.5, 0.75, 1]} fx={(v) => pct(v, 0)} fy={(v) => pct(v, 0)} xTit={xTit} yTit={yTit} />
            <line className="q7-diag" x1={x(0)} y1={y(0)} x2={x(1)} y2={y(1)} />
            <text className="q7-rot--peq" x={x(0.62)} y={y(0.5)} style={{ fill: "#5B6475" }}>sorteio: AUC 0,5</text>
            {area && <path className="q7-area" fill="#3D5A8A" d={`${caminho(xy)}L${x(1)} ${y(0)}L${x(0)} ${y(0)}Z`} />}
            <path className="q7-linha q7-linha--ord" d={caminho(xy)} />
            {ponto && <g>
              <circle cx={x(ponto.fpr)} cy={y(ponto.tpr)} r={d.fs * 0.5} fill="#A85A0C" stroke="#fff" strokeWidth={2.5} />
              <text className="q7-corte-t" x={x(ponto.fpr) + (dir ? -d.fs * 0.7 : d.fs * 0.7)} y={y(ponto.tpr) + (baixo ? d.fs * 1.5 : -d.fs * 0.75)} textAnchor={dir ? "end" : "start"}>{ponto.rot}</text>
            </g>}
          </g>
        );
      }}
    </Grafico>
  );
}

export function S09Roc({ pagina }: { pagina?: Pagina }) {
  const [base, setBase] = useState<Base>("mini");
  const [s, setS] = useState(0);
  const [esc, setEsc] = useState<number | null>(null);
  const [tocando, setTocando] = useState(false);
  const reduzido = useMovimentoReduzido();
  const rodando = tocando && !reduzido && s < ULT;
  useEffect(() => { if (!rodando) return; const t = setTimeout(() => setS((v) => Math.min(ULT, v + 1)), 750); return () => clearTimeout(t); }, [rodando, s]);
  const ir = (k: number) => { setEsc(null); setS(Math.max(0, Math.min(ULT, k))); };
  const p = PTS[s];
  const novos = s ? passoDe(s).novos : [];
  const alvo = esc !== null ? s : s + 1; // o passo sobre o qual a aposta é feita
  const mini = base === "mini";
  return (
    <Quadro slug="c7p6" pagina={pagina} layout="qd"
      conclusao={mini ? (s < ULT ? frase(s) : <>Todos os cortes percorridos. A área sob a curva é <b>{num(AUC_MINI, 4)}</b>, a mesma AUC da contagem de pares (slide 7). O canto superior esquerdo seria recusar todos os defaults sem recusar nenhum adimplente.</>)
        : <>Na janela, {int(PTS_J.length - 1)} cortes distintos desenham a curva; AUC {num(AUC_J, 4)} na mesma amostra. A ROC não sabe quanto custa cada erro: ela não escolhe o corte.</>}
      fonte={mini ? `Mini-base de ${MINI.length} propostas (${ND} defaults, ${NA} adimplentes), PD da logística em pontos inteiros; um ponto por PD distinta. Recusa quando PD ≥ corte.` : `Janela fora do tempo: ${N} propostas, ${D} defaults; PD da logística em precisão plena; um ponto por PD distinta.`}>
      <RocS09 sub={mini ? `denominadores: ${ND} defaults, ${NA} adimplentes` : `${D} defaults, ${N - D} adimplentes`} rotulo={mini ? `Curva ROC da mini-base até o corte ${s}` : "Curva ROC da logística na janela"}
          pts={mini ? PTS.slice(0, s + 1) : PTS_J} area={!mini}
          ponto={mini ? { fpr: p.fpr, tpr: p.tpr, rot: s ? `corte ${pct(p.limiar, 0)}` : "início: nenhuma recusa" } : null}
          xTit={mini ? `Adimplentes recusados, de ${NA}` : "Adimplentes recusados (falso positivo)"} yTit={mini ? `Defaults recusados, de ${ND}` : "Defaults recusados (verdadeiro positivo)"} />
      <Painel className="q7-s09-p">
        <div className="q7-s09-topo">
          <Seg rotulo="Base" opcoes={[{ v: "mini" as Base, r: `Mini-base (${MINI.length})` }, { v: "janela" as Base, r: `Janela (${N})` }]} valor={base} onChange={(v) => { setBase(v); setTocando(false); }} />
          {mini && <div className="q7-botoes"><Botao prim onClick={() => ir(s + 1)} desab={s >= ULT}>Baixar o corte</Botao><Botao onClick={() => ir(s - 1)} desab={s === 0}>Voltar</Botao>{!reduzido && <Botao onClick={() => { setEsc(null); if (s >= ULT) setS(0); setTocando(!rodando); }}>{rodando ? "Pausar" : "Reproduzir"}</Botao>}<Botao sec onClick={() => { ir(0); setTocando(false); }}>Restaurar</Botao></div>}
        </div>
        {mini ? (
          <div className="q7-s09-c">
            <div className="q7-s09-prev">
              {alvo <= ULT && !rodando ? (
                <Previsao rotulo="Antes de baixar o corte" pergunta={<>No corte de {pct(PTS[alvo].limiar, 0)} entra{passoDe(alvo).novos.length > 1 ? "m" : ""} {quem(alvo)}. A curva:</>}
                  opcoes={opcoes(alvo)} escolha={esc} onEscolha={(i) => { if (i === null) { setEsc(null); setS(Math.max(0, s - 1)); } else { setEsc(i); setS(alvo); } }} />
              ) : <p className="q7-p">{rodando ? frase(s) : "Fim da fila: todas as propostas recusadas, o ponto chega a (100%, 100%)."}</p>}
            </div>
            <div className="q7-s09-mx">
              <p className="q7-k">Matriz neste corte{s ? ` (PD ≥ ${pct(p.limiar, 0)})` : ""}</p>
              <Matriz vp={p.vp} fp={p.fp} fn={ND - p.vp} vn={NA - p.fp} compacta />
              <dl className="q7-lista"><div><dt>TPR = VP ÷ {ND}</dt><dd>{pct(p.tpr, 0)}</dd></div><div><dt>FPR = FP ÷ {NA}</dt><dd>{pct(p.fpr, 1)}</dd></div></dl>
              {novos.length > 0 && <p className="q7-nota">Recusadas neste passo: {novos.map((m) => `#${m.id} (${m.y ? "default" : "pagou"})`).join(", ")}.</p>}
            </div>
          </div>
        ) : (
          <dl className="q7-lista"><div><dt>Cortes distintos</dt><dd>{int(PTS_J.length - 1)}</dd></div><div><dt>AUC (mesma amostra)</dt><dd>{num(AUC_J, 4)}</dd></div><div><dt>Diagonal</dt><dd>sorteio</dd></div></dl>
        )}
      </Painel>
    </Quadro>
  );
}
