"use client";
import { useState } from "react";
import { Botao, Controle, escala, Grafico, Painel, Quadro, type Pagina } from "../base";
import { QUATRO } from "@/lib/capitulo7/dados";
import { logit, sigmoide } from "@/lib/capitulo7/metricas";
import { num, pct } from "@/lib/capitulo7/formato";

/**
 * 04 · c7p3 · Ordenar, prever e decidir. Os mesmos quatro clientes (propostas reais da mini-base) numa fila, numa
 * escala de PD e diante de um corte. Mudar o nível das PDs (somar δ em log odds) mexe na escala e preserva a fila;
 * mudar o corte mexe nas decisões e preserva as PDs. O painel diz, a cada estado, o que mudou e o que ficou.
 */
const BASE = QUATRO.map((c) => ({ ...c, pd: c.pd }));
const CORTE0 = 0.12;
const ordem = (pds: number[]) => pds.map((_, i) => i).sort((a, b) => pds[b] - pds[a]).join(",");

export function S04TresObjetos({ pagina }: { pagina?: Pagina }) {
  const [delta, setDelta] = useState(0);
  const [corte, setCorte] = useState(CORTE0);
  const pds = BASE.map((c) => sigmoide(logit(c.pd) + delta));
  const ord = BASE.map((_, i) => i).sort((a, b) => pds[b] - pds[a]);
  const mudouOrdem = ordem(pds) !== ordem(BASE.map((c) => c.pd));
  const mudouPd = Math.abs(delta) > 1e-9;
  const rec = pds.map((p) => p >= corte), rec0 = BASE.map((c) => c.pd >= CORTE0);
  const mudouDec = rec.some((r, i) => r !== rec0[i]);
  const nRec = rec.filter(Boolean).length;
  const estado = (m: boolean) => <b data-mudou={m ? "1" : "0"} className="q7-s04-est">{m ? "mudou" : "igual"}</b>;
  return (
    <Quadro slug="c7p3" pagina={pagina} layout="glx"
      conclusao={!mudouPd && corte === CORTE0 ? "Mexa no nível ou no corte. A fila só mudaria se a ordem entre as PDs mudasse, e somar δ em log odds nunca muda essa ordem."
        : mudouPd && !mudouDec ? <>As PDs andaram {delta > 0 ? "para cima" : "para baixo"} e a fila ficou igual: <b>uma boa ordenação não garante o nível certo</b>.</>
        : mudouPd ? <>Mesma fila, PDs em outro nível, e com o corte de {pct(corte, 0)} a decisão mudou para {mudouDec ? "pelo menos um cliente" : "ninguém"}: <b>o nível importa quando o corte é em PD</b>.</>
        : <>As PDs são as mesmas; só o corte andou. Decidir é uma escolha separada de ordenar e de prever.</>}
      fonte="Quatro propostas da mini-base (janela fora do tempo; PD da logística em pontos inteiros). Nível alterado por δ em log odds: p' = σ(logit p + δ). Recusa quando PD ≥ corte.">
      <Painel titulo="Os mesmos quatro clientes, três tarefas">
        <div className="q7-s04">
          <p className="q7-s04-l"><span>1</span>Ordenar</p>
          <ol className="q7-s04-fila" aria-label="Fila dos quatro clientes, do maior risco para o menor">
            {ord.map((i, k) => <li key={BASE[i].id} data-y={BASE[i].y}><span className="q7-s04-pos">{k + 1}º</span><b>#{BASE[i].id}</b><span>{BASE[i].y ? "deu default" : "pagou"}</span></li>)}
          </ol>
          <p className="q7-s04-l"><span>2</span>Prever</p>
          <p className="q7-s04-l q7-s04-l3"><span>3</span>Decidir</p>
          <div className="q7-s04-g">
            <Grafico rotulo={`Escala de PD dos quatro clientes e corte de ${pct(corte, 0)}`} arCelular="16 / 7">
              {(d) => {
                const x = escala([0, 0.5], [d.fs * 1.2, d.w - d.fs * 1.2]);
                const yA = d.h * 0.24, yB = d.h * 0.74, r = d.fs * 0.55;
                const ticks = [0, 0.1, 0.2, 0.3, 0.4, 0.5];
                return (
                  <g>
                    {[yA, yB].map((yy, k) => <g key={k}><line className="q7-eixo" x1={x(0)} x2={x(0.5)} y1={yy} y2={yy} />{ticks.map((t) => <g key={t}><line className="q7-eixo" x1={x(t)} x2={x(t)} y1={yy - 5} y2={yy + 5} /><text className="q7-tick" x={x(t)} y={yy} dy="1.5em" textAnchor="middle">{pct(t, 0)}</text></g>)}</g>)}
                    <rect x={x(corte)} y={yB - d.fs * 1.9} width={x(0.5) - x(corte)} height={d.fs * 2.6} fill="#FBF2E5" />
                    <line className="q7-corte" x1={x(corte)} x2={x(corte)} y1={yB - d.fs * 2.1} y2={yB + d.fs * 0.6} />
                    <text className="q7-corte-t" x={x(corte) + 8} y={yB - d.fs * 1.15}>recusa: PD ≥ {pct(corte, 0)} ({nRec} de 4)</text>
                    <text className="q7-rot--peq" x={x(corte) - 8} y={yB - d.fs * 1.15} textAnchor="end" style={{ fill: "#5B6475" }}>aprova</text>
                    {BASE.map((c, i) => {
                      const cx = x(Math.min(0.5, pds[i])), cx0 = x(c.pd); const acima = i % 2 === 0;
                      return (
                        <g key={c.id}>
                          {mudouPd && <circle cx={cx0} cy={yA} r={r * 0.75} fill="none" stroke="#B5BAC4" strokeDasharray="3 3" strokeWidth={2} />}
                          <circle cx={cx} cy={yA} r={r} className={c.y ? "q7-pt-def" : "q7-pt-adi"} />
                          <text className="q7-rot--peq" x={cx} y={yA + (acima ? -r * 1.6 : -r * 1.6)} textAnchor="middle" dy={acima ? 0 : -d.fs * 0.9}>#{c.id} · {pct(pds[i], 1)}</text>
                          <circle cx={cx} cy={yB} r={r} fill={rec[i] ? "#A85A0C" : "#fff"} stroke={rec[i] ? "#A85A0C" : "#5B6475"} strokeWidth={2.4} />
                        </g>
                      );
                    })}
                    <text className="q7-eixo-t" x={x(0.5)} y={yA} dy="2.9em" textAnchor="end">PD estimada (%)</text>
                  </g>
                );
              }}
            </Grafico>
          </div>
        </div>
        <div className="q7-s04-ctl">
          <Controle rotulo="Nível das PDs (δ em log odds)" valor={delta} min={-1.5} max={1.5} passo={0.1} onChange={setDelta} mostrar={`${delta > 0 ? "+" : ""}${num(delta, 1)}`} escala={["mais baixo", "mais alto"]} />
          <Controle rotulo="Corte de recusa" valor={corte} min={0.05} max={0.3} passo={0.01} onChange={setCorte} mostrar={pct(corte, 0)} escala={["5%", "30%"]} />
        </div>
      </Painel>
      <Painel titulo="O que mudou desde o início">
        <dl className="q7-s04-tab">
          <div><dt>A fila (quem vem antes)</dt><dd>{estado(mudouOrdem)}</dd></div>
          <div><dt>As PDs (o nível)</dt><dd>{estado(mudouPd)}</dd></div>
          <div><dt>As decisões no corte</dt><dd>{estado(mudouDec)}</dd></div>
        </dl>
        <p className="q7-p">Ordenar pede só a <b>posição</b>. Prever pede o <b>valor</b> da PD. Decidir pede um <b>corte</b>, escolhido por critério econômico.</p>
        <div className="q7-botoes"><Botao sec onClick={() => { setDelta(0); setCorte(CORTE0); }}>Restaurar</Botao><Botao sec onClick={() => setDelta(0.8)}>Exemplo: PDs altas demais</Botao></div>
      </Painel>
    </Quadro>
  );
}
