import type { ReactNode } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireClassAccess } from "@/lib/auth/guard";
import { ClassSubnav } from "@/components/professor/class-subnav";
import { StatusBadge } from "@/components/ui";

export default async function TurmaLayout({ children, params }: { children: ReactNode; params: Promise<{ id: string }> }) {
  const { id } = await params;
  let access;
  try { access = await requireClassAccess(id, ["professor"]); } catch { notFound(); }
  return (
    <div>
      <Link href="/professor/turmas" className="voltar">Turmas</Link>
      <div className="flex flex-wrap items-center gap-3 mb-4 mt-1">
        <h1 className="text-2xl">{access.cls.name}</h1>
        <p className="eyebrow">{access.cls.code} · ano {access.edition.label}</p>
        <StatusBadge status={access.cls.status} />
      </div>
      <ClassSubnav id={id} />
      <div className="mt-5">{children}</div>
    </div>
  );
}
