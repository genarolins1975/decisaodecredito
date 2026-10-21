import { CRITERIOS_T2, MAX_CRITERIO, MAX_T2, REGRAS_T2, TRABALHO_2, n2, p1, type DevolutivaT2, type StatusEntregavel } from "@/lib/avaliacoes/trabalho-2";

const n3 = (x: number) => x.toLocaleString("pt-BR", { minimumFractionDigits: 3, maximumFractionDigits: 3 });

const TOM_ENTREGAVEL: Record<StatusEntregavel, string> = { presente: "badge-ok", parcial: "badge-warn", pendente: "badge-warn", ausente: "badge-alert" };

/** Barra de um critério: pontos sobre 2, com a fração legível sem depender da cor. */
function Barra({ nome, valor }: { nome: string; valor: number }) {
  const pct = Math.max(0, Math.min(100, (valor / MAX_CRITERIO) * 100));
  return (
    <div className="flex items-center gap-3">
      <div className="relative h-[10px] flex-1 rounded-full bg-[#ECEAE3] overflow-hidden" role="img" aria-label={`${nome}: ${p1(valor)} de ${MAX_CRITERIO} pontos`}>
        <div className={`h-full rounded-full ${valor === 0 ? "" : "bg-ink"}`} style={{ width: `${pct}%` }} />
      </div>
      <p className="font-serif text-ink text-[18px] tabular-nums whitespace-nowrap"><b className={valor === 0 ? "text-alert" : undefined}>{p1(valor)}</b><span className="text-muted text-[14px]"> / {MAX_CRITERIO}</span></p>
    </div>
  );
}

export function DevolutivaTrabalho2({ d }: { d: DevolutivaT2 }) {
  const { aluno, entrega, colegas, pontos, bruta, nota, regua } = d;
  const contexto = entrega.modalidade === "grupo"
    ? <>Trabalho em grupo com <b>{colegas.map((c) => c.nome).join(" e ")}</b>. A nota e a justificativa referem-se ao trabalho coletivo.</>
    : <>Trabalho individual. A nota e a justificativa referem-se à entrega recebida.</>;
  const blocos = (["Modelo", "Blueprint"] as const).map((b) => ({ bloco: b, criterios: CRITERIOS_T2.filter((c) => c.bloco === b) }));

  return (
    <div className="flex flex-col gap-5">
      <section className="card border-l-[4px]! border-l-gold! grid gap-5 md:grid-cols-[auto_1fr] md:items-center" aria-labelledby="nota-t2">
        <div className="md:pr-6 md:border-r md:border-rule">
          <p className="eyebrow" id="nota-t2">Nota do Trabalho 2</p>
          <p className="font-serif text-ink font-bold leading-none mt-2 tabular-nums"><span className="text-[56px]">{n2(nota)}</span><span className="text-[22px] text-muted"> / 10</span></p>
          <p className="hint mt-2">{p1(pontos)} de {MAX_T2} pontos na rubrica · nota bruta {n2(bruta)} · reescalada em {TRABALHO_2.reescala}</p>
        </div>
        <div className="min-w-0">
          <p className="eyebrow">{aluno.nome}</p>
          <h2 className="text-[22px] mt-1">{entrega.titulo}</h2>
          <p className="text-[15px] mt-2">{contexto}</p>
          {entrega.observacao && <p className="callout callout-warn text-[14.5px] mt-3">{entrega.observacao}</p>}
        </div>
      </section>

      <section className="card" aria-labelledby="calculo">
        <h2 id="calculo" className="text-lg">Como a nota foi calculada</h2>
        <ol className="list-none p-0 m-0 mt-3 grid gap-2 sm:grid-cols-3" aria-label="Composição da nota">
          <li className="card-flat p-3!"><p className="eyebrow">1 · Pontos na rubrica</p><p className="font-serif text-ink text-[22px] font-bold tabular-nums">{p1(pontos)}<span className="text-muted text-[14px] font-normal"> / {MAX_T2}</span></p><p className="hint">oito critérios de 0 a 2</p></li>
          <li className="card-flat p-3!"><p className="eyebrow">2 · Nota bruta</p><p className="font-serif text-ink text-[22px] font-bold tabular-nums">{n2(bruta)}<span className="text-muted text-[14px] font-normal"> / 10</span></p><p className="hint">pontos ÷ 16 × 10</p></li>
          <li className="card-flat p-3! border-l-[3px]! border-l-gold!"><p className="eyebrow">3 · Nota reescalada</p><p className="font-serif text-ink text-[22px] font-bold tabular-nums">{n2(nota)}<span className="text-muted text-[14px] font-normal"> / 10</span></p><p className="hint">régua de {TRABALHO_2.reescala}</p></li>
        </ol>
        <p className="font-mono text-[13.5px] text-ink bg-paper border border-rule rounded px-3 py-2 mt-4 overflow-x-auto">nota = 7 + 3 × (nota bruta − {n3(regua.menor)}) ÷ ({n3(regua.maior)} − {n3(regua.menor)})</p>
        <p className="text-[14.5px] mt-3 max-w-[80ch]">A menor nota bruta da turma ({n3(regua.menor)}, ou {p1(regua.menorPontos)} pontos) corresponde a 7 e a maior ({n3(regua.maior)}, ou {p1(regua.maiorPontos)} pontos) a 10. A reescala é uma reta: preserva a ordem entre as entregas e a proporção das distâncias, e cada ponto da rubrica vale {n3(regua.porPonto)} na nota. Nenhuma nota fica abaixo da nota bruta.</p>
        <p className="hint mt-2 max-w-[80ch]">O cálculo usa a precisão integral; os valores exibidos estão arredondados a duas casas, com metade para cima.</p>
      </section>

      <section className="card" aria-labelledby="criterios-t2">
        <h2 id="criterios-t2" className="text-lg">Avaliação por critério</h2>
        <p className="hint mt-1">0 não demonstrou · 1 parcial · 2 completo e sustentado por evidência.</p>
        {blocos.map(({ bloco, criterios }) => (
          <div key={bloco} className="mt-4">
            <p className="eyebrow">Componente {bloco === "Modelo" ? "1 · modelo" : "2 · blueprint"} · {p1(criterios.reduce((s, c) => s + entrega.criterios[c.chave].pontos, 0))} de {criterios.length * MAX_CRITERIO}</p>
            <ul className="list-none p-0 m-0 mt-1">
              {criterios.map((c) => {
                const a = entrega.criterios[c.chave];
                return (
                  <li key={c.chave} className="py-4 border-b border-rule last:border-b-0">
                    <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_14rem] sm:items-center sm:gap-6">
                      <div className="min-w-0"><p className="font-semibold text-ink text-[15px]">{c.numero}. {c.nome}</p><p className="hint">{c.pergunta}</p></div>
                      <Barra nome={c.nome} valor={a.pontos} />
                    </div>
                    <div className="grid gap-3 md:grid-cols-2 mt-3">
                      <article className="panel-soft"><p className="eyebrow mb-1">Evidência considerada</p><p className="text-[14.5px] leading-relaxed">{a.evidencia}</p></article>
                      <article className="panel-soft"><p className="eyebrow mb-1">O que faltou</p><p className="text-[14.5px] leading-relaxed">{a.lacunas || "Nenhuma lacuna relevante para o critério."}</p></article>
                    </div>
                    {a.ajuste && <p className="text-[14px] mt-2 max-w-[90ch]"><b className="text-ink">Ajuste aplicado.</b> {a.ajuste}</p>}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </section>

      <section className="card" aria-labelledby="entregaveis">
        <h2 id="entregaveis" className="text-lg">Entregáveis recebidos</h2>
        <ul className="list-none p-0 m-0 mt-2">
          {entrega.entregaveis.map((x) => (
            <li key={x.chave} className="grid gap-1 sm:grid-cols-[16rem_1fr] sm:gap-4 py-3 border-b border-rule last:border-b-0">
              <p className="flex items-center gap-2 flex-wrap"><span className="font-semibold text-ink text-[14.5px]">{x.nome}</span><span className={`badge ${TOM_ENTREGAVEL[x.status]}`}>{x.status}</span></p>
              <p className="text-[14px] leading-relaxed break-words">{x.texto || "Não recebido."}</p>
            </li>
          ))}
        </ul>
      </section>

      {entrega.missoes.length > 0 && (
        <details className="card">
          <summary className="cursor-pointer font-semibold text-ink">Missões e etapas do blueprint ({entrega.missoes.filter((m) => m.status === "cumprida").length} de {entrega.missoes.length} cumpridas)</summary>
          <div className="table-wrap mt-3"><table className="table text-[14px]">
            <thead><tr><th>Etapa</th><th>Situação</th><th>Leitura</th></tr></thead>
            <tbody>{entrega.missoes.map((m) => (
              <tr key={m.id}><td className="whitespace-nowrap"><b className="text-ink">{m.id.startsWith("M") ? `Missão ${m.id.slice(1)}` : `Etapa ${m.id.slice(1)}`}</b></td><td><span className={`badge ${m.status === "cumprida" ? "badge-ok" : "badge-warn"}`}>{m.status}</span></td><td className="leading-relaxed">{m.texto}</td></tr>
            ))}</tbody>
          </table></div>
        </details>
      )}

      <section className="grid gap-3 md:grid-cols-2" aria-label="Pontos fortes e o que aprimorar">
        <article className="card"><h2 className="text-lg">Pontos fortes</h2><ul className="mt-2 grid gap-2 pl-5 m-0 list-disc">{entrega.fortes.map((t, i) => <li key={i} className="text-[14.5px] leading-relaxed">{t}</li>)}</ul></article>
        <article className="card"><h2 className="text-lg">O que aprimorar</h2><ul className="mt-2 grid gap-2 pl-5 m-0 list-disc">{entrega.fracos.map((t, i) => <li key={i} className="text-[14.5px] leading-relaxed">{t}</li>)}</ul></article>
      </section>

      {entrega.verificacoes.length > 0 && (
        <details className="card-flat">
          <summary className="cursor-pointer font-semibold text-ink">O que foi conferido de forma independente ({entrega.verificacoes.length})</summary>
          <ul className="mt-3 grid gap-2 pl-5 m-0 list-disc max-w-[90ch]">{entrega.verificacoes.map((t, i) => <li key={i} className="text-[14px] leading-relaxed break-words">{t}</li>)}</ul>
        </details>
      )}

      <details className="card-flat">
        <summary className="cursor-pointer font-semibold text-ink">Regras da avaliação</summary>
        <div className="mt-3 grid gap-3 text-[14.5px] max-w-[80ch]">
          <p>{REGRAS_T2.rubrica}</p>
          <p>{REGRAS_T2.modelo}</p>
          <p>{REGRAS_T2.defesa}</p>
          <p>{REGRAS_T2.reescala}</p>
          <p>{REGRAS_T2.limites}</p>
          <p>{REGRAS_T2.grupo}</p>
          <p className="hint">Fonte: {TRABALHO_2.fonte}</p>
        </div>
      </details>
    </div>
  );
}
