"use client";
import { useState } from "react";

/**
 * Avaliação final: quatro perguntas simples (capítulo 11, c11p18). Quatro critérios de 0 a 2, total em 8, com a
 * pergunta individual no fim. Tudo visível, sem abas, para ser usado na banca.
 */
const PERGUNTAS = [
  { t: "Problema e dados", p: "A pergunta está clara e os dados usados existiam na data da decisão?" },
  { t: "Modelo e testes", p: "O grupo comparou os modelos corretamente e preservou o teste OOT?" },
  { t: "Governança, na prática", p: "O grupo explicou quando usar o modelo, como acompanhá-lo e quem age se algo sair do esperado?" },
  { t: "Reprodução e defesa", p: "Outra pessoa consegue executar o projeto e o aluno explica as decisões que tomou?" },
];
const NIVEIS = ["não demonstrou", "parcial", "completo e sustentado por evidência"];

export function QuatroPerguntas() {
  const [notas, setNotas] = useState<(number | null)[]>([null, null, null, null]);
  const total = notas.reduce<number>((s, n) => s + (n ?? 0), 0); const avaliados = notas.filter((n) => n !== null).length;
  return (
    <figure className="vz" data-vz="quatro-perguntas">
      <header className="vz-cab">
        <div>
          <p className="eyebrow">Avaliação final · quatro perguntas, 0, 1 ou 2 em cada · a pontuação resume a evidência apresentada</p>
          <p className="vz-tit">Quatro perguntas simples. Cada ponto exige evidência que outra pessoa consiga conferir.</p>
        </div>
        <div className="vz-acoes"><button type="button" className="btn btn-sm btn-secondary" onClick={() => setNotas([null, null, null, null])}>Limpar</button></div>
      </header>
      <div className="vz-estado"><b>Pontuação {total} de 8.</b> {avaliados} de 4 critérios avaliados.{avaliados === 4 && <> {total >= 7 ? "Trabalho sustentado por evidência nos quatro critérios." : total >= 4 ? "Há critérios parciais: a defesa precisa nomear a evidência que falta." : "A evidência não sustenta a decisão apresentada."}</>}</div>
      <ol className="vz-qp-grade">
        {PERGUNTAS.map((q, i) => <li key={q.t} className="vz-qp-cartao">
          <span className="eyebrow">{i + 1} · {q.t}</span>
          <p className="vz-qp-perg">{q.p}</p>
          <div className="vz-seg" role="group" aria-label={`Nota para ${q.t}`}>{[0, 1, 2].map((n) => <button key={n} type="button" className={`vz-seg-b ${notas[i] === n ? "vz-seg-b--on" : ""}`} aria-pressed={notas[i] === n} onClick={() => setNotas(notas.map((x, k) => (k === i ? n : x)))}>{n}</button>)}</div>
          <span className="hint">{notas[i] === null ? "0 não demonstrou · 1 parcial · 2 completo" : NIVEIS[notas[i]!]}</span>
        </li>)}
      </ol>
      <div className="vz-quad-rec"><b>Pergunta individual:</b> mostre uma decisão que foi sua, a evidência que a sustentou e uma resposta da IA que você recusou ou corrigiu.</div>
    </figure>
  );
}
