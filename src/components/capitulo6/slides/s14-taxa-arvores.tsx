"use client";
import { useState } from "react";
import { Botao, caminho, Eixos, escala, Grafico, Kpi, LinkSlide, Painel, Previsao, Quadro, Seg, margens, type Pagina } from "@/components/capitulo7/base";
import { CFG_CARTEIRA, NV, XV, YV, modelo } from "@/lib/capitulo6/dados";
import { estagios, perdaLog } from "@/lib/capitulo6/gbm";
import { int, num } from "@/lib/capitulo7/formato";

/**
 * 14 · c6p14 · Metade da taxa pede o dobro de árvores: perda de validação por árvore para η e η/2, com as demais
 * opções da referência (CFG_CARTEIRA: profundidade 2, mínimo 40). Dois pares: 0,1 e 0,05; 0,05 e 0,025. O eixo troca
 * de "número de árvores" para "η × número de árvores" (o passo total), e as duas curvas se alinham. Ajustes de gbm.ts,
 * com árvores suficientes para que a taxa menor cubra o mesmo passo total (10 em η × M). A previsão (onde fica o
 * mínimo com η/2) esconde a segunda curva e trava o eixo alinhado até a resposta certa.
 */
const PASSO = 10;
const PARES = [[0.1, 0.05], [0.05, 0.025]] as const;
const cache = new Map<number, number[]>();
/** Perda de validação por estágio para a taxa η, até PASSO ÷ η árvores. */
function curva(eta: number) {
  let c = cache.get(eta);
  if (!c) { const n = Math.round(PASSO / eta); const mod = modelo({ ...CFG_CARTEIRA, eta, arvores: Math.max(n, CFG_CARTEIRA.arvores) }); c = estagios(mod, XV).slice(0, n + 1).map((F) => perdaLog(F, YV)); cache.set(eta, c); }
  return c;
}
const argmin = (v: number[]) => v.indexOf(Math.min(...v));
/** Taxa sem zeros à direita: 0,1; 0,05; 0,025. */
const fe = (eta: number) => num(eta, 3).replace(/0+$/, "").replace(/,$/, "");

function Grafico2({ par, alinhado, revelado }: { par: readonly [number, number]; alinhado: boolean; revelado: boolean }) {
  const [e1, e2] = par; const c1 = curva(e1), c2 = curva(e2); const i1 = argmin(c1), i2 = argmin(c2);
  const n1 = Math.round(PASSO / e1);
  return (
    <Grafico titulo="Perda de validação" sub={alinhado ? "● η maior · △ metade da taxa · eixo: η × árvores, o passo total" : revelado ? "● η maior · △ metade da taxa · eixo: árvores" : "eixo: número de árvores"} rotulo={`Perda de validação para η ${fe(e1)}${revelado ? ` e η ${fe(e2)}` : ""}; mínimos em ${i1}${revelado ? ` e ${i2}` : ""} árvores${alinhado ? ", no eixo η vezes árvores" : ""}`} arCelular="4 / 3">
      {(d) => {
        const g = margens(d.fs, { l: 3.6, r: 1.2, t: 1.2, b: 2.8 });
        const xmax = alinhado ? PASSO : n1;
        const pos = (eta: number, k: number) => (alinhado ? eta * k : k);
        const x = escala([0, xmax], [g.l, d.w - g.r]);
        const vis = [...c1.slice(0, n1 + 1), ...(revelado ? c2.filter((_, k) => pos(e2, k) <= xmax + 1e-9) : [])];
        const lo = Math.floor((Math.min(...vis) - 0.008) * 200) / 200, hi = Math.ceil(Math.max(...vis) * 200) / 200;
        const yt: number[] = []; for (let v = lo; v <= hi + 1e-9; v += 0.005) yt.push(Math.round(v * 1000) / 1000);
        const y = escala([lo, hi], [d.h - g.b, g.t]);
        const pts = (c: number[], eta: number) => c.map((v, k) => ({ x: x(pos(eta, k)), y: y(v), k })).filter((p) => pos(eta, p.k) <= xmax + 1e-9);
        const xt = Array.from({ length: 6 }, (_, k) => (xmax * k) / 5);
        const r = d.fs * 0.4;
        const tri = (cx: number, cy: number, rr: number) => `M${cx} ${cy - rr}L${cx + rr * 0.95} ${cy + rr * 0.7}L${cx - rr * 0.95} ${cy + rr * 0.7}Z`;
        const rot = (eta: number, i: number, c: number[], linha: number) => {
          const cx = x(pos(eta, i)), cy = y(c[i]);
          return <text className="q7-rot" x={Math.max(g.l + d.fs * 5, cx)} y={cy + d.fs * (1.6 + 1.25 * linha)} textAnchor="middle" style={{ fill: "#2E6B4F", paintOrder: "stroke", stroke: "#fff", strokeWidth: "0.3em" }}>{`η ${fe(eta)}: mínimo em ${i}`}</text>;
        };
        return (
          <g>
            <Eixos x={x} y={y} xt={xt} yt={yt} fx={(v) => (alinhado ? num(v, 0) : int(v))} fy={(v) => num(v, 3)} xTit={alinhado ? "η × número de árvores (passo total)" : "número de árvores somadas"} />
            <path className="q7-linha q7-linha--val" d={caminho(pts(c1, e1))} />
            <circle cx={x(pos(e1, i1))} cy={y(c1[i1])} r={r} fill="#2E6B4F" stroke="#fff" strokeWidth={2} />
            {rot(e1, i1, c1, 0)}
            {revelado && <>
              <path className="q7-linha q7-linha--val" strokeDasharray="10 7" strokeOpacity={0.85} d={caminho(pts(c2, e2))} />
              <path d={tri(x(pos(e2, i2)), y(c2[i2]), r * 1.3)} fill="#fff" stroke="#2E6B4F" strokeWidth={2.5} />
              {rot(e2, i2, c2, 1)}
            </>}
          </g>
        );
      }}
    </Grafico>
  );
}

export function S14TaxaArvores({ pagina }: { pagina?: Pagina }) {
  const [p, setP] = useState(0);
  const [alinhado, setAlinhado] = useState(false);
  const [esc, setEsc] = useState<number | null>(null);
  const par = PARES[p]; const [e1, e2] = par;
  const c1 = curva(e1), c2 = curva(e2); const i1 = argmin(c1), i2 = argmin(c2);
  // maior distância entre as curvas no mesmo passo total (M árvores com η contra 2M com η/2)
  const n1 = Math.round(PASSO / e1); let dmax = 0; for (let k = 0; k <= n1 && 2 * k < c2.length; k++) dmax = Math.max(dmax, Math.abs(c1[k] - c2[2 * k]));
  const P0 = PARES[0]; const a1 = argmin(curva(P0[0])), a2 = argmin(curva(P0[1]));
  const f = fe;
  const ops = [
    { texto: `Também perto de ${a1}: a taxa não muda quantas árvores`, certa: false, retorno: <>Cada árvore com η {f(P0[1])} anda metade do passo; para chegar ao mesmo ponto são precisas mais. O mínimo fica em {a2}.</> },
    { texto: `Perto de ${2 * a1}: o dobro`, certa: true, retorno: <>Isso: {a2} árvores, {num(a2 / a1, 1)} vezes {a1}. Metade do passo, o dobro de passos.</> },
    { texto: `Perto de ${Math.round(a1 / 2)}: taxa menor chega antes`, certa: false, retorno: <>É o contrário: taxa menor anda menos por árvore e chega depois. O mínimo fica em {a2} árvores.</> },
  ];
  const revelado = esc !== null && ops[esc].certa;
  return (
    <Quadro slug="c6p14" pagina={pagina} layout="gl"
      titulo={revelado ? undefined : "Com metade da taxa, onde fica o mínimo da validação?"}
      sub={revelado ? undefined : `Com η ${f(P0[0])}, a perda de validação é mínima em ${a1} árvores. E com η ${f(P0[1])}?`}
      conclusao={revelado
        ? <>η {f(e1)}: mínimo em {i1} árvores ({num(c1[i1], 4)}); η {f(e2)}: em <b>{i2}</b> ({num(c2[i2], 4)}), {num(i2 / i1, 1)} vezes mais árvores. No eixo η × árvores as curvas quase coincidem (maior distância {num(dmax, 4)}): conta o passo total. Fixe a taxa e ache as árvores na validação, como no <LinkSlide slug="c6p15">slide 15</LinkSlide>.</>
        : <>Com η {f(P0[0])} e os demais controles da referência do <LinkSlide slug="c6p13">slide 13</LinkSlide>, a perda de validação desce até {num(curva(P0[0])[a1], 4)} em {a1} árvores e depois sobe.</>}
      fonte={`Validação: ${int(NV)} propostas, ${YV.reduce((s, v) => s + v, 0)} defaults. Profundidade ${CFG_CARTEIRA.profundidade}, mínimo ${CFG_CARTEIRA.minFolha}; cada taxa até ${PASSO} ÷ η árvores (gbm.ts). Distância: M árvores com η contra 2M com η ÷ 2.`}>
      <Painel>
        <Grafico2 par={par} alinhado={alinhado && revelado} revelado={revelado} />
        <div className="q6-s14-ctl">
          <div><p className="q7-k">Par de taxas</p><Seg rotulo="Par de taxas" opcoes={PARES.map((q, k) => ({ v: k, r: `${f(q[0])} e ${f(q[1])}` }))} valor={p} onChange={setP} cor desab={!revelado} /></div>
          <div><p className="q7-k">Eixo horizontal</p><Seg rotulo="Eixo horizontal" opcoes={[{ v: 0, r: "árvores" }, { v: 1, r: "η × árvores" }]} valor={alinhado && revelado ? 1 : 0} onChange={(v) => setAlinhado(v === 1)} cor desab={!revelado} /></div>
        </div>
      </Painel>
      <Painel>
        <div className="q7-kpis q7-kpis--2">
          <Kpi rotulo={`Mínimo com η ${f(e1)}`} valor={`${i1} árvores`} detalhe={`perda ${num(c1[i1], 4)}`} tom="val" tam="mini" />
          <Kpi rotulo={`Mínimo com η ${f(e2)}`} valor={revelado ? `${i2} árvores` : "·"} detalhe={revelado ? `perda ${num(c2[i2], 4)}` : "depois da previsão"} tom="val" tam="mini" />
        </div>
        <Previsao pergunta={`Com η ${f(P0[1])}, metade da taxa, onde fica o mínimo da perda de validação?`} opcoes={ops} escolha={esc} onEscolha={setEsc} recolher />
        {revelado ? (
          <dl className="q7-lista">
            <div data-tom="val"><dt>Passo total no mínimo, η {f(e1)} × {i1}</dt><dd>{num(e1 * i1, 2)}</dd></div>
            <div data-tom="val"><dt>Passo total no mínimo, η {f(e2)} × {i2}</dt><dd>{num(e2 * i2, 2)}</dd></div>
          </dl>
        ) : <p className="q7-nota">Par e eixo abrem com a resposta certa.</p>}
        <div className="q7-botoes q6-fim"><Botao sec onClick={() => { setP(0); setAlinhado(false); setEsc(null); }}>Restaurar</Botao></div>
      </Painel>
    </Quadro>
  );
}
