"use client";
import { useState } from "react";
import { Field } from "@/components/forms";

/** A confirmação vai com nome para que o JsonForm barre o envio quando as duas senhas divergem:
    o formulário é noValidate, então o aviso na tela sozinho não impedia o envio da primeira senha. */
export function PasswordFields({ withCurrent = false }: { withCurrent?: boolean }) {
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const mismatch = pw2.length > 0 && pw !== pw2;
  return (
    <>
      {withCurrent && <Field label="Senha atual">{(id, ab) => <input id={id} name="current" type="password" autoComplete="current-password" required className="input" aria-describedby={ab} />}</Field>}
      <Field label="Nova senha" hint="Mínimo de 10 caracteres. Evite só números e não use o seu e-mail.">
        {(id, ab) => <input id={id} name="password" type="password" autoComplete="new-password" required minLength={10} className="input" value={pw} onChange={(e) => setPw(e.target.value)} aria-describedby={ab} />}
      </Field>
      <Field label="Confirme a nova senha" error={mismatch ? "As senhas não coincidem." : undefined}>
        {(id, ab) => <input id={id} name="passwordConfirm" type="password" autoComplete="new-password" required className="input" value={pw2} onChange={(e) => setPw2(e.target.value)} aria-invalid={mismatch} aria-describedby={ab} />}
      </Field>
    </>
  );
}
