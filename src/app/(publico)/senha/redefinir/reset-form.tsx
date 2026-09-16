"use client";
import { useRouter } from "next/navigation";
import { PasswordFields } from "@/components/password-fields";
import { JsonForm } from "@/components/forms";

export function ResetForm({ token }: { token: string }) {
  const router = useRouter();
  return (
    <JsonForm action="/api/auth/redefinir" submitLabel="Salvar nova senha"
      transform={(fd) => ({ token, password: fd.get("password") })}
      onDone={() => { router.push("/entrar?m=redefinida"); }}>
      <PasswordFields />
    </JsonForm>
  );
}
