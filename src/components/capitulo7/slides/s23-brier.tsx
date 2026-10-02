"use client";
import { useMemo, useState } from "react";
import { Botao, caminho, Controle, Eixos, escala, Expandir, Formula, Grafico, Painel, Previsao, Quadro, Seg, margens, type Pagina } from "../base";
import { D, N, PL, PREVALENCIA, PT, Y } from "@/lib/capitulo7/dados";
import { Z95, brier, corp, media, perdaBrier1, transformar } from "@/lib/capitulo7/metricas";
import { num, pct } from "@/lib/capitulo7/formato";

/**
 * 23 · c7p33 · Brier. Abre com a pergunta "0,091 é bom?": só a logística aparece, e as referências ficam ocultas até a
 * resposta certa. As referências são constantes: a honesta usa a prevalência do treino (9,56%), conhecida no momento
 * da previsão; a outra usa a taxa da própria janela, que só se conhece depois. Depois da previsão, o nível da logística
 * (a em log odds) vira controle e a diferença para a constante honesta ganha intervalo pareado de 95%: média das
 * diferenças por proposta ± z · desvio padrão ÷ √n, nas mesmas 737 propostas. A leitura não trata o Brier como
 * calibração: pela decomposição CORP da biblioteca (MCB − DSC + UNC), ele soma o erro de calibração e a falta de
 * separação, e a razão DSC ÷ MCB responde ao nível. A carteira é a peça principal; o cliente (a perda (p − y)²
 * conforme a PD dada a ele) é uma inserção no painel lateral, abaixo da previsão.
 */
type Yv = 0 | 1;
const REF_TREINO_P = PL.map(() => PREVALENCIA.treino);
const BS0 = brier(Y, PL);
const REF_TREINO = brier(Y, REF_TREINO_P);
const REF_JANELA = brier(Y, PL.map(() => D / N));
const BS_PT = brier(Y, PT);
/** Diferença de Brier pareada por proposta, com intervalo normal de 95%. */
const pareada = (p: readonly number[], q: readonly number[]) => {
  const d = Y.map((y, i) => (p[i] - y) ** 2 - (q[i] - y) ** 2); const m = media(d)!;
  const ep = Math.sqrt(d.reduce((s, x) => s + (x - m) ** 2, 0) / (d.length - 1) / d.length);
  return { dif: m, lo: m - Z95 * ep, hi: m + Z95 * ep };
};
const OPS = [
  { texto: "Sim: está perto de zero, o mínimo", certa: false, retorno: <>Perto de zero não diz nada sozinho: com evento raro, até uma PD constante, que não separa ninguém, tem Brier pequeno. Confunde a escala absoluta com qualidade.</> },
  { texto: "Depende de uma referência na mesma amostra", certa: true, retorno: <>Isso: contra a constante honesta do treino ({num(REF_TREINO, 5)}), a logística é {pct(1 - BS0 / REF_TREINO, 1)} melhor.</> },
  { texto: "Não: acima de 0,05 já é ruim", certa: false, retorno: <>Não existe limiar universal: o Brier de uma constante é π(1 − π) e muda com a prevalência da carteira. Confunde o Brier com uma nota absoluta.</> },
];

export function S23Brier({ pagina }: { pagina?: Pagina }) {
  const [y, setY] = useState<Yv>(0);
  const [p, setP] = useState(0.1);
  const [esc, setEsc] = useState<number | null>(null);
  const [nivel, setNivel] = useState(0);
  const revelado = esc !== null && OPS[esc].certa;
  const perda = perdaBrier1(p, y);
  const PA = useMemo(() => (nivel === 0 ? PL : transformar(PL, nivel, 1)), [nivel]);
  const BS = brier(Y, PA);
  const dif = useMemo(() => pareada(PA, REF_TREINO_P), [PA]);
  const dec = useMemo(() => corp(Y, PA), [PA]);
  const sn = (v: number) => `${v > 0 ? "+" : v < 0 ? "−" : ""}${num(Math.abs(v), 2)}`;
  const itens = [
    { nome: nivel === 0 ? "Logística" : `Logística, nível ${sn(nivel)}`, v: BS, cor: "#176C73", nota: "a avaliada", oculto: false },
    { nome: `Constante ${pct(PREVALENCIA.treino, 2)}`, v: REF_TREINO, cor: "#9AA1AD", nota: "treino: referência honesta", oculto: !revelado },
    { nome: `Constante ${pct(D / N, 2)}`, v: REF_JANELA, cor: "#C9CDD5", nota: "taxa da janela: só depois", oculto: !revelado },
    { nome: "PD verdadeira", v: BS_PT, cor: "#00205B", nota: "só existe no gerador", oculto: !revelado },
  ];
  const restaurar = () => { setY(0); setP(0.1); setEsc(null); setNivel(0); };
  return (
    <Quadro slug="c7p33" pagina={pagina} layout="gl" sub={revelado ? undefined : "Menor é melhor. Mas quanto é pouco?"}
      conclusao={!revelado ? <>Um cliente que {y ? "deu default" : "pagou"} com PD de {pct(p, 0)} custa {num(perda, 4)}; a média dessas perdas na carteira da logística é <b>{num(BS0, 5)}</b>. Esse número é bom? Preveja antes de ver as referências.</>
        : <>{itens[0].nome}: Brier <b>{num(BS, 5)}</b>, contra {num(REF_TREINO, 5)} da constante honesta: diferença de {num(dif.dif, 4)}, intervalo pareado de 95% de {num(dif.lo, 4)} a {num(dif.hi, 4)}{dif.hi < 0 ? ", melhor que a referência" : ", que não descarta empate"}. Ele soma o erro de calibração (nível e inclinação, slide 22) e a falta de separação: aqui a separação vale {num(dec.dsc / dec.mcb, 1)} vezes o erro de calibração; o slide 25 separa as partes.</>}
      fonte={`Janela fora do tempo: ${N} propostas, ${D} defaults. Brier = média de (p − y)², com y = 1 para default; escala de 0 a 1, menor é melhor. Prevalência do treino: safras de 2022-01 a 2023-02. Intervalo pareado: normal, sobre as diferenças por proposta.`}>
      <Painel titulo="A carteira: média das perdas, contra referências" className="q7-g2-s23">
        <div className="q7-s23v3-g">
          <div className="q7-flex1">
            <Grafico rotulo={itens.map((it) => it.oculto ? `${it.nome}: oculto até a previsão` : `${it.nome}: ${num(it.v, 5)}`).join("; ")} arCelular="4 / 3">
              {(d) => {
                const x = escala([0.088, 0.1], [d.fs * 1, d.w - d.fs * 1]); const lh = (d.h - d.fs * 2.6) / itens.length; const xv = (v: number) => x(Math.max(0.088, Math.min(0.1, v)));
                return (
                  <g>
                    {[0.088, 0.091, 0.094, 0.097, 0.1].map((v) => <g key={v}><line className="q7-grade" x1={x(v)} x2={x(v)} y1={0} y2={d.h - d.fs * 2.4} /><text className="q7-tick" x={x(v)} y={d.h - d.fs * 2.4} dy="1.2em" textAnchor="middle">{num(v, 3)}</text></g>)}
                    <text className="q7-tick" x={x(0.088)} y={d.h}>Brier, menor é melhor; eixo começa em 0,088</text>
                    {itens.map((it, k) => { const cy = lh * k + lh * 0.62; return (
                      <g key={k}>
                        <text className="q7-rot" x={x(0.088)} y={cy - d.fs * 0.85}>{it.nome}<tspan className="q7-rot--peq" style={{ fill: "#5B6475" }} dx="8">{it.nota}</tspan></text>
                        <line x1={x(0.088)} x2={x(0.1)} y1={cy} y2={cy} stroke="#E7E4DC" strokeWidth={2} />
                        {it.oculto ? <text className="q7-rot" x={x(0.094)} y={cy} dy=".35em" textAnchor="middle" style={{ fill: "#5B6475" }}>?</text> : <>
                          <circle cx={xv(it.v)} cy={cy} r={d.fs * 0.5} fill={it.cor} stroke="#fff" strokeWidth={2} />
                          <text className="q7-rot" x={xv(it.v) + (it.v > 0.097 ? -d.fs * 0.8 : d.fs * 0.8)} y={cy} dy=".35em" textAnchor={it.v > 0.097 ? "end" : "start"}>{num(it.v, 5)}{it.v > 0.1 ? " (fora do eixo)" : ""}</text>
                        </>}
                      </g>
                    ); })}
                  </g>
                );
              }}
            </Grafico>
            <div className="q7-g2-linha">
              {revelado ? <Controle rotulo="Nível da logística: a, em log odds" valor={nivel} min={-1} max={1} passo={0.05} onChange={setNivel} mostrar={sn(nivel)} escala={["PDs mais baixas", "mais altas"]} /> : <span />}
              <div className="q7-s23v3-acoes">
            <Expandir resumo="Fórmula e leitura">
              <Formula f={String.raw`\mathrm{BS}=\frac{1}{n}\sum_{i=1}^{n}(p_i-y_i)^2`} simbolos={[["p_i", "PD da proposta i"], ["y_i", "1 se deu default, 0 se pagou"]]} />
              <p className="q7-nota">Uma constante igual à prevalência π tem Brier π(1 − π), que depende da carteira: com evento raro, qualquer Brier parece pequeno.</p>
            </Expandir>
                <Botao sec onClick={restaurar}>Restaurar</Botao>
              </div>
            </div>
          </div>
        </div>
      </Painel>
      <Painel className="q7-s23v3-lado">
        <Previsao pergunta={`A logística tem Brier de ${num(BS0, 3)} nesta janela. Isso é bom?`} opcoes={OPS} escolha={esc} onEscolha={setEsc} recolher />
        <div className="q7-s23v3-cli">
          <div className="q7-s21-l"><p className="q7-k">Um cliente, uma perda</p><Seg rotulo="Desfecho do cliente" opcoes={[{ v: 0 as Yv, r: "Pagou" }, { v: 1 as Yv, r: "Default" }]} valor={y} onChange={setY} /></div>
          <Grafico rotulo={`Perda quadrática para y = ${y}: ${num(perda, 4)} com PD ${pct(p, 0)}`} arCelular="16 / 9">
            {(d) => {
              const m = margens(d.fs, { l: 2.4, b: 1.6, t: 0.6, r: 0.8 }); const x = escala([0, 1], [m.l, d.w - m.r]), yy = escala([0, 1], [d.h - m.b, m.t]);
              const pts = Array.from({ length: 101 }, (_, i) => ({ x: x(i / 100), y: yy(perdaBrier1(i / 100, y)) }));
              return (
                <g>
                  <Eixos x={x} y={yy} xt={[0, 0.5, 1]} yt={[0, 1]} fx={(v) => pct(v, 0)} fy={(v) => num(v, 0)} />
                  <path className="q7-linha q7-linha--prob" d={caminho(pts)} />
                  <line x1={x(p)} x2={x(p)} y1={yy(0)} y2={yy(perda)} stroke="#00205B" strokeWidth={2.5} strokeDasharray="5 4" />
                  <circle cx={x(p)} cy={yy(perda)} r={d.fs * 0.45} fill="#00205B" stroke="#fff" strokeWidth={2.5} />
                  <text className="q7-rot" style={{ fill: "#00205B", paintOrder: "stroke", stroke: "#fff", strokeWidth: "0.28em", strokeLinejoin: "round" }} x={x(p) + (p > 0.6 ? -d.fs * 0.6 : d.fs * 0.6)} y={Math.max(d.fs, yy(perda) - d.fs * 0.5)} textAnchor={p > 0.6 ? "end" : "start"}>{num(perda, 4)}</text>
                </g>
              );
            }}
          </Grafico>
          <Controle rotulo="PD dada ao cliente" valor={p} min={0} max={1} passo={0.01} onChange={setP} mostrar={pct(p, 0)} />
        </div>
      </Painel>
    </Quadro>
  );
}
