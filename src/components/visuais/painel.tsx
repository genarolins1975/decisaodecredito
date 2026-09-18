"use client";
import { useMemo, useSyncExternalStore } from "react";
import { FENOMENOS, INDICADORES, SELECAO_INICIAL, diagnostico, type Fenomeno } from "@/lib/visuais/painel";
import { assinarLab, decodificarPainel, gravarPainel, lerPainel } from "@/lib/visuais/lab-estado";

/**
 * Monte o painel e descubra o que ele não consegue ver (capítulo 9, c9p8). Onze indicadores candidatos, a linha do
 * tempo de quando cada um avisa (hoje ou na safra madura), o diagnóstico de cobertura dos três fenômenos e a
 * seleção guardada neste navegador para o campo 5 do memorando do capítulo 10.
 */
const ORDEM: Fenomeno[] = ["entrada", "nivel", "relacao", "equidade", "processo"];

export function Painel() {
  const bruto = useSyncExternalStore(assinarLab, lerPainel, () => "");
  const ids = useMemo(() => decodificarPainel(bruto) ?? SELECAO_INICIAL, [bruto]);
  const d = diagnostico(ids);
  const alternar = (id: string) => gravarPainel(ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]);
  const cheques: { ok: boolean; bom: string; ruim: string }[] = [
    { ok: d.tem.entrada, bom: "há leitura de deslocamento de entrada, que elimina ou confirma o primeiro fenômeno", ruim: "sem leitura de entrada, qualquer piora de resultado vira hipótese sem teste e a investigação começa pelo mais caro" },
    { ok: d.tem.nivel, bom: "há comparação entre previsto e observado, que detecta mudança de nível", ruim: "sem comparação entre previsto e observado, o modelo pode estimar sistematicamente abaixo do observado por safras seguidas sem que nada acuse" },
    { ok: d.tem.relacao, bom: "há leitura de ordenação, que detecta mudança de relação", ruim: "sem leitura de ordenação, a perda de poder de separar só aparece no resultado realizado, e aí já custou" },
    { ok: d.rapidos > 0, bom: "há pelo menos uma leitura disponível sem esperar o horizonte de doze meses", ruim: "todo o painel espera rótulo maduro: o primeiro aviso chega doze meses depois da decisão que o gerou" },
    { ok: d.tem.equidade, bom: "há leitura de diferença entre grupos, com denominador e intervalo", ruim: "sem leitura de equidade, a instituição perde o único instrumento que transforma a pergunta em número com intervalo" },
  ];
  const veredito = d.ok ? "Os três fenômenos têm leitura, existe indicador rápido e a equidade está coberta. Falta o passo que esta página não faz por você: para cada linha escolhida, escrever limiar, janela, responsável e ação, na ordem da página anterior."
    : d.faltam.length ? `Sem cobertura para: ${d.faltam.map((f) => FENOMENOS[f].toLowerCase()).join(", ")}. Um fenômeno sem leitura não deixa de ocorrer; ele apenas deixa de ser detectado, e a instituição descobre pelo resultado realizado.`
    : `Os três fenômenos estão cobertos, mas falta ${d.rapidos === 0 ? "leitura rápida, sem espera de rótulo" : ""}${d.rapidos === 0 && !d.tem.equidade ? " e " : ""}${!d.tem.equidade ? "leitura de equidade" : ""}.`;
  return (
    <figure className="vz" data-vz="painel">
      <header className="vz-cab">
        <div>
          <p className="eyebrow">Monte o painel · onze indicadores candidatos · a seleção fica neste navegador e vai ao capítulo 10</p>
          <p className="vz-tit">Um painel se avalia pela cobertura dos três fenômenos e pela leitura que não espera rótulo, não pelo número de linhas.</p>
        </div>
        <div className="vz-acoes"><button type="button" className="btn btn-sm btn-secondary" onClick={() => gravarPainel([])}>Limpar</button><button type="button" className="btn btn-sm btn-secondary" onClick={() => gravarPainel(SELECAO_INICIAL)}>Seleção de partida</button></div>
      </header>
      <div className={`vz-estado ${d.ok ? "vz-estado--ok" : d.sel.length ? "vz-estado--alterado" : ""}`}><b>{d.sel.length} de {INDICADORES.length} selecionados, {d.rapidos} sem espera de rótulo.</b> {d.ok ? "Painel com cobertura completa." : d.faltam.length ? `Ainda faltam ${d.faltam.map((f) => FENOMENOS[f].toLowerCase().replace("deslocamento de ", "").replace("mudança de ", "")).join(", ")}.` : veredito}</div>
      <div className="vz-pn-grade">
        <div className="vz-pn-lista">
          {ORDEM.map((f) => <div key={f} className="vz-pn-grupo">
            <p className="eyebrow">{FENOMENOS[f]}</p>
            {INDICADORES.filter((x) => x.fen === f).map((x) => { const on = ids.includes(x.id); return <label key={x.id} className={`vz-memo-item vz-pn-item ${on ? "vz-memo-item--on" : ""}`}><input type="checkbox" checked={on} onChange={() => alternar(x.id)} /><span><b>{x.nome}</b><small>{x.mede} · {x.freq} · {x.resp}</small></span><em className={x.rot ? "vz-pn-rot vz-pn-rot--espera" : "vz-pn-rot"}>{x.rot ? "espera rótulo" : "sem rótulo"}</em></label>; })}
          </div>)}
          <p className="hint">A coluna que espera rótulo separa o que se mede neste mês do que só se mede quando a safra completa doze meses. Um painel inteiramente feito da segunda coluna só avisa depois que a perda já ocorreu.</p>
        </div>
        <div className="vz-pn-lado">
          <div className="vz-grafico">
            <p className="vz-grafico-t">Quando o painel avisa <span className="hint">cada indicador escolhido no mês em que a leitura existe</span></p>
            <svg viewBox="0 0 640 150" role="img" aria-label={`${d.rapidos} indicadores avisam hoje e ${d.sel.length - d.rapidos} só na safra madura`}>
              <line x1={40} x2={600} y1={100} y2={100} className="vz-regua" />
              {[0, 3, 6, 9, 12].map((m) => <g key={m}><line x1={40 + (m / 12) * 560} x2={40 + (m / 12) * 560} y1={96} y2={104} className="vz-regua" /><text x={40 + (m / 12) * 560} y={120} textAnchor="middle" className="vz-tick">{m === 0 ? "hoje" : m === 12 ? "safra madura, 12 meses" : `${m} meses`}</text></g>)}
              <rect x={40} y={20} width={16} height={72} rx={4} className="vz-pn-zona vz-pn-zona--hoje" /><rect x={584} y={20} width={16} height={72} rx={4} className="vz-pn-zona vz-pn-zona--madura" />
              {d.sel.filter((s) => !s.rot).map((s, i) => <g key={s.id} className="vz-pn-chip" style={{ transform: `translate(64px, ${26 + i * 17}px)` }}><rect width={Math.min(250, 8 + s.nome.length * 5.6)} height={14} rx={7} /><text x={8} y={10.5}>{s.nome}</text></g>)}
              {d.sel.filter((s) => s.rot).map((s, i) => <g key={s.id} className="vz-pn-chip vz-pn-chip--espera" style={{ transform: `translate(${576 - Math.min(300, 8 + s.nome.length * 5.6)}px, ${26 + i * 17}px)` }}><rect width={Math.min(300, 8 + s.nome.length * 5.6)} height={14} rx={7} /><text x={8} y={10.5}>{s.nome.length > 52 ? s.nome.slice(0, 50) + "…" : s.nome}</text></g>)}
              {d.sel.length === 0 && <text x={320} y={60} textAnchor="middle" className="vz-tick">nenhum indicador escolhido: um plano vazio é uma decisão, e precisa ser defendida como tal</text>}
              <text x={40} y={14} className="vz-tick vz-tick--forte">{d.rapidos} avisam hoje</text><text x={600} y={14} textAnchor="end" className="vz-tick vz-tick--forte">{d.sel.length - d.rapidos} avisam só na safra madura</text>
            </svg>
          </div>
          <div className="vz-tile"><p className="eyebrow">Diagnóstico do painel que você montou</p>
            <div className="table-wrap"><table className="table text-[.85em] vz-pn-cheques"><tbody>{cheques.map((c) => <tr key={c.bom}><th scope="row" className={c.ok ? "vz-t-ok" : "vz-t-default"}>{c.ok ? "atende" : "falha"}</th><td>{c.ok ? c.bom : c.ruim}</td></tr>)}</tbody></table></div></div>
          <div className={`vz-tile ${d.ok ? "vz-tile--ok" : "vz-tile--alerta"}`}><p className="eyebrow">{d.ok ? "Painel com cobertura completa" : "O que este painel não vê"}</p><p className="vz-num vz-num--texto">{veredito}</p></div>
          {d.grande && <div className="vz-tile"><p className="eyebrow">Sobre o tamanho</p><p className="vz-num vz-num--texto">{d.sel.length} linhas é mais do que um comitê lê por mês. Convenção de trabalho desta aula: cinco a sete linhas no painel de rotina, o resto em relatório trimestral. Um painel que ninguém lê tem a mesma eficácia de um painel que não existe.</p></div>}
          <div className="vz-tile"><p className="eyebrow">Sua seleção, para levar ao capítulo 10</p>
            {d.sel.length ? <div className="table-wrap"><table className="table text-[.85em]"><thead><tr><th>Indicador</th><th>Frequência</th><th>Responsável</th></tr></thead><tbody>{d.sel.map((s) => <tr key={s.id}><th scope="row">{s.nome}</th><td>{s.freq}</td><td>{s.resp}</td></tr>)}</tbody></table></div> : <p className="hint">Nenhum indicador escolhido. Um plano de acompanhamento vazio é uma decisão, e precisa ser defendida como tal.</p>}</div>
        </div>
      </div>
      <p className="vz-fonte">Cobertura exigida: uma leitura de entrada, uma de nível, uma de relação, pelo menos uma sem espera de rótulo e uma de equidade. Seleção de partida: índice de estabilidade, PD prevista contra observada e AUC com intervalo. A seleção fica em lab9.painel neste navegador e o campo 5 do memorando a lê.</p>
    </figure>
  );
}
