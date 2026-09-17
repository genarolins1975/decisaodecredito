"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { api } from "@/lib/client/api";
import { Field, JsonForm } from "@/components/forms";

export function ProfileForm({ firstAccess = false }: { firstAccess?: boolean }) {
  const router = useRouter();
  const [initial, setInitial] = useState<{ name: string; semNome: boolean; phone: string; linkedinUrl: string } | null>(null);
  useEffect(() => { api<{ user: { name: string }; profile: { phone: string | null; linkedinUrl: string | null } }>("/api/perfil").then((d) => setInitial({ name: d.user.name.includes("@") ? "" : d.user.name, semNome: d.user.name.includes("@"), phone: d.profile.phone ?? "", linkedinUrl: d.profile.linkedinUrl ?? "" })).catch(() => setInitial({ name: "", semNome: false, phone: "", linkedinUrl: "" })); }, []);
  if (!initial) return <p className="hint">Carregando…</p>;
  const done = () => { router.push(firstAccess ? "/inicio" : "/perfil"); router.refresh(); };
  return (
    <div className="form-grid">
      <JsonForm action="/api/perfil" method="PATCH" submitLabel={firstAccess ? "Salvar e entrar" : "Salvar"}
        transform={(fd) => ({ name: String(fd.get("name") ?? ""), phone: String(fd.get("phone") ?? ""), linkedinUrl: String(fd.get("linkedinUrl") ?? ""), completeOnboarding: true })}
        onDone={done}>
        <Field label="Nome completo" hint={initial.semNome ? "Seu cadastro veio só com o e-mail. Informe o nome como deve aparecer para o professor e nos registros do curso." : "Como deve aparecer para o professor e nos registros do curso."}>
          {(id, ab) => <input id={id} name="name" type="text" defaultValue={initial.name} className="input" autoComplete="name" required minLength={3} aria-describedby={ab} />}
        </Field>
        <Field label="Telefone (opcional)" hint="Com DDD. Ex.: (11) 99999-9999. Só é validado se preenchido.">
          {(id, ab) => <input id={id} name="phone" type="tel" defaultValue={initial.phone} className="input" autoComplete="tel" aria-describedby={ab} />}
        </Field>
        <Field label="URL do LinkedIn (opcional)" hint="Ex.: https://www.linkedin.com/in/seu-nome. Nada é consultado ou extraído do LinkedIn.">
          {(id, ab) => <input id={id} name="linkedinUrl" type="url" defaultValue={initial.linkedinUrl} className="input" aria-describedby={ab} />}
        </Field>
      </JsonForm>
      {firstAccess && !initial.semNome && (
        <button type="button" className="btn btn-ghost" onClick={async () => { await api("/api/perfil", { method: "PATCH", body: { completeOnboarding: true } }); done(); }}>
          Preencher depois
        </button>
      )}
    </div>
  );
}
