"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { api, ClientApiError } from "@/lib/client/api";
import { StatusBadge } from "@/components/ui";
import { ErrorBox, SuccessBox } from "@/components/forms";

type Edition = { id: string; year: number; label: string; status: string; classes: { id: string; code: string; name: string; status: string }[] };

export function EditionsPanel({ editions }: { editions: Edition[] }) {
  const router = useRouter();
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [year, setYear] = useState(String(new Date().getFullYear() + 1));
  const [dupFrom, setDupFrom] = useState<string>(editions[0]?.id ?? "");
  const run = async (fn: () => Promise<string>) => { setErr(null); setOk(null); try { setOk(await fn()); router.refresh(); } catch (e) { setErr(e instanceof ClientApiError ? e.message : "Falha"); } };
  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
      <div className="flex flex-col gap-4">
        <ErrorBox message={err} /><SuccessBox message={ok} />
        {editions.map((e) => (
          <section key={e.id} className="card">
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <h2>Ano {e.label}</h2><StatusBadge status={e.status} />
              <div className="flex-1" />
              {e.status !== "active" && <button className="btn btn-sm btn-secondary" onClick={() => run(async () => { await api(`/api/professor/edicoes/${e.id}/status`, { body: { status: "active" } }); return "Ano ativado."; })}>Ativar</button>}
              {e.status !== "archived" && <button className="btn btn-sm btn-ghost" onClick={() => { if (confirm(`Arquivar o ano ${e.label}? O histórico é mantido e novas interações ficam bloqueadas.`)) run(async () => { await api(`/api/professor/edicoes/${e.id}/status`, { body: { status: "archived" } }); return "Ano arquivado."; }); }}>Arquivar</button>}
            </div>
            <ul className="list-none p-0 m-0 grid gap-2">
              {e.classes.map((c) => (
                <li key={c.id} className="flex flex-wrap items-center gap-3 border border-rule rounded px-3 py-2 bg-paper">
                  <Link href={`/professor/turmas/${c.id}`} className="font-semibold">{c.name}</Link><span className="hint">{c.code}</span><StatusBadge status={c.status} />
                  <div className="flex-1" />
                  <button className="btn btn-sm btn-ghost" onClick={() => { const code = prompt("Código da nova turma (ex.: 2027-A):"); if (!code) return; const target = prompt("Ano de destino (ex.: 2027):", e.label); const ed = editions.find((x) => x.label === target); if (!ed) { setErr("Ano de destino não encontrado; crie-o antes."); return; } run(async () => { const r = await api<{ warning: string }>(`/api/professor/turmas/${c.id}/duplicar`, { body: { editionId: ed.id, code, name: `Turma ${target}` } }); return r.warning; }); }}>Duplicar turma</button>
                  {c.status === "active" && <button className="btn btn-sm btn-ghost" onClick={() => { if (confirm(`Arquivar ${c.name}?`)) run(async () => { await api(`/api/professor/turmas/${c.id}/arquivar`, { body: { policy: "read_only" } }); return "Turma arquivada (somente leitura para alunos)."; }); }}>Arquivar</button>}
                </li>
              ))}
            </ul>
            <form className="mt-3 flex flex-wrap gap-2 items-end" onSubmit={(ev) => { ev.preventDefault(); const fd = new FormData(ev.currentTarget); run(async () => { await api("/api/professor/turmas", { body: { editionId: e.id, code: String(fd.get("code")), name: String(fd.get("name") || "") } }); return "Turma criada."; }); }}>
              <label className="text-[13px]">Código<input name="code" className="input" placeholder="2026-B" required /></label>
              <label className="text-[13px]">Nome<input name="name" className="input" placeholder={`Turma ${e.label}`} /></label>
              <button className="btn btn-sm" type="submit">Nova turma em {e.label}</button>
            </form>
          </section>
        ))}
      </div>
      <aside className="flex flex-col gap-4">
        <section className="card">
          <h2 className="text-base mb-2">Novo ano letivo</h2>
          <label className="label" htmlFor="ny">Ano</label>
          <input id="ny" className="input" value={year} onChange={(e) => setYear(e.target.value)} inputMode="numeric" />
          <button className="btn btn-sm mt-3" onClick={() => run(async () => { await api("/api/professor/edicoes", { body: { year: Number(year), label: year } }); return `Ano ${year} criado, ainda sem conteúdo. Use "Copiar o conteúdo de um ano" para preenchê-lo.`; })}>Criar ano vazio</button>
        </section>
        <section className="card">
          <h2 className="text-base mb-2">Copiar o conteúdo de um ano</h2>
          <p className="hint mb-2">Copia unidades, capítulos, páginas publicadas, questões, rubricas, materiais e catálogo de bases. Não copia turmas, matrículas, grupos, respostas, frequência, entregas ou notas. Datas e prazos ficam por definir.</p>
          <label className="label" htmlFor="df">Copiar de</label>
          <select id="df" className="select" value={dupFrom} onChange={(e) => setDupFrom(e.target.value)}>{editions.map((e) => <option key={e.id} value={e.id}>{e.label}</option>)}</select>
          <label className="label mt-2" htmlFor="dy">Para o ano</label>
          <input id="dy" className="input" value={year} onChange={(e) => setYear(e.target.value)} inputMode="numeric" />
          <button className="btn btn-sm mt-3" onClick={() => run(async () => { const r = await api<{ warning: string; copied: { pages: number; questions: number } }>(`/api/professor/edicoes/${dupFrom}/duplicar`, { body: { year: Number(year), label: year } }); return `${r.copied.pages} páginas e ${r.copied.questions} questões copiadas. ${r.warning}`; })}>Copiar para {year}</button>
        </section>
      </aside>
    </div>
  );
}
