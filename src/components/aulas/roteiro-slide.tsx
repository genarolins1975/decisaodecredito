import type { RoteiroSlideAula2 } from "@/lib/content/aula-2";

/** Roteiro de um slide da Aula 2: renderizado só para professor e monitor, nunca enviado ao aluno. */
export function RoteiroSlide({ n, roteiro }: { n: string; roteiro: RoteiroSlideAula2 | undefined }) {
  const notas = roteiro?.notas;
  return (
    <details className="mt-8 rounded-md border border-gold bg-gold-soft/40 p-4 no-print" aria-label="Roteiro do professor (privado)" data-testid="roteiro-professor">
      <summary className="cursor-pointer font-serif font-bold text-ink">Roteiro do professor <span className="badge badge-gold ml-2">privado</span></summary>
      {!notas ? <p className="hint mt-2">Sem notas compiladas para o slide {n}. Gere content/slides/aula-2-notas.json com node aula_credito_html/build.mjs.</p> : (
        <div className="grid gap-4 md:grid-cols-2 mt-3 text-[14px]">
          <div>
            {notas.conducao.length > 0 && <><p className="eyebrow">Condução</p><ul className="list-disc pl-5 m-0 grid gap-1">{notas.conducao.map((t, i) => <li key={i}>{t}</li>)}</ul></>}
            {roteiro?.conclusao && <p className="mt-3"><b>Mensagem que fecha o slide:</b> {roteiro.conclusao}</p>}
            {notas.transicao && <p className="mt-3"><b>Transição{roteiro?.proximo ? ` para o slide ${roteiro.proximo.n}` : ""}:</b> {notas.transicao}</p>}
          </div>
          <div>
            {notas.respostas.length > 0 && (
              <details className="callout">
                <summary className="font-semibold text-ink cursor-pointer min-h-[32px] flex items-center">Respostas esperadas (abra quando quiser)</summary>
                <ul className="list-disc pl-5 mt-2 mb-0 grid gap-1">{notas.respostas.map((t, i) => <li key={i}>{t}</li>)}</ul>
              </details>
            )}
            {notas.cuidados.length > 0 && <><p className="eyebrow mt-3">Cuidados e limites</p><ul className="list-disc pl-5 m-0 grid gap-1">{notas.cuidados.map((t, i) => <li key={i}>{t}</li>)}</ul></>}
            {notas.aprofundar.length > 0 && <><p className="eyebrow mt-3">Aprofundar</p><ul className="list-disc pl-5 m-0 grid gap-1">{notas.aprofundar.map((t, i) => <li key={i}>{t}</li>)}</ul></>}
          </div>
        </div>
      )}
    </details>
  );
}
