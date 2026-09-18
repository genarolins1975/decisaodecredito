"use client";
import { useState } from "react";
import vaz from "@/lib/visuais/vazamento.json";
import { estadoDoCampo } from "@/lib/visuais/tempo";
import { fmtNum } from "@/lib/visuais/metricas";

/**
 * O modelo perfeito que está errado (capítulo 11, c11p6). Um campo nasce depois da decisão e carrega o desfecho: a AUC
 * fora do tempo vai a 1,0000. A turma posiciona o instante em que cada campo fica disponível na linha do tempo, aplica a
 * regra do capítulo 3 (disponibilidade até a data da decisão) e decide usar ou bloquear, com os números do gerador.
 */
type Campo = { id: string; nome: string; desc: string; evento: number; disponibilidade: number; fixo?: boolean };
const CAMPOS: Campo[] = [
  { id: "util", nome: "utilizacao", desc: "utilização do limite na data da proposta", evento: 0, disponibilidade: 0, fixo: true },
  { id: "atr6", nome: "atraso_max_6m", desc: "maior atraso nos 6 meses antes da proposta", evento: 0, disponibilidade: 0, fixo: true },
  { id: "renda_conf", nome: "renda_confirmada", desc: "renda confirmada pela análise, dias depois da proposta", evento: 0, disponibilidade: 1, fixo: true },
  { id: "atr12", nome: "dias_atraso_max_12m", desc: "maior atraso ao longo do mesmo horizonte que define o alvo", evento: 12, disponibilidade: 12 },
];
const W = 720, H = 170, ML = 150, MR = 20;
const sx = (m: number) => ML + ((m + 12) / 24) * (W - ML - MR);
const M = vaz.modelos;

export function ModeloPerfeito() {
  const [disp, setDisp] = useState(12); // instante em que o campo candidato fica disponível, em meses após a decisão
  const [decisao, setDecisao] = useState<"usar" | "bloquear" | null>(null);
  const candidato = { ...CAMPOS[3], disponibilidade: disp };
  const campos = [...CAMPOS.slice(0, 3), candidato];
  const estado = estadoDoCampo(candidato.evento, candidato.disponibilidade, 0);
  const entra = estado === "utilizavel";
  const barras = [
    { rot: "boosting honesto", treino: M.gbm_treino.auc, oot: M.gbm_raw_oot.auc, ks: M.gbm_raw_oot.ks, brier: M.gbm_raw_oot.brier, tom: "vz-mp--ok" },
    { rot: "com vazamento suave", treino: M.leak_suave_treino.auc, oot: M.leak_suave_oot.auc, ks: M.leak_suave_oot.ks, brier: M.leak_suave_oot.brier, tom: "vz-mp--meio" },
    { rot: "com o campo do horizonte", treino: M.leak_total_treino.auc, oot: M.leak_total_oot.auc, ks: M.leak_total_oot.ks, brier: M.leak_total_oot.brier, tom: "vz-mp--ruim" },
  ];
  return (
    <figure className="vz" data-vz="modelo-perfeito">
      <header className="vz-cab">
        <div>
          <p className="eyebrow">O modelo perfeito que está errado · missão 4 · a regra do capítulo 3 aplicada a um campo candidato</p>
          <p className="vz-tit">Uma AUC de 1,0000 fora do tempo não é mérito. É sintoma: o campo conhece o desfecho porque nasce depois dele.</p>
        </div>
        <div className="vz-acoes">
          <div className="vz-seg" role="group" aria-label="Decisão sobre o campo">
            <button type="button" className={`vz-seg-b ${decisao === "usar" ? "vz-seg-b--on" : ""}`} onClick={() => setDecisao("usar")}>Usar: a AUC fica quase perfeita</button>
            <button type="button" className={`vz-seg-b ${decisao === "bloquear" ? "vz-seg-b--on" : ""}`} onClick={() => setDecisao("bloquear")}>Bloquear: o campo nasce depois</button>
          </div>
        </div>
      </header>
      <div className={`vz-estado ${decisao === "usar" ? "vz-estado--choque" : ""}`}>
        {decisao === null && <><b>Campo candidato dias_atraso_max_12m</b>, {candidato.desc}. Disponível {disp === 0 ? "na data da decisão" : disp > 0 ? `${disp} ${disp === 1 ? "mês" : "meses"} depois da decisão` : `${-disp} ${-disp === 1 ? "mês" : "meses"} antes da decisão`}: pela regra do capítulo 3, {entra ? "entra" : "não entra"}. Escolha e justifique pelo instante da decisão.</>}
        {decisao === "usar" && <><b>Usar: AUC {fmtNum(M.leak_total_oot.auc, 4)} e Brier {fmtNum(M.leak_total_oot.brier, 5)} fora do tempo.</b> O modelo não previu nada: o maior atraso em 12 meses é o próprio evento de default. Em produção o campo não existe na data da proposta, e a AUC real volta a {fmtNum(M.gbm_raw_oot.auc, 4)} com um modelo que ninguém validou nessa condição.</>}
        {decisao === "bloquear" && <><b>Bloquear: o campo fica disponível depois da decisão.</b> A AUC honesta é {fmtNum(M.gbm_raw_oot.auc, 4)} fora do tempo, e é ela que vai para o memorando. Desempenho implausível se diagnostica pela data de disponibilidade, não pela métrica.</>}
      </div>
      <div className="vz-mp-grade">
        <div className="vz-grafico">
          <p className="vz-grafico-t">Linha do tempo de uma proposta <span className="hint">decisão em t0 · observação antes · horizonte do alvo depois · ponto: instante em que cada campo fica disponível</span></p>
          <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Janelas de observação e de horizonte e a disponibilidade de cada campo">
            <rect x={sx(-12)} y={22} width={sx(0) - sx(-12)} height={22} className="vz-mp-obs" /><text x={sx(-6)} y={37} textAnchor="middle" className="vz-zon-t">observação · características</text>
            <rect x={sx(0)} y={22} width={sx(12) - sx(0)} height={22} className="vz-mp-hor" /><text x={sx(6)} y={37} textAnchor="middle" className="vz-zon-t vz-zon-t--claro">horizonte · o alvo se forma aqui</text>
            <line x1={sx(0)} x2={sx(0)} y1={12} y2={H - 26} className="vz-mp-t0" /><text x={sx(0)} y={H - 12} textAnchor="middle" className="vz-tick vz-tick--ouro">t0 · decisão</text>
            {[-12, -6, 6, 12].map((m) => <text key={m} x={sx(m)} y={H - 12} textAnchor="middle" className="vz-tick">{m > 0 ? "+" : ""}{m} m</text>)}
            {campos.map((c, i) => { const y = 62 + i * 22; const ok = estadoDoCampo(c.evento, c.disponibilidade, 0) === "utilizavel"; return <g key={c.id}>
              <line x1={sx(-12)} x2={sx(12)} y1={y} y2={y} className="vz-grade" />
              <text x={ML - 4} y={y + 4} textAnchor="end" className="vz-mp-nome">{c.nome}</text>
              <circle cx={sx(c.disponibilidade)} cy={y} r={c.id === "atr12" ? 8 : 6} className={`vz-mp-pt ${ok ? "vz-mp-pt--ok" : "vz-mp-pt--nao"}`} />
              <text x={sx(c.disponibilidade) + (c.disponibilidade > 6 ? -12 : 12)} y={y + 4} textAnchor={c.disponibilidade > 6 ? "end" : "start"} className={`vz-tick ${ok ? "" : "vz-tick--default"}`}>{ok ? "entra" : "bloqueado: nasce depois"}</text>
            </g>; })}
          </svg>
          <label className="vz-slider"><span className="vz-slider-rotulo"><span>Instante em que dias_atraso_max_12m fica disponível</span><span className="vz-slider-valor">{disp > 0 ? "+" : ""}{disp} {Math.abs(disp) === 1 ? "mês" : "meses"}</span></span><input type="range" min={-12} max={12} step={1} value={disp} onChange={(e) => setDisp(Number(e.target.value))} /></label>
          <p className="hint">O evento que o campo resume (o maior atraso do horizonte) ocorre até +12 meses; mover a disponibilidade para antes de t0 é impossível na prática, e o controle serve para ver a regra reagir.</p>
        </div>
        <div className="vz-mp-painel">
          <p className="vz-grafico-t">O que o gerador entrega em cada caso <span className="hint">AUC fora do tempo, 737 propostas e 81 defaults</span></p>
          <div className="vz-res-barras">
            {barras.map((b) => <div key={b.rot} className="vz-res-barra"><span className="vz-res-barra-rot">{b.rot}</span><span className="vz-res-barra-trilho vz-ind-trilho"><span className={`vz-res-barra-fill ${b.tom}`} style={{ width: `${((b.oot - 0.5) / 0.5) * 100}%` }} /><span className="vz-ind-marca" style={{ left: `${((M.logit_oot.auc - 0.5) / 0.5) * 100}%` }} /></span><span className="vz-res-barra-val">{fmtNum(b.oot, 4)}</span></div>)}
          </div>
          <p className="hint">Barra de 0,5 (sorteio) a 1,0 (perfeito); marca dourada: a logística do curso, {fmtNum(M.logit_oot.auc, 4)}.</p>
          <div className="table-wrap"><table className="table text-[.85em]"><thead><tr><th>Modelo</th><th>AUC treino</th><th>AUC OOT</th><th>KS OOT</th><th>Brier OOT</th></tr></thead><tbody>{barras.map((b) => <tr key={b.rot}><th scope="row">{b.rot}</th><td>{fmtNum(b.treino, 4)}</td><td>{fmtNum(b.oot, 4)}</td><td>{fmtNum(b.ks, 4)}</td><td>{fmtNum(b.brier, 5)}</td></tr>)}</tbody></table></div>
          <div className="vz-tile"><p className="eyebrow">O diagnóstico</p><p className="vz-num vz-num--texto">Ordenação acima de 0,95 em crédito, com treino e fora do tempo iguais, é implausível. A pergunta não é qual métrica, e sim quando este campo passou a existir.</p></div>
        </div>
      </div>
      <p className="vz-fonte">Resultados do gerador: boosting honesto AUC {fmtNum(M.gbm_raw_oot.auc, 4)}; com vazamento suave {fmtNum(M.leak_suave_oot.auc, 4)}; com dias_atraso_max_12m {fmtNum(M.leak_total_oot.auc, 4)}, Brier {fmtNum(M.leak_total_oot.brier, 5)}. Regra de disponibilidade do capítulo 3: um campo entra se a data em que o banco poderia conhecê-lo é anterior ou igual à data da decisão.</p>
    </figure>
  );
}
