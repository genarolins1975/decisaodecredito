"use client";
import { useState } from "react";
import { Botao, caminho, Controle, Eixos, escala, Grafico, Kpi, LinkSlide, Painel, Previsao, Quadro, margens, type Escala, type Pagina } from "@/components/capitulo7/base";
import { CFG_CARTEIRA, NA, NV, XA, XV, YA, YV, modelo } from "@/lib/capitulo6/dados";
import { auc, estagios, perdaLog } from "@/lib/capitulo6/gbm";
import { int, num } from "@/lib/capitulo7/formato";

/**
 * 11 · c6p11 · O mesmo algoritmo dos slides 3 a 10 nas 1.472 propostas de ajuste (utilização, atraso, score), com a
 * configuração de referência CFG_CARTEIRA (η = 0,1, profundidade 2, mínimo 40 por folha, 300 árvores). Perda (log loss)
 * e AUC por número de árvores, no ajuste e nas 631 propostas de validação. A validação é sorteada do mesmo período, não
 * uma safra posterior: a base não traz a safra por proposta; a janela fora do tempo fica fechada até o capítulo 7. A
 * previsão pede o comportamento da validação antes de desenhá-la. O ponto de parada fica para o slide 15.
 */
type Curvas = { pa: number[]; pv: number[]; aa: number[]; av: number[] };
let CACHE: Curvas | null = null;
/** Curvas por estágio, calculadas uma vez e só quando o slide abre (o registro importa todos os quadros). */
function curvas(): Curvas {
  if (CACHE) return CACHE;
  const mod = modelo(CFG_CARTEIRA); const ea = estagios(mod, XA), ev = estagios(mod, XV);
  CACHE = { pa: ea.map((F) => perdaLog(F, YA)), pv: ev.map((F) => perdaLog(F, YV)), aa: ea.map((F) => auc(YA, F)), av: ev.map((F) => auc(YV, F)) };
  return CACHE;
}
const MAXA = CFG_CARTEIRA.arvores;
const DA = YA.reduce((s, v) => s + v, 0), DV = YV.reduce((s, v) => s + v, 0);

/** Eixo de árvores em escala log(1 + k): as primeiras árvores, onde a validação desce e vira, ganham espaço. */
function escalaLog(r: [number, number]): Escala {
  const L = Math.log1p(MAXA);
  const f = ((k: number) => r[0] + (Math.log1p(k) / L) * (r[1] - r[0])) as Escala;
  f.d = [0, MAXA]; f.r = r; f.inv = (px: number) => Math.expm1(((px - r[0]) / (r[1] - r[0])) * L);
  return f;
}
const XT = [0, 1, 3, 10, 30, 100, 300];

function Painel2({ c, m, revelado, kmin, passa }: { c: Curvas; m: number; revelado: boolean; kmin: number; passa: number }) {
  const xs = Array.from({ length: MAXA + 1 }, (_, k) => k);
  const graf = (tipo: "perda" | "auc") => {
    const sa = tipo === "perda" ? c.pa : c.aa, sv = tipo === "perda" ? c.pv : c.av;
    const todos = [...sa, ...sv];
    const lo = tipo === "perda" ? Math.floor(Math.min(...todos) * 50) / 50 : 0.5, hi0 = tipo === "perda" ? Math.ceil(Math.max(...todos) * 50) / 50 : Math.ceil(Math.max(...todos) * 10) / 10;
    const passo = tipo === "perda" ? 0.04 : 0.2; const yt: number[] = []; for (let v = lo; v <= hi0 + 1e-9; v += passo) yt.push(Math.round(v * 1000) / 1000);
    return (
      <Grafico titulo={tipo === "perda" ? "Perda (log loss): menor é melhor" : "AUC: maior é melhor"} rotulo={`${tipo === "perda" ? "Log loss" : "AUC"} por número de árvores, em escala log, no ajuste${revelado ? " e na validação sorteada" : ""}; com ${m} árvores, ajuste ${num(sa[m], 3)}${revelado ? ` e validação ${num(sv[m], 3)}` : ""}${revelado && tipo === "perda" ? `; mínimo da validação ${num(c.pv[kmin], 3)} com ${kmin} árvores; passa do palpite ${num(c.pv[0], 3)} na árvore ${passa}` : ""}`} arCelular={tipo === "perda" ? "4 / 3" : "16 / 9"}>
        {(d) => {
          const g = margens(d.fs, { l: 3.2, r: 6.4, t: 0.8, b: tipo === "auc" ? 2.7 : 1.5 });
          // folga acima das curvas para as anotações do mínimo e do cruzamento (maior no celular, onde o gráfico é estreito)
          const hi = tipo === "perda" ? hi0 + (d.w < d.fs * 30 ? 0.07 : 0.035) : hi0;
          const x = escalaLog([g.l, d.w - g.r]), y = escala([lo, hi], [d.h - g.b, g.t]);
          const pts = (s: number[]) => xs.map((k) => ({ x: x(k), y: y(s[k]) }));
          const tri = (cx: number, cy: number, r: number) => `M${cx} ${cy - r}L${cx + r * 0.95} ${cy + r * 0.7}L${cx - r * 0.95} ${cy + r * 0.7}Z`;
          const r = d.fs * 0.34;
          const fy = (v: number) => num(v, 2);
          const halo = { paintOrder: "stroke", stroke: "#fff", strokeWidth: "0.3em", strokeLinejoin: "round" } as const;
          // rótulos na ponta direita, afastados se encostarem
          let ya = y(sa[MAXA]), yv = y(sv[MAXA]); if (revelado && Math.abs(ya - yv) < d.fs * 1.1) { const mid = (ya + yv) / 2, s = ya < yv ? -1 : 1; ya = mid + s * d.fs * 0.55; yv = mid - s * d.fs * 0.55; }
          const topo = g.t + d.fs * 0.9; // faixa das anotações, acima da linha do palpite
          return (
            <g>
              <Eixos x={x} y={y} xt={XT} yt={yt} fx={(v) => (tipo === "auc" ? int(v) : "")} fy={fy} xTit={tipo === "auc" ? "número de árvores somadas (escala log)" : undefined} />
              {tipo === "perda" && revelado && <g>
                <line x1={x(0)} x2={x(MAXA)} y1={y(c.pv[0])} y2={y(c.pv[0])} stroke="#2E6B4F" strokeWidth={1.6} strokeDasharray="2 4" />
                <text className="q7-rot--peq" x={x(0) + d.fs * 0.5} y={y(c.pv[0])} dy="-.45em" style={{ fill: "#2E6B4F", fontWeight: 700, ...halo }}>palpite na validação {num(c.pv[0], 3)}</text>
                <line x1={x(kmin)} x2={x(kmin)} y1={y(c.pv[kmin]) - r * 1.6} y2={topo + d.fs * 0.3} stroke="#2E6B4F" strokeWidth={1.2} strokeDasharray="2 3" />
                <circle cx={x(kmin)} cy={y(c.pv[kmin])} r={r * 1.7} fill="none" stroke="#2E6B4F" strokeWidth={2} />
                <text className="q7-rot--peq" x={x(kmin)} y={topo} textAnchor="middle" style={{ fill: "#2E6B4F", fontWeight: 700, ...halo }}>mínimo {num(c.pv[kmin], 3)} em {kmin}</text>
                {(() => {
                  // a anotação do cruzamento desce uma linha se encostar na do mínimo
                  const larg = (t: string) => t.length * d.fs * 0.47;
                  const tm = `mínimo ${num(c.pv[kmin], 3)} em ${kmin}`, tp = `passa do palpite em ${passa}`;
                  const yp = x(passa) + r * 1.7 - larg(tp) < x(kmin) + larg(tm) / 2 + d.fs * 0.6 ? topo + d.fs * 1.15 : topo;
                  return <>
                    <line x1={x(passa)} x2={x(passa)} y1={y(c.pv[passa]) - r * 1.6} y2={yp + d.fs * 0.3} stroke="#2E6B4F" strokeWidth={1.2} strokeDasharray="2 3" />
                    <circle cx={x(passa)} cy={y(c.pv[passa])} r={r * 1.7} fill="none" stroke="#2E6B4F" strokeWidth={2} />
                    <text className="q7-rot--peq" x={x(passa) + r * 1.7} y={yp} textAnchor="end" style={{ fill: "#2E6B4F", fontWeight: 700, ...halo }}>{tp}</text>
                  </>;
                })()}
              </g>}
              {tipo === "perda" && !revelado && <text className="q7-rot--peq" x={x(0) + d.fs * 0.4} y={y(sa[0]) - d.fs * 0.5} style={{ fill: "#5B6475" }}>palpite inicial F₀</text>}
              <line x1={x(m)} x2={x(m)} y1={g.t} y2={d.h - g.b} stroke="#5B6475" strokeWidth={1.8} strokeDasharray="3 4" />
              <path className="q7-linha q7-linha--ink" d={caminho(pts(sa))} />
              {revelado && <path className="q7-linha q7-linha--val" strokeDasharray="9 6" d={caminho(pts(sv))} />}
              <circle cx={x(m)} cy={y(sa[m])} r={r} fill="#00205B" stroke="#fff" strokeWidth={2} />
              {revelado && <path d={tri(x(m), y(sv[m]), r * 1.2)} fill="#2E6B4F" stroke="#fff" strokeWidth={1.5} />}
              <text className="q7-rot" x={d.w - g.r + d.fs * 0.4} y={ya + d.fs * 0.34} style={{ fill: "#00205B" }}>● ajuste</text>
              {revelado && <text className="q7-rot" x={d.w - g.r + d.fs * 0.4} y={yv + d.fs * 0.34} style={{ fill: "#2E6B4F" }}>▲ validação</text>}
            </g>
          );
        }}
      </Grafico>
    );
  };
  return <div className="q6-s11-g">{graf("perda")}{graf("auc")}</div>;
}

export function S11Carteira({ pagina }: { pagina?: Pagina }) {
  const [c] = useState(curvas);
  const [m, setM] = useState(MAXA);
  const [esc, setEsc] = useState<number | null>(null);
  const quedas = c.pa.slice(1).filter((v, k) => v < c.pa[k]).length;
  const passa = c.pv.findIndex((v, k) => k > 0 && v > c.pv[0] && c.pv.slice(k).every((w) => w > c.pv[0]));
  const vmin = Math.min(...c.pv), kmin = c.pv.indexOf(vmin);
  const ops = [
    { texto: "Acompanha o ajuste: cai a cada árvore", certa: false, retorno: <>Confunde ajuste com generalização: o ajuste mede o que o modelo já viu. Na validação, a perda termina em {num(c.pv[MAXA], 3)}, acima do palpite ({num(c.pv[0], 3)}).</> },
    { texto: "Melhora mais devagar, mas sempre melhora", certa: false, retorno: <>Melhora só nas primeiras árvores (até {num(vmin, 3)}); depois sobe e, com {MAXA}, fica em {num(c.pv[MAXA], 3)}, pior que o palpite ({num(c.pv[0], 3)}).</> },
    { texto: "Melhora no começo, depois piora até passar do palpite inicial", certa: true, retorno: <>Isso: desce até {num(vmin, 3)} com {kmin} árvores e passa do palpite ({num(c.pv[0], 3)}) na {passa}. Com {MAXA}, a AUC de validação ainda é {num(c.av[MAXA], 3)}, acima do acaso: ordena, mas as PDs pioraram.</> },
  ];
  const revelado = esc !== null && ops[esc].certa;
  const kv = (v: number, cc: number) => (revelado ? num(v, cc) : "·");
  return (
    <Quadro slug="c6p11" pagina={pagina} layout="gl"
      conclusao={revelado
        ? <>Com {m} árvores: perda de ajuste {num(c.pa[m], 3)}, de validação <b>{num(c.pv[m], 3)}</b>. Com taxa {num(CFG_CARTEIRA.eta, 1)} e sem subamostra, <b>o ajuste melhora em {quedas} de {MAXA} árvores; a validação passa do palpite na {passa}</b>. Onde parar: <LinkSlide slug="c6p15">slide 15</LinkSlide>.</>
        : <>O algoritmo do <LinkSlide slug="c6p10">slide 10</LinkSlide>, {MAXA} vezes: a perda de ajuste cai em {quedas} de {MAXA} árvores, de {num(c.pa[0], 3)} a <b>{num(c.pa[MAXA], 3)}</b>; a AUC de ajuste vai de {num(c.aa[0], 2)} a {num(c.aa[MAXA], 3)}. E na validação?</>}
      fonte={`Ajuste: ${int(NA)} propostas, ${DA} defaults; validação sorteada: ${int(NV)} propostas, ${DV} defaults. η = ${num(CFG_CARTEIRA.eta, 1)}, profundidade ${CFG_CARTEIRA.profundidade}, mínimo ${CFG_CARTEIRA.minFolha} por folha, até ${MAXA} árvores (gbm.ts, conferida contra o scikit-learn); log loss média.`}>
      <Painel>
        <Painel2 c={c} m={m} revelado={revelado} kmin={kmin} passa={passa} />
        <div className="q6-s11-rod">
          <Controle rotulo="Árvores somadas" valor={m} min={0} max={MAXA} passo={1} onChange={setM} mostrar={int(m)} />
          <p className="q6-nota-val"><b>Validação sorteada, não temporal:</b> a base não traz a safra de cada proposta.</p>
        </div>
      </Painel>
      <Painel>
        <div className="q7-kpis q7-kpis--2">
          <Kpi rotulo="Perda de ajuste" valor={num(c.pa[m], 3)} tam="mini" />
          <Kpi rotulo="Perda de validação" valor={kv(c.pv[m], 3)} tam="mini" tom="val" />
          <Kpi rotulo="AUC de ajuste" valor={num(c.aa[m], 3)} tam="mini" />
          <Kpi rotulo="AUC de validação" valor={kv(c.av[m], 3)} tam="mini" tom="val" />
        </div>
        <Previsao pergunta={`Com ${MAXA} árvores, e a perda nas ${int(NV)} da validação sorteada?`} opcoes={ops} escolha={esc} onEscolha={setEsc} recolher />
        <div className="q7-botoes q6-fim"><Botao sec onClick={() => { setM(MAXA); setEsc(null); }}>Restaurar</Botao></div>
      </Painel>
    </Quadro>
  );
}
