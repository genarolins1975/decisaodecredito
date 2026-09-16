import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireStaff } from "@/lib/auth/guard";
import { pageForEditor } from "@/lib/services/content-admin";
import { PageEditor } from "@/components/professor/page-editor";

export const metadata: Metadata = { title: "Editar página" };

export default async function EditarPaginaPage({ params }: { params: Promise<{ pid: string }> }) {
  const { pid } = await params;
  await requireStaff();
  let data;
  try { data = await pageForEditor(pid); } catch { notFound(); }
  return <PageEditor data={JSON.parse(JSON.stringify(data))} />;
}
