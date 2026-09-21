"use client";
import { useState } from "react";
import { api, ClientApiError } from "@/lib/client/api";
import { ErrorBox, SuccessBox } from "@/components/forms";

/** Sucesso e falha se distinguem, como em todo formulário da plataforma. */
export function ReviewRequest({ classId, meetingId }: { classId: string; meetingId: string }) {
  const [ok, setOk] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  return (
    <div>
      <button type="button" className="btn btn-sm btn-ghost" onClick={async () => {
        const text = prompt("Justificativa para o pedido de revisão da presença:");
        if (!text) return;
        setOk(null); setErr(null);
        try { await api("/api/frequencia/revisao", { body: { classId, meetingId, text } }); setOk("Pedido enviado ao professor."); }
        catch (e) { setErr(e instanceof ClientApiError ? e.message : "Falha de rede: o pedido não foi enviado."); }
      }}>Solicitar revisão</button>
      <div className="mt-1"><SuccessBox message={ok} /><ErrorBox message={err} /></div>
    </div>
  );
}
