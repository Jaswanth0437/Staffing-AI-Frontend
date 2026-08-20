export function JobDiscoveryChart({
  discovered,
  qualified,
  rejected,
  rate
}) {
  const qualifiedPct = discovered ? qualified / discovered * 100 : 0;
  const rejectedPct = discovered ? rejected / discovered * 100 : 0;
  const pendingPct = Math.max(0, 100 - qualifiedPct - rejectedPct);
  const gradient = `conic-gradient(var(--success) 0% ${qualifiedPct}%, var(--danger) ${qualifiedPct}% ${qualifiedPct + rejectedPct}%, #e5e7eb ${qualifiedPct + rejectedPct}% 100%)`;
  return <div className="flex flex-col items-center gap-8 sm:flex-row sm:justify-around">
      <div className="grid grid-cols-2 gap-x-8 gap-y-4">
        <Metric label="Jobs discovered" value={discovered} />
        <Metric label="Qualified jobs" value={qualified} tone="success" />
        <Metric label="Rejected jobs" value={rejected} tone="danger" />
        <Metric label="Qualification rate" value={`${rate}%`} tone="brand" />
      </div>

      <div className="flex items-center gap-6">
        <div className="relative h-36 w-36 shrink-0 rounded-full" style={{
        background: gradient
      }} role="img" aria-label={`${qualified} qualified and ${rejected} rejected out of ${discovered} jobs discovered`}>
          <div className="absolute inset-3 flex flex-col items-center justify-center rounded-full bg-surface">
            <span className="text-xl font-semibold tracking-tight text-foreground">{rate}%</span>
            <span className="text-[11px] text-muted-foreground">Qualified</span>
          </div>
        </div>
        <div className="flex flex-col gap-2 text-xs text-muted-foreground">
          <Legend color="bg-success" label="Qualified" />
          <Legend color="bg-danger" label="Rejected" />
          {pendingPct > 0 && <Legend color="bg-gray-200" label="Pending" />}
        </div>
      </div>
    </div>;
}
function Metric({
  label,
  value,
  tone
}) {
  const toneClass = tone === "success" ? "text-success" : tone === "danger" ? "text-danger" : tone === "brand" ? "text-brand" : "text-foreground";
  return <div>
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className={`mt-1 text-xl font-semibold tracking-tight ${toneClass}`}>{value}</p>
    </div>;
}
function Legend({
  color,
  label
}) {
  return <span className="flex items-center gap-1.5">
      <span className={`h-2 w-2 rounded-full ${color}`} />
      {label}
    </span>;
}
