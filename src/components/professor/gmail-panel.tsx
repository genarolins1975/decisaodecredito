"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { api, ClientApiError } from "@/lib/client/api";
import { Callout, StatusBadge } from "@/components/ui";
import { ErrorBox, SuccessBox } from "@/components/forms";
import { fmtDT } from "@/lib/time";

type Status = { provider: string; oauthConfigured: boolean; ready: { ok: boolean; sender?: string; reason?: string }; connection: { email: string; connectedAt: string; lastError: string | null; scopes: string } | null };
type Msg = { id: string; kind: string; toEmail: string; subject: string; status: string; attempts: number; lastError: string | null; acceptedAt: string | null; createdAt: string };

export function GmailPanel({ status, flash, queue }: { status: Status; flash: { kind: string; message: string | null } | null; queue: Msg[] }) {
  const router = useRouter();
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [testTo, setTestTo] = useState("");
  const run = async (fn: () => Promise<string>) => { setErr(null); setOk(null); try { setOk(await fn()); router.refresh(); } catch (e) { setErr(e instanceof ClientApiError ? e.message : "Falha"); } };
  return (
    <div className="grid gap-4 lg:grid-cols-[400px_minmax(0,1fr)]">
      <div className="flex flex-col gap-4">
        {flash?.kind === "ok" && <SuccessBox message="Gmail conectado com sucesso." />}
        {flash?.kind === "erro" && <ErrorBox message={`Falha ao conectar: ${flash.message ?? "desconhecida"}`} />}
        <ErrorBox message={err} /><SuccessBox message={ok} />
        <section className="card">
          <h2 className="text-base mb-2">Remetente (Gmail)</h2>
          <dl className="kv text-[14px]">
            <dt>Provedor</dt><dd>{status.provider === "gmail" ? "Gmail API (OAuth 2.0, escopo gmail.send)" : "Fila sem envio (desenvolvimento/homologação)"}</dd>
            <dt>OAuth</dt><dd>{status.oauthConfigured ? "credenciais configuradas no servidor" : "não configurado (GOOGLE_OAUTH_CLIENT_ID/SECRET)"}</dd>
            <dt>Conta</dt><dd>{status.connection ? <>{status.connection.email} <span className="hint">desde {fmtDT(status.connection.connectedAt)}</span></> : "nenhuma conectada"}</dd>
            <dt>Estado</dt><dd>{status.ready.ok ? <span className="text-ok font-semibold">pronto para enviar</span> : <span className="text-warn font-semibold">{status.ready.reason}</span>}</dd>
            {status.connection?.lastError && <><dt>Último erro</dt><dd className="text-alert">{status.connection.lastError}</dd></>}
          </dl>
          <div className="flex flex-wrap gap-2 mt-3">
            {!status.connection && <button className="btn btn-sm" disabled={!status.oauthConfigured || status.provider !== "gmail"} onClick={() => run(async () => { const r = await api<{ url: string }>("/api/professor/gmail/conectar", { body: {} }); location.href = r.url; return "Redirecionando para o Google…"; })}>Conectar meu Gmail</button>}
            {status.connection && <button className="btn btn-sm btn-ghost" onClick={() => { if (confirm("Desconectar? Convites pendentes ficam na fila; alunos já ativados continuam entrando.")) run(async () => { const r = await api<{ note: string }>("/api/professor/gmail/desconectar", { body: {} }); return r.note; }); }}>Desconectar</button>}
          </div>
          {status.provider !== "gmail" && <Callout tone="warn" title="Ambiente sem envio">Para produção, defina EMAIL_PROVIDER=gmail e as credenciais OAuth no servidor. Nenhum outro remetente é usado silenciosamente.</Callout>}
        </section>
        <section className="card">
          <h2 className="text-base mb-2">Teste de envio</h2>
          <p className="hint mb-2">Envia uma mensagem de teste para o seu próprio e-mail ou para um endereço que você informar. Nunca para alunos.</p>
          <input className="input" type="email" placeholder="(opcional) outro endereço seu" value={testTo} onChange={(e) => setTestTo(e.target.value)} aria-label="Endereço de teste" />
          <button className="btn btn-sm mt-2" disabled={!status.ready.ok} onClick={() => run(async () => { const r = await api<{ processed: { sent: number; failed: number } }>("/api/professor/gmail/teste", { body: testTo ? { to: testTo } : {} }); return r.processed.sent ? "Mensagem aceita pelo Gmail (aceite não comprova entrega; confira a caixa de entrada)." : "Falha no envio; veja a fila."; })}>Enviar teste</button>
        </section>
      </div>
      <section className="card min-w-0">
        <div className="flex items-center gap-3 mb-2"><h2 className="text-base">Fila de e-mails</h2><div className="flex-1" /><button className="btn btn-sm btn-secondary" onClick={() => run(async () => { const r = await api<{ ready: { ok: boolean; reason?: string }; processed: { sent: number; failed: number } | null }>("/api/professor/email/processar", { body: {} }); return r.processed ? `Processado: ${r.processed.sent} aceito(s), ${r.processed.failed} falha(s).` : `Sem remetente: ${r.ready.reason}`; })}>Processar fila agora</button></div>
        <p className="hint mb-2">"Aceito pelo Gmail" significa que o provedor recebeu a mensagem; não comprova entrega ao destinatário. Falhas têm tentativas limitadas com espera crescente; reenvio manual zera o contador.</p>
        <div className="table-wrap">
          <table className="table text-[13px]">
            <thead><tr><th>Quando</th><th>Tipo</th><th>Para</th><th>Estado</th><th>Tent.</th><th>Erro</th><th></th></tr></thead>
            <tbody>
              {queue.map((m) => <tr key={m.id}><td className="whitespace-nowrap">{fmtDT(m.createdAt)}</td><td>{m.kind}</td><td className="font-mono">{m.toEmail}</td><td><StatusBadge status={m.status} />{m.acceptedAt && <div className="hint">{fmtDT(m.acceptedAt)}</div>}</td><td>{m.attempts}</td><td className="text-alert max-w-[260px]">{m.lastError}</td><td>{m.status === "failed" && <button className="btn btn-sm btn-ghost" onClick={() => run(async () => { await api(`/api/professor/email/reenviar/${m.id}`, { body: {} }); return "Recolocada na fila."; })}>Reenviar</button>}</td></tr>)}
              {queue.length === 0 && <tr><td colSpan={7} className="hint text-center py-6">Fila vazia.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
