"use client";
import { useEffect, useRef, useState } from "react";
import { api } from "./api";

/**
 * Estado da sessão ao vivo: SSE como canal principal; se falhar, atualização periódica.
 * O estado vindo do servidor é sempre completo e versionado, então mensagens duplicadas
 * ou fora de ordem são descartadas por versão.
 */
export function useLiveState<T extends { session: { stateVersion: number } }>(sessionId: string, initial: T | null) {
  const [state, setState] = useState<T | null>(initial);
  const [channel, setChannel] = useState<"sse" | "polling" | "revoked">("sse");
  const [lastUpdate, setLastUpdate] = useState<number>(Date.now());
  const versionRef = useRef<number>(initial?.session.stateVersion ?? -1);
  const sigRef = useRef<string>("");
  const apply = (s: T) => {
    const sig = JSON.stringify(s);
    if (s.session.stateVersion < versionRef.current) return;
    if (s.session.stateVersion === versionRef.current && sig === sigRef.current) return;
    versionRef.current = s.session.stateVersion; sigRef.current = sig;
    setState(s); setLastUpdate(Date.now());
  };
  useEffect(() => {
    let es: EventSource | null = null; let poll: ReturnType<typeof setInterval> | null = null; let stopped = false;
    const startPolling = () => {
      if (poll || stopped) return;
      setChannel("polling");
      const run = async () => { try { apply(await api<T>(`/api/aovivo/${sessionId}/estado`)); } catch (e) { if ((e as { status?: number }).status === 403) { setChannel("revoked"); if (poll) clearInterval(poll); } } };
      run(); poll = setInterval(run, 5000);
    };
    const startSse = () => {
      try {
        es = new EventSource(`/api/aovivo/${sessionId}/eventos`);
        es.addEventListener("state", (e) => apply(JSON.parse((e as MessageEvent).data)));
        es.addEventListener("revoked", () => { setChannel("revoked"); es?.close(); });
        es.onopen = () => { setChannel("sse"); if (poll) { clearInterval(poll); poll = null; } };
        es.onerror = () => { es?.close(); es = null; startPolling(); setTimeout(() => { if (!stopped && !es) { if (poll) { clearInterval(poll); poll = null; } startSse(); } }, 20000); };
      } catch { startPolling(); }
    };
    startSse();
    return () => { stopped = true; es?.close(); if (poll) clearInterval(poll); };
  }, [sessionId]);
  const refresh = async () => { try { apply(await api<T>(`/api/aovivo/${sessionId}/estado`)); } catch { /* ignora */ } };
  return { state, channel, lastUpdate, refresh };
}
