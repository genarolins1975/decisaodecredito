"use client";
import { useEffect, useId, useState } from "react";
import { api, requestId, ClientApiError } from "@/lib/client/api";
import type { PublicQuestion } from "@/lib/services/content";

type Feedback = {
  correct?: number | number[]; explanation?: string | null; revealHtml?: string | null; modelAnswer?: string | null; expected?: number; tolerance?: number; unit?: string | null;
  recovery?: { confusion?: string | null; concept?: string | null; exampleHtml?: string | null; yours?: string | null; adequate?: string | null; followUp?: { prompt: string; alternatives: string[]; correct: number; explanation?: string | null } | null } | null;
};
type Result = { isCorrect: boolean | null; feedback: Feedback | null; attemptNo: number; answer?: unknown; revealed?: boolean; disclosedBefore?: boolean };

/**
 * Questão nativa (estudo ou sessão ao vivo). A correção acontece no servidor.
 * `submit` recebe a resposta e devolve o resultado; `initial` restaura resposta anterior.
 */
export function Question({ q, initial, submit, reveal, onRevealed, disabled, compact }: {
  q: PublicQuestion; initial?: Result | null; submit: (answer: unknown, clientRequestId: string) => Promise<Result>;
  /** pede a divulgação do gabarito da última tentativa (modo estudo); ausente em sessões ao vivo */
  reveal?: () => Promise<Result>;
  onRevealed?: (slug: string, choice: number) => void; disabled?: boolean; compact?: boolean;
}) {
  const [choice, setChoice] = useState<number | null>(typeof (initial?.answer as { choice?: number })?.choice === "number" ? (initial!.answer as { choice: number }).choice : null);
  const [choices, setChoices] = useState<number[]>((initial?.answer as { choices?: number[] })?.choices ?? []);
  const [text, setText] = useState<string>((initial?.answer as { text?: string })?.text ?? "");
  const [value, setValue] = useState<string>(typeof (initial?.answer as { value?: number })?.value === "number" ? String((initial!.answer as { value: number }).value) : "");
  const [decision, setDecision] = useState<string>((initial?.answer as { decision?: string })?.decision ?? "");
  const [justification, setJustification] = useState<string>((initial?.answer as { justification?: string })?.justification ?? "");
  const [result, setResult] = useState<Result | null>(initial ?? null);
  const [state, setState] = useState<"idle" | "saving" | "saved" | "sent" | "error">(initial ? "sent" : "idle");
  const [error, setError] = useState<string | null>(null);
  const [reqId, setReqId] = useState<string>(() => requestId());
  const gid = useId();
  const alts = (q.options.alternatives as string[] | undefined) ?? [];
  const decisions = (q.options.decisions as string[] | undefined) ?? ["aprovar", "recusar", "revisar"];

  const [seenInitial, setSeenInitial] = useState(initial);
  if (initial !== seenInitial) { setSeenInitial(initial); if (initial) { setResult(initial); setState("sent"); } }

  const answer = () => {
    if (q.kind === "single" || q.kind === "predict") return { choice };
    if (q.kind === "multi") return { choices };
    if (q.kind === "numeric") return { value: Number(value.replace(",", ".")) };
    if (q.kind === "short_text") return { text };
    if (q.kind === "credit_decision") return { decision, justification };
    return {};
  };

  async function send() {
    setError(null); setState("saving");
    try {
      const r = await submit(answer(), reqId);
      setResult(r); setState("sent");
      if (q.kind === "predict" && choice !== null) onRevealed?.(q.slug, choice);
    } catch (e) {
      setState("error");
      setError(e instanceof ClientApiError ? e.message : "Sem conexão. Sua resposta ficou guardada neste aparelho; toque em Enviar novamente.");
    }
  }
  function retry() { setReqId(requestId()); setResult(null); setState("idle"); setError(null); }
  async function showAnswer() {
    if (!reveal) return;
    setError(null);
    try { const r = await reveal(); setResult((prev) => ({ ...(prev ?? r), ...r, answer: prev?.answer ?? r.answer })); }
    catch (e) { setError(e instanceof ClientApiError ? e.message : "Falha ao carregar a resposta."); }
  }

  const answered = state === "sent" && result;
  const fb = result?.feedback ?? null;
  const correctIdx = typeof fb?.correct === "number" ? fb.correct : null;
  // gabarito ainda não divulgado: errou pela primeira vez e não pediu a resposta
  const withheld = Boolean(answered && result!.isCorrect === false && correctIdx === null && !fb?.explanation);

  return (
    <section data-questao="" className={`rounded-md border p-4 ${compact ? "" : "mt-3"} ${answered ? (result!.isCorrect === true ? "border-ok bg-ok-soft/40" : result!.isCorrect === false ? "border-alert bg-alert-soft/40" : "border-rule bg-paper") : "border-[#E0CBA0] bg-[#FDFAF2]"}`} aria-labelledby={`${gid}-t`}>
      <p className="eyebrow text-warn mb-1">{q.label ?? (q.kind === "predict" ? "Antes de ver o resultado" : "Responda antes de avançar")}</p>
      <p id={`${gid}-t`} className="font-semibold text-ink text-[15px] mb-3">{q.prompt}</p>

      {(q.kind === "single" || q.kind === "predict" || q.kind === "multi") && (
        <div role={q.kind === "multi" ? "group" : "radiogroup"} aria-labelledby={`${gid}-t`} className="flex flex-col gap-2">
          {alts.map((a, i) => {
            const selected = q.kind === "multi" ? choices.includes(i) : choice === i;
            const isCorrect = answered && correctIdx === i;
            const isWrong = answered && selected && result!.isCorrect === false;
            return (
              <label key={i} className={`flex gap-3 items-start bg-white border rounded px-3 py-2.5 cursor-pointer min-h-[44px] text-[14.5px] ${isCorrect ? "border-ok bg-ok-soft" : isWrong ? "border-alert bg-alert-soft" : selected ? "border-ink bg-[#EFF3FA]" : "border-rule hover:border-ink"}`}>
                <input type={q.kind === "multi" ? "checkbox" : "radio"} name={`${gid}-alt`} value={i} checked={selected} disabled={Boolean(answered) || disabled}
                  onChange={() => q.kind === "multi" ? setChoices((c) => c.includes(i) ? c.filter((x) => x !== i) : [...c, i]) : setChoice(i)} className="mt-1 accent-ink w-4 h-4 shrink-0" />
                <span>{a}</span>
              </label>
            );
          })}
        </div>
      )}
      {q.kind === "numeric" && (
        <div className="flex gap-2 items-center">
          <input type="text" inputMode="decimal" className="input max-w-[200px]" value={value} onChange={(e) => setValue(e.target.value)} disabled={Boolean(answered) || disabled} aria-label="Valor numérico" />
          {q.options.unit ? <span className="hint">{String(q.options.unit)}</span> : null}
        </div>
      )}
      {q.kind === "short_text" && (
        <textarea className="textarea min-h-[90px]" value={text} onChange={(e) => setText(e.target.value)} disabled={Boolean(answered) || disabled} maxLength={Number(q.options.maxLength ?? 600)} aria-label="Sua resposta" placeholder="Escreva em uma ou duas frases." />
      )}
      {q.kind === "credit_decision" && (
        <div className="form-grid">
          <div role="radiogroup" aria-label="Decisão" className="flex flex-wrap gap-2">
            {decisions.map((d) => (
              <label key={d} className={`btn btn-sm ${decision === d ? "" : "btn-secondary"}`}>
                <input type="radio" name={`${gid}-dec`} className="sr-only" value={d} checked={decision === d} disabled={Boolean(answered) || disabled} onChange={() => setDecision(d)} />{d[0].toUpperCase() + d.slice(1)}
              </label>
            ))}
          </div>
          <textarea className="textarea min-h-[90px]" value={justification} onChange={(e) => setJustification(e.target.value)} disabled={Boolean(answered) || disabled} placeholder="Justifique com o risco, o valor e a política." aria-label="Justificativa" />
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3 mt-3">
        {!answered && <button type="button" className="btn btn-sm" onClick={send} disabled={disabled || state === "saving"} aria-busy={state === "saving"}>{state === "saving" ? "Enviando…" : q.kind === "predict" ? "Ver o que acontece" : "Conferir"}</button>}
        <span className="hint" role="status" aria-live="polite">
          {state === "saving" && "Salvando…"}{state === "sent" && `Enviado (tentativa ${result?.attemptNo ?? 1}).`}{state === "error" && error}
        </span>
        {state === "error" && <button type="button" className="btn btn-sm btn-secondary" onClick={send}>Enviar novamente</button>}
        {answered && result!.isCorrect === false && q.kind !== "predict" && <button type="button" className="btn btn-sm btn-ghost" onClick={retry}>Tentar de novo</button>}
        {withheld && reveal && <button type="button" className="btn btn-sm btn-ghost" onClick={showAnswer}>Ver a resposta</button>}
      </div>

      {answered && fb && (
        <div className="mt-3 text-[14px] conteudo" aria-live="polite">
          {result!.isCorrect === true && <p className="font-semibold text-ok">Correto.</p>}
          {result!.isCorrect === false && <p className="font-semibold text-alert">Não é essa.{withheld ? " Leia a recuperação abaixo e tente de novo antes de ver a resposta." : ""}</p>}
          {answered && result!.isCorrect === true && result!.disclosedBefore && <p className="hint">Você já tinha visto a resposta; esta tentativa não conta como acerto próprio.</p>}
          {fb.explanation && <p className="mt-1">{fb.explanation}</p>}
          {fb.recovery && (
            <details className="mt-2 callout" open>
              <summary className="font-semibold text-ink cursor-pointer">Onde está a confusão</summary>
              {fb.recovery.confusion && <p className="mt-2"><b>Confusão:</b> {fb.recovery.confusion}</p>}
              {fb.recovery.concept && <p className="mt-2"><b>Conceito:</b> {fb.recovery.concept}</p>}
              {fb.recovery.exampleHtml && <div className="mt-2" dangerouslySetInnerHTML={{ __html: fb.recovery.exampleHtml }} />}
              {fb.recovery.yours && fb.recovery.adequate && <p className="mt-2"><b>Você escolheu:</b> {fb.recovery.yours}. <b>Adequado:</b> {fb.recovery.adequate}.</p>}
              {fb.recovery.followUp && <FollowUp fu={fb.recovery.followUp} />}
            </details>
          )}
          {fb.modelAnswer && <div className="mt-2 callout"><p className="eyebrow mb-1">Resposta esperada</p><p>{fb.modelAnswer}</p></div>}
          {typeof fb.expected === "number" && <p className="mt-1 hint">Valor esperado: {fb.expected}{fb.unit ? ` ${fb.unit}` : ""} (tolerância ±{fb.tolerance ?? 0}).</p>}
          {fb.revealHtml && <div className="mt-2" dangerouslySetInnerHTML={{ __html: fb.revealHtml }} />}
        </div>
      )}
    </section>
  );
}

function FollowUp({ fu }: { fu: { prompt: string; alternatives: string[]; correct: number; explanation?: string | null } }) {
  const [c, setC] = useState<number | null>(null);
  const [done, setDone] = useState(false);
  const gid = useId();
  return (
    <div className="mt-3 border-t border-rule pt-3">
      <p className="eyebrow mb-1">Outra vez</p>
      <p className="font-semibold text-ink">{fu.prompt}</p>
      <div className="flex flex-col gap-2 mt-2" role="radiogroup">
        {fu.alternatives.map((a, i) => (
          <label key={i} className={`flex gap-3 items-start bg-white border rounded px-3 py-2 cursor-pointer min-h-[44px] ${done && i === fu.correct ? "border-ok bg-ok-soft" : done && c === i ? "border-alert bg-alert-soft" : c === i ? "border-ink" : "border-rule"}`}>
            <input type="radio" name={`${gid}-fu`} checked={c === i} disabled={done} onChange={() => setC(i)} className="mt-1 accent-ink" /><span>{a}</span>
          </label>
        ))}
      </div>
      {!done && <button type="button" className="btn btn-sm mt-2" disabled={c === null} onClick={() => setDone(true)}>Conferir</button>}
      {done && <p className="mt-2">{c === fu.correct ? <b className="text-ok">Correto.</b> : <b className="text-alert">Não é essa.</b>} {fu.explanation}</p>}
    </div>
  );
}
