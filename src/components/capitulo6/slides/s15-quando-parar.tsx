"use client";
import { useState } from "react";
import { Botao, caminho, Controle, Eixos, escala, Grafico, Kpi, LinkSlide, Painel, Previsao, Quadro, Seg, margens, type Pagina } from "@/components/capitulo7/base";
import { CFG_CARTEIRA, NA, NV, XA, XV, YA, YV, modelo } from "@/lib/capitulo6/dados";
import { auc, estagios, perdaLog } from "@/lib/capitulo6/gbm";
import { int, num } from "@/lib/capitulo7/formato";

/**
 * 15 · c6p15 · Parada pela validação, na configuração de referência do slide 11 (CFG_CARTEIRA): a perda de validação
 * desce e sobe, e o ponto mais baixo escolhe o número de árvores; a AUC de ajuste (nos números ao lado) continua
 * subindo depois dele. Tudo sai de gbm.ts (estagios, perdaLog, auc). A faixa "a menos de 0,001 do mínimo" mostra que o
 * ponto exato é ruidoso; depois da previsão, a regra de paciência (parar depois de k árvores sem melhorar e guardar a
 * melhor), calculada na mesma curva. A previsão (quantas das 300 árvores ficam) esconde a validação até a resposta.
 */
type Curvas = { pa: number[]; pv: number[]; aa: number[]; av: number[] };
let CACHE: Curvas | null = null;
function curvas(): Curvas {
  if (CACHE) return CACHE;
  const mod = modelo(CFG_CARTEIRA); const ea = estagios(mod, XA), ev = estagios(mod, XV);
  CACHE = { pa: ea.map((F) => perdaLog(F, YA)), pv: ev.map((F) => perdaLog(F, YV)), aa: ea.map((F) => auc(YA, F)), av: ev.map((F) => auc(YV, F)) };
  return CACHE;
}
const MAXA = CFG_CARTEIRA.arvores, TOL = 0.001;
const DA = YA.reduce((s, v) => s + v, 0), DV = YV.reduce((s, v) => s + v, 0);
/** Paciência k: treina enquanto a validação melhorou nas últimas k árvores; para e guarda a melhor até ali. */
function paciencia(pv: number[], k: number) { let best = 0; for (let i = 1; i < pv.length; i++) { if (pv[i] < pv[best]) best = i; if (i - best >= k) return { para: i, guarda: best }; } return { para: pv.length - 1, guarda: best }; }
const PACS = [3, 5, 10, 20];
const tri = (cx: number, cy: number, r: number, baixo = false) => baixo ? `M${cx} ${cy + r}L${cx + r * 0.95} ${cy - r * 0.7}L${cx - r * 0.95} ${cy - r * 0.7}Z` : `M${cx} ${cy - r}L${cx + r * 0.95} ${cy + r * 0.7}L${cx - r * 0.95} ${cy + r * 0.7}Z`;

function Graficos({ c, m, revelado, ate, imin, faixa }: { c: Curvas; m: number; revelado: boolean; ate: number; imin: number; faixa: [number, number] }) {
  const xs = Array.from({ length: ate + 1 }, (_, k) => k);
  const xt = ate <= 60 ? [0, 10, 20, 30, 40, 50, 60] : [0, 50, 100, 150, 200, 250, 300];
  const vis = (s: number[]) => s.slice(0, ate + 1);
  return (
    <div className="q6-s15-g">
      <Grafico titulo="Perda (log loss) por número de árvores" sub={revelado ? `▲ validação · ● ajuste · verde: a ${num(TOL, 3)} do mínimo` : "● ajuste; a validação abre depois da previsão"} rotulo={`Log loss de ajuste${revelado ? ` e de validação; mínimo da validação em ${imin} árvores, ${num(c.pv[imin], 4)}` : ""}, de 0 a ${ate} árvores`} arCelular="4 / 3">
        {(d) => {
          const g = margens(d.fs, { l: 3.4, r: 1, t: 1.2, b: 2.7 });
          const todos = [...vis(c.pa), ...(revelado ? vis(c.pv) : [])];
          const lo = Math.floor(Math.min(...todos) * 100) / 100, hi = Math.ceil(Math.max(...todos) * 100) / 100;
          const passo = hi - lo > 0.06 ? 0.02 : 0.01; const yt: number[] = []; for (let v = lo; v <= hi + 1e-9; v += passo) yt.push(Math.round(v * 1000) / 1000);
          const x = escala([0, ate], [g.l, d.w - g.r]), y = escala([lo, hi], [d.h - g.b, g.t]);
          const pts = (s: number[]) => xs.map((k) => ({ x: x(k), y: y(s[k]) })); const r = d.fs * 0.36;
          const fdent = faixa[1] <= ate;
          return (
            <g>
              {revelado && fdent && <rect x={x(faixa[0])} y={g.t} width={Math.max(2, x(faixa[1]) - x(faixa[0]))} height={d.h - g.b - g.t} fill="#2E6B4F" fillOpacity={0.1} />}
              <Eixos x={x} y={y} xt={xt} yt={yt} fx={(v) => int(v)} fy={(v) => num(v, 2)} xTit="número de árvores somadas" />
              <line x1={x(m)} x2={x(m)} y1={g.t} y2={d.h - g.b} stroke="#5B6475" strokeWidth={1.8} strokeDasharray="3 4" />
              <path className="q7-linha q7-linha--ink" d={caminho(pts(c.pa))} />
              {m <= ate && <circle cx={x(m)} cy={y(c.pa[m])} r={r} fill="#00205B" stroke="#fff" strokeWidth={2} />}
              {revelado && <>
                <path className="q7-linha q7-linha--val" strokeDasharray="9 6" d={caminho(pts(c.pv))} />
                {m <= ate && <path d={tri(x(m), y(c.pv[m]), r * 1.25)} fill="#2E6B4F" stroke="#fff" strokeWidth={1.5} />}
                <path d={tri(x(imin), y(c.pv[imin]) - r * 2.6, r * 1.25, true)} fill="#2E6B4F" />
                <text className="q7-rot" x={x(imin)} y={y(c.pv[imin]) - r * 2.6 - d.fs * 0.9} textAnchor={x(imin) - g.l < d.fs * 6 ? "start" : "middle"} style={{ fill: "#2E6B4F", paintOrder: "stroke", stroke: "#fff", strokeWidth: "0.3em" }}>{`mínimo: ${imin} árvores, ${num(c.pv[imin], 4)}`}</text>
              </>}
            </g>
          );
        }}
      </Grafico>
    </div>
  );
}

export function S15QuandoParar({ pagina }: { pagina?: Pagina }) {
  const [c] = useState(curvas);
  const [m, setM] = useState(MAXA);
  const [ate, setAte] = useState(MAXA);
  const [esc, setEsc] = useState<number | null>(null);
  const vmin = Math.min(...c.pv), imin = c.pv.indexOf(vmin);
  // faixa contínua em torno do mínimo: árvores vizinhas a menos de TOL dele (depois do fim, nenhuma volta à faixa)
  let fa = imin, fb = imin; while (fa > 1 && c.pv[fa - 1] <= vmin + TOL) fa--; while (fb < MAXA && c.pv[fb + 1] <= vmin + TOL) fb++;
  const faixa: [number, number] = [fa, fb];
  const volta = c.pv.some((v, k) => k > fb && v <= vmin + TOL);
  const teto = Math.ceil((imin + 1) / 10) * 10;
  const ops = [
    { texto: `Todas as ${MAXA}: cada uma reduziu a perda de ajuste`, certa: false, retorno: <>O ajuste não sabe parar. Com {MAXA} árvores, a perda de validação é {num(c.pv[MAXA], 4)}, contra {num(vmin, 4)} no mínimo.</> },
    { texto: "Cerca de 100: corta só o fim da curva", certa: false, retorno: <>Supõe que o dano está no fim, mas depois de {faixa[1]} árvores a validação já passa de {num(TOL, 3)} acima do mínimo; com 100, {num(c.pv[100], 4)} contra {num(vmin, 4)}.</> },
    { texto: `Menos de ${teto}`, certa: true, retorno: <>Isso: mínimo em {imin}; até a {faixa[1]}, equivale (a menos de {num(TOL, 3)}). Depois, passa da faixa{volta ? "" : " e não volta"}.</> },
  ];
  const revelado = esc !== null && ops[esc].certa;
  const escolher = (i: number | null) => { setEsc(i); if (i !== null && ops[i].certa) { setM(imin); setAte(60); } };
  const pacs = PACS.map((k) => ({ k, ...paciencia(c.pv, k) }));
  return (
    <Quadro slug="c6p15" pagina={pagina} layout="gl"
      titulo={revelado ? undefined : `Das ${MAXA} árvores, quantas a validação manda manter?`}
      sub={revelado ? undefined : "A perda de ajuste cai até a última. Preveja antes de ver a validação."}
      conclusao={revelado
        ? <>Parando em {m}: perda de validação {num(c.pv[m], 4)}{m === imin ? ", o mínimo" : ` (${num(c.pv[m] - vmin, 4)} acima do mínimo)`}; a AUC de ajuste segue até <b>{num(c.aa[MAXA], 3)}</b> em {MAXA}. <b>Só a validação diz onde parar</b>, e de {faixa[0]} a {faixa[1]} tanto faz; escolhido nesta amostra, o ponto não se mede sem viés. <LinkSlide slug="c6p17">Slide 17</LinkSlide>: contra a logística.</>
        : <>No ajuste, a perda cai de {num(c.pa[0], 3)} a {num(c.pa[MAXA], 3)} e a AUC sobe de {num(c.aa[0], 2)} a {num(c.aa[MAXA], 3)} nas {MAXA} árvores do <LinkSlide slug="c6p11">slide 11</LinkSlide>: nenhuma das duas avisa quando parar.</>}
      fonte={`Ajuste: ${int(NA)} propostas, ${DA} defaults; validação sorteada: ${int(NV)}, ${DV} defaults. η ${num(CFG_CARTEIRA.eta, 1)}, profundidade ${CFG_CARTEIRA.profundidade}, mínimo ${CFG_CARTEIRA.minFolha}, até ${MAXA} árvores (gbm.ts).`}>
      <Painel>
        <Graficos c={c} m={m} revelado={revelado} ate={ate} imin={imin} faixa={faixa} />
        <div className="q6-s15-rod">
          <Controle rotulo="Parar em M árvores" valor={m} min={1} max={MAXA} passo={1} onChange={(v) => { setM(v); if (v > ate) setAte(MAXA); }} mostrar={int(m)} />
          <Seg rotulo="Eixo das árvores" opcoes={[{ v: 60, r: "0 a 60" }, { v: MAXA, r: `0 a ${MAXA}` }]} valor={ate} onChange={(v) => { setAte(v); if (m > v) setM(Math.min(m, v)); }} cor />
          <Botao sec onClick={() => { setM(MAXA); setAte(MAXA); setEsc(null); }}>Restaurar</Botao>
        </div>
      </Painel>
      <Painel>
        <div className="q7-kpis q7-kpis--3">
          <Kpi rotulo="Perda" valor={revelado ? num(c.pv[m], 4) : "·"} detalhe="validação" tom="val" tam="mini" />
          <Kpi rotulo="AUC" valor={num(c.aa[m], 3)} detalhe="ajuste" tam="mini" />
          <Kpi rotulo="AUC" valor={revelado ? num(c.av[m], 3) : "·"} detalhe="validação" tom="val" tam="mini" />
        </div>
        <Previsao pergunta={`Quantas das ${MAXA} árvores do slide 11 ficam?`} opcoes={ops} escolha={esc} onEscolha={escolher} recolher />
        {revelado && (
          <div className="q6-s15-pac">
            <p className="q7-k">Paciência k: árvores sem melhorar</p>
            <table className="q7-tab q6-s15-tab">
              <thead><tr><th className="q7-t-l">k</th>{pacs.map((p) => <th key={p.k}>{p.k}</th>)}</tr></thead>
              <tbody>
                <tr><th>Para na árvore</th>{pacs.map((p) => <td key={p.k}>{p.para}</td>)}</tr>
                <tr data-on="1"><th>Guarda a</th>{pacs.map((p) => <td key={p.k}>{p.guarda === imin ? <b>{p.guarda}</b> : p.guarda}</td>)}</tr>
                <tr><th>{pacs.every((p) => c.pv[p.guarda] <= vmin + TOL) ? "Do mínimo: equivale" : "Acima do mínimo"}</th>{pacs.map((p) => <td key={p.k}>{p.guarda === imin ? "0" : `+${num(c.pv[p.guarda] - vmin, 4)}`}</td>)}</tr>
              </tbody>
            </table>
          </div>
        )}
      </Painel>
    </Quadro>
  );
}
