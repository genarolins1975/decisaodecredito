export function Brand({ light = false, sub }: { light?: boolean; sub?: string }) {
  return (
    <div className={`flex items-baseline gap-2 min-w-0 ${light ? "text-white" : "text-ink"}`}>
      <span className="font-serif font-bold text-[15px] whitespace-nowrap">Laboratório de Decisão de Crédito</span>
      <span className="text-gold" aria-hidden="true">·</span>
      <span className={`text-[12.5px] truncate ${light ? "text-white/80" : "text-muted"}`}>{sub ?? "Prof. Genaro Dueire Lins"}</span>
    </div>
  );
}
