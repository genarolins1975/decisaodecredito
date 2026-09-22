/** Rótulos das notas do professor, na ordem em que a aula acontece. "aula" é a narração de sala: quando a próxima
    página é complementar, diz qual é a próxima essencial, o que dizer para chegar a ela e o que fica para o estudo. */
export const ROTULOS_GUIA: [string, string][] = [
  ["Função na aula", "funcao"], ["Pré-requisito", "pre"], ["Condução", "conducao"], ["Como ler a tela", "leitura"], ["Pergunta para a turma", "pergunta"],
  ["Resposta esperada", "resposta"], ["Interação disponível", "interacao"], ["Verificação de entendimento", "verificacao"], ["Transição", "transicao"],
  ["Em aula, a próxima essencial", "aula"],
  ["Arquivos", "arquivos"], ["Saída esperada", "saida"], ["Alternativa sem ambiente", "alternativa"], ["Hipótese", "hipotese"],
];

/** Guia do professor: renderizado só para professor/monitor (nunca enviado ao aluno). */
export function TeacherGuide({ guide }: { guide: Record<string, unknown> }) {
  const rows = ROTULOS_GUIA;
  const erros = guide.erros as { alt: string; confusao: string; intervencao: string }[] | undefined;
  return (
    <details className="mt-8 rounded-md border border-gold bg-gold-soft/40 p-4 no-print" aria-label="Notas do professor (privadas)">
      <summary className="cursor-pointer font-serif font-bold text-ink">Notas do professor <span className="badge badge-gold ml-2">privado</span></summary>
      <dl className="kv mt-3 text-[14px]">
        {rows.map(([label, key]) => (typeof guide[key] === "string" && guide[key] ? <div key={key} className="contents"><dt>{label}</dt><dd>{String(guide[key])}</dd></div> : null))}
      </dl>
      {erros && erros.length > 0 && (
        <div className="mt-3">
          <p className="eyebrow mb-1">Erros esperados e intervenção</p>
          <ul className="text-[14px] list-disc pl-5">{erros.map((e, i) => <li key={i} className="mb-1"><b>{e.alt}</b>: {e.confusao} <i>Intervenção:</i> {e.intervencao}</li>)}</ul>
        </div>
      )}
    </details>
  );
}
