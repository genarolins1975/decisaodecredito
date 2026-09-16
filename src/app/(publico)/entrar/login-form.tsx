"use client";
import { useRouter } from "next/navigation";
import { Field, JsonForm } from "@/components/forms";

export function LoginForm({ next }: { next?: string }) {
  const router = useRouter();
  return (
    <JsonForm action="/api/auth/login" submitLabel="Entrar" busyLabel="Verificando…"
      onDone={(d) => { const r = d as { next: string; mustChangePassword: boolean }; router.push(r.mustChangePassword ? "/senha/definir" : (next && next.startsWith("/") ? next : r.next)); router.refresh(); }}>
      <Field label="E-mail">{(id, ab) => <input id={id} name="email" type="email" autoComplete="username" required className="input" aria-describedby={ab} />}</Field>
      <Field label="Senha">{(id, ab) => <input id={id} name="password" type="password" autoComplete="current-password" required className="input" aria-describedby={ab} />}</Field>
    </JsonForm>
  );
}
