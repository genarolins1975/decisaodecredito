"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { api, ClientApiError } from "@/lib/client/api";
import { ErrorBox, SuccessBox } from "@/components/forms";
import { Badge } from "@/components/ui";
import { fmtDT } from "@/lib/time";
import type { Block } from "@/lib/services/content";
import { rotuloUnidade } from "@/lib/content/capitulo";

type Version = { id: string; versionNo: number; title: string; objective: string | null; support: string | null; connection: string | null; blocks: Block[]; teacherGuide: Record<string, unknown> | null; publishedAt: string | null };
type Q = { id: string; slug: string; kind: string; versionNo: number; label: string | null; prompt: string; options: { alternatives?: string[]; unit?: string; maxLength?: number }; answerKey: { correct?: number | number[]; explanation?: string | null; expected?: number; tolerance?: number } | null; feedback: { modelAnswer?: string; revealHtml?: string } | null };
type Data = { page: { id: string; slug: string; level: string; level120: string | null; minutes: number; status: string }; chapter: { number: number; title: string }; unit: { number: number; kind: string }; published: Version | null; latest: Version | null; versions: { id: string; versionNo: number; changeNote: string | null; createdAt: string; publishedAt: string | null; isPublished: boolean }[]; questions: Q[] };

const GUIDE_KEYS: [string, string][] = [["funcao", "Função na aula"], ["pre", "Pré-requisito"], ["conducao", "Condução"], ["leitura", "Como ler a tela"], ["pergunta", "Pergunta para a turma"], ["resposta", "Resposta esperada"], ["interacao", "Interação"], ["verificacao", "Verificação"], ["transicao", "Transição"]];

export function PageEditor({ data }: { data: Data }) {
  const router = useRouter();
  const base = data.latest ?? data.published;
  const [title, setTitle] = useState(base?.title ?? "");
  const [objective, setObjective] = useState(base?.objective ?? "");
  const [support, setSupport] = useState(base?.support ?? "");
  const [connection, setConnection] = useState(base?.connection ?? "");
  const [blocks, setBlocks] = useState<Block[]>(base?.blocks ?? []);
  const [guide, setGuide] = useState<Record<string, unknown>>(base?.teacherGuide ?? {});
  const [note, setNote] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const save = async (publish: boolean) => {
    setErr(null); setOk(null);
    try { const r = await api<{ versionNo: number }>(`/api/professor/conteudo/paginas/${data.page.id}/versoes`, { body: { title, objective: objective || null, support: support || null, connection: connection || null, blocks, teacherGuide: guide, changeNote: note || undefined, publish } }); setOk(`Versão ${r.versionNo} ${publish ? "publicada" : "salva como rascunho"}.`); router.refresh(); } catch (e) { setErr(e instanceof ClientApiError ? e.message : "Falha"); }
  };
  const meta = async (patch: Record<string, unknown>) => { try { await api(`/api/professor/conteudo/paginas/${data.page.id}`, { method: "PATCH", body: patch }); router.refresh(); } catch (e) { setErr(e instanceof ClientApiError ? e.message : "Falha"); } };
  const updBlock = (i: number, b: Block) => setBlocks((bs) => bs.map((x, k) => (k === i ? b : x)));
  const move = (i: number, d: -1 | 1) => setBlocks((bs) => { const n = [...bs]; const j = i + d; if (j < 0 || j >= n.length) return bs; [n[i], n[j]] = [n[j], n[i]]; return n; });

  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
      <div className="min-w-0 flex flex-col gap-4">
        <div>
          <Link href="/professor/conteudo" className="voltar">Conteúdo</Link>
          <div className="flex flex-wrap items-center gap-3 mt-1">
            <p className="eyebrow">{rotuloUnidade(data.unit)} · Capítulo {data.chapter.number} · {data.page.slug}</p>
            <Badge tone={data.page.status === "published" ? "ok" : "muted"}>{data.page.status === "published" ? "publicada" : "rascunho"}</Badge>
            <div className="flex-1" />
            <Link href={`/aulas/${data.page.slug}`} className="btn btn-sm btn-ghost">Ver a versão publicada</Link>
          </div>
          <h1 className="text-2xl mt-1">{base?.title ?? data.page.slug}</h1>
        </div>
        <ErrorBox message={err} /><SuccessBox message={ok} />
        <section className="card form-grid">
          <label className="text-[13px]">Título<input className="input font-serif font-bold text-lg" value={title} onChange={(e) => setTitle(e.target.value)} /></label>
          <label className="text-[13px]">Objetivo (aprendizado único)<textarea className="textarea" value={objective} onChange={(e) => setObjective(e.target.value)} /></label>
          <label className="text-[13px]">Apoio (frase de abertura)<textarea className="textarea" value={support} onChange={(e) => setSupport(e.target.value)} /></label>
          <label className="text-[13px]">Conexão com a próxima página<input className="input" value={connection} onChange={(e) => setConnection(e.target.value)} /></label>
        </section>
        <section className="card">
          <h2 className="text-base mb-2">Blocos ({blocks.length})</h2>
          <p className="hint mb-3">Blocos HTML aceitam fórmulas com \( \) e \[ \]; o conteúdo é sanitizado no servidor (sem scripts). Visuais interativos herdados e questões são referenciados, não editados aqui.</p>
          <div className="flex flex-col gap-3">
            {blocks.map((b, i) => (
              <div key={i} className="border border-rule rounded p-3 bg-paper">
                <div className="flex items-center gap-2 mb-2"><Badge tone="ink">{b.type}</Badge>{b.type === "question" && <span className="hint">questão {b.slug}</span>}{b.type === "legacy" && <span className="hint">visual interativo {b.slug} ({b.controls} controles)</span>}<div className="flex-1" /><button className="btn btn-sm btn-ghost" onClick={() => move(i, -1)} aria-label="Mover para cima">↑</button><button className="btn btn-sm btn-ghost" onClick={() => move(i, 1)} aria-label="Mover para baixo">↓</button><button className="btn btn-sm btn-ghost text-alert" onClick={() => { if (confirm("Remover este bloco da nova versão?")) setBlocks((bs) => bs.filter((_, k) => k !== i)); }}>Remover</button></div>
                {b.type === "html" && <textarea className="textarea font-mono text-[12px] min-h-[160px]" value={b.html} onChange={(e) => updBlock(i, { type: "html", html: e.target.value })} aria-label={`HTML do bloco ${i + 1}`} />}
                {b.type === "legacy" && <label className="text-[13px]">Nota exibida ao aluno<input className="input" value={b.note} onChange={(e) => updBlock(i, { ...b, note: e.target.value })} /></label>}
                {b.type === "episode" && <div className="form-grid"><input className="input" value={b.challenge} onChange={(e) => updBlock(i, { ...b, challenge: e.target.value })} aria-label="Desafio" /><textarea className="textarea" value={b.text} onChange={(e) => updBlock(i, { ...b, text: e.target.value })} aria-label="Texto" />{b.steps.map((s, k) => <div key={k} className="flex gap-2"><input className="input" value={s.title} onChange={(e) => updBlock(i, { ...b, steps: b.steps.map((x, j) => j === k ? { ...x, title: e.target.value } : x) })} aria-label={`Etapa ${k + 1} título`} /><input className="input flex-[2]" value={s.detail} onChange={(e) => updBlock(i, { ...b, steps: b.steps.map((x, j) => j === k ? { ...x, detail: e.target.value } : x) })} aria-label={`Etapa ${k + 1} detalhe`} /></div>)}</div>}
                {b.type === "checkpoint" && <div className="form-grid"><input className="input" value={b.intro} onChange={(e) => updBlock(i, { ...b, intro: e.target.value })} aria-label="Introdução" />{b.items.map((s, k) => <div key={k} className="grid gap-1 md:grid-cols-3"><input className="input" value={s.title} onChange={(e) => updBlock(i, { ...b, items: b.items.map((x, j) => j === k ? { ...x, title: e.target.value } : x) })} aria-label="Título" /><input className="input" value={s.question} onChange={(e) => updBlock(i, { ...b, items: b.items.map((x, j) => j === k ? { ...x, question: e.target.value } : x) })} aria-label="Pergunta" /><input className="input" value={s.answer} onChange={(e) => updBlock(i, { ...b, items: b.items.map((x, j) => j === k ? { ...x, answer: e.target.value } : x) })} aria-label="Resposta" /></div>)}</div>}
              </div>
            ))}
          </div>
          <div className="flex gap-2 mt-3 flex-wrap">
            <button className="btn btn-sm btn-secondary" onClick={() => setBlocks((bs) => [...bs, { type: "html", html: "<p></p>" }])}>Adicionar bloco de texto</button>
            {data.questions.filter((q) => !blocks.some((b) => b.type === "question" && b.slug === q.slug) && !q.slug.endsWith("-checagem")).map((q) => <button key={q.id} className="btn btn-sm btn-ghost" onClick={() => setBlocks((bs) => [...bs, { type: "question", slug: q.slug }])}>Inserir questão {q.slug}</button>)}
          </div>
        </section>
        <section className="card">
          <h2 className="text-base mb-2">Notas do professor <Badge tone="gold">privado</Badge></h2>
          <div className="form-grid">{GUIDE_KEYS.map(([k, label]) => <label key={k} className="text-[13px]">{label}<textarea className="textarea min-h-[60px]" value={String(guide[k] ?? "")} onChange={(e) => setGuide({ ...guide, [k]: e.target.value })} /></label>)}</div>
        </section>
        <section className="card">
          <h2 className="text-base mb-2">Questões desta página</h2>
          <div className="flex flex-col gap-3">{data.questions.map((q) => <QuestionEditor key={q.id} q={q} onSaved={() => router.refresh()} />)}</div>
        </section>
      </div>
      <aside className="flex flex-col gap-4">
        <section className="card form-grid">
          <label className="text-[13px]">Nota da alteração<input className="input" value={note} onChange={(e) => setNote(e.target.value)} placeholder="ex.: corrige exemplo de latência" /></label>
          <button className="btn btn-sm btn-secondary" onClick={() => save(false)}>Salvar rascunho</button>
          <button className="btn btn-sm" onClick={() => { if (confirm("Publicar nova versão? Respostas já dadas mantêm a versão anterior.")) save(true); }}>Publicar nova versão</button>
        </section>
        <section className="card form-grid">
          <h2 className="text-base">Página</h2>
          <label className="text-[13px]">Nível<select className="select" defaultValue={data.page.level} onChange={(e) => meta({ level: e.target.value })}><option value="essencial">essencial (aula)</option><option value="complementar">complementar (estudo)</option></select></label>
          <label className="text-[13px]">Versão de 120 min<select className="select" defaultValue={data.page.level120 ?? "assincrono"} onChange={(e) => meta({ level120: e.target.value })}><option value="essencial">essencial</option><option value="assincrono">assíncrono</option></select></label>
          <label className="text-[13px]">Minutos<input type="number" className="input" defaultValue={data.page.minutes} min={0} max={120} onBlur={(e) => meta({ minutes: Number(e.target.value) })} /></label>
          <label className="text-[13px]">Situação<select className="select" defaultValue={data.page.status} onChange={(e) => meta({ status: e.target.value })}><option value="published">publicada</option><option value="draft">oculta (rascunho)</option></select></label>
        </section>
        <section className="card">
          <h2 className="text-base mb-2">Versões</h2>
          <ul className="text-[13px] list-none p-0 m-0 grid gap-1">{data.versions.map((v) => <li key={v.id} className="flex items-center gap-2"><span>v{v.versionNo}</span>{v.isPublished ? <Badge tone="ok">publicada</Badge> : <button className="btn btn-sm btn-ghost" onClick={async () => { await api(`/api/professor/conteudo/paginas/${data.page.id}/publicar`, { body: { versionId: v.id } }); router.refresh(); }}>publicar esta</button>}<span className="hint">{fmtDT(v.createdAt)}{v.changeNote ? ` · ${v.changeNote}` : ""}</span></li>)}</ul>
        </section>
      </aside>
    </div>
  );
}

function QuestionEditor({ q, onSaved }: { q: Q; onSaved: () => void }) {
  const [open, setOpen] = useState(false);
  const [prompt, setPrompt] = useState(q.prompt);
  const [label, setLabel] = useState(q.label ?? "");
  const [alts, setAlts] = useState((q.options.alternatives ?? []).join("\n"));
  const [correct, setCorrect] = useState(typeof q.answerKey?.correct === "number" ? String(q.answerKey.correct + 1) : "");
  const [explanation, setExplanation] = useState(q.answerKey?.explanation ?? "");
  const [model, setModel] = useState(q.feedback?.modelAnswer ?? "");
  const [msg, setMsg] = useState<string | null>(null);
  return (
    <div className="border border-rule rounded p-3 bg-paper">
      <div className="flex items-center gap-2 flex-wrap"><Badge tone="ink">{q.kind}</Badge><span className="font-mono text-[12px]">{q.slug}</span><span className="hint">v{q.versionNo}</span><span className="text-[14px] flex-1 truncate">{q.prompt}</span><button className="btn btn-sm btn-ghost" onClick={() => setOpen(!open)}>{open ? "Fechar" : "Editar"}</button></div>
      {open && (
        <div className="form-grid mt-2">
          <label className="text-[13px]">Rótulo<input className="input" value={label} onChange={(e) => setLabel(e.target.value)} /></label>
          <label className="text-[13px]">Enunciado<textarea className="textarea" value={prompt} onChange={(e) => setPrompt(e.target.value)} /></label>
          {["single", "multi", "predict"].includes(q.kind) && <label className="text-[13px]">Alternativas (uma por linha)<textarea className="textarea" value={alts} onChange={(e) => setAlts(e.target.value)} /></label>}
          {q.kind === "single" && <label className="text-[13px]">Correta (número da linha)<input className="input max-w-[120px]" value={correct} onChange={(e) => setCorrect(e.target.value)} /></label>}
          {q.kind !== "predict" && <label className="text-[13px]">Explicação (mostrada após a resposta)<textarea className="textarea" value={explanation} onChange={(e) => setExplanation(e.target.value)} /></label>}
          {q.kind === "short_text" && <label className="text-[13px]">Resposta esperada<textarea className="textarea" value={model} onChange={(e) => setModel(e.target.value)} /></label>}
          <div className="flex items-center gap-2">
            <button className="btn btn-sm" onClick={async () => { setMsg(null); try { const options = { ...q.options, ...(["single", "multi", "predict"].includes(q.kind) ? { alternatives: alts.split("\n").map((s) => s.trim()).filter(Boolean) } : {}) }; const answerKey = q.kind === "single" ? { ...(q.answerKey ?? {}), correct: correct ? Number(correct) - 1 : null, explanation } : q.kind === "predict" ? null : { ...(q.answerKey ?? {}), explanation }; const feedback = q.kind === "short_text" ? { modelAnswer: model } : q.feedback; await api(`/api/professor/conteudo/questoes/${q.id}/versoes`, { body: { label: label || null, prompt, options, answerKey, feedback } }); setMsg("Nova versão da questão criada."); onSaved(); } catch (e) { setMsg(e instanceof ClientApiError ? e.message : "Falha"); } }}>Salvar nova versão</button>
            {msg && <span className="hint">{msg}</span>}
          </div>
          <p className="hint">A recuperação detalhada por alternativa (confusão, conceito, exemplo, nova pergunta) da versão original é preservada quando a estrutura de alternativas não muda.</p>
        </div>
      )}
    </div>
  );
}
