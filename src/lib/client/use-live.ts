"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "./api";

/** Sem nenhuma mensagem do servidor por este tempo, o estado na tela é declarado desatualizado. O servidor manda um sinal de vida a cada 15 s. */
const LIMITE_SILENCIO_MS = 40000;

/**
 * Estado da sessão ao vivo: SSE como canal principal; se falhar, atualização periódica.
 * O estado vindo do servidor é sempre completo e versionado, então mensagens duplicadas
 * ou fora de ordem são descartadas por versão.
 *
 * `stale` diz que nada chegou do servidor há mais de LIMITE_SILENCIO_MS, contando também os sinais
 * de vida: é o que permite dizer "sem atualização há N s" em vez de "conectado" com a rede caída.
 */
export function useLiveState<T extends { session: { stateVersion: number } }>(sessionId: string, initial: T | null) {
  const [state, setState] = useState<T | null>(initial);
  const [channel, setChannel] = useState<"sse" | "polling" | "revoked">("sse");
  const [lastUpdate, setLastUpdate] = useState<number>(0);
  const [stale, setStale] = useState<{ stale: boolean; sinceMs: number }>({ stale: false, sinceMs: 0 });
  const versionRef = useRef<number>(initial?.session.stateVersion ?? -1);
  const sigRef = useRef<string>("");
  // zero até a primeira mensagem ou a abertura do canal: o vigia ignora esse intervalo inicial
  const lastMessageRef = useRef<number>(0);
  const marcarVivo = useCallback(() => { lastMessageRef.current = Date.now(); }, []);
  const apply = useCallback((s: T) => {
    marcarVivo();
    const sig = JSON.stringify(s);
    if (s.session.stateVersion < versionRef.current) return;
    if (s.session.stateVersion === versionRef.current && sig === sigRef.current) return;
    versionRef.current = s.session.stateVersion; sigRef.current = sig;
    setState(s); setLastUpdate(Date.now());
  }, [marcarVivo]);
  useEffect(() => {
    let es: EventSource | null = null; let poll: ReturnType<typeof setInterval> | null = null; let stopped = false;
    marcarVivo();
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
        es.addEventListener("ping", marcarVivo);
        es.addEventListener("revoked", () => { setChannel("revoked"); es?.close(); });
        es.onopen = () => { marcarVivo(); setChannel("sse"); if (poll) { clearInterval(poll); poll = null; } };
        es.onerror = () => { es?.close(); es = null; startPolling(); setTimeout(() => { if (!stopped && !es) { if (poll) { clearInterval(poll); poll = null; } startSse(); } }, 20000); };
      } catch { startPolling(); }
    };
    startSse();
    const vigia = setInterval(() => {
      if (!lastMessageRef.current) return;
      const sinceMs = Date.now() - lastMessageRef.current;
      setStale((s) => (s.stale === (sinceMs > LIMITE_SILENCIO_MS) && Math.abs(s.sinceMs - sinceMs) < 5000 ? s : { stale: sinceMs > LIMITE_SILENCIO_MS, sinceMs }));
    }, 5000);
    return () => { stopped = true; es?.close(); if (poll) clearInterval(poll); clearInterval(vigia); };
  }, [sessionId, apply, marcarVivo]);
  const refresh = async () => { try { apply(await api<T>(`/api/aovivo/${sessionId}/estado`)); } catch { /* ignora */ } };
  return { state, channel, lastUpdate, refresh, stale: stale.stale, staleSinceMs: stale.sinceMs };
}
