"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { api, ClientApiError } from "@/lib/client/api";
import { ErrorBox, SuccessBox } from "@/components/forms";
import { toLocalInput } from "@/lib/time";
import { rotuloUnidade } from "@/lib/content/capitulo";

export function NewAssignmentForm({ classId, units }: { classId: string; units: { id: string; number: number; title: string; kind: string }[] }) {
  const router = useRouter();
  const [err, setErr] = useState<string | null>(null);
  return (
    <details className="card">
      <summary className="cursor-pointer font-serif font-bold text-ink">Novo trabalho</summary>
      <form className="form-grid form-grid-2 mt-3" onSubmit={async (e) => { e.preventDefault(); const fd = new FormData(e.currentTarget); setErr(null); try { const r = await api<{ id: string }>(`/api/professor/turmas/${classId}/trabalhos`, { body: { title: String(fd.get("title")), slug: String(fd.get("slug")), unitId: String(fd.get("unitId") || "") || null, mode: String(fd.get("mode")) } }); router.push(`/professor/turmas/${classId}/trabalhos/${r.id}`); } catch (ex) { setErr(ex instanceof ClientApiError ? ex.message : "Falha"); } }}>
        <ErrorBox message={err} />
        <label className="text-[13px]">Título<input name="title" className="input" required /></label>
        <label className="text-[13px]">Identificador (letras minúsculas e hífen)<input name="slug" className="input" required pattern="[a-z0-9\-]{3,60}" placeholder="ex.: relatorio-validacao" /></label>
        <label className="text-[13px]">Unidade<select name="unitId" className="select"><option value="">—</option>{units.map((u) => <option key={u.id} value={u.id}>{rotuloUnidade(u)}: {u.title}</option>)}</select></label>
        <label className="text-[13px]">Modo<select name="mode" className="select"><option value="individual">individual</option><option value="grupo">grupo</option></select></label>
        <div><button className="btn btn-sm" type="submit">Criar rascunho</button></div>
      </form>
    </details>
  );
}

type A = { id: string; title: string; description: string; objectives: string | null; prerequisites: string | null; materials: string | null; deliverables: string[]; allowedFormats: string[]; maxFileMb: number; mode: string; dueAt: string | null; latePolicy: { acceptLate: boolean; penaltyPerDayPct: number; startedBeforeDeadlineCounts: boolean; graceMinutes?: number; hardDeadlineAt?: string | null }; rubricVersionId: string | null; weight: string | null; status: string; blindTestEnabled: boolean; unitId: string | null };

export function AssignmentEditForm({ classId, a, rubrics, units }: { classId: string; a: A; rubrics: { id: string; label: string }[]; units: { id: string; number: number; title: string; kind: string }[] }) {
  const router = useRouter();
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  return (
    <form className="form-grid form-grid-2" onSubmit={async (e) => {
      e.preventDefault(); const fd = new FormData(e.currentTarget); setErr(null); setOk(null);
      const body = {
        title: String(fd.get("title")), description: String(fd.get("description")), objectives: String(fd.get("objectives") || "") || null, prerequisites: String(fd.get("prerequisites") || "") || null, materials: String(fd.get("materials") || "") || null,
        deliverables: String(fd.get("deliverables")).split("\n").map((s) => s.trim()).filter(Boolean), allowedFormats: fd.getAll("formats").map(String), maxFileMb: Number(fd.get("maxFileMb")), mode: String(fd.get("mode")),
        dueAt: String(fd.get("dueAt") || "") || null, latePolicy: { acceptLate: fd.get("acceptLate") === "on", penaltyPerDayPct: Number(fd.get("penalty") || 0), startedBeforeDeadlineCounts: fd.get("started") === "on", graceMinutes: Number(fd.get("grace") || 15), hardDeadlineAt: String(fd.get("hard") || "") || null },
        rubricVersionId: String(fd.get("rubric") || "") || null, weight: fd.get("weight") ? Number(fd.get("weight")) : null, unitId: String(fd.get("unitId") || "") || null, blindTestEnabled: fd.get("blind") === "on",
      };
      try { await api(`/api/professor/turmas/${classId}/trabalhos/${a.id}`, { method: "PATCH", body }); setOk("Trabalho salvo."); router.refresh(); } catch (ex) { setErr(ex instanceof ClientApiError ? ex.message : "Falha"); }
    }}>
      <div className="md:col-span-2"><ErrorBox message={err} /><SuccessBox message={ok} /></div>
      <label className="text-[13px] md:col-span-2">Título<input name="title" className="input" defaultValue={a.title} required /></label>
      <label className="text-[13px] md:col-span-2">Enunciado<textarea name="description" className="textarea min-h-[120px]" defaultValue={a.description} /></label>
      <label className="text-[13px]">Objetivos<textarea name="objectives" className="textarea" defaultValue={a.objectives ?? ""} /></label>
      <label className="text-[13px]">Pré-requisitos<textarea name="prerequisites" className="textarea" defaultValue={a.prerequisites ?? ""} /></label>
      <label className="text-[13px]">Materiais<textarea name="materials" className="textarea" defaultValue={a.materials ?? ""} /></label>
      <label className="text-[13px]">Entregáveis (um por linha)<textarea name="deliverables" className="textarea" defaultValue={a.deliverables.join("\n")} /></label>
      <fieldset className="text-[13px]"><legend className="label">Formatos aceitos</legend><div className="flex flex-wrap gap-3">{["pdf", "zip", "csv", "ipynb", "md", "txt", "py", "json", "link"].map((f) => <label key={f} className="flex items-center gap-1"><input type="checkbox" name="formats" value={f} defaultChecked={a.allowedFormats.includes(f)} className="w-4 h-4 accent-ink" />{f}</label>)}</div></fieldset>
      <label className="text-[13px]">Tamanho máximo por arquivo (MB)<input name="maxFileMb" type="number" min={1} max={500} className="input" defaultValue={a.maxFileMb} /></label>
      <label className="text-[13px]">Modo<select name="mode" className="select" defaultValue={a.mode}><option value="individual">individual</option><option value="grupo">grupo (entrega coletiva, defesa individual)</option></select></label>
      <label className="text-[13px]">Unidade<select name="unitId" className="select" defaultValue={a.unitId ?? ""}><option value="">—</option>{units.map((u) => <option key={u.id} value={u.id}>{rotuloUnidade(u)}: {u.title}</option>)}</select></label>
      <label className="text-[13px]">Prazo (horário de São Paulo)<input name="dueAt" type="datetime-local" className="input" defaultValue={toLocalInput(a.dueAt ? new Date(a.dueAt) : null)} /></label>
      <label className="text-[13px]">Prazo final absoluto (opcional)<input name="hard" type="datetime-local" className="input" defaultValue={toLocalInput(a.latePolicy.hardDeadlineAt ? new Date(a.latePolicy.hardDeadlineAt) : null)} /></label>
      <label className="text-[13px] flex items-center gap-2"><input type="checkbox" name="acceptLate" defaultChecked={a.latePolicy.acceptLate} className="w-4 h-4 accent-ink" />Aceitar envio atrasado</label>
      <label className="text-[13px]">Desconto por dia de atraso (%)<input name="penalty" type="number" min={0} max={100} className="input" defaultValue={a.latePolicy.penaltyPerDayPct} /></label>
      <label className="text-[13px] flex items-center gap-2"><input type="checkbox" name="started" defaultChecked={a.latePolicy.startedBeforeDeadlineCounts} className="w-4 h-4 accent-ink" />Upload iniciado antes do prazo e concluído na tolerância não é atraso</label>
      <label className="text-[13px]">Tolerância (min)<input name="grace" type="number" min={0} max={240} className="input" defaultValue={a.latePolicy.graceMinutes ?? 15} /></label>
      <label className="text-[13px]">Rubrica<select name="rubric" className="select" defaultValue={a.rubricVersionId ?? ""}><option value="">sem rubrica</option>{rubrics.map((r) => <option key={r.id} value={r.id}>{r.label}</option>)}</select></label>
      <label className="text-[13px]">Peso na nota final (opcional)<input name="weight" type="number" step="0.001" min={0} max={100} className="input" defaultValue={a.weight ?? ""} /></label>
      <label className="text-[13px] flex items-center gap-2"><input type="checkbox" name="blind" defaultChecked={a.blindTestEnabled} className="w-4 h-4 accent-ink" />Teste cego (congelamento + OOT)</label>
      <div className="md:col-span-2 flex gap-2"><button className="btn btn-sm" type="submit">Salvar</button></div>
    </form>
  );
}
