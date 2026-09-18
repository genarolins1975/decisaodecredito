"use client";
import { useState } from "react";
import mod from "@/lib/visuais/oot-modelos.json";
import { fmtNum, fmtPct } from "@/lib/visuais/metricas";

/** Treino, validação e OOT têm papéis diferentes (capítulo 7, c7p16): as três amostras lado a lado, logística contra boosting. */
const R = mod.res;
const AMOSTRAS = [
  { rot: "Treino", papel: "aprende parâmetros", log: R.logit_treino, gbm: R.gbm_treino, leitura: "O boosting muito acima no treino é um alarme de flexibilidade, não um resultado." },
  { rot: "Validação", papel: "compara e escolhe", log: R.logit_val, gbm: R.gbm_val, leitura: "Aqui acontece a comparação e a escolha de hiperparâmetros. É a única amostra que pode decidir." },
  { rot: "OOT", papel: "mede uma vez", log: R.logit_oot, gbm: R.gbm_raw_oot, leitura: "O teste temporal mede o pacote já congelado; não serve para voltar e escolher." },
];
export function TresAmostras() {
  const [i, setI] = useState(0);
  const max = 0.85;
  return (
    <figure className="vz" data-vz="tres-amostras">
      <header className="vz-cab">
        <div>
          <p className="eyebrow">Treino, validação e OOT · AUC da logística e do boosting em cada amostra · o gerador da aula</p>
          <p className="vz-tit">Cada amostra cumpre um papel. O número maior pode ser justamente o mais suspeito.</p>
        </div>
      </header>
      <div className="vz-estado"><b>{AMOSTRAS[i].rot}, {AMOSTRAS[i].papel}:</b> AUC logística {fmtNum(AMOSTRAS[i].log.auc, 4)} contra boosting {fmtNum(AMOSTRAS[i].gbm.auc, 4)}; prevalência observada {fmtPct(AMOSTRAS[i].log.obs, 2)}. {AMOSTRAS[i].leitura}</div>
      <div className="vz-amo-grade">
        {AMOSTRAS.map((a, k) => <button key={a.rot} type="button" className={`vz-amo-cartao ${i === k ? "vz-amo-cartao--on" : ""}`} onClick={() => setI(k)} aria-pressed={i === k}>
          <span className="eyebrow">{a.rot} · {a.papel}</span>
          <span className="vz-amo-barras">
            <span className="vz-amo-linha"><span className="vz-amo-rot">logística</span><span className="vz-amo-trilho"><span className="vz-amo-fill vz-amo-fill--log" style={{ width: `${((a.log.auc - 0.5) / (max - 0.5)) * 100}%` }} /></span><b>{fmtNum(a.log.auc, 4)}</b></span>
            <span className="vz-amo-linha"><span className="vz-amo-rot">boosting</span><span className="vz-amo-trilho"><span className={`vz-amo-fill ${a.gbm.auc - a.log.auc > 0.05 ? "vz-amo-fill--alarme" : "vz-amo-fill--gbm"}`} style={{ width: `${((a.gbm.auc - 0.5) / (max - 0.5)) * 100}%` }} /></span><b>{fmtNum(a.gbm.auc, 4)}</b></span>
          </span>
          <span className="hint">prevalência {fmtPct(a.log.obs, 2)} · KS {fmtNum(a.log.ks, 3)} e {fmtNum(a.gbm.ks, 3)}</span>
        </button>)}
      </div>
      <p className="vz-fonte">Barras de 0,5 a 0,85. Treino: 0,6968 contra 0,8196; validação: 0,6408 contra 0,6476; fora do tempo: 0,7257 contra 0,6958, os números do gerador.</p>
    </figure>
  );
}

/** Cada decisão pede uma evidência diferente (capítulo 7, c7p18). */
const DECISOES = [
  { rot: "Escolher modelo", evid: "validação e comparação pareada", nao: "OOT usado repetidamente", custo: "escolher pelo teste faz o teste deixar de representar o futuro" },
  { rot: "Aprovar proposta", evid: "PD calibrada, valor esperado e política", nao: "AUC isolada", custo: "ordenação não diz quanto vale aprovar esta proposta" },
  { rot: "Colocar em produção", evid: "teste OOT, robustez e limites de uso", nao: "métrica de treino", custo: "o treino mede o que o modelo decorou" },
  { rot: "Manter em produção", evid: "entrada, desempenho maduro e gatilhos", nao: "PSI sozinho", custo: "o índice só olha a entrada; nível e relação exigem rótulo" },
];
export function DecisaoEvidencia() {
  const [i, setI] = useState(0);
  return (
    <figure className="vz" data-vz="decisao-evidencia">
      <header className="vz-cab">
        <div>
          <p className="eyebrow">Cada decisão pede uma evidência diferente · quatro decisões, quatro evidências, quatro atalhos que não bastam</p>
          <p className="vz-tit">Uma pergunta define qual evidência é pertinente. A evidência muda porque a pergunta e o custo do erro mudam.</p>
        </div>
      </header>
      <ol className="vz-quad-grade">
        {DECISOES.map((d, k) => <li key={d.rot} className={`vz-quad-cartao ${i === k ? "vz-quad-cartao--on" : ""}`}><button type="button" onClick={() => setI(k)} aria-pressed={i === k}>
          <span className="eyebrow">decisão</span>
          <b className="vz-quad-rot">{d.rot}</b>
          <span className="vz-quad-perg"><small className="eyebrow">evidência adequada</small><br />{d.evid}</span>
          <span className="vz-dec-nao"><b>Não basta:</b> {d.nao}</span>
          {i === k && <span className="vz-quad-leitura">{d.custo}.</span>}
        </button></li>)}
      </ol>
      <p className="vz-fonte">Escolher modelo, aprovar proposta, colocar em produção e manter em produção: a mesma carteira, quatro perguntas, e a métrica que serve para uma não serve para a outra.</p>
    </figure>
  );
}
