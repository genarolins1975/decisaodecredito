"use client";
import { useRouter } from "next/navigation";
import { JsonForm } from "@/components/forms";
import { PasswordFields } from "@/components/password-fields";

export function SetPasswordForm() {
  const router = useRouter();
  return (
    <JsonForm action="/api/auth/senha" submitLabel="Salvar senha e continuar" transform={(fd) => ({ password: fd.get("password") })}
      onDone={(d) => { router.push((d as { next: string }).next); router.refresh(); }}>
      <PasswordFields />
    </JsonForm>
  );
}
