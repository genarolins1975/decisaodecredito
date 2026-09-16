import { handle, json } from "@/lib/api";
import { requireClassAccess } from "@/lib/auth/guard";
import { attendanceMap, type AttendanceRule } from "@/lib/services/attendance";
import { toCsv } from "@/lib/csv";
import { fmtD } from "@/lib/time";

/** Mapa de frequência (JSON) ou exportação CSV (?formato=csv) com legenda e regra aplicada. */
export const GET = handle(async (req, ctx: { params: Promise<{ id: string }> }) => {
  const { id } = await ctx.params;
  const access = await requireClassAccess(id, ["professor", "monitor"]);
  const rule = (access.cls.config as { attendance?: AttendanceRule }).attendance;
  const map = await attendanceMap(id, rule);
  if (new URL(req.url).searchParams.get("formato") === "csv") {
    const cols = ["nome", "email", "situacao_matricula", ...map.meetings.map((m) => `E${m.number} ${fmtD(m.scheduledAt) || "sem data"}${m.status === "cancelled" ? " (cancelado)" : ""}`), "percentual", "denominador", "regra"];
    const rows = map.rows.map((r) => {
      const o: Record<string, unknown> = { nome: r.name, email: r.email, situacao_matricula: r.enrollmentStatus, percentual: r.pct ?? "", denominador: r.denominator, regra: r.ruleDefined ? `mínimo ${rule?.minimumPct}% · atraso=${rule?.lateCountsAs ?? "ausente"} · justificado=${rule?.justifiedCountsAs ?? "ausente"}` : "regra não definida" };
      map.meetings.forEach((m, i) => { o[cols[3 + i]] = r.cells[i].status; });
      return o;
    });
    const legend = "\r\n\r\nLegenda: presente; atrasado; ausente; justificado; pendente (validação docente); cancelado (encontro não conta no denominador). Fonte: registros de frequência da plataforma, horário do servidor (America/Sao_Paulo).";
    return new Response(toCsv(rows, cols) + legend, { headers: { "content-type": "text/csv; charset=utf-8", "content-disposition": `attachment; filename="frequencia-${access.cls.code}.csv"` } });
  }
  return json(map);
});
