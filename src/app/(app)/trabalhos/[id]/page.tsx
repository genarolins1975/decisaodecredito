import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireContext } from "@/lib/context";
import { getAssignment } from "@/lib/services/assignments";
import { AssignmentStudent } from "@/components/assignments/assignment-student";

export const metadata: Metadata = { title: "Trabalho" };

export default async function TrabalhoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ctx = await requireContext();
  try { await getAssignment(ctx.current.classId, id, ctx.current.role !== "aluno"); } catch { notFound(); }
  return <AssignmentStudent assignmentId={id} classId={ctx.current.classId} isStudent={ctx.current.role === "aluno"} />;
}
