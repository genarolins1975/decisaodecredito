import type { NextRequest } from "next/server";
import { requireClassAccess, ApiError } from "@/lib/auth/guard";
import { getSession, studentState, teacherState } from "@/lib/services/live";

/**
 * Canal em tempo real (SSE) sobre o banco como fonte de verdade: envia o estado completo
 * sempre que a versão muda. Cada mensagem é autocontida, o que torna eventos duplicados
 * ou fora de ordem inofensivos. Se o canal cair, o cliente usa /estado periodicamente.
 */
export async function GET(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  let s;
  try { s = await getSession(id); } catch { return new Response("not found", { status: 404 }); }
  let access;
  try { access = await requireClassAccess(s.classId); } catch (e) { return new Response("forbidden", { status: e instanceof ApiError ? e.status : 403 }); }
  const teacher = access.role !== "aluno";
  const userId = access.user.id;
  const enc = new TextEncoder();
  let closed = false;
  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: string, data: unknown) => { if (!closed) controller.enqueue(enc.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)); };
      let lastVersion = -1; let lastSig = "";
      let ticks = 0;
      const tick = async () => {
        if (closed) return;
        try {
          // revalida autorização periodicamente: matrícula revogada derruba o canal
          if (ticks % 10 === 0) { try { await requireClassAccess(s.classId); } catch { send("revoked", {}); closed = true; controller.close(); return; } }
          const st = teacher ? await teacherState(id) : await studentState(id, userId);
          const sig = teacher ? `${st.session.stateVersion}:${(st as { activities: { respondents: number }[] }).activities.map((a) => a.respondents).join(",")}` : `${st.session.stateVersion}:${(st as { activities: { myAttempt: unknown }[] }).activities.map((a) => a.myAttempt ? 1 : 0).join("")}`;
          if (st.session.stateVersion !== lastVersion || sig !== lastSig) { lastVersion = st.session.stateVersion; lastSig = sig; send("state", st); }
          else if (ticks % 10 === 0) send("ping", { t: Date.now() });
        } catch (e) { send("error", { message: (e as Error).message }); }
        ticks++;
        if (!closed) setTimeout(tick, 1500);
      };
      await tick();
      req.signal.addEventListener("abort", () => { closed = true; try { controller.close(); } catch { /* já fechado */ } });
    },
    cancel() { closed = true; },
  });
  return new Response(stream, { headers: { "content-type": "text/event-stream; charset=utf-8", "cache-control": "no-cache, no-transform", connection: "keep-alive", "x-accel-buffering": "no" } });
}
