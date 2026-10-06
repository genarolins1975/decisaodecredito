import { CRITERIOS, DOCUMENTAL_MAX, REVISAO, TOTAL_MAX, TRABALHO_1, n2, notaQuestao, pts, type Devolutiva } from "@/lib/avaliacoes/trabalho-1";

/** Barra de um critério: pontos sobre o máximo, com a fração legível sem depender da cor; mostra o valor anterior quando a revisão o alterou. */
function BarraCriterio({ nome, descricao, valor, antes, max }: { nome: string; descricao: string; valor: number; antes: number; max: number }) {
  const pct = Math.max(0, Math.min(100, (valor / max) * 100));
  const mudou = Math.abs(valor - antes) > 1e-9;
  return (
    <li className="grid gap-1 sm:grid-cols-[minmax(0,15rem)_1fr_auto] sm:items-center sm:gap-4 py-3 border-b border-rule last:border-b-0">
      <div className="min-w-0">
        <p className="font-semibold text-ink text-[15px]">{nome}</p>
        <p className="hint">{descricao}</p>
      </div>
      <div className="relative h-[10px] rounded-full bg-[#ECEAE3] overflow-hidden" role="img" aria-label={`${nome}: ${pts(valor)} de ${max} pontos${mudou ? `, antes ${pts(antes)}` : ""}`}>
        <div className={`h-full rounded-full ${valor === 0 ? "" : "bg-ink"}`} style={{ width: `${pct}%` }} />
      </div>
      <p className="font-serif text-ink text-[18px] tabular-nums sm:text-right whitespace-nowrap">
        <b className={valor === 0 ? "text-alert" : undefined}>{pts(valor)}</b><span className="text-muted text-[14px]"> / {max}</span>
        {mudou && <span className="block text-[12.5px] font-sans text-muted">antes {pts(antes)}</span>}
      </p>
    </li>
  );
}

export function DevolutivaTrabalho1({ d }: { d: Devolutiva }) {
  const { aluno, entrega, colegas, nota, anterior, intermediaria, acrescimo, credito, anteriores, base, documental, total, regua } = d;
  const r = entrega.revisao;
  const subiu = acrescimo > 0.005;
  const contexto = entrega.modalidade === "grupo"
    ? <>Trabalho em grupo com <b>{colegas.map((c) => c.nome).join(" e ")}</b>. A nota e a justificativa referem-se ao trabalho coletivo.</>
    : <>Trabalho individual. A nota e a justificativa referem-se à entrega recebida.</>;
  const registro = Boolean(entrega.sintese || entrega.paragrafos?.length || entrega.aprimorar?.length || entrega.ressalva);

  return (
    <div className="flex flex-col gap-5">
      <section className="card border-l-[4px]! border-l-gold! grid gap-5 md:grid-cols-[auto_1fr] md:items-center" aria-labelledby="nota-t1">
        <div className="md:pr-6 md:border-r md:border-rule">
          <p className="eyebrow" id="nota-t1">Nota do Trabalho 1</p>
          <p className="font-serif text-ink font-bold leading-none mt-2 tabular-nums"><span className="text-[56px]">{n2(nota)}</span><span className="text-[22px] text-muted"> / 10</span></p>
          <p className="hint mt-2">{subiu ? <>nota de {TRABALHO_1.entrega}: {n2(anterior)} · acréscimo de {n2(acrescimo)} na revisão de {REVISAO.data}</> : <>nota mantida na revisão de {REVISAO.data}</>}</p>
        </div>
        <div className="min-w-0">
          <p className="eyebrow">{aluno.nome}</p>
          <h2 className="text-[22px] mt-1">{entrega.tema}</h2>
          <p className="text-[15px] mt-2">{contexto}</p>
          {entrega.condicional && <p className="mt-3"><span className="badge badge-warn">condicional</span> <span className="text-[14px]">{entrega.condicional}</span></p>}
        </div>
      </section>

      <section className="card" aria-labelledby="revisao">
        <p className="eyebrow">Revisão de {REVISAO.data}</p>
        <h2 id="revisao" className="text-lg mt-1">{subiu ? "O que mudou na sua nota" : "Resultado da revisão"}</h2>
        <p className="mt-3 text-[15.5px] leading-relaxed max-w-[72ch]">{r.abertura}</p>
        <dl className="mt-4 grid gap-2 grid-cols-2 sm:grid-cols-4">
          <div className="card-flat p-3!"><dt className="eyebrow">Nota de {TRABALHO_1.entrega}</dt><dd className="font-serif text-ink text-[22px] font-bold tabular-nums">{n2(anterior)}</dd></div>
          <div className="card-flat p-3!"><dt className="eyebrow">Crédito comprovado</dt><dd className="font-serif text-ink text-[22px] font-bold tabular-nums">{n2(credito)}<span className="text-muted text-[14px] font-normal"> pontos brutos</span></dd></div>
          <div className="card-flat p-3!"><dt className="eyebrow">Acréscimo na nota</dt><dd className="font-serif text-ink text-[22px] font-bold tabular-nums">{subiu ? `+${n2(acrescimo)}` : "0,00"}</dd></div>
          <div className="card-flat p-3! border-l-[3px]! border-l-gold!"><dt className="eyebrow">Nota atual</dt><dd className="font-serif text-ink text-[22px] font-bold tabular-nums">{n2(nota)}</dd></div>
        </dl>
        {intermediaria !== null && entrega.intermediaria && (
          <p className="text-[14.5px] mt-3"><b>Percurso da nota:</b> {n2(anterior)} na avaliação de {TRABALHO_1.entrega}; {n2(intermediaria)} na {entrega.intermediaria.rotulo}; {n2(nota)} na reanálise do mesmo dia, que acrescentou {n2(nota - intermediaria)}.</p>
        )}
        <p className="hint mt-3 max-w-[80ch]">A nota anterior foi mantida como piso. Só entrou crédito sustentado em evidência nova, convertido pela mesma régua da avaliação anterior, com teto 10,00. Não houve rebaixamento nem nova equiparação da turma.{subiu ? " Notas e acréscimo são arredondados separadamente a duas casas; a diferença exibida pode variar 0,01." : ""}</p>
        <p className="text-[14.5px] mt-3"><b>Materiais considerados nesta revisão:</b> {r.materiais}</p>
      </section>

      <section className="card" aria-labelledby="questoes">
        <h2 id="questoes" className="text-lg">Avaliação por questão</h2>
        <p className="hint mt-1">{r.legendaQuestoes} C = concepção; V = verificação; I = interpretação, de 0 a 10. Nota da questão = (25C + 25V + 20I) ÷ 70.</p>
        <div className="table-wrap mt-3"><table className="table text-[14px]">
          <thead><tr><th>Questão</th><th className="text-right!">C</th><th className="text-right!">V</th><th className="text-right!">I</th><th className="text-right!">Nota</th></tr></thead>
          <tbody>{r.questoes.map((q, i) => (
            <tr key={i}><td><b className="text-ink">Q{i + 1}</b> {q.titulo}</td><td className="text-right tabular-nums">{n2(q.c)}</td><td className={`text-right tabular-nums ${q.v === 0 ? "text-alert font-bold" : ""}`}>{n2(q.v)}</td><td className="text-right tabular-nums">{n2(q.i)}</td><td className="text-right tabular-nums"><b className="text-ink">{n2(notaQuestao(q))}</b></td></tr>
          ))}</tbody>
        </table></div>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {r.questoes.map((q, i) => (
            <article key={i} className="panel-soft">
              <p className="eyebrow mb-1">Q{i + 1} · {q.titulo}</p>
              <p className="text-[14.5px] leading-relaxed">{q.texto}</p>
            </article>
          ))}
        </div>
        <article className="panel-soft mt-3">
          <p className="eyebrow mb-1">Processo e apresentação</p>
          <p className="text-[14.5px] leading-relaxed">{r.processo}</p>
        </article>
      </section>

      <section className="card" aria-labelledby="criterios">
        <h2 id="criterios" className="text-lg">Critérios e composição da nota</h2>
        <ul className="list-none p-0 m-0 mt-2">
          {CRITERIOS.map((c) => <BarraCriterio key={c.chave} nome={`${c.nome} (${c.max})`} descricao={c.descricao} valor={entrega.pontos[c.chave]} antes={anteriores[c.chave]} max={c.max} />)}
        </ul>
        <ol className="list-none p-0 m-0 mt-4 grid gap-2 sm:grid-cols-4" aria-label="Composição da nota">
          <li className="card-flat p-3!"><p className="eyebrow">Parte documental</p><p className="font-serif text-ink text-[22px] font-bold tabular-nums">{n2(documental)}<span className="text-muted text-[14px] font-normal"> / {DOCUMENTAL_MAX}</span></p></li>
          <li className="card-flat p-3!"><p className="eyebrow">Total com apresentação</p><p className="font-serif text-ink text-[22px] font-bold tabular-nums">{n2(total)}<span className="text-muted text-[14px] font-normal"> / {TOTAL_MAX}</span></p></li>
          <li className="card-flat p-3!"><p className="eyebrow">Nota base</p><p className="font-serif text-ink text-[22px] font-bold tabular-nums">{n2(base)}<span className="text-muted text-[14px] font-normal"> / 10</span></p></li>
          <li className="card-flat p-3! border-l-[3px]! border-l-gold!"><p className="eyebrow">Nota na régua</p><p className="font-serif text-ink text-[22px] font-bold tabular-nums">{n2(nota)}<span className="text-muted text-[14px] font-normal"> / 10</span></p></li>
        </ol>
        <p className="hint mt-3 max-w-[80ch]">A nota base é convertida pela régua da avaliação anterior, que ficou fixa: a menor nota base de então ({n2(regua.menor)}) corresponde a 7 e a maior ({n2(regua.maior)}) a 10, com teto 10. O cálculo usa a precisão integral; os valores exibidos estão arredondados.</p>
      </section>

      {registro && (
        <details className="card-flat">
          <summary className="cursor-pointer font-semibold text-ink">Devolutiva da avaliação de {TRABALHO_1.entrega} (registro)</summary>
          <div className="mt-3 grid gap-3 max-w-[80ch]">
            <p className="hint">Mantida como registro e como orientação de melhoria. Onde a revisão de {REVISAO.data} alterou pontos ou conferiu material novo, prevalece a revisão.</p>
            {entrega.sintese && <p className="text-[15px] leading-relaxed">{entrega.sintese}</p>}
            {entrega.paragrafos?.map((p) => <p key={p.rotulo} className="text-[14.5px] leading-relaxed"><b className="text-ink">{p.rotulo}.</b> {p.texto}</p>)}
            {entrega.ressalva && <p className="text-[14.5px] leading-relaxed"><b className="text-ink">Observação do professor.</b> {entrega.ressalva}</p>}
            {entrega.aprimorar && entrega.aprimorar.length > 0 && <>
              <p className="font-semibold text-ink text-[14.5px] mt-1">O que aprimorar</p>
              <ol className="grid gap-2 list-decimal pl-5 m-0">{entrega.aprimorar.map((t, i) => <li key={i} className="text-[14.5px] leading-relaxed">{t}</li>)}</ol>
            </>}
          </div>
        </details>
      )}

      <details className="card-flat">
        <summary className="cursor-pointer font-semibold text-ink">Como a nota foi calculada e revisada</summary>
        <div className="mt-3 grid gap-3 text-[14.5px] max-w-[80ch]">
          <p>A avaliação considera concepção da decisão e dos indicadores (25 pontos), rastreabilidade e verificação (25), interpretação e limites (20), documentação do processo de IA (15) e apresentação (15). A exigência central é transformar informação verificável em uma decisão de crédito, com alcance e limites explícitos.</p>
          {REVISAO.criterio.map((t, i) => <p key={i}>{t}</p>)}
          <p className="font-mono text-[13.5px] text-ink bg-paper border border-rule rounded px-3 py-2 overflow-x-auto">nota = mínimo entre 10 e 7 + 3 × (nota base − {n2(regua.menor)}) ÷ ({n2(regua.maior)} − {n2(regua.menor)})</p>
          <p>Nos trabalhos em grupo, a nota e os comentários correspondem à entrega coletiva; a avaliação por questão não identifica contribuição individual. O desconto por material faltante se refere ao conjunto recebido e não presume fabricação de dados.</p>
          <p className="hint">Fonte: {TRABALHO_1.fonte}</p>
        </div>
      </details>
    </div>
  );
}
