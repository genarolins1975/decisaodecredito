"use client";
import { useRouter } from "next/navigation";
import { Field, JsonForm } from "@/components/forms";

export function ActivateForm({ initialCode }: { initialCode: string }) {
  const router = useRouter();
  return (
    <JsonForm action="/api/auth/ativar" submitLabel="Validar credencial" busyLabel="Validando…"
      onDone={(d) => { const r = d as { next: string }; router.push(r.next); router.refresh(); }}>
      <Field label="Código de primeiro acesso" hint="12 caracteres, sem distinção entre maiúsculas e minúsculas.">
        {(id, ab) => <input id={id} name="code" defaultValue={initialCode} required className="input font-mono tracking-widest uppercase" autoComplete="one-time-code" inputMode="text" aria-describedby={ab} />}
      </Field>
    </JsonForm>
  );
}
