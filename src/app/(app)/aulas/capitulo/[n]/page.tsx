import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireContext } from "@/lib/context";
import { chapterOverview, chapterPrerequisites } from "@/lib/services/content";
import { chapterAssumptions } from "@/lib/content/prerequisites";
import { infograficoDoCapitulo } from "@/lib/content/infograficos";
import { InfograficoCapitulo } from "@/components/content/infografico";
import { materiaisDoCapitulo, numeroCapitulo, resumoCapitulo, rotuloUnidade, somaTempos } from "@/lib/content/capitulo";
import { Badge } from "@/components/ui";

export async function generateMetadata({ params }: { params: Promise<{ n: string }> }): Promise<Metadata> {
  const { n } = await params;
  return { title: `Capítulo ${n}` };
}

/**
 * Cartão de visita do capítulo: pergunta central, o que se aprende, por que importa, a atividade, o que o capítulo assume,
 * infográfico de abertura, mapa das páginas com objetivo e tempo, entrega da aula, materiais e capítulos vizinhos.
 */
export default async function CapituloPage({ params }: { params: Promise<{ n: string }> }) {
  const { n } = await params;
  const numero = Number(n);
  if (!Number.isInteger(numero) || numero < 1) notFound();
  const ctx = await requireContext();
  const staff = ctx.current.role !== "aluno";
  const d = await chapterOverview(ctx.current.edition.id, numero);
  if (!d || d.chapter.pages.length === 0) notFound();
  const { unit, chapter, prev, next, total, titles } = d;
  const r = resumoCapitulo(chapter.pages);
  const primeira = chapter.pages[0];
  const slugs = new Set(Object.keys(titles));
  const assumptions = chapterAssumptions(await chapterPrerequisites(chapter.id), { chapter: numero, slugs });
  const info = infograficoDoCapitulo(numero);
  const tempos = staff ? somaTempos(chapter.pages.map((p) => p.timeBudget)) : null;
  const materiais = materiaisDoCapitulo(d.materials, numero).filter((m) => staff || m.status === "published");
  const unidade = rotuloUnidade(unit);
  const cor = chapter.themeColor ?? "#00205B";
  return (
    <div className="capx" style={{ ["--cap" as string]: cor, ["--cap-soft" as string]: chapter.themeSoft ?? "#EFF3FA" }} data-testid="capitulo">
      <Link href="/aulas" className="voltar mb-3">Aulas</Link>
      <header className="capx-hero">
        <span className="capx-num" aria-hidden="true">{numeroCapitulo(numero)}</span>
        <div>
          <p className="eyebrow">{unidade} · {unit.title} · <b>Capítulo {numero} de {total}</b></p>
          <h1 className="capx-tit">{chapter.title}</h1>
          {chapter.centralQuestion && <p className="capx-perg">{chapter.centralQuestion}</p>}
          <dl className="capx-stats">
            <div className="capx-stat"><dt>páginas</dt><dd>{r.total}</dd></div>
            <div className="capx-stat"><dt>essenciais, vistas em aula</dt><dd>{r.essenciais}</dd></div>
            <div className="capx-stat"><dt>minutos em aula</dt><dd>{r.minEssenciais}</dd></div>
            {r.complementares > 0 && <div className="capx-stat"><dt>complementares · {r.minComplementares} min de estudo</dt><dd>{r.complementares}</dd></div>}
          </dl>
          <div className="capx-acoes">
            <Link href={`/aulas/${primeira.slug}`} className="btn">Começar pela página 1 →</Link>
            <Link href={`/apresentacao/${primeira.slug}`} className="btn btn-secondary">Apresentar em tela cheia</Link>
            {ctx.user.isStaff && <Link href="/professor/conteudo" className="btn btn-ghost">Editar o conteúdo</Link>}
          </div>
        </div>
      </header>

      <section className="capx-tres" aria-label="Sobre o capítulo">
        <div className="capx-bloco"><p className="eyebrow">O que você aprende</p><p>{chapter.learn}</p></div>
        <div className="capx-bloco"><p className="eyebrow">Por que importa</p><p>{chapter.motivation}</p></div>
        <div className="capx-bloco"><p className="eyebrow">A atividade</p><p>{chapter.activity}</p></div>
      </section>

      <section className="capx-secao capx-duas" aria-label="Antes e depois do capítulo">
        <div className="callout text-[14.5px]" data-testid="capitulo-assume">
          <p className="eyebrow mb-1">Antes de começar</p>
          {chapter.prerequisites && <p>{chapter.prerequisites}</p>}
          {assumptions.length > 0 && (
            <ul className="list-none p-0 m-0 mt-2 grid gap-1">
              {assumptions.map((a) => (
                <li key={a.chapter}>
                  <b>Capítulo {a.chapter}:</b>{" "}
                  {a.slugs.map((s, i) => <span key={s}>{i > 0 && " · "}<Link href={`/aulas/${s}`}>{s === `c${a.chapter}p1` ? "abertura" : titles[s] ?? s}</Link></span>)}
                </li>
              ))}
            </ul>
          )}
          {assumptions.length > 0 && <p className="hint mt-2">Derivado dos prerrequisitos declarados em cada página deste capítulo. Páginas complementares aprofundam; as essenciais bastam para a aula.</p>}
          {!chapter.prerequisites && assumptions.length === 0 && <p>Nenhum prerrequisito além dos capítulos anteriores.</p>}
        </div>
        <div className="callout text-[14.5px]">
          <p className="eyebrow mb-1">Onde isto é usado depois</p>
          <p>{chapter.uses ?? "Os capítulos seguintes retomam o vocabulário e os resultados daqui."}</p>
        </div>
      </section>

      {info && <section className="capx-secao" aria-labelledby="infografico"><div className="capx-secao-t"><h2 id="infografico">Infográfico de abertura</h2><p className="hint">O capítulo em quatro blocos: o fluxo, os números, a evidência e as três ideias.</p></div><InfograficoCapitulo d={info} /></section>}

      <section className="capx-secao" aria-labelledby="mapa">
        <div className="capx-secao-t">
          <h2 id="mapa">As {r.total} páginas</h2>
          <p className="hint">Essenciais são vistas em aula; complementares aprofundam no seu estudo.{tempos ? ` Roteiro: exposição ${tempos.exp}, exemplo ${tempos.ex}, prática ${tempos.prat} e discussão ${tempos.disc} min.` : ""}</p>
        </div>
        <ol className="capx-mapa">
          {chapter.pages.map((p, i) => (
            <li key={p.id} className={`capx-pag ${p.level !== "essencial" ? "capx-pag--compl" : ""}`}>
              <span className="capx-pag-n" aria-hidden="true">{i + 1}</span>
              <Link href={`/aulas/${p.slug}`} className="capx-pag-t">{p.title}</Link>
              <span className="capx-pag-m">
                <span>{p.minutes} min{p.level !== "essencial" ? " · complementar" : ""}</span>
                {p.level !== "essencial" && <Badge tone="muted">estudo</Badge>}
                {tempos && p.timeBudget && <span>exp {p.timeBudget.exp ?? 0} · ex {p.timeBudget.ex ?? 0} · prát {p.timeBudget.prat ?? 0} · disc {p.timeBudget.disc ?? 0}</span>}
              </span>
              {p.objective && <p className="capx-pag-o">{p.objective}</p>}
            </li>
          ))}
        </ol>
      </section>

      <section className="capx-secao capx-duas" aria-label="Entrega e materiais">
        <div className="capx-bloco">
          <p className="eyebrow">Entrega {unit.kind === "trabalho" ? "do trabalho final" : `da aula ${unit.number}`}</p>
          <p>{unit.deliverable ?? "Sem entrega associada."}</p>
          <p className="mt-2"><Link href="/trabalhos">Ver os trabalhos</Link></p>
        </div>
        <div className="capx-bloco">
          <p className="eyebrow">Material para levar</p>
          {materiais.length > 0 ? (
            <ul className="capx-lista">
              {materiais.map((m) => <li key={m.id}>{m.url ? <a href={m.url} target="_blank" rel="noreferrer">{m.title}</a> : m.fileId ? <a href={`/api/arquivos/${m.fileId}`}>{m.title}</a> : <span>{m.title}</span>}{m.status === "professor" && <Badge tone="gold">só professor</Badge>}{m.description && <p className="hint">{m.description}</p>}</li>)}
            </ul>
          ) : <p className="hint">A apostila deste capítulo aparece aqui assim que for publicada em Materiais com o número do capítulo no título.</p>}
          <p className="mt-2"><Link href="/materiais">Todos os materiais</Link></p>
        </div>
      </section>

      <nav className="capx-viz" aria-label="Capítulos vizinhos">
        {prev ? <Link href={prev.href} rel="prev"><span className="eyebrow">← {prev.rotulo}</span><b>{prev.titulo}</b></Link> : <span />}
        {next ? <Link href={next.href} rel="next" className="capx-viz--prox"><span className="eyebrow">{next.rotulo} →</span><b>{next.titulo}</b></Link> : <span />}
      </nav>
    </div>
  );
}
