"use client";
import { useMemo, useState } from "react";
import oot from "@/lib/visuais/oot-logistica.json";
import { brier, deslocar, logLoss, media } from "@/lib/visuais/avaliacao";
import { aucPorPares, fmtNum, fmtPct } from "@/lib/visuais/metricas";

/**
 * Brier e log loss (capítulo 7). Modo deslocamento (c7p11): um deslocamento em log odds aplicado a todas as PDs move
 * Brier e log loss e não move a AUC em nenhuma casa; as duas medidas contêm calibração, não a isolam. Modo recalibrar
 * (c7p12): recalibrar ajusta a régua e preserva a fila; reestimar aprende coeficientes novos e pode reordenar.
 */
export type ModoBrier = "deslocamento" | "recalibrar";
const Y = oot.y as number[], PD = oot.pd as number[]; const OBS = media(Y);
const BASE = { brier: brier(Y, PD), ll: logLoss(Y, PD), auc: aucPorPares(Y, PD).auc, pdMedia: media(PD) };
const LINHAS = [["AUC", "não", "sim", "não"], ["KS", "não", "sim", "não"], ["Brier", "sim", "sim", "de forma quadrática"], ["Log loss", "sim", "sim", "sem limite superior"], ["Curva por faixa", "sim", "não", "não se aplica"]];

export function BrierELogLoss({ modo = "deslocamento" }: { modo?: ModoBrier }) {
  const [delta, setDelta] = useState(0);
  const [escolha, setEscolha] = useState<"recalibrar" | "reestimar">("recalibrar");
  const pd = useMemo(() => (delta ? deslocar(PD, delta) : PD), [delta]);
  const m = useMemo(() => ({ brier: brier(Y, pd), ll: logLoss(Y, pd), auc: aucPorPares(Y, pd).auc, pdMedia: media(pd) }), [pd]);
  const deltaRecal = useMemo(() => { // deslocamento que iguala a PD média à frequência observada (a régua ajustada)
    let lo = -2, hi = 2; for (let i = 0; i < 40; i++) { const mid = (lo + hi) / 2; if (media(deslocar(PD, mid)) < OBS) lo = mid; else hi = mid; } return (lo + hi) / 2;
  }, []);
  const recal = useMemo(() => { const p = deslocar(PD, deltaRecal); return { pdMedia: media(p), auc: aucPorPares(Y, p).auc, brier: brier(Y, p) }; }, [deltaRecal]);
  return (
    <figure className="vz" data-vz={`brier-${modo}`}>
      <header className="vz-cab">
        <div>
          <p className="eyebrow">{modo === "deslocamento" ? "Brier e log loss · janela fora do tempo, 737 propostas · logística" : "Recalibração e reestimação · duas intervenções, duas falhas diferentes"}</p>
          <p className="vz-tit">{modo === "deslocamento" ? "Brier e log loss resumem nível e separação num número só. Deslocar o nível move os dois e não move a AUC em nenhuma casa." : "Recalibrar ajusta a régua e preserva a fila. Reestimar aprende coeficientes novos e pode mudar a fila."}</p>
        </div>
        {modo === "recalibrar" && <div className="vz-acoes"><div className="vz-seg" role="group" aria-label="Intervenção"><button type="button" className={`vz-seg-b ${escolha === "recalibrar" ? "vz-seg-b--on" : ""}`} onClick={() => setEscolha("recalibrar")}>Recalibrar</button><button type="button" className={`vz-seg-b ${escolha === "reestimar" ? "vz-seg-b--on" : ""}`} onClick={() => setEscolha("reestimar")}>Reestimar</button></div></div>}
      </header>
      {modo === "deslocamento" ? (
        <>
          <div className="vz-estado"><b>Deslocamento de {delta >= 0 ? "+" : ""}{fmtNum(delta, 2)} em log odds aplicado a todas as PDs.</b> {delta === 0 ? "Sem deslocamento: os valores da página." : `A AUC continua ${fmtNum(m.auc, 6)}: ninguém foi reordenado. Brier foi de ${fmtNum(BASE.brier, 5)} para ${fmtNum(m.brier, 5)} e log loss de ${fmtNum(BASE.ll, 5)} para ${fmtNum(m.ll, 5)}, variação puramente de nível.`}</div>
          <div className="vz-bri-grade">
            <div className="vz-grafico">
              <div className="vz-tiles">
                <div className="vz-tile"><p className="eyebrow">Brier</p><p className="vz-num">{fmtNum(m.brier, 5)}</p><p className="hint">sem deslocamento: {fmtNum(BASE.brier, 5)}</p></div>
                <div className="vz-tile"><p className="eyebrow">Log loss</p><p className="vz-num">{fmtNum(m.ll, 5)}</p><p className="hint">sem deslocamento: {fmtNum(BASE.ll, 5)}</p></div>
                <div className="vz-tile"><p className="eyebrow">AUC</p><p className="vz-num">{fmtNum(m.auc, 6)}</p><p className="hint">sem deslocamento: {fmtNum(BASE.auc, 6)}</p></div>
                <div className="vz-tile"><p className="eyebrow">PD média prevista</p><p className="vz-num">{fmtPct(m.pdMedia, 2)}</p><p className="hint">observado: {fmtPct(OBS, 2)}</p></div>
              </div>
              <label className="vz-slider"><span className="vz-slider-rotulo"><span>Deslocamento em log odds aplicado a todas as PDs</span><span className="vz-slider-valor">{delta >= 0 ? "+" : ""}{fmtNum(delta, 2)}</span></span><input type="range" min={-1.5} max={1.5} step={0.05} value={delta} onChange={(e) => setDelta(Number(e.target.value))} /></label>
              <p className="hint">Brier = média de (p − y)²; log loss = média de −[y ln p + (1 − y) ln(1 − p)]. O deslocamento não reordena ninguém: toda variação vem do nível.</p>
            </div>
            <div className="vz-bri-painel">
              <p className="vz-grafico-t">O que cada medida contém</p>
              <div className="table-wrap"><table className="table text-[.85em]"><thead><tr><th>Medida</th><th>Sensível ao nível</th><th>Sensível à separação</th><th>Pune confiança errada</th></tr></thead><tbody>{LINHAS.map((l) => <tr key={l[0]}><th scope="row">{l[0]}</th><td>{l[1]}</td><td>{l[2]}</td><td>{l[3]}</td></tr>)}</tbody></table></div>
              <p className="hint">A última linha é a única que responde isoladamente à pergunta do nível: por isso a curva por faixa é obrigatória, e Brier e log loss servem para comparação fina entre candidatos.</p>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="vz-estado">{escolha === "recalibrar" ? <><b>Recalibrar: o que muda é o nível.</b> Um deslocamento de {fmtNum(deltaRecal, 3)} em log odds leva a PD média de {fmtPct(BASE.pdMedia, 2)} para {fmtPct(recal.pdMedia, 2)}, igual ao observado, e a AUC continua {fmtNum(recal.auc, 4)}. Use quando a ordenação permanece útil e a prevalência mudou.</> : <><b>Reestimar: o que muda é a relação.</b> Coeficientes novos, ordenação nova, validação obrigatória. Use quando a relação entre entradas e desfecho deteriorou, não quando só o nível mudou.</>}</div>
          <div className="vz-bri-grade">
            <div className="vz-grafico">
              <div className="vz-tiles">
                {escolha === "recalibrar" ? <>
                  <div className="vz-tile"><p className="eyebrow">PD média</p><p className="vz-num">{fmtPct(BASE.pdMedia, 2)} → {fmtPct(recal.pdMedia, 2)}</p><p className="hint">observado fora do tempo {fmtPct(OBS, 2)}</p></div>
                  <div className="vz-tile"><p className="eyebrow">AUC</p><p className="vz-num">{fmtNum(BASE.auc, 4)} → {fmtNum(recal.auc, 4)}</p><p className="hint">a fila não muda</p></div>
                  <div className="vz-tile"><p className="eyebrow">Brier</p><p className="vz-num">{fmtNum(BASE.brier, 5)} → {fmtNum(recal.brier, 5)}</p><p className="hint">o nível melhora, a separação é a mesma</p></div>
                </> : <>
                  <div className="vz-tile"><p className="eyebrow">Coeficientes</p><p className="vz-num vz-num--texto">novos</p><p className="hint">variáveis mudam de peso</p></div>
                  <div className="vz-tile"><p className="eyebrow">Ordenação</p><p className="vz-num vz-num--texto">pode mudar</p><p className="hint">a fila é reaprendida</p></div>
                  <div className="vz-tile"><p className="eyebrow">Validação</p><p className="vz-num vz-num--texto">obrigatória</p><p className="hint">sem o OOT final</p></div>
                </>}
              </div>
            </div>
            <div className="vz-bri-painel">
              <div className="vz-tile"><p className="eyebrow">Regra de governança</p><p className="vz-num vz-num--texto">Qualquer alteração precisa ser estimada sem o OOT final e validada antes de produção. O deslocamento acima usa o observado da janela só para mostrar o mecanismo; em produção, o calibrador vem da validação.</p></div>
              <div className="vz-tile"><p className="eyebrow">Como decidir</p><p className="vz-num vz-num--texto">Ordenação intacta e nível fora: recalibrar. Ordenação deteriorada: reestimar. As três leituras do capítulo 9 dizem qual é o caso.</p></div>
            </div>
          </div>
        </>
      )}
      <p className="vz-fonte">Janela fora do tempo, logística: Brier 0,09128, log loss 0,31487, AUC 0,725685, PD média 9,72% contra 10,99% observado, os números da página. Na página 12 do material, o calibrador estimado sem o OOT leva a PD média a 10,92%; aqui o deslocamento iguala ao observado só para mostrar que a AUC não se move.</p>
    </figure>
  );
}
