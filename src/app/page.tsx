import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";

export default async function Home() {
  const u = await getCurrentUser();
  if (!u) redirect("/entrar");
  if (u.mustChangePassword) redirect("/senha/definir");
  redirect(u.isStaff ? "/professor" : "/inicio");
}
