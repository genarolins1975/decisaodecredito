"use client";
import { useMemo, useState } from "react";
import { Botao, Controle, Eixos, escala, Grafico, Kpi, Legenda, margens, Painel, Quadro, type Pagina } from "@/components/capitulo7/base";
import { BASE } from "@/lib/capitulo12/dados";
import { acertoComCorrelacao, acertoDaMaioria } from "@/lib/capitulo12/metricas";
import { SLIDE } from "@/lib/capitulo12/roteiro";
import { int, num, pct } from "@/lib/capitulo7/formato";

/**
 * 24 · c12p24 · Mil classificadores de 51% acertam 73,7% por maioria (título calculado no roteiro). Barras: acerto do
 * voto da maioria para n = 1, 11, 101, 501, 1.001, 3.001 e 10.001 classificadores, cada um com acerto p, pela binomial
 * exata (acertoDaMaioria, conferida contra binom.sf do SciPy); a barra de 1.001 em destaque. Dois controles: o acerto
 * individual p (0,50 a 0,60) e a correlação dos erros ρ, num modelo ilustrativo de mistura (acertoComCorrelacao: com
 * probabilidade ρ todos copiam um voto comum), declarado na tela como hipótese didática. Com ρ > 0, o contorno mostra o
 * valor sob independência. Estado inicial: p = 51%, ρ = 0; "Restaurar" volta a ele.
 */
const NS = [1, 11, 101, 501, 1001, 3001, 10001];
const DESTAQUE = 1001, P0 = 0.51, RHO0 = 0;
/** Coordenada arredondada a 0,1 px: exp e log do servidor e do navegador diferem na última casa e quebrariam a hidratação. */
const r1 = (v: number) => Math.round(v * 10) / 10;
// leitura do slide: a maioria cresce com n quando p > 50% e votos independentes
const IND0 = NS.map((n) => acertoDaMaioria(n, P0));
if (IND0.some((v, i) => i > 0 && v <= IND0[i - 1])) throw new Error("s24: a maioria deveria crescer com n para p = 51%");

export function S24Maioria({ pagina }: { pagina?: Pagina }) {
  const [p, setP] = useState(P0);
  const [rho, setRho] = useState(RHO0);
  const ind = useMemo(() => NS.map((n) => acertoDaMaioria(n, p)), [p]);
  const val = ind.map((v) => rho * p + (1 - rho) * v);
  const iD = NS.indexOf(DESTAQUE);
  const vD = acertoComCorrelacao(DESTAQUE, p, rho);
  const inicial = p === P0 && rho === RHO0;
  const tab = (
    <table><caption>Acerto do voto da maioria por número de classificadores</caption><thead><tr><th>Classificadores</th><th>Acerto da maioria</th><th>Sob independência</th></tr></thead>
      <tbody>{NS.map((n, i) => <tr key={n}><td>{int(n)}</td><td>{pct(val[i], 1)}</td><td>{pct(ind[i], 1)}</td></tr>)}</tbody></table>
  );
  return (
    <Quadro slug="c12p24" pagina={pagina} layout="gl"
      conclusao={rho === 0
        ? <>Com votos independentes, {int(DESTAQUE)} classificadores de {pct(p, 1)} acertam <b>{pct(vD, 1)}</b> por maioria. A hipótese forte é a independência: modelos treinados nos mesmos dados erram juntos. Aumente ρ.</>
        : <>Com ρ = {num(rho, 2)}, os mesmos {int(DESTAQUE)} acertam <b>{pct(vD, 1)}</b>, contra {pct(ind[iD], 1)} se fossem independentes. Os ensembles (slide {SLIDE.c12p25.n}) existem para reduzir essa correlação.</>}
      fonte={`Cálculo pela distribuição binomial exata (equivale a binom.sf do SciPy ${BASE.versoes.scipy}); número ímpar de classificadores para evitar empates. Correlação: modelo ilustrativo de mistura, hipótese didática, não medida em modelo real.`}>
      <Painel className="q12-s24-g">
        <Grafico titulo="Acerto do voto da maioria" sub={`cada classificador acerta ${pct(p, 1)}`} tabela={tab} arCelular="4 / 3"
          rotulo={`Barras: acerto da maioria para ${NS.map((n, i) => `${int(n)} classificadores, ${pct(val[i], 1)}`).join("; ")}`}>
          {(d) => {
            const m = margens(d.fs, { l: 3.1, b: 2.9, t: 1.6, r: 0.6 });
            const x = escala([0, NS.length], [m.l, d.w - m.r]), y = escala([0, 1], [d.h - m.b, m.t]);
            const bw = (x(1) - x(0)) * 0.62;
            return (
              <g>
                <Eixos x={x} y={y} xt={[]} yt={[0, 0.25, 0.5, 0.75, 1]} fx={() => ""} fy={(v) => pct(v, 0)} xTit="Número de classificadores (ímpar)" />
                {NS.map((n, i) => {
                  const cx = x(i + 0.5), on = n === DESTAQUE;
                  return (
                    <g key={n}>
                      {rho > 0 && <rect x={cx - bw / 2} y={r1(y(ind[i]))} width={bw} height={r1(y(0) - y(ind[i]))} fill="none" stroke="#9AA1AD" strokeWidth={1.6} strokeDasharray="5 4" />}
                      <rect x={cx - bw / 2} y={r1(y(val[i]))} width={bw} height={r1(y(0) - y(val[i]))} fill={on ? "#176C73" : "#9FCBCD"} />
                      <text className="q7-rot" x={cx} y={r1(y(Math.max(val[i], rho > 0 ? ind[i] : 0)))} dy="-.4em" textAnchor="middle" style={{ fill: on ? "#176C73" : "#2A3342", fontSize: on ? "1.05em" : ".9em" }}>{pct(val[i], 1)}</text>
                      <text className="q7-tick" x={cx} y={y(0)} dy="1.25em" textAnchor="middle" style={on ? { fontWeight: 700, fill: "#00205B" } : undefined}>{int(n)}</text>
                    </g>
                  );
                })}
                <line x1={x(0)} x2={x(NS.length)} y1={y(p)} y2={y(p)} stroke="#00205B" strokeWidth={2} strokeDasharray="7 5" />
              </g>
            );
          }}
        </Grafico>
        <Legenda itens={[{ mk: "trac ink", r: `um classificador sozinho: ${pct(p, 1)}` }, ...(rho > 0 ? [{ mk: "trac mudo", r: "contorno: votos independentes" }] : [])]} />
      </Painel>
      <Painel className="q12-s24-dir">
        <Kpi rotulo={`${int(DESTAQUE)} classificadores, por maioria`} valor={pct(vD, 1)} detalhe={rho > 0 ? `${pct(ind[iD], 1)} se fossem independentes` : `cada um acerta ${pct(p, 1)}`} tom="prob" />
        <Controle rotulo="Acerto de cada classificador, p" valor={p} min={0.5} max={0.6} passo={0.005} onChange={setP} mostrar={pct(p, 1)} escala={["50%", "60%"]} />
        <Controle rotulo="Correlação dos erros, ρ" valor={rho} min={0} max={1} passo={0.05} onChange={setRho} mostrar={num(rho, 2)} escala={["0: independentes", "1: idênticos"]} />
        <p className="q7-nota">Hipótese didática: com probabilidade ρ, todos copiam um voto comum.</p>
        <ul className="q12-b3-lista q12-b3-lista--peq">
          <li>É a Lei dos Grandes Números aplicada aos votos.</li>
        </ul>
        <div className="q7-botoes"><Botao sec onClick={() => { setP(P0); setRho(RHO0); }} desab={inicial}>Restaurar</Botao></div>
      </Painel>
    </Quadro>
  );
}
