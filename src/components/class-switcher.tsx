"use client";
import { useRouter } from "next/navigation";
import { api } from "@/lib/client/api";

export function ClassSwitcher({ classes, currentId }: { classes: { id: string; name: string; code: string; label: string }[]; currentId: string | null }) {
  const router = useRouter();
  if (classes.length === 0) return null;
  if (classes.length === 1) return <span className="text-[12.5px] bg-gold text-ink font-bold rounded-full px-3 py-1">{classes[0].name}</span>;
  return (
    <label className="text-[12.5px] flex items-center gap-2">
      <span className="sr-only">Turma</span>
      <select className="bg-white/10 border border-white/30 rounded-full px-3 py-1 text-white min-h-[36px]" value={currentId ?? ""}
        onChange={async (e) => { await api("/api/turma/selecionar", { body: { classId: e.target.value } }); router.refresh(); }}>
        {classes.map((c) => <option key={c.id} value={c.id} className="text-body">{c.name} · {c.code}</option>)}
      </select>
    </label>
  );
}
