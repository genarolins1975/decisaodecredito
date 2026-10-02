"use client";
import { useMemo, useState } from "react";
import { Botao, Controle, escala, Grafico, LinkSlide, Painel, Previsao, Quadro, Seg, type Pagina } from "../base";
import { D, N, PL, Y } from "@/lib/capitulo7/dados";
import { calibracaoGlobal, faixasQuantis, jeffreys, logit, sigmoide, transformar, wilson } from "@/lib/capitulo7/metricas";
import { int, num, pct } from "@/lib/capitulo7/formato";

/**
 * 18 · c7p29 · Calibração global. Abre no modelo comprimido, ilustrativo: σ(a + b · logit p) sobre a logística, com
 * b de 0,3 a 1 no controle e a resolvido por Newton para que a soma das PDs seja exatamente o número de defaults
 * observados (O/E = 1). No total ele acerta; as duas metades da fila só aparecem depois da previsão, e erram para lados
 * opostos. A logística é o segundo passo: O/E 1,13, com as duas metades abaixo do observado. O p de Jeffreys da
 * carteira (slide 21) diz se 81 contra 71,6 cabe no ruído. Cada barra de observado traz o intervalo de Wilson de 95%
 * do seu grupo, definido na legenda em uma frase (o slide 21 o apresenta). Título e subtítulo viram pergunta até a previsão: o do roteiro entrega a resposta.
 */
type Mod = "comprimido" | "logistica";
const TAXA = D / N;
const B0 = 0.3;
/** a que faz Σ σ(a + b · logit p) = D, por Newton. */
const aParaTotal = (b: number) => { let a = 0; for (let k = 0; k < 60; k++) { let f = 0, g = 0; for (const p of PL) { const q = sigmoide(a + b * logit(p)); f += q; g += q * (1 - q); } const da = (f - D) / g; a -= da; if (Math.abs(da) < 1e-13) break; } return a; };
const G_L = calibracaoGlobal(Y, PL);
const JEF = jeffreys(D, N, G_L.pdMedia!);
const OPS = [
  { texto: "Acerta nas duas metades", certa: false, retorno: <>O total bater não garante nada por grupo: um erro para cima numa metade pode cancelar um erro para baixo na outra. Confunde média certa com calibração.</> },
  { texto: "Erra para lados opostos, e os erros se cancelam", certa: true, retorno: <>Isso: comprimir sobe as PDs baixas e desce as altas; na soma, os erros se anulam.</> },
  { texto: "Erra para o mesmo lado nas duas", certa: false, retorno: <>Se as duas metades errassem para o mesmo lado, o total também erraria; aqui O/E é 1. Esquece que a soma das metades é o total.</> },
];

export function S18Global({ pagina }: { pagina?: Pagina }) {
  const [mod, setMod] = useState<Mod>("comprimido");
  const [b, setB] = useState(B0);
  const [esc, setEsc] = useState<number | null>(null);
  const a = useMemo(() => aParaTotal(b), [b]);
  const pd = useMemo(() => (mod === "logistica" ? PL : transformar(PL, a, b)), [mod, a, b]);
  const g = calibracaoGlobal(Y, pd); const metades = faixasQuantis(Y, pd, 2);
  const revelado = esc !== null && OPS[esc].certa;
  const grupos = [
    { nome: "Carteira inteira", prev: g.pdMedia!, obs: g.taxa!, n: g.n, d: g.observados, esp: g.esperados, oculto: false, ic: wilson(g.observados, g.n)! },
    ...metades.map((f, i) => ({ nome: i ? "Metade de cima" : "Metade de baixo", prev: f.pdMedia!, obs: f.obs!, n: f.n, d: f.d, esp: f.somaPd, oculto: !revelado, ic: f.ic! })),
  ];
  const comp = mod === "comprimido";
  // o retorno certo fala do comprimido; na logística ele não pode continuar dizendo que os erros se anulam
  const ops = comp ? OPS : OPS.map((o) => (o.certa ? { ...o, retorno: <>Isso, no comprimido os erros se anulam. A logística é outro caso: as duas metades ficam abaixo do observado.</> } : o));
  return (
    <Quadro slug="c7p29" pagina={pagina} layout="gl"
      titulo={revelado ? undefined : "Média prevista igual à observada prova calibração?"}
      sub={revelado ? undefined : "O total bater garante que cada parte da carteira bate?"}
      conclusao={!revelado ? <>O comprimido acerta o total: {num(g.esperados, 1)} esperados, {D} observados, <b>O/E = {num(g.razaoOE!, 2)}</b>. Isso prova calibração? Preveja antes de separar a fila em duas metades.</>
        : comp ? <>Metade de baixo: prevê {pct(metades[0].pdMedia!, 1)}, observa {pct(metades[0].obs!, 1)}. De cima: prevê {pct(metades[1].pdMedia!, 1)}, observa {pct(metades[1].obs!, 1)}. <b>Erros de sinais opostos se compensam no total</b>: O/E = {num(g.razaoOE!, 2)} não demonstra calibração por faixa; o slide 19 olha faixa a faixa.</>
        : <>A logística espera {num(g.esperados, 1)} e a janela teve {D}: O/E = {num(g.razaoOE!, 2)}, e a PD fica abaixo do observado nas duas metades (O/E {num(metades[0].d / metades[0].somaPd, 2)} e {num(metades[1].d / metades[1].somaPd, 2)}). O p de Jeffreys, que mede se {D} defaults ainda são compatíveis com a PD média (slide 21), é {num(JEF, 2)}: <b>a diferença ainda cabe no ruído</b>.</>}
      fonte={`Janela fora do tempo: ${int(N)} propostas, ${D} defaults (taxa ${pct(TAXA, 2)}). O/E = observados ÷ soma das PDs; acima de 1, subestima. Comprimido: σ(${num(a, 2)} + ${num(b, 2)} · logit p), com a escolhido para O/E = 1; construído só para esta demonstração. Metades: posições da fila de PD.`}>
      <Painel titulo="Previsto contra observado: a carteira e as duas metades da fila">
        <Grafico rotulo={grupos.map((x) => x.oculto ? `${x.nome}: oculto até a previsão` : `${x.nome}: previsto ${pct(x.prev, 1)}, observado ${pct(x.obs, 1)}`).join("; ")} arCelular="16 / 10">
          {(d) => {
            const x0 = d.fs * 2.8, base = d.h - d.fs * 3, topo = d.fs * 1.2; const y = escala([0, 0.25], [base, topo]); const gw = (d.w - x0) / grupos.length; const bw = Math.min(gw * 0.3, d.fs * 5.5);
            return (
              <g>
                {[0, 0.05, 0.1, 0.15, 0.2, 0.25].map((v) => <g key={v}><line className="q7-grade" x1={x0} x2={d.w} y1={y(v)} y2={y(v)} /><text className="q7-tick" x={x0 - d.fs * 0.4} y={y(v)} dy=".34em" textAnchor="end">{pct(v, 0)}</text></g>)}
                <line x1={x0 + gw} x2={x0 + gw} y1={topo} y2={base + d.fs * 2.6} stroke="#C9CDD5" strokeWidth={1.5} strokeDasharray="4 4" />
                {grupos.map((gr, i) => { const cx = x0 + gw * i + gw / 2; return (
                  <g key={gr.nome}>
                    {gr.oculto ? <>
                      <rect x={cx - bw - 4} y={y(0.12)} width={bw * 2 + 8} height={base - y(0.12)} fill="none" stroke="#9AA1AD" strokeWidth={2} strokeDasharray="6 5" rx={4} />
                      <text className="q7-rot" x={cx} y={y(0.06)} textAnchor="middle" style={{ fill: "#5B6475", fontSize: "1.6em" }}>?</text>
                    </> : <>
                      <rect x={cx - bw - 4} y={y(gr.prev)} width={bw} height={base - y(gr.prev)} fill="#176C73" /><text className="q7-rot" x={cx - bw / 2 - 4} y={y(gr.prev) - 8} textAnchor="middle" style={{ fill: "#176C73" }}>{pct(gr.prev, 1)}</text>
                      <rect x={cx + 4} y={y(gr.obs)} width={bw} height={base - y(gr.obs)} fill="#8C2332" fillOpacity={0.82} />
                      <line x1={cx + 4 + bw / 2} x2={cx + 4 + bw / 2} y1={y(Math.min(0.25, gr.ic.hi))} y2={y(gr.ic.lo)} stroke="#2A3342" strokeWidth={2.5} />
                      {[gr.ic.lo, Math.min(0.25, gr.ic.hi)].map((v, j) => <line key={j} x1={cx + 4 + bw / 2 - d.fs * 0.4} x2={cx + 4 + bw / 2 + d.fs * 0.4} y1={y(v)} y2={y(v)} stroke="#2A3342" strokeWidth={2.5} />)}
                      <circle cx={cx + 4 + bw / 2} cy={y(gr.obs)} r={d.fs * 0.36} fill="#8C2332" stroke="#fff" strokeWidth={2} />
                      <text className="q7-rot" x={cx + 4 + bw + d.fs * 0.3} y={y(gr.obs)} dy=".35em" style={{ fill: "#8C2332", paintOrder: "stroke", stroke: "#fff", strokeWidth: "0.3em", strokeLinejoin: "round" }}>{pct(gr.obs, 1)}</text>
                    </>}
                    <text className="q7-eixo-t" x={cx} y={base} dy="1.3em" textAnchor="middle">{gr.nome}</text>
                    <text className="q7-tick" x={cx} y={base} dy="2.6em" textAnchor="middle">{gr.oculto ? `${int(gr.n)} propostas` : `${gr.d} defaults em ${int(gr.n)}`}</text>
                  </g>
                ); })}
                <line className="q7-eixo" x1={x0} x2={d.w} y1={base} y2={base} />
              </g>
            );
          }}
        </Grafico>
        <ul className="q7-leg"><li><span className="q7-mk q7-mk--quad q7-mk--prob" />PD média prevista</li><li><span className="q7-mk q7-mk--circ q7-mk--def2" /><span>default observado; o traço é o intervalo de 95% (Wilson), a faixa de taxas compatíveis com o que se observou (<LinkSlide slug="c7p31" className="q7-s10-lk">slide 21</LinkSlide>)</span></li></ul>
      </Painel>
      <Painel>
        <div className="q7-s21-l"><Seg rotulo="Modelo" opcoes={[{ v: "comprimido" as Mod, r: "Comprimido" }, { v: "logistica" as Mod, r: "Logística" }]} valor={mod} onChange={setMod} /><Botao sec onClick={() => { setMod("comprimido"); setB(B0); setEsc(null); }}>Restaurar</Botao></div>
        {comp && <Controle rotulo="Compressão b (a mantém O/E = 1)" valor={b} min={0.3} max={1} passo={0.05} onChange={setB} mostrar={num(b, 2)} escala={["0,3: comprime", "1: sem compressão"]} />}
        <Previsao pergunta={`O total bate (O/E ${num(calibracaoGlobal(Y, transformar(PL, aParaTotal(B0), B0)).razaoOE!, 2)}). Nas duas metades da fila, o comprimido:`} opcoes={ops} escolha={esc} onEscolha={(i) => { setEsc(i); if (i !== null && OPS[i].certa) { setMod("comprimido"); setB(B0); } }} recolher />
        {revelado && <table className="q7-tab">
          <thead><tr><th className="q7-t-l">Grupo</th><th>Esperados</th><th>Observados</th><th>O/E</th></tr></thead>
          <tbody>{grupos.slice(1).map((gr) => <tr key={gr.nome}><th>{gr.nome}</th><td>{num(gr.esp, 1)}</td><td>{gr.d}</td><td>{num(gr.d / gr.esp, 2)}</td></tr>)}</tbody>
        </table>}
      </Painel>
    </Quadro>
  );
}
