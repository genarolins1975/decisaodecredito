"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { api, ClientApiError } from "@/lib/client/api";
import { StatusBadge } from "@/components/ui";
import { ErrorBox, SuccessBox } from "@/components/forms";
import { fmtDT, toLocalInput } from "@/lib/time";

type Meeting = { id: string; number: number; title: string; unitId: string | null; scheduledAt: string | null; endsAt: string | null; location: string | null; videoUrl: string | null; status: string; countsForAttendance: boolean; preparation: string | null };
type Session = { id: string; meetingId: string; status: string; openedAt: string | null; meetingTitle: string };

export function MeetingsPanel({ classId, meetings, sessions, units }: { classId: string; meetings: Meeting[]; sessions: Session[]; units: { id: string; number: number; title: string; kind: string }[] }) {
  const router = useRouter();
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const run = async (fn: () => Promise<string>) => { setErr(null); setOk(null); try { setOk(await fn()); router.refresh(); } catch (e) { setErr(e instanceof ClientApiError ? e.message : "Falha"); } };

  return (
    <div className="flex flex-col gap-4">
      <ErrorBox message={err} /><SuccessBox message={ok} />
      {meetings.length === 0 && (
        <div className="panel-soft flex flex-wrap items-center gap-3">
          <p className="text-[14px]">Nenhum encontro. Crie os quatro encontros padrão (um por aula, sem datas) ou adicione manualmente.</p>
          <button className="btn btn-sm" onClick={() => run(async () => { const r = await api<{ created: number }>(`/api/professor/turmas/${classId}/encontros`, { body: { scaffold: true } }); return `${r.created} encontro(s) criado(s). Defina as datas.`; })}>Criar encontros padrão</button>
        </div>
      )}
      {meetings.map((m) => {
        const ss = sessions.filter((s) => s.meetingId === m.id);
        return (
          <section key={m.id} className="card">
            <div className="flex flex-wrap items-center gap-3">
              <p className="eyebrow">Encontro {m.number}</p>
              <h2 className="text-lg">{m.title}</h2>
              <StatusBadge status={m.status === "cancelled" ? "cancelled_meeting" : m.status} />
              {!m.countsForAttendance && <span className="badge badge-muted">não conta na frequência</span>}
              <div className="flex-1" />
              <button className="btn btn-sm btn-ghost" onClick={() => setEditing(editing === m.id ? null : m.id)}>{editing === m.id ? "Fechar" : "Editar"}</button>
            </div>
            <p className="hint mt-1">{fmtDT(m.scheduledAt) || "sem data"}{m.endsAt ? ` até ${fmtDT(m.endsAt)}` : ""}{m.location ? ` · ${m.location}` : ""}{m.videoUrl ? " · videoconferência configurada" : ""}</p>
            {m.preparation && <p className="text-[14px] mt-1"><b>Preparação:</b> {m.preparation}</p>}
            {editing === m.id && (
              <form className="form-grid form-grid-2 mt-3 panel-soft" onSubmit={(e) => { e.preventDefault(); const fd = new FormData(e.currentTarget); run(async () => { await api(`/api/professor/turmas/${classId}/encontros/${m.id}`, { method: "PATCH", body: { title: String(fd.get("title")), scheduledAt: String(fd.get("scheduledAt") || "") || null, endsAt: String(fd.get("endsAt") || "") || null, location: String(fd.get("location") || "") || null, videoUrl: String(fd.get("videoUrl") || "") || null, countsForAttendance: fd.get("counts") === "on", preparation: String(fd.get("preparation") || "") || null, status: String(fd.get("status")) as "planned", unitId: String(fd.get("unitId") || "") || null } }); setEditing(null); return "Encontro atualizado."; }); }}>
                <label className="text-[13px]">Título<input name="title" className="input" defaultValue={m.title} required /></label>
                <label className="text-[13px]">Unidade (aula)<select name="unitId" className="select" defaultValue={m.unitId ?? ""}><option value="">—</option>{units.map((u) => <option key={u.id} value={u.id}>{u.kind === "trabalho" ? "Trabalho final" : `Aula ${u.number}`}: {u.title}</option>)}</select></label>
                <label className="text-[13px]">Início (horário de São Paulo)<input name="scheduledAt" type="datetime-local" className="input" defaultValue={toLocalInput(m.scheduledAt ? new Date(m.scheduledAt) : null)} /></label>
                <label className="text-[13px]">Fim<input name="endsAt" type="datetime-local" className="input" defaultValue={toLocalInput(m.endsAt ? new Date(m.endsAt) : null)} /></label>
                <label className="text-[13px]">Local<input name="location" className="input" defaultValue={m.location ?? ""} /></label>
                <label className="text-[13px]">Link de videoconferência<input name="videoUrl" type="url" className="input" defaultValue={m.videoUrl ?? ""} placeholder="https://" /></label>
                <label className="text-[13px]">Situação<select name="status" className="select" defaultValue={m.status}><option value="planned">planejado</option><option value="done">realizado</option><option value="cancelled">cancelado (sai do denominador)</option></select></label>
                <label className="text-[13px] flex items-center gap-2 self-end"><input type="checkbox" name="counts" defaultChecked={m.countsForAttendance} className="w-4 h-4 accent-ink" />Conta na frequência</label>
                <label className="text-[13px] md:col-span-2">O que preparar (visível ao aluno)<textarea name="preparation" className="textarea" defaultValue={m.preparation ?? ""} /></label>
                <div><button className="btn btn-sm" type="submit">Salvar</button></div>
              </form>
            )}
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {ss.map((s) => <Link key={s.id} href={`/professor/aovivo/${s.id}`} className="btn btn-sm btn-secondary">Sessão {s.status === "open" ? "aberta" : s.status === "closed" ? "encerrada" : "em rascunho"}{s.openedAt ? ` · ${fmtDT(s.openedAt)}` : ""}</Link>)}
              {m.status !== "cancelled" && <button className="btn btn-sm" onClick={() => run(async () => { const r = await api<{ sessionId: string }>(`/api/professor/turmas/${classId}/encontros/${m.id}/sessao`, { body: {} }); router.push(`/professor/aovivo/${r.sessionId}`); return "Sessão criada."; })}>Nova sessão ao vivo</button>}
            </div>
          </section>
        );
      })}
      <section className="card">
        <h2 className="text-base mb-2">Adicionar encontro</h2>
        <form className="form-grid form-grid-2" onSubmit={(e) => { e.preventDefault(); const fd = new FormData(e.currentTarget); const form = e.currentTarget; run(async () => { await api(`/api/professor/turmas/${classId}/encontros`, { body: { title: String(fd.get("title")), scheduledAt: String(fd.get("scheduledAt") || "") || null, unitId: String(fd.get("unitId") || "") || null, replacementOfId: String(fd.get("replacementOfId") || "") || null } }); form.reset(); return "Encontro criado."; }); }}>
          <label className="text-[13px]">Título<input name="title" className="input" required placeholder="Ex.: Reposição da aula 2" /></label>
          <label className="text-[13px]">Início<input name="scheduledAt" type="datetime-local" className="input" /></label>
          <label className="text-[13px]">Unidade<select name="unitId" className="select"><option value="">—</option>{units.map((u) => <option key={u.id} value={u.id}>{u.kind === "trabalho" ? "Trabalho final" : `Aula ${u.number}`}: {u.title}</option>)}</select></label>
          <label className="text-[13px]">Reposição de<select name="replacementOfId" className="select"><option value="">—</option>{meetings.map((m) => <option key={m.id} value={m.id}>Encontro {m.number}: {m.title}</option>)}</select></label>
          <div><button className="btn btn-sm" type="submit">Criar</button></div>
        </form>
      </section>
    </div>
  );
}
