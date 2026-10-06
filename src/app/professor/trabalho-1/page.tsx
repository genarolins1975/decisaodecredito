import type { Metadata } from "next";
import Link from "next/link";
import { CRITERIOS, DOCUMENTAL_MAX, PENDENCIAS, REVISAO, TRABALHO_1, consolidacao, n2, pts } from "@/lib/avaliacoes/trabalho-1";
import { vinculoTrabalho1 } from "@/lib/services/avaliacoes";
import { PageHeader, Stat, StatusBadge } from "@/components/ui";

export const metadata: Metadata = { title: "Trabalho 1: consolidação" };

const pct = (x: number) => `${Math.round(x * 100)}%`;

/** Faixa de um critério: um ponto por entrega na escala de 0 a 100% do máximo e a média marcada. */
function FaixaCriterio({ nome, max, valores, media }: { nome: string; max: number; valores: { tema: string; valor: number }[]; media: number }) {
  const grupos = new Map<number, { tema: string; valor: number }[]>();
  for (const v of valores) { const k = Math.round((v.valor / max) * 1000) / 10; grupos.set(k, [...(grupos.get(k) ?? []), v]); }
  return (
    <li className="grid gap-1 sm:grid-cols-[9.5rem_1fr_4.5rem] sm:items-center sm:gap-4 py-2.5 border-b border-rule last:border-b-0">
      <p className="font-semibold text-ink text-[14.5px]">{nome} <span className="hint font-normal">({max})</span></p>
      <div className="relative h-8 mx-2" role="img" aria-label={`${nome}: média ${pts(media)} de ${max}. ${valores.map((v) => `${v.tema} ${pts(v.valor)}`).join("; ")}`}>
        <div className="absolute left-0 right-0 top-1/2 h-px bg-rule" />
        {[0, 25, 50, 75, 100].map((t) => <div key={t} className="absolute top-[30%] bottom-[30%] w-px bg-rule" style={{ left: `${t}%` }} />)}
        <div className="absolute top-0 bottom-0 w-[3px] -ml-[1.5px] rounded bg-gold" style={{ left: `${(media / max) * 100}%` }} title={`média ${pts(media)} de ${max}`} />
        {[...grupos.entries()].map(([k, g]) => (
          <div key={k} className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 flex items-center justify-center rounded-full bg-ink text-white text-[10.5px] font-bold ring-2 ring-white tabular-nums"
            style={{ left: `${k}%`, width: g.length > 1 ? 20 : 12, height: g.length > 1 ? 20 : 12 }} title={g.map((v) => `${v.tema}: ${pts(v.valor)} de ${max}`).join("\n")}>
            {g.length > 1 ? g.length : ""}
          </div>
        ))}
      </div>
      <p className="text-[14px] tabular-nums sm:text-right"><b className="text-ink">{pct(media / max)}</b> <span className="hint">média</span></p>
    </li>
  );
}

export default async function Trabalho1Consolidacao() {
  const c = consolidacao();
  const v = await vinculoTrabalho1();
  const crit = Object.fromEntries(c.porCriterio.map((x) => [x.criterio.chave, x]));
  const verif = crit.verificacao; const proc = crit.processo;
  const comVerificacao = c.porEntrega.filter((x) => x.entrega.pontos.verificacao > 0).length;
  const lideresVerificam = c.porEntrega.slice(0, comVerificacao).every((x) => x.entrega.pontos.verificacao > 0);
  const nVinculados = Object.values(v.porAluno).filter((r) => r.status === "vinculado").length;

  return (
    <div>
      <Link href="/professor" className="voltar">Início</Link>
      <PageHeader eyebrow={<>{v.turma ? v.turma.name : "Turma não identificada"} · resultado consolidado</>} title={TRABALHO_1.titulo} lead={<>{c.entregas} entregas e {c.alunos} alunos. Entrega e defesa em {TRABALHO_1.entrega}, checkpoint em {TRABALHO_1.checkpoint}, revisão das complementações em {REVISAO.data}. Cada aluno vê apenas a própria devolutiva, em Trabalhos.</>} />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5 mb-5">
        <Stat label="Média da turma" value={n2(c.mediaAlunos)} hint={`${c.alunos} alunos · mediana ${n2(c.medianaAlunos)} · antes da revisão ${n2(c.mediaAnteriorAlunos)}`} />
        <Stat label={`Revisão de ${REVISAO.data}`} value={<>{c.alunosComAcrescimo} alunos</>} hint={`com acréscimo, em ${c.entregasComAcrescimo} entregas; nenhuma nota reduzida`} tone="ok" />
        <Stat label="Amplitude" value={<>{n2(c.minima)} a {n2(c.maxima)}</>} hint={`régua fixa: bases de ${n2(c.regua.menor)} a ${n2(c.regua.maior)} levadas de 7 a 10, teto 10`} />
        <Stat label="Entregas" value={c.entregas} hint={`${c.grupos} em grupo · ${c.individuais} individuais`} />
        <Stat label="Verificação zerada" value={<>{verif.zeros} de {c.entregas}</>} hint={`${verif.alunosZerados} de ${c.alunos} alunos, pela trava de rastreabilidade`} tone="alert" />
      </div>

      <section className="card mb-5" aria-labelledby="leitura">
        <h2 id="leitura" className="text-lg">Leitura da turma</h2>
        <div className="grid gap-3 md:grid-cols-3 mt-3">
          <article className="panel-soft"><p className="eyebrow mb-1">Evidência</p><p className="text-[14.5px] leading-relaxed">Na média das entregas, concepção ficou em {pct(crit.concepcao.media / 25)} do máximo, interpretação em {pct(crit.interpretacao.media / 20)} e apresentação em {pct(crit.apresentacao.media / 15)}; verificação ficou em {pct(verif.media / 25)} e caderno de processo em {pct(proc.media / 15)}. {verif.zeros} das {c.entregas} entregas tiveram verificação zerada e {proc.zeros} tiveram processo zerado.</p></article>
          <article className="panel-soft"><p className="eyebrow mb-1">Inferência</p><p className="text-[14.5px] leading-relaxed">A turma formula bem a decisão; o que separa as notas é provar o número e documentar o uso da IA. {lideresVerificam ? `As ${comVerificacao} entregas com verificação positiva ocupam as ${comVerificacao} primeiras posições. ` : ""}A revisão de {REVISAO.data} confirma a leitura: o maior acréscimo veio de verificação documentada. A régua da avaliação anterior ficou fixa (bases de {n2(c.regua.menor)} a {n2(c.regua.maior)} para 7 a 10, teto 10); acima do antigo máximo, o teto iguala as entregas em 10,00, e os pontos por critério continuam a ser o retrato da qualidade.</p></article>
          <article className="panel-soft"><p className="eyebrow mb-1">Recomendação</p><p className="text-[14.5px] leading-relaxed">No trabalho final, pedir já no checkpoint um pacote mínimo de reprodução (base original, código e memória de extração de um indicador ponta a ponta) e o caderno de processo em andamento. Antes de levar estas notas ao histórico, resolver as {PENDENCIAS.length} pendências listadas abaixo.</p></article>
        </div>
      </section>

      <section className="card mb-5" aria-labelledby="criterios">
        <div className="flex flex-wrap items-baseline gap-x-3"><h2 id="criterios" className="text-lg">Pontuação por critério</h2><p className="hint">cada ponto é uma entrega, em % do máximo do critério; o traço dourado é a média; número no ponto indica entregas empatadas</p></div>
        <ul className="list-none p-0 m-0 mt-2">
          {c.porCriterio.map((x) => <FaixaCriterio key={x.criterio.chave} nome={x.criterio.curto} max={x.criterio.max} media={x.media} valores={x.valores.map((y) => ({ tema: y.entrega.tema, valor: y.valor }))} />)}
        </ul>
        <div className="hidden sm:grid grid-cols-[9.5rem_1fr_4.5rem] gap-4 mt-1"><span /><div className="relative h-4 mx-2 hint">{[0, 25, 50, 75, 100].map((t) => <span key={t} className="absolute -translate-x-1/2" style={{ left: `${t}%` }}>{t}%</span>)}</div><span /></div>
      </section>

      <section className="card p-0! mb-5" aria-labelledby="entregas">
        <div className="p-[18px] pb-2"><h2 id="entregas" className="text-lg">Resultado por entrega</h2><p className="hint mt-1">Pontos por critério vigentes, após a revisão de {REVISAO.data}, com a precisão integral arredondada a duas casas. Zero em vermelho indica a trava aplicada. Anterior é a nota de {TRABALHO_1.entrega}; o acréscimo é arredondado separadamente e pode diferir 0,01 da diferença exibida.</p></div>
        <div className="table-wrap"><table className="table text-[13.5px]">
          <thead><tr><th>#</th><th>Entrega</th>{CRITERIOS.map((k) => <th key={k.chave} className="text-right!">{k.curto}<br /><span className="font-normal normal-case">/{k.max}</span></th>)}<th className="text-right!">Doc.<br /><span className="font-normal normal-case">/{DOCUMENTAL_MAX}</span></th><th className="text-right!">Total<br /><span className="font-normal normal-case">/100</span></th><th className="text-right!">Base</th><th className="text-right!">Anterior</th><th className="text-right!">Acréscimo</th><th className="text-right!">Nota</th></tr></thead>
          <tbody>
            {c.porEntrega.map((x, i) => (
              <tr key={x.entrega.id}>
                <td className="tabular-nums text-muted">{i + 1}</td>
                <td className="min-w-[15rem]"><b className="text-ink">{x.entrega.tema}</b>{x.entrega.condicional && <span className="badge badge-warn ml-1">condicional</span>}<br /><span className="hint">{x.entrega.modalidade === "grupo" ? "grupo: " : "individual: "}{x.alunos.map((a) => a.nome).join(", ")}</span></td>
                {CRITERIOS.map((k) => { const val = x.entrega.pontos[k.chave]; return <td key={k.chave} className={`text-right tabular-nums ${val === 0 ? "text-alert font-bold" : ""}`}>{pts(val)}</td>; })}
                <td className="text-right tabular-nums">{n2(x.documental)}</td>
                <td className="text-right tabular-nums">{n2(x.total)}</td>
                <td className="text-right tabular-nums">{n2(x.base)}</td>
                <td className="text-right tabular-nums text-muted">{n2(x.anterior)}</td>
                <td className={`text-right tabular-nums ${x.acrescimo > 0.005 ? "text-ok font-semibold" : "text-muted"}`}>{x.acrescimo > 0.005 ? `+${n2(x.acrescimo)}` : "0,00"}</td>
                <td className="text-right tabular-nums"><b className="text-ink text-[15px]">{n2(x.nota)}</b></td>
              </tr>
            ))}
          </tbody>
          <tfoot><tr><td /><td className="font-semibold text-ink">Média das entregas</td>{c.porCriterio.map((x) => <td key={x.criterio.chave} className="text-right tabular-nums font-semibold">{n2(x.media)}</td>)}<td className="text-right tabular-nums font-semibold">{n2(c.porEntrega.reduce((s, x) => s + x.documental, 0) / c.entregas)}</td><td className="text-right tabular-nums font-semibold">{n2(c.porEntrega.reduce((s, x) => s + x.total, 0) / c.entregas)}</td><td className="text-right tabular-nums font-semibold">{n2(c.porEntrega.reduce((s, x) => s + x.base, 0) / c.entregas)}</td><td className="text-right tabular-nums font-semibold">{n2(c.porEntrega.reduce((s, x) => s + x.anterior, 0) / c.entregas)}</td><td /><td className="text-right tabular-nums font-semibold">{n2(c.porEntrega.reduce((s, x) => s + x.nota, 0) / c.entregas)}</td></tr></tfoot>
        </table></div>
      </section>

      <section className="card p-0! mb-5" aria-labelledby="alunos">
        <div className="p-[18px] pb-2">
          <h2 id="alunos" className="text-lg">Por aluno e vínculo na plataforma</h2>
          {v.turma
            ? <p className="text-[14px] mt-1">Turma atribuída: <b>{v.turma.name}</b> <span className="hint">({v.turma.code})</span>, com {nVinculados} de {c.alunos} alunos vinculados à própria matrícula. Só quem tem vínculo vê a devolutiva.</p>
            : <p className="callout callout-warn text-[14px] mt-2">Nenhuma turma do ano letivo {TRABALHO_1.anoLetivo} tem ao menos {TRABALHO_1.vinculoMinimo} alunos da devolutiva com vínculo único; por isso nenhum aluno vê o resultado ainda. {v.placar.length ? `Vínculos por turma: ${v.placar.map((p) => `${p.name} (${p.code}) ${p.vinculados}`).join("; ")}.` : "Não há turmas cadastradas."}</p>}
          <p className="hint mt-1">O vínculo casa o nome da devolutiva com o nome da matrícula, o nome do perfil ou o e-mail, sem acento, e só vale quando é único nos dois sentidos. Para fixar um vínculo, informe o e-mail da matrícula no campo email do aluno em src/lib/avaliacoes/trabalho-1.ts.</p>
        </div>
        <div className="table-wrap"><table className="table text-[13.5px]">
          <thead><tr><th>Aluno</th><th>Entrega</th><th className="text-right!">Anterior</th><th className="text-right!">Nota</th><th>Matrícula vinculada</th><th>Devolutiva</th></tr></thead>
          <tbody>
            {c.porAluno.map(({ aluno, entrega, nota, anterior, acrescimo }) => {
              const r = v.porAluno[aluno.id]; const m = r?.status === "vinculado" ? v.matriculas.get(r.candidatoId) : null;
              return (
                <tr key={aluno.id}>
                  <td><b className="text-ink">{aluno.nome}</b></td>
                  <td>{entrega.tema}</td>
                  <td className="text-right tabular-nums text-muted">{n2(anterior)}</td>
                  <td className="text-right tabular-nums"><b className="text-ink">{n2(nota)}</b>{acrescimo > 0.005 && <span className="block text-[12px] text-ok">+{n2(acrescimo)}</span>}</td>
                  <td>{m ? <><span>{m.nome}</span> <StatusBadge status={m.status} />{m.papel === "monitor" && <span className="badge badge-ink ml-1">monitor</span>}<br /><span className="hint">{m.email}</span></>
                    : r?.status === "ambiguo" ? <span className="text-warn">ambíguo: casa com {r.candidatos.length} matrículas ({r.candidatos.map((id) => v.matriculas.get(id)?.nome).join("; ")})</span>
                    : <span className="hint">{v.turma ? "sem correspondência na turma" : "sem turma atribuída"}</span>}</td>
                  <td><Link href={`/professor/trabalho-1/${aluno.id}`} className="whitespace-nowrap">ver como o aluno vê</Link></td>
                </tr>
              );
            })}
          </tbody>
        </table></div>
      </section>

      <section className="card mb-5" aria-labelledby="rev">
        <h2 id="rev" className="text-lg">Revisão de {REVISAO.data}: critério e conferências</h2>
        <div className="grid gap-2 mt-3 text-[14.5px] max-w-[85ch]">{REVISAO.criterio.map((t, i) => <p key={i}>{t}</p>)}</div>
        <ul className="list-none p-0 m-0 mt-4 grid gap-3 md:grid-cols-3">
          {REVISAO.conferencias.map((x) => <li key={x.titulo} className="panel-soft"><p className="font-semibold text-ink text-[14.5px]">{x.titulo}</p><p className="text-[14px] mt-1">{x.texto}</p></li>)}
        </ul>
      </section>

      <section className="card mb-5" aria-labelledby="pend">
        <h2 id="pend" className="text-lg">Pendências antes de tornar a avaliação definitiva</h2>
        <ul className="list-none p-0 m-0 mt-3 grid gap-3 md:grid-cols-2">
          {PENDENCIAS.map((p) => <li key={p.titulo} className="panel-soft"><p className="font-semibold text-ink text-[14.5px]">{p.titulo}</p><p className="text-[14px] mt-1">{p.texto}</p></li>)}
        </ul>
      </section>

      <details className="card-flat">
        <summary className="cursor-pointer font-semibold text-ink">Método de cálculo e fonte</summary>
        <div className="mt-3 grid gap-2 text-[14.5px] max-w-[80ch]">
          <p>Nota base = (pontos documentais + apresentação) ÷ 10. Nota = mínimo entre 10 e 7 + 3 × (nota base − {n2(c.regua.menor)}) ÷ ({n2(c.regua.maior)} − {n2(c.regua.menor)}), com os valores completos no cálculo e duas casas na exibição. Os extremos são os da avaliação de {TRABALHO_1.entrega} e ficam fixos; equivale a somar à nota anterior 3 × crédito ÷ 61.</p>
          <p>Apresentação incorporada como definida: Michelle Bouhid 10/15, Carlos Eduardo N Campos 5/15 e demais 15/15. Nenhum teto de checkpoint foi aplicado, porque seu valor não estava definido.</p>
          <p>Médias da turma ponderadas por aluno (cada integrante de grupo conta uma vez); médias por critério e a linha final da tabela ponderadas por entrega.</p>
          <p className="hint">Fonte: {TRABALHO_1.fonte} Os valores desta página são recalculados dos pontos por critério e conferidos contra o documento em tests/trabalho-1.test.ts.</p>
        </div>
      </details>
    </div>
  );
}
