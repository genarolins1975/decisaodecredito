"use client";
import { useState } from "react";

/**
 * O quadro de decisão do comitê (capítulo 10, c10p3). Quatro perguntas, cada uma com número, responsável e
 * consequência; nenhuma métrica sozinha decide. Tudo visível de uma vez, com a pergunta em foco ampliada.
 */
const QUADRO = [
  { rot: "Ordenação", pergunta: "Quem deve ficar acima na fila de risco?", log: "AUC 0,7257", gbm: "AUC 0,6958", dono: "modelagem e validação", leitura: "Diferença de 0,0299 com intervalo de 0,0001 a 0,0596: limítrofe, e a recomendação não se apoia nela." },
  { rot: "Calibração", pergunta: "As probabilidades correspondem às frequências?", log: "Brier 0,09128", gbm: "Brier 0,09491", dono: "risco e contabilidade", leitura: "PD média prevista de 9,72% contra 10,99% observado, 81 defaults em 737, intervalo de 8,93% a 13,45%." },
  { rot: "Economia", pergunta: "Qual carteira cria valor sob a política?", log: "R$ 607 mil", gbm: "R$ 339 mil", dono: "negócio e risco", leitura: "Mesma política, corte 12% e capacidade 80, mesma carteira fora do tempo, resultado fechado pela ponte de parcelas." },
  { rot: "Governança", pergunta: "A decisão pode ser explicada e mantida?", log: "motivo exato", gbm: "motivo aproximado", dono: "conformidade e operações", leitura: "A logística dá a contribuição de cada variável por proposta; o boosting dá uma aproximação rastreável, mas não a mesma explicação." },
];

export function QuadroDoComite() {
  const [foco, setFoco] = useState(0);
  return (
    <figure className="vz" data-vz="quadro-do-comite">
      <header className="vz-cab">
        <div>
          <p className="eyebrow">O quadro de decisão do comitê · logística com WoE contra boosting calibrado · janela fora do tempo de 737 propostas</p>
          <p className="vz-tit">Quatro perguntas, quatro números, quatro responsáveis. A escolha não se reduz a uma métrica.</p>
        </div>
      </header>
      <ol className="vz-quad-grade">
        {QUADRO.map((q, i) => <li key={q.rot} className={`vz-quad-cartao ${foco === i ? "vz-quad-cartao--on" : ""}`}><button type="button" onClick={() => setFoco(i)} aria-pressed={foco === i}>
          <span className="eyebrow">pergunta do comitê · {q.dono}</span>
          <b className="vz-quad-rot">{q.rot}</b>
          <span className="vz-quad-perg">{q.pergunta}</span>
          <span className="vz-quad-comp"><span><small>logística + WoE</small><strong>{q.log}</strong></span><span className="vz-quad-vs">×</span><span><small>boosting calibrado</small><strong>{q.gbm}</strong></span></span>
          {foco === i && <span className="vz-quad-leitura">{q.leitura}</span>}
        </button></li>)}
      </ol>
      <div className="vz-quad-rec"><b>Recomendação defensável:</b> manter a logística como principal. A evidência de AUC é limítrofe, e simplicidade, economia e governança reforçam a escolha.</div>
      <p className="vz-fonte">Números do gerador na janela fora do tempo: AUC 0,7257 contra 0,6958; Brier 0,09128 contra 0,09491; resultado esperado com corte 12%, teto 30% e capacidade 80.</p>
    </figure>
  );
}
