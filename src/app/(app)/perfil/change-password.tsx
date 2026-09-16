"use client";
import { useState } from "react";
import { JsonForm, SuccessBox } from "@/components/forms";
import { PasswordFields } from "@/components/password-fields";

export function ChangePasswordForm() {
  const [ok, setOk] = useState(false);
  return (
    <div className="form-grid">
      <SuccessBox message={ok ? "Senha alterada." : null} />
      <JsonForm action="/api/auth/senha" submitLabel="Trocar senha" transform={(fd) => ({ current: fd.get("current"), password: fd.get("password") })} onDone={() => setOk(true)}>
        <PasswordFields withCurrent />
      </JsonForm>
    </div>
  );
}
