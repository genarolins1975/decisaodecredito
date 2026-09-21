"use client";
import { useEffect, useRef, useState } from "react";
import { api } from "@/lib/client/api";

/**
 * Lê o slide do hash do baralho e publica na sessão. O baralho abre em modo projeção: sem notas do
 * professor, sem impressão e sem modo estudo, porque esta janela é a que a turma vê; as notas ficam
 * no painel da aula, na tela do professor. Falha de rede não interrompe a aula: o slide pendente é
 * reenviado a cada poucos segundos até a sessão confirmar, e a tela avisa enquanto isso.
 */
export function Projecao({ sessionId, inicial }: { sessionId: string; inicial: string | null }) {
  const quadro = useRef<HTMLIFrameElement>(null);
  const [situacao, setSituacao] = useState<"ok" | "falha" | "recuperada">("ok");

  useEffect(() => {
    const f = quadro.current;
    if (!f) return;
    let ativo = true;
    let publicado = inicial;
    let pendente: string | null = null;
    let enviando = false;
    let timer: ReturnType<typeof setTimeout> | null = null;
    const agendar = (ms: number) => { if (timer) clearTimeout(timer); timer = setTimeout(enviar, ms); };
    const enviar = async () => {
      timer = null;
      if (!ativo || enviando || !pendente || pendente === publicado) return;
      const alvo = pendente;
      enviando = true;
      try {
        await api(`/api/aovivo/${sessionId}/slide`, { body: { slide: alvo } });
        publicado = alvo;
        setSituacao((s) => (s === "falha" ? "recuperada" : s));
        enviando = false;
        if (pendente !== publicado) agendar(0);
      } catch {
        enviando = false;
        if (!ativo) return;
        setSituacao("falha");
        agendar(3000);
      }
    };
    const publicar = () => {
      let w: Window | null = null;
      try { w = f.contentWindow; } catch { return; }
      const m = /^#\/slide\/(\d{2})$/.exec(w?.location.hash ?? "");
      if (!m) return;
      pendente = m[1];
      agendar(0);
    };
    const ligar = () => {
      try { f.contentWindow?.addEventListener("hashchange", publicar); } catch { /* origem diferente, não ocorre aqui */ }
      publicar();
    };
    f.addEventListener("load", ligar);
    ligar();
    return () => {
      ativo = false;
      if (timer) clearTimeout(timer);
      f.removeEventListener("load", ligar);
      try { f.contentWindow?.removeEventListener("hashchange", publicar); } catch { /* já descarregado */ }
    };
  }, [sessionId, inicial]);

  useEffect(() => {
    if (situacao !== "recuperada") return;
    const t = setTimeout(() => setSituacao("ok"), 4000);
    return () => clearTimeout(t);
  }, [situacao]);

  return (
    <div className="fixed inset-0 bg-black">
      <iframe ref={quadro} title="Slides da aula" src={`/slides/aula-2?modo=projecao${inicial ? `#/slide/${inicial}` : ""}`} className="w-full h-full border-0" />
      <p className="absolute bottom-2 right-3 text-[12px] text-white/80" role="status" aria-live="polite">
        {situacao === "falha" && "Sem conexão com a sessão: tentando de novo a cada 3 s. A projeção continua; a tela dos alunos pode ficar para trás."}
        {situacao === "recuperada" && "Conexão com a sessão recuperada: os alunos estão no slide atual."}
      </p>
    </div>
  );
}
