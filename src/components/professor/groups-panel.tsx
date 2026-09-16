"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { api, ClientApiError } from "@/lib/client/api";
import { ErrorBox, SuccessBox } from "@/components/forms";

type Group = { id: string; name: string; datasetId: string | null; members: { userId: string; name: string; leftAt: string | null }[] };

export function GroupsPanel({ classId, groups, students, datasets }: { classId: string; groups: Group[]; students: { userId: string; name: string; status: string }[]; datasets: { id: string; code: string; name: string; status: string }[] }) {
  const router = useRouter();
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const run = async (fn: () => Promise<string | void>) => { setErr(null); setOk(null); try { const m = await fn(); if (m) setOk(m); router.refresh(); } catch (e) { setErr(e instanceof ClientApiError ? e.message : "Falha"); } };
  const inGroup = new Set(groups.flatMap((g) => g.members.filter((m) => !m.leftAt).map((m) => m.userId)));
  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div className="flex flex-col gap-3">
        <ErrorBox message={err} /><SuccessBox message={ok} />
        <p className="hint">Mudanças de composição valem daqui em diante: entregas já feitas mantêm a autoria congelada no recibo. Uma pessoa participa de um grupo ativo por vez.</p>
        {groups.map((g) => (
          <section key={g.id} className="card">
            <div className="flex flex-wrap items-center gap-3"><h2 className="text-lg">{g.name}</h2>
              <label className="text-[13px] flex items-center gap-2">Base<select className="select min-h-[36px]" value={g.datasetId ?? ""} onChange={(e) => run(async () => { await api(`/api/professor/turmas/${classId}/grupos/${g.id}/membros`, { body: { datasetId: e.target.value || null } }); return "Base atribuída."; })}><option value="">—</option>{datasets.map((d) => <option key={d.id} value={d.id}>{d.code} · {d.name} ({d.status})</option>)}</select></label></div>
            <ul className="mt-2 flex flex-wrap gap-2 list-none p-0 m-0">
              {g.members.filter((m) => !m.leftAt).map((m) => <li key={m.userId} className="border border-rule rounded px-2 py-1 text-[13.5px] flex items-center gap-2">{m.name}<button className="btn btn-sm btn-ghost" aria-label={`Remover ${m.name}`} onClick={() => run(async () => { await api(`/api/professor/turmas/${classId}/grupos/${g.id}/membros`, { body: { userId: m.userId, action: "remove" } }); })}>×</button></li>)}
              {g.members.filter((m) => m.leftAt).map((m) => <li key={m.userId} className="hint line-through px-2 py-1 text-[13px]">{m.name}</li>)}
            </ul>
            <div className="mt-2 flex gap-2 items-end">
              <label className="text-[13px]">Adicionar<select className="select min-h-[36px]" id={`add-${g.id}`}><option value="">—</option>{students.filter((s) => !inGroup.has(s.userId)).map((s) => <option key={s.userId} value={s.userId}>{s.name}{s.status !== "ativo" ? ` (${s.status})` : ""}</option>)}</select></label>
              <button className="btn btn-sm btn-secondary" onClick={() => { const sel = document.getElementById(`add-${g.id}`) as HTMLSelectElement; if (sel.value) run(async () => { await api(`/api/professor/turmas/${classId}/grupos/${g.id}/membros`, { body: { userId: sel.value, action: "add" } }); }); }}>Adicionar</button>
            </div>
          </section>
        ))}
        {groups.length === 0 && <p className="hint">Nenhum grupo.</p>}
      </div>
      <aside className="card self-start">
        <h2 className="text-base mb-2">Novo grupo</h2>
        <form className="form-grid" onSubmit={(e) => { e.preventDefault(); const fd = new FormData(e.currentTarget); const form = e.currentTarget; run(async () => { await api(`/api/professor/turmas/${classId}/grupos`, { body: { name: String(fd.get("name")), datasetId: String(fd.get("datasetId") || "") || null } }); form.reset(); return "Grupo criado."; }); }}>
          <label className="text-[13px]">Nome<input name="name" className="input" required placeholder="Grupo 1" /></label>
          <label className="text-[13px]">Base<select name="datasetId" className="select"><option value="">—</option>{datasets.map((d) => <option key={d.id} value={d.id}>{d.code} · {d.name}</option>)}</select></label>
          <button className="btn btn-sm" type="submit">Criar</button>
        </form>
        <p className="hint mt-3">Alunos sem grupo: {students.filter((s) => !inGroup.has(s.userId)).map((s) => s.name).join(", ") || "nenhum"}.</p>
      </aside>
    </div>
  );
}
