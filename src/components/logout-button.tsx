"use client";
import { useRouter } from "next/navigation";
import { api } from "@/lib/client/api";

export function LogoutButton() {
  const router = useRouter();
  return (
    <button type="button" className="text-[13px] text-white/85 touch px-2 bg-transparent border-0 cursor-pointer hover:underline"
      onClick={async () => { await api("/api/auth/logout", { body: {} }); router.push("/entrar"); router.refresh(); }}>
      Sair
    </button>
  );
}
