"use client";
import { useState } from "react";
import { Field, JsonForm, SuccessBox } from "@/components/forms";

export function RecoverForm() {
  const [msg, setMsg] = useState<string | null>(null);
  if (msg) return <SuccessBox message={msg} />;
  return (
    <JsonForm action="/api/auth/recuperar" submitLabel="Enviar link" onDone={(d) => setMsg((d as { message: string }).message)}>
      <Field label="E-mail">{(id, ab) => <input id={id} name="email" type="email" required className="input" autoComplete="username" aria-describedby={ab} />}</Field>
    </JsonForm>
  );
}
