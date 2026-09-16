"use client";
import { useState } from "react";
import { api, ClientApiError } from "@/lib/client/api";

export function ReviewRequest({ classId, meetingId }: { classId: string; meetingId: string }) {
  const [msg, setMsg] = useState<string | null>(null);
  return (
    <span>
      <button type="button" className="btn btn-sm btn-ghost" onClick={async () => { const text = prompt("Justificativa para o pedido de revisão da presença:"); if (!text) return; try { await api("/api/frequencia/revisao", { body: { classId, meetingId, text } }); setMsg("Pedido enviado."); } catch (e) { setMsg(e instanceof ClientApiError ? e.message : "Falha"); } }}>Solicitar revisão</button>
      {msg && <span className="hint block">{msg}</span>}
    </span>
  );
}
