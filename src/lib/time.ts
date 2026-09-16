export const TZ = "America/Sao_Paulo";

const fmtDateTime = new Intl.DateTimeFormat("pt-BR", { timeZone: TZ, day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
const fmtDate = new Intl.DateTimeFormat("pt-BR", { timeZone: TZ, day: "2-digit", month: "2-digit", year: "numeric" });
const fmtLong = new Intl.DateTimeFormat("pt-BR", { timeZone: TZ, weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" });
const fmtTime = new Intl.DateTimeFormat("pt-BR", { timeZone: TZ, hour: "2-digit", minute: "2-digit" });

export const fmtDT = (d: Date | string | null | undefined) => d ? fmtDateTime.format(new Date(d)) : "";
export const fmtD = (d: Date | string | null | undefined) => d ? fmtDate.format(new Date(d)) : "";
export const fmtL = (d: Date | string | null | undefined) => d ? fmtLong.format(new Date(d)) : "";
export const fmtT = (d: Date | string | null | undefined) => d ? fmtTime.format(new Date(d)) : "";

/** Converte "2026-03-10T19:00" (horário de São Paulo) em instante UTC. */
export function fromSaoPaulo(local: string): Date {
  const [date, time = "00:00"] = local.split("T");
  const [y, m, d] = date.split("-").map(Number);
  const [hh, mm] = time.split(":").map(Number);
  const guess = Date.UTC(y, m - 1, d, hh, mm);
  const offset = tzOffsetMinutes(new Date(guess));
  return new Date(guess - offset * 60e3);
}

function tzOffsetMinutes(at: Date): number {
  const parts = new Intl.DateTimeFormat("en-US", { timeZone: TZ, hour12: false, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit" }).formatToParts(at);
  const get = (t: string) => Number(parts.find((p) => p.type === t)?.value);
  const asUTC = Date.UTC(get("year"), get("month") - 1, get("day"), get("hour") % 24, get("minute"), get("second"));
  return (asUTC - at.getTime()) / 60e3;
}

/** Valor para <input type="datetime-local"> em horário de São Paulo. */
export function toLocalInput(d: Date | null | undefined): string {
  if (!d) return "";
  const parts = new Intl.DateTimeFormat("sv-SE", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" }).format(new Date(d));
  return parts.replace(" ", "T");
}

export function relative(d: Date | string): string {
  const diff = new Date(d).getTime() - Date.now();
  const abs = Math.abs(diff);
  const units: [number, string][] = [[86400e3, "dia"], [3600e3, "hora"], [60e3, "minuto"]];
  for (const [ms, name] of units) {
    if (abs >= ms) { const n = Math.round(abs / ms); const s = `${n} ${name}${n > 1 ? "s" : ""}`; return diff > 0 ? `em ${s}` : `há ${s}`; }
  }
  return diff > 0 ? "em instantes" : "agora";
}
