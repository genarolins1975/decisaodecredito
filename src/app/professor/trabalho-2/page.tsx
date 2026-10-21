import type { Metadata } from "next";
import Link from "next/link";
import { CRITERIOS_T2, MAX_T2, REGRAS_T2, TRABALHO_2, consolidacaoT2, n2, p1 } from "@/lib/avaliacoes/trabalho-2";
import { vinculoTrabalho2 } from "@/lib/services/avaliacoes";
import { PageHeader, Stat, StatusBadge } from "@/components/ui";

export const metadata: Metadata = { title: "Trabalho 2: consolidação" };

const pct = (x: number) => `${Math.round(x * 100)}%`;
const n3 = (x: number) => x.toLocaleString("pt-BR", { minimumFractionDigits: 3, maximumFractionDigits: 3 });

export default async function Trabalho2Consolidacao() {
  const c = consolidacaoT2();
  const v = await vinculoTrabalho2();
  const r = c.regua;
  const nVinculados = Object.values(v.porAluno).filter((x) => x.status === "vinculado").length;
  const crit = Object.fromEntries(c.porCriterio.map((x) => [x.criterio.chave, x]));
  const ordenados = [...c.porCriterio].filter((x) => x.criterio.chave !== "reproducao_defesa").sort((a, b) => a.media - b.media);
  const fracos = ordenados.slice(0, 3);

  return (
    <div>
      <Link href="/professor" className="voltar">Início</Link>
      <PageHeader eyebrow={<>{v.turma ? v.turma.name : "Turma não identificada"} · resultado consolidado</>} title={TRABALHO_2.titulo} lead={<>{c.entregas} entregas e {c.alunos} alunos. Avaliação de {TRABALHO_2.avaliacao}, consolidação de {TRABALHO_2.consolidacao} e reescala de {TRABALHO_2.reescala}. Cada aluno vê apenas a própria devolutiva, em Trabalhos.</>} />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5 mb-5">
        <Stat label="Média da turma" value={n2(c.mediaAlunos)} hint={`${c.alunos} alunos · nota bruta média ${n2(c.mediaBrutaAlunos)}`} />
        <Stat label="Amplitude" value={<>{n2(c.minima)} a {n2(c.maxima)}</>} hint={`régua: brutas de ${n3(r.menor)} a ${n3(r.maior)} levadas de 7 a 10`} />
        <Stat label="Valor do ponto" value={n3(r.porPonto)} hint={`cada ponto da rubrica, de ${p1(r.menorPontos)} a ${p1(r.maiorPontos)} pontos`} />
        <Stat label="Entregas" value={c.entregas} hint={`${c.grupos} em grupo · ${c.individuais} individuais`} />
        <Stat label="Previsões OOT válidas" value={<>{c.ootValidos} de {c.entregas}</>} hint="100.000 IDs conferidos, sem faltantes, extras ou duplicados" tone={c.ootValidos < c.entregas ? "warn" : "ok"} />
      </div>

      <section className="card mb-5" aria-labelledby="leitura">
        <h2 id="leitura" className="text-lg">Leitura da turma</h2>
        <div className="grid gap-3 md:grid-cols-3 mt-3">
          <article className="panel-soft"><p className="eyebrow mb-1">Evidência</p><p className="text-[14.5px] leading-relaxed">Problema e dados e uso responsável ficaram em {pct(crit.problema_dados.media / 2)} e {pct(crit.uso_responsavel.media / 2)} do máximo. Os critérios mais baixos, fora a defesa fixada em 1,6, foram {fracos.map((x) => `${x.criterio.nome.toLowerCase()} (${pct(x.media / 2)})`).join(", ")}. Modelo e testes teve 2 em {crit.modelo_testes.completos} de {c.entregas} entregas; {c.entregas - c.ootValidos} entregas não trouxeram previsões OOT válidas.</p></article>
          <article className="panel-soft"><p className="eyebrow mb-1">Inferência</p><p className="text-[14.5px] leading-relaxed">A turma domina a construção do modelo; o que separa as notas é preservar o teste cego (três famílias, OOT medido uma vez, nenhuma escolha com o arquivo cego) e fechar a operação no blueprint, com a faixa manual dimensionada na população de produção. A reescala preserva a ordem e as distâncias: cada ponto da rubrica vale {n3(r.porPonto)} na nota.</p></article>
          <article className="panel-soft"><p className="eyebrow mb-1">Recomendação</p><p className="text-[14.5px] leading-relaxed">Na próxima edição, exigir no pacote congelado a trava de execução única do OOT e, no blueprint, a capacidade da faixa manual calculada na população completa, as duas lacunas mais recorrentes nesta avaliação.</p></article>
        </div>
      </section>

      <section className="card p-0! mb-5" aria-labelledby="entregas">
        <div className="p-[18px] pb-2"><h2 id="entregas" className="text-lg">Resultado por entrega</h2><p className="hint mt-1">Pontos de 0 a 2 por critério. Bruta = pontos ÷ 16 × 10. Nota = 7 + 3 × (bruta − {n3(r.menor)}) ÷ ({n3(r.maior)} − {n3(r.menor)}). Zero em vermelho.</p></div>
        <div className="table-wrap"><table className="table text-[13.5px]">
          <thead><tr><th>#</th><th>Entrega</th>{CRITERIOS_T2.map((k) => <th key={k.chave} className="text-right!" title={k.nome}>C{k.numero}</th>)}<th className="text-right!">Pontos<br /><span className="font-normal normal-case">/{MAX_T2}</span></th><th className="text-right!">Bruta</th><th className="text-right!">Nota</th></tr></thead>
          <tbody>
            {c.porEntrega.map((x, i) => (
              <tr key={x.entrega.id}>
                <td className="tabular-nums text-muted">{i + 1}</td>
                <td className="min-w-[15rem]"><b className="text-ink">{x.entrega.titulo}</b><br /><span className="hint">{x.entrega.modalidade === "grupo" ? "grupo: " : "individual: "}{x.alunos.map((a) => a.nome).join(", ")}</span></td>
                {CRITERIOS_T2.map((k) => { const val = x.entrega.criterios[k.chave].pontos; return <td key={k.chave} className={`text-right tabular-nums ${val === 0 ? "text-alert font-bold" : ""}`}>{p1(val)}</td>; })}
                <td className="text-right tabular-nums">{p1(x.pontos)}</td>
                <td className="text-right tabular-nums text-muted">{n2(x.bruta)}</td>
                <td className="text-right tabular-nums"><b className="text-ink text-[15px]">{n2(x.nota)}</b></td>
              </tr>
            ))}
          </tbody>
          <tfoot><tr><td /><td className="font-semibold text-ink">Média das entregas</td>{c.porCriterio.map((x) => <td key={x.criterio.chave} className="text-right tabular-nums font-semibold">{n2(x.media)}</td>)}<td className="text-right tabular-nums font-semibold">{n2(c.porEntrega.reduce((s, x) => s + x.pontos, 0) / c.entregas)}</td><td className="text-right tabular-nums font-semibold">{n2(c.porEntrega.reduce((s, x) => s + x.bruta, 0) / c.entregas)}</td><td className="text-right tabular-nums font-semibold">{n2(c.porEntrega.reduce((s, x) => s + x.nota, 0) / c.entregas)}</td></tr></tfoot>
        </table></div>
        <p className="hint px-[18px] pb-[18px]">{CRITERIOS_T2.map((k) => `C${k.numero} ${k.nome}`).join(" · ")}</p>
      </section>

      <section className="card p-0! mb-5" aria-labelledby="alunos">
        <div className="p-[18px] pb-2">
          <h2 id="alunos" className="text-lg">Por aluno e vínculo na plataforma</h2>
          {v.turma
            ? <p className="text-[14px] mt-1">Turma atribuída: <b>{v.turma.name}</b> <span className="hint">({v.turma.code})</span>, com {nVinculados} de {c.alunos} alunos vinculados à própria matrícula. Só quem tem vínculo vê a devolutiva.</p>
            : <p className="callout callout-warn text-[14px] mt-2">Nenhuma turma do ano letivo {TRABALHO_2.anoLetivo} tem ao menos {TRABALHO_2.vinculoMinimo} alunos da devolutiva com vínculo único; por isso nenhum aluno vê o resultado ainda.</p>}
          <p className="hint mt-1">O vínculo usa o e-mail da matrícula informado em src/lib/avaliacoes/trabalho-2.ts e só vale quando é único nos dois sentidos.</p>
        </div>
        <div className="table-wrap"><table className="table text-[13.5px]">
          <thead><tr><th>Aluno</th><th>Entrega</th><th className="text-right!">Bruta</th><th className="text-right!">Nota</th><th>Matrícula vinculada</th><th>Devolutiva</th></tr></thead>
          <tbody>
            {c.porAluno.map(({ aluno, entrega, bruta, nota }) => {
              const x = v.porAluno[aluno.id]; const m = x?.status === "vinculado" ? v.matriculas.get(x.candidatoId) : null;
              return (
                <tr key={aluno.id}>
                  <td><b className="text-ink">{aluno.nome}</b></td>
                  <td>{entrega.titulo}</td>
                  <td className="text-right tabular-nums text-muted">{n2(bruta)}</td>
                  <td className="text-right tabular-nums"><b className="text-ink">{n2(nota)}</b></td>
                  <td>{m ? <><span>{m.nome}</span> <StatusBadge status={m.status} /><br /><span className="hint">{m.email}</span></>
                    : x?.status === "ambiguo" ? <span className="text-warn">ambíguo: casa com {x.candidatos.length} matrículas</span>
                    : <span className="hint">{v.turma ? "sem correspondência na turma" : "sem turma atribuída"}</span>}</td>
                  <td><Link href={`/professor/trabalho-2/${aluno.id}`} className="whitespace-nowrap">ver como o aluno vê</Link></td>
                </tr>
              );
            })}
          </tbody>
        </table></div>
      </section>

      <details className="card-flat">
        <summary className="cursor-pointer font-semibold text-ink">Regras e método de cálculo</summary>
        <div className="mt-3 grid gap-2 text-[14.5px] max-w-[80ch]">
          {Object.values(REGRAS_T2).map((t, i) => <p key={i}>{t}</p>)}
          <p>Médias da turma ponderadas por aluno; médias por critério e a linha final da tabela ponderadas por entrega. O cálculo é feito em décimos de ponto, sem perda no arredondamento; a exibição usa duas casas, com metade para cima.</p>
          <p className="hint">Fonte: {TRABALHO_2.fonte} Os valores desta página são recalculados dos pontos por critério e conferidos em tests/trabalho-2.test.ts.</p>
        </div>
      </details>
    </div>
  );
}
