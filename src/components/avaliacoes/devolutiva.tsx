import { CRITERIOS, DOCUMENTAL_MAX, TOTAL_MAX, TRABALHO_1, n2, pts, type Devolutiva } from "@/lib/avaliacoes/trabalho-1";

/** Barra de um critério: pontos sobre o máximo, com a fração legível sem depender da cor. */
function BarraCriterio({ nome, descricao, valor, max }: { nome: string; descricao: string; valor: number; max: number }) {
  const pct = Math.max(0, Math.min(100, (valor / max) * 100));
  return (
    <li className="grid gap-1 sm:grid-cols-[minmax(0,15rem)_1fr_auto] sm:items-center sm:gap-4 py-3 border-b border-rule last:border-b-0">
      <div className="min-w-0">
        <p className="font-semibold text-ink text-[15px]">{nome}</p>
        <p className="hint">{descricao}</p>
      </div>
      <div className="h-[10px] rounded-full bg-[#ECEAE3] overflow-hidden" role="img" aria-label={`${nome}: ${pts(valor)} de ${max} pontos`}>
        <div className={`h-full rounded-full ${valor === 0 ? "" : "bg-ink"}`} style={{ width: `${pct}%` }} />
      </div>
      <p className="font-serif text-ink text-[18px] tabular-nums sm:text-right whitespace-nowrap">
        <b className={valor === 0 ? "text-alert" : undefined}>{pts(valor)}</b><span className="text-muted text-[14px]"> / {max}</span>
      </p>
    </li>
  );
}

export function DevolutivaTrabalho1({ d }: { d: Devolutiva }) {
  const { aluno, entrega, colegas, nota, base, documental, total, regua } = d;
  const contexto = entrega.modalidade === "grupo"
    ? <>Trabalho em grupo com <b>{colegas.map((c) => c.nome).join(" e ")}</b>. A nota e a justificativa referem-se ao trabalho coletivo.</>
    : <>Trabalho individual. A nota e a justificativa referem-se à entrega recebida.</>;

  return (
    <div className="flex flex-col gap-5">
      <section className="card border-l-[4px]! border-l-gold! grid gap-5 md:grid-cols-[auto_1fr] md:items-center" aria-labelledby="nota-t1">
        <div className="md:pr-6 md:border-r md:border-rule">
          <p className="eyebrow" id="nota-t1">Nota do Trabalho 1</p>
          <p className="font-serif text-ink font-bold leading-none mt-2 tabular-nums"><span className="text-[56px]">{n2(nota)}</span><span className="text-[22px] text-muted"> / 10</span></p>
          <p className="hint mt-2">nota base {n2(base)} · equiparada pela régua comum</p>
        </div>
        <div className="min-w-0">
          <p className="eyebrow">{aluno.nome}</p>
          <h2 className="text-[22px] mt-1">{entrega.tema}</h2>
          <p className="text-[15px] mt-2">{contexto}</p>
          {entrega.condicional && <p className="mt-3"><span className="badge badge-warn">condicional</span> <span className="text-[14px]">{entrega.condicional}</span></p>}
        </div>
      </section>

      <section className="card" aria-labelledby="porque">
        <h2 id="porque" className="text-lg">Por que recebeu esta nota</h2>
        <p className="mt-3 text-[15.5px] leading-relaxed max-w-[72ch]">{entrega.sintese}</p>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {entrega.paragrafos.map((p) => (
            <article key={p.rotulo} className="panel-soft">
              <p className="eyebrow mb-1">{p.rotulo}</p>
              <p className="text-[14.5px] leading-relaxed">{p.texto}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="card" aria-labelledby="criterios">
        <h2 id="criterios" className="text-lg">Critérios e composição da nota</h2>
        <ul className="list-none p-0 m-0 mt-2">
          {CRITERIOS.map((c) => <BarraCriterio key={c.chave} nome={`${c.nome} (${c.max})`} descricao={c.descricao} valor={entrega.pontos[c.chave]} max={c.max} />)}
        </ul>
        <ol className="list-none p-0 m-0 mt-4 grid gap-2 sm:grid-cols-4" aria-label="Composição da nota">
          <li className="card-flat p-3!"><p className="eyebrow">Parte documental</p><p className="font-serif text-ink text-[22px] font-bold tabular-nums">{n2(documental)}<span className="text-muted text-[14px] font-normal"> / {DOCUMENTAL_MAX}</span></p></li>
          <li className="card-flat p-3!"><p className="eyebrow">Total com apresentação</p><p className="font-serif text-ink text-[22px] font-bold tabular-nums">{n2(total)}<span className="text-muted text-[14px] font-normal"> / {TOTAL_MAX}</span></p></li>
          <li className="card-flat p-3!"><p className="eyebrow">Nota base</p><p className="font-serif text-ink text-[22px] font-bold tabular-nums">{n2(base)}<span className="text-muted text-[14px] font-normal"> / 10</span></p></li>
          <li className="card-flat p-3! border-l-[3px]! border-l-gold!"><p className="eyebrow">Nota equiparada</p><p className="font-serif text-ink text-[22px] font-bold tabular-nums">{n2(nota)}<span className="text-muted text-[14px] font-normal"> / 10</span></p></li>
        </ol>
        <p className="hint mt-3 max-w-[80ch]">A nota base foi convertida pela mesma régua aplicada a todas as entregas: a menor nota base da turma ({n2(regua.menor)}) passa a 7 e a maior ({n2(regua.maior)}) a 10, com distribuição proporcional das demais. O cálculo usa a precisão integral; os valores exibidos estão arredondados. Os pontos por critério permanecem como avaliados.</p>
      </section>

      <section className="card" aria-labelledby="aprimorar">
        <h2 id="aprimorar" className="text-lg">O que aprimorar</h2>
        <ol className="mt-3 grid gap-3 list-none p-0 m-0">
          {entrega.aprimorar.map((t, i) => (
            <li key={i} className="flex gap-3 items-start"><span className="font-serif text-gold font-bold text-[20px] leading-none mt-[2px] tabular-nums" aria-hidden="true">{i + 1}</span><p className="text-[15px] leading-relaxed max-w-[76ch]">{t}</p></li>
          ))}
        </ol>
      </section>

      {entrega.ressalva && (
        <div className="callout"><p className="font-bold text-ink text-[14px] mb-1">Observação do professor</p><p className="text-[14.5px]">{entrega.ressalva}</p></div>
      )}

      <details className="card-flat">
        <summary className="cursor-pointer font-semibold text-ink">Como a nota foi calculada</summary>
        <div className="mt-3 grid gap-3 text-[14.5px] max-w-[80ch]">
          <p>A avaliação considerou concepção da decisão e dos indicadores (25 pontos), rastreabilidade e verificação (25), interpretação e limites (20), documentação do processo de IA (15) e apresentação (15). A exigência central foi transformar informação verificável em uma decisão de crédito, com alcance e limites explícitos.</p>
          <p>Os pontos documentais somados aos da apresentação, divididos por 10, formam a nota base. Em seguida, uma equiparação linear comum leva a menor nota base a 7 e a maior a 10, preservando a ordem e as distâncias relativas entre as notas:</p>
          <p className="font-mono text-[13.5px] text-ink bg-paper border border-rule rounded px-3 py-2 overflow-x-auto">nota equiparada = 7 + 3 × (nota base − menor nota base) ÷ (maior nota base − menor nota base)</p>
          <p>A equiparação é posterior à avaliação dos critérios: não altera os pontos documentais nem elimina as recomendações de melhoria. A nota 10,00 identifica o extremo superior da régua e pode coexistir com lacunas técnicas, que continuam descritas.</p>
          <p>Nos trabalhos em grupo, a nota e os comentários correspondem à entrega coletiva; não houve avaliação separada da contribuição individual. Quando faltou um elo essencial da origem ou do cálculo de um número, aplicou-se a trava de verificação prevista na atividade. O desconto por material faltante se refere ao conjunto recebido e não presume fabricação de dados.</p>
          <p className="hint">Fonte: {TRABALHO_1.fonte} Entrega e defesa em {TRABALHO_1.entrega}.</p>
        </div>
      </details>
    </div>
  );
}
