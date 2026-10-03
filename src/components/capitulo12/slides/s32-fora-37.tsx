"use client";
import { useState } from "react";
import { Botao, caminho, Controle, Eixos, escala, Formula, Grafico, Kpi, Legenda, margens, Painel, Quadro, type Pagina } from "@/components/capitulo7/base";
import { FORA_375, N_TREINO_LUAS } from "@/lib/capitulo12/dados";
import { foraDaAmostra } from "@/lib/capitulo12/metricas";
import { SLIDE } from "@/lib/capitulo12/roteiro";
import { int, pct } from "@/lib/capitulo7/formato";

/**
 * 32 · c12p32 · Cada árvore deixa de fora cerca de 37% das instâncias (aprofundamento). Curva da probabilidade de uma
 * instância entrar numa amostra bootstrap de m sorteios entre m, 1 − (1 − 1/m)^m, para m de 1 a 40, com a assíntota
 * 1 − 1/e ≈ 63,2%; a fórmula em KaTeX dá o limite de fora, 1/e ≈ 36,8%. O controle escolhe m; o botão leva a m = 375, o
 * treino das luas (FORA_375 de dados.ts). Números de foraDaAmostra (metricas.ts). Estado inicial: m = 20, a amostra do
 * slide 29; "Restaurar" volta a ele.
 */
const MS = Array.from({ length: 40 }, (_, i) => i + 1);
const E = Math.exp(-1);
const M0 = 20;
/** Coordenada arredondada a 0,1 px: Math.pow do servidor e do navegador diferem na última casa e quebrariam a hidratação. */
const r1 = (v: number) => Math.round(v * 10) / 10;
// a leitura diz que a fração de fora sobe com m e se aproxima de 1/e por baixo
if (MS.some((m, i) => i > 0 && foraDaAmostra(m) <= foraDaAmostra(MS[i - 1])) || foraDaAmostra(40) >= E) throw new Error("s32: a fração de fora deveria crescer com m em direção a 1/e");

export function S32Fora37({ pagina }: { pagina?: Pagina }) {
  const [m, setM] = useState(M0);
  const fora = foraDaAmostra(m), dentro = 1 - fora;
  const longe = m > MS[MS.length - 1];
  return (
    <Quadro slug="c12p32" pagina={pagina} layout="gl"
      conclusao={<>Com m = {int(m)}, uma instância fica de fora com probabilidade <b>{pct(fora, 1)}</b>; com o treino das luas (m = {int(N_TREINO_LUAS)}), {pct(FORA_375, 1)}, já colado em 1/e = {pct(E, 1)}. Essas instâncias validam cada árvore de graça (slide {SLIDE.c12p33.n}).</>}
      fonte="Cálculo exato: (1 − 1/m)ᵐ é a probabilidade de uma instância não sair em nenhum de m sorteios com reposição entre m; o limite é 1/e.">
      <Painel>
        <Grafico titulo="Probabilidade de inclusão na amostra" sub="m sorteios com reposição entre m instâncias" arCelular="4 / 3"
          rotulo={`Curva da probabilidade de inclusão: ${pct(1 - foraDaAmostra(1), 0)} com m = 1, ${pct(1 - foraDaAmostra(2), 0)} com m = 2, ${pct(1 - foraDaAmostra(40), 1)} com m = 40, tendendo a ${pct(1 - E, 1)}`}
          tabela={<table><caption>Probabilidade de inclusão por m</caption><thead><tr><th>m</th><th>Dentro</th><th>Fora</th></tr></thead><tbody>{[1, 2, 5, 10, 20, 40, N_TREINO_LUAS].map((v) => <tr key={v}><td>{int(v)}</td><td>{pct(1 - foraDaAmostra(v), 1)}</td><td>{pct(foraDaAmostra(v), 1)}</td></tr>)}</tbody></table>}>
          {(d) => {
            const mg = margens(d.fs, { l: 3.4, b: 2.9, t: 1.2, r: 1.4 });
            const x = escala([0, 40], [mg.l, d.w - mg.r]), y = escala([0.6, 1], [d.h - mg.b, mg.t]);
            const pts = MS.map((v) => ({ x: r1(x(v)), y: r1(y(1 - foraDaAmostra(v))) }));
            const cx = r1(longe ? x(40) : x(m)), cy = r1(y(dentro));
            return (
              <g>
                <Eixos x={x} y={y} xt={[0, 10, 20, 30, 40]} yt={[0.6, 0.7, 0.8, 0.9, 1]} fx={(v) => int(v)} fy={(v) => pct(v, 0)} xTit="Tamanho da amostra, m" yTit="Dentro da amostra" />
                <line x1={x(0)} x2={x(40)} y1={r1(y(1 - E))} y2={r1(y(1 - E))} stroke="#00205B" strokeWidth={2} strokeDasharray="7 5" />
                <path className="q7-linha q7-linha--prob q7-linha--fina" d={caminho(pts)} />
                {pts.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r={d.fs * 0.17} fill="#176C73" />)}
                <line x1={cx} x2={cx} y1={y(0.6)} y2={cy} stroke="#A85A0C" strokeWidth={1.6} strokeDasharray="4 4" />
                <circle cx={cx} cy={cy} r={d.fs * 0.42} fill="#A85A0C" stroke="#fff" strokeWidth={2.5} />
                <text className="q7-corte-t" x={cx} y={cy} dx={longe || m > 30 ? "-.7em" : ".7em"} dy="-.7em" textAnchor={longe || m > 30 ? "end" : "start"}>{longe ? `m = ${int(m)} →` : `m = ${int(m)}`}: {pct(dentro, 1)}</text>
              </g>
            );
          }}
        </Grafico>
        <Legenda itens={[{ mk: "linha prob", r: "dentro: 1 − (1 − 1/m)ᵐ" }, { mk: "trac ink", r: `limite: 1 − 1/e ≈ ${pct(1 - E, 1)}` }]} />
      </Painel>
      <Painel className="q12-s32-dir">
        <Formula f={String.raw`\text{Fora: }\left(1-\tfrac{1}{m}\right)^{m}\;\longrightarrow\;\tfrac{1}{e}\approx ${pct(E, 1).replace("%", "\\%").replace(",", "{,}")}`} compacta />
        <div className="q7-kpis">
          <Kpi tam="mini" rotulo={`Dentro, m = ${int(m)}`} valor={pct(dentro, 1)} tom="prob" />
          <Kpi tam="mini" rotulo={`Fora, m = ${int(m)}`} valor={pct(fora, 1)} />
        </div>
        <Controle rotulo="Tamanho da amostra, m" valor={Math.min(m, 40)} min={1} max={40} passo={1} onChange={setM} mostrar={int(m)} escala={["1", "40"]} />
        <div className="q7-botoes">
          <Botao onClick={() => setM(N_TREINO_LUAS)} desab={m === N_TREINO_LUAS}>Treino das luas: m = {int(N_TREINO_LUAS)}</Botao>
          <Botao sec onClick={() => setM(M0)} desab={m === M0}>Restaurar</Botao>
        </div>
        <ul className="q12-b3-lista q12-b3-lista--peq">
          <li>As instâncias que ficam de fora, <b>out of bag</b> (OOB), validam o preditor que não as viu.</li>
        </ul>
      </Painel>
    </Quadro>
  );
}
