import Link from "next/link";
import type { ReactNode } from "react";

export function Badge({ tone = "muted", children }: { tone?: "ink" | "ok" | "warn" | "alert" | "muted" | "gold"; children: ReactNode }) {
  return <span className={`badge badge-${tone}`}>{children}</span>;
}

export function Callout({ tone = "gold", title, children }: { tone?: "gold" | "alert" | "ok" | "warn"; title?: string; children: ReactNode }) {
  return (
    <div className={`callout ${tone === "gold" ? "" : `callout-${tone}`}`} role={tone === "alert" ? "alert" : undefined}>
      {title && <p className="font-bold text-ink text-[14px] mb-1">{title}</p>}
      <div className="text-[14.5px]">{children}</div>
    </div>
  );
}

export function Empty({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="panel-soft text-center py-10">
      <p className="font-serif text-ink text-lg font-bold">{title}</p>
      {children && <div className="hint mt-2 max-w-md mx-auto">{children}</div>}
    </div>
  );
}

export function PageHeader({ eyebrow, title, lead, actions }: { eyebrow?: ReactNode; title: string; lead?: ReactNode; actions?: ReactNode }) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-4 mb-6">
      <div className="min-w-0">
        {eyebrow && <p className="eyebrow mb-1">{eyebrow}</p>}
        <h1>{title}</h1>
        {lead && <p className="mt-2 text-[15.5px] text-body max-w-[64ch]">{lead}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2 no-print">{actions}</div>}
    </header>
  );
}

export function Stat({ label, value, hint, tone }: { label: string; value: ReactNode; hint?: ReactNode; tone?: "alert" | "ok" | "warn" }) {
  return (
    <div className="card-flat">
      <p className="eyebrow">{label}</p>
      <p className={`font-serif text-3xl font-bold mt-1 ${tone === "alert" ? "text-alert" : tone === "ok" ? "text-ok" : tone === "warn" ? "text-warn" : "text-ink"}`}>{value}</p>
      {hint && <p className="hint mt-1">{hint}</p>}
    </div>
  );
}

export function ButtonLink({ href, children, variant = "primary", className = "" }: { href: string; children: ReactNode; variant?: "primary" | "secondary" | "ghost"; className?: string }) {
  return <Link href={href} className={`btn ${variant === "secondary" ? "btn-secondary" : variant === "ghost" ? "btn-ghost" : ""} ${className}`}>{children}</Link>;
}

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { tone: "ink" | "ok" | "warn" | "alert" | "muted" | "gold"; label: string }> = {
    autorizado: { tone: "muted", label: "Autorizado · aguardando convite" }, convidado: { tone: "warn", label: "Convidado" }, ativo: { tone: "ok", label: "Ativo" },
    suspenso: { tone: "alert", label: "Suspenso" }, encerrado: { tone: "muted", label: "Encerrado" },
    queued: { tone: "warn", label: "Na fila" }, sending: { tone: "warn", label: "Enviando" }, accepted: { tone: "ok", label: "Aceito pelo Gmail" }, failed: { tone: "alert", label: "Falhou" }, cancelled: { tone: "muted", label: "Cancelado" },
    draft: { tone: "muted", label: "Rascunho" }, open: { tone: "ok", label: "Aberta" }, closed: { tone: "muted", label: "Encerrada" }, released: { tone: "ink", label: "Resultados liberados" },
    published: { tone: "ok", label: "Publicado" }, active: { tone: "ok", label: "Ativa" }, archived: { tone: "muted", label: "Arquivada" },
    planned: { tone: "ink", label: "Planejado" }, done: { tone: "ok", label: "Realizado" }, cancelled_meeting: { tone: "alert", label: "Cancelado" },
    rascunho: { tone: "muted", label: "Rascunho" }, enviado: { tone: "ok", label: "Enviado" }, atrasado: { tone: "warn", label: "Enviado com atraso" }, devolvido: { tone: "alert", label: "Devolvido para revisão" },
    reenviado: { tone: "ok", label: "Reenviado" }, corrigido: { tone: "ink", label: "Corrigido" }, publicado: { tone: "ok", label: "Resultado publicado" },
    nao_corrigido: { tone: "muted", label: "Não corrigido" }, dispensado: { tone: "ink", label: "Dispensado" }, nao_entregue: { tone: "alert", label: "Não entregue" }, zero: { tone: "alert", label: "Nota zero" },
    presente: { tone: "ok", label: "Presente" }, ausente: { tone: "alert", label: "Ausente" }, atrasado_freq: { tone: "warn", label: "Atrasado" }, justificado: { tone: "ink", label: "Justificado" }, pendente: { tone: "warn", label: "Pendente de validação" },
    pendente_step: { tone: "muted", label: "Pendente" }, em_andamento: { tone: "warn", label: "Em andamento" }, concluida: { tone: "ok", label: "Concluída" }, validada: { tone: "ink", label: "Validada" },
    disponivel: { tone: "ok", label: "Disponível" }, essencial: { tone: "ink", label: "Essencial" }, complementar: { tone: "muted", label: "Complementar" },
  };
  const m = map[status] ?? { tone: "muted" as const, label: status };
  return <Badge tone={m.tone}>{m.label}</Badge>;
}
