"use client";
import { useMemo, useState } from "react";
import { fmtNum, fmtPct } from "@/lib/visuais/metricas";
import { ARVORES_TM, BASE_TM, ETA_TM, FAMILIAS, leituraDaProposta, tresModelos, type Familia } from "@/lib/visuais/tres-modelos";
import { boostingClassificacao } from "@/lib/visuais/boosting";

/**
 * Fecho da Aula 2 (c6p20): as mesmas 16 propostas que atravessaram os capítulos 4, 5 e 6, cada uma com a PD das três
 * famílias. Uma linha por proposta, na ordem da utilização; a distância entre a menor e a maior PD fica desenhada, e
 * as linhas em que um modelo põe o caso abaixo de 50% e outro acima ficam marcadas. Contas em
 * src/lib/visuais/tres-modelos.ts. Ao lado, a perda de treino das três famílias, a pergunta para a Aula 3 e a entrega:
 * a peça substitui o texto herdado da página, que no palco caía numa segunda tela.
 * A nota de fonte não diz qual proposta tem a maior distância: é isso que a questão da página pede para ler no gráfico.
 * No palco saem a tabela e a nota de fonte, e o gráfico fica com a tela.
 */
const COR: Record<Familia, string> = { logistica: "var(--tm-logistica)", arvore: "var(--tm-arvore)", boosting: "var(--tm-boosting)" };
const W = 760, LINHA = 25, MT = 50, MB = 14, ML = 150, MR = 78;
const H = MT + 16 * LINHA + MB;
const sx = (p: number) => ML + p * (W - ML - MR);
const sy = (i: number) => MT + i * LINHA + LINHA / 2;
/* deslocamento vertical por família dentro da linha: com PDs iguais (a árvore e o boosting dão 50% exatos na #1 e
   na #2), uma marca esconderia a outra */
const DY: Record<Familia, number> = { logistica: 0, arvore: -5, boosting: 5 };

function Marca({ f, x, y, forte }: { f: Familia; x: number; y: number; forte: boolean }) {
  const r = forte ? 7 : 6;
  const estilo = { fill: COR[f], stroke: "#fff", strokeWidth: 1.5 };
  if (f === "logistica") return <circle cx={x} cy={y} r={r} style={estilo} />;
  if (f === "arvore") return <rect x={x - r + 0.5} y={y - r + 0.5} width={2 * r - 1} height={2 * r - 1} style={estilo} />;
  return <rect x={x - r + 1} y={y - r + 1} width={2 * r - 2} height={2 * r - 2} transform={`rotate(45 ${x} ${y})`} style={estilo} />;
}

export function TresModelos({ palco = false }: { palco?: boolean }) {
  const { linhas, perda } = useMemo(() => tresModelos(), []);
  const perda50 = useMemo(() => boostingClassificacao(BASE_TM, ETA_TM, 50)[50].perda, []);
  const [sel, setSel] = useState(12);
  const [ligadas, setLigadas] = useState<Record<Familia, boolean>>({ logistica: true, arvore: true, boosting: true });
  const visiveis = FAMILIAS.filter((f) => ligadas[f.id]);
  const l = linhas.find((x) => x.id === sel)!;
  const alterna = (f: Familia) => setLigadas((v) => {
    const prox = { ...v, [f]: !v[f] };
    return Object.values(prox).some(Boolean) ? prox : v;   // ao menos uma família fica visível
  });
  const extremos = (x: typeof l) => {
    const v = visiveis.map((f) => x.pd[f.id]);
    return { menor: Math.min(...v), maior: Math.max(...v) };
  };
  return (
    <figure className="vz" data-vz="tres-modelos">
      <header className="vz-cab">
        <div>
          <p className="eyebrow">Fecho da aula 2 · as mesmas 16 propostas · três famílias</p>
          <p className="vz-tit">Os três modelos concordam onde o caso é claro e discordam na fronteira.</p>
        </div>
        <div className="vz-acoes" role="group" aria-label="Famílias exibidas">
          {FAMILIAS.map((f) => (
            <button key={f.id} type="button" className={`btn btn-sm ${ligadas[f.id] ? "" : "btn-secondary"} vz-tm-chip`} aria-pressed={ligadas[f.id]} onClick={() => alterna(f.id)}>
              <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true"><Marca f={f.id} x={7} y={7} forte={false} /></svg>{f.nome}
            </button>
          ))}
        </div>
      </header>

      <div className="vz-estado" aria-live="polite">
        <b>Proposta #{l.id}, utilização {l.util}% e atraso {l.atraso} d, {l.y ? "deu default" : "pagou"}:</b>{" "}
        {FAMILIAS.map((f, k) => <span key={f.id}>{k ? " · " : ""}{f.nome.toLowerCase()} {fmtPct(l.pd[f.id], 1)}{f.id === "arvore" ? ` (folha de ${l.folha.n}, ${l.folha.d} ${l.folha.d === 1 ? "default" : "defaults"})` : ""}</span>)}.
        {" "}{fmtNum(l.distancia * 100, 1)} pontos entre a menor e a maior. {leituraDaProposta(l)}
      </div>

      <div className="vz-tm-corpo">
      <div className="vz-grafico">
        <p className="vz-grafico-t">Uma linha por proposta, na ordem da utilização <span className="hint">clique numa linha para ler as três PDs</span></p>
        <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="PD de cada proposta nos três modelos, com a distância entre a menor e a maior">
          {[0, 0.25, 0.5, 0.75, 1].map((p) => (
            <g key={p}>
              <line x1={sx(p)} x2={sx(p)} y1={MT - 6} y2={H - MB} className={p === 0.5 ? "vz-tm-meio" : "vz-tm-grade"} />
              <text x={sx(p)} y={MT - 12} textAnchor="middle" className="vz-tick">{fmtPct(p)}</text>
            </g>
          ))}
          {/* cabeçalhos das colunas numa linha própria, acima da escala, para não encostar em 0% e 100% */}
          <text x={ML - 10} y={MT - 30} textAnchor="end" className="vz-rotulo">PROPOSTA</text>
          <text x={sx(0.5)} y={MT - 30} textAnchor="middle" className="vz-rotulo">PD ESTIMADA</text>
          <text x={W - MR + 10} y={MT - 30} className="vz-rotulo">DESFECHO</text>
          {linhas.map((x, i) => {
            const on = x.id === sel;
            const { menor, maior } = extremos(x);
            const opostos = visiveis.length > 1 && menor < 0.5 && maior > 0.5;
            return (
              <g key={x.id} role="button" tabIndex={0} aria-pressed={on} className={`vz-tm-linha ${on ? "vz-tm-linha--on" : ""}`}
                aria-label={`Proposta ${x.id}: ${FAMILIAS.map((f) => `${f.nome} ${fmtPct(x.pd[f.id], 1)}`).join(", ")}; ${x.y ? "deu default" : "pagou"}`}
                onClick={() => setSel(x.id)} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setSel(x.id); } }}>
                <rect x={4} y={sy(i) - LINHA / 2 + 1} width={W - 8} height={LINHA - 2} rx={4} className={`vz-tm-faixa ${opostos ? "vz-tm-faixa--opostos" : ""}`} />
                <text x={ML - 10} y={sy(i) + 4} textAnchor="end" className="vz-tick vz-tm-rot"><tspan className="vz-tm-id">#{x.id}</tspan>{`  ${x.util}% · ${x.atraso} d`}</text>
                {visiveis.length > 1 && <line x1={sx(menor)} x2={sx(maior)} y1={sy(i)} y2={sy(i)} className="vz-tm-dist" />}
                {visiveis.map((f) => <Marca key={f.id} f={f.id} x={sx(x.pd[f.id])} y={sy(i) + DY[f.id]} forte={on} />)}
                <text x={W - MR + 10} y={sy(i) + 4} className={`vz-tick ${x.y ? "vz-tm-default" : ""}`}>{x.y ? "default" : "pagou"}</text>
              </g>
            );
          })}
        </svg>
        <p className="vz-tm-legenda">
          {FAMILIAS.map((f) => <span key={f.id}><svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true"><Marca f={f.id} x={7} y={7} forte={false} /></svg>{f.nome}, capítulo {f.capitulo}, {f.config}</span>)}
          <span><span className="vz-tm-legenda-faixa" aria-hidden="true" />um modelo abaixo de 50% e outro acima</span>
        </p>
      </div>
      <div className="vz-tm-lado">
        <div className="vz-rd-lista vz-rd-lista--neutra">
          <p className="vz-rd-k">Perda no treino, log loss média</p>
          <table className="table vz-tm-perdas"><tbody>
            <tr><th scope="row">Logística</th><td>{fmtNum(perda.logistica, 5)}</td></tr>
            <tr><th scope="row">Árvore</th><td>{fmtNum(perda.arvore, 5)}</td></tr>
            <tr><th scope="row">Boosting, {ARVORES_TM} árvores</th><td>{fmtNum(perda.boosting, 5)}</td></tr>
            <tr><th scope="row">Boosting, 50 árvores</th><td>{fmtNum(perda50, 5)}</td></tr>
          </tbody></table>
          <p className="vz-rd-nota">No treino vence quem ajusta mais, e ajustar mais não é prever melhor.</p>
        </div>
        <div className="vz-rd-lista vz-rd-lista--ganha">
          <p className="vz-rd-k">A pergunta da Aula 3</p>
          <p className="vz-rd-nota">Qual critério decide entre os três, fora da amostra, e quando a diferença justifica trocar o modelo? Capítulos 7 e 8.</p>
        </div>
        <p className="vz-tm-entrega"><b>Entrega da aula 2:</b> a comparação conceitual das três técnicas e os exercícios de interpretação.</p>
      </div>
      </div>

      {!palco && <details className="vz-tm-tabela">
        <summary>Ver as 16 propostas em tabela</summary>
        <div className="table-wrap"><table className="table text-[.85em]">
          <thead><tr><th>#</th><th>Utilização</th><th>Atraso</th><th>Desfecho</th>{FAMILIAS.map((f) => <th key={f.id}>{f.nome}</th>)}<th>Distância</th></tr></thead>
          <tbody>{linhas.map((x) => (
            <tr key={x.id} className={x.ladosOpostos ? "vz-t-cara" : ""}><th scope="row">#{x.id}</th><td>{x.util}%</td><td>{x.atraso} d</td><td>{x.y ? "default" : "pagou"}</td>
              {FAMILIAS.map((f) => <td key={f.id}>{fmtPct(x.pd[f.id], 1)}</td>)}<td>{fmtNum(x.distancia * 100, 1)} pp</td></tr>
          ))}</tbody>
        </table></div>
      </details>}

      {!palco && <p className="vz-fonte">Base didática de 16 propostas, a mesma dos capítulos 4, 5 e 6. Logística com os coeficientes da aula β = (−5,6666; 0,7453; 1,3955); árvore de profundidade 2 crescida sobre as 16, com a PD igual à frequência da folha; boosting com quatro árvores de profundidade 2 e η = 0,4, partindo das log odds da prevalência. Distância: a maior menos a menor das três PDs de cada proposta. #12: 99,6%, 100% e 66,8%, como em c6p14.</p>}
    </figure>
  );
}
