"use client";
import { useState } from "react";
import monit from "@/lib/visuais/monitoramento.json";
import ref from "@/lib/visuais/memorando.json";
import { fmtNum } from "@/lib/visuais/metricas";
import { diferencaProporcoes } from "@/lib/visuais/monitoramento";

/**
 * Um gatilho tem limiar, janela, responsável e ação, declarados antes da medição (capítulo 9, c9p7). Sete gatilhos
 * na tela; a medição da janela fora do tempo só aparece depois da leitura do plano, e nenhum dispara.
 */
type Gatilho = { sinal: string; limiar: string; janela: string; resp: string; acao: string; medivel: boolean; valor: string; disparou: boolean; posicao?: number };
const csi = Object.entries(monit.csi as Record<string, number>).sort((a, b) => b[1] - a[1])[0];
const razao = ref.logit.pd_media / ref.logit.obs;
const aucDif = ref.logit.auc - (monit.res as { logit_val: { auc: number } }).logit_val.auc;
const g1 = ref.grupos.G1, g2 = ref.grupos.G2; const dif = diferencaProporcoes(Math.round(g1.taxaAprov * g1.n), g1.n, Math.round(g2.taxaAprov * g2.n), g2.n);
export const GATILHOS: Gatilho[] = [
  { sinal: "Índice de estabilidade do escore", limiar: "acima de 0,10", janela: "duas janelas mensais consecutivas", resp: "monitoramento", acao: "abrir investigação de mix, canal e integração; nenhuma alteração no modelo antes do laudo", medivel: true, valor: fmtNum(monit.psi.valor, 4), disparou: monit.psi.valor > 0.1, posicao: monit.psi.valor / 0.1 },
  { sinal: "Índice por característica, qualquer variável do modelo", limiar: "acima de 0,10", janela: "uma janela mensal", resp: "engenharia de dados", acao: "conferir origem do campo, domínio, unidade e corte de sistema na mesma data", medivel: true, valor: `${fmtNum(csi[1], 4)} (${csi[0].replace(/_/g, " ")})`, disparou: csi[1] > 0.1, posicao: csi[1] / 0.1 },
  { sinal: "Razão entre PD média prevista e default observado", limiar: "fora de 0,80 a 1,25", janela: "safra com rótulo maduro, confirmada em duas safras seguidas", resp: "modelagem", acao: "avaliar recalibração de nível, com o diagnóstico das três leituras anexado à proposta", medivel: true, valor: fmtNum(razao, 4), disparou: razao < 0.8 || razao > 1.25, posicao: razao < 1 ? (1 - razao) / 0.2 : (razao - 1) / 0.25 },
  { sinal: "AUC da safra madura contra a validação", limiar: "queda acima de 0,03 com intervalo da diferença excluindo zero", janela: "safra com rótulo maduro", resp: "validação independente", acao: "abrir revisão completa do modelo, com reestimação e revisão do conjunto de variáveis", medivel: true, valor: `${aucDif >= 0 ? "alta de " : "queda de "}${fmtNum(Math.abs(aucDif), 4)}`, disparou: -aucDif > 0.03, posicao: Math.max(0, -aucDif) / 0.03 },
  { sinal: "Diferença de taxa de aprovação entre grupos declarados", limiar: "intervalo de 95% da diferença excluindo zero e diferença acima de 5 pontos", janela: "acumulado de três janelas", resp: "governança, com conformidade", acao: "levar ao comitê com denominadores, intervalos e desenho de identificação", medivel: true, valor: `${fmtNum(100 * dif.dif, 1)} pp, intervalo ${dif.excluiZero ? "exclui" : "inclui"} zero`, disparou: dif.excluiZero && Math.abs(dif.dif) > 0.05, posicao: Math.abs(dif.dif) / 0.05 },
  { sinal: "Taxa de exceção manual sobre o planejado", limiar: "acima do dobro do plano", janela: "uma janela mensal", resp: "política de crédito", acao: "revisar a faixa de revisão e a capacidade de esteira do capítulo 8", medivel: false, valor: "não instrumentado nesta base", disparou: false },
  { sinal: "Perda dado o default realizada contra a premissa declarada", limiar: "fora de mais ou menos 10 pontos da premissa", janela: "trimestral", resp: "risco", acao: "revisar a premissa econômica que sustenta o corte do capítulo 8", medivel: false, valor: "não instrumentado nesta base", disparou: false },
];

export function Gatilhos() {
  const [medido, setMedido] = useState(false);
  const mediveis = GATILHOS.filter((g) => g.medivel).length, disparados = GATILHOS.filter((g) => g.medivel && g.disparou).length;
  return (
    <figure className="vz" data-vz="gatilhos">
      <header className="vz-cab">
        <div>
          <p className="eyebrow">Plano declarado, antes de qualquer número · sete gatilhos · exemplo sintético</p>
          <p className="vz-tit">Um gatilho tem limiar, janela, responsável e ação, escritos antes da medição. E mesmo assim ele abre investigação, não decide a ação.</p>
        </div>
        <div className="vz-acoes">
          <button type="button" className="btn btn-sm" onClick={() => setMedido(true)} disabled={medido}>Medir a janela desta base</button>
          <button type="button" className="btn btn-sm btn-secondary" onClick={() => setMedido(false)} disabled={!medido}>Esconder a medição</button>
        </div>
      </header>
      <div className={`vz-estado ${medido ? "vz-estado--ok" : ""}`}>{medido ? <><b>{disparados} gatilho{disparados === 1 ? "" : "s"} disparado{disparados === 1 ? "" : "s"} de {mediveis} medidos.</b> Dos {GATILHOS.length} gatilhos declarados, {mediveis} puderam ser medidos nesta base e {GATILHOS.length - mediveis} não estão instrumentados. Gatilho sem instrumento é decisão adiada, não gatilho.</> : <><b>A medição só aparece depois da leitura do plano.</b> A ordem é o conteúdo da página: limiar, janela, responsável e ação primeiro; o número da janela depois.</>}</div>
      <div className="vz-gat-lista">
        {GATILHOS.map((g, i) => <div key={g.sinal} className={`vz-gat ${medido ? (g.medivel ? (g.disparou ? "vz-gat--disparou" : "vz-gat--ok") : "vz-gat--sem") : ""}`}>
          <div className="vz-gat-cab"><span className="vz-gat-n">{i + 1}</span><b className="vz-gat-sinal">{g.sinal}</b><span className="vz-gat-resp">{g.resp}</span></div>
          <div className="vz-gat-campos"><span><i>limiar</i> {g.limiar}</span><span><i>janela</i> {g.janela}</span><span><i>ação</i> {g.acao}</span></div>
          <div className="vz-gat-medida" aria-live="polite">
            {medido ? g.medivel ? <>
              <span className="vz-gat-trilho" role="img" aria-label={`Valor ${g.valor} contra o limiar`}><span className="vz-gat-limiar" /><span className={`vz-gat-fill ${g.disparou ? "vz-gat-fill--disparou" : ""}`} style={{ width: `${Math.min(100, (g.posicao ?? 0) * 66)}%` }} /></span>
              <b>{g.valor}</b><span className={g.disparou ? "vz-t-default" : "vz-t-ok"}>{g.disparou ? "disparou" : "não disparou"}</span>
            </> : <span className="hint">{g.valor} · sem medida: entra no plano com data de implantação e responsável, e não some do relatório</span> : <span className="hint">medição escondida até a leitura do plano</span>}
          </div>
        </div>)}
      </div>
      <div className="vz-tiles vz-tiles--2 vz-gat-tiles">
        <div className="vz-tile"><p className="eyebrow">Os limiares são convenções</p><p className="vz-num vz-num--texto">Propostos para esta aula, calibráveis por carteira, e nenhum deles é exigência normativa. O que não é convenção é a exigência dos quatro campos: um sinal sem responsável não produz ação, e um sinal sem janela transforma flutuação mensal em alarme.</p></div>
        <div className="vz-tile vz-tile--ok"><p className="eyebrow">Gatilho abre investigação, não decide ação</p><p className="vz-num vz-num--texto">A coluna de ação diz o que se faz, e em nenhuma linha ela diz recalibrar de imediato. Recalibrar sem diagnóstico esconde erro de integração dentro do intercepto, e a página anterior mostrou o caso em que a diferença de nível tem intervalo que inclui zero. A ação vem do diagnóstico das três leituras, que o gatilho apenas obriga a iniciar.</p></div>
      </div>
      <p className="vz-fonte">Janela fora do tempo do gerador: índice de estabilidade do escore {fmtNum(monit.psi.valor, 4)} contra limiar 0,10; maior índice por característica {fmtNum(csi[1], 4)} ({csi[0].replace(/_/g, " ")}); razão previsto sobre observado {fmtNum(razao, 4)}, dentro de 0,80 a 1,25; AUC {fmtNum(ref.logit.auc, 4)} na safra madura contra {fmtNum((monit.res as { logit_val: { auc: number } }).logit_val.auc, 4)} na validação; grupos com {fmtNum(100 * dif.dif, 1)} pp e intervalo que inclui zero. A barra de cada gatilho mostra o valor medido em relação ao limiar, marcado no traço.</p>
    </figure>
  );
}
