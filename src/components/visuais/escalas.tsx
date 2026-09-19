"use client";
import { useMemo, useState } from "react";
import { fmtNum, fmtPct } from "@/lib/visuais/metricas";
import { escoreDidatico, logit, odds } from "@/lib/visuais/logistica";

/**
 * As escalas do risco (capítulo 4, páginas 4 a 6; a página 3 é a peça escala-probabilidade). Uma só PD lida em réguas:
 * odds (a razão que multiplica), log odds (onde somar faz sentido) e a régua com as quatro lado a lado, mais o
 * escore didático 600 − 90 × z. Números idênticos aos das páginas herdadas.
 */
export type ModoEscalas = "odds" | "logodds" | "regua";
const W = 640;
const LEITURAS = [0.01, 0.05, 0.1, 0.2, 0.3333333, 0.5, 0.6666667, 0.8, 0.9, 0.95];
const REGUA_PDS = [0.01, 0.02, 0.05, 0.1, 0.15, 0.2, 0.3, 0.4, 0.5, 0.6, 0.75, 0.9, 0.95];
const leitura = (q: number) => { const o = odds(q); return q < 0.5 ? `1 default para ${fmtNum(1 / o, 2)} adimplentes` : Math.abs(q - 0.5) < 1e-6 ? "1 para 1" : `${fmtNum(o, 2)} defaults para 1 adimplente`; };

export function Escalas({ modo }: { modo: ModoEscalas }) {
  const [pd, setPd] = useState(modo === "regua" ? 0.05 : 0.2);
  if (modo === "odds") return <Odds pd={pd} setPd={setPd} />;
  if (modo === "logodds") return <LogOdds pd={pd} setPd={setPd} />;
  return <Regua pd={pd} setPd={setPd} />;
}

function Slider({ rotulo, pd, setPd, min = 1, max = 95 }: { rotulo: string; pd: number; setPd: (v: number) => void; min?: number; max?: number }) {
  return (
    <label className="vz-slider"><span className="vz-slider-rotulo"><b>{rotulo}</b> <span className="vz-slider-valor">{fmtPct(pd)}</span></span>
      <input type="range" min={min} max={max} step={1} value={Math.round(pd * 100)} onChange={(e) => setPd(Number(e.target.value) / 100)} aria-valuetext={fmtPct(pd)} /></label>
  );
}

/* Página c4p4: odds contra PD. */
function Odds({ pd, setPd }: { pd: number; setPd: (v: number) => void }) {
  const o = odds(pd);
  const H = 300, ML = 44, MR = 14, MT = 22, MB = 34;
  const sx = (q: number) => ML + (q / 0.95) * (W - ML - MR), sy = (v: number) => MT + (1 - v / 20) * (H - MT - MB);
  const curva = useMemo(() => { const pts: string[] = []; for (let q = 0.01, i = 0; q <= 0.9501; q += 0.005, i++) pts.push(`${i ? "L" : "M"}${sx(q).toFixed(1)} ${sy(Math.min(20, odds(q))).toFixed(1)}`); return pts.join(""); }, []);
  const perto = LEITURAS.reduce((m, q) => (Math.abs(q - pd) < Math.abs(m - pd) ? q : m), LEITURAS[0]);
  return (
    <figure className="vz" data-vz="escala-odds">
      <header className="vz-cab">
        <div>
          <p className="eyebrow">Escala 2, odds · quantos defaults para cada adimplente · de zero a infinito</p>
          <p className="vz-tit">A mesma informação escrita como razão. Nada se perde na tradução, e as duas voltam uma para a outra.</p>
        </div>
      </header>
      <div className="vz-estado"><b>PD {fmtPct(pd, 1)}:</b> odds {fmtNum(o, 3)}, ou {leitura(pd)}. Odds resolve o teto em 1 e cria um problema novo: a assimetria.</div>
      <div className="vz-esc-grade">
        <div className="vz-esc-painel">
          <Slider rotulo="PD" pd={pd} setPd={setPd} />
          <div className="vz-tiles vz-tiles--2">
            <div className="vz-tile"><p className="eyebrow">PD</p><p className="vz-num">{fmtPct(pd, 1)}</p></div>
            <div className="vz-tile"><p className="eyebrow">Odds</p><p className="vz-num vz-num--odds">{fmtNum(o, 3)}</p><p className="hint">{fmtNum(o, 2)} default{Math.abs(o - 1) < 0.005 ? "" : "s"} para cada 1 adimplente</p></div>
          </div>
          <div className="vz-grafico">
            <p className="vz-grafico-t">Odds em função da PD <span className="hint">íngreme perto de 100%, achatada perto de 0%</span></p>
            <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Odds ${fmtNum(o, 3)} em PD ${fmtPct(pd)}`}>
              {[0, 5, 10, 15, 20].map((v) => <g key={v}><line x1={sx(0)} x2={sx(0.95)} y1={sy(v)} y2={sy(v)} className="vz-grade" /><text x={ML - 6} y={sy(v) + 4} textAnchor="end" className="vz-tick">{v}</text></g>)}
              {[0, 0.25, 0.5, 0.75, 0.95].map((v) => <text key={v} x={sx(v)} y={H - MB + 16} textAnchor="middle" className="vz-tick">{fmtPct(v)}</text>)}
              <text x={sx(0.475)} y={H - 4} textAnchor="middle" className="vz-rotulo">PD</text>
              <text x={ML + 4} y={MT - 8} className="vz-rotulo">odds</text>
              <path d={curva} className="vz-curva vz-curva--odds" />
              <line x1={sx(pd)} x2={sx(pd)} y1={sy(0)} y2={sy(Math.min(20, o))} className="vz-corte-linha" />
              <line x1={sx(0)} x2={sx(pd)} y1={sy(Math.min(20, o))} y2={sy(Math.min(20, o))} className="vz-corte-linha" />
              <g className="vz-regua-ponto" style={{ transform: `translate(${sx(pd)}px, ${sy(Math.min(20, o))}px)` }}><circle r={7} /><text x={pd > 0.7 ? -12 : 12} y={-8} textAnchor={pd > 0.7 ? "end" : "start"} className="vz-ponto-t">odds {fmtNum(o, 2)}{o > 20 ? " (fora da escala)" : ""}</text></g>
            </svg>
          </div>
        </div>
        <div className="vz-esc-lado">
          <div className="vz-formula">odds = PD ÷ (1 − PD) · PD = odds ÷ (1 + odds)</div>
          <p className="hint">As duas fórmulas são a mesma relação lida nos dois sentidos. Nenhuma informação é criada ou destruída ao trocar de escala.</p>
          <div className="table-wrap"><table className="table text-[.85em]"><thead><tr><th>PD</th><th>Odds</th><th>Leitura</th></tr></thead><tbody>
            {LEITURAS.map((q) => <tr key={q} className={q === perto ? "vz-t-on" : ""}><th scope="row">{fmtPct(q, q < 0.1 ? 1 : 0)}</th><td>{fmtNum(odds(q), 3)}</td><td className="hint">{leitura(q)}</td></tr>)}
          </tbody></table></div>
        </div>
      </div>
      <p className="vz-fonte">Odds é a razão entre a probabilidade do evento e a do não evento. A curva é íngreme perto de PD 100%: pequenas variações de probabilidade produzem variações enormes de odds. Perto de PD 0%, o contrário.</p>
    </figure>
  );
}

/* Página c4p5: dobrar e reduzir à metade, em PD e em log odds. */
function LogOdds({ pd, setPd }: { pd: number; setPd: (v: number) => void }) {
  const o = odds(pd), z = logit(pd), dobro = 2 * o, metade = o / 2, pDobro = dobro / (1 + dobro), pMetade = metade / (1 + metade);
  const H = 300, ML = 44, MR = 14, MT = 22, MB = 34;
  const sx = (q: number) => ML + q * (W - ML - MR), sy = (v: number) => MT + (1 - (v + 5) / 10) * (H - MT - MB);
  const curva = useMemo(() => { const pts: string[] = []; for (let q = 0.01, i = 0; q <= 0.9901; q += 0.004, i++) pts.push(`${i ? "L" : "M"}${sx(q).toFixed(1)} ${sy(logit(q)).toFixed(1)}`); return pts.join(""); }, []);
  const pontos = [{ n: "metade", p: pMetade, z: Math.log(metade), c: "vz-lo-ponto--metade" }, { n: "partida", p: pd, z, c: "vz-lo-ponto--partida" }, { n: "dobro", p: pDobro, z: Math.log(dobro), c: "vz-lo-ponto--dobro" }];
  return (
    <figure className="vz" data-vz="escala-logodds">
      <header className="vz-cab">
        <div>
          <p className="eyebrow">Escala 3, log odds · simétrica em torno de zero · multiplicar vira somar</p>
          <p className="vz-tit">Dobre as odds e reduza à metade. Em PD, os passos são desiguais. Em log odds, são o mesmo 0,6931.</p>
        </div>
      </header>
      <div className="vz-estado"><b>Partida em PD {fmtPct(pd, 2)}:</b> dobrar as odds leva a {fmtPct(pDobro, 2)} e reduzir à metade leva a {fmtPct(pMetade, 2)}, {fmtNum(100 * (pDobro - pd), 2)} pontos para cima e {fmtNum(100 * (pd - pMetade), 2)} para baixo. Em log odds, +{fmtNum(Math.log(2), 4)} e −{fmtNum(Math.log(2), 4)}.</div>
      <div className="vz-esc-grade">
        <div className="vz-esc-painel">
          <Slider rotulo="PD de partida" pd={pd} setPd={setPd} min={2} />
          <div className="vz-tiles vz-tiles--3">
            <div className="vz-tile"><p className="eyebrow">PD</p><p className="vz-num">{fmtPct(pd, 1)}</p></div>
            <div className="vz-tile"><p className="eyebrow">Odds</p><p className="vz-num vz-num--odds">{fmtNum(o, 3)}</p></div>
            <div className="vz-tile"><p className="eyebrow">Log odds</p><p className="vz-num">{fmtNum(z, 3)}</p></div>
          </div>
          <div className="table-wrap"><table className="table text-[.85em]"><thead><tr><th>Movimento</th><th>PD</th><th>Odds</th><th>Log odds</th><th>Variação em log odds</th></tr></thead><tbody>
            <tr><th scope="row">Dobrar as odds</th><td>{fmtPct(pDobro, 2)}</td><td>{fmtNum(dobro, 3)}</td><td>{fmtNum(Math.log(dobro), 3)}</td><td className="vz-t-default">+{fmtNum(Math.log(2), 4)}</td></tr>
            <tr className="vz-t-on"><th scope="row">Partida</th><td>{fmtPct(pd, 2)}</td><td>{fmtNum(o, 3)}</td><td>{fmtNum(z, 3)}</td><td>0</td></tr>
            <tr><th scope="row">Reduzir as odds à metade</th><td>{fmtPct(pMetade, 2)}</td><td>{fmtNum(metade, 3)}</td><td>{fmtNum(Math.log(metade), 3)}</td><td className="vz-t-ok">−{fmtNum(Math.log(2), 4)}</td></tr>
          </tbody></table></div>
          <div className="vz-formula">log odds = ln( PD ÷ (1 − PD) )</div>
          <p className="hint">ln é o logaritmo natural. A propriedade que importa é uma só: ln(a × b) = ln(a) + ln(b). Multiplicar odds vira somar log odds.</p>
        </div>
        <div className="vz-esc-lado">
          <div className="vz-grafico">
            <p className="vz-grafico-t">Log odds em função da PD <span className="hint">os três pontos: metade, partida e dobro</span></p>
            <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Log odds ${fmtNum(z, 3)} em PD ${fmtPct(pd)}; dobro ${fmtPct(pDobro, 2)}, metade ${fmtPct(pMetade, 2)}`}>
              {[-5, -2.5, 0, 2.5, 5].map((v) => <g key={v}><line x1={sx(0)} x2={sx(1)} y1={sy(v)} y2={sy(v)} className="vz-grade" /><text x={ML - 6} y={sy(v) + 4} textAnchor="end" className="vz-tick">{fmtNum(v, 1)}</text></g>)}
              {[0, 0.25, 0.5, 0.75, 1].map((v) => <text key={v} x={sx(v)} y={H - MB + 16} textAnchor="middle" className="vz-tick">{fmtPct(v)}</text>)}
              <text x={sx(0.5)} y={H - 4} textAnchor="middle" className="vz-rotulo">PD</text>
              <text x={ML + 4} y={MT - 8} className="vz-rotulo">log odds</text>
              <path d={curva} className="vz-curva" />
              {pontos.map((q) => <g key={q.n}><line x1={sx(0)} x2={sx(q.p)} y1={sy(q.z)} y2={sy(q.z)} className="vz-corte-linha" /><line x1={sx(q.p)} x2={sx(q.p)} y1={sy(q.z)} y2={sy(-5)} className="vz-corte-linha" /></g>)}
              {(() => { const dir = pd < 0.5 ? 1 : -1; const xc = dir > 0 ? sx(1) - 12 : sx(0) + 12; const anc = dir > 0 ? "end" : "start"; const dx = dir > 0 ? -8 : 8; const base = sy(-5); return <g>
                <line x1={xc} x2={xc} y1={sy(Math.log(metade))} y2={sy(Math.log(dobro))} className="vz-lo-chave" />
                <text x={xc + dx} y={sy(z + Math.log(2) / 2) + 4} textAnchor={anc} className="vz-lo-chave-t">+{fmtNum(Math.log(2), 4)} em log odds</text>
                <text x={xc + dx} y={sy(z - Math.log(2) / 2) + 4} textAnchor={anc} className="vz-lo-chave-t">−{fmtNum(Math.log(2), 4)} em log odds</text>
                <line x1={sx(pd)} x2={sx(pDobro)} y1={base - 34} y2={base - 34} className="vz-lo-chave vz-lo-chave--pd" />
                <text x={sx((pd + pDobro) / 2)} y={base - 40} textAnchor="middle" className="vz-lo-chave-t vz-lo-chave-t--pd">+{fmtNum(100 * (pDobro - pd), 2)} pontos de PD</text>
                <line x1={sx(pMetade)} x2={sx(pd)} y1={base - 16} y2={base - 16} className="vz-lo-chave vz-lo-chave--pd" />
                <text x={sx((pd + pMetade) / 2)} y={base - 21} textAnchor="middle" className="vz-lo-chave-t vz-lo-chave-t--pd">−{fmtNum(100 * (pd - pMetade), 2)} pontos</text>
              </g>; })()}
              {pontos.map((q) => <g key={q.n} className={`vz-regua-ponto ${q.c}`} style={{ transform: `translate(${sx(q.p)}px, ${sy(q.z)}px)` }}><circle r={q.n === "partida" ? 7 : 5.5} /><text x={12} y={4} className="vz-ponto-t">{q.n} {fmtNum(q.z, 3)}</text></g>)}
            </svg>
          </div>
          <div className="vz-tile"><p className="eyebrow">Por que essa é a escala do modelo</p><p className="vz-num vz-num--texto">Um efeito que multiplica as odds por um fator fixo vira, em log odds, uma soma de valor fixo. E soma de valor fixo é exatamente o que uma função linear sabe fazer. A escolha da escala não é estética: é ela que torna a linearidade defensável.</p></div>
        </div>
      </div>
      <p className="vz-fonte">O logaritmo das odds é simétrico em torno de zero, vai de menos infinito a mais infinito e transforma multiplicação em soma. Dobrar as odds soma ln 2 = 0,6931 em qualquer ponto da régua; em PD, o mesmo movimento vale {fmtNum(100 * (pDobro - pd), 2)} pontos aqui e quase nada perto das bordas.</p>
    </figure>
  );
}

/* Página c4p6: as quatro réguas lado a lado e a tabela de tradução. */
function Regua({ pd, setPd }: { pd: number; setPd: (v: number) => void }) {
  const o = odds(pd), z = logit(pd), sc = escoreDidatico(pd);
  const ML = 24, MR = 24, span = W - ML - MR;
  const xp = (q: number) => ML + q * span, xo = (v: number) => ML + ((Math.log10(v) + 2) / 4) * span, xz = (v: number) => ML + ((v + 6) / 12) * span;
  const zc = Math.max(-6, Math.min(6, z)), oc = Math.max(0.01, Math.min(100, o));
  const perto = REGUA_PDS.reduce((m, q) => (Math.abs(q - pd) < Math.abs(m - pd) ? q : m), REGUA_PDS[0]);
  const reguas = [
    { y: 44, nome: "probabilidade", x: xp(pd), rotulo: fmtPct(pd), ticks: [0, 0.25, 0.5, 0.75, 1].map((v) => ({ x: xp(v), t: fmtPct(v) })), nota: `em 100 propostas semelhantes, cerca de ${Math.round(100 * pd)} defaults` },
    { y: 112, nome: "odds", x: xo(oc), rotulo: fmtNum(o, 3), ticks: [0.01, 0.1, 1, 10, 100].map((v) => ({ x: xo(v), t: v.toLocaleString("pt-BR") })), nota: "defaults para cada adimplente, escala logarítmica" },
    { y: 180, nome: "log odds", x: xz(zc), rotulo: fmtNum(z, 3), ticks: [-6, -3, 0, 3, 6].map((v) => ({ x: xz(v), t: String(v) })), nota: "a escala em que somar faz sentido" },
    { y: 248, nome: "escore 600 − 90 × z", x: xz(zc), rotulo: String(sc), ticks: [-6, -3, 0, 3, 6].map((v) => ({ x: xz(v), t: String(600 - 90 * v) })), nota: "a mesma régua, deslocada e invertida: maior é melhor" },
  ];
  return (
    <figure className="vz" data-vz="escala-regua">
      <header className="vz-cab">
        <div>
          <p className="eyebrow">As três escalas na mesma régua · e a convenção de escore do curso</p>
          <p className="vz-tit">Nenhuma das escalas é a correta. Cada uma resolve uma etapa, e as quatro preservam a mesma ordem.</p>
        </div>
        <div className="vz-acoes" role="group" aria-label="Probabilidades de exemplo">
          {[0.05, 0.1, 0.5, 0.9].map((q) => <button key={q} type="button" className={`btn btn-sm ${Math.abs(pd - q) < 1e-6 ? "" : "btn-secondary"}`} onClick={() => setPd(q)}>PD {fmtPct(q)}</button>)}
        </div>
      </header>
      <div className="vz-estado"><b>PD {fmtPct(pd)}:</b> odds {fmtNum(o, 3)}, log odds {fmtNum(z, 3)}, escore didático {sc}. Só muda a régua usada para comunicar e calcular.</div>
      <div className="vz-esc-grade">
        <div className="vz-esc-painel">
          <Slider rotulo="PD" pd={pd} setPd={setPd} />
          <div className="vz-grafico vz-esc-reguas">
            <svg viewBox={`0 0 ${W} 276`} role="img" aria-label={`PD ${fmtPct(pd)}, odds ${fmtNum(o, 3)}, log odds ${fmtNum(z, 3)}, escore ${sc}`}>
              <polyline points={reguas.map((r) => `${r.x},${r.y}`).join(" ")} className="vz-liga" />
              {reguas.map((r) => { const anc = r.x > W - MR - 150 ? "end" : r.x < ML + 110 ? "start" : "middle"; const dx = anc === "end" ? -10 : anc === "start" ? 10 : 0;
                return <g key={r.nome}>
                  <text x={ML} y={r.y - 17} className="vz-rotulo">{r.nome}</text>
                  <text x={W - MR} y={r.y - 17} textAnchor="end" className="vz-tick vz-tick--nota">{r.nota}</text>
                  <line x1={ML} x2={W - MR} y1={r.y} y2={r.y} className="vz-regua" />
                  {r.ticks.map((t) => <g key={t.t}><line x1={t.x} x2={t.x} y1={r.y - 4} y2={r.y + 4} className="vz-regua" /><text x={t.x} y={r.y + 18} textAnchor="middle" className="vz-tick">{t.t}</text></g>)}
                  <g className="vz-regua-ponto" style={{ transform: `translate(${r.x}px, ${r.y}px)` }}><circle r={7} /><text x={dx} y={-6 + (anc === "middle" ? -3 : 0)} textAnchor={anc} className="vz-ponto-t">{r.rotulo}</text></g>
                </g>; })}
            </svg>
          </div>
          <div className="vz-tile"><p className="eyebrow">Onde cada escala é usada</p>
            <table className="table text-[.85em] vz-esc-usos"><tbody>
              <tr><th scope="row">Log odds</th><td>dentro do modelo, onde os efeitos somam. Capítulos 4 e 6</td></tr>
              <tr><th scope="row">Odds</th><td>na comunicação de efeito: esta variável multiplica as chances por tanto. Capítulo 4</td></tr>
              <tr><th scope="row">Probabilidade</th><td>na calibração e na conta econômica, onde ela multiplica exposição e perda. Capítulos 7 e 8</td></tr>
              <tr><th scope="row">Escore</th><td>na operação e na comunicação com áreas de negócio. Capítulo 8</td></tr>
            </tbody></table></div>
        </div>
        <div className="vz-esc-lado">
          <div className="table-wrap"><table className="table text-[.85em]"><thead><tr><th>PD</th><th>Odds</th><th>Log odds</th><th>Escore (600 − 90 × z)</th></tr></thead><tbody>
            {REGUA_PDS.map((q) => <tr key={q} className={q === perto ? "vz-t-on" : ""}><th scope="row">{fmtPct(q, q < 0.1 ? 1 : 0)}</th><td>{fmtNum(odds(q), 3)}</td><td>{fmtNum(logit(q), 3)}</td><td>{escoreDidatico(q)}</td></tr>)}
          </tbody></table></div>
          <p className="hint">A última coluna é a convenção de escore deste curso. Ela apenas desloca e inverte o log odds para que número maior signifique risco menor, como o mercado espera. Nenhuma informação é acrescentada.</p>
        </div>
      </div>
      <p className="vz-fonte">odds = p ÷ (1 − p); z = ln(odds); p = 1 ÷ (1 + e^(−z)); escore = 600 − 90 × z, arredondado. PD 5%: odds 0,053, log odds −2,944 e escore 865; PD 50%: odds 1, log odds 0 e escore 600. A tabela de tradução serve para levar para a mesa.</p>
    </figure>
  );
}

