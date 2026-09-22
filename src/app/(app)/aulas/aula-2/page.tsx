import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { and, asc, eq, inArray } from "drizzle-orm";
import { requireContext } from "@/lib/context";
import { db, schema } from "@/lib/db/client";
import { courseOutline } from "@/lib/services/content";
import { AULA_2, blocosDe, hrefSlide, notasAula2, publicos } from "@/lib/content/aula-2";
import { ehAulaEmSlides, sequenciaDoCurso, vizinhosNaSequencia } from "@/lib/content/capitulo";
import { Badge } from "@/components/ui";

export const metadata: Metadata = { title: "Aula 2" };

/**
 * Abertura da Aula 2, no mesmo padrão da abertura de capítulo: pergunta central, o que se aprende,
 * por que importa, a atividade, o que a aula assume, o mapa dos 50 slides por bloco, a entrega,
 * os materiais da aula e as unidades vizinhas. Os títulos e blocos vêm do baralho compilado.
 */
export default async function AulaDoisPage() {
  const ctx = await requireContext();
  const staff = ctx.current.role !== "aluno";
  const outline = await courseOutline(ctx.current.edition.id);
  const unidade = outline.find(ehAulaEmSlides);
  if (!unidade) notFound();
  const { slides: notas } = await notasAula2();
  const slides = publicos(notas);
  if (slides.length === 0) notFound();
  const blocos = blocosDe(slides);
  const materiais = (await db.select().from(schema.materials)
    .where(and(eq(schema.materials.editionId, ctx.current.edition.id), inArray(schema.materials.status, ["published", "professor"])))
    .orderBy(asc(schema.materials.position)))
    .filter((m) => m.unitId === unidade.id && m.url !== AULA_2.href && (staff || m.status === "published"));
  const { prev, next } = vizinhosNaSequencia(sequenciaDoCurso(outline), AULA_2.href);
  const uteis = unidade.plannedMinutes - unidade.breakMinutes;
  const exercicios = slides.filter((s) => s.exercicio).length;
  return (
    <div className="capx" style={{ ["--cap" as string]: "#00205B", ["--cap-soft" as string]: "#EFF3FA" }} data-testid="aula-2">
      <Link href="/aulas" className="voltar mb-3">Aulas</Link>
      <header className="capx-hero">
        <span className="capx-num" aria-hidden="true">02</span>
        <div>
          <p className="eyebrow">Aula {unidade.number} · <b>{slides.length} slides em {blocos.length} blocos</b></p>
          <h1 className="capx-tit">{unidade.title}</h1>
          <p className="capx-perg">{AULA_2.pergunta}</p>
          <dl className="capx-stats">
            <div className="capx-stat"><dt>slides</dt><dd>{slides.length}</dd></div>
            <div className="capx-stat"><dt>blocos</dt><dd>{blocos.length}</dd></div>
            <div className="capx-stat"><dt>minutos úteis em aula</dt><dd>{uteis}</dd></div>
            <div className="capx-stat"><dt>exercícios corrigidos na tela</dt><dd>{exercicios}</dd></div>
          </dl>
          <div className="capx-acoes">
            <Link href={hrefSlide("01")} className="btn">Começar pelo slide 1 →</Link>
            <a href={AULA_2.slidesHref} className="btn btn-secondary">Apresentar em tela cheia</a>
            {ctx.user.isStaff && <Link href="/professor/turmas" className="btn btn-ghost">Conduzir ao vivo</Link>}
          </div>
        </div>
      </header>

      <section className="capx-tres" aria-label="Sobre a aula">
        <div className="capx-bloco"><p className="eyebrow">O que você aprende</p><p>{AULA_2.aprende}</p></div>
        <div className="capx-bloco"><p className="eyebrow">Por que importa</p><p>{AULA_2.porQueImporta}</p></div>
        <div className="capx-bloco"><p className="eyebrow">A atividade</p><p>{AULA_2.atividade}</p></div>
      </section>

      <section className="capx-secao capx-duas" aria-label="Antes e depois da aula">
        <div className="callout text-[14.5px]" data-testid="aula-2-assume">
          <p className="eyebrow mb-1">Antes de começar</p>
          <p>{AULA_2.antes}</p>
          <p className="mt-2"><Link href="/aulas/capitulo/1">Capítulo 1</Link> · <Link href="/aulas/capitulo/2">Capítulo 2</Link> · <Link href="/aulas/capitulo/3">Capítulo 3</Link></p>
        </div>
        <div className="callout text-[14.5px]">
          <p className="eyebrow mb-1">Onde isto é usado depois</p>
          <p>{AULA_2.depois}</p>
          <p className="mt-2"><Link href="/aulas/capitulo/4">Capítulo 4</Link> · <Link href="/aulas/capitulo/5">Capítulo 5</Link> · <Link href="/aulas/capitulo/6">Capítulo 6</Link></p>
        </div>
      </section>

      <section className="capx-secao" aria-labelledby="mapa">
        <div className="capx-secao-t">
          <h2 id="mapa">Os {slides.length} slides</h2>
          <p className="hint">Um endereço por slide, com Anterior e Próxima como nas páginas. {AULA_2.aoVivo}</p>
        </div>
        {blocos.map((b, i) => (
          <div key={b.chave} id={`bloco-${i + 1}`} className="mb-5" style={{ ["--cap" as string]: b.cor, ["--cap-soft" as string]: b.suave }}>
            <div className="capx-secao-t">
              <h3 className="text-[19px]" style={{ color: b.cor }}>{i + 1} · {b.nome}</h3>
              <p className="hint">slides {b.de} a {b.ate} · {b.pergunta}</p>
            </div>
            <ol className="capx-mapa">
              {b.slides.map((s) => (
                <li key={s.n} className="capx-pag">
                  <span className="capx-pag-n" aria-hidden="true">{s.n}</span>
                  <Link href={hrefSlide(s.n)} className="capx-pag-t">{s.titulo}</Link>
                  <span className="capx-pag-m">{s.exercicio ? <Badge tone="muted">exercício</Badge> : <span />}</span>
                  {s.subtitulo && <p className="capx-pag-o">{s.subtitulo}</p>}
                </li>
              ))}
            </ol>
          </div>
        ))}
      </section>

      <section className="capx-secao capx-duas" aria-label="Entrega e materiais">
        <div className="capx-bloco">
          <p className="eyebrow">Entrega da aula {unidade.number}</p>
          <p>{unidade.deliverable ?? "Sem entrega associada."}</p>
          <p className="mt-2"><Link href="/trabalhos">Ver os trabalhos</Link></p>
        </div>
        <div className="capx-bloco">
          <p className="eyebrow">Material para levar</p>
          {materiais.length > 0 ? (
            <ul className="capx-lista">
              {materiais.map((m) => <li key={m.id}>{m.url ? <a href={m.url} target="_blank" rel="noreferrer">{m.title}</a> : m.fileId ? <a href={`/api/arquivos/${m.fileId}`}>{m.title}</a> : <span>{m.title}</span>}{m.status === "professor" && <Badge tone="gold">só professor</Badge>}{m.description && <p className="hint">{m.description}</p>}</li>)}
            </ul>
          ) : <p className="hint">Os guias da aula aparecem aqui assim que forem publicados em Materiais com a unidade escolhida.</p>}
          <p className="mt-2"><Link href="/materiais">Todos os materiais</Link></p>
        </div>
      </section>

      <nav className="capx-viz" aria-label="Unidades vizinhas">
        {prev ? <Link href={prev.href} rel="prev"><span className="eyebrow">← {prev.rotulo}</span><b>{prev.titulo}</b></Link> : <span />}
        {next ? <Link href={next.href} rel="next" className="capx-viz--prox"><span className="eyebrow">{next.rotulo} →</span><b>{next.titulo}</b></Link> : <span />}
      </nav>
    </div>
  );
}
